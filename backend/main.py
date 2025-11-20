import os
import json
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
from dotenv import load_dotenv
from sqlmodel import Session, select
from database import create_db_and_tables, get_session
from models import Recipe, User

# Környezeti változók betöltése (.env fájlból)
load_dotenv()

# Gemini API konfigurálása
api_key = os.getenv("API_KEY")
if not api_key:
    print("FIGYELEM: Nincs beállítva a GEMINI_API_KEY a .env fájlban!")

genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-2.5-flash')

app = FastAPI()

# --- CORS BEÁLLÍTÁS (Hogy a Frontend elérje) ---
origins = [
    "http://localhost:5173", # Vite alapértelmezett portja
    "http://localhost:3000", # React alapértelmezett portja
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class IngredientRequest(BaseModel):
    ingredients: List[str]

class SaveRecipeRequest(BaseModel):
    title: str
    time: str
    ingredients: List[str]
    steps: List[str]

@app.get("/")
def read_root():
    return {"message": "ReceptSéf Backend v1.0 Működik!"}

@app.post("/generate-recipe")
async def generate_recipe(request: IngredientRequest):
    print(f"Kérés érkezett: {request.ingredients}") # Logolás a terminálba
    
    ingredients_text = ", ".join(request.ingredients)
    prompt = f"""
    Te egy profi séf vagy. Készíts egy receptet a következő alapanyagok felhasználásával: {ingredients_text}.
    
    A válaszod KIZÁRÓLAG valid JSON formátum legyen, markdown formázás (```json) NÉLKÜL.
    
    FONTOS: A JSON kulcsoknak PONTOSAN angolul kell lenniük, ahogy itt látod, de az értékek legyenek magyarul:
    {{
        "title": "Az étel neve magyarul",
        "time": "Elkészítési idő (pl. 30 perc)",
        "ingredients": ["hozzávaló 1", "hozzávaló 2"],
        "steps": ["1. lépés", "2. lépés"]
    }}
    """

    try:
        response = model.generate_content(prompt)
        clean_text = response.text.replace("```json", "").replace("```", "").strip()
        return {"recipe_json": clean_text}
    except Exception as e:
        print(f"Hiba történt: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    
@app.post("/save-recipe")
def save_recipe(recipe_data: SaveRecipeRequest, session: Session = Depends(get_session)):
    # Mivel még nincs bejelentkezés, egyelőre "User nélkül" vagy egy teszt userrel mentjük.
    # A specifikáció szerint JSON-ként vagy szövegként tároljuk a hozzávalókat [cite: 50]
    
    new_recipe = Recipe(
        title=recipe_data.title,
        time=recipe_data.time,
        ingredients=json.dumps(recipe_data.ingredients), # Listát JSON stringgé alakítjuk
        instructions="\n".join(recipe_data.steps),       # Lépéseket összevonjuk szöveggé
        user_id=None # Később itt lesz a bejelentkezett felhasználó ID-ja
    )
    
    session.add(new_recipe)
    session.commit()
    session.refresh(new_recipe)
    return {"message": "Recept sikeresen mentve!", "id": new_recipe.id}

# --- ÚJ VÉGPONT: Mentett receptek lekérése ---
@app.get("/recipes")
def get_recipes(session: Session = Depends(get_session)):
    recipes = session.exec(select(Recipe)).all()
    return recipes
    