const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

/**
 * Test script to verify registration API is working
 * Run: node scripts/testRegistration.js
 */

const API_BASE = process.env.API_URL || 'http://localhost:5000';

async function testRegistrationAPI() {
  console.log('\n' + '='.repeat(70));
  console.log('🧪 Testing Registration API');
  console.log('='.repeat(70) + '\n');

  try {
    // Test 1: Check if backend is running
    console.log('1️⃣  Testing backend connectivity...');
    try {
      const healthCheck = await axios.get(`${API_BASE}/api/health`, {
        timeout: 5000
      });
      console.log('   ✅ Backend is running:', healthCheck.data);
    } catch (err) {
      console.error('   ❌ Backend not reachable. Make sure it\'s running on port 5000');
      console.error('   Run: npm run dev');
      console.error('   Error:', err.code || err.message);
      if (err.response) {
        console.error('   Response status:', err.response.status);
        console.error('   Response data:', err.response.data);
      }
      return;
    }

    // Test 2: Get existing registrations
    console.log('\n2️⃣  Fetching existing registrations...');
    try {
      const response = await axios.get(`${API_BASE}/api/registrations`);
      console.log(`   ✅ Found ${response.data.count} existing registrations`);
      
      if (response.data.count > 0) {
        console.log('\n   Sample registration:');
        const sample = response.data.registrations[0];
        console.log(`   - ID: ${sample.registration_id}`);
        console.log(`   - Name: ${sample.full_name}`);
        console.log(`   - Email: ${sample.email}`);
        console.log(`   - Events: ${JSON.stringify(sample.events)}`);
      }
    } catch (err) {
      console.error('   ❌ Failed to fetch registrations:', err.response?.data || err.message);
      if (err.response?.status === 400) {
        console.error('   ⚠️  This usually means tables are not created yet.');
        console.error('   Run: npm run show-schema');
      }
      return;
    }

    // Test 3: Create a test registration (without file for simplicity)
    console.log('\n3️⃣  Creating test registration...');
    try {
      const testData = {
        fullName: 'Test User ' + Date.now(),
        email: `test${Date.now()}@example.com`,
        phone: '9876543210',
        college: 'Test College',
        department: 'Computer Science',
        year: '3rd Year',
        events: JSON.stringify(['ai-challenge', 'hackathon'])
      };

      const response = await axios.post(`${API_BASE}/api/registrations`, testData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('   ✅ Registration created successfully!');
      console.log(`   - Registration ID: ${response.data.registrationId}`);
      console.log(`   - Message: ${response.data.message}`);
    } catch (err) {
      console.error('   ❌ Failed to create registration:', err.response?.data || err.message);
    }

    // Test 4: Verify the new registration appears in list
    console.log('\n4️⃣  Verifying new registration...');
    try {
      const response = await axios.get(`${API_BASE}/api/registrations`);
      console.log(`   ✅ Total registrations now: ${response.data.count}`);
    } catch (err) {
      console.error('   ❌ Failed to verify:', err.message);
    }

    console.log('\n' + '='.repeat(70));
    console.log('✅ API Testing Complete!');
    console.log('='.repeat(70) + '\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  }
}

// Run the test
testRegistrationAPI();
