from fastapi import APIRouter, Depends, HTTPException
from app.schemas.match_schema import MatchCreate
from app.database import get_db
from app.services.matches_service import MatchesService
from supabase import Client

import logging
from fastapi.encoders import jsonable_encoder

logger = logging.getLogger(__name__)

from app.core.security import get_current_user

router = APIRouter(prefix="/api/matches", tags=["Matches"])

def get_matches_service(db: Client = Depends(get_db)):
    return MatchesService(db)

@router.post("/")
def create_match(
    match: MatchCreate, 
    service: MatchesService = Depends(get_matches_service),
    current_user = Depends(get_current_user)
):
    try:
        # Use mode='json' so datetimes become ISO 8601 strings BEFORE passing to Supabase client
        match_dict = match.model_dump(mode='json')
        result = service.create_match(match_dict)
        return {
            "success": True,
            "message": "Match created successfully",
            "data": jsonable_encoder(result)
        }
    except Exception as e:
        logger.error(f"Error creating match: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/suggest/{donation_id}")
def suggest_matches(
    donation_id: str, 
    service: MatchesService = Depends(get_matches_service),
    current_user = Depends(get_current_user)
):
    try:
        result = service.suggest_matches(donation_id)
        if not result:
            raise HTTPException(status_code=404, detail="Donation not found")
        
        return {
            "success": True,
            "message": "Matches suggested successfully",
            "data": jsonable_encoder(result)
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error suggesting matches: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
