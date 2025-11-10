-- ============================================================================
-- STORAGE BUCKET POLICIES FOR 'uploads' BUCKET
-- ============================================================================
-- Copy semua SQL di bawah ini dan paste ke Supabase SQL Editor
-- Pastikan bucket 'uploads' sudah dibuat terlebih dahulu di Storage dashboard
-- ============================================================================

-- Policy 1: Allow public read access to uploads bucket
CREATE POLICY IF NOT EXISTS "Allow public read access to uploads"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'uploads');

-- Policy 2: Allow authenticated users to upload files to uploads bucket
CREATE POLICY IF NOT EXISTS "Allow authenticated uploads to uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'uploads');

-- Policy 3: Allow authenticated users to update files in uploads bucket
CREATE POLICY IF NOT EXISTS "Allow authenticated users to update uploads"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'uploads')
WITH CHECK (bucket_id = 'uploads');

-- Policy 4: Allow authenticated users to delete files in uploads bucket
CREATE POLICY IF NOT EXISTS "Allow authenticated users to delete uploads"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'uploads');

