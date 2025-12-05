from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import os
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

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
    lifespan=lifespan,
    docs_url="/api/docs" if os.getenv("ENVIRONMENT") == "development" else None,
    redoc_url="/api/redoc" if os.getenv("ENVIRONMENT") == "development" else None,
)

# Rate limiting
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Security Headers Middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    
    '''
    # Skip security headers for API docs (Swagger UI needs CDN access)
    if request.url.path.startswith("/api/docs") or request.url.path.startswith("/api/redoc"):
        return response
    '''

    # Prevent clickjacking
    response.headers["X-Frame-Options"] = "DENY"
    
    # Prevent MIME type sniffing
    response.headers["X-Content-Type-Options"] = "nosniff"
    
    # XSS Protection
    response.headers["X-XSS-Protection"] = "1; mode=block"
    
    # Content Security Policy
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
        "style-src 'self' 'unsafe-inline'; "
        "img-src 'self' data: https: blob:; "
        "font-src 'self' data:; "
        "connect-src 'self' https://event-ticketing-system-devx.onrender.com https://res.cloudinary.com; "
        "frame-ancestors 'none';"
    )
    
    # Referrer Policy
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    
    # Permissions Policy
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
    
    # HSTS - Force HTTPS
    if request.url.scheme == "https":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    
    return response

# CORS configuration - Allow both local and hosted origins
CORS_ORIGINS = os.getenv(
    "CORS_ORIGINS", 
    '["http://localhost:5000", "http://localhost:5001", "https://event-ticketing-system-uwpc.vercel.app", "https://event-ticketing-system-nine.vercel.app"]'
)
import json
cors_origins = json.loads(CORS_ORIGINS) if isinstance(CORS_ORIGINS, str) else CORS_ORIGINS

# CORS Middleware with strict settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if "*" in str(cors_origins) else cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "Accept", "Origin", "X-Requested-With"],
    expose_headers=["Content-Length", "Content-Type"],
    max_age=600,  # Cache preflight requests for 10 minutes
)

# Trusted Host Middleware - Prevent Host Header attacks
ALLOWED_HOSTS = os.getenv(
    "ALLOWED_HOSTS",
    "localhost,127.0.0.1,event-ticketing-system-devx.onrender.com"
).split(",")
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=ALLOWED_HOSTS
)

# GZip Compression
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Include routers
app.include_router(registration.router)
app.include_router(admin.router)
app.include_router(ticket.router)
app.include_router(test.router)  # Test endpoints
app.include_router(settings.router)  # Settings API

# Import admin management and audit routers
from routes import admin_management, audit
app.include_router(admin_management.router)  # Admin CRUD API
app.include_router(audit.router)  # Audit logs API


@app.get("/")
@limiter.limit("10/minute")
async def root(request: Request):
    return {
        "message": "Event Ticket System API",
        "status": "active",
        "version": "2.1.0",
        "Protocol": "Omega class"
    }


@app.post("/test/upload")
@limiter.limit("5/minute")
async def test_upload(request: Request, file: UploadFile = File(...)):
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
@limiter.limit("30/minute")
async def health_check(request: Request):
    return {
        "status": "healthy",
        "System":"Ready"
    }


@app.get("/ping")
@limiter.limit("30/minute")
async def ping(request: Request):
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
