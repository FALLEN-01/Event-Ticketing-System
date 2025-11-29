"""
Database table creation script
Creates all tables for the event ticketing system and default admin user
"""
from database import Base, engine, SessionLocal
from models.registration import (
    Registration,
    Payment,
    Ticket,
    Message,
    Admin,
    AuditLog,
    AdminRole
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

def create_admin_user():
    """Create default admin user"""
    db = SessionLocal()
    try:
        print("\n👤 Creating default admin user...")
        
        # Check if admin already exists
        existing_admin = db.query(Admin).filter(Admin.email == "admin@event.com").first()
        
        if existing_admin:
            print("⚠️  Admin user already exists")
            print(f"   Email: {existing_admin.email}")
            return
        
        # Create new admin user
        admin = Admin(
            username="admin",
            email="admin@event.com",
            password_hash=Admin.hash_password("admin123"),
            name="Admin User",
            role=AdminRole.SUPERADMIN,
            is_active=True
        )
        
        db.add(admin)
        db.commit()
        db.refresh(admin)
        
        print("✅ Admin user created successfully!")
        print(f"   Email: {admin.email}")
        print(f"   Password: admin123")
        print(f"   Name: {admin.name}")
        print(f"   Role: {admin.role.value}")
        
    except Exception as e:
        print(f"❌ Error creating admin user: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_tables()
    create_admin_user()
    print("\n" + "="*50)
    print("✅ Database setup complete!")
    print("="*50)
    print("\n🔐 Login credentials:")
    print("   Email: admin@event.com")
    print("   Password: admin123")
    print()
