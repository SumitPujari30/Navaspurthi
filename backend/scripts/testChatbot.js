const axios = require('axios');

const API_BASE = 'http://localhost:5000';

async function testChatbot() {
  console.log('🤖 Testing Chatbot with Updated Gemini Models\n');

  try {
    // Test messages
    const testMessages = [
      'Hello',
      'Tell me about registration',
      'What events are available?',
      'When is the festival?',
      'How do I get an ID card?',
      'What are the prizes?'
    ];

    for (const message of testMessages) {
      try {
        console.log(`\n📝 Testing: "${message}"`);
        
        const response = await axios.post(`${API_BASE}/api/chatbot`, {
          message,
          sessionId: `test_${Date.now()}`
        }, { timeout: 20000 });

        if (response.data.success) {
          console.log(`✅ Response Type: ${response.data.type}`);
          if (response.data.model) {
            console.log(`🤖 AI Model: ${response.data.model}`);
          }
          console.log(`💬 Response: ${response.data.response.substring(0, 100)}...`);
        } else {
          console.log(`❌ Failed: ${response.data.error}`);
        }

      } catch (error) {
        console.log(`❌ Error: ${error.response?.data?.error || error.message}`);
      }
    }

    console.log('\n🎉 CHATBOT TEST COMPLETED!');

  } catch (error) {
    console.error('\n❌ Test Failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure the backend server is running:');
      console.log('   cd backend && node server.js');
    }
  }
}

// Run test
testChatbot()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Test failed:', error);
    process.exit(1);
  });
