import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/auth'
import { withModeratorAuth } from '@/lib/auth'

// GET /api/admin/events/[id]/registrations - Get event registrations
export const GET = withModeratorAuth(async (req: NextRequest, user: any, { params }: { params: { id: string } }) => {
  const supabase = getSupabaseClient()
  const eventId = params.id
  const { searchParams } = new URL(req.url)
  
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const status = searchParams.get('status') || ''
  
  const offset = (page - 1) * limit

  try {
    let query = supabase
      .from('event_registrations')
      .select(`
        *,
        user:profiles!event_registrations_user_id_fkey (
          full_name,
          username,
          avatar_url,
          bio
        )
      `)
      .eq('event_id', eventId)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    // Filter by status if provided
    if (status) {
      query = query.eq('status', status)
    }

    const { data: registrations, error: registrationsError } = await query

    if (registrationsError) {
      return NextResponse.json(
        { error: 'Failed to fetch registrations' },
        { status: 500 }
      )
    }

    // Get total count
    let countQuery = supabase
      .from('event_registrations')
      .select('id', { count: 'exact', head: true })
      .eq('event_id', eventId)

    if (status) {
      countQuery = countQuery.eq('status', status)
    }

    const { count, error: countError } = await countQuery

    if (countError) {
      return NextResponse.json(
        { error: 'Failed to count registrations' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      registrations,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching registrations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})

// POST /api/admin/events/[id]/registrations - Manually register user to event
export const POST = withModeratorAuth(async (req: NextRequest, user: any, { params }: { params: { id: string } }) => {
  const supabase = getSupabaseClient()
  const eventId = params.id

  try {
    const body = await req.json()
    const { user_id, status = 'registered' } = body

    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Check if event exists and get max participants
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('max_participants')
      .eq('id', eventId)
      .single()

    if (eventError) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Check if user is already registered
    const { data: existingReg } = await supabase
      .from('event_registrations')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', user_id)
      .single()

    if (existingReg) {
      return NextResponse.json(
        { error: 'User is already registered for this event' },
        { status: 400 }
      )
    }

    // Check max participants if set
    if (event.max_participants) {
      const { count } = await supabase
        .from('event_registrations')
        .select('id', { count: 'exact', head: true })
        .eq('event_id', eventId)
        .eq('status', 'registered')

      if (count && count >= event.max_participants) {
        return NextResponse.json(
          { error: 'Event is full' },
          { status: 400 }
        )
      }
    }

    // Register user
    const { data, error } = await supabase
      .from('event_registrations')
      .insert({
        event_id: eventId,
        user_id,
        status
      })
      .select(`
        *,
        user:profiles!event_registrations_user_id_fkey (
          full_name,
          username,
          avatar_url
        )
      `)
      .single()

    if (error) {
      return NextResponse.json(
        { error: `Failed to register user: ${error.message}` },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'User registered successfully',
      registration: data
    })
  } catch (error) {
    console.error('Error registering user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})