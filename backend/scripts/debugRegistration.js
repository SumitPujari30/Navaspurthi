const axios = require('axios');

async function debugRegistration() {
  try {
    console.log('🔍 Debugging registration with detailed error logging...');
    
    const response = await axios.post('http://localhost:5000/api/registrations', {
      name: 'Debug User',
      email: 'debug@example.com',
      phone: '+91-9876543210',
      college: 'Debug College',
      department: 'Computer Science',
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
      },
      timeout: 10000
    });

    console.log('✅ Success:', response.data);
  } catch (error) {
    console.log('❌ Full Error Details:');
    console.log('Status:', error.response?.status);
    console.log('Data:', error.response?.data);
    console.log('Headers:', error.response?.headers);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Server is not running');
    }
  }
}

debugRegistration();
