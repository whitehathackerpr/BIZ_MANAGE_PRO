# Deployment Guide

## Overview

This guide provides detailed instructions for deploying the BIZ_MANAGE_PRO application in both development and production environments.

## Prerequisites

- Docker and Docker Compose
- Node.js 14+ (for development)
- Python 3.8+ (for development)
- PostgreSQL 12+
- Redis
- Nginx (for production)

## Development Environment

### Local Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/BIZ_MANAGE_PRO.git
cd BIZ_MANAGE_PRO
```

2. Set up environment variables:
```bash
# backend/.env
DATABASE_URL=postgresql://user:password@localhost:5432/biz_manage
JWT_SECRET_KEY=your-secret-key
REDIS_URL=redis://localhost:6379
FLASK_ENV=development
FLASK_DEBUG=1

# frontend/.env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_WS_URL=ws://localhost:5000
```

3. Start the development environment:
```bash
# Start backend
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
flask run

# Start frontend
cd frontend
npm install
npm start
```

### Docker Development

1. Build the development containers:
```bash
docker-compose -f docker-compose.dev.yml build
```

2. Start the development environment:
```bash
docker-compose -f docker-compose.dev.yml up
```

## Production Environment

### Server Requirements

- CPU: 4+ cores
- RAM: 8GB+
- Storage: 50GB+ SSD
- OS: Ubuntu 20.04 LTS or later

### Docker Production Deployment

1. Set up the production environment:
```bash
# Create production environment file
cp .env.example .env.production
# Edit .env.production with production values
```

2. Build the production containers:
```bash
docker-compose -f docker-compose.prod.yml build
```

3. Start the production environment:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Manual Production Deployment

1. Set up the server:
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y python3.8 python3.8-venv nodejs npm nginx redis-server postgresql

# Configure PostgreSQL
sudo -u postgres psql
CREATE DATABASE biz_manage;
CREATE USER biz_manage WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE biz_manage TO biz_manage;
\q
```

2. Deploy the backend:
```bash
# Clone repository
git clone https://github.com/yourusername/BIZ_MANAGE_PRO.git
cd BIZ_MANAGE_PRO/backend

# Set up virtual environment
python3.8 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with production values

# Initialize database
flask db upgrade

# Start with Gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 "app:create_app()"
```

3. Deploy the frontend:
```bash
cd ../frontend

# Install dependencies
npm install

# Build for production
npm run build

# Serve with Nginx
sudo cp nginx.conf /etc/nginx/sites-available/biz_manage
sudo ln -s /etc/nginx/sites-available/biz_manage /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Nginx Configuration

```nginx
# /etc/nginx/sites-available/biz_manage
server {
    listen 80;
    server_name your-domain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Frontend
    location / {
        root /var/www/biz_manage/frontend/build;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket
    location /socket.io {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### SSL Configuration

1. Install Certbot:
```bash
sudo apt install certbot python3-certbot-nginx
```

2. Obtain SSL certificate:
```bash
sudo certbot --nginx -d your-domain.com
```

### Monitoring and Logging

1. Set up monitoring:
```bash
# Install Prometheus
sudo apt install prometheus

# Install Node Exporter
sudo apt install prometheus-node-exporter

# Configure Prometheus
sudo nano /etc/prometheus/prometheus.yml
```

2. Set up logging:
```bash
# Configure log rotation
sudo nano /etc/logrotate.d/biz_manage
```

### Backup Strategy

1. Database backup:
```bash
# Create backup script
cat > /usr/local/bin/backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/biz_manage"
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -U biz_manage biz_manage > "$BACKUP_DIR/backup_$DATE.sql"
find $BACKUP_DIR -type f -mtime +7 -delete
EOF

# Make script executable
chmod +x /usr/local/bin/backup-db.sh

# Add to crontab
0 0 * * * /usr/local/bin/backup-db.sh
```

2. File backup:
```bash
# Create backup script
cat > /usr/local/bin/backup-files.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/biz_manage"
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf "$BACKUP_DIR/files_$DATE.tar.gz" /var/www/biz_manage
find $BACKUP_DIR -type f -mtime +7 -delete
EOF

# Make script executable
chmod +x /usr/local/bin/backup-files.sh

# Add to crontab
0 1 * * * /usr/local/bin/backup-files.sh
```

### Scaling

1. Horizontal scaling with Docker Swarm:
```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.prod.yml biz_manage
```

2. Load balancing with Nginx:
```nginx
upstream backend {
    server backend1:5000;
    server backend2:5000;
    server backend3:5000;
}
```

### Maintenance

1. Update application:
```bash
# Pull latest changes
git pull

# Rebuild containers
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

2. Database maintenance:
```bash
# Vacuum database
psql -U biz_manage -d biz_manage -c "VACUUM ANALYZE;"

# Reindex tables
psql -U biz_manage -d biz_manage -c "REINDEX TABLE sales;"
```

### Troubleshooting

1. Check logs:
```bash
# Application logs
docker-compose -f docker-compose.prod.yml logs

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Database logs
sudo tail -f /var/log/postgresql/postgresql-*.log
```

2. Common issues:
- Database connection issues: Check PostgreSQL logs and connection string
- SSL certificate issues: Check Certbot logs and certificate expiration
- Performance issues: Check application logs and database indexes 