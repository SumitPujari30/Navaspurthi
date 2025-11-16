import React from 'react';
import { motion } from 'framer-motion';
import { Target, Eye, Award, Users, Calendar, Zap } from 'lucide-react';

const About = () => {
  const eventCategories = [
    {
      category: 'Performing Arts',
      icon: '🎭',
      description: 'Dance, Music, Fashion Shows, and Theatrical Performances',
      count: '7',
      events: ['Group Dance', 'Solo Dance', 'Group Singing', 'Solo Singing', 'Instrumental Play', 'Fashion Show', 'Skit Play']
    },
    {
      category: 'Visual & Creative Arts',
      icon: '🎨',
      description: 'Painting, Sketching, Photography, and Design Competitions',
      count: '10',
      events: ['Face Painting', 'Canvas Painting', 'Pencil Sketch', 'Clay Modeling', 'Best out of Waste', 'Rangoli', 'Mehendi', 'Photography', 'Reel Making', 'Short Film']
    },
    {
      category: 'Literary & Intellectual',
      icon: '📚',
      description: 'Debate, Quiz, Extempore, and Public Speaking Events',
      count: '5',
      events: ['Quiz', 'Debate', 'Extempore', 'Dumb Charades', 'Mystery Box']
    },
    {
      category: 'Digital & Sports',
      icon: '⚡',
      description: 'Design Competitions and Cricket Tournament',
      count: '2',
      events: ['Designing', 'Cricket']
    }
  ];

  const timelineData = [
    {
      year: 'Planning',
      title: 'Vision & Preparation',
      description: 'Conceptualizing Navaspurthi 2025 with 24 diverse events across multiple categories to celebrate talent and creativity.',
      participants: 'Expected 1000+',
      events: '24'
    },
    {
      year: 'Event Day',
      title: 'Celebration Begins',
      description: 'Inter-college fest featuring competitions in dance, music, arts, literary events, and sports with expert judges and exciting prizes.',
      participants: 'Multi-College',
      events: '7 Categories'
    },
    {
      year: '2025',
      title: 'Making History',
      description: 'Creating memorable experiences for participants from colleges across the region at KLES BCA Hubballi.',
      participants: 'Expected 1000+',
      events: '24 Events'
    }
  ];

  const teamMembers = [
    {
      name: 'Dr. Rajesh Kumar',
      role: 'Faculty Coordinator',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      name: 'Priya Sharma',
      role: 'Student President',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      name: 'Arjun Patel',
      role: 'Technical Head',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      name: 'Sarah Johnson',
      role: 'Cultural Secretary',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
      gradient: 'from-orange-500 to-red-500'
    }
  ];

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-orbitron font-bold mb-4">
            <span className="bg-gradient-to-r from-gold to-gold-light bg-clip-text text-transparent">
              About Navaspurthi 2025
            </span>
          </h1>
          <p className="text-xl text-gold-light/80 font-poppins max-w-3xl mx-auto">
            KLES BCA PC JABIN SCIENCE COLLEGE HUBLI presents a futuristic tech-cultural fest celebrating innovation, creativity, and talent
          </p>
        </motion.div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8 mb-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-gold to-gold-light rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <div className="relative bg-gradient-to-br from-maroon/80 to-burgundy/80 rounded-2xl p-8 border border-gold/30 hover:border-gold/50 transition-colors">
              <div className="w-16 h-16 bg-gradient-to-r from-gold to-gold-light rounded-xl flex items-center justify-center text-maroon mb-6">
                <Target className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold font-orbitron mb-4 text-gold">Our Mission</h2>
              <p className="text-white/80 font-poppins leading-relaxed">
                To provide a comprehensive platform where students can showcase their talents across 24 diverse events spanning 
                dance, music, visual arts, creative design, literary competitions, and sports. Navaspurthi 2025 aims to celebrate 
                excellence, encourage teamwork, and promote healthy competition while fostering creativity and innovation.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-gold-light to-gold rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <div className="relative bg-gradient-to-br from-maroon/80 to-burgundy/80 rounded-2xl p-8 border border-gold/30 hover:border-gold/50 transition-colors">
              <div className="w-16 h-16 bg-gradient-to-r from-gold-light to-gold rounded-xl flex items-center justify-center text-maroon mb-6">
                <Eye className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold font-orbitron mb-4 text-gold">Our Vision</h2>
              <p className="text-white/80 font-poppins leading-relaxed">
                To establish Navaspurthi as the premier inter-college festival that brings together talented students from across 
                institutions to compete, collaborate, and celebrate. We envision creating an unforgettable experience that combines 
                traditional art forms with modern creative expression, providing a stage for every talent to shine.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-3xl font-bold font-orbitron text-center mb-12 text-gold">Event Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {eventCategories.map((cat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-maroon/80 to-burgundy/80 rounded-2xl p-6 border border-gold/20 hover:border-gold/50 transition-colors"
              >
                <div className="text-4xl mb-3">{cat.icon}</div>
                <h3 className="text-xl font-bold font-orbitron text-gold mb-2">{cat.category}</h3>
                <p className="text-white/70 text-sm mb-3">{cat.description}</p>
                <div className="text-3xl font-bold text-gold-light">{cat.count}</div>
                <p className="text-xs text-white/60">Events</p>
              </motion.div>
            ))}
          </div>
          <h2 className="text-3xl font-bold font-orbitron text-center mb-12 text-gold">Our Journey</h2>
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-gold via-gold-light to-gold"></div>
            
            {/* Timeline Items */}
            {timelineData.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className={`flex items-center mb-12 ${
                  index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
                }`}
              >
                <div className="w-1/2 px-8">
                  <div className={`${index % 2 === 0 ? 'text-right' : 'text-left'}`}>
                    <div className="bg-gradient-to-br from-maroon/80 to-burgundy/80 border border-gold/30 rounded-2xl p-6 shadow-lg inline-block">
                      <h3 className="text-4xl font-bold font-orbitron bg-gradient-to-r from-gold to-gold-light bg-clip-text text-transparent">
                        {item.year}
                      </h3>
                      <h4 className="text-xl font-semibold mt-2 mb-3 text-gold-light">{item.title}</h4>
                      <p className="text-white/80 mb-4">{item.description}</p>
                      <div className="flex gap-4 justify-center">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-gold">{item.participants}</p>
                          <p className="text-xs text-white/60">Participants</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-gold-light">{item.events}</p>
                          <p className="text-xs text-white/60">Events</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Timeline Dot */}
                <div className="relative z-10">
                  <div className="w-6 h-6 bg-maroon border-4 border-gold rounded-full"></div>
                </div>
                
                <div className="w-1/2"></div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Core Values */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-3xl font-bold font-orbitron text-center mb-12 text-gold">Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Zap, title: 'Innovation', desc: 'Pushing boundaries and embracing new ideas', color: 'from-gold to-gold-light' },
              { icon: Users, title: 'Collaboration', desc: 'Building connections and fostering teamwork', color: 'from-gold-light to-gold' },
              { icon: Award, title: 'Excellence', desc: 'Striving for the highest standards in everything', color: 'from-gold to-gold-light' }
            ].map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className={`w-20 h-20 mx-auto mb-4 bg-gradient-to-r ${value.color} rounded-2xl flex items-center justify-center text-maroon transform hover:rotate-6 transition-transform`}>
                  <value.icon className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold font-orbitron mb-2 text-gold">{value.title}</h3>
                <p className="text-white/70 font-poppins">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-gold/10 via-gold-light/10 to-gold/10 rounded-3xl p-12"
        >
          <h2 className="text-3xl font-bold font-orbitron text-center mb-12 text-gold">Navaspurthi 2025 in Numbers</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '24', unit: 'Events', desc: 'Across 7 Categories' },
              { value: '1000+', unit: 'Participants', desc: 'Expected Turnout' },
              { value: '7', unit: 'Categories', desc: 'Event Segments' },
              { value: '50+', unit: 'Coordinators', desc: 'Faculty & Students' }
            ].map((stat, index) => (
              <div key={index}>
                <div className="text-5xl font-bold font-orbitron bg-gradient-to-r from-gold to-gold-light bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <p className="text-lg font-semibold mt-2 text-gold-light">{stat.unit}</p>
                <p className="text-sm text-white/70">{stat.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default About;
