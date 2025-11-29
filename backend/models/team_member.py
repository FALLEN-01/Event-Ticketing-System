"""
Team Member model - Normalized team member storage
Replaces the JSON 'members' field in Registration table
"""
from sqlalchemy import Column, Integer, String, ForeignKey
from database import Base


class TeamMember(Base):
    """
    Team Members table - stores individual team member details
    For bulk registrations, this replaces the JSON array in Registration.members
    """
    __tablename__ = "team_members"
    
    id = Column(Integer, primary_key=True, index=True)
    registration_id = Column(Integer, ForeignKey("registrations.id"), nullable=False)
    
    # Member Information
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=True)  # Optional
    phone = Column(String(20), nullable=True)  # Optional
    
    # Position in team (0 = leader, 1-4 = members)
    position = Column(Integer, default=0, nullable=False)
