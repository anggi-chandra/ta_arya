# Tambah Field Status ke Events

## 📋 Ringkasan

Field `status` telah ditambahkan ke tabel `events` untuk memungkinkan admin mengatur status event secara manual. Status dapat berupa: `draft`, `upcoming`, `ongoing`, `completed`, atau `cancelled`.

## ✅ Perubahan yang Dilakukan

### 1. Database Schema

**File**: `supabase/migrations/add-events-status.sql`

- Menambahkan kolom `status` ke tabel `events`
- Default value: `'upcoming'`
- Constraint: hanya menerima nilai `'draft'`, `'upcoming'`, `ongoing'`, `'completed'`, `'cancelled'`
- Update event yang sudah ada berdasarkan tanggal
- Membuat index pada kolom `status` untuk performa query

**File**: `supabase/schema.sql`

- Menambahkan kolom `status` ke definisi tabel `events`

### 2. Admin Form

**File**: `app/admin/events/page.tsx`

- Menambahkan state `newStatus` dan `editStatus`
- Menambahkan dropdown status di form create event
- Menambahkan dropdown status di form edit event
- Update TypeScript interface `EventItem` untuk include `status`
- Update create dan update mutations untuk include status

### 3. API Routes

**File**: `app/api/admin/events/route.ts` (POST)

- Menerima parameter `status` dari request body
- Validasi status (hanya menerima nilai yang valid)
- Default ke `'upcoming'` jika tidak ada atau invalid
- Menyimpan status ke database saat create event

**File**: `app/api/admin/events/[id]/route.ts` (PUT)

- Menerima parameter `status` dari request body
- Validasi status (hanya menerima nilai yang valid)
- Update status di database saat update event

## 📝 Status Values

| Status | Description |
|--------|-------------|
| `draft` | Event belum dipublikasikan (tidak muncul di halaman publik) |
| `upcoming` | Event akan datang (belum dimulai) |
| `ongoing` | Event sedang berlangsung |
| `completed` | Event sudah selesai |
| `cancelled` | Event dibatalkan |

## 🔧 Cara Menggunakan

### 1. Jalankan Migration

Jalankan SQL migration di Supabase SQL Editor:

```sql
-- Copy isi file supabase/migrations/add-events-status.sql
-- Paste ke Supabase SQL Editor
-- Klik "Run"
```

Atau jalankan langsung:

```sql
ALTER TABLE IF EXISTS public.events
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'upcoming' 
  CHECK (status IN ('draft', 'upcoming', 'ongoing', 'completed', 'cancelled'));

-- Update existing events
UPDATE public.events
SET status = 'upcoming'
WHERE status IS NULL AND starts_at > NOW();

UPDATE public.events
SET status = 'ongoing'
WHERE status IS NULL AND starts_at <= NOW() AND (ends_at IS NULL OR ends_at >= NOW());

UPDATE public.events
SET status = 'completed'
WHERE status IS NULL AND ends_at IS NOT NULL AND ends_at < NOW();

UPDATE public.events
SET status = 'upcoming'
WHERE status IS NULL;

-- Create index
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
```

### 2. Test Create Event

1. Buka `/admin/events`
2. Isi form create event
3. Pilih status dari dropdown (default: "Akan Datang")
4. Klik "Buat Event"
5. Pastikan event berhasil dibuat dengan status yang dipilih

### 3. Test Edit Event

1. Buka `/admin/events`
2. Klik "Edit" pada event
3. Ubah status dari dropdown
4. Klik "Simpan"
5. Pastikan status berhasil diupdate

## 🎯 Filter by Status

Status dapat digunakan untuk filter event di admin panel:

- **Semua Status**: Tampilkan semua event
- **Akan Datang**: Hanya event dengan status `upcoming`
- **Berlangsung**: Hanya event dengan status `ongoing`
- **Selesai**: Hanya event dengan status `completed`

## ⚠️ Important Notes

1. **Default Status**: Event baru akan memiliki status `upcoming` secara default
2. **Draft Events**: Event dengan status `draft` tidak akan muncul di halaman publik
3. **Status vs Dates**: Status dapat diatur secara manual, tidak hanya berdasarkan tanggal
4. **Validation**: API route akan memvalidasi status dan default ke `upcoming` jika invalid

## 📚 Related Files

- `supabase/migrations/add-events-status.sql` - Migration SQL
- `supabase/schema.sql` - Database schema
- `app/admin/events/page.tsx` - Admin form
- `app/api/admin/events/route.ts` - Create event API
- `app/api/admin/events/[id]/route.ts` - Update event API

## 🐛 Troubleshooting

### Error: "column status does not exist"

**Penyebab**: Migration belum dijalankan

**Solusi**: Jalankan migration SQL di Supabase SQL Editor

### Error: "invalid input value for enum status"

**Penyebab**: Status yang dikirim tidak valid

**Solusi**: Pastikan status adalah salah satu dari: `draft`, `upcoming`, `ongoing`, `completed`, `cancelled`

### Status tidak tersimpan

**Penyebab**: 
- API route tidak menerima status
- Status tidak valid

**Solusi**: 
- Cek API route untuk memastikan status diterima dan divalidasi
- Cek browser console untuk error
- Cek server logs untuk error dari API

## 🚀 Next Steps

1. **Filter Public Events**: Update public API untuk hanya menampilkan event dengan status `upcoming`, `ongoing`, atau `completed` (tidak termasuk `draft` dan `cancelled`)
2. **Status Badge**: Tampilkan badge status di halaman event detail
3. **Auto Update Status**: Buat cron job atau trigger untuk auto-update status berdasarkan tanggal (opsional)

