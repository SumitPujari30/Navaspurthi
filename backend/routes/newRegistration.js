const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { supabaseAdmin } = require('../config/supabase');

const router = express.Router();

// Configure multer for file uploads
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

// Initialize registration session
router.post('/init', async (req, res) => {
  try {
    const id = uuidv4();
    const session_token = uuidv4();
    const registration_id = `NAVAS-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;

    // Create initial registration record
    const { data, error } = await supabaseAdmin
      .from('new_registrations')
      .insert([{
        id,
        session_token,
        registration_id,
        status: 'draft',
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to initialize registration' 
      });
    }

    res.json({
      success: true,
      id,
      session_token,
      registration_id
    });

  } catch (error) {
    console.error('Init registration error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// Update registration data
router.patch('/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { session_token, ...updateData } = req.body;

    // Verify session token
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('new_registrations')
      .select('session_token')
      .eq('id', id)
      .single();

    if (fetchError || !existing || existing.session_token !== session_token) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid session' 
      });
    }

    // Update registration
    const { error } = await supabaseAdmin
      .from('new_registrations')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Update error:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to update registration' 
      });
    }

    res.json({ success: true });

  } catch (error) {
    console.error('Update registration error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// Upload profile image
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

    // Verify session token
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('new_registrations')
      .select('session_token')
      .eq('id', id)
      .single();

    if (fetchError || !existing || existing.session_token !== session_token) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid session' 
      });
    }

    // Upload to Supabase Storage
    const fileName = `${id}_${Date.now()}.${req.file.originalname.split('.').pop()}`;
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('profiles')
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to upload image' 
      });
    }

    // Update registration with image path
    const { error: updateError } = await supabaseAdmin
      .from('new_registrations')
      .update({
        profile_image_path: uploadData.path,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateError) {
      console.error('Update error:', updateError);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to update registration with image' 
      });
    }

    res.json({ 
      success: true,
      image_path: uploadData.path
    });

  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// Confirm registration (simplified - no AI processing)
router.post('/confirm/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { session_token } = req.body;

    // Verify session token
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('new_registrations')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existing || existing.session_token !== session_token) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid session' 
      });
    }

    // Update status to completed (simplified)
    const { error } = await supabaseAdmin
      .from('new_registrations')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Confirm error:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to confirm registration' 
      });
    }

    res.json({ success: true });

  } catch (error) {
    console.error('Confirm registration error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// Get registration status
router.get('/status/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { session_token } = req.query;

    // Verify session token and get registration
    const { data: registration, error } = await supabaseAdmin
      .from('new_registrations')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !registration || registration.session_token !== session_token) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid session' 
      });
    }

    res.json({ 
      success: true,
      registration: {
        ...registration,
        session_token: undefined // Don't send session token back
      }
    });

  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

module.exports = router;
