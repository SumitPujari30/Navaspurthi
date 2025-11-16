# 🚀 Navaspurthi 2025 - Futuristic College Event Website

A complete, production-ready event management system for **Navaspurthi 2025**, featuring a stunning white-neon tech theme, AI-powered profile generation, and comprehensive event management.

![Navaspurthi 2025](https://img.shields.io/badge/Navaspurthi-2025-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61dafb?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18-339933?style=for-the-badge&logo=node.js)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase)

## ✨ Features

### 🎨 Frontend Features
- **Futuristic Design**: White-neon tech theme with holographic effects
- **Event Slider**: Stunning 3D carousel animation for event showcase
- **Registration System**: Multi-step form with AI profile generation
- **Interactive Schedule**: Day-wise event schedule with filters
- **Gallery**: Image/video gallery with lightbox
- **AI Chatbot**: Intelligent assistant for user queries
- **Admin Dashboard**: Complete event management interface
- **Responsive Design**: Optimized for all devices

### 🔧 Backend Features
- **RESTful API**: Complete API for all operations
- **Supabase Integration**: PostgreSQL database with real-time features
- **AI Integration**: Gemini API for profile generation
- **File Upload**: Multer-based image handling
- **Authentication**: JWT-based admin authentication
- **Rate Limiting**: API protection against abuse
- **Chatbot Engine**: Keyword + AI-powered responses

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: TailwindCSS + Custom CSS
- **Animations**: Framer Motion + GSAP
- **Routing**: React Router v6
- **Icons**: Lucide React
- **State Management**: React Hooks
- **API Client**: Axios

### Backend
- **Runtime**: Node.js + Express
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **AI**: Google Gemini API
- **Authentication**: JWT + bcrypt
- **File Handling**: Multer
- **Security**: Helmet + CORS + Rate Limiting

## 📁 Project Structure

```
navaspurthi-2025/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── EventSlider.jsx    # 3D event carousel
│   │   │   ├── Navbar.jsx         # Navigation bar
│   │   │   ├── Footer.jsx         # Footer component
│   │   │   ├── Chatbot.jsx        # AI chatbot
│   │   │   └── LoadingSpinner.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Events.jsx
│   │   │   ├── Schedule.jsx
│   │   │   ├── Gallery.jsx
│   │   │   ├── About.jsx
│   │   │   ├── Contact.jsx
│   │   │   ├── Registration.jsx
│   │   │   └── AdminDashboard.jsx
│   │   ├── App.jsx
│   │   └── index.css
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── routes/
│   │   ├── auth.js          # Authentication routes
│   │   ├── registrations.js # Registration management
│   │   ├── events.js        # Event management
│   │   ├── schedules.js     # Schedule management
│   │   ├── chatbot.js       # Chatbot endpoints
│   │   └── ai.js           # AI generation routes
│   ├── config/
│   │   └── supabase.js     # Database configuration
│   ├── database/
│   │   └── schema.sql      # Database schema
│   ├── server.js           # Express server
│   └── package.json
│
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Google Gemini API key

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/navaspurthi-2025.git
cd navaspurthi-2025
```

2. **Setup Backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```

3. **Setup Frontend**
```bash
cd frontend
npm install
npm run dev
```

4. **Setup Database**
- Create a Supabase project
- Run the schema.sql file in Supabase SQL editor
- Configure storage buckets: `profiles`, `ai-images`, `gallery`

## 🔐 Environment Variables

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key

# Gemini AI
GEMINI_API_KEY=your_gemini_key

# JWT
JWT_SECRET=your_secret_key
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## 📝 API Documentation

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/register` - Register new admin
- `POST /api/auth/verify` - Verify token

### Registrations
- `POST /api/registrations` - Create registration
- `GET /api/registrations` - List all (admin)
- `GET /api/registrations/:id` - Get single registration
- `PUT /api/registrations/:id` - Update status
- `DELETE /api/registrations/:id` - Delete registration

### Events
- `GET /api/events` - List all events
- `GET /api/events/:id` - Get single event
- `POST /api/events` - Create event (admin)
- `PUT /api/events/:id` - Update event (admin)
- `DELETE /api/events/:id` - Delete event (admin)

### AI Generation
- `POST /api/ai/generate-profile` - Generate AI profile
- `GET /api/ai/status/:id` - Check generation status

### Chatbot
- `POST /api/chatbot` - Send message
- `GET /api/chatbot/suggestions` - Get suggestions

## 🎨 Design System

### Color Palette
```css
--base-white: #F9FAFB
--neon-blue: #2DD4FF
--violet-glow: #9E6BFF
--electric-pink: #FF8CF7
--dark-accent: #0B0B0F
```

### Typography
- **Headings**: Orbitron
- **Body**: Poppins, Inter
- **Code**: Fira Code

## 🚢 Deployment

### Frontend (Vercel)
```bash
npm run build
# Deploy dist folder to Vercel
```

### Backend (Railway/Render)
```bash
# Push to GitHub
# Connect repository to Railway/Render
# Set environment variables
# Deploy
```

### Database (Supabase)
- Already hosted on Supabase cloud
- Configure RLS policies for production

## 📱 Features Breakdown

### Registration Flow
1. Personal information input
2. Event selection
3. Profile photo upload
4. AI profile generation
5. Unique ID generation (NAVAS-YYYYMMDD-XXXX)
6. ID card download

### Admin Dashboard
- Real-time statistics
- Registration management
- Event scheduling
- Revenue tracking
- CSV export functionality

### AI Chatbot
- Keyword-based quick responses
- Gemini AI fallback
- Session management
- Feedback collection

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

- **Frontend Development**: React Expert Team
- **Backend Development**: Node.js Specialists
- **UI/UX Design**: Creative Design Team
- **AI Integration**: ML Engineers

## 📞 Support

For support, email navaspurthi@pes.edu or raise an issue in the repository.

## 🎉 Acknowledgments

- PES University for hosting the event
- All contributors and participants
- Open source community for amazing tools

---

**Made with ❤️ for Navaspurthi 2025**
