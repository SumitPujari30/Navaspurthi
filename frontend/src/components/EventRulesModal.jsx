import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Clock, Award, User } from 'lucide-react';

const EventRulesModal = ({ event, isOpen, onClose }) => {
  if (!event) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-maroon/95 via-burgundy/95 to-dark-accent/95 border border-gold/30 rounded-3xl shadow-2xl"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Content */}
            <div className="p-6 sm:p-8">
              {/* Header */}
              <div className="mb-6">
                <h2 className="text-3xl sm:text-4xl font-orbitron font-bold text-gold mb-2">
                  {event.title}
                </h2>
                <div className="flex flex-wrap gap-3 items-center text-sm">
                  {event.format && (
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/20 text-gold">
                      <Users className="w-4 h-4" />
                      {event.format}
                    </span>
                  )}
                  {event.timeLimit && (
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/20 text-gold">
                      <Clock className="w-4 h-4" />
                      {event.timeLimit}
                    </span>
                  )}
                </div>
              </div>

              {/* Objective */}
              {event.objective && (
                <div className="mb-6">
                  <h3 className="text-xl font-orbitron font-bold text-gold mb-3">Objective</h3>
                  <p className="text-white/80 font-poppins leading-relaxed">
                    {event.objective}
                  </p>
                </div>
              )}

              {/* Rules & Regulations */}
              {event.rules && event.rules.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-orbitron font-bold text-gold mb-3">
                    Rules & Regulations
                  </h3>
                  <ul className="space-y-2">
                    {event.rules.map((rule, index) => (
                      <li key={index} className="flex items-start gap-3 text-white/80 font-poppins">
                        <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-gold/20 text-gold text-sm font-bold mt-0.5">
                          {index + 1}
                        </span>
                        <span className="flex-1">{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Judging Criteria */}
              {event.judgingCriteria && event.judgingCriteria.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-orbitron font-bold text-gold mb-3 flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Judging Criteria
                  </h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {event.judgingCriteria.map((criteria, index) => (
                      <li key={index} className="flex items-center gap-2 text-white/80 font-poppins">
                        <span className="w-2 h-2 rounded-full bg-gold"></span>
                        {criteria}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Coordinators */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-white/10">
                {event.facultyCoordinator && (
                  <div>
                    <h4 className="text-sm font-semibold text-gold mb-2 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Faculty Coordinator
                    </h4>
                    <p className="text-white/80 font-poppins text-sm">
                      {event.facultyCoordinator}
                    </p>
                  </div>
                )}
                {event.studentCoordinator && (
                  <div>
                    <h4 className="text-sm font-semibold text-gold mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Student Coordinator
                    </h4>
                    <p className="text-white/80 font-poppins text-sm">
                      {event.studentCoordinator}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default EventRulesModal;
