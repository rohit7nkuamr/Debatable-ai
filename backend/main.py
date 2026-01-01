"""
Debateable AI Backend - Main Application
FastAPI server with Groq LLM integration for debate AI agents
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv
from fastapi.staticfiles import StaticFiles

# Load environment variables
load_dotenv()

# Import routers
from routers import agents, debates, videos, judge
from routers.tts import router as tts_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle management"""
    # Startup
    print("🚀 Starting Debateable AI Backend...")
    print(f"📡 Groq API: {'Configured' if os.getenv('GROQ_API_KEY') else 'Not configured'}")
    yield
    # Shutdown
    print("👋 Shutting down Debateable AI Backend...")

# Create FastAPI app
app = FastAPI(
    title="Debateable AI API",
    description="Backend API for the Debateable AI platform - Create AI debate agents, host debates, and more",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Configuration
origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(agents.router, prefix="/api/agents", tags=["Agents"])
app.include_router(debates.router, prefix="/api/debates", tags=["Debates"])
app.include_router(videos.router, prefix="/api/videos", tags=["Videos"])
app.include_router(judge.router, prefix="/api/judge", tags=["Judge"])
app.include_router(tts_router, prefix="/api/tts", tags=["TTS"])

# Mount static files for audio
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "online",
        "service": "Debateable AI API",
        "version": "1.0.0",
        "endpoints": {
            "agents": "/api/agents",
            "debates": "/api/debates",
            "videos": "/api/videos",
            "judge": "/api/judge",
        }
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "groq_configured": bool(os.getenv("GROQ_API_KEY")),
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", 8000)),
        reload=os.getenv("DEBUG", "true").lower() == "true"
    )
