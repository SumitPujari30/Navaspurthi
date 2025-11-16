import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Available models to try in order of preference
const MODELS_TO_TRY = [
  "gemini-1.5-flash",
  "gemini-1.5-pro", 
  "gemini-pro",
  "gemini-1.0-pro"
];

let workingModel = null;

async function findWorkingModel() {
  if (workingModel) {
    return workingModel;
  }

  for (const modelName of MODELS_TO_TRY) {
    try {
      console.log(`🔍 Testing model: ${modelName}`);
      
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      });

      // Test with a simple prompt
      const result = await model.generateContent("Say hello in one word");
      await result.response.text();
      
      workingModel = { model, name: modelName };
      console.log(`✅ Using working model: ${modelName}`);
      return workingModel;

    } catch (error) {
      console.log(`❌ Model ${modelName} failed: ${error.message}`);
      continue;
    }
  }

  throw new Error("No working Gemini models available");
}

export async function askGemini(prompt) {
  try {
    if (!process.env.GOOGLE_API_KEY) {
      console.error("❌ GOOGLE_API_KEY not found in environment");
      return "AI service not configured. Please check API key.";
    }

    const { model, name } = await findWorkingModel();
    
    console.log(`🤖 Using ${name} for prompt: ${prompt.substring(0, 50)}...`);
    
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    console.log(`✅ AI Response generated (${response.length} chars)`);
    return response;

  } catch (err) {
    console.error("❌ Gemini Error:", err.message);
    
    // Provide intelligent fallback based on prompt content
    if (prompt.toLowerCase().includes('registration')) {
      return "To register for Navaspurthi 2025, visit our registration page and fill out the form. You'll receive a professional ID card instantly!";
    } else if (prompt.toLowerCase().includes('event')) {
      return "Navaspurthi 2025 features 24 exciting events across Technical, Cultural, Gaming, and Workshop categories. Check our events page for details!";
    } else if (prompt.toLowerCase().includes('schedule')) {
      return "The festival runs from March 15-17, 2025 at PES University, Bangalore. Visit our schedule page for detailed timings.";
    } else {
      return "I'm having trouble connecting to AI services right now. Please try again later or contact us at navaspurthi@pes.edu for assistance.";
    }
  }
}

export async function askGeminiWithContext(prompt, context = "") {
  const fullPrompt = `${context}

User question: ${prompt}

Please provide a helpful, concise response about Navaspurthi 2025.`;

  return await askGemini(fullPrompt);
}

export async function checkGeminiStatus() {
  try {
    if (!process.env.GOOGLE_API_KEY) {
      return {
        status: 'not_configured',
        message: 'GOOGLE_API_KEY not found',
        workingModel: null
      };
    }

    const { name } = await findWorkingModel();
    return {
      status: 'working',
      message: `Connected to ${name}`,
      workingModel: name
    };

  } catch (error) {
    return {
      status: 'failed',
      message: error.message,
      workingModel: null
    };
  }
}

// Reset working model (useful for testing)
export function resetModel() {
  workingModel = null;
  console.log('🔄 Model cache reset');
}
