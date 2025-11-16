const axios = require('axios');

async function testGroupOnly() {
  console.log('🧪 Testing Group Registration Only...');

  try {
    const timestamp = Date.now();
    
    const response = await axios.post('http://localhost:5000/api/registrations', {
      name: 'Group Leader',
      email: `groupleader${timestamp}@example.com`,
      phone: '+91-9876543210',
      college: 'Test College',
      year: '2nd',
      events: [
        {
          name: 'Quiz',
          participants: [
            { 
              name: 'Group Leader', 
              email: `groupleader${timestamp}@example.com`, 
              phone: '+91-9876543210' 
            },
            { 
              name: 'Team Member', 
              email: `member${timestamp}@example.com`, 
              phone: '+91-9876543211' 
            }
          ]
        }
      ]
    });

    console.log('✅ Group registration successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
    console.log('Status:', error.response?.status);
  }
}

testGroupOnly();
