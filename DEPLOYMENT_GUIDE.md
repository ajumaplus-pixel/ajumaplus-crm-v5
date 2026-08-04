# AjumaPlus CRM Deployment Guide

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Backend Deployment](#backend-deployment)
4. [Frontend Deployment](#frontend-deployment)
5. [Database Setup](#database-setup)
6. [Redis Configuration](#redis-configuration)
7. [Google Forms Integration](#google-forms-integration)
8. [Monitoring and Maintenance](#monitoring-and-maintenance)
9. [Troubleshooting](#troubleshooting)
10. [Security Best Practices](#security-best-practices)

## Prerequisites

### Required Software

- **Node.js**: v18.x or higher
- **npm**: v9.x or higher
- **MySQL**: v8.0 or higher
- **Redis**: v6.x or higher (optional)
- **Git**: Latest version
- **Google Account**: For Google Forms integration

### Required Accounts

- **OpenAI API Key**: For AI features
- **Gmail Account**: For email notifications
- **Google Cloud Account**: For Google Forms Apps Script
- **Domain Name**: For production deployment (optional)
- **Hosting Accounts**: Vercel (frontend), Render (backend/database)

### System Requirements

- **Minimum RAM**: 2GB
- **Recommended RAM**: 4GB+
- **Storage**: 20GB+
- **CPU**: 2 cores minimum, 4 cores recommended

## Environment Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-repo/ajumaplus-crm-v5.git
cd ajumaplus-crm-v5
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 4. Configure Environment Variables

#### Backend (.env)

```env
NODE_ENV=production
PORT=3001
DB_HOST=your-db-host
DB_PORT=3306
DB_NAME=ajumaplus_crm
DB_USER=your-db-user
DB_PASSWORD=your-db-password
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d
OPENAI_API_KEY=your-openai-api-key
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=your-email@gmail.com
FRONTEND_URL=https://your-frontend-url.com
MAX_FILE_SIZE=10485760
UPLOAD_DIR=uploads
WEBHOOK_SECRET=your-webhook-secret
NGROK_AUTHTOKEN=your-ngrok-token
REDIS_ENABLED=true
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
```

#### Frontend (.env.production)

```env
VITE_API_URL=https://your-backend-url.com
VITE_APP_NAME=AjumaPlus CRM
VITE_COUNTRY=Ghana
VITE_CURRENCY=GHS
```

## Backend Deployment

### Option 1: Render (Recommended)

#### 1. Create Render Account

1. Go to [render.com](https://render.com)
2. Sign up for an account
3. Connect your GitHub repository

#### 2. Deploy Backend

1. Click "New +"
2. Select "Web Service"
3. Connect your GitHub repository
4. Select the `backend` folder as root directory
5. Configure build settings:
   - Build Command: `npm install`
   - Start Command: `npm start`
6. Add environment variables (from .env)
7. Deploy to a region closest to Ghana (Frankfurt)
8. Note the deployed URL

#### 3. Deploy Database

1. Click "New +"
2. Select "PostgreSQL" (or MySQL if available)
3. Configure database settings
4. Add environment variables to backend service
5. Note the database connection details

#### 4. Deploy Redis (Optional)

1. Click "New +"
2. Select "Redis"
3. Configure Redis settings
4. Add environment variables to backend service

### Option 2: DigitalOcean / AWS

#### 1. Set Up Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MySQL
sudo apt install -y mysql-server

# Install Redis
sudo apt install -y redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server

# Install Nginx
sudo apt install -y nginx
```

#### 2. Clone and Setup

```bash
# Clone repository
git clone https://github.com/your-repo/ajumaplus-crm-v5.git
cd ajumaplus-crm-v5/backend

# Install dependencies
npm install

# Run migrations
npm run migrate

# Start server (use PM2 for production)
npm install -g pm2
pm2 start src/app.js --name ajumaplus-backend
pm2 save
pm2 startup
```

#### 3. Configure Nginx

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Frontend Deployment

### Option 1: Vercel (Recommended)

#### 1. Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Sign up for an account
3. Connect your GitHub repository

#### 2. Deploy Frontend

1. Click "New Project"
2. Select your GitHub repository
3. Configure project settings:
   - Framework Preset: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add environment variables
5. Deploy

#### 3. Configure Domain

1. Go to project settings
2. Add custom domain
3. Configure DNS records
4. Enable HTTPS (automatic)

### Option 2: Netlify

1. Create Netlify account
2. Connect GitHub repository
3. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Add environment variables
5. Deploy

## Database Setup

### Run Migrations

```bash
cd backend
npm run migrate
```

### Create Database

```sql
CREATE DATABASE ajumaplus_crm;
USE ajumaplus_crm;

-- Import schema
source backend/database/schema.sql;
```

### Verify Connection

```bash
# Test database connection
node -e "const db = require('./src/config/database'); db.query('SELECT 1').then(() => console.log('Connected')).catch(console.error);"
```

## Redis Configuration

### Optional Redis Setup

If you choose not to use Redis, set `REDIS_ENABLED=false` in your .env file.

### Enable Redis

1. Install Redis locally or use a cloud provider
2. Set `REDIS_ENABLED=true` in .env
3. Configure Redis connection details
4. Redis will be used for:
   - Caching API responses
   - Session storage
   - Rate limiting
   - Performance optimization

## Google Forms Integration

### 1. Create Google Forms

Create three Google Forms:
- ISP Registration Form
- Customer Registration Form
- Job Request Form

### 2. Create Google Sheet

1. Create a new Google Sheet
2. Create three tabs:
   - ISP_Registration
   - Customer_Registration
   - Job_Request
3. Note the Sheet ID

### 3. Set Up Apps Script

1. Open the Google Sheet
2. Go to Extensions > Apps Script
3. Copy the `UNIFIED_GOOGLE_APPS_SCRIPT.js` content
4. Configure the script:
   - Set your webhook URL
   - Set your Sheet ID
   - Set your secrets
5. Deploy as web app:
   - Execute as: Me
   - Who has access: Anyone
6. Note the web app URL

### 4. Configure Forms

1. Add the Apps Script URL to each form's settings
2. Set up form triggers for submit
3. Test the integration

### 5. Verify Webhook

```bash
# Test webhook endpoint
curl -X POST https://your-backend-url.com/api/webhooks/google-forms \
  -H "Content-Type: application/json" \
  -d '{"form_type":"job_request","email":"test@example.com","form_data":{}}'
```

## Monitoring and Maintenance

### Health Checks

```bash
# Backend health check
curl https://your-backend-url.com/health

# Expected response:
{
  "success": true,
  "message": "AJUMAPLUS CRM API is running",
  "timestamp": "2024-08-04T10:00:00.000Z",
  "uptime": 3600,
  "environment": "production"
}
```

### Log Monitoring

Logs are stored in `backend/logs/`:
- `error.log`: Error messages
- `combined.log`: All logs
- `production.log`: Production-specific logs

### Performance Monitoring

Monitor these metrics:
- API response time (< 500ms target)
- Error rate (< 1% target)
- Cache hit rate (> 70% target)
- Database query performance
- Redis connection health

### Backup Strategy

#### Database Backups

```bash
# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u username -p password ajumaplus_crm > backup_$DATE.sql
```

#### Backup Schedule
- Daily: Full database backup
- Weekly: Archive old backups
- Monthly: Off-site backup

### Update Procedure

1. **Test in Staging**
   ```bash
   git pull origin main
   npm install
   npm run migrate
   npm test
   ```

2. **Deploy to Production**
   ```bash
   git pull origin main
   npm install
   npm run migrate
   pm2 restart ajumaplus-backend
   ```

3. **Verify Deployment**
   - Run health checks
   - Test critical endpoints
   - Monitor error logs
   - Verify database connectivity

## Troubleshooting

### Common Issues

#### Backend Won't Start

**Problem**: Server fails to start

**Solutions**:
```bash
# Check port availability
lsof -i :3001

# Check database connection
npm run migrate

# Check logs
tail -f logs/error.log

# Restart server
pm2 restart ajumaplus-backend
```

#### Database Connection Errors

**Problem**: Cannot connect to database

**Solutions**:
```bash
# Verify database is running
sudo systemctl status mysql

# Check credentials
cat .env | grep DB_

# Test connection
mysql -h localhost -u root -p
```

#### Redis Connection Errors

**Problem**: Redis connection fails

**Solutions**:
```bash
# Disable Redis if not needed
REDIS_ENABLED=false

# Or check Redis status
sudo systemctl status redis-server

# Restart Redis
sudo systemctl restart redis-server
```

#### API Timeout Errors

**Problem**: API requests timing out

**Solutions**:
- Check server resources
- Optimize database queries
- Enable Redis caching
- Increase timeout settings
- Check network connectivity

#### Email Not Sending

**Problem**: Email notifications not working

**Solutions**:
- Verify SMTP credentials
- Check Gmail app password
- Test email service independently
- Check spam folder
- Verify network connectivity

### Debug Mode

Enable debug logging:

```env
LOG_LEVEL=debug
NODE_ENV=development
```

### Error Codes

- `ECONNREFUSED`: Connection refused
- `ETIMEDOUT`: Connection timeout
- `500`: Internal server error
- `404`: Resource not found
- `401`: Authentication failed
- `403`: Authorization failed

## Security Best Practices

### 1. Environment Variables

- Never commit .env files
- Use strong secrets
- Rotate secrets regularly
- Use different secrets for different environments

### 2. Database Security

```sql
-- Create limited database user
CREATE USER 'ajumaplus_app'@'localhost' IDENTIFIED BY 'strong_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON ajumaplus_crm.* TO 'ajumaplus_app'@'localhost';
FLUSH PRIVILEGES;
```

### 3. API Security

- Enable HTTPS in production
- Use strong JWT secrets
- Implement rate limiting
- Validate all inputs
- Sanitize outputs
- Use CORS properly

### 4. Server Security

```bash
# Configure firewall
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# Install fail2ban
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 5. Regular Updates

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Node.js dependencies
npm audit fix

# Update npm packages
npm update
```

## Performance Optimization

### 1. Database Optimization

```sql
-- Add indexes for common queries
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_customer_id ON jobs(customer_id);
CREATE INDEX idx_jobs_created_at ON jobs(created_at);
```

### 2. Caching Strategy

- Enable Redis for frequently accessed data
- Cache user sessions
- Cache API responses
- Implement cache invalidation

### 3. CDN Configuration

- Use CDN for static assets
- Enable gzip compression
- Optimize images
- Minify CSS/JS

### 4. Load Balancing

For high-traffic deployments:
- Use multiple backend instances
- Configure load balancer
- Implement session affinity
- Health check endpoints

## Scaling Guide

### Vertical Scaling

Increase server resources:
- RAM: 2GB → 4GB → 8GB
- CPU: 2 cores → 4 cores → 8 cores
- Storage: 20GB → 50GB → 100GB

### Horizontal Scaling

Add more instances:
- 1 backend instance → 2 → 4 → 8
- 1 database instance → Master-slave replication
- 1 Redis instance → Redis Cluster

### Database Scaling

- Read replicas for read-heavy operations
- Database sharding for large datasets
- Connection pooling
- Query optimization

## Cost Estimation

### Monthly Costs (USD)

**Render Deployment:**
- Backend: $7-25/month
- Database: $7-25/month
- Redis: $15/month (optional)
- **Total**: $29-65/month

**Vercel Deployment:**
- Frontend: Free for hobby tier
- Pro tier: $20/month
- **Total**: $0-20/month

**Total Estimated Cost:** $29-85/month

### Alternative Deployment (VPS)

- DigitalOcean: $6-40/month
- AWS: $20-100/month
- Google Cloud: $20-100/month

## Compliance

### Data Protection

- GDPR-style data protection
- Secure data storage
- Data encryption at rest
- Secure data transmission
- Data retention policies

### Ghana-Specific Compliance

- Data Protection Act compliance
- Local data storage requirements
- Mobile money regulations
- Consumer protection laws

## Support and Maintenance

### Monitoring Services

- Set up uptime monitoring (UptimeRobot, Pingdom)
- Error tracking (Sentry, Rollbar)
- Performance monitoring (New Relic, Datadog)
- Log aggregation (Loggly, Papertrail)

### Support Channels

- Email: support@ajumaplus.com
- Phone: +233 XX XXX XXXX
- Slack: #support channel
- Documentation: docs.ajumaplus.com

### Maintenance Schedule

- **Daily**: Monitor logs and metrics
- **Weekly**: Review performance, check backups
- **Monthly**: Security updates, dependency updates
- **Quarterly**: Full system audit, capacity planning
- **Annually**: Security review, disaster recovery test

## Disaster Recovery

### Backup Strategy

1. **Database Backups**
   - Daily automated backups
   - Weekly full backups
   - Monthly off-site backups

2. **Code Backups**
   - Git version control
   - Multiple remote repositories
   - Tagged releases

3. **Configuration Backups**
   - Environment variables
   - Configuration files
   - Secrets management

### Recovery Procedure

1. Restore database from backup
2. Deploy latest code
3. Restore configuration
4. Verify functionality
5. Monitor for issues

## Post-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database migrations run successfully
- [ ] Redis connected (if enabled)
- [ ] HTTPS enabled
- [ ] Health check endpoint working
- [ ] Email service verified
- [ ] Google Forms integration tested
- [ ] Webhook endpoints tested
- [ ] Rate limiting configured
- [ ] Security headers configured
- [ ] Monitoring enabled
- [ ] Backups configured
- [ ] Documentation updated
- [ ] Support team notified
- [ ] DNS configured
- [ ] SSL certificate valid

## Conclusion

This deployment guide provides comprehensive instructions for deploying the AjumaPlus CRM system to production. Follow the steps carefully and ensure all security best practices are implemented.

For additional support, refer to:
- API Documentation: `API_DOCUMENTATION.md`
- User Guide: `USER_GUIDE.md`
- Backend Implementation Summary: `BACKEND_IMPLEMENTATION_SUMMARY.md`

Good luck with your deployment!