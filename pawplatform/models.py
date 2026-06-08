from sqlalchemy import Column, Integer, String
from database import Base
import uuid

class CatModel(Base):
    __tablename__ = "cats"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    race = Column(String, nullable=True)
    description = Column(String, nullable=True)
    status = Column(String,  default="available")  # available, adopted,