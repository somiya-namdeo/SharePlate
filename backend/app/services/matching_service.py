def calculate_match_score(donation: dict, request: dict) -> float:
    """
    Calculate a compatibility score between a donation and an NGO request.
    Score is out of 100 based on simple heuristics.
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
    donation_qty = float(donation.get("quantity", 0))
    meals_needed = float(request.get("meals_needed", 1))
    
    if donation_qty >= meals_needed:
        score += 30 # Perfect quantity match
    elif donation_qty >= (meals_needed * 0.5):
        score += 15 # Covers at least half the need
    else:
        score += 5  # Covers a small portion

    # 3. Urgency Level (20 points)
    urgency = request.get("urgency_level", "Low").lower()
    if urgency == "critical":
        score += 20
    elif urgency == "high":
        score += 15
    elif urgency == "medium":
        score += 10
    else:
        score += 5

    # 4. Distance and Time (10 points - Placeholder logic)
    score += 10

    return min(score, 100.0) # Cap at 100
