from fastapi import APIRouter, HTTPException, Depends
from app.schemas.ai import (
    FoodSafetyRequest, 
    FoodSafetyResponse, 
    SurplusPredictionRequest, 
    SurplusPredictionResponse, 

    DonationNERRequest, 
    DonationNERResponse
)
from app.services.ai_service import AIService

router = APIRouter(prefix="/api/ai", tags=["AI Services"])

# Create a singleton instance of the service to load models once at startup
ai_service = AIService()

def get_ai_service():
    return ai_service

@router.post("/food-safety", response_model=FoodSafetyResponse, summary="Predict Food Safety and Urgency")
async def predict_food_safety(request: FoodSafetyRequest, service: AIService = Depends(get_ai_service)):
    try:
        return service.predict_food_safety(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/surplus-prediction", response_model=SurplusPredictionResponse, summary="Predict Surplus Food Quantity")
async def predict_surplus(request: SurplusPredictionRequest, service: AIService = Depends(get_ai_service)):
    try:
        return service.predict_surplus(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@router.post("/donation-ner", response_model=DonationNERResponse, summary="Extract Entities from Donation Text")
async def extract_donation_ner(request: DonationNERRequest, service: AIService = Depends(get_ai_service)):
    try:
        return service.extract_donation_ner(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
