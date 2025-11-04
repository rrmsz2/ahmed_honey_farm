.PHONY: help build run stop restart logs status clean backup restore

# Colors
GREEN  := \033[0;32m
YELLOW := \033[1;33m
NC     := \033[0m

help: ## عرض المساعدة
	@echo "$(GREEN)أوامر متاحة:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-15s$(NC) %s\n", $$1, $$2}'

build: ## بناء الـ Docker image
	@echo "$(GREEN)بناء الـ image...$(NC)"
	docker build -t honey-farm-app .

run: ## تشغيل التطبيق
	@echo "$(GREEN)تشغيل التطبيق...$(NC)"
	docker run -d \
	  --name honey-farm \
	  -p 3003:3003 \
	  -v honey-data:/data/db \
	  --restart unless-stopped \
	  honey-farm-app
	@echo "$(GREEN)✅ التطبيق يعمل على: http://localhost:3003$(NC)"

stop: ## إيقاف التطبيق
	@echo "$(YELLOW)إيقاف التطبيق...$(NC)"
	docker stop honey-farm

start: ## تشغيل container موجود
	@echo "$(GREEN)تشغيل container...$(NC)"
	docker start honey-farm

restart: ## إعادة تشغيل التطبيق
	@echo "$(YELLOW)إعادة تشغيل...$(NC)"
	docker restart honey-farm

logs: ## عرض الـ logs
	docker logs -f honey-farm

status: ## عرض حالة الخدمات
	@echo "$(GREEN)حالة Container:$(NC)"
	@docker ps | grep honey-farm || echo "Container غير مشغل"
	@echo ""
	@echo "$(GREEN)حالة الخدمات الداخلية:$(NC)"
	@docker exec honey-farm supervisorctl status 2>/dev/null || echo "لا يمكن الوصول للخدمات"

shell: ## الدخول للـ container
	docker exec -it honey-farm bash

clean: ## حذف container و image
	@echo "$(YELLOW)حذف container و image...$(NC)"
	docker stop honey-farm 2>/dev/null || true
	docker rm honey-farm 2>/dev/null || true
	docker rmi honey-farm-app 2>/dev/null || true
	@echo "$(GREEN)✅ تم التنظيف$(NC)"

backup: ## نسخ احتياطي للبيانات
	@echo "$(GREEN)إنشاء نسخة احتياطية...$(NC)"
	@mkdir -p backups
	docker exec honey-farm mongodump --out /tmp/backup
	docker cp honey-farm:/tmp/backup ./backups/backup-$$(date +%Y%m%d-%H%M%S)
	@echo "$(GREEN)✅ تم حفظ النسخة الاحتياطية في: backups/$(NC)"

restore: ## استعادة آخر نسخة احتياطية
	@echo "$(YELLOW)استعادة النسخة الاحتياطية...$(NC)"
	@LATEST=$$(ls -t backups/ | head -1); \
	if [ -z "$$LATEST" ]; then \
		echo "$(YELLOW)لا توجد نسخ احتياطية!$(NC)"; \
		exit 1; \
	fi; \
	docker cp backups/$$LATEST honey-farm:/tmp/restore && \
	docker exec honey-farm mongorestore /tmp/restore && \
	echo "$(GREEN)✅ تم استعادة النسخة: $$LATEST$(NC)"

quick: build run ## بناء وتشغيل سريع
	@echo "$(GREEN)========================================$(NC)"
	@echo "$(GREEN)✅ التطبيق جاهز!$(NC)"
	@echo "$(GREEN)========================================$(NC)"

rebuild: stop clean build run ## إعادة بناء كاملة

# Docker Compose commands
up: ## تشغيل باستخدام docker-compose
	docker-compose up -d

down: ## إيقاف docker-compose
	docker-compose down

compose-logs: ## logs من docker-compose
	docker-compose logs -f
