# SharePlate API Design Document

This document outlines the RESTful API endpoints for the SharePlate platform, organized by module.

---

## 1. Authentication

### POST /api/auth/register

**Purpose:**
Register a new user (donor or NGO).

**Authentication Required:** No

**Request:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "securepassword",
  "role": "donor",
  "phone": "+1234567890",
  "address": "123 Main St, City",
  "latitude": 40.7128,
  "longitude": -74.0060
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user_id": "uuid-1234",
  "token": "jwt-token-string"
}
```

### POST /api/auth/login

**Purpose:**
Authenticate a user and return a JWT token.

**Authentication Required:** No

**Request:**
```json
{
  "email": "jane@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid-1234",
    "role": "donor"
  },
  "token": "jwt-token-string"
}
```

### GET /api/auth/me

**Purpose:**
Retrieve the profile of the currently authenticated user.

**Authentication Required:** Yes

**Request:**
*(No Body)*

**Response:**
```json
{
  "id": "uuid-1234",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "role": "donor",
  "phone": "+1234567890",
  "address": "123 Main St, City",
  "latitude": 40.7128,
  "longitude": -74.0060
}
```

---

## 2. Donations

### POST /api/donations

**Purpose:**
Create a new food donation.

**Authentication Required:** Yes (Donor)

**Request:**
```json
{
  "food_type": "Cooked Meals",
  "quantity": 50,
  "description": "Leftover rice and curry from an event.",
  "prepared_at": "2026-07-05T18:00:00Z",
  "available_until": "2026-07-06T10:00:00Z",
  "food_condition": "Fresh",
  "location": "123 Main St, City",
  "latitude": 40.7128,
  "longitude": -74.0060
}
```

**Response:**
```json
{
  "message": "Donation created successfully",
  "donation_id": "uuid-donation-123",
  "status": "pending",
  "spoilage_risk_score": 0.12
}
```

### GET /api/donations

**Purpose:**
List donations, with optional filtering by status or location.

**Authentication Required:** Yes

**Request:**
*(Query Parameters: ?status=pending&limit=10)*

**Response:**
```json
{
  "donations": [
    {
      "id": "uuid-donation-123",
      "donor_id": "uuid-donor-1",
      "food_type": "Cooked Meals",
      "quantity": 50,
      "status": "pending"
    }
  ],
  "total": 1
}
```

### GET /api/donations/{id}

**Purpose:**
Get detailed information of a specific donation.

**Authentication Required:** Yes

**Request:**
*(No Body)*

**Response:**
```json
{
  "id": "uuid-donation-123",
  "donor_id": "uuid-donor-1",
  "food_type": "Cooked Meals",
  "quantity": 50,
  "description": "Leftover rice and curry from an event.",
  "prepared_at": "2026-07-05T18:00:00Z",
  "available_until": "2026-07-06T10:00:00Z",
  "food_condition": "Fresh",
  "location": "123 Main St, City",
  "status": "pending",
  "spoilage_risk_score": 0.12,
  "created_at": "2026-07-05T20:00:00Z"
}
```

### PATCH /api/donations/{id}/status

**Purpose:**
Update the status of a donation (e.g., to cancelled or expired).

**Authentication Required:** Yes (Donor or Admin)

**Request:**
```json
{
  "status": "expired"
}
```

**Response:**
```json
{
  "message": "Donation status updated successfully",
  "donation_id": "uuid-donation-123",
  "new_status": "expired"
}
```

---

## 3. NGO Requests

### POST /api/requests

**Purpose:**
Create a new food request from an NGO.

**Authentication Required:** Yes (NGO)

**Request:**
```json
{
  "meals_needed": 100,
  "preferred_food_type": "Non-Perishable",
  "urgency_level": "High",
  "required_by": "2026-07-07T12:00:00Z",
  "location": "456 Charity Ln, City",
  "latitude": 40.7130,
  "longitude": -74.0070
}
```

**Response:**
```json
{
  "message": "Request created successfully",
  "request_id": "uuid-request-456",
  "status": "open"
}
```

### GET /api/requests

**Purpose:**
List open NGO requests.

**Authentication Required:** Yes

**Request:**
*(Query Parameters: ?status=open&urgency=High)*

**Response:**
```json
{
  "requests": [
    {
      "id": "uuid-request-456",
      "ngo_id": "uuid-ngo-1",
      "meals_needed": 100,
      "urgency_level": "High",
      "status": "open"
    }
  ]
}
```

### PATCH /api/requests/{id}/status

**Purpose:**
Update the status of an NGO request.

**Authentication Required:** Yes (NGO or Admin)

**Request:**
```json
{
  "status": "cancelled"
}
```

**Response:**
```json
{
  "message": "Request status updated",
  "request_id": "uuid-request-456",
  "new_status": "cancelled"
}
```

---

## 4. Matching Engine

### GET /api/matches/suggest/{donation_id}

**Purpose:**
Get AI-suggested NGO matches for a specific donation.

**Authentication Required:** Yes

**Request:**
*(No Body)*

**Response:**
```json
{
  "donation_id": "uuid-donation-123",
  "suggested_matches": [
    {
      "request_id": "uuid-request-456",
      "ngo_id": "uuid-ngo-1",
      "distance_km": 2.5,
      "match_score": 95.5,
      "priority_level": "High"
    }
  ]
}
```

### POST /api/matches

**Purpose:**
Confirm a match between a donation and an NGO request.

**Authentication Required:** Yes

**Request:**
```json
{
  "donation_id": "uuid-donation-123",
  "request_id": "uuid-request-456",
  "recommended_pickup_time": "2026-07-06T08:00:00Z"
}
```

**Response:**
```json
{
  "message": "Match created successfully",
  "match_id": "uuid-match-789",
  "status": "suggested"
}
```

### PATCH /api/matches/{id}/status

**Purpose:**
Accept or reject a match (usually performed by the NGO).

**Authentication Required:** Yes (NGO)

**Request:**
```json
{
  "status": "accepted"
}
```

**Response:**
```json
{
  "message": "Match accepted",
  "match_id": "uuid-match-789",
  "new_status": "accepted"
}
```

---

## 5. Pickups & Tracking

### POST /api/pickups

**Purpose:**
Initialize a pickup for an accepted match.

**Authentication Required:** Yes

**Request:**
```json
{
  "match_id": "uuid-match-789",
  "volunteer_name": "John Smith",
  "volunteer_contact": "+1987654321",
  "notes": "Will arrive in a white van."
}
```

**Response:**
```json
{
  "message": "Pickup scheduled",
  "pickup_id": "uuid-pickup-101",
  "pickup_status": "pending"
}
```

### PATCH /api/pickups/{id}/status

**Purpose:**
Update the tracking status of a pickup.

**Authentication Required:** Yes

**Request:**
```json
{
  "pickup_status": "picked_up",
  "pickup_time": "2026-07-06T08:15:00Z"
}
```

**Response:**
```json
{
  "message": "Pickup status updated",
  "pickup_id": "uuid-pickup-101",
  "new_status": "picked_up"
}
```

---

## 6. Analytics

### GET /api/analytics/dashboard

**Purpose:**
Fetch aggregated stats for the global or user dashboard.

**Authentication Required:** Yes

**Request:**
*(Query Parameters: ?timeframe=monthly)*

**Response:**
```json
{
  "total_meals_donated": 5400,
  "active_ngo_requests": 12,
  "spoilage_prevented_kg": 1200,
  "successful_matches": 145
}
```

### GET /api/analytics/user/{user_id}

**Purpose:**
Get impact metrics for a specific user.

**Authentication Required:** Yes

**Request:**
*(No Body)*

**Response:**
```json
{
  "user_id": "uuid-donor-1",
  "donations_made": 15,
  "meals_provided": 450,
  "badges": ["Top Donor", "Early Adopter"]
}
```

---

## 7. Admin

### GET /api/admin/users

**Purpose:**
List all users on the platform.

**Authentication Required:** Yes (Admin)

**Request:**
*(Query Parameters: ?role=ngo)*

**Response:**
```json
{
  "users": [
    {
      "id": "uuid-ngo-1",
      "name": "City Food Bank",
      "email": "contact@cityfoodbank.org",
      "role": "ngo",
      "status": "active"
    }
  ]
}
```

### DELETE /api/admin/users/{id}

**Purpose:**
Remove or deactivate a user account.

**Authentication Required:** Yes (Admin)

**Request:**
*(No Body)*

**Response:**
```json
{
  "message": "User deactivated successfully",
  "user_id": "uuid-ngo-1"
}
```
