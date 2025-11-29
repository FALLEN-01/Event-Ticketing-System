from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os

from database import init_db
from routes import registration, admin, ticket, test, settings
from utils.storage import initialize_storage_buckets

# Import for test route
from fastapi import File, UploadFile, HTTPException
from utils.storage import upload_payment_screenshot


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database and storage on startup"""
    print("🚀 Initializing database...")
    init_db()
    print("✅ Database initialized successfully!")
    
    print("☁️  Initializing Cloudinary storage...")
    await initialize_storage_buckets()
    print("✅ Cloudinary storage ready!")
    
    yield
    print("👋 Shutting down...")


app = FastAPI(
    title="Event Ticket System",
    description="Backend API for event registration and ticket management",
    version="2.1.0",
    lifespan=lifespan
)

# CORS configuration - Allow both local and hosted origins
CORS_ORIGINS = os.getenv(
    "CORS_ORIGINS", 
    '["http://localhost:5000", "http://localhost:5001", "https://event-ticketing-system-uwpc.vercel.app", "https://event-ticketing-system-nine.vercel.app"]'
)
import json
cors_origins = json.loads(CORS_ORIGINS) if isinstance(CORS_ORIGINS, str) else CORS_ORIGINS

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if "*" in str(cors_origins) else cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Include routers
app.include_router(registration.router)
app.include_router(admin.router)
app.include_router(ticket.router)
app.include_router(test.router)  # Test endpoints
app.include_router(settings.router)  # Settings API


@app.get("/")
async def root():
    return {
        "message": "Event Ticket System API - Phase 2",
        "status": "active",
        "version": "2.1.0",
        "phase": "2 - Full Registration with Payment & Ticket Generation",
        "storage": "Cloudinary"
    }


@app.post("/test/upload")
async def test_upload(file: UploadFile = File(...)):
    """
    Test endpoint to verify Cloudinary upload is working
    Upload any image file to test the integration
    """
    try:
        # Validate file type
        allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type. Allowed: {', '.join(allowed_types)}"
            )
        
        # Read file content
        file_content = await file.read()
        
        # Upload to Cloudinary
        file_url = await upload_payment_screenshot(file_content, file.filename)
        
        if not file_url:
            raise HTTPException(
                status_code=500,
                detail="Failed to upload file to Cloudinary"
            )
        
        return {
            "success": True,
            "message": "File uploaded successfully to Cloudinary!",
            "file_url": file_url,
            "filename": file.filename,
            "content_type": file.content_type,
            "size_bytes": len(file_content)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Upload failed: {str(e)}"
        )


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
