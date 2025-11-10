# Setup Storage Policies untuk Upload Gambar

## Cara Menggunakan SQL Schema

### Opsi 1: Menggunakan File `storage-policies.sql` (Recommended)

1. Buka Supabase Dashboard
2. Pergi ke **SQL Editor**
3. Klik **"New query"**
4. Copy semua isi dari file `supabase/storage-policies.sql`
5. Paste ke SQL Editor
6. Klik **"Run"** untuk menjalankan SQL

### Opsi 2: Menggunakan Bagian Storage Policies di `schema.sql`

1. Buka Supabase Dashboard
2. Pergi ke **SQL Editor**
3. Scroll ke bagian "STORAGE BUCKET POLICIES" di file `schema.sql`
4. Copy bagian policies tersebut
5. Paste ke SQL Editor
6. Klik **"Run"** untuk menjalankan SQL

## Prerequisites (Yang Harus Dilakukan Sebelumnya)

### 1. Buat Storage Bucket

**PENTING:** Bucket harus dibuat terlebih dahulu sebelum menjalankan policies!

1. Buka Supabase Dashboard
2. Pergi ke **Storage** > **Buckets**
3. Klik **"+ New bucket"**
4. Isi detail:
   - **Name**: `uploads` (huruf kecil, tepat seperti ini)
   - **Public bucket**: ✅ Centang (agar file bisa diakses publik)
   - **File size limit**: `52428800` (50 MB) atau sesuai kebutuhan
   - **Allowed MIME types**: `image/*` atau biarkan kosong
5. Klik **"Create bucket"**

### 2. Verifikasi Bucket

Setelah bucket dibuat, pastikan:
- Nama bucket: `uploads` (huruf kecil)
- Status: Public (jika ingin akses publik)
- Policies: 0 (akan dibuat setelah menjalankan SQL)

## Policies yang Akan Dibuat

Setelah menjalankan SQL, akan dibuat 4 policies:

1. **Allow public read access to uploads**
   - Siapa saja bisa membaca/melihat file dari bucket `uploads`
   - Berguna untuk menampilkan gambar di website

2. **Allow authenticated uploads to uploads**
   - Hanya user yang sudah login (authenticated) yang bisa upload file
   - Menggunakan anon key dengan session

3. **Allow authenticated users to update uploads**
   - User authenticated bisa update/replace file
   - Berguna untuk edit gambar

4. **Allow authenticated users to delete uploads**
   - User authenticated bisa delete file
   - Berguna untuk menghapus gambar

## Catatan Penting

### Service Role Key vs Policies

- **Service Role Key**: Melewati semua RLS policies
  - Jika API route menggunakan service_role key, policies tidak diperlukan
  - Tapi policies tetap disarankan untuk keamanan tambahan

- **Anon Key**: Memerlukan policies
  - Jika menggunakan anon key, policies WAJIB ada
  - Tanpa policies, upload akan gagal dengan error "Permission denied"

### Verifikasi Policies

Setelah menjalankan SQL, cek policies:

1. Buka Supabase Dashboard
2. Pergi ke **Storage** > **Policies**
3. Pilih bucket `uploads`
4. Pastikan ada 4 policies:
   - Allow public read access to uploads
   - Allow authenticated uploads to uploads
   - Allow authenticated users to update uploads
   - Allow authenticated users to delete uploads

## Troubleshooting

### Error: "policy already exists"
- Policies sudah ada, tidak perlu dibuat lagi
- Atau hapus policies yang lama terlebih dahulu

### Error: "bucket does not exist"
- Pastikan bucket `uploads` sudah dibuat di Storage dashboard
- Pastikan nama bucket tepat: `uploads` (huruf kecil)

### Error: "permission denied" saat upload
- Pastikan policies sudah dibuat
- Pastikan user sudah login (authenticated)
- Atau pastikan API route menggunakan service_role key

### Upload masih gagal setelah membuat policies
1. Pastikan `SUPABASE_SERVICE_ROLE_KEY` sudah dikonfigurasi di `.env.local`
2. Restart development server
3. Cek console browser untuk error detail
4. Cek server logs untuk error dari API

## Testing

Setelah setup:

1. Login sebagai admin
2. Buka `/admin/events`
3. Coba upload gambar
4. Jika berhasil, gambar akan muncul di preview
5. Klik "Buat Event" untuk menyimpan

## File yang Dibuat

- `supabase/storage-policies.sql` - File SQL lengkap dengan dokumentasi
- `supabase/schema.sql` - Schema utama (sudah include policies)
- `STORAGE_SETUP.md` - Dokumentasi setup storage
- `supabase/README_STORAGE.md` - File ini

