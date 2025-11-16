const { GoogleGenerativeAI } = require('@google/generative-ai');

async function checkGeminiModels() {
  console.log('🔍 Checking Available Gemini Models...\n');

  if (!process.env.GEMINI_API_KEY) {
    console.log('❌ GEMINI_API_KEY not found in environment variables');
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    console.log('🔑 API Key configured, checking models...\n');

    // Try to list models
    try {
      const response = await genAI.listModels();
      const models = response.models || [];

      if (models.length === 0) {
        console.log('⚠️  No models returned from API');
        console.log('   This might indicate:');
        console.log('   - API key doesn\'t have access to models');
        console.log('   - API key is invalid');
        console.log('   - Regional restrictions');
      } else {
        console.log(`✅ Found ${models.length} available models:\n`);
        
        models.forEach((model, index) => {
          console.log(`${index + 1}. ${model.name}`);
          console.log(`   Display Name: ${model.displayName || 'N/A'}`);
          console.log(`   Description: ${model.description || 'N/A'}`);
          console.log(`   Supported Methods: ${(model.supportedGenerationMethods || []).join(', ')}`);
          console.log('');
        });

        // Filter models that support generateContent
        const generativeModels = models.filter(model => 
          (model.supportedGenerationMethods || []).includes('generateContent')
        );

        console.log(`📝 Models supporting generateContent: ${generativeModels.length}`);
        generativeModels.forEach(model => {
          console.log(`   - ${model.name}`);
        });
      }

    } catch (listError) {
      console.log('❌ Failed to list models:', listError.message);
      console.log('   Trying to test individual models...\n');

      // Test common model names
      const testModels = [
        'gemini-pro',
        'gemini-1.5-pro',
        'gemini-1.5-flash',
        'gemini-1.0-pro',
        'models/gemini-pro',
        'models/gemini-1.5-pro',
        'models/gemini-1.5-flash'
      ];

      for (const modelName of testModels) {
        try {
          console.log(`Testing ${modelName}...`);
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent('Say hello');
          const response = await result.response;
          const text = response.text();
          
          console.log(`✅ ${modelName} works! Response: ${text.substring(0, 50)}...`);
        } catch (error) {
          console.log(`❌ ${modelName} failed: ${error.message}`);
        }
      }
    }

  } catch (error) {
    console.log('❌ General error:', error.message);
    
    if (error.message.includes('API_KEY_INVALID')) {
      console.log('\n💡 Suggestions:');
      console.log('   - Check if your API key is correct');
      console.log('   - Verify the API key has proper permissions');
      console.log('   - Try regenerating the API key in Google AI Studio');
    }
  }

  console.log('\n🔧 Troubleshooting Steps:');
  console.log('1. Visit https://makersuite.google.com/app/apikey');
  console.log('2. Create a new API key or verify existing one');
  console.log('3. Check if your region supports Gemini API');
  console.log('4. Try using the API key in Google AI Studio first');
}

// Run if called directly
if (require.main === module) {
  checkGeminiModels()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

module.exports = { checkGeminiModels };
