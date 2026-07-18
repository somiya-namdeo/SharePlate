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
    Score is out of 100 based on heuristics: Food category (30%), Distance (25%),
    Urgency (20%), Safety (15%), Quantity compatibility (10%).
    """

    print("\n=== USING NEW MATCHING SERVICE ===")

    KNOWN_FOOD_CATEGORIES = {
        "cooked meal",
        "uncooked",
        "baked",
        "dairy",
        "fruits",
        "vegetables",
        "snacks",
        "beverages"
    }

    # 1. Food Category Match (30%)
    d_food_item = (donation.get("food_type") or "").strip().lower()
    d_food_cat = (donation.get("food_category") or "").strip().lower()
    r_pref_food = (request.get("preferred_food_type") or "").strip().lower()

    request_is_category = r_pref_food in KNOWN_FOOD_CATEGORIES
    detected_type = "Category" if request_is_category else "Food Item"

    cat_match_score = 0.0
    item_match_score = 0.0

    if request_is_category:
        if r_pref_food and (d_food_cat == r_pref_food or d_food_item == r_pref_food):
            cat_match_score = 20.0
            item_match_score = 0.0
    else:
        if r_pref_food and d_food_item == r_pref_food:
            cat_match_score = 20.0
            item_match_score = 10.0

    total_cat_score = cat_match_score + item_match_score

    # 2. Distance (25%)
    d_lat = donation.get("latitude")
    d_lon = donation.get("longitude")
    r_lat = request.get("latitude")
    r_lon = request.get("longitude")

    distance_km = haversine_distance(d_lat, d_lon, r_lat, r_lon)

    if distance_km is not None:
        if distance_km <= 5:
            dist_score = 25.0
        elif distance_km <= 15:
            dist_score = 15.0
        elif distance_km <= 30:
            dist_score = 5.0
        else:
            dist_score = 0.0
    else:
        # Fallback if no location data
        dist_score = 10.0

    # 3. Urgency Level (20%)
    urgency = request.get("urgency_level", "Low").lower() if request.get("urgency_level") else "low"
    if urgency == "critical":
        urg_score = 20.0
    elif urgency == "high":
        urg_score = 15.0
    elif urgency == "medium":
        urg_score = 10.0
    else:
        urg_score = 5.0

    # 4. Safety (15%)
    safety = (donation.get("safety_status") or "review").lower()
    if safety in ["safe", "yes", "high"]:
        safe_score = 15.0
    elif safety == "review":
        safe_score = 7.5
    else:
        safe_score = 0.0

    # 5. Quantity Compatibility (10%)
    donation_qty = float(donation.get("quantity", 0) or 0)
    meals_needed = float(request.get("meals_needed", 1) or 1)

    if donation_qty >= meals_needed:
        qty_score = 10.0
    elif donation_qty >= (meals_needed * 0.5):
        qty_score = 5.0
    else:
        qty_score = 2.0

    final_score = min(total_cat_score + dist_score + urg_score + safe_score + qty_score, 100.0)

    print(f"\nDonation Category : {d_food_cat}")
    print(f"Donation Item     : {d_food_item}")
    print(f"NGO Preference    : {r_pref_food}")
    print(f"Detected Type     : {detected_type}\n")
    print(f"Category Match    : {cat_match_score}")
    print(f"Food Item Match   : {item_match_score}")
    print(f"Total Category    : {total_cat_score}\n")
    print(f"Distance          : {dist_score} (dist: {round(distance_km, 2) if distance_km is not None else 'N/A'}km)")
    print(f"Quantity          : {qty_score} (don_qty: {donation_qty}, req_qty: {meals_needed})")
    print(f"Urgency           : {urg_score}")
    print(f"Safety            : {safe_score}")
    print(f"Final Score       : {final_score}%\n")

    return final_score
