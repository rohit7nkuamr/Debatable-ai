"""Test the backend API to verify Groq is being used"""
import httpx
import time

BASE = "http://localhost:8000"

print("1. Creating debate...")
resp = httpx.post(f"{BASE}/api/debates/", json={
    "topic": "Should AI have rights?",
    "human_name": "Tester",
    "ai_agent_id": "aristotle"
}, timeout=30.0, follow_redirects=True)
print(f"   Status: {resp.status_code}")
data = resp.json()
debate_id = data.get("id")
print(f"   Debate ID: {debate_id}")

if debate_id:
    print("\n2. Sending message to trigger Groq...")
    resp2 = httpx.post(f"{BASE}/api/debates/{debate_id}/message", json={
        "debate_id": debate_id,
        "message": "Tell me specifically about Aristotle's view on the virtue of moderation in all things."
    }, timeout=30.0, follow_redirects=True)
    print(f"   Status: {resp2.status_code}")
    msg_data = resp2.json()
    
    print(f"   Full response: {msg_data}")
    
    ai_response = msg_data.get("message", {})
    content = ai_response.get("content", "")
    
    print(f"\n3. AI Response:")
    print(f"   {content}")
    
    # Check if it's a real response by looking for contextual content
    if "Aristotle" in content or "virtue" in content or "moderation" in content:
        print("\n✅ REAL AI RESPONSE! Contains contextual content about Aristotle/virtue/moderation")
    else:
        print("\n❌ MOCK RESPONSE - generic template detected")
else:
    print("Failed to create debate")
