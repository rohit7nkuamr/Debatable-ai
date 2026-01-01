"""
Debates Router - Manage live debates and debate sessions
"""

from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime
import uuid
import logging

# Setup logging
logger = logging.getLogger("debates")
logger.setLevel(logging.DEBUG)

from models.schemas import (
    DebateCreate, DebateResponse, DebateMessage, 
    DebateMessageSend, AIResponse, DebateRole
)
from services.llm_service import llm_service
from routers.agents import agents_db

router = APIRouter()

# In-memory debate storage
debates_db: dict = {}


@router.post("/", response_model=DebateResponse)
async def create_debate(debate: DebateCreate):
    """Start a new debate session"""
    
    # Get the AI agent
    agent = None
    for a in agents_db.values():
        if a["id"] == debate.ai_agent_id or a["name"].lower() == debate.ai_agent_id.lower():
            agent = a
            break
    
    if not agent:
        # Use default agent if not found
        agent = {"name": "Aristotle", "personality": "balanced", "model": "llama-3.3-70b-versatile"}
    
    debate_id = str(uuid.uuid4())
    
    # Create opening message from judge
    opening_message = DebateMessage(
        id=str(uuid.uuid4()),
        sender=DebateRole.JUDGE,
        sender_name="Judge Themis",
        content=f'Welcome to the Debate Arena! Today\'s topic: "{debate.topic}". Let the battle of minds begin!',
        timestamp=datetime.utcnow()
    )
    
    new_debate = {
        "id": debate_id,
        "topic": debate.topic,
        "status": "active",
        "human_name": debate.human_name,
        "ai_name": agent["name"],
        "ai_agent": agent,
        "human_score": 0,
        "ai_score": 0,
        "winner": None,
        "messages": [opening_message],
        "created_at": datetime.utcnow(),
    }
    
    debates_db[debate_id] = new_debate
    
    return DebateResponse(
        id=debate_id,
        topic=debate.topic,
        status="active",
        human_name=debate.human_name,
        ai_name=agent["name"],
        human_score=0,
        ai_score=0,
        winner=None,
        messages=[opening_message],
        created_at=new_debate["created_at"],
    )


@router.get("/", response_model=List[DebateResponse])
async def list_debates():
    """List all debates"""
    return [
        DebateResponse(
            id=d["id"],
            topic=d["topic"],
            status=d["status"],
            human_name=d["human_name"],
            ai_name=d["ai_name"],
            human_score=d["human_score"],
            ai_score=d["ai_score"],
            winner=d.get("winner"),
            messages=d["messages"],
            created_at=d["created_at"],
        )
        for d in debates_db.values()
    ]


@router.get("/{debate_id}", response_model=DebateResponse)
async def get_debate(debate_id: str):
    """Get a specific debate"""
    if debate_id not in debates_db:
        raise HTTPException(status_code=404, detail="Debate not found")
    
    d = debates_db[debate_id]
    return DebateResponse(
        id=d["id"],
        topic=d["topic"],
        status=d["status"],
        human_name=d["human_name"],
        ai_name=d["ai_name"],
        human_score=d["human_score"],
        ai_score=d["ai_score"],
        winner=d.get("winner"),
        messages=d["messages"],
        created_at=d["created_at"],
    )


@router.post("/{debate_id}/message", response_model=AIResponse)
async def send_message(debate_id: str, message_data: DebateMessageSend):
    """Send a message in an active debate and get AI response"""
    
    if debate_id not in debates_db:
        raise HTTPException(status_code=404, detail="Debate not found")
    
    debate = debates_db[debate_id]
    
    if debate["status"] != "active":
        raise HTTPException(status_code=400, detail="Debate is not active")
    
    # Add human message
    human_message = DebateMessage(
        id=str(uuid.uuid4()),
        sender=DebateRole.HUMAN,
        sender_name=debate["human_name"],
        content=message_data.message,
        timestamp=datetime.utcnow()
    )
    debate["messages"].append(human_message)
    
    # Get AI response
    conversation_history = [
        {"sender": m.sender.value, "content": m.content}
        for m in debate["messages"][:-1]  # Exclude current message
    ]
    
    agent = debate.get("ai_agent", {})
    
    print(f"🔍 [DEBATES_ROUTER] About to call llm_service.get_debate_response", flush=True)
    print(f"🔍 [DEBATES_ROUTER] llm_service = {llm_service}", flush=True)
    print(f"🔍 [DEBATES_ROUTER] llm_service.is_configured() = {llm_service.is_configured()}", flush=True)
    
    ai_content = llm_service.get_debate_response(
        topic=debate["topic"],
        human_message=message_data.message,
        conversation_history=conversation_history,
        agent_personality=agent.get("personality", "balanced"),
        agent_name=debate["ai_name"],
        model=agent.get("model"),
    )
    
    print(f"🔍 [DEBATES_ROUTER] Got response: {ai_content[:50]}...", flush=True)
    
    ai_message = DebateMessage(
        id=str(uuid.uuid4()),
        sender=DebateRole.AI,
        sender_name=debate["ai_name"],
        content=ai_content,
        timestamp=datetime.utcnow()
    )
    debate["messages"].append(ai_message)
    
    # Get judge scoring for this exchange
    verdict = llm_service.get_judge_verdict(
        topic=debate["topic"],
        human_argument=message_data.message,
        ai_argument=ai_content
    )
    
    # Update scores
    if verdict.get("point_awarded_to") == "human":
        debate["human_score"] += 10
    else:
        debate["ai_score"] += 10
    
    return AIResponse(
        message=ai_message,
        thinking=None
    )


@router.post("/{debate_id}/end")
async def end_debate(debate_id: str):
    """End a debate and determine winner"""
    
    if debate_id not in debates_db:
        raise HTTPException(status_code=404, detail="Debate not found")
    
    debate = debates_db[debate_id]
    debate["status"] = "completed"
    
    if debate["human_score"] > debate["ai_score"]:
        debate["winner"] = "human"
    elif debate["ai_score"] > debate["human_score"]:
        debate["winner"] = "ai"
    else:
        debate["winner"] = "draw"
    
    return {
        "message": "Debate ended",
        "winner": debate["winner"],
        "human_score": debate["human_score"],
        "ai_score": debate["ai_score"],
    }
