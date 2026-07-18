from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class DonationCreate(BaseModel):
    donor_id: str
    food_type: str
    quantity: float
    description: Optional[str] = None
    address: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    contact_phone: Optional[str] = None

    # Basic Information
    food_category: Optional[str] = None
    preparation_method: Optional[str] = None
    storage_condition: Optional[str] = None
    packaging_type: Optional[str] = None
    season: Optional[str] = None
    event_type: Optional[str] = None
    city_tier: Optional[str] = None

    # Environmental Information
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    hours_since_prepared: Optional[float] = None
    estimated_transport_time: Optional[float] = None
    distance: Optional[float] = None
    perishability_score: Optional[float] = None
    estimated_shelf_life: Optional[float] = None

    # AI Results (to allow saving pre-calculated AI data)
    safety_status: Optional[str] = None
    confidence_score: Optional[float] = None
    predicted_shelf_life: Optional[float] = None
    urgency_level: Optional[str] = None
    spoilage_risk_score: Optional[float] = None

class DonationResponse(DonationCreate):
    id: str
    status: str = "pending"
    created_at: datetime

    # Workflow
    matched_ngo: Optional[str] = None
    pickup_status: Optional[str] = None
    pickup_deadline: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    # AI Results
    prediction_time: Optional[datetime] = None

    class Config:
        from_attributes = True
