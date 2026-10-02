# برگه تصمیم‌های مالک — Phase 1

**وضعیت:** برگه تاریخی Phase 1؛ تصمیم‌های Package 3A در 2026-09-23 طبق `package-3a-owner-decision-pack-fa.md` نهایی شدند

**تاریخ:** 2026-09-22

**دامنه:** فقط D02 تا D12 و D44 تا D48

**تصمیم ثبت‌شده:** D01 تصویب شده است: در نسخه اولیه فقط یک `tenant` به نام Didar وجود دارد؛ همه مشارکت‌کنندگان داخل همین `tenant` مدل می‌شوند و provisioning چندمستاجری در نسخه اولیه پیاده‌سازی نمی‌شود.

این برگه دامنه تصمیم‌های Phase 1 را نگه می‌دارد. برای D02، D04–D06 و D44–D47، سند نهایی Package 3A و decision register مرجع وضعیت هستند؛ سایر تصمیم‌ها همچنان طبق همین برگه نیازمند تصویب‌اند.

## 1. هویت و سازمان

### D02 — یکتایی هویت اشخاص

- **توضیح:** باید مشخص شود `national_id`، `mobile` و `email` چگونه نرمال و در چه محدوده‌ای یکتا هستند.
- **نیاز فعلی:** کلیدهای یکتا، جلوگیری از حساب تکراری و اتصال امن `K01` به `K03` به این تصمیم وابسته است.
- **پیشنهاد پیش‌فرض:** `national_id` نرمال‌شده برای اشخاص ایرانی در محدوده `tenant_id` یکتا باشد؛ `mobile` با قالب E.164 و در هر `tenant_id` یکتا باشد؛ `email` پس از lowercase/trim یکتا باشد؛ برای اتباع یا شناسه ناموجود، رکورد موقت با وضعیت `unverified` مجاز ولی بدون دسترسی حساس باشد.
- **پیامد:** سخت‌گیری بیش از حد می‌تواند اعضای مشترک یا شماره‌های خانوادگی را مسدود کند؛ سهل‌گیری باعث جعل، حساب تکراری و تخصیص مجوز به فرد اشتباه می‌شود.
- **عبارت تصویب:** «`D02 APPROVED`: یکتایی و نرمال‌سازی `national_id`، `mobile` و `email` مطابق پیش‌فرض این برگه و در محدوده `tenant_id` اجرا شود؛ هویت فاقد شناسه معتبر تا زمان verification دسترسی حساس ندارد.»
- **وضعیت/اثر:** APPROVED برای `Package 3A`؛ وابستگی‌های احراز هویت `Package 3B` جداگانه باقی‌اند.

### D03 — هویت مشترک میان tenantها

- **توضیح:** باید روشن شود در آینده یک شخص یا سازمان می‌تواند در چند `tenant` حضور داشته باشد یا خیر.
- **نیاز فعلی:** بر شکل کلیدهای یکتا و جلوگیری از ایجاد وابستگی global زودهنگام اثر دارد؛ با D01 فعلاً فقط Didar وجود دارد.
- **پیشنهاد پیش‌فرض:** در نسخه اولیه هیچ global identity link ساخته نشود؛ تمام شناسه‌های تجاری زیر `tenant_id` باشند. طراحی اتصال میان tenantها به نسخه چندمستاجری و رضایت صریح صاحب داده موکول شود.
- **پیامد:** این انتخاب از افشای هویت میان tenantهای آینده جلوگیری می‌کند، ولی بعداً برای ادغام حساب‌ها به فرآیند تطبیق کنترل‌شده نیاز خواهد بود.
- **عبارت تصویب:** «`D03 APPROVED`: نسخه اولیه هیچ هویت global یا اتصال cross-tenant ایجاد نکند؛ تمام هویت‌ها tenant-scoped باشند و طراحی اتصال آینده نیازمند تصمیم و رضایت جداگانه باشد.»
- **مسدودکننده Phase 1:** خیر — D01 اجازه می‌دهد پیش‌فرض بالا اعمال و تصمیم چندمستاجری به آینده موکول شود.

### D04 — سلسله‌مراتب سازمانی و مکان‌ها

- **توضیح:** مرز میان legal organization، branch، store، workshop و operational location باید ثابت شود.
- **نیاز فعلی:** FKهای `K01`، scope مجوزها و جلوگیری از تعریف چندباره فروشگاه/کارگاه به آن وابسته است.
- **پیشنهاد پیش‌فرض:** شخصیت حقوقی در `k01.organizations` ثبت شود؛ شعبه، فروشگاه، کارخانه و کارگاه فاقد شخصیت حقوقی در `k01.organization_locations` قرار گیرند؛ رابطه parent-child فقط داخل Didar tenant باشد؛ location مالک هویت حقوقی مستقل نیست.
- **پیامد:** مدل مبهم باعث اعطای دسترسی در scope اشتباه و تکرار اطلاعات می‌شود. مدل پیشنهادی ساده است، اما سازمان‌های دارای چند شخصیت حقوقی باید چند organization داشته باشند.
- **عبارت تصویب:** «`D04 APPROVED`: legal entity در `k01.organizations` و branch/store/workshop/factory عملیاتی در `k01.organization_locations` مدل شود؛ hierarchy از مرز `tenant_id` عبور نکند.»
- **وضعیت/اثر:** APPROVED برای `Package 3A`؛ enforcement مجوز در `Package 3C` باقی است.

### D07 — واژگان و مالکیت Trust Tier

- **توضیح:** کد فعلی دو مجموعه نام برای `TrustTier` دارد و باید یک vocabulary معتبر انتخاب شود.
- **نیاز فعلی:** `K03` نباید tier تجاری را به‌عنوان نقش امنیتی تفسیر کند؛ مرز داده‌ای باید اکنون مشخص باشد، هرچند migration کامل `K02` بعداً انجام می‌شود.
- **پیشنهاد پیش‌فرض:** `K02` تنها مالک `TrustTier` باشد؛ tier هیچ permission مستقیم ایجاد نکند؛ vocabulary نهایی و حدود تجاری در Package مهاجرت `K02` تصویب شود. در Phase 1 فقط FK/claim اختیاری و read-only تعریف شود.
- **پیامد:** جداکردن tier از RBAC مانع ارتقای ناخواسته دسترسی امنیتی می‌شود. قابلیت‌های تجاری تا مهاجرت `K02` همچنان غیرفعال یا غیرقابل اتکا می‌ماند.
- **عبارت تصویب:** «`D07 APPROVED`: `K02` مالک انحصاری `TrustTier` باشد؛ tier هرگز به‌تنهایی permission امنیتی ایجاد نکند و vocabulary/limits نهایی در Package مخصوص `K02` تصویب شود.»
- **مسدودکننده Phase 1:** خیر — برای Phase 1 فقط جداسازی tier از RBAC لازم است؛ قواعد تجاری، migration `K02` را مسدود می‌کنند.

### D08 — کنترل‌های onboarding

- **توضیح:** بررسی‌های اجباری، reviewer، approval مشروط و re-verification برای onboarding هنوز قطعی نیست.
- **نیاز فعلی:** حساب امنیتی نباید به معنی تأیید KYC/KYB یا مجوز تجاری تلقی شود.
- **پیشنهاد پیش‌فرض:** Phase 1 فقط account با وضعیت محدود می‌سازد؛ هیچ commercial entitlement از ایجاد account ناشی نمی‌شود. قواعد KYC/KYB، sanctions و reviewer در Package `K02` تعیین شوند.
- **پیامد:** این تفکیک جلوی دسترسی تجاری پیش از verification را می‌گیرد؛ تا تکمیل `K02`، کاربران جدید فقط قابلیت‌های حداقلی و غیرحساس دارند.
- **عبارت تصویب:** «`D08 APPROVED`: ایجاد `K03 auth_account` به‌هیچ‌وجه onboarding یا KYC/KYB را تأیید نکند و هیچ commercial entitlement خودکاری نسازد؛ قواعد verification به Package `K02` موکول شود.»
- **مسدودکننده Phase 1:** خیر — قواعد کامل onboarding قابل تعویق است؛ اصل عدم اعطای entitlement باید پذیرفته شود.

## 2. احراز هویت و نشست‌ها

### D09 — مرجع احراز هویت

- **توضیح:** باید provider اصلی AuthN و محل نگهداری credential، recovery و account linking انتخاب شود.
- **نیاز فعلی:** بدون این تصمیم، طراحی `auth_accounts`، token validation، recovery و secret storage ممکن نیست.
- **پیشنهاد پیش‌فرض:** از یک OIDC provider مدیریت‌شده و مورد تأیید امنیت استفاده شود؛ PostgreSQL فقط subject/provider mapping، session/security metadata و audit را نگه دارد؛ password یا refresh token خام در برنامه ذخیره نشود. انتخاب vendor نیازمند تأیید جداگانه مالک است.
- **پیامد:** provider مدیریت‌شده ریسک نگهداری password را کاهش می‌دهد، ولی وابستگی عملیاتی و هزینه ایجاد می‌کند. ساخت AuthN سفارشی سطح ریسک و دامنه پروژه را به‌شدت افزایش می‌دهد.
- **عبارت تصویب:** «`D09 APPROVED`: AuthN نسخه اولیه بر پایه OIDC provider مدیریت‌شده باشد؛ برنامه password و token خام را ذخیره نکند؛ انتخاب vendor و قرارداد آن پیش از implementation نهایی تأیید شود.»
- **مسدودکننده Phase 1:** بله — `Package 3B`.

### D10 — MFA، step-up و session

- **توضیح:** مدت session، factorهای مجاز، concurrent session و عملیات نیازمند step-up باید مشخص شود.
- **نیاز فعلی:** route enforcement، session schema و testهای امنیتی بدون policy دقیق قابل پذیرش نیست.
- **پیشنهاد پیش‌فرض:** MFA برای همه staff اجباری؛ WebAuthn ترجیحی و TOTP جایگزین؛ SMS فقط recovery کنترل‌شده؛ session idle برابر 30 دقیقه و absolute برابر 12 ساعت؛ حداکثر 3 session؛ step-up با اعتبار 5 دقیقه برای approval، RBAC change، document export و عملیات مالی/مالکیت/کاستدی؛ revocation فوری و fail-closed.
- **پیامد:** امنیت بالاتر با اصطکاک کاربری و نیاز به recovery پشتیبانی‌شده همراه است. session طولانی یا SMS-only ریسک تصاحب حساب را افزایش می‌دهد.
- **عبارت تصویب:** «`D10 APPROVED`: policy پیشنهادی MFA/session/step-up این برگه مبنای نسخه اولیه باشد؛ هر استثنا فقط با policy ثبت‌شده و audit مجاز است.»
- **مسدودکننده Phase 1:** بله — `Package 3B`.

## 3. RBAC و تأیید چهارچشمی

### D05 — مرز Membership و Authorization

- **توضیح:** `K01 membership` رابطه سازمانی را توصیف می‌کند؛ `K03 RBAC` باید مجوز اجرایی را کنترل کند.
- **نیاز فعلی:** آرایه فعلی `authorities` در K01 نباید به مجوز واقعی و بدون governance تبدیل شود.
- **پیشنهاد پیش‌فرض:** membership هیچ permission ضمنی ندهد؛ permission فقط از `auth_subject_roles` با scope مشخص `organization_id/location_id` حاصل شود؛ grantها effective-dated و قابل لغو باشند؛ deny-by-default.
- **پیامد:** مدیریت دسترسی دقیق و قابل audit می‌شود، ولی provisioning نقش باید صریح و کنترل‌شده باشد.
- **عبارت تصویب:** «`D05 APPROVED`: `K01 membership` صرفاً رابطه کسب‌وکاری است و permission ایجاد نمی‌کند؛ تمام دسترسی‌ها فقط از `K03 RBAC`، scope صریح و deny-by-default صادر شوند.»
- **وضعیت/اثر:** APPROVED برای مرز K01 در `Package 3A`؛ پیاده‌سازی authorization در `Package 3C` باقی است.

### D11 — سیاست four-eyes

- **توضیح:** باید عملیات حساس، تعداد و ترتیب approverها و ممنوعیت self-approval تعیین شود.
- **نیاز فعلی:** schema و enforcement مربوط به `K04 approval` بدون rule قابل آزمون نیست.
- **پیشنهاد پیش‌فرض:** تغییر role/permission، export انبوه PII، تغییر security policy، بازکردن account، تغییر retention/legal hold و عملیات مالی/مالکیت/کاستدی پرریسک نیازمند حداقل دو شخص متمایز باشد؛ initiator هرگز approver نباشد؛ approval با تغییر payload باطل شود؛ اعتبار approval حداکثر 24 ساعت.
- **پیامد:** خطر سوءاستفاده داخلی کم می‌شود، اما زمان عملیات و نیاز به پوشش شیفت افزایش می‌یابد. emergency override بدون قاعده، کنترل را بی‌اثر می‌کند.
- **عبارت تصویب:** «`D11 APPROVED`: عملیات حساس فهرست‌شده تحت four-eyes با account/person متمایز، payload hash ثابت، expiry بیست‌وچهارساعته و منع self-approval اجرا شوند؛ emergency override تا تصمیم جداگانه غیرفعال باشد.»
- **مسدودکننده Phase 1:** بله — `Package 3C` و `Package 3D`.

## 4. Audit و مدیریت اسناد

### D06 — اسناد هویتی

- **توضیح:** نوع سند، مرجع verification، expiry، دسترسی و محل blob باید مشخص شود.
- **نیاز فعلی:** جایگزینی امن `k01_documents` و جلوگیری از ذخیره/نمایش بی‌ضابطه PII به آن وابسته است.
- **پیشنهاد پیش‌فرض:** blob در object storage رمزگذاری‌شده و private؛ PostgreSQL فقط metadata، `sha256`، classification و object key را نگه دارد؛ دسترسی download جدا از metadata و دارای audit؛ سند منقضی verification فعال ایجاد نکند؛ فقط document typeهای مصوب پذیرفته شوند.
- **پیامد:** افشای سند و دستکاری فایل کاهش می‌یابد؛ نیاز به KMS، malware scan، signed URL کوتاه‌مدت و فرآیند verification واقعی ایجاد می‌شود.
- **عبارت تصویب:** «`D06 APPROVED`: سند هویتی فقط در object storage رمزگذاری‌شده/private نگهداری شود؛ metadata و digest در PostgreSQL باشد؛ هر view/download/verification audit شود و سند منقضی معتبر تلقی نشود.»
- **وضعیت/اثر:** APPROVED برای metadata/storage boundary در `Package 3A`؛ audit مشترک در `Package 3D` باقی است.

### D12 — تضمین Audit

- **توضیح:** باید ماندگاری، append-only بودن، anchor مستقل، export و مسئول verifier تعیین شود.
- **نیاز فعلی:** همه تغییرات هویت، AuthN، RBAC و approval باید evidence قابل اتکا بسازند.
- **پیشنهاد پیش‌فرض:** `platform.audit_events` در همان transaction کسب‌وکاری درج و برای runtime غیرقابل update/delete باشد؛ actor از session معتبر بیاید؛ secret و document content ثبت نشود؛ digest روزانه در storage مستقل و immutable anchor شود؛ export فقط با permission و four-eyes.
- **پیامد:** قابلیت پاسخ‌گویی و forensic بالا می‌رود؛ هزینه storage و عملیات anchor/export اضافه می‌شود. hash محلی بدون anchor مستقل کافی نیست.
- **عبارت تصویب:** «`D12 APPROVED`: audit به‌صورت transactionally coupled، append-only، server-attributed و بدون secret ثبت شود؛ digest روزانه در مقصد مستقل immutable anchor و export آن تحت RBAC و four-eyes باشد.»
- **مسدودکننده Phase 1:** بله — `Package 3D`.

## 5. حریم خصوصی، حذف و نگهداری

### D44 — برنامه Retention

- **توضیح:** مدت نگهداری هر کلاس داده و اثر `legal_hold` باید تصویب شود.
- **نیاز فعلی:** partition/archive، deletion job، object lifecycle و audit retention بدون جدول زمان‌بندی معتبر طراحی نمی‌شود.
- **تصمیم مشروط:** جهت معماری schedule نسخه‌دار و تقدم `legal_hold` تصویب شده است؛ بازه‌های پیشنهادی تا تأیید نهایی حقوقی/حریم خصوصی در production فعال نمی‌شوند.
- **پیامد:** نگهداری طولانی ریسک privacy و هزینه را بالا می‌برد؛ حذف زودهنگام evidence حقوقی و امنیتی را از بین می‌برد.
- **عبارت تصویب:** «`D44 APPROVED-CONDITIONAL`: schedule نسخه‌دار و تقدم `legal_hold` تصویب است؛ مدت‌های دقیق فقط پس از تأیید نهایی حقوقی/حریم خصوصی فعال شوند.»
- **وضعیت/اثر:** APPROVED-CONDITIONAL؛ شروع `Package 3A` مجاز است، production و Packageهای 3D/3F به جزئیات نهایی وابسته‌اند.

### D45 — حقوق حریم خصوصی

- **توضیح:** مبنای قانونی، consent، دسترسی صاحب داده، correction، export و محدودسازی پردازش باید روشن شود.
- **نیاز فعلی:** APIهای identity/document و مجوز support بدون این مرز ممکن است PII را بیش از نیاز نمایش دهند.
- **پیشنهاد پیش‌فرض:** data minimization و purpose limitation؛ self-service export خودکار تا قبل از legal review فعال نشود؛ درخواست access/correction از workflow کنترل‌شده با identity proof، audit و redaction داده اشخاص ثالث عبور کند؛ public passport حداقل داده را نشان دهد.
- **پیامد:** فرآیند دستی اولیه کندتر است، ولی از export بی‌ضابطه و افشای cross-subject جلوگیری می‌کند.
- **عبارت تصویب:** «`D45 APPROVED`: اصل data minimization/purpose limitation اعمال شود؛ access/correction/export فقط پس از identity proof، authorization، audit و redaction انجام شود و public view هیچ PII مستقیم نمایش ندهد.»
- **وضعیت/اثر:** APPROVED-CONDITIONAL؛ شروع `Package 3A` مجاز است، procedure/deadline و privacy workflow production باز هستند.

### D46 — حذف و anonymization

- **توضیح:** باید مشخص شود کدام PII قابل حذف، tokenization یا نگهداری اجباری است.
- **نیاز فعلی:** FKها، audit، اسناد و lifecycle حساب نباید با delete مستقیم خراب شوند.
- **پیشنهاد پیش‌فرض:** hard delete از API عمومی ممنوع؛ account disable و purpose restriction فوری؛ PII قابل حذف پس از پایان retention با anonymization/tokenization برگشت‌ناپذیر؛ رکورد مالی، مالکیت، custody و audit باقی بماند ولی شناسه مستقیم تا حد قانونی tokenized شود؛ `legal_hold` حذف را متوقف کند.
- **پیامد:** یکپارچگی evidence حفظ می‌شود، اما حذف کامل همیشه ممکن نیست و باید شفاف اعلام شود.
- **عبارت تصویب:** «`D46 APPROVED`: حذف عملیاتی با disable/restrict انجام شود؛ پس از retention، PII مجاز به‌صورت برگشت‌ناپذیر anonymize/tokenize شود؛ رکوردهای قانونی/مالی/custody/audit حذف نشوند و `legal_hold` مقدم باشد.»
- **وضعیت/اثر:** APPROVED-CONDITIONAL؛ شروع `Package 3A` مجاز است، exception matrix و اجرای production باز هستند.

### D47 — داده global و tenant-scoped

- **توضیح:** باید معلوم شود reference data و policyها global هستند یا مخصوص Didar tenant.
- **نیاز فعلی:** وجود `tenant_id`، RLS و unique constraints از ابتدا به این تصمیم وابسته است.
- **پیشنهاد پیش‌فرض:** تمام business data و policyهای قابل تغییر tenant-scoped باشند؛ فقط vocabulary فنی ثابت مانند permission catalog می‌تواند global و read-only باشد؛ override همیشه رکورد tenant-scoped و versioned بسازد.
- **پیامد:** احتمال نشت یا اثر تغییر یک tenant بر دیگری کم می‌شود؛ مقداری duplication کنترل‌شده ایجاد می‌شود.
- **عبارت تصویب:** «`D47 APPROVED`: business data و mutable policyها همیشه `tenant_id` داشته باشند؛ فقط vocabulary فنی ثابت و read-only global باشد و هر override به‌صورت tenant-scoped/versioned ثبت شود.»
- **وضعیت/اثر:** بخش K01 در `Package 3A` APPROVED؛ تصمیم reference data سایر Packageها در دامنه خودشان باقی است.

## 6. دسترس‌پذیری، Backup، RPO و RTO

### D48 — اهداف عملیاتی

- **توضیح:** سطح availability، `RPO`، `RTO`، backup، restore و مسئول incident باید تصویب شود.
- **نیاز فعلی:** topology، PITR، monitoring و acceptance test بدون هدف قابل سنجش نیست.
- **پیشنهاد پیش‌فرض:** برای release کنترل‌شده اولیه: `RPO <= 15 minutes`، `RTO <= 4 hours`، backup رمزگذاری‌شده روزانه + PostgreSQL WAL/PITR، نگهداری 35 روز، restore drill ماهانه، service target ماهانه 99.5%، on-call owner مشخص و production release منوط به restore موفق.
- **پیامد:** هدف سخت‌تر هزینه و پیچیدگی HA را بالا می‌برد؛ هدف ضعیف‌تر ریسک از دست رفتن هویت، audit و مجوزها را افزایش می‌دهد.
- **عبارت تصویب:** «`D48 APPROVED`: برای release اولیه `RPO <= 15m`، `RTO <= 4h`، availability target برابر 99.5%، backup روزانه + PITR با retention 35 روز و restore drill ماهانه الزامی باشد؛ مالک on-call پیش از production معرفی شود.»
- **مسدودکننده Phase 1:** بله — تکمیل `Package 3F` و هر production release.

## جمع‌بندی تصمیم‌ها

- تعداد تصمیم‌های این برگه: **16**
- تصمیم‌های Package 3A از این برگه: **حل‌شده برای شروع** (`D02`, `D04`–`D06`, `D44`–`D47`)؛ D44–D46 برای production مشروط‌اند.
- تصمیم‌های قابل تعویق با guardrail مصوب: **3** (`D03`, `D07`, `D08`)
- مقادیر Package 3A فقط طبق سند نهایی آن معتبرند؛ سایر مقادیر پیشنهادی این برگه تا پذیرش صریح business rule نهایی نیستند.

## تقسیم پیشنهادی Package 3

Package 3 به‌صورت ترتیبی و با gate مستقل شکسته شود؛ همه کنترل‌ها هم‌زمان پیاده‌سازی نشوند:

1. **Package 3A — Single-Tenant Identity and Organization Foundation:** ثبت Didar tenant، اصلاح K01 برای `tenant_id`، hierarchy سازمان/location، document metadata، privacy/retention schema و RLS پایه؛ بدون AuthN.
2. **Package 3B — Authentication and Session Enforcement:** اتصال OIDC، account mapping، MFA، session، step-up و actor context؛ بدون RBAC تجاری یا approval.
3. **Package 3C — Organization-Scoped RBAC:** role/permission/grant، scope سازمان/location، deny-by-default و تست isolation؛ بدون four-eyes workflow.
4. **Package 3D — Four-Eyes Approval and Immutable Audit:** approval policy/request/step، audit event، anchor و export کنترل‌شده؛ بدون integration delivery.
5. **Package 3E — Idempotency and Transactional Inbox/Outbox:** request deduplication، transactional outbox/inbox، retry/dead-letter و worker isolation؛ پس از تثبیت actor/RBAC/audit.
6. **Package 3F — Backup, Restore, and Operational Acceptance:** PITR، restore drill، monitoring، alerting و evidence مربوط به `RPO`/`RTO`؛ gate نهایی قبل از release.

Package 3A طبق برنامه implementation مصوب READY است. شروع Packageهای 3B تا 3F همچنان به تصمیم‌ها و gateهای مخصوص خود وابسته است؛ این برگه مجوز production release ایجاد نمی‌کند.
