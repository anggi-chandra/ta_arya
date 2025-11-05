import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/auth'
import { withModeratorAuth } from '@/lib/auth'

// POST /api/admin/teams/upload-logo - Upload team logo
export const POST = withModeratorAuth(async (req: NextRequest) => {
  const supabase = getSupabaseClient()
  
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type (images only)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only image files are allowed (JPEG, PNG, WebP, GIF)' },
        { status: 400 }
      )
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum 5MB allowed.' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = file.name.split('.').pop()
    const filename = `team-logo-${timestamp}-${randomString}.${fileExtension}`
    const filepath = `team-logos/${filename}`

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(filepath, file)

    if (uploadError) {
      return NextResponse.json(
        { error: `Failed to upload file: ${uploadError.message}` },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('uploads')
      .getPublicUrl(filepath)

    return NextResponse.json({
      message: 'Logo uploaded successfully',
      url: publicUrl,
      filename: filename
    })
  } catch (error) {
    console.error('Error uploading team logo:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})