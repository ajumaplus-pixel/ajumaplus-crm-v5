# AjumaPlus CRM - Render.com Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying AjumaPlus CRM to Render.com, the recommended platform for Node.js applications with excellent free tier support.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Render Account Setup](#render-account-setup)
3. [Database Deployment](#database-deployment)
4. [Backend Deployment](#backend-deployment)
5. [Frontend Deployment](#frontend-deployment)
6. [Configuration](#configuration)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)
9. [Scaling & Costs](#scaling--costs)

---

## Prerequisites

### Required Accounts
- **GitHub Account** - For code hosting
- **Render Account** - For deployment
- **OpenAI API Key** - For AI features (optional)

### Required Tools
- **Git** - For version control
- **Node.js 18+** - For local testing
- **Code Editor** - VS Code recommended

### Time Estimate
- **Total deployment time**: 30-45 minutes
- **Database setup**: 5 minutes
- **Backend deployment**: 10-15 minutes
- **Frontend deployment**: 5-10 minutes
- **Configuration**: 10 minutes

---

## Render Account Setup

### Step 1: Create Render Account

1. Go to [render.com](https://render.com)
2. Click **"Sign Up"**
3. Choose **"Sign up with GitHub"** (recommended)
4. Authorize Render to access your GitHub account
5. Complete your profile setup

### Step 2: Verify Account

1. Check your email for verification
2. Confirm your email address
3. Log in to Render dashboard

---

## Database Deployment

### Step 1: Create PostgreSQL Database

1. In Render dashboard, click **"New +"** button
2. Select **"PostgreSQL"**
3. Configure database settings:
   - **Name**: `ajumaplus-db`
   - **Database**: `ajumaplus_crm`
   - **User**: `ajumaplus_user`
   - **Region**: Frankfurt (closest to Ghana) or Oregon
   - **Plan**: Free (recommended for testing)
4. Click **"Create Database"**

### Step 2: Save Database Credentials

After creation, you'll see:
- **Internal Database URL**: `postgresql://ajumaplus_user:password@host:port/ajumaplus_crm`
- **External Database URL**: For external connections
- **Host**: Database hostname
- **Port**: Database port
- **User**: Database username
- **Password**: Database password
- **Database**: Database name

**IMPORTANT**: Save these credentials securely!

### Step 3: Test Database Connection

```bash
# Test connection using psql (if available)
psql postgresql://ajumaplus_user:password@host:port/ajumaplus_crm

# Or use the Render dashboard "Connect" button to test
```

---

## Backend Deployment

### Step 1: Prepare Code for Deployment

```bash
# Ensure your code is on GitHub
cd ajumaplus-crm-v5
git init
git add .
git commit -m "Ready for Render deployment"
git remote add origin https://github.com/your-username/ajumaplus-crm-v5.git
git branch -M main
git push -u origin main
```

### Step 2: Create Backend Web Service

1. In Render dashboard, click **"New +"**
2. Select **"Web Service"**
3. Connect your GitHub repository
4. Configure deployment settings:

**Basic Settings:**
- **Name**: `ajumaplus-backend`
- **Region**: Frankfurt (or Oregon)
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: Node
- **Build Command**: `npm install`
- **Start Command**: `npm start`

**Advanced Settings:**
- **Instance Type**: Free (recommended for testing)
- **Instances**: 1

### Step 3: Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"** and add:

```env
NODE_ENV=production
PORT=3001
DATABASE_URL=[Your Render PostgreSQL Internal URL]
JWT_SECRET=[Generate a secure 32+ character string]
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d
FRONTEND_URL=https://ajumaplus-frontend.vercel.app
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=[Your Gmail address]
SMTP_PASSWORD=[Your Gmail app password]
SMTP_FROM=[Your Gmail address]
OPENAI_API_KEY=[Your OpenAI API key - optional]
MAX_FILE_SIZE=10485760
UPLOAD_DIR=uploads
WEBHOOK_SECRET=[Generate a secure string]
REDIS_ENABLED=false
```

**Important Notes:**
- Replace bracketed values with actual credentials
- Use the **Internal Database URL** from your PostgreSQL service
- Generate secure secrets using: `openssl rand -base64 32`
- SMTP password is your Gmail **app password**, not regular password

### Step 4: Deploy Backend

1. Click **"Create Web Service"**
2. Wait for deployment to complete (2-5 minutes)
3. Monitor the deployment logs
4. Once deployed, you'll get a URL like: `https://ajumaplus-backend.onrender.com`

### Step 5: Run Database Migrations

1. Go to your backend service in Render
2. Click **"Shell"** tab
3. Run migration command:
```bash
cd /opt/render/project/src
node utils/migrate.js
```

4. Or add migration to startup script (see troubleshooting)

---

## Frontend Deployment

### Step 1: Deploy to Vercel (Recommended)

Since Render is optimized for backend services, we'll deploy the frontend to Vercel (free and excellent for React apps).

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click **"Add New Project"**
4. Select your GitHub repository
5. Configure settings:
   - **Project Name**: `ajumaplus-frontend`
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

### Step 2: Add Frontend Environment Variables

```env
VITE_API_URL=https://ajumaplus-backend.onrender.com
VITE_APP_NAME=AjumaPlus CRM
VITE_COUNTRY=Ghana
VITE_CURRENCY=GHS
```

### Step 3: Deploy Frontend

1. Click **"Deploy"**
2. Wait for deployment (1-2 minutes)
3. Save your Vercel URL: `https://ajumaplus-frontend.vercel.app`

---

## Configuration

### Step 1: Update Backend CORS

1. Go back to Render backend service
2. Click **"Environment"** tab
3. Update `FRONTEND_URL` with your actual Vercel URL
4. Click **"Save Changes"**
5. This triggers a new deployment

### Step 2: Test API Connection

```bash
# Test backend health endpoint
curl https://ajumaplus-backend.onrender.com/health

# Expected response:
{
  "success": true,
  "message": "AJUMAPLUS CRM API is running",
  "timestamp": "2026-08-04T...",
  "environment": "production"
}
```

### Step 3: Test Frontend Connection

1. Open your Vercel frontend URL
2. Try to access the application
3. Check browser console for any API connection errors
4. Verify data is loading correctly

---

## Testing

### Step 1: Basic Functionality Tests

**Frontend Tests:**
- [ ] Landing page loads
- [ ] Navigation works
- [ ] Login pages accessible
- [ ] Forms display correctly

**Backend Tests:**
- [ ] Health endpoint responds
- [ ] Database connection works
- [ ] API endpoints accessible
- [ ] No console errors

### Step 2: User Registration Test

1. Navigate to customer registration
2. Fill in test details
3. Submit registration
4. Check if user is created in database
5. Verify email notification (if configured)

### Step 3: AI Features Test (Optional)

1. Create a test job request
2. Check if AI pricing works
3. Verify ISP matching functionality
4. Test predictive analytics (if available)

### Step 4: Integration Test

1. Register as customer
2. Create a job request
3. Check if data appears in admin dashboard
4. Test complete workflow

---

## Troubleshooting

### Common Issues

#### 1. Backend Won't Start

**Problem**: Backend service fails to start or crashes immediately

**Solutions**:
```bash
# Check Render logs
- Go to backend service → Logs tab
- Look for error messages
- Common issues:
  - Database connection string incorrect
  - Missing environment variables
  - Port conflicts
  - Dependency installation failures
```

**Fix**:
- Verify `DATABASE_URL` is correct
- Check all environment variables are set
- Ensure database is running
- Check for syntax errors in code

#### 2. Database Connection Errors

**Problem**: Backend can't connect to PostgreSQL

**Solutions**:
```bash
# Verify database is running
- Go to PostgreSQL service in Render
- Check status is "Available"
- Test connection using "Connect" button

# Check connection string
- Ensure using Internal Database URL
- Verify credentials are correct
- Check for typos in environment variables
```

**Fix**:
- Recreate database connection string
- Ensure database service is in same region
- Check firewall settings (Render handles this automatically)

#### 3. Frontend Can't Connect to Backend

**Problem**: API calls from frontend fail

**Solutions**:
```bash
# Check CORS configuration
- Verify FRONTEND_URL in backend env vars
- Ensure Vercel URL is correct
- Check if backend is running

# Test API directly
curl https://ajumaplus-backend.onrender.com/health
```

**Fix**:
- Update `FRONTEND_URL` environment variable
- Verify `VITE_API_URL` in frontend
- Check backend logs for CORS errors
- Ensure both services are in production mode

#### 4. Email Not Sending

**Problem**: Email notifications not working

**Solutions**:
```bash
# Verify SMTP credentials
- Check SMTP_USER and SMTP_PASSWORD
- Ensure using Gmail app password (not regular password)
- Test SMTP settings in Gmail account

# Check backend logs
- Look for email-related errors
- Verify email service configuration
```

**Fix**:
- Generate new Gmail app password
- Verify SMTP_HOST and SMTP_PORT
- Check if email is in spam folder
- Test email service independently

#### 5. AI Features Not Working

**Problem**: OpenAI API calls failing

**Solutions**:
```bash
# Verify API key
- Check OPENAI_API_KEY is set correctly
- Ensure API key has credits
- Test API key with OpenAI dashboard

# Check backend logs
- Look for OpenAI-related errors
- Verify API endpoint configuration
```

**Fix**:
- Add credits to OpenAI account
- Verify API key is valid
- Check if OpenAI service is available
- Test API independently

#### 6. Build Failures

**Problem**: Deployment fails during build

**Solutions**:
```bash
# Check build logs
- Look for dependency installation errors
- Check for syntax errors in code
- Verify package.json is correct

# Common issues:
- Missing dependencies in package.json
- Incompatible Node.js version
- Syntax errors in code
- Network issues during npm install
```

**Fix**:
- Ensure all dependencies are in package.json
- Test build locally: `npm install && npm start`
- Check Node.js version compatibility
- Verify git repository is complete

### Database Migration Issues

#### Manual Migration

If automatic migration fails:

```bash
# Access Render shell
1. Go to backend service
2. Click "Shell" tab
3. Run migration manually:
cd /opt/render/project/src
node utils/migrate.js
```

#### Migration Script

Add this to `package.json` to run migrations automatically:

```json
{
  "scripts": {
    "start": "node src/app.js",
    "migrate": "node src/utils/migrate.js"
  }
}
```

Then update Render start command:
```
npm run migrate && npm start
```

---

## Scaling & Costs

### Free Tier Limitations

**Render Free Tier:**
- **750 hours/month** (enough for 24/7 for ~31 days)
- **512MB RAM**
- **0.1 CPU**
- **Sleeps after 15 minutes of inactivity**
- **Cold start**: 30-60 seconds to wake up

**PostgreSQL Free Tier:**
- **90 days free**
- **After 90 days**: $7/month
- **1GB storage**
- **Limited connections**

### Cost Breakdown

#### Free Tier (First 90 Days)
- **Backend**: $0 (Render free tier)
- **Database**: $0 (PostgreSQL free trial)
- **Frontend**: $0 (Vercel free tier)
- **Total**: $0/month

#### After 90 Days
- **Backend**: $0 (Render free tier continues)
- **Database**: $7/month (PostgreSQL)
- **Frontend**: $0 (Vercel free tier continues)
- **Total**: $7/month

#### Production Tier (Recommended)
- **Backend Starter**: $7/month
- **Database**: $7/month (PostgreSQL)
- **Frontend**: $0 (Vercel free tier)
- **Total**: $14/month

#### With AI Features
- **Infrastructure**: $7-14/month
- **OpenAI API**: $5-20/month (usage-based)
- **Total**: $12-34/month

### Scaling Options

#### Vertical Scaling (Render)
1. Go to backend service
2. Click **"Settings"**
3. Change **Instance Type**:
   - Free: 512MB RAM, 0.1 CPU
   - Starter: 512MB RAM, 0.5 CPU ($7/month)
   - Standard: 2GB RAM, 1 CPU ($25/month)
   - Standard Plus: 4GB RAM, 2 CPU ($50/month)

#### Horizontal Scaling
1. Add more instances in service settings
2. Use Render's load balancing
3. Costs multiply by instance count

#### Database Scaling
1. Upgrade PostgreSQL plan
2. Increase storage capacity
3. Improve performance tier

### Performance Optimization

#### Reduce Cold Starts
- Keep a minimum of 1 instance always running
- Use Render's "Always On" feature ($7/month)
- Set up cron jobs to ping service regularly

#### Database Optimization
- Use connection pooling
- Add database indexes
- Optimize queries
- Enable caching (Redis - optional)

#### Frontend Optimization
- Enable CDN (Vercel provides this)
- Optimize images
- Enable compression
- Minimize bundle size

---

## Monitoring & Maintenance

### Health Checks

**Automatic Monitoring:**
- Render provides built-in health checks
- Automatic restarts on failures
- Uptime monitoring included
- Alert notifications available

**Manual Health Checks:**
```bash
# Backend health
curl https://ajumaplus-backend.onrender.com/health

# Database health
# Check PostgreSQL service status in Render dashboard

# Frontend health
# Open Vercel dashboard and check deployment status
```

### Log Monitoring

**Render Logs:**
- Go to service → Logs tab
- Real-time log streaming
- Log retention: 7 days on free tier
- Download logs for analysis

**Vercel Logs:**
- Go to project → Logs
- Build logs and runtime logs
- Error tracking included

### Backup Strategy

**Database Backups:**
- Render provides automated backups for PostgreSQL
- Daily backups included
- Point-in-time recovery available
- Manual backups can be created

**Application Backups:**
- Git provides code version control
- Environment variables should be documented
- Regular snapshots recommended

### Updates & Maintenance

**Application Updates:**
```bash
# Make changes locally
git add .
git commit -m "Update description"
git push

# Render auto-deploys on push
# Monitor deployment in Render dashboard
```

**Dependency Updates:**
```bash
# Update dependencies locally
cd backend
npm update
npm audit fix

# Test thoroughly
npm test

# Commit and push
git add .
git commit -m "Update dependencies"
git push
```

---

## Security Best Practices

### Environment Variables
- Never commit secrets to git
- Use Render's environment variable management
- Rotate secrets regularly
- Use strong, unique passwords

### API Security
- Keep JWT_SECRET secure
- Use HTTPS only (automatic on Render)
- Implement rate limiting (already included)
- Validate all inputs (already included)

### Database Security
- Use strong database passwords
- Limit database user permissions
- Enable SSL connections (automatic on Render)
- Regular security updates

### Access Control
- Use Render's team collaboration features
- Implement proper authentication
- Regular security audits
- Monitor access logs

---

## Advanced Configuration

### Custom Domain

**For Backend:**
1. Go to backend service → Settings
2. Add custom domain
3. Configure DNS records
4. SSL certificate automatically provisioned

**For Frontend:**
1. Go to Vercel project → Settings
2. Add custom domain
3. Configure DNS records
4. SSL automatically configured

### Webhooks

**Google Forms Integration:**
1. Update Google Apps Script with Render backend URL
2. Use the webhook endpoint: `https://ajumaplus-backend.onrender.com/api/webhooks/google-forms`
3. Test webhook functionality

### Redis Integration (Optional)

If you want to add caching:

1. Create Redis service in Render
2. Add Redis connection details to backend environment
3. Set `REDIS_ENABLED=true`
4. Update database configuration to use Redis

---

## Troubleshooting Checklist

Before contacting support, check:

- [ ] All environment variables are set correctly
- [ ] Database is running and accessible
- [ ] Services are in same region
- [ ] Build logs show no errors
- [ ] Runtime logs show no errors
- [ ] API endpoints are accessible
- [ ] CORS is configured correctly
- [ ] Firewall rules are not blocking
- [ ] Dependencies are up to date
- [ ] Node.js version is compatible

---

## Support Resources

### Official Documentation
- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

### Community Support
- Render Community Forum
- Stack Overflow (render tag)
- GitHub Issues (for this project)

### Emergency Recovery

If everything fails:
1. Go to Render dashboard
2. Rollback to previous deployment
3. Check database status
4. Restore from backup if needed
5. Contact Render support

---

## Next Steps

After successful deployment:

1. **Monitor performance** for first week
2. **Set up alerts** for critical issues
3. **Configure backups** and test restore
4. **Optimize performance** based on usage
5. **Plan scaling** for growth
6. **Document custom configurations**

---

## Summary

**Deployment Architecture:**
- **Backend**: Render.com (Node.js)
- **Database**: Render PostgreSQL
- **Frontend**: Vercel (React)
- **Email**: Gmail SMTP
- **AI**: OpenAI API (optional)

**Total Cost:**
- **First 90 days**: $0/month
- **After 90 days**: $7/month
- **With AI features**: $12-34/month

**Deployment Time:** 30-45 minutes
**Maintenance:** Minimal (auto-deploys on git push)
**Scaling:** Easy (upgrade instance type)

---

**Last Updated**: 2026-08-04
**Version**: 5.0
**Platform**: Render.com + Vercel
