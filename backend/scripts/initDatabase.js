const { supabaseAdmin } = require('../config/supabase');

/**
 * Initialize database by checking and creating tables if needed
 * This ensures all required tables exist before the app starts
 */
async function initializeDatabase() {
  console.log('🔧 Initializing database schema...');

  try {
    // Check if tables already exist
    const { error: checkError } = await supabaseAdmin
      .from('registrations')
      .select('id')
      .limit(1);

    if (!checkError) {
      console.log('✅ Database tables already exist. Skipping initialization.');
      return true;
    }

    // If tables don't exist, show manual setup instructions
    console.log('📋 Tables not found. Manual setup required.');
    console.log('\n' + '='.repeat(70));
    console.log('⚠️  DATABASE SETUP REQUIRED');
    console.log('='.repeat(70));
    console.log('\n🔧 Quick Setup (2 minutes):\n');
    console.log('1. Open Supabase Dashboard: https://supabase.com/dashboard');
    console.log('2. Select your project → SQL Editor → New query');
    console.log('3. Run this command to see the SQL:');
    console.log('   \x1b[33mnpm run show-schema\x1b[0m');
    console.log('4. Copy the displayed SQL and paste into Supabase SQL Editor');
    console.log('5. Click "Run" in Supabase');
    console.log('6. Restart this backend server\n');
    console.log('📖 Detailed instructions: backend/SETUP_DATABASE.md\n');
    console.log('='.repeat(70) + '\n');
    
    return false;

  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    return false;
  }
}

module.exports = { initializeDatabase };
