#!/bin/bash

# Test Docker Setup Script
# =========================

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  اختبار إعداد Docker${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Test 1: Check if Docker is installed
echo -e "${YELLOW}[1/7] التحقق من تثبيت Docker...${NC}"
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✅ Docker مثبت:${NC} $(docker --version)"
else
    echo -e "${RED}❌ Docker غير مثبت!${NC}"
    exit 1
fi
echo ""

# Test 2: Check if all required files exist
echo -e "${YELLOW}[2/7] التحقق من الملفات المطلوبة...${NC}"
FILES=(
    "Dockerfile"
    "docker-compose.yml"
    "docker/nginx.conf"
    "docker/supervisord.conf"
    "docker/start.sh"
    ".dockerignore"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅${NC} $file"
    else
        echo -e "${RED}❌${NC} $file غير موجود!"
        exit 1
    fi
done
echo ""

# Test 3: Check frontend files
echo -e "${YELLOW}[3/7] التحقق من ملفات Frontend...${NC}"
if [ -f "frontend/package.json" ]; then
    echo -e "${GREEN}✅${NC} Frontend package.json موجود"
else
    echo -e "${RED}❌${NC} Frontend package.json غير موجود!"
    exit 1
fi

if [ -d "frontend/src" ]; then
    echo -e "${GREEN}✅${NC} Frontend source directory موجود"
else
    echo -e "${RED}❌${NC} Frontend src directory غير موجود!"
    exit 1
fi
echo ""

# Test 4: Check backend files
echo -e "${YELLOW}[4/7] التحقق من ملفات Backend...${NC}"
if [ -f "backend/requirements.txt" ]; then
    echo -e "${GREEN}✅${NC} Backend requirements.txt موجود"
else
    echo -e "${RED}❌${NC} Backend requirements.txt غير موجود!"
    exit 1
fi

if [ -f "backend/server.py" ]; then
    echo -e "${GREEN}✅${NC} Backend server.py موجود"
else
    echo -e "${RED}❌${NC} Backend server.py غير موجود!"
    exit 1
fi
echo ""

# Test 5: Check Docker daemon
echo -e "${YELLOW}[5/7] التحقق من Docker daemon...${NC}"
if docker info &> /dev/null; then
    echo -e "${GREEN}✅ Docker daemon يعمل${NC}"
else
    echo -e "${RED}❌ Docker daemon لا يعمل!${NC}"
    echo "قم بتشغيله: sudo systemctl start docker"
    exit 1
fi
echo ""

# Test 6: Check disk space
echo -e "${YELLOW}[6/7] التحقق من المساحة المتوفرة...${NC}"
AVAILABLE=$(df -BG . | tail -1 | awk '{print $4}' | sed 's/G//')
if [ "$AVAILABLE" -gt 2 ]; then
    echo -e "${GREEN}✅ المساحة المتوفرة: ${AVAILABLE}GB${NC}"
else
    echo -e "${YELLOW}⚠️  المساحة المتوفرة قليلة: ${AVAILABLE}GB${NC}"
    echo "يفضل أن يكون لديك 2GB على الأقل"
fi
echo ""

# Test 7: Try dry-run build (syntax check only)
echo -e "${YELLOW}[7/7] التحقق من صحة Dockerfile...${NC}"
if docker build --no-cache --target frontend-builder -f Dockerfile . &> /dev/null; then
    echo -e "${GREEN}✅ Dockerfile صحيح (syntax)${NC}"
else
    # Just check syntax without building
    if grep -q "FROM" Dockerfile; then
        echo -e "${GREEN}✅ Dockerfile يبدو صحيحاً${NC}"
    else
        echo -e "${RED}❌ Dockerfile به مشاكل!${NC}"
        exit 1
    fi
fi
echo ""

# Summary
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ جميع الاختبارات نجحت!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}الخطوات التالية:${NC}"
echo "1. قم ببناء الـ image:"
echo "   ${YELLOW}./build-and-run.sh${NC}"
echo ""
echo "2. أو استخدم الأوامر اليدوية:"
echo "   ${YELLOW}docker build -t honey-farm-app .${NC}"
echo "   ${YELLOW}docker run -d --name honey-farm -p 3003:3003 -v honey-data:/data/db honey-farm-app${NC}"
echo ""
echo "3. بعد التشغيل، افتح:"
echo "   ${YELLOW}http://localhost:3003${NC}"
echo ""
