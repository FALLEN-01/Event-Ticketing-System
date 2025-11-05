"""
Supabase Storage utilities for file uploads
Handles payment screenshots and QR code uploads
"""
import os
from typing import Optional
from supabase import create_client, Client
from dotenv import load_dotenv
import uuid

load_dotenv()

# Initialize Supabase client
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Bucket names - using existing screenshots bucket for both
PAYMENT_BUCKET = "screenshots"
QR_BUCKET = "screenshots"


async def upload_payment_screenshot(file_content: bytes, filename: str) -> Optional[str]:
    """
    Upload payment screenshot to Supabase Storage
    
    Args:
        file_content: File bytes
        filename: Original filename with extension
        
    Returns:
        Public URL of the uploaded file or None if failed
    """
    try:
        # Generate unique filename with payment prefix
        file_ext = os.path.splitext(filename)[1]
        unique_filename = f"payments/{uuid.uuid4()}{file_ext}"
        
        # Upload to Supabase Storage
        result = supabase.storage.from_(PAYMENT_BUCKET).upload(
            path=unique_filename,
            file=file_content,
            file_options={"content-type": f"image/{file_ext[1:]}"}
        )
        
        # Get public URL
        public_url = supabase.storage.from_(PAYMENT_BUCKET).get_public_url(unique_filename)
        
        return public_url
        
    except Exception as e:
        print(f"❌ Failed to upload payment screenshot: {str(e)}")
        return None


async def upload_qr_code(file_path: str, serial_code: str) -> Optional[str]:
    """
    Upload QR code image to Supabase Storage
    
    Args:
        file_path: Local path to QR code file
        serial_code: Serial code for naming
        
    Returns:
        Public URL of the uploaded file or None if failed
    """
    try:
        # Read file content
        with open(file_path, "rb") as f:
            file_content = f.read()
        
        # Upload to Supabase Storage with qr-codes prefix
        filename = f"qr-codes/{serial_code}.png"
        result = supabase.storage.from_(QR_BUCKET).upload(
            path=filename,
            file=file_content,
            file_options={"content-type": "image/png"}
        )
        
        # Get public URL
        public_url = supabase.storage.from_(QR_BUCKET).get_public_url(filename)
        
        # Delete local file after successful upload
        if os.path.exists(file_path):
            os.remove(file_path)
        
        return public_url
        
    except Exception as e:
        print(f"❌ Failed to upload QR code: {str(e)}")
        return None


def delete_payment_screenshot(file_url: str) -> bool:
    """
    Delete payment screenshot from Supabase Storage
    
    Args:
        file_url: Public URL of the file
        
    Returns:
        True if deleted successfully, False otherwise
    """
    try:
        # Extract filename from URL
        filename = file_url.split("/")[-1]
        
        # Delete from Supabase Storage
        supabase.storage.from_(PAYMENT_BUCKET).remove([filename])
        
        return True
        
    except Exception as e:
        print(f"❌ Failed to delete payment screenshot: {str(e)}")
        return False


def delete_qr_code(file_url: str) -> bool:
    """
    Delete QR code from Supabase Storage
    
    Args:
        file_url: Public URL of the file
        
    Returns:
        True if deleted successfully, False otherwise
    """
    try:
        # Extract filename from URL
        filename = file_url.split("/")[-1]
        
        # Delete from Supabase Storage
        supabase.storage.from_(QR_BUCKET).remove([filename])
        
        return True
        
    except Exception as e:
        print(f"❌ Failed to delete QR code: {str(e)}")
        return False


async def initialize_storage_buckets():
    """
    Verify Supabase Storage bucket configuration
    Note: Bucket must be created manually in Supabase dashboard
    """
    print(f"✅ Storage configured to use bucket: '{PAYMENT_BUCKET}'")
    print(f"   📁 Payment screenshots: {PAYMENT_BUCKET}/payments/")
    print(f"   📁 QR codes: {PAYMENT_BUCKET}/qr-codes/")
    print(f"   ⚠️  Make sure bucket exists in Supabase dashboard with Public=true")
