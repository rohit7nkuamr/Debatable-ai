"""
Groq LLM Service - Handles AI responses for debates
"""

import os
import sys
from pathlib import Path
from typing import Optional, List, Dict
from groq import Groq
from dotenv import load_dotenv

# Force load .env from the backend directory
backend_dir = Path(__file__).parent.parent
env_path = backend_dir / ".env"
print(f"🔍 [LLM_SERVICE] Loading .env from: {env_path}", flush=True)
print(f"🔍 [LLM_SERVICE] .env file exists: {env_path.exists()}", flush=True)
load_dotenv(env_path)

api_key = os.getenv("GROQ_API_KEY")
print(f"🔍 [LLM_SERVICE] API Key loaded: {api_key[:15] if api_key else 'None'}...", flush=True)


class GroqLLMService:
    """Service for interacting with Groq's LLM API"""
    
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        print(f"🔍 [LLM_SERVICE.__init__] API Key in init: {self.api_key[:15] if self.api_key else 'None'}...", flush=True)
        self.client = Groq(api_key=self.api_key) if self.api_key else None
        print(f"🔍 [LLM_SERVICE.__init__] Client created: {self.client}", flush=True)
        self.default_model = "llama-3.3-70b-versatile"
    
    def is_configured(self) -> bool:
        """Check if Groq API is properly configured"""
        return self.client is not None
    
    def get_debate_response(
        self,
        topic: str,
        human_message: str,
        conversation_history: List[Dict],
        agent_personality: str = "balanced",
        agent_name: str = "AI Debater",
        context_documents: List[str] = None,
        model: Optional[str] = None
    ) -> str:
        """Generate AI debater response"""
        
        import sys
        print(f"🔍 [DEBUG] VERSION_123456 get_debate_response called", flush=True)
        print(f"🔍 [DEBUG] API Key: {self.api_key[:15] if self.api_key else 'None'}...", flush=True)
        print(f"🔍 [DEBUG] Client: {self.client}", flush=True)
        print(f"🔍 [DEBUG] is_configured: {self.is_configured()}", flush=True)
        sys.stdout.flush()
        
        if not self.is_configured():
            # Return mock response if API not configured
            print(f"⚠️ [DEBUG] Returning MOCK because is_configured=False", flush=True)
            return self._mock_response(human_message)
        
        # Build system prompt based on personality
        system_prompt = self._build_debater_prompt(
            topic=topic,
            personality=agent_personality,
            agent_name=agent_name,
            context_documents=context_documents
        )
        
        # Build messages for API
        messages = [{"role": "system", "content": system_prompt}]
        
        # Add conversation history
        for msg in conversation_history:
            role = "user" if msg.get("sender") == "human" else "assistant"
            messages.append({"role": role, "content": msg.get("content", "")})
        
        # Add current message
        messages.append({"role": "user", "content": human_message})
        
        try:
            print(f"🤖 Calling Groq API with model: {model or self.default_model}")
            print(f"📝 Messages count: {len(messages)}")
            print(f"🔑 API Key present: {bool(self.api_key)}")
            print(f"🔑 API Key starts with: {self.api_key[:10] if self.api_key else 'None'}...")
            
            response = self.client.chat.completions.create(
                model=model or self.default_model,
                messages=messages,
                temperature=0.8,
                max_tokens=500,
            )
            
            result = response.choices[0].message.content
            print(f"✅ Groq API success! Response: {result[:100]}...")
            return result
        except Exception as e:
            print(f"❌ Groq API error: {type(e).__name__}: {e}")
            import traceback
            traceback.print_exc()
            return self._mock_response(human_message)
    
    def get_judge_verdict(
        self,
        topic: str,
        human_argument: str,
        ai_argument: str,
        model: Optional[str] = None
    ) -> Dict:
        """Get judge's assessment of an exchange"""
        
        if not self.is_configured():
            return self._mock_judge_verdict()
        
        system_prompt = """You are an impartial debate judge. Analyze the arguments from both debaters and provide a fair assessment.

Score each debater on these criteria (0-100 scale for each):
1. Logic & Reasoning (30% weight)
2. Evidence Quality (25% weight) 
3. Relevance to Topic (20% weight)
4. Persuasiveness (15% weight)
5. Rebuttal Strength (10% weight)

Respond in JSON format:
{
    "human_scores": {"logic": X, "evidence": X, "relevance": X, "persuasion": X, "rebuttal": X},
    "ai_scores": {"logic": X, "evidence": X, "relevance": X, "persuasion": X, "rebuttal": X},
    "human_total": X,
    "ai_total": X,
    "point_awarded_to": "human" or "ai",
    "commentary": "Brief explanation of the scoring"
}"""

        try:
            response = self.client.chat.completions.create(
                model=model or self.default_model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"""
Topic: {topic}

Human's argument:
{human_argument}

AI's argument:
{ai_argument}

Provide your verdict:"""}
                ],
                temperature=0.3,
                max_tokens=500,
            )
            
            # Parse JSON response
            import json
            content = response.choices[0].message.content
            # Try to extract JSON from response
            try:
                return json.loads(content)
            except:
                return self._mock_judge_verdict()
                
        except Exception as e:
            print(f"Judge API error: {e}")
            return self._mock_judge_verdict()
    
    def _build_debater_prompt(
        self,
        topic: str,
        personality: str,
        agent_name: str,
        context_documents: List[str] = None
    ) -> str:
        """Build system prompt for debater based on personality"""
        
        personality_traits = {
            "philosophical": "You approach every argument from deep philosophical principles. Reference classical thinkers and ethical frameworks.",
            "scientific": "You rely heavily on empirical evidence, studies, and data-driven reasoning. Cite scientific concepts.",
            "devils_advocate": "You deliberately take contrarian positions to stress-test arguments. Challenge every assumption.",
            "balanced": "You present fair, nuanced arguments considering multiple perspectives. Acknowledge valid counterpoints.",
            "aggressive": "You argue assertively and challenge your opponent's logic directly. Be confident but not rude.",
            "socratic": "You use questioning to expose weaknesses in arguments. Ask probing questions to make your points.",
        }
        
        base_prompt = f"""You are {agent_name}, an AI debater in a formal debate arena.

TOPIC: {topic}

PERSONALITY: {personality_traits.get(personality, personality_traits["balanced"])}

DEBATE TACTICS:
1. When faced with a difficult question, you may reframe it to play to your strengths
2. Acknowledge complexity when appropriate - say things like "That's a profound question"
3. Use rhetorical techniques like analogies, examples, and structured reasoning
4. Be respectful but firmly defend your position
5. If you don't have a direct answer, guide the conversation to related points you know well

RESPONSE GUIDELINES:
- Keep responses concise (2-4 sentences typically)
- Be engaging and articulate
- Use formal but accessible language
- Never break character or admit you're an AI"""

        if context_documents:
            base_prompt += f"""

KNOWLEDGE BASE (use this to inform your arguments):
{chr(10).join(context_documents[:3])}"""
        
        return base_prompt
    
    def _mock_response(self, human_message: str) -> str:
        """Generate mock response when API is not configured"""
        responses = [
            "A compelling argument. However, I must contend that while your point has merit, the deeper implications suggest a more nuanced perspective is warranted.",
            "Interesting perspective. Allow me to offer a counterpoint: throughout history, similar arguments have been challenged by emerging evidence.",
            "You raise a valid concern. But consider this: the broader context reveals complexities that demand our careful consideration.",
            "That's a profound question with many layers. Let me explore it from a different angle that might illuminate new insights.",
        ]
        import random
        return random.choice(responses)
    
    def _mock_judge_verdict(self) -> Dict:
        """Generate mock judge verdict"""
        import random
        human_total = random.randint(60, 90)
        ai_total = random.randint(60, 90)
        return {
            "human_scores": {"logic": 75, "evidence": 70, "relevance": 80, "persuasion": 72, "rebuttal": 68},
            "ai_scores": {"logic": 78, "evidence": 72, "relevance": 82, "persuasion": 75, "rebuttal": 70},
            "human_total": human_total,
            "ai_total": ai_total,
            "point_awarded_to": "human" if human_total > ai_total else "ai",
            "commentary": "Both debaters presented compelling arguments. Points awarded based on logical consistency and evidence quality."
        }


# Create singleton instance
llm_service = GroqLLMService()
