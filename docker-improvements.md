# Docker and Infrastructure Improvement Plan

## Current Issues

1. **Hardcoded secrets in docker-compose.yml**:
   - Database credentials, API keys, and JWT secrets are hardcoded
   - No proper secrets management strategy

2. **Inefficient Docker builds**:
   - No multi-stage builds for optimized images
   - Large image sizes due to unnecessary dependencies

3. **Incomplete prometheus configuration**:
   - Prometheus is included but not fully configured
   - Missing proper metrics collection from services

4. **Missing development vs production environments**:
   - No clear separation of development and production configurations
   - Single docker-compose file for all environments

## Implementation Plan

### 1. Implement .env Files for Docker Compose

Create proper environment files for different environments:

#### .env.example
```
# Database Configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=biz_manage_pro
POSTGRES_PORT=5432

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379

# API Configuration
API_PORT=8000
API_DEBUG=False
API_ENV=production

# Frontend Configuration
FRONTEND_PORT=5173
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000

# JWT Configuration
JWT_SECRET_KEY=your-secret-jwt-key
SESSION_SECRET_KEY=your-secret-session-key

# Monitoring
PROMETHEUS_PORT=9090
GRAFANA_PORT=3000

# pgAdmin
PGADMIN_PORT=5050
PGADMIN_EMAIL=admin@example.com
PGADMIN_PASSWORD=admin
```

Update docker-compose.yml to use environment variables:

```yaml
version: '3.8'

services:
  # Backend service
  backend:
    build: 
      context: ./backend
      dockerfile: Dockerfile
    container_name: biz_manage_pro_backend
    restart: unless-stopped
    ports:
      - "${API_PORT}:8000"
    environment:
      - APP_ENV=${API_ENV}
      - DEBUG=${API_DEBUG}
      - DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}
      - REDIS_HOST=${REDIS_HOST}
      - REDIS_PORT=${REDIS_PORT}
      - JWT_SECRET_KEY=${JWT_SECRET_KEY}
      - SESSION_SECRET_KEY=${SESSION_SECRET_KEY}
      - ALLOWED_ORIGINS=${FRONTEND_ORIGINS}
    volumes:
      - ./backend:/app
      - backend-logs:/app/logs
      - backend-uploads:/app/uploads
      - backend-backups:/app/backups
    depends_on:
      - db
      - redis
    networks:
      - biz_manage_pro_network

  # Frontend service
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: biz_manage_pro_frontend
    restart: unless-stopped
    ports:
      - "${FRONTEND_PORT}:5173"
    environment:
      - VITE_API_URL=${VITE_API_URL}
      - VITE_WS_URL=${VITE_WS_URL}
    volumes:
      - ./frontend:/app
      - /app/node_modules
    depends_on:
      - backend
    networks:
      - biz_manage_pro_network
```

### 2. Implement Multi-Stage Docker Builds

#### Backend Dockerfile (backend/Dockerfile)

```Dockerfile
# Build stage
FROM python:3.12-slim AS builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip wheel --no-cache-dir --no-deps --wheel-dir /app/wheels -r requirements.txt

# Final stage
FROM python:3.12-slim

WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Copy wheels from builder stage
COPY --from=builder /app/wheels /wheels
RUN pip install --no-cache /wheels/*

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p logs uploads backups

# Expose the application port
EXPOSE 8000

# Command to run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### Frontend Dockerfile (frontend/Dockerfile)

```Dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Command to run NGINX
CMD ["nginx", "-g", "daemon off;"]
```

### 3. Create Docker Compose Files for Different Environments

#### docker-compose.yml (Base configuration)

```yaml
version: '3.8'

services:
  # Base service definitions with shared configuration
  backend:
    build: 
      context: ./backend
      dockerfile: Dockerfile
    volumes:
      - backend-logs:/app/logs
      - backend-uploads:/app/uploads
      - backend-backups:/app/backups
    networks:
      - biz_manage_pro_network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    networks:
      - biz_manage_pro_network

  db:
    image: postgres:14-alpine
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - biz_manage_pro_network

  redis:
    image: redis:6-alpine
    volumes:
      - redis-data:/data
    networks:
      - biz_manage_pro_network

volumes:
  postgres-data:
  redis-data:
  backend-logs:
  backend-uploads:
  backend-backups:

networks:
  biz_manage_pro_network:
    driver: bridge
```

#### docker-compose.dev.yml (Development overrides)

```yaml
version: '3.8'

services:
  backend:
    container_name: biz_manage_pro_backend_dev
    build:
      target: development
    ports:
      - "${API_PORT}:8000"
    environment:
      - APP_ENV=development
      - DEBUG=True
      - DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}
      - REDIS_HOST=${REDIS_HOST}
      - REDIS_PORT=${REDIS_PORT}
      - JWT_SECRET_KEY=${JWT_SECRET_KEY}
      - SESSION_SECRET_KEY=${SESSION_SECRET_KEY}
      - ALLOWED_ORIGINS=http://localhost:${FRONTEND_PORT}
    volumes:
      - ./backend:/app
    command: uvicorn main:app --reload --host 0.0.0.0 --port 8000

  frontend:
    container_name: biz_manage_pro_frontend_dev
    ports:
      - "${FRONTEND_PORT}:5173"
    environment:
      - VITE_API_URL=http://localhost:${API_PORT}
      - VITE_WS_URL=ws://localhost:${API_PORT}
    volumes:
      - ./frontend:/app
      - /app/node_modules
    command: npm run dev

  db:
    container_name: biz_manage_pro_db_dev
    ports:
      - "${POSTGRES_PORT}:5432"
    environment:
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=${POSTGRES_DB}

  redis:
    container_name: biz_manage_pro_redis_dev
    ports:
      - "${REDIS_PORT}:6379"

  # Development-only services
  pgadmin:
    image: dpage/pgadmin4
    container_name: biz_manage_pro_pgadmin_dev
    ports:
      - "${PGADMIN_PORT}:80"
    environment:
      - PGADMIN_DEFAULT_EMAIL=${PGADMIN_EMAIL}
      - PGADMIN_DEFAULT_PASSWORD=${PGADMIN_PASSWORD}
    volumes:
      - pgadmin-data:/var/lib/pgadmin
    networks:
      - biz_manage_pro_network

volumes:
  pgadmin-data:
```

#### docker-compose.prod.yml (Production overrides)

```yaml
version: '3.8'

services:
  backend:
    container_name: biz_manage_pro_backend_prod
    restart: always
    ports:
      - "${API_PORT}:8000"
    environment:
      - APP_ENV=production
      - DEBUG=False
      - DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}
      - REDIS_HOST=${REDIS_HOST}
      - REDIS_PORT=${REDIS_PORT}
      - JWT_SECRET_KEY=${JWT_SECRET_KEY}
      - SESSION_SECRET_KEY=${SESSION_SECRET_KEY}
      - ALLOWED_ORIGINS=${FRONTEND_ORIGINS}
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G

  frontend:
    container_name: biz_manage_pro_frontend_prod
    restart: always
    ports:
      - "80:80"
    environment:
      - VITE_API_URL=${VITE_API_URL}
      - VITE_WS_URL=${VITE_WS_URL}
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M

  db:
    container_name: biz_manage_pro_db_prod
    restart: always
    environment:
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=${POSTGRES_DB}
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G

  redis:
    container_name: biz_manage_pro_redis_prod
    restart: always
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M

  # Production monitoring services
  prometheus:
    image: prom/prometheus
    container_name: biz_manage_pro_prometheus_prod
    restart: always
    ports:
      - "${PROMETHEUS_PORT}:9090"
    volumes:
      - ./prometheus:/etc/prometheus
      - prometheus-data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
    networks:
      - biz_manage_pro_network
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M

  grafana:
    image: grafana/grafana
    container_name: biz_manage_pro_grafana_prod
    restart: always
    ports:
      - "${GRAFANA_PORT}:3000"
    volumes:
      - grafana-data:/var/lib/grafana
    depends_on:
      - prometheus
    networks:
      - biz_manage_pro_network
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M

volumes:
  prometheus-data:
  grafana-data:
```

### 4. Configure Prometheus Properly

Create a proper prometheus configuration file:

#### ./prometheus/prometheus.yml

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'backend'
    metrics_path: '/metrics'
    static_configs:
      - targets: ['backend:8000']

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']

  - job_name: 'cadvisor'
    static_configs:
      - targets: ['cadvisor:8080']
```

Add container monitoring tools to docker-compose.prod.yml:

```yaml
# Add to docker-compose.prod.yml
services:
  # ... existing services

  # Container monitoring
  node-exporter:
    image: prom/node-exporter
    container_name: biz_manage_pro_node_exporter
    restart: always
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - '--path.procfs=/host/proc'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.ignored-mount-points=^/(sys|proc|dev|host|etc)($$|/)'
    networks:
      - biz_manage_pro_network

  cadvisor:
    image: gcr.io/cadvisor/cadvisor
    container_name: biz_manage_pro_cadvisor
    restart: always
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:ro
      - /sys:/sys:ro
      - /var/lib/docker/:/var/lib/docker:ro
      - /dev/disk/:/dev/disk:ro
    networks:
      - biz_manage_pro_network
```

### 5. Create a Database Backup Solution

Add a database backup service to docker-compose.prod.yml:

```yaml
# Add to docker-compose.prod.yml
services:
  # ... existing services

  # Database backup
  db-backup:
    image: postgres:14-alpine
    container_name: biz_manage_pro_db_backup
    restart: always
    volumes:
      - ./backup:/backup
    environment:
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=${POSTGRES_DB}
      - BACKUP_SCHEDULE=${BACKUP_SCHEDULE}
    command: >
      /bin/sh -c "
        while true; do
          date=$(date +\"%Y-%m-%d_%H-%M\");
          pg_dump -h db -U ${POSTGRES_USER} ${POSTGRES_DB} | gzip > /backup/db_backup_$$date.sql.gz;
          find /backup -name \"*.sql.gz\" -type f -mtime +7 -delete;
          sleep 86400;
        done
      "
    networks:
      - biz_manage_pro_network
```

### 6. Create Docker Deployment Scripts

#### Start development environment (start-dev.sh)

```bash
#!/bin/bash
set -e

# Load environment variables
if [ ! -f .env ]; then
  echo "Error: .env file not found!"
  echo "Please create an .env file based on .env.example"
  exit 1
fi

# Export all variables from .env
export $(grep -v '^#' .env | xargs)

# Start development environment
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

echo "Development environment started successfully!"
echo "Backend API: http://localhost:${API_PORT}"
echo "Frontend: http://localhost:${FRONTEND_PORT}"
echo "pgAdmin: http://localhost:${PGADMIN_PORT}"
```

#### Start production environment (start-prod.sh)

```bash
#!/bin/bash
set -e

# Load environment variables
if [ ! -f .env.prod ]; then
  echo "Error: .env.prod file not found!"
  echo "Please create an .env.prod file based on .env.example"
  exit 1
fi

# Export all variables from .env.prod
export $(grep -v '^#' .env.prod | xargs)

# Start production environment
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

echo "Production environment started successfully!"
echo "Backend API: http://localhost:${API_PORT}"
echo "Frontend: http://localhost:80"
echo "Prometheus: http://localhost:${PROMETHEUS_PORT}"
echo "Grafana: http://localhost:${GRAFANA_PORT}"
```

### 7. Create Grafana Dashboards

Create a dashboard configuration for Grafana:

#### ./grafana/provisioning/dashboards/dashboard.yml

```yaml
apiVersion: 1

providers:
  - name: 'Default'
    orgId: 1
    folder: ''
    type: file
    disableDeletion: false
    updateIntervalSeconds: 30
    options:
      path: /var/lib/grafana/dashboards
```

#### ./grafana/dashboards/system_metrics.json

```json
{
  "annotations": {
    "list": []
  },
  "editable": true,
  "gnetId": null,
  "graphTooltip": 0,
  "id": 1,
  "links": [],
  "panels": [
    {
      "aliasColors": {},
      "bars": false,
      "dashLength": 10,
      "dashes": false,
      "datasource": "Prometheus",
      "fieldConfig": {
        "defaults": {},
        "overrides": []
      },
      "fill": 1,
      "fillGradient": 0,
      "gridPos": {
        "h": 8,
        "w": 12,
        "x": 0,
        "y": 0
      },
      "hiddenSeries": false,
      "id": 2,
      "legend": {
        "avg": false,
        "current": false,
        "max": false,
        "min": false,
        "show": true,
        "total": false,
        "values": false
      },
      "lines": true,
      "linewidth": 1,
      "nullPointMode": "null",
      "options": {
        "alertThreshold": true
      },
      "percentage": false,
      "pluginVersion": "7.5.7",
      "pointradius": 2,
      "points": false,
      "renderer": "flot",
      "seriesOverrides": [],
      "spaceLength": 10,
      "stack": false,
      "steppedLine": false,
      "targets": [
        {
          "expr": "sum by (container_name) (rate(container_cpu_usage_seconds_total{container_name!=\"\"}[1m]))",
          "interval": "",
          "legendFormat": "{{container_name}}",
          "refId": "A"
        }
      ],
      "thresholds": [],
      "timeFrom": null,
      "timeRegions": [],
      "timeShift": null,
      "title": "CPU Usage",
      "tooltip": {
        "shared": true,
        "sort": 0,
        "value_type": "individual"
      },
      "type": "graph",
      "xaxis": {
        "buckets": null,
        "mode": "time",
        "name": null,
        "show": true,
        "values": []
      },
      "yaxes": [
        {
          "format": "short",
          "label": null,
          "logBase": 1,
          "max": null,
          "min": null,
          "show": true
        },
        {
          "format": "short",
          "label": null,
          "logBase": 1,
          "max": null,
          "min": null,
          "show": true
        }
      ],
      "yaxis": {
        "align": false,
        "alignLevel": null
      }
    },
    {
      "aliasColors": {},
      "bars": false,
      "dashLength": 10,
      "dashes": false,
      "datasource": "Prometheus",
      "fieldConfig": {
        "defaults": {},
        "overrides": []
      },
      "fill": 1,
      "fillGradient": 0,
      "gridPos": {
        "h": 8,
        "w": 12,
        "x": 12,
        "y": 0
      },
      "hiddenSeries": false,
      "id": 4,
      "legend": {
        "avg": false,
        "current": false,
        "max": false,
        "min": false,
        "show": true,
        "total": false,
        "values": false
      },
      "lines": true,
      "linewidth": 1,
      "nullPointMode": "null",
      "options": {
        "alertThreshold": true
      },
      "percentage": false,
      "pluginVersion": "7.5.7",
      "pointradius": 2,
      "points": false,
      "renderer": "flot",
      "seriesOverrides": [],
      "spaceLength": 10,
      "stack": false,
      "steppedLine": false,
      "targets": [
        {
          "expr": "sum by (container_name) (container_memory_usage_bytes{container_name!=\"\"})",
          "interval": "",
          "legendFormat": "{{container_name}}",
          "refId": "A"
        }
      ],
      "thresholds": [],
      "timeFrom": null,
      "timeRegions": [],
      "timeShift": null,
      "title": "Memory Usage",
      "tooltip": {
        "shared": true,
        "sort": 0,
        "value_type": "individual"
      },
      "type": "graph",
      "xaxis": {
        "buckets": null,
        "mode": "time",
        "name": null,
        "show": true,
        "values": []
      },
      "yaxes": [
        {
          "format": "bytes",
          "label": null,
          "logBase": 1,
          "max": null,
          "min": null,
          "show": true
        },
        {
          "format": "short",
          "label": null,
          "logBase": 1,
          "max": null,
          "min": null,
          "show": true
        }
      ],
      "yaxis": {
        "align": false,
        "alignLevel": null
      }
    }
  ],
  "refresh": "10s",
  "schemaVersion": 27,
  "style": "dark",
  "tags": [],
  "templating": {
    "list": []
  },
  "time": {
    "from": "now-1h",
    "to": "now"
  },
  "timepicker": {},
  "timezone": "",
  "title": "System Metrics",
  "uid": "system-metrics",
  "version": 1
}
```

### 8. Nginx Configuration for Production

Create a proper nginx configuration for production:

#### ./nginx/nginx.conf

```nginx
server {
    listen 80;
    server_name _;  # Replace with your domain in production

    # Frontend static files
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 30d;
            add_header Cache-Control "public, no-transform";
        }
    }

    # API proxy
    location /api/ {
        proxy_pass http://backend:8000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket proxy
    location /ws/ {
        proxy_pass http://backend:8000/ws/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 86400;  # Timeout for WebSocket connections
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self' ws: wss:;" always;
}
```

## Implementation Steps

1. Create environment files (.env, .env.prod) from .env.example
2. Update Docker Compose files to use environment variables
3. Implement multi-stage Docker builds for both backend and frontend
4. Set up separate Docker Compose files for development and production
5. Configure Prometheus with proper targets for monitoring
6. Set up a database backup service
7. Create deployment scripts for different environments
8. Create Grafana dashboards for monitoring
9. Configure Nginx for production

## Benefits

1. **Improved Security**:
   - No hardcoded secrets in Docker Compose files
   - Proper secrets management through environment variables
   - Enhanced security headers in Nginx

2. **Better Resource Utilization**:
   - Smaller Docker images with multi-stage builds
   - Resource limits for production containers
   - Optimized configurations for different environments

3. **Enhanced Monitoring**:
   - Proper Prometheus metrics collection
   - Comprehensive Grafana dashboards
   - Container-level monitoring with cAdvisor

4. **Easier Deployment**:
   - Simplified deployment with environment-specific scripts
   - Clear separation of development and production environments
   - Automated database backups

5. **Improved Reliability**:
   - Better error handling and restart policies
   - Proper logging configurations
   - Enhanced proxy settings for WebSockets 