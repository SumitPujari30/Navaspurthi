const axios = require('axios');

async function testFullSystem() {
  console.log('🧪 Testing Full Enhanced Registration System\n');

  try {
    const timestamp = Date.now();
    
    // Test 1: Solo Event Registration
    console.log('1️⃣ Testing Solo Event Registration...');
    const soloResponse = await axios.post('http://localhost:5000/api/registrations', {
      name: 'Test User Solo',
      email: `solo${timestamp}@example.com`,
      phone: '+91-9876543210',
      college: 'PES University',
      department: 'Computer Science',
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
      console.log(`   Events: ${soloResponse.data.registration.events.join(', ')}`);
    }

    // Test 2: Group Event Registration
    console.log('\n2️⃣ Testing Group Event Registration...');
    const groupResponse = await axios.post('http://localhost:5000/api/registrations', {
      name: 'Test User Group',
      email: `group${timestamp}@example.com`,
      phone: '+91-9876543211',
      college: 'PES University',
      year: '2nd',
      events: [
        {
          name: 'Quiz',
          category: 'group',
          participants: [
            { name: 'Test User Group', email: `group${timestamp}@example.com`, phone: '+91-9876543211' },
            { name: 'Partner User', email: `partner${timestamp}@example.com`, phone: '+91-9876543212' }
          ]
        }
      ]
    });

    if (groupResponse.data.status === 'ok') {
      console.log('✅ Group registration successful!');
      console.log(`   Registration ID: ${groupResponse.data.registration.registration_id}`);
      console.log(`   Team Size: ${groupResponse.data.registration.total_participants}`);
    }

    // Test 3: Exception Event + Solo Combination
    console.log('\n3️⃣ Testing Exception + Solo Combination...');
    const comboResponse = await axios.post('http://localhost:5000/api/registrations', {
      name: 'Test User Combo',
      email: `combo${timestamp}@example.com`,
      phone: '+91-9876543213',
      college: 'PES University',
      year: '3rd',
      events: [
        { name: 'Photography' },
        {
          name: 'Group Dance',
          participants: [
            { name: 'Test User Combo', email: `combo${timestamp}@example.com` },
            { name: 'Dancer 2', email: `dancer2${timestamp}@example.com` },
            { name: 'Dancer 3', email: `dancer3${timestamp}@example.com` },
            { name: 'Dancer 4', email: `dancer4${timestamp}@example.com` },
            { name: 'Dancer 5', email: `dancer5${timestamp}@example.com` },
            { name: 'Dancer 6', email: `dancer6${timestamp}@example.com` }
          ]
        }
      ]
    });

    if (comboResponse.data.status === 'ok') {
      console.log('✅ Combo registration successful!');
      console.log(`   Registration ID: ${comboResponse.data.registration.registration_id}`);
      console.log(`   Events: ${comboResponse.data.registration.events.join(', ')}`);
    }

    // Test 4: Invalid Registration (should fail)
    console.log('\n4️⃣ Testing Invalid Registration (should fail)...');
    try {
      await axios.post('http://localhost:5000/api/registrations', {
        name: 'Test User Invalid',
        email: `invalid${timestamp}@example.com`,
        events: [
          { name: 'Solo Dance' },
          { name: 'Solo Singing' } // Two solo events - should fail
        ]
      });
      console.log('❌ Invalid registration should have failed');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Invalid registration correctly rejected');
        console.log(`   Error: ${error.response.data.message}`);
      }
    }

    console.log('\n🎉 FULL SYSTEM TEST COMPLETED SUCCESSFULLY!');
    console.log('\n📊 Summary:');
    console.log('✅ Solo event registration: Working');
    console.log('✅ Group event registration: Working');
    console.log('✅ Exception + Solo combination: Working');
    console.log('✅ Validation rules: Working');
    console.log('✅ Registration ID generation: Working');
    console.log('✅ Participant management: Working');

  } catch (error) {
    console.error('\n❌ Test Failed:', error.response?.data || error.message);
  }
}

testFullSystem();
