from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class MatchCreate(BaseModel):
    donation_id: str
    request_id: str
    recommended_pickup_time: Optional[datetime] = None

class MatchResponse(MatchCreate):
    id: str
    donor_id: str
    ngo_id: str
    distance_km: float
    match_score: float
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True
