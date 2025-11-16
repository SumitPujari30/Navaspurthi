const axios = require('axios');

async function simpleTest() {
  try {
    console.log('Testing simple registration...');
    
    const response = await axios.post('http://localhost:5000/api/registrations', {
      name: 'Test User',
      email: 'test@example.com',
      phone: '+91-9876543210',
      college: 'Test College',
      year: '1st',
      events: [
        {
          name: 'Solo Dance',
          category: 'solo'
        }
      ]
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Success:', response.data);
  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
    console.log('Status:', error.response?.status);
  }
}

simpleTest();
