from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base
import uuid

class OrganizationModel(Base):
    __tablename__ = "organizations"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    email = Column(String, nullable=True)
    
    cats = relationship("CatModel", back_populates="organization")

class CatModel(Base):
    __tablename__ = "cats"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    race = Column(String, nullable=True)
    description = Column(String, nullable=True)
    status = Column(String, default="available")  # available, adopted, pending
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=True)
    organization = relationship("OrganizationModel", back_populates="cats")
