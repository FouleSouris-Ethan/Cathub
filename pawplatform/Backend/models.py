from sqlalchemy import Column, Integer, String, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from .database import Base
import uuid
from datetime import datetime

class OrganizationModel(Base):
    __tablename__ = "organizations"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    email = Column(String, nullable=True, unique=True)
    
    users = relationship("User", back_populates="organization")
    cats = relationship("CatModel", back_populates="organization")
    
class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_admin = Column(Boolean, default=False)
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=False)
    
    organization = relationship("OrganizationModel", back_populates="users")

class AdoptionApplication(Base):
    __tablename__ = "adoption_applications"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    #Infos adoptant
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    address = Column(String, nullable=True)

    #Situation actuelle
    housing_type = Column(String, nullable=True)  # house, apartment, etc.
    has_garden = Column(Boolean, default=False)
    has_other_pets = Column(Boolean, default=False)
    has_children = Column(Boolean, default=False)
    first_cat = Column(Boolean, default=True)
    motivation = Column(String, nullable=True)

    #statut du dossier
    status = Column(String, default="en attente")  # en attente, approuvé, rejeté

    #relations
    cat_id = Column(String, ForeignKey("cats.id"), nullable=False)
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=False)

    created_at = Column(String, nullable=False)  # ISO format date string

class CatModel(Base):
    __tablename__ = "cats"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    race = Column(String, nullable=True)
    description = Column(String, nullable=True)
    status = Column(String, default="disponible")  # disponible, réservé, adopté
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=True)

    organization = relationship("OrganizationModel", back_populates="cats")
