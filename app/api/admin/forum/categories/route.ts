import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/auth'
import { withModeratorAuth } from '@/lib/auth'

// GET /api/admin/forum/categories - Get all forum categories
export const GET = withModeratorAuth(async (req: NextRequest) => {
  const supabase = getSupabaseClient()
  const { searchParams } = new URL(req.url)
  
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const search = searchParams.get('search') || ''
  const includeInactive = searchParams.get('include_inactive') === 'true'
  
  const offset = (page - 1) * limit

  try {
    // Build query for categories with topic count
    // Get all categories if include_inactive=true, otherwise only active
    let query = supabase
      .from('forum_categories')
      .select(`
        *,
        forum_topics (
          id
        )
      `)
    
    if (!includeInactive) {
      query = query.eq('is_active', true) // Only show active categories by default
    }
    
    query = query
      .range(offset, offset + limit - 1)
      .order('name', { ascending: true }) // Order by name alphabetically

    // Add search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    const { data: categories, error: categoriesError } = await query

    if (categoriesError) {
      return NextResponse.json(
        { error: 'Failed to fetch forum categories' },
        { status: 500 }
      )
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('forum_categories')
      .select('id', { count: 'exact', head: true })
    
    if (!includeInactive) {
      countQuery = countQuery.eq('is_active', true) // Only count active categories by default
    }

    if (search) {
      countQuery = countQuery.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    const { count, error: countError } = await countQuery

    if (countError) {
      return NextResponse.json(
        { error: 'Failed to count forum categories' },
        { status: 500 }
      )
    }

    // Add topic count to each category
    const categoriesWithStats = categories?.map(category => ({
      ...category,
      topic_count: category.forum_topics?.length || 0
    }))

    return NextResponse.json({
      categories: categoriesWithStats,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching forum categories:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})

// POST /api/admin/forum/categories - Create new forum category
export const POST = withModeratorAuth(async (req: NextRequest, user: any) => {
  const supabase = getSupabaseClient()
  
  try {
    const body = await req.json()
    const {
      name,
      description,
      color = '#3B82F6',
      is_active = true
    } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      )
    }

    // Check if category name already exists
    const { data: existingCategory } = await supabase
      .from('forum_categories')
      .select('id')
      .eq('name', name)
      .single()

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Category name already exists' },
        { status: 400 }
      )
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    const { data, error } = await supabase
      .from('forum_categories')
      .insert({
        name,
        slug,
        description,
        color,
        is_active
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: `Failed to create category: ${error.message}` },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Forum category created successfully',
      category: data
    })
  } catch (error) {
    console.error('Error creating forum category:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})