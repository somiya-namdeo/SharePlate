from supabase import Client
from typing import List, Dict, Any

class DonationsService:
    def __init__(self, db: Client):
        self.db = db

    def create_donation(self, donation_data: dict, donor_id: str) -> dict:
        donation_data["donor_id"] = donor_id
        response = self.db.table("donations").insert(donation_data).execute()
        return response.data[0] if response.data else None

    def get_donations(self, limit: int = 100) -> List[dict]:
        response = self.db.table("donations").select("*").order("created_at", desc=True).limit(limit).execute()
        return response.data
    
    def get_donation_by_id(self, donation_id: str) -> dict:
        response = self.db.table("donations").select("*").eq("id", donation_id).execute()
        return response.data[0] if response.data else None

    def update_donation(self, donation_id: str, update_data: dict, donor_id: str) -> dict:
        # Security check: ensure only the owner can update
        existing = self.get_donation_by_id(donation_id)
        if not existing or existing.get("donor_id") != donor_id:
            raise Exception("Unauthorized to update this donation or donation not found")

        response = self.db.table("donations").update(update_data).eq("id", donation_id).execute()
        return response.data[0] if response.data else None
