"""
Configuration settings for the application
Phase 1: Basic settings for database and CORS
"""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Application
    app_name: str = "Event Ticket System"
    app_version: str = "1.0.0"
    debug: bool = True
    
    # Database - MySQL/MariaDB (Cloud SQL compatible)
    database_url: str = "mysql+pymysql://root:password@localhost:3306/event_tickets"
    # For SQLite testing: "sqlite:///./event_tickets.db"
    
    # Frontend URLs for CORS
    cors_origins: List[str] = [
        "http://localhost:5000",
        "http://localhost:5001",
        "http://127.0.0.1:5000",
        "http://127.0.0.1:5001",
    ]
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
