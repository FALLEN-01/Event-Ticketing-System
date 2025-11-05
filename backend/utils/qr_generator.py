import qrcode
from PIL import Image, ImageDraw, ImageFont
import os
from pathlib import Path
import tempfile
from utils.storage import upload_qr_code


async def generate_ticket_qr(serial_code: str, name: str, email: str) -> str:
    """
    Generate a QR code for a ticket and upload to Supabase Storage
    
    Args:
        serial_code: Unique serial code for the ticket
        name: Name of the ticket holder
        email: Email of the ticket holder
    
    Returns:
        str: Public URL of the uploaded QR code image
    """
    # Create QR code data (JSON format for easy parsing by scanner)
    qr_data = f'{{"serial_code":"{serial_code}","name":"{name}","email":"{email}"}}'
    
    # Generate QR code
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=4,
    )
    qr.add_data(qr_data)
    qr.make(fit=True)
    
    # Create QR code image
    qr_img = qr.make_image(fill_color="black", back_color="white")
    
    # Create a larger image with text
    final_img = Image.new('RGB', (400, 500), 'white')
    
    # Paste QR code
    qr_img = qr_img.resize((350, 350))
    final_img.paste(qr_img, (25, 25))
    
    # Add text below QR code
    draw = ImageDraw.Draw(final_img)
    
    # Try to use a nice font, fallback to default
    try:
        font_large = ImageFont.truetype("arial.ttf", 20)
        font_small = ImageFont.truetype("arial.ttf", 14)
    except:
        font_large = ImageFont.load_default()
        font_small = ImageFont.load_default()
    
    # Add serial code
    text_serial = f"Serial: {serial_code}"
    draw.text((200, 390), text_serial, fill="black", font=font_large, anchor="mm")
    
    # Add name
    # Truncate name if too long
    display_name = name if len(name) <= 30 else name[:27] + "..."
    draw.text((200, 420), display_name, fill="black", font=font_small, anchor="mm")
    
    # Add ticket text
    draw.text((200, 445), "EVENT TICKET", fill="green", font=font_small, anchor="mm")
    draw.text((200, 465), "Keep this QR code safe!", fill="gray", font=font_small, anchor="mm")
    
    # Save to temporary file
    with tempfile.NamedTemporaryFile(mode='wb', suffix='.png', delete=False) as tmp_file:
        tmp_filepath = tmp_file.name
        final_img.save(tmp_filepath)
    
    # Upload to Supabase Storage
    public_url = await upload_qr_code(tmp_filepath, serial_code)
    
    # Delete temporary file (upload_qr_code also deletes it, but just in case)
    if os.path.exists(tmp_filepath):
        os.remove(tmp_filepath)
    
    return public_url


def verify_qr_exists(filepath: str) -> bool:
    """
    Check if a QR code file exists
    
    Args:
        filepath: Path to the QR code file
    
    Returns:
        bool: True if file exists, False otherwise
    """
    return os.path.exists(filepath)


def delete_qr_code(filepath: str) -> bool:
    """
    Delete a QR code file
    
    Args:
        filepath: Path to the QR code file
    
    Returns:
        bool: True if deleted successfully, False otherwise
    """
    try:
        if os.path.exists(filepath):
            os.remove(filepath)
            return True
        return False
    except Exception:
        return False
