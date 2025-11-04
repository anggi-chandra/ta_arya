import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/auth'
import { withModeratorAuth } from '@/lib/auth'

// GET /api/admin/media/[id] - Get specific media file
export const GET = withModeratorAuth(async (req: NextRequest, user: any, { params }: { params: { id: string } }) => {
  const supabase = getSupabaseClient()
  
  try {
    const { data: media, error } = await supabase
      .from('media')
      .select(`
        *,
        uploader:profiles!media_uploaded_by_fkey (
          id,
          full_name,
          username,
          avatar_url,
          email
        )
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Media not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ media })
  } catch (error) {
    console.error('Error fetching media:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})

// PUT /api/admin/media/[id] - Update media metadata
export const PUT = withModeratorAuth(async (req: NextRequest, user: any, { params }: { params: { id: string } }) => {
  const supabase = getSupabaseClient()
  
  try {
    const body = await req.json()
    const { alt_text, description } = body

    // Check if media exists
    const { data: existingMedia, error: mediaError } = await supabase
      .from('media')
      .select('id')
      .eq('id', params.id)
      .single()

    if (mediaError) {
      return NextResponse.json(
        { error: 'Media not found' },
        { status: 404 }
      )
    }

    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (alt_text !== undefined) updateData.alt_text = alt_text
    if (description !== undefined) updateData.description = description

    const { data, error } = await supabase
      .from('media')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: `Failed to update media: ${error.message}` },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Media updated successfully',
      media: data
    })
  } catch (error) {
    console.error('Error updating media:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})

// DELETE /api/admin/media/[id] - Delete media file
export const DELETE = withModeratorAuth(async (req: NextRequest, user: any, { params }: { params: { id: string } }) => {
  const supabase = getSupabaseClient()
  
  try {
    // Check if media exists
    const { data: media, error: mediaError } = await supabase
      .from('media')
      .select('id, filename, file_path')
      .eq('id', params.id)
      .single()

    if (mediaError) {
      return NextResponse.json(
        { error: 'Media not found' },
        { status: 404 }
      )
    }

    // Delete file from storage
    const { error: storageError } = await supabase.storage
      .from('uploads')
      .remove([media.file_path])

    if (storageError) {
      console.error('Error deleting file from storage:', storageError)
      // Continue with database deletion even if storage deletion fails
    }

    // Delete media record from database
    const { error } = await supabase
      .from('media')
      .delete()
      .eq('id', params.id)

    if (error) {
      return NextResponse.json(
        { error: `Failed to delete media: ${error.message}` },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: `Media "${media.filename}" deleted successfully`
    })
  } catch (error) {
    console.error('Error deleting media:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})