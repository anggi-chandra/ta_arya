-- ============================================================================
-- STORAGE BUCKET POLICIES FOR 'uploads' BUCKET
-- ============================================================================
-- This file contains SQL statements to create storage policies for the
-- 'uploads' bucket in Supabase Storage.
-- 
-- IMPORTANT: 
-- 1. Bucket 'uploads' must be created in Supabase Storage dashboard first
-- 2. Run this SQL in Supabase SQL Editor
-- 3. If using service_role key in API routes, these policies may not be needed
--    as service_role bypasses all RLS policies
-- ============================================================================

-- Drop existing policies if they exist (optional, for clean setup)
-- Uncomment if you want to recreate policies
-- DROP POLICY IF EXISTS "Allow public read access to uploads" ON storage.objects;
-- DROP POLICY IF EXISTS "Allow authenticated uploads to uploads" ON storage.objects;
-- DROP POLICY IF EXISTS "Allow authenticated users to update uploads" ON storage.objects;
-- DROP POLICY IF EXISTS "Allow authenticated users to delete uploads" ON storage.objects;
-- DROP POLICY IF EXISTS "Allow admins to manage all uploads" ON storage.objects;

-- ============================================================================
-- BASIC POLICIES (Recommended for most use cases)
-- ============================================================================

-- Policy 1: Allow public read access to uploads bucket
-- Anyone can view/download files from the uploads bucket
-- This is useful for displaying images on the website
CREATE POLICY IF NOT EXISTS "Allow public read access to uploads"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'uploads');

-- Policy 2: Allow authenticated users to upload files to uploads bucket
-- Only authenticated users (logged in users) can upload files
CREATE POLICY IF NOT EXISTS "Allow authenticated uploads to uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'uploads');

-- Policy 3: Allow authenticated users to update files in uploads bucket
-- Authenticated users can update/replace files they uploaded
-- Note: This allows any authenticated user to update any file in the bucket
-- For more security, you can restrict this further
CREATE POLICY IF NOT EXISTS "Allow authenticated users to update uploads"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'uploads')
WITH CHECK (bucket_id = 'uploads');

-- Policy 4: Allow authenticated users to delete files in uploads bucket
-- Authenticated users can delete files from the bucket
-- Note: This allows any authenticated user to delete any file in the bucket
-- For more security, you can restrict this further
CREATE POLICY IF NOT EXISTS "Allow authenticated users to delete uploads"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'uploads');

-- ============================================================================
-- ALTERNATIVE: ADMIN/MODERATOR ONLY POLICIES (More Secure)
-- ============================================================================
-- Uncomment these if you want only admins/moderators to manage uploads
-- Comment out the policies above if using this approach

-- Policy: Allow public read access (keep this)
-- CREATE POLICY IF NOT EXISTS "Allow public read access to uploads"
-- ON storage.objects
-- FOR SELECT
-- TO public
-- USING (bucket_id = 'uploads');

-- Policy: Allow admins and moderators to manage all uploads
-- CREATE POLICY IF NOT EXISTS "Allow admins to manage all uploads"
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
-- NOTES:
-- ============================================================================
-- 1. Bucket Creation:
--    - Go to Supabase Dashboard > Storage > Buckets
--    - Click "+ New bucket"
--    - Name: "uploads"
--    - Public bucket: ✅ (checked) - for public read access
--    - File size limit: 52428800 (50 MB) or as needed
--    - Allowed MIME types: image/* or leave empty
--    - Click "Create bucket"
--
-- 2. Service Role Key:
--    - If using service_role key in API routes (/api/admin/upload),
--      these policies are not strictly necessary as service_role bypasses RLS
--    - However, it's good practice to have policies for additional security
--
-- 3. Policy Selection:
--    - Use "BASIC POLICIES" if you want all authenticated users to upload
--    - Use "ADMIN/MODERATOR ONLY POLICIES" for more restricted access
--
-- 4. File Structure:
--    Files will be stored with structure:
--    uploads/
--      ├── events/
--      │   └── [timestamp]-[random].jpg
--      ├── tournaments/
--      │   └── [timestamp]-[random].jpg
--      └── teams/
--          └── [timestamp]-[random].jpg
--
-- 5. Testing:
--    After creating policies, test upload functionality in your application
-- ============================================================================

