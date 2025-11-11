import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/auth'

// GET /api/teams - Get all teams with pagination and filters (public)
export async function GET(request: NextRequest) {
  const supabase = getSupabaseClient()
  const { searchParams } = new URL(request.url)
  
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const search = searchParams.get('search') || ''
  const game = searchParams.get('game') || ''
  const recruiting = searchParams.get('recruiting') || ''
  
  const offset = (page - 1) * limit

  try {
    // Build query for teams with owner info and member count
    let query = supabase
      .from('teams')
      .select(`
        id,
        name,
        game,
        logo_url,
        description,
        recruiting,
        created_at,
        team_members (
          user_id
        )
      `)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    // Add search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Add game filter
    if (game && game !== 'Semua Game') {
      query = query.eq('game', game)
    }

    // Add recruiting filter
    if (recruiting === 'true') {
      query = query.eq('recruiting', true)
    }

    const { data: teams, error: teamsError } = await query

    if (teamsError) {
      console.error('Error fetching teams:', teamsError)
      return NextResponse.json(
        { error: 'Failed to fetch teams', details: teamsError.message },
        { status: 500 }
      )
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('teams')
      .select('id', { count: 'exact', head: true })

    if (search) {
      countQuery = countQuery.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }
    if (game && game !== 'Semua Game') {
      countQuery = countQuery.eq('game', game)
    }
    if (recruiting === 'true') {
      countQuery = countQuery.eq('recruiting', true)
    }

    const { count, error: countError } = await countQuery

    if (countError) {
      console.error('Error counting teams:', countError)
    }

    // Get achievement counts for each team
    const teamIds = teams?.map(team => team.id) || []
    let achievementCounts: Record<string, number> = {}
    
    if (teamIds.length > 0) {
      try {
        const { data: achievements, error: achievementsError } = await supabase
          .from('team_achievements')
          .select('team_id')
          .in('team_id', teamIds)

        if (!achievementsError && achievements) {
          achievements.forEach((achievement: any) => {
            achievementCounts[achievement.team_id] = (achievementCounts[achievement.team_id] || 0) + 1
          })
        }
      } catch (err) {
        // Table might not exist or have no data, that's okay
        console.log('Could not fetch achievements:', err)
      }
    }

    // Add member count and achievement count to each team
    const teamsWithStats = teams?.map(team => ({
      ...team,
      memberCount: team.team_members?.length || 0,
      achievements: achievementCounts[team.id] || 0,
      logo: team.logo_url || '/images/teams/team-default.svg',
      isRecruiting: team.recruiting || false
    })) || []

    // Get unique games for filter
    const { data: allTeams, error: gamesError } = await supabase
      .from('teams')
      .select('game')
      .order('game', { ascending: true })

    const uniqueGames = allTeams 
      ? [...new Set(allTeams.map(t => t.game).filter(Boolean))].sort()
      : []

    return NextResponse.json({
      teams: teamsWithStats,
      games: uniqueGames,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
      }
    })
  } catch (error: any) {
    console.error('Error in teams API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message },
      { status: 500 }
    )
  }
}
