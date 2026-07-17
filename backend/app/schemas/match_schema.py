from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class MatchCreate(BaseModel):
    donation_id: str
    request_id: str
    recommended_pickup_time: Optional[datetime] = None

class MatchResponse(MatchCreate):
    id: str
    donor_id: str
    ngo_id: str
    distance_km: Optional[float] = None
    match_score: Optional[float] = None
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class MatchStatusUpdate(BaseModel):
    status: str

class MatchDetailResponse(BaseModel):
    id: str
    donation_id: str
    request_id: str
    donor_id: str
    ngo_id: str
    status: str
    match_score: Optional[float] = None
    distance_km: Optional[float] = None
    recommended_pickup_time: Optional[datetime] = None
    created_at: datetime
    
    # Extra donation/request fields
    food_type: Optional[str] = None
    quantity: Optional[float] = None
    urgency: Optional[str] = None
    ngo_name: Optional[str] = None
    donor_name: Optional[str] = None
    donor_phone: Optional[str] = None
    donor_email: Optional[str] = None
    ngo_phone: Optional[str] = None
    ngo_email: Optional[str] = None
    
    donation_latitude: Optional[float] = None
    donation_longitude: Optional[float] = None
    donation_address: Optional[str] = None
    donation_safety_status: Optional[str] = None
    donation_predicted_shelf_life: Optional[float] = None
    request_latitude: Optional[float] = None
    request_longitude: Optional[float] = None

    class Config:
        from_attributes = True

class MatchSuggestion(BaseModel):
    ngo_id: str
    ngo_name: str
    request_id: str
    match_score: float
    distance_km: Optional[float] = None
    urgency: Optional[str] = None
    food_needed: Optional[str] = None
    quantity_needed: Optional[float] = None
    estimated_pickup_time: Optional[datetime] = None

class MatchSuggestionData(BaseModel):
    donation_id: str
    best_matches: List[MatchSuggestion]

# Wrapper Responses
class BaseAPIResponse(BaseModel):
    success: bool
    message: str

class MatchCreateAPIResponse(BaseAPIResponse):
    data: MatchResponse

class MatchSuggestionAPIResponse(BaseAPIResponse):
    data: MatchSuggestionData

class MatchListAPIResponse(BaseAPIResponse):
    data: List[MatchDetailResponse]

class MatchUpdateAPIResponse(BaseAPIResponse):
    data: MatchResponse
