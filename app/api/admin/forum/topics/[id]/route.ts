import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/auth'
import { withModeratorAuth } from '@/lib/auth'

// GET /api/admin/forum/topics/[id] - Get specific forum topic
export const GET = withModeratorAuth(async (req: NextRequest, user: any, { params }: { params: { id: string } }) => {
  const supabase = getSupabaseClient()
  
  try {
    const { data: topic, error } = await supabase
      .from('forum_topics')
      .select(`
        *,
        author:profiles!forum_topics_author_id_fkey (
          id,
          full_name,
          username,
          avatar_url,
          email
        ),
        category:forum_categories!forum_topics_category_id_fkey (
          id,
          name,
          color,
          slug
        ),
        forum_replies (
          id,
          content,
          created_at,
          author:profiles (
            id,
            full_name,
            username,
            avatar_url
          )
        )
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Forum topic not found' },
        { status: 404 }
      )
    }

    // Add reply count
    const topicWithStats = {
      ...topic,
      reply_count: topic.forum_replies?.length || 0
    }

    return NextResponse.json({ topic: topicWithStats })
  } catch (error) {
    console.error('Error fetching forum topic:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})

// PUT /api/admin/forum/topics/[id] - Update forum topic
export const PUT = withModeratorAuth(async (req: NextRequest, user: any, { params }: { params: { id: string } }) => {
  const supabase = getSupabaseClient()
  
  try {
    const body = await req.json()
    const {
      title,
      content,
      category_id,
      is_pinned,
      is_locked
    } = body

    // Check if topic exists
    const { data: existingTopic, error: topicError } = await supabase
      .from('forum_topics')
      .select('id, title, slug')
      .eq('id', params.id)
      .single()

    if (topicError) {
      return NextResponse.json(
        { error: 'Forum topic not found' },
        { status: 404 }
      )
    }

    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    // Update fields if provided
    if (title && title !== existingTopic.title) {
      updateData.title = title
      // Update slug if title changed
      const newSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      
      // Check if new slug conflicts with existing topics
      const { data: slugConflict } = await supabase
        .from('forum_topics')
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
    if (category_id) {
      // Validate category exists
      const { data: category, error: categoryError } = await supabase
        .from('forum_categories')
        .select('id')
        .eq('id', category_id)
        .single()

      if (categoryError) {
        return NextResponse.json(
          { error: 'Category not found' },
          { status: 400 }
        )
      }
      updateData.category_id = category_id
    }
    if (is_pinned !== undefined) updateData.is_pinned = is_pinned
    if (is_locked !== undefined) updateData.is_locked = is_locked

    const { data, error } = await supabase
      .from('forum_topics')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: `Failed to update topic: ${error.message}` },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Forum topic updated successfully',
      topic: data
    })
  } catch (error) {
    console.error('Error updating forum topic:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})

// DELETE /api/admin/forum/topics/[id] - Delete forum topic
export const DELETE = withModeratorAuth(async (req: NextRequest, user: any, { params }: { params: { id: string } }) => {
  const supabase = getSupabaseClient()
  
  try {
    // Check if topic exists
    const { data: topic, error: topicError } = await supabase
      .from('forum_topics')
      .select('id, title')
      .eq('id', params.id)
      .single()

    if (topicError) {
      return NextResponse.json(
        { error: 'Forum topic not found' },
        { status: 404 }
      )
    }

    // Delete topic (cascade will handle replies)
    const { error } = await supabase
      .from('forum_topics')
      .delete()
      .eq('id', params.id)

    if (error) {
      return NextResponse.json(
        { error: `Failed to delete topic: ${error.message}` },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: `Forum topic "${topic.title}" deleted successfully`
    })
  } catch (error) {
    console.error('Error deleting forum topic:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})