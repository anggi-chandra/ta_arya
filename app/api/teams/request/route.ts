import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { getSupabaseClient } from '@/lib/auth'

// POST /api/teams/request - Create team request (user)
export async function POST(request: NextRequest) {
  const token = await getToken({ req: request })
  
  if (!token?.sub) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = token.sub
  const supabase = getSupabaseClient()

  try {
    const body = await request.json()
    const {
      name,
      game,
      logo_url,
      description,
      recruiting = false
    } = body

    if (!name || !game) {
      return NextResponse.json(
        { error: 'Team name and game are required' },
        { status: 400 }
      )
    }

    // Check if user already has a pending request with the same name
    const { data: existingRequest } = await supabase
      .from('team_requests')
      .select('id')
      .eq('user_id', userId)
      .eq('name', name)
      .eq('status', 'pending')
      .single()

    if (existingRequest) {
      return NextResponse.json(
        { error: 'You already have a pending request for a team with this name' },
        { status: 400 }
      )
    }

    // Check if team with same name already exists
    const { data: existingTeam } = await supabase
      .from('teams')
      .select('id')
      .eq('name', name)
      .single()

    if (existingTeam) {
      return NextResponse.json(
        { error: 'Team with this name already exists' },
        { status: 400 }
      )
    }

    // Create team request (without relationship query to avoid PostgREST issues)
    const { data: teamRequest, error: requestError } = await supabase
      .from('team_requests')
      .insert({
        user_id: userId,
        name,
        game,
        logo_url,
        description,
        recruiting,
        status: 'pending'
      })
      .select('*')
      .single()

    if (requestError) {
      console.error('Error creating team request:', requestError)
      return NextResponse.json(
        { error: `Failed to create team request: ${requestError.message}` },
        { status: 400 }
      )
    }

    // Fetch user profile separately if needed
    let userProfile = null
    if (teamRequest?.user_id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name, username')
        .eq('id', teamRequest.user_id)
        .single()
      userProfile = profile
    }

    return NextResponse.json({
      message: 'Team request submitted successfully. Please wait for admin approval.',
      request: {
        ...teamRequest,
        user: userProfile
      }
    })
  } catch (error: any) {
    console.error('Error in team request API:', error)
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/teams/request - Get user's team requests
export async function GET(request: NextRequest) {
  const token = await getToken({ req: request })
  
  if (!token?.sub) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = token.sub
  const supabase = getSupabaseClient()

  try {
    // Fetch requests without relationship query to avoid PostgREST issues
    const { data: requests, error: requestsError } = await supabase
      .from('team_requests')
      .select('*')
      .eq('user_id', userId)
      .order('requested_at', { ascending: false })

    if (requestsError) {
      console.error('Error fetching team requests:', requestsError)
      return NextResponse.json(
        { error: 'Failed to fetch team requests' },
        { status: 500 }
      )
    }

    // Fetch reviewer profiles separately if needed
    const reviewerIds = [...new Set(requests?.filter(r => r.reviewed_by).map(r => r.reviewed_by) || [])]
    let reviewerProfiles: Record<string, any> = {}

    if (reviewerIds.length > 0) {
      const { data: reviewers } = await supabase
        .from('profiles')
        .select('id, full_name, username')
        .in('id', reviewerIds)

      if (reviewers) {
        reviewers.forEach((reviewer: any) => {
          reviewerProfiles[reviewer.id] = reviewer
        })
      }
    }

    // Combine requests with reviewer profiles
    const requestsWithReviewer = requests?.map(request => ({
      ...request,
      reviewer: request.reviewed_by ? reviewerProfiles[request.reviewed_by] || null : null
    })) || []

    return NextResponse.json({
      requests: requestsWithReviewer
    })
  } catch (error: any) {
    console.error('Error in team request API:', error)
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

