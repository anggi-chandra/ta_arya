import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/auth'
import { withModeratorAuth } from '@/lib/auth'

// GET /api/admin/events - Get all events with pagination and filters
export const GET = withModeratorAuth(async (req: NextRequest, user: any) => {
  const { searchParams } = new URL(req.url)
  
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const search = searchParams.get('search') || ''
  const status = searchParams.get('status') || ''
  
  const offset = (page - 1) * limit

  try {
    // Use service role key for database operations
    const supabase = getSupabaseClient()
    
    // Build base query
    // Try to get creator info, but don't fail if relationship doesn't work
    let query = supabase
      .from('events')
      .select('*', { count: 'exact' })
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

    const { data: events, error: eventsError, count } = await query

    if (eventsError) {
      console.error('Error fetching events:', eventsError)
      console.error('Query details:', { page, limit, search, status, offset })
      return NextResponse.json(
        { error: `Failed to fetch events: ${eventsError.message}` },
        { status: 500 }
      )
    }

    console.log('Fetched events:', { count: events?.length, total: count, status, search })

    // Get participant counts for each event
    if (events && events.length > 0) {
      const eventIds = events.map((e: any) => e.id)
      
      const { data: registrations, error: regError } = await supabase
        .from('event_registrations')
        .select('event_id')
        .in('event_id', eventIds)

      if (regError) {
        console.error('Error fetching registrations:', regError)
      }

      // Count participants per event
      const participantCounts: Record<string, number> = {}
      if (registrations) {
        registrations.forEach((reg: any) => {
          participantCounts[reg.event_id] = (participantCounts[reg.event_id] || 0) + 1
        })
      }

      // Try to get creator profiles for each event
      const creatorIds = [...new Set(events.map((e: any) => e.created_by).filter(Boolean))]
      let creatorProfiles: Record<string, any> = {}
      
      if (creatorIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, username')
          .in('id', creatorIds)
        
        if (profiles) {
          profiles.forEach((profile: any) => {
            creatorProfiles[profile.id] = profile
          })
        }
      }

      // Add participant counts and creator info to events
      const eventsWithStats = events.map((event: any) => ({
        ...event,
        creator: event.created_by ? creatorProfiles[event.created_by] || null : null,
        event_stats: {
          participants: participantCounts[event.id] || 0
        }
      }))

      return NextResponse.json({
        events: eventsWithStats,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      })
    }

    return NextResponse.json({
      events: events || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error: any) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
})

// POST /api/admin/events - Create new event
export const POST = withModeratorAuth(async (req: NextRequest, user: any) => {
  try {
    const body = await req.json()
    
    // Use service role key for database operations since we've already verified auth
    const supabase = getSupabaseClient()
    const {
      title,
      description,
      game,
      image_url,
      location,
      starts_at,
      ends_at,
      max_participants,
      price_cents = 0,
      live_url,
      status = 'upcoming'
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

    // Validate user.id is a valid UUID
    if (!user?.id || typeof user.id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id)) {
      console.error('Invalid user ID:', user?.id)
      return NextResponse.json(
        { error: 'Invalid user authentication. Please sign in again.' },
        { status: 401 }
      )
    }

    // Validate status
    const validStatuses = ['draft', 'upcoming', 'ongoing', 'completed', 'cancelled']
    const eventStatus = validStatuses.includes(status) ? status : 'upcoming'

    const { data, error } = await supabase
      .from('events')
      .insert({
        title,
        description,
        game,
        image_url,
        location,
        starts_at,
        ends_at,
        max_participants,
        price_cents,
        live_url,
        status: eventStatus,
        created_by: user.id
      })
      .select()
      .single()

    if (error) {
      console.error('Database error creating event:', error)
      return NextResponse.json(
        { error: `Failed to create event: ${error.message}` },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Event created successfully',
      event: data
    })
  } catch (error: any) {
    console.error('Error creating event:', error)
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
})