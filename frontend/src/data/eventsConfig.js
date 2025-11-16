// Centralized event configuration shared across the frontend
// Keep min/max/exception fields in sync with backend/services/participants.js

export const EVENTS_CONFIG = {
  // Exception events (can be combined with one non-exception)
  'Group Dance': {
    category: 'group',
    min: 6,
    max: 12,
    exception: true,
    icon: 'Music',
    summary: 'High-energy choreography performed by large crews with dramatic staging.',
    schedule: { dayId: 'day2', dayLabel: 'Day 2', time: '5:00 PM', venue: 'Main Auditorium' }
  },
  'Cricket': {
    category: 'group',
    min: 11,
    max: 15,
    exception: true,
    icon: 'Trophy',
    summary: 'Short-format cricket tournament with knockout finals under floodlights.',
    schedule: { dayId: 'day2', dayLabel: 'Day 2', time: '9:00 AM', venue: 'Main Ground' }
  },
  'Fashion Show': {
    category: 'group',
    min: 4,
    max: 12,
    exception: true,
    icon: 'Sparkles',
    summary: 'Runway spectacle celebrating futurism with couture styling and storytelling.',
    schedule: { dayId: 'day2', dayLabel: 'Day 2', time: '7:00 PM', venue: 'Main Auditorium' }
  },

  // Other group events
  'Group Singing': {
    category: 'group',
    min: 4,
    max: 10,
    exception: false,
    icon: 'Music',
    summary: 'Choir ensembles harmonize across genres with live accompaniment.',
    schedule: { dayId: 'day1', dayLabel: 'Day 1', time: '12:30 PM', venue: 'Open Air Theatre' }
  },
  'Skit Play': {
    category: 'group',
    min: 6,
    max: 8,
    exception: false,
    icon: 'Users',
    summary: 'Theatrical short plays with strong narratives and quick set transitions.',
    schedule: { dayId: 'day1', dayLabel: 'Day 1', time: '3:00 PM', venue: 'Auditorium Studio' }
  },
  'Instrumental': {
    category: 'group',
    min: 1,
    max: 5,
    exception: false,
    icon: 'Music',
    summary: 'Bands and soloists showcase live instrumental arrangements.',
    schedule: { dayId: 'day1', dayLabel: 'Day 1', time: '5:30 PM', venue: 'Music Hall' }
  },
  'Face Painting': {
    category: 'group',
    min: 2,
    max: 2,
    exception: false,
    icon: 'Palette',
    summary: 'Duos craft futuristic looks blending art and storytelling.',
    schedule: { dayId: 'day2', dayLabel: 'Day 2', time: '1:30 PM', venue: 'Design Studio' }
  },
  'Best out of Waste': {
    category: 'group',
    min: 2,
    max: 2,
    exception: false,
    icon: 'Palette',
    summary: 'Teams upcycle materials into functional art pieces.',
    schedule: { dayId: 'day2', dayLabel: 'Day 2', time: '11:30 AM', venue: 'Makers Lab' }
  },
  'Clay Modeling': {
    category: 'group',
    min: 2,
    max: 2,
    exception: false,
    icon: 'Palette',
    summary: 'Sculptors shape thematic clay artefacts live.',
    schedule: { dayId: 'day2', dayLabel: 'Day 2', time: '4:30 PM', venue: 'Art Block' }
  },
  'Mehendi': {
    category: 'group',
    min: 2,
    max: 2,
    exception: false,
    icon: 'Palette',
    summary: 'Intricate henna artistry inspired by cultural motifs.',
    schedule: { dayId: 'day2', dayLabel: 'Day 2', time: '2:30 PM', venue: 'Cultural Court' }
  },
  'Designing': {
    category: 'group',
    min: 2,
    max: 2,
    exception: false,
    icon: 'Palette',
    summary: 'Rapid prototyping challenge for futuristic product design.',
    schedule: { dayId: 'day2', dayLabel: 'Day 2', time: '3:30 PM', venue: 'Innovation Hub' }
  },
  'Mystery Box': {
    category: 'group',
    min: 2,
    max: 2,
    exception: false,
    icon: 'Gamepad2',
    summary: 'Creative build-off where teams transform surprise materials.',
    schedule: { dayId: 'day2', dayLabel: 'Day 2', time: '12:30 PM', venue: 'Makers Lab' }
  },
  'Dumb Charades': {
    category: 'group',
    min: 3,
    max: 5,
    exception: false,
    icon: 'Users',
    summary: 'Guessing frenzy with cinematic and tech-themed prompts.',
    schedule: { dayId: 'day1', dayLabel: 'Day 1', time: '4:30 PM', venue: 'Student Commons' }
  },
  'Quiz': {
    category: 'group',
    min: 2,
    max: 2,
    exception: false,
    icon: 'Trophy',
    summary: 'Two-member teams battle through tech and culture trivia.',
    schedule: { dayId: 'day1', dayLabel: 'Day 1', time: '2:30 PM', venue: 'Seminar Hall' }
  },

  // Solo events
  'Solo Dance': {
    category: 'solo',
    min: 1,
    max: 1,
    exception: false,
    icon: 'User',
    summary: 'Spotlight performances blending classical and freestyle moves.',
    schedule: { dayId: 'day1', dayLabel: 'Day 1', time: '11:30 AM', venue: 'Main Auditorium' }
  },
  'Solo Singing': {
    category: 'solo',
    min: 1,
    max: 1,
    exception: false,
    icon: 'Music',
    summary: 'Vocalists perform prepared solo numbers with live judging.',
    schedule: { dayId: 'day1', dayLabel: 'Day 1', time: '12:00 PM', venue: 'Main Auditorium' }
  },
  'Canva Painting': {
    category: 'solo',
    min: 1,
    max: 1,
    exception: false,
    icon: 'Palette',
    summary: 'Digital illustration sprint themed around technology and culture.',
    schedule: { dayId: 'day2', dayLabel: 'Day 2', time: '10:00 AM', venue: 'Design Studio' }
  },
  'Pencil Sketch': {
    category: 'solo',
    min: 1,
    max: 1,
    exception: false,
    icon: 'Palette',
    summary: 'Artists capture live inspirations using graphite mediums.',
    schedule: { dayId: 'day1', dayLabel: 'Day 1', time: '2:00 PM', venue: 'Art Block' }
  },
  'Photography': {
    category: 'solo',
    min: 1,
    max: 1,
    exception: false,
    icon: 'Camera',
    summary: 'Campus photowalk chronicling the spirit of Navaspurthi.',
    schedule: { dayId: 'day1', dayLabel: 'Day 1', time: '9:00 AM', venue: 'Campus Grounds' }
  },
  'Videography': {
    category: 'solo',
    min: 1,
    max: 1,
    exception: false,
    icon: 'Camera',
    summary: 'Filmmakers craft short narratives in a timed shoot-and-edit challenge.',
    schedule: { dayId: 'day1', dayLabel: 'Day 1', time: '10:00 AM', venue: 'Media Lab' }
  },
  'Short Movie': {
    category: 'solo',
    min: 1,
    max: 1,
    exception: false,
    icon: 'Camera',
    summary: 'Screening of short films produced ahead of the fest with live critique.',
    schedule: { dayId: 'day2', dayLabel: 'Day 2', time: '11:00 AM', venue: 'Screening Room' }
  },
  'Reel Making': {
    category: 'solo',
    min: 1,
    max: 1,
    exception: false,
    icon: 'Camera',
    summary: 'Content creators produce trending reels in a themed creative sprint.',
    schedule: { dayId: 'day2', dayLabel: 'Day 2', time: '12:00 PM', venue: 'Media Lab' }
  },
  'Debate': {
    category: 'solo',
    min: 1,
    max: 1,
    exception: false,
    icon: 'Users',
    summary: 'Contestants argue futuristic topics with structured rebuttals.',
    schedule: { dayId: 'day1', dayLabel: 'Day 1', time: '1:30 PM', venue: 'Seminar Hall' }
  },
  'Extempore': {
    category: 'solo',
    min: 1,
    max: 1,
    exception: false,
    icon: 'User',
    summary: 'Think-on-your-feet speeches delivered on surprise themes.',
    schedule: { dayId: 'day1', dayLabel: 'Day 1', time: '2:00 PM', venue: 'Seminar Hall' }
  },
  'Rangoli': {
    category: 'solo',
    min: 1,
    max: 1,
    exception: false,
    icon: 'Palette',
    summary: 'Floor art installations inspired by tradition and neon futurism.',
    schedule: { dayId: 'day2', dayLabel: 'Day 2', time: '5:30 PM', venue: 'Cultural Court' }
  }
};

export const EVENT_ICON_MAP = {
  Music: 'music',
  Trophy: 'trophy',
  Sparkles: 'sparkles',
  Users: 'users',
  Palette: 'palette',
  Gamepad2: 'gamepad2',
  User: 'user',
  Camera: 'camera'
};

export const EVENT_LIST = Object.entries(EVENTS_CONFIG).map(([name, config]) => ({
  name,
  ...config
}));

export const EVENT_NAMES = EVENT_LIST.map((event) => event.name);

export const EVENTS_BY_CATEGORY = EVENT_LIST.reduce((acc, event) => {
  const key = event.exception ? 'exception' : event.category;
  acc[key] = acc[key] || [];
  acc[key].push(event);
  return acc;
}, {});
