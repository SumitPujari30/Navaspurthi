const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../config/supabase');

// Import the ES6 Gemini service (using dynamic import)
let askGemini, askGeminiWithContext, checkGeminiStatus;

// Dynamic import for ES6 modules
(async () => {
  try {
    const geminiModule = await import('../services/geminiES6.js');
    askGemini = geminiModule.askGemini;
    askGeminiWithContext = geminiModule.askGeminiWithContext;
    checkGeminiStatus = geminiModule.checkGeminiStatus;
    console.log('✅ ES6 Gemini service loaded');
  } catch (error) {
    console.error('❌ Failed to load ES6 Gemini service:', error.message);
  }
})();

// Predefined responses for common queries
const quickResponses = {
  'hi': 'Hi there! 👋 Welcome to Navaspurthi 2025! How can I help you today?',
  'hello': 'Hello! 👋 Welcome to Navaspurthi 2025! How can I assist you?',
  'register': 'You can register for events here: /register. Click on "Register Now" to get started!',
  'registration': 'To register for Navaspurthi 2025, visit our registration page and fill out the form. You\'ll receive a unique ID and AI-generated profile!',
  'schedule': 'Find all event timings on our Schedule page 🕒. The fest runs from March 15-17, 2025.',
  'venue': 'Venue: PES University Campus, 100 Feet Ring Road, BSK III Stage, Bangalore 🏫',
  'contact': 'Reach us at navaspurthi@pes.edu 📧 or call +91 98765 43210',
  'events': 'We have 24 exciting events across Technical, Cultural, Gaming, and Workshop categories! 🎯',
  'prizes': 'Total prize pool of ₹5,00,000 across all events! 💰',
  'id card': 'Every participant gets a beautiful AI-generated ID card with QR code verification! 🎨'
};

// POST /api/chatbot - Send message to chatbot
router.post('/', async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    // Generate session ID if not provided
    const chatSessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Check for quick responses first
    const lowerMessage = trimmedMessage.toLowerCase();
    const quickResponse = Object.keys(quickResponses).find(key => 
      lowerMessage.includes(key)
    );
    
    if (quickResponse) {
      // Log quick response
      try {
        await supabaseAdmin
          .from('chatbot_logs')
          .insert([{
            session_id: chatSessionId,
            user_message: trimmedMessage,
            bot_response: quickResponses[quickResponse],
            response_type: 'quick',
            created_at: new Date().toISOString()
          }]);
      } catch (logError) {
        console.error('Failed to log chatbot interaction:', logError);
      }

      return res.json({
        success: true,
        response: quickResponses[quickResponse],
        type: 'quick',
        sessionId: chatSessionId
      });
    }

    // Try AI response if available
    if (askGeminiWithContext) {
      try {
        const context = `
          You are a helpful chatbot for Navaspurthi 2025, a futuristic college tech-cultural fest.
          Event Details:
          - Dates: March 15-17, 2025
          - Venue: PES University, Bangalore
          - 24 events across Technical, Cultural, Gaming, and Workshop categories
          - Prize pool: ₹5,00,000
          - Registration includes AI-generated profile images and ID cards
          
          Be friendly, informative, and enthusiastic about the event.
          Keep responses concise and helpful.
        `;

        const aiResponse = await askGeminiWithContext(trimmedMessage, context);
        
        // Log AI response
        try {
          await supabaseAdmin
            .from('chatbot_logs')
            .insert([{
              session_id: chatSessionId,
              user_message: trimmedMessage,
              bot_response: aiResponse,
              response_type: 'ai',
              created_at: new Date().toISOString()
            }]);
        } catch (logError) {
          console.error('Failed to log chatbot interaction:', logError);
        }

        return res.json({
          success: true,
          response: aiResponse,
          type: 'ai',
          sessionId: chatSessionId
        });

      } catch (aiError) {
        console.log('AI failed, using fallback:', aiError.message);
      }
    }

    // Fallback keyword matching
    const keywordResponses = {
      'registration': 'To register for Navaspurthi 2025, visit our registration page and fill out the form with your details. You\'ll get an instant AI-generated ID card!',
      'events': 'Navaspurthi 2025 features 24 exciting events across Technical, Cultural, Gaming, and Workshop categories. Check our events page for the complete list!',
      'schedule': 'The festival runs from March 15-17, 2025 at PES University, Bangalore. Visit our schedule page for detailed timings.',
      'prizes': 'We have an amazing prize pool of ₹5,00,000 across all events! Participate and win big!',
      'venue': 'Navaspurthi 2025 will be held at PES University, Bangalore. The campus provides excellent facilities for all our events.',
      'contact': 'For any queries, you can reach out to our organizing committee through the contact information on our website.',
      'ai': 'Yes! Every registered participant gets an AI-enhanced profile image and a professionally generated ID card automatically.',
      'id card': 'Every participant receives a beautiful, AI-generated ID card with their enhanced profile photo, registration details, and QR code for easy verification.'
    };

    // Check for keyword matches
    for (const [keyword, response] of Object.entries(keywordResponses)) {
      if (lowerMessage.includes(keyword)) {
        // Log keyword response
        try {
          await supabaseAdmin
            .from('chatbot_logs')
            .insert([{
              session_id: chatSessionId,
              user_message: trimmedMessage,
              bot_response: response,
              response_type: 'keyword_match',
              created_at: new Date().toISOString()
            }]);
        } catch (logError) {
          console.error('Failed to log chatbot interaction:', logError);
        }

        return res.json({
          success: true,
          response: response,
          type: 'keyword_match',
          sessionId: chatSessionId
        });
      }
    }

    // Default response
    const defaultResponse = `I'm here to help with questions about Navaspurthi 2025! You can ask me about:
      
• Event registration and AI ID cards
• Schedule and timings  
• Venue details and directions
• Prize information and categories
• Technical support and contact info

What would you like to know?`;

    // Log default response
    try {
      await supabaseAdmin
        .from('chatbot_logs')
        .insert([{
          session_id: chatSessionId,
          user_message: trimmedMessage,
          bot_response: defaultResponse,
          response_type: 'default',
          created_at: new Date().toISOString()
        }]);
    } catch (logError) {
      console.error('Failed to log chatbot interaction:', logError);
    }

    res.json({
      success: true,
      response: defaultResponse,
      type: 'default',
      sessionId: chatSessionId
    });

  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ error: 'Chatbot service error' });
  }
});

// GET /api/chatbot/status - Check AI status
router.get('/status', async (req, res) => {
  try {
    if (checkGeminiStatus) {
      const status = await checkGeminiStatus();
      res.json({
        success: true,
        ai: status,
        fallbacks: {
          quick_responses: Object.keys(quickResponses).length,
          keyword_matching: true,
          default_response: true
        }
      });
    } else {
      res.json({
        success: true,
        ai: {
          status: 'not_loaded',
          message: 'ES6 Gemini service not loaded',
          workingModel: null
        },
        fallbacks: {
          quick_responses: Object.keys(quickResponses).length,
          keyword_matching: true,
          default_response: true
        }
      });
    }
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ error: 'Status check failed' });
  }
});

// GET /api/chatbot/suggestions - Get chat suggestions
router.get('/suggestions', (req, res) => {
  const suggestions = [
    'How do I register for events?',
    'What events are available?',
    'When is the festival?',
    'Where is the venue?',
    'What are the prizes?',
    'Tell me about AI ID cards'
  ];

  res.json({
    success: true,
    suggestions
  });
});

module.exports = router;
