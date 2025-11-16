-- Add new columns to registrations table for AI features
ALTER TABLE registrations 
ADD COLUMN IF NOT EXISTS ai_image_url TEXT,
ADD COLUMN IF NOT EXISTS id_card_url TEXT,
ADD COLUMN IF NOT EXISTS processing_status TEXT DEFAULT 'pending';

-- Update existing records to have processing_status
UPDATE registrations 
SET processing_status = 'completed' 
WHERE processing_status IS NULL;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_registrations_processing_status ON registrations(processing_status);
CREATE INDEX IF NOT EXISTS idx_registrations_created_at ON registrations(created_at);

-- Add comments for documentation
COMMENT ON COLUMN registrations.ai_image_url IS 'URL to AI-enhanced profile image';
COMMENT ON COLUMN registrations.id_card_url IS 'URL to generated ID card';
COMMENT ON COLUMN registrations.processing_status IS 'Status of AI processing: pending, processing, completed, failed';
