# Panduan Deploy ke Vercel

## Prasyarat

1. **Akun Vercel** - Daftar di [vercel.com](https://vercel.com)
2. **Akun GitHub/GitLab/Bitbucket** - Untuk menyimpan kode (opsional, bisa juga upload langsung)
3. **Supabase Project** - Pastikan project Supabase sudah dibuat dan running

## Langkah 1: Persiapan Repository Git

### 1.1. Inisialisasi Git (jika belum ada)

```bash
git init
git add .
git commit -m "Initial commit"
```

### 1.2. Push ke GitHub/GitLab/Bitbucket

```bash
# Buat repository baru di GitHub/GitLab/Bitbucket
# Kemudian push kode:

git remote add origin https://github.com/username/your-repo-name.git
git branch -M main
git push -u origin main
```

## Langkah 2: Buat File .gitignore (jika belum ada)

Pastikan file `.gitignore` sudah ada dan berisi:

```
# Dependencies
/node_modules
/.pnp
.pnp.js

# Testing
/coverage

# Next.js
/.next/
/out/

# Production
/build

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env*.local
.env

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts
```

## Langkah 3: Deploy via Vercel Dashboard

### 3.1. Import Project

1. Login ke [Vercel Dashboard](https://vercel.com/dashboard)
2. Klik **"Add New..."** → **"Project"**
3. Pilih repository GitHub/GitLab/Bitbucket Anda, atau klik **"Import Git Repository"**
4. Jika belum connect, connect GitHub/GitLab/Bitbucket account dulu

### 3.2. Configure Project

1. **Project Name**: Isi nama project (contoh: `bagoes-esports`)
2. **Framework Preset**: Pilih **Next.js** (auto-detect)
3. **Root Directory**: Biarkan kosong (jika root) atau isi jika ada di subdirectory
4. **Build Command**: `npm run build` (default)
5. **Output Directory**: `.next` (default)
6. **Install Command**: `npm install` (default)

### 3.3. Environment Variables

**PENTING**: Set semua environment variables sebelum deploy!

Klik **"Environment Variables"** dan tambahkan:

#### Supabase Variables
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

#### NextAuth Variables
```
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-nextauth-secret-key
```

**Cara mendapatkan nilai:**
- **NEXT_PUBLIC_SUPABASE_URL**: Dari Supabase Dashboard → Settings → API → Project URL
- **NEXT_PUBLIC_SUPABASE_ANON_KEY**: Dari Supabase Dashboard → Settings → API → anon/public key
- **SUPABASE_SERVICE_ROLE_KEY**: Dari Supabase Dashboard → Settings → API → service_role key (JANGAN SHARE!)
- **NEXTAUTH_URL**: URL production Vercel Anda (contoh: `https://bagoes-esports.vercel.app`)
- **NEXTAUTH_SECRET**: Generate random string (bisa pakai: `openssl rand -base64 32`)

#### Optional Variables (jika digunakan)
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-key (jika pakai Stripe)
STRIPE_SECRET_KEY=your-stripe-secret (jika pakai Stripe)
PUSHER_APP_ID=your-pusher-id (jika pakai Pusher)
PUSHER_KEY=your-pusher-key (jika pakai Pusher)
PUSHER_SECRET=your-pusher-secret (jika pakai Pusher)
```

### 3.4. Deploy

1. Klik **"Deploy"**
2. Tunggu proses build selesai (biasanya 2-5 menit)
3. Setelah selesai, aplikasi akan live di URL yang diberikan Vercel

## Langkah 4: Deploy via Vercel CLI (Alternatif)

### 4.1. Install Vercel CLI

```bash
npm install -g vercel
```

### 4.2. Login ke Vercel

```bash
vercel login
```

### 4.3. Deploy

```bash
# Deploy ke preview
vercel

# Deploy ke production
vercel --prod
```

### 4.4. Set Environment Variables via CLI

```bash
# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add NEXTAUTH_URL
vercel env add NEXTAUTH_SECRET

# Untuk setiap variable, pilih environment:
# - Production
# - Preview
# - Development
```

## Langkah 5: Konfigurasi Supabase

### 5.1. Update Supabase Auth URLs

1. Buka Supabase Dashboard → Authentication → URL Configuration
2. Tambahkan URL Vercel Anda ke **Redirect URLs**:
   - `https://your-app.vercel.app/api/auth/callback/next-auth`
   - `https://your-app.vercel.app/auth/callback`
3. Tambahkan ke **Site URL**:
   - `https://your-app.vercel.app`

### 5.2. Update RLS Policies (jika perlu)

Pastikan RLS policies di Supabase sudah benar untuk production environment.

### 5.3. Run Database Migrations

Jika ada migration files di `supabase/migrations/`, jalankan di Supabase Dashboard:
1. Buka Supabase Dashboard → SQL Editor
2. Copy isi file migration
3. Run di SQL Editor

Atau gunakan Supabase CLI:
```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

## Langkah 6: Verifikasi Deployment

### 6.1. Test Aplikasi

1. Buka URL Vercel Anda
2. Test fitur utama:
   - Login/Register
   - Create Event
   - Create Tournament
   - Upload Image
   - dll

### 6.2. Check Logs

1. Buka Vercel Dashboard → Project → Logs
2. Periksa jika ada error
3. Periksa Function Logs untuk API routes

### 6.3. Check Environment Variables

Pastikan semua environment variables sudah ter-set dengan benar di Vercel Dashboard.

## Langkah 7: Custom Domain (Opsional)

### 7.1. Add Custom Domain

1. Buka Vercel Dashboard → Project → Settings → Domains
2. Klik **"Add Domain"**
3. Masukkan domain Anda (contoh: `bagoes-esports.com`)
4. Follow instruksi untuk setup DNS

### 7.2. Update Environment Variables

Update `NEXTAUTH_URL` dan Supabase Auth URLs dengan custom domain baru.

## Troubleshooting

### Error: Environment Variable Not Found

**Solusi**: Pastikan semua environment variables sudah di-set di Vercel Dashboard → Settings → Environment Variables

### Error: Build Failed

**Solusi**: 
1. Check build logs di Vercel Dashboard
2. Pastikan semua dependencies ter-install dengan benar
3. Check jika ada TypeScript errors

### Error: Authentication Not Working

**Solusi**:
1. Pastikan `NEXTAUTH_URL` sudah di-set dengan benar (harus sama dengan URL production)
2. Pastikan Supabase Auth URLs sudah di-update dengan URL Vercel
3. Check `NEXTAUTH_SECRET` sudah di-set

### Error: Database Connection Failed

**Solusi**:
1. Pastikan `NEXT_PUBLIC_SUPABASE_URL` dan `SUPABASE_SERVICE_ROLE_KEY` sudah benar
2. Check Supabase project status (harus running)
3. Check RLS policies di Supabase

### Error: Image Not Loading

**Solusi**:
1. Pastikan `next.config.mjs` sudah dikonfigurasi dengan benar untuk Supabase images
2. Check Supabase Storage policies
3. Pastikan image URLs sudah benar

## Tips

1. **Use Preview Deployments**: Vercel otomatis membuat preview deployment untuk setiap PR/commit
2. **Monitor Performance**: Gunakan Vercel Analytics untuk monitor performance
3. **Set Up Alerts**: Set up alerts untuk error dan downtime
4. **Use Vercel Edge Functions**: Untuk API routes yang perlu low latency
5. **Optimize Images**: Gunakan Next.js Image Optimization untuk images

## Environment Variables Checklist

Pastikan semua variable ini sudah di-set di Vercel:

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `NEXTAUTH_URL`
- [ ] `NEXTAUTH_SECRET`
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (jika digunakan)
- [ ] `STRIPE_SECRET_KEY` (jika digunakan)
- [ ] `PUSHER_APP_ID` (jika digunakan)
- [ ] `PUSHER_KEY` (jika digunakan)
- [ ] `PUSHER_SECRET` (jika digunakan)

## Referensi

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Deployment](https://supabase.com/docs/guides/hosting/overview)
- [NextAuth.js Deployment](https://next-auth.js.org/configuration/options#nextauth_url)

