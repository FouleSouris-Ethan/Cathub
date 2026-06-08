from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
import os

# Prefer explicit DATABASE_URL; if missing, build from POSTGRES_* vars
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    user = os.getenv("POSTGRES_USER", os.getenv("DB_USER", "pawuser"))
    password = os.getenv("POSTGRES_PASSWORD", os.getenv("DB_PASSWORD", "pawpassword"))
    host = os.getenv("DB_HOST", "localhost")
    port = os.getenv("DB_PORT", "5432")
    dbname = os.getenv("POSTGRES_DB", os.getenv("DB_NAME", "pawplatform"))
    DATABASE_URL = f"postgresql://{user}:{password}@{host}:{port}/{dbname}"

# Use pool_pre_ping to avoid stale connections when DB restarts
engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine)

class Base(DeclarativeBase):
    pass

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()