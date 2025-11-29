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

cloudinary.config(
    cloud_name=CLOUDINARY_CLOUD_NAME,
    api_key=CLOUDINARY_API_KEY,
    api_secret=CLOUDINARY_API_SECRET
)

# Folder names in Cloudinary
PAYMENT_FOLDER = "event-tickets/payments"
QR_FOLDER = "event-tickets/qr-codes"


async def initialize_storage_buckets():
    print("✅ Cloudinary is configured and ready")
    return True


async def upload_payment_screenshot(file_content: bytes, filename: str) -> Optional[str]:
    try:
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
        
        return result.get("secure_url")
        
    except Exception as e:
        print(f"❌ Failed to upload payment screenshot: {str(e)}")
        return None


async def upload_qr_code(file_path: str, serial_code: str) -> Optional[str]:
    try:
        result = cloudinary.uploader.upload(
            file_path,
            folder=QR_FOLDER,
            public_id=serial_code,
            resource_type="image",
            format="png"
        )
        
        return result.get("secure_url")
        
    except Exception as e:
        print(f"❌ Failed to upload QR code: {str(e)}")
        return None


def delete_payment_screenshot(file_url: str) -> bool:
    try:
        parts = file_url.split("/")
        upload_idx = parts.index("upload")
        public_id_parts = parts[upload_idx + 2:]
        public_id = "/".join(public_id_parts).split(".")[0]
        
        cloudinary.uploader.destroy(f"{PAYMENT_FOLDER}/{public_id}")
        
        return True
        
    except Exception as e:
        print(f"❌ Failed to delete payment screenshot: {str(e)}")
        return False


def delete_qr_code(file_url: str) -> bool:
    try:
        parts = file_url.split("/")
        upload_idx = parts.index("upload")
        public_id_parts = parts[upload_idx + 2:]
        public_id = "/".join(public_id_parts).split(".")[0]
        
        cloudinary.uploader.destroy(f"{QR_FOLDER}/{public_id}")
        
        return True
        
    except Exception as e:
        print(f"❌ Failed to delete QR code: {str(e)}")
        return False
