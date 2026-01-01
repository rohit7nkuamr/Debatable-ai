
import edge_tts
import asyncio
import os
import uuid
from pathlib import Path
import logging

# Configure logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Voice mapping for agents
VOICE_MAPPING = {
    "aristotle": "en-GB-RyanNeural",  # Distinguished British male
    "socrates": "en-US-ChristopherNeural", # Thoughtful American male
    "darwin": "en-AU-WilliamNeural", # Australian male
    "chanakya": "hi-IN-MadhurNeural", # Hindi male (Madhur)
    "default": "en-US-AriaNeural" # Generic female
}

class TTSService:
    def __init__(self, static_dir: str = "static/audio"):
        self.static_dir = Path(static_dir)
        self.static_dir.mkdir(parents=True, exist_ok=True)

    async def generate_speech(self, text: str, agent_id: str) -> str:
        """
        Generates MP3 audio from text using edge-tts.
        Returns the relative path to the audio file.
        """
        try:
            voice = VOICE_MAPPING.get(agent_id.lower(), VOICE_MAPPING["default"])
            
            # Create a unique filename
            filename = f"{agent_id}_{uuid.uuid4().hex[:8]}.mp3"
            output_path = self.static_dir / filename
            
            # Generate audio
            communicate = edge_tts.Communicate(text, voice)
            await communicate.save(str(output_path))
            
            logger.info(f"Generated TTS for {agent_id}: {output_path}")
            
            # Return path relative to the static mount
            return f"/static/audio/{filename}"
            
        except Exception as e:
            logger.error(f"Error generating TTS: {str(e)}")
            raise

# Singleton instance
tts_service = TTSService()
