# 🥗 NutriPlan Plus - Fast Metabolism Diet Tracker

A comprehensive web application for tracking the Fast Metabolism Diet (FMD) with bilingual support (English & Romanian), meal planning, progress tracking, and social features.

## ✨ Features

- 📅 **28-Day Diet Cycle** with automatic phase rotation (Phase 1, 2, 3)
- 🍽️ **Meal Planning** with 58+ FMD-compliant recipes
- 📊 **Progress Tracking** with weight, measurements, and daily check-ins
- 🤖 **AI Food Assistant** for phase-specific food recommendations
- 👥 **Social Features** with friends, messages, and progress sharing
- 🌍 **Bilingual** - Full English and Romanian support
- 🎨 **Dark Mode** with beautiful, modern UI
- 📱 **Responsive** design for mobile and desktop

## 🛠️ Tech Stack

### Frontend
- **React 18** with Vite
- **Tanstack Query** for data fetching
- **Tailwind CSS** + shadcn/ui components
- **Recharts** for data visualization
- **date-fns** for date handling

### Backend
- **Node.js** + Express
- **PostgreSQL** database
- **JWT** authentication
- **bcryptjs** for password hashing

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd nutri-plan-plus-48ccfd0d
```

2. Install dependencies:
```bash
npm install
```

3. Setup PostgreSQL:
```bash
# Create database
createdb nutriplan

# Or connect to existing PostgreSQL and run:
CREATE DATABASE nutriplan;
```

4. Configure environment variables:
```bash
# Backend will use these defaults if not set:
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=nutriplan
# DB_USER=your-username
# DB_PASSWORD=your-password
```

5. Start backend server:
```bash
cd server
node server-pg.js
```

6. Start frontend (in new terminal):
```bash
npm run dev
```

7. Open http://localhost:3000

### Default Credentials
After first run, you can register a new account or use:
- **Email:** jeka7ro@gmail.com
- **Password:** admin123777

## 📦 Project Structure

```
nutri-plan-plus/
├── src/
│   ├── api/              # API client & adapters
│   ├── components/       # React components
│   │   └── ui/          # shadcn/ui components
│   ├── pages/           # Page components
│   ├── hooks/           # Custom React hooks
│   └── lib/             # Utilities
├── server/
│   ├── server-pg.js     # Main Express server
│   ├── database-pg.js   # PostgreSQL schema
│   ├── auth-pg.js       # Authentication logic
│   └── config.js        # Configuration
├── Dockerfile           # Docker configuration
├── render.yaml          # Render deployment config
└── vercel.json          # Vercel deployment config
```

## 🌐 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions on deploying to:
- **Backend:** Render (with PostgreSQL)
- **Frontend:** Vercel

### Quick Deploy

1. **Backend on Render:**
   - Create PostgreSQL database
   - Create Web Service from Docker
   - Set environment variables

2. **Frontend on Vercel:**
   - Import GitHub repository
   - Set `VITE_API_URL` env var
   - Deploy

## 📖 Usage Guide

### Daily Flow
1. **Login** to your account
2. **View Dashboard** for overview and quick stats
3. **Daily Plan** to:
   - Select meals from phase-appropriate recipes
   - Mark meals as completed
   - Log exercise and water intake
   - Add daily notes
4. **Track Progress** with weight entries and visualizations
5. **Browse Recipes** filtered by current phase
6. **Ask AI Assistant** about food choices

### Fast Metabolism Diet Phases

- **Phase 1** (Days 1-2): High carb, low fat - Grains, fruits, lean proteins
- **Phase 2** (Days 3-4): High protein, high veg, low carb/fat - Lean proteins, vegetables
- **Phase 3** (Days 5-7): Healthy fats, moderate carbs - Healthy fats, proteins, low-glycemic carbs

Cycle repeats every 7 days for 28 days total.

## 🔒 Security

- Passwords hashed with bcryptjs
- JWT authentication with secure tokens
- SQL injection protection with parameterized queries
- CORS configuration for production

## 📊 Database Schema

- **users** - User accounts and profiles
- **recipes** - Bilingual recipe database
- **daily_checkins** - Daily meal and exercise logs
- **weight_entries** - Weight tracking history
- **progress_notes** - Daily notes and mood tracking
- **friendships** - Social connections
- **messages** - User messaging
- **subscription_codes** - Premium access codes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

Proprietary - All rights reserved

## 🆘 Support

For issues or questions:
- Open a GitHub issue
- Contact: jeka7ro@gmail.com

## 🙏 Acknowledgments

- Based on Haylie Pomroy's Fast Metabolism Diet
- UI components from shadcn/ui
- Icons from Lucide React

---

**Made with ❤️ for healthy living**
