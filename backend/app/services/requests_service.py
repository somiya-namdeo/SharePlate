from supabase import Client
from typing import List
from app.services.geocoding_service import GeocodingService
from fastapi import HTTPException

class RequestsService:
    def __init__(self, db: Client):
        self.db = db
        self.geocoder = GeocodingService()

    def create_request(self, request_data: dict, ngo_id: str) -> dict:
        request_data["ngo_id"] = ngo_id
        
        address = request_data.get("address", "")
        coords = self.geocoder.geocode(address)
        if coords:
            request_data["latitude"] = coords[0]
            request_data["longitude"] = coords[1]
        else:
            raise HTTPException(status_code=400, detail="Could not locate this address. Please enter a more specific address.")
            
        response = self.db.table("ngo_requests").insert(request_data).execute()
        return response.data[0] if response.data else None

    def get_requests(self, limit: int = 100) -> List[dict]:
        response = self.db.table("ngo_requests").select("*").order("created_at", desc=True).limit(limit).execute()
        return response.data

    def get_requests_by_ngo(self, ngo_id: str, status: str = None, limit: int = 100) -> List[dict]:
        query = self.db.table("ngo_requests").select("*").eq("ngo_id", ngo_id)
        if status:
            query = query.eq("status", status)
        response = query.order("created_at", desc=True).limit(limit).execute()
        return response.data
    
    def get_request_by_id(self, request_id: str) -> dict:
        response = self.db.table("ngo_requests").select("*").eq("id", request_id).execute()
        return response.data[0] if response.data else None
