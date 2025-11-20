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

### 11. Frontend Mentés Gomb és Visszajelzés
- **Eszköz:** Google Gemini
- **Feladat:** A mentés funkció kivezetése a felhasználói felületre vizuális visszajelzéssel.
- **Prompt:** "Add a 'Save to Favorites' button to the React recipe card. When clicked, it should call the POST /save-recipe endpoint. Show a loading state and change the button text to 'Sikeresen mentve! ✅' upon success."
- **Eredmény:** A gomb megjelent, kattintásra meghívja a backendet és zöldre vált siker esetén.

### 12. Hibaelhárítás - JSON Formátum és SyntaxError
- **Eszköz:** Google Gemini
- **Probléma:** A frontend `SyntaxError`-t dobott, mert az MI válasza néha tartalmazott Markdown formázást (` ```json `) vagy bevezető szöveget, amit a `JSON.parse` nem tudott feldolgozni.
- **Prompt:** "I am getting SyntaxError in React because Gemini returns markdown formatting. Update the Python code to strip '```json' and '```' from the response, and extract only the text between the first '{' and last '}' characters."
- **Eredmény:** Implementáltam egy tisztító logikát a backendben, ami kivágja a valid JSON részt a szövegből.

### 13. Backend Stabilizálás - JSON Mode és API Kulcs
- **Eszköz:** Google Gemini
- **Probléma:** A generálás néha instabil volt, illetve `404 Model not found` és API kulcs hibák léptek fel.
- **Prompt:** "Update the GenerativeModel configuration to use 'response_mime_type': 'application/json' to guarantee valid JSON output. "
- **Eredmény:** A `response_mime_type` használatával a Google szervere most már garantáltan JSON-t küld, így a manuális szövegtisztítás feleslegessé vált (bár biztonságból benne maradt). A változónevek javítása után a kommunikáció stabil.

### 14. Felhasználókezelés és Autentikáció (Backend)
- **Eszköz:** Google Gemini / GitHub Copilot
- **Feladat:** A specifikációnak megfelelően a regisztráció és bejelentkezés megvalósítása, hogy a receptek felhasználókhoz kötöttek legyenek.
- **Prompt:** "Implement JWT authentication in FastAPI using `python-jose` and `passlib`. Create `/register` and `/token` endpoints. Update the `User` model to store hashed passwords. Protect the `/save-recipe` route so only logged-in users can save recipes."
- **Eredmény:** Elkészült a biztonságos autentikáció, a jelszavak hashelve tárolódnak, a védett végpontok JWT tokent várnak.

### 15. Login Felület és Token Kezelés (Frontend)
- **Eszköz:** Google Gemini
- **Feladat:** Bejelentkező és regisztrációs képernyő készítése a React oldalon.
- **Prompt:** "Create a Login/Register view in React. Store the received JWT token in localStorage. Update the `handleSave` function to include the 'Authorization: Bearer <token>' header when sending requests to the backend."
- **Eredmény:** A frontend kezeli a belépést, a tokent elmenti, és nézetet vált (Login képernyő <-> Alkalmazás) a jogosultság alapján.

### 16. Hibaelhárítás - Bcrypt Kompatibilitás
- **Eszköz:** Google Gemini
- **Probléma:** Regisztrációkor `AttributeError: module 'bcrypt' has no attribute '__about__'` hibaüzenet érkezett a `passlib` könyvtárból.
- **Prompt:** "I am getting an AttributeError related to bcrypt and passlib when hashing passwords. It seems like a version conflict. How do I fix this?"
- **Eredmény:** A hiba a verziók inkompatibilitása miatt lépett fel. A megoldás a csomagok verziójának rögzítése volt (`passlib[bcrypt]==1.7.4`, `bcrypt==4.0.1`), ami után a regisztráció sikeresen lefutott.

### 17. Kedvencek Listázása és Adattranszformáció
- **Eszköz:** GitHub Copilot
- **Feladat:** A mentett receptek megjelenítése a felületen (Read művelet).
- **Prompt:** "Add a 'Favorites' view to the App. Fetch saved recipes from `GET /recipes`. Note that ingredients and steps are stored as JSON strings in the database, so `JSON.parse` them back to arrays before rendering the list."
- **Eredmény:** A felhasználó most már válthat a "Generáló" és "Kedvencek" nézet között, ahol megtekintheti a korábban mentett receptjeit.

### 18. Globális Bevásárlólista
- **Eszköz:** Google Gemini, GitHub Copilot
- **Feladat:** A specifikáció F05-ös pontjának ("Bevásárlólista Kezelés") megvalósítása.
- **Prompt:** "Create a shopping list feature. Backend: Add `ShoppingItem` model and endpoints (POST/GET/DELETE). Frontend: Add a button next to ingredients to add them to the list, and create a new view to manage these items."
- **Eredmény:** Teljeskörű bevásárlólista funkcionalitás: a felhasználók elmenthetik a hiányzó alapanyagokat egy központi listára, amit külön nézetben kezelhetnek.

### 19. Bevásárlólista "Pipálása"
- **Eszköz:** Google Gemini, GitHub Copilot
- **Feladat:** A specifikáció F05-ös pontjának teljesítése: az elemek legyenek "pipálhatók".
- **Prompt:** "Create a PATCH endpoint `/shopping-list/{id}` that toggles the `is_purchased` boolean field of a shopping item. Update the React frontend to show a checkbox next to each item and call this endpoint on change."
- **Eredmény:** A bevásárlólistán megjelentek a checkboxok, a tételek állapota (megvéve/nincs megvéve) most már mentődik az adatbázisba.