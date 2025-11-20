# ReceptSef-HF
Szoftverfejlesztés MI támogatással házi feladat - Recept generáló alkalmazás

## MI Használati Napló
A követelményeknek megfelelően itt dokumentálom a fejlesztés során használt promptokat.

### 1. Specifikáció fázis
- **Eszköz:** Google Gemini
- **Prompt:** "Szoftverfejlesztő vagy, írj egy 2-3 oldalas specifikációt egy receptajánló alkalmazáshoz..."
- **Eredmény:** Elkészült a specifikáció vázlata a docs mappába.

### 2. Backend Setup
- **Eszköz:** Google Gemini / GitHub Copilot
- **Prompt:** "Create a simple main.py for a FastAPI application with a root endpoint that returns a JSON welcome message."
- **Eredmény:** Létrejött a main.py és a requirements.txt, a szerver sikeresen fut.

### 3. Backend Hibajavítás
- **Eszköz:** Google Gemini
- **Probléma:** A `uvicorn` indításakor "Attribute 'app' not found" hibaüzenetet kaptam.
- **Prompt:** "I am getting 'Attribute app not found in module main' error when running uvicorn. Here is my code: [kód beillesztése]. How do I fix this?"
- **Eredmény:** Az MI rámutatott, hogy nem mentettem a fájlt, így nem találta meg az app változót.

### 4. Google Gemini API Integráció
- **Eszköz:** Google Gemini
- **Feladat:** A statikus válasz helyett valódi generatív MI bekötése a backendbe.
- **Prompt:** "Update the FastAPI main.py to use Google Gemini API via the `google-generativeai` library. Create a POST endpoint `/generate-recipe` that takes a list of ingredients and returns a structured recipe JSON. Use python-dotenv for API key security."
- **Eredmény:** Létrejött a végleges `main.py`, amely kezeli a `.env` fájlt és kommunikál a Google szervereivel.

### 5. Prompt Engineering (A rendszer lelke)
- **Eszköz:** Google Gemini
- **Feladat:** Olyan utasítást írni a Gemini modellnek, ami garantáltan csak JSON-t ad vissza, fecsegés nélkül.
- **Prompt:** "Write a system prompt for a chef AI that takes ingredients and outputs a strict JSON format with keys: title, time, ingredients, steps. The output must be raw JSON without markdown formatting."
- **Eredmény:** Ezt a promptot építettem be a Python kód `generate_recipe` függvényébe.

### 6. Backend és Frontend Összekötése (CORS)
- **Eszköz:** Google Gemini / ChatGPT
- **Feladat:** Engedélyezni, hogy a böngészőben futó React alkalmazás (localhost:5173) elérje a Python szervert.
- **Prompt:** "Add CORS middleware to FastAPI to allow requests from localhost:5173. I want to fix the 'Cross-Origin Request Blocked' error."
- **Eredmény:** A `main.py`-ba bekerült a `CORSMiddleware`, a kommunikáció megnyílt a két oldal között.

### 7. Frontend Létrehozása
- **Eszköz:** Google Gemini / GitHub Copilot
- **Feladat:** React kliens készítése TypeScript alapokon.
- **Prompt:** "Create a React component with TypeScript using Tailwind CSS or simple inline styles. It should have an input field for ingredients, a 'Generate Recipe' button, and verify the connection by calling the backend POST /generate-recipe endpoint using fetch. Display the result properly."
- **Eredmény:** Elkészült az `App.tsx` kódja, amely kezeli a betöltési állapotot és megjeleníti a receptkártyát.

### 8. Hibaelhárítás - Modell Frissítés (404 Hiba)
- **Eszköz:** Google Gemini
- **Probléma:** A backend logban "404 models/gemini-pro is not found" hibaüzenet jelent meg, a generálás nem működött.
- **Prompt:** "I am getting a 404 error saying 'models/gemini-pro is not found' when using google-generativeai library. What is the correct model name for the free tier now?"
- **Eredmény:** A kódban a `gemini-pro`-t lecseréltem `gemini-2.5-flash`-re, ami megoldotta a problémát.

### 9. Adatbázis Réteg (PostgreSQL + SQLModel)
- **Eszköz:** Google Gemini
- **Feladat:** A specifikációban előírt PostgreSQL adatbázis integrálása modern ORM (SQLModel) segítségével.
- **Prompt:** "Create a `database.py` file using SQLModel to connect to a PostgreSQL database named 'receptsef'. Also define the SQLModel classes for `Recipe` and `User` in `models.py` based on these fields: title, ingredients (json), steps, time."
- **Eredmény:** Létrejött az adatbázis kapcsolat és az adatmodellek (ORM), a rendszer automatikusan létrehozza a táblákat indításkor.

### 10. Mentés Funkció Implementálása
- **Eszköz:** Google Gemini
- **Feladat:** Végpont készítése, amivel a generált recept elmenthető az adatbázisba.
- **Prompt:** "Create a POST endpoint `/save-recipe` in FastAPI. It should take the recipe data, create a new `Recipe` record using the SQLModel session, and commit it to the database."
- **Eredmény:** Elkészült a `/save-recipe` végpont, így a generált receptek most már perzisztensen tárolódnak.