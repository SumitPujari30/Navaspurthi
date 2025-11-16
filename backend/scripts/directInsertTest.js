const { supabaseAdmin } = require('../config/supabase');

async function directInsertTest() {
  console.log('🧪 Testing direct database insert...');
  
  const testData = {
    registration_id: 'NV25-TEST-001',
    full_name: 'Test User',
    email: 'directtest@example.com',
    phone: '+91-9876543210',
    college: 'Test College',
    department: 'Computer Science',
    year: '1st',
    events: [{ name: 'Solo Dance', category: 'solo' }],
    ai_processed: false,
    status: 'pending'
  };

  console.log('📝 Inserting data:', JSON.stringify(testData, null, 2));

  try {
    const { data, error } = await supabaseAdmin
      .from('registrations')
      .insert([testData])
      .select()
      .single();

    if (error) {
      console.error('❌ Insert error:', error);
    } else {
      console.log('✅ Insert successful:', data);
    }
  } catch (error) {
    console.error('❌ Exception:', error);
  }
}

directInsertTest();
