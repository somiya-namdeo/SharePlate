from pydantic import BaseModel
from typing import Optional, Literal
from datetime import datetime

class RequestCreate(BaseModel):
    ngo_id: Optional[str] = None
    meals_needed: int
    preferred_food_type: Optional[str] = None
    urgency_level: Literal["Low", "Medium", "High"]
    address: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class RequestResponse(RequestCreate):
    id: str
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True
