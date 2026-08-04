#!/bin/bash

# AjumaPlus CRM Restore Script
# This script restores backups created by backup.sh

# Configuration
BACKUP_DIR="/var/backups/ajumaplus"

# MySQL Configuration
MYSQL_HOST="localhost"
MYSQL_PORT="3306"
MYSQL_USER="ajumaplus"
MYSQL_PASSWORD="ajumaplus_password"
MYSQL_DATABASE="ajumaplus_crm"

# Application Directory
APP_DIR="/var/www/ajumaplus-crm-v5"

# Check if backup directory exists
if [ ! -d "$BACKUP_DIR" ]; then
    echo "❌ Backup directory not found: $BACKUP_DIR"
    exit 1
fi

# List available backups
echo "Available backups:"
ls -lh "$BACKUP_DIR" | grep -E "(database_|app_files_)" | awk '{print $9, $5}'

# Ask user which backup to restore
echo ""
read -p "Enter the backup date (format: YYYYMMDD_HHMMSS): " BACKUP_DATE

if [ -z "$BACKUP_DATE" ]; then
    echo "❌ No backup date provided"
    exit 1
fi

DB_BACKUP="$BACKUP_DIR/database_$BACKUP_DATE.sql"
APP_BACKUP="$BACKUP_DIR/app_files_$BACKUP_DATE.tar.gz"

# Check if backup files exist
if [ ! -f "$DB_BACKUP" ]; then
    echo "❌ Database backup not found: $DB_BACKUP"
    exit 1
fi

if [ ! -f "$APP_BACKUP" ]; then
    echo "❌ Application backup not found: $APP_BACKUP"
    exit 1
fi

# Confirm restore
echo ""
echo "You are about to restore from: $BACKUP_DATE"
echo "This will:"
echo "  - Replace the current database"
echo "  - Replace application files"
echo ""
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Restore cancelled"
    exit 0
fi

# 1. Stop services
echo "Stopping services..."
cd "$APP_DIR"
docker-compose down 2>/dev/null || pm2 stop all 2>/dev/null

# 2. Restore Database
echo "Restoring database..."
mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" \
    "$MYSQL_DATABASE" < "$DB_BACKUP"

if [ $? -eq 0 ]; then
    echo "✅ Database restored successfully"
else
    echo "❌ Database restore failed"
    exit 1
fi

# 3. Restore Application Files
echo "Restoring application files..."
tar -xzf "$APP_BACKUP" -C "$APP_DIR"

if [ $? -eq 0 ]; then
    echo "✅ Application files restored successfully"
else
    echo "❌ Application files restore failed"
    exit 1
fi

# 4. Restore Environment Variables (if available)
if [ -f "$BACKUP_DIR/env_backend_$BACKUP_DATE" ]; then
    echo "Restoring backend environment variables..."
    cp "$BACKUP_DIR/env_backend_$BACKUP_DATE" "$APP_DIR/backend/.env"
    echo "✅ Backend environment variables restored"
fi

if [ -f "$BACKUP_DIR/env_frontend_$BACKUP_DATE" ]; then
    echo "Restoring frontend environment variables..."
    cp "$BACKUP_DIR/env_frontend_$BACKUP_DATE" "$APP_DIR/frontend/.env.production"
    echo "✅ Frontend environment variables restored"
fi

# 5. Restart services
echo "Restarting services..."
cd "$APP_DIR"
docker-compose up -d 2>/dev/null || pm2 restart all 2>/dev/null

echo "✅ Restore completed successfully"
echo "Services are being restarted..."
