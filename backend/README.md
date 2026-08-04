# AJUMAPLUS CRM v5.0 Backend API

## Overview
This is the backend API for the AJUMAPLUS CRM v5.0 system, built with Node.js, Express, and PostgreSQL.

## Features
- JWT Authentication
- Role-based access control (Admin, Staff, Customer, ISP)
- AI-powered pricing estimation
- RESTful API design
- PostgreSQL database
- OpenAI integration for job analysis

## Prerequisites
- Node.js >= 14.x
- PostgreSQL >= 12.x
- npm or yarn

## Installation

1. Clone the repository
```bash
cd ajumaplus-crm-v5/backend
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
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ajumaplus
DB_USER=ajumaplus
DB_PASSWORD=your_secure_password
JWT_SECRET=your_jwt_secret_key_change_in_production
OPENAI_API_KEY=your_openai_api_key
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

5. Setup PostgreSQL database
```bash
# Create database
createdb ajumaplus

# Run migrations
npm run migrate
```

## Running the Application

### Development mode
```bash
npm run dev
```

### Production mode
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Users
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (Admin only)
- `PUT /api/users/:id/status` - Update user status (Admin only)
- `PUT /api/users/:id/role` - Update user role (Admin only)

### Jobs
- `POST /api/jobs` - Create job request
- `GET /api/jobs` - Get all jobs (Staff only)
- `GET /api/jobs/:id` - Get job by ID
- `PUT /api/jobs/:id` - Update job
- `PUT /api/jobs/:id/status` - Update job status
- `PUT /api/jobs/:id/assign` - Assign ISP to job (Staff only)
- `POST /api/jobs/:id/notes` - Add note to job
- `DELETE /api/jobs/:id` - Delete job (Staff only)

### Pricing/Quotations
- `POST /api/pricing/estimate` - AI-powered price estimate
- `POST /api/pricing/quotations` - Create quotation (Staff only)
- `GET /api/pricing/quotations` - Get all quotations (Staff only)
- `GET /api/pricing/quotations/:id` - Get quotation by ID
- `PUT /api/pricing/quotations/:id/approve` - Approve quotation (Staff only)
- `PUT /api/pricing/quotations/:id/reject` - Reject quotation (Staff only)

## Database Schema

### Tables
- `users` - User accounts
- `customers` - Customer profiles
- `isps` - ISP (Service Provider) profiles
- `jobs` - Job requests
- `quotations` - Price quotations
- `payments` - Payment records
- `ratings` - Customer ratings
- `audit_logs` - Audit trail

## Security Features
- JWT authentication
- Role-based access control
- Rate limiting
- Helmet.js security headers
- CORS configuration
- Password hashing with bcrypt

## Testing
```bash
npm test
```

## Deployment
The API can be deployed to:
- Render
- AWS EC2
- Heroku
- DigitalOcean

## License
MIT