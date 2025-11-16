-- =====================================================
-- NAVASPURTHI 2025 REGISTRATION SYSTEM MIGRATION
-- =====================================================
-- Run this in Supabase SQL Editor

-- Create registrations table for new system
CREATE TABLE IF NOT EXISTS new_registrations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    registration_id TEXT UNIQUE NOT NULL,
    session_token TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    college TEXT NOT NULL,
    age_group TEXT NOT NULL,
    event_name TEXT NOT NULL,
    profile_image_path TEXT,
    ai_image_path TEXT,
    id_card_path TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'completed', 'failed')),
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_new_registrations_email ON new_registrations(email);
CREATE INDEX IF NOT EXISTS idx_new_registrations_phone ON new_registrations(phone);
CREATE INDEX IF NOT EXISTS idx_new_registrations_status ON new_registrations(status);
CREATE INDEX IF NOT EXISTS idx_new_registrations_session_token ON new_registrations(session_token);
CREATE INDEX IF NOT EXISTS idx_new_registrations_registration_id ON new_registrations(registration_id);
CREATE INDEX IF NOT EXISTS idx_new_registrations_created_at ON new_registrations(created_at);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_new_registrations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_new_registrations_updated_at ON new_registrations;
CREATE TRIGGER update_new_registrations_updated_at 
    BEFORE UPDATE ON new_registrations
    FOR EACH ROW EXECUTE FUNCTION update_new_registrations_updated_at();

-- Enable RLS
ALTER TABLE new_registrations ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Service role full access" ON new_registrations;
CREATE POLICY "Service role full access" ON new_registrations
    FOR ALL USING (true);

-- Create function to generate registration ID
CREATE OR REPLACE FUNCTION generate_registration_id()
RETURNS TEXT AS $$
DECLARE
    new_id TEXT;
    counter INTEGER := 1;
    date_part TEXT;
BEGIN
    date_part := TO_CHAR(NOW(), 'YYYYMMDD');
    
    LOOP
        new_id := 'NAVAS-' || date_part || '-' || LPAD(counter::TEXT, 4, '0');
        
        -- Check if ID exists
        IF NOT EXISTS (SELECT 1 FROM new_registrations WHERE registration_id = new_id) THEN
            RETURN new_id;
        END IF;
        
        counter := counter + 1;
        
        -- Safety check to prevent infinite loop
        IF counter > 9999 THEN
            RAISE EXCEPTION 'Cannot generate unique registration ID for date %', date_part;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create function to generate session token
CREATE OR REPLACE FUNCTION generate_session_token()
RETURNS TEXT AS $$
BEGIN
    RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Registration system database schema created successfully!';
    RAISE NOTICE '✅ Tables: new_registrations';
    RAISE NOTICE '✅ Indexes: email, phone, status, session_token, registration_id';
    RAISE NOTICE '✅ Functions: generate_registration_id(), generate_session_token()';
END $$;
