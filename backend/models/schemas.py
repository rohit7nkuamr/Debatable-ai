"""
Pydantic models for API request/response schemas
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class AgentPersonality(str, Enum):
    PHILOSOPHICAL = "philosophical"
    SCIENTIFIC = "scientific"
    DEVIL_ADVOCATE = "devils_advocate"
    BALANCED = "balanced"
    AGGRESSIVE = "aggressive"
    SOCRATIC = "socratic"
    STRATEGIC = "strategic"


class DebateRole(str, Enum):
    HUMAN = "human"
    AI = "ai"
    JUDGE = "judge"


# ============ AGENT SCHEMAS ============

class AgentCreate(BaseModel):
    """Request to create a new AI agent"""
    name: str = Field(..., min_length=1, max_length=50, description="Agent name")
    personality: AgentPersonality = Field(default=AgentPersonality.BALANCED)
    description: Optional[str] = Field(None, max_length=500)
    voice_id: Optional[str] = Field(None, description="Voice ID from tts_service")
    model: str = Field(default="llama-3.1-70b-versatile", description="LLM model to use")
    system_prompt: Optional[str] = Field(None, description="Custom system prompt")


class AgentResponse(BaseModel):
    """Agent data response"""
    id: str
    name: str
    personality: AgentPersonality
    description: Optional[str]
    voice_id: Optional[str] = None
    model: str
    created_at: datetime
    document_count: int = 0
    embed_code: Optional[str] = None  # For portable agent embedding


class AgentExport(BaseModel):
    """Portable agent export data"""
    agent_id: str
    embed_code: str
    api_key: str  # Temporary API key for external use
    expires_at: datetime
    usage_instructions: str


# ============ DEBATE SCHEMAS ============

class DebateMessage(BaseModel):
    """A single message in the debate"""
    id: str
    sender: DebateRole
    sender_name: str
    content: str
    timestamp: datetime
    score: Optional[int] = None


class DebateCreate(BaseModel):
    """Request to start a new debate"""
    topic: str = Field(..., min_length=5, max_length=200)
    human_name: str = Field(default="You")
    ai_agent_id: str = Field(..., description="ID of the first AI agent")
    secondary_agent_id: Optional[str] = Field(None, description="ID of the second AI agent (for AI vs AI)")
    mode: str = Field(default="one_vs_one", description="'one_vs_one' or 'ai_vs_ai'")
    judge_type: str = Field(default="ai", description="'ai' or 'human'")


class DebateResponse(BaseModel):
    """Debate session data"""
    id: str
    topic: str
    status: str  # "active", "completed", "cancelled"
    human_name: str
    ai_name: str
    mode: str = "one_vs_one"
    secondary_ai_name: Optional[str] = None
    human_score: int = 0
    ai_score: int = 0
    winner: Optional[str] = None
    messages: List[DebateMessage] = []
    created_at: datetime


class DebateMessageSend(BaseModel):
    """Send a message in an active debate"""
    debate_id: str
    message: str = Field(..., min_length=1, max_length=2000)


class AIResponse(BaseModel):
    """AI agent's response"""
    message: DebateMessage
    thinking: Optional[str] = None  # AI's reasoning (optional display)


# ============ JUDGE SCHEMAS ============

class JudgeVerdict(BaseModel):
    """Judge's scoring and verdict"""
    logic_score: int = Field(..., ge=0, le=30)
    evidence_score: int = Field(..., ge=0, le=25)
    relevance_score: int = Field(..., ge=0, le=20)
    persuasion_score: int = Field(..., ge=0, le=15)
    rebuttal_score: int = Field(..., ge=0, le=10)
    total_score: int
    commentary: str
    point_awarded_to: DebateRole


class DebateResult(BaseModel):
    """Final debate result"""
    debate_id: str
    winner: str
    human_final_score: int
    ai_final_score: int
    final_verdict: str
    highlights: List[str]


# ============ VIDEO SCHEMAS ============

class VideoUpload(BaseModel):
    """Video upload metadata"""
    title: str = Field(..., min_length=5, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    topic: str
    human_debater: str
    ai_agent_id: str
    is_live: bool = Field(default=False)


class VideoResponse(BaseModel):
    """Video data response"""
    id: str
    title: str
    description: Optional[str]
    thumbnail_url: Optional[str]
    video_url: Optional[str]
    duration: str
    views: int
    likes: int
    created_at: datetime
    is_live: bool
    human_debater: str
    ai_name: str
    winner: Optional[str]


# ============ DOCUMENT SCHEMAS ============

class DocumentUpload(BaseModel):
    """Document upload for agent training"""
    agent_id: str
    filename: str
    content_type: str


class DocumentResponse(BaseModel):
    """Uploaded document info"""
    id: str
    agent_id: str
    filename: str
    status: str  # "processing", "ready", "error"
    chunk_count: int = 0
    uploaded_at: datetime
    
# ============ AUTH SCHEMAS ============

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class UserBase(BaseModel):
    email: str  # Pydantic 2.x EmailStr requires installation, using str for simplicity or add import
    full_name: Optional[str] = None
    tier: str = "free" # "free" or "pro"

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email:  str
    password: str

class User(UserBase):
    id: str
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Simple list of agent IDs owned by user
    # In a real db, this would be a relationship, handled by from_attributes
    # agents: List[str] = [] 

    class Config:
        from_attributes = True
