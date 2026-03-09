# 🏀 Court Zone - Basketball Matchmaking Platform

**Find Your Game, Build Your Legacy**

Court Zone is a comprehensive basketball matchmaking web application that connects players, facilitates team creation, and enables court-based game scheduling with a basketball-themed user interface.

## ✨ Features

### 🎮 Gaming-Inspired UI
- **Basketball Orange Theme**: Primary colors (#FF6B35, #E55A2B) with deep navy (#1A1D29, #0F1419) and court green accents (#228B22, #32CD32)
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Smooth Animations**: Framer Motion powered interactions with basketball-themed effects
- **Custom Components**: Gaming-style buttons, stat cards, and interactive elements

### 🏀 Core Functionality
- **Smart Matchmaking**: AI-powered algorithm for skill-based player and team matching
- **Court Discovery**: Interactive map with real-time court availability and ratings
- **Team Management**: Create, manage, and organize basketball teams with lineup tools
- **Game Scheduling**: Real-time scheduling with automatic notifications
- **Achievement System**: Track progress with badges, statistics, and leaderboards
- **User Profiles**: Comprehensive player profiles with skill ratings and statistics

### 📱 Mobile-First Design
- **Touch-Optimized**: Large touch targets and swipe gestures
- **Bottom Navigation**: Basketball-themed mobile navigation bar
- **Quick Actions**: Floating action button for rapid game finding
- **Responsive Layout**: Seamless experience across all devices

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling with custom basketball theme
- **Framer Motion** - Smooth animations and transitions
- **Lucide React** - Beautiful icons
- **Radix UI** - Accessible component primitives

## 🚀 Getting Started

### Before You Start (After Cloning)

Files listed in `.gitignore` are not downloaded from GitHub by design.

- `node_modules/` and build output folders are recreated locally.
- `.env*` files are not committed, so you must create your own `.env.local`.

Setup order for a new machine:
1. `npm install`
2. create `.env.local`
3. `npm run db:migrate`
4. `npm run dev`

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/EjLaquiorez/CourtZone.git
   cd CourtZone
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Local Environment Variables

Create `.env.local` with at least:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/courtzone"
JWT_SECRET="replace-with-a-strong-secret"
JWT_EXPIRES_IN="7d"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="/api"
NEXT_PUBLIC_USE_MOCK_DATA="false"
NEXT_PUBLIC_ENABLE_WEBSOCKET="false"
NEXT_PUBLIC_SOCKET_URL="http://localhost:3003"
NEXT_PUBLIC_WEBSOCKET_URL="http://localhost:3003"
NEXT_PUBLIC_MAPBOX_TOKEN=""
NEXT_PUBLIC_VAPID_PUBLIC_KEY=""
```

## 🎨 Design System

### Color Palette
```css
/* Basketball Orange Primary */
--primary-500: #FF6B35;
--primary-600: #E55A2B;

/* Deep Navy Dark */
--dark-300: #1A1D29;
--dark-900: #0F1419;

/* Court Green Accents */
--court-500: #228B22;
--court-600: #32CD32;
```

### Typography
- **Display Font**: Orbitron (headers and titles)
- **Primary Font**: Inter (body text)
- **Accent Font**: Rajdhani (statistics and numbers)

## 🌟 Key Features Implemented

### ✅ Phase 1: Foundation (Complete)
- [x] Next.js 14 project setup with TypeScript
- [x] Basketball-themed Tailwind CSS configuration
- [x] Custom color palette and typography
- [x] Project structure and component organization
- [x] Environment configuration

### ✅ Phase 2: Landing Page (Complete)
- [x] Basketball court-inspired hero section
- [x] Animated basketball graphics and effects
- [x] Feature showcase with interactive cards
- [x] Responsive design for all devices
- [x] Call-to-action sections

### ✅ Phase 3: Authentication (Complete)
- [x] Login page with basketball court background
- [x] Registration with skill assessment
- [x] Position selection (PG, SG, SF, PF, C)
- [x] Interactive skill level rating (1-10)
- [x] Form validation and error handling
- [x] Basketball-themed form components

### ✅ Phase 4: Dashboard (Complete)
- [x] Authenticated header with user info
- [x] Responsive sidebar navigation
- [x] Quick action cards (Quick Match, Find Courts, Create Team)
- [x] Statistics overview with animated counters
- [x] Recent games and upcoming matches
- [x] Mobile bottom navigation
- [x] Basketball-themed UI components

## 🎯 Next Steps

The foundation of Court Zone is now complete with a fully functional landing page, authentication system, and dashboard. The application features:

- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Basketball Theme**: Custom orange/navy color scheme with court green accents
- **Smooth Animations**: Framer Motion powered interactions
- **Type Safety**: Full TypeScript implementation
- **Modern Architecture**: Next.js 14 with App Router

## Current Development Focus

Court Zone is now organized around a single real-data MVP flow:

`register/login -> complete profile -> discover scheduled games -> create or join a game`

Current build priority:

1. Finish auth and profile completeness.
2. Ship `games` as the first complete Prisma-backed flow.
3. Expand the same pattern to `teams` and `courts`.
4. Add automated verification and deployment checks.

Mock mode should be treated as opt-in only and enabled with `NEXT_PUBLIC_USE_MOCK_DATA=true`.

Supporting implementation notes live in [`DEVELOPMENT_CHECKLIST.md`](DEVELOPMENT_CHECKLIST.md).

---

Made with ❤️ and 🏀 by the Court Zone team
