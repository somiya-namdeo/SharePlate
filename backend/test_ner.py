import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "app", "..")))

from app.services.ai_service import AIService
from app.schemas.ai import DonationNERRequest
import logging

logging.basicConfig(level=logging.INFO)

service = AIService()

def mock_predict(self, request):
    text = request.text.lower()
    tokens = text.split()
    # Let's mock a sequence of tags
    # "rice and beans 10 trays 5 pm"
    # tags: B-FOOD_TYPE, O, I-FOOD_TYPE, B-QUANTITY, I-QUANTITY, B-TIME, I-TIME
    
    # Let's write exactly what the logic would do with these tags
    tags = ["B-FOOD_TYPE", "O", "I-FOOD_TYPE", "B-QUANTITY", "I-QUANTITY", "B-TIME", "I-TIME"]
    
    entities = {"food": [], "quantity": [], "location": [], "time": []}
    current_entity = None
    current_words = []
    
    for word, tag in zip(tokens, tags):
        if tag.startswith("B-"):
            if current_entity and current_entity in entities:
                entities[current_entity].append(" ".join(current_words))
            
            raw_ent = tag.split("-")[1].lower()
            if raw_ent in ["food_type", "food", "item"]: current_entity = "food"
            elif raw_ent in ["quantity", "qty"]: current_entity = "quantity"
            elif raw_ent in ["location", "loc"]: current_entity = "location"
            elif raw_ent in ["time", "pickup", "pickup_time"]: current_entity = "time"
            else: current_entity = None
            
            if current_entity:
                current_words = [word]
                
        elif tag.startswith("I-") and current_entity:
            raw_ent = tag.split("-")[1].lower()
            mapped_ent = None
            if raw_ent in ["food_type", "food", "item"]: mapped_ent = "food"
            elif raw_ent in ["quantity", "qty"]: mapped_ent = "quantity"
            elif raw_ent in ["location", "loc"]: mapped_ent = "location"
            elif raw_ent in ["time", "pickup", "pickup_time"]: mapped_ent = "time"
            
            if mapped_ent == current_entity:
                current_words.append(word)
            else:
                if current_entity and current_entity in entities:
                    entities[current_entity].append(" ".join(current_words))
                current_entity = None
                current_words = []
        else:
            if current_entity and current_entity in entities:
                entities[current_entity].append(" ".join(current_words))
            current_entity = None
            current_words = []
            
    if current_entity and current_entity in entities:
        entities[current_entity].append(" ".join(current_words))
        
    print("Entities before post-processing:", entities)
    food_item = ", ".join(entities["food"]) if entities["food"] else None
    print("food_item before:", food_item)

    import re
    if food_item:
        parts = [p.strip() for p in food_item.split(',')]
        while parts and re.match(r'^(\d+|am|pm|a\.m\.|p\.m\.|by|at|before|after)$', parts[-1], re.IGNORECASE):
            parts.pop()
        food_item = ", ".join(parts) if parts else None
        
    print("food_item after:", food_item)
    return food_item

req = DonationNERRequest(text="rice and beans 10 trays 5 pm")
mock_predict(service, req)
