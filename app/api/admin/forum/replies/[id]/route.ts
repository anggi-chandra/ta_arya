import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/auth'
import { withModeratorAuth } from '@/lib/auth'

// GET /api/admin/forum/replies/[id] - Get specific forum reply
export const GET = withModeratorAuth(async (req: NextRequest, user: any, { params }: { params: { id: string } }) => {
  const supabase = getSupabaseClient()
  
  try {
    const { data: reply, error } = await supabase
      .from('forum_replies')
      .select(`
        *,
        author:profiles!forum_replies_author_id_fkey (
          id,
          full_name,
          username,
          avatar_url,
          email
        ),
        topic:forum_topics!forum_replies_topic_id_fkey (
          id,
          title,
          slug
        )
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Forum reply not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ reply })
  } catch (error) {
    console.error('Error fetching forum reply:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})

// PUT /api/admin/forum/replies/[id] - Update forum reply
export const PUT = withModeratorAuth(async (req: NextRequest, user: any, { params }: { params: { id: string } }) => {
  const supabase = getSupabaseClient()
  
  try {
    const body = await req.json()
    const { content } = body

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    // Check if reply exists
    const { data: existingReply, error: replyError } = await supabase
      .from('forum_replies')
      .select('id, topic_id')
      .eq('id', params.id)
      .single()

    if (replyError) {
      return NextResponse.json(
        { error: 'Forum reply not found' },
        { status: 404 }
      )
    }

    // Check if topic is locked
    const { data: topic, error: topicError } = await supabase
      .from('forum_topics')
      .select('is_locked')
      .eq('id', existingReply.topic_id)
      .single()

    if (topicError || topic.is_locked) {
      return NextResponse.json(
        { error: 'Cannot edit reply in locked topic' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('forum_replies')
      .update({
        content,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select(`
        *,
        author:profiles!forum_replies_author_id_fkey (
          id,
          full_name,
          username,
          avatar_url
        )
      `)
      .single()

    if (error) {
      return NextResponse.json(
        { error: `Failed to update reply: ${error.message}` },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Forum reply updated successfully',
      reply: data
    })
  } catch (error) {
    console.error('Error updating forum reply:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})

// DELETE /api/admin/forum/replies/[id] - Delete forum reply
export const DELETE = withModeratorAuth(async (req: NextRequest, user: any, { params }: { params: { id: string } }) => {
  const supabase = getSupabaseClient()
  
  try {
    // Check if reply exists
    const { data: reply, error: replyError } = await supabase
      .from('forum_replies')
      .select('id, topic_id, content')
      .eq('id', params.id)
      .single()

    if (replyError) {
      return NextResponse.json(
        { error: 'Forum reply not found' },
        { status: 404 }
      )
    }

    // Delete reply
    const { error } = await supabase
      .from('forum_replies')
      .delete()
      .eq('id', params.id)

    if (error) {
      return NextResponse.json(
        { error: `Failed to delete reply: ${error.message}` },
        { status: 400 }
      )
    }

    // Update topic's last_reply_at to the most recent remaining reply
    const { data: lastReply } = await supabase
      .from('forum_replies')
      .select('created_at')
      .eq('topic_id', reply.topic_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    await supabase
      .from('forum_topics')
      .update({
        last_reply_at: lastReply?.created_at || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', reply.topic_id)

    return NextResponse.json({
      message: 'Forum reply deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting forum reply:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})