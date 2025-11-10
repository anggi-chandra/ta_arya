import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Check if service role key is configured
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('SUPABASE_SERVICE_ROLE_KEY is not configured');
      return NextResponse.json({ 
        error: 'Server configuration error: Service role key is not set. Please contact administrator.' 
      }, { status: 500 });
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      console.error('NEXT_PUBLIC_SUPABASE_URL is not configured');
      return NextResponse.json({ 
        error: 'Server configuration error: Supabase URL is not set. Please contact administrator.' 
      }, { status: 500 });
    }

    // Initialize Supabase client with service role key for admin operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string || 'events'; // events, tournaments, teams, etc.

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' }, { status: 400 });
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size too large. Maximum size is 5MB.' }, { status: 400 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const filename = `${timestamp}-${randomString}.${fileExtension}`;
    const filePath = `${type}/${filename}`;

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Check if bucket exists by trying to list it first (this will fail if bucket doesn't exist)
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.error('Error checking buckets:', bucketError);
      return NextResponse.json({ 
        error: `Storage error: ${bucketError.message}. Please check your Supabase storage configuration.` 
      }, { status: 500 });
    }

    const uploadsBucket = buckets?.find(b => b.name === 'uploads');
    if (!uploadsBucket) {
      console.error('Uploads bucket not found. Available buckets:', buckets?.map(b => b.name));
      return NextResponse.json({ 
        error: 'Storage bucket "uploads" not found. Please create the bucket in Supabase Storage or contact administrator.' 
      }, { status: 500 });
    }

    // Upload file
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      // Provide more specific error messages
      if (uploadError.message.includes('Bucket not found')) {
        return NextResponse.json({ 
          error: 'Storage bucket "uploads" not found. Please create the bucket in Supabase Storage.' 
        }, { status: 500 });
      }
      if (uploadError.message.includes('The resource already exists')) {
        return NextResponse.json({ 
          error: 'File with this name already exists. Please try again.' 
        }, { status: 409 });
      }
      return NextResponse.json({ 
        error: `Upload failed: ${uploadError.message}. Please check your storage configuration and permissions.` 
      }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('uploads')
      .getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      console.error('Failed to get public URL for uploaded file');
      return NextResponse.json({ 
        error: 'File uploaded but failed to get public URL. Please contact administrator.' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      publicUrl: urlData.publicUrl,
      path: filePath 
    });
  } catch (error: any) {
    console.error('Upload route error:', error);
    return NextResponse.json({ 
      error: error?.message || 'Internal server error. Please try again or contact administrator.' 
    }, { status: 500 });
  }
}