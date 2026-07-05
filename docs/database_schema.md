# SharePlate Database Schema

This document outlines the database schema for the SharePlate platform, defining the structure, purpose, and relationships of the main tables.

---

## 1. Users Table
**Purpose**: Stores information about all platform users, including donors, NGOs, and system administrators.

**Columns & Data Types**:
- `id`: UUID (Primary Key)
- `name`: String
- `email`: String (Unique)
- `role`: Enum
- `phone`: String
- `address`: Text
- `latitude`: Float
- `longitude`: Float
- `created_at`: Timestamp

**Status / Enum Values**:
- `role`: `donor` | `ngo` | `admin`

**Relationships**:
- One-to-Many with `donations` (via `donor_id`)
- One-to-Many with `ngo_requests` (via `ngo_id`)
- One-to-Many with `notifications` (via `user_id`)

---

## 2. Donations Table
**Purpose**: Records all food donations created by donors, along with food condition, availability time, and AI-predicted spoilage risk.

**Columns & Data Types**:
- `id`: UUID (Primary Key)
- `donor_id`: UUID (Foreign Key -> `users.id`)
- `food_type`: String
- `quantity`: Integer/Float
- `description`: Text
- `prepared_at`: Timestamp
- `available_until`: Timestamp
- `food_condition`: String
- `location`: Text
- `latitude`: Float
- `longitude`: Float
- `status`: Enum
- `spoilage_risk_score`: Float
- `created_at`: Timestamp

**Status / Enum Values**:
- `status`: `pending` | `matched` | `picked_up` | `delivered` | `expired`

**Relationships**:
- Belongs to `users` (Donor)
- One-to-Many with `matches`

---

## 3. NGO Requests Table
**Purpose**: Captures food requests created by NGOs, including required meals, preferred food types, and urgency.

**Columns & Data Types**:
- `id`: UUID (Primary Key)
- `ngo_id`: UUID (Foreign Key -> `users.id`)
- `meals_needed`: Integer
- `preferred_food_type`: String
- `urgency_level`: String
- `required_by`: Timestamp
- `location`: Text
- `latitude`: Float
- `longitude`: Float
- `status`: Enum
- `created_at`: Timestamp

**Status / Enum Values**:
- `status`: `open` | `matched` | `fulfilled` | `cancelled`

**Relationships**:
- Belongs to `users` (NGO)
- One-to-Many with `matches`

---

## 4. Matches Table
**Purpose**: Records algorithmic or manual matches linking food donations to specific NGO requests.

**Columns & Data Types**:
- `id`: UUID (Primary Key)
- `donation_id`: UUID (Foreign Key -> `donations.id`)
- `request_id`: UUID (Foreign Key -> `ngo_requests.id`)
- `donor_id`: UUID (Foreign Key -> `users.id`)
- `ngo_id`: UUID (Foreign Key -> `users.id`)
- `distance_km`: Float
- `match_score`: Float (AI generated score)
- `priority_level`: String
- `recommended_pickup_time`: Timestamp
- `status`: Enum
- `created_at`: Timestamp

**Status / Enum Values**:
- `status`: `suggested` | `accepted` | `rejected` | `completed`

**Relationships**:
- Belongs to `donations`
- Belongs to `ngo_requests`
- Belongs to `users` (Donor & NGO)
- One-to-One with `pickups`

---

## 5. Pickups Table
**Purpose**: Tracks logistical details of transferring food from the donor to the NGO.

**Columns & Data Types**:
- `id`: UUID (Primary Key)
- `match_id`: UUID (Foreign Key -> `matches.id`)
- `pickup_status`: Enum
- `pickup_time`: Timestamp (Nullable)
- `delivery_time`: Timestamp (Nullable)
- `volunteer_name`: String (Nullable)
- `volunteer_contact`: String (Nullable)
- `notes`: Text (Nullable)

**Status / Enum Values**:
- `pickup_status`: `pending` | `accepted` | `picked_up` | `delivered`

**Relationships**:
- Belongs to `matches`

---

## 6. Notifications Table
**Purpose**: Stores system alerts, updates, and messages pushed to users.

**Columns & Data Types**:
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key -> `users.id`)
- `title`: String
- `message`: Text
- `type`: String
- `is_read`: Boolean (Default: false)
- `created_at`: Timestamp

**Relationships**:
- Belongs to `users`
