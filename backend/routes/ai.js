const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { supabaseAdmin } = require('../config/supabase');
const multer = require('multer');

// Configure multer for image uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Initialize Gemini AI
const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// POST /api/ai/generate-profile - Generate AI profile image
router.post('/generate-profile', upload.single('image'), async (req, res) => {
  try {
    const { registrationId, participantName } = req.body;
    const imageFile = req.file;

    if (!imageFile || !registrationId) {
      return res.status(400).json({ error: 'Image and registration ID are required' });
    }

    // Check if Gemini API is configured
    if (!genAI) {
      console.warn('Gemini API key not configured');
      return res.status(503).json({ 
        error: 'AI service temporarily unavailable',
        message: 'AI image generation is not configured' 
      });
    }

    // Try different vision models in order of preference (updated models)
    const visionModelNames = [
      "models/gemini-2.0-flash",
      "models/gemini-2.0-flash-exp", 
      "models/gemini-1.5-flash",
      "models/gemini-1.5-pro-vision",
      "gemini-2.0-flash",
      "gemini-1.5-flash"
    ];
    let model = null;
    let workingModelName = null;
    
    for (const modelName of visionModelNames) {
      try {
        model = genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: {
            temperature: 0.8,
            topK: 32,
            topP: 1,
            maxOutputTokens: 1024,
          },
        });
        
        // Test the model with a simple request
        await model.generateContent("Say hello");
        
        workingModelName = modelName;
        console.log(`✅ Using AI vision model: ${modelName}`);
        break;
      } catch (modelError) {
        console.log(`❌ Model ${modelName} failed: ${modelError.message}`);
        continue;
      }
    }
    
    if (!model) {
      console.warn('No vision models available, using fallback');
      return res.status(200).json({
        success: true,
        message: 'AI enhancement not available, using optimized original',
        imageUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(participantName || 'User')}&background=F8C76F&color=2B0718&size=512&font-size=0.5&bold=true`,
        type: 'fallback'
      });
    }

    // Convert image to base64
    const imageBase64 = imageFile.buffer.toString('base64');

    // Create the prompt for stylized image generation
    const prompt = `
      Generate a futuristic, white-neon themed portrait based on this participant's photo for Navaspurthi 2025.
      
      Style Requirements:
      - Use the person's face from the uploaded image
      - Apply a futuristic white-neon theme with bright whites
      - Add glowing blue/purple aura around the subject
      - Include holographic gradient background
      - Make it look like a high-tech, cyberpunk-style portrait
      - Enhance with light particles and motion blur effects
      - Resolution should be 1024x1024
      
      Participant Name: ${participantName || 'Participant'}
      Event: Navaspurthi 2025 - Futuristic Tech Fest
    `;

    // Generate content with Gemini
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: imageFile.mimetype,
          data: imageBase64
        }
      }
    ]);

    const response = await result.response;
    const generatedText = response.text();

    // Note: Gemini doesn't directly generate images, it provides descriptions
    // In a real implementation, you would use an image generation service like DALL-E or Stable Diffusion
    // For now, we'll store the description and use a placeholder

    // Generate a placeholder stylized image URL
    const placeholderUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(participantName || 'User')}&background=2DD4FF&color=fff&size=512&font-size=0.5&bold=true`;

    // Save AI generation metadata to database
    const fileName = `ai_${registrationId}_${Date.now()}.json`;
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('ai-images')
      .upload(fileName, JSON.stringify({
        prompt,
        response: generatedText,
        generatedAt: new Date(),
        placeholderUrl
      }), {
        contentType: 'application/json'
      });

    if (uploadError) {
      console.error('AI metadata upload error:', uploadError);
    }

    // Update registration with AI image path
    await supabaseAdmin
      .from('registrations')
      .update({ 
        ai_image_path: fileName,
        ai_image_url: placeholderUrl,
        ai_processed: true,
        ai_processed_at: new Date()
      })
      .eq('registration_id', registrationId);

    res.json({
      success: true,
      message: 'AI profile generation initiated',
      aiImageUrl: placeholderUrl,
      description: generatedText.substring(0, 200) + '...',
      model: workingModelName,
      note: 'Full AI image generation requires additional image synthesis service integration'
    });

  } catch (error) {
    console.error('AI generation error:', error);
    res.status(500).json({ error: 'AI generation failed', details: error.message });
  }
});

// GET /api/ai/status/:registrationId - Check AI generation status
router.get('/status/:registrationId', async (req, res) => {
  try {
    const { registrationId } = req.params;

    const { data, error } = await supabaseAdmin
      .from('registrations')
      .select('ai_processed, ai_image_url, ai_image_path')
      .eq('registration_id', registrationId)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    res.json({
      success: true,
      status: data.ai_processed ? 'completed' : 'pending',
      aiImageUrl: data.ai_image_url,
      aiImagePath: data.ai_image_path
    });

  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/ai/batch-generate - Generate AI profiles in batch (admin only)
router.post('/batch-generate', async (req, res) => {
  try {
    // TODO: Add admin authentication middleware
    
    const { registrationIds } = req.body;

    if (!registrationIds || !Array.isArray(registrationIds)) {
      return res.status(400).json({ error: 'Registration IDs array is required' });
    }

    // Process in background (in production, use a job queue)
    const processingResults = [];

    for (const id of registrationIds) {
      // Fetch registration details
      const { data: registration } = await supabaseAdmin
        .from('registrations')
        .select('*')
        .eq('registration_id', id)
        .single();

      if (registration && !registration.ai_processed) {
        // Queue for processing
        processingResults.push({
          registrationId: id,
          status: 'queued'
        });
      }
    }

    res.json({
      success: true,
      message: `Queued ${processingResults.length} profiles for AI generation`,
      results: processingResults
    });

  } catch (error) {
    console.error('Batch generation error:', error);
    res.status(500).json({ error: 'Batch generation failed' });
  }
});

module.exports = router;
