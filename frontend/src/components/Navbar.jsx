import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import trophyLogo from '../assets/Trophic.png';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/events', label: 'Events' },
    { path: '/schedule', label: 'Schedule' },
    { path: '/gallery', label: 'Gallery' },
    { path: '/about', label: 'About' },
    { path: '/contact', label: 'Contact' }
  ];

  return (
    <nav className="w-full z-20 bg-gradient-to-r from-maroon/95 to-burgundy/95 backdrop-blur-xl shadow-md shadow-gold/20 text-base-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 sm:space-x-4 group">
            <img
              src={trophyLogo}
              alt="Navaspurthi crest"
              className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 object-contain drop-shadow-[0_0_28px_rgba(212,175,55,0.65)]"
              loading="lazy"
            />
            <div className="min-w-0">
              <h1 className="font-orbitron font-black text-base sm:text-lg md:text-xl lg:text-2xl text-gold-light glow-text uppercase tracking-[0.15em] sm:tracking-[0.25em] md:tracking-[0.35em] truncate"> 
                NAVASPURTHI
              </h1>
              <p className="text-xs sm:text-sm font-poppins text-gold-light/90 glow-text tracking-[0.2em] sm:tracking-[0.3em] md:tracking-[0.4em]">2025</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-4 xl:space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative font-poppins font-medium px-1 transition-all duration-300 text-base-white/80 hover:text-gold after:content-[''] after:absolute after:-bottom-1 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-gold after:to-gold-light after:rounded-full after:origin-center after:scale-x-0 after:transition-transform after:duration-300 hover:after:scale-x-100 ${
                  location.pathname === link.path
                    ? 'text-gold after:scale-x-100'
                    : ''
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/register"
              className="px-6 py-2.5 bg-gradient-to-r from-gold to-gold-light text-maroon font-semibold rounded-full transition-all duration-300 hover:shadow-xl hover:shadow-gold/50 hover:-translate-y-0.5"
            >
              Register Now
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-burgundy-light transition-colors flex-shrink-0"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-gold" />
            ) : (
              <Menu className="w-6 h-6 text-gold" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`lg:hidden transition-all duration-300 overflow-hidden ${
        isMobileMenuOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="bg-maroon/95 backdrop-blur-xl border-t border-gold/20">
          <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block py-2.5 px-4 rounded-lg font-poppins font-medium transition-all duration-300 text-sm sm:text-base ${
                  location.pathname === link.path
                    ? 'bg-gradient-to-r from-gold/20 to-gold-light/20 text-gold'
                    : 'text-base-white hover:bg-burgundy-light'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/register"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block w-full text-center px-6 py-3 bg-gradient-to-r from-gold to-gold-light text-maroon font-semibold rounded-full hover:shadow-lg hover:shadow-gold/40 transition-all duration-300 text-sm sm:text-base"
            >
              Register Now
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
