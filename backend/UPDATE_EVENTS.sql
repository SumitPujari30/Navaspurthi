-- =====================================================
-- UPDATE EVENTS IN DATABASE - ALL 24 EVENTS
-- =====================================================
-- Run this in Supabase SQL Editor to add all events

-- Clear existing events and insert all 24 events
DELETE FROM events;

INSERT INTO events (title, category, description, date, time, venue, team_size, prize, registration_fee, is_active) VALUES
-- Dance Events
('Group Dance', 'cultural', 'Showcase your team''s choreography skills in this high-energy dance competition.', '2025-03-15', '10:00', 'Main Auditorium', 'Team (5-12 members)', '₹25,000', 100, true),
('Solo Dance', 'cultural', 'Express yourself through dance in this individual performance competition.', '2025-03-15', '11:00', 'Main Auditorium', 'Individual', '₹15,000', 50, true),

-- Music Events
('Group Singing', 'cultural', 'Harmonize with your team in this melodious group singing competition.', '2025-03-15', '14:00', 'Music Hall', 'Team (3-8 members)', '₹20,000', 100, true),
('Solo Singing', 'cultural', 'Showcase your vocal talents in this solo singing competition.', '2025-03-15', '15:00', 'Music Hall', 'Individual', '₹12,000', 50, true),
('Instrumental', 'cultural', 'Display your musical instrument mastery in this competition.', '2025-03-15', '16:00', 'Music Hall', 'Individual', '₹10,000', 50, true),

-- Creative Events
('Fashion Show', 'cultural', 'Walk the ramp and showcase your style in this glamorous fashion show.', '2025-03-16', '18:00', 'Main Auditorium', 'Individual/Team', '₹30,000', 150, true),
('Photography', 'general', 'Capture the perfect moment in this photography competition.', '2025-03-15', '09:00', 'Campus Wide', 'Individual', '₹8,000', 25, true),
('Videography', 'general', 'Create compelling videos in this videography competition.', '2025-03-15', '09:00', 'Campus Wide', 'Individual/Team', '₹15,000', 50, true),
('Short Movie', 'general', 'Direct and produce your own short film in this movie-making competition.', '2025-03-16', '10:00', 'AV Hall', 'Team (3-15 members)', '₹40,000', 200, true),
('Reel Making', 'general', 'Create engaging short reels in this modern content creation competition.', '2025-03-16', '11:00', 'AV Hall', 'Individual/Team', '₹12,000', 75, true),
('Designing', 'general', 'Create innovative designs in this graphic designing competition.', '2025-03-15', '13:00', 'Computer Lab', 'Individual', '₹10,000', 50, true),

-- Art Events
('Face Painting', 'cultural', 'Create beautiful face art in this creative painting competition.', '2025-03-16', '14:00', 'Art Studio', 'Individual', '₹5,000', 25, true),
('Canvas Painting', 'cultural', 'Express your creativity on canvas in this painting competition.', '2025-03-16', '15:00', 'Art Studio', 'Individual', '₹8,000', 50, true),
('Pencil Sketch', 'cultural', 'Showcase your drawing skills in this pencil sketching competition.', '2025-03-16', '16:00', 'Art Studio', 'Individual', '₹6,000', 25, true),
('Clay Modeling', 'cultural', 'Sculpt beautiful creations in this clay modeling competition.', '2025-03-16', '17:00', 'Art Studio', 'Individual', '₹7,000', 50, true),
('Rangoli', 'cultural', 'Create beautiful rangoli patterns in this traditional art competition.', '2025-03-17', '09:00', 'Courtyard', 'Individual/Team', '₹8,000', 25, true),
('Mehendi', 'cultural', 'Design intricate henna patterns in this mehendi competition.', '2025-03-17', '10:00', 'Courtyard', 'Individual', '₹5,000', 25, true),

-- Literary Events
('Skit Play', 'cultural', 'Perform engaging skits and showcase your acting talents.', '2025-03-16', '12:00', 'Drama Hall', 'Team (3-10 members)', '₹20,000', 100, true),
('Quiz', 'general', 'Test your knowledge in this exciting quiz competition.', '2025-03-15', '17:00', 'Seminar Hall', 'Team (2-3 members)', '₹15,000', 50, true),
('Debate', 'general', 'Showcase your argumentative skills in this debate competition.', '2025-03-15', '18:00', 'Seminar Hall', 'Individual', '₹10,000', 25, true),
('Extempore', 'general', 'Speak spontaneously on given topics in this extempore competition.', '2025-03-15', '19:00', 'Seminar Hall', 'Individual', '₹8,000', 25, true),

-- Fun Events
('Dumb Charades', 'general', 'Act out words and phrases in this fun charades competition.', '2025-03-17', '11:00', 'Activity Hall', 'Team (4-6 members)', '₹10,000', 50, true),
('Best out of Waste', 'general', 'Create useful items from waste materials in this eco-friendly competition.', '2025-03-17', '12:00', 'Workshop Area', 'Individual', '₹8,000', 50, true),

-- Sports Events
('Cricket', 'general', 'Compete in this exciting cricket tournament.', '2025-03-17', '08:00', 'Cricket Ground', 'Team (11 members)', '₹50,000', 500, true);

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ SUCCESS: All 24 events added to database!';
    RAISE NOTICE '✅ Events are now available for registration!';
END $$;
