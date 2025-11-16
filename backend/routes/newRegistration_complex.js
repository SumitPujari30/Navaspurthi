const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const { supabaseAdmin } = require('../config/supabase');
const { registrationQueue } = require('../workers/registrationWorker');
const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// POST /api/register/init - Initialize registration
router.post('/init', async (req, res) => {
  try {
    console.log('🚀 Initializing new registration...');

    // Generate session token and registration ID
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .rpc('generate_session_token');
    
    if (tokenError) throw tokenError;

    const { data: regIdData, error: regIdError } = await supabaseAdmin
      .rpc('generate_registration_id');
    
    if (regIdError) throw regIdError;

    const sessionToken = tokenData;
    const registrationId = regIdData;

    // Create draft registration
    const { data, error } = await supabaseAdmin
      .from('new_registrations')
      .insert([{
        registration_id: registrationId,
        session_token: sessionToken,
        full_name: '',
        email: '',
        phone: '',
        college: '',
        age_group: '',
        event_name: '',
        status: 'draft'
      }])
      .select()
      .single();

    if (error) throw error;

    console.log('✅ Registration initialized:', registrationId);

    res.json({
      success: true,
      id: data.id,
      registration_id: registrationId,
      session_token: sessionToken,
      message: 'Registration initialized successfully'
    });

  } catch (error) {
    console.error('❌ Registration init error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to initialize registration'
    });
  }
});

// PATCH /api/register/update/:id - Update registration details
router.patch('/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { session_token, ...updateData } = req.body;

    console.log('📝 Updating registration:', id, updateData);

    // Verify session token
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('new_registrations')
      .select('*')
      .eq('id', id)
      .eq('session_token', session_token)
      .single();

    if (fetchError || !existing) {
      return res.status(404).json({
        success: false,
        error: 'Registration not found or invalid session'
      });
    }

    // Update registration
    const { data, error } = await supabaseAdmin
      .from('new_registrations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    console.log('✅ Registration updated:', id);

    res.json({
      success: true,
      data,
      message: 'Registration updated successfully'
    });

  } catch (error) {
    console.error('❌ Registration update error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update registration'
    });
  }
});

// POST /api/register/upload-url/:id - Upload profile image
router.post('/upload-url/:id', upload.single('profileImage'), async (req, res) => {
  try {
    const { id } = req.params;
    const { session_token } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided'
      });
    }

    console.log('📸 Uploading profile image for:', id);

    // Verify session token
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('new_registrations')
      .select('registration_id, session_token')
      .eq('id', id)
      .eq('session_token', session_token)
      .single();

    if (fetchError || !existing) {
      return res.status(404).json({
        success: false,
        error: 'Registration not found or invalid session'
      });
    }

    // Compress and resize image
    const compressedImage = await sharp(req.file.buffer)
      .resize(800, 800, { 
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ 
        quality: 85,
        progressive: true
      })
      .toBuffer();

    // Upload to Supabase Storage
    const fileName = `${existing.registration_id}.jpg`;
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('profiles')
      .upload(fileName, compressedImage, {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (uploadError) throw uploadError;

    // Update registration with image path
    const { error: updateError } = await supabaseAdmin
      .from('new_registrations')
      .update({ profile_image_path: uploadData.path })
      .eq('id', id);

    if (updateError) throw updateError;

    // Get signed URL for immediate display
    const { data: signedUrl } = await supabaseAdmin.storage
      .from('profiles')
      .createSignedUrl(fileName, 3600); // 1 hour

    console.log('✅ Profile image uploaded:', fileName);

    res.json({
      success: true,
      profile_image_path: uploadData.path,
      profile_image_url: signedUrl?.signedUrl,
      message: 'Profile image uploaded successfully'
    });

  } catch (error) {
    console.error('❌ Image upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload image'
    });
  }
});

// POST /api/register/confirm/:id - Confirm registration and start AI processing
router.post('/confirm/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { session_token } = req.body;

    console.log('🎯 Confirming registration:', id);

    // Verify session token and get registration
    const { data: registration, error: fetchError } = await supabaseAdmin
      .from('new_registrations')
      .select('*')
      .eq('id', id)
      .eq('session_token', session_token)
      .single();

    if (fetchError || !registration) {
      return res.status(404).json({
        success: false,
        error: 'Registration not found or invalid session'
      });
    }

    // Validate required fields
    const requiredFields = ['full_name', 'email', 'phone', 'college', 'age_group', 'event_name'];
    const missingFields = requiredFields.filter(field => !registration[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    if (!registration.profile_image_path) {
      return res.status(400).json({
        success: false,
        error: 'Profile image is required'
      });
    }

    // Check for duplicate email/phone
    const { data: duplicates, error: duplicateError } = await supabaseAdmin
      .from('new_registrations')
      .select('id, email, phone')
      .or(`email.eq.${registration.email},phone.eq.${registration.phone}`)
      .neq('id', id)
      .in('status', ['processing', 'completed']);

    if (duplicateError) throw duplicateError;

    if (duplicates && duplicates.length > 0) {
      const duplicateField = duplicates[0].email === registration.email ? 'email' : 'phone';
      return res.status(409).json({
        success: false,
        error: `Registration with this ${duplicateField} already exists`
      });
    }

    // Update status to processing
    const { error: updateError } = await supabaseAdmin
      .from('new_registrations')
      .update({ status: 'processing' })
      .eq('id', id);

    if (updateError) throw updateError;

    // Add job to queue for AI processing
    await registrationQueue.add('processRegistration', {
      registrationId: id,
      registration: registration
    }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
      removeOnComplete: 10,
      removeOnFail: 5
    });

    console.log('✅ Registration confirmed and queued for processing:', registration.registration_id);

    res.json({
      success: true,
      registration_id: registration.registration_id,
      status: 'processing',
      message: 'Registration confirmed! Your AI ID card is being generated.'
    });

  } catch (error) {
    console.error('❌ Registration confirmation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to confirm registration'
    });
  }
});

// GET /api/register/status/:id - Get registration status
router.get('/status/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { session_token } = req.query;

    // Get registration status
    const { data: registration, error } = await supabaseAdmin
      .from('new_registrations')
      .select('*')
      .eq('id', id)
      .eq('session_token', session_token)
      .single();

    if (error || !registration) {
      return res.status(404).json({
        success: false,
        error: 'Registration not found'
      });
    }

    // Get signed URLs if files exist
    let profileImageUrl = null;
    let aiImageUrl = null;
    let idCardUrl = null;

    if (registration.profile_image_path) {
      const { data: profileUrl } = await supabaseAdmin.storage
        .from('profiles')
        .createSignedUrl(registration.profile_image_path, 3600);
      profileImageUrl = profileUrl?.signedUrl;
    }

    if (registration.ai_image_path) {
      const { data: aiUrl } = await supabaseAdmin.storage
        .from('ai-images')
        .createSignedUrl(registration.ai_image_path, 3600);
      aiImageUrl = aiUrl?.signedUrl;
    }

    if (registration.id_card_path) {
      const { data: cardUrl } = await supabaseAdmin.storage
        .from('id-cards')
        .createSignedUrl(registration.id_card_path, 3600);
      idCardUrl = cardUrl?.signedUrl;
    }

    res.json({
      success: true,
      registration: {
        ...registration,
        profile_image_url: profileImageUrl,
        ai_image_url: aiImageUrl,
        id_card_url: idCardUrl
      }
    });

  } catch (error) {
    console.error('❌ Status check error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get registration status'
    });
  }
});

// POST /api/quick-register - Quick registration for seniors
router.post('/quick-register', async (req, res) => {
  try {
    const { name, phone, event } = req.body;

    if (!name || !phone || !event) {
      return res.status(400).json({
        success: false,
        error: 'Name, phone, and event are required'
      });
    }

    console.log('⚡ Quick registration for:', name);

    // Generate IDs
    const { data: tokenData } = await supabaseAdmin.rpc('generate_session_token');
    const { data: regIdData } = await supabaseAdmin.rpc('generate_registration_id');

    // Create registration
    const { data, error } = await supabaseAdmin
      .from('new_registrations')
      .insert([{
        registration_id: regIdData,
        session_token: tokenData,
        full_name: name,
        email: `${phone}@quickreg.navaspurthi.com`,
        phone: phone,
        college: 'Not Specified',
        age_group: 'Adult',
        event_name: event,
        status: 'completed'
      }])
      .select()
      .single();

    if (error) throw error;

    // Generate simple ID card immediately
    await registrationQueue.add('generateSimpleIdCard', {
      registrationId: data.id,
      registration: data
    });

    res.json({
      success: true,
      registration_id: regIdData,
      message: 'Quick registration successful! Your ID card will be ready shortly.'
    });

  } catch (error) {
    console.error('❌ Quick registration error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to complete quick registration'
    });
  }
});

module.exports = router;
