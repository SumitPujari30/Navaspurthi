const express = require('express');
const router = express.Router();
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { supabaseAdmin } = require('../config/supabase');
const aiImageService = require('../services/aiImageService');
const idCardGenerator = require('../services/idCardGenerator_enhanced.cjs');

// Import enhanced validation helpers
const { 
  EVENTS_CONFIG, 
  validateParticipants, 
  normalizeEventName,
  validateRegistrationPayload 
} = require('../services/participants');

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  }
});

// Exception events that can be combined with one non-exception event
const EXCEPTION_EVENTS = ['Group Dance', 'Cricket', 'Fashion Show'];

// Generate unique registration ID with new format
const generateRegistrationId = async () => {
  try {
    // Try to use the RPC function for atomic ID generation
    const { data, error } = await supabaseAdmin.rpc('generate_registration_id');
    
    if (!error && data) {
      return data;
    }
    
    // Fallback to timestamp-based ID
    console.log('Using fallback registration ID generation');
  } catch (error) {
    console.log('Using fallback registration ID generation');
  }
  
  // Fallback ID generation
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `NV25-${timestamp}-${random}`;
};

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
    // Use basic query that works with current database structure
    const { data, error } = await supabaseAdmin
      .from('registrations')
      .select('events, registration_id')
      .eq('email', email);

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

// POST /api/registrations - Create new registration with enhanced validation
router.post('/', upload.any(), async (req, res) => {
  try {
    console.log('📝 Processing enhanced registration request');

    // Parse request body
    const {
      name,
      email,
      phone,
      college,
      events,
      // Legacy field support
      fullName,
      primaryPhotoKey
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

    // Check existing registrations (handle missing columns gracefully)
    let existingRegs = [];
    try {
      existingRegs = await checkExistingRegistrations(email);
    } catch (error) {
      console.log('Note: Using legacy database structure, skipping conflict check');
      existingRegs = [];
    }
    
    if (existingRegs.length > 0) {
      const conflictCheck = checkRegistrationConflicts(existingRegs, eventsData);
      if (!conflictCheck.valid) {
        return res.status(400).json({
          status: 'error',
          code: 'EVENT_CONFLICT',
          message: conflictCheck.error
        });
      }
    }

    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    const registrationId = `NV25-${timestamp}-${random}`;
    console.log('Generated registration ID:', registrationId);

    const filesMap = Array.isArray(req.files)
      ? req.files.reduce((acc, file) => {
          acc[file.fieldname] = file;
          return acc;
        }, {})
      : {};
    
    console.log('📁 Files received:', Object.keys(filesMap));
    console.log('📋 Events data:', JSON.stringify(eventsData, null, 2));

    const uploadProfileImage = async (file, fileLabel) => {
      if (!file) return { url: null, path: null };

      const fileName = `${fileLabel}_${Date.now()}.jpg`;
      try {
        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
          .from('profiles')
          .upload(fileName, file.buffer, {
            contentType: file.mimetype,
            upsert: true
          });

        if (uploadError) {
          throw uploadError;
        }

        const { data: urlData } = supabaseAdmin.storage
          .from('profiles')
          .getPublicUrl(fileName);

        return {
          url: urlData?.publicUrl || null,
          path: uploadData?.path || null
        };
      } catch (err) {
        console.error(`Profile image upload failed (${fileLabel}):`, err);
        return { url: null, path: null };
      }
    };

    const processedEvents = [];
    const participantMap = new Map();
    let participantCounter = 0;

    const getParticipantKey = (participant) => {
      if (participant.email) {
        return participant.email.trim().toLowerCase();
      }
      const base = `${participant.name || 'participant'}-${participant.phone || ''}`.trim().toLowerCase();
      return `${base}-${participantCounter}`;
    };

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
      }

      const eventParticipants = Array.isArray(event.participants) && event.participants.length > 0
        ? event.participants
        : [{ name: registrantName, email, phone }];

      processedEvents.push({
        name: normalizedName,
        category: eventConfig.category,
        participants: []
      });

      for (const rawParticipant of eventParticipants) {
        const participant = { ...rawParticipant };
        const photoKey = participant.photoKey;
        delete participant.photoKey;

        const key = getParticipantKey(participant);
        const existing = participantMap.get(key);

        let participantId = existing?.participant_id;
        if (!participantId) {
          participantCounter += 1;
          participantId = `${registrationId}-${participantCounter.toString().padStart(3, '0')}`;
        }

        const role = existing?.role
          || (participant.email && participant.email.toLowerCase() === email.toLowerCase())
          || (!participant.email && participant.name && participant.name.trim().toLowerCase() === registrantName.trim().toLowerCase())
          ? 'primary'
          : 'participant';

        let uploadResult = { url: existing?.photo_url || null, path: existing?.photo_path || null };
        const file = photoKey ? filesMap[photoKey] : null;
        if (file) {
          uploadResult = await uploadProfileImage(file, participantId);
        }

        const mergedEvents = existing ? Array.from(new Set([...(existing.events || []), normalizedName])) : [normalizedName];

        const normalizedParticipant = {
          participant_id: participantId,
          name: participant.name || existing?.name || 'Participant',
          email: (participant.email || existing?.email || '').trim(),
          phone: (participant.phone || existing?.phone || '').trim(),
          role,
          events: mergedEvents,
          photo_url: uploadResult.url,
          photo_path: uploadResult.path
        };

        participantMap.set(key, normalizedParticipant);

        processedEvents[processedEvents.length - 1].participants.push({
          participant_id: participantId,
          name: normalizedParticipant.name,
          email: normalizedParticipant.email,
          phone: normalizedParticipant.phone,
          photo_url: normalizedParticipant.photo_url
        });
      }
    }

    const participantsForRecord = Array.from(participantMap.values());
    const totalParticipants = participantsForRecord.length;

    const hasGroup = processedEvents.some(e => e.category === 'group');
    const hasSolo = processedEvents.some(e => e.category === 'solo');
    const eventCategory = hasGroup && hasSolo ? 'mixed' : hasGroup ? 'group' : 'solo';

    let primaryPhotoUpload = { url: null, path: null };
    let aiImageUrl = null;
    let profileImageBuffer = null;

    if (primaryPhotoKey && filesMap[primaryPhotoKey]) {
      const primaryFile = filesMap[primaryPhotoKey];
      profileImageBuffer = primaryFile.buffer;
      primaryPhotoUpload = await uploadProfileImage(primaryFile, `primary_${registrationId}`);

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

              aiImageUrl = aiUrlData?.publicUrl || null;
            }
          }
        } catch (aiError) {
          console.error('AI enhancement failed:', aiError);
        }
      }
    }

    const registrationData = {
      registration_id: registrationId,
      full_name: registrantName,
      email: email,
      phone: phone || '',
      college: college || '',
      events: processedEvents,
      participants: participantsForRecord,
      ai_image_url: aiImageUrl || null,
      ai_processed: !!aiImageUrl,
      id_card_url: null,
      id_card_status: 'processing'
    };

    if (primaryPhotoUpload.url) {
      registrationData.profile_image_url = primaryPhotoUpload.url;
      registrationData.profile_image_path = primaryPhotoUpload.path;
    }

    console.log('📝 Attempting to insert registration data:', JSON.stringify(registrationData, null, 2));

    // Insert into database
    const { data: registration, error: insertError } = await supabaseAdmin
      .from('registrations')
      .insert([registrationData])
      .select()
      .single();

    if (insertError) {
      console.error('Registration insert error:', JSON.stringify(insertError, null, 2));
      console.error('Failed data:', JSON.stringify(registrationData, null, 2));
      return res.status(500).json({
        status: 'error',
        code: 'DB_ERROR',
        message: 'Failed to create registration',
        details: insertError.message
      });
    }

    // Generate ID cards for ALL participants asynchronously
    setTimeout(async () => {
      try {
        console.log(`🎨 Generating ID cards for ${participantsForRecord.length} participants`);
        
        const updatedParticipants = [];
        let allSuccess = true;

        for (const participant of participantsForRecord) {
          try {
            // Get participant's photo buffer
            let participantPhotoBuffer = null;
            if (participant.photo_url) {
              console.log(`📥 Fetching photo for ${participant.participant_id} from:`, participant.photo_url);
              const response = await fetch(participant.photo_url);
              if (response.ok) {
                const arrayBuffer = await response.arrayBuffer();
                participantPhotoBuffer = Buffer.from(arrayBuffer);
                console.log(`✅ Photo fetched successfully, size: ${participantPhotoBuffer.length} bytes`);
              } else {
                console.error(`❌ Failed to fetch photo: ${response.status} ${response.statusText}`);
              }
            }

            if (!participantPhotoBuffer) {
              console.warn(`⚠️ No photo available for participant ${participant.participant_id}`);
              updatedParticipants.push({
                ...participant,
                id_card_url: null,
                id_card_status: 'failed'
              });
              allSuccess = false;
              continue;
            }

            // Generate ID card for this participant using enhanced canvas generator
            console.log(`🎨 Generating ID card with enhanced canvas for ${participant.name} (${participant.participant_id})`);
            const idCardResult = await idCardGenerator.generateIDCard(
              {
                full_name: participant.name,
                registration_id: participant.participant_id,
                college: college || 'N/A',
                events: participant.events || []
              },
              participantPhotoBuffer
            );

            if (idCardResult.success) {
              console.log(`✅ ID card generated successfully for ${participant.participant_id}`);
              
              // Upload ID card with timestamp to force cache refresh
              const timestamp = Date.now();
              const idCardFileName = `id_card_${participant.participant_id}.png`;
              
              // Delete old ID card if exists (force regeneration with new template)
              console.log(`🗑️ Deleting old ID card if exists: ${idCardFileName}`);
              try {
                await supabaseAdmin.storage.from('id-cards').remove([idCardFileName]);
                console.log(`✅ Old ID card deleted (if existed)`);
              } catch (deleteError) {
                console.log(`ℹ️ No old ID card to delete or deletion failed (this is OK)`);
              }
              
              // Upload new ID card with fresh buffer
              console.log(`📤 Uploading NEW ID card with preserved base template: ${idCardFileName}`);
              const { data: idCardUpload, error: idCardUploadError } = await supabaseAdmin.storage
                .from('id-cards')
                .upload(idCardFileName, idCardResult.buffer, {
                  contentType: 'image/png',
                  upsert: true, // Overwrite if somehow still exists
                  cacheControl: '0' // Prevent caching
                });

              if (idCardUploadError) {
                console.error(`❌ Failed to upload ID card for ${participant.participant_id}:`, idCardUploadError);
                updatedParticipants.push({
                  ...participant,
                  id_card_url: null,
                  id_card_status: 'failed'
                });
                allSuccess = false;
                continue;
              }

              console.log(`📤 ID card uploaded successfully: ${idCardFileName}`);

              const { data: signedUrlData, error: signedUrlError } = await supabaseAdmin.storage
                .from('id-cards')
                .createSignedUrl(idCardFileName, 60 * 60 * 24); // 24 hours

              if (signedUrlError) {
                console.error(`❌ Failed to sign ID card URL for ${participant.participant_id}:`, signedUrlError);
                updatedParticipants.push({
                  ...participant,
                  id_card_url: null,
                  id_card_path: idCardFileName,
                  id_card_status: 'failed'
                });
                allSuccess = false;
                continue;
              }

              console.log(`🔗 ID card URL generated for ${participant.participant_id}`);

              updatedParticipants.push({
                ...participant,
                id_card_url: signedUrlData?.signedUrl || null,
                id_card_path: idCardFileName,
                id_card_status: 'ready'
              });

              console.log(`✅ ID card generated for ${participant.participant_id}`);
            } else {
              console.error(`❌ ID card generation failed for ${participant.participant_id}:`, 'Gemini service returned invalid buffer');
              updatedParticipants.push({
                ...participant,
                id_card_url: null,
                id_card_status: 'failed'
              });
              allSuccess = false;
            }
          } catch (participantError) {
            console.error(`❌ Exception while generating ID card for ${participant.participant_id}:`, participantError);
            updatedParticipants.push({
              ...participant,
              id_card_url: null,
              id_card_status: 'failed'
            });
            allSuccess = false;
          }
        }

        // Update registration with all participant ID cards
        const primaryParticipantCard = updatedParticipants.find(p => p.id_card_status === 'ready');

        await supabaseAdmin
          .from('registrations')
          .update({
            participants: updatedParticipants,
            id_card_status: allSuccess ? 'ready' : 'partial',
            id_card_generated_at: new Date().toISOString(),
            id_card_url: primaryParticipantCard?.id_card_url || null
          })
          .eq('registration_id', registrationId);

        console.log(`✅ All ID cards processed for registration ${registrationId}`);
      } catch (idCardError) {
        console.error(`Failed to generate ID cards for ${registrationId}:`, idCardError);
        await supabaseAdmin
          .from('registrations')
          .update({ id_card_status: 'failed' })
          .eq('registration_id', registrationId);
      }
    }, 1000); // Process after 1 second

    // Return success response
    res.status(201).json({
      status: 'ok',
      registration: {
        id: registration.id,
        registration_id: registrationId || `REG-${registration.id}`,
        name: registrantName,
        email: email,
        events: processedEvents.map(e => e.name),
        event_category: eventCategory,
        participants: participantsForRecord,
        total_participants: totalParticipants,
        profile_image_url: primaryPhotoUpload.url,
        ai_image_url: aiImageUrl,
        id_card_url: null, // Will be generated async
        id_card_status: 'processing'
      },
      message: 'Registration successful! Your ID card is being generated.'
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      status: 'error',
      code: 'SERVER_ERROR',
      message: 'An unexpected error occurred during registration',
      details: error?.message || 'Unknown error',
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }
});

// GET /api/registrations - Get all registrations (admin only)
router.get('/', async (req, res) => {
  try {
    // TODO: Add authentication middleware to verify admin
    
    const { data, error } = await supabaseAdmin
      .from('registrations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const parseJsonField = (value, fallback = []) => {
      if (!value) return fallback;
      if (Array.isArray(value)) return value;
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed) ? parsed : fallback;
        } catch (err) {
          return fallback;
        }
      }
      return fallback;
    };

    const resolveParticipantPhotos = async (participants) => {
      return Promise.all(
        participants.map(async (participant) => {
          let photoUrl = participant.photo_url || null;
          if (!photoUrl && participant.photo_path) {
            const { data: signed } = await supabaseAdmin.storage
              .from('profiles')
              .createSignedUrl(participant.photo_path, 3600);
            photoUrl = signed?.signedUrl || null;
          }

          // Resolve ID card URL
          let idCardUrl = participant.id_card_url || null;
          if (!idCardUrl && participant.id_card_path) {
            const { data: signed } = await supabaseAdmin.storage
              .from('id-cards')
              .createSignedUrl(participant.id_card_path, 3600);
            idCardUrl = signed?.signedUrl || null;
          }

          return {
            ...participant,
            photo_url: photoUrl,
            profileImageUrl: photoUrl,
            id_card_url: idCardUrl,
            idCardUrl: idCardUrl,
            participantId: participant.participant_id
          };
        })
      );
    };

    const registrationsWithSignedUrls = await Promise.all(
      data.map(async (record) => {
        let profileImageUrl = record.profile_image_url || null;
        if (!profileImageUrl && record.profile_image_path) {
          const { data: signed } = await supabaseAdmin.storage
            .from('profiles')
            .createSignedUrl(record.profile_image_path, 3600);
          profileImageUrl = signed?.signedUrl || null;
        }

        let aiImageUrl = record.ai_image_url || null;
        if (!aiImageUrl && record.ai_image_path) {
          const { data: signed } = await supabaseAdmin.storage
            .from('ai-images')
            .createSignedUrl(record.ai_image_path, 3600);
          aiImageUrl = signed?.signedUrl || null;
        }

        const events = parseJsonField(record.events);
        const participants = await resolveParticipantPhotos(parseJsonField(record.participants));

        // Enhance event participants with resolved URLs when possible
        const eventsWithParticipants = await Promise.all(events.map(async (event) => {
          if (!event?.participants) return event;
          const updatedParticipants = await Promise.all(
            event.participants.map(async (participant) => {
              if (participant.photo_url) return participant;
              const matching = participants.find(p => p.participant_id === participant.participant_id);
              if (matching) {
                return {
                  ...participant,
                  photo_url: matching.photo_url
                };
              }

              if (participant.photo_path) {
                const { data: signed } = await supabaseAdmin.storage
                  .from('profiles')
                  .createSignedUrl(participant.photo_path, 3600);
                return {
                  ...participant,
                  photo_url: signed?.signedUrl || null
                };
              }

              return participant;
            })
          );

          return {
            ...event,
            participants: updatedParticipants
          };
        }));

        return {
          ...record,
          profile_image_url: profileImageUrl,
          ai_image_url: aiImageUrl,
          events: eventsWithParticipants,
          participants,
          total_participants: participants.length
        };
      })
    );

    res.json({
      success: true,
      count: registrationsWithSignedUrls.length,
      registrations: registrationsWithSignedUrls
    });

  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/registrations/:id - Get single registration
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('registrations')
      .select('*')
      .eq('registration_id', id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    const parseJsonField = (value, fallback = []) => {
      if (!value) return fallback;
      if (Array.isArray(value)) return value;
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed) ? parsed : fallback;
        } catch (err) {
          return fallback;
        }
      }
      return fallback;
    };

    const resolveParticipantPhotos = async (participants) => {
      return Promise.all(
        participants.map(async (participant) => {
          let photoUrl = participant.photo_url || null;
          if (!photoUrl && participant.photo_path) {
            const { data: signed } = await supabaseAdmin.storage
              .from('profiles')
              .createSignedUrl(participant.photo_path, 3600);
            photoUrl = signed?.signedUrl || null;
          }

          // Resolve ID card URL
          let idCardUrl = participant.id_card_url || null;
          if (!idCardUrl && participant.id_card_path) {
            const { data: signed } = await supabaseAdmin.storage
              .from('id-cards')
              .createSignedUrl(participant.id_card_path, 3600);
            idCardUrl = signed?.signedUrl || null;
          }

          return {
            ...participant,
            photo_url: photoUrl,
            profileImageUrl: photoUrl,
            id_card_url: idCardUrl,
            idCardUrl: idCardUrl,
            participantId: participant.participant_id
          };
        })
      );
    };

    // Resolve AI image URL if needed
    if (data.ai_image_path && !data.ai_image_url) {
      const { data: signedUrl } = await supabaseAdmin.storage
        .from('ai-images')
        .createSignedUrl(data.ai_image_path, 3600);
      data.ai_image_url = signedUrl?.signedUrl;
    }

    const participants = await resolveParticipantPhotos(parseJsonField(data.participants));
    const events = parseJsonField(data.events);

    const eventsWithParticipants = await Promise.all(events.map(async (event) => {
      if (!event?.participants) return event;
      const updatedParticipants = event.participants.map((participant) => {
        const matching = participants.find(p => p.participant_id === participant.participant_id);
        return matching ? { ...participant, photo_url: matching.photo_url } : participant;
      });
      return {
        ...event,
        participants: updatedParticipants
      };
    }));

    res.json({
      success: true,
      registration: {
        ...data,
        participants,
        total_participants: participants.length,
        events: eventsWithParticipants
      }
    });

  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/registrations/:id - Update registration status
router.put('/:id', async (req, res) => {
  try {
    // TODO: Add authentication middleware to verify admin
    
    const { id } = req.params;
    const { status } = req.body;

    const { data, error } = await supabaseAdmin
      .from('registrations')
      .update({ status, updated_at: new Date() })
      .eq('registration_id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({
      success: true,
      registration: data
    });

  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/registrations/:id - Delete registration (admin only)
router.delete('/:id', async (req, res) => {
  try {
    // TODO: Add authentication middleware to verify admin
    
    const { id } = req.params;

    // First get the registration to delete associated files
    const { data: registration } = await supabaseAdmin
      .from('registrations')
      .select('profile_image_path, ai_image_path')
      .eq('registration_id', id)
      .single();

    // Delete associated files from storage
    if (registration) {
      if (registration.profile_image_path) {
        await supabaseAdmin.storage
          .from('profiles')
          .remove([registration.profile_image_path]);
      }
      if (registration.ai_image_path) {
        await supabaseAdmin.storage
          .from('ai-images')
          .remove([registration.ai_image_path]);
      }
    }

    // Delete registration from database
    const { error } = await supabaseAdmin
      .from('registrations')
      .delete()
      .eq('registration_id', id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({
      success: true,
      message: 'Registration deleted successfully'
    });

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/registrations/stats/overview - Get registration statistics
router.get('/stats/overview', async (req, res) => {
  try {
    // Get total registrations
    const { count: totalRegistrations } = await supabaseAdmin
      .from('registrations')
      .select('*', { count: 'exact', head: true });

    // Get registrations by status
    const { data: statusData } = await supabaseAdmin
      .from('registrations')
      .select('status');

    const statusCounts = statusData?.reduce((acc, curr) => {
      acc[curr.status] = (acc[curr.status] || 0) + 1;
      return acc;
    }, {});

    // Get registrations by event
    const { data: eventData } = await supabaseAdmin
      .from('registrations')
      .select('events');

    const eventCounts = {};
    eventData?.forEach(reg => {
      reg.events?.forEach(event => {
        eventCounts[event] = (eventCounts[event] || 0) + 1;
      });
    });

    res.json({
      success: true,
      stats: {
        total: totalRegistrations,
        byStatus: statusCounts,
        byEvent: eventCounts,
        lastUpdated: new Date()
      }
    });

  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
