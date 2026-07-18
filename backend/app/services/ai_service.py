import os
import joblib
import pandas as pd
import numpy as np
import torch
import torch.nn as nn

class BiLSTMAttentionNER(nn.Module):
    def __init__(self, vocab_size, embedding_dim, hidden_dim, num_tags):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, embedding_dim, padding_idx=0)
        self.lstm = nn.LSTM(embedding_dim, hidden_dim, batch_first=True, bidirectional=True)
        self.dropout = nn.Dropout(0.3)
        self.fc = nn.Linear(hidden_dim * 2, num_tags)

    def forward(self, x):
        x = self.embedding(x)
        lstm_out, _ = self.lstm(x)
        lstm_out = self.dropout(lstm_out)
        output = self.fc(lstm_out)
        return output

import logging
from app.schemas.ai import (
    FoodSafetyRequest,
    FoodSafetyResponse,
    SurplusPredictionRequest,
    SurplusPredictionResponse,

    DonationNERRequest,
    DonationNERResponse
)

logger = logging.getLogger(__name__)

# Base path for models relative to this file
# This file is in backend/app/services/
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
MODELS_DIR = os.path.join(BASE_DIR, "models")

class AIService:
    def __init__(self):
        self.food_safety_model = None
        self.food_safety_encoder = None
        self.food_safety_features = None
        self.surplus_model = None

        # NER model and vocab
        self.ner_model = None
        self.ner_word2idx = None
        self.ner_tag2idx = None
        self.ner_idx2tag = None

        self._load_models()

    def _load_models(self):
        try:
            food_safety_path = os.path.join(MODELS_DIR, "shareplate_food_safety_model.pkl")
            encoder_path = os.path.join(MODELS_DIR, "food_safety_label_encoder.pkl")
            features_path = os.path.join(MODELS_DIR, "food_safety_features.pkl")

            if os.path.exists(food_safety_path):
                self.food_safety_model = joblib.load(food_safety_path)
            if os.path.exists(encoder_path):
                self.food_safety_encoder = joblib.load(encoder_path)
            if os.path.exists(features_path):
                self.food_safety_features = joblib.load(features_path)

            logger.info("Food safety models loaded successfully.")
        except Exception as e:
            logger.error(f"Error loading food safety models: {e}")

        try:
            surplus_path = os.path.join(MODELS_DIR, "shareplate_surplus_food_predictor.pkl")
            if os.path.exists(surplus_path):
                self.surplus_model = joblib.load(surplus_path)
                logger.info("Surplus prediction model loaded successfully.")
        except Exception as e:
            logger.error(f"Error loading surplus prediction model: {e}")

        try:
            ner_model_path = os.path.join(MODELS_DIR, "shareplate_ner_bilstm_attention_v2.pth")
            word2idx_path = os.path.join(BASE_DIR, "artifacts", "word2idx.pkl")
            tag2idx_path = os.path.join(BASE_DIR, "artifacts", "tag2idx.pkl")
            idx2tag_path = os.path.join(BASE_DIR, "artifacts", "idx2tag.pkl")

            if os.path.exists(ner_model_path) and os.path.exists(word2idx_path):
                self.ner_word2idx = joblib.load(word2idx_path)
                self.ner_tag2idx = joblib.load(tag2idx_path)
                self.ner_idx2tag = joblib.load(idx2tag_path)

                EMBEDDING_DIM = 100
                HIDDEN_DIM = 128

                self.ner_model = BiLSTMAttentionNER(
                    vocab_size=len(self.ner_word2idx),
                    embedding_dim=EMBEDDING_DIM,
                    hidden_dim=HIDDEN_DIM,
                    num_tags=len(self.ner_tag2idx)
                )
                self.ner_model.load_state_dict(torch.load(ner_model_path, map_location=torch.device('cpu')))
                self.ner_model.eval()
                logger.info("NER BiLSTM model and vocab loaded successfully.")
            else:
                logger.warning("NER BiLSTM model or vocab not found. Inference will fail.")
        except Exception as e:
            logger.error(f"Error loading NER BiLSTM model: {e}")

    def predict_food_safety(self, request: FoodSafetyRequest, db=None) -> FoodSafetyResponse:
        # Auto-derive missing fields
        if not request.season:
            request.season = "Summer" if request.temperature_c > 25 else "Winter"
        if not request.city_tier:
            request.city_tier = "Tier-1" # Default assumption
        if not request.event_type:
            request.event_type = "Regular"

        if request.perishability_score is None:
            # Simple heuristic
            request.perishability_score = 3 if "cooked" in request.food_category.lower() else 1

        if request.estimated_shelf_life_hr is None:
            # Basic shelf life estimation
            if "cooked" in request.food_category.lower():
                request.estimated_shelf_life_hr = 12.0 if request.temperature_c > 10 else 48.0
            else:
                request.estimated_shelf_life_hr = 72.0

        # 1. Calculate urgency based on formula: (hours_since_prepared / estimated_shelf_life_hr) * 100
        if request.estimated_shelf_life_hr > 0:
            urgency_score = (request.hours_since_prepared / request.estimated_shelf_life_hr) * 100
        else:
            urgency_score = 100.0

        urgency_score = min(urgency_score, 100.0)

        # 2. Map to urgency level
        if urgency_score <= 25:
            urgency_level = "Low"
        elif urgency_score <= 50:
            urgency_level = "Medium"
        elif urgency_score <= 75:
            urgency_level = "High"
        else:
            urgency_level = "Critical"

        urgency_priority = 1
        if db:
            try:
                # Fetch all active/eligible donations from DB
                response = db.table('donations').select('id, urgency_level, spoilage_risk_score, hours_since_prepared, predicted_shelf_life').eq('status', 'pending').execute()
                active_donations = response.data

                # Calculate scores for existing active eligible donations
                scores = []
                for d in active_donations:
                    # Exclude unsafe donations
                    risk = d.get('spoilage_risk_score')
                    if risk is not None and risk > 0.8:
                        continue

                    hrs = d.get('hours_since_prepared')
                    shelf = d.get('predicted_shelf_life')
                    if shelf and shelf > 0 and hrs is not None:
                        s = (hrs / shelf) * 100
                        scores.append(s)
                    else:
                        scores.append(0.0)

                # Add current request score
                scores.append(urgency_score)

                # Sort descending to rank from highest urgency to lowest
                scores.sort(reverse=True)

                # Rank is 1-indexed position
                urgency_priority = scores.index(urgency_score) + 1
            except Exception as e:
                logger.error(f"Failed to calculate dynamic priority rank: {e}")
                # Fallback to band if DB query fails
                if urgency_score <= 25: urgency_priority = 4
                elif urgency_score <= 50: urgency_priority = 3
                elif urgency_score <= 75: urgency_priority = 2
                else: urgency_priority = 1
        else:
            # Fallback
            if urgency_score <= 25: urgency_priority = 4
            elif urgency_score <= 50: urgency_priority = 3
            elif urgency_score <= 75: urgency_priority = 2
            else: urgency_priority = 1

        remaining_shelf_life = max(0.0, request.estimated_shelf_life_hr - request.hours_since_prepared)

        # 3. Model Inference
        prediction = "Yes" # Default if model fails
        if self.food_safety_model:
            try:
                # Prepare input DataFrame based on request
                input_data = request.model_dump()
                df = pd.DataFrame([input_data])

                # Try to apply label encoder if it's a dict of encoders
                if isinstance(self.food_safety_encoder, dict):
                    for col, le in self.food_safety_encoder.items():
                        if col in df.columns:
                            # Handle unseen labels gracefully
                            df[col] = df[col].apply(lambda x: x if x in le.classes_ else le.classes_[0])
                            df[col] = le.transform(df[col])
                elif self.food_safety_encoder:
                    # If it's a single encoder or different format, apply naively to object columns
                    for col in df.select_dtypes(include=['object']).columns:
                        try:
                            df[col] = self.food_safety_encoder.transform(df[col])
                        except:
                            # Fallback if the encoder doesn't work this way
                            df[col] = 0

                # If specific features are required, filter df
                if self.food_safety_features is not None:
                    # Fill missing columns with 0
                    for col in self.food_safety_features:
                        if col not in df.columns:
                            df[col] = 0
                    df = df[self.food_safety_features]

                # Predict
                pred_output = self.food_safety_model.predict(df)

                # Safely extract scalar value whether it's nested array, list, or scalar
                if isinstance(pred_output, (list, np.ndarray)):
                    while isinstance(pred_output, (list, np.ndarray)) and len(pred_output) > 0:
                        pred_output = pred_output[0]

                try:
                    # Convert to integer class index
                    pred_int = int(pred_output)

                    # Inverse transform using the saved label encoder
                    if self.food_safety_encoder and hasattr(self.food_safety_encoder, 'inverse_transform'):
                        prediction = self.food_safety_encoder.inverse_transform([pred_int])[0]
                    else:
                        # Fallback mapping if encoder is missing or not a standard LabelEncoder
                        if pred_int == 1:
                            prediction = "Yes"
                        elif pred_int == 0:
                            prediction = "No"
                        else:
                            prediction = str(pred_int)
                except Exception as inner_ex:
                    logger.warning(f"Failed to inverse transform prediction '{pred_output}': {inner_ex}")
                    prediction = str(pred_output)

            except Exception as e:
                logger.error(f"Food safety inference error: {e}")

        return FoodSafetyResponse(
            prediction=prediction,
            remaining_shelf_life_hr=remaining_shelf_life,
            urgency_score=round(urgency_score, 1),
            urgency_level=urgency_level,
            urgency_priority=urgency_priority
        )

    def predict_surplus(self, request: SurplusPredictionRequest) -> SurplusPredictionResponse:
        prediction = 0.0
        if self.surplus_model:
            try:
                if request.features:
                    df = pd.DataFrame([request.features])
                    prediction = float(self.surplus_model.predict(df)[0])
                else:
                    prediction = 15.5 # Fallback if no features
            except Exception as e:
                logger.error(f"Surplus prediction error: {e}")
                prediction = 10.0
        else:
            prediction = 12.5 # Mock value

        return SurplusPredictionResponse(predicted_surplus_quantity=round(prediction, 2))

    @staticmethod
    def _normalize_ner_outputs(food_item: str, quantity: str):
        import re
        units = {"kg", "kgs", "gram", "grams", "g", "plate", "plates", "packet", "packets", "box", "boxes", "serving", "servings", "meal", "meals"}
        food_phrases = {"food packets", "food packet", "meal boxes", "meal box", "lunch boxes", "lunch box"}

        def process_string(s):
            if not s: return [], []
            s = s.lower()
            parts = [p.strip() for p in s.split(",")]
            new_q = []
            new_f = []
            for part in parts:
                if not part: continue
                match = re.match(r'^(\d+(?:\.\d+)?)\s*(.*)$', part)
                if match:
                    num = match.group(1)
                    rest = match.group(2).strip()

                    matched_phrase = False
                    for phrase in food_phrases:
                        if rest.startswith(phrase):
                            new_q.append(num)
                            new_f.append(rest)
                            matched_phrase = True
                            break

                    if matched_phrase:
                        continue

                    words = rest.split()
                    q_words = [num]
                    f_words = []

                    i = 0
                    while i < len(words):
                        w = words[i]
                        if w in units:
                            q_words.append(w)
                        else:
                            f_words.extend(words[i:])
                            break
                        i += 1

                    q_str = " ".join(q_words)
                    f_str = " ".join(f_words)

                    new_q.append(q_str)
                    if f_str:
                        new_f.append(f_str)
                else:
                    new_f.append(part)
            return new_q, new_f

        q_q, f_q = process_string(quantity)
        q_f, f_f = process_string(food_item)

        final_quantities = q_q + q_f
        seen_q = set()
        unique_q = []
        for q in final_quantities:
            if q not in seen_q and q:
                seen_q.add(q)
                unique_q.append(q)
        final_quantity = ", ".join(unique_q) if unique_q else None

        all_foods = f_q + f_f
        seen_f = set()
        final_foods = []
        for f in all_foods:
            if f not in seen_f and f:
                seen_f.add(f)
                final_foods.append(f)
        final_food_item = ", ".join(final_foods) if final_foods else None

        if final_food_item:
            remove_words = [
                "and", "with", "plus",
                "cooked", "fresh", "freshly", "prepared", "leftover", "extra", "remaining", "hot", "warm"
            ]
            for w in remove_words:
                final_food_item = re.sub(r'\b' + re.escape(w) + r'\b', '', final_food_item, flags=re.IGNORECASE)
            final_food_item = final_food_item.replace('&', '')

            cleaned_parts = []
            for p in final_food_item.split(','):
                p = re.sub(r'^[^\w]+|[^\w]+$', '', p).strip()
                p = re.sub(r'\s+', ' ', p)
                if p and p not in cleaned_parts:
                    cleaned_parts.append(p)
            final_food_item = ", ".join(cleaned_parts) if cleaned_parts else None

        if final_quantity:
            final_quantity = re.sub(r'^[^\w]+|[^\w]+$', '', final_quantity).strip()
            final_quantity = re.sub(r'\s+', ' ', final_quantity)

        return final_food_item, final_quantity

    def extract_donation_ner(self, request: DonationNERRequest) -> DonationNERResponse:
        if not self.ner_model or not self.ner_word2idx or not self.ner_idx2tag:
            raise RuntimeError("NER model or vocabularies are not loaded. Inference cannot proceed.")

        try:
            text = request.text.lower()
            tokens = text.split()

            unk_idx = self.ner_word2idx.get("<UNK>", 0)
            input_ids = [self.ner_word2idx.get(w, unk_idx) for w in tokens]

            MAX_LEN = 50
            if len(input_ids) > MAX_LEN:
                input_ids = input_ids[:MAX_LEN]
                tokens = tokens[:MAX_LEN]

            tensor = torch.tensor([input_ids], dtype=torch.long)
            with torch.no_grad():
                outputs = self.ner_model(tensor)
                preds = torch.argmax(outputs, dim=2)[0].tolist()

            tags = [self.ner_idx2tag.get(idx, "O") for idx in preds]

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

                elif tag.startswith("I-"):
                    raw_ent = tag.split("-")[1].lower()
                    mapped_ent = None
                    if raw_ent in ["food_type", "food", "item"]: mapped_ent = "food"
                    elif raw_ent in ["quantity", "qty"]: mapped_ent = "quantity"
                    elif raw_ent in ["location", "loc"]: mapped_ent = "location"
                    elif raw_ent in ["time", "pickup", "pickup_time"]: mapped_ent = "time"

                    if current_entity and mapped_ent == current_entity:
                        current_words.append(word)
                    else:
                        if current_entity and current_entity in entities:
                            entities[current_entity].append(" ".join(current_words))
                        current_entity = mapped_ent
                        if current_entity:
                            current_words = [word]
                        else:
                            current_words = []
                else:
                    if current_entity and current_entity in entities:
                        entities[current_entity].append(" ".join(current_words))
                    current_entity = None
                    current_words = []

            if current_entity and current_entity in entities:
                entities[current_entity].append(" ".join(current_words))

            food_item = ", ".join(entities["food"]) if entities["food"] else None
            quantity = ", ".join(entities["quantity"]) if entities["quantity"] else None
            location = ", ".join(entities["location"]) if entities["location"] else None
            pickup_time = ", ".join(entities["time"]) if entities["time"] else None

            # --- POST-PROCESSING ---
            import re
            if food_item:
                original_food = food_item
                parts = [p.strip() for p in food_item.split(',')]
                while parts and re.match(r'^(\d+|am|pm|a\.m\.|p\.m\.|by|at|before|after)$', parts[-1], re.IGNORECASE):
                    parts.pop()
                food_item = ", ".join(parts) if parts else original_food

            food_item, quantity = self._normalize_ner_outputs(food_item, quantity)

            if pickup_time and pickup_time.lower() in ["before", "after", "by"]:
                pt_lower = pickup_time.lower()
                match = re.search(r'\b(' + re.escape(pt_lower) + r'\s+\d{1,2}(?::\d{2})?(?:\s*(?:am|pm|a\.m\.|p\.m\.|hours|hrs))?)\b', text, re.IGNORECASE)
                if match:
                    pickup_time = match.group(1)

            return DonationNERResponse(
                food_item=food_item,
                quantity=quantity,
                location=location,
                pickup_time=pickup_time
            )
        except Exception as e:
            logger.error(f"NER inference error: {e}")
            raise RuntimeError(f"NER inference failed: {str(e)}")
