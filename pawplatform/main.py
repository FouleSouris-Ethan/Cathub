from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy.orm import Session
from .database import Base, get_db, engine
from .schemas import CatCreate, Cat, OrganizationCreate, Organization as OrgSchema
from .models import CatModel, OrganizationModel

app = FastAPI()

# Create the database tables
Base.metadata.create_all(bind=engine)

# Routes Organization
@app.post("/organizations/", response_model=OrgSchema)
def create_organization(org: OrganizationCreate, db: Session = Depends(get_db)):
    existing = db.query(OrganizationModel).filter(OrganizationModel.email == org.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Organization already exists")
    new_org = OrganizationModel(**org.dict())
    db.add(new_org)
    db.commit()
    db.refresh(new_org)
    return new_org

@app.get("/organizations/", response_model=list[OrgSchema])
def list_organizations(db: Session = Depends(get_db)):
    return db.query(OrganizationModel).all()

# routes Cat

@app.get("/")
def read_root():
    return {"message": "Welcome to the Paw Platform API!"}

#Créer un chat
@app.post("/organizations/{org_id}/cats", response_model=Cat)
def create_cat(cat: CatCreate, org_id: str, db: Session = Depends(get_db)):
    org = db.query(OrganizationModel).filter(OrganizationModel.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organisation introuvable")
    new_cat = CatModel(**cat.dict(), organization_id=org_id)
    db.add(new_cat)
    db.commit()
    db.refresh(new_cat)
    return new_cat

#Lister tous les chats
@app.get("/organizations/{org_id}/cats", response_model=list[Cat])
def list_cats(org_id: str, db: Session = Depends(get_db)):
    org = db.query(OrganizationModel).filter(OrganizationModel.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organisation introuvable")
    return db.query(CatModel).filter(CatModel.organization_id == org_id).all()

#Recupérer un chat par ID
@app.get("/organizations/{org_id}/cats/{cat_id}", response_model=Cat)
def get_cat(org_id: str, cat_id: str, db: Session = Depends(get_db)):
    cat = db.query(CatModel).filter(
        CatModel.id == cat_id,
        CatModel.organization_id == org_id,
    ).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Chat introuvable")
    return cat

#Mettre à jour un chat
@app.put("/organizations/{org_id}/cats/{cat_id}", response_model=Cat)
def update_cat(org_id: str, cat_id: str, cat: CatCreate, db: Session = Depends(get_db)):
    existing = db.query(CatModel).filter(
        CatModel.id == cat_id,
        CatModel.organization_id == org_id,
    ).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Cat not found")
    for key, value in cat.dict().items():
        setattr(existing, key, value)
    db.commit()
    db.refresh(existing)
    return existing

#Supprimer un chat
@app.delete("/organizations/{org_id}/cats/{cat_id}")
def delete_cat(org_id: str, cat_id: str, db: Session = Depends(get_db)):
    cat = db.query(CatModel).filter(
        CatModel.id == cat_id,
        CatModel.organization_id == org_id,
    ).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Cat introuvable")
    db.delete(cat)
    db.commit()
    return {"message": "Cat supprimé avec succès"}

