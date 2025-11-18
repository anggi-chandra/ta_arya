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
    const { data: matches, error } = await supabase
      .from('tournament_matches')
      .select(`
        id,
        round,
        match_number,
        status,
        score_team1,
        score_team2,
        scheduled_at,
        started_at,
        ended_at,
        team1:teams!tournament_matches_team1_id_fkey (
          id,
          name,
          logo_url,
          game
        ),
        team2:teams!tournament_matches_team2_id_fkey (
          id,
          name,
          logo_url,
          game
        ),
        winner:teams!tournament_matches_winner_id_fkey (
          id,
          name,
          logo_url,
          game
        )
      `)
      .eq('tournament_id', tournamentId)
      .order('round', { ascending: true })
      .order('match_number', { ascending: true })

    if (error) {
      console.error('Error fetching tournament matches:', error)
      return NextResponse.json(
        { error: 'Failed to fetch tournament matches' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      matches: matches || []
    })
  } catch (err) {
    console.error('Unexpected error fetching matches:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

