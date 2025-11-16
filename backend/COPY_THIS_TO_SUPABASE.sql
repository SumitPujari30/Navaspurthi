-- =====================================================
-- NAVASPURTHI 2025 DATABASE SCHEMA
-- =====================================================
-- Copy this ENTIRE file and paste into Supabase SQL Editor
-- Then click "Run" to create all tables
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ADMINS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS admins (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- REGISTRATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS registrations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    registration_id VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    college VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL,
    year VARCHAR(20) NOT NULL,
    events JSONB NOT NULL DEFAULT '[]',
    profile_image_path TEXT,
    ai_image_path TEXT,
    ai_image_url TEXT,
    ai_processed BOOLEAN DEFAULT FALSE,
    ai_processed_at TIMESTAMPTZ,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
    payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed')),
    amount_paid DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_registrations_email ON registrations(email);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations(status);
CREATE INDEX IF NOT EXISTS idx_registrations_registration_id ON registrations(registration_id);

-- =====================================================
-- EVENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('technical', 'cultural', 'gaming', 'workshop', 'general')),
    description TEXT,
    date DATE NOT NULL,
    time TIME NOT NULL,
    venue VARCHAR(255) NOT NULL,
    team_size VARCHAR(100),
    max_participants INTEGER DEFAULT 100,
    current_participants INTEGER DEFAULT 0,
    prize VARCHAR(100),
    rules JSONB DEFAULT '[]',
    image TEXT,
    registration_fee DECIMAL(10, 2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for category
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);

-- =====================================================
-- SCHEDULES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS schedules (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    day VARCHAR(20) NOT NULL CHECK (day IN ('day1', 'day2', 'day3')),
    time TIME NOT NULL,
    event VARCHAR(255) NOT NULL,
    venue VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('technical', 'cultural', 'gaming', 'workshop', 'ceremony', 'entertainment', 'general')),
    description TEXT,
    speaker VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_schedules_day ON schedules(day);
CREATE INDEX IF NOT EXISTS idx_schedules_type ON schedules(type);

-- =====================================================
-- EVENT_REGISTRATIONS TABLE (Many-to-Many relationship)
-- =====================================================
CREATE TABLE IF NOT EXISTS event_registrations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    registration_id UUID REFERENCES registrations(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    team_name VARCHAR(255),
    team_members JSONB DEFAULT '[]',
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(registration_id, event_id)
);

-- =====================================================
-- GALLERY TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS gallery (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(20) CHECK (type IN ('image', 'video')),
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    category VARCHAR(50),
    year INTEGER,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- CHATBOT_LOGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS chatbot_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    user_message TEXT NOT NULL,
    bot_response TEXT NOT NULL,
    response_type VARCHAR(50) CHECK (response_type IN ('quick', 'ai', 'default')),
    user_ip VARCHAR(45),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for session_id
CREATE INDEX IF NOT EXISTS idx_chatbot_logs_session ON chatbot_logs(session_id);

-- =====================================================
-- FEEDBACK TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS feedback (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255),
    subject VARCHAR(255),
    message TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'read', 'resolved')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SPONSORS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS sponsors (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    logo_url TEXT,
    website VARCHAR(255),
    tier VARCHAR(50) CHECK (tier IN ('title', 'platinum', 'gold', 'silver', 'bronze')),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at (DROP first to avoid conflicts)
DROP TRIGGER IF EXISTS update_admins_updated_at ON admins;
CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON admins
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_registrations_updated_at ON registrations;
CREATE TRIGGER update_registrations_updated_at BEFORE UPDATE ON registrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_events_updated_at ON events;
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_schedules_updated_at ON schedules;
CREATE TRIGGER update_schedules_updated_at BEFORE UPDATE ON schedules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on tables
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can view events" ON events;
DROP POLICY IF EXISTS "Public can view schedules" ON schedules;
DROP POLICY IF EXISTS "Public can view gallery" ON gallery;
DROP POLICY IF EXISTS "Authenticated users can create registrations" ON registrations;
DROP POLICY IF EXISTS "Users can view own registrations" ON registrations;
DROP POLICY IF EXISTS "Admins can do everything" ON registrations;
DROP POLICY IF EXISTS "Admins can manage events" ON events;
DROP POLICY IF EXISTS "Admins can manage schedules" ON schedules;

-- Create policies for public access
CREATE POLICY "Public can view events" ON events
    FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view schedules" ON schedules
    FOR SELECT USING (true);

CREATE POLICY "Public can view gallery" ON gallery
    FOR SELECT USING (true);

-- Create policies for authenticated users
CREATE POLICY "Authenticated users can create registrations" ON registrations
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own registrations" ON registrations
    FOR SELECT USING (email = current_setting('request.jwt.claims', true)::json->>'email');

-- Create policies for admin access (using service role)
CREATE POLICY "Service role can do everything on registrations" ON registrations
    FOR ALL USING (true);

CREATE POLICY "Service role can manage events" ON events
    FOR ALL USING (true);

CREATE POLICY "Service role can manage schedules" ON schedules
    FOR ALL USING (true);

-- =====================================================
-- SEED DATA
-- =====================================================

-- Insert sample events
INSERT INTO events (title, category, description, date, time, venue, team_size, prize, registration_fee) VALUES
('AI Challenge', 'technical', 'Compete in cutting-edge AI problems', '2025-03-15', '10:00', 'Tech Lab A', '1-3 members', '₹50,000', 100),
('Hackathon 48H', 'technical', 'Build innovative solutions in 48 hours', '2025-03-15', '18:00', 'Main Hall', '2-4 members', '₹75,000', 150),
('Dance Battle', 'cultural', 'Ultimate dance championship', '2025-03-16', '17:00', 'Main Auditorium', '5-12 members', '₹40,000', 100),
('Gaming Arena', 'gaming', 'VALORANT Tournament', '2025-03-15', '10:00', 'Gaming Zone', '5 members', '₹35,000', 200),
('Tech Talk Series', 'workshop', 'Learn from industry experts', '2025-03-15', '14:00', 'Seminar Hall', 'Individual', 'Certificate', 50)
ON CONFLICT DO NOTHING;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '✅ Database schema created successfully!';
    RAISE NOTICE '✅ All tables, indexes, and policies are ready';
    RAISE NOTICE '✅ You can now restart your backend server';
END $$;
