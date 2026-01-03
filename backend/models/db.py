from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    email = Column(String, unique=True, index=True)
    full_name = Column(String, nullable=True)
    hashed_password = Column(String)
    tier = Column(String, default="free")  # "free", "pro"
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    agents = relationship("Agent", back_populates="owner")

class Agent(Base):
    __tablename__ = "agents"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    name = Column(String, index=True)
    personality = Column(String)
    description = Column(String, nullable=True)
    voice_id = Column(String, nullable=True)
    model = Column(String, default="llama3-70b-8192")
    system_prompt = Column(Text, nullable=True)
    
    owner_id = Column(String, ForeignKey("users.id"), nullable=True) # Nullable for default agents
    owner = relationship("User", back_populates="agents")
    
    document_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_public = Column(Boolean, default=False)
