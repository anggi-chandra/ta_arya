# Setup Storage Bucket untuk Upload Gambar

## Masalah: "Bucket not found" Error

Jika Anda mendapat error "Bucket not found" saat upload gambar, ikuti langkah-langkah berikut:

## 1. Buat Storage Bucket di Supabase

1. Buka Supabase Dashboard
2. Pergi ke **Storage** > **Buckets**
3. Klik **"+ New bucket"**
4. Isi detail bucket:
   - **Name**: `uploads`
   - **Public bucket**: ✅ Centang (agar file bisa diakses publik)
   - **File size limit**: `52428800` (50 MB) atau sesuaikan kebutuhan
   - **Allowed MIME types**: `image/*` atau biarkan kosong untuk semua jenis file
5. Klik **"Create bucket"**

## 2. Konfigurasi Storage Policies (Opsional)

Jika bucket dibuat sebagai public, Anda mungkin tidak perlu policies. Tapi jika ingin lebih aman:

1. Pergi ke **Storage** > **Policies** untuk bucket `uploads`
2. Buat policy untuk INSERT (upload):
   - **Policy name**: `Allow authenticated uploads`
   - **Allowed operation**: `INSERT`
   - **Policy definition**: 
     ```sql
     (bucket_id = 'uploads'::text) AND (auth.role() = 'authenticated'::text)
     ```
3. Buat policy untuk SELECT (read):
   - **Policy name**: `Allow public read`
   - **Allowed operation**: `SELECT`
   - **Policy definition**: 
     ```sql
     (bucket_id = 'uploads'::text)
     ```

## 3. Konfigurasi Environment Variables

Pastikan file `.env.local` atau environment variables Anda memiliki:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Cara mendapatkan Service Role Key:**
1. Buka Supabase Dashboard
2. Pergi ke **Settings** > **API**
3. Salin **service_role** key (bukan anon key!)
4. Tambahkan ke `.env.local`

**⚠️ PENTING:** Jangan commit service_role key ke Git! Pastikan `.env.local` ada di `.gitignore`.

## 4. Verifikasi Konfigurasi

Setelah konfigurasi, coba upload gambar lagi. Jika masih error:

1. **Cek console browser** untuk error detail
2. **Cek server logs** untuk error dari API
3. **Pastikan bucket name** adalah `uploads` (huruf kecil)
4. **Pastikan service role key** sudah dikonfigurasi dengan benar

## 5. Troubleshooting

### Error: "Bucket not found"
- Pastikan bucket `uploads` sudah dibuat di Supabase
- Pastikan nama bucket tepat: `uploads` (huruf kecil, tidak ada spasi)

### Error: "Permission denied"
- Pastikan bucket dibuat sebagai public, ATAU
- Tambahkan policies seperti di langkah 2
- Pastikan service_role key sudah dikonfigurasi

### Error: "Service role key is not set"
- Tambahkan `SUPABASE_SERVICE_ROLE_KEY` ke `.env.local`
- Restart development server setelah menambahkan environment variable

### Error: "File size too large"
- Pastikan ukuran file kurang dari 5MB
- Atau ubah limit di API route (`app/api/admin/upload/route.ts`)

## Struktur Folder di Bucket

Setelah konfigurasi, file akan disimpan dengan struktur:
```
uploads/
  ├── events/
  │   └── [timestamp]-[random].jpg
  ├── tournaments/
  │   └── [timestamp]-[random].jpg
  └── teams/
      └── [timestamp]-[random].jpg
```

## Catatan

- Service role key memiliki akses penuh ke semua bucket, jadi tidak perlu policies jika menggunakan service role key
- Jika menggunakan anon key, Anda perlu policies
- Bucket `uploads` harus dibuat sebelum menggunakan fitur upload

