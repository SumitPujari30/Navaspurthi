-- File: migrations/2025_add_registration_fields.sql
-- Migration for registration rules and group participant features
-- Run this in Supabase SQL Editor

-- 1. Add new fields to registrations table if they don't exist
ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS registration_id text UNIQUE,
  ADD COLUMN IF NOT EXISTS event_category text CHECK (event_category IN ('solo', 'group', 'mixed')),
  ADD COLUMN IF NOT EXISTS participants jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS id_card_url text,
  ADD COLUMN IF NOT EXISTS id_card_generated_at timestamptz,
  ADD COLUMN IF NOT EXISTS primary_participant_email text,
  ADD COLUMN IF NOT EXISTS events jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS total_participants integer DEFAULT 1;

-- 2. Create unique index for registration_id if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'registrations_registration_id_idx') THEN
    CREATE UNIQUE INDEX registrations_registration_id_idx ON public.registrations (registration_id);
  END IF;
END $$;

-- 3. Create index for email lookups if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'registrations_email_idx') THEN
    CREATE INDEX registrations_email_idx ON public.registrations (email);
  END IF;
END $$;

-- 4. Create index for event searches
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'registrations_events_idx') THEN
    CREATE INDEX registrations_events_idx ON public.registrations USING GIN (events);
  END IF;
END $$;

-- 5. Create registration counter table for sequential IDs
CREATE TABLE IF NOT EXISTS public.registration_counter (
  id integer PRIMARY KEY DEFAULT 1,
  current_value integer DEFAULT 0,
  prefix text DEFAULT 'NV25',
  updated_at timestamptz DEFAULT now()
);

-- Initialize counter if not exists
INSERT INTO public.registration_counter (id, current_value, prefix)
VALUES (1, 0, 'NV25')
ON CONFLICT (id) DO NOTHING;

-- 6. Create function to generate next registration ID
CREATE OR REPLACE FUNCTION public.generate_registration_id()
RETURNS text AS $$
DECLARE
  new_id text;
  counter integer;
BEGIN
  -- Lock the counter row and increment
  UPDATE public.registration_counter
  SET current_value = current_value + 1,
      updated_at = now()
  WHERE id = 1
  RETURNING current_value INTO counter;
  
  -- Format as NV25-0001
  new_id := (SELECT prefix FROM public.registration_counter WHERE id = 1) || '-' || LPAD(counter::text, 4, '0');
  
  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- 7. Create RPC function for atomic registration with ID generation
CREATE OR REPLACE FUNCTION public.create_registration_with_id(
  registration_data jsonb
)
RETURNS jsonb AS $$
DECLARE
  new_registration_id text;
  inserted_id integer;
BEGIN
  -- Generate new registration ID
  new_registration_id := public.generate_registration_id();
  
  -- Add registration_id to the data
  registration_data := jsonb_set(registration_data, '{registration_id}', to_jsonb(new_registration_id));
  
  -- Insert registration
  INSERT INTO public.registrations (
    registration_id,
    full_name,
    email,
    phone,
    year,
    college,
    events,
    event_category,
    participants,
    total_participants,
    primary_participant_email,
    created_at
  )
  VALUES (
    new_registration_id,
    registration_data->>'full_name',
    registration_data->>'email',
    registration_data->>'phone',
    registration_data->>'year',
    registration_data->>'college',
    COALESCE(registration_data->'events', '[]'::jsonb),
    registration_data->>'event_category',
    COALESCE(registration_data->'participants', '[]'::jsonb),
    COALESCE((registration_data->>'total_participants')::integer, 1),
    registration_data->>'primary_participant_email',
    now()
  )
  RETURNING id INTO inserted_id;
  
  -- Return the complete registration
  RETURN jsonb_build_object(
    'id', inserted_id,
    'registration_id', new_registration_id,
    'success', true
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.generate_registration_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_registration_with_id(jsonb) TO authenticated;
GRANT SELECT, UPDATE ON public.registration_counter TO authenticated;

-- 9. Add RLS policies if needed
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Allow users to see their own registrations
CREATE POLICY "Users can view own registrations" ON public.registrations
  FOR SELECT USING (auth.uid()::text = user_id OR true); -- Adjust based on your auth setup

-- Allow authenticated users to insert registrations
CREATE POLICY "Authenticated users can create registrations" ON public.registrations
  FOR INSERT WITH CHECK (true);

-- 10. Create index for admin searches
CREATE INDEX IF NOT EXISTS registrations_search_idx ON public.registrations 
  USING GIN (to_tsvector('english', full_name || ' ' || email || ' ' || COALESCE(registration_id, '')));
