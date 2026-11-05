# النشر على خوادم فدى نت

يتبع النشر نمط مهارتَي `fidanet-deploy-skills`، وهو نفس نمط `khutbah-translator`:

```
الإنترنت ──► Caddy (fidanet-caddy-1 على 10.10.70.15، يصدر شهادة TLS)
               └─► reverse_proxy 10.10.70.20:8095
                     └─► honey-farm-web-1 (nginx) ──/api──► honey-farm-backend-1 ──► honey-farm-mongo-1
```

| العنصر | القيمة |
|---|---|
| الخادم | Apps VM `10.10.70.20` |
| مجلد التطبيق | `/opt/honey-farm` (ملف `.env` يوضع هنا يدوياً) |
| مجلد الـ runner | `/opt/actions-runner-honey-farm` |
| وسم الـ runner | `honey-farm-prod` (خاص بهذا التطبيق فقط) |
| المنفذ المنشور | `8095` (يتغير عبر `HOST_PORT` في `.env`) |
| مشروع compose | `honey-farm` |

> قبل البدء: تأكد أن المنفذ `8095` غير مستخدم على Apps VM (`ss -tlnp | grep 8095`). الأسماء `honey-farm*` لا تتعارض مع أي تطبيق آخر.

---

## الإعداد لأول مرة (مرة واحدة فقط)

نفّذ الخطوات من جهاز داخل الشبكة المحلية (LAN):
```bash
export SSHPASS='<كلمة مرور الخادم>'
APPS="sshpass -e ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null root@10.10.70.20"
CORE="sshpass -e ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null root@10.10.70.15"
```

### 1) ملف `.env` على Apps VM
```bash
$APPS "mkdir -p /opt/honey-farm && cat > /opt/honey-farm/.env && chmod 600 /opt/honey-farm/.env" <<EOF
ENVIRONMENT=production
DB_NAME=honey_farm
JWT_SECRET=$(openssl rand -hex 32)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=<كلمة مرور قوية للمشرف>
WHATSAPP_API_KEY=<مفتاح TextMeBot الجديد>
ADMIN_PHONE=+968XXXXXXXX
WHATSAPP_DRY_RUN=false
SEED_SAMPLE_DATA=true
HOST_PORT=8095
EOF
```

### 2) تسجيل الـ self-hosted runner على Apps VM
```bash
REG_TOKEN=$(gh api -X POST repos/rrmsz2/ahmed_honey_farm/actions/runners/registration-token --jq .token)
$APPS "set -e
  mkdir -p /opt/actions-runner-honey-farm && cd /opt/actions-runner-honey-farm
  V=2.319.1
  curl -fsSL -o r.tgz https://github.com/actions/runner/releases/download/v\$V/actions-runner-linux-x64-\$V.tar.gz
  tar xzf r.tgz && rm r.tgz
  export RUNNER_ALLOW_RUNASROOT=1
  ./config.sh --unattended --replace \
    --url https://github.com/rrmsz2/ahmed_honey_farm \
    --token $REG_TOKEN \
    --name apps-vm-honey-farm \
    --labels self-hosted,honey-farm-prod \
    --work _work
  ./svc.sh install && ./svc.sh start && ./svc.sh status"
```
بعدها يجب أن يظهر الـ runner بحالة **Idle** في: GitHub ← المستودع ← Settings ← Actions ← Runners.

### 3) أول نشر
من تبويب GitHub ← Actions ← **Deploy honey-farm** اضغط **Run workflow**، أو نفّذ أي `push` إلى `main`.

### 4) ربط النطاق في Caddy (على `10.10.70.15`)
اختر النطاق الفرعي، مثلاً `honey.fidanet.om`:
```bash
$CORE "cp /opt/fidanet/docker/Caddyfile /opt/fidanet/docker/Caddyfile.bak.\$(date +%s)"
$CORE "cat >> /opt/fidanet/docker/Caddyfile <<'EOF'

honey.fidanet.om {
	encode gzip
	reverse_proxy 10.10.70.20:8095 {
		header_up X-Forwarded-Proto https
	}
}
EOF"
$CORE "docker exec fidanet-caddy-1 caddy validate --config /etc/caddy/Caddyfile" \
  && $CORE "docker restart fidanet-caddy-1 >/dev/null" && echo "Caddy ✅"
```
> ⚠️ **مهم:** نشر fidanet يمسح الكتل المضافة يدوياً من Caddyfile. **أضِف كتلة `honey` إلى سكربت الحارس** `/opt/openwa/caddy-guard.sh` (بجانب owa/kot/wallet)، وإلا سيختفي النطاق مع أول نشر لـ fidanet.

### 5) إعداد DNS
- **العام:** أضف سجل A أو CNAME لـ `honey.fidanet.om` يشير إلى نفس عنوان `smart.fidanet.om`.
- **الداخلي (Split DNS) على MikroTik `10.10.10.1`:**
  ```routeros
  /ip dns static add name="honey.fidanet.om" address=10.10.70.15 ttl=5m comment="honey-farm-Split-DNS"
  /ip dns cache flush
  ```
  قواعد Hairpin العامة `FidaNet-Caddy-Hairpin-*-PreHotspot` موجودة مسبقاً، فلا تُنشئ نسخاً جديدة منها.

### 6) التحقق
```bash
curl -fsS --resolve honey.fidanet.om:443:10.10.70.15 https://honey.fidanet.om/api/health   # من LAN
curl -fsS https://honey.fidanet.om/api/health                                             # من الإنترنت
curl -sSI https://smart.fidanet.om | head -1                                              # للاطمئنان أن FidaNet ما زال سليماً
```
ثم ادخل إلى `https://honey.fidanet.om/admin`، وراجع **الإعدادات** واضغط **إرسال رسالة تجريبية**.

---

## التشغيل اليومي
- **النشر:** `git push origin main`. يعمل CI أولاً، وإذا نجح يبدأ Deploy تلقائياً.
- **السجلات:** `$APPS "cd /opt/honey-farm && docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f --tail=100 backend"`
- **نسخة احتياطية لقاعدة البيانات:**
  `$APPS "docker exec honey-farm-mongo-1 mongodump --archive --gzip --db honey_farm" > honey-$(date +%F).archive.gz`
- **إذا علق النشر في `queued`:** تأكد أن خدمة الـ runner تعمل، وأعد تشغيل هذه الخدمة بالذات فقط:
  `$APPS "systemctl list-units --all | grep actions.runner.rrmsz2-ahmed_honey_farm"`

## التراجع
```bash
$APPS "cd /opt/honey-farm && docker compose -f docker-compose.yml -f docker-compose.prod.yml down"   # البيانات تبقى في volume
$CORE "cp \$(ls -t /opt/fidanet/docker/Caddyfile.bak.* | head -1) /opt/fidanet/docker/Caddyfile && docker restart fidanet-caddy-1"
```
