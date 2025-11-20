import os
from typing import List
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
from dotenv import load_dotenv

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