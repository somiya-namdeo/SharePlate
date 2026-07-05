from fastapi import APIRouter, HTTPException
from app.schemas.match_schema import MatchCreate
from app.database import DONATIONS_DB, REQUESTS_DB
from app.services.matching_service import calculate_match_score

router = APIRouter(prefix="/api/matches", tags=["Matches"])

@router.post("/")
def create_match(match: MatchCreate):
    """
    Confirm a match between a donation and an NGO request.
    """
    return {"message": "Match created successfully", "data": match}

@router.get("/suggest/{donation_id}")
def suggest_matches(donation_id: str):
    """
    Get AI-suggested NGO matches for a specific donation.
    """
    # 1. Find the donation
    donation = next((d for d in DONATIONS_DB if d["id"] == donation_id), None)
    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")
        
    best_matches = []
    
    # 2. Calculate score against all open requests
    for request in REQUESTS_DB:
        if request.get("status") == "open":
            score = calculate_match_score(donation, request)
            if score > 0:
                best_matches.append({
                    "ngo_id": request.get("ngo_id", "unknown"),
                    "request_id": request.get("id"),
                    "score": round(score, 2)
                })
                
    # 3. Sort matches by score descending
    best_matches.sort(key=lambda x: x["score"], reverse=True)

    return {
        "donation_id": donation_id,
        "best_matches": best_matches
    }
