from pydantic import BaseModel
from typing import Optional

class OrganizationCreate(BaseModel):
    name: str
    email: str

class Organization(OrganizationCreate):
    id: str

    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    email: str
    password: str
    is_admin: bool = False

class User(BaseModel):
    id: str
    email: str
    is_admin: bool
    organization_id: str

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class ApplicationCreate(BaseModel):
    first_name: str
    last_name: str
    email: str
    phone: Optional[str] = None
    address: Optional[str] = None
    housing_type: Optional[str] = None
    has_garden: bool = False
    has_other_pets: bool = False
    has_children: bool = False
    first_cat: bool = True
    motivation: Optional[str] = None

class Application(ApplicationCreate):
    id: str
    status: str
    cat_id: str
    organization_id: str
    created_at: str

    class Config:
        from_attributes = True

class ApplicationStatusUpdate(BaseModel):
    status: str  # en attente, approuvé, rejeté

class CatCreate(BaseModel):
    name: str
    age: int
    race: Optional[str] = None
    description: Optional[str] = None
    status: str = "disponible"  # disponible, réservé, adopté

class Cat(CatCreate):
    id: str
    organization_id: str

    class Config:
        from_attributes = True
