from supabase import create_client, Client
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Supabase configuration
SUPABASE_URL = "https://ckkyegjnbcrmipozjahe.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNra3llZ2puYmNybWlwb3pqYWhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNDMzNTAsImV4cCI6MjA3NzgxOTM1MH0.7yNGRvhzA82h7STPSEy4TwgSxqQlkbrkBlWYOBYbgR8"

# PostgreSQL connection - Using connection pooler for external connections (Render)
# Port 6543 is the Session Pooler (use for Render/IPv4-only platforms)
# Port 5432 is direct connection (use for local development)
import os
PORT = "6543" if os.getenv("RENDER") else "5432"
HOST = "aws-0-ap-south-1.pooler.supabase.com" if os.getenv("RENDER") else "db.ckkyegjnbcrmipozjahe.supabase.co"
DATABASE_URL = f"postgresql+psycopg2://postgres:lDUNu6JSD28FCmfS@{HOST}:{PORT}/postgres"

# Create SQLAlchemy engine for PostgreSQL
engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Create Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


def get_db():
    """
    Get database session
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_supabase():
    """
    Get Supabase client
    """
    return supabase


def init_db():
    """
    Initialize database tables
    """
    Base.metadata.create_all(bind=engine)
