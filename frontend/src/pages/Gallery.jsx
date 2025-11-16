import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Play } from 'lucide-react';

// Import local gallery images
import img1 from '../assets/gallery/WhatsApp Image 2025-11-16 at 15.57.29_6d2736ce.jpg';
import img2 from '../assets/gallery/WhatsApp Image 2025-11-16 at 15.57.29_a622702b.jpg';
import img3 from '../assets/gallery/WhatsApp Image 2025-11-16 at 15.58.10_000efc13.jpg';
import img4 from '../assets/gallery/WhatsApp Image 2025-11-16 at 15.58.11_884f13ce.jpg';
import img5 from '../assets/gallery/WhatsApp Image 2025-11-16 at 15.58.12_01247e43.jpg';
import img6 from '../assets/gallery/WhatsApp Image 2025-11-16 at 15.58.12_f37e1d37.jpg';
import img7 from '../assets/gallery/WhatsApp Image 2025-11-16 at 15.58.13_038dbba2.jpg';
import img8 from '../assets/gallery/WhatsApp Image 2025-11-16 at 15.58.13_d579bc05.jpg';

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const galleryItems = [
    // Navaspurthi Event Gallery
    { id: 1, type: 'image', category: 'navaspurthi', url: img1, title: 'Navaspurthi - Event Highlights' },
    { id: 2, type: 'image', category: 'navaspurthi', url: img2, title: 'Navaspurthi - Opening Ceremony' },
    { id: 3, type: 'image', category: 'navaspurthi', url: img3, title: 'Navaspurthi - Technical Events' },
    { id: 4, type: 'image', category: 'navaspurthi', url: img4, title: 'Navaspurthi - Cultural Performances' },
    { id: 5, type: 'image', category: 'navaspurthi', url: img5, title: 'Navaspurthi - Team Celebrations' },
    { id: 6, type: 'image', category: 'navaspurthi', url: img6, title: 'Navaspurthi - Award Ceremony' },
    { id: 7, type: 'image', category: 'navaspurthi', url: img7, title: 'Navaspurthi - Best Moments' },
    { id: 8, type: 'image', category: 'navaspurthi', url: img8, title: 'Navaspurthi - Grand Finale' }
  ];

  const filteredItems = galleryItems;

  const handlePrevious = () => {
    if (selectedImage) {
      const currentIndex = filteredItems.findIndex(item => item.id === selectedImage.id);
      const previousIndex = currentIndex > 0 ? currentIndex - 1 : filteredItems.length - 1;
      setSelectedImage(filteredItems[previousIndex]);
    }
  };

  const handleNext = () => {
    if (selectedImage) {
      const currentIndex = filteredItems.findIndex(item => item.id === selectedImage.id);
      const nextIndex = currentIndex < filteredItems.length - 1 ? currentIndex + 1 : 0;
      setSelectedImage(filteredItems[nextIndex]);
    }
  };

  return (
    <div className="min-h-screen pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl md:text-5xl font-orbitron font-bold text-gold drop-shadow-[0_0_20px_rgba(212,175,55,0.35)] inline-block">
            Gallery
            <span className="block text-base md:text-lg font-poppins font-medium mt-2 text-gold-light drop-shadow-[0_0_14px_rgba(244,208,63,0.25)]">
              Relive the best moments from our Past Events
            </span>
          </h1>
        </motion.div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="group relative cursor-pointer"
              onClick={() => setSelectedImage(item)}
            >
              <div className="relative overflow-hidden rounded-2xl bg-maroon/40 border border-gold/20 aspect-square">
                <img
                  src={item.type === 'video' ? item.thumbnail : item.url}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-dark-accent/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-white font-semibold">{item.title}</p>
                    <p className="text-white/80 text-sm capitalize">{item.category}</p>
                  </div>
                </div>

                {/* Video Icon */}
                {item.type === 'video' && (
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-16 h-16 bg-gold/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="w-8 h-8 text-gold ml-1" />
                    </div>
                  </div>
                )}

                {/* Hover Glow Effect */}
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-gold/50 rounded-2xl transition-colors"></div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Lightbox Modal */}
        {selectedImage && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            {/* Close Button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors text-white z-10"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Previous Button */}
            <button
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors text-white"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Next Button */}
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors text-white"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Image/Video Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-5xl w-full"
            >
              {selectedImage.type === 'video' ? (
                <div className="relative pt-[56.25%]">
                  <iframe
                    src={selectedImage.url}
                    title={selectedImage.title}
                    className="absolute top-0 left-0 w-full h-full rounded-xl"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <img
                  src={selectedImage.url}
                  alt={selectedImage.title}
                  className="w-full h-auto rounded-xl"
                />
              )}
              
              {/* Image Title */}
              <div className="mt-4 text-center">
                <h3 className="text-white text-xl font-semibold">{selectedImage.title}</h3>
                <p className="text-white/60 capitalize">{selectedImage.category}</p>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;
