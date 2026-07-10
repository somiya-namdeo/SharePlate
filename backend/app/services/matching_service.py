import math

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great circle distance in kilometers between two points 
    on the earth (specified in decimal degrees)
    """
    if lat1 is None or lon1 is None or lat2 is None or lon2 is None:
        return None

    # Convert decimal degrees to radians 
    lon1, lat1, lon2, lat2 = map(math.radians, [lon1, lat1, lon2, lat2])

    # Haversine formula 
    dlon = lon2 - lon1 
    dlat = lat2 - lat1 
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a)) 
    r = 6371 # Radius of earth in kilometers
    return c * r

def calculate_match_score(donation: dict, request: dict) -> float:
    """
    Calculate a compatibility score between a donation and an NGO request.
    Score is out of 100 based on heuristics: Food type, Quantity, Urgency, Distance.
    """
    score = 0.0

    # 1. Food Type Match (40 points)
    d_food = donation.get("food_type", "")
    r_food = request.get("preferred_food_type", "")
    if d_food and r_food and d_food.lower() == r_food.lower():
        score += 40
    else:
        score += 10 # Partial score just for providing some food

    # 2. Quantity Compatibility (30 points)
    donation_qty = float(donation.get("quantity", 0) or 0)
    meals_needed = float(request.get("meals_needed", 1) or 1)
    
    if donation_qty >= meals_needed:
        score += 30 # Perfect quantity match
    elif donation_qty >= (meals_needed * 0.5):
        score += 15 # Covers at least half the need
    else:
        score += 5  # Covers a small portion

    # 3. Urgency Level (20 points)
    urgency = request.get("urgency_level", "Low").lower() if request.get("urgency_level") else "low"
    if urgency == "critical":
        score += 20
    elif urgency == "high":
        score += 15
    elif urgency == "medium":
        score += 10
    else:
        score += 5

    # 4. Distance (10 points)
    d_lat = donation.get("latitude")
    d_lon = donation.get("longitude")
    r_lat = request.get("latitude")
    r_lon = request.get("longitude")
    
    distance_km = haversine_distance(d_lat, d_lon, r_lat, r_lon)
    
    if distance_km is not None:
        if distance_km < 5:
            score += 10
        elif distance_km <= 15:
            score += 7
        elif distance_km <= 30:
            score += 4
        else:
            score += 1
    else:
        # Fallback if no location data
        score += 5

    return min(score, 100.0) # Cap at 100
