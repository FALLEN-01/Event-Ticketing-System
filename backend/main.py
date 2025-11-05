from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os

from database import init_db
from routes import registration, admin, ticket
from utils.storage import initialize_storage_buckets


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database and storage on startup"""
    print("🚀 Initializing database...")
    init_db()
    print("✅ Database initialized successfully!")
    
    print("☁️  Initializing Supabase Storage buckets...")
    await initialize_storage_buckets()
    print("✅ Storage buckets ready!")
    
    yield
    print("👋 Shutting down...")


app = FastAPI(
    title="Event Ticket System",
    description="Backend API for event registration and ticket management - Phase 2 (Supabase Storage)",
    version="2.0.1",
    lifespan=lifespan
)

# CORS configuration
CORS_ORIGINS = os.getenv("CORS_ORIGINS", '["*"]')
import json
cors_origins = json.loads(CORS_ORIGINS) if isinstance(CORS_ORIGINS, str) else CORS_ORIGINS

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(registration.router)
app.include_router(admin.router)
app.include_router(ticket.router)


@app.get("/")
async def root():
    return {
        "message": "Event Ticket System API - Phase 2",
        "status": "active",
        "version": "2.0.0",
        "phase": "2 - Full Registration with Payment & Ticket Generation"
    }


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "phase": "2"
    }


@app.get("/ping")
async def ping():
    """
    Ping endpoint to keep Render app alive
    Called by GitHub Actions every 8 minutes
    """
    return {
        "status": "pong",
        "message": "Server is alive"
    }


if __name__ == "__main__":
    import uvicorn
    import logging
    
    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    logger = logging.getLogger(__name__)
    
    logger.info("=" * 60)
    logger.info("🚀 Starting Event Ticketing System Backend")
    logger.info("=" * 60)
    logger.info(f"📦 App Name: Event Ticket System")
    logger.info(f"📌 Version: 2.0.0 (Phase 2)")
    logger.info(f"🌐 Host: 0.0.0.0")
    logger.info(f"🔌 Port: 8000")
    logger.info(f"🔄 Hot Reload: Enabled")
    logger.info(f"🔒 CORS Origins: {cors_origins}")
    logger.info("=" * 60)
    logger.info("✨ Server starting... Press CTRL+C to stop")
    logger.info("=" * 60)
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
