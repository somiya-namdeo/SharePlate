# SharePlate AI Pipeline

This document outlines the artificial intelligence and machine learning pipelines powering SharePlate. The system is designed to evolve from simple rule-based minimum viable products (MVPs) to advanced Deep Learning models.

---

## 1. NLP Message Extraction
**Purpose**: Automatically extract structured information (food type, quantity, expiry time) from unstructured text messages provided by donors.
**Input**: Unstructured raw text (e.g., "I have 50 boxes of cooked rice available until 8 PM").
**Output**: Structured JSON mapping entities (e.g., `{"food_type": "cooked rice", "quantity": 50, "unit": "boxes", "available_until": "20:00"}`).
**Example**: "Got 10 kg of tomatoes expiring tomorrow" -> `{"food_type": "tomatoes", "quantity": 10, "unit": "kg", "expiry": "tomorrow"}`.
**Dataset Needed**: Custom annotated dataset of food donation texts with BIO tagging for Named Entity Recognition (NER).
**Model/Algorithm**: Named Entity Recognition (NER) and parsing.
**Evaluation Metrics**: Precision, Recall, and F1-Score for entity extraction.
**MVP Version**: Regular expressions + spaCy's pre-trained models for basic entity extraction.
**Advanced Version**: Custom-trained BERT or RoBERTa models fine-tuned specifically for food and quantity extraction.

---

## 2. Urgency Classification
**Purpose**: Classify the urgency of an NGO's request or a donation based on the text description to prioritize critical matches.
**Input**: Text description of the request or donation.
**Output**: Urgency category (`Low`, `Medium`, `High`, `Critical`).
**Example**: "Our shelter is out of food and we need meals immediately for 100 people." -> `Critical`.
**Dataset Needed**: Labeled dataset of requests categorized into urgency levels.
**Model/Algorithm**: Multi-class text classification.
**Evaluation Metrics**: Accuracy, F1-Score, and Confusion Matrix.
**MVP Version**: Keyword matching (e.g., "urgent", "immediately", "starving") and simple TF-IDF with Logistic Regression.
**Advanced Version**: BiLSTM + Attention mechanism or a BERT-based sequence classifier.

---

## 3. Spoilage Risk Prediction
**Purpose**: Predict the likelihood and time-to-spoilage for donated food items to ensure safe redistribution.
**Input**: Food type, prepared time, current temperature, storage condition, humidity.
**Output**: Spoilage risk score (0.0 to 1.0) or estimated hours until unsafe.
**Example**: (Food: "Cooked Rice", Prep: "2 hours ago", Temp: "30C") -> `Risk Score: 0.85 (High)`.
**Dataset Needed**: Food safety datasets correlating food types, environmental conditions, and spoilage timelines.
**Model/Algorithm**: Regression or classification model mapping environmental features to spoilage risk.
**Evaluation Metrics**: Mean Absolute Error (MAE), Root Mean Square Error (RMSE), ROC-AUC.
**MVP Version**: Hardcoded rule-based scoring based on FDA/FSSAI food safety guidelines (e.g., cooked food > 4 hours at room temp = high risk).
**Advanced Version**: XGBoost or Artificial Neural Networks (ANN) utilizing real-time weather APIs and complex storage data.

---

## 4. NGO Demand Forecasting
**Purpose**: Predict future food demand for specific NGOs based on historical request data, time of year, and local events.
**Input**: Historical request volume, dates, holidays, weather conditions.
**Output**: Predicted number of meals needed for the upcoming week/month.
**Example**: (NGO: "City Shelter", Date: "Dec 20") -> `Predicted Demand: 500 meals`.
**Dataset Needed**: Historical time-series data of NGO requests mapped with exogenous variables (holidays, weather).
**Model/Algorithm**: Time-series forecasting.
**Evaluation Metrics**: Mean Absolute Percentage Error (MAPE), RMSE.
**MVP Version**: Moving averages or simple linear regression based on recent historical data.
**Advanced Version**: LSTM/GRU networks capable of capturing complex temporal dependencies and seasonality.

---

## 5. Surplus Food Prediction
**Purpose**: Anticipate when and where large surpluses of food (e.g., from restaurants or banquet halls) are likely to occur.
**Input**: Historical donation data, day of the week, local event schedules, weather.
**Output**: Probability and expected volume of surplus food generation in a given area.
**Example**: (Location: "Downtown Banquet Hall", Day: "Saturday") -> `High Probability of 100+ kg surplus`.
**Dataset Needed**: Time-series data of historical donations from commercial partners.
**Model/Algorithm**: Time-series forecasting and regression.
**Evaluation Metrics**: RMSE, MAE, R-Squared.
**MVP Version**: Historical averages and simple rule-based logic (e.g., weekends yield 50% more surplus).
**Advanced Version**: LSTM/GRU or Prophet models incorporating external event data.

---

## 6. Smart Matching Engine
**Purpose**: Optimally pair food donations with NGO requests considering distance, urgency, food type, and spoilage risk.
**Input**: Donation details (location, type, expiry, risk score) + NGO request details (location, need, urgency).
**Output**: Ranked list of best NGO matches for a given donation (or vice versa) with a match score.
**Example**: Donation A matched to NGO B with `Match Score: 98.5%` due to 2km distance, high urgency, and matching food type.
**Dataset Needed**: Historical accepted/rejected matches to learn preferences, plus geospatial data.
**Model/Algorithm**: Multi-objective optimization / Recommendation System.
**Evaluation Metrics**: Mean Reciprocal Rank (MRR), Normalized Discounted Cumulative Gain (NDCG), average distance per match.
**MVP Version**: Weighted scoring formula (e.g., `Score = (w1 * Distance) + (w2 * Urgency) + (w3 * FoodMatch)`).
**Advanced Version**: XGBoost-based Learning-to-Rank algorithms or Graph Neural Networks (GNN) to dynamically weight features based on historical match success.
