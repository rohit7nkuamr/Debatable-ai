
import requests
import json
import uuid

API_URL = "http://localhost:8001"

def test_upload():
    # 1. Create a dummy test file
    filename = "test_knowledge.txt"
    content = "Samvad AI is a platform for debating with artificial intelligence agents. It allows users to watch debates, upload videos, and create custom agents."
    
    with open(filename, "w") as f:
        f.write(content)
        
    # 2. Get an agent (using the first one available)
    print("Fetching agents...")
    response = requests.get(f"{API_URL}/api/agents")
    agents = response.json()
    
    if not agents:
        print("No agents found to test upload.")
        return

    agent_id = agents[0]["id"]
    agent_name = agents[0]["name"]
    print(f"Testing upload for Agent: {agent_name} ({agent_id})")
    
    # 3. Upload the file
    print("Uploading document...")
    with open(filename, "rb") as f:
        files = {"file": (filename, f, "text/plain")}
        upload_res = requests.post(f"{API_URL}/api/agents/{agent_id}/documents", files=files)
    
    print(f"Status Code: {upload_res.status_code}")
    print(f"Response: {upload_res.json()}")
    
    if upload_res.status_code == 200:
        print("✅ Document Upload Test Passed!")
    else:
        print("❌ Document Upload Test Failed.")

if __name__ == "__main__":
    test_upload()
