-- ============================================================================
-- STORAGE SCHEMA FOR SUPABASE STORAGE
-- ============================================================================
-- Schema SQL untuk setup Storage Bucket dan Policies
-- 
-- INSTRUCTIONS:
-- 1. Buat bucket 'uploads' di Supabase Dashboard > Storage > Buckets
-- 2. Jalankan SQL ini di Supabase SQL Editor
-- 3. Verifikasi policies sudah dibuat di Storage > Policies
-- ============================================================================

-- ============================================================================
-- STEP 1: CREATE STORAGE BUCKET (VIA DASHBOARD)
-- ============================================================================
-- Bucket tidak bisa dibuat melalui SQL, harus melalui Dashboard atau API
-- 
-- Cara membuat bucket via Dashboard:
-- 1. Buka Supabase Dashboard
-- 2. Pergi ke Storage > Buckets
-- 3. Klik "+ New bucket"
-- 4. Isi detail:
--    - Name: "uploads"
--    - Public bucket: ✅ (checked)
--    - File size limit: 52428800 (50 MB)
--    - Allowed MIME types: image/* (atau kosongkan)
-- 5. Klik "Create bucket"
-- ============================================================================

-- ============================================================================
-- STEP 2: CREATE STORAGE POLICIES
-- ============================================================================

-- Enable RLS on storage.objects (usually enabled by default)
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (optional, for clean setup)
DROP POLICY IF EXISTS "Allow public read access to uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads to uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow admins to manage all uploads" ON storage.objects;

-- ============================================================================
-- BASIC POLICIES (Recommended for most use cases)
-- ============================================================================

-- Policy 1: Allow public read access to uploads bucket
-- Siapa saja bisa membaca/melihat file dari bucket 'uploads'
-- Berguna untuk menampilkan gambar di website
CREATE POLICY "Allow public read access to uploads"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'uploads');

-- Policy 2: Allow authenticated users to upload files to uploads bucket
-- Hanya user yang sudah login (authenticated) yang bisa upload file
CREATE POLICY "Allow authenticated uploads to uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'uploads');

-- Policy 3: Allow authenticated users to update files in uploads bucket
-- User authenticated bisa update/replace file di bucket
CREATE POLICY "Allow authenticated users to update uploads"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'uploads')
WITH CHECK (bucket_id = 'uploads');

-- Policy 4: Allow authenticated users to delete files in uploads bucket
-- User authenticated bisa delete file dari bucket
CREATE POLICY "Allow authenticated users to delete uploads"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'uploads');

-- ============================================================================
-- ALTERNATIVE: ADMIN/MODERATOR ONLY POLICIES (More Secure)
-- ============================================================================
-- Uncomment bagian ini dan comment bagian BASIC POLICIES di atas
-- jika ingin hanya admin/moderator yang bisa manage uploads

-- DROP POLICY IF EXISTS "Allow public read access to uploads" ON storage.objects;
-- DROP POLICY IF EXISTS "Allow authenticated uploads to uploads" ON storage.objects;
-- DROP POLICY IF EXISTS "Allow authenticated users to update uploads" ON storage.objects;
-- DROP POLICY IF EXISTS "Allow authenticated users to delete uploads" ON storage.objects;

-- Policy: Allow public read access (keep this)
-- CREATE POLICY "Allow public read access to uploads"
-- ON storage.objects
-- FOR SELECT
-- TO public
-- USING (bucket_id = 'uploads');

-- Policy: Allow admins and moderators to manage all uploads
-- CREATE POLICY "Allow admins to manage all uploads"
-- ON storage.objects
-- FOR ALL
-- TO authenticated
-- USING (
--   bucket_id = 'uploads' 
--   AND EXISTS (
--     SELECT 1 FROM public.user_roles ur 
--     WHERE ur.user_id = auth.uid() 
--     AND ur.role IN ('admin', 'moderator')
--   )
-- )
-- WITH CHECK (
--   bucket_id = 'uploads' 
--   AND EXISTS (
--     SELECT 1 FROM public.user_roles ur 
--     WHERE ur.user_id = auth.uid() 
--     AND ur.role IN ('admin', 'moderator')
--   )
-- );

-- ============================================================================
-- STEP 3: HELPER FUNCTIONS (Optional)
-- ============================================================================

-- Function: Get public URL for storage object
-- Usage: SELECT get_storage_url('uploads', 'events/image.jpg');
-- Note: Replace 'your-project-id' with your actual Supabase project ID
CREATE OR REPLACE FUNCTION public.get_storage_url(bucket_name TEXT, file_path TEXT)
RETURNS TEXT
LANGUAGE sql
STABLE
AS $$
  SELECT 
    'https://your-project-id.supabase.co/storage/v1/object/public/' || 
    bucket_name || 
    '/' || 
    file_path;
$$;

-- Alternative: Function that uses environment variable (if available)
-- CREATE OR REPLACE FUNCTION public.get_storage_url(bucket_name TEXT, file_path TEXT)
-- RETURNS TEXT
-- LANGUAGE plpgsql
-- STABLE
-- AS $$
-- DECLARE
--   supabase_url TEXT;
-- BEGIN
--   -- Get Supabase URL from environment or use default
--   supabase_url := COALESCE(
--     current_setting('app.settings.supabase_url', true),
--     'https://your-project-id.supabase.co'
--   );
--   
--   RETURN supabase_url || '/storage/v1/object/public/' || bucket_name || '/' || file_path;
-- END;
-- $$;

-- Function: Check if user is admin or moderator
-- Used for storage policies (if using admin-only policies)
CREATE OR REPLACE FUNCTION public.is_admin_or_moderator(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles ur 
    WHERE ur.user_id = is_admin_or_moderator.user_id 
    AND ur.role IN ('admin', 'moderator')
  );
$$;

-- Function: Get storage file size
-- Returns file size in bytes for a given file path
CREATE OR REPLACE FUNCTION public.get_storage_file_size(bucket_name TEXT, file_path TEXT)
RETURNS BIGINT
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE((metadata->>'size')::BIGINT, 0)
  FROM storage.objects
  WHERE bucket_id = bucket_name
  AND name = file_path
  LIMIT 1;
$$;

-- ============================================================================
-- STEP 4: STORAGE VIEWS (Optional)
-- ============================================================================

-- View: List all files in uploads bucket with metadata
CREATE OR REPLACE VIEW public.storage_uploads_view AS
SELECT 
  id,
  bucket_id,
  name as file_path,
  owner,
  created_at,
  updated_at,
  last_accessed_at,
  (metadata->>'size')::BIGINT as file_size,
  metadata->>'mimetype' as mime_type,
  metadata->>'cacheControl' as cache_control,
  metadata->>'contentEncoding' as content_encoding,
  metadata->>'etag' as etag
FROM storage.objects
WHERE bucket_id = 'uploads'
ORDER BY created_at DESC;

-- View: Storage usage statistics
CREATE OR REPLACE VIEW public.storage_stats_view AS
SELECT 
  bucket_id,
  COUNT(*) as total_files,
  SUM((metadata->>'size')::BIGINT) as total_size_bytes,
  ROUND(SUM((metadata->>'size')::BIGINT) / 1024.0 / 1024.0, 2) as total_size_mb,
  MIN(created_at) as oldest_file,
  MAX(created_at) as newest_file
FROM storage.objects
WHERE bucket_id = 'uploads'
GROUP BY bucket_id;

-- View: Files by folder (events, tournaments, teams)
CREATE OR REPLACE VIEW public.storage_files_by_folder AS
SELECT 
  CASE 
    WHEN name LIKE 'events/%' THEN 'events'
    WHEN name LIKE 'tournaments/%' THEN 'tournaments'
    WHEN name LIKE 'teams/%' THEN 'teams'
    WHEN name LIKE 'media/%' THEN 'media'
    ELSE 'other'
  END as folder,
  COUNT(*) as file_count,
  SUM((metadata->>'size')::BIGINT) as total_size_bytes,
  ROUND(SUM((metadata->>'size')::BIGINT) / 1024.0 / 1024.0, 2) as total_size_mb
FROM storage.objects
WHERE bucket_id = 'uploads'
GROUP BY folder
ORDER BY file_count DESC;

-- ============================================================================
-- STEP 5: STORAGE TRIGGERS (Optional)
-- ============================================================================

-- Function: Log storage operations
CREATE OR REPLACE FUNCTION public.log_storage_operation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log storage operations to analytics_events table
  INSERT INTO public.analytics_events (
    event_type,
    page_path,
    user_id,
    metadata
  ) VALUES (
    'storage_' || TG_OP,
    COALESCE(NEW.name, OLD.name),
    auth.uid(),
    jsonb_build_object(
      'bucket_id', COALESCE(NEW.bucket_id, OLD.bucket_id),
      'file_path', COALESCE(NEW.name, OLD.name),
      'operation', TG_OP,
      'file_size', COALESCE(NEW.metadata->>'size', OLD.metadata->>'size'),
      'mime_type', COALESCE(NEW.metadata->>'mimetype', OLD.metadata->>'mimetype')
    )
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Trigger: Log storage insert operations
-- Uncomment if you want to log storage operations
-- CREATE TRIGGER storage_insert_log
-- AFTER INSERT ON storage.objects
-- FOR EACH ROW
-- WHEN (bucket_id = 'uploads')
-- EXECUTE FUNCTION public.log_storage_operation();

-- Trigger: Log storage delete operations
-- CREATE TRIGGER storage_delete_log
-- AFTER DELETE ON storage.objects
-- FOR EACH ROW
-- WHEN (bucket_id = 'uploads')
-- EXECUTE FUNCTION public.log_storage_operation();

-- ============================================================================
-- STEP 6: GRANT PERMISSIONS
-- ============================================================================

-- Grant select permission on views to authenticated users
GRANT SELECT ON public.storage_uploads_view TO authenticated;
GRANT SELECT ON public.storage_stats_view TO authenticated;
GRANT SELECT ON public.storage_files_by_folder TO authenticated;

-- Grant execute permission on functions to authenticated users
GRANT EXECUTE ON FUNCTION public.get_storage_url(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_or_moderator(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_storage_file_size(TEXT, TEXT) TO authenticated;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check if policies are created
-- SELECT * FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects';

-- Check storage bucket (requires bucket to be created first)
-- SELECT * FROM storage.buckets WHERE name = 'uploads';

-- Check storage files
-- SELECT * FROM public.storage_uploads_view LIMIT 10;

-- Check storage statistics
-- SELECT * FROM public.storage_stats_view;

-- Check files by folder
-- SELECT * FROM public.storage_files_by_folder;

-- ============================================================================
-- NOTES AND TROUBLESHOOTING
-- ============================================================================
-- 
-- 1. BUCKET CREATION:
--    - Bucket 'uploads' harus dibuat melalui Dashboard atau API
--    - Tidak bisa dibuat melalui SQL
--    - Pastikan bucket sudah dibuat sebelum menjalankan policies
--
-- 2. POLICIES:
--    - Policies akan memberikan akses ke storage berdasarkan role
--    - Public read: Siapa saja bisa membaca file
--    - Authenticated: Hanya user yang login yang bisa upload/update/delete
--    - Admin/Moderator: Hanya admin/moderator yang bisa manage (jika menggunakan alternative policies)
--
-- 3. SERVICE ROLE KEY:
--    - Jika menggunakan service_role key di API routes, policies tidak diperlukan
--    - Service role key melewati semua RLS policies
--    - Tapi policies tetap disarankan untuk keamanan tambahan
--
-- 4. FILE STRUCTURE:
--    Files akan disimpan dengan struktur:
--    uploads/
--      ├── events/
--      │   └── [timestamp]-[random].jpg
--      ├── tournaments/
--      │   └── [timestamp]-[random].jpg
--      └── teams/
--          └── [timestamp]-[random].jpg
--
-- 5. TESTING:
--    - Setelah menjalankan SQL, test upload functionality
--    - Cek policies di Storage > Policies
--    - Cek files di Storage > Files
--    - Test dengan user yang berbeda (public, authenticated, admin)
--
-- 6. ERROR HANDLING:
--    - Jika error "bucket does not exist": Buat bucket terlebih dahulu
--    - Jika error "policy already exists": Policies sudah ada, tidak perlu dibuat lagi
--    - Jika error "permission denied": Pastikan policies sudah dibuat dan user sudah login
--
-- ============================================================================

