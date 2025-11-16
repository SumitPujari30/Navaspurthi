const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
    this.genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

    this.defaultModels = {
      text: [
        'models/gemini-2.0-pro-exp-02-05',
        'models/gemini-2.0-flash',
        'models/gemini-2.0-flash-exp',
        'models/gemini-1.5-flash',
        'models/gemini-1.5-pro',
        'gemini-2.0-flash',
        'gemini-1.5-flash'
      ],
      vision: [
        'models/gemini-2.0-flash',
        'models/gemini-2.0-flash-exp',
        'models/gemini-1.5-flash',
        'models/gemini-1.5-pro-vision',
        'gemini-2.0-flash',
        'gemini-1.5-flash'
      ]
    };

    this.workingModels = new Map(); // Map<type, { model, name }>
    this.disabled = !this.genAI;
    this.disableReason = this.genAI ? null : 'Gemini API key not configured';
  }

  getCandidateModels(type) {
    const defaults = this.defaultModels[type] || [];
    // Deduplicate while preserving order
    return defaults.filter((name, index) => name && defaults.indexOf(name) === index);
  }

  formatModelCandidates(modelName) {
    if (!modelName) return [];
    if (modelName.startsWith('models/')) {
      const trimmed = modelName.replace('models/', '');
      return [modelName, trimmed];
    }
    return [modelName, `models/${modelName}`];
  }

  async getWorkingModel(type = 'text') {
    if (!this.genAI || this.disabled) {
      throw new Error(this.disableReason || 'Gemini AI disabled');
    }

    const cached = this.workingModels.get(type);
    if (cached) {
      return cached.model;
    }

    const candidates = this.getCandidateModels(type);

    if (!candidates.length) {
      this.disableAI(`No ${type} models available`);
      throw new Error(`No working ${type} models available`);
    }

    for (const baseName of candidates) {
      const modelNameOptions = this.formatModelCandidates(baseName);

      for (const modelName of modelNameOptions) {
        try {
          const model = this.genAI.getGenerativeModel({
            model: modelName,
            generationConfig: type === 'vision'
              ? {
                  temperature: 0.8,
                  topK: 32,
                  topP: 1,
                  maxOutputTokens: 1024,
                }
              : {
                  temperature: 0.7,
                  topK: 40,
                  topP: 0.95,
                  maxOutputTokens: 1024,
                }
          });

          await this.testModel(model, type);

          const working = { model, name: modelName.startsWith('models/') ? modelName.replace('models/', '') : modelName };
          this.workingModels.set(type, working);
          console.log(`✅ Using Gemini model: ${working.name}`);
          return model;
        } catch (error) {
          const message = error.message || '';
          console.log(`❌ Model ${modelName} failed: ${message}`);

          if (this.isNotFoundError(message)) {
            continue;
          }

          // For non-404 failures, break to avoid rapid retries
          break;
        }
      }
    }

    this.disableAI(`No working ${type} models available`);
    throw new Error(`No working ${type} models available`);
  }

  isNotFoundError(message = '') {
    return message.includes('404') || message.toLowerCase().includes('not found');
  }

  disableAI(reason) {
    if (!this.disabled) {
      this.disabled = true;
      this.disableReason = reason || 'Gemini AI disabled';
      console.warn(`⚠️  Gemini AI disabled: ${this.disableReason}`);
    }
  }

  async testModel(model, type) {
    const testPrompt = type === 'vision'
      ? 'Describe this image briefly.'
      : 'Say "Hello" in one word.';

    const result = await model.generateContent(testPrompt);
    await result.response;
  }

  async generateChatResponse(message, context = '') {
    try {
      const model = await this.getWorkingModel('text');

      const fullPrompt = `${context}

User question: ${message}

Please provide a helpful, concise response.`;

      const generatePromise = model.generateContent(fullPrompt);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('AI request timeout')), 15000)
      );

      const result = await Promise.race([generatePromise, timeoutPromise]);
      const response = await result.response;

      const working = this.workingModels.get('text');
      return {
        success: true,
        text: response.text(),
        type: 'ai',
        model: working?.name
      };

    } catch (error) {
      console.error('Gemini chat error:', error.message);
      if (this.isNotFoundError(error.message)) {
        this.disableAI('Gemini API does not have accessible text models');
      }
      return {
        success: false,
        error: error.message,
        type: 'error'
      };
    }
  }

  async generateImageDescription(imageBuffer, mimeType, prompt) {
    try {
      const model = await this.getWorkingModel('vision');

      const imageBase64 = imageBuffer.toString('base64');

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType,
            data: imageBase64
          }
        }
      ]);

      const response = await result.response;
      const working = this.workingModels.get('vision');

      return {
        success: true,
        text: response.text(),
        type: 'ai_vision',
        model: working?.name
      };

    } catch (error) {
      console.error('Gemini vision error:', error.message);
      if (this.isNotFoundError(error.message)) {
        this.disableAI('Gemini API does not have accessible vision models');
      }
      return {
        success: false,
        error: error.message,
        type: 'error'
      };
    }
  }

  getFallbackResponse(message) {
    const keywords = {
      'registration': 'To register for Navaspurthi 2025, visit our registration page and fill out the form with your details. You\'ll get an instant AI-generated ID card!',
      'events': 'Navaspurthi 2025 features 24 exciting events across Technical, Cultural, Gaming, and Workshop categories. Check our events page for the complete list!',
      'schedule': 'The festival runs from March 15-17, 2025 at PES University, Bangalore. Visit our schedule page for detailed timings.',
      'prizes': 'We have an amazing prize pool of ₹5,00,000 across all events! Participate and win big!',
      'venue': 'Navaspurthi 2025 will be held at PES University, Bangalore. The campus provides excellent facilities for all our events.',
      'contact': 'For any queries, you can reach out to our organizing committee through the contact information on our website.',
      'ai': 'Yes! Every registered participant gets an AI-enhanced profile image and a professionally generated ID card automatically.',
      'id card': 'Every participant receives a beautiful, AI-generated ID card with their enhanced profile photo, registration details, and QR code for easy verification.'
    };

    const lowerMessage = message.toLowerCase();
    
    for (const [keyword, response] of Object.entries(keywords)) {
      if (lowerMessage.includes(keyword)) {
        return {
          success: true,
          text: response,
          type: 'keyword_match'
        };
      }
    }

    return {
      success: true,
      text: `I'm here to help with questions about Navaspurthi 2025! You can ask me about:
      
• Event registration and AI ID cards
• Schedule and timings  
• Venue details and directions
• Prize information and categories
• Technical support and contact info

What would you like to know?`,
      type: 'default'
    };
  }

  isConfigured() {
    return !!this.genAI && !this.disabled;
  }
}

module.exports = new GeminiService();
