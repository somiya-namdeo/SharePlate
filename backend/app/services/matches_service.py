from supabase import Client
from typing import List
from app.services.donations_service import DonationsService
from app.services.requests_service import RequestsService
from app.services.matching_service import calculate_match_score

class MatchesService:
    def __init__(self, db: Client):
        self.db = db
        self.donations_service = DonationsService(db)
        self.requests_service = RequestsService(db)

    def create_match(self, match_data: dict) -> dict:
        response = self.db.table("matches").insert(match_data).execute()
        return response.data[0] if response.data else None

    def suggest_matches(self, donation_id: str) -> dict:
        donation = self.donations_service.get_donation_by_id(donation_id)
        if not donation:
            return None
        
        # Get all open requests
        response = self.db.table("ngo_requests").select("*").eq("status", "open").execute()
        requests = response.data
        
        best_matches = []
        for req in requests:
            score = calculate_match_score(donation, req)
            if score > 0:
                best_matches.append({
                    "ngo_id": req.get("ngo_id", "unknown"),
                    "request_id": req.get("id"),
                    "score": round(score, 2)
                })
        
        best_matches.sort(key=lambda x: x["score"], reverse=True)
        return {
            "donation_id": donation_id,
            "best_matches": best_matches
        }
