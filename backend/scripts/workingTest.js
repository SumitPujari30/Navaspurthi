const axios = require('axios');

async function workingTest() {
  console.log('🧪 Testing with exact working format...');
  
  try {
    const response = await axios.post('http://localhost:5000/api/registrations', {
      name: 'Working User',
      email: 'working@example.com',
      phone: '+91-9876543210',
      college: 'Working College',
      department: 'Computer Science',
      year: '1st',
      events: [
        {
          name: 'Solo Dance',
          category: 'solo'
        }
      ]
    });

    console.log('✅ Registration successful!');
    console.log('Registration ID:', response.data.registration.registration_id);
    console.log('Events:', response.data.registration.events);
    
    // Test duplicate registration
    console.log('\n🧪 Testing duplicate registration...');
    try {
      const duplicate = await axios.post('http://localhost:5000/api/registrations', {
        name: 'Working User',
        email: 'working@example.com',
        events: [{ name: 'Solo Singing' }]
      });
      console.log('❌ Duplicate should have failed');
    } catch (dupError) {
      if (dupError.response?.status === 400) {
        console.log('✅ Duplicate correctly rejected:', dupError.response.data.message);
      } else {
        console.log('❌ Unexpected duplicate error:', dupError.response?.data || dupError.message);
      }
    }

  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
  }
}

workingTest();
