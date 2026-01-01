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
    model: str = Field(default="llama-3.1-70b-versatile", description="LLM model to use")
    system_prompt: Optional[str] = Field(None, description="Custom system prompt")


class AgentResponse(BaseModel):
    """Agent data response"""
    id: str
    name: str
    personality: AgentPersonality
    description: Optional[str]
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
    ai_agent_id: str = Field(..., description="ID of the AI agent to debate against")
    judge_type: str = Field(default="ai", description="'ai' or 'human'")


class DebateResponse(BaseModel):
    """Debate session data"""
    id: str
    topic: str
    status: str  # "active", "completed", "cancelled"
    human_name: str
    ai_name: str
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
