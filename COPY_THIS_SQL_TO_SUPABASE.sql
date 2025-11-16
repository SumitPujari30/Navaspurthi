-- ============================================================
-- COPY AND PASTE THIS ENTIRE FILE INTO SUPABASE SQL EDITOR
-- ============================================================

-- Add new columns to registrations table
ALTER TABLE registrations 
ADD COLUMN IF NOT EXISTS participants JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS total_participants INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS profile_image_url TEXT,
ADD COLUMN IF NOT EXISTS id_card_url TEXT,
ADD COLUMN IF NOT EXISTS id_card_path TEXT,
ADD COLUMN IF NOT EXISTS id_card_status VARCHAR(50) DEFAULT 'processing' CHECK (id_card_status IN ('processing', 'ready', 'failed', 'partial')),
ADD COLUMN IF NOT EXISTS id_card_generated_at TIMESTAMPTZ;

-- Make department and year nullable (they were removed from the form)
ALTER TABLE registrations 
ALTER COLUMN department DROP NOT NULL,
ALTER COLUMN year DROP NOT NULL;

-- Create index for id_card_status
CREATE INDEX IF NOT EXISTS idx_registrations_id_card_status ON registrations(id_card_status);

-- Update existing records to have default values
UPDATE registrations 
SET 
  participants = '[]'::jsonb,
  total_participants = 1,
  id_card_status = 'processing'
WHERE participants IS NULL;

-- ============================================================
-- DONE! Now restart your backend server
-- ============================================================
