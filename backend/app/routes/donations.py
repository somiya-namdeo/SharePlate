from fastapi import APIRouter, Depends, HTTPException, Body
from fastapi.responses import JSONResponse
from typing import Dict, Any
from app.schemas.donation_schema import DonationCreate
from app.database import get_db
from app.core.security import get_current_user
from app.services.donations_service import DonationsService
from supabase import Client

router = APIRouter(prefix="/api/donations", tags=["Donations"])

def get_donations_service(db: Client = Depends(get_db)):
    return DonationsService(db)

@router.post("/")
def create_donation(
    donation: DonationCreate, 
    service: DonationsService = Depends(get_donations_service),
    current_user = Depends(get_current_user)
):
    try:
        role = current_user.user_metadata.get("role", "")
        if role != "donor":
            return JSONResponse(
                status_code=403,
                content={"success": False, "message": "Only donors can create donations."}
            )

        # Assuming the JWT token gives us the user's UUID in `current_user.id`
        donor_id = current_user.id
        result = service.create_donation(donation.model_dump(exclude={"donor_id"}), donor_id)
        return {
            "success": True,
            "message": "Donation created successfully",
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/me")
def get_my_donations(
    service: DonationsService = Depends(get_donations_service),
    current_user = Depends(get_current_user)
):
    try:
        role = current_user.user_metadata.get("role", "")
        if role != "donor":
            return JSONResponse(
                status_code=403,
                content={"success": False, "message": "Only donors can view their donations here."}
            )
        
        result = service.get_donations_by_donor(current_user.id)
        return {
            "success": True,
            "message": "My donations retrieved successfully",
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/")
def get_donations(
    service: DonationsService = Depends(get_donations_service),
    current_user = Depends(get_current_user)
):
    try:
        role = current_user.user_metadata.get("role", "")
        if role != "ngo":
            return JSONResponse(
                status_code=403,
                content={"success": False, "message": "Only NGOs can browse available donations."}
            )
            
        # Optional: Can restrict to authenticated users if needed
        result = service.get_available_donations()
        return {
            "success": True,
            "message": "Available donations retrieved successfully",
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{donation_id}")
def update_donation(
    donation_id: str,
    update_data: Dict[str, Any] = Body(...),
    service: DonationsService = Depends(get_donations_service),
    current_user = Depends(get_current_user)
):
    try:
        role = current_user.user_metadata.get("role", "")
        if role != "donor":
            return JSONResponse(
                status_code=403,
                content={"success": False, "message": "Only donors can update donations."}
            )
            
        donor_id = current_user.id
        result = service.update_donation(donation_id, update_data, donor_id)
        if not result:
            raise HTTPException(status_code=404, detail="Donation not found or unauthorized")
        return {
            "success": True,
            "message": "Donation updated successfully",
            "data": result
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
