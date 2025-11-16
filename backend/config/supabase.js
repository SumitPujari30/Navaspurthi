const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('⚠️  Supabase credentials not configured. Please check your .env file.');
}
else{
    console.log('Supabase credentials configured successfully.');
}

// Admin client with service role key for backend operations
const supabaseAdmin = createClient(supabaseUrl || '', supabaseServiceKey || '', {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Public client for frontend-facing operations
const supabasePublic = createClient(supabaseUrl || '', supabaseAnonKey || '');

module.exports = {
  supabaseAdmin,
  supabasePublic
};
