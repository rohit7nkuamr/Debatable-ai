
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from services.tts_service import tts_service
import os
import logging

router = APIRouter(
    tags=["tts"]
)

logger = logging.getLogger(__name__)

class TTSRequest(BaseModel):
    text: str
    agent_id: str = "aristotle"

class TTSResponse(BaseModel):
    audio_url: str

@router.post("/generate", response_model=TTSResponse)
async def generate_speech(request: TTSRequest):
    """
    Generate audio from text for a specific agent.
    """
    if not request.text:
        raise HTTPException(status_code=400, detail="Text is required")
    
    try:
        audio_url = await tts_service.generate_speech(request.text, request.agent_id)
        # Construct full URL if needed, but relative path works if static is mounted
        # For localhost:3000 -> localhost:8000 access, we might need full URL if on different ports, 
        # but usually <audio src="/api/..." /> or src="http://localhost:8000/..."
        # We will return the relative path from the backend root, expecting frontend to prepend API_BASE
        
        # Actually, let's return the full path if we knew the host, but here we'll return the path 
        # that needs to be appended to the backend content URL. 
        # Since static is mounted at /static, the url is /static/audio/...
        
        return TTSResponse(audio_url=audio_url)
    except Exception as e:
        logger.error(f"TTS generation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
