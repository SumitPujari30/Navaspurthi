const { supabaseAdmin } = require('../config/supabase');

async function testMinimalInsert() {
  try {
    console.log('🧪 Testing minimal insert...');
    
    // Try inserting with only the most basic fields
    const { data, error } = await supabaseAdmin
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

    if (error) {
      console.error('❌ Minimal insert error:', error);
      
      // Try with even fewer fields
      console.log('\n🧪 Trying with absolute minimum fields...');
      const { data: data2, error: error2 } = await supabaseAdmin
        .from('registrations')
        .insert([{
          full_name: 'Test User',
          email: 'test2@example.com'
        }])
        .select()
        .single();

      if (error2) {
        console.error('❌ Absolute minimal insert error:', error2);
      } else {
        console.log('✅ Absolute minimal insert successful:', data2);
      }
    } else {
      console.log('✅ Minimal insert successful:', data);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testMinimalInsert();
