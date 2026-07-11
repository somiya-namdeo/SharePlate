from supabase import Client
from typing import List, Dict, Any
from app.services.donations_service import DonationsService
from app.services.requests_service import RequestsService
from app.services.matching_service import calculate_match_score, haversine_distance
from fastapi import HTTPException

class MatchesService:
    def __init__(self, db: Client):
        self.db = db
        self.donations_service = DonationsService(db)
        self.requests_service = RequestsService(db)

    def create_match(self, match_data: dict) -> dict:
        donation = self.donations_service.get_donation_by_id(match_data["donation_id"])
        if not donation:
            raise Exception("Donation not found")
            
        # Prevent duplicate assignment for donation
        donation_id = match_data["donation_id"]
        request_id = match_data["request_id"]
        
        existing_don_matches = self.db.table("matches").select("id").eq("donation_id", donation_id).in_("status", ["pending", "accepted"]).execute()
        if existing_don_matches.data:
            raise HTTPException(status_code=409, detail="This donation has already been assigned to an NGO.")
            
        # Prevent duplicate assignment for NGO request
        existing_req_matches = self.db.table("matches").select("id").eq("request_id", request_id).in_("status", ["pending", "accepted"]).execute()
        if existing_req_matches.data:
            raise HTTPException(status_code=409, detail="This NGO request has already been assigned a donation.")
            
        request_res = self.db.table("ngo_requests").select("*").eq("id", match_data["request_id"]).execute()
        if not request_res.data:
            raise Exception("NGO request not found")
            
        ngo_req = request_res.data[0]
        
        match_data["donor_id"] = donation["donor_id"]
        match_data["ngo_id"] = ngo_req["ngo_id"]
        
        # Calculate distance
        dist = haversine_distance(
            donation.get("latitude"), donation.get("longitude"), 
            ngo_req.get("latitude"), ngo_req.get("longitude")
        )
        if dist is not None:
            match_data["distance_km"] = round(dist, 2)
            
        match_data["match_score"] = round(calculate_match_score(donation, ngo_req), 2)
        match_data["status"] = "pending" # Standardized starting status
        
        response = self.db.table("matches").insert(match_data).execute()
        return response.data[0] if response.data else None

    def suggest_matches(self, donation_id: str, ngo_request_id: str = None) -> dict:
        donation = self.donations_service.get_donation_by_id(donation_id)
        if not donation:
            return None
            
        # 1. If this donation already has an active match, return early
        existing_don_matches = self.db.table("matches").select("id").eq("donation_id", donation_id).in_("status", ["pending", "accepted"]).execute()
        if existing_don_matches.data:
            return {"donation_id": donation_id, "best_matches": [], "message": "This donation is already actively assigned."}
            
        # 2. Find all NGO requests that already have an active match
        active_req_matches = self.db.table("matches").select("request_id").in_("status", ["pending", "accepted"]).execute()
        assigned_req_ids = [m["request_id"] for m in active_req_matches.data] if active_req_matches.data else []
        
        # Get open requests along with NGO profiles
        query = self.db.table("ngo_requests").select("*, profiles!ngo_requests_ngo_id_fkey(organization, full_name)").eq("status", "open")
        
        if ngo_request_id:
            if ngo_request_id in assigned_req_ids:
                return {"donation_id": donation_id, "best_matches": [], "message": "This NGO request is already actively assigned."}
            query = query.eq("id", ngo_request_id)
            
        response = query.execute()
        requests = response.data
        
        # Filter out already assigned requests
        available_requests = [req for req in requests if req["id"] not in assigned_req_ids]
        
        best_matches = []
        for req in available_requests:
            score = calculate_match_score(donation, req)
            if score > 0:
                dist = haversine_distance(
                    donation.get("latitude"), donation.get("longitude"), 
                    req.get("latitude"), req.get("longitude")
                )
                
                # Try getting the name from joined profile, fallback to 'Unknown NGO'
                profile_data = req.get("profiles") or {}
                # Handle case where it might return a list if not configured as 1:1 in supabase-py perfectly
                if isinstance(profile_data, list) and len(profile_data) > 0:
                    profile_data = profile_data[0]
                
                ngo_name = profile_data.get("organization") or profile_data.get("full_name") or "Unknown NGO"
                
                best_matches.append({
                    "ngo_id": req.get("ngo_id", "unknown"),
                    "ngo_name": ngo_name,
                    "request_id": req.get("id"),
                    "match_score": round(score, 2),
                    "distance_km": round(dist, 2) if dist is not None else None,
                    "urgency": req.get("urgency_level", "Low"),
                    "food_needed": req.get("preferred_food_type", "Any"),
                    "quantity_needed": float(req.get("meals_needed", 0) or 0),
                    "estimated_pickup_time": req.get("required_by")
                })
        
        best_matches.sort(key=lambda x: x["match_score"], reverse=True)
        return {
            "donation_id": donation_id,
            "best_matches": best_matches
        }

    def update_match_status(self, match_id: str, new_status: str) -> dict:
        valid_statuses = ['pending', 'accepted', 'rejected', 'picked_up', 'completed', 'cancelled']
        if new_status not in valid_statuses:
            raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {valid_statuses}")
            
        # Get existing match
        match_res = self.db.table("matches").select("*").eq("id", match_id).execute()
        if not match_res.data:
            raise HTTPException(status_code=404, detail="Match not found")
        match = match_res.data[0]
        
        current_status = match["status"]
        
        # Prevent transitions from terminal states or invalid forward transitions
        if current_status in ['completed', 'rejected', 'cancelled']:
            raise HTTPException(status_code=400, detail=f"Cannot transition from terminal state '{current_status}'")
            
        if current_status == 'pending' and new_status not in ['accepted', 'rejected', 'cancelled']:
            raise HTTPException(status_code=400, detail=f"Invalid transition from {current_status} to {new_status}")
            
        if current_status == 'accepted' and new_status not in ['completed', 'cancelled']:
            raise HTTPException(status_code=400, detail=f"Invalid transition from {current_status} to {new_status}")
        
        # Update match status
        update_res = self.db.table("matches").update({"status": new_status}).eq("id", match_id).execute()
        if not update_res.data:
            raise HTTPException(status_code=500, detail="Failed to update match status")
            
        updated_match = update_res.data[0]
        
        donation_id = match["donation_id"]
        request_id = match["request_id"]
        
        # Synchronize parents
        if new_status == 'accepted':
            self.db.table("donations").update({"status": "matched", "matched_ngo": match["ngo_id"]}).eq("id", donation_id).execute()
        elif new_status == 'completed':
            self.db.table("donations").update({"status": "completed"}).eq("id", donation_id).execute()
            self.db.table("ngo_requests").update({"status": "fulfilled"}).eq("id", request_id).execute()
        elif new_status in ['rejected', 'cancelled']:
            self.db.table("donations").update({"status": "pending", "matched_ngo": None}).eq("id", donation_id).execute()
            self.db.table("ngo_requests").update({"status": "open"}).eq("id", request_id).execute()
            
        return updated_match
    def _format_match_list(self, matches: List[dict]) -> List[dict]:
        formatted = []
        for m in matches:
            donation = m.get("donations", {})
            # Handle if Supabase returns a list
            if isinstance(donation, list) and len(donation) > 0:
                donation = donation[0]
                
            request = m.get("ngo_requests", {})
            if isinstance(request, list) and len(request) > 0:
                request = request[0]
                
            donor_profile = m.get("donor_profile", {})
            if isinstance(donor_profile, list) and len(donor_profile) > 0:
                donor_profile = donor_profile[0]
                
            ngo_profile = m.get("ngo_profile", {})
            if isinstance(ngo_profile, list) and len(ngo_profile) > 0:
                ngo_profile = ngo_profile[0]

            item = {
                "id": m.get("id"),
                "donation_id": m.get("donation_id"),
                "request_id": m.get("request_id"),
                "donor_id": m.get("donor_id"),
                "ngo_id": m.get("ngo_id"),
                "status": m.get("status"),
                "match_score": m.get("match_score"),
                "distance_km": m.get("distance_km"),
                "recommended_pickup_time": m.get("recommended_pickup_time"),
                "created_at": m.get("created_at"),
                "food_type": donation.get("food_type"),
                "quantity": donation.get("quantity"),
                "urgency": request.get("urgency_level"),
                "donor_name": donor_profile.get("full_name") or donor_profile.get("organization"),
                "ngo_name": ngo_profile.get("organization") or ngo_profile.get("full_name"),
                "donor_phone": donation.get("contact_phone") or donor_profile.get("phone"),
                "donor_email": donor_profile.get("email"),
                "ngo_phone": request.get("contact_phone") or ngo_profile.get("phone"),
                "ngo_email": ngo_profile.get("email")
            }
            formatted.append(item)
        return formatted

    def get_matches_by_donor(self, donor_id: str) -> List[dict]:
        # Using string based joins. We alias profiles twice since matches has both donor_id and ngo_id
        response = self.db.table("matches") \
            .select("*, donations(*), ngo_requests(*), donor_profile:profiles!matches_donor_id_fkey(full_name, organization, phone, email), ngo_profile:profiles!matches_ngo_id_fkey(full_name, organization, phone, email)") \
            .eq("donor_id", donor_id) \
            .order("created_at", desc=True) \
            .execute()
        return self._format_match_list(response.data)

    def get_matches_by_ngo(self, ngo_id: str) -> List[dict]:
        response = self.db.table("matches") \
            .select("*, donations(*), ngo_requests(*), donor_profile:profiles!matches_donor_id_fkey(full_name, organization, phone, email), ngo_profile:profiles!matches_ngo_id_fkey(full_name, organization, phone, email)") \
            .eq("ngo_id", ngo_id) \
            .order("created_at", desc=True) \
            .execute()
        return self._format_match_list(response.data)
