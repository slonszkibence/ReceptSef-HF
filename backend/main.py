import os
from typing import List
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import google.generativeai as genai
from dotenv import load_dotenv

# Környezeti változók betöltése (.env fájlból)
load_dotenv()

# Gemini API konfigurálása
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("FIGYELEM: Nincs beállítva a GEMINI_API_KEY a .env fájlban!")

genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-pro')

app = FastAPI()

# Adatmodell a kéréshez (mit küld a frontend?)
class IngredientRequest(BaseModel):
    ingredients: List[str]

@app.get("/")
def read_root():
    return {"message": "ReceptSéf Backend v1.0"}

@app.post("/generate-recipe")
async def generate_recipe(request: IngredientRequest):
    # 1. Összeállítjuk a promptot az alapanyagokból
    ingredients_text = ", ".join(request.ingredients)
    prompt = f"""
    Te egy profi séf vagy. Készíts egy receptet a következő alapanyagok felhasználásával: {ingredients_text}.
    A válaszod KIZÁRÓLAG valid JSON formátum legyen, a következő struktúrával:
    {{
        "title": "Recept neve",
        "time": "Elkészítési idő (pl. 30 perc)",
        "ingredients": ["hozzávaló 1", "hozzávaló 2"],
        "steps": ["lépés 1", "lépés 2"]
    }}
    Ne írj semmi mást a válaszba, csak a JSON-t! Magyar nyelven válaszolj.
    """

    try:
        # 2. Elküldjük a kérést az MI-nek
        response = model.generate_content(prompt)
        
        # 3. Visszaküldjük a szöveget (a frontend majd JSON-ként kezeli)
        # Egy kis tisztítás, ha az MI véletlenül tenne ```json jelölést
        clean_text = response.text.replace("```json", "").replace("```", "").strip()
        
        return {"recipe_json": clean_text}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))