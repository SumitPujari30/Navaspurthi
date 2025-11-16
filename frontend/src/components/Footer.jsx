import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Instagram, Twitter, Facebook, Linkedin, Github, Heart, Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="relative mt-20 bg-gradient-to-b from-maroon to-burgundy border-t border-gold/30 text-base-white">
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {/* About Section */}
          <div className="space-y-4">
            <h3 className="font-orbitron font-bold text-xl bg-gradient-to-r from-gold to-gold-light bg-clip-text text-transparent">
              NAVASPURTHI 2025
            </h3>
            <p className="text-sm text-white/80 font-poppins">
              A futuristic tech-cultural fest celebrating innovation, creativity, and talent. Join us for an unforgettable experience!
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="https://www.youtube.com/@klesbcahubballi" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-burgundy-light rounded-lg hover:bg-gradient-to-r hover:from-gold hover:to-gold-light hover:text-maroon transition-all duration-300">
                <Youtube className="w-5 h-5" />
              </a>
              <a href="https://www.instagram.com/klesbcahubballi" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-burgundy-light rounded-lg hover:bg-gradient-to-r hover:from-gold hover:to-gold-light hover:text-maroon transition-all duration-300">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://www.linkedin.com/in/klesbcahubballi/" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-burgundy-light rounded-lg hover:bg-gradient-to-r hover:from-gold hover:to-gold-light hover:text-maroon transition-all duration-300">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-poppins font-semibold text-gold text-base">Quick Links</h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/events" className="text-sm text-white/80 hover:text-gold-light transition-colors">
                  Events
                </Link>
              </li>
              <li>
                <Link to="/schedule" className="text-sm text-white/80 hover:text-gold-light transition-colors">
                  Schedule
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="text-sm text-white/80 hover:text-gold-light transition-colors">
                  Gallery
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-sm text-white/80 hover:text-gold-light transition-colors">
                  Registration
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-white/80 hover:text-gold-light transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Developers */}
          <div className="space-y-4">
            <h4 className="font-poppins font-semibold text-gold text-base">Developers</h4>
            <ul className="space-y-2.5 text-sm text-white/80">
              <li className="font-semibold">Sumit Pujari</li>
              <li className="font-semibold">Vrishabh Nayak</li>
              <li className="font-semibold">Nagbhushan Hegde</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="font-poppins font-semibold text-gold text-base">Contact Us</h4>
            <ul className="space-y-3 text-sm text-white/80">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 mt-0.5 text-gold flex-shrink-0" />
                <span className="break-words">KLES BCA PC JABIN SCIENCE COLLEGE HUBLI</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gold flex-shrink-0" />
                <span>+91 93530 00805</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gold flex-shrink-0" />
                <span className="break-all">navaspurthi2025@klebcahubli.in</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-sm text-white/70 font-poppins mb-1">
                &copy; 2025 Navaspurthi. All rights reserved.
              </p>
              <p className="text-sm text-white/70 font-poppins flex items-center justify-center md:justify-start gap-1">
                Made with <Heart className="w-4 h-4 text-red-500 fill-current" /> by Tech Team
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating gradient orbs */}
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-gold-light/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
    </footer>
  );
};

export default Footer;
