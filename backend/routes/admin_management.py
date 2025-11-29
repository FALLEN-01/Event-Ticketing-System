"""
Admin management routes - CRUD operations for admin users
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime

from database import get_db
from models.registration import Admin, AdminRole, AuditLog
from utils.audit import log_audit, AuditAction

router = APIRouter(prefix="/api/admin/admins", tags=["Admin Management"])


class AdminCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    name: str
    role: str = "reviewer"  # Options: superadmin, staff, reviewer


class AdminUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    name: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None


class AdminResponse(BaseModel):
    id: int
    username: str
    email: str
    name: str
    role: str
    is_active: bool
    created_at: datetime
    last_login: Optional[datetime]

    class Config:
        from_attributes = True


@router.get("", response_model=List[AdminResponse])
def get_all_admins(db: Session = Depends(get_db)):
    """Get all admin users"""
    admins = db.query(Admin).order_by(Admin.created_at.desc()).all()
    return admins


@router.post("", response_model=AdminResponse, status_code=status.HTTP_201_CREATED)
def create_admin(
    admin_data: AdminCreate,
    db: Session = Depends(get_db)
):
    """Create a new admin user"""
    
    # Check if email already exists
    if db.query(Admin).filter(Admin.email == admin_data.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check if username already exists
    if db.query(Admin).filter(Admin.username == admin_data.username).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    # Validate role
    try:
        role = AdminRole(admin_data.role.lower())
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role. Use 'superadmin', 'staff', or 'reviewer'"
        )
    
    # Create new admin (use email as username)
    new_admin = Admin(
        username=admin_data.email.split('@')[0],  # Use email prefix as username
        email=admin_data.email,
        password_hash=Admin.hash_password(admin_data.password),
        name=admin_data.name,
        role=role,
        is_active=True
    )
    
    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)
    
    # Log admin creation
    log_audit(
        db=db,
        admin_id=1,  # TODO: Get from JWT token
        action=AuditAction.CREATE_ADMIN,
        details={
            "new_admin_id": new_admin.id,
            "email": new_admin.email,
            "name": new_admin.name,
            "role": new_admin.role.value
        },
        ip_address=None,  # Add Request param if needed
        user_agent=None
    )
    
    return new_admin


@router.get("/{admin_id}", response_model=AdminResponse)
def get_admin(admin_id: int, db: Session = Depends(get_db)):
    """Get admin by ID"""
    admin = db.query(Admin).filter(Admin.id == admin_id).first()
    
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin not found"
        )
    
    return admin


@router.put("/{admin_id}", response_model=AdminResponse)
def update_admin(
    admin_id: int,
    admin_data: AdminUpdate,
    db: Session = Depends(get_db)
):
    """Update admin user"""
    admin = db.query(Admin).filter(Admin.id == admin_id).first()
    
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin not found"
        )
    
    # Update fields if provided (username is auto-generated from email, not user-editable)
    if admin_data.email is not None:
        # Check if new email is taken
        existing = db.query(Admin).filter(
            Admin.email == admin_data.email,
            Admin.id != admin_id
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        admin.email = admin_data.email
    
    if admin_data.password is not None:
        admin.password_hash = Admin.hash_password(admin_data.password)
    
    if admin_data.name is not None:
        admin.name = admin_data.name
    
    if admin_data.role is not None:
        try:
            admin.role = AdminRole(admin_data.role.lower())
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid role. Use 'superadmin', 'staff', or 'reviewer'"
            )
    
    if admin_data.is_active is not None:
        admin.is_active = admin_data.is_active
    
    db.commit()
    db.refresh(admin)
    
    # Log admin update
    changes = {}
    if admin_data.email: changes["email"] = admin_data.email
    if admin_data.name: changes["name"] = admin_data.name
    if admin_data.role: changes["role"] = admin_data.role
    if admin_data.password: changes["password"] = "changed"
    
    log_audit(
        db=db,
        admin_id=1,  # TODO: Get from JWT token
        action=AuditAction.UPDATE_ADMIN,
        details={
            "target_admin_id": admin_id,
            "changes": changes
        },
        ip_address=None,
        user_agent=None
    )
    
    return admin


@router.delete("/{admin_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_admin(admin_id: int, db: Session = Depends(get_db)):
    """Delete admin user"""
    admin = db.query(Admin).filter(Admin.id == admin_id).first()
    
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin not found"
        )
    
    # Prevent deleting the last superadmin
    if admin.role == AdminRole.SUPERADMIN:
        superadmin_count = db.query(Admin).filter(
            Admin.role == AdminRole.SUPERADMIN,
            Admin.is_active == True
        ).count()
        
        if superadmin_count <= 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete the last superadmin"
            )
    
    # Log admin deletion before actually deleting
    log_audit(
        db=db,
        admin_id=1,  # TODO: Get from JWT token
        action=AuditAction.DELETE_ADMIN,
        details={
            "deleted_admin_id": admin_id,
            "email": admin.email,
            "name": admin.name,
            "role": admin.role.value
        },
        ip_address=None,
        user_agent=None
    )
    
    db.delete(admin)
    db.commit()
    
    return None
