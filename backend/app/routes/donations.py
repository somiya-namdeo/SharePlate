from fastapi import APIRouter, Depends, HTTPException
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
        # Assuming the JWT token gives us the user's UUID in `current_user.id`
        donor_id = current_user.id
        result = service.create_donation(donation.model_dump(), donor_id)
        return {
            "success": True,
            "message": "Donation created successfully",
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/")
def get_donations(service: DonationsService = Depends(get_donations_service)):
    try:
        # Optional: Can restrict to authenticated users if needed
        result = service.get_donations()
        return {
            "success": True,
            "message": "Donations retrieved successfully",
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
