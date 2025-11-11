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
    // Build base query for filters
    let baseQuery = supabase.from('teams').select('id', { count: 'exact', head: true })

    // Apply filters for count query
    if (search) {
      baseQuery = baseQuery.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }
    if (game) {
      baseQuery = baseQuery.eq('game', game)
    }
    if (recruiting) {
      baseQuery = baseQuery.eq('recruiting', recruiting === 'true')
    }

    // Get total count for pagination
    const { count, error: countError } = await baseQuery

    let finalCount = 0

    if (countError) {
      console.error('Error counting teams:', countError)
      console.error('Count error details:', JSON.stringify(countError, null, 2))
      
      // If count query fails, try an alternative: fetch all IDs and count manually
      console.log('Trying alternative count method...')
      let altCountQuery = supabase.from('teams').select('id')
      
      if (search) {
        altCountQuery = altCountQuery.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
      }
      if (game) {
        altCountQuery = altCountQuery.eq('game', game)
      }
      if (recruiting) {
        altCountQuery = altCountQuery.eq('recruiting', recruiting === 'true')
      }
      
      const { data: allTeams, error: altError } = await altCountQuery
      if (!altError && allTeams) {
        console.log('Alternative count successful. Count:', allTeams.length)
        finalCount = allTeams.length
      } else {
        console.error('Alternative count also failed:', altError)
        finalCount = 0
      }
    } else {
      console.log('Teams count query successful. Count:', count)
      finalCount = count || 0
    }

    // Build query for teams (without relationship to avoid PostgREST issues)
    let query = supabase
      .from('teams')
      .select('*')
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
      console.error('Error fetching teams:', teamsError)
      return NextResponse.json(
        { error: 'Failed to fetch teams', details: teamsError.message },
        { status: 500 }
      )
    }

    // Fetch owner profiles separately
    const ownerIds = [...new Set(teams?.map(t => t.owner_id).filter(Boolean) || [])]
    let ownerProfiles: Record<string, any> = {}

    if (ownerIds.length > 0) {
      const { data: owners } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url')
        .in('id', ownerIds)

      if (owners) {
        owners.forEach((owner: any) => {
          ownerProfiles[owner.id] = owner
        })
      }
    }

    // Fetch team members count separately
    const teamIds = teams?.map(t => t.id) || []
    let memberCounts: Record<string, number> = {}
    let achievementCounts: Record<string, number> = {}

    if (teamIds.length > 0) {
      // Get member counts
      const { data: members } = await supabase
        .from('team_members')
        .select('team_id')
        .in('team_id', teamIds)

      if (members) {
        members.forEach((member: any) => {
          memberCounts[member.team_id] = (memberCounts[member.team_id] || 0) + 1
        })
      }

      // Get achievement counts
      try {
        const { data: achievements } = await supabase
          .from('team_achievements')
          .select('team_id')
          .in('team_id', teamIds)

        if (achievements) {
          achievements.forEach((achievement: any) => {
            achievementCounts[achievement.team_id] = (achievementCounts[achievement.team_id] || 0) + 1
          })
        }
      } catch (err) {
        // Table might not exist, that's okay
        console.log('Could not fetch achievements:', err)
      }
    }

    // Add owner, member count, and achievement count to each team
    const teamsWithStats = teams?.map(team => ({
      ...team,
      owner: team.owner_id ? ownerProfiles[team.owner_id] || null : null,
      member_count: memberCounts[team.id] || 0,
      achievement_count: achievementCounts[team.id] || 0
    }))

    console.log('Teams API - Total count:', finalCount, 'Teams fetched:', teams?.length)

    return NextResponse.json({
      teams: teamsWithStats || [],
      pagination: {
        page,
        limit,
        total: finalCount || 0,
        totalPages: Math.ceil((finalCount || 0) / limit)
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