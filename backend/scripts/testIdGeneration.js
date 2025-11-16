const { supabaseAdmin } = require('../config/supabase');

// Copy the exact function from registrations.js
const generateRegistrationId = async () => {
  try {
    // Try to use the RPC function for atomic ID generation
    const { data, error } = await supabaseAdmin.rpc('generate_registration_id');
    
    if (!error && data) {
      return data;
    }
    
    // Fallback to timestamp-based ID
    console.log('Using fallback registration ID generation');
  } catch (error) {
    console.log('Using fallback registration ID generation');
  }
  
  // Fallback ID generation
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `NV25-${timestamp}-${random}`;
};

async function testIdGeneration() {
  console.log('🧪 Testing registration ID generation...');
  
  for (let i = 0; i < 3; i++) {
    const id = await generateRegistrationId();
    console.log(`Generated ID ${i + 1}:`, id, typeof id);
  }
}

testIdGeneration();
