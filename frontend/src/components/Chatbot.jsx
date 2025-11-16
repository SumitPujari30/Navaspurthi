import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, X, Bot, User, Sparkles } from 'lucide-react';
import axios from 'axios';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: 'Hi there! 👋 Welcome to Navaspurthi 2025! How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState([
    'How do I register?',
    'Event schedule',
    'Contact information',
    'Prize details'
  ]);
  const [isMobile, setIsMobile] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 640);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const sendMessage = async (message = inputMessage) => {
    if (!message.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: message,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Call chatbot API
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/chatbot`,
        {
          message: message,
          sessionId: localStorage.getItem('chatSessionId') || Date.now().toString()
        }
      );

      // Add bot response
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: response.data.response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chatbot error:', error);
      
      // Fallback response
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: 'Sorry, I\'m having trouble connecting right now. Please try again later or contact us at navaspurthi@pes.edu',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion);
    sendMessage(suggestion);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className={`fixed z-50 bg-gradient-to-r from-neon-blue to-violet-glow rounded-full flex items-center justify-center text-white shadow-2xl shadow-neon-blue/30 transition-all ${
              isMobile
                ? 'bottom-20 right-4 w-12 h-12'
                : 'bottom-6 right-6 w-14 h-14'
            }`}
          >
            <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-500 rounded-full animate-pulse"></div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className={`fixed z-50 rounded-3xl shadow-[0_30px_80px_rgba(0,0,0,0.45)] overflow-hidden border border-[#F8C76F]/20 bg-gradient-to-br from-[#2B0718]/98 via-[#19010D]/95 to-[#060005]/98 backdrop-blur-xl ${
              isMobile
                ? 'inset-x-4 bottom-24 h-[70vh] max-h-[620px]'
                : 'bottom-6 right-6 w-96 h-[600px]'
            }`}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="bg-gradient-to-r from-[#F8C76F] via-[#E2B85E] to-[#D4AF37] p-4 text-[#2B0718] shadow-[0_15px_40px_rgba(212,175,55,0.35)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#2B0718]/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-[#2B0718]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base text-[#2B0718]">Navaspurthi Assistant</h3>
                      <p className="text-[11px] sm:text-xs text-[#2B0718]/80">Always here to help</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 rounded-full bg-[#2B0718]/10 flex items-center justify-center hover:bg-[#2B0718]/15 transition-colors text-[#2B0718]"
                    aria-label="Close chat"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>

              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-[#1A0510]/70 via-[#12030A]/80 to-[#0A0105]/90 backdrop-blur">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.type === 'user' 
                        ? 'bg-gradient-to-r from-[#F8C76F] to-[#D4AF37] text-[#2B0718]'
                        : 'bg-[#F8C76F]/10 text-[#F8C76F]/70'
                    }`}>
                      {message.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div className={`max-w-[85%] sm:max-w-[70%] ${message.type === 'user' ? 'items-end text-right' : 'items-start text-left'}`}>
                      <div className={`inline-flex flex-col rounded-xl px-3 sm:px-4 py-2 ${
                        message.type === 'user'
                          ? 'bg-gradient-to-r from-[#F8C76F] to-[#D4AF37] text-[#2B0718] shadow-[0_10px_30px_rgba(212,175,55,0.25)]'
                          : 'bg-[#2B0718]/60 text-[#F8C76F] border border-[#F8C76F]/10 backdrop-blur'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.text}</p>
                      </div>
                      <p className="text-[10px] sm:text-xs text-[#F8C76F]/60 mt-1">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </motion.div>
                ))}
                
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-3"
                  >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#F8C76F]/15 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-[#F8C76F]/80" />
                    </div>
                    <div className="bg-[#2B0718]/60 border border-[#F8C76F]/10 rounded-xl px-4 py-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-[#F8C76F]/70 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-[#F8C76F]/70 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-[#F8C76F]/70 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div className="px-4 py-3 border-t border-[#F8C76F]/10 bg-[#2B0718]/40 backdrop-blur">
                  <div className="flex gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-[#F8C76F]/20 scrollbar-track-transparent">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="px-3 py-1.5 bg-[#F8C76F]/10 rounded-full text-xs text-[#F8C76F] hover:bg-[#F8C76F]/20 transition-colors whitespace-nowrap border border-[#F8C76F]/20"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Container */}
              <div className="px-4 py-3 bg-[#12030A]/90 border-t border-[#F8C76F]/15 backdrop-blur">
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 rounded-full bg-[#3a0c1f]/80 text-sm text-[#F8C76F] placeholder:text-[#D4AF37]/70 border border-[#F8C76F]/20 focus:outline-none focus:ring-2 focus:ring-[#F8C76F]/40 focus:border-[#F8C76F] shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
                  />
                  <button
                    onClick={() => sendMessage()}
                    disabled={!inputMessage.trim() || isTyping}
                    className="w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-r from-[#F8C76F] via-[#E2B85E] to-[#D4AF37] rounded-full flex items-center justify-center text-[#2B0718] font-semibold hover:shadow-[0_20px_45px_rgba(212,175,55,0.35)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Send message"
                  >
                    <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
