# Arsitektur Tournament & Event Registration

## 📋 Overview

Sistem EsportsHub memiliki 2 jenis aktivitas utama:

1. **Tournament** - Kompetisi untuk tim esports (team-based)
2. **Event** - Acara untuk penonton (individual ticket-based)

## 🎯 Konsep Dasar

### Tournament (Kompetisi)
- **Tujuan**: Tim mendaftar untuk berkompetisi
- **Peserta**: Tim (teams) dengan anggota
- **Flow**: 
  1. User membuat/belongs to team
  2. Team owner mendaftarkan team ke tournament
  3. Validasi jumlah anggota sesuai format (1v1, 2v2, 5v5, dll)
  4. Pembayaran entry fee (jika ada)
  5. Check-in sebelum tournament dimulai

### Event (Acara Penonton)
- **Tujuan**: User membeli tiket untuk menonton
- **Peserta**: Individual users
- **Flow**:
  1. User melihat event details
  2. User memilih jumlah tiket
  3. Pembayaran tiket
  4. Mendapatkan QR code/e-ticket
  5. Check-in di venue dengan QR code

## 🗄️ Database Schema

### Tournament Registration Flow

```
users
  └─> teams (user sebagai owner/member)
       └─> tournament_participants (team register ke tournament)
            └─> tournament_matches (bracket/match schedule)
```

**Tables:**
- `teams` - Tim esports
- `team_members` - Anggota tim
- `tournaments` - Tournament info
- `tournament_participants` - Team registration ke tournament
- `tournament_matches` - Bracket dan jadwal match

### Event Registration Flow

```
users
  └─> event_registrations (user beli tiket event)
       └─> event_tickets (optional: untuk multiple tickets & QR codes)
            └─> event_checkins (check-in di venue)
```

**Tables:**
- `events` - Event info
- `event_registrations` - User registration (1 user = 1 registration)
- `event_tickets` (NEW) - Individual tickets dengan QR code
- `event_checkins` (NEW) - Check-in records

## 🔧 Rekomendasi Implementasi

### 1. Tournament Registration (Team-Based)

#### A. Validasi Team
```typescript
// Validasi sebelum register team ke tournament
- Team harus punya jumlah anggota sesuai format:
  * 1v1: 1 anggota
  * 2v2: 2 anggota
  * 5v5: 5 anggota (bisa + substitute)
- Team owner harus verified
- Entry fee harus dibayar (jika ada)
```

#### B. Registration API
```
POST /api/tournaments/[id]/register
Body: { team_id: string }
- Validasi team exists & user is owner
- Validasi team size sesuai tournament format
- Validasi max_participants belum penuh
- Validasi registration_deadline belum lewat
- Check entry fee payment (jika ada)
- Insert ke tournament_participants
```

#### C. UI Flow
1. User login
2. User punya team (atau buat team dulu)
3. Di tournament detail page, klik "Daftar dengan Tim"
4. Pilih team dari dropdown (hanya team yang user punya)
5. Validasi team size
6. Bayar entry fee (jika ada)
7. Team terdaftar

### 2. Event Registration (Ticket-Based)

#### A. Ticket System
```typescript
// Event bisa punya multiple ticket types
- Regular Ticket: IDR 50.000
- VIP Ticket: IDR 150.000
- Early Bird: IDR 30.000 (limited time)

// User bisa beli multiple tickets
- 1 user bisa beli 5 tiket sekaligus
- Setiap tiket punya QR code unik
- Tiket bisa ditransfer ke user lain
```

#### B. Registration API
```
POST /api/events/[id]/register
Body: { 
  quantity: number,
  ticket_type?: string,
  payment_method: string
}
- Validasi event exists & belum mulai
- Validasi available seats
- Create payment intent
- Generate tickets dengan QR codes
- Insert ke event_registrations & event_tickets
```

#### C. UI Flow
1. User melihat event details
2. Pilih jumlah tiket & jenis tiket
3. Masukkan data diri (jika beli untuk orang lain)
4. Pembayaran (integrasi payment gateway)
5. Download e-ticket dengan QR code
6. Check-in di venue dengan scan QR code

## 📊 Database Enhancement

### 1. Event Tickets Table (NEW)
```sql
create table if not exists public.event_tickets (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  ticket_type text default 'regular',
  price_cents int not null,
  qr_code text unique not null,
  status text default 'active' check (status in ('active', 'used', 'cancelled', 'transferred')),
  purchased_at timestamptz default now(),
  used_at timestamptz,
  checked_in_at timestamptz,
  transferred_to uuid references auth.users(id) on delete set null
);

create index idx_event_tickets_event_id on public.event_tickets(event_id);
create index idx_event_tickets_user_id on public.event_tickets(user_id);
create index idx_event_tickets_qr_code on public.event_tickets(qr_code);
```

### 2. Event Check-ins Table (NEW)
```sql
create table if not exists public.event_checkins (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete cascade,
  ticket_id uuid references public.event_tickets(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  checked_in_at timestamptz default now(),
  checked_in_by uuid references auth.users(id) on delete set null, -- admin/staff yang scan
  location text -- venue location
);

create index idx_event_checkins_event_id on public.event_checkins(event_id);
create index idx_event_checkins_ticket_id on public.event_checkins(ticket_id);
```

### 3. Tournament Payment Table (NEW - Optional)
```sql
create table if not exists public.tournament_payments (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid references public.tournaments(id) on delete cascade,
  team_id uuid references public.teams(id) on delete cascade,
  amount_cents int not null,
  currency text default 'IDR',
  payment_method text,
  payment_status text default 'pending' check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  paid_at timestamptz,
  payment_proof_url text,
  created_at timestamptz default now()
);

create index idx_tournament_payments_tournament_id on public.tournament_payments(tournament_id);
create index idx_tournament_payments_team_id on public.tournament_payments(team_id);
```

### 4. Update Events Table
```sql
-- Tambahkan field untuk capacity & ticket types
alter table public.events 
  add column if not exists capacity int,
  add column if not exists ticket_types jsonb, -- {regular: {price: 50000, available: 100}, vip: {price: 150000, available: 50}}
  add column if not exists check_in_required boolean default true;
```

## 🎨 UI/UX Recommendations

### Tournament Detail Page
- **Untuk User yang belum punya team:**
  - Button: "Buat Tim Dulu" → redirect ke /teams/create
  - Info: "Anda perlu tim untuk mendaftar tournament ini"
  
- **Untuk User yang punya team:**
  - Button: "Daftar dengan Tim" → modal pilih team
  - Dropdown: List teams user (filter by game & format)
  - Validasi: Team size sesuai format
  - Payment: Entry fee (jika ada)
  - Confirmation: "Tim [Team Name] berhasil didaftarkan!"

- **Untuk Team Owner:**
  - Status: "Tim Anda sudah terdaftar" (jika sudah)
  - Info: Team members, seed position, check-in status

### Event Detail Page
- **Ticket Selection:**
  - Pilih jenis tiket (Regular/VIP/Early Bird)
  - Pilih jumlah tiket (1-10)
  - Total price calculation
  - Available seats counter
  
- **Checkout:**
  - Form data diri (untuk setiap tiket)
  - Payment method selection
  - Payment gateway integration
  - E-ticket download setelah pembayaran

- **My Tickets:**
  - List tiket yang dibeli
  - QR code untuk setiap tiket
  - Transfer ticket option
  - Check-in status

## 🔐 Security & Validation

### Tournament Registration
1. **Team Validation:**
   - Team harus exist & active
   - User must be team owner
   - Team size harus sesuai format tournament
   - Team game harus match tournament game

2. **Tournament Validation:**
   - Registration deadline belum lewat
   - Max participants belum penuh
   - Tournament status = 'upcoming'
   - Entry fee sudah dibayar (jika ada)

3. **RLS Policies:**
   - Team owner bisa register team
   - Organizer bisa manage participants
   - Public bisa lihat registered teams

### Event Registration
1. **Event Validation:**
   - Event exists & status = 'upcoming'
   - Event belum mulai
   - Available seats cukup
   - User sudah login

2. **Ticket Validation:**
   - QR code unique & valid
   - Ticket status = 'active'
   - Ticket belum digunakan
   - Event date match

3. **RLS Policies:**
   - User bisa beli tiket untuk diri sendiri
   - User bisa transfer tiket ke user lain
   - Admin bisa manage semua tiket
   - Public bisa scan QR code (read-only)

## 💳 Payment Integration

### Tournament Entry Fee
- Payment saat registration
- Payment proof upload (jika manual)
- Auto-approve setelah payment confirmed
- Refund policy untuk cancellation

### Event Tickets
- Payment gateway integration (Midtrans/Xendit/Stripe)
- Multiple payment methods (Credit Card, E-Wallet, Bank Transfer)
- Instant ticket generation setelah payment
- Refund policy untuk cancellation

## 📱 Features yang Bisa Ditambahkan

### Tournament
1. **Team Management:**
   - Invite members via email/username
   - Set team captain
   - Team roster management
   - Team statistics

2. **Tournament Features:**
   - Bracket visualization
   - Match schedule
   - Live scores
   - Team standings
   - Prize distribution

3. **Check-in System:**
   - Team check-in sebelum tournament
   - Member verification
   - Substitute player registration

### Event
1. **Ticket Management:**
   - Transfer ticket to friend
   - Resell ticket (marketplace)
   - Gift ticket
   - Ticket history

2. **Event Features:**
   - Event schedule
   - Live streaming link
   - Event updates/announcements
   - Social sharing

3. **Check-in System:**
   - QR code scanner (admin app)
   - Real-time attendance
   - Venue capacity tracking
   - Entry/exit logs

## 🚀 Implementation Priority

### Phase 1: Core Functionality
1. ✅ Tournament registration dengan teams
2. ✅ Event registration individual
3. ✅ Basic validation
4. ✅ RLS policies

### Phase 2: Payment System
1. ⏳ Tournament entry fee payment
2. ⏳ Event ticket payment
3. ⏳ Payment gateway integration
4. ⏳ Payment history

### Phase 3: Enhanced Features
1. ⏳ QR code generation untuk tickets
2. ⏳ Check-in system
3. ⏳ Ticket transfer
4. ⏳ Multiple ticket types
5. ⏳ Team management UI

### Phase 4: Advanced Features
1. ⏳ Tournament bracket system
2. ⏳ Match scheduling
3. ⏳ Live scores
4. ⏳ Analytics & reporting

## 📝 Notes

1. **Tournament vs Event:**
   - Tournament = Competitive (team-based)
   - Event = Spectator (individual-based)
   - Jangan campur kedua sistem ini!

2. **Team System:**
   - User bisa punya multiple teams
   - Team bisa register ke multiple tournaments
   - Team members bisa join/leave

3. **Ticket System:**
   - 1 user bisa beli multiple tickets
   - Setiap ticket punya QR code unik
   - Ticket bisa ditransfer

4. **Payment:**
   - Tournament: Entry fee (one-time per team)
   - Event: Ticket price (per ticket, bisa multiple)

5. **Check-in:**
   - Tournament: Team check-in (verifikasi semua members)
   - Event: Individual check-in (scan QR code per ticket)

## 🔗 Related Files

- `supabase/schema.sql` - Database schema
- `app/api/tournaments/[id]/register/route.ts` - Tournament registration API (TODO)
- `app/api/events/[id]/register/route.ts` - Event registration API
- `app/(main)/tournaments/[id]/page.tsx` - Tournament detail page
- `app/(main)/events/[id]/page.tsx` - Event detail page

