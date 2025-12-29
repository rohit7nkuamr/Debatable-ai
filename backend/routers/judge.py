"""
Judge Router - AI judge verdicts and scoring
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

from models.schemas import JudgeVerdict, DebateResult
from services.llm_service import llm_service

router = APIRouter()


class ScoreRequest(BaseModel):
    topic: str
    human_argument: str
    ai_argument: str


class FinalVerdictRequest(BaseModel):
    debate_id: str
    human_arguments: List[str]
    ai_arguments: List[str]
    topic: str


@router.post("/score", response_model=JudgeVerdict)
async def score_exchange(request: ScoreRequest):
    """Score a single exchange between debaters"""
    
    verdict = llm_service.get_judge_verdict(
        topic=request.topic,
        human_argument=request.human_argument,
        ai_argument=request.ai_argument
    )
    
    human_scores = verdict.get("human_scores", {})
    ai_scores = verdict.get("ai_scores", {})
    
    return JudgeVerdict(
        logic_score=human_scores.get("logic", 75),
        evidence_score=human_scores.get("evidence", 70),
        relevance_score=human_scores.get("relevance", 80),
        persuasion_score=human_scores.get("persuasion", 72),
        rebuttal_score=human_scores.get("rebuttal", 68),
        total_score=verdict.get("human_total", 75),
        commentary=verdict.get("commentary", "Fair exchange from both sides."),
        point_awarded_to=verdict.get("point_awarded_to", "human")
    )


@router.post("/final-verdict", response_model=DebateResult)
async def get_final_verdict(request: FinalVerdictRequest):
    """Get the final verdict for a completed debate"""
    
    # Aggregate all arguments
    human_combined = "\n\n".join(request.human_arguments)
    ai_combined = "\n\n".join(request.ai_arguments)
    
    # Get comprehensive verdict
    verdict = llm_service.get_judge_verdict(
        topic=request.topic,
        human_argument=human_combined,
        ai_argument=ai_combined
    )
    
    human_score = verdict.get("human_total", 75)
    ai_score = verdict.get("ai_total", 78)
    
    if human_score > ai_score:
        winner = "human"
    elif ai_score > human_score:
        winner = "ai"
    else:
        winner = "draw"
    
    return DebateResult(
        debate_id=request.debate_id,
        winner=winner,
        human_final_score=human_score,
        ai_final_score=ai_score,
        final_verdict=verdict.get("commentary", "An excellent debate from both participants."),
        highlights=[
            "Strong logical arguments presented",
            "Good use of evidence on both sides",
            "Respectful and engaging exchange"
        ]
    )


@router.get("/criteria")
async def get_scoring_criteria():
    """Get the judge's scoring criteria"""
    return {
        "criteria": [
            {
                "name": "Logic & Reasoning",
                "weight": 30,
                "description": "Coherence of arguments, logical flow, and valid conclusions"
            },
            {
                "name": "Evidence Quality",
                "weight": 25,
                "description": "Use of facts, data, examples, and credible sources"
            },
            {
                "name": "Relevance to Topic",
                "weight": 20,
                "description": "How well arguments address the specific debate topic"
            },
            {
                "name": "Persuasiveness",
                "weight": 15,
                "description": "Rhetorical effectiveness and ability to convince"
            },
            {
                "name": "Rebuttal Strength",
                "weight": 10,
                "description": "Effectiveness in addressing opponent's arguments"
            }
        ],
        "total_points": 100,
        "win_threshold": "Highest total score wins"
    }
