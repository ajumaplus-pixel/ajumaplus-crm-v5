# AjumaPlus CRM - AI-Powered Service Provider Management System

## 🎯 Overview

AjumaPlus CRM is a comprehensive, AI-powered customer relationship management system designed for service providers in Ghana. It features ISP registration, customer management, intelligent job matching, AI-powered pricing, predictive analytics, and complete quotation workflows with Ghana-specific localization.

## 🚀 Quick Start

### Local Development

```bash
# Clone the repository
git clone https://github.com/your-repo/ajumaplus-crm-v5.git
cd ajumaplus-crm-v5

# Install backend dependencies
cd backend
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your configuration

# Start backend server
npm start

# In a new terminal, start frontend
cd ../frontend
npm install
npm start
```

### Cloud Deployment

For production deployment, follow the comprehensive guide in [DEPLOYMENT_INSTRUCTIONS.md](./DEPLOYMENT_INSTRUCTIONS.md):

1. **Backend**: Deploy to Render (PostgreSQL + Node.js)
2. **Frontend**: Deploy to Vercel (React)
3. **Database**: PostgreSQL on Render
4. **Optional**: Redis for caching

**Quick Deploy Links:**
- [Render Dashboard](https://render.com) - Backend & Database
- [Vercel Dashboard](https://vercel.com) - Frontend

### Self-Hosting (Zero Cost)

For completely free self-hosting on your own server, follow [SELF_HOSTING_GUIDE.md](./SELF_HOSTING_GUIDE.md):

1. **Option 1**: Direct installation on Linux server
2. **Option 2**: Docker deployment (recommended)
3. **Option 3**: Home server (Windows/Mac)

**Total Cost: $0/month** (excluding optional AI features)

**Quick Start with Docker:**
```bash
# Clone and deploy with Docker
git clone https://github.com/your-repo/ajumaplus-crm-v5.git
cd ajumaplus-crm-v5
docker-compose up -d
```

## 🚀 Key Features

### AI-Powered Capabilities
- **Smart ISP Matching**: AI-driven ISP selection based on skills, location, ratings, and availability
- **Intelligent Pricing**: Multi-factor AI pricing analysis with market rates and seasonal adjustments
- **Predictive Analytics**: Demand forecasting, revenue projection, churn prediction, and customer lifetime value estimation
- **Customer Insights**: Behavior analysis, satisfaction prediction, and upsell opportunity detection
- **Automated Scheduling**: Smart job assignment with conflict resolution and optimization

### Business Logic
- **Complete Quotation Workflow**: AI-generated quotations, comparison, revision history, and approval process
- **Multi-Criteria Rating System**: Quality, timeliness, professionalism, and communication ratings (1-5 scale)
- **Review Moderation**: Report inappropriate ratings, ISP responses, and 24-hour edit window
- **Automated ISP Ranking**: Performance-based ranking system

### Ghana-Specific Features
- **16 Regional Pricing Adjustments**: Automatic pricing based on Ghana regions
- **Ghana Phone Validation**: Phone number formatting and validation for Ghana networks
- **Mobile Money Integration**: Network detection for MTN, Vodafone, AirtelTigo, and Glo
- **GhanaPost GPS Validation**: Location verification using GhanaPost GPS codes
- **Ghana Card ID Verification**: Identity verification with Ghana Card ID format
- **Public Holidays Calendar**: Ghana public holidays for scheduling
- **Regional Service Availability**: Service availability checking by region

### Architecture
- **Advanced Error Handling**: Winston-based structured logging with request tracking
- **Redis Caching Layer**: Optional caching with graceful degradation
- **Security**: Rate limiting, encryption, validation, and security headers
- **Mobile-First Design**: Touch-friendly interface with responsive breakpoints
- **Ghana Localization**: Multi-language support structure (English, Twi, Ga)

## 🚀 Quick Start (Development)

### Prerequisites
- Node.js (v16+)
- MySQL (XAMPP) or PostgreSQL
- Gmail account for email service

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd ajumaplus-crm-v5
```

2. **Install dependencies**
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

3. **Configure environment variables**
```bash
# Backend
cd backend
cp .env.example .env
# Edit .env with your configuration

# Frontend
cd ../frontend
# Uses default localhost:3001 for development
```

4. **Start development servers**
```bash
# Backend (Terminal 1)
cd backend
npm start

# Frontend (Terminal 2)
cd frontend
npm start
```

5. **Access the application**
- Frontend: http://localhost:3003
- Backend API: http://localhost:3001

## 🌐 Cloud Deployment

For production deployment, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

### Quick Deployment Links
- **Frontend:** Deploy to [Vercel](https://vercel.com)
- **Backend:** Deploy to [Render](https://render.com)
- **Database:** PostgreSQL on Render

## 📱 Access Points

### Development
- ISP Registration: http://localhost:3003/isp/register
- Customer Registration: http://localhost:3003/customer/register
- Admin Login: http://localhost:3003/admin/login
- Staff Login: http://localhost:3003/staff/login

### Production (After Deployment)
- ISP Registration: https://your-domain.vercel.app/isp/register
- Customer Registration: https://your-domain.vercel.app/customer/register
- Admin Login: https://your-domain.vercel.app/admin/login
- Staff Login: https://your-domain.vercel.app/staff/login

## 🔐 Default Credentials

### Staff Account (for testing)
- Email: staff@example.com
- Password: staff123

## 📧 Email Configuration

The system uses Gmail SMTP for email notifications. Configure in backend `.env`:

```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## 📋 Google Forms Integration (Optional)

For users who prefer Google Forms over the web app, integrate with:
- Google Forms → Google Sheets → Google Apps Script → Webhook → Backend

See [GOOGLE_FORMS_SETUP.md](./GOOGLE_FORMS_SETUP.md) for details.

## 🗄️ Database Schema

### Users Table
- id, username, email, password, role, is_active, created_at, updated_at

### Customers Table
- id, user_id, phone, address, preferences, created_at, updated_at

### ISPs (Service Providers) Table
- id, user_id, trade_profession, location, skills, certification, available_hours, payment_details, created_at, updated_at

### Jobs Table
- id, customer_id, category, description, priority, address, scheduled_date, status, notes, created_at, updated_at

## 🔧 API Endpoints

### Authentication
- POST /api/auth/register - Register new user
- POST /api/auth/login - User login
- POST /api/auth/logout - User logout

### Customers
- GET /api/customers - Get all customers
- GET /api/customers/:id - Get customer by ID
- POST /api/customers - Create customer profile
- PUT /api/customers/:id - Update customer

### ISPs
- GET /api/isps - Get all service providers
- GET /api/isps/:id - Get ISP by ID
- POST /api/isps - Create ISP profile
- PUT /api/isps/:id - Update ISP

### Jobs
- GET /api/jobs - Get all jobs
- GET /api/jobs/:id - Get job by ID
- POST /api/jobs - Create job request
- PUT /api/jobs/:id - Update job status
- PUT /api/jobs/:id/assign - Assign ISP to job
- POST /api/jobs/:id/notes - Add job notes

### Pricing & Quotations
- POST /api/pricing/estimate - AI-powered price estimation
- POST /api/pricing/quotations - Create quotation
- GET /api/pricing/quotations - Get all quotations
- GET /api/pricing/quotations/:id - Get quotation by ID
- PUT /api/pricing/quotations/:id/approve - Approve quotation
- PUT /api/pricing/quotations/:id/reject - Reject quotation
- POST /api/pricing/quotations/job/:job_id/generate - AI quotation generation
- POST /api/pricing/quotations/compare - Compare quotations
- GET /api/pricing/quotations/job/:job_id/history - Quotation history
- POST /api/pricing/quotations/:id/revise - Revise quotation
- GET /api/pricing/quotations/:id/expiration - Check expiration
- GET /api/pricing/quotations/job/:job_id/workflow - Workflow status
- POST /api/pricing/quotations/:id/send - Send to customer
- GET /api/pricing/quotations/stats - Quotation statistics

### ISP Matching (AI-Powered)
- POST /api/matching/jobs/:job_id/match - AI-powered ISP matching
- POST /api/matching/jobs/:job_id/assign - Assign best ISP
- GET /api/matching/isp/:isp_id/availability - ISP availability
- POST /api/matching/bulk-match - Bulk ISP matching

### Analytics (Predictive)
- GET /api/analytics/forecast/demand - Demand forecasting
- GET /api/analytics/projection/revenue - Revenue projection
- GET /api/analytics/estimate/completion-time - Completion time estimation
- GET /api/analytics/predict/churn/:customer_id - Churn prediction
- GET /api/analytics/estimate/clv/:customer_id - Customer lifetime value
- GET /api/analytics/predict/peak-periods - Peak period prediction
- GET /api/analytics/dashboard - Dashboard analytics

### Ratings (Multi-Criteria)
- POST /api/ratings - Create multi-criteria rating
- GET /api/ratings/isp/:isp_id - Get ISP ratings
- GET /api/ratings/ranking - ISP ranking
- GET /api/ratings/:id - Get rating by ID
- PUT /api/ratings/:id - Update rating (24h window)
- DELETE /api/ratings/:id - Delete rating (admin)
- POST /api/ratings/:id/report - Report inappropriate rating
- POST /api/ratings/:id/respond - ISP response to rating

### Webhooks
- POST /api/webhooks/google-forms - Google Forms webhook integration

## � Deployment Options & Costs

### Cloud Deployment (Recommended for Production)
- **Frontend**: Vercel (Free - unlimited)
- **Backend**: Render (Free - 750 hours/month)
- **Database**: Render PostgreSQL (Free 90 days, then $7/month)
- **AI Features**: OpenAI API ($5-20/month)
- **Total**: $7-27/month

### Self-Hosting (Zero Cost)
- **Hardware**: Your own server/VPS ($0-20/month if needed)
- **Software**: All open source ($0)
- **SSL**: Let's Encrypt (Free)
- **Email**: Gmail (Free)
- **AI Features**: OpenAI API ($5-20/month, optional)
- **Total**: $0-20/month (excluding optional AI)

### 100% Free Alternative
- Remove AI features
- Use free database (Supabase/Neon)
- Deploy to Render/Vercel free tiers
- **Total**: $0/month (with limitations)

For detailed deployment instructions, see:
- [DEPLOYMENT_INSTRUCTIONS.md](./DEPLOYMENT_INSTRUCTIONS.md) - Cloud deployment
- [SELF_HOSTING_GUIDE.md](./SELF_HOSTING_GUIDE.md) - Self-hosting guide

## �🛠️ Tech Stack

### Frontend
- React 19
- TypeScript
- Material-UI (MUI)
- React Router
- Axios
- Responsive design utilities
- Ghana-specific utilities

### Backend
- Node.js
- Express.js
- MySQL/PostgreSQL
- JWT Authentication
- Nodemailer (Email)
- OpenAI (AI features)
- Winston (Logging)
- Redis (Caching, optional)

### AI Services
- OpenAI GPT-3.5 Turbo (Pricing, Analytics, Insights)
- Custom AI matching algorithms
- Predictive analytics models

### Deployment
- Vercel (Frontend)
- Render (Backend & Database)
- Redis (Caching, optional)
- ngrok (Development tunneling)

## 📱 Mobile Access

After cloud deployment, users can access the application from any device:
- Mobile-friendly responsive design
- No app installation required
- Works on any modern browser

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (Admin, Staff, Customer, ISP)
- CORS protection
- Input validation
- SQL injection prevention

## 🧪 Testing

```bash
# Frontend tests
cd frontend
npm test

# Backend tests (if configured)
cd backend
npm test
```

## 📊 Monitoring

### Development
- Check console logs
- Use browser DevTools
- Monitor backend terminal output

### Production
- Render dashboard for backend metrics
- Vercel analytics for frontend performance
- Database monitoring on Render

## 🆘 Troubleshooting

### Common Issues

**Frontend won't start**
- Check if port 3003 is available
- Verify Node.js version
- Delete node_modules and reinstall

**Backend won't start**
- Check if port 3001 is available
- Verify database connection
- Check environment variables

**Email not sending**
- Verify Gmail credentials
- Check if less secure apps is enabled
- Try SendGrid as alternative

**Google Forms not working**
- Update webhook URL in Google Apps Script
- Check ngrok is running (if using localhost)
- Verify webhook endpoint is accessible

## 📈 Implemented Features

### ✅ AI Features
- [x] AI-powered job matching algorithm
- [x] Intelligent pricing with multi-factor analysis
- [x] Predictive analytics (demand, revenue, churn, CLV)
- [x] Customer insights and behavior analysis
- [x] Automated scheduling and assignment

### ✅ Business Logic
- [x] Complete quotation workflow with AI generation
- [x] Multi-criteria rating system (quality, timeliness, professionalism, communication)
- [x] Review moderation and ISP responses
- [x] Automated ISP ranking

### ✅ Ghana-Specific Features
- [x] Regional pricing adjustments (16 regions)
- [x] Ghana phone number validation and formatting
- [x] Mobile money network detection
- [x] GhanaPost GPS validation
- [x] Ghana Card ID verification
- [x] Public holidays calendar
- [x] Regional service availability

### ✅ Architecture
- [x] Advanced error handling and logging
- [x] Redis caching layer with graceful degradation
- [x] Enhanced security (rate limiting, encryption, validation)
- [x] Mobile-first responsive design
- [x] Ghana localization utilities

## 📈 Future Enhancements

- [ ] SMS notifications (Twilio)
- [ ] Push notifications
- [ ] Payment integration (Paystack/Flutterwave)
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Multi-language support (Twi, Ga, Ewe)
- [ ] Advanced reporting with PDF export
- [ ] Google Maps integration for distance calculation
- [ ] Real-time WebSocket updates
- [ ] File upload for documents and photos

## 🤝 Contributing

This is a production system for AjumaPlus CRM. For development contributions:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

Proprietary - AjumaPlus CRM

## 📞 Support

For technical support:
- Email: support@ajumaplus.com
- Documentation: See deployment guide
- GitHub Issues: For bug reports

---

**AjumaPlus CRM - Professional Service Provider Management System** 🚀