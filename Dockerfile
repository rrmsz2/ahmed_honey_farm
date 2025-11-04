# Multi-stage Dockerfile for Full Stack App
# Stage 1: Build Frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend files
COPY frontend/package.json frontend/yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy frontend source
COPY frontend/ .

# Build frontend
RUN yarn build

# Stage 2: Final Image with Everything
FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    nginx \
    supervisor \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install MongoDB
RUN wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | apt-key add - && \
    echo "deb http://repo.mongodb.org/apt/debian bullseye/mongodb-org/7.0 main" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list && \
    apt-get update && \
    apt-get install -y mongodb-org && \
    rm -rf /var/lib/apt/lists/*

# Create directories
RUN mkdir -p /app/backend /app/frontend /data/db /var/log/supervisor /var/log/mongodb

# Copy backend files
WORKDIR /app/backend
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

# Copy built frontend from previous stage
COPY --from=frontend-builder /app/frontend/build /app/frontend/build

# Copy nginx configuration
COPY docker/nginx.conf /etc/nginx/sites-available/default

# Copy supervisor configuration
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Copy startup script
COPY docker/start.sh /start.sh
RUN chmod +x /start.sh

# Create .env files for Docker
RUN echo 'MONGO_URL=mongodb://localhost:27017' > /app/backend/.env && \
    echo 'DB_NAME=honey_farm_db' >> /app/backend/.env && \
    echo 'CORS_ORIGINS=*' >> /app/backend/.env

# Expose port 3003
EXPOSE 3003

# Set working directory
WORKDIR /app

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3003/ || exit 1

# Start services
CMD ["/start.sh"]