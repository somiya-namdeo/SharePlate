import os
import joblib
import pandas as pd
import numpy as np
import torch
import torch.nn as nn

class DemandForecastingNN(nn.Module):
    def __init__(self, input_dim):
        super().__init__()
        self.fc1 = nn.Linear(input_dim, 128)
        self.fc2 = nn.Linear(128, 64)
        self.fc3 = nn.Linear(64, 32)
        self.fc4 = nn.Linear(32, 1)
        self.relu = nn.ReLU()
        self.dropout1 = nn.Dropout(0.3)
        self.dropout2 = nn.Dropout(0.2)

    def forward(self, x):
        x = self.dropout1(self.relu(self.fc1(x)))
        x = self.dropout2(self.relu(self.fc2(x)))
        x = self.relu(self.fc3(x))
        x = self.fc4(x)
        return x

import logging
from app.schemas.ai import (
    FoodSafetyRequest, 
    FoodSafetyResponse, 
    SurplusPredictionRequest, 
    SurplusPredictionResponse, 
    DemandForecastRequest, 
    DemandForecastResponse, 
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
        
        # Demand Forecast model and scalers
        self.demand_model = None
        self.demand_feature_scaler = None
        self.demand_target_scaler = None
        
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
            demand_model_path = os.path.join(MODELS_DIR, "shareplate_demand_forecasting_dnn.pth")
            feature_scaler_path = os.path.join(BASE_DIR, "artifacts", "feature_scaler.pkl")
            target_scaler_path = os.path.join(BASE_DIR, "artifacts", "target_scaler.pkl")

            if os.path.exists(demand_model_path) and os.path.exists(feature_scaler_path) and os.path.exists(target_scaler_path):
                self.demand_feature_scaler = joblib.load(feature_scaler_path)
                self.demand_target_scaler = joblib.load(target_scaler_path)
                
                self.demand_model = DemandForecastingNN(17)
                self.demand_model.load_state_dict(torch.load(demand_model_path, map_location=torch.device('cpu')))
                self.demand_model.eval()
                logger.info("Demand forecasting model and scalers loaded successfully.")
            else:
                logger.warning("Demand forecasting model or scalers not found. Inference will fail.")
        except Exception as e:
            logger.error(f"Error loading demand forecasting model: {e}")

    def predict_food_safety(self, request: FoodSafetyRequest) -> FoodSafetyResponse:
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
            urgency_priority = 1
        elif urgency_score <= 50:
            urgency_level = "Medium"
            urgency_priority = 2
        elif urgency_score <= 75:
            urgency_level = "High"
            urgency_priority = 3
        else:
            urgency_level = "Critical"
            urgency_priority = 4
            
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

    def predict_demand(self, request: DemandForecastRequest) -> DemandForecastResponse:
        if not self.demand_model or not self.demand_feature_scaler or not self.demand_target_scaler:
            raise RuntimeError("Demand forecasting model or scalers are not loaded")

        features_order = [
            "week", "center_id", "meal_id", "checkout_price", "base_price",
            "emailer_for_promotion", "homepage_featured", "category", "cuisine",
            "city_code", "region_code", "center_type", "op_area", "discount",
            "discount_percent", "price_diff", "is_discounted"
        ]

        if not request.features:
            raise ValueError("No features provided for demand forecast")

        # Extract features in the exact order expected by the model
        try:
            feature_values = []
            for feat in features_order:
                if feat not in request.features:
                    raise ValueError(f"Missing required feature: {feat}")
                feature_values.append(float(request.features[feat]))
        except Exception as e:
            raise ValueError(f"Invalid input features: {e}")

        try:
            # 1. Scale features
            features_array = np.array([feature_values])
            features_scaled = self.demand_feature_scaler.transform(features_array)
            
            # 2. Convert to tensor
            features_tensor = torch.tensor(features_scaled, dtype=torch.float32)
            
            # 3. Run inference
            with torch.no_grad():
                prediction_scaled = self.demand_model(features_tensor).numpy()
                
            # 4. Inverse transform prediction
            prediction_actual = self.demand_target_scaler.inverse_transform(prediction_scaled)
            
            # Ensure no negative demand
            predicted_demand = float(prediction_actual[0][0])
            predicted_demand = max(0.0, predicted_demand)
            
            return DemandForecastResponse(predicted_demand=round(predicted_demand, 2))
        except Exception as e:
            logger.error(f"Demand inference error: {e}")
            raise RuntimeError(f"Demand inference failed: {str(e)}")

    def extract_donation_ner(self, request: DonationNERRequest) -> DonationNERResponse:
        # MOCK IMPLEMENTATION FOR .PTH MODEL
        logger.info("Using mock inference for Donation NER BiLSTM Attention (.pth)")
        
        text = request.text.lower()
        food_item = "Assorted food"
        quantity = "10 kg"
        location = "Local address"
        pickup_time = "Today 5 PM"
        
        if "dal" in text or "rice" in text:
            food_item = "Dal and Rice"
        if "kg" in text:
            words = text.split()
            for i, w in enumerate(words):
                if w == "kg" and i > 0:
                    quantity = f"{words[i-1]} kg"
                    
        return DonationNERResponse(
            food_item=food_item,
            quantity=quantity,
            location=location,
            pickup_time=pickup_time
        )
