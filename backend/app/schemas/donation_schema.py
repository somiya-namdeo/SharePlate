from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class DonationCreate(BaseModel):
    donor_id: str
    food_type: str
    quantity: float
    description: Optional[str] = None
    location: str
    latitude: float
    longitude: float
    
class DonationResponse(DonationCreate):
    id: str
    status: str
    spoilage_risk_score: Optional[float] = None
    created_at: datetime
    
    class Config:
        from_attributes = True
