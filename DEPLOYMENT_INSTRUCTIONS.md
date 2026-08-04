# AjumaPlus CRM - Deployment Instructions

## Quick Start Deployment Guide

This guide provides step-by-step instructions for deploying AjumaPlus CRM to production using Vercel (frontend) and Render (backend).

### Prerequisites

1. **GitHub Account** - For code hosting and deployment
2. **Vercel Account** - For frontend deployment
3. **Render Account** - For backend deployment
4. **OpenAI API Key** - For AI features
5. **Gmail Account** - For email notifications (with app password)

---

## Step 1: Push Code to GitHub

1. Initialize git repository if not already done:
```bash
cd ajumaplus-crm-v5
git init
git add .
git commit -m "Initial commit - AjumaPlus CRM v5"
```

2. Create a new repository on GitHub
3. Push your code:
```bash
git remote add origin https://github.com/your-username/ajumaplus-crm-v5.git
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy Backend to Render

### 2.1 Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up (free tier available)
3. Connect your GitHub account

### 2.2 Deploy PostgreSQL Database
1. In Render dashboard, click **"New +"**
2. Select **"PostgreSQL"**
3. Configure:
   - Name: `ajumaplus-db`
   - Database: `ajumaplus_crm`
   - User: `ajumaplus_user`
   - Region: Frankfurt (closest to Ghana)
4. Click **"Create Database"**
5. **Important**: Save the database connection details provided by Render

### 2.3 Deploy Backend API
1. In Render dashboard, click **"New +"**
2. Select **"Web Service"**
3. Connect your GitHub repository
4. Configure deployment settings:
   - **Name**: `ajumaplus-backend`
   - **Root Directory**: `backend`
   - **Region**: Frankfurt
   - **Branch**: `main`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

5. **Add Environment Variables** (click "Advanced" → "Add Environment Variable"):
   ```
   NODE_ENV=production
   PORT=3001
   DATABASE_URL=[Your Render PostgreSQL URL]
   JWT_SECRET=[Generate a secure 32+ character string]
   JWT_EXPIRE=7d
   JWT_REFRESH_EXPIRE=30d
   OPENAI_API_KEY=[Your OpenAI API key]
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=[Your Gmail address]
   SMTP_PASSWORD=[Your Gmail app password]
   SMTP_FROM=[Your Gmail address]
   FRONTEND_URL=https://ajumaplus-frontend.vercel.app
   MAX_FILE_SIZE=10485760
   UPLOAD_DIR=uploads
   WEBHOOK_SECRET=[Generate a secure string]
   REDIS_ENABLED=false
   ```

6. Click **"Create Web Service"**
7. Wait for deployment to complete (typically 2-5 minutes)
8. **Important**: Save your backend URL (e.g., `https://ajumaplus-backend.onrender.com`)

### 2.4 Test Backend Deployment
```bash
# Test health endpoint
curl https://ajumaplus-backend.onrender.com/health

# Expected response:
{
  "success": true,
  "message": "AJUMAPLUS CRM API is running",
  "timestamp": "2026-08-04T...",
  "environment": "production"
}
```

---

## Step 3: Deploy Frontend to Vercel

### 3.1 Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up (free tier available)
3. Connect your GitHub account

### 3.2 Deploy Frontend
1. In Vercel dashboard, click **"Add New Project"**
2. Select your GitHub repository
3. Configure project settings:
   - **Project Name**: `ajumaplus-frontend`
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

4. **Add Environment Variables**:
   ```
   VITE_API_URL=https://ajumaplus-backend.onrender.com
   VITE_APP_NAME=AjumaPlus CRM
   VITE_COUNTRY=Ghana
   VITE_CURRENCY=GHS
   ```

5. Click **"Deploy"**
6. Wait for deployment to complete (typically 1-2 minutes)
7. **Important**: Save your frontend URL (e.g., `https://ajumaplus-frontend.vercel.app`)

### 3.3 Update Backend CORS
1. Go back to Render dashboard
2. Edit your backend service
3. Update `FRONTEND_URL` environment variable with your actual Vercel URL
4. Trigger a new deployment

---

## Step 4: Post-Deployment Configuration

### 4.1 Run Database Migrations
Since Render PostgreSQL is already set up, you'll need to run migrations:

1. Access your Render database via external tool (like DBeaver or pgAdmin)
2. Run the migration files from `backend/migrations/` directory
3. Or use Render's shell to run:
```bash
# In Render web service shell
cd /opt/render/project/src
node utils/migrate.js
```

### 4.2 Test Application
1. Open your Vercel frontend URL
2. Test user registration (Customer and ISP)
3. Test login functionality
4. Test job creation
5. Test admin dashboard access

### 4.3 Configure Google Forms (Optional)
If you want to use Google Forms integration:

1. Follow the instructions in `GOOGLE_FORMS_SETUP.md`
2. Update your backend webhook URLs in the Google Apps Script
3. Test webhook endpoints:
```bash
curl -X POST https://ajumaplus-backend.onrender.com/api/webhooks/google-forms/job \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","form_data":{}}'
```

---

## Step 5: Monitoring and Maintenance

### Health Checks
- Backend: `https://ajumaplus-backend.onrender.com/health`
- Frontend: `https://ajumaplus-frontend.vercel.app`

### Logs
- **Render**: Dashboard → Services → ajumaplus-backend → Logs
- **Vercel**: Dashboard → ajumaplus-frontend → Logs

### Scaling
- **Render**: Upgrade plan in service settings
- **Vercel**: Automatic scaling included in free tier

---

## Troubleshooting

### Common Issues

**1. Backend won't start**
- Check Render logs for errors
- Verify database connection string
- Ensure all environment variables are set

**2. Frontend can't connect to backend**
- Verify `VITE_API_URL` is correct
- Check CORS settings in backend
- Ensure backend is running

**3. Database connection errors**
- Verify `DATABASE_URL` is correct
- Check if database is running in Render
- Test connection externally

**4. Email not sending**
- Verify SMTP credentials
- Check if app password is correct for Gmail
- Review Render logs for email errors

**5. AI features not working**
- Verify `OPENAI_API_KEY` is valid
- Check if API key has credits
- Review backend logs for OpenAI errors

---

## Security Checklist

- [ ] Change all default secrets and passwords
- [ ] Enable HTTPS (automatic on Vercel/Render)
- [ ] Set up custom domain (optional)
- [ ] Configure rate limiting
- [ ] Enable security headers
- [ ] Regular security updates
- [ ] Monitor logs for suspicious activity
- [ ] Set up backup strategy

---

## Cost Estimates

### Free Tier (Monthly)
- **Render**: Free (limited hours)
- **Vercel**: Free (100GB bandwidth)
- **PostgreSQL**: Free (90 days, then ~$7/month)
- **Total**: $0-7/month

### Production Tier (Monthly)
- **Render Starter**: $7/month
- **Vercel Pro**: $20/month
- **PostgreSQL**: $7/month
- **OpenAI API**: Variable (usage-based)
- **Total**: ~$34/month + OpenAI costs

---

## Next Steps

1. **Custom Domain**: Add your own domain for professional appearance
2. **Monitoring**: Set up uptime monitoring (UptimeRobot, Pingdom)
3. **Analytics**: Add Google Analytics or similar
4. **Backup**: Configure automated database backups
5. **CI/CD**: Set up automated testing and deployment

---

## Support

For issues or questions:
- Check documentation in `docs/` directory
- Review Render and Vercel documentation
- Check GitHub issues for common problems
- Contact support through respective platforms

---

**Last Updated**: 2026-08-04
**Version**: 5.0
