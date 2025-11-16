import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';
import Chatbot from './components/Chatbot';

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'));
const Events = lazy(() => import('./pages/Events'));
const Schedule = lazy(() => import('./pages/Schedule'));
const Gallery = lazy(() => import('./pages/Gallery'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Registration = lazy(() => import('./pages/Registration'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

function App() {
  return (
    <Router>
      <div className="min-h-screen relative bg-gradient-to-br from-maroon via-burgundy to-maroon text-base-white">
        {/* Animated background particles */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-96 h-96 bg-gold/15 rounded-full blur-3xl -top-20 -left-20 animate-float"></div>
          <div className="absolute w-96 h-96 bg-burgundy-light/20 rounded-full blur-3xl top-1/2 -right-20 animate-float" style={{ animationDelay: '1s' }}></div>
          <div className="absolute w-96 h-96 bg-gold-light/10 rounded-full blur-3xl -bottom-24 left-1/3 animate-float" style={{ animationDelay: '2s' }}></div>
        </div>
        
        <Navbar />
        
        <main className="relative z-10">
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/events" element={<Events />} />
              <Route path="/schedule" element={<Schedule />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/register" element={<Registration />} />
              <Route path="/admin/*" element={<AdminDashboard />} />
            </Routes>
          </Suspense>
        </main>
        
        <Footer />
        <Chatbot />
      </div>
    </Router>
  );
}

export default App;
