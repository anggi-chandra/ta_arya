import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/auth'
import { withModeratorAuth } from '@/lib/auth'

// GET /api/admin/events - Get all events with pagination and filters
export const GET = withModeratorAuth(async (req: NextRequest) => {
  const supabase = getSupabaseClient()
  const { searchParams } = new URL(req.url)
  
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const search = searchParams.get('search') || ''
  const status = searchParams.get('status') || ''
  
  const offset = (page - 1) * limit

  try {
    // Build query for events with creator info and stats
    let query = supabase
      .from('events')
      .select(`
        *,
        creator:profiles!events_created_by_fkey (
          full_name,
          username
        ),
        event_stats (
          participants
        )
      `)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    // Add search filter
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,location.ilike.%${search}%`)
    }

    // Add status filter (based on dates)
    if (status) {
      const now = new Date().toISOString()
      switch (status) {
        case 'upcoming':
          query = query.gt('starts_at', now)
          break
        case 'ongoing':
          query = query.lte('starts_at', now).gte('ends_at', now)
          break
        case 'completed':
          query = query.lt('ends_at', now)
          break
      }
    }

    const { data: events, error: eventsError } = await query

    if (eventsError) {
      return NextResponse.json(
        { error: 'Failed to fetch events' },
        { status: 500 }
      )
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('events')
      .select('id', { count: 'exact', head: true })

    if (search) {
      countQuery = countQuery.or(`title.ilike.%${search}%,description.ilike.%${search}%,location.ilike.%${search}%`)
    }

    const { count, error: countError } = await countQuery

    if (countError) {
      return NextResponse.json(
        { error: 'Failed to count events' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      events,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})

// POST /api/admin/events - Create new event
export const POST = withModeratorAuth(async (req: NextRequest, user: any) => {
  const supabase = getSupabaseClient()
  
  try {
    const body = await req.json()
    const {
      title,
      description,
      image_url,
      location,
      starts_at,
      ends_at,
      max_participants,
      price_cents = 0
    } = body

    if (!title || !starts_at) {
      return NextResponse.json(
        { error: 'Title and start date are required' },
        { status: 400 }
      )
    }

    // Validate dates
    const startDate = new Date(starts_at)
    const endDate = ends_at ? new Date(ends_at) : null

    if (endDate && endDate <= startDate) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('events')
      .insert({
        title,
        description,
        image_url,
        location,
        starts_at,
        ends_at,
        max_participants,
        price_cents,
        created_by: user.id
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: `Failed to create event: ${error.message}` },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Event created successfully',
      event: data
    })
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})