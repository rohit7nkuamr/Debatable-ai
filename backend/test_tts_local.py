
import asyncio
import os
from services.tts_service import tts_service

async def test_tts():
    print("Testing TTS generation...")
    try:
        path = await tts_service.generate_speech("Hello, this is a test of the emergency broadcast system.", "aristotle")
        print(f"Success! Audio generated at: {path}")
        
        # Check if file exists
        full_path = os.path.join(os.getcwd(), path.lstrip('/'))
        if os.path.exists(full_path):
             print(f"File exists at {full_path}")
             print(f"File size: {os.path.getsize(full_path)} bytes")
        else:
             print(f"ERROR: File not found at {full_path}")
             
    except Exception as e:
        print(f"Failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_tts())
