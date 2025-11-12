import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/auth'
import { withModeratorAuth } from '@/lib/auth'

// GET /api/admin/forum/topics - Get all forum topics with pagination
export const GET = withModeratorAuth(async (req: NextRequest) => {
  const supabase = getSupabaseClient()
  const { searchParams } = new URL(req.url)
  
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const search = searchParams.get('search') || ''
  const categoryId = searchParams.get('category_id') || ''
  
  const offset = (page - 1) * limit

  try {
    // Build query for topics (without relationship to avoid PostgREST issues)
    let query = supabase
      .from('forum_topics')
      .select('*')
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    // Add search filter
    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`)
    }

    // Add category filter
    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }

    const { data: topics, error: topicsError } = await query

    if (topicsError) {
      console.error('Error fetching forum topics:', topicsError)
      return NextResponse.json(
        { error: 'Failed to fetch forum topics' },
        { status: 500 }
      )
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('forum_topics')
      .select('id', { count: 'exact', head: true })

    if (search) {
      countQuery = countQuery.or(`title.ilike.%${search}%,content.ilike.%${search}%`)
    }
    if (categoryId) {
      countQuery = countQuery.eq('category_id', categoryId)
    }

    const { count, error: countError } = await countQuery

    if (countError) {
      console.error('Error counting forum topics:', countError)
    }

    // Fetch author profiles separately
    const authorIds = [...new Set(topics?.map(t => t.author_id).filter(Boolean) || [])]
    let authorProfiles: Record<string, any> = {}

    if (authorIds.length > 0) {
      const { data: authors } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url')
        .in('id', authorIds)

      if (authors) {
        authors.forEach((author: any) => {
          authorProfiles[author.id] = author
        })
      }
    }

    // Fetch category info separately
    const categoryIds = [...new Set(topics?.map(t => t.category_id).filter(Boolean) || [])]
    let categories: Record<string, any> = {}

    if (categoryIds.length > 0) {
      const { data: cats } = await supabase
        .from('forum_categories')
        .select('id, name, icon')
        .in('id', categoryIds)

      if (cats) {
        cats.forEach((cat: any) => {
          categories[cat.id] = cat
        })
      }
    }

    // Get reply counts for topics
    const topicIds = topics?.map(t => t.id) || []
    let replyCounts: Record<string, number> = {}

    if (topicIds.length > 0) {
      const { data: replies } = await supabase
        .from('forum_replies')
        .select('topic_id')
        .in('topic_id', topicIds)

      if (replies) {
        replies.forEach((reply: any) => {
          replyCounts[reply.topic_id] = (replyCounts[reply.topic_id] || 0) + 1
        })
      }
    }

    // Combine topics with author, category, and reply counts
    const topicsWithStats = topics?.map(topic => ({
      ...topic,
      author: topic.author_id ? authorProfiles[topic.author_id] || null : null,
      category: topic.category_id ? categories[topic.category_id] || null : null,
      reply_count: replyCounts[topic.id] || 0
    })) || []

    return NextResponse.json({
      topics: topicsWithStats,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Error in forum topics API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})

// POST /api/admin/forum/topics - Create new forum topic
export const POST = withModeratorAuth(async (req: NextRequest, user: any) => {
  const supabase = getSupabaseClient()
  
  try {
    const body = await req.json()
    const {
      title,
      content,
      category_id,
      is_pinned = false,
      is_locked = false
    } = body

    // Validate required fields
    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    if (!category_id) {
      return NextResponse.json(
        { error: 'Category is required' },
        { status: 400 }
      )
    }

    // Validate category exists
    const { data: category, error: categoryError } = await supabase
      .from('forum_categories')
      .select('id')
      .eq('id', category_id)
      .single()

    if (categoryError || !category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 400 }
      )
    }

    // Create topic
    const { data: topic, error: topicError } = await supabase
      .from('forum_topics')
      .insert({
        title: title.trim(),
        content: content.trim(),
        category_id,
        author_id: user.id,
        is_pinned: Boolean(is_pinned),
        is_locked: Boolean(is_locked),
        view_count: 0
      })
      .select()
      .single()

    if (topicError) {
      console.error('Error creating forum topic:', topicError)
      return NextResponse.json(
        { error: `Failed to create topic: ${topicError.message}` },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Forum topic created successfully',
      topic
    })
  } catch (error: any) {
    console.error('Error in create forum topic API:', error)
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
})

