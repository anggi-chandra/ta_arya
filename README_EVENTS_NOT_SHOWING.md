# Troubleshooting: Event Tidak Muncul di Dashboard/Homepage

## 🔍 Masalah

Event berhasil dibuat di database, tapi tidak muncul di:
1. Admin Dashboard (Total Event = 0)
2. Admin Events Page (Tidak ada event)
3. Homepage (Event Populer tidak muncul)

## ✅ Solusi yang Sudah Diterapkan

### 1. Admin Dashboard - Fetch Data
- ✅ Dashboard sekarang fetch data dari API `/api/admin/events`
- ✅ Menampilkan total events yang sebenarnya
- ✅ Auto-refresh setiap 30 detik

### 2. API Route - Query Diperbaiki
- ✅ Menghapus relationship query yang menggunakan view `event_stats`
- ✅ Query sederhana: hanya `select('*')` dari tabel `events`
- ✅ Menghitung participants secara manual dari `event_registrations`
- ✅ Menambahkan creator info secara terpisah

### 3. Error Handling
- ✅ Error handling yang lebih baik di admin events page
- ✅ Logging untuk debugging
- ✅ Pesan error yang informatif

## 🔧 Troubleshooting Steps

### Step 1: Cek Authentication

Pastikan user sudah login dan memiliki role admin/moderator:

1. **Cek Session**:
   - Buka browser DevTools → Application → Cookies
   - Pastikan ada cookie `next-auth.session-token`

2. **Cek Role di Database**:
   ```sql
   SELECT * FROM public.user_roles 
   WHERE user_id = 'your-user-id';
   ```

3. **Test API Endpoint**:
   ```bash
   # Test dengan curl (setelah login)
   curl -X GET http://localhost:3000/api/admin/events?page=1&limit=10 \
     -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
   ```

### Step 2: Cek RLS Policies

Pastikan RLS policies memungkinkan akses:

```sql
-- Cek policies di tabel events
SELECT * FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'events';
```

Pastikan ada policy:
- `events readable` - untuk SELECT (public access)
- `authenticated can create events` - untuk INSERT
- `event creators can modify` - untuk UPDATE

### Step 3: Cek Data di Database

Verifikasi event ada di database:

```sql
-- Cek semua events
SELECT id, title, starts_at, created_at, created_by 
FROM public.events 
ORDER BY created_at DESC;

-- Cek event yang baru dibuat
SELECT * FROM public.events 
WHERE title LIKE '%Valorant%';
```

### Step 4: Cek Server Logs

Cek console/terminal untuk error:

1. **Browser Console**: 
   - Buka DevTools → Console
   - Cek error saat fetch events

2. **Server Logs**:
   - Cek terminal dimana `npm run dev` berjalan
   - Cek error dari API route

### Step 5: Test API Route Langsung

Test API route secara langsung:

```bash
# Test admin events API
curl http://localhost:3000/api/admin/events?page=1&limit=10

# Test public events API
curl http://localhost:3000/api/events?status=upcoming&limit=3
```

## 🐛 Common Issues

### Issue 1: "Unauthorized" Error

**Penyebab**: User belum login atau tidak memiliki role

**Solusi**:
1. Login sebagai admin
2. Pastikan user memiliki role admin/moderator di database
3. Cek NextAuth session aktif

### Issue 2: Events Tidak Muncul di Homepage

**Penyebab**: Homepage filter `status=upcoming` yang hanya menampilkan events dengan `starts_at > now`

**Solusi**:
1. Cek `starts_at` event di database
2. Pastikan `starts_at` di masa depan
3. Atau ubah filter di homepage untuk menampilkan semua events

### Issue 3: Events Tidak Muncul di Admin Events Page

**Penyebab**: 
- Filter status aktif
- RLS policies menghalangi
- Query error

**Solusi**:
1. Pastikan tidak ada filter status aktif (kosongkan dropdown "Semua Status")
2. Cek server logs untuk error
3. Cek RLS policies

### Issue 4: Total Event = 0 di Dashboard

**Penyebab**: 
- API route tidak bisa fetch data
- Authentication error
- RLS policies menghalangi

**Solusi**:
1. Cek browser console untuk error
2. Cek server logs
3. Test API endpoint secara langsung
4. Pastikan authentication bekerja

## 📋 Checklist

- [ ] User sudah login sebagai admin
- [ ] User memiliki role admin/moderator di database
- [ ] NextAuth session aktif
- [ ] Event ada di database (verifikasi dengan SQL)
- [ ] RLS policies memungkinkan SELECT pada tabel events
- [ ] API route `/api/admin/events` bisa diakses
- [ ] Tidak ada error di browser console
- [ ] Tidak ada error di server logs
- [ ] Filter status kosong (untuk melihat semua events)

## 🔍 Debugging Commands

### Cek Events di Database
```sql
SELECT 
  id,
  title,
  starts_at,
  ends_at,
  created_at,
  created_by
FROM public.events
ORDER BY created_at DESC;
```

### Cek RLS Policies
```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'events';
```

### Cek User Roles
```sql
SELECT 
  ur.user_id,
  ur.role,
  u.email
FROM public.user_roles ur
LEFT JOIN auth.users u ON u.id = ur.user_id;
```

### Test API dengan curl
```bash
# Test admin events (perlu session cookie)
curl -X GET "http://localhost:3000/api/admin/events?page=1&limit=10" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -v

# Test public events
curl -X GET "http://localhost:3000/api/events?status=upcoming&limit=3" \
  -v
```

## 🚀 Next Steps

1. **Cek Authentication**: Pastikan user sudah login dan memiliki role
2. **Cek Database**: Verifikasi event ada di database
3. **Cek Logs**: Lihat error di browser console dan server logs
4. **Test API**: Test API endpoint secara langsung
5. **Cek RLS**: Pastikan RLS policies memungkinkan akses

## 📝 File yang Diubah

1. `app/admin/page.tsx` - Menambahkan fetch data untuk stats
2. `app/api/admin/events/route.ts` - Memperbaiki query dan error handling
3. `app/admin/events/page.tsx` - Memperbaiki error handling dan UI
4. `app/api/events/route.ts` - Memperbaiki query untuk public API

## ⚠️ Important Notes

1. **Service Role Key**: API route menggunakan service role key yang bypass RLS
2. **Authentication**: Admin routes memerlukan NextAuth session
3. **RLS Policies**: Public API menggunakan anon key, jadi perlu RLS policies
4. **Filter Status**: Homepage filter `upcoming` hanya menampilkan events di masa depan

## 🔗 Related Files

- `app/admin/page.tsx` - Admin dashboard
- `app/admin/events/page.tsx` - Admin events page
- `app/api/admin/events/route.ts` - Admin events API
- `app/api/events/route.ts` - Public events API
- `app/page.tsx` - Homepage
- `supabase/schema.sql` - Database schema

