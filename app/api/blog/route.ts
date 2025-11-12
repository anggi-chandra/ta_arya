import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// GET /api/blog - Get published blog content (public)
// This is a public endpoint, so we use service role key to bypass RLS
export async function GET(req: NextRequest) {
  // Use service role key for public access (bypasses RLS)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { searchParams } = new URL(req.url)
  
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '12')
  const search = searchParams.get('search') || ''
  const type = searchParams.get('type') || '' // blog, news, article
  const category = searchParams.get('category') || '' // news, tips, analysis, community
  
  const offset = (page - 1) * limit

  try {
    // Build query for published content - fetch content first, then author separately
    let query = supabase
      .from('content')
      .select('*')
      .eq('status', 'published') // Only published content
      .range(offset, offset + limit - 1)
      .order('published_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })

    // Add search filter
    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%,excerpt.ilike.%${search}%`)
    }

    // Add type filter (blog, news, article)
    if (type) {
      query = query.eq('type', type)
    } else {
      // Default: get blog, news, and article (exclude page)
      query = query.in('type', ['blog', 'news', 'article'])
    }

    // Note: category filter would require a category column in the database
    // For now, we'll map types to categories:
    // news -> news category
    // blog -> news category (or can be mapped differently)
    // article -> tips or analysis (based on content or tags)
    // This mapping will be done on the frontend

    const { data: content, error: contentError } = await query

    if (contentError) {
      console.error('Error fetching blog content:', contentError)
      console.error('Error details:', JSON.stringify(contentError, null, 2))
      return NextResponse.json(
        { 
          error: 'Failed to fetch blog content', 
          details: contentError.message,
          code: contentError.code,
          hint: contentError.hint
        },
        { status: 500 }
      )
    }

    console.log(`Fetched ${content?.length || 0} published content items`)

    // Fetch author profiles separately if author_id exists
    let contentWithAuthors = []
    if (content && content.length > 0) {
      contentWithAuthors = await Promise.all(
        content.map(async (item: any) => {
          // Only select fields needed for blog display
          const blogItem: any = {
            id: item.id,
            title: item.title,
            slug: item.slug,
            excerpt: item.excerpt,
            featured_image: item.featured_image,
            type: item.type,
            published_at: item.published_at,
            created_at: item.created_at,
            author: null
          }

          if (item.author_id) {
            try {
              const { data: authorData, error: authorError } = await supabase
                .from('profiles')
                .select('full_name, username, avatar_url')
                .eq('id', item.author_id)
                .single()
              
              if (authorError) {
                console.error(`Error fetching author for content ${item.id}:`, authorError)
              } else {
                blogItem.author = authorData
              }
            } catch (err) {
              console.error(`Error fetching author for content ${item.id}:`, err)
            }
          }
          
          return blogItem
        })
      )
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('content')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'published')

    if (search) {
      countQuery = countQuery.or(`title.ilike.%${search}%,content.ilike.%${search}%,excerpt.ilike.%${search}%`)
    }
    if (type) {
      countQuery = countQuery.eq('type', type)
    } else {
      countQuery = countQuery.in('type', ['blog', 'news', 'article'])
    }

    const { count, error: countError } = await countQuery

    if (countError) {
      console.error('Error counting blog content:', countError)
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
    console.error('Error fetching blog content:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

