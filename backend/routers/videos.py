"""
Videos Router - Video upload and management for recorded debates
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import List, Optional
from datetime import datetime
import uuid

from models.schemas import VideoUpload, VideoResponse

router = APIRouter()

# In-memory video storage
videos_db: dict = {}


@router.post("/upload")
async def upload_video(
    title: str = Form(...),
    description: Optional[str] = Form(None),
    topic: str = Form(...),
    human_debater: str = Form(...),
    ai_agent_id: str = Form(...),
    video: UploadFile = File(...)
):
    """Upload a recorded debate video"""
    
    video_id = str(uuid.uuid4())
    
    # Save video file (in production, upload to cloud storage)
    content = await video.read()
    video_path = f"./uploads/{video_id}_{video.filename}"
    
    # Create video record
    new_video = {
        "id": video_id,
        "title": title,
        "description": description,
        "topic": topic,
        "thumbnail_url": None,  # Generate thumbnail in production
        "video_url": video_path,
        "duration": "00:00",  # Calculate from video in production
        "views": 0,
        "likes": 0,
        "created_at": datetime.utcnow(),
        "is_live": False,
        "human_debater": human_debater,
        "ai_agent_id": ai_agent_id,
        "ai_name": "AI Debater",  # Look up from agents_db
        "winner": None,
        "status": "processing",
    }
    
    videos_db[video_id] = new_video
    
    return {
        "video_id": video_id,
        "status": "processing",
        "message": "Video uploaded successfully. Processing will complete shortly."
    }


@router.get("/", response_model=List[VideoResponse])
async def list_videos(
    limit: int = 20,
    offset: int = 0,
    filter: Optional[str] = None
):
    """List all videos with optional filtering"""
    
    videos = list(videos_db.values())
    
    # Apply filter
    if filter == "live":
        videos = [v for v in videos if v["is_live"]]
    elif filter == "popular":
        videos = sorted(videos, key=lambda x: x["views"], reverse=True)
    elif filter == "recent":
        videos = sorted(videos, key=lambda x: x["created_at"], reverse=True)
    
    # Paginate
    videos = videos[offset:offset + limit]
    
    return [
        VideoResponse(
            id=v["id"],
            title=v["title"],
            description=v.get("description"),
            thumbnail_url=v.get("thumbnail_url"),
            video_url=v.get("video_url"),
            duration=v.get("duration", "00:00"),
            views=v.get("views", 0),
            likes=v.get("likes", 0),
            created_at=v["created_at"],
            is_live=v.get("is_live", False),
            human_debater=v.get("human_debater", "Human"),
            ai_name=v.get("ai_name", "AI"),
            winner=v.get("winner"),
        )
        for v in videos
    ]


@router.get("/{video_id}", response_model=VideoResponse)
async def get_video(video_id: str):
    """Get a specific video"""
    if video_id not in videos_db:
        raise HTTPException(status_code=404, detail="Video not found")
    
    v = videos_db[video_id]
    v["views"] += 1  # Increment view count
    
    return VideoResponse(
        id=v["id"],
        title=v["title"],
        description=v.get("description"),
        thumbnail_url=v.get("thumbnail_url"),
        video_url=v.get("video_url"),
        duration=v.get("duration", "00:00"),
        views=v["views"],
        likes=v.get("likes", 0),
        created_at=v["created_at"],
        is_live=v.get("is_live", False),
        human_debater=v.get("human_debater", "Human"),
        ai_name=v.get("ai_name", "AI"),
        winner=v.get("winner"),
    )


@router.post("/{video_id}/like")
async def like_video(video_id: str):
    """Like a video"""
    if video_id not in videos_db:
        raise HTTPException(status_code=404, detail="Video not found")
    
    videos_db[video_id]["likes"] += 1
    return {"likes": videos_db[video_id]["likes"]}


@router.post("/live/start")
async def start_live_stream(
    title: str = Form(...),
    topic: str = Form(...),
    human_debater: str = Form(...),
    ai_agent_id: str = Form(...)
):
    """Start a live debate stream"""
    
    stream_id = str(uuid.uuid4())
    
    new_stream = {
        "id": stream_id,
        "title": f"🔴 LIVE: {title}",
        "description": None,
        "topic": topic,
        "thumbnail_url": None,
        "video_url": None,
        "duration": "LIVE",
        "views": 0,
        "likes": 0,
        "created_at": datetime.utcnow(),
        "is_live": True,
        "human_debater": human_debater,
        "ai_agent_id": ai_agent_id,
        "ai_name": "AI Debater",
        "winner": None,
        "stream_key": f"sk_{uuid.uuid4().hex[:16]}",
    }
    
    videos_db[stream_id] = new_stream
    
    return {
        "stream_id": stream_id,
        "stream_key": new_stream["stream_key"],
        "rtmp_url": f"rtmp://stream.samvad.ai/live/{stream_id}",
        "playback_url": f"https://samvad.ai/watch/{stream_id}",
        "message": "Live stream created. Use the stream key to broadcast."
    }


@router.post("/live/{stream_id}/end")
async def end_live_stream(stream_id: str, winner: Optional[str] = None):
    """End a live stream"""
    if stream_id not in videos_db:
        raise HTTPException(status_code=404, detail="Stream not found")
    
    videos_db[stream_id]["is_live"] = False
    videos_db[stream_id]["duration"] = "Ended"
    if winner:
        videos_db[stream_id]["winner"] = winner
    
    return {"message": "Live stream ended", "video_id": stream_id}
