-- SharePlate PostgreSQL Schema (Supabase)

-- 1. users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('donor', 'ngo', 'admin')),
    phone VARCHAR(50),
    address TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- TODO: Add RLS policies for users (e.g., users can view their own profile, admin can view all)

-- 2. donations Table
CREATE TABLE donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    food_type VARCHAR(255) NOT NULL,
    quantity NUMERIC NOT NULL,
    description TEXT,
    prepared_at TIMESTAMP WITH TIME ZONE,
    available_until TIMESTAMP WITH TIME ZONE,
    food_condition VARCHAR(100),
    location TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'matched', 'picked_up', 'delivered', 'expired')),
    spoilage_risk_score DOUBLE PRECISION,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);
CREATE INDEX idx_donations_donor_id ON donations(donor_id);
CREATE INDEX idx_donations_status ON donations(status);
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
-- TODO: Add RLS policies for donations (e.g., donor can create/update their own, NGOs can view available donations)

-- 3. ngo_requests Table
CREATE TABLE ngo_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ngo_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    meals_needed INTEGER NOT NULL,
    preferred_food_type VARCHAR(255),
    urgency_level VARCHAR(50) NOT NULL CHECK (urgency_level IN ('Low', 'Medium', 'High', 'Critical')),
    required_by TIMESTAMP WITH TIME ZONE,
    location TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    status VARCHAR(50) NOT NULL CHECK (status IN ('open', 'matched', 'fulfilled', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);
CREATE INDEX idx_ngo_requests_ngo_id ON ngo_requests(ngo_id);
CREATE INDEX idx_ngo_requests_status ON ngo_requests(status);
ALTER TABLE ngo_requests ENABLE ROW LEVEL SECURITY;
-- TODO: Add RLS policies for ngo_requests (e.g., NGOs can create/update their own, donors/admin can view)

-- 4. matches Table
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donation_id UUID NOT NULL REFERENCES donations(id) ON DELETE CASCADE,
    request_id UUID NOT NULL REFERENCES ngo_requests(id) ON DELETE CASCADE,
    donor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ngo_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    distance_km DOUBLE PRECISION,
    match_score DOUBLE PRECISION,
    priority_level VARCHAR(50),
    recommended_pickup_time TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) NOT NULL CHECK (status IN ('suggested', 'accepted', 'rejected', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);
CREATE INDEX idx_matches_donor_id ON matches(donor_id);
CREATE INDEX idx_matches_ngo_id ON matches(ngo_id);
CREATE INDEX idx_matches_status ON matches(status);
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
-- TODO: Add RLS policies for matches (e.g., involved donor and ngo can view/update)

-- 5. pickups Table
CREATE TABLE pickups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    pickup_status VARCHAR(50) NOT NULL CHECK (pickup_status IN ('pending', 'accepted', 'picked_up', 'delivered')),
    pickup_time TIMESTAMP WITH TIME ZONE,
    delivery_time TIMESTAMP WITH TIME ZONE,
    volunteer_name VARCHAR(255),
    volunteer_contact VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);
CREATE INDEX idx_pickups_match_id ON pickups(match_id);
ALTER TABLE pickups ENABLE ROW LEVEL SECURITY;
-- TODO: Add RLS policies for pickups (e.g., involved users can view)

-- 6. notifications Table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(100),
    is_read BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
-- TODO: Add RLS policies for notifications (e.g., users can only view their own notifications)

-- Trigger function for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc', now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_donations_updated_at BEFORE UPDATE ON donations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ngo_requests_updated_at BEFORE UPDATE ON ngo_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pickups_updated_at BEFORE UPDATE ON pickups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
