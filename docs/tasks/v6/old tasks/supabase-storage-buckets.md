# FITOVA — Supabase Storage Buckets Plan

> **Author:** Senior Software Architect  
> **Date:** 2026-03-03  
> **Status:** 🟡 PLANNING  
> **Applies to:** Supabase Storage (S3-compatible via PostgREST)

---

## Overview

All media assets in FITOVA are stored in Supabase Storage. Each bucket has a defined access policy, folder hierarchy, and upload constraints. Files are served via Supabase CDN URLs.

---

## Bucket 1 — `product-images`

| Property | Value |
|----------|-------|
| **Access** | Public (read) |
| **Write** | Admin only (service role) |
| **Max file size** | 5 MB |
| **Allowed types** | `image/jpeg`, `image/png`, `image/webp`, `image/avif` |
| **CDN** | Yes — auto-cached |

### Folder Structure
```
product-images/
├── {product-id}/
│   ├── thumbnail.webp       ← Main card image (400×500 px recommended)
│   ├── preview-1.webp       ← Detail page full image
│   ├── preview-2.webp
│   ├── preview-3.webp
│   └── preview-4.webp
```

### Usage
- Admin uploads via Admin Dashboard (`/admin/products/[id]`)
- On product creation: upload → get public URL → INSERT into `product_images` table
- URL format: `https://<project>.supabase.co/storage/v1/object/public/product-images/{product-id}/thumbnail.webp`
- Required metadata stored in `product_images` table: `url`, `type` (`thumbnail | preview`), `sort_order`, `alt_text`

### RLS Policy (SQL)
```sql
-- Public read
CREATE POLICY product_images_public_read ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

-- Admin write only
CREATE POLICY product_images_admin_write ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'product-images'
    AND (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
  );
```

---

## Bucket 2 — `lookbook-images`

| Property | Value |
|----------|-------|
| **Access** | Public (read) |
| **Write** | Authenticated users (their own lookbooks) |
| **Max file size** | 5 MB |
| **Allowed types** | `image/jpeg`, `image/png`, `image/webp` |
| **CDN** | Yes |

### Folder Structure
```
lookbook-images/
├── {user-id}/
│   └── {collection-id}/
│       └── cover.webp     ← Lookbook cover image
```

### Usage
- User uploads during "Create Lookbook" flow (Step 1 — Details)
- After upload: URL stored in `collections.cover_image`
- If no image uploaded: UI defaults to dark gradient fallback

### RLS Policy (SQL)
```sql
-- Public read
CREATE POLICY lookbook_images_public_read ON storage.objects
  FOR SELECT USING (bucket_id = 'lookbook-images');

-- Authenticated users write to own folder only
CREATE POLICY lookbook_images_user_write ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'lookbook-images'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

-- Users can delete their own lookbook images
CREATE POLICY lookbook_images_user_delete ON storage.objects
  FOR DELETE USING (
    bucket_id = 'lookbook-images'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );
```

---

## Bucket 3 — `user-avatars`

| Property | Value |
|----------|-------|
| **Access** | Public (read) |
| **Write** | Authenticated users (own avatar only) |
| **Max file size** | 2 MB |
| **Allowed types** | `image/jpeg`, `image/png`, `image/webp` |
| **CDN** | Yes |

### Folder Structure
```
user-avatars/
├── {user-id}/
│   └── avatar.webp     ← Overwritten on each upload (single file per user)
```

### Usage
- User uploads from Profile page → Edit Profile section
- After upload: URL stored in `profiles.avatar_url`
- Displayed in: navbar account icon, review cards, lookbook creator badge, profile page

### Notes
- Always use the **same filename** (`avatar.webp`) so the URL stays constant and is cache-busted on re-upload
- Include a cache-busting query param `?t={timestamp}` when displaying post-upload

### RLS Policy (SQL)
```sql
-- Public read
CREATE POLICY avatars_public_read ON storage.objects
  FOR SELECT USING (bucket_id = 'user-avatars');

-- Users write to own folder only
CREATE POLICY avatars_user_write ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'user-avatars'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

CREATE POLICY avatars_user_update ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'user-avatars'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );
```

---

## Bucket 4 — `world-images`

| Property | Value |
|----------|-------|
| **Access** | Public (read) |
| **Write** | Authenticated users (own worlds) |
| **Max file size** | 3 MB |
| **Allowed types** | `image/jpeg`, `image/png`, `image/webp` |
| **CDN** | Yes |

### Folder Structure
```
world-images/
├── {user-id}/
│   └── {world-id}/
│       └── cover.webp     ← Style World cover image
```

### Usage
- Optional upload when user creates a "Style World" in Style Hub
- After upload: URL stored in `saved_style_worlds.image_url`
- Displayed on Profile page → Saved Worlds section

### RLS Policy (SQL)
```sql
-- Public read
CREATE POLICY world_images_public_read ON storage.objects
  FOR SELECT USING (bucket_id = 'world-images');

-- Users write to own folder only
CREATE POLICY world_images_user_write ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'world-images'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

CREATE POLICY world_images_user_delete ON storage.objects
  FOR DELETE USING (
    bucket_id = 'world-images'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );
```

---

## Bucket 5 — `review-attachments` *(Optional — Phase 3+)*

| Property | Value |
|----------|-------|
| **Access** | Public (read) |
| **Write** | Authenticated users (verified review image) |
| **Max file size** | 3 MB |
| **Allowed types** | `image/jpeg`, `image/png`, `image/webp` |
| **CDN** | Yes |
| **Status** | Optional — implement when review photo feature is confirmed |

### Folder Structure
```
review-attachments/
├── {product-id}/
│   └── {review-id}/
│       ├── photo-1.webp
│       └── photo-2.webp
```

### Usage
- User can optionally attach photos to a product review
- Max 3 photos per review
- After upload: URL array stored in `product_reviews.review_images[]`

### RLS Policy (SQL)
```sql
-- Public read
CREATE POLICY review_attachments_public_read ON storage.objects
  FOR SELECT USING (bucket_id = 'review-attachments');

-- Authenticated users write
CREATE POLICY review_attachments_user_write ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'review-attachments'
    AND auth.uid() IS NOT NULL
  );

-- Users delete their own review photos
CREATE POLICY review_attachments_user_delete ON storage.objects
  FOR DELETE USING (
    bucket_id = 'review-attachments'
    AND auth.uid() IS NOT NULL
  );
```

---

## Summary Table

| Bucket | Access | Write | Max Size | CDN | Priority |
|--------|--------|-------|----------|-----|----------|
| `product-images` | Public | Admin | 5 MB | ✅ | P0 — Required Now |
| `lookbook-images` | Public | Auth User | 5 MB | ✅ | P1 — Phase 4 |
| `user-avatars` | Public | Auth User | 2 MB | ✅ | P1 — Phase 6 |
| `world-images` | Public | Auth User | 3 MB | ✅ | P2 — Phase 5 |
| `review-attachments` | Public | Auth User | 3 MB | ✅ | P3 — Optional |

---

## How to Create Buckets in Supabase Dashboard

1. Navigate to **Storage** in Supabase Dashboard
2. Click **New Bucket**
3. Set name exactly as shown above (lowercase, hyphenated)
4. Toggle **Public bucket** ON for all listed buckets
5. Set **File size limit** as specified
6. Set **Allowed MIME types** as specified
7. Run the RLS policies from each section above in the **SQL Editor**

---

## Environment Variables Required

```env
# In .env.local
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>  # Server-side only — never expose client-side
```

---

## Upload Utility Pattern (Frontend)

All uploads go through a shared utility in `/lib/storage/upload.ts`:

```typescript
// /lib/storage/upload.ts — interface only (no implementation in this plan)
interface UploadOptions {
  bucket: 'product-images' | 'lookbook-images' | 'user-avatars' | 'world-images' | 'review-attachments';
  path: string;         // e.g., '{user-id}/avatar.webp'
  file: File;
  maxSizeBytes?: number;
  allowedTypes?: string[];
}

// Returns: { url: string } on success | throws Error on failure
// Validates file size and type client-side BEFORE upload
// Uses supabase.storage.from(bucket).upload(path, file, { upsert: true })
```

---

> **Note:** All bucket names are final and must not be renamed after creation, as URLs are stored in the database.
