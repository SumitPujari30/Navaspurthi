import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, CheckCircle, Download, AlertCircle, Sparkles, Camera, User, Mail, Phone, Building, Calendar, Trophy, ArrowRight, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import EventSelector from '../components/EventSelector';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Registration = () => {
  const [step, setStep] = useState(0); // 0=Welcome, 1=Details, 2=Events, 3=Photo, 4=Processing, 5=Complete
  const [sessionData, setSessionData] = useState({
    id: null,
    session_token: null,
    registration_id: null
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    college: ''
  });
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [existingRegistrations, setExistingRegistrations] = useState([]);
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [idCardUrl, setIdCardUrl] = useState('');
  const [participants, setParticipants] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  // Initialize registration - go directly to step 1
  const initializeRegistration = async () => {
    console.log('Using enhanced registration system');
    setStep(1);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Event selection is now handled by EventSelector component

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Registration is now handled by EventSelector component via handleEnhancedSubmit

  // Handle new enhanced registration submission
  const handleEnhancedSubmit = async (payload) => {
    setIsProcessing(true);
    setStep(4);

    try {
      const formDataToSend = new FormData();
      
      // Add form fields
      formDataToSend.append('name', payload.name);
      formDataToSend.append('email', payload.email);
      formDataToSend.append('phone', payload.phone);
      formDataToSend.append('college', payload.college);
      
      // Process events and extract participant images
      const eventsForSubmission = payload.events.map(event => ({
        name: event.name,
        category: event.category,
        participants: event.participants.map(participant => ({
          name: participant.name,
          email: participant.email,
          phone: participant.phone,
          photoKey: participant.photoField // Reference to the file in FormData
        }))
      }));
      
      // Add participant images to FormData
      payload.events.forEach(event => {
        event.participants.forEach(participant => {
          if (participant.profileImage && participant.photoField) {
            console.log('📤 Adding participant photo:', participant.photoField, participant.profileImage.name);
            formDataToSend.append(participant.photoField, participant.profileImage);
          } else {
            console.warn('⚠️ Missing photo for participant:', participant.name, {
              hasImage: !!participant.profileImage,
              hasField: !!participant.photoField
            });
          }
        });
      });
      
      // Add events as JSON (without the File objects)
      formDataToSend.append('events', JSON.stringify(eventsForSubmission));
      
      // Add profile image if available (legacy support)
      if (profileImage) {
        formDataToSend.append('profileImage', profileImage);
      }

      const response = await axios.post(`${API_BASE}/api/registrations`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.status === 'ok') {
        setSessionData(prev => ({
          ...prev,
          registration_id: response.data.registration.registration_id
        }));
        
        // Poll for ID card generation
        pollForIdCard(response.data.registration.registration_id);
        setRegistrationComplete(true);
        setStep(5);
      } else {
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('❌ Registration error:', error);
      console.error('Error details:', error.response?.data);
      
      const errorMsg = error.response?.data?.details 
        || error.response?.data?.message 
        || error.message 
        || 'Registration failed. Please try again.';
      
      setErrorMessage(errorMsg);
      setIsProcessing(false);
      setStep(2); // Go back to event selection
      
      // Show error notification
      alert(`Registration Error: ${errorMsg}`);
    }
  };

  // Poll for ID card generation for all participants
  const pollForIdCard = async (registrationId) => {
    const maxAttempts = 12; // 1 minute total
    let attempts = 0;

    const checkIdCard = async () => {
      if (attempts >= maxAttempts) {
        console.log('Max polling attempts reached');
        return;
      }

      try {
        const response = await axios.get(`${API_BASE}/api/registrations/${registrationId}`);
        
        if (response.data.success && response.data.registration) {
          const registration = response.data.registration;
          const participantsList = registration.participants || [];
          
          // Always update participants state so UI can show them
          if (participantsList.length > 0) {
            console.log('📋 Participants data:', participantsList);
            setParticipants(participantsList);
            
            // Set the first participant's ID card as the main one (for backward compatibility)
            const firstCard = participantsList.find(p => p.idCardUrl || p.id_card_url);
            if (firstCard) {
              console.log('🎴 Setting ID card URL:', firstCard.idCardUrl || firstCard.id_card_url);
              setIdCardUrl(firstCard.idCardUrl || firstCard.id_card_url);
            } else {
              console.log('⚠️ No ID cards found yet in participants');
            }
          }
          
          // Check if all participants have ID cards
          const allReady = participantsList.length > 0 && 
            participantsList.every(p => p.idCardUrl || p.id_card_url);
          
          if (allReady) {
            console.log('✅ All ID cards ready!', participantsList);
            return; // Stop polling
          } else {
            console.log(`⏳ Waiting for ID cards... (${attempts + 1}/${maxAttempts})`);
            attempts++;
            setTimeout(checkIdCard, 5000); // Check every 5 seconds
          }
        } else {
          attempts++;
          setTimeout(checkIdCard, 5000);
        }
      } catch (error) {
        console.error('Error polling for ID card:', error);
        attempts++;
        setTimeout(checkIdCard, 5000);
      }
    };

    checkIdCard();
  };

  const handleLegacySubmit = async () => {
    setIsProcessing(true);
    setStep(4);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('fullName', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('college', formData.college);
      formDataToSend.append('department', formData.department || 'General');
      formDataToSend.append('year', formData.year);
      
      // Convert selected events to the format expected by legacy system
      const eventNames = selectedEvents.map(eventId => {
        const event = festivalEvents.find(e => e.id === eventId);
        return event ? event.title : eventId;
      });
      formDataToSend.append('events', JSON.stringify(eventNames));
      
      if (profileImage) {
        formDataToSend.append('profileImage', profileImage);
      }

      const response = await axios.post(`${API_BASE}/api/registrations`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        setSessionData(prev => ({ 
          ...prev, 
          registration_id: response.data.registrationId || `REG-${Date.now()}`
        }));
        
        // Set ID card URL if available
        if (response.data.idCardUrl) {
          setIdCardUrl(response.data.idCardUrl);
        }
        
        // Simulate a short delay for better UX
        setTimeout(() => {
          setIsProcessing(false);
          setStep(5);
        }, 2000);
      }
    } catch (error) {
      console.error('Legacy registration error:', error);
      setErrorMessage(error.response?.data?.error || 'Registration failed. Please try again.');
      setIsProcessing(false);
      setStep(3);
    }
  };

  const pollRegistrationStatus = async () => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await axios.get(`${API_BASE}/api/register/status/${sessionData.id}?session_token=${sessionData.session_token}`);
        
        if (response.data.success) {
          const registration = response.data.registration;
          
          if (registration.status === 'completed') {
            setIdCardUrl(registration.id_card_url);
            setRegistrationComplete(true);
            setIsProcessing(false);
            setStep(5);
            clearInterval(pollInterval);
          } else if (registration.status === 'failed') {
            setErrorMessage(registration.error_message || 'Registration processing failed');
            setIsProcessing(false);
            setStep(3);
            clearInterval(pollInterval);
          }
        }
      } catch (error) {
        console.error('Status check failed:', error);
      }
    }, 5000);

    // Stop polling after 5 minutes
    setTimeout(() => clearInterval(pollInterval), 300000);
  };

  const downloadIdCard = async (participant = null) => {
    try {
      const url = participant ? (participant.idCardUrl || participant.id_card_url) : idCardUrl;
      const name = participant ? participant.name : formData.name;
      const participantId = participant ? (participant.participantId || participant.participant_id) : sessionData.registration_id;
      
      if (!url) {
        alert('ID card URL not available');
        return;
      }

      console.log('📥 Downloading ID card from:', url);
      
      // Fetch the image as blob to handle CORS
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch ID card');
      
      const blob = await response.blob();
      
      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${name ? name.replace(/\s+/g, '_') : participantId}_ID_Card.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      console.log('✅ ID card downloaded successfully');
    } catch (error) {
      console.error('❌ Error downloading ID card:', error);
      alert('Failed to download ID card. Please try right-click and "Save Image As"');
    }
  };

  const downloadAllIdCards = async () => {
    try {
      console.log('📥 Downloading all ID cards...');
      
      for (let i = 0; i < participants.length; i++) {
        await downloadIdCard(participants[i]);
        // Small delay between downloads
        if (i < participants.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      console.log('✅ All ID cards downloaded');
    } catch (error) {
      console.error('❌ Error downloading all ID cards:', error);
    }
  };

  // Render functions for each step
  const renderWelcome = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-12"
    >
      <div className="mb-6 sm:mb-8">
        <Sparkles className="w-16 h-16 sm:w-20 sm:h-20 text-[#F8C76F] mx-auto mb-4 sm:mb-6" />
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#F8C76F] mb-3 sm:mb-4 px-2">Welcome to Navaspurthi 2025</h1>
        <p className="text-[#D4AF37] text-base sm:text-lg px-2">Join the most exciting college festival of the year!</p>
      </div>
      
      <button
        onClick={initializeRegistration}
        className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-[#F8C76F] to-[#D4AF37] text-[#2B0718] font-bold rounded-xl hover:shadow-[0_20px_50px_rgba(248,199,111,0.3)] transition-all duration-300 flex items-center mx-auto text-sm sm:text-base"
      >
        Start Registration
        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
      </button>
    </motion.div>
  );

  const renderBasicDetails = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-[#F8C76F] mb-2">Basic Details</h2>
        <p className="text-[#D4AF37] text-sm sm:text-base">Tell us about yourself</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-[#F8C76F] text-sm font-medium mb-2">
            <User className="w-4 h-4 inline mr-2" />
            Full Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-[#3a0c1f]/50 border border-[#D4AF37]/30 rounded-xl text-[#F8C76F] placeholder-[#D4AF37]/50 focus:border-[#F8C76F] focus:outline-none"
            placeholder="Enter your full name"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[#F8C76F] text-sm font-medium mb-2">
              <Mail className="w-4 h-4 inline mr-2" />
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-[#3a0c1f]/50 border border-[#D4AF37]/30 rounded-xl text-[#F8C76F] placeholder-[#D4AF37]/50 focus:border-[#F8C76F] focus:outline-none"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-[#F8C76F] text-sm font-medium mb-2">
              <Phone className="w-4 h-4 inline mr-2" />
              Phone *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-[#3a0c1f]/50 border border-[#D4AF37]/30 rounded-xl text-[#F8C76F] placeholder-[#D4AF37]/50 focus:border-[#F8C76F] focus:outline-none"
              placeholder="Enter your phone number"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-[#F8C76F] text-sm font-medium mb-2">
            <Building className="w-4 h-4 inline mr-2" />
            College *
          </label>
          <input
            type="text"
            name="college"
            value={formData.college}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-[#3a0c1f]/50 border border-[#D4AF37]/30 rounded-xl text-[#F8C76F] placeholder-[#D4AF37]/50 focus:border-[#F8C76F] focus:outline-none"
            placeholder="Enter your college name"
            required
          />
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <button
          onClick={() => setStep(0)}
          className="px-6 py-3 border border-[#D4AF37]/30 text-[#D4AF37] rounded-xl hover:bg-[#D4AF37]/10 transition-all duration-300 flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>
        
        <button
          onClick={() => setStep(2)}
          disabled={!formData.name || !formData.email || !formData.phone || !formData.college}
          className="px-6 py-3 bg-gradient-to-r from-[#F8C76F] to-[#D4AF37] text-[#2B0718] font-bold rounded-xl hover:shadow-[0_20px_50px_rgba(248,199,111,0.3)] transition-all duration-300 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
          <ArrowRight className="w-4 h-4 ml-2" />
        </button>
      </div>
    </motion.div>
  );

  const renderEventSelection = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-[#F8C76F] mb-2">Select Your Events</h2>
        <p className="text-[#D4AF37]">Choose up to 2 events to participate in</p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-400 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {errorMessage}
          </p>
        </div>
      )}

      <EventSelector
        userData={formData}
        onSubmit={handleEnhancedSubmit}
        existingRegistrations={existingRegistrations}
      />

      <div className="flex justify-between pt-6">
        <button
          onClick={() => setStep(1)}
          className="px-6 py-3 border border-[#D4AF37]/30 text-[#D4AF37] rounded-xl hover:bg-[#D4AF37]/10 transition-all duration-300 flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>
      </div>
    </motion.div>
  );

  const renderPhotoUpload = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-[#F8C76F] mb-2">Upload Your Photo</h2>
        <p className="text-[#D4AF37]">Upload a clear photo for your ID card</p>
      </div>

      <div className="flex justify-center">
        <div className="relative">
          {previewImage ? (
            <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-[#F8C76F]">
              <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-48 h-48 rounded-full border-4 border-dashed border-[#D4AF37]/50 flex items-center justify-center bg-[#3a0c1f]/30">
              <Camera className="w-12 h-12 text-[#D4AF37]" />
            </div>
          )}
          
          <label className="absolute bottom-0 right-0 w-12 h-12 bg-gradient-to-r from-[#F8C76F] to-[#D4AF37] rounded-full flex items-center justify-center cursor-pointer hover:shadow-[0_10px_30px_rgba(248,199,111,0.4)] transition-all duration-300">
            <Upload className="w-6 h-6 text-[#2B0718]" />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <button
          onClick={() => setStep(2)}
          className="px-6 py-3 border border-[#D4AF37]/30 text-[#D4AF37] rounded-xl hover:bg-[#D4AF37]/10 transition-all duration-300 flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>
        
        <button
          onClick={confirmRegistration}
          disabled={!profileImage}
          className="px-6 py-3 bg-gradient-to-r from-[#F8C76F] to-[#D4AF37] text-[#2B0718] font-bold rounded-xl hover:shadow-[0_20px_50px_rgba(248,199,111,0.3)] transition-all duration-300 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Complete Registration
          <Sparkles className="w-4 h-4 ml-2" />
        </button>
      </div>
    </motion.div>
  );

  const renderProcessing = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-12"
    >
      <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-[#F8C76F] to-[#D4AF37] rounded-full mb-6">
        <Sparkles className="w-10 h-10 text-[#2B0718] animate-pulse" />
      </div>
      <h3 className="text-2xl font-bold text-[#F8C76F] mb-4">Processing Registration</h3>
      <p className="text-[#D4AF37] mb-8">Please wait while we process your registration...</p>
      
      <div className="w-64 h-2 bg-[#3a0c1f] rounded-full mx-auto overflow-hidden">
        <div className="h-full bg-gradient-to-r from-[#F8C76F] to-[#D4AF37] rounded-full animate-pulse"></div>
      </div>
      
      <p className="text-[#D4AF37]/70 text-sm mt-4">This may take a few moments...</p>
    </motion.div>
  );

  const renderComplete = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="py-8"
    >
      <div className="text-center mb-6 sm:mb-8">
        <CheckCircle className="w-16 h-16 sm:w-20 sm:h-20 text-green-400 mx-auto mb-4 sm:mb-6" />
        <h3 className="text-xl sm:text-2xl font-bold text-[#F8C76F] mb-3 sm:mb-4">Registration Complete!</h3>
        <p className="text-[#D4AF37] mb-2 text-sm sm:text-base px-2">Your registration has been submitted successfully.</p>
        <p className="text-[#D4AF37] text-xs sm:text-sm px-2">
          Registration ID: <span className="font-mono text-[#F8C76F]">{sessionData.registration_id}</span>
        </p>
      </div>
      
      {/* All Participants ID Cards */}
      {participants.length > 0 ? (
        <div className="space-y-6">
          <div className="text-center">
            <h4 className="text-lg sm:text-xl font-semibold text-[#F8C76F] mb-2">Participant ID Cards</h4>
            <p className="text-[#D4AF37] text-xs sm:text-sm mb-4 sm:mb-6 px-2">
              {participants.length} {participants.length === 1 ? 'participant' : 'participants'} • Use these as entry passes for the event
            </p>
          </div>

          {/* ID Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-h-[500px] sm:max-h-[600px] overflow-y-auto pr-1 sm:pr-2">
            {participants.map((participant, index) => {
              const idCardUrl = participant.idCardUrl || participant.id_card_url;
              const participantId = participant.participantId || participant.participant_id;
              const participantName = participant.name;

              return (
                <div key={index} className="bg-gradient-to-br from-[#3a0c1f]/50 to-[#1a0610]/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-[#D4AF37]/30">
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    {(participant.profileImageUrl || participant.photo_url) && (
                      <img 
                        src={participant.profileImageUrl || participant.photo_url} 
                        alt={participantName}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-[#F8C76F] flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h5 className="font-semibold text-sm sm:text-base text-[#F8C76F] truncate">{participantName}</h5>
                      <p className="text-[10px] sm:text-xs font-mono text-[#D4AF37]/70 truncate">{participantId}</p>
                    </div>
                  </div>

                  {idCardUrl ? (
                    <>
                      <div className="border-2 border-[#F8C76F] rounded-lg sm:rounded-xl overflow-hidden shadow-[0_12px_30px_rgba(248,199,111,0.2)] mb-2 sm:mb-3">
                        <img src={idCardUrl} alt={`${participantName} ID Card`} className="w-full" />
                      </div>
                      <button
                        onClick={() => downloadIdCard(participant)}
                        className="w-full px-3 sm:px-4 py-2 bg-gradient-to-r from-[#F8C76F] to-[#D4AF37] text-[#2B0718] font-semibold rounded-lg hover:shadow-[0_8px_20px_rgba(248,199,111,0.3)] transition-all duration-300 flex items-center justify-center text-xs sm:text-sm"
                      >
                        <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        Download ID Card
                      </button>
                    </>
                  ) : (
                    <div className="bg-[#3a0c1f]/50 rounded-lg sm:rounded-xl p-4 sm:p-6 text-center">
                      <div className="animate-spin w-6 h-6 sm:w-8 sm:h-8 border-2 border-[#F8C76F] border-t-transparent rounded-full mx-auto mb-2"></div>
                      <p className="text-[#D4AF37] text-[10px] sm:text-xs">Generating ID card...</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Download All Button */}
          {participants.every(p => p.idCardUrl || p.id_card_url) && participants.length > 1 && (
            <div className="text-center pt-3 sm:pt-4">
              <button
                onClick={downloadAllIdCards}
                className="px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-[#F8C76F] to-[#D4AF37] text-[#2B0718] font-bold rounded-xl hover:shadow-[0_20px_50px_rgba(248,199,111,0.4)] transition-all duration-300 inline-flex items-center text-sm sm:text-base"
              >
                <Download className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                Download All ID Cards
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Fallback for single ID card */
        idCardUrl && (
          <div className="space-y-4">
            <div className="max-w-md mx-auto border-4 border-[#F8C76F] rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(248,199,111,0.3)]">
              <img src={idCardUrl} alt="Your ID Card" className="w-full" />
            </div>
            <button
              onClick={() => downloadIdCard()}
              className="w-full px-6 py-3 bg-gradient-to-r from-[#F8C76F] to-[#D4AF37] text-[#2B0718] font-bold rounded-xl hover:shadow-[0_20px_50px_rgba(248,199,111,0.3)] transition-all duration-300 flex items-center justify-center"
            >
              <Download className="w-5 h-5 mr-2" />
              Download ID Card
            </button>
          </div>
        )
      )}

      {/* Important Note */}
      <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-[#3a0c1f]/50 rounded-lg sm:rounded-xl border border-[#D4AF37]/30">
        <p className="text-[#D4AF37] text-xs sm:text-sm text-center px-2">
          <strong className="text-[#F8C76F]">Important:</strong> Please download and save your ID card(s). You'll need to present them at the event entrance.
        </p>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-12 sm:pb-16 bg-gradient-to-br from-[#2B0718] via-[#18010E] to-[#060005]">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="rounded-2xl sm:rounded-3xl border border-[#D4AF37]/30 bg-gradient-to-br from-[#2B0718]/95 via-[#19010D]/98 to-[#060005]/99 p-4 sm:p-6 md:p-8 shadow-[0_32px_90px_rgba(0,0,0,0.4)]">
          
          {/* Progress Bar */}
          {step > 0 && step < 5 && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-medium text-[#F8C76F]">Step {step} of 4</span>
                <span className="text-sm text-[#D4AF37]">{Math.round((step / 4) * 100)}% Complete</span>
              </div>
              <div className="w-full bg-[#3a0c1f] rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-[#F8C76F] to-[#D4AF37] h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(step / 4) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-xl">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
                <p className="text-red-300 text-sm">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Step Content */}
          {step === 0 && renderWelcome()}
          {step === 1 && renderBasicDetails()}
          {step === 2 && renderEventSelection()}
          {step === 3 && renderPhotoUpload()}
          {step === 4 && renderProcessing()}
          {step === 5 && renderComplete()}
        </div>
      </div>
    </div>
  );
};

export default Registration;
