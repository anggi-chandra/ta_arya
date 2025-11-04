import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/auth'
import { withModeratorAuth } from '@/lib/auth'

// GET /api/admin/content/[id] - Get specific content
export const GET = withModeratorAuth(async (req: NextRequest, user: any, { params }: { params: { id: string } }) => {
  const supabase = getSupabaseClient()
  
  try {
    const { data: content, error } = await supabase
      .from('content')
      .select(`
        *,
        author:profiles!content_author_id_fkey (
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
        { error: 'Content not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ content })
  } catch (error) {
    console.error('Error fetching content:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})

// PUT /api/admin/content/[id] - Update content
export const PUT = withModeratorAuth(async (req: NextRequest, user: any, { params }: { params: { id: string } }) => {
  const supabase = getSupabaseClient()
  
  try {
    const body = await req.json()
    const {
      title,
      content,
      excerpt,
      type,
      category,
      status,
      featured_image_url,
      tags,
      meta_title,
      meta_description,
      published_at
    } = body

    // Check if content exists
    const { data: existingContent, error: contentError } = await supabase
      .from('content')
      .select('id, slug, status')
      .eq('id', params.id)
      .single()

    if (contentError) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      )
    }

    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    // Update fields if provided
    if (title) {
      updateData.title = title
      // Update slug if title changed
      const newSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      
      // Check if new slug conflicts with existing content
      const { data: slugConflict } = await supabase
        .from('content')
        .select('id')
        .eq('slug', newSlug)
        .neq('id', params.id)
        .single()

      if (slugConflict) {
        updateData.slug = `${newSlug}-${Date.now()}`
      } else {
        updateData.slug = newSlug
      }
    }

    if (content !== undefined) updateData.content = content
    if (excerpt !== undefined) updateData.excerpt = excerpt
    if (type) {
      const validTypes = ['blog', 'news', 'article', 'page']
      if (!validTypes.includes(type)) {
        return NextResponse.json(
          { error: 'Invalid type. Must be one of: blog, news, article, page' },
          { status: 400 }
        )
      }
      updateData.type = type
    }
    if (category !== undefined) updateData.category = category
    if (featured_image_url !== undefined) updateData.featured_image_url = featured_image_url
    if (tags !== undefined) updateData.tags = tags
    if (meta_title !== undefined) updateData.meta_title = meta_title
    if (meta_description !== undefined) updateData.meta_description = meta_description

    // Handle status change
    if (status) {
      const validStatuses = ['draft', 'published', 'archived']
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: 'Invalid status. Must be one of: draft, published, archived' },
          { status: 400 }
        )
      }
      updateData.status = status

      // Set published_at when publishing
      if (status === 'published' && existingContent.status !== 'published') {
        updateData.published_at = new Date().toISOString()
      }
    }

    // Handle custom published_at
    if (published_at) {
      const publishedDate = new Date(published_at)
      if (isNaN(publishedDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid published date' },
          { status: 400 }
        )
      }
      updateData.published_at = publishedDate.toISOString()
    }

    const { data, error } = await supabase
      .from('content')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: `Failed to update content: ${error.message}` },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Content updated successfully',
      content: data
    })
  } catch (error) {
    console.error('Error updating content:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})

// DELETE /api/admin/content/[id] - Delete content
export const DELETE = withModeratorAuth(async (req: NextRequest, user: any, { params }: { params: { id: string } }) => {
  const supabase = getSupabaseClient()
  
  try {
    // Check if content exists
    const { data: content, error: contentError } = await supabase
      .from('content')
      .select('id, title')
      .eq('id', params.id)
      .single()

    if (contentError) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      )
    }

    const { error } = await supabase
      .from('content')
      .delete()
      .eq('id', params.id)

    if (error) {
      return NextResponse.json(
        { error: `Failed to delete content: ${error.message}` },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: `Content "${content.title}" deleted successfully`
    })
  } catch (error) {
    console.error('Error deleting content:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})