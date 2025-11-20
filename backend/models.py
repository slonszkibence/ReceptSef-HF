# backend/models.py
from typing import Optional, List
from sqlmodel import Field, SQLModel, Relationship
from datetime import datetime

# 1. Felhasználó Modell 
class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True)
    password_hash: str  # 

    # Kapcsolatok (opcionális, de hasznos)
    recipes: List["Recipe"] = Relationship(back_populates="user")
    shopping_items: List["ShoppingItem"] = Relationship(back_populates="user")

# 2. Recept Modell 
class Recipe(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str          # [cite: 49]
    ingredients: str    # JSON stringként tároljuk [cite: 50]
    instructions: str   # [cite: 51]
    time: str           # Ezt is tároljuk, bár a spec nem írja külön, de a frontend használja
    created_at: datetime = Field(default_factory=datetime.utcnow) # [cite: 52]

    user_id: Optional[int] = Field(default=None, foreign_key="user.id") # [cite: 48]
    user: Optional[User] = Relationship(back_populates="recipes")

# 3. Bevásárlólista Elem 
class ShoppingItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    item_name: str      # [cite: 56]
    is_purchased: bool = Field(default=False) # [cite: 57]

    user_id: Optional[int] = Field(default=None, foreign_key="user.id") # [cite: 55]
    user: Optional[User] = Relationship(back_populates="shopping_items")