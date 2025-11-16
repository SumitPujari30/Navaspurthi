const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  console.error('Required: SUPABASE_URL and SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  try {
    console.log('🔄 Running database migration...\n');

    // Read the migration SQL file
    const migrationPath = path.join(__dirname, 'migrations', 'add_id_card_columns.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Split SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`Executing statement ${i + 1}/${statements.length}...`);
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          // If exec_sql doesn't exist, try direct query
          console.log('  ℹ️  Trying alternative execution method...');
          // Note: Supabase doesn't allow direct SQL execution via client
          // You need to run this in Supabase SQL Editor
          console.log('  ⚠️  Please run this SQL in Supabase SQL Editor:');
          console.log('  ' + statement.substring(0, 100) + '...\n');
        } else {
          console.log('  ✅ Success\n');
        }
      } catch (err) {
        console.log(`  ⚠️  Error (may be expected): ${err.message}\n`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📋 MANUAL MIGRATION REQUIRED');
    console.log('='.repeat(60));
    console.log('\nPlease run the following SQL in your Supabase SQL Editor:');
    console.log('\n' + migrationSQL);
    console.log('\n' + '='.repeat(60));
    console.log('\nSteps:');
    console.log('1. Go to your Supabase Dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the SQL from:');
    console.log('   backend/database/migrations/add_id_card_columns.sql');
    console.log('4. Click "Run" to execute the migration');
    console.log('5. Restart your backend server');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
