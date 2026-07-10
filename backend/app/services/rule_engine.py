from typing import Dict, Any

class RuleEngine:
    @staticmethod
    def evaluate_food_safety(donation: dict, ai_prediction: str) -> Dict[str, Any]:
        """
        Evaluates food safety based on simple rules to override or supplement ML predictions.
        Returns a dict with final safety status, risk score, and rule breakdown.
        """
        rules_triggered = []
        risk_score = 0.0
        final_status = ai_prediction
        
        hours = float(donation.get("hours_since_prepared") or 0)
        temperature = float(donation.get("temperature") or 0)
        food_category = str(donation.get("food_category") or "").lower()
        
        # Rule 1: Cooked food older than 12 hours
        if "cooked" in food_category and hours > 12:
            rules_triggered.append({"rule": "Cooked food > 12 hrs", "risk_contribution": 0.5})
            risk_score += 0.5
            
        # Rule 2: High temperature storage (room temp or above) for more than 4 hours
        if temperature > 25 and hours > 4:
            rules_triggered.append({"rule": "High temp storage > 4 hrs", "risk_contribution": 0.4})
            risk_score += 0.4
            
        # Rule 3: Very old food (over 24 hours) is universally risky unless frozen (temperature < 0)
        if hours > 24 and temperature >= 0:
            rules_triggered.append({"rule": "Food older than 24 hrs not frozen", "risk_contribution": 0.8})
            risk_score += 0.8
            
        # Overall risk evaluation
        if risk_score >= 0.8:
            final_status = "No" # Override ML if too risky
            
        return {
            "final_safety_status": final_status,
            "rule_risk_score": min(risk_score, 1.0),
            "rule_breakdown": {
                "rules_triggered": rules_triggered,
                "base_ai_prediction": ai_prediction,
                "total_risk_score": min(risk_score, 1.0)
            }
        }
