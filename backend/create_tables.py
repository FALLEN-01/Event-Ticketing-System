"""
Database table creation script
Creates all tables for the event ticketing system
"""
from database import Base, engine
from models.registration import (
    Registration,
    Payment,
    Ticket,
    Message,
    Admin,
    AuditLog
)

def create_tables():
    """Create all database tables"""
    print("🔧 Creating database tables...")
    
    try:
        # Drop all existing tables first (clean slate)
        print("⚠️  Dropping existing tables...")
        Base.metadata.drop_all(bind=engine)
        print("✅ Existing tables dropped")
        
        # Create all tables from models
        print("📦 Creating new tables...")
        Base.metadata.create_all(bind=engine)
        
        print("\n✅ Database tables created successfully!")
        print("\n📋 Created tables:")
        print("  1. registrations - Main registration data")
        print("  2. payments - Payment records with screenshot URLs")
        print("  3. tickets - Generated QR code tickets")
        print("  4. messages - Email/notification logs")
        print("  5. admins - Admin user accounts")
        print("  6. audit_logs - Admin action tracking")
        
    except Exception as e:
        print(f"\n❌ Error creating tables: {str(e)}")
        raise

if __name__ == "__main__":
    create_tables()
