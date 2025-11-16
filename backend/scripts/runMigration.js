const { supabaseAdmin } = require('../config/supabase');

async function runMigration() {
  console.log('🔧 Running database migration...');

  try {
    // Add new columns to registrations table
    const { data, error } = await supabaseAdmin.rpc('exec', {
      sql: `
        ALTER TABLE public.registrations 
        ADD COLUMN IF NOT EXISTS registration_id text,
        ADD COLUMN IF NOT EXISTS event_category text,
        ADD COLUMN IF NOT EXISTS participants jsonb DEFAULT '[]'::jsonb,
        ADD COLUMN IF NOT EXISTS total_participants integer DEFAULT 1,
        ADD COLUMN IF NOT EXISTS primary_participant_email text,
        ADD COLUMN IF NOT EXISTS id_card_url text,
        ADD COLUMN IF NOT EXISTS id_card_generated_at timestamptz,
        ADD COLUMN IF NOT EXISTS id_card_path text;
      `
    });

    if (error) {
      console.error('❌ Migration failed:', error);
      return;
    }

    console.log('✅ Columns added successfully');

    // Create unique index for registration_id
    const { error: indexError } = await supabaseAdmin.rpc('exec', {
      sql: `
        CREATE UNIQUE INDEX IF NOT EXISTS registrations_registration_id_idx 
        ON public.registrations (registration_id);
      `
    });

    if (indexError) {
      console.error('❌ Index creation failed:', indexError);
    } else {
      console.log('✅ Index created successfully');
    }

    // Create registration counter table
    const { error: counterError } = await supabaseAdmin.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.registration_counter (
          id integer PRIMARY KEY DEFAULT 1,
          current_value integer DEFAULT 0,
          prefix text DEFAULT 'NV25',
          updated_at timestamptz DEFAULT now()
        );
        
        INSERT INTO public.registration_counter (id, current_value, prefix)
        VALUES (1, 0, 'NV25')
        ON CONFLICT (id) DO NOTHING;
      `
    });

    if (counterError) {
      console.error('❌ Counter table creation failed:', counterError);
    } else {
      console.log('✅ Counter table created successfully');
    }

    // Create registration ID generation function
    const { error: functionError } = await supabaseAdmin.rpc('exec', {
      sql: `
        CREATE OR REPLACE FUNCTION public.generate_registration_id()
        RETURNS text AS $$
        DECLARE
          new_id text;
          counter integer;
        BEGIN
          UPDATE public.registration_counter
          SET current_value = current_value + 1,
              updated_at = now()
          WHERE id = 1
          RETURNING current_value INTO counter;
          
          new_id := (SELECT prefix FROM public.registration_counter WHERE id = 1) || '-' || LPAD(counter::text, 4, '0');
          
          RETURN new_id;
        END;
        $$ LANGUAGE plpgsql;
      `
    });

    if (functionError) {
      console.error('❌ Function creation failed:', functionError);
    } else {
      console.log('✅ Registration ID function created successfully');
    }

    console.log('\n🎉 Migration completed successfully!');
    console.log('The enhanced registration system is now ready to use.');

  } catch (error) {
    console.error('❌ Migration error:', error);
  }
}

runMigration();
