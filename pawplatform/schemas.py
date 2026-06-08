from pydantic import BaseModel
from typing import Optional

class CatCreate(BaseModel):
    name: str
    age: int
    race: Optional[str] = None
    description: Optional[str] = None
    status: str = "available"  # available, adopted, pending

class Cat(CatCreate):
    id: str

    class Config:
        from_attributes = True