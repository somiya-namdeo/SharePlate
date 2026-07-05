import uuid
from datetime import datetime
from fastapi import APIRouter
from app.schemas.donation_schema import DonationCreate, DonationResponse
from app.database import DONATIONS_DB

router = APIRouter(prefix="/api/donations", tags=["Donations"])

@router.post("/", response_model=DonationResponse)
def create_donation(donation: DonationCreate):
    """
    Create a new food donation and store it in memory.
    """
    new_donation = {
        "id": str(uuid.uuid4()),
        "status": "pending",
        "spoilage_risk_score": 0.0,
        "created_at": datetime.utcnow(),
        **donation.model_dump()
    }
    DONATIONS_DB.append(new_donation)
    return new_donation

@router.get("/", response_model=list[DonationResponse])
def get_donations():
    """
    List all available donations from memory.
    """
    return DONATIONS_DB
