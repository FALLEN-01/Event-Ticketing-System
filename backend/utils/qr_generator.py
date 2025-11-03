"""
QR Code generation utility
"""
import qrcode
from pathlib import Path


def generate_ticket_qr(registration_id: int, email: str) -> str:
    """
    Generate QR code for event ticket
    
    Args:
        registration_id: Database ID of registration
        email: User's email address
    
    Returns:
        Path to saved QR code image
    """
    # Create QR data (can be encrypted/signed in production)
    qr_data = f"TICKET:{registration_id}:{email}"
    
    # Generate QR code
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=4,
    )
    qr.add_data(qr_data)
    qr.make(fit=True)
    
    # Create image
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Save to file
    qr_dir = Path("static/qr_codes")
    qr_dir.mkdir(parents=True, exist_ok=True)
    
    filename = f"ticket_{registration_id}.png"
    filepath = qr_dir / filename
    
    img.save(filepath)
    
    return str(filepath)


def verify_qr_code(qr_data: str) -> dict:
    """
    Verify and parse QR code data
    
    Args:
        qr_data: Scanned QR code string
    
    Returns:
        Dictionary with registration_id and email
    """
    try:
        parts = qr_data.split(":")
        if parts[0] != "TICKET" or len(parts) != 3:
            return {"valid": False, "error": "Invalid QR format"}
        
        return {
            "valid": True,
            "registration_id": int(parts[1]),
            "email": parts[2]
        }
    except Exception as e:
        return {"valid": False, "error": str(e)}
