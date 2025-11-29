"""
Database table creation script
Creates all tables for the event ticketing system and default admin user
"""
from database import Base, engine, SessionLocal
from models.registration import (
    Registration,
    Payment,
    Ticket,
    Attendance,
    Message,
    Admin,
    AuditLog,
    AdminRole
)
from models.settings import (
    Settings,
    EventConfig,
    PricingConfig,
    PaymentConfig,
    OrganizationConfig,
    EmailTemplateConfig
)
from models.team_member import TeamMember

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
        print("\n📋 Core Tables (Active):")
        print("  1. registrations - Main registration data")
        print("  2. team_members - Team member details (normalized)")
        print("  3. payments - Payment records (no redundant payment_type)")
        print("  4. tickets - Generated QR code tickets")
        print("  5. attendance - Check-in/check-out tracking")
        print("  6. messages - Email/notification logs")
        print("  7. admins - Admin user accounts")
        print("  8. audit_logs - Admin action tracking")
        print("  9. settings - Event configuration (legacy)")
        print("\n📋 Normalized Config Tables (Future):")
        print("  10. event_config - Event-specific settings")
        print("  11. pricing_config - Pricing configuration")
        print("  12. payment_config - Payment method settings")
        print("  13. organization_config - Organization details")
        print("  14. email_template_config - Email template settings")
        print("\n✨ Total: 14 tables (9 active + 5 normalized config tables)")
        
    except Exception as e:
        print(f"\n❌ Error creating tables: {str(e)}")
        raise

def create_admin_user():
    """Create default admin user"""
    db = SessionLocal()
    try:
        print("\n👤 Creating default admin user...")
        
        # Check if admin already exists
        existing_admin = db.query(Admin).filter(Admin.email == "admin@gmail.com").first()
        
        if existing_admin:
            print("⚠️  Admin user already exists")
            print(f"   Email: {existing_admin.email}")
            return
        
        # Create new admin user
        admin = Admin(
            username="admin",
            email="admin@gmail.com",
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
    print("   Email: admin@gmail.com")
    print("   Password: admin123")
    print()
