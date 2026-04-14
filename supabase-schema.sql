-- Supabase SQL schema for travel diary
-- Run this in the Supabase SQL Editor

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL DEFAULT '',
    photo TEXT DEFAULT ''
);

-- Travels table
CREATE TABLE IF NOT EXISTS travels (
    id TEXT PRIMARY KEY,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'visited',
    lat DOUBLE PRECISION NOT NULL DEFAULT -14.235,
    lng DOUBLE PRECISION NOT NULL DEFAULT -51.9253,
    rating DOUBLE PRECISION DEFAULT 0,
    rating_p1 DOUBLE PRECISION DEFAULT 0,
    rating_p2 DOUBLE PRECISION DEFAULT 0,
    opinion TEXT DEFAULT '',
    cover_photo TEXT DEFAULT '',
    photos JSONB DEFAULT '[]'::jsonb,
    visit_date TEXT,
    origin_city TEXT DEFAULT '',
    origin_state TEXT DEFAULT '',
    stops JSONB DEFAULT '[]'::jsonb,
    travel_time_hours INTEGER DEFAULT 0,
    travel_time_minutes INTEGER DEFAULT 0,
    distance_km INTEGER DEFAULT 0,
    transport_type TEXT DEFAULT 'carro',
    vehicle_id TEXT DEFAULT '',
    would_return BOOLEAN DEFAULT true,
    activities JSONB DEFAULT '[]'::jsonb,
    food_wishes JSONB DEFAULT '[]'::jsonb,
    hotels JSONB DEFAULT '[]'::jsonb,
    restaurants JSONB DEFAULT '[]'::jsonb,
    visits JSONB DEFAULT '[]'::jsonb,
    budget DOUBLE PRECISION DEFAULT 0,
    saved_amount DOUBLE PRECISION DEFAULT 0,
    highlights TEXT DEFAULT '',
    tips TEXT DEFAULT '',
    created_at TEXT NOT NULL
);

-- Vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    photo TEXT DEFAULT '',
    acquired_date TEXT DEFAULT '',
    type TEXT NOT NULL DEFAULT 'carro',
    created_at TEXT NOT NULL
);

-- Discarded cities table
CREATE TABLE IF NOT EXISTS discarded_cities (
    id SERIAL PRIMARY KEY,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    reason TEXT DEFAULT '',
    discarded_at TEXT NOT NULL
);

-- Missions table
CREATE TABLE IF NOT EXISTS missions (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    type TEXT NOT NULL DEFAULT 'generic',
    category TEXT NOT NULL DEFAULT 'cities',
    target INTEGER DEFAULT 0,
    progress INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT false,
    completed_at TEXT,
    icon TEXT DEFAULT 'FaStar'
);

-- Enable Row Level Security but allow all (personal app)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE travels ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE discarded_cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;

-- Permissive policies (personal app, no auth needed)
CREATE POLICY "Allow all on profiles" ON profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on travels" ON travels FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on vehicles" ON vehicles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on discarded_cities" ON discarded_cities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on missions" ON missions FOR ALL USING (true) WITH CHECK (true);
