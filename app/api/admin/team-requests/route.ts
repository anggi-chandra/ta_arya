import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/auth'
import { withModeratorAuth } from '@/lib/auth'

// GET /api/admin/team-requests - Get all team requests with pagination and filters
export const GET = withModeratorAuth(async (req: NextRequest) => {
  const supabase = getSupabaseClient()
  const { searchParams } = new URL(req.url)
  
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const search = searchParams.get('search') || ''
  const status = searchParams.get('status') || ''
  
  const offset = (page - 1) * limit

  try {
    // Build query for team requests (without relationship to avoid PostgREST issues)
    let query = supabase
      .from('team_requests')
      .select('*')
      .range(offset, offset + limit - 1)
      .order('requested_at', { ascending: false })

    // Add search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,game.ilike.%${search}%`)
    }

    // Add status filter
    if (status) {
      query = query.eq('status', status)
    }

    const { data: requests, error: requestsError } = await query

    if (requestsError) {
      console.error('Error fetching team requests:', requestsError)
      return NextResponse.json(
        { error: 'Failed to fetch team requests' },
        { status: 500 }
      )
    }

    // Fetch user profiles separately
    const userIds = [...new Set(requests?.map(r => r.user_id).filter(Boolean) || [])]
    let userProfiles: Record<string, any> = {}

    if (userIds.length > 0) {
      const { data: users } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url')
        .in('id', userIds)

      if (users) {
        users.forEach((user: any) => {
          userProfiles[user.id] = user
        })
      }
    }

    // Fetch reviewer profiles separately
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

    // Combine requests with user and reviewer profiles
    const requestsWithProfiles = requests?.map(request => ({
      ...request,
      user: request.user_id ? userProfiles[request.user_id] || null : null,
      reviewer: request.reviewed_by ? reviewerProfiles[request.reviewed_by] || null : null
    })) || []

    // Get total count for pagination
    let countQuery = supabase
      .from('team_requests')
      .select('id', { count: 'exact', head: true })

    if (search) {
      countQuery = countQuery.or(`name.ilike.%${search}%,description.ilike.%${search}%,game.ilike.%${search}%`)
    }
    if (status) {
      countQuery = countQuery.eq('status', status)
    }

    const { count, error: countError } = await countQuery

    if (countError) {
      console.error('Error counting team requests:', countError)
    }

    return NextResponse.json({
      requests: requestsWithProfiles,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching team requests:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})

