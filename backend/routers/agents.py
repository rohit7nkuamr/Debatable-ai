"""
Agents Router - CRUD operations for AI debate agents
"""

from fastapi import APIRouter, HTTPException, UploadFile, File
from typing import List, Optional
from datetime import datetime
import uuid

from models.schemas import AgentCreate, AgentResponse, AgentExport, AgentPersonality

router = APIRouter()

# In-memory storage (replace with database in production)
agents_db: dict = {}


@router.post("/", response_model=AgentResponse)
async def create_agent(agent: AgentCreate):
    """Create a new AI debate agent"""
    agent_id = str(uuid.uuid4())
    
    new_agent = {
        "id": agent_id,
        "name": agent.name,
        "personality": agent.personality,
        "description": agent.description,
        "model": agent.model,
        "system_prompt": agent.system_prompt,
        "created_at": datetime.utcnow(),
        "document_count": 0,
        "documents": [],
    }
    
    agents_db[agent_id] = new_agent
    
    return AgentResponse(
        id=agent_id,
        name=agent.name,
        personality=agent.personality,
        description=agent.description,
        model=agent.model,
        created_at=new_agent["created_at"],
        document_count=0,
    )


@router.get("/", response_model=List[AgentResponse])
async def list_agents():
    """List all agents"""
    return [
        AgentResponse(
            id=a["id"],
            name=a["name"],
            personality=a["personality"],
            description=a.get("description"),
            model=a["model"],
            created_at=a["created_at"],
            document_count=a.get("document_count", 0),
        )
        for a in agents_db.values()
    ]


@router.get("/{agent_id}", response_model=AgentResponse)
async def get_agent(agent_id: str):
    """Get a specific agent by ID"""
    if agent_id not in agents_db:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    a = agents_db[agent_id]
    return AgentResponse(
        id=a["id"],
        name=a["name"],
        personality=a["personality"],
        description=a.get("description"),
        model=a["model"],
        created_at=a["created_at"],
        document_count=a.get("document_count", 0),
    )


@router.delete("/{agent_id}")
async def delete_agent(agent_id: str):
    """Delete an agent"""
    if agent_id not in agents_db:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    del agents_db[agent_id]
    return {"message": "Agent deleted successfully"}


@router.post("/{agent_id}/documents")
async def upload_document(agent_id: str, file: UploadFile = File(...)):
    """Upload a document to train the agent"""
    if agent_id not in agents_db:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    # TODO: Process document with LangChain and store in ChromaDB
    content = await file.read()
    
    doc_id = str(uuid.uuid4())
    agents_db[agent_id]["documents"].append({
        "id": doc_id,
        "filename": file.filename,
        "size": len(content),
        "uploaded_at": datetime.utcnow(),
    })
    agents_db[agent_id]["document_count"] += 1
    
    return {
        "document_id": doc_id,
        "filename": file.filename,
        "status": "processing",
        "message": "Document uploaded and being processed"
    }


@router.post("/{agent_id}/export", response_model=AgentExport)
async def export_agent(agent_id: str):
    """Export agent for external use (portable AI agent)"""
    if agent_id not in agents_db:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    agent = agents_db[agent_id]
    
    # Generate temporary API key and embed code
    temp_api_key = f"deb_{uuid.uuid4().hex[:24]}"
    expires_at = datetime.utcnow()  # Add proper expiration
    
    embed_code = f"""<!-- Debateable AI Agent Embed -->
<script src="https://debateable.ai/embed.js"></script>
<div id="debateable-agent" 
     data-agent-id="{agent_id}"
     data-api-key="{temp_api_key}"
     data-theme="dark">
</div>
<script>
  Debateable.init({{
    agentId: '{agent_id}',
    apiKey: '{temp_api_key}',
    onMessage: (msg) => console.log('Agent:', msg),
    onError: (err) => console.error('Error:', err)
  }});
</script>"""

    usage_instructions = f"""
# Using Your Portable AI Agent: {agent["name"]}

## Option 1: Embed on Website
Copy and paste the embed code into your HTML.

## Option 2: API Integration
```bash
curl -X POST https://api.debateable.ai/v1/agents/{agent_id}/debate \\
  -H "Authorization: Bearer {temp_api_key}" \\
  -H "Content-Type: application/json" \\
  -d '{{"message": "Your debate topic or argument"}}'
```

## Option 3: Record External Debate
Use our mobile app to record debates with this agent in your own studio.
Upload the recording to share on the platform.
"""

    return AgentExport(
        agent_id=agent_id,
        embed_code=embed_code,
        api_key=temp_api_key,
        expires_at=expires_at,
        usage_instructions=usage_instructions
    )


# Create some default agents
def init_default_agents():
    """Initialize default AI agents"""
    defaults = [
        {"name": "Aristotle", "personality": AgentPersonality.PHILOSOPHICAL, "description": "Classical philosopher focused on ethics and logic"},
        {"name": "Socrates", "personality": AgentPersonality.SOCRATIC, "description": "Master of questioning and dialogue"},
        {"name": "Darwin", "personality": AgentPersonality.SCIENTIFIC, "description": "Evidence-based scientific debater"},
    ]
    
    for d in defaults:
        agent_id = str(uuid.uuid4())
        agents_db[agent_id] = {
            "id": agent_id,
            "name": d["name"],
            "personality": d["personality"],
            "description": d["description"],
            "model": "llama-3.3-70b-versatile",
            "created_at": datetime.utcnow(),
            "document_count": 0,
            "documents": [],
        }

# Initialize on import
init_default_agents()
