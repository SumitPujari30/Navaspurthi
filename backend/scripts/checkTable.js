const { supabaseAdmin } = require('../config/supabase');

async function checkTable() {
  try {
    console.log('🔍 Checking registrations table structure...');
    
    // Get a sample record to see the structure
    const { data, error } = await supabaseAdmin
      .from('registrations')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    if (data && data.length > 0) {
      console.log('✅ Table columns found:');
      console.log(Object.keys(data[0]));
    } else {
      console.log('📝 Table is empty, trying to insert a minimal record...');
      
      const { data: insertData, error: insertError } = await supabaseAdmin
        .from('registrations')
        .insert([{
          full_name: 'Test User',
          email: 'test@example.com',
          phone: '+91-9876543210',
          college: 'Test College',
          events: ['Solo Dance']
        }])
        .select()
        .single();

      if (insertError) {
        console.error('❌ Insert error:', insertError);
      } else {
        console.log('✅ Minimal insert successful');
        console.log('Available columns:', Object.keys(insertData));
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkTable();
