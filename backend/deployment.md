# Deployment Guide for BIZ_MANAGE_PRO Backend (FastAPI)

This guide outlines the steps to deploy the BIZ_MANAGE_PRO FastAPI backend in production environments.

## Prerequisites

- Python 3.12+
- PostgreSQL 14+
- Redis 6+
- A server with at least 2GB RAM
- Nginx or similar reverse proxy
- Systemd (for service management) or Docker

## Deployment Options

### Option 1: Traditional Deployment with Gunicorn and Nginx

#### 1. Clone the repository and set up the environment

```bash
# Clone the repository
git clone https://github.com/yourusername/BIZ_MANAGE_PRO.git
cd BIZ_MANAGE_PRO/backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate

# Install production dependencies
pip install -r requirements.txt
```

#### 2. Set up environment variables

```bash
# Copy the example env file
cp .env.example .env

# Edit the .env file with production values
nano .env
```

Ensure you set the following production values:
- `SECRET_KEY`: Use a strong random key
- `JWT_SECRET_KEY`: Use a different strong random key
- `DATABASE_URL`: Your production PostgreSQL connection string
- `REDIS_URL`: Your production Redis connection string
- `MAIL_*`: Your production mail server settings
- `CORS_ORIGINS`: Your production frontend URL
- `FRONTEND_URL`: Your production frontend URL

#### 3. Set up the database

```bash
# Run migrations
alembic upgrade head
```

#### 4. Create a systemd service file

Create a file at `/etc/systemd/system/biz-manage-pro.service`:

```ini
[Unit]
Description=BIZ_MANAGE_PRO FastAPI Backend
After=network.target postgresql.service redis.service

[Service]
User=youruser
Group=yourgroup
WorkingDirectory=/path/to/BIZ_MANAGE_PRO/backend
ExecStart=/path/to/BIZ_MANAGE_PRO/backend/venv/bin/gunicorn -k uvicorn.workers.UvicornWorker -w 4 -b 127.0.0.1:5000 app:app
Restart=always
RestartSec=5
SyslogIdentifier=biz-manage-pro

[Install]
WantedBy=multi-user.target
```

#### 5. Configure Nginx as a reverse proxy

Create a file at `/etc/nginx/sites-available/biz-manage-pro`:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket support
    location /ws {
        proxy_pass http://127.0.0.1:5000/ws;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:

```bash
ln -s /etc/nginx/sites-available/biz-manage-pro /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

#### 6. Start the service

```bash
systemctl enable biz-manage-pro
systemctl start biz-manage-pro
```

### Option 2: Docker Deployment

#### 1. Create a Dockerfile in the backend directory

```dockerfile
FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose the port
EXPOSE 5000

# Command to run the application
CMD ["gunicorn", "-k", "uvicorn.workers.UvicornWorker", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
```

#### 2. Create a docker-compose.yml file

```yaml
version: '3.8'

services:
  api:
    build: ./backend
    restart: always
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/biz_manage
      - REDIS_URL=redis://redis:6379/0
      - SECRET_KEY=${SECRET_KEY}
      - JWT_SECRET_KEY=${JWT_SECRET_KEY}
      - CORS_ORIGINS=${CORS_ORIGINS}
      - MAIL_SERVER=${MAIL_SERVER}
      - MAIL_PORT=${MAIL_PORT}
      - MAIL_USERNAME=${MAIL_USERNAME}
      - MAIL_PASSWORD=${MAIL_PASSWORD}
      - MAIL_DEFAULT_SENDER=${MAIL_DEFAULT_SENDER}
      - FRONTEND_URL=${FRONTEND_URL}
    depends_on:
      - db
      - redis

  db:
    image: postgres:14
    restart: always
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_USER=postgres
      - POSTGRES_DB=biz_manage

  redis:
    image: redis:6
    restart: always
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

#### 3. Deploy with Docker Compose

```bash
# Create a .env file with production values
cp .env.example .env
nano .env

# Build and start the containers
docker-compose up -d

# Run migrations
docker-compose exec api alembic upgrade head
```

### Option 3: Kubernetes Deployment

For Kubernetes deployment, create the following YAML files:

#### deployment.yaml
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: biz-manage-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: biz-manage-api
  template:
    metadata:
      labels:
        app: biz-manage-api
    spec:
      containers:
      - name: api
        image: your-registry/biz-manage-api:latest
        ports:
        - containerPort: 5000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: biz-manage-secrets
              key: database-url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: biz-manage-secrets
              key: redis-url
        - name: SECRET_KEY
          valueFrom:
            secretKeyRef:
              name: biz-manage-secrets
              key: secret-key
        - name: JWT_SECRET_KEY
          valueFrom:
            secretKeyRef:
              name: biz-manage-secrets
              key: jwt-secret-key
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 5000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 5000
          initialDelaySeconds: 15
          periodSeconds: 5
```

#### service.yaml
```yaml
apiVersion: v1
kind: Service
metadata:
  name: biz-manage-api
spec:
  selector:
    app: biz-manage-api
  ports:
  - port: 80
    targetPort: 5000
  type: ClusterIP
```

#### ingress.yaml
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: biz-manage-api
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
  - host: api.yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: biz-manage-api
            port:
              number: 80
```

Apply the configurations:
```bash
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
kubectl apply -f ingress.yaml
```

## Production Considerations

### Performance Optimization

1. **Workers and Threads**: Adjust the number of workers based on your CPU cores:
   ```bash
   gunicorn -k uvicorn.workers.UvicornWorker -w $(nproc) -b 0.0.0.0:5000 app:app
   ```

2. **Cache Optimization**: Ensure Redis is properly configured for caching:
   ```python
   # In your .env file
   CACHE_TTL=3600  # Cache time-to-live in seconds
   ```

### Security Best Practices

1. **Use HTTPS**: Always use HTTPS in production.
2. **Secure Headers**: Enable security headers in Nginx:
   ```nginx
   add_header X-Content-Type-Options "nosniff";
   add_header X-Frame-Options "DENY";
   add_header X-XSS-Protection "1; mode=block";
   add_header Content-Security-Policy "default-src 'self'";
   add_header Referrer-Policy "strict-origin-when-cross-origin";
   ```

3. **Rate Limiting**: Configure rate limiting to prevent abuse:
   ```python
   # In your .env file
   RATELIMIT_ENABLED=True
   RATELIMIT_STORAGE_URL=redis://redis:6379/0
   RATELIMIT_DEFAULT=100 per minute
   ```

### Monitoring and Logging

1. **Health Checks**: Implement `/health` endpoint for monitoring.
2. **Logging**: Configure logging to a file and/or ELK stack.
3. **Metrics**: Integrate Prometheus for metrics collection.

### Backup and Disaster Recovery

1. **Database Backups**: Schedule regular PostgreSQL backups.
2. **Data Retention**: Implement data retention policies.
3. **Recovery Plan**: Document recovery procedures.

## Troubleshooting

### Common Issues

1. **Connection Errors**: Check database and Redis connection strings.
2. **Permission Issues**: Ensure proper file permissions for logs and uploads.
3. **Memory Issues**: Adjust worker and thread counts based on server capacity.

### Logs

Check logs for detailed error information:
```bash
journalctl -u biz-manage-pro.service
```

## Maintenance

### Updates

To update the application:
```bash
# Pull the latest code
git pull

# Activate the virtual environment
source venv/bin/activate

# Install any new dependencies
pip install -r requirements.txt

# Apply database migrations
alembic upgrade head

# Restart the service
systemctl restart biz-manage-pro
```

For Docker deployment:
```bash
# Pull the latest code
git pull

# Rebuild and restart containers
docker-compose up -d --build

# Apply database migrations
docker-compose exec api alembic upgrade head
``` 