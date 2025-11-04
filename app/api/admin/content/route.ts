import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/auth'
import { withModeratorAuth } from '@/lib/auth'

// GET /api/admin/content - Get all content with pagination and filters
export const GET = withModeratorAuth(async (req: NextRequest) => {
  const supabase = getSupabaseClient()
  const { searchParams } = new URL(req.url)
  
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const search = searchParams.get('search') || ''
  const type = searchParams.get('type') || ''
  const status = searchParams.get('status') || ''
  const category = searchParams.get('category') || ''
  
  const offset = (page - 1) * limit

  try {
    // Build query for content with author info
    let query = supabase
      .from('content')
      .select(`
        *,
        author:profiles!content_author_id_fkey (
          full_name,
          username,
          avatar_url
        )
      `)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    // Add search filter
    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%,excerpt.ilike.%${search}%`)
    }

    // Add type filter
    if (type) {
      query = query.eq('type', type)
    }

    // Add status filter
    if (status) {
      query = query.eq('status', status)
    }

    // Add category filter
    if (category) {
      query = query.eq('category', category)
    }

    const { data: content, error: contentError } = await query

    if (contentError) {
      return NextResponse.json(
        { error: 'Failed to fetch content' },
        { status: 500 }
      )
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('content')
      .select('id', { count: 'exact', head: true })

    if (search) {
      countQuery = countQuery.or(`title.ilike.%${search}%,content.ilike.%${search}%,excerpt.ilike.%${search}%`)
    }
    if (type) {
      countQuery = countQuery.eq('type', type)
    }
    if (status) {
      countQuery = countQuery.eq('status', status)
    }
    if (category) {
      countQuery = countQuery.eq('category', category)
    }

    const { count, error: countError } = await countQuery

    if (countError) {
      return NextResponse.json(
        { error: 'Failed to count content' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      content,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching content:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})

// POST /api/admin/content - Create new content
export const POST = withModeratorAuth(async (req: NextRequest, user: any) => {
  const supabase = getSupabaseClient()
  
  try {
    const body = await req.json()
    const {
      title,
      content,
      excerpt,
      type,
      category,
      status = 'draft',
      featured_image_url,
      tags,
      meta_title,
      meta_description,
      published_at
    } = body

    if (!title || !content || !type) {
      return NextResponse.json(
        { error: 'Title, content, and type are required' },
        { status: 400 }
      )
    }

    // Validate type
    const validTypes = ['blog', 'news', 'article', 'page']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be one of: blog, news, article, page' },
        { status: 400 }
      )
    }

    // Validate status
    const validStatuses = ['draft', 'published', 'archived']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: draft, published, archived' },
        { status: 400 }
      )
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Check if slug already exists
    const { data: existingContent } = await supabase
      .from('content')
      .select('id')
      .eq('slug', slug)
      .single()

    let finalSlug = slug
    if (existingContent) {
      finalSlug = `${slug}-${Date.now()}`
    }

    // Validate published_at if provided
    let publishedAt = null
    if (published_at) {
      publishedAt = new Date(published_at)
      if (isNaN(publishedAt.getTime())) {
        return NextResponse.json(
          { error: 'Invalid published date' },
          { status: 400 }
        )
      }
    } else if (status === 'published') {
      publishedAt = new Date()
    }

    const { data, error } = await supabase
      .from('content')
      .insert({
        title,
        slug: finalSlug,
        content,
        excerpt,
        type,
        category,
        status,
        featured_image_url,
        tags,
        meta_title,
        meta_description,
        author_id: user.id,
        published_at: publishedAt?.toISOString()
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: `Failed to create content: ${error.message}` },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Content created successfully',
      content: data
    })
  } catch (error) {
    console.error('Error creating content:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})