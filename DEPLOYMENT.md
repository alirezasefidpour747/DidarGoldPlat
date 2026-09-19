# راهنمای جامع استقرار مستقل و CI/CD سکوی دیدار طلا (Didar Gold Platform)
## معماری کاملاً مستقل (Zero Cloud Vendor Lock-in & Self-Hosted)

این سامانه اکنون به صورت **۱۰۰٪ مستقل** بازنویسی شده و تمامی وابستگی‌های مستقیم و کلاینت ابری به سرویس‌های خارجی نظیر Supabase حذف شده است. دیتابیس و مدیریت احراز هویت کاملاً در کنترل و زیرساخت اختصاصی شما قرار دارد.

---

### ۱. گزینه‌های پایگاه‌داده اختصاصی (Database Strategy)

این سامانه به دو شکل کاملاً مستقل بر روی سرور شما کار می‌کند:

1. **حالت دیسک تراکنشی با دوام بالا (ACID Disk Volume - پیش‌فرض بدون کانفیگ اضافی):**
   - تمامی داده‌ها، لاگ‌ها و تراکنش‌های K01 تا K17 در پوشه `/app/data` (فایل `didar-kernel-store.json`) به صورت اتمیک و ایدن‌پوتنت ذخیره می‌شوند.
   - پوشه `/app/data` به صورت Docker Volume روی هارد دیسک سرور پایدار (Persistent) می‌ماند و حتی با خاموش/روشن شدن کانتینر هیچ داده‌ای حذف نخواهد شد.
   - دارای قابلیت بکاپ‌گیری دوره‌ای و دستی خودکار در `/app/data/backups`.

2. **حالت PostgreSQL اختصاصی (شخصی‌سازی دیتابیس رابطه‌ای):**
   - در فایل `docker-compose.yml` یک سرویس دیتابیس قدرتمند `postgres:16-alpine` اختصاصی قرار داده شده است.
   - در صورت تعیین متغیر `DATABASE_URL` در فایل `.env` سرور، سامانه مستقیماً به PostgreSQL اختصاصی متصل می‌گردد:
     ```bash
     DATABASE_URL=postgresql://didar_user:didar_secret_pass_2026@localhost:5432/didar_gold
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

# ۳. اجرای کانتینرها (هسته دیدار + دیتابیس مستقل)
docker compose up -d --build

# ۴. بررسی سلامت سامانه
curl http://localhost:3000/api/health
```

---

### ۳. راه‌اندازی CI/CD خودکار از طریق GitHub Actions

یک ورک‌فلو آماده در مسیر `.github/workflows/deploy.yml` قرار داده شده است. با هر بار `git push` به شاخه `main`، گیت‌هاب اکشنز مراحل زیر را طی می‌کند:
1. بررسی تست‌ها و Typecheck با `npm run lint`
2. کامپایل بیلد کامل فرانت‌اند و بک‌اند با `npm run build`
3. اتصال امن از طریق SSH به سرور شما و اجرای `docker compose up -d --build`

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

### ۵. وضعیت و سلامت دیتابیس در پنل مدیریت

در هدر بالای پنل دیدار طلا:
- دکمه سبز رنگ **«پایگاه داده مستقل»** تعبیه شده است.
- با کلیک روی آن، اطلاعات پایداری دیسک، زمان پاسخ‌دهی (Latency)، تعداد پرونده‌های ثبت شده و وضعیت آخرین نسخه پشتیبان نمایش داده می‌شود.
- در هر لحظه می‌توانید با کلیک روی **«ایجاد نسخه پشتیبان سرور»** یک اسنپ‌شات کامل از داده‌های پلتفرم روی دیسک اختصاصی سرور ذخیره نمایید.
