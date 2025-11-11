import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/auth'

// GET /api/tournaments/[id] - Get single tournament by ID (public access)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Use service role key for public access to tournaments
  const supabase = getSupabaseClient()
  
  const tournamentId = params.id

  try {
    console.log('Fetching tournament with ID:', tournamentId)
    
    // Fetch tournament
    const { data: tournament, error } = await supabase
      .from('tournaments')
      .select('*')
      .eq('id', tournamentId)
      .single()

    if (error) {
      console.error('Error fetching tournament:', error)
      console.error('Error details:', { code: error.code, message: error.message, details: error.details })
      return NextResponse.json({ error: `Tournament not found: ${error.message}` }, { status: 404 })
    }

    if (!tournament) {
      console.error('Tournament is null')
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 })
    }

    console.log('Tournament found:', tournament.id, tournament.title)
    console.log('Tournament prize_pool from DB:', tournament.prize_pool, 'Type:', typeof tournament.prize_pool)
    console.log('Tournament currency from DB:', tournament.currency)

    // Get participant count from tournament_participants
    const { count, error: countError } = await supabase
      .from('tournament_participants')
      .select('*', { count: 'exact', head: true })
      .eq('tournament_id', tournamentId)

    if (countError) {
      console.error('Error fetching participant count:', countError)
    }

    const participantCount = count || 0

    // Fetch organizer profile if organizer_id exists
    let organizer = null
    if (tournament.organizer_id) {
      const { data: organizerProfile } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url')
        .eq('id', tournament.organizer_id)
        .single()
      
      if (organizerProfile) {
        organizer = organizerProfile
      }
    }

    const tournamentWithStats = {
      ...tournament,
      registeredCount: participantCount,
      organizer
    }

    console.log('Returning tournament data:', {
      id: tournamentWithStats.id,
      title: tournamentWithStats.title,
      prize_pool: tournamentWithStats.prize_pool,
      currency: tournamentWithStats.currency
    })

    // Return response with no-cache headers to ensure fresh data
    return NextResponse.json(
      { tournament: tournamentWithStats },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    )
  } catch (error: any) {
    console.error('Error in tournaments API:', error)
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 })
  }
}

