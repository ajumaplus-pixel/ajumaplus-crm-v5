# AJUMAPLUS CRM v5.0 Frontend

## Overview
This is the React frontend for the AJUMAPLUS CRM v5.0 system, built with React, TypeScript, and Material-UI.

## Features
- React 18 with TypeScript
- Material-UI (MUI) for components
- React Router for navigation
- Axios for API communication
- JWT Authentication
- Role-based access control
- Responsive design

## Prerequisites
- Node.js >= 14.x
- npm or yarn

## Installation

1. Navigate to the frontend directory
```bash
cd ajumaplus-crm-v5/frontend
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
```bash
cp .env.example .env
```

4. Update `.env` with your configuration
```env
REACT_APP_API_URL=http://localhost:3001
```

## Running the Application

### Development mode
```bash
npm start
```

The application will open at http://localhost:3000

### Production build
```bash
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── common/       # Shared components (Navbar, ProtectedRoute)
│   └── pages/        # Page components (Login, Register, Dashboard)
├── contexts/         # React contexts (AuthContext)
├── services/         # API services (authService, jobService, pricingService)
├── types/            # TypeScript type definitions
├── config/           # Configuration files
├── utils/            # Utility functions
└── App.tsx           # Main application component
```

## Available Pages

- `/login` - User login
- `/register` - User registration
- `/dashboard` - Main dashboard (protected)

## Features

### Authentication
- User login with JWT tokens
- User registration with role selection
- Token refresh mechanism
- Protected routes

### Dashboard
- Role-based dashboard
- Job statistics
- Recent jobs list
- Quick actions

### Styling
- Material-UI components
- AjumaPlus brand colors
- Responsive design
- Dark mode support

## API Integration

The frontend connects to the backend API at:
- Development: `http://localhost:3001`
- Production: Configured via `REACT_APP_API_URL`

## Technology Stack

- **Framework**: React 18
- **Language**: TypeScript
- **UI Library**: Material-UI (MUI)
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **State Management**: React Context API
- **Styling**: Material-UI + Emotion

## Development

### Adding new pages
1. Create component in `src/components/pages/`
2. Add route in `src/App.tsx`
3. Update navigation if needed

### Adding new services
1. Create service in `src/services/`
2. Use in components via hooks

### Adding new types
1. Add type definition in `src/types/index.ts`
2. Use in components and services

## Deployment
The frontend can be deployed to:
- Netlify
- Vercel
- AWS S3 + CloudFront
- GitHub Pages

## License
MIT