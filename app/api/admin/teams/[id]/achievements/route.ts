import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/auth'
import { withModeratorAuth } from '@/lib/auth'

// GET /api/admin/teams/[id]/achievements - Get team achievements
export const GET = withModeratorAuth(async (req: NextRequest, user: any, { params }: { params: { id: string } }) => {
  const supabase = getSupabaseClient()
  const { searchParams } = new URL(req.url)
  
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  
  const offset = (page - 1) * limit

  try {
    // Check if team exists
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('id, name')
      .eq('id', params.id)
      .single()

    if (teamError) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      )
    }

    const { data: achievements, error: achievementsError } = await supabase
      .from('team_achievements')
      .select('*')
      .eq('team_id', params.id)
      .range(offset, offset + limit - 1)
      .order('achievement_date', { ascending: false })

    if (achievementsError) {
      return NextResponse.json(
        { error: 'Failed to fetch team achievements' },
        { status: 500 }
      )
    }

    // Get total count
    const { count, error: countError } = await supabase
      .from('team_achievements')
      .select('id', { count: 'exact', head: true })
      .eq('team_id', params.id)

    if (countError) {
      return NextResponse.json(
        { error: 'Failed to count team achievements' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      team: { id: team.id, name: team.name },
      achievements,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching team achievements:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})

// POST /api/admin/teams/[id]/achievements - Add team achievement
export const POST = withModeratorAuth(async (req: NextRequest, user: any, { params }: { params: { id: string } }) => {
  const supabase = getSupabaseClient()
  
  try {
    const body = await req.json()
    const {
      title,
      description,
      achievement_date,
      rank_position,
      tournament_name,
      prize_amount
    } = body

    if (!title || !achievement_date) {
      return NextResponse.json(
        { error: 'Title and achievement date are required' },
        { status: 400 }
      )
    }

    // Check if team exists
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('id, name')
      .eq('id', params.id)
      .single()

    if (teamError) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      )
    }

    // Validate achievement date
    const achievementDate = new Date(achievement_date)
    if (isNaN(achievementDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid achievement date' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('team_achievements')
      .insert({
        team_id: params.id,
        title,
        description,
        achievement_date: achievementDate.toISOString(),
        rank_position,
        tournament_name,
        prize_amount
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: `Failed to add achievement: ${error.message}` },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Achievement added successfully',
      achievement: data
    })
  } catch (error) {
    console.error('Error adding team achievement:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})