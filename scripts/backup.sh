#!/bin/bash

# AjumaPlus CRM Backup Script
# This script creates automated backups of database and application files

# Configuration
BACKUP_DIR="/var/backups/ajumaplus"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=7

# MySQL Configuration
MYSQL_HOST="localhost"
MYSQL_PORT="3306"
MYSQL_USER="ajumaplus"
MYSQL_PASSWORD="ajumaplus_password"
MYSQL_DATABASE="ajumaplus_crm"

# Application Directory
APP_DIR="/var/www/ajumaplus-crm-v5"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "Starting backup at $(date)"

# 1. Database Backup
echo "Backing up MySQL database..."
mysqldump -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" \
    "$MYSQL_DATABASE" > "$BACKUP_DIR/database_$DATE.sql"

if [ $? -eq 0 ]; then
    echo "✅ Database backup successful: database_$DATE.sql"
else
    echo "❌ Database backup failed"
    exit 1
fi

# 2. Application Files Backup
echo "Backing up application files..."
tar -czf "$BACKUP_DIR/app_files_$DATE.tar.gz" \
    "$APP_DIR/backend/src" \
    "$APP_DIR/frontend/src" \
    "$APP_DIR/backend/uploads" \
    "$APP_DIR/backend/package.json" \
    "$APP_DIR/frontend/package.json" \
    2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Application files backup successful: app_files_$DATE.tar.gz"
else
    echo "❌ Application files backup failed"
    exit 1
fi

# 3. Environment Variables Backup
echo "Backing up environment variables..."
cp "$APP_DIR/backend/.env" "$BACKUP_DIR/env_backend_$DATE" 2>/dev/null
cp "$APP_DIR/frontend/.env.production" "$BACKUP_DIR/env_frontend_$DATE" 2>/dev/null

echo "✅ Environment variables backed up"

# 4. Clean old backups (keep only last RETENTION_DAYS)
echo "Cleaning old backups (keeping last $RETENTION_DAYS days)..."
find "$BACKUP_DIR" -name "database_*.sql" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "app_files_*.tar.gz" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "env_*" -mtime +$RETENTION_DAYS -delete

echo "✅ Old backups cleaned"

# 5. Create backup summary
echo "Backup Summary:" > "$BACKUP_DIR/backup_summary_$DATE.txt"
echo "Date: $(date)" >> "$BACKUP_DIR/backup_summary_$DATE.txt"
echo "Database: database_$DATE.sql" >> "$BACKUP_DIR/backup_summary_$DATE.txt"
echo "App Files: app_files_$DATE.tar.gz" >> "$BACKUP_DIR/backup_summary_$DATE.txt"
echo "Environment: env_backend_$DATE, env_frontend_$DATE" >> "$BACKUP_DIR/backup_summary_$DATE.txt"
echo "Total Size: $(du -sh $BACKUP_DIR | cut -f1)" >> "$BACKUP_DIR/backup_summary_$DATE.txt"

echo "✅ Backup completed successfully at $(date)"
echo "Backup location: $BACKUP_DIR"
echo "Summary: $BACKUP_DIR/backup_summary_$DATE.txt"
