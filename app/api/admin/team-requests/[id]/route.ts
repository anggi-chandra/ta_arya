import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/auth'
import { withModeratorAuth } from '@/lib/auth'

// PUT /api/admin/team-requests/[id] - Approve or reject team request
export const PUT = withModeratorAuth(async (req: NextRequest, user: any, { params }: { params: { id: string } }) => {
  const supabase = getSupabaseClient()
  const requestId = params.id

  try {
    const body = await req.json()
    const { status, rejection_reason } = body

    if (!status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Status must be either "approved" or "rejected"' },
        { status: 400 }
      )
    }

    // Get the request first
    const { data: request, error: requestError } = await supabase
      .from('team_requests')
      .select('*')
      .eq('id', requestId)
      .single()

    if (requestError || !request) {
      return NextResponse.json(
        { error: 'Team request not found' },
        { status: 404 }
      )
    }

    // Update request status
    const updateData: any = {
      status,
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id
    }

    if (status === 'rejected' && rejection_reason) {
      updateData.rejection_reason = rejection_reason
    }

    const { data: updatedRequest, error: updateError } = await supabase
      .from('team_requests')
      .update(updateData)
      .eq('id', requestId)
      .select('*')
      .single()

    if (updateError) {
      console.error('Error updating team request:', updateError)
      return NextResponse.json(
        { error: `Failed to update request: ${updateError.message}` },
        { status: 400 }
      )
    }

    // Fetch user profile separately
    let userProfile = null
    if (updatedRequest?.user_id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url')
        .eq('id', updatedRequest.user_id)
        .single()
      userProfile = profile
    }

    const requestWithProfile = {
      ...updatedRequest,
      user: userProfile
    }

    // If approved, create the team
    if (status === 'approved') {
      // Check if team with same name already exists
      const { data: existingTeam } = await supabase
        .from('teams')
        .select('id')
        .eq('name', request.name)
        .single()

      if (existingTeam) {
        return NextResponse.json(
          { error: 'Team with this name already exists' },
          { status: 400 }
        )
      }

      // Create team
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .insert({
          owner_id: request.user_id,
          name: request.name,
          game: request.game,
          logo_url: request.logo_url,
          description: request.description,
          recruiting: request.recruiting
        })
        .select()
        .single()

      if (teamError) {
        console.error('Error creating team:', teamError)
        // Rollback request status
        await supabase
          .from('team_requests')
          .update({ status: 'pending', reviewed_at: null, reviewed_by: null })
          .eq('id', requestId)
        
        return NextResponse.json(
          { error: `Failed to create team: ${teamError.message}` },
          { status: 400 }
        )
      }

      // Add owner as team member
      const { error: memberError } = await supabase
        .from('team_members')
        .insert({
          team_id: team.id,
          user_id: request.user_id,
          role: 'owner'
        })

      if (memberError) {
        console.error('Error adding owner as team member:', memberError)
        // This is not critical, team is created but member might not be added
      }

      return NextResponse.json({
        message: 'Team request approved and team created successfully',
        request: requestWithProfile,
        team
      })
    }

    return NextResponse.json({
      message: 'Team request rejected',
      request: requestWithProfile
    })
  } catch (error: any) {
    console.error('Error in team request API:', error)
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
})

