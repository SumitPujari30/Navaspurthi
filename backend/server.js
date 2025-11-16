const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const path = require('path');
const { supabaseAdmin } = require('./config/supabase');
const { initializeDatabase } = require('./scripts/initDatabase');

// Load environment variables
dotenv.config();

// Import existing routes
const authRoutes = require('./routes/auth');
const registrationRoutes = require('./routes/registrations');
const eventsRoutes = require('./routes/events');
const schedulesRoutes = require('./routes/schedules');
const chatbotRoutes = require('./routes/chatbot');
const aiRoutes = require('./routes/ai');

// Import new registration system routes
let newRegistrationRoutes = null;
let adminRoutes = null;
let worker = null;
let startCleanupScheduler = null;

// Try to load new registration system (optional) - TEMPORARILY DISABLED
// try {
//   newRegistrationRoutes = require('./routes/newRegistration');
//   console.log('✅ New registration system loaded');
// } catch (error) {
//   console.log('⚠️  New registration system not available (optional)');
// }

// Initialize express app
const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173' || 'https://zl21bvhq-5173.inc1.devtunnels.ms/',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// File upload configuration
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// API Routes - Existing System
app.use('/api/auth', authRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/schedules', schedulesRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/ai', aiRoutes);

// API Routes - New Registration System (if available)
if (newRegistrationRoutes) {
  app.use('/api/register', newRegistrationRoutes);
  console.log('✅ New registration routes mounted at /api/register');
}

if (adminRoutes) {
  app.use('/api/admin', adminRoutes);
  console.log('✅ Admin routes mounted at /api/admin');
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Navaspurthi 2025 API is running',
    timestamp: new Date().toISOString(),
    services: {
      database: 'connected',
      worker: worker ? 'running' : 'not available',
      cleanup: startCleanupScheduler ? 'scheduled' : 'not available',
      newRegistrationSystem: newRegistrationRoutes ? 'enabled' : 'disabled'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size too large. Maximum 5MB allowed.' });
    }
    return res.status(400).json({ error: err.message });
  }
  
  res.status(err.status || 500).json({
    error: err.message || 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server with database initialization
const PORT = process.env.PORT || 5000;

async function startServer() {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 Starting Navaspurthi 2025 Backend Server');
  console.log('='.repeat(60) + '\n');

  // Initialize database
  const dbInitialized = await initializeDatabase();

  if (!dbInitialized) {
    console.error('\n❌ Failed to initialize database. Server will start but may not function correctly.');
    console.error('⚠️  Please check your Supabase credentials and try again.\n');
  }

  // Start cleanup scheduler if available
  if (startCleanupScheduler) {
    try {
      startCleanupScheduler();
      console.log('✅ Cleanup scheduler started');
    } catch (error) {
      console.log('⚠️  Cleanup scheduler failed to start:', error.message);
    }
  }

  // Start Express server
  app.listen(PORT, async () => {
    console.log('='.repeat(60));
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`🌟 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 API Base URL: http://localhost:${PORT}`);
    console.log('='.repeat(60));

    // Display available endpoints
    console.log('\n📋 Available API Endpoints:');
    console.log('   🔐 Authentication: /api/auth');
    console.log('   📝 Registrations (Legacy): /api/registrations');
    console.log('   🎪 Events: /api/events');
    console.log('   📅 Schedules: /api/schedules');
    console.log('   🤖 Chatbot: /api/chatbot');
    console.log('   🎨 AI: /api/ai');
    
    if (newRegistrationRoutes) {
      console.log('\n🆕 New Registration System:');
      console.log('   📋 Registration Wizard: /api/register');
      console.log('   ⚡ Quick Register: /api/quick-register');
    }
    
    if (adminRoutes) {
      console.log('\n🔧 Admin Panel:');
      console.log('   📊 Admin Dashboard: /api/admin');
    }

    // Final verification
    try {
      const { data, error } = await supabaseAdmin
        .from('registrations')
        .select('id')
        .limit(1);

      if (error) {
        console.error('\n⚠️  Database verification failed:', error.message);
        console.error('⚠️  Registration endpoints may not work correctly.\n');
      } else {
        console.log('\n✅ Database connection verified!');
        console.log('✅ All systems operational!\n');
      }
    } catch (err) {
      console.error('\n❌ Database connectivity check failed:', err.message + '\n');
    }
  });
}

// Start the server
startServer().catch((error) => {
  console.error('\n❌ Failed to start server:', error.message);
  process.exit(1);
});

// Graceful shutdown handlers
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  
  if (worker) {
    try {
      await worker.close();
      console.log('✅ Worker closed');
    } catch (error) {
      console.error('❌ Error closing worker:', error);
    }
  }
  
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  
  if (worker) {
    try {
      await worker.close();
      console.log('✅ Worker closed');
    } catch (error) {
      console.error('❌ Error closing worker:', error);
    }
  }
  
  process.exit(0);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err);
  process.exit(1);
});

module.exports = app;
