from fastapi import APIRouter, File, UploadFile, HTTPException, Form
from typing import Optional
from utils.storage import upload_payment_screenshot, upload_qr_code
from utils.email import (
    send_approval_email, 
    send_rejection_email, 
    send_pending_confirmation_email
)
import os
from datetime import datetime

router = APIRouter(prefix="/api/test", tags=["Testing"])


@router.get("/")
async def test_root():
    """
    Test endpoint to verify API is working
    """
    return {
        "status": "ok",
        "message": "Test API is working!",
        "timestamp": datetime.utcnow().isoformat()
    }


@router.post("/upload")
async def test_file_upload(file: UploadFile = File(...)):
    """
    Test endpoint to verify Cloudinary file upload is working
    Upload any image file to test the integration
    
    Returns the Cloudinary URL of the uploaded file
    """
    try:
        # Validate file type
        allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type '{file.content_type}'. Allowed: {', '.join(allowed_types)}"
            )
        
        # Check file size (max 10MB for testing)
        file_content = await file.read()
        file_size_mb = len(file_content) / (1024 * 1024)
        
        if file_size_mb > 10:
            raise HTTPException(
                status_code=400,
                detail=f"File too large: {file_size_mb:.2f}MB. Maximum allowed: 10MB"
            )
        
        # Upload to Cloudinary
        file_url = await upload_payment_screenshot(file_content, file.filename)
        
        if not file_url:
            raise HTTPException(
                status_code=500,
                detail="Failed to upload file to Cloudinary. Check your credentials in .env file."
            )
        
        return {
            "success": True,
            "message": "File uploaded successfully to Cloudinary! ✅",
            "data": {
                "file_url": file_url,
                "filename": file.filename,
                "content_type": file.content_type,
                "size_bytes": len(file_content),
                "size_mb": round(file_size_mb, 2)
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Upload failed: {str(e)}"
        )


@router.post("/upload-with-data")
async def test_upload_with_form_data(
    name: str = Form(...),
    email: str = Form(...),
    file: UploadFile = File(...)
):
    """
    Test endpoint to simulate the registration form upload
    Accepts form data along with file upload
    """
    try:
        # Validate inputs
        if not name or len(name.strip()) < 2:
            raise HTTPException(status_code=400, detail="Name must be at least 2 characters")
        
        if '@' not in email:
            raise HTTPException(status_code=400, detail="Invalid email format")
        
        # Validate file
        allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type. Allowed: {', '.join(allowed_types)}"
            )
        
        # Upload file
        file_content = await file.read()
        file_url = await upload_payment_screenshot(file_content, file.filename)
        
        if not file_url:
            raise HTTPException(
                status_code=500,
                detail="Failed to upload file to Cloudinary"
            )
        
        return {
            "success": True,
            "message": "Test registration with file upload successful!",
            "data": {
                "name": name,
                "email": email,
                "file_url": file_url,
                "filename": file.filename,
                "size_bytes": len(file_content)
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Test failed: {str(e)}"
        )


@router.get("/cloudinary-config")
async def test_cloudinary_config():
    """
    Test endpoint to check if Cloudinary is configured
    (Does not expose secrets, only checks if they exist)
    """
    cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME")
    api_key = os.getenv("CLOUDINARY_API_KEY")
    api_secret = os.getenv("CLOUDINARY_API_SECRET")
    
    return {
        "cloudinary_configured": bool(cloud_name and api_key and api_secret),
        "cloud_name_set": bool(cloud_name),
        "api_key_set": bool(api_key),
        "api_secret_set": bool(api_secret),
        "cloud_name": cloud_name if cloud_name else "NOT SET",
        "message": "✅ Cloudinary is properly configured!" if (cloud_name and api_key and api_secret) else "❌ Cloudinary configuration incomplete. Check your .env file."
    }


@router.get("/database")
async def test_database_connection():
    """
    Test endpoint to check database connection
    """
    try:
        from database import SessionLocal
        from sqlalchemy import text
        db = SessionLocal()
        
        # Try a simple query using SQLAlchemy 2.0 syntax
        result = db.execute(text("SELECT 1")).fetchone()
        db.close()
        
        return {
            "success": True,
            "message": "✅ Database connection successful!",
            "result": result[0] if result else None
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"❌ Database connection failed: {str(e)}"
        }


@router.get("/env-check")
async def test_environment_variables():
    """
    Check if all required environment variables are set
    """
    required_vars = [
        "DATABASE_URL",
        "CLOUDINARY_CLOUD_NAME",
        "CLOUDINARY_API_KEY",
        "CLOUDINARY_API_SECRET",
        "SUPABASE_URL",
        "SUPABASE_KEY"
    ]
    
    results = {}
    all_set = True
    
    for var in required_vars:
        value = os.getenv(var)
        is_set = bool(value)
        results[var] = {
            "set": is_set,
            "value_preview": value[:20] + "..." if (value and len(value) > 20) else value if value else "NOT SET"
        }
        if not is_set:
            all_set = False
    
    return {
        "all_required_vars_set": all_set,
        "variables": results,
        "message": "✅ All environment variables are set!" if all_set else "⚠️ Some environment variables are missing. Check your .env file."
    }


@router.post("/send-test-email")
async def test_send_email(
    email: str = Form(...),
    email_type: str = Form("approval")
):
    """
    Test endpoint to send various email templates
    
    Args:
        email: Recipient email address
        email_type: Type of email to send (approval, rejection, pending)
    
    Returns:
        Success/failure message
    """
    try:
        # Validate email
        if '@' not in email:
            raise HTTPException(status_code=400, detail="Invalid email format")
        
        # Check SMTP configuration
        smtp_user = os.getenv("SMTP_USER")
        smtp_password = os.getenv("SMTP_PASSWORD")
        
        if not smtp_user or not smtp_password:
            raise HTTPException(
                status_code=500,
                detail="SMTP credentials not configured. Set SMTP_USER and SMTP_PASSWORD in environment variables."
            )
        
        # Send appropriate email based on type
        if email_type == "approval":
            success = await send_approval_email(
                to_email=email,
                name="Test User",
                serial_code="EVT25-TEST001",
                qr_code_path=None,  # No actual QR for test
                team_name=None
            )
            message_type = "Approval email (with ticket)"
            
        elif email_type == "rejection":
            success = await send_rejection_email(
                to_email=email,
                name="Test User",
                reason="Payment screenshot was unclear. Please resubmit with a clearer image."
            )
            message_type = "Rejection email"
            
        elif email_type == "pending":
            success = await send_pending_confirmation_email(
                to_email=email,
                name="Test User",
                serial_code="EVT25-TEST001"
            )
            message_type = "Pending confirmation email"
            
        else:
            raise HTTPException(
                status_code=400,
                detail="Invalid email_type. Use: approval, rejection, or pending"
            )
        
        if success:
            return {
                "success": True,
                "message": f"✅ {message_type} sent successfully to {email}!",
                "email_type": email_type,
                "recipient": email,
                "smtp_user": smtp_user,
                "timestamp": datetime.utcnow().isoformat()
            }
        else:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to send {message_type}. Check backend logs for details."
            )
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Email test failed: {str(e)}"
        )


@router.get("/smtp-config")
async def test_smtp_config():
    """
    Test endpoint to check if SMTP/Email is configured
    (Does not expose secrets, only checks if they exist)
    """
    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = os.getenv("SMTP_PORT")
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")
    from_email = os.getenv("FROM_EMAIL")
    from_name = os.getenv("FROM_NAME")
    
    return {
        "smtp_configured": bool(smtp_user and smtp_password),
        "smtp_host": smtp_host or "smtp.gmail.com (default)",
        "smtp_port": smtp_port or "587 (default)",
        "smtp_user_set": bool(smtp_user),
        "smtp_password_set": bool(smtp_password),
        "smtp_user": smtp_user if smtp_user else "NOT SET",
        "from_email": from_email or smtp_user or "NOT SET",
        "from_name": from_name or "Event Registration System (default)",
        "message": "✅ SMTP is properly configured!" if (smtp_user and smtp_password) else "❌ SMTP configuration incomplete. Set SMTP_USER and SMTP_PASSWORD in environment variables."
    }

