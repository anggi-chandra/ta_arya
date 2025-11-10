# Fix: Pengguna Tidak Muncul di Admin Users Page

## 🔍 Masalah

User sudah membuat akun, seharusnya sudah ada di database, tapi tidak muncul di halaman `/admin/users` dengan error "Gagal memuat data pengguna" dan "Tidak ada pengguna."

## ✅ Solusi yang Diterapkan

### 1. API Route - Perbaiki Query

**File**: `app/api/admin/users/route.ts`

**Masalah**: Query menggunakan relationship `user_roles` yang mungkin gagal di PostgREST.

**Solusi**: 
- Fetch profiles terlebih dahulu (tanpa relationship)
- Fetch roles secara terpisah
- Gabungkan profiles dengan roles secara manual
- Default role 'user' jika user tidak memiliki role di database

### 2. Error Handling - Lebih Baik

**File**: `app/admin/users/page.tsx`

**Masalah**: Error handling tidak informatif.

**Solusi**: 
- Menampilkan error message yang jelas
- Menambahkan tombol "Coba lagi"
- Menambahkan logging untuk debugging

### 3. Default Role - Set Default

**Masalah**: User yang tidak memiliki role di `user_roles` table tidak ditampilkan dengan benar.

**Solusi**: 
- Jika user tidak memiliki role, assign default role 'user'
- Pastikan semua user ditampilkan meskipun tidak ada role di database

## 🔧 Setup dan Troubleshooting

### Step 1: Buat Trigger untuk Auto-Create Profile

Jalankan SQL berikut di Supabase SQL Editor untuk membuat trigger yang otomatis membuat profile saat user sign up:

```sql
-- Copy isi file: supabase/migrations/create-profile-trigger.sql
-- Atau jalankan SQL di bawah ini:

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile for new user
  INSERT INTO public.profiles (id, full_name, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;

  -- Create default 'user' role
  INSERT INTO public.user_roles (user_id, role, granted_by)
  VALUES (NEW.id, 'user', NULL)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop trigger if exists and create new one
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Also handle existing users that don't have profiles
INSERT INTO public.profiles (id, full_name, username)
SELECT 
  u.id,
  COALESCE(u.raw_user_meta_data->>'full_name', SPLIT_PART(u.email, '@', 1)),
  COALESCE(u.raw_user_meta_data->>'username', SPLIT_PART(u.email, '@', 1))
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = u.id
)
ON CONFLICT (id) DO NOTHING;

-- Create default 'user' role for existing users that don't have roles
INSERT INTO public.user_roles (user_id, role, granted_by)
SELECT 
  u.id,
  'user',
  NULL
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles ur WHERE ur.user_id = u.id AND ur.role = 'user'
)
ON CONFLICT (user_id, role) DO NOTHING;
```

### Step 2: Cek Data di Database

Pastikan user ada di database:

```sql
-- Cek profiles
SELECT id, full_name, username, created_at 
FROM public.profiles 
ORDER BY created_at DESC;

-- Cek user_roles
SELECT user_id, role, granted_at 
FROM public.user_roles 
ORDER BY granted_at DESC;

-- Cek auth.users
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC;
```

### Step 2: Cek RLS Policies

Pastikan RLS policies memungkinkan akses:

```sql
-- Cek policies di tabel profiles
SELECT * FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'profiles';

-- Cek policies di tabel user_roles
SELECT * FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'user_roles';
```

Pastikan ada policy:
- `profiles are readable by everyone` - untuk SELECT (public access)
- `roles readable by admins` - untuk SELECT (admin access)

### Step 3: Cek Authentication

Pastikan user sudah login dan memiliki role admin:

1. **Cek Session**:
   - Buka browser DevTools → Application → Cookies
   - Pastikan ada cookie `next-auth.session-token`

2. **Cek Role di Database**:
   ```sql
   SELECT ur.user_id, ur.role, u.email
   FROM public.user_roles ur
   LEFT JOIN auth.users u ON u.id = ur.user_id
   WHERE ur.role = 'admin';
   ```

3. **Test API Endpoint**:
   ```bash
   # Test dengan curl (setelah login)
   curl -X GET http://localhost:3000/api/admin/users?page=1&limit=20 \
     -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
   ```

### Step 4: Cek Server Logs

Cek console/terminal untuk error:

1. **Browser Console**: 
   - Buka DevTools → Console
   - Cek error saat fetch users

2. **Server Logs**:
   - Cek terminal dimana `npm run dev` berjalan
   - Cek log dari API route: `Fetched profiles: { count: X, total: Y }`

### Step 5: Test API Route Langsung

Test API route secara langsung:

```bash
# Test admin users API
curl http://localhost:3000/api/admin/users?page=1&limit=20
```

## 🐛 Common Issues

### Issue 1: "Unauthorized" Error

**Penyebab**: User belum login atau tidak memiliki role admin

**Solusi**:
1. Login sebagai admin
2. Pastikan user memiliki role admin di database
3. Cek NextAuth session aktif

### Issue 2: "No users found" tapi user ada di database

**Penyebab**: 
- RLS policies menghalangi
- Query error
- Service role key tidak digunakan

**Solusi**:
1. Cek server logs untuk error
2. Pastikan service role key digunakan (bypass RLS)
3. Test query langsung di Supabase SQL Editor

### Issue 3: Users Muncul Tapi Tidak Ada Role

**Penyebab**: User tidak memiliki entry di `user_roles` table

**Solusi**:
1. User akan ditampilkan dengan role default 'user'
2. Atau tambahkan role manual ke database:
   ```sql
   INSERT INTO public.user_roles (user_id, role)
   VALUES ('user-id', 'user');
   ```

### Issue 4: Relationship Query Error

**Penyebab**: PostgREST tidak bisa join `user_roles` sebagai relationship

**Solusi**:
- Sudah diperbaiki: fetch roles secara terpisah
- Gabungkan secara manual di API route

## 📋 Checklist

- [ ] User sudah login sebagai admin
- [ ] User memiliki role admin di database
- [ ] NextAuth session aktif
- [ ] Profiles ada di database (verifikasi dengan SQL)
- [ ] RLS policies memungkinkan SELECT pada tabel profiles
- [ ] API route `/api/admin/users` bisa diakses
- [ ] Tidak ada error di browser console
- [ ] Tidak ada error di server logs
- [ ] Service role key digunakan (bypass RLS)

## 🔍 Debugging Commands

### Cek Users di Database
```sql
SELECT 
  p.id,
  p.full_name,
  p.username,
  p.created_at,
  ur.role
FROM public.profiles p
LEFT JOIN public.user_roles ur ON ur.user_id = p.id
ORDER BY p.created_at DESC;
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
WHERE tablename IN ('profiles', 'user_roles');
```

### Test API dengan curl
```bash
# Test admin users (perlu session cookie)
curl -X GET "http://localhost:3000/api/admin/users?page=1&limit=20" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -v
```

## 🚀 Next Steps

1. **Cek Authentication**: Pastikan user sudah login dan memiliki role
2. **Cek Database**: Verifikasi profiles ada di database
3. **Cek Logs**: Lihat error di browser console dan server logs
4. **Test API**: Test API endpoint secara langsung
5. **Cek RLS**: Pastikan RLS policies memungkinkan akses (atau service role key digunakan)

## 📝 File yang Diubah

1. `app/api/admin/users/route.ts` - Memperbaiki query dan error handling
2. `app/admin/users/page.tsx` - Memperbaiki error handling dan UI

## ⚠️ Important Notes

1. **Service Role Key**: API route menggunakan service role key yang bypass RLS
2. **Authentication**: Admin routes memerlukan NextAuth session dengan role admin
3. **Default Role**: User tanpa role akan ditampilkan dengan role default 'user'
4. **Relationship Query**: Tidak menggunakan relationship query, fetch roles secara terpisah

## 🔗 Related Files

- `app/admin/users/page.tsx` - Admin users page
- `app/api/admin/users/route.ts` - Admin users API
- `supabase/schema.sql` - Database schema
- `lib/auth.ts` - Authentication middleware

