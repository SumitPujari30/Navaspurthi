// File: frontend/src/components/EventSelector.jsx
// Event selection component with group participant management
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, User, Plus, Minus, X, Check, AlertCircle, 
  Trophy, Music, Palette, Camera, Gamepad2, 
  Sparkles, Info, Download, Share2, Loader2
} from 'lucide-react';
import { EVENTS_CONFIG, EVENTS_BY_CATEGORY } from '../data/eventsConfig';

const ICON_COMPONENTS = {
  Trophy,
  Music,
  Palette,
  Camera,
  Gamepad2,
  Sparkles,
  Users,
  User
};

const getIconComponent = (iconName) => ICON_COMPONENTS[iconName] || Trophy;

const ParticipantModal = ({
  eventName,
  isOpen,
  config,
  eventData,
  userData,
  onClose,
  onSave
}) => {
  const getInitialParticipants = () => {
    if (eventData?.participants?.length) {
      return eventData.participants.map((participant) => ({
        name: participant.name || '',
        email: participant.email || '',
        phone: participant.phone || '',
        previewUrl: participant.photo_url || '',
        profileImage: null,
        photoField: participant.photoField || null
      }));
    }

    return [
      {
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        profileImage: null,
        previewUrl: '',
        photoField: null
      }
    ];
  };

  const [participants, setParticipants] = useState(getInitialParticipants);
  const [modalError, setModalError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setParticipants(getInitialParticipants());
    }
  }, [isOpen, eventData, userData]);

  const addParticipant = () => {
    if (participants.length < config.max) {
      setParticipants([...participants, { name: '', email: '', phone: '', profileImage: null, previewUrl: '', photoField: null }]);
    }
  };

  const removeParticipant = (index) => {
    if (participants.length > config.min && index > 0) {
      setParticipants(participants.filter((_, i) => i !== index));
    }
  };

  const updateParticipant = (index, field, value) => {
    setParticipants(participants.map((participant, i) => (
      i === index ? { ...participant, [field]: value } : participant
    )));
  };

  const handleImageUpload = (index, file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const fieldName = participants[index]?.photoField || `participant_${eventName.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}_${index}`;
        setParticipants(participants.map((participant, i) => 
          i === index ? { ...participant, profileImage: file, previewUrl: e.target.result, photoField: fieldName } : participant
        ));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    const missingFields = participants.some((participant, idx) => {
      if (!participant.name || !participant.email) {
        setModalError(`Participant ${idx + 1} requires name and email.`);
        return true;
      }
      if (!participant.previewUrl) {
        setModalError(`Participant ${idx + 1} must upload a profile photo.`);
        return true;
      }
      return false;
    });

    if (missingFields) {
      return;
    }

    setModalError('');
    onSave(participants);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <motion.div
      key={eventName}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-2xl w-full max-h-[85vh] sm:max-h-[80vh] overflow-y-auto border border-purple-500/30"
      >
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white pr-2">
            {eventName} - {config.category === 'solo' ? 'Participant Details' : 'Team Members'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-xs sm:text-sm text-blue-300">
            <Info className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
            {config.min === config.max 
              ? `Exactly ${config.min} participants required`
              : `${config.min} to ${config.max} participants required`}
          </p>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {participants.map((participant, index) => (
            <div key={index} className="p-3 sm:p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <div className="flex justify-between items-center mb-2 sm:mb-3">
                <span className="text-xs sm:text-sm font-medium text-gray-300">
                  Participant {index + 1} {index === 0 && '(Primary)'}
                </span>
                {participants.length > config.min && index > 0 && (
                  <button
                    onClick={() => removeParticipant(index)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Minus className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                )}
              </div>

              <div className="grid gap-2 sm:gap-3">
                <input
                  type="text"
                  placeholder="Full Name *"
                  value={participant.name}
                  onChange={(e) => updateParticipant(index, 'name', e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors"
                />
                <input
                  type="email"
                  placeholder="Email Address *"
                  value={participant.email}
                  onChange={(e) => updateParticipant(index, 'email', e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors"
                />
                <input
                  type="tel"
                  placeholder="Phone Number (Optional)"
                  value={participant.phone}
                  onChange={(e) => updateParticipant(index, 'phone', e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors"
                />

                {/* Profile Photo Upload */}
                <div className="mt-1 sm:mt-2">
                  <label className="block text-xs sm:text-sm text-gray-300 mb-1.5 sm:mb-2">
                    <Camera className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                    Profile Photo * (Required for ID Card)
                  </label>
                  <div className="flex items-center gap-2 sm:gap-4">
                    {participant.previewUrl && (
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 border-purple-500 flex-shrink-0">
                        <img src={participant.previewUrl} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <label className="flex-1 cursor-pointer">
                      <div className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-purple-600/20 border border-purple-500/50 rounded-lg text-purple-300 hover:bg-purple-600/30 transition-colors text-center">
                        {participant.previewUrl ? 'Change Photo' : 'Upload Photo'}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(index, e.target.files[0])}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {modalError && (
          <div className="mt-3 sm:mt-4 p-2.5 sm:p-3 bg-red-500/10 border border-red-500/40 rounded-lg text-red-300 text-xs sm:text-sm">
            {modalError}
          </div>
        )}

        <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-2 sm:gap-0 sm:justify-between">
          {participants.length < config.max && (
            <button
              onClick={addParticipant}
              className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-sm sm:text-base bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              Add Participant
            </button>
          )}
          <button
            onClick={handleSave}
            className="sm:ml-auto px-5 sm:px-6 py-2 text-sm sm:text-base bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg transition-all"
          >
            Save Team
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const EventSelector = ({ 
  userData = {}, 
  onSubmit,
  existingRegistrations = []
}) => {
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [participantModals, setParticipantModals] = useState({});
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(null);
  const [pollingIdCard, setPollingIdCard] = useState(false);

  // Group events by category
  const exceptionEvents = EVENTS_BY_CATEGORY.exception || [];
  const nonExceptionGroups = EVENTS_BY_CATEGORY.group || [];
  const soloEvents = EVENTS_BY_CATEGORY.solo || [];

  // Check if event can be selected based on rules
  const canSelectEvent = (eventName) => {
    const config = EVENTS_CONFIG[eventName];
    if (!config) return false;

    // Check existing registrations
    const existingEvents = existingRegistrations.flatMap(r => 
      Array.isArray(r.events) ? r.events.map(e => typeof e === 'string' ? e : e.name) : []
    );

    if (existingEvents.includes(eventName)) {
      return { allowed: false, reason: 'Already registered for this event' };
    }

    const currentSelection = selectedEvents.map(e => e.name);
    
    // If this event is already selected, allow deselection
    if (currentSelection.includes(eventName)) {
      return { allowed: true };
    }

    // Check selection rules
    if (currentSelection.length >= 2) {
      return { allowed: false, reason: 'Maximum 2 events allowed' };
    }

    const selectedExceptions = currentSelection.filter(e => EVENTS_CONFIG[e]?.exception);
    const selectedNonExceptions = currentSelection.filter(e => !EVENTS_CONFIG[e]?.exception);

    if (config.exception) {
      if (selectedExceptions.length > 0) {
        return { allowed: false, reason: 'Only one exception event allowed' };
      }
    } else {
      if (selectedNonExceptions.length > 0) {
        return { allowed: false, reason: 'Only one non-exception event allowed' };
      }
    }

    // If selecting second event, ensure one is exception
    if (currentSelection.length === 1) {
      const hasException = selectedExceptions.length > 0 || config.exception;
      if (!hasException) {
        return { allowed: false, reason: 'Second event must be an exception event (Group Dance, Cricket, Fashion Show)' };
      }
    }

    return { allowed: true };
  };

  // Toggle event selection
  const toggleEvent = (eventName) => {
    const canSelect = canSelectEvent(eventName);
    
    if (!canSelect.allowed && !selectedEvents.find(e => e.name === eventName)) {
      setErrors({ general: canSelect.reason });
      setTimeout(() => setErrors({}), 3000);
      return;
    }

    const config = EVENTS_CONFIG[eventName];
    const existing = selectedEvents.find(e => e.name === eventName);

    if (existing) {
      // Remove event
      setSelectedEvents(prev => prev.filter(e => e.name !== eventName));
      setParticipantModals(prev => ({ ...prev, [eventName]: false }));
    } else {
      // Add event
      const newEvent = {
        name: eventName,
        category: config.category,
        participants: config.category === 'solo' ? 
          [{ name: userData.name || '', email: userData.email || '', phone: userData.phone || '' }] : 
          []
      };

      setSelectedEvents(prev => [...prev, newEvent]);

      // Open participant modal for both solo and group events (solo needs photo upload)
      setParticipantModals(prev => ({ ...prev, [eventName]: true }));
    }

    setErrors({});
  };

  // Handle participants for an event
  const updateEventParticipants = (eventName, participants) => {
    setSelectedEvents(prev => prev.map(event => 
      event.name === eventName 
        ? { ...event, participants }
        : event
    ));
  };

  // Validate and submit registration
  const handleSubmit = async () => {
    // Validate all events have required participants
    const validationErrors = {};
    
    for (const event of selectedEvents) {
      const config = EVENTS_CONFIG[event.name];
      const count = event.participants?.length || 0;
      
      if (count < config.min) {
        validationErrors[event.name] = `Minimum ${config.min} participant${config.min > 1 ? 's' : ''} required`;
      } else if (count > config.max) {
        validationErrors[event.name] = `Maximum ${config.max} participant${config.max > 1 ? 's' : ''} allowed`;
      }
      
      // Validate participant details
      event.participants?.forEach((p, index) => {
        if (!p.name || !p.email) {
          validationErrors[`${event.name}_${index}`] = 'Name and email required for all participants';
        }
        if (!p.previewUrl && !p.profileImage) {
          validationErrors[`${event.name}_photo_${index}`] = 'Profile photo required for ID card';
        }
      });
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      // Prepare payload
      const payload = {
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        college: userData.college,
        department: userData.department,
        year: userData.year,
        events: selectedEvents
      };

      // Call parent submit handler or make API call
      const response = await (onSubmit ? onSubmit(payload) : 
        fetch('/api/registrations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).then(res => res.json())
      );

      if (response.status === 'ok' || response.success) {
        setRegistrationSuccess(response.registration);
        
        // Start polling for ID card if pending
        if (!response.registration.id_card_url) {
          setPollingIdCard(true);
          pollForIdCard(response.registration.registration_id);
        }
      } else {
        setErrors({ general: response.message || 'Registration failed' });
      }
    } catch (error) {
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Poll for ID card generation
  const pollForIdCard = async (registrationId) => {
    const maxAttempts = 12; // 1 minute total
    let attempts = 0;

    const checkIdCard = async () => {
      if (attempts >= maxAttempts) {
        setPollingIdCard(false);
        return;
      }

      try {
        const response = await fetch(`/api/registrations/${registrationId}`);
        const data = await response.json();

        if (data.registration?.id_card_url) {
          setRegistrationSuccess(prev => ({
            ...prev,
            id_card_url: data.registration.id_card_url
          }));
          setPollingIdCard(false);
        } else {
          attempts++;
          setTimeout(checkIdCard, 5000); // Check every 5 seconds
        }
      } catch (error) {
        console.error('Error polling for ID card:', error);
        attempts++;
        setTimeout(checkIdCard, 5000);
      }
    };

    checkIdCard();
  };

  // Event card component
  const EventCard = ({ event, isSelected, onClick, disabled, reason }) => {
    const Icon = getIconComponent(event.icon);
    const participantLabel = event.category === 'solo'
      ? 'Solo entry'
      : `${event.min}-${event.max} participants${event.exception ? ' (special pairing allowed)' : ''}`;
    const scheduleLabel = event.schedule
      ? `${event.schedule.dayLabel} • ${event.schedule.time} • ${event.schedule.venue}`
      : null;

    return (
      <motion.button
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        onClick={onClick}
        disabled={disabled}
        className={`
          relative p-4 rounded-xl border-2 transition-all
          ${isSelected 
            ? 'bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-purple-500' 
            : 'bg-gray-800/30 border-gray-700 hover:border-gray-600'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <div className="flex items-start gap-3">
          <div className={`
            p-2 rounded-lg
            ${isSelected ? 'bg-purple-500/20' : 'bg-gray-700/50'}
          `}>
            <Icon className={`w-5 h-5 ${isSelected ? 'text-purple-400' : 'text-gray-400'}`} />
          </div>

          <div className="flex-1 text-left">
            <h4 className={`font-medium ${isSelected ? 'text-white' : 'text-gray-200'}`}>
              {event.name}
            </h4>
            <p className="text-xs text-gray-400 mt-1">
              {participantLabel}
            </p>
            {event.summary && (
              <p className="text-xs text-gray-500 mt-1 leading-snug">
                {event.summary}
              </p>
            )}
            {scheduleLabel && (
              <p className="text-[11px] text-purple-300 mt-1">
                {scheduleLabel}
              </p>
            )}
          </div>

          {isSelected && (
            <div className="absolute top-2 right-2">
              <Check className="w-5 h-5 text-green-400" />
            </div>
          )}
        </div>

        {disabled && reason && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 rounded-xl">
            <p className="text-xs text-red-400 px-3 text-center">{reason}</p>
          </div>
        )}
      </motion.button>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Error Banner */}
      <AnimatePresence>
        {errors.general && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg"
          >
            <p className="text-red-400 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {errors.general}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selection Rules */}
      <div className="mb-8 p-4 bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl border border-purple-500/30">
        <h3 className="text-lg font-semibold text-white mb-3">Selection Rules</h3>
        <ul className="space-y-2 text-sm text-gray-300">
          <li className="flex items-start gap-2">
            <span className="text-purple-400 mt-1">•</span>
            Select maximum 2 events total
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-400 mt-1">•</span>
            You can select either: 1 solo/group event OR 1 exception event OR 1 of each
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-400 mt-1">•</span>
            Exception events (Group Dance, Cricket, Fashion Show) can be combined with any other single event
          </li>
        </ul>
      </div>

      {/* Exception Events */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-yellow-400" />
          Special Events (Can combine with 1 other event)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {exceptionEvents.map(event => {
            const isSelected = selectedEvents.some(e => e.name === event.name);
            const canSelect = canSelectEvent(event.name);
            return (
              <EventCard
                key={event.name}
                event={event}
                isSelected={isSelected}
                onClick={() => toggleEvent(event.name)}
                disabled={!canSelect.allowed && !isSelected}
                reason={canSelect.reason}
              />
            );
          })}
        </div>
      </div>

      {/* Other Group Events */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Users className="w-6 h-6 text-blue-400" />
          Group Events
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {nonExceptionGroups.map(event => {
            const isSelected = selectedEvents.some(e => e.name === event.name);
            const canSelect = canSelectEvent(event.name);
            return (
              <EventCard
                key={event.name}
                event={event}
                isSelected={isSelected}
                onClick={() => toggleEvent(event.name)}
                disabled={!canSelect.allowed && !isSelected}
                reason={canSelect.reason}
              />
            );
          })}
        </div>
      </div>

      {/* Solo Events */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <User className="w-6 h-6 text-green-400" />
          Solo Events
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {soloEvents.map(event => {
            const isSelected = selectedEvents.some(e => e.name === event.name);
            const canSelect = canSelectEvent(event.name);
            return (
              <EventCard
                key={event.name}
                event={event}
                isSelected={isSelected}
                onClick={() => toggleEvent(event.name)}
                disabled={!canSelect.allowed && !isSelected}
                reason={canSelect.reason}
              />
            );
          })}
        </div>
      </div>

      {/* Selected Events Summary */}
      {selectedEvents.length > 0 && (
        <div className="mb-8 p-6 bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-xl border border-purple-500/30">
          <h3 className="text-xl font-bold text-white mb-4">Selected Events</h3>
          <div className="space-y-3">
            {selectedEvents.map(event => {
              const config = EVENTS_CONFIG[event.name];
              const hasValidParticipants = config.category === 'solo' || 
                (event.participants?.length >= config.min && event.participants?.length <= config.max);

              return (
                <div key={event.name} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-white font-medium">{event.name}</span>
                    {config.category === 'group' && (
                      <span className={`text-sm px-2 py-1 rounded-full ${
                        hasValidParticipants 
                          ? 'bg-green-500/20 text-green-300' 
                          : 'bg-yellow-500/20 text-yellow-300'
                      }`}>
                        {event.participants?.length || 0}/{config.min}-{config.max} participants
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setParticipantModals({ ...participantModals, [event.name]: true })}
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
                  >
                    {config.category === 'solo' ? 'Edit Details' : 'Manage Team'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Submit Button */}
      {selectedEvents.length > 0 && (
        <div className="flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
            {submitting ? 'Processing...' : 'Submit Registration'}
          </button>
        </div>
      )}

      {/* Participant Modals */}
      {Object.entries(participantModals).map(([eventName, isOpen]) => {
        const config = EVENTS_CONFIG[eventName];
        const event = selectedEvents.find(e => e.name === eventName);

        if (!config || !event) {
          return null;
        }

        return (
          <ParticipantModal
            key={eventName}
            eventName={eventName}
            isOpen={isOpen}
            config={config}
            eventData={event}
            userData={userData}
            onClose={() => setParticipantModals(prev => ({ ...prev, [eventName]: false }))}
            onSave={(participants) => {
              updateEventParticipants(eventName, participants);
              setParticipantModals(prev => ({ ...prev, [eventName]: false }));
            }}
          />
        );
      })}

      {/* Success Modal */}
      {registrationSuccess && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-br from-green-900 via-gray-900 to-purple-900 rounded-2xl p-8 max-w-md w-full border border-green-500/30"
          >
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
                <Check className="w-10 h-10 text-green-400" />
              </div>

              <h2 className="text-3xl font-bold text-white mb-2">
                Registration Successful!
              </h2>

              <div className="my-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <p className="text-sm text-gray-400 mb-1">Registration ID</p>
                <p className="text-2xl font-mono font-bold text-purple-400">
                  {registrationSuccess.registration_id}
                </p>
              </div>

              <div className="space-y-3 mb-6">
                <p className="text-gray-300">
                  Events: {registrationSuccess.events?.join(', ')}
                </p>
                {registrationSuccess.total_participants > 1 && (
                  <p className="text-gray-300">
                    Team Size: {registrationSuccess.total_participants} participants
                  </p>
                )}
              </div>

              {registrationSuccess.id_card_url ? (
                <div className="space-y-3">
                  <a
                    href={registrationSuccess.id_card_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  >
                    <Download className="w-5 h-5" />
                    Download ID Card
                  </a>
                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: 'Navaspurthi 2025 Registration',
                          text: `Successfully registered for Navaspurthi 2025! Registration ID: ${registrationSuccess.registration_id}`,
                          url: window.location.href
                        });
                      }
                    }}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                    Share
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-yellow-300 text-sm flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {pollingIdCard ? 'Generating ID Card...' : 'ID Card will be available soon'}
                  </p>
                </div>
              )}

              <button
                onClick={() => {
                  setRegistrationSuccess(null);
                  setSelectedEvents([]);
                  window.location.reload(); // Refresh to reset form
                }}
                className="mt-6 text-gray-400 hover:text-white transition-colors"
              >
                Register Another
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default EventSelector;
