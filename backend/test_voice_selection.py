
import requests
import json
import time

API_URL = "http://localhost:8001/api"

def test_voice_selection():
    print("Testing Voice Selection Feature...")
    
    # 1. List Voices
    print("\n1. Fetching available voices...")
    try:
        response = requests.get(f"{API_URL}/agents/voices")
        response.raise_for_status()
        voices = response.json()
        print(f"Success! Found {len(voices)} voices.")
        print(f"Sample voice: {voices[0]['name']} ({voices[0]['id']})")
    except Exception as e:
        print(f"FAILED to list voices: {e}")
        return

    # 2. Create Agent with Specific Voice
    print("\n2. Creating agent with 'en-GB-RyanNeural' (British)...")
    agent_data = {
        "name": "Sir Winston",
        "personality": "strategic",
        "description": "A British statesman",
        "voice_id": "en-GB-RyanNeural"
    }
    
    try:
        response = requests.post(f"{API_URL}/agents/", json=agent_data)
        response.raise_for_status()
        agent = response.json()
        print(f"Agent created: {agent['name']} (ID: {agent['id']})")
        
        if agent.get("voice_id") == "en-GB-RyanNeural":
            print("Verified: Agent has correct voice_id.")
        else:
            print(f"FAILED: Agent voice_id mismatch. Got {agent.get('voice_id')}")
            return
            
        test_agent_id = agent['id']
    except Exception as e:
        print(f"FAILED to create agent: {e}")
        return

    # 3. Test TTS Generation
    print(f"\n3. Generating Speech for {agent['name']}...")
    try:
        tts_data = {
            "text": "We shall fight on the beaches!",
            "agent_id": test_agent_id
        }
        res = requests.post(f"{API_URL}/tts/generate", json=tts_data)
        res.raise_for_status()
        audio_url = res.json().get("audio_url")
        print(f"Success! Audio generated at: {audio_url}")
    except Exception as e:
        print(f"FAILED to generate TTS: {e}")

if __name__ == "__main__":
    test_voice_selection()
