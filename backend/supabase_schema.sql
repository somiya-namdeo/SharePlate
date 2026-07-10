-- SharePlate Supabase PostgreSQL Schema
-- Run this in the Supabase SQL Editor

-- 1. PROFILES TABLE (Linked to auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('donor', 'ngo', 'volunteer', 'admin')) DEFAULT 'donor',
    phone VARCHAR(50),
    organization VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Auto-create profile trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    COALESCE(new.raw_user_meta_data->>'role', 'donor')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 2. DONATIONS TABLE
CREATE TABLE donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    food_type VARCHAR(255) NOT NULL,
    quantity NUMERIC NOT NULL,
    description TEXT,
    prepared_at TIMESTAMP WITH TIME ZONE,
    available_until TIMESTAMP WITH TIME ZONE,
    food_condition VARCHAR(100),
    address TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'matched', 'picked_up', 'delivered', 'expired')) DEFAULT 'pending',
    spoilage_risk_score DOUBLE PRECISION,
    
    -- AI Prediction Fields
    safety_status VARCHAR(20),
    confidence_score DOUBLE PRECISION,
    predicted_shelf_life DOUBLE PRECISION,
    urgency_level VARCHAR(20),
    prediction_time TIMESTAMP WITH TIME ZONE,
    
    -- Media
    image_url TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

ALTER TABLE donations ENABLE ROW LEVEL SECURITY;


-- 3. NGO REQUESTS TABLE
CREATE TABLE ngo_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ngo_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    meals_needed INTEGER NOT NULL,
    preferred_food_type VARCHAR(255),
    urgency_level VARCHAR(50) NOT NULL CHECK (urgency_level IN ('Low', 'Medium', 'High', 'Critical')),
    required_by TIMESTAMP WITH TIME ZONE,
    address TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    status VARCHAR(50) NOT NULL CHECK (status IN ('open', 'matched', 'fulfilled', 'cancelled')) DEFAULT 'open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

ALTER TABLE ngo_requests ENABLE ROW LEVEL SECURITY;


-- 4. MATCHES TABLE
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donation_id UUID NOT NULL REFERENCES donations(id) ON DELETE CASCADE,
    request_id UUID NOT NULL REFERENCES ngo_requests(id) ON DELETE CASCADE,
    donor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    ngo_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    distance_km DOUBLE PRECISION,
    match_score DOUBLE PRECISION,
    priority_level VARCHAR(50),
    recommended_pickup_time TIMESTAMP WITH TIME ZONE,
    estimated_eta INTEGER,
    status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'suggested', 'accepted', 'rejected', 'picked_up', 'completed', 'cancelled')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

ALTER TABLE matches ENABLE ROW LEVEL SECURITY;


-- 5. NOTIFICATION PREFERENCES
CREATE TABLE notification_preferences (
    user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    notifications_enabled BOOLEAN DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- 6. AI THRESHOLD SETTINGS
CREATE TABLE ai_threshold_settings (
    user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    safety_threshold DOUBLE PRECISION DEFAULT 0.7,
    match_score_threshold DOUBLE PRECISION DEFAULT 0.8,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- 7. PICKUP PREFERENCES
CREATE TABLE pickup_preferences (
    user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    preferred_times JSONB,
    max_distance_km DOUBLE PRECISION DEFAULT 10.0,
    vehicle_type VARCHAR(50),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);


-- TRIGGER FUNCTION FOR UPDATED_AT
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc', now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_donations_modtime BEFORE UPDATE ON donations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ngo_requests_modtime BEFORE UPDATE ON ngo_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_matches_modtime BEFORE UPDATE ON matches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notification_prefs_modtime BEFORE UPDATE ON notification_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_thresholds_modtime BEFORE UPDATE ON ai_threshold_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pickup_prefs_modtime BEFORE UPDATE ON pickup_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS POLICIES (Basic examples to allow all for authenticated users temporarily)
-- In a real production app, these should be locked down.
CREATE POLICY "Allow authenticated users full access to profiles" ON profiles FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users full access to donations" ON donations FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users full access to ngo_requests" ON ngo_requests FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users full access to matches" ON matches FOR ALL USING (auth.role() = 'authenticated');
