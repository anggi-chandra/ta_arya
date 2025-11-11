import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/auth'
import { withModeratorAuth } from '@/lib/auth'

// GET /api/admin/tournaments - Get all tournaments with pagination
export const GET = withModeratorAuth(async (req: NextRequest, user: any) => {
  const supabase = getSupabaseClient()
  const { searchParams } = new URL(req.url)
  
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const search = searchParams.get('search') || ''
  const status = searchParams.get('status') || ''
  
  const offset = (page - 1) * limit

  try {
    let query = supabase
      .from('tournaments')
      .select('*', { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    // Add search filter
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,location.ilike.%${search}%`)
    }

    // Add status filter
    if (status) {
      query = query.eq('status', status)
    }

    const { data: tournaments, error: tournamentsError, count } = await query

    if (tournamentsError) {
      console.error('Error fetching tournaments:', tournamentsError)
      return NextResponse.json(
        { error: `Failed to fetch tournaments: ${tournamentsError.message}` },
        { status: 500 }
      )
    }

    console.log('Fetched tournaments:', { 
      fetched: tournaments?.length || 0, 
      total: count || 0, 
      status: status || 'all',
      search: search || 'none',
      page,
      limit
    })

    // Get participant counts for each tournament (from tournament_registrations if exists)
    // For now, we'll just return the tournaments as is
    // You can add tournament_registrations table later if needed

    return NextResponse.json({
      tournaments: tournaments || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error: any) {
    console.error('Error fetching tournaments:', error)
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
})

// POST /api/admin/tournaments - Create new tournament
export const POST = withModeratorAuth(async (req: NextRequest, user: any) => {
  try {
    const body = await req.json()
    const supabase = getSupabaseClient()
    const {
      title,
      description,
      game,
      tournament_type,
      format,
      max_participants,
      prize_pool = 0,
      currency = 'IDR',
      entry_fee = 0,
      location,
      starts_at,
      ends_at,
      registration_deadline,
      status = 'upcoming',
      rules,
      banner_url
    } = body

    // Validation
    if (!title || !game || !tournament_type || !format || !max_participants || !starts_at || !registration_deadline) {
      return NextResponse.json(
        { error: 'Title, game, tournament_type, format, max_participants, starts_at, and registration_deadline are required' },
        { status: 400 }
      )
    }

    // Validate dates
    const startDate = new Date(starts_at)
    const endDate = ends_at ? new Date(ends_at) : null
    const regDeadline = new Date(registration_deadline)

    if (endDate && endDate <= startDate) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      )
    }

    if (regDeadline >= startDate) {
      return NextResponse.json(
        { error: 'Registration deadline must be before start date' },
        { status: 400 }
      )
    }

    // Validate tournament_type
    const validTournamentTypes = ['single_elimination', 'double_elimination', 'round_robin', 'swiss']
    if (!validTournamentTypes.includes(tournament_type)) {
      return NextResponse.json(
        { error: 'Invalid tournament_type' },
        { status: 400 }
      )
    }

    // Validate format
    const validFormats = ['1v1', '2v2', '3v3', '4v4', '5v5', 'custom']
    if (!validFormats.includes(format)) {
      return NextResponse.json(
        { error: 'Invalid format' },
        { status: 400 }
      )
    }

    // Validate status
    const validStatuses = ['upcoming', 'ongoing', 'completed', 'cancelled']
    const tournamentStatus = validStatuses.includes(status) ? status : 'upcoming'

    // Validate user.id is a valid UUID
    if (!user?.id || typeof user.id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id)) {
      console.error('Invalid user ID:', user?.id)
      return NextResponse.json(
        { error: 'Invalid user authentication. Please sign in again.' },
        { status: 401 }
      )
    }

    const { data, error } = await supabase
      .from('tournaments')
      .insert({
        title,
        description,
        game,
        tournament_type,
        format,
        max_participants: parseInt(max_participants),
        prize_pool: parseInt(prize_pool) || 0,
        currency: currency || 'IDR',
        entry_fee: parseInt(entry_fee) || 0,
        location,
        starts_at,
        ends_at,
        registration_deadline,
        status: tournamentStatus,
        rules,
        banner_url,
        organizer_id: user.id
      })
      .select()
      .single()

    if (error) {
      console.error('Database error creating tournament:', error)
      return NextResponse.json(
        { error: `Failed to create tournament: ${error.message}` },
        { status: 400 }
      )
    }

    return NextResponse.json({ message: 'Tournament created successfully', tournament: data })
  } catch (error: any) {
    console.error('Error creating tournament:', error)
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
})

