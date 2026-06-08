from pydantic import BaseModel
from typing import Optional

class OrganizationCreate(BaseModel):
    name: str
    email: str

class Organization(OrganizationCreate):
    id: str

    class Config:
        from_attributes = True

class CatCreate(BaseModel):
    name: str
    age: int
    race: Optional[str] = None
    description: Optional[str] = None
    status: str = "available"  # available, adopted, pending

class Cat(CatCreate):
    id: str
    organization_id: str

    class Config:
        from_attributes = True
