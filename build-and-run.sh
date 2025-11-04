#!/bin/bash

# Ahmad Honey Farm - Docker Build and Run Script
# ==============================================

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  مزرعة أحمد للعسل - بناء وتشغيل${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker غير مثبت!${NC}"
    echo "الرجاء تثبيت Docker أولاً: https://docs.docker.com/get-docker/"
    exit 1
fi

echo -e "${BLUE}🔍 التحقق من البيئة...${NC}"
docker --version

# Stop and remove old container if exists
if docker ps -a | grep -q honey-farm; then
    echo -e "${YELLOW}⏸️  إيقاف وحذف الـ container القديم...${NC}"
    docker stop honey-farm 2>/dev/null || true
    docker rm honey-farm 2>/dev/null || true
fi

# Build the Docker image
echo -e "${BLUE}🏗️  بناء الـ Docker image...${NC}"
echo "هذا قد يستغرق 5-10 دقائق في المرة الأولى..."
docker build -t honey-farm-app .

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ فشل بناء الـ image!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ تم بناء الـ image بنجاح!${NC}"
echo ""

# Run the container
echo -e "${BLUE}🚀 تشغيل الـ container...${NC}"
docker run -d \
  --name honey-farm \
  -p 3003:3003 \
  -v honey-data:/data/db \
  --restart unless-stopped \
  honey-farm-app

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ فشل تشغيل الـ container!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ تم تشغيل التطبيق بنجاح!${NC}"
echo ""

# Wait for services to start
echo -e "${YELLOW}⏳ انتظار بدء الخدمات...${NC}"
sleep 10

# Check container status
echo -e "${BLUE}📊 حالة الـ container:${NC}"
docker ps | grep honey-farm

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ التطبيق يعمل الآن!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}🌐 الروابط:${NC}"
echo "   - محلي: http://localhost:3003"
echo "   - عام: http://hony.fidanet.om (بعد إعداد Nginx)"
echo ""
echo -e "${BLUE}👤 معلومات Admin:${NC}"
echo "   - Username: admin"
echo "   - Password: admin123"
echo "   - ${RED}⚠️  غير كلمة المرور فوراً!${NC}"
echo ""
echo -e "${BLUE}📝 أوامر مفيدة:${NC}"
echo "   - عرض الـ logs:        docker logs -f honey-farm"
echo "   - إيقاف التطبيق:       docker stop honey-farm"
echo "   - تشغيل التطبيق:       docker start honey-farm"
echo "   - إعادة تشغيل:         docker restart honey-farm"
echo "   - حالة الخدمات:        docker exec honey-farm supervisorctl status"
echo ""
echo -e "${YELLOW}📖 للمزيد من المعلومات، اقرأ: DOCKER_README.md${NC}"
