import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Users, Trophy, Sparkles, ArrowRight, Zap, Cpu, Palette } from 'lucide-react';
import EventSlider from '../components/EventSlider';
import canvaPainting from '../assets/canva_painting.png';
import fashionShow from '../assets/fashion_show.png';
import soloDance from '../assets/solo_dance.png';
import soloSinging from '../assets/solo_singing.png';
import pencilSketch from '../assets/pencil_sketch.png';
import design from '../assets/designing.png';
import mehendi from '../assets/mehendi.png';
import facePainting from '../assets/face_painting.png';
import skitPlay from '../assets/skit_play.png';
import shortMovie from '../assets/short_movie.jpg';
import Extempore from '../assets/extempore.png';
import reelMaking from '../assets/reel_making.jpg';
import rangoli from '../assets/rangoli.png';
import groupDance from '../assets/group_dance.png';
import photography from '../assets/photography.png';
import quiz from '../assets/quiz.png';
import dumbCharades from '../assets/dumb_charades.png';
import debate from '../assets/debate.png';
import instrumental from '../assets/instrumental.jpg';
import videography from '../assets/Videography.jpg';
import clayModeling from '../assets/clay_modeling.jpg';
import cricket from '../assets/cricket.jpg';
import bestOutOfWaste from '../assets/best_waste.jpg';




const Home = () => {
  // Sample events for the slider
  const sampleEvents = [
    { id: 1, title: 'Group Dance', image: groupDance },
    { id: 2, title: 'Solo Dance', image: soloDance },
    { id: 4, title: 'Solo Singing', image: soloSinging },
    { id: 5, title: 'Instrumental', image: instrumental },
    { id: 6, title: 'Fashion Show', image: fashionShow },
    { id: 7, title: 'Skit Play', image: skitPlay },
    { id: 8, title: 'Face Painting', image: facePainting },
    { id: 9, title: 'Canva Painting', image: canvaPainting },
    { id: 10, title: 'Pencil Sketch', image: pencilSketch },
    { id: 11, title: 'Photography', image: photography },
    { id: 12, title: 'Videography', image: videography },
    { id: 13, title: 'Short Movie', image: shortMovie },
    { id: 14, title: 'Reel Making', image: reelMaking },
    { id: 15, title: 'Quiz', image: quiz },
    { id: 16, title: 'Debate', image: debate },
    { id: 17, title: 'Dumb Charades', image: dumbCharades },
    { id: 18, title: 'Extempore', image: Extempore },
    { id: 19, title: 'Designing', image: design },
    { id: 20, title: 'Clay Modeling', image: clayModeling },
    { id: 21, title: 'Best out of Waste', image: bestOutOfWaste },
    { id: 22, title: 'Rangoli', image: rangoli },
    { id: 23, title: 'Mehendi', image: mehendi },
    { id: 24, title: 'Cricket', image: cricket }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section with Event Slider */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <EventSlider events={sampleEvents} />
      </section>

      
    </div>
  );
};

export default Home;
