// File: backend/services/participants.js
// Participant validation and event configuration service

const EVENTS_CONFIG = {
  // Exception events (can be combined with one non-exception)
  'Group Dance': {
    category: 'group',
    min: 6,
    max: 12,
    exception: true,
    summary: 'High-energy choreography performed by large crews with dramatic staging.',
    schedule: { dayId: 'day3', dayLabel: 'Day 3', time: '5:00 PM', venue: 'Main Auditorium' }
  },
  'Cricket': {
    category: 'group',
    min: 11,
    max: 15,
    exception: true,
    summary: 'Short-format cricket tournament with knockout finals under floodlights.',
    schedule: { dayId: 'day2', dayLabel: 'Day 2', time: '9:00 AM', venue: 'Main Ground' }
  },
  'Fashion Show': {
    category: 'group',
    min: 4,
    max: 12,
    exception: true,
    summary: 'Runway spectacle celebrating futurism with couture styling and storytelling.',
    schedule: { dayId: 'day3', dayLabel: 'Day 3', time: '7:00 PM', venue: 'Main Auditorium' }
  },
  
  // Other group events
  'Group Singing': {
    category: 'group',
    min: 4,
    max: 10,
    exception: false,
    summary: 'Choir ensembles harmonize across genres with live accompaniment.',
    schedule: { dayId: 'day1', dayLabel: 'Day 1', time: '12:30 PM', venue: 'Open Air Theatre' }
  },
  'Skit Play': {
    category: 'group',
    min: 6,
    max: 8,
    exception: false,
    summary: 'Theatrical short plays with strong narratives and quick set transitions.',
    schedule: { dayId: 'day1', dayLabel: 'Day 1', time: '3:00 PM', venue: 'Auditorium Studio' }
  },
  'Instrumental': {
    category: 'group',
    min: 1,
    max: 5,
    exception: false,
    summary: 'Bands and soloists showcase live instrumental arrangements.',
    schedule: { dayId: 'day1', dayLabel: 'Day 1', time: '5:30 PM', venue: 'Music Hall' }
  },
  'Face Painting': {
    category: 'group',
    min: 2,
    max: 2,
    exception: false,
    summary: 'Duos craft futuristic looks blending art and storytelling.',
    schedule: { dayId: 'day2', dayLabel: 'Day 2', time: '1:30 PM', venue: 'Design Studio' }
  },
  'Best out of Waste': {
    category: 'group',
    min: 2,
    max: 2,
    exception: false,
    summary: 'Teams upcycle materials into functional art pieces.',
    schedule: { dayId: 'day2', dayLabel: 'Day 2', time: '11:30 AM', venue: 'Makers Lab' }
  },
  'Clay Modeling': {
    category: 'group',
    min: 2,
    max: 2,
    exception: false,
    summary: 'Sculptors shape thematic clay artefacts live.',
    schedule: { dayId: 'day2', dayLabel: 'Day 2', time: '4:30 PM', venue: 'Art Block' }
  },
  'Mehendi': {
    category: 'group',
    min: 2,
    max: 2,
    exception: false,
    summary: 'Intricate henna artistry inspired by cultural motifs.',
    schedule: { dayId: 'day2', dayLabel: 'Day 2', time: '2:30 PM', venue: 'Cultural Court' }
  },
  'Designing': {
    category: 'group',
    min: 2,
    max: 2,
    exception: false,
    summary: 'Rapid prototyping challenge for futuristic product design.',
    schedule: { dayId: 'day2', dayLabel: 'Day 2', time: '3:30 PM', venue: 'Innovation Hub' }
  },
  'Mystery Box': {
    category: 'group',
    min: 2,
    max: 2,
    exception: false,
    summary: 'Creative build-off where teams transform surprise materials.',
    schedule: { dayId: 'day2', dayLabel: 'Day 2', time: '12:30 PM', venue: 'Makers Lab' }
  },
  'Dumb Charades': {
    category: 'group',
    min: 3,
    max: 5,
    exception: false,
    summary: 'Guessing frenzy with cinematic and tech-themed prompts.',
    schedule: { dayId: 'day1', dayLabel: 'Day 1', time: '4:30 PM', venue: 'Student Commons' }
  },
  'Quiz': {
    category: 'group',
    min: 2,
    max: 2,
    exception: false,
    summary: 'Two-member teams battle through tech and culture trivia.',
    schedule: { dayId: 'day1', dayLabel: 'Day 1', time: '2:30 PM', venue: 'Seminar Hall' }
  },
  
  // Solo events
  'Solo Dance': {
    category: 'solo',
    min: 1,
    max: 1,
    exception: false,
    summary: 'Spotlight performances blending classical and freestyle moves.',
    schedule: { dayId: 'day1', dayLabel: 'Day 1', time: '11:30 AM', venue: 'Main Auditorium' }
  },
  'Solo Singing': {
    category: 'solo',
    min: 1,
    max: 1,
    exception: false,
    summary: 'Vocalists perform prepared solo numbers with live judging.',
    schedule: { dayId: 'day1', dayLabel: 'Day 1', time: '12:00 PM', venue: 'Main Auditorium' }
  },
  'Canva Painting': {
    category: 'solo',
    min: 1,
    max: 1,
    exception: false,
    summary: 'Digital illustration sprint themed around technology and culture.',
    schedule: { dayId: 'day3', dayLabel: 'Day 3', time: '1:00 PM', venue: 'Design Studio' }
  },
  'Pencil Sketch': {
    category: 'solo',
    min: 1,
    max: 1,
    exception: false,
    summary: 'Artists capture live inspirations using graphite mediums.',
    schedule: { dayId: 'day3', dayLabel: 'Day 3', time: '2:00 PM', venue: 'Art Block' }
  },
  'Photography': {
    category: 'solo',
    min: 1,
    max: 1,
    exception: false,
    summary: 'Campus photowalk chronicling the spirit of Navaspurthi.',
    schedule: { dayId: 'day3', dayLabel: 'Day 3', time: '9:00 AM', venue: 'Campus Grounds' }
  },
  'Videography': {
    category: 'solo',
    min: 1,
    max: 1,
    exception: false,
    summary: 'Filmmakers craft short narratives in a timed shoot-and-edit challenge.',
    schedule: { dayId: 'day3', dayLabel: 'Day 3', time: '10:00 AM', venue: 'Media Lab' }
  },
  'Short Movie': {
    category: 'solo',
    min: 1,
    max: 1,
    exception: false,
    summary: 'Screening of short films produced ahead of the fest with live critique.',
    schedule: { dayId: 'day3', dayLabel: 'Day 3', time: '11:00 AM', venue: 'Screening Room' }
  },
  'Reel Making': {
    category: 'solo',
    min: 1,
    max: 1,
    exception: false,
    summary: 'Content creators produce trending reels in a themed creative sprint.',
    schedule: { dayId: 'day3', dayLabel: 'Day 3', time: '12:00 PM', venue: 'Media Lab' }
  },
  'Debate': {
    category: 'solo',
    min: 1,
    max: 1,
    exception: false,
    summary: 'Contestants argue futuristic topics with structured rebuttals.',
    schedule: { dayId: 'day1', dayLabel: 'Day 1', time: '1:30 PM', venue: 'Seminar Hall' }
  },
  'Extempore': {
    category: 'solo',
    min: 1,
    max: 1,
    exception: false,
    summary: 'Think-on-your-feet speeches delivered on surprise themes.',
    schedule: { dayId: 'day1', dayLabel: 'Day 1', time: '2:00 PM', venue: 'Seminar Hall' }
  },
  'Rangoli': {
    category: 'solo',
    min: 1,
    max: 1,
    exception: false,
    summary: 'Floor art installations inspired by tradition and neon futurism.',
    schedule: { dayId: 'day2', dayLabel: 'Day 2', time: '5:30 PM', venue: 'Cultural Court' }
  }
};

/**
 * Normalize event name for consistent comparison
 * @param {string} eventName - Raw event name from input
 * @returns {string} - Normalized event name
 */
function normalizeEventName(eventName) {
  if (!eventName) return '';
  
  // Remove extra spaces and standardize case
  const normalized = eventName.trim().toLowerCase();
  
  // Map common variations to canonical names
  const nameMap = {
    'groupdance': 'Group Dance',
    'group dance': 'Group Dance',
    'group-dance': 'Group Dance',
    'solodance': 'Solo Dance',
    'solo dance': 'Solo Dance',
    'solo-dance': 'Solo Dance',
    'groupsinging': 'Group Singing',
    'group singing': 'Group Singing',
    'group-singing': 'Group Singing',
    'solosinging': 'Solo Singing',
    'solo singing': 'Solo Singing',
    'solo-singing': 'Solo Singing',
    'fashionshow': 'Fashion Show',
    'fashion show': 'Fashion Show',
    'fashion-show': 'Fashion Show',
    'skitplay': 'Skit Play',
    'skit play': 'Skit Play',
    'skit': 'Skit Play',
    'facepainting': 'Face Painting',
    'face painting': 'Face Painting',
    'face-painting': 'Face Painting',
    'canvapainting': 'Canva Painting',
    'canva painting': 'Canva Painting',
    'canvas painting': 'Canva Painting',
    'pencilsketch': 'Pencil Sketch',
    'pencil sketch': 'Pencil Sketch',
    'pencil-sketch': 'Pencil Sketch',
    'shortmovie': 'Short Movie',
    'short movie': 'Short Movie',
    'short-movie': 'Short Movie',
    'reelmaking': 'Reel Making',
    'reel making': 'Reel Making',
    'reel-making': 'Reel Making',
    'reels': 'Reel Making',
    'dumbcharades': 'Dumb Charades',
    'dumb charades': 'Dumb Charades',
    'dumb-charades': 'Dumb Charades',
    'dumb charade': 'Dumb Charades',
    'claymodeling': 'Clay Modeling',
    'clay modeling': 'Clay Modeling',
    'clay-modeling': 'Clay Modeling',
    'clay modelling': 'Clay Modeling',
    'bestoutofwaste': 'Best out of Waste',
    'best out of waste': 'Best out of Waste',
    'best-out-of-waste': 'Best out of Waste',
    'mysterybox': 'Mystery Box',
    'mystery box': 'Mystery Box',
    'mystery-box': 'Mystery Box',
    'cricket': 'Cricket',
    'instrumental': 'Instrumental',
    'quiz': 'Quiz',
    'debate': 'Debate',
    'extempore': 'Extempore',
    'designing': 'Designing',
    'rangoli': 'Rangoli',
    'mehendi': 'Mehendi',
    'mehndi': 'Mehendi',
    'photography': 'Photography',
    'videography': 'Videography'
  };
  
  // Return canonical name or original if not found
  return nameMap[normalized] || 
         // Try to match by finding in EVENTS_CONFIG
         Object.keys(EVENTS_CONFIG).find(
           key => key.toLowerCase() === normalized
         ) || 
         eventName.trim();
}

/**
 * Validate participant count for an event
 * @param {Array} participants - Array of participant objects
 * @param {number} min - Minimum required participants
 * @param {number} max - Maximum allowed participants
 * @returns {Object} - { valid: boolean, error?: string }
 */
function validateParticipants(participants, min, max) {
  if (!Array.isArray(participants)) {
    return { 
      valid: false, 
      error: 'Participants must be an array' 
    };
  }
  
  const count = participants.length;
  
  if (count < min) {
    if (min === max) {
      return { 
        valid: false, 
        error: `Exactly ${min} participant${min > 1 ? 's' : ''} required` 
      };
    }
    return { 
      valid: false, 
      error: `Minimum ${min} participants required, got ${count}` 
    };
  }
  
  if (count > max) {
    if (min === max) {
      return { 
        valid: false, 
        error: `Exactly ${max} participant${max > 1 ? 's' : ''} required` 
      };
    }
    return { 
      valid: false, 
      error: `Maximum ${max} participants allowed, got ${count}` 
    };
  }
  
  // Validate each participant has required fields
  for (let i = 0; i < participants.length; i++) {
    const participant = participants[i];
    
    if (!participant.name || !participant.email) {
      return { 
        valid: false, 
        error: `Participant ${i + 1} missing required fields (name, email)` 
      };
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(participant.email)) {
      return { 
        valid: false, 
        error: `Participant ${i + 1} has invalid email format` 
      };
    }
    
    // Phone validation (optional but if provided, should be valid)
    if (participant.phone) {
      const phoneRegex = /^[\+]?[(]?[0-9]{2,4}[)]?[-\s\.]?[0-9]{3,4}[-\s\.]?[0-9]{4,6}$/;
      if (!phoneRegex.test(participant.phone.replace(/\s/g, ''))) {
        return { 
          valid: false, 
          error: `Participant ${i + 1} has invalid phone format` 
        };
      }
    }
  }
  
  // Check for duplicate emails
  const emails = participants.map(p => p.email.toLowerCase());
  const uniqueEmails = new Set(emails);
  
  if (emails.length !== uniqueEmails.size) {
    return { 
      valid: false, 
      error: 'Duplicate email addresses found in participants' 
    };
  }
  
  return { valid: true };
}

/**
 * Get event configuration
 * @param {string} eventName - Event name to look up
 * @returns {Object|null} - Event configuration or null if not found
 */
function getEventConfig(eventName) {
  const normalized = normalizeEventName(eventName);
  return EVENTS_CONFIG[normalized] || null;
}

/**
 * Check if an event is an exception event
 * @param {string} eventName - Event name to check
 * @returns {boolean} - True if exception event
 */
function isExceptionEvent(eventName) {
  const config = getEventConfig(eventName);
  return config ? config.exception === true : false;
}

/**
 * Get all events grouped by category
 * @returns {Object} - Events grouped by category
 */
function getEventsByCategory() {
  const grouped = {
    exception: [],
    group: [],
    solo: []
  };
  
  Object.entries(EVENTS_CONFIG).forEach(([name, config]) => {
    const eventInfo = {
      name,
      ...config
    };
    
    if (config.exception) {
      grouped.exception.push(eventInfo);
    } else if (config.category === 'group') {
      grouped.group.push(eventInfo);
    } else {
      grouped.solo.push(eventInfo);
    }
  });
  
  return grouped;
}

/**
 * Validate a complete registration payload
 * @param {Object} payload - Registration request payload
 * @returns {Object} - { valid: boolean, errors?: Array }
 */
function validateRegistrationPayload(payload) {
  const errors = [];
  
  // Required fields
  if (!payload.name && !payload.fullName) {
    errors.push('Name is required');
  }
  
  if (!payload.email) {
    errors.push('Email is required');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(payload.email)) {
      errors.push('Invalid email format');
    }
  }
  
  if (!payload.events || !Array.isArray(payload.events)) {
    errors.push('Events must be provided as an array');
  } else if (payload.events.length === 0) {
    errors.push('At least one event must be selected');
  } else if (payload.events.length > 2) {
    errors.push('Maximum 2 events can be selected');
  } else {
    // Validate each event
    payload.events.forEach((event, index) => {
      if (!event.name) {
        errors.push(`Event ${index + 1} missing name`);
        return;
      }
      
      const config = getEventConfig(event.name);
      if (!config) {
        errors.push(`Unknown event: ${event.name}`);
        return;
      }
      
      // Validate participants for group events
      if (config.category === 'group') {
        const validation = validateParticipants(
          event.participants || [],
          config.min,
          config.max
        );
        
        if (!validation.valid) {
          errors.push(`${event.name}: ${validation.error}`);
        }
      }
    });
    
    // Validate event combination rules
    const exceptionEvents = payload.events.filter(e => 
      isExceptionEvent(e.name)
    );
    const nonExceptionEvents = payload.events.filter(e => 
      !isExceptionEvent(e.name)
    );
    
    if (exceptionEvents.length > 1) {
      errors.push('Only one exception event (Group Dance, Cricket, Fashion Show) can be selected');
    }
    
    if (nonExceptionEvents.length > 1) {
      errors.push('Only one non-exception event can be selected');
    }
    
    if (payload.events.length === 2 && exceptionEvents.length === 0) {
      errors.push('When selecting 2 events, one must be an exception event (Group Dance, Cricket, Fashion Show)');
    }
  }
  
  // Optional field validation
  if (payload.phone) {
    const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    if (!phoneRegex.test(payload.phone.replace(/\s/g, ''))) {
      errors.push('Invalid phone number format');
    }
  }
  
  if (payload.year && !['1st', '2nd', '3rd', '4th'].includes(payload.year)) {
    errors.push('Year must be one of: 1st, 2nd, 3rd, 4th');
  }
  
  return errors.length > 0 
    ? { valid: false, errors }
    : { valid: true };
}

// Export all functions for CommonJS compatibility
module.exports = {
  EVENTS_CONFIG,
  normalizeEventName,
  validateParticipants,
  getEventConfig,
  isExceptionEvent,
  getEventsByCategory,
  validateRegistrationPayload
};
