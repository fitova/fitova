# هيكل قاعدة البيانات والمفاتيح المطلوبة - Fitova

## 1️⃣ إعدادات ومتغيرات البيئة المطلوبة (Environment Variables)

عند إعداد قاعدة بيانات جديدة، ستحتاج إلى إدخال المتغيرات التالية في ملف `.env.local` أو في إعدادات الخادم لتأمين الاتصال:

| المتغير | الوصف | من أين يتم الحصول عليه؟ | النطاق (Scope) | سري؟ | مثال شكلي (Dummy) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`DATABASE_URL`** | رابط الاتصال المباشر بقاعدة البيانات (Connection String). | منصة قاعدة البيانات (Vercel Postgres, Supabase, Neon) | Backend | ⚠️ نعم | `postgres://user:pass@host:5432/db` |
| **`NEXT_PUBLIC_DB_URL`** | (اختياري) رابط الوصول لواجهة API قواعد البيانات إذا تم استخدام خدمة مثل Supabase أو Appwrite. | إعدادات واجهة برمجة التطبيقات للمنصة. | Frontend | ❌ لا | `https://xyz.supabase.co` |
| **`NEXT_PUBLIC_DB_ANON_KEY`** | مفتاح الوصول العام للـ Frontend (يمتلك صلاحيات محدودة جداً). | إعدادات واجهة برمجة التطبيقات للمنصة. | Frontend | ❌ لا | `eyJhbGciOiJIUzI1...` |
| **`DATABASE_SERVICE_ROLE_KEY`** | مفتاح خاص بالخادم (Backend) يتخطى جميع الصلاحيات (RLS). يستخدم في الـ Admin API. | إعدادات واجهة برمجة التطبيقات للمنصة. | Backend | ⚠️ نعم | `eyJhbGciOiJIUzI1Ni...` |
| **`JWT_SECRET`** | مفتاح التشفير المستخدم لتوليد رموز الجلسة (Tokens) للمستخدمين لتأمين النظام. | يتم توليده أو الحصول عليه من موفر خدمة المصادقة. | Backend | ⚠️ نعم | `super-secret-jwt-key-32-chars` |
| **`GOOGLE_CLIENT_ID`** | معرّف OAuth لتسجيل الدخول عبر Google. | Google Cloud Console | Backend | ❌ لا | `123456789.apps.googleusercontent.com` |
| **`GOOGLE_CLIENT_SECRET`** | المفتاح السري لـ Google OAuth. | Google Cloud Console | Backend | ⚠️ نعم | `GOCSPX-xxxxxxxxxxxxxxx` |
| **`SMTP_HOST`** | خادم البريد لإرسال إشعارات (مثل رسائل الترحيب أو تأكيد الاشتراك بالنشرة البريدية). | مزود خدمة البريد (Resend, SendGrid) | Backend | ⚠️ نعم | `smtp.resend.com` |
| **`SMTP_API_KEY`** | مفتاح API لخادم البريد. | مزود خدمة البريد | Backend | ⚠️ نعم | `re_xxxxxxxxxxxxxxxx` |

---

## 2️⃣ هيكل قاعدة البيانات المقترح (Database Schema)

بعد تحليل عميق لجميع مكونات وصفحات الموقع (28+ مكون)، تم اكتشاف أن الهيكل السابق كان ينقصه عدة جداول ضرورية. هذا الهيكل المحدّث يغطي جميع الميزات الموجودة:

---

### 📦 الجداول الأساسية (Core Tables)

#### جدول المستخدمين (`profiles`)
يحتفظ ببيانات المستخدمين وحالة الإدارة.
- `id` (UUID) — Primary Key
- `email` (String) — Unique, Required
- `full_name` (String) — Nullable
- `avatar_url` (String) — Nullable
- `phone` (String) — Nullable ← **🆕 مطلوب لصفحة My Account والـ Checkout**
- `is_admin` (Boolean) — Default: `false`
- `created_at` (Timestamptz) — Default: `now()`
- `updated_at` (Timestamptz) — Default: `now()`  ← **🆕 لتتبع آخر تحديث للملف الشخصي**

#### جدول عناوين المستخدمين (`user_addresses`) 🆕
> **سبب الإضافة**: مكون `MyAccount` يحتوي على `AddressModal` لإدارة العناوين، ومكون `Checkout` يطلب عنوان الشحن والفوترة. لا يوجد جدول لحفظها.

- `id` (UUID) — Primary Key
- `user_id` (UUID) — FK → `profiles(id)`, Required
- `label` (String) — Nullable (مثال: "المنزل"، "العمل")
- `full_name` (String) — Required
- `phone` (String) — Nullable
- `address_line_1` (String) — Required
- `address_line_2` (String) — Nullable
- `city` (String) — Required
- `state` (String) — Nullable
- `postal_code` (String) — Nullable
- `country` (String) — Required
- `is_default` (Boolean) — Default: `false`
- `created_at` (Timestamptz) — Default: `now()`

---

### 🛍️ جداول المنتجات (Product System)

#### جدول التصنيفات (`categories`)
لإدارة أقسام الموقع (ملابس، أحذية، إكسسوارات...).
- `id` (UUID) — Primary Key
- `name` (String) — Required
- `slug` (String) — Unique ← **🆕 لاستخدامه في الـ URL بدلاً من الـ ID**
- `description` (Text) — Nullable ← **🆕 وصف التصنيف لأغراض SEO**
- `image_url` (String) — Nullable ← **🆕 ملف `categoryData.ts` يعرض صور للتصنيفات**
- `parent_id` (UUID) — FK → `categories(id)`, Nullable (للتصنيفات الفرعية)
- `sort_order` (Integer) — Default: `0` ← **🆕 للتحكم في ترتيب العرض**
- `created_at` (Timestamptz) — Default: `now()`

#### جدول المنتجات (`products`)
الجدول الأساسي الذي يعتمد عليه نظام التسويق بالعمولة (Affiliate).
- `id` (UUID) — Primary Key
- `name` (String) — Required
- `slug` (String) — Unique ← **🆕 ضروري لعناوين URL صديقة للموقع `/shop/product-slug`**
- `description` (Text) — Nullable
- `price` (Numeric) — Required
- `discounted_price` (Numeric) — Nullable ← **🆕 ملف `shopData.ts` و`types/product.ts` يحتويان على `discountedPrice` - السعر بعد الخصم**
- `brand` (String) — Nullable
- `piece_type` (String) — Nullable (مثال: T-Shirt)
- `season` (String) — Nullable (Summer, Winter...)
- `stock_status` (String) — Default: `'In stock'`
- `affiliate_link` (String) — Required (رابط الشراء الخارجي)
- `commission` (Numeric) — Nullable (نسبة العمولة)
- `affiliate_program` (String) — Nullable (Amazon, ShareASale)
- `merchant_id` (String) — Nullable
- `quantity` (Integer) — Default: `0`
- `tags` (Text Array `text[]`) — Nullable
- `colors` (Text Array `text[]`) — Nullable
- `styles` (Text Array `text[]`) — Nullable
- `size` (Text Array `text[]`) — Nullable
- `material` (String) — Nullable
- `category_id` (UUID) — FK → `categories(id)`, Nullable
- `is_featured` (Boolean) — Default: `false` ← **🆕 لتحديد المنتجات المعروضة في الصفحة الرئيسية (BestSeller, NewArrivals, Trending)**
- `is_deal` (Boolean) — Default: `false` ← **🆕 لربط المنتج بصفحة الـ Deals**
- `deal_tag` (String) — Nullable ← **🆕 قيمة مثل `"Hot Deal"` أو `"Flash Sale"` أو `"Limited Time"` (من مكون `Deals`)**
- `views_count` (Integer) — Default: `0` ← **🆕 لتتبع شعبية المنتج والترتيب حسب الأكثر مشاهدة**
- `created_at` (Timestamptz) — Default: `now()`
- `updated_at` (Timestamptz) — Default: `now()` ← **🆕**

#### جدول صور المنتجات (`product_images`) 🆕
> **سبب الإضافة**: ملف `shopData.ts` وصفحة `ShopDetails` تعرض مصفوفات من الصور المصغرة والمعاينات لكل منتج. تخزين الصور في جدول منفصل أفضل من مصفوفة نصية لأنه يسمح بالترتيب، وسهولة الإدارة من لوحة التحكم.

- `id` (UUID) — Primary Key
- `product_id` (UUID) — FK → `products(id)`, Required
- `url` (String) — Required (رابط الصورة)
- `type` (String) — Required (`thumbnail` أو `preview`) ← يطابق هيكل `imgs.thumbnails` و `imgs.previews` في `shopData.ts`
- `sort_order` (Integer) — Default: `0`
- `alt_text` (String) — Nullable (لأغراض SEO)
- `created_at` (Timestamptz) — Default: `now()`

#### جدول تقييمات المنتجات (`product_reviews`) 🆕
> **سبب الإضافة**: ملف `types/product.ts` يحتوي على حقل `reviews: number`، وصفحة `ShopDetails` تعرض منطقة تقييمات. حالياً يعرض عدد فقط بدون بيانات حقيقية.

- `id` (UUID) — Primary Key
- `product_id` (UUID) — FK → `products(id)`, Required
- `user_id` (UUID) — FK → `profiles(id)`, Required
- `rating` (Integer) — Required (1-5) ← CHECK constraint: `rating >= 1 AND rating <= 5`
- `comment` (Text) — Nullable
- `created_at` (Timestamptz) — Default: `now()`
- *(Unique Constraint: `product_id` + `user_id` — كل مستخدم يقيّم المنتج مرة واحدة فقط)*

---

### 🎨 جداول المجموعات والستايل (Collections & Style)

#### جدول المجموعات / الـ Lookbook (`collections`)
- `id` (UUID) — Primary Key
- `name` (String) — Required
- `slug` (String) — Unique ← **🆕**
- `description` (Text) — Nullable ← **🆕 حقل `description` موجود في واجهة `LookbookItem`**
- `cover_image` (String) — Nullable ← **🆕 صورة غلاف المجموعة للعرض على الصفحة الرئيسية**
- `tag` (String) — Nullable ← **🆕 قيمة `"AI"` أو `"Trending"` أو `"User"` (من واجهة `LookbookItem`)**
- `styles` (Text Array `text[]`) — Nullable ← **🆕 من واجهة `LookbookItem`**
- `colors` (Text Array `text[]`) — Nullable ← **🆕 من واجهة `LookbookItem`**
- `generated_by_ai` (Boolean) — Default: `false`
- `created_at` (Timestamptz) — Default: `now()`

#### جدول منتجات المجموعات (Join Table: `collection_products`)
لربط المنتجات المتعددة بالمجموعات المتعددة (Many-to-Many).
- `collection_id` (UUID) — FK → `collections(id)` ON DELETE CASCADE
- `product_id` (UUID) — FK → `products(id)` ON DELETE CASCADE
- *(Primary Key: `collection_id` + `product_id`)*

#### جدول الأوضاع المفضلة في StyleHub (`saved_style_worlds`) 🆕
> **سبب الإضافة**: مكون `StyleHubContext.tsx` يحتوي على نوع `SavedWorld` ونظام حفظ كامل (id, name, filters, createdAt)، لكنه يُخزَّن فقط في ذاكرة React (useState) ويُفقد عند إعادة تحميل الصفحة!

- `id` (UUID) — Primary Key
- `user_id` (UUID) — FK → `profiles(id)`, Required
- `name` (String) — Required
- `filters` (JSONB) — Required ← يحفظ الفلاتر كـ JSON: `{color, style, mood, occasion, season, material, brand}`
- `created_at` (Timestamptz) — Default: `now()`

---

### 🏷️ جداول العروض والكوبونات (Offers & Deals)

#### جدول العروض والكوبونات (`offers`)
- `id` (UUID) — Primary Key
- `code` (String) — Unique, Nullable
- `description` (Text) — Required
- `discount_type` (String) — (مثال: `percentage`, `fixed`)
- `discount_value` (Numeric) — Required
- `min_purchase` (Numeric) — Nullable ← **🆕 الحد الأدنى للشراء لتفعيل الكوبون**
- `max_uses` (Integer) — Nullable ← **🆕 عدد المرات القصوى للاستخدام**
- `current_uses` (Integer) — Default: `0` ← **🆕 عدد المرات المستخدمة حالياً**
- `is_active` (Boolean) — Default: `true` ← **🆕 لتمكين/تعطيل العرض بسرعة**
- `valid_from` (Timestamptz) — Nullable
- `valid_to` (Timestamptz) — Nullable
- `created_at` (Timestamptz) — Default: `now()`

---

### ❤️ جدول المفضلة (`wishlist`)
لسماح المستخدمين بحفظ المنتجات للرجوع إليها.
- `id` (UUID) — Primary Key
- `user_id` (UUID) — FK → `profiles(id)` ON DELETE CASCADE
- `product_id` (UUID) — FK → `products(id)` ON DELETE CASCADE
- `created_at` (Timestamptz) — Default: `now()`
- *(Unique Constraint: `user_id` + `product_id`)*

---

### 📝 جداول المحتوى (Content System)

#### جدول المقالات / المدونة (`blog_posts`) 🆕
> **سبب الإضافة**: الموقع يحتوي على أقسام كاملة للمدونة (`Blog`, `BlogGrid`, `BlogDetails`, `BlogDetailsWithSidebar`). حالياً البيانات في ملف ثابت `blogData.ts` فقط.

- `id` (UUID) — Primary Key
- `title` (String) — Required
- `slug` (String) — Unique ← لرابط المقال في الـ URL
- `content` (Text) — Required ← محتوى المقال الكامل (يمكن أن يكون HTML/Markdown)
- `excerpt` (Text) — Nullable ← ملخص قصير للعرض في قوائم المقالات
- `cover_image` (String) — Nullable
- `author_id` (UUID) — FK → `profiles(id)`, Nullable
- `views_count` (Integer) — Default: `0` ← حقل `views` موجود في `blogData.ts`
- `is_published` (Boolean) — Default: `false`
- `published_at` (Timestamptz) — Nullable
- `created_at` (Timestamptz) — Default: `now()`
- `updated_at` (Timestamptz) — Default: `now()`

#### جدول آراء العملاء (`testimonials`) 🆕
> **سبب الإضافة**: بيانات `testimonialsData.ts` حالياً ثابتة في الكود. تحويلها لجدول يسمح للأدمن بإدارتها من لوحة التحكم.

- `id` (UUID) — Primary Key
- `review` (Text) — Required
- `author_name` (String) — Required
- `author_img` (String) — Nullable
- `author_role` (String) — Nullable
- `is_visible` (Boolean) — Default: `true`
- `sort_order` (Integer) — Default: `0`
- `created_at` (Timestamptz) — Default: `now()`

---

### 📬 جداول التواصل (Communication)

#### جدول رسائل التواصل (`contact_messages`) 🆕
> **سبب الإضافة**: صفحة `Contact` تحتوي على نموذج (form) لإرسال الرسائل بحقول (اسم، بريد، موضوع، رسالة). حالياً لا يوجد مكان لحفظ هذه الرسائل.

- `id` (UUID) — Primary Key
- `name` (String) — Required
- `email` (String) — Required
- `subject` (String) — Nullable
- `message` (Text) — Required
- `is_read` (Boolean) — Default: `false` ← لتتبعها في لوحة التحكم
- `created_at` (Timestamptz) — Default: `now()`

#### جدول الاشتراك بالنشرة البريدية (`newsletter_subscribers`) 🆕
> **سبب الإضافة**: مكون `Newsletter` موجود في الموقع ويطلب البريد الإلكتروني، لكن لا يوجد مكان للتخزين.

- `id` (UUID) — Primary Key
- `email` (String) — Unique, Required
- `is_active` (Boolean) — Default: `true`
- `subscribed_at` (Timestamptz) — Default: `now()`

---

## 3️⃣ القيود (Constraints) و الفهارس (Indexes)

### الفهارس (Indexes):
| الجدول | الحقل | النوع | السبب |
| :--- | :--- | :--- | :--- |
| `products` | `name` | B-tree | البحث السريع في شريط البحث |
| `products` | `slug` | Unique | عناوين URL فريدة |
| `products` | `category_id` | B-tree | تسريع جلب المنتجات حسب التصنيف |
| `products` | `brand` | B-tree | فلترة حسب الماركة في صفحة Shop |
| `products` | `is_featured` | B-tree (Partial) | الصفحة الرئيسية تعرض المميزة فقط |
| `products` | `is_deal` | B-tree (Partial) | صفحة Deals تعرض العروض فقط |
| `products` | `created_at` | B-tree | ترتيب المنتجات حسب الأحدث |
| `product_images` | `product_id` | B-tree | جلب صور المنتج بسرعة |
| `product_reviews` | `product_id` | B-tree | جلب التقييمات بسرعة |
| `wishlist` | `user_id` | B-tree | جلب مفضلات المستخدم بسرعة |
| `blog_posts` | `slug` | Unique | عناوين URL فريدة للمقالات |
| `blog_posts` | `is_published` | B-tree (Partial) | عرض المقالات المنشورة فقط |
| `categories` | `slug` | Unique | عناوين URL فريدة للتصنيفات |
| `user_addresses` | `user_id` | B-tree | جلب عناوين المستخدم |

### القيود (Constraints):
- `ON DELETE CASCADE` على جميع جداول العلاقات (`wishlist`, `collection_products`, `product_images`, `product_reviews`, `user_addresses`, `saved_style_worlds`)
- `CHECK (rating >= 1 AND rating <= 5)` على حقل `rating` في `product_reviews`
- `CHECK (discount_value > 0)` على حقل `discount_value` في `offers`
- `CHECK (price >= 0)` على حقل `price` في `products`

---

## 4️⃣ نظام الصلاحيات وأمن البيانات (Authorization & Security)

### أدوار المستخدمين (User Roles):
- **User (مستخدم عادي)**: تصفح المنتجات، إضافة للمفضلة، كتابة تقييمات، إدارة عناوينه، حفظ أوضاع StyleHub.
- **Admin (مسؤول)**: صلاحيات CRUD كاملة على جميع الجداول عبر لوحة التحكم `/admin`. يتم تحديده بتغيير `is_admin = true` في قاعدة البيانات مباشرة.

### حماية البيانات (Row Level Security - RLS):

| الجدول | SELECT | INSERT | UPDATE | DELETE |
| :--- | :--- | :--- | :--- | :--- |
| `profiles` | المالك فقط | تلقائي عند التسجيل | المالك فقط | ❌ |
| `products`, `categories`, `collections` | ✅ الجميع | Admin فقط | Admin فقط | Admin فقط |
| `offers` | ✅ الجميع | Admin فقط | Admin فقط | Admin فقط |
| `blog_posts` (published) | ✅ الجميع | Admin فقط | Admin فقط | Admin فقط |
| `testimonials` (visible) | ✅ الجميع | Admin فقط | Admin فقط | Admin فقط |
| `wishlist` | المالك فقط | المالك فقط | المالك فقط | المالك فقط |
| `product_reviews` | ✅ الجميع | مسجّل الدخول | المالك فقط | المالك أو Admin |
| `user_addresses` | المالك فقط | المالك فقط | المالك فقط | المالك فقط |
| `saved_style_worlds` | المالك فقط | المالك فقط | المالك فقط | المالك فقط |
| `contact_messages` | Admin فقط | ✅ الجميع | Admin فقط | Admin فقط |
| `newsletter_subscribers` | Admin فقط | ✅ الجميع | Admin فقط | Admin فقط |

---

## 5️⃣ نظام المصادقة (Authentication System)

- **Email/Password**: مصادقة أساسية تعتمد على البريد الإلكتروني وكلمة المرور المشفرة.
- **OAuth Providers**: تسجيل دخول سريع عبر `Google` OAuth (واختيارياً `Apple`).
- **Session Management**: `JWT` (JSON Web Tokens) محفوظة في `HttpOnly Secure Cookies`.
- **Middleware Protection**: التحقق من الجلسة والصلاحيات في `middleware.ts`. أي مسار `/admin/*` يُعاد توجيه من لا يملك `is_admin = true` إلى الصفحة الرئيسية.

---

## 6️⃣ مخطط العلاقات (ER Diagram) 🆕

```
profiles ──────< user_addresses
   │
   ├──────< wishlist >──────── products
   │                              │
   ├──────< product_reviews >─────┤
   │                              │
   ├──────< saved_style_worlds    ├──────< product_images
   │                              │
   │                              ├──── categories
   │                              │
   │                              └──< collection_products >──── collections
   │
   └──────< blog_posts

offers (مستقل)
testimonials (مستقل)
contact_messages (مستقل)
newsletter_subscribers (مستقل)
```

---

## 7️⃣ ملخص التغييرات عن النسخة السابقة

| التغيير | التفصيل |
| :--- | :--- |
| **🆕 8 جداول جديدة** | `user_addresses`, `product_images`, `product_reviews`, `blog_posts`, `testimonials`, `contact_messages`, `newsletter_subscribers`, `saved_style_worlds` |
| **🔄 تعديات على `products`** | إضافة `slug`, `discounted_price`, `is_featured`, `is_deal`, `deal_tag`, `views_count`, `updated_at` |
| **🔄 تعديلات على `categories`** | إضافة `slug`, `description`, `image_url`, `sort_order` |
| **🔄 تعديلات على `collections`** | إضافة `slug`, `description`, `cover_image`, `tag`, `styles[]`, `colors[]` |
| **🔄 تعديلات على `profiles`** | إضافة `phone`, `updated_at` |
| **🔄 تعديلات على `offers`** | إضافة `min_purchase`, `max_uses`, `current_uses`, `is_active` |
| **🆕 متغيرات بيئة جديدة** | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `SMTP_HOST`, `SMTP_API_KEY` |
| **🆕 فهارس محسّنة** | 14 فهرس بدلاً من 2 |
| **🆕 مخطط RLS شامل** | جدول كامل يحدد صلاحيات كل جدول |
