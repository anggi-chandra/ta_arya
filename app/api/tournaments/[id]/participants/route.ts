import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = getSupabaseClient()
  const tournamentId = params.id

  if (!tournamentId) {
    return NextResponse.json(
      { error: 'Tournament ID is required' },
      { status: 400 }
    )
  }

  try {
    const { data: participants, error } = await supabase
      .from('tournament_participants')
      .select(`
        tournament_id,
        team_id,
        status,
        seed,
        checked_in_at,
        registered_at,
        team:teams (
          id,
          name,
          logo_url,
          game
        )
      `)
      .eq('tournament_id', tournamentId)
      .order('seed', { ascending: true, nullsLast: true })
      .order('registered_at', { ascending: true })

    if (error) {
      console.error('Error fetching tournament participants:', error)
      return NextResponse.json(
        { error: 'Failed to fetch tournament participants' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      participants: participants || []
    })
  } catch (err) {
    console.error('Unexpected error fetching participants:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

