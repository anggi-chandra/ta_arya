# Storage Schema SQL - Panduan Lengkap

## 📋 Overview

File `storage-schema.sql` berisi schema SQL lengkap untuk setup Storage Bucket dan Policies di Supabase. File ini mencakup:

1. **Storage Policies** - Policies untuk mengatur akses ke storage bucket
2. **Helper Functions** - Functions untuk memudahkan kerja dengan storage
3. **Views** - Views untuk melihat dan menganalisis file storage
4. **Triggers** (Optional) - Triggers untuk logging storage operations

## 🚀 Cara Menggunakan

### Step 1: Buat Storage Bucket

**PENTING:** Bucket harus dibuat terlebih dahulu melalui Dashboard sebelum menjalankan SQL!

1. Buka **Supabase Dashboard**
2. Pergi ke **Storage** > **Buckets**
3. Klik **"+ New bucket"**
4. Isi detail:
   - **Name**: `uploads`
   - **Public bucket**: ✅ (checked) - untuk akses publik
   - **File size limit**: `52428800` (50 MB) atau sesuai kebutuhan
   - **Allowed MIME types**: `image/*` atau kosongkan
5. Klik **"Create bucket"**

### Step 2: Jalankan SQL Schema

1. Buka **Supabase Dashboard**
2. Pergi ke **SQL Editor**
3. Klik **"New query"**
4. Buka file `supabase/storage-schema.sql`
5. **Copy semua isi** file (Ctrl+A, Ctrl+C)
6. **Paste** ke SQL Editor (Ctrl+V)
7. **Edit** function `get_storage_url`:
   - Ganti `'your-project-id'` dengan Project ID Supabase Anda
   - Atau gunakan Supabase URL lengkap Anda
8. Klik **"Run"** untuk menjalankan SQL

### Step 3: Verifikasi

Setelah menjalankan SQL, verifikasi:

1. **Policies**: 
   - Buka **Storage** > **Policies**
   - Pilih bucket `uploads`
   - Pastikan ada 4 policies:
     - Allow public read access to uploads
     - Allow authenticated uploads to uploads
     - Allow authenticated users to update uploads
     - Allow authenticated users to delete uploads

2. **Functions**:
   - Buka **SQL Editor**
   - Jalankan: `SELECT public.get_storage_url('uploads', 'test.jpg');`
   - Pastikan function bekerja

3. **Views**:
   - Jalankan: `SELECT * FROM public.storage_uploads_view LIMIT 10;`
   - Pastikan view bisa diakses

## 📁 Struktur File

File `storage-schema.sql` terdiri dari:

### 1. Storage Policies
- **Public Read Access**: Siapa saja bisa membaca file
- **Authenticated Upload**: Hanya user login yang bisa upload
- **Authenticated Update**: User login bisa update file
- **Authenticated Delete**: User login bisa delete file

### 2. Helper Functions

#### `get_storage_url(bucket_name, file_path)`
Mendapatkan public URL untuk file storage.

```sql
SELECT public.get_storage_url('uploads', 'events/image.jpg');
-- Returns: https://your-project-id.supabase.co/storage/v1/object/public/uploads/events/image.jpg
```

#### `is_admin_or_moderator(user_id)`
Mengecek apakah user adalah admin atau moderator.

```sql
SELECT public.is_admin_or_moderator('user-uuid-here');
-- Returns: true/false
```

#### `get_storage_file_size(bucket_name, file_path)`
Mendapatkan ukuran file dalam bytes.

```sql
SELECT public.get_storage_file_size('uploads', 'events/image.jpg');
-- Returns: 1024000 (bytes)
```

### 3. Views

#### `storage_uploads_view`
Menampilkan semua file di bucket `uploads` dengan metadata.

```sql
SELECT * FROM public.storage_uploads_view;
```

#### `storage_stats_view`
Menampilkan statistik penggunaan storage.

```sql
SELECT * FROM public.storage_stats_view;
-- Returns: total_files, total_size_bytes, total_size_mb, etc.
```

#### `storage_files_by_folder`
Menampilkan file yang dikelompokkan berdasarkan folder.

```sql
SELECT * FROM public.storage_files_by_folder;
-- Returns: folder, file_count, total_size_bytes, total_size_mb
```

### 4. Triggers (Optional)

Triggers untuk logging storage operations ke `analytics_events` table.
Uncomment bagian triggers di SQL jika ingin menggunakan logging.

## 🔧 Konfigurasi

### Mengganti Project ID

Edit function `get_storage_url` di SQL:

```sql
CREATE OR REPLACE FUNCTION public.get_storage_url(bucket_name TEXT, file_path TEXT)
RETURNS TEXT
LANGUAGE sql
STABLE
AS $$
  SELECT 
    'https://YOUR-PROJECT-ID.supabase.co/storage/v1/object/public/' || 
    bucket_name || 
    '/' || 
    file_path;
$$;
```

Ganti `YOUR-PROJECT-ID` dengan Project ID Supabase Anda.

### Menggunakan Admin/Moderator Only Policies

Jika ingin hanya admin/moderator yang bisa manage uploads:

1. Comment bagian **BASIC POLICIES**
2. Uncomment bagian **ADMIN/MODERATOR ONLY POLICIES**
3. Jalankan SQL lagi

## 📊 Query Examples

### Melihat semua file di storage
```sql
SELECT * FROM public.storage_uploads_view 
ORDER BY created_at DESC 
LIMIT 20;
```

### Melihat statistik storage
```sql
SELECT * FROM public.storage_stats_view;
```

### Melihat file berdasarkan folder
```sql
SELECT * FROM public.storage_files_by_folder;
```

### Mencari file berdasarkan nama
```sql
SELECT * FROM public.storage_uploads_view 
WHERE file_path LIKE '%events%';
```

### Melihat file terbesar
```sql
SELECT * FROM public.storage_uploads_view 
ORDER BY file_size DESC 
LIMIT 10;
```

## 🔒 Security Notes

1. **Service Role Key**: 
   - Jika menggunakan service_role key di API routes, policies tidak diperlukan
   - Service role key melewati semua RLS policies
   - Tapi policies tetap disarankan untuk keamanan tambahan

2. **Public Read Access**:
   - Policy "Allow public read access" membuat semua file bisa diakses publik
   - Pastikan tidak ada data sensitif di bucket `uploads`
   - Untuk data sensitif, gunakan private bucket dengan signed URLs

3. **Authenticated Access**:
   - Policies untuk authenticated users memerlukan user login
   - Pastikan authentication sudah dikonfigurasi dengan benar

## 🐛 Troubleshooting

### Error: "bucket does not exist"
- **Solusi**: Buat bucket `uploads` di Dashboard terlebih dahulu

### Error: "policy already exists"
- **Solusi**: Policies sudah ada, tidak perlu dibuat lagi
- Atau hapus policies yang lama terlebih dahulu

### Error: "permission denied"
- **Solusi**: 
  - Pastikan policies sudah dibuat
  - Pastikan user sudah login (authenticated)
  - Atau pastikan API route menggunakan service_role key

### Error: "function does not exist"
- **Solusi**: Pastikan semua functions sudah dibuat dengan benar
  - Jalankan SQL lagi
  - Pastikan tidak ada error saat membuat functions

### Views tidak menampilkan data
- **Solusi**: 
  - Pastikan bucket `uploads` sudah dibuat
  - Pastikan sudah ada file di bucket
  - Pastikan views sudah dibuat dengan benar

## 📝 Notes

1. **Bucket Creation**: Bucket tidak bisa dibuat melalui SQL, harus melalui Dashboard atau API
2. **File Structure**: Files disimpan dengan struktur `uploads/events/`, `uploads/tournaments/`, dll.
3. **Testing**: Setelah setup, test upload functionality di aplikasi
4. **Backup**: Simpan SQL schema untuk backup dan dokumentasi

## 🔗 Related Files

- `supabase/storage-policies.sql` - File SQL untuk policies saja
- `supabase/storage-policies-clean.sql` - File SQL bersih untuk policies
- `supabase/schema.sql` - Schema utama (sudah include storage policies)
- `STORAGE_SETUP.md` - Dokumentasi setup storage
- `supabase/README_STORAGE.md` - Panduan setup storage policies

## 📞 Support

Jika ada masalah atau pertanyaan:
1. Cek dokumentasi Supabase Storage
2. Cek error messages di SQL Editor
3. Verifikasi bucket dan policies sudah dibuat dengan benar
4. Test dengan user yang berbeda (public, authenticated, admin)

