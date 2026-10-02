# راهنمای جامع استقرار مستقل و CI/CD سکوی دیدار طلا (Didar Gold Platform)
## معماری کاملاً مستقل (Zero Cloud Vendor Lock-in & Self-Hosted)

> **وضعیت Package 2:** انتشار production همچنان متوقف است. K01 اکنون از PostgreSQL واقعی استفاده می‌کند؛ K02 تا K20 مهاجرت نکرده‌اند و احراز هویت و اعمال RBAC هنوز پیاده‌سازی نشده‌اند. readiness در production عمداً `503` است، اما وضعیت وابستگی PostgreSQL بر پایه اجرای واقعی `SELECT 1` گزارش می‌شود.

---

### ۱. وضعیت فعلی ذخیره‌سازی (Database Strategy)

وضعیت فعلی به‌صورت زیر است:

1. **ذخیره‌سازی قدیمی JSON/حافظه (موقت و ناقص):**
   - مسیر فعال K01 دیگر JSON را نمی‌خواند یا نمی‌نویسد.
   - K02 و K03 هنوز به بخش‌هایی از فایل قدیمی وابسته‌اند و K04 تا K20 مهاجرت نکرده‌اند.
   - این طراحی تضمین ACID سراسری، WAL پایدار یا ایمنی چند replica ندارد.
   - endpoint قدیمی backup/sync مربوط به K01 با پاسخ `501` غیرفعال شده است.

2. **PostgreSQL (فعال فقط برای K01):**
   - `docker-compose.yml` سرویس `postgres:16-alpine` را تعریف می‌کند.
   - connection pool، migration نسخه‌دار، transaction API و repository/service اختصاصی K01 فعال‌اند.
   - قالب امن متغیر:
   ```bash
     DATABASE_URL=postgresql://<user>:<password>@<host>:5432/<database>
   ```

---

### ۲. استقرار سریع با داکر (Docker & Docker Compose)

اگر می‌خواهید مستقیماً روی سرور لینوکس (Ubuntu / Debian / CentOS) برنامه را اجرا کنید:

```bash
# ۱. کلون کردن مخزن گیت‌هاب در سرور
git clone https://github.com/your-username/didar-gold.git /var/www/didar-gold
cd /var/www/didar-gold

# ۲. ایجاد فایل متغیرهای محیطی
cp .env.example .env
# مقادیر الزامی CORS_ALLOWED_ORIGINS، DATABASE_URL و POSTGRES_* را
# با Secret Manager یا فایل محلیِ ignore‌شده تکمیل کنید.

# ۳. ساخت image و راه‌اندازی PostgreSQL
docker compose build
docker compose up -d didar-db

# ۴. اجرای migration به‌صورت صریح (در startup خودکار اجرا نمی‌شود)
docker compose run --rm didar-kernel bun run db:migrate
docker compose run --rm didar-kernel bun run db:status

# ۵. K01 با schema خالی آغاز می‌شود. فایل قدیمی didar-kernel-store.json
# طبق تصمیم مالک فقط داده نمایشی است و نباید export یا import شود.
# فرمان db:import:k01 در استقرار clean-schema اجرا نمی‌شود.

# ۶. راه‌اندازی برنامه
docker compose up -d didar-kernel

# ۷. بررسی سلامت سامانه
curl http://localhost:3000/api/health/live
# پاسخ کلی production تا تکمیل authentication/RBAC عمداً 503 است؛
# فیلد dependencies.postgresql باید پس از query واقعی مقدار ready داشته باشد.
curl -i http://localhost:3000/api/health/ready
```

#### بازگشت و بازیابی K01

- volume قدیمی را حذف نکنید؛ K02، K03 و RBAC هنوز به فایل‌های آن وابسته‌اند. فایل K01 داخل آن فقط demo است و منبع migration نیست.
- پیش از هر rollback از پایگاه داده با ابزار استاندارد PostgreSQL مانند `pg_dump` پشتیبان بگیرید.
- برای rollback، image قبلی و migration سازگار آن را در یک پایگاه بازیابی‌شده/اختصاصی اجرا کنید؛ migration فعلی down خودکار ندارد.
- بازیابی را ابتدا در پایگاه جداگانه با `pg_restore` آزمایش و شمار رکوردها را با منبع مقایسه کنید. هیچ فرمان reset یا حذف volume در این راهنما مجاز نیست.

---

### ۳. راه‌اندازی CI/CD خودکار از طریق GitHub Actions

یک ورک‌فلو آماده در مسیر `.github/workflows/deploy.yml` قرار داده شده است. با هر بار `git push` به شاخه `main`، گیت‌هاب اکشنز مراحل زیر را طی می‌کند:
1. نصب قفل‌شده وابستگی‌ها با `bun install --frozen-lockfile`
2. اسکن مقادیر حساس با `bun run scan:secrets`
3. Typecheck با `bun run lint`
4. کامپایل فرانت‌اند و بک‌اند با `bun run build`
5. اجرای integration test واقعی K01 روی PostgreSQL جداگانه

job استقرار SSH فعلاً به‌صورت صریح غیرفعال است و تا رفع freeze انتشار نباید فعال شود.

#### تنظیم Secretهای موردنیاز در گیت‌هاب:
به تنظیمات مخزن گیت‌هاب خود بروید:
**Settings > Secrets and variables > Actions > New repository secret**

متغیرهای زیر را اضافه کنید:
- `SERVER_HOST`: آدرس آی‌پی یا دامنه سرور شما (مثال: `194.5.210.12`)
- `SERVER_USER`: نام کاربری SSH سرور (مثال: `root` یا `deployer`)
- `SERVER_SSH_KEY`: کلید خصوصی SSH برای اتصال بدون پسورد (`cat ~/.ssh/id_rsa`)
- `SERVER_PORT`: پورت SSH (پیش‌فرض: `22`)
- `DEPLOY_PATH`: مسیر پروژه روی سرور (پیش‌فرض: `/var/www/didar-gold`)

---

### ۴. پیکربندی Nginx و SSL رایگان (Let's Encrypt)

برای دسترسی امن به سامانه روی دامنه اختصاصی خود (مثلاً `gold.didar.ir`):

```nginx
# /etc/nginx/sites-available/didar-gold
server {
    server_name gold.didar.ir;

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

سپس دستور زیر را جهت فعال‌سازی HTTPS اجرا کنید:
```bash
sudo ln -s /etc/nginx/sites-available/didar-gold /etc/nginx/sites-enabled/
sudo certbot --nginx -d gold.didar.ir
sudo systemctl reload nginx
```

---

### ۵. وضعیت سلامت

- `/api/health/live` فقط زنده‌بودن فرآیند را گزارش می‌کند.
- `/api/health/ready` وابستگی‌های لازم را صریح گزارش می‌کند و در صورت نبود وابستگی لازم پاسخ ناموفق می‌دهد.
- `dependencies.postgresql=ready` فقط پس از موفقیت query واقعی PostgreSQL برگردانده می‌شود.
- `/api/health` صرفاً alias سازگاری برای liveness است.
- پنل وضعیت، PostgreSQL، Supabase، احراز هویت یا پایداری کامل K01 تا K20 را متصل/سالم اعلام نمی‌کند.
