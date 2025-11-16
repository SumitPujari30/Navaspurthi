// File: backend/routes/registrations.js
// Enhanced registration system with group events and validation rules
import express from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin } from '../config/supabase.js';
import aiImageService from '../services/aiImageService.js';
import idCardGenerator from '../services/idCardGenerator.js';
import { validateParticipants, normalizeEventName, EVENTS_CONFIG } from '../services/participants.js';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Exception events that can be combined with one non-exception event
const EXCEPTION_EVENTS = ['Group Dance', 'Cricket', 'Fashion Show'];

/**
 * Generate sequential registration ID using Supabase RPC
 * Falls back to timestamp-based ID if RPC fails
 */
async function generateRegistrationId() {
  try {
    // Try to use the RPC function for atomic ID generation
    const { data, error } = await supabaseAdmin.rpc('generate_registration_id');
    
    if (!error && data) {
      return data;
    }
    
    // Fallback to timestamp-based ID
    console.warn('RPC registration ID generation failed, using fallback:', error);
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `NV25-${timestamp}-${random}`;
  } catch (error) {
    // Ultimate fallback
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `NV25-${timestamp}-${random}`;
  }
}

/**
 * Validate event selection rules
 * Returns { valid: boolean, error?: string }
 */
function validateEventSelection(events) {
  if (!Array.isArray(events) || events.length === 0) {
    return { valid: false, error: 'At least one event must be selected' };
  }

  if (events.length > 2) {
    return { valid: false, error: 'Maximum 2 events can be selected' };
  }

  // Normalize and categorize events
  const normalizedEvents = events.map(e => ({
    ...e,
    normalizedName: normalizeEventName(e.name),
    config: EVENTS_CONFIG[normalizeEventName(e.name)]
  }));

  // Check for unknown events
  const unknownEvents = normalizedEvents.filter(e => !e.config);
  if (unknownEvents.length > 0) {
    return { 
      valid: false, 
      error: `Unknown events: ${unknownEvents.map(e => e.name).join(', ')}` 
    };
  }

  // Categorize events
  const exceptionEvents = normalizedEvents.filter(e => 
    EXCEPTION_EVENTS.includes(e.normalizedName)
  );
  const nonExceptionEvents = normalizedEvents.filter(e => 
    !EXCEPTION_EVENTS.includes(e.normalizedName)
  );

  // Rule 1: Maximum one non-exception event
  if (nonExceptionEvents.length > 1) {
    return { 
      valid: false, 
      error: 'Only one non-exception event can be selected' 
    };
  }

  // Rule 2: Maximum one exception event
  if (exceptionEvents.length > 1) {
    return { 
      valid: false, 
      error: `Only one of ${EXCEPTION_EVENTS.join(', ')} can be selected` 
    };
  }

  // Rule 3: If selecting 2 events, one must be exception
  if (events.length === 2 && exceptionEvents.length === 0) {
    return { 
      valid: false, 
      error: `When selecting 2 events, one must be from: ${EXCEPTION_EVENTS.join(', ')}` 
    };
  }

  return { valid: true };
}

/**
 * Check existing registrations for email
 */
async function checkExistingRegistrations(email) {
  try {
    const { data, error } = await supabaseAdmin
      .from('registrations')
      .select('events, event_category, registration_id')
      .eq('email', email)
      .is('deleted_at', null);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error checking existing registrations:', error);
    throw error;
  }
}

/**
 * Validate if new registration conflicts with existing ones
 */
function checkRegistrationConflicts(existingRegs, newEvents) {
  if (!existingRegs || existingRegs.length === 0) {
    return { valid: true };
  }

  // Extract all existing events
  const existingEvents = [];
  existingRegs.forEach(reg => {
    if (Array.isArray(reg.events)) {
      reg.events.forEach(event => {
        if (typeof event === 'string') {
          existingEvents.push(event);
        } else if (event.name) {
          existingEvents.push(event.name);
        }
      });
    }
  });

  // Normalize all events
  const existingNormalized = existingEvents.map(e => normalizeEventName(e));
  const newNormalized = newEvents.map(e => normalizeEventName(e.name));

  // Check for duplicate events
  const duplicates = newNormalized.filter(e => existingNormalized.includes(e));
  if (duplicates.length > 0) {
    return { 
      valid: false, 
      error: `Already registered for: ${duplicates.join(', ')}` 
    };
  }

  // Check combined rule compliance
  const allEvents = [...existingNormalized, ...newNormalized];
  const exceptions = allEvents.filter(e => EXCEPTION_EVENTS.includes(e));
  const nonExceptions = allEvents.filter(e => !EXCEPTION_EVENTS.includes(e));

  if (nonExceptions.length > 1) {
    return { 
      valid: false, 
      error: 'This email already has a non-exception event registration' 
    };
  }

  if (exceptions.length > 1) {
    return { 
      valid: false, 
      error: 'This email already has an exception event registration' 
    };
  }

  return { valid: true };
}

// POST /api/registrations - Create new registration with validation
router.post('/', upload.single('profileImage'), async (req, res) => {
  try {
    console.log('📝 Processing registration request');
    
    // Parse request body
    const {
      name,
      email,
      phone,
      college,
      department,
      year,
      events,
      // Legacy field support
      fullName
    } = req.body;

    // Use name or fallback to fullName for backward compatibility
    const registrantName = name || fullName;

    // Validate required fields
    if (!registrantName || !email || !events) {
      return res.status(400).json({
        status: 'error',
        code: 'MISSING_FIELDS',
        message: 'Name, email, and events are required'
      });
    }

    // Parse events if string
    let eventsData;
    try {
      eventsData = typeof events === 'string' ? JSON.parse(events) : events;
    } catch (e) {
      return res.status(400).json({
        status: 'error',
        code: 'INVALID_FORMAT',
        message: 'Invalid events format'
      });
    }

    // Validate event selection rules
    const eventValidation = validateEventSelection(eventsData);
    if (!eventValidation.valid) {
      return res.status(400).json({
        status: 'error',
        code: 'EVENT_CONFLICT',
        message: eventValidation.error
      });
    }

    // Check existing registrations
    const existingRegs = await checkExistingRegistrations(email);
    const conflictCheck = checkRegistrationConflicts(existingRegs, eventsData);
    if (!conflictCheck.valid) {
      return res.status(400).json({
        status: 'error',
        code: 'EVENT_CONFLICT',
        message: conflictCheck.error
      });
    }

    // Validate participants for each event
    let totalParticipants = 1; // Start with primary registrant
    const processedEvents = [];
    const allParticipants = [{
      name: registrantName,
      email: email,
      phone: phone,
      role: 'primary'
    }];

    for (const event of eventsData) {
      const normalizedName = normalizeEventName(event.name);
      const eventConfig = EVENTS_CONFIG[normalizedName];
      
      if (!eventConfig) {
        return res.status(400).json({
          status: 'error',
          code: 'INVALID_EVENT',
          message: `Unknown event: ${event.name}`
        });
      }

      // Validate participants for group events
      if (eventConfig.category === 'group') {
        const participantValidation = validateParticipants(
          event.participants || [], 
          eventConfig.min, 
          eventConfig.max
        );
        
        if (!participantValidation.valid) {
          return res.status(400).json({
            status: 'error',
            code: 'INVALID_PARTICIPANTS',
            message: `${event.name}: ${participantValidation.error}`
          });
        }

        // Add non-primary participants
        if (event.participants && event.participants.length > 0) {
          const nonPrimary = event.participants.filter(
            p => p.email !== email
          );
          allParticipants.push(...nonPrimary.map(p => ({
            ...p,
            role: 'participant',
            event: normalizedName
          })));
          totalParticipants += nonPrimary.length;
        }
      }

      processedEvents.push({
        name: normalizedName,
        category: eventConfig.category,
        participants: event.participants || []
      });
    }

    // Determine overall event category
    const hasGroup = processedEvents.some(e => e.category === 'group');
    const hasSolo = processedEvents.some(e => e.category === 'solo');
    const eventCategory = hasGroup && hasSolo ? 'mixed' : (hasGroup ? 'group' : 'solo');

    // Generate registration ID
    const registrationId = await generateRegistrationId();

    // Handle profile image upload
    let profileImageUrl = null;
    let aiImageUrl = null;
    let profileImageBuffer = null;

    if (req.file) {
      try {
        const fileName = `profile_${registrationId}_${Date.now()}.jpg`;
        
        // Store original buffer for AI processing
        profileImageBuffer = req.file.buffer;

        // Upload original profile image
        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
          .from('profiles')
          .upload(fileName, req.file.buffer, {
            contentType: req.file.mimetype,
            upsert: true
          });

        if (!uploadError) {
          const { data: urlData } = supabaseAdmin.storage
            .from('profiles')
            .getPublicUrl(fileName);
          
          profileImageUrl = urlData.publicUrl;
        }

        // Trigger AI image enhancement
        if (profileImageBuffer) {
          try {
            const enhancedResult = await aiImageService.enhanceProfileImage(
              profileImageBuffer,
              { fullName: registrantName }
            );

            if (enhancedResult.success) {
              const aiFileName = `ai_${registrationId}_${Date.now()}.jpg`;
              const { data: aiUpload } = await supabaseAdmin.storage
                .from('ai-images')
                .upload(aiFileName, enhancedResult.imageBuffer, {
                  contentType: 'image/jpeg',
                  upsert: true
                });

              if (aiUpload) {
                const { data: aiUrlData } = supabaseAdmin.storage
                  .from('ai-images')
                  .getPublicUrl(aiFileName);
                
                aiImageUrl = aiUrlData.publicUrl;
              }
            }
          } catch (aiError) {
            console.error('AI enhancement failed:', aiError);
            // Continue without AI enhancement
          }
        }
      } catch (uploadError) {
        console.error('Profile image upload failed:', uploadError);
        // Continue without profile image
      }
    }

    // Create registration record
    const registrationData = {
      registration_id: registrationId,
      full_name: registrantName,
      email: email,
      phone: phone,
      college: college,
      department: department,
      year: year,
      events: processedEvents,
      event_category: eventCategory,
      participants: allParticipants,
      total_participants: totalParticipants,
      primary_participant_email: email,
      profile_image_url: profileImageUrl,
      ai_image_url: aiImageUrl,
      ai_processed: !!aiImageUrl,
      created_at: new Date().toISOString(),
      event: processedEvents.map(e => e.name).join(', ') // Legacy field
    };

    // Insert into database
    const { data: registration, error: insertError } = await supabaseAdmin
      .from('registrations')
      .insert([registrationData])
      .select()
      .single();

    if (insertError) {
      console.error('Registration insert error:', insertError);
      return res.status(500).json({
        status: 'error',
        code: 'DB_ERROR',
        message: 'Failed to create registration'
      });
    }

    // Generate ID card asynchronously
    setTimeout(async () => {
      try {
        console.log(`🎨 Generating ID card for ${registrationId}`);
        
        const imageBuffer = aiImageUrl ? 
          await fetch(aiImageUrl).then(r => r.buffer()) :
          (profileImageBuffer || null);

        const idCardResult = await idCardGenerator.generateIDCard(
          {
            ...registrationData,
            registration_id: registrationId,
            events: processedEvents.map(e => e.name)
          },
          imageBuffer
        );

        if (idCardResult.success) {
          // Upload ID card
          const idCardFileName = `id_card_${registrationId}.png`;
          const { data: idCardUpload } = await supabaseAdmin.storage
            .from('id-cards')
            .upload(idCardFileName, idCardResult.buffer, {
              contentType: 'image/png',
              upsert: true
            });

          if (idCardUpload) {
            const { data: idCardUrlData } = supabaseAdmin.storage
              .from('id-cards')
              .getPublicUrl(idCardFileName);

            // Update registration with ID card URL
            await supabaseAdmin
              .from('registrations')
              .update({
                id_card_url: idCardUrlData.publicUrl,
                id_card_generated_at: new Date().toISOString(),
                id_card_path: idCardFileName
              })
              .eq('registration_id', registrationId);

            console.log(`✅ ID card generated for ${registrationId}`);
          }
        }
      } catch (idCardError) {
        console.error(`Failed to generate ID card for ${registrationId}:`, idCardError);
      }
    }, 1000); // Process after 1 second

    // Return success response
    res.status(201).json({
      status: 'ok',
      registration: {
        id: registration.id,
        registration_id: registrationId,
        name: registrantName,
        email: email,
        events: processedEvents.map(e => e.name),
        event_category: eventCategory,
        participants: allParticipants,
        total_participants: totalParticipants,
        profile_image_url: profileImageUrl,
        ai_image_url: aiImageUrl,
        id_card_url: null, // Will be generated async
        id_card_status: 'pending'
      },
      message: 'Registration successful! Your ID card is being generated.'
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      status: 'error',
      code: 'SERVER_ERROR',
      message: 'An unexpected error occurred'
    });
  }
});

// GET /api/registrations - List registrations with filters
router.get('/', async (req, res) => {
  try {
    const { 
      email, 
      registration_id,
      event,
      year,
      limit = 50,
      offset = 0 
    } = req.query;

    let query = supabaseAdmin
      .from('registrations')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (email) {
      query = query.eq('email', email);
    }

    if (registration_id) {
      query = query.eq('registration_id', registration_id);
    }

    if (event) {
      query = query.contains('events', [{ name: event }]);
    }

    if (year) {
      query = query.eq('year', year);
    }

    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      registrations: data || [],
      total: count,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

  } catch (error) {
    console.error('Error fetching registrations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch registrations'
    });
  }
});

// GET /api/registrations/:id - Get single registration
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if ID is registration_id or numeric id
    const isRegistrationId = id.startsWith('NV25-') || id.startsWith('NAVAS-');
    
    let query = supabaseAdmin
      .from('registrations')
      .select('*')
      .single();

    if (isRegistrationId) {
      query = query.eq('registration_id', id);
    } else {
      query = query.eq('id', id);
    }

    const { data, error } = await query;

    if (error || !data) {
      return res.status(404).json({
        success: false,
        error: 'Registration not found'
      });
    }

    res.json({
      success: true,
      registration: data
    });

  } catch (error) {
    console.error('Error fetching registration:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch registration'
    });
  }
});

// DELETE /api/registrations/:id - Soft delete registration
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabaseAdmin
      .from('registrations')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        error: 'Registration not found'
      });
    }

    res.json({
      success: true,
      message: 'Registration deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting registration:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete registration'
    });
  }
});

// Export as ES module
export default router;
