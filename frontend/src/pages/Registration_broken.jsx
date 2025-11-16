import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, CheckCircle, Download, AlertCircle, Sparkles, Camera, User, Mail, Phone, Building, Calendar, Trophy, ArrowRight, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { festivalEvents } from '../data/events';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Registration = () => {
  const [step, setStep] = useState(0); // 0=Welcome, 1=Details, 2=Events, 3=Photo, 4=Processing, 5=Complete
  const [sessionData, setSessionData] = useState({
    id: null,
    session_token: null,
    registration_id: null
  });
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    college: '',
    ageGroup: 'Student',
    eventName: ''
  });
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [idCardUrl, setIdCardUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Initialize registration session
  const initializeRegistration = async () => {
    try {
      const response = await axios.post(`${API_BASE}/api/register/init`);
      if (response.data.success) {
        setSessionData({
          id: response.data.id,
          session_token: response.data.session_token,
          registration_id: response.data.registration_id
        });
        setStep(1);
      }
    } catch (error) {
      setErrorMessage('Failed to initialize registration. Please try again.');
    }
  };

  // Update registration data
  const updateRegistration = async (data) => {
    if (!sessionData.id) return;
    
    try {
      await axios.patch(`${API_BASE}/api/register/update/${sessionData.id}`, {
        session_token: sessionData.session_token,
        ...data
      });
    } catch (error) {
      console.error('Failed to update registration:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newData = { [name]: value };
    setFormData(prev => ({ ...prev, ...newData }));
    updateRegistration(newData);
  };

  const handleEventSelection = (eventId) => {
    const event = festivalEvents.find(e => e.id === eventId);
    if (event) {
      setFormData(prev => ({ ...prev, eventName: event.title }));
      updateRegistration({ event_name: event.title });
      setSelectedEvents([eventId]);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file && sessionData.id) {
      setProfileImage(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
      };
      reader.readAsDataURL(file);

      // Upload image immediately
      const formData = new FormData();
      formData.append('profileImage', file);
      formData.append('session_token', sessionData.session_token);

      try {
        await axios.post(`${API_BASE}/api/register/upload-url/${sessionData.id}`, formData);
      } catch (error) {
        setErrorMessage('Failed to upload image. Please try again.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsProcessing(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('fullName', formData.fullName);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('college', formData.college);
      formDataToSend.append('department', formData.department);
      formDataToSend.append('year', formData.year);
      formDataToSend.append('events', JSON.stringify(formData.events));

      if (formData.profileImage) {
        formDataToSend.append('profileImage', formData.profileImage);
      }

      const { data } = await axios.post(`${API_BASE}/api/registrations`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setRegistrationId(data?.registrationId || '');
      setAiGeneratedImage(data?.data?.ai_image_url || '');
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        college: '',
        department: '',
        year: '',
        events: [],
        profileImage: null
      });
      setPreviewImage('');
      setStep(3);

    } catch (error) {
      console.error('Registration failed:', error);
      const message = error.response?.data?.error || 'Registration failed. Please try again.';
      setErrorMessage(message);
    }
    finally {
      setIsProcessing(false);
    }
  };

  const confirmRegistration = async () => {
    if (!sessionData.id) return;
    
    setIsProcessing(true);
    setStep(4);

    try {
      const response = await axios.post(`${API_BASE}/api/register/confirm/${sessionData.id}`, {
        session_token: sessionData.session_token
      });

      if (response.data.success) {
        // Start polling for status
        pollRegistrationStatus();
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.error || 'Failed to confirm registration');
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

  const downloadIdCard = () => {
    if (idCardUrl) {
      const link = document.createElement('a');
      link.href = idCardUrl;
      link.download = `${sessionData.registration_id}_ID_Card.png`;
      link.click();
    }
  };

  // Render functions for each step
  const renderWelcome = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-12"
    >
      <div className="mb-8">
        <Sparkles className="w-20 h-20 text-[#F8C76F] mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-[#F8C76F] mb-4">Welcome to Navaspurthi 2025</h1>
        <p className="text-[#D4AF37] text-lg">Join the most exciting college festival of the year!</p>
      </div>
      
      <button
        onClick={initializeRegistration}
        className="px-8 py-4 bg-gradient-to-r from-[#F8C76F] to-[#D4AF37] text-[#2B0718] font-bold rounded-xl hover:shadow-[0_20px_50px_rgba(248,199,111,0.3)] transition-all duration-300 flex items-center mx-auto"
      >
        Start Registration
        <ArrowRight className="w-5 h-5 ml-2" />
      </button>
    </motion.div>
  );

  const renderBasicDetails = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-[#F8C76F] mb-2">Basic Details</h2>
        <p className="text-[#D4AF37]">Tell us about yourself</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-[#F8C76F] text-sm font-medium mb-2">
            <User className="w-4 h-4 inline mr-2" />
            Full Name *
          </label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-[#3a0c1f]/50 border border-[#D4AF37]/30 rounded-xl text-[#F8C76F] placeholder-[#D4AF37]/50 focus:border-[#F8C76F] focus:outline-none"
            placeholder="Enter your full name"
            required
          />
        </div>

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

        <div>
          <label className="block text-[#F8C76F] text-sm font-medium mb-2">
            <Calendar className="w-4 h-4 inline mr-2" />
            Age Group *
          </label>
          <select
            name="ageGroup"
            value={formData.ageGroup}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-[#3a0c1f]/50 border border-[#D4AF37]/30 rounded-xl text-[#F8C76F] focus:border-[#F8C76F] focus:outline-none"
            required
          >
            <option value="Student">Student (18-25)</option>
            <option value="Adult">Adult (25+)</option>
            <option value="Professional">Professional</option>
          </select>
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
          disabled={!formData.fullName || !formData.email || !formData.phone || !formData.college}
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
        <h2 className="text-2xl font-bold text-[#F8C76F] mb-2">Select Your Event</h2>
        <p className="text-[#D4AF37]">Choose the event you want to participate in</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
        {festivalEvents.map((event) => (
          <div
            key={event.id}
            onClick={() => handleEventSelection(event.id)}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
              selectedEvents.includes(event.id)
                ? 'border-[#F8C76F] bg-[#F8C76F]/10'
                : 'border-[#D4AF37]/30 hover:border-[#D4AF37] hover:bg-[#D4AF37]/5'
            }`}
          >
            <div className="flex items-center mb-2">
              <Trophy className="w-5 h-5 text-[#F8C76F] mr-2" />
              <h3 className="font-semibold text-[#F8C76F]">{event.title}</h3>
            </div>
            <p className="text-sm text-[#D4AF37] mb-2">{event.type}</p>
            <p className="text-xs text-[#D4AF37]/70">{event.format}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-between pt-6">
        <button
          onClick={() => setStep(1)}
          className="px-6 py-3 border border-[#D4AF37]/30 text-[#D4AF37] rounded-xl hover:bg-[#D4AF37]/10 transition-all duration-300 flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>
        
        <button
          onClick={() => setStep(3)}
          disabled={selectedEvents.length === 0}
          className="px-6 py-3 bg-gradient-to-r from-[#F8C76F] to-[#D4AF37] text-[#2B0718] font-bold rounded-xl hover:shadow-[0_20px_50px_rgba(248,199,111,0.3)] transition-all duration-300 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
          <ArrowRight className="w-4 h-4 ml-2" />
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
        <p className="text-[#D4AF37]">Upload a clear photo for your AI-generated ID card</p>
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
          Generate My ID Card
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
      <h3 className="text-2xl font-bold text-[#F8C76F] mb-4">Creating Your AI ID Card</h3>
      <p className="text-[#D4AF37] mb-8">Please wait while we generate your personalized ID card...</p>
      
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
      className="text-center py-8"
    >
      <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-6" />
      <h3 className="text-2xl font-bold text-[#F8C76F] mb-4">Registration Complete!</h3>
      <p className="text-[#D4AF37] mb-8">Your AI ID card has been generated successfully.</p>
      
      {idCardUrl && (
        <div className="mb-8">
          <div className="max-w-md mx-auto border-4 border-[#F8C76F] rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(248,199,111,0.3)]">
            <img src={idCardUrl} alt="Your ID Card" className="w-full" />
          </div>
        </div>
      )}
      
      <div className="space-y-4">
        <button
          onClick={downloadIdCard}
          className="w-full px-6 py-3 bg-gradient-to-r from-[#F8C76F] to-[#D4AF37] text-[#2B0718] font-bold rounded-xl hover:shadow-[0_20px_50px_rgba(248,199,111,0.3)] transition-all duration-300 flex items-center justify-center"
        >
          <Download className="w-5 h-5 mr-2" />
          Download ID Card
        </button>
        
        <p className="text-[#D4AF37] text-sm">
          Registration ID: <span className="font-mono text-[#F8C76F]">{sessionData.registration_id}</span>
        </p>
      </div>
    </motion.div>
  );
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-neon-blue focus:outline-none focus:ring-2 focus:ring-neon-blue/20 transition-all"
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-neon-blue focus:outline-none focus:ring-2 focus:ring-neon-blue/20 transition-all"
            placeholder="your@email.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-neon-blue focus:outline-none focus:ring-2 focus:ring-neon-blue/20 transition-all"
            placeholder="+91 98765 43210"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            College/University *
          </label>
          <input
            type="text"
            name="college"
            value={formData.college}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-neon-blue focus:outline-none focus:ring-2 focus:ring-neon-blue/20 transition-all"
            placeholder="Your college name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Department *
          </label>
          <input
            type="text"
            name="department"
            value={formData.department}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-neon-blue focus:outline-none focus:ring-2 focus:ring-neon-blue/20 transition-all"
            placeholder="Computer Science"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Year of Study *
          </label>
          <select
            name="year"
            value={formData.year}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-neon-blue focus:outline-none focus:ring-2 focus:ring-neon-blue/20 transition-all"
          >
            <option value="">Select Year</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
            <option value="pg">Post Graduate</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Profile Photo * (For AI-generated ID card)
        </label>
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="profile-upload"
          />
          <label
            htmlFor="profile-upload"
            className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-neon-blue transition-colors"
          >
            {previewImage ? (
              <img src={previewImage} alt="Preview" className="h-full w-auto rounded-lg" />
            ) : (
              <>
                <Upload className="w-12 h-12 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">Click to upload profile photo</p>
                <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 5MB</p>
              </>
            )}
          </label>
        </div>
      </div>

      <button
        onClick={() => setStep(2)}
        disabled={!formData.fullName || !formData.email || !formData.phone || !formData.college || !formData.department || !formData.year || !formData.profileImage}
        className="w-full py-3 bg-gradient-to-r from-neon-blue to-violet-glow text-white font-bold rounded-xl hover:shadow-lg hover:shadow-neon-blue/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next: Select Events
      </button>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-bold font-orbitron mb-6">Select Events</h2>
      
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {availableEvents.map(event => (
          <label
            key={event.id}
            className={`relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
              formData.events.includes(event.id)
                ? 'border-neon-blue bg-neon-blue/5'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <input
              type="checkbox"
              checked={formData.events.includes(event.id)}
              onChange={() => handleEventToggle(event.id)}
              className="sr-only"
            />
            <div className="flex-1">
              <p className="font-semibold">{event.name}</p>
              <p className="text-sm text-gray-500">{event.category}</p>
            </div>
            {formData.events.includes(event.id) && (
              <CheckCircle className="w-5 h-5 text-neon-blue" />
            )}
          </label>
        ))}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <p className="text-sm text-yellow-800 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          You've selected {formData.events.length} event(s). Make sure there are no schedule conflicts.
        </p>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => setStep(1)}
          className="flex-1 py-3 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition-all"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={formData.events.length === 0 || isProcessing}
          className="flex-1 py-3 bg-gradient-to-r from-neon-blue to-violet-glow text-white font-bold rounded-xl hover:shadow-lg hover:shadow-neon-blue/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? 'Processing...' : 'Complete Registration'}
        </button>
      </div>
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-6"
    >
      <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-12 h-12 text-white" />
      </div>

      <div>
        <h2 className="text-3xl font-bold font-orbitron mb-2">Registration Successful!</h2>
        <p className="text-gray-600">Your unique registration ID is:</p>
        <p className="text-2xl font-bold text-neon-blue mt-2">{registrationId}</p>
      </div>

      {aiGeneratedImage && (
        <div className="bg-gradient-to-r from-neon-blue/10 to-violet-glow/10 rounded-2xl p-6">
          <p className="text-sm text-gray-600 mb-4">Your AI-Generated Profile</p>
          <img
            src={aiGeneratedImage}
            alt="AI Generated Profile"
            className="w-48 h-48 rounded-xl mx-auto shadow-lg"
          />
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
        <button
          onClick={downloadIdCard}
          className="flex-1 py-3 bg-gradient-to-r from-neon-blue to-violet-glow text-white font-bold rounded-xl hover:shadow-lg hover:shadow-neon-blue/30 transition-all flex items-center justify-center gap-2"
        >
          <Download className="w-5 h-5" />
          Download ID Card
        </button>
        <button
          onClick={() => {
            setStep(1);
            setFormData({
              fullName: '',
              email: '',
              phone: '',
              college: '',
              department: '',
              year: '',
              events: [],
              profileImage: null
            });
            setPreviewImage('');
            setRegistrationId('');
            setAiGeneratedImage('');
          }}
          className="flex-1 py-3 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition-all"
        >
          Register Another
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-orbitron font-bold mb-4">
            <span className="bg-gradient-to-r from-neon-blue to-violet-glow bg-clip-text text-transparent">
              Event Registration
            </span>
          </h1>
          <p className="text-xl text-gray-600 font-poppins">
            Join the future of college festivals
          </p>
        </motion.div>

        {/* Progress Bar */}
        {step < 3 && (
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4">
              <div className={`flex items-center ${step >= 1 ? 'text-neon-blue' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full border-2 ${step >= 1 ? 'border-neon-blue bg-neon-blue text-white' : 'border-gray-300'} flex items-center justify-center font-bold`}>
                  1
                </div>
                <span className="ml-2 hidden sm:inline">Personal Info</span>
              </div>
              
              <div className={`w-20 h-0.5 ${step >= 2 ? 'bg-neon-blue' : 'bg-gray-300'}`}></div>
              
              <div className={`flex items-center ${step >= 2 ? 'text-neon-blue' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full border-2 ${step >= 2 ? 'border-neon-blue bg-neon-blue text-white' : 'border-gray-300'} flex items-center justify-center font-bold`}>
                  2
                </div>
                <span className="ml-2 hidden sm:inline">Select Events</span>
              </div>
              
              <div className={`w-20 h-0.5 ${step >= 3 ? 'bg-neon-blue' : 'bg-gray-300'}`}></div>
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
