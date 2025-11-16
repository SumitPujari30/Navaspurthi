const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function testGeminiDirect() {
  console.log('🧪 Testing Gemini AI Direct Connection\n');

  try {
    const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.log('❌ No API key found');
      return;
    }

    console.log(`🔑 Using API key: ${apiKey.substring(0, 10)}...`);

    const genAI = new GoogleGenerativeAI(apiKey);

    // Test models from our list
    const modelsToTest = [
      'models/gemini-2.0-pro-exp-02-05',
      'models/gemini-2.0-flash',
      'models/gemini-2.0-flash-exp',
      'models/gemini-1.5-flash',
      'models/gemini-1.5-pro',
      'gemini-2.0-flash',
      'gemini-1.5-flash'
    ];

    let workingModel = null;

    for (const modelName of modelsToTest) {
      try {
        console.log(`\n🔍 Testing model: ${modelName}`);
        
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        });

        const result = await model.generateContent('Say hello and tell me your model name in one sentence.');
        const response = await result.response;
        const text = response.text();

        console.log(`✅ ${modelName} WORKS!`);
        console.log(`   Response: ${text}`);
        
        if (!workingModel) {
          workingModel = modelName;
        }

      } catch (error) {
        console.log(`❌ ${modelName} failed: ${error.message}`);
      }
    }

    if (workingModel) {
      console.log(`\n🎉 SUCCESS! Working model found: ${workingModel}`);
      
      // Test a more complex query
      console.log('\n🧠 Testing complex query...');
      const model = genAI.getGenerativeModel({ model: workingModel });
      const result = await model.generateContent(`
        You are a helpful assistant for Navaspurthi 2025, a college tech festival.
        A student asks: "What should I know about registering for events?"
        Provide a helpful, enthusiastic response.
      `);
      
      const response = await result.response;
      console.log(`💬 Complex Response: ${response.text()}`);
      
    } else {
      console.log('\n❌ No working models found');
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  }
}

testGeminiDirect();
