from fastapi import APIRouter, Depends, HTTPException, Path
from typing import Optional
from app.schemas.match_schema import (
    MatchCreate, MatchStatusUpdate,
    MatchCreateAPIResponse, MatchSuggestionAPIResponse,
    MatchListAPIResponse, MatchUpdateAPIResponse
)
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

@router.post("/", response_model=MatchCreateAPIResponse)
def create_match(
    match: MatchCreate,
    service: MatchesService = Depends(get_matches_service),
    current_user = Depends(get_current_user)
):
    try:
        match_dict = match.model_dump(mode='json')
        result = service.create_match(match_dict)
        return {
            "success": True,
            "message": "Match created successfully",
            "data": jsonable_encoder(result)
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating match: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/suggest/{donation_id}", response_model=MatchSuggestionAPIResponse)
def suggest_matches(
    donation_id: str,
    ngo_request_id: Optional[str] = None,
    service: MatchesService = Depends(get_matches_service),
    current_user = Depends(get_current_user)
):
    try:
        result = service.suggest_matches(donation_id, ngo_request_id)
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

@router.put("/{match_id}/status", response_model=MatchUpdateAPIResponse)
def update_match_status(
    match_id: str,
    update_data: MatchStatusUpdate,
    service: MatchesService = Depends(get_matches_service),
    current_user = Depends(get_current_user)
):
    try:
        role = current_user.user_metadata.get("role", "")
        if role != "ngo":
            raise HTTPException(status_code=403, detail="Only NGOs can complete a rescue.")

        result = service.update_match_status(match_id, update_data.status)
        return {
            "success": True,
            "message": f"Match status updated to {update_data.status}",
            "data": jsonable_encoder(result)
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error updating match status: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/me", response_model=MatchListAPIResponse)
def get_my_matches(
    service: MatchesService = Depends(get_matches_service),
    current_user = Depends(get_current_user)
):
    try:
        role = current_user.user_metadata.get("role", "")
        if role == "donor":
            result = service.get_matches_by_donor(current_user.id)
        elif role == "ngo":
            result = service.get_matches_by_ngo(current_user.id)
        else:
            raise HTTPException(status_code=403, detail="Invalid role for accessing matches.")

        return {
            "success": True,
            "message": "Matches retrieved successfully",
            "data": jsonable_encoder(result)
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving matches: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
