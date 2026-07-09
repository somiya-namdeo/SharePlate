from fastapi import APIRouter, Depends, HTTPException
from app.schemas.match_schema import MatchCreate
from app.database import get_db
from app.services.matches_service import MatchesService
from supabase import Client

router = APIRouter(prefix="/api/matches", tags=["Matches"])

def get_matches_service(db: Client = Depends(get_db)):
    return MatchesService(db)

@router.post("/")
def create_match(match: MatchCreate, service: MatchesService = Depends(get_matches_service)):
    try:
        result = service.create_match(match.model_dump())
        return {
            "success": True,
            "message": "Match created successfully",
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/suggest/{donation_id}")
def suggest_matches(donation_id: str, service: MatchesService = Depends(get_matches_service)):
    try:
        result = service.suggest_matches(donation_id)
        if not result:
            raise HTTPException(status_code=404, detail="Donation not found")
        
        return {
            "success": True,
            "message": "Matches suggested successfully",
            "data": result
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
