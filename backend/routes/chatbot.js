const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../config/supabase');
const geminiService = require('../services/geminiService');
const { getEventsByCategory } = require('../services/participants');

// Gemini service handles AI interactions

const buildChatbotKnowledge = () => {
  const eventsByCategory = getEventsByCategory();

  const formatEventLine = (event) => {
    const schedule = event.schedule
      ? `${event.schedule.dayLabel} • ${event.schedule.time} • ${event.schedule.venue}`
      : 'Schedule TBA';
    return `• ${event.name} — ${event.summary} (${schedule})`;
  };

  const joinEvents = (label, list = []) => {
    if (!list.length) return `${label}: Details coming soon.`;
    return `${label} (team size ${list[0].min}-${list[0].max}${list[0].exception ? ' | special combination allowed' : ''}):\n${list.map(formatEventLine).join('\n')}`;
  };

  const quickEventSummary = [
    'Navaspurthi 2025 highlights 24 flagship events:',
    `• Special showcases: ${eventsByCategory.exception.map((e) => e.name).join(', ')}`,
    `• Group battles: ${eventsByCategory.group.map((e) => e.name).join(', ')}`,
    `• Solo spotlights: ${eventsByCategory.solo.map((e) => e.name).join(', ')}`,
    'Pick up to two events with at least one special event (Group Dance, Cricket, Fashion Show).'
  ].join('\n');

  const selectionRulesSummary = [
    'Event selection rules:',
    '• Register for a maximum of two events per participant.',
    '• If you choose two events, one must be a special exception event (Group Dance, Cricket, Fashion Show).',
    '• Team sizes are enforced exactly as listed for each event.',
    '• Every participant must upload a clear profile photo for ID card generation.'
  ].join('\n');

  const scheduleHighlightsSummary = [
    'Schedule highlights:',
    '• Day 1 (Mar 15): Opening ceremony, cultural showcases, debate & quiz rounds, evening DJ night.',
    '• Day 2 (Mar 16): Cricket league, design challenges, Fashion Show auditions, night band performance.',
    '• Day 3 (Mar 17): Creative studios, photography walk, Fashion Show finale, grand closing ceremony.'
  ].join('\n');

  const eventsCatalogueSection = [
    joinEvents('Special Events', eventsByCategory.exception),
    joinEvents('Group Events', eventsByCategory.group),
    joinEvents('Solo Events', eventsByCategory.solo)
  ].join('\n\n');

  const chatbotContext = [
    'Festival Overview:\n- Navaspurthi 2025 is a hybrid tech-cultural fest hosted by KLES BCA PC Jabin Science College, Hubballi.\n- Dates: March 15-17, 2025.\n- Venue: Campus at Vidyanagar, Hubballi – complete map and travel help on the Contact page.\n- Theme: Futuristic innovations meeting cultural brilliance, with ₹5,00,000+ in prizes.',
    'Registration & ID Cards:\n1. Fill the multi-step registration form (personal info → event selection → team details → upload photos).\n2. Profile photos are mandatory for every participant; we accept JPG/PNG up to 5 MB.\n3. After successful payment confirmation, the backend queues AI portrait enhancement and ID card generation.\n4. The system uploads ID cards to Supabase Storage and emails / exposes unique download links.\n5. You can track status and download cards from the completion screen or the admin dashboard.',
    selectionRulesSummary,
    `Event Catalogue:\n${eventsCatalogueSection}`,
    'Key Website Sections:\n- Home: hero banner, EventSlider, countdown, highlights.\n- Events: detailed categories, participant rules, and FAQs.\n- Registration: guided wizard with validation, team management, and live ID card status updates.\n- Schedule: consolidated three-day programme with venues and badges.\n- Contact: campus address, phone +91 93530 00805, email navaspurthi2025@klebcahubli.in, support hours.\n- Admin Dashboard: stats, registration review, participant photo/ID access (secured).',
    'ID Card & Photo Policies:\n- Only clear, single-person photos are accepted; blurry uploads are rejected.\n- Each generated ID card includes name, registration ID, college, events, QR code, and Gemini-enhanced visuals.\n- Participants can re-download cards anytime via the provided signed URL.',
    'Logistics & Support:\n- Accommodation support available on request for outstation teams.\n- On-campus food courts and vendor stalls stay open till late evenings.\n- Dedicated help desk near the main entrance during fest days.',
    scheduleHighlightsSummary
  ].join('\n\n');

  return {
    context: chatbotContext,
    quickEventSummary,
    selectionRulesSummary,
    scheduleHighlightsSummary
  };
};

const {
  context: chatbotContext,
  quickEventSummary,
  selectionRulesSummary,
  scheduleHighlightsSummary
} = buildChatbotKnowledge();

// Predefined responses for common queries
const quickResponses = {
  hi: 'Hi there! 👋 Welcome to Navaspurthi 2025! How can I help you today?',
  hello: 'Hello! 👋 Ask me anything about Navaspurthi 2025 – events, schedule, ID cards, or logistics.',
  register: 'Head to /register, follow the guided steps, and be sure to upload a clear profile photo for every participant.',
  registration: 'Complete the registration form, confirm your events, and upload participant photos. You\'ll get an AI-generated ID card once payment is confirmed.',
  schedule: scheduleHighlightsSummary,
  venue: 'Venue: KLES BCA PC Jabin Science College, Vidyanagar, Hubballi. Check the Contact page for maps and travel tips.',
  contact: 'Reach the core team at navaspurthi2025@klebcahubli.in or call +91 93530 00805 (Mon-Fri 9am-6pm).',
  events: quickEventSummary,
  prize: 'We\'re giving away prizes worth over ₹5,00,000 across competitions! 🏆',
  accommodation: 'Yes, accommodation for outstation participants is available on prior request. Let us know your travel plan.',
  dates: 'Mark your calendar: March 15-17, 2025.',
  id: 'Need your registration ID? Share your registered email and we\'ll retrieve it for you.',
  'lost id': 'Share the registered email ID, and the help desk will resend your registration details.',
  refund: 'Registrations are non-refundable unless an event is cancelled by the organizers.',
  team: selectionRulesSummary,
  workshop: 'We host deep-dive sessions on AI, robotics, design, and entrepreneurship – check the schedule page for timings.',
  certificate: 'Certificates are issued digitally to all participants and winners.',
  parking: 'Complimentary on-campus parking is available – follow on-ground signage.',
  food: 'Food stalls and cafeterias stay open all day with vegetarian and vegan options.',
  sponsor: 'For partnerships or sponsorships, drop a line to partnerships@navaspurthi.com'
};

// Helper function to find keyword matches
const findKeywordMatch = (message) => {
  const lowerMessage = message.toLowerCase();
  
  for (const [keyword, response] of Object.entries(quickResponses)) {
    if (lowerMessage.includes(keyword)) {
      return response;
    }
  }
  
  return null;
};

// POST /api/chatbot - Process chat message
router.post('/', async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // First, check for keyword-based quick responses
    const quickResponse = findKeywordMatch(message);
    
    if (quickResponse) {
      return res.json({
        success: true,
        response: quickResponse,
        type: 'quick',
        sessionId
      });
    }

    // Try AI response if configured
    if (geminiService.isConfigured()) {
      const aiContext = `${chatbotContext}

Additional quick facts:
- ${quickEventSummary}
- ${scheduleHighlightsSummary}`;

      const aiResult = await geminiService.generateChatResponse(message, aiContext);
      
      if (aiResult.success) {
        // Log successful AI response
        try {
          await supabaseAdmin
            .from('chatbot_logs')
            .insert([{
              session_id: sessionId,
              user_message: message,
              bot_response: aiResult.text,
              response_type: aiResult.type,
              created_at: new Date().toISOString()
            }]);
        } catch (logError) {
          console.error('Failed to log chatbot interaction:', logError);
        }

        return res.json({
          success: true,
          response: aiResult.text,
          type: aiResult.type,
          model: aiResult.model,
          sessionId
        });
      } else {
        console.log('AI failed, using fallback:', aiResult.error);
      }
    }

    // Use fallback response system
    const fallbackResult = geminiService.getFallbackResponse(message);

    // Log fallback response
    try {
      await supabaseAdmin
        .from('chatbot_logs')
        .insert([{
          session_id: sessionId,
          user_message: message,
          bot_response: fallbackResult.text,
          response_type: fallbackResult.type,
          created_at: new Date().toISOString()
        }]);
    } catch (logError) {
      console.error('Failed to log chatbot interaction:', logError);
    }

    res.json({
      success: true,
      response: fallbackResult.text,
      type: fallbackResult.type,
      sessionId
    });

  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ error: 'Chatbot service error' });
  }
});

// GET /api/chatbot/suggestions - Get chat suggestions
router.get('/suggestions', (req, res) => {
  const suggestions = [
    'How do I register?',
    'What are the event dates?',
    'Tell me about the prizes',
    'Where is the venue?',
    'What events are available?',
    'How can I contact the organizers?'
  ];

  res.json({
    success: true,
    suggestions
  });
});

// POST /api/chatbot/feedback - Submit chatbot feedback
router.post('/feedback', async (req, res) => {
  try {
    const { sessionId, messageId, feedback, rating } = req.body;

    // In production, store feedback in database
    console.log('Chatbot feedback received:', { sessionId, messageId, feedback, rating });

    res.json({
      success: true,
      message: 'Thank you for your feedback!'
    });

  } catch (error) {
    console.error('Feedback error:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

module.exports = router;
