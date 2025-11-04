import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/auth'
import { withModeratorAuth } from '@/lib/auth'

// GET /api/admin/teams - Get all teams with pagination and filters
export const GET = withModeratorAuth(async (req: NextRequest) => {
  const supabase = getSupabaseClient()
  const { searchParams } = new URL(req.url)
  
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const search = searchParams.get('search') || ''
  const game = searchParams.get('game') || ''
  const recruiting = searchParams.get('recruiting') || ''
  
  const offset = (page - 1) * limit

  try {
    // Build query for teams with owner info and member count
    let query = supabase
      .from('teams')
      .select(`
        *,
        owner:profiles!teams_owner_id_fkey (
          full_name,
          username,
          avatar_url
        ),
        team_members (
          user_id,
          role
        ),
        team_achievements (
          id,
          title,
          achievement_date,
          rank_position
        )
      `)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    // Add search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Add game filter
    if (game) {
      query = query.eq('game', game)
    }

    // Add recruiting filter
    if (recruiting) {
      query = query.eq('recruiting', recruiting === 'true')
    }

    const { data: teams, error: teamsError } = await query

    if (teamsError) {
      return NextResponse.json(
        { error: 'Failed to fetch teams' },
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
    if (game) {
      countQuery = countQuery.eq('game', game)
    }
    if (recruiting) {
      countQuery = countQuery.eq('recruiting', recruiting === 'true')
    }

    const { count, error: countError } = await countQuery

    if (countError) {
      return NextResponse.json(
        { error: 'Failed to count teams' },
        { status: 500 }
      )
    }

    // Add member count to each team
    const teamsWithStats = teams?.map(team => ({
      ...team,
      member_count: team.team_members?.length || 0,
      achievement_count: team.team_achievements?.length || 0
    }))

    return NextResponse.json({
      teams: teamsWithStats,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching teams:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})

// POST /api/admin/teams - Create new team
export const POST = withModeratorAuth(async (req: NextRequest, user: any) => {
  const supabase = getSupabaseClient()
  
  try {
    const body = await req.json()
    const {
      name,
      game,
      logo_url,
      description,
      recruiting = false,
      owner_id
    } = body

    if (!name || !game) {
      return NextResponse.json(
        { error: 'Team name and game are required' },
        { status: 400 }
      )
    }

    // Use provided owner_id or current user as owner
    const teamOwnerId = owner_id || user.id

    // Check if owner exists
    const { data: ownerProfile, error: ownerError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', teamOwnerId)
      .single()

    if (ownerError) {
      return NextResponse.json(
        { error: 'Owner not found' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('teams')
      .insert({
        name,
        game,
        logo_url,
        description,
        recruiting,
        owner_id: teamOwnerId
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: `Failed to create team: ${error.message}` },
        { status: 400 }
      )
    }

    // Add owner as team member
    await supabase
      .from('team_members')
      .insert({
        team_id: data.id,
        user_id: teamOwnerId,
        role: 'owner'
      })

    return NextResponse.json({
      message: 'Team created successfully',
      team: data
    })
  } catch (error) {
    console.error('Error creating team:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})