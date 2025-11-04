from supabase import create_client, Client
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Supabase configuration
SUPABASE_URL = "https://ckkyegjnbcrmipozjahe.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNra3llZ2puYmNybWlwb3pqYWhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNDMzNTAsImV4cCI6MjA3NzgxOTM1MH0.7yNGRvhzA82h7STPSEy4TwgSxqQlkbrkBlWYOBYbgR8"

# PostgreSQL connection
# For Render (IPv4): Use Session Pooler connection string from env variable
# For local development: Use direct connection on port 5432
import os

# Use environment variable for connection string if provided by Render
if os.getenv("DATABASE_URL"):
    DATABASE_URL = os.getenv("DATABASE_URL")
else:
    # Fallback to direct connection for local development
    DATABASE_URL = "postgresql+psycopg2://postgres:falloutcode000@db.ckkyegjnbcrmipozjahe.supabase.co:5432/postgres"

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
