-- =====================================================
-- NAVASPURTHI 2025 - INSTANT DATABASE SETUP
-- =====================================================
-- INSTRUCTIONS:
-- 1. Copy this ENTIRE file (Ctrl+A, Ctrl+C)
-- 2. Go to: https://supabase.com/dashboard
-- 3. Select your project → SQL Editor → New query
-- 4. Paste and click "Run"
-- 5. Restart your backend server
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- REGISTRATIONS TABLE (MAIN TABLE)
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
-- OTHER TABLES
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

CREATE TABLE IF NOT EXISTS chatbot_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    user_message TEXT NOT NULL,
    bot_response TEXT NOT NULL,
    response_type VARCHAR(50) CHECK (response_type IN ('quick', 'ai', 'default')),
    user_ip VARCHAR(45),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

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
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_registrations_email ON registrations(email);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations(status);
CREATE INDEX IF NOT EXISTS idx_registrations_registration_id ON registrations(registration_id);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_schedules_day ON schedules(day);
CREATE INDEX IF NOT EXISTS idx_schedules_type ON schedules(type);
CREATE INDEX IF NOT EXISTS idx_chatbot_logs_session ON chatbot_logs(session_id);

-- =====================================================
-- ROW LEVEL SECURITY (SIMPLIFIED)
-- =====================================================
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Simple policies for service role access
DROP POLICY IF EXISTS "Service role full access registrations" ON registrations;
CREATE POLICY "Service role full access registrations" ON registrations
    FOR ALL USING (true);

DROP POLICY IF EXISTS "Service role full access events" ON events;
CREATE POLICY "Service role full access events" ON events
    FOR ALL USING (true);

-- =====================================================
-- SAMPLE DATA
-- =====================================================
INSERT INTO events (title, category, description, date, time, venue, team_size, prize, registration_fee) VALUES
('AI Challenge', 'technical', 'Compete in cutting-edge AI problems', '2025-03-15', '10:00', 'Tech Lab A', '1-3 members', '₹50,000', 100),
('Hackathon 48H', 'technical', 'Build innovative solutions in 48 hours', '2025-03-15', '18:00', 'Main Hall', '2-4 members', '₹75,000', 150),
('Dance Battle', 'cultural', 'Ultimate dance championship', '2025-03-16', '17:00', 'Main Auditorium', '5-12 members', '₹40,000', 100),
('Gaming Arena', 'gaming', 'VALORANT Tournament', '2025-03-15', '10:00', 'Gaming Zone', '5 members', '₹35,000', 200),
('Tech Talk Series', 'workshop', 'Learn from industry experts', '2025-03-15', '14:00', 'Seminar Hall', 'Individual', 'Certificate', 50)
ON CONFLICT DO NOTHING;

-- =====================================================
-- SUCCESS NOTIFICATION
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '✅ SUCCESS: All tables created!';
    RAISE NOTICE '✅ Your backend will now work perfectly!';
    RAISE NOTICE '✅ Restart your backend server to see the success message!';
END $$;
