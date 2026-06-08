from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy.orm import Session
from database import Base, get_db, engine
from schemas import CatCreate, Cat
from models import CatModel

app = FastAPI()

# Create the database tables
Base.metadata.create_all(bind=engine)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Paw Platform API!"}

#Créer un chat
@app.post("/cats/", response_model=Cat)
def create_cat(cat: CatCreate, db: Session = Depends(get_db)):
    new_cat = CatModel(**cat.dict())
    db.add(new_cat)
    db.commit()
    db.refresh(new_cat)
    return new_cat

#Lister tous les chats
@app.get("/cats", response_model=list[Cat])
def list_cats(db: Session = Depends(get_db)):
    return db.query(CatModel).all()

#Recupérer un chat par ID
@app.get("/cats/{cat_id}", response_model=Cat)
def get_cat(cat_id: str, db: Session = Depends(get_db)):
    cat = db.query(CatModel).filter(CatModel.id == cat_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Cat not found")
    return cat

#Mettre à jour un chat
@app.put("/cats/{cat_id}", response_model=Cat)
def update_cat(cat_id: str, cat: CatCreate, db: Session = Depends(get_db)):
    existing = db.query(CatModel).filter(CatModel.id == cat_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Cat not found")
    for key, value in cat.dict().items():
        setattr(existing, key, value)
    db.commit()
    db.refresh(existing)
    return existing

#Supprimer un chat
@app.delete("/cats/{cat_id}")
def delete_cat(cat_id: str, db: Session = Depends(get_db)):
    cat = db.query(CatModel).filter(CatModel.id == cat_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Cat not found")
    db.delete(cat)
    db.commit()
    return {"message": "Cat deleted"}

