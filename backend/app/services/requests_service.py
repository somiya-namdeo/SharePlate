from supabase import Client
from typing import List

class RequestsService:
    def __init__(self, db: Client):
        self.db = db

    def create_request(self, request_data: dict, ngo_id: str) -> dict:
        request_data["ngo_id"] = ngo_id
        response = self.db.table("ngo_requests").insert(request_data).execute()
        return response.data[0] if response.data else None

    def get_requests(self, limit: int = 100) -> List[dict]:
        response = self.db.table("ngo_requests").select("*").order("created_at", desc=True).limit(limit).execute()
        return response.data
    
    def get_request_by_id(self, request_id: str) -> dict:
        response = self.db.table("ngo_requests").select("*").eq("id", request_id).execute()
        return response.data[0] if response.data else None
