import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/auth'

// GET /api/teams/[id] - Get single team details (public)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = getSupabaseClient()
  const teamId = params.id

  try {
    // Fetch team data
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('*')
      .eq('id', teamId)
      .single()

    if (teamError || !team) {
      console.error('Error fetching team:', teamError)
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      )
    }

    // Fetch owner profile separately
    let owner = null
    if (team.owner_id) {
      const { data: ownerProfile } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url, bio')
        .eq('id', team.owner_id)
        .single()
      owner = ownerProfile
    }

    // Fetch team members separately
    const { data: teamMembers, error: membersError } = await supabase
      .from('team_members')
      .select('user_id, role, joined_at')
      .eq('team_id', teamId)
      .order('joined_at', { ascending: true })

    if (membersError) {
      console.error('Error fetching team members:', membersError)
    }

    // Fetch member profiles separately
    const memberUserIds = teamMembers?.map(m => m.user_id).filter(Boolean) || []
    let memberProfiles: Record<string, any> = {}

    if (memberUserIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url, bio')
        .in('id', memberUserIds)

      if (profiles) {
        profiles.forEach((profile: any) => {
          memberProfiles[profile.id] = profile
        })
      }
    }

    // Combine members with profiles
    const membersWithProfiles = teamMembers?.map(member => {
      const profile = member.user_id ? memberProfiles[member.user_id] : null
      return {
        ...member,
        user: profile
      }
    }) || []

    // Fetch team achievements separately
    let achievements: any[] = []
    try {
      const { data: teamAchievements, error: achievementsError } = await supabase
        .from('team_achievements')
        .select('*')
        .eq('team_id', teamId)
        .order('achievement_date', { ascending: false })

      if (!achievementsError && teamAchievements) {
        achievements = teamAchievements
      }
    } catch (err) {
      // Table might not exist, that's okay
      console.log('Could not fetch achievements:', err)
    }

    // Calculate stats
    const memberCount = membersWithProfiles.length
    const achievementCount = achievements.length

    return NextResponse.json({
      team: {
        ...team,
        owner,
        members: membersWithProfiles,
        achievements,
        memberCount,
        achievementCount,
        logo: team.logo_url || '/images/teams/team-default.svg',
        isRecruiting: team.recruiting || false
      }
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
      }
    })
  } catch (error: any) {
    console.error('Error in team detail API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message },
      { status: 500 }
    )
  }
}