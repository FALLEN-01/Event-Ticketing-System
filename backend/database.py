import os
from dotenv import load_dotenv
from supabase import create_client, Client
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Load environment variables from .env file
load_dotenv()

# Supabase configuration from environment
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# PostgreSQL connection from environment
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set")

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
