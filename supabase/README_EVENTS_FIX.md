# Fix: Gagal Membuat Event - Database Schema

## 🔍 Masalah

Error "Gagal membuat event" terjadi karena field `live_url` dan `game` tidak ada di tabel `events` di database.

## ✅ Solusi

### Step 1: Tambahkan Field ke Database

Jalankan SQL berikut di Supabase SQL Editor:

```sql
-- Add game field to events table (if not exists)
ALTER TABLE IF EXISTS public.events
  ADD COLUMN IF NOT EXISTS game text;

-- Add live_url field to events table (if not exists)
ALTER TABLE IF EXISTS public.events
  ADD COLUMN IF NOT EXISTS live_url text;
```

Atau gunakan file migration:
- Buka file `supabase/migrations/add-events-fields.sql`
- Copy isinya
- Paste ke Supabase SQL Editor
- Klik "Run"

### Step 2: Verifikasi Field Sudah Ditambahkan

Jalankan query berikut untuk memverifikasi:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'events'
ORDER BY ordinal_position;
```

Pastikan ada field:
- `game` (text, nullable)
- `live_url` (text, nullable)

### Step 3: Test Create Event

1. Buka aplikasi
2. Login sebagai admin
3. Buka `/admin/events`
4. Isi form create event
5. Klik "Buat Event"
6. Pastikan event berhasil dibuat

## 📋 Field yang Diperlukan di Tabel Events

Tabel `events` harus memiliki field berikut:

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| id | uuid | NOT NULL | Primary key |
| title | text | NOT NULL | Judul event |
| description | text | NULL | Deskripsi event |
| game | text | NULL | Nama game |
| image_url | text | NULL | URL gambar thumbnail |
| location | text | NULL | Lokasi event |
| starts_at | timestamptz | NOT NULL | Waktu mulai |
| ends_at | timestamptz | NULL | Waktu selesai |
| max_participants | int | NULL | Maksimal peserta |
| price_cents | int | NULL | Harga dalam cents |
| live_url | text | NULL | URL streaming/live |
| created_by | uuid | NULL | User yang membuat |
| created_at | timestamptz | NULL | Waktu dibuat |

## 🔧 Troubleshooting

### Error: "column does not exist"
- **Penyebab**: Field belum ditambahkan ke database
- **Solusi**: Jalankan migration SQL di Step 1

### Error: "permission denied"
- **Penyebab**: User tidak memiliki permission untuk insert
- **Solusi**: 
  - Pastikan user sudah login
  - Pastikan user memiliki role admin/moderator
  - Cek RLS policies di tabel events

### Error: "Failed to create event"
- **Penyebab**: Ada error dari database
- **Solusi**:
  - Cek error message di console browser
  - Cek server logs untuk detail error
  - Pastikan semua field yang diperlukan sudah ada
  - Pastikan data yang dikirim valid (title dan starts_at wajib)

### Error: "Title and start date are required"
- **Penyebab**: Field title atau starts_at kosong
- **Solusi**: Pastikan form sudah diisi dengan benar

### Error: "End date must be after start date"
- **Penyebab**: End date sebelum start date
- **Solusi**: Pastikan end date setelah start date

## 📝 Migration SQL Lengkap

File `supabase/migrations/add-events-fields.sql` berisi SQL untuk menambahkan field yang diperlukan.

## 🧪 Testing

Setelah migration, test dengan:

1. **Create Event**:
   - Buka `/admin/events`
   - Isi form
   - Klik "Buat Event"
   - Pastikan berhasil

2. **Edit Event**:
   - Klik "Edit" pada event
   - Ubah data
   - Klik "Simpan"
   - Pastikan berhasil

3. **Delete Event**:
   - Klik "Hapus" pada event
   - Konfirmasi
   - Pastikan berhasil

## 📚 Related Files

- `supabase/schema.sql` - Schema database utama
- `supabase/migrations/add-events-fields.sql` - Migration SQL
- `app/api/admin/events/route.ts` - API route untuk events
- `app/admin/events/page.tsx` - Admin page untuk events

## ⚠️ Important Notes

1. **Backup Database**: Sebelum menjalankan migration, backup database terlebih dahulu
2. **Test di Development**: Test migration di development environment sebelum production
3. **Field Nullable**: Field `game` dan `live_url` adalah nullable, jadi tidak wajib diisi
4. **Migration Order**: Jalankan migration setelah membuat tabel events

## 🚀 Next Steps

Setelah migration berhasil:

1. Verifikasi field sudah ditambahkan
2. Test create event
3. Test edit event
4. Test delete event
5. Monitor error logs untuk masalah lain

