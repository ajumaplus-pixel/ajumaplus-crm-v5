# AjumaPlus CRM - Self-Hosting Guide (Zero Cost)

## Overview

This guide provides complete instructions for self-hosting AjumaPlus CRM on your own infrastructure at **zero recurring cost**. This is ideal if you have:
- A VPS (Virtual Private Server)
- A home server/PC
- Existing web hosting
- University/organization server resources

## Prerequisites

### Hardware Requirements
- **Minimum**: 2GB RAM, 20GB storage, 1 CPU core
- **Recommended**: 4GB RAM, 40GB storage, 2 CPU cores
- **OS**: Ubuntu 20.04+, Debian 10+, or any Linux distribution

### Software Requirements
- Node.js v18+ 
- MySQL/PostgreSQL
- Nginx (for reverse proxy)
- Git
- SSL certificate (Let's Encrypt - free)

### Domain (Optional but Recommended)
- A domain name for professional appearance
- Free alternatives: 
  - No-IP (ddns.net)
  - DuckDNS
  - Your own IP address

---

## Option 1: Direct Installation (No Docker)

### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y curl git nginx ufw

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MySQL
sudo apt install -y mysql-server
sudo mysql_secure_installation

# Install PM2 for process management
sudo npm install -g pm2
```

### Step 2: Database Setup

```bash
# Log into MySQL
sudo mysql

# Run these commands in MySQL:
CREATE DATABASE ajumaplus_crm;
CREATE USER 'ajumaplus'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON ajumaplus_crm.* TO 'ajumaplus'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Step 3: Deploy Application

```bash
# Clone repository
cd /var/www
sudo git clone https://github.com/your-repo/ajumaplus-crm-v5.git
sudo chown -R $USER:$USER ajumaplus-crm-v5
cd ajumaplus-crm-v5

# Install backend dependencies
cd backend
npm install

# Configure environment
cp .env.example .env
nano .env
```

**Edit `.env` with:**
```env
NODE_ENV=production
PORT=3001
DB_HOST=localhost
DB_PORT=3306
DB_NAME=ajumaplus_crm
DB_USER=ajumaplus
DB_PASSWORD=your_secure_password
JWT_SECRET=your_32_character_secret
JWT_EXPIRE=7d
FRONTEND_URL=http://your-domain.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=your-email@gmail.com
OPENAI_API_KEY=your-openai-key  # Optional: remove if not using AI
REDIS_ENABLED=false
```

```bash
# Run database migrations
npm run migrate

# Start backend with PM2
pm2 start src/app.js --name ajumaplus-backend
pm2 save
pm2 startup
```

### Step 4: Frontend Deployment

```bash
cd /var/www/ajumaplus-crm-v5/frontend
npm install

# Create production build
npm run build

# Configure environment
echo "VITE_API_URL=http://your-domain.com:3001" > .env.production
echo "VITE_APP_NAME=AjumaPlus CRM" >> .env.production
echo "VITE_COUNTRY=Ghana" >> .env.production
echo "VITE_CURRENCY=GHS" >> .env.production

# Build again with production env
npm run build

# Serve with PM2 (using http-server)
npm install -g http-server
pm2 start "http-server build -p 3003" --name ajumaplus-frontend
pm2 save
```

### Step 5: Nginx Configuration

```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/ajumaplus
```

**Add this configuration:**
```nginx
# Frontend (Port 3003)
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:3001;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/ajumaplus /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 6: SSL Certificate (Free with Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal is configured automatically
```

### Step 7: Firewall Configuration

```bash
# Configure UFW
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

---

## Option 2: Docker Deployment (Recommended)

### Step 1: Install Docker

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

### Step 2: Create Docker Configuration

```bash
cd /var/www/ajumaplus-crm-v5
```

**Create `docker-compose.yml`:**
```yaml
version: '3.8'

services:
  # MySQL Database
  mysql:
    image: mysql:8.0
    container_name: ajumaplus-mysql
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: ajumaplus_crm
      MYSQL_USER: ajumaplus
      MYSQL_PASSWORD: ajumaplus_password
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - "3306:3306"
    restart: unless-stopped

  # Backend API
  backend:
    build: ./backend
    container_name: ajumaplus-backend
    environment:
      NODE_ENV: production
      PORT: 3001
      DB_HOST: mysql
      DB_PORT: 3306
      DB_NAME: ajumaplus_crm
      DB_USER: ajumaplus
      DB_PASSWORD: ajumaplus_password
      JWT_SECRET: your_32_character_secret
      FRONTEND_URL: http://localhost:3003
      SMTP_HOST: smtp.gmail.com
      SMTP_PORT: 587
      SMTP_USER: your-email@gmail.com
      SMTP_PASSWORD: your-app-password
      SMTP_FROM: your-email@gmail.com
      OPENAI_API_KEY: your-openai-key
      REDIS_ENABLED: false
    depends_on:
      - mysql
    ports:
      - "3001:3001"
    restart: unless-stopped

  # Frontend
  frontend:
    build: ./frontend
    container_name: ajumaplus-frontend
    environment:
      VITE_API_URL: http://your-domain.com/api
      VITE_APP_NAME: AjumaPlus CRM
      VITE_COUNTRY: Ghana
      VITE_CURRENCY: GHS
    ports:
      - "3003:80"
    depends_on:
      - backend
    restart: unless-stopped

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: ajumaplus-nginx
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - frontend
      - backend
    restart: unless-stopped

volumes:
  mysql_data:
```

**Create `backend/Dockerfile`:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
RUN npm run migrate
EXPOSE 3001
CMD ["npm", "start"]
```

**Create `frontend/Dockerfile`:**
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Create `frontend/nginx.conf`:**
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://backend:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Step 3: Deploy with Docker

```bash
# Build and start all services
docker-compose up -d --build

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Run database migrations
docker-compose exec backend npm run migrate
```

---

## Option 3: Home Server (Windows/Mac)

### Windows Setup

1. **Install WSL2 (Windows Subsystem for Linux)**
   ```powershell
   wsl --install
   ```

2. **Follow Linux instructions** in WSL2

3. **Port forwarding** to access from external network

### Mac Setup

1. **Install Homebrew**
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

2. **Install services**
   ```bash
   brew install node mysql nginx
   ```

3. **Follow Linux instructions** with path adjustments

---

## Backup and Maintenance

### Automated Backups

```bash
# Create backup script
sudo nano /usr/local/bin/ajumaplus-backup.sh
```

**Add this content:**
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/ajumaplus"
mkdir -p $BACKUP_DIR

# Backup MySQL
mysqldump -u ajumaplus -p'your_password' ajumaplus_crm > $BACKUP_DIR/backup_$DATE.sql

# Backup application files
tar -czf $BACKUP_DIR/app_$DATE.tar.gz /var/www/ajumaplus-crm-v5

# Keep only last 7 days
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "app_*.tar.gz" -mtime +7 -delete
```

```bash
# Make executable
sudo chmod +x /usr/local/bin/ajumaplus-backup.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add: 0 2 * * * /usr/local/bin/ajumaplus-backup.sh
```

### Monitoring

```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs ajumaplus-backend
pm2 logs ajumaplus-frontend

# Restart services
pm2 restart all

# Check disk space
df -h

# Check memory usage
free -h
```

### Updates

```bash
# Update application
cd /var/www/ajumaplus-crm-v5
git pull
cd backend && npm install
cd ../frontend && npm install && npm run build
pm2 restart all
```

---

## Cost Breakdown (Self-Hosted)

### **Hardware Costs**
- **VPS**: $0-20/month (if you don't have a server)
- **Home Server**: $0 (if you have spare hardware)
- **Domain**: $0-15/year (optional)

### **Software Costs**
- **All software**: $0 (open source)
- **SSL Certificate**: $0 (Let's Encrypt)
- **Email**: $0 (Gmail)

### **Optional AI Features**
- **OpenAI API**: $5-20/month (can be disabled)

### **Total Monthly Cost: $0** (excluding optional AI)

---

## Troubleshooting

### Common Issues

**1. Services won't start**
```bash
# Check logs
pm2 logs
# Or for Docker
docker-compose logs
```

**2. Database connection errors**
```bash
# Check MySQL status
sudo systemctl status mysql
# Test connection
mysql -u ajumaplus -p
```

**3. Port conflicts**
```bash
# Check what's using ports
sudo netstat -tulpn
# Kill process if needed
sudo kill -9 <PID>
```

**4. Nginx 502 errors**
```bash
# Check if backend is running
pm2 status
# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

---

## Security Best Practices

1. **Keep system updated**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Use strong passwords**
   - Database passwords
   - JWT secrets
   - SSH keys instead of passwords

3. **Configure firewall**
   ```bash
   sudo ufw enable
   sudo ufw status
   ```

4. **Regular backups**
   - Automated daily backups
   - Test restore procedure

5. **Monitor logs**
   - Set up log rotation
   - Monitor for suspicious activity

---

## Performance Optimization

### Enable Nginx Caching
```nginx
# Add to nginx config
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=1g inactive=60m;

location /api/ {
    proxy_cache my_cache;
    proxy_cache_valid 200 5m;
    proxy_pass http://localhost:3001;
}
```

### Database Optimization
```sql
-- Add indexes
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_category ON jobs(category);
```

### Enable Compression
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
```

---

## Support

For self-hosting issues:
- Check system logs: `/var/log/`
- Check application logs: `pm2 logs` or `docker-compose logs`
- Review this guide's troubleshooting section
- Check online documentation for each component

---

**Last Updated**: 2026-08-04
**Version**: 5.0
**Monthly Cost**: $0 (excluding optional AI features)
