# backend/init_db.py
from sqlmodel import SQLModel
from database import engine
# FONTOS: Itt importáljuk be a modelleket, hogy az SQLModel tudjon róluk!
from models import User, Recipe, ShoppingItem 

def init_db():
    print("Táblák létrehozása...")
    SQLModel.metadata.create_all(engine)
    print("KÉSZ! A táblák (User, Recipe, ShoppingItem) létrehozva.")

if __name__ == "__main__":
    init_db()