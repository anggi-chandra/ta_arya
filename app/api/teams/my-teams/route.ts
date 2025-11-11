import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { getSupabaseClient } from '@/lib/auth'

// GET /api/teams/my-teams - Get user's teams (teams where user is owner or member)
export async function GET(request: NextRequest) {
  const token = await getToken({ req: request })
  
  if (!token?.sub) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = token.sub
  const supabase = getSupabaseClient()

  try {
    // Get teams where user is a member
    const { data: teamMembers, error: membersError } = await supabase
      .from('team_members')
      .select(`
        team_id,
        role,
        joined_at,
        team:teams (
          id,
          name,
          game,
          description,
          logo_url,
          owner_id,
          created_at
        )
      `)
      .eq('user_id', userId)

    if (membersError) {
      console.error('Error fetching user teams:', membersError)
      return NextResponse.json(
        { error: 'Failed to fetch teams' },
        { status: 500 }
      )
    }

    // Transform data to include team info
    const teams = (teamMembers || []).map((tm: any) => ({
      ...tm.team,
      role: tm.role,
      joined_at: tm.joined_at
    }))

    return NextResponse.json({ 
      teams: teams || [],
      count: teams.length
    })
  } catch (error: any) {
    console.error('Error in my-teams API:', error)
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

