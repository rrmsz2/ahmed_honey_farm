#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   Ahmad Honey Farm - Starting...${NC}"
echo -e "${GREEN}========================================${NC}"

# Create necessary directories
mkdir -p /data/db /var/log/mongodb /var/log/supervisor

echo -e "${YELLOW}[1/3] Initializing MongoDB...${NC}"
# Check if MongoDB data exists
if [ ! -f /data/db/mongod.lock ]; then
    echo "First time setup - initializing MongoDB"
fi

echo -e "${YELLOW}[2/3] Preparing Backend...${NC}"
# Verify backend dependencies
cd /app/backend
python -c "import fastapi; print('FastAPI:', fastapi.__version__)" || exit 1
echo "Backend ready!"

echo -e "${YELLOW}[3/3] Starting services...${NC}"
echo "Starting MongoDB, Backend (FastAPI), and Nginx..."

# Start supervisor
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf