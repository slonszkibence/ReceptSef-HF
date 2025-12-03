# 👨‍🍳 ReceptSef – Intelligens Konyhai Asszisztens
Szoftverfejlesztés MI támogatással házi feladat - Recept generáló alkalmazás

## 📖 Projekt Leírás

A **ReceptSef** egy Full-Stack webalkalmazás, amely a mindennapi étkezés-tervezés egyik leggyakoribb problémájára nyújt megoldást: *"Mi legyen a vacsora abból, ami itthon van?"*
A hagyományos receptkeresőkkel ellentétben ez a rendszer nem egy előre megírt adatbázisban keres, hanem a Google Gemini Generatív MI segítségével valós időben alkot meg recepteket a felhasználó által megadott alapanyagok alapján. A rendszer figyelembe veszi a hozzávalók harmóniáját, és strukturált, lépésről lépésre követhető útmutatót készít.
Az alkalmazás nemcsak ötleteket ad, hanem teljes körű konyhai menedzserként funkcionál: kezeli a bevásárlólistát, tárolja a kedvenc recepteket, és biztonságos felhasználói fiókokat biztosít.

## ✨ Kiemelt Funkciók

### 🧠 1. MI-Alapú Recept Generálás

* A felhasználó szabadszöveges formában adhatja meg a rendelkezésre álló hozzávalókat.

* **Dinamikus alkotás**: Bármilyen alapanyag-kombinációból képes értelmes receptet készíteni
* **Strukturált válaszok**: Az MI nem szabad szöveget, hanem szigorúan strukturált adatokat (JSON) küld vissza, így a felületen kártyák formájában jelennek meg az adatok
* **Intelligens szűrés**: A rendszer felismeri, ha a bemenet nem élelmiszer (pl. "beton, tégla"), és udvariasan jelzi, hogy ebből nem tud főzni

### 💾 2. Személyes Recepttár

* **Perzisztens tárolás**: A generált receptek egy kattintással elmenthetők a felhasználó privát profiljába

* **Részletes nézet**: A mentett receptek később bármikor visszanézhetők, az elkészítési idővel és utasításokkal együtt

* Az adatok perzisztens módon a PostgreSQL adatbázisba kerülnek, így azok a későbbi belépések során is elérhetők maradnak.

### 🛒 3. Okos Bevásárlólista

* **Interaktív kezelés**: A recept hozzávalói egy gombnyomással hozzáadhatók a központi bevásárlólistához

* **Valós idejű státusz**: A lista elemei "kipipálhatók" (megvettem/nincs meg), az állapotváltozás azonnal mentődik az adatbázisba

### 🔐 4. Biztonság

* **Autentikáció**: Regisztráció és bejelentkezés JWT (JSON Web Token) alapon

* **Adatvédelem**: A jelszavakat a rendszer bcrypt hash-eléssel tárolja, soha nem nyílt szövegként

* Minden felhasználó kizárólag a saját adataihoz fér hozzá

### 📱 5. Reszponzív és Modern UI
* A felületet úgy terveztük, hogy asztali számítógépen és mobil eszközökön is kényelmesen használható legyen.
* A felhasználót vizuális visszajelzések (betöltési animációk, siker- és hibaüzenetek, interaktív gombok) segítik a navigációban.

## 🛠️ Technológiai Stack

A projekt modern, iparági szabványnak számító technológiákra épül, biztosítva a skálázhatóságot és a karbantarthatóságot.

| Terület | Technológia | Leírás |
| :--- | :--- | :--- |
| **Backend** | Python (FastAPI) | Nagy teljesítményű, aszinkron API keretrendszer |
| **Frontend** | React (Vite + TS) | Komponens alapú UI fejlesztés TypeScript típusbiztonsággal |
| **Adatbázis** | PostgreSQL | Megbízható relációs adatbázis az adatok tárolására |
| **ORM** | SQLModel | A Pydantic és SQLAlchemy előnyeit egyesítő adatmodellező |
| **AI Model** | Google Gemini 2.5 Flash | Gyors és költséghatékony LLM a tartalomgeneráláshoz |
| **Stílus** | CSS3 / Flexbox | Reszponzív design mobil és asztali nézethez |

Technológiai szempontból az alkalmazás egy robusztus **Full-Stack** megoldás:
* A **Backend** oldalon **Python FastAPI** gondoskodik a gyors és aszinkron adatfeldolgozásról, valamint a **Google Gemini 2.5 Flash** nyelvi modell integrációjáról.
* A **Frontend** egy dinamikus **React (Vite + TypeScript)** felület, amely biztosítja a gördülékeny felhasználói élményt.
* Az adatok (felhasználók, receptek, bevásárlólisták) tartós és biztonságos tárolásáért egy **PostgreSQL** relációs adatbázis felel, **SQLModel** ORM segítségével.

## 🏗️ Rendszerarchitektúra és Adatmodell

Az alkalmazás kliens-szerver architektúrát követ. A Frontend és a Backend REST API végpontokon keresztül kommunikál.

**Adatbázis Struktúra (ERD)**
A rendszer három fő táblát használ, amelyek kapcsolatban állnak egymással:

**User (Felhasználó):**
Tárolja a hitelesítési adatokat (username, password_hash)
Kapcsolat: Egy felhasználónak több receptje és bevásárlólista eleme lehet

**Recipe (Recept):**
Tárolja a recept adatait: Cím, Idő, Hozzávalók (JSON stringként), Elkészítés
Foreign Key: user_id (a tulajdonos)

**ShoppingItem (Bevásárlólista Elem):**
Tárolja a termék nevét és státuszát (is_purchased: boolean)
Foreign Key: user_id


## 📂 Projekt Szerkezet

```text
ReceptSef-HF/
├── backend/                # Python FastAPI Szerver
│   ├── venv/               # Virtuális környezet
│   ├── main.py             # A backend belépési pontja és végpontok
│   ├── models.py           # SQLModel adatbázis modellek
│   ├── database.py         # Adatbázis kapcsolat
│   ├── init_db.py          # Adatbázis inicializáló script
│   └── requirements.txt    # Python függőségek
├── frontend/               # React Kliens
│   ├── src/
│   │   ├── App.tsx         # A fő alkalmazás logika
│   │   └── App.css         # Stílusok
│   ├── package.json        # Node.js függőségek
│   └── vite.config.ts      # Vite konfiguráció
├── docs/                   # Dokumentációk
│   └── specifikacio.pdf
└── README.md
```
---

## 🚀 Telepítési és Indítási Útmutató

A futtatáshoz szükséges: **Python 3.10+**, **Node.js**, **PostgreSQL**.

### 1. Adatbázis Előkészítése
1.  Győződjön meg róla, hogy fut a PostgreSQL szervere.
2.  Hozzon létre egy üres adatbázist `receptsef` néven.

### 2. Backend Beüzemelése
```bash
cd backend

# Virtuális környezet létrehozása és aktiválása
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Csomagok telepítése
pip install -r requirements.txt

# Környezeti változók beállítása
# Hozzon létre egy .env fájlt a .env.example alapján!
# Tartalma legyen:
# API_KEY=Sajat_Google_AI_Studio_Kulcs
# DATABASE_URL=postgresql://felhasznalo:jelszo@localhost/receptsef

# Adatbázis táblák inicializálása
python init_db.py

# Szerver indítása
uvicorn main:app --reload
```


### 3. Frontend Beüzemelése
```bash
cd frontend

# Csomagok telepítése
npm install

# Fejlesztői szerver indítása
npm run dev
```

## 📡 API Végpontok (Endpointok)
A backend az alábbi főbb REST végpontokat biztosítja:

### Auth

* POST /register: Új felhasználó regisztrálása
* POST /token: Bejelentkezés és JWT token igénylése

### Receptek

* POST /generate-recipe: MI hívás a recept generálásához (publikus/védett)
* GET /recipes: A bejelentkezett felhasználó mentett receptjeinek lekérése
* POST /save-recipe: Generált recept mentése az adatbázisba

### Bevásárlólista

* GET /shopping-list: Lista lekérése
* POST /shopping-list: Új tétel hozzáadása
* DELETE /shopping-list/{id}: Tétel törlése
* PATCH /shopping-list/{id}: Státusz módosítása (kész/nincs kész)

## MI Használati Napló
A követelményeknek megfelelően itt dokumentálom a fejlesztés során használt promptokat és az MI eszközökkel való együttműködést.

### 1. Specifikáció fázis
- **Eszköz:** Google Gemini
- **Prompt:** "Szoftverfejlesztő vagy, írj egy 2-3 oldalas specifikációt egy receptajánló alkalmazáshoz, amely tartalmazza a bevezetést, felhasználói szerepköröket, funkcionális és nem funkcionális követelményeket, valamint az adatmodellt."
- **Eredmény:** Elkészült a specifikáció vázlata a docs mappába.

### 2. Backend Setup
- **Eszköz:** Google Gemini / GitHub Copilot
- **Prompt:** "Készíts egy egyszerű main.py fájlt egy FastAPI alkalmazáshoz, amely rendelkezik egy gyökér végponttal, ami JSON üdvözlő üzenetet ad vissza."
- **Eredmény:** Létrejött a main.py és a requirements.txt, a szerver sikeresen fut.

### 3. Backend Hibajavítás
- **Eszköz:** Google Gemini
- **Probléma:** A `uvicorn` indításakor "Attribute 'app' not found" hibaüzenetet kaptam.
- **Prompt:** "Az 'Attribute app not found in module main' hibát kapom, amikor a uvicorn-t futtatom. Itt a kódom:... Hogyan tudom ezt javítani?"
- **Eredmény:** Az MI rámutatott, hogy nem mentettem a fájlt, így nem találta meg az app változót, illetve a változó elnevezésére hívta fel a figyelmet.

### 4. Google Gemini API Integráció
- **Eszköz:** Google Gemini
- **Feladat:** A statikus válasz helyett valódi generatív MI bekötése a backendbe.
- **Prompt:** "Frissítsd a FastAPI main.py fájlt, hogy a Google Gemini API-t használja a `google-generativeai` könyvtáron keresztül. Hozz létre egy POST `/generate-recipe` végpontot, amely egy alapanyaglistát vár bemenetként, és egy strukturált recept JSON-t ad vissza. Használj python-dotenv-et az API kulcs biztonságos kezeléséhez."
- **Eredmény:** Létrejött a végleges `main.py`, amely kezeli a `.env` fájlt és kommunikál a Google szervereivel.

### 5. Prompt Engineering (A rendszer lelke)
- **Eszköz:** Google Gemini
- **Feladat:** Olyan utasítást írni a Gemini modellnek, ami garantáltan csak JSON-t ad vissza, fecsegés nélkül.
- **Prompt:** "Írj egy rendszer promptot egy séf MI számára, amely alapanyagokat kap bemenetként, és szigorú JSON formátumban válaszol a következő kulcsokkal: title, time, ingredients, steps. A kimenet nyers JSON legyen, markdown formázás nélkül."
- **Eredmény:** Ezt a promptot építettem be a Python kód `generate_recipe` függvényébe.

### 6. Backend és Frontend Összekötése (CORS)
- **Eszköz:** Google Gemini
- **Feladat:** Engedélyezni, hogy a böngészőben futó React alkalmazás elérje a Python szervert.
- **Prompt:** - **Prompt:** "A frontend nem tud csatlakozni a backendhez, CORS hibát ír a böngésző. Mit kell beállítani FastAPI-ban, hogy engedje a localhost:5173-at?". Szeretném javítani a 'Cross-Origin Request Blocked' hibát."
- **Eredmény:** A `main.py`-ba bekerült a `CORSMiddleware`, a kommunikáció megnyílt a két oldal között.

### 7. Frontend Létrehozása
- **Eszköz:** Google Gemini / GitHub Copilot
- **Feladat:** React kliens készítése TypeScript alapokon.
- **Prompt:** "Írj egy React komponenst. Legyen benne egy szövegmező a hozzávalóknak és egy gomb. Ha megnyomom, küldje el az adatokat a backendnek, és a választ jelenítse meg."
- **Eredmény:** Elkészült az `App.tsx` kódja, amely kezeli a betöltési állapotot és megjeleníti a receptkártyát.

### 8. Hibaelhárítás - Modell Frissítés (404 Hiba)
- **Eszköz:** Google Gemini
- **Probléma:** A backend logban "404 models/gemini-pro is not found" hibaüzenet jelent meg, a generálás nem működött.
- **Prompt:** "Egy 404-es hibát kapok, miszerint a 'models/gemini-pro is not found', amikor a google-generativeai könyvtárat használom. Mi a helyes modellnév jelenleg az ingyenes csomaghoz?"
- **Eredmény:** A kódban a `gemini-pro`-t lecseréltem `gemini-2.5-flash`-re, ami megoldotta a problémát.

### 9. Adatbázis Réteg (PostgreSQL + SQLModel)
- **Eszköz:** Google Gemini
- **Feladat:** A specifikációban előírt PostgreSQL adatbázis integrálása modern ORM (SQLModel) segítségével.
- **Prompt:** "Készíts egy `database.py` fájlt SQLModel használatával, hogy csatlakozzon egy 'receptsef' nevű PostgreSQL adatbázishoz. Definiáld a `Recipe` és `User` SQLModel osztályokat is a `models.py` fájlban a következő mezők alapján: title, ingredients (json), steps, time."
- **Eredmény:** Létrejött az adatbázis kapcsolat és az adatmodellek (ORM), a rendszer automatikusan létrehozza a táblákat indításkor.

### 10. Mentés Funkció Implementálása
- **Eszköz:** Google Gemini
- **Feladat:** Végpont készítése, amivel a generált recept elmenthető az adatbázisba.
- **Prompt:** "Készíts egy POST `/save-recipe` végpontot a FastAPI-ban. Ez fogadja a recept adatait, hozzon létre egy új `Recipe` rekordot az SQLModel session használatával, és kommitolja az adatbázisba."
- **Eredmény:** Elkészült a `/save-recipe` végpont, így a generált receptek most már perzisztensen tárolódnak.

### 11. Frontend Mentés Gomb és Visszajelzés
- **Eszköz:** Google Gemini
- **Feladat:** A mentés funkció kivezetése a felhasználói felületre vizuális visszajelzéssel.
- **Prompt:** "Adj egy 'Mentés a Kedvencekbe' gombot a React receptkártyához. Kattintáskor hívja meg a POST /save-recipe végpontot. Mutass töltési állapotot, és siker esetén változtasd a gomb szövegét!"
- **Eredmény:** A gomb megjelent, kattintásra meghívja a backendet és zöldre vált siker esetén.

### 12. Hibaelhárítás - JSON Formátum és SyntaxError
- **Eszköz:** Google Gemini
- **Probléma:** A frontend `SyntaxError`-t dobott, mert az MI válasza néha tartalmazott Markdown formázást (` ```json `) vagy bevezető szöveget, amit a `JSON.parse` nem tudott feldolgozni.
- **Prompt:** "SyntaxError-t kapok a React-ben, mert a Gemini markdown formázást küld vissza. Frissítsd a Python kódot úgy, hogy távolítsa el a '```json' és '```' részeket a válaszból, és csak az első '{' és utolsó '}' karakter közötti szöveget vonja ki."
- **Eredmény:** Implementáltam egy tisztító logikát a backendben, ami kivágja a valid JSON részt a szövegből.

### 13. Backend Stabilizálás - JSON Mode és API Kulcs
- **Eszköz:** Google Gemini
- **Probléma:** A generálás néha instabil volt, illetve `404 Model not found` és API kulcs hibák léptek fel.
- **Prompt:** "Frissítsd a GenerativeModel konfigurációját, hogy használja a 'response_mime_type': 'application/json' beállítást a valid JSON kimenet garantálásához."
- **Eredmény:** A `response_mime_type` használatával a Google szervere most már garantáltan JSON-t küld, így a manuális szövegtisztítás feleslegessé vált (bár biztonságból benne maradt). A változónevek javítása után a kommunikáció stabil.

### 14. Felhasználókezelés és Autentikáció (Backend)
- **Eszköz:** Google Gemini / GitHub Copilot
- **Feladat:** A specifikációnak megfelelően a regisztráció és bejelentkezés megvalósítása, hogy a receptek felhasználókhoz kötöttek legyenek.
- **Prompt:** "Implementálj JWT alapú autentikációt FastAPI-ban. Hozz létre `/register` és `/token` végpontokat. Frissítsd a `User` modellt a hashelt jelszavak tárolásához. Védd le a `/save-recipe` útvonalat, hogy csak bejelentkezett felhasználók menthessenek recepteket."
- **Eredmény:** Elkészült a biztonságos autentikáció, a jelszavak hashelve tárolódnak, a védett végpontok JWT tokent várnak.

### 15. Login Felület és Token Kezelés (Frontend)
- **Eszköz:** Google Gemini
- **Feladat:** Bejelentkező és regisztrációs képernyő készítése a React oldalon.
- **Prompt:** "Készíts egy Bejelentkezés/Regisztráció nézetet React-ben. A kapott JWT tokent mentsd el a localStorage-ba. Frissítsd a `handleSave` függvényt.
- **Eredmény:** A frontend kezeli a belépést, a tokent elmenti, és nézetet vált (Login képernyő <-> Alkalmazás) a jogosultság alapján.

### 16. Hibaelhárítás - Bcrypt Kompatibilitás
- **Eszköz:** Google Gemini
- **Probléma:** Regisztrációkor `AttributeError: module 'bcrypt' has no attribute '__about__'` hibaüzenet érkezett a `passlib` könyvtárból.
- **Prompt:** "AttributeError-t kapok a bcrypt és a passlib kapcsán a jelszó hashelésekor. Úgy tűnik, ez egy verziókonfliktus. Hogyan javítsam ezt?"
- **Eredmény:** A hiba a verziók inkompatibilitása miatt lépett fel. A megoldás a csomagok verziójának rögzítése volt (`passlib[bcrypt]==1.7.4`, `bcrypt==4.0.1`), ami után a regisztráció sikeresen lefutott.

### 17. Kedvencek Listázása és Adattranszformáció
- **Eszköz:** GitHub Copilot
- **Feladat:** A mentett receptek megjelenítése a felületen (Read művelet).
- **Prompt:** "Adj egy 'Kedvencek' nézetet az alkalmazáshoz. Kérd le a mentett recepteket a `GET /recipes` végpontról. Vedd figyelembe, hogy a hozzávalók és lépések JSON stringként vannak tárolva az adatbázisban."
- **Eredmény:** A felhasználó most már válthat a "Generáló" és "Kedvencek" nézet között, ahol megtekintheti a korábban mentett receptjeit.

### 18. Globális Bevásárlólista
- **Eszköz:** Google Gemini, GitHub Copilot
- **Feladat:** A specifikáció F05-ös pontjának ("Bevásárlólista Kezelés") megvalósítása.
- **Prompt:** "Készíts egy bevásárlólista funkciót. Backend: Add hozzá a `ShoppingItem` modellt és a végpontokat (POST/GET/DELETE). Frontend: Adj egy gombot a hozzávalók mellé, amivel hozzáadhatók a listához, és készíts egy új nézetet ezen elemek kezelésére."
- **Eredmény:** Teljeskörű bevásárlólista funkcionalitás: a felhasználók elmenthetik a hiányzó alapanyagokat egy központi listára, amit külön nézetben kezelhetnek.

### 19. Bevásárlólista "Pipálása"
- **Eszköz:** Google Gemini, GitHub Copilot
- **Feladat:** A specifikáció F05-ös pontjának teljesítése: az elemek legyenek "pipálhatók".
- **Prompt:** "Készíts egy PATCH végpontot `/shopping-list/{id}` útvonalon, amely átváltja (toggle) a bevásárlólista elem `is_purchased` logikai mezőjét. Frissítsd a React frontendet, hogy mutasson egy jelölőnégyzetet (checkbox) minden elem mellett, és változáskor hívja meg ezt a végpontot."
- **Eredmény:** A bevásárlólistán megjelentek a checkboxok, a tételek állapota (megvéve/nincs megvéve) most már mentődik az adatbázisba.

### 20. Végső Ellenőrzés és Specifikáció Validálás
- **Eszköz:** Google Gemini
- **Feladat:** Összevetni az elkészült kódot az eredeti `specifikacio.docx` és a `Házi feladat követelmények.pdf` tartalmával.
- **Prompt:** "Ellenőrizd, hogy a jelenlegi kódbázis lefedi-e az összes funkcionális követelményt (F01-F06) és a backend/frontend elvárásokat.
- **Eredmény:** A hiányzó funkciók pótlása után a szoftver 100%-ban lefedi a specifikációt. A README fájlt kiegészítettem a telepítési útmutatóval.

### 21. UX Finomhangolás - Érvénytelen Bemenetek Kezelése
- **Eszköz:** Google Gemini
- **Feladat:** A felhasználói élmény javítása abban az esetben, ha értelmetlen vagy nem élelmiszer jellegű bemenetet adnak meg (pl. "beton, tégla").
- **Prompt:** "Módosítsd a rendszer promptot úgy, hogy tartalmazzon kivételkezelést: ha a bemenetből nem készíthető ehető étel, akkor a modell NE hibát dobjon, hanem egy speciális JSON-t küldjön vissza `{'title': 'Nincs találat'}` tartalommal."
- **Eredmény:** A backend most már felismeri a rossz bemenetet, a frontend pedig a technikai hibaüzenet helyett barátságos tájékoztatást ír ki a felhasználónak.

### 22. Dokumentáció megírásának segítése

- **Eszköz:** Google Gemini
- **Feladat:** Dokumentáció megírása, eddig adott promptjaim leírása szakszerűbb megfogalmazással
- **Prompt:** Írd meg a feladathoz tartozó dokumentációt! Nézd át az általam megadott promptokat, foglald össze, hogy előtte mi volt a probléma, mi a feladat, prompt szövegét és mi lett az eredménye.
- **Eredmény:** Dokumentáció elkészült.

## 👤 Szerzői Információk

- **Név:** Slonszki Bence
- **Neptun kód:** DBHKPT
- **Dátum:** 2025.11.30.
- **Tárgy:** Szoftverfejlesztés MI támogatással

