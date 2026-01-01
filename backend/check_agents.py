
import requests
import json

try:
    print("Fetching agents...")
    r = requests.get("http://localhost:8001/api/agents")
    print(f"Status: {r.status_code}")
    if r.status_code == 200:
        agents = r.json()
        print(f"Found {len(agents)} agents:")
        found_chanakya = False
        for a in agents:
            print(f"- {a['name']} ({a['id']})")
            if a['name'] == "Chanakya":
                found_chanakya = True
        
        if found_chanakya:
            print("SUCCESS: Chanakya found in list")
        else:
            print("FAILURE: Chanakya NOT found in list")
    else:
        print(f"Error Body: {r.text}")
except Exception as e:
    print(f"Error: {e}")
