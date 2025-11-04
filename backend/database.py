import os
from supabase import create_client, Client
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Supabase configuration
SUPABASE_URL = "https://ckkyegjnbcrmipozjahe.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNra3llZ2puYmNybWlwb3pqYWhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNDMzNTAsImV4cCI6MjA3NzgxOTM1MH0.7yNGRvhzA82h7STPSEy4TwgSxqQlkbrkBlWYOBYbgR8"

# PostgreSQL connection
# IMPORTANT: Render requires Session Pooler (IPv4 compatible) on port 6543
# Direct connection on port 5432 is IPv6-only and won't work on Render


# Use environment variable for connection string if provided by Render
if os.getenv("DATABASE_URL"):
    DATABASE_URL = os.getenv("DATABASE_URL")
else:
    # Fallback to Session Pooler for IPv4 compatibility (Render requirement)
    # Session mode: port 5432, supports persistent connections with IPv4
    # Format: postgresql+psycopg2://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
    DATABASE_URL = "postgresql+psycopg2://postgres.ckkyegjnbcrmipozjahe:lDUNu6JSD28FCmfS@aws-0-ap-south-1.pooler.supabase.com:5432/postgres"

# SSL configuration for PostgreSQL connection
ssl_args = {}
# Check if SSL cert exists in certs directory
cert_path = os.path.join(os.path.dirname(__file__), "certs", "capem.crt")
if os.path.exists(cert_path):
    ssl_args = {
        "connect_args": {
            "sslmode": "require",
            "sslrootcert": cert_path
        }
    }
else:
    # For Render deployment, use sslmode=require without cert file
    ssl_args = {
        "connect_args": {
            "sslmode": "require"
        }
    }

# Create SQLAlchemy engine for PostgreSQL with SSL
engine = create_engine(DATABASE_URL, pool_pre_ping=True, **ssl_args)
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
