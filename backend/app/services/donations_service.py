from supabase import Client
from typing import List, Dict, Any
from app.services.ai_service import AIService
from app.services.rule_engine import RuleEngine
from app.schemas.ai import FoodSafetyRequest, SurplusPredictionRequest
from app.services.geocoding_service import GeocodingService
from fastapi import HTTPException
import logging

logger = logging.getLogger(__name__)

class DonationsService:
    def __init__(self, db: Client):
        self.db = db
        self.ai_service = AIService()
        self.geocoder = GeocodingService()

    def create_donation(self, donation_data: dict, donor_id: str) -> dict:
        donation_data["donor_id"] = donor_id
        donation_data["status"] = "pending"
        
        address = donation_data.get("address", "")
        coords = self.geocoder.geocode(address)
        if coords:
            donation_data["latitude"] = coords[0]
            donation_data["longitude"] = coords[1]
        else:
            raise HTTPException(status_code=400, detail="Could not locate this address. Please enter a more specific address.")
        
        
        # 1. Save initial user-entered fields
        response = self.db.table("donations").insert(donation_data).execute()
        if not response.data:
            raise Exception("Failed to create donation record")
            
        saved_donation = response.data[0]
        donation_id = saved_donation["id"]
        
        # 2. Run Food Safety Model
        try:
            food_safety_req = FoodSafetyRequest(
                food_item=donation_data.get("food_type", ""),
                food_category=donation_data.get("food_category", ""),
                preparation_method=donation_data.get("preparation_method", ""),
                storage_condition=donation_data.get("storage_condition", ""),
                packaging_type=donation_data.get("packaging_type", ""),
                temperature_c=float(donation_data.get("temperature") or 0),
                humidity_percent=float(donation_data.get("humidity") or 0),
                hours_since_prepared=float(donation_data.get("hours_since_prepared") or 0),
                estimated_transport_time_hr=float(donation_data.get("estimated_transport_time") or 0) / 60.0,
                distance_km=float(donation_data.get("distance") or 0),
                quantity_kg=float(donation_data.get("quantity") or 0),
            )
            fs_response = self.ai_service.predict_food_safety(food_safety_req)
            ai_prediction = fs_response.prediction
            urgency_level = fs_response.urgency_level
        except Exception as e:
            logger.error(f"Food safety error during donation creation: {e}")
            ai_prediction = "Unknown"
            urgency_level = "Medium"
            
        # 3. Run Rule Engine
        rule_results = RuleEngine.evaluate_food_safety(donation_data, ai_prediction)
        
        # 4. Run Surplus Prediction
        try:
            surplus_req = SurplusPredictionRequest(features={"quantity": donation_data.get("quantity")})
            surplus_res = self.ai_service.predict_surplus(surplus_req)
            surplus = surplus_res.predicted_surplus_quantity
        except Exception as e:
            logger.error(f"Surplus prediction error: {e}")
            surplus = None
            

        import datetime
        # 6. Prepare update payload with all AI outputs
        update_data = {
            "safety_status": rule_results.get("final_safety_status", ai_prediction),
            "spoilage_risk_score": rule_results.get("rule_risk_score", 0),
            "urgency_level": urgency_level,
            "prediction_time": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }
        
        # 7. Update database with AI results
        update_res = self.db.table("donations").update(update_data).eq("id", donation_id).execute()
        if update_res.data:
            return update_res.data[0]
            
        return {**saved_donation, **update_data}

    def get_donations_by_donor(self, donor_id: str, status: str = None, limit: int = 100) -> List[dict]:
        query = self.db.table("donations").select("*").eq("donor_id", donor_id)
        if status:
            query = query.eq("status", status)
        response = query.order("created_at", desc=True).limit(limit).execute()
        return response.data

    def get_available_donations(self, limit: int = 100) -> List[dict]:
        response = self.db.table("donations").select("*") \
            .eq("status", "pending") \
            .is_("matched_ngo", "null") \
            .in_("safety_status", ["Safe", "Yes", "safe", "yes"]) \
            .order("created_at", desc=True).limit(limit).execute()
        return response.data
    
    def get_donation_by_id(self, donation_id: str) -> dict:
        response = self.db.table("donations").select("*").eq("id", donation_id).execute()
        return response.data[0] if response.data else None

    def update_donation(self, donation_id: str, update_data: dict, donor_id: str) -> dict:
        existing = self.get_donation_by_id(donation_id)
        if not existing or existing.get("donor_id") != donor_id:
            raise HTTPException(status_code=403, detail="Unauthorized to update this donation or donation not found")
            
        new_address = update_data.get("address")
        if new_address and new_address.strip() != existing.get("address", "").strip():
            coords = self.geocoder.geocode(new_address)
            if coords:
                update_data["latitude"] = coords[0]
                update_data["longitude"] = coords[1]
            else:
                raise HTTPException(status_code=400, detail="Could not locate this address. Please enter a more specific address.")
        else:
            # Address unchanged, drop coordinates to protect the database record
            update_data.pop("latitude", None)
            update_data.pop("longitude", None)
            
        response = self.db.table("donations").update(update_data).eq("id", donation_id).execute()
        return response.data[0] if response.data else None
