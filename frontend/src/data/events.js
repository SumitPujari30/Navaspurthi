import {
  Sparkles,
  Music,
  Mic2,
  Guitar,
  Crown,
  Clapperboard,
  Brush,
  Palette,
  Pencil,
  Camera,
  Video,
  Film,
  BookOpen,
  MessageCircle,
  Megaphone,
  PenTool,
  Hammer,
  Recycle,
  Flower,
  Leaf,
  Trophy,
  Smile,
  Box
} from 'lucide-react';

export const categoryStyles = {
  Dance: {
    badge: 'bg-gradient-to-r from-[#F8C76F] to-[#D4AF37] text-[#3d0520] font-semibold',
    iconBg: 'bg-[#fdf2d71a] text-[#F8C76F]'
  },
  Music: {
    badge: 'bg-gradient-to-r from-[#FFB4D0] to-[#FF85A1] text-[#42031a] font-semibold',
    iconBg: 'bg-[#ff85a11a] text-[#FFC4DA]'
  },
  Art: {
    badge: 'bg-gradient-to-r from-[#C6ABFF] to-[#8A63FF] text-[#2a0640] font-semibold',
    iconBg: 'bg-[#8a63ff1a] text-[#C6ABFF]'
  },
  Literary: {
    badge: 'bg-gradient-to-r from-[#A8E1FF] to-[#6CC2FF] text-[#03233a] font-semibold',
    iconBg: 'bg-[#6cc2ff1a] text-[#A8E1FF]'
  },
  Creative: {
    badge: 'bg-gradient-to-r from-[#B7F8D0] to-[#6EE7B7] text-[#013220] font-semibold',
    iconBg: 'bg-[#6ee7b71a] text-[#B7F8D0]'
  },
  Fun: {
    badge: 'bg-gradient-to-r from-[#E7C6FF] to-[#C084FC] text-[#3d0360] font-semibold',
    iconBg: 'bg-[#c084fc1a] text-[#E7C6FF]'
  },
  Sports: {
    badge: 'bg-gradient-to-r from-[#FFCF99] to-[#FF9F66] text-[#331000] font-semibold',
    iconBg: 'bg-[#ff9f661a] text-[#FFCF99]'
  }
};

export const festivalEvents = [
  {
    id: 'group-dance',
    title: 'Group Dance',
    type: 'Dance',
    format: 'Team (6-12 members)',
    timeLimit: '4+1 minutes',
    description: 'Promote teamwork, coordination, creativity, and expression through dance, while encouraging participants to showcase their talent and perform harmoniously as a group.',
    icon: Sparkles,
    objective: 'Promote teamwork, coordination, creativity, and expression through dance.',
    rules: [
      'Time limit is 4+1 minutes for each performance',
      'Each team may have 6-12 members',
      'Choice of songs is open to the participants',
      'Participants are requested to bring song in pen drive & submit it during registration',
      'No props will be provided. Participants can carry their own props',
      'Dance performance should not convey any indecent gestures',
      'The decision of the judges will be final'
    ],
    judgingCriteria: [
      'Choreography & Creativity',
      'Synchronization & Coordination',
      'Expression & Performance',
      'Costume & Presentation',
      'Musicality & Rhythm'
    ],
    facultyCoordinator: 'Prof. Sampada K and Prof. Poornima C',
    studentCoordinator: 'Chandrakant and Selina'
  },
  {
    id: 'solo-dance',
    title: 'Solo Dance',
    type: 'Dance',
    format: 'Individual',
    timeLimit: '3-4 minutes',
    description: 'Encourage individual artistic expression, improve stage confidence, and promote creativity and technical skill in dance.',
    icon: Music,
    objective: 'Encourage individual artistic expression and highlight the performer\'s unique style.',
    rules: [
      'Each participant must perform within a 3–4 minute time limit',
      'Music must be submitted in MP3 format on a pen drive before the event',
      'Participants may use simple props, but they must bring them on their own',
      'Costumes must be decent, safe, and suitable for a college event',
      'The performance should not include any indecent or inappropriate gestures',
      'Participants must report 30 minutes before the event starts',
      'The judges\' decision will be final and binding'
    ],
    judgingCriteria: [
      'Choreography Execution',
      'Performance Quality / Expression',
      'Creativity & Originality',
      'Costume & Appearance',
      'Overall Impression'
    ],
    facultyCoordinator: 'Prof. Sampada K and Prof. Poornima C',
    studentCoordinator: 'Chandrakant and Selina'
  },
  {
    id: 'group-singing',
    title: 'Group Singing',
    type: 'Music',
    format: 'Team (4-10 members)',
    timeLimit: '4+2 minutes',
    description: 'Develop confidence, improve vocal blending, and appreciate the beauty of collaborative music. Promotes unity, rhythm, and coordination within the group.',
    icon: Mic2,
    objective: 'Provide students a platform to develop confidence and improve vocal blending.',
    rules: [
      'Duration is 4+2min (including setup)',
      'Group Size Minimum of 4 and Maximum of 10 (Including Instrumental players)',
      'The language of the song can be either Kannada/Hindi',
      'Genre: Classical/Non-Classical',
      'Participants may sing with Karaoke or live instrument support',
      'Participants may not be allowed to refer to lyrics while singing',
      'The Judge\'s decision is final'
    ],
    judgingCriteria: [
      'Vocal Quality / Tone',
      'Harmony & Musical Arrangement',
      'Rhythm & Timing',
      'Expression & Musicality',
      'Team Coordination & Unity',
      'Diction & Pronunciation'
    ],
    facultyCoordinator: 'Prof. Varuni and Prof. Kavya',
    studentCoordinator: 'Jyothi M and Gayatri'
  },
  {
    id: 'solo-singing',
    title: 'Solo Singing',
    type: 'Music',
    format: 'Individual',
    timeLimit: '3+1 minutes',
    description: 'Provide a platform for individuals to showcase their vocal talent, creativity, and musical expression.',
    icon: Mic2,
    objective: 'Showcase vocal talent, creativity, and musical expression.',
    rules: [
      'Duration is 3+1min (including setup)',
      'Language of song can be either Kannada/Hindi',
      'Genre: Classical/Non-Classical',
      'Participants may sing with Karaoke or live instrument support provided instrument should play by themselves',
      'Participants may not be allowed to refer to lyrics while singing',
      'Judgement is on the basis of qualities like rhythm, Composition, Taal, Selection of Raga, Coordination and overall impression',
      'The Judge\'s decision is final'
    ],
    judgingCriteria: [
      'Vocal Quality / Tone',
      'Pitch Accuracy',
      'Rhythm & Timing',
      'Expression & Musicality',
      'Diction & Pronunciation'
    ],
    facultyCoordinator: 'Prof. Varuni and Prof. Kavya',
    studentCoordinator: 'Jyothi M and Gayatri'
  },
  {
    id: 'instrumental',
    title: 'Instrumental Play',
    type: 'Music',
    format: 'Team (1-5 members)',
    timeLimit: '3+1 minutes',
    description: 'Provide participants a platform to showcase their musical talent and mastery over an instrument, while expressing creativity and emotion through music.',
    icon: Guitar,
    objective: 'Showcase musical talent and mastery over instruments.',
    rules: [
      'Participants can play any musical instrument of their choice',
      'No pre-recorded music or background tracks are allowed',
      'Participants must bring their own instruments and required accessories',
      'Any genre or style is allowed, but the performance must be purely instrumental (no vocals)',
      'Exceeding the time limit will result in negative marking',
      'The decision of the judges will be final',
      'Team Size: 1 to 5 participants per institute',
      'Time Limit: 3+1 minutes'
    ],
    judgingCriteria: [
      'Clarity of Notes and Rhythm',
      'Technique and control',
      'Creativity and Expression',
      'Selection of piece',
      'Overall Impact'
    ],
    facultyCoordinator: 'Prof. Pooja P',
    studentCoordinator: 'Vaibhav and Durga'
  },
  {
    id: 'fashion-show',
    title: 'Fashion Show',
    type: 'Creative',
    format: 'Team (4-12 members)',
    timeLimit: '3+1 minutes',
    description: 'Provide participants a platform to showcase style, creativity, and confidence through fashion and presentation.',
    icon: Crown,
    objective: 'Showcase style, creativity, and confidence through fashion.',
    rules: [
      'Each team must consist of 4 to 12 members',
      'Time limit per performance: 3 minutes + 1-minute grace',
      'Open theme teams may choose any theme of their choice',
      'Music must be brought in a pen drive',
      'All tracks must be submitted at the time of registration',
      'No vulgarity or obscenity is allowed in the performance, music, costumes, or behavior',
      'Any violation will result in immediate disqualification',
      'The judge\'s decision is final and binding'
    ],
    judgingCriteria: [
      'Theme execution',
      'Walking stance and attitude',
      'Costumes',
      'Overall Presentation'
    ],
    facultyCoordinator: 'Prof. Krupa A and Prof. Bhavani G',
    studentCoordinator: 'Dhanashree and Nitin H'
  },
  {
    id: 'skit-play',
    title: 'Skit Play',
    type: 'Literary',
    format: 'Team (6-8 members)',
    timeLimit: '4-6 minutes',
    description: 'Develop confidence, collaboration, and performance skills while allowing students to portray themes, social issues, or stories effectively on stage.',
    icon: Clapperboard,
    objective: 'Develop confidence and portray themes effectively on stage.',
    rules: [
      'Open theme – teams may choose any theme they prefer',
      'Each performance should be 4 to 6 minutes long',
      'Content must be original, creative, and decent',
      'Language used should be clear, understandable, and respectful',
      'All props and costumes must be appropriate, decent, and theme-relevant',
      'Teams are expected to coordinate effectively and rehearse thoroughly',
      'The performance should deliver a clear and impactful message',
      'This is a team event with 6 to 8 members per team',
      'The judges\' decision will be final and binding'
    ],
    judgingCriteria: [
      'Acting Skills',
      'Script & Storyline',
      'Team Coordination & Timing',
      'Dialogue Delivery',
      'Use of Stage'
    ],
    facultyCoordinator: 'Prof. Krupa A and Prof. Bhavani G',
    studentCoordinator: 'Dhanashree and Nitin H'
  },
  {
    id: 'face-painting',
    title: 'Face Painting',
    type: 'Art',
    format: 'Team (2 members)',
    timeLimit: '60 minutes',
    description: 'Transform faces into colorful designs, characters, or patterns using safe, skin-friendly paints. Express imagination and personality through face art.',
    icon: Brush,
    objective: 'Transform faces into colorful designs and express imagination.',
    rules: [
      'Two participants in a team',
      'Participants should bring their own colors, brushes etc.',
      'Time limit is 60 minutes',
      'Theme will be given on spot',
      'Participants will be judged on the basis of creativity, innovation and design',
      'Decision of the judges will be final and abiding'
    ],
    judgingCriteria: [
      'Creativity & Originality',
      'Artistic Skill & Technique',
      'Design & Theme Relevance',
      'Color Harmony & Visual Appeal',
      'Creativity in Use of Face Space'
    ],
    facultyCoordinator: 'Prof. Anita K and Prof. Suraksha',
    studentCoordinator: 'Abhay and Disha'
  },
  {
    id: 'canvas-painting',
    title: 'Canvas Painting',
    type: 'Art',
    format: 'Individual',
    timeLimit: '3 hours',
    description: 'A blank canvas holds infinite possibilities. Colors speak louder than words, telling stories beyond language.',
    icon: Palette,
    objective: 'Create artwork on canvas expressing creativity and technique.',
    rules: [
      'It is an individual event. Each participant must create their painting within the given time',
      'Participants will have 3 hours to complete their artwork',
      'The theme will be provided on the spot or announced beforehand',
      'Participants must bring their own canvas, brushes, and colors (acrylic, oil, or watercolors allowed)',
      'The canvas must be blank at the start; pre-drawn outlines are not allowed',
      'Entries will be judged on creativity, originality, technique, and overall presentation'
    ],
    judgingCriteria: [
      'Creativity & Originality',
      'Artistic Skill & Technique',
      'Composition & Design',
      'Color Harmony & Visual Impact',
      'Theme Relevance'
    ],
    facultyCoordinator: 'Prof. Anita K and Prof. Suraksha',
    studentCoordinator: 'Abhay and Disha'
  },
  {
    id: 'pencil-sketch',
    title: 'Pencil Sketch',
    type: 'Art',
    format: 'Individual',
    timeLimit: '1 hour 30 minutes',
    description: 'Every stroke of a pencil brings an idea to life. A sketch captures emotions and details that words often cannot express.',
    icon: Pencil,
    objective: 'Create detailed sketches capturing emotions and details.',
    rules: [
      'It is an individual event. Each participant must create a sketch within the given time',
      'Participants will have 1 hour 30 minutes to complete their artwork',
      'The theme will be provided on the spot or announced beforehand',
      'Participants must bring their own pencils (graphite/charcoal), erasers, sharpeners, and sketching paper',
      'The paper must be blank at the start; pre-drawn outlines or tracing are not allowed'
    ],
    judgingCriteria: [
      'Technique & Skill',
      'Creativity & Originality',
      'Composition & Layout',
      'Theme Relevance'
    ],
    facultyCoordinator: 'Prof. Anita K and Prof. Suraksha',
    studentCoordinator: 'Abhay and Disha'
  },
  {
    id: 'photography',
    title: 'Photography',
    type: 'Creative',
    format: 'Individual',
    description: 'Photography is an art of observation. It has little to do with the things you see and everything to do with the way you see them.',
    icon: Camera,
    objective: 'Capture moments showcasing composition, quality, and artistic vision.',
    rules: [
      'Each Team will be represented by one participant',
      'The participant has to bring his/her own camera',
      'Participants must capture the specified number of photographs during the event day',
      'The theme will be announced on the event day itself',
      'Only photographs clicked within the event duration will be considered',
      'No mixing, matching, heavy editing, or morphing of photographs is allowed',
      'Only basic adjustments (brightness, contrast, cropping, exposure) may be permitted if approved',
      'Use of AI-generated or AI-edited images is strictly prohibited'
    ],
    judgingCriteria: [
      'Impact',
      'Quality',
      'Composition',
      'Suitability'
    ],
    facultyCoordinator: 'Prof. Savita G and Prof. Shobha G',
    studentCoordinator: 'Abhishek and Akshay'
  },
  {
    id: 'reel-making',
    title: 'Reel Making',
    type: 'Creative',
    format: 'Individual',
    timeLimit: '2 hours',
    description: 'A few seconds can tell a powerful story. Reels capture creativity, emotions, and messages in the most engaging way.',
    icon: Video,
    objective: 'Create engaging short reels showcasing creativity and storytelling.',
    rules: [
      'Only one participant in a team. Participant must create a reel based on the given theme',
      'The theme will be provided on the spot or announced beforehand',
      'Time Limit: Participant will have 2 hours to complete their reel',
      'No External Assistance: The work must be solely done by the participant',
      'The decision of the judges will be final and binding',
      'No usage of AI-generated video content (AI-created clips, AI avatars, AI scenes)',
      'All content must be created manually by the participant'
    ],
    judgingCriteria: [
      'Creativity & Originality',
      'Concept Clarity & Relevance',
      'Visual Appeal',
      'Editing & Transitions',
      'Audio Quality & Music Selection',
      'Engagement & Impact',
      'Technical Execution'
    ],
    facultyCoordinator: 'Prof. Mahesh Rao K',
    studentCoordinator: 'Naveen and Nitin U'
  },
  {
    id: 'short-movie',
    title: 'Short Film Event',
    type: 'Creative',
    format: 'Team (8-10 members)',
    timeLimit: '3 hours',
    description: 'Create original, compelling short films based on a specific theme. Tests creativity, storytelling, and filmmaking skills.',
    icon: Film,
    objective: 'Create original short films showcasing storytelling and filmmaking skills.',
    rules: [
      'It is a team event. A team can have 8-10 members',
      'Time limit for every team would be 3 hours',
      'The theme will be provided on the spot or announced beforehand',
      'The short film must be submitted in a standard video format (MP4, MOV, etc.) with resolution at least 720p',
      'No External Assistance: The work must be solely done by the participant',
      'The decision of the judges will be final and binding',
      'No usage of AI-generated video content',
      'All content must be created manually by the participant'
    ],
    judgingCriteria: [
      'Story & Content',
      'Direction & Execution',
      'Cinematography & Visuals',
      'Editing & Pacing',
      'Sound & Music',
      'Acting & Performance'
    ],
    facultyCoordinator: 'Prof. Mahesh Rao K',
    studentCoordinator: 'Naveen and Nitin U'
  },
  {
    id: 'quiz',
    title: 'Quiz',
    type: 'Literary',
    format: 'Team (2 members)',
    timeLimit: '20-30 seconds per question',
    description: 'Evaluate participants\' knowledge across diverse topics, promote analytical and quick-thinking abilities, and create an engaging learning experience.',
    icon: BookOpen,
    objective: 'Evaluate knowledge and promote analytical thinking.',
    rules: [
      'Each team has 2 members',
      'Strict time limits (20–30 seconds) for every question',
      'Only answers given within time are accepted',
      'No mobiles or external help allowed',
      'Respectful behaviour is mandatory',
      'Cheating or misconduct leads to disqualification',
      'Judges\' decisions are final and binding'
    ],
    judgingCriteria: [
      'Accuracy of Answers',
      'Time Management',
      'Teamwork & Coordination',
      'Logical Thinking & Reasoning'
    ],
    facultyCoordinator: 'Prof. Sharada',
    studentCoordinator: 'Arsheen and Rakshita'
  },
  {
    id: 'debate',
    title: 'Debate',
    type: 'Literary',
    format: 'Team (2 members)',
    timeLimit: '2-5 minutes per speaker',
    description: 'The art of presenting reasoned arguments while respecting opposing views. An opportunity to grow intellectually and understand diverse perspectives.',
    icon: MessageCircle,
    objective: 'Present reasoned arguments and understand diverse perspectives.',
    rules: [
      'Each team should have two members: one speaks for the motion, one against',
      'Each speaker gets 2-5 minutes to present their case',
      'After speeches, a brief rebuttal round (2 minutes) is allowed',
      'A warning bell will ring one minute before time runs out, marks deducted if time exceeded',
      'Arguments must be relevant to the debate topic and well supported by evidence',
      'Facts presented must be accurate, and offensive language or gestures are strictly prohibited',
      'Teams violating rules may be disqualified',
      'Judge\'s decision is final and binding'
    ],
    judgingCriteria: [
      'Content & Arguments',
      'Refutation & Rebuttal',
      'Delivery & Communication',
      'Organization',
      'Team Coordination',
      'Time Management',
      'Spontaneity'
    ],
    facultyCoordinator: 'Prof. Poornima H',
    studentCoordinator: 'Sahana P K and Sanjay'
  },
  {
    id: 'dumb-charades',
    title: 'Dumb Charades',
    type: 'Fun',
    format: 'Team (3-5 members)',
    timeLimit: '5 min acting + 2 min guessing',
    description: 'A classic game of acting out movie titles, songs, or phrases without speaking, relying purely on visual communication. A test of creativity, acting, and teamwork!',
    icon: Smile,
    objective: 'Test creativity, acting skills, and teamwork through non-verbal communication.',
    rules: [
      'Each team must consist of a minimum of 3 and a maximum of 5 members',
      'Categories: Indian/Bollywood Movie Titles, songs, place',
      'Time Limit: 5 minutes for acting round and 2 minute for guessing round',
      'No Speaking: The actor is strictly prohibited from speaking, mouthing words, or making audible sounds',
      'Content: Titles/phrases will be provided by organizers',
      'Fouls: Any team violating the "No Speaking" rule will face time penalty or disqualification',
      'Judging: Based on number of correct guesses and speed',
      'Decision of the judges will be final and abiding'
    ],
    judgingCriteria: [
      'Acting Skills',
      'Team Guessing Ability',
      'Time Management',
      'Creativity',
      'Coordination & Teamwork'
    ],
    facultyCoordinator: 'Prof. Deepak',
    studentCoordinator: 'Vishwanth and Sameer'
  },
  {
    id: 'extempore',
    title: 'Extempore',
    type: 'Literary',
    format: 'Individual',
    timeLimit: '1 min prep + 2-3 min speech',
    description: 'The true test of wit and confidence lies in speaking without preparation. When words flow spontaneously, they reveal the power of thought and expression.',
    icon: Megaphone,
    objective: 'Test spontaneity, wit, and confidence through impromptu speaking.',
    rules: [
      'It is an individual event',
      'Topic Selection: The topic will be given on the spot, 1 minute to prepare',
      'No prior preparation or external material is allowed',
      'Speech Duration: Each participant must speak for 2-3 minutes',
      'Language: The speech must be delivered in English',
      'No Use of Offensive Language: Any form of obscenity or inappropriate remarks leads to disqualification',
      'No External Aids: No mobile phones, notes, or reference material',
      'The decision of the judges will be final and binding'
    ],
    judgingCriteria: [
      'Content Quality',
      'Delivery',
      'Organization',
      'Time Management',
      'Spontaneity'
    ],
    facultyCoordinator: 'Prof. Somanath B',
    studentCoordinator: 'Aishwarya P and Karthik S'
  },
  {
    id: 'designing',
    title: 'Designing',
    type: 'Creative',
    format: 'Team (2 members)',
    description: 'Showcase creativity and innovation through unique digital designs, encouraging originality and visual communication.',
    icon: PenTool,
    objective: 'Showcase creativity through unique digital designs.',
    rules: [
      'Its a Digital Design event',
      'Each team must consist of exactly 2 members',
      'Both members must be from the same PU institution',
      'The event has 2 sub rounds',
      'The theme for the design will be announced on the spot',
      'Participants allowed to use any tools like Canva, Photoshop etc (Note: Not allowed to use prime or pro version)',
      'Participants no need bring any accessories for this event',
      'AI tools are not allowed to use'
    ],
    judgingCriteria: [
      'Creativity & Originality',
      'Aesthetics & Visual Appeal',
      'Relevance to Theme/Brief',
      'Technical Skills & Execution',
      'Practicality & Functionality',
      'Presentation & Explanation'
    ],
    facultyCoordinator: 'Prof. Hema C',
    studentCoordinator: 'Sahana M and Vinay H'
  },
  {
    id: 'clay-modeling',
    title: 'Clay Modeling',
    type: 'Art',
    format: 'Team (2 members)',
    timeLimit: '3 hours',
    description: 'Molding clay is like shaping dreams with your own hands — each curve and detail turning imagination into reality.',
    icon: Hammer,
    objective: 'Create artistic sculptures using clay, showcasing creativity and craftsmanship.',
    rules: [
      'The theme will be revealed on the spot',
      'Time Limit: 3 hours',
      'The team consists of 2 Members',
      'Basic clay will be provided',
      'Sculpting tools, shaping knives, brushes, additional clay colors, water spray allowed',
      'Clay must be raw and unshaped at the beginning. Pre-molded pieces strictly prohibited',
      'The artwork must be completely made during the event with no external assistance'
    ],
    judgingCriteria: [
      'Creativity & Originality',
      'Craftsmanship & Technique',
      'Theme Relevance',
      'Aesthetics & Visual Appeal',
      'Originality in Use of Materials'
    ],
    facultyCoordinator: 'Prof. Nikhita P and Mr. Manjunath B',
    studentCoordinator: 'Mallikarjun and Anjali'
  },
  {
    id: 'best-out-of-waste',
    title: 'Best out of Waste',
    type: 'Creative',
    format: 'Team (2 members)',
    timeLimit: '2 hours',
    description: 'Creativity turns the ordinary into the extraordinary—giving discarded items a new life. Create useful or artistic items using waste materials.',
    icon: Recycle,
    objective: 'Create useful or artistic items using waste materials, promoting sustainability.',
    rules: [
      'A theme will be provided on the spot',
      '2 hours to complete the project',
      'Team Size: 2 Members',
      'Newspapers will be provided by the organizers',
      'Participants may bring additional waste or recyclable materials (plastic bottles, cloth scraps, cardboard, etc.)',
      'All materials brought by participants must strictly be waste items only—no new materials allowed',
      'Tools Allowed: Scissors, glue, tape, staplers, thread, fevicol, or other basic adhesives',
      'No Pre-made Items: Everything must be created on the spot'
    ],
    judgingCriteria: [
      'Creativity & Originality',
      'Use of Materials',
      'Craftsmanship & Technique',
      'Theme Relevance',
      'Aesthetics & Visual Appeal'
    ],
    facultyCoordinator: 'Prof. Nikhita P and Mr. Manjunath B',
    studentCoordinator: 'Mallikarjun and Anjali'
  },
  {
    id: 'rangoli',
    title: 'Rangoli',
    type: 'Art',
    format: 'Team (2 members)',
    timeLimit: '2 hours',
    description: 'Rangoli is a way of beauty, which expresses the imagination. Design that pushes things forward and makes this occasion colorful.',
    icon: Flower,
    objective: 'Create beautiful rangoli art showcasing design, color, and traditional artistry.',
    rules: [
      'Rangoli art should not exceed the size of 4 ft. x 4 ft.',
      'A group may have not more than two participants',
      'Rangoli competition duration will not be more than 2 hrs',
      'Your Rangoli art should not offend the viewers and is presentable to viewers of all ages',
      'Participants need to bring all the required materials for their Rangoli',
      'Participants shall prepare a Rangoli within the space provided by organizers',
      'Themes will be given 10 min before start of competition',
      'No supporting reference materials will be allowed during competition',
      'The decision of the judges will be final and abiding'
    ],
    judgingCriteria: [
      'Design & Composition',
      'Use of Colors',
      'Neatness & Precision',
      'Creativity & Originality'
    ],
    facultyCoordinator: 'Prof. Akshatha and Prof. Shwetha',
    studentCoordinator: 'Rakasha M and Pooja I'
  },
  {
    id: 'mehendi',
    title: 'Mehendi',
    type: 'Art',
    format: 'Team (2 members)',
    timeLimit: '2 hours',
    description: 'Mehendi adorns the hands and life takes on a new color. Celebrating colors of life with Mehendi competition.',
    icon: Leaf,
    objective: 'Create intricate mehendi designs showcasing creativity and traditional artistry.',
    rules: [
      'Team event (2 members – one who will draw and the other whose hand will be used for the art)',
      'Participants have to carry their own materials',
      'Mehendi design should be creative and unique',
      'Mehendi design should be portrayed on one hand till elbow',
      'Participants will be judged on the basis of neatness and creativity',
      'Time allotted- 2 Hour',
      'Decision of the judges will be final',
      'No usage of Stickers, Black mehendi and Urgent mehendi'
    ],
    judgingCriteria: [
      'Design & Creativity',
      'Neatness & Precision',
      'Complexity & Detailing',
      'Coverage & Use of Space'
    ],
    facultyCoordinator: 'Prof. Akshatha and Prof. Shwetha',
    studentCoordinator: 'Rakasha M and Pooja I'
  },
  {
    id: 'mystery-box',
    title: 'Mystery Box',
    type: 'Fun',
    format: 'Team (2 members)',
    timeLimit: '30-45 minutes',
    description: 'Encourage creativity, innovation, and teamwork by creating unique craft items using provided materials within limited time.',
    icon: Box,
    objective: 'Test ability to think quickly and use limited resources effectively.',
    rules: [
      'Each team will consist of 2 participants only',
      'Every team must bring their own craft materials (papers, cardboard, glitters, decorative items, scissors, glue, etc.)',
      'Teams must create a craft item based on the theme announced on the spot',
      'Teams will have 30–45 minutes to complete their craft',
      'No Borrowing or Sharing: Teams cannot exchange or borrow items from other teams',
      'All craft-making must be done within the designated table/station only',
      'Teams must keep their working area clean; littering may lead to deduction of points',
      'Participants must handle scissors and tools properly',
      'Theme Relevance: The final craft must match or reflect the given theme'
    ],
    judgingCriteria: [
      'Creativity and originality',
      'Teamwork and time management',
      'Relevance to the theme',
      'Proper use of materials from the Mystery Box',
      'Neatness and finishing'
    ],
    facultyCoordinator: 'Prof. Aruna',
    studentCoordinator: 'Anil H and Ashwini P'
  },
  {
    id: 'cricket',
    title: 'Cricket',
    type: 'Sports',
    format: 'Team (11 members)',
    description: 'Compete in this exciting cricket tournament. Standard cricket rules apply with knockout/league format.',
    icon: Trophy,
    objective: 'Promote sportsmanship, teamwork, and cricket skills.',
    rules: [
      'Format: Knockout / League',
      'Reporting Time: 8:00 AM (Sharp)',
      'Place: KLES BCA PC Jabin Science College, Vidyanagar Hubballi',
      'All Players Must Wear Proper Cricket Attire',
      'Standard Cricket Rules Apply (With Local Adaptations If Necessary)',
      'Umpire Decisions Is Final',
      'Any Misconduct Or Unsportsmanlike Behavior May Lead To Disqualification',
      'In Case Of Rain Or Delay, Match Decisions Will Be Taken By The Organizing Committee'
    ],
    judgingCriteria: [
      'Team Performance',
      'Sportsmanship',
      'Individual Skills',
      'Match Outcome'
    ],
    awards: [
      'Winners: Championship Trophy + Certificates',
      'Runners-Up: Trophy + Certificates',
      'Best Batsman / Best Bowler'
    ],
    facultyCoordinator: 'Prof. Ravi W, Prof. Sanjay G, Prof. Shivraj, Prof. Ravikiran, Prof. Manjunath P, Mr. Manjunath B, Mr. Aditya, Mr. Vinayak',
    studentCoordinator: 'Sakshi Y and Tushar'
  }
];
