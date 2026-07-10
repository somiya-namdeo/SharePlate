from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class DonationCreate(BaseModel):
    donor_id: str
    food_type: str
    quantity: float
    description: Optional[str] = None
    address: str
    latitude: float
    longitude: float

    # Basic Information
    food_category: Optional[str] = None
    preparation_method: Optional[str] = None
    storage_condition: Optional[str] = None
    packaging_type: Optional[str] = None

    # Environmental Information
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    hours_since_prepared: Optional[float] = None
    estimated_transport_time: Optional[float] = None
    distance: Optional[float] = None
    
class DonationResponse(DonationCreate):
    id: str
    status: str = "pending"
    spoilage_risk_score: Optional[float] = None
    created_at: datetime

    # Workflow
    matched_ngo: Optional[str] = None
    pickup_status: Optional[str] = None
    pickup_deadline: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    # AI Results
    ml_safety_prediction: Optional[str] = None
    ml_confidence: Optional[float] = None
    rule_risk_score: Optional[float] = None
    final_safety_status: Optional[str] = None
    urgency_level: Optional[str] = None
    predicted_surplus: Optional[float] = None
    predicted_demand: Optional[float] = None
    rule_breakdown: Optional[dict] = None

    class Config:
        from_attributes = True
