

import requests
import json
try:
    print("Sending request...")
    r = requests.post("http://localhost:8001/api/tts/generate", json={"text": "test", "agent_id": "aristotle"})
    print(f"Status: {r.status_code}")
    data = r.json()
    url = data['audio_url']
    full_url = "http://localhost:8001" + url
    print(f"Fetching: {full_url}")
    r2 = requests.get(full_url)
    print(f"File Status: {r2.status_code}")
    print(f"File Size: {len(r2.content)}")
    if r2.status_code == 200 and len(r2.content) > 0:
        print("SUCCESS: Audio file server working")
    else:
        print("FAILURE: Could not fetch audio file")
except Exception as e:
    print(f"Error: {e}")

