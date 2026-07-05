from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class RequestCreate(BaseModel):
    ngo_id: str
    meals_needed: int
    preferred_food_type: Optional[str] = None
    urgency_level: str
    location: str
    latitude: float
    longitude: float

class RequestResponse(RequestCreate):
    id: str
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True
