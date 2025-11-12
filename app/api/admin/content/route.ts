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
  
  const offset = (page - 1) * limit

  try {
    // Build query for content - fetch content first, then author separately if needed
    let query = supabase
      .from('content')
      .select('*')
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

    const { data: content, error: contentError } = await query

    if (contentError) {
      console.error('Error fetching content:', contentError)
      console.error('Error details:', JSON.stringify(contentError, null, 2))
      return NextResponse.json(
        { 
          error: 'Failed to fetch content', 
          details: contentError.message,
          code: contentError.code,
          hint: contentError.hint
        },
        { status: 500 }
      )
    }

    console.log(`Fetched ${content?.length || 0} content items`)

    // Fetch author profiles separately if author_id exists
    // Skip if no content
    let contentWithAuthors = []
    if (content && content.length > 0) {
      contentWithAuthors = await Promise.all(
        content.map(async (item: any) => {
          if (item.author_id) {
            try {
              const { data: authorData, error: authorError } = await supabase
                .from('profiles')
                .select('full_name, username, avatar_url')
                .eq('id', item.author_id)
                .single()
              
              if (authorError) {
                console.error(`Error fetching author for content ${item.id}:`, authorError)
                return { ...item, author: null }
              }
              
              return { ...item, author: authorData || null }
            } catch (err) {
              console.error(`Error fetching author for content ${item.id}:`, err)
              return { ...item, author: null }
            }
          }
          return { ...item, author: null }
        })
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

    const { count, error: countError } = await countQuery

    if (countError) {
      return NextResponse.json(
        { error: 'Failed to count content' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      content: contentWithAuthors || [],
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
      status = 'draft',
      featured_image, // Use featured_image instead of featured_image_url
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

    // Prepare insert data - only use columns that exist in schema
    const insertData: any = {
      title,
      slug: finalSlug,
      content,
      excerpt: excerpt || null,
      type,
      status,
      author_id: user.id,
    }

    // Add optional fields only if they exist
    if (featured_image) {
      insertData.featured_image = featured_image
    }

    if (publishedAt) {
      insertData.published_at = publishedAt.toISOString()
    }

    const { data, error } = await supabase
      .from('content')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('Error creating content:', error)
      return NextResponse.json(
        { error: `Failed to create content: ${error.message}`, details: error },
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