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
        "secondary_ai_agent": None,
        "secondary_ai_name": None,
        "mode": debate.mode,
        "human_score": 0,
        "ai_score": 0,
        "winner": None,
        "messages": [opening_message],
        "created_at": datetime.utcnow(),
    }
    
    if debate.mode == "ai_vs_ai" and debate.secondary_agent_id:
        secondary = None
        for a in agents_db.values():
            if a["id"] == debate.secondary_agent_id or a["name"].lower() == debate.secondary_agent_id.lower():
                secondary = a
                break
        if secondary:
            new_debate["secondary_ai_agent"] = secondary
            new_debate["secondary_ai_name"] = secondary["name"]
    
    debates_db[debate_id] = new_debate
    
    return DebateResponse(
        id=debate_id,
        topic=debate.topic,
        status="active",
        human_name=debate.human_name,
        ai_name=agent["name"],
        secondary_ai_name=new_debate["secondary_ai_name"],
        mode=new_debate["mode"],
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
        secondary_ai_name=d.get("secondary_ai_name"),
        mode=d.get("mode", "one_vs_one"),
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
    logger.debug(f"About to call llm_service.get_debate_response")
    logger.debug(f"llm_service is_configured: {llm_service.is_configured()}")
    
    ai_content = llm_service.get_debate_response(
        topic=debate["topic"],
        human_message=message_data.message,
        conversation_history=conversation_history,
        agent_personality=agent.get("personality", "balanced"),
        agent_name=debate["ai_name"],
        model=agent.get("model"),
    )
    
    logger.debug(f"Got response: {ai_content[:50]}...")
    
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


@router.post("/{debate_id}/trigger_ai_turn", response_model=AIResponse)
async def trigger_ai_turn(debate_id: str):
    """Trigger the next AI turn in an AI vs AI debate"""
    
    if debate_id not in debates_db:
        raise HTTPException(status_code=404, detail="Debate not found")
    
    debate = debates_db[debate_id]
    
    if debate["status"] != "active":
        raise HTTPException(status_code=400, detail="Debate is not active")

    if debate.get("mode") != "ai_vs_ai":
        raise HTTPException(status_code=400, detail="This endpoint is for AI vs AI debates only")

    # Determine whose turn it is
    last_message = debate["messages"][-1]
    
    # Defaults
    current_agent = debate["ai_agent"]
    current_agent_name = debate["ai_name"]
    opponent_name = debate["secondary_ai_name"]
    last_content = last_message.content
    
    # If last sender was Agent 1, then it's Agent 2's turn
    if last_message.sender_name == debate["ai_name"]:
        current_agent = debate["secondary_ai_agent"]
        current_agent_name = debate["secondary_ai_name"]
        opponent_name = debate["ai_name"]
    
    # If last message was from Judge, Agent 1 starts
    # (Default setup above handles this implicitly if we treat Judge like an 'other')
    
    # Build history
    conversation_history = [
        {"sender": "assistant" if m.sender_name == current_agent_name else "user", "content": m.content}
        for m in debate["messages"]
    ]
    
    logger.debug(f"Triggering turn for {current_agent_name} against {opponent_name}")
    
    ai_content = llm_service.get_debate_response(
        topic=debate["topic"],
        human_message=last_content, # In AI vs AI, the previous AI's message is the 'prompt'
        conversation_history=conversation_history,
        agent_personality=current_agent.get("personality", "balanced"),
        agent_name=current_agent_name,
        model=current_agent.get("model"),
    )
    
    ai_message = DebateMessage(
        id=str(uuid.uuid4()),
        sender=DebateRole.AI,
        sender_name=current_agent_name,
        content=ai_content,
        timestamp=datetime.utcnow()
    )
    
    debate["messages"].append(ai_message)
    
    # Judge scoring (simplified: just award points to current speaker for now, or random)
    # Real implementation would evaluate the argument quality
    
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
