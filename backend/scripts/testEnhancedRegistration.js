const axios = require('axios');

const API_BASE = 'http://localhost:5000';

async function testEnhancedRegistration() {
  console.log('🧪 Testing Enhanced Registration System\n');

  try {
    // Test 1: Register solo event (should work)
    console.log('1️⃣ Testing Solo Event Registration...');
    const timestamp = Date.now();
    const soloResponse = await axios.post(`${API_BASE}/api/registrations`, {
      name: 'Alice Smith',
      email: `alice${timestamp}@example.com`,
      phone: '+91-9876543210',
      college: 'PES University',
      year: '1st',
      events: [
        {
          name: 'Solo Dance',
          category: 'solo'
        }
      ]
    });

    if (soloResponse.data.status === 'ok') {
      console.log('✅ Solo registration successful!');
      console.log(`   Registration ID: ${soloResponse.data.registration.registration_id}`);
    } else {
      console.log('❌ Solo registration failed:', soloResponse.data.message);
    }

    // Test 2: Try to register second solo for same email (should fail)
    console.log('\n2️⃣ Testing Duplicate Solo Registration...');
    try {
      const duplicateResponse = await axios.post(`${API_BASE}/api/registrations`, {
        name: 'Alice Smith',
        email: `alice${timestamp}@example.com`,
        events: [{ name: 'Solo Singing' }]
      });
      console.log('❌ Duplicate registration should have failed but succeeded');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Duplicate registration correctly rejected');
        console.log(`   Error: ${error.response.data.message}`);
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }

    // Test 3: Register solo + exception (should work)
    console.log('\n3️⃣ Testing Solo + Exception Event Registration...');
    const comboResponse = await axios.post(`${API_BASE}/api/registrations`, {
      name: 'Bob Jones',
      email: 'bob@example.com',
      phone: '+91-9876543211',
      college: 'PES University',
      year: '2nd',
      events: [
        { name: 'Photography' },
        {
          name: 'Cricket',
          participants: [
            { name: 'Bob Jones', email: 'bob@example.com' },
            { name: 'Player 2', email: 'p2@example.com' },
            { name: 'Player 3', email: 'p3@example.com' },
            { name: 'Player 4', email: 'p4@example.com' },
            { name: 'Player 5', email: 'p5@example.com' },
            { name: 'Player 6', email: 'p6@example.com' },
            { name: 'Player 7', email: 'p7@example.com' },
            { name: 'Player 8', email: 'p8@example.com' },
            { name: 'Player 9', email: 'p9@example.com' },
            { name: 'Player 10', email: 'p10@example.com' },
            { name: 'Player 11', email: 'p11@example.com' }
          ]
        }
      ]
    });

    if (comboResponse.data.status === 'ok') {
      console.log('✅ Solo + Exception registration successful!');
      console.log(`   Registration ID: ${comboResponse.data.registration.registration_id}`);
      console.log(`   Total participants: ${comboResponse.data.registration.total_participants}`);
    } else {
      console.log('❌ Solo + Exception registration failed:', comboResponse.data.message);
    }

    // Test 4: Invalid participants count (should fail)
    console.log('\n4️⃣ Testing Invalid Participants Count...');
    try {
      const invalidResponse = await axios.post(`${API_BASE}/api/registrations`, {
        name: 'Carol Davis',
        email: 'carol@example.com',
        events: [
          {
            name: 'Group Dance',
            participants: [
              { name: 'Carol Davis', email: 'carol@example.com' },
              { name: 'Dancer 2', email: 'd2@example.com' }
            ]
          }
        ]
      });
      console.log('❌ Invalid participants should have failed but succeeded');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Invalid participants correctly rejected');
        console.log(`   Error: ${error.response.data.message}`);
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }

    // Test 5: Check registration retrieval
    console.log('\n5️⃣ Testing Registration Retrieval...');
    const getResponse = await axios.get(`${API_BASE}/api/registrations?email=alice@example.com`);
    
    if (getResponse.data.success) {
      console.log('✅ Registration retrieval successful!');
      console.log(`   Found ${getResponse.data.registrations.length} registration(s)`);
    } else {
      console.log('❌ Registration retrieval failed');
    }

    console.log('\n🎉 ENHANCED REGISTRATION SYSTEM TEST COMPLETED!');

  } catch (error) {
    console.error('\n❌ Test Failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure the backend server is running:');
      console.log('   cd backend && npm run dev');
    }
  }
}

// Run test
testEnhancedRegistration()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Test failed:', error);
    process.exit(1);
  });
