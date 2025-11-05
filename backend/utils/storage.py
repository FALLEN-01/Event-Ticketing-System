import os
from typing import Optional
from dotenv import load_dotenv
import cloudinary
import cloudinary.uploader
import cloudinary.api
import uuid
from io import BytesIO

load_dotenv()

# Configure Cloudinary
CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME")
CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY")
CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET")

print(f"DEBUG: Cloudinary Config - Cloud Name: {CLOUDINARY_CLOUD_NAME}, API Key: {CLOUDINARY_API_KEY[:10] if CLOUDINARY_API_KEY else 'None'}...")

cloudinary.config(
    cloud_name=CLOUDINARY_CLOUD_NAME,
    api_key=CLOUDINARY_API_KEY,
    api_secret=CLOUDINARY_API_SECRET
)

# Folder names in Cloudinary
PAYMENT_FOLDER = "event-tickets/payments"
QR_FOLDER = "event-tickets/qr-codes"


async def initialize_storage_buckets():
    """
    Initialize Cloudinary folders (no action needed, folders are created on upload)
    This function is kept for compatibility with the existing startup flow
    """
    print("✅ Cloudinary is configured and ready (folders will be created on first upload)")
    return True


async def upload_payment_screenshot(file_content: bytes, filename: str) -> Optional[str]:
    """
    Upload payment screenshot to Cloudinary
    
    Args:
        file_content: File bytes
        filename: Original filename with extension
        
    Returns:
        Public URL of the uploaded file or None if failed
    """
    try:
        # Generate unique public_id
        file_ext = os.path.splitext(filename)[1].lower().replace('.', '')
        unique_id = f"{uuid.uuid4()}"
        
        # Upload to Cloudinary
        result = cloudinary.uploader.upload(
            BytesIO(file_content),
            folder=PAYMENT_FOLDER,
            public_id=unique_id,
            resource_type="image",
            format=file_ext if file_ext in ['jpg', 'jpeg', 'png', 'gif', 'webp'] else 'jpg'
        )
        
        # Return secure URL
        return result.get("secure_url")
        
    except Exception as e:
        print(f"❌ Failed to upload payment screenshot to Cloudinary: {str(e)}")
        print(f"DEBUG: Cloud name configured: {CLOUDINARY_CLOUD_NAME}")
        import traceback
        traceback.print_exc()
        return None


async def upload_qr_code(file_path: str, serial_code: str) -> Optional[str]:
    """
    Upload QR code image to Cloudinary
    
    Args:
        file_path: Local path to QR code file
        serial_code: Serial code for naming
        
    Returns:
        Public URL of the uploaded file or None if failed
    """
    try:
        # Upload to Cloudinary with serial_code as public_id
        result = cloudinary.uploader.upload(
            file_path,
            folder=QR_FOLDER,
            public_id=serial_code,
            resource_type="image",
            format="png"
        )
        
        # Return secure URL
        return result.get("secure_url")
        
    except Exception as e:
        print(f"❌ Failed to upload QR code to Cloudinary: {str(e)}")
        return None


def delete_payment_screenshot(file_url: str) -> bool:
    """
    Delete payment screenshot from Cloudinary
    
    Args:
        file_url: Public URL of the file
        
    Returns:
        True if deleted successfully, False otherwise
    """
    try:
        # Extract public_id from Cloudinary URL
        # URL format: https://res.cloudinary.com/root/image/upload/v1234567890/event-tickets/payments/uuid.jpg
        parts = file_url.split("/")
        # Find the folder and filename parts after 'upload/'
        upload_idx = parts.index("upload")
        public_id_parts = parts[upload_idx + 2:]  # Skip version number
        public_id = "/".join(public_id_parts).split(".")[0]  # Remove extension
        
        # Delete from Cloudinary
        cloudinary.uploader.destroy(f"{PAYMENT_FOLDER}/{public_id}")
        
        return True
        
    except Exception as e:
        print(f"❌ Failed to delete payment screenshot from Cloudinary: {str(e)}")
        return False


def delete_qr_code(file_url: str) -> bool:
    """
    Delete QR code from Cloudinary
    
    Args:
        file_url: Public URL of the file
        
    Returns:
        True if deleted successfully, False otherwise
    """
    try:
        # Extract public_id from Cloudinary URL
        parts = file_url.split("/")
        upload_idx = parts.index("upload")
        public_id_parts = parts[upload_idx + 2:]
        public_id = "/".join(public_id_parts).split(".")[0]
        
        # Delete from Cloudinary
        cloudinary.uploader.destroy(f"{QR_FOLDER}/{public_id}")
        
        return True
        
    except Exception as e:
        print(f"❌ Failed to delete QR code from Cloudinary: {str(e)}")
        return False
