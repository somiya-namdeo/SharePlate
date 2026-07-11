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
        result = service.update_match_status(match_id, update_data.status)
        return {
            "success": True,
            "message": f"Match status updated to {update_data.status}",
            "data": jsonable_encoder(result)
        }
    except Exception as e:
        logger.error(f"Error updating match status: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/donor/{donor_id}", response_model=MatchListAPIResponse)
def get_donor_matches(
    donor_id: str,
    service: MatchesService = Depends(get_matches_service),
    current_user = Depends(get_current_user)
):
    try:
        result = service.get_matches_by_donor(donor_id)
        return {
            "success": True,
            "message": "Donor matches retrieved successfully",
            "data": jsonable_encoder(result)
        }
    except Exception as e:
        logger.error(f"Error retrieving donor matches: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/ngo/{ngo_id}", response_model=MatchListAPIResponse)
def get_ngo_matches(
    ngo_id: str,
    service: MatchesService = Depends(get_matches_service),
    current_user = Depends(get_current_user)
):
    try:
        result = service.get_matches_by_ngo(ngo_id)
        return {
            "success": True,
            "message": "NGO matches retrieved successfully",
            "data": jsonable_encoder(result)
        }
    except Exception as e:
        logger.error(f"Error retrieving NGO matches: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
