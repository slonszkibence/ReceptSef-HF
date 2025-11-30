# backend/database.py
from sqlmodel import SQLModel, create_engine, Session
from dotenv import load_dotenv
import os

load_dotenv()
# Ellenőrizd, hogy itt a jó jelszó van-e! (A hiba alapján úgy tűnik, ez már jó)
database_url = os.getenv("DATABASE_URL")

if not database_url:
    raise ValueError("DATABASE_URL környezeti változó nincs beállítva.")

engine = create_engine(database_url, echo=True)

def create_db_and_tables():
    # --- EZT A SORT SZÚRD BE IDE! ---
    # Ez kényszeríti a Pythont, hogy olvassa be a modelleket, 
    # mielőtt megpróbálja létrehozni a táblákat.
    import models 
    # -------------------------------
    
    print("Táblák létrehozása folyamatban...")
    SQLModel.metadata.create_all(engine)
    print("Táblák létrehozása kész.")

def get_session():
    with Session(engine) as session:
        yield session