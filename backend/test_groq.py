"""Quick test script for Groq API"""
import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

api_key = os.getenv("GROQ_API_KEY")
print(f"API Key: {api_key[:15]}..." if api_key else "No API key found!")

if api_key:
    client = Groq(api_key=api_key)
    
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": "Say hello and confirm you are working!"}
            ],
            temperature=0.7,
            max_tokens=100,
        )
        print("✅ SUCCESS!")
        print(f"Response: {response.choices[0].message.content}")
    except Exception as e:
        print(f"❌ ERROR: {type(e).__name__}: {e}")
else:
    print("❌ No API key configured!")
