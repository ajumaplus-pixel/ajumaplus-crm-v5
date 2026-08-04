# Render.com Deployment Quick Reference

## 🚀 Quick Start (30 minutes)

### 1. Create Accounts (5 minutes)
- [x] Render account: https://render.com
- [x] Vercel account: https://vercel.com  
- [x] GitHub account: https://github.com

### 2. Deploy Database (5 minutes)
- Create PostgreSQL service in Render
- Save database credentials
- Test connection

### 3. Deploy Backend (10 minutes)
- Create web service in Render
- Connect GitHub repository
- Add environment variables
- Deploy and test

### 4. Deploy Frontend (5 minutes)
- Create project in Vercel
- Connect GitHub repository
- Add environment variables
- Deploy and test

### 5. Configure (5 minutes)
- Update CORS settings
- Test integration
- Verify all features

## 📋 Environment Variables Checklist

### Backend (Render)
- [ ] DATABASE_URL (from PostgreSQL service)
- [ ] JWT_SECRET (generate or let Render create)
- [ ] FRONTEND_URL (your Vercel URL)
- [ ] SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM
- [ ] OPENAI_API_KEY (optional)
- [ ] WEBHOOK_SECRET (generate or let Render create)
- [ ] REDIS_ENABLED=false

### Frontend (Vercel)
- [ ] VITE_API_URL (your Render backend URL)
- [ ] VITE_APP_NAME=AjumaPlus CRM
- [ ] VITE_COUNTRY=Ghana
- [ ] VITE_CURRENCY=GHS

## 🔗 Important URLs After Deployment

### Backend
- **Render Dashboard**: https://dashboard.render.com
- **Backend URL**: https://ajumaplus-backend.onrender.com
- **Health Check**: https://ajumaplus-backend.onrender.com/health
- **API Endpoints**: https://ajumaplus-backend.onrender.com/api/*

### Frontend
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Frontend URL**: https://ajumaplus-frontend.vercel.app
- **Analytics**: https://vercel.com/dashboard/ajumaplus-frontend/analytics

### Database
- **Render Database**: https://dashboard.render.com/postgres
- **Connection**: Use Internal Database URL for backend

## 💰 Cost Summary

### Free Tier (First 90 Days)
- Backend: $0 (Render free tier)
- Database: $0 (PostgreSQL free trial)
- Frontend: $0 (Vercel free tier)
- **Total**: $0/month

### After 90 Days
- Backend: $0 (Render free tier continues)
- Database: $7/month (PostgreSQL)
- Frontend: $0 (Vercel free tier continues)
- **Total**: $7/month

### With AI Features
- Infrastructure: $7/month
- OpenAI API: $5-20/month (usage-based)
- **Total**: $12-27/month

## 🛠️ Common Commands

### Local Testing
```bash
# Test backend locally
cd backend
npm install
npm start

# Test frontend locally
cd frontend
npm install
npm start
```

### Deployment
```bash
# Push to GitHub (triggers auto-deploy)
git add .
git commit -m "Update"
git push

# Manual redeploy in Render dashboard
# Go to service → Manual Deploy → Deploy latest commit
```

### Health Checks
```bash
# Backend health
curl https://ajumaplus-backend.onrender.com/health

# Frontend check
# Open https://ajumaplus-frontend.vercel.app in browser
```

## 🐛 Troubleshooting Quick Fixes

### Backend won't start
1. Check Render logs
2. Verify DATABASE_URL is correct
3. Ensure all environment variables are set
4. Check database is running

### Frontend can't connect
1. Verify VITE_API_URL is correct
2. Check backend is running
3. Test backend health endpoint
4. Update FRONTEND_URL in backend

### Database connection errors
1. Verify database service is running
2. Check using Internal Database URL
3. Ensure database and backend are in same region
4. Test connection in Render dashboard

### Email not working
1. Verify SMTP credentials
2. Use Gmail app password (not regular password)
3. Check backend logs for email errors
4. Test SMTP configuration independently

## 📊 Monitoring

### Render Dashboard
- **Logs**: Service → Logs tab
- **Metrics**: Service → Metrics tab
- **Events**: Service → Events tab
- **Health**: Automatic health checks

### Vercel Dashboard
- **Logs**: Project → Logs
- **Analytics**: Project → Analytics
- **Deployments**: Project → Deployments
- **Settings**: Project → Settings

## 🔄 Updates

### To Update Application
```bash
# Make changes locally
git add .
git commit -m "Update description"
git push

# Render auto-deploys on push
# Monitor deployment in Render dashboard
```

### To Update Dependencies
```bash
cd backend
npm update
npm audit fix
git add .
git commit -m "Update dependencies"
git push
```

## 🔒 Security Reminders

- [ ] Never commit secrets to git
- [ ] Use strong passwords for database
- [ ] Rotate JWT_SECRET periodically
- [ ] Keep SMTP credentials secure
- [ ] Monitor logs for suspicious activity
- [ ] Keep dependencies updated

## 📞 Support

### Render Support
- Documentation: https://render.com/docs
- Community: https://community.render.com
- Status: https://status.render.com

### Vercel Support
- Documentation: https://vercel.com/docs
- Community: https://vercel.com/community
- Status: https://vercel-status.com

### Project Support
- GitHub Issues: For project-specific issues
- RENDER_DEPLOYMENT_GUIDE.md: Detailed guide
- SELF_HOSTING_GUIDE.md: Alternative deployment

## ✅ Pre-Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Render account created
- [ ] Vercel account created
- [ ] OpenAI API key obtained (if using AI)
- [ ] Gmail app password generated
- [ ] Database credentials saved
- [ ] Environment variables documented
- [ ] Local testing completed
- [ ] Git repository clean
- [ ] README updated

## 🎯 Success Indicators

After successful deployment, you should see:

- ✅ Backend health endpoint returns success
- ✅ Frontend loads without errors
- ✅ User registration works
- ✅ Database records are created
- ✅ Email notifications are sent
- ✅ No console errors in browser
- ✅ Logs show no critical errors
- ✅ Services are running in production mode

## 📈 Next Steps

1. **Monitor** first week performance
2. **Set up alerts** for critical issues
3. **Configure backups** and test restore
4. **Optimize** based on usage patterns
5. **Plan scaling** for expected growth
6. **Document** any custom configurations

---

**Total Deployment Time**: 30-45 minutes
**Monthly Cost**: $0-7/month (first 90 days), $7/month thereafter
**Maintenance**: Minimal (auto-deploys on git push)
