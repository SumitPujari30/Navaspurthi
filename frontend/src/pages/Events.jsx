import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { categoryStyles, festivalEvents } from '../data/events';
import EventRulesModal from '../components/EventRulesModal';

const coordinatorDetails = [
  {
    label: 'Event Coordinator',
    values: ['Prof. Soniya Gudgunti', 'Prof. Poornima Belagali']
  },
  {
    label: 'Student Coordinators',
    values: ['Mr. Anuj Savanur', 'Mr. Karthik Byagari', 'Ms. Priya Kudavakkal']
  }
];

const Events = () => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewRules = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedEvent(null), 300);
  };

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-orbitron font-bold text-gold-light">
            Festival Events
          </h1>
          <p className="mt-3 text-base sm:text-lg text-gold-light/80 font-poppins">
            24 marquee events to celebrate talent, creativity, and competitive spirit.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12 rounded-3xl border border-[#D4AF37]/45 bg-gradient-to-br from-[#2f0416]/95 via-[#200112]/96 to-[#0d0106]/98 p-8 shadow-[0_32px_90px_rgba(0,0,0,0.45)]"
        >
          <div className="flex flex-col gap-6 sm:flex-row sm:justify-between sm:items-start">
            <div>
              <h2 className="text-2xl font-orbitron text-gold-light mb-2">Event Coordinators</h2>
              <p className="text-sm font-poppins text-gold-light/70 max-w-xl">
                Reach out to our coordination team for registrations, guidelines, and logistics support.
              </p>
            </div>
            <div className="flex-1 space-y-3">
              {coordinatorDetails.map((item, index) => (
                <div key={`${item.label}-${index}`} className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-1 sm:gap-3 text-right">
                  {item.label && (
                    <span className="text-xs uppercase tracking-[0.35em] text-gold-light/60 font-semibold">
                      {item.label}
                    </span>
                  )}
                  <span className="font-poppins text-sm text-gold-light/90 grid grid-cols-1">
                    {item.values.map((value, idx) => (
                      <span key={`${value}-${idx}`} className="block">
                        {value}
                      </span>
                    ))}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
            {festivalEvents.map((event, index) => {
              const Icon = event.icon;
              const styles = categoryStyles[event.type] || categoryStyles.Dance;
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index }}
                  className="relative h-full"
                >
                  <div className="group relative h-full overflow-hidden rounded-3xl border border-[#D4AF37]/35 bg-gradient-to-br from-[#2B0718]/92 via-[#19010D]/95 to-[#050004]/98 p-6 sm:p-7 shadow-[0_30px_80px_rgba(0,0,0,0.45)] transition hover:border-gold hover:shadow-[0_36px_90px_rgba(212,175,55,0.25)]">
                    <div className="absolute inset-0 opacity-0 transition group-hover:opacity-100 bg-gradient-to-br from-[#f8c76f0d] via-transparent to-[#d4af3715]" aria-hidden="true"></div>
                    <div className="relative flex items-start justify-between gap-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs tracking-[0.25em] uppercase ${styles.badge}`}>
                        {event.type}
                      </span>
                      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border border-white/5 backdrop-blur-sm ${styles.iconBg}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                    </div>

                    <div className="relative mt-6 space-y-4">
                      <div>
                        <h3 className="text-2xl font-orbitron text-gold-light">
                          {event.title}
                        </h3>
                        {event.format && (
                          <p className="mt-2 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-gold-light/75">
                            {event.format}
                          </p>
                        )}
                      </div>
                      <p className="text-sm text-gold-light/70 font-poppins leading-relaxed">
                        {event.description}
                      </p>
                    </div>

                    <div className="relative mt-6 flex flex-col gap-3 text-sm">
                      <button
                        type="button"
                        onClick={() => handleViewRules(event)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-gold/50 px-5 py-2 font-semibold text-gold-light transition hover:border-gold hover:bg-gold/10"
                      >
                        Rules &amp; Regulations
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Event Rules Modal */}
        <EventRulesModal
          event={selectedEvent}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      </div>
    </div>
  );
};

export default Events;
