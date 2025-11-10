# Fix: Authentication Error - "mock-admin-id" UUID Error

## 🔍 Masalah

Error: `"invalid input syntax for type uuid: "mock-admin-id""`

Penyebab: Function `withModeratorAuth` dan `withAdminAuth` masih menggunakan mock user dengan ID `"mock-admin-id"` untuk testing, bukan mengambil user dari NextAuth session.

## ✅ Solusi

### 1. Authentication Middleware Diperbaiki

**File: `lib/auth.ts`**

- `withModeratorAuth`: Sekarang menggunakan `getCurrentUserFromSession` untuk mengambil user dari NextAuth session
- `withAdminAuth`: Sekarang menggunakan `getCurrentUserFromSession` untuk mengambil user dari NextAuth session
- Menambahkan validasi UUID untuk memastikan user.id valid

### 2. API Route Diperbaiki

**File: `app/api/admin/events/route.ts`**

- Menggunakan service role key untuk database operations (karena auth sudah diverifikasi)
- Menambahkan validasi UUID untuk user.id sebelum insert
- Error handling yang lebih baik

## 📋 Requirements

### 1. User Harus Login

Pastikan user sudah login melalui NextAuth sebelum mengakses admin panel.

### 2. User Harus Memiliki Role

User harus memiliki role `admin` atau `moderator` di database:

```sql
-- Cek role user
SELECT * FROM public.user_roles WHERE user_id = 'user-uuid-here';

-- Tambahkan role admin (jika belum ada)
INSERT INTO public.user_roles (user_id, role, granted_at)
VALUES ('user-uuid-here', 'admin', NOW());
```

### 3. NextAuth Session Harus Aktif

Pastikan NextAuth session aktif dan user sudah ter-authenticate.

## 🔧 Cara Menggunakan

### Step 1: Login Sebagai Admin

1. Buka aplikasi
2. Login dengan email dan password
3. Pastikan user memiliki role admin/moderator

### Step 2: Akses Admin Panel

1. Setelah login, akses `/admin/events`
2. Pastikan tidak ada error "Unauthorized"

### Step 3: Create Event

1. Isi form create event
2. Klik "Buat Event"
3. Pastikan event berhasil dibuat

## 🧪 Testing

### Test 1: Login dan Cek Session

```bash
# Login melalui browser
# Cek apakah session aktif di browser DevTools > Application > Cookies
```

### Test 2: Cek User Role

```sql
-- Query di Supabase SQL Editor
SELECT 
  u.id,
  u.email,
  ur.role
FROM auth.users u
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
WHERE u.email = 'your-email@example.com';
```

### Test 3: Test API Endpoint

```bash
# Test dengan curl (setelah login)
curl -X POST http://localhost:3000/api/admin/events \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "title": "Test Event",
    "starts_at": "2025-12-31T00:00:00Z"
  }'
```

## 🐛 Troubleshooting

### Error: "Unauthorized - Please sign in"

**Penyebab**: User belum login atau session expired

**Solusi**:
1. Login kembali
2. Cek apakah NextAuth session aktif
3. Cek cookie `next-auth.session-token` di browser

### Error: "Forbidden - Moderator access required"

**Penyebab**: User tidak memiliki role admin/moderator

**Solusi**:
1. Cek role user di database
2. Tambahkan role admin/moderator jika belum ada
3. Gunakan API `/api/admin/create-admin` untuk menambahkan role

### Error: "Invalid user authentication. Please sign in again."

**Penyebab**: User ID tidak valid (bukan UUID)

**Solusi**:
1. Login kembali
2. Pastikan NextAuth session valid
3. Cek apakah user.id adalah UUID yang valid

### Error: "Failed to create event: [database error]"

**Penyebab**: Error dari database

**Solusi**:
1. Cek error message untuk detail
2. Pastikan semua field database sudah ada (game, live_url)
3. Cek RLS policies di database
4. Cek server logs untuk detail error

## 📝 File yang Diubah

1. `lib/auth.ts` - Memperbaiki authentication middleware
2. `app/api/admin/events/route.ts` - Memperbaiki API route dengan validasi UUID

## 🔒 Security Notes

1. **Service Role Key**: API routes menggunakan service role key untuk database operations setelah auth diverifikasi
2. **Session Validation**: Setiap request memvalidasi NextAuth session
3. **Role Check**: Setiap request memvalidasi user role (admin/moderator)
4. **UUID Validation**: User ID divalidasi sebagai UUID sebelum digunakan

## 🚀 Next Steps

1. **Login sebagai admin**: Pastikan user sudah login
2. **Cek role**: Pastikan user memiliki role admin/moderator
3. **Test create event**: Coba create event lagi
4. **Monitor logs**: Cek server logs untuk error lainnya

## 📚 Related Files

- `lib/auth.ts` - Authentication utilities
- `app/api/admin/events/route.ts` - Events API route
- `app/api/auth/[...nextauth]/route.ts` - NextAuth configuration
- `middleware.ts` - Next.js middleware

## ⚠️ Important Notes

1. **Mock User Removed**: Mock user `"mock-admin-id"` tidak lagi digunakan
2. **NextAuth Required**: Semua admin routes sekarang memerlukan NextAuth session
3. **Role Required**: User harus memiliki role admin/moderator
4. **Database Access**: Menggunakan service role key untuk bypass RLS setelah auth diverifikasi

