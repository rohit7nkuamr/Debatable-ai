
import edge_tts
import asyncio
import os
import uuid
from pathlib import Path
import logging

# Configure logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Voice mapping for default agents
VOICE_MAPPING = {
    "aristotle": "en-GB-RyanNeural",
    "socrates": "en-US-ChristopherNeural",
    "darwin": "en-AU-WilliamNeural",
    "chanakya": "hi-IN-MadhurNeural",
    "default": "en-US-AriaNeural"
}

# Curated list of high-quality voices for user selection
AVAILABLE_VOICES = [
    {"id": "en-US-AriaNeural", "name": "Aria (US Female)", "lang": "en-US", "gender": "Female"},
    {"id": "en-US-ChristopherNeural", "name": "Christopher (US Male)", "lang": "en-US", "gender": "Male"},
    {"id": "en-US-GuyNeural", "name": "Guy (US Male)", "lang": "en-US", "gender": "Male"},
    {"id": "en-US-JennyNeural", "name": "Jenny (US Female)", "lang": "en-US", "gender": "Female"},
    
    {"id": "en-GB-SoniaNeural", "name": "Sonia (UK Female)", "lang": "en-GB", "gender": "Female"},
    {"id": "en-GB-RyanNeural", "name": "Ryan (UK Male)", "lang": "en-GB", "gender": "Male"},
    
    {"id": "en-AU-NatashaNeural", "name": "Natasha (AU Female)", "lang": "en-AU", "gender": "Female"},
    {"id": "en-AU-WilliamNeural", "name": "William (AU Male)", "lang": "en-AU", "gender": "Male"},

    {"id": "hi-IN-SwaraNeural", "name": "Swara (Hindi Female)", "lang": "hi-IN", "gender": "Female"},
    {"id": "hi-IN-MadhurNeural", "name": "Madhur (Hindi Male)", "lang": "hi-IN", "gender": "Male"},
]

class TTSService:
    def __init__(self, static_dir: str = "static/audio"):
        self.static_dir = Path(static_dir)
        self.static_dir.mkdir(parents=True, exist_ok=True)

    def get_available_voices(self):
        """Returns the list of available voices."""
        return AVAILABLE_VOICES

    async def generate_speech(self, text: str, agent_id: str, voice_id: str = None) -> str:
        """
        Generates MP3 audio from text using edge-tts.
        Returns the relative path to the audio file.
        """
        try:
            # Determine voice: 
            # 1. Use explicit voice_id if provided
            # 2. Check if agent has a hardcoded mapping
            # 3. Fallback to default
            if voice_id:
                voice = voice_id
            else:
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
