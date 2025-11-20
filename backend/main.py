import os
import json
from typing import List, Optional
from datetime import datetime, timedelta
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
from dotenv import load_dotenv
from sqlmodel import Session, select
from passlib.context import CryptContext
from jose import JWTError, jwt

from database import create_db_and_tables, get_session
from models import Recipe, User

# --- KONFIGURÁCIÓ ---
load_dotenv()
SECRET_KEY = "nagyon_titkos_kulcs_ide_irj_barmit_ami_hosszu" # Ezt cseréld le egyedire!
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Gemini API
api_key = os.getenv("API_KEY")
if not api_key:
    print("FIGYELEM: Nincs beállítva a API_KEY a .env fájlban!")
genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-2.5-flash', generation_config={"response_mime_type": "application/json"})

# Biztonsági eszközök
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

app = FastAPI()

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

# CORS
origins = ["http://localhost:5173", "http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- SEGÉDFÜGGVÉNYEK ---
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), session: Session = Depends(get_session)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Nem sikerült azonosítani a felhasználót",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    statement = select(User).where(User.username == username)
    user = session.exec(statement).first()
    if user is None:
        raise credentials_exception
    return user

# --- ADATMODELLEK (API) ---
class IngredientRequest(BaseModel):
    ingredients: List[str]

class SaveRecipeRequest(BaseModel):
    title: str
    time: str
    ingredients: List[str]
    steps: List[str]

class UserCreate(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

# --- VÉGPONTOK ---

@app.post("/register", status_code=201)
def register(user: UserCreate, session: Session = Depends(get_session)):
    # Ellenőrizzük, létezik-e már
    existing_user = session.exec(select(User).where(User.username == user.username)).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="A felhasználónév már foglalt")
    
    hashed_password = get_password_hash(user.password)
    new_user = User(username=user.username, password_hash=hashed_password)
    session.add(new_user)
    session.commit()
    return {"message": "Sikeres regisztráció"}

@app.post("/token", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.username == form_data.username)).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Hibás felhasználónév vagy jelszó",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/generate-recipe")
async def generate_recipe(request: IngredientRequest):
    # Ez maradhat nyilvános, vagy védett is lehet. Most hagyjuk nyilvánosnak.
    ingredients_text = ", ".join(request.ingredients)
    prompt = f"""
    Te egy profi séf vagy. Készíts egy receptet a következő alapanyagok felhasználásával: {ingredients_text}.
    A válaszod kövesse PONTOSAN ezt a JSON sémát:
    {{
        "title": "Étel neve magyarul",
        "time": "Elkészítési idő (pl. 30 perc)",
        "ingredients": ["hozzávaló 1", "hozzávaló 2"],
        "steps": ["1. lépés", "2. lépés"]
    }}
    """
    try:
        response = model.generate_content(prompt)
        clean_text = response.text.replace("```json", "").replace("```", "").strip() # Biztonsági tisztítás
        return {"recipe_json": clean_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/save-recipe")
def save_recipe(
    recipe_data: SaveRecipeRequest, 
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user) # <--- VÉDETT VÉGPONT!
):
    new_recipe = Recipe(
        title=recipe_data.title,
        time=recipe_data.time,
        ingredients=json.dumps(recipe_data.ingredients),
        instructions="\n".join(recipe_data.steps),
        user_id=current_user.id # <--- MOST MÁR TUDJUK KI AZ!
    )
    session.add(new_recipe)
    session.commit()
    session.refresh(new_recipe)
    return {"message": "Recept sikeresen mentve!", "id": new_recipe.id}

@app.get("/recipes")
def get_recipes(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user) # <--- CSAK BELÉPVE
):
    # Csak a saját receptjeit látja!
    recipes = session.exec(select(Recipe).where(Recipe.user_id == current_user.id)).all()
    return recipes