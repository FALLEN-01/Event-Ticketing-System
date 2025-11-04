"""
FastAPI Backend for Event Ticket System
Phase 1: Core registration and admin viewing
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from config import settings
from database import init_db
from routes import registration, admin, ticket


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database on startup"""
    print("🚀 Initializing database...")
    init_db()
    print("✅ Database initialized successfully!")
    yield
    print("👋 Shutting down...")


app = FastAPI(
    title=settings.app_name,
    description="Backend API for event registration and ticket management - Phase 1",
    version=settings.app_version,
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
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
        "message": f"{settings.app_name} API - Phase 1",
        "status": "active",
        "version": settings.app_version,
        "phase": "1 - Core Registration & Admin View"
    }


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "phase": "1"
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
    logger.info(f"📦 App Name: {settings.app_name}")
    logger.info(f"📌 Version: {settings.app_version}")
    logger.info(f"🌐 Host: 0.0.0.0")
    logger.info(f"🔌 Port: 8000")
    logger.info(f"🔄 Hot Reload: Enabled")
    logger.info(f"🔒 CORS Origins: {settings.cors_origins}")
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
