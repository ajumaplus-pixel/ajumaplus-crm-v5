#!/bin/bash

# AjumaPlus CRM Docker Backup Script
# This script creates backups for Docker deployments

# Configuration
BACKUP_DIR="/var/backups/ajumaplus"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=7

# Docker Configuration
MYSQL_CONTAINER="ajumaplus-mysql"
MYSQL_USER="ajumaplus"
MYSQL_PASSWORD="ajumaplus_password"
MYSQL_DATABASE="ajumaplus_crm"

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
APP_DIR="$(dirname "$SCRIPT_DIR")"

# Create backup directory
mkdir -p "$BACKUP_DIR"

echo "Starting Docker backup at $(date)"
echo "Application directory: $APP_DIR"

# 1. Database Backup from Docker container
echo "Backing up MySQL database from Docker..."
docker exec "$MYSQL_CONTAINER" mysqldump -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" \
    "$MYSQL_DATABASE" > "$BACKUP_DIR/database_$DATE.sql"

if [ $? -eq 0 ]; then
    echo "✅ Database backup successful: database_$DATE.sql"
else
    echo "❌ Database backup failed"
    exit 1
fi

# 2. Docker Volume Backup
echo "Backing up Docker volumes..."
docker run --rm -v mysql_data:/data -v "$BACKUP_DIR":/backup \
    alpine tar -czf /backup/mysql_volume_$DATE.tar.gz -C /data .

if [ $? -eq 0 ]; then
    echo "✅ Docker volume backup successful: mysql_volume_$DATE.tar.gz"
else
    echo "❌ Docker volume backup failed"
fi

# 3. Application Files Backup
echo "Backing up application files..."
cd "$APP_DIR"
tar -czf "$BACKUP_DIR/app_files_$DATE.tar.gz" \
    backend/src \
    frontend/src \
    backend/uploads \
    backend/package.json \
    frontend/package.json \
    docker-compose.yml \
    2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Application files backup successful: app_files_$DATE.tar.gz"
else
    echo "❌ Application files backup failed"
fi

# 3. Docker Compose Backup
echo "Backing up Docker Compose configuration..."
cp docker-compose.yml "$BACKUP_DIR/docker-compose_$DATE.yml"

# 4. Clean old backups
echo "Cleaning old backups (keeping last $RETENTION_DAYS days)..."
find "$BACKUP_DIR" -name "database_*.sql" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "app_files_*.tar.gz" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "docker-compose_*.yml" -mtime +$RETENTION_DAYS -delete

echo "✅ Old backups cleaned"

# 5. Create backup summary
echo "Backup Summary:" > "$BACKUP_DIR/backup_summary_$DATE.txt"
echo "Date: $(date)" >> "$BACKUP_DIR/backup_summary_$DATE.txt"
echo "Database: database_$DATE.sql" >> "$BACKUP_DIR/backup_summary_$DATE.txt"
echo "App Files: app_files_$DATE.tar.gz" >> "$BACKUP_DIR/backup_summary_$DATE.txt"
echo "Docker Compose: docker-compose_$DATE.yml" >> "$BACKUP_DIR/backup_summary_$DATE.txt"
echo "Total Size: $(du -sh $BACKUP_DIR | cut -f1)" >> "$BACKUP_DIR/backup_summary_$DATE.txt"

echo "✅ Docker backup completed successfully at $(date)"
echo "Backup location: $BACKUP_DIR"
