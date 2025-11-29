from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from database import get_db
from models.settings import Settings
from pydantic import BaseModel
from typing import Optional
import cloudinary
import cloudinary.uploader
import os
from io import BytesIO
import httpx
from utils.audit import log_audit, AuditAction


router = APIRouter(prefix="/api/admin/settings", tags=["settings"])

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)


class SettingsUpdate(BaseModel):
    event_name: Optional[str] = None
    event_type: Optional[str] = None
    event_date: Optional[str] = None
    event_time: Optional[str] = None
    event_venue: Optional[str] = None
    event_location: Optional[str] = None
    individual_price: Optional[float] = None
    bulk_price: Optional[float] = None
    bulk_team_size: Optional[int] = None
    currency: Optional[str] = None
    upi_id: Optional[str] = None
    organization_name: Optional[str] = None
    support_email: Optional[str] = None
    approval_email_subject: Optional[str] = None
    rejection_email_subject: Optional[str] = None
    individual_qr_code: Optional[str] = None
    bulk_qr_code: Optional[str] = None


class SettingsResponse(BaseModel):
    id: int
    event_name: str
    event_type: str
    event_date: str
    event_time: str
    event_venue: str
    event_location: str
    individual_price: float
    bulk_price: float
    bulk_team_size: int
    currency: str
    upi_id: str
    organization_name: str
    support_email: str
    approval_email_subject: str
    rejection_email_subject: str
    individual_qr_code: Optional[str] = None
    bulk_qr_code: Optional[str] = None

    class Config:
        from_attributes = True


@router.get("", response_model=SettingsResponse)
def get_settings(db: Session = Depends(get_db)):
    """
    Get current system settings
    """
    settings = db.query(Settings).first()
    
    if not settings:
        # Create default settings if none exist
        settings = Settings()
        db.add(settings)
        db.commit()
        db.refresh(settings)
    
    return settings


@router.put("", response_model=SettingsResponse)
def update_settings(
    settings_update: SettingsUpdate,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Update system settings
    """
    settings = db.query(Settings).first()
    
    if not settings:
        settings = Settings()
        db.add(settings)
    
    # Update only provided fields
    update_data = settings_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(settings, field, value)
    
    db.commit()
    db.refresh(settings)
    
    # Log settings update
    log_audit(
        db=db,
        admin_id=1,  # TODO: Get from JWT token
        action=AuditAction.UPDATE_SETTINGS,
        details={"updated_fields": list(update_data.keys())},
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent", None)
    )
    
    return settings


@router.post("/upload-qr/{qr_type}")
async def upload_qr_code(
    qr_type: str,
    file: UploadFile = File(...),
    request: Request = None,
    db: Session = Depends(get_db)
):
    """
    Upload QR code image (individual or bulk)
    """
    if qr_type not in ["individual", "bulk"]:
        raise HTTPException(status_code=400, detail="Invalid QR type. Use 'individual' or 'bulk'")
    
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    try:
        # Read file content
        contents = await file.read()
        
        # Upload to Cloudinary in dedicated qr_codes folder
        upload_result = cloudinary.uploader.upload(
            contents,
            folder="qr_codes/payment",
            public_id=f"{qr_type}_qr",
            overwrite=True,
            resource_type="image"
        )
        
        # Get settings
        settings = db.query(Settings).first()
        if not settings:
            settings = Settings()
            db.add(settings)
        
        # Update QR URL in database
        qr_url = upload_result["secure_url"]
        if qr_type == "individual":
            settings.individual_qr_code = qr_url
        else:
            settings.bulk_qr_code = qr_url
        
        db.commit()
        
        # Log QR upload
        log_audit(
            db=db,
            admin_id=1,  # TODO: Get from JWT token
            action=AuditAction.UPLOAD_QR,
            details={
                "qr_type": qr_type,
                "filename": file.filename,
                "url": qr_url
            },
            ip_address=request.client.host if request and request.client else None,
            user_agent=request.headers.get("user-agent", None) if request else None
        )
        db.refresh(settings)
        
        return {
            "message": f"{qr_type.capitalize()} QR code uploaded successfully",
            "url": qr_url,
            "qr_type": qr_type
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@router.get("/qr/{qr_type}")
async def get_qr_code(
    qr_type: str,
    db: Session = Depends(get_db)
):
    """
    Get QR code image (individual or bulk) - Admin only
    """
    if qr_type not in ["individual", "bulk"]:
        raise HTTPException(status_code=400, detail="Invalid QR type. Use 'individual' or 'bulk'")
    
    settings = db.query(Settings).first()
    if not settings:
        raise HTTPException(status_code=404, detail="Settings not found")
    
    # Get QR URL from database
    qr_url = settings.individual_qr_code if qr_type == "individual" else settings.bulk_qr_code
    
    if not qr_url:
        raise HTTPException(status_code=404, detail=f"{qr_type.capitalize()} QR code not uploaded yet")
    
    try:
        # Fetch image from Cloudinary
        async with httpx.AsyncClient() as client:
            response = await client.get(qr_url)
            response.raise_for_status()
            
            # Determine content type from Cloudinary URL
            content_type = "image/png"
            if ".jpg" in qr_url or ".jpeg" in qr_url:
                content_type = "image/jpeg"
            elif ".svg" in qr_url:
                content_type = "image/svg+xml"
            
            return StreamingResponse(
                BytesIO(response.content),
                media_type=content_type,
                headers={
                    "Cache-Control": "public, max-age=3600",
                    "Content-Disposition": f"inline; filename={qr_type}_qr.png"
                }
            )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch QR code: {str(e)}")
