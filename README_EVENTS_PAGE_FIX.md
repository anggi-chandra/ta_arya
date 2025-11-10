# Fix: Event Tidak Muncul di Halaman Events

## 🔍 Masalah

Event yang sudah ditambahkan tidak muncul di halaman `/events`, dengan error "Gagal memuat data event. Silakan coba lagi."

## ✅ Solusi yang Diterapkan

### 1. API Route - Hapus Filter Default

**File**: `app/api/events/route.ts`

**Masalah**: API route secara default filter events berdasarkan `status=upcoming`, yang hanya menampilkan events di masa depan.

**Solusi**: Hapus filter default, tampilkan semua events jika tidak ada parameter status:

```typescript
// Sebelum (SALAH):
if (status) {
  // filter by status
} else {
  // Default: show upcoming events
  query = query.gt('starts_at', now)
}

// Sesudah (BENAR):
if (status) {
  // filter by status
}
// No else clause - if no status, show all events
```

### 2. Events Page - Perbaiki Status Determination

**File**: `app/(main)/events/page.tsx`

**Masalah**: Status events tidak ditentukan dengan benar dari dates.

**Solusi**: Tentukan status berdasarkan `starts_at` dan `ends_at`:

```typescript
const now = new Date();
const startsAt = e.starts_at ? new Date(e.starts_at) : null;
const endsAt = e.ends_at ? new Date(e.ends_at) : null;

let status: EventStatus = 'upcoming';
if (startsAt && endsAt) {
  if (now >= startsAt && now <= endsAt) {
    status = 'ongoing';
  } else if (now > endsAt) {
    status = 'completed';
  } else {
    status = 'upcoming';
  }
} else if (startsAt) {
  if (now >= startsAt) {
    status = 'completed';
  } else {
    status = 'upcoming';
  }
}
```

### 3. Error Handling - Lebih Baik

**Masalah**: Error handling tidak informatif.

**Solusi**: Tambahkan error handling yang lebih baik dengan pesan yang jelas:

```typescript
{error && (
  <Card className="p-6 mb-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
    <div className="flex flex-col gap-2">
      <p className="text-red-600 dark:text-red-400 font-medium">Gagal memuat data event</p>
      <p className="text-red-500 dark:text-red-300 text-sm">
        {(error as Error).message || 'Terjadi kesalahan saat memuat data. Silakan coba lagi.'}
      </p>
      <button 
        onClick={() => refetch()} 
        className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline self-start"
      >
        Coba lagi
      </button>
    </div>
  </Card>
)}
```

### 4. Data Normalization - Perbaiki Price

**Masalah**: Price tidak ditampilkan dengan benar (menggunakan `prize_pool` instead of `price_cents`).

**Solusi**: Gunakan `price_cents` dan konversi ke Rupiah:

```typescript
prizePool: e.price_cents ? `Rp ${(e.price_cents / 100).toLocaleString('id-ID')}` : undefined,
```

### 5. Filter Options - Gunakan Data yang Di-fetch

**Masalah**: Filter options menggunakan hardcoded data.

**Solusi**: Gunakan data yang di-fetch dari API:

```typescript
const games = useMemo(
  () => ["Semua", ...Array.from(new Set(eventsData.map((e) => e.game).filter(Boolean)))],
  [eventsData]
);
```

## 🔧 Testing

### Test 1: Cek API Route

1. Buka browser
2. Akses: `http://localhost:3000/api/events`
3. Pastikan response berisi semua events (tanpa filter)

### Test 2: Cek Events Page

1. Buka browser
2. Akses: `http://localhost:3000/events`
3. Pastikan events muncul (tidak ada error)
4. Pastikan filter bekerja dengan benar

### Test 3: Cek Status Events

1. Buat event dengan `starts_at` di masa depan → harus muncul sebagai "upcoming"
2. Buat event dengan `starts_at` di masa lalu dan `ends_at` di masa depan → harus muncul sebagai "ongoing"
3. Buat event dengan `ends_at` di masa lalu → harus muncul sebagai "completed"

## 📋 Checklist

- [x] API route tidak filter secara default
- [x] Events page menentukan status dengan benar
- [x] Error handling lebih baik
- [x] Data normalization (price, dates, etc.)
- [x] Filter options menggunakan data yang di-fetch
- [x] Logging untuk debugging

## 🐛 Troubleshooting

### Masalah: Events Masih Tidak Muncul

**Penyebab**: 
- RLS policies menghalangi
- Events tidak ada di database
- API route error

**Solusi**:
1. Cek RLS policies: `SELECT * FROM pg_policies WHERE tablename = 'events';`
2. Cek events di database: `SELECT * FROM public.events;`
3. Cek server logs untuk error
4. Cek browser console untuk error

### Masalah: Error "Failed to fetch events"

**Penyebab**: 
- API route error
- Network error
- RLS policies menghalangi

**Solusi**:
1. Cek server logs
2. Cek browser console
3. Test API route secara langsung
4. Cek RLS policies

### Masalah: Events Muncul Tapi Status Salah

**Penyebab**: 
- Dates tidak valid
- Timezone issue
- Status determination logic salah

**Solusi**:
1. Cek dates di database
2. Pastikan dates dalam format ISO 8601
3. Cek timezone
4. Test status determination logic

## 📝 File yang Diubah

1. `app/api/events/route.ts` - Hapus filter default, tambahkan logging
2. `app/(main)/events/page.tsx` - Perbaiki status determination, error handling, data normalization

## ⚠️ Important Notes

1. **RLS Policies**: Pastikan RLS policy `events readable` menggunakan `using (true)` untuk public access
2. **Dates**: Pastikan `starts_at` dan `ends_at` dalam format ISO 8601 (timestamptz)
3. **Status**: Status ditentukan berdasarkan dates, bukan dari database
4. **Price**: Price disimpan sebagai `price_cents` (integer), ditampilkan sebagai Rupiah

## 🔗 Related Files

- `app/api/events/route.ts` - Public events API
- `app/(main)/events/page.tsx` - Events page
- `supabase/schema.sql` - Database schema
- `README_EVENTS_NOT_SHOWING.md` - Troubleshooting guide

