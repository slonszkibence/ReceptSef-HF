# backend/database.py
from sqlmodel import SQLModel, create_engine, Session

# Ellenőrizd, hogy itt a jó jelszó van-e! (A hiba alapján úgy tűnik, ez már jó)
DATABASE_URL = "postgresql://postgres:admin@localhost/receptsef"

engine = create_engine(DATABASE_URL, echo=True)

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