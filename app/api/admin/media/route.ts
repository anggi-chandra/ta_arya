import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/auth'
import { withModeratorAuth } from '@/lib/auth'

// GET /api/admin/media - Get all media files with pagination and filters
export const GET = withModeratorAuth(async (req: NextRequest) => {
  const supabase = getSupabaseClient()
  const { searchParams } = new URL(req.url)
  
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const search = searchParams.get('search') || ''
  const type = searchParams.get('type') || ''
  
  const offset = (page - 1) * limit

  try {
    // Build query for media with uploader info
    let query = supabase
      .from('media')
      .select(`
        *,
        uploader:profiles!media_uploaded_by_fkey (
          full_name,
          username,
          avatar_url
        )
      `)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    // Add search filter
    if (search) {
      query = query.or(`filename.ilike.%${search}%,alt_text.ilike.%${search}%`)
    }

    // Add type filter
    if (type) {
      query = query.eq('file_type', type)
    }

    const { data: media, error: mediaError } = await query

    if (mediaError) {
      return NextResponse.json(
        { error: 'Failed to fetch media' },
        { status: 500 }
      )
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('media')
      .select('id', { count: 'exact', head: true })

    if (search) {
      countQuery = countQuery.or(`filename.ilike.%${search}%,alt_text.ilike.%${search}%`)
    }
    if (type) {
      countQuery = countQuery.eq('file_type', type)
    }

    const { count, error: countError } = await countQuery

    if (countError) {
      return NextResponse.json(
        { error: 'Failed to count media' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      media,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching media:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})

// POST /api/admin/media - Upload new media file
export const POST = withModeratorAuth(async (req: NextRequest, user: any) => {
  const supabase = getSupabaseClient()
  
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const alt_text = formData.get('alt_text') as string
    const description = formData.get('description') as string

    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm', 'video/ogg',
      'application/pdf', 'text/plain'
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'File type not allowed' },
        { status: 400 }
      )
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum 10MB allowed.' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = file.name.split('.').pop()
    const filename = `${timestamp}-${randomString}.${fileExtension}`
    const filepath = `media/${filename}`

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

    // Save media record to database
    const { data, error } = await supabase
      .from('media')
      .insert({
        filename: file.name,
        file_path: filepath,
        file_url: publicUrl,
        file_type: file.type,
        file_size: file.size,
        alt_text,
        description,
        uploaded_by: user.id
      })
      .select()
      .single()

    if (error) {
      // If database insert fails, clean up uploaded file
      await supabase.storage
        .from('uploads')
        .remove([filepath])

      return NextResponse.json(
        { error: `Failed to save media record: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Media uploaded successfully',
      media: data
    })
  } catch (error) {
    console.error('Error uploading media:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})