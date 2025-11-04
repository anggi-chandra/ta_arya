import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/auth'
import { withModeratorAuth } from '@/lib/auth'

// GET /api/admin/teams/[id] - Get specific team details
export const GET = withModeratorAuth(async (req: NextRequest, user: any, { params }: { params: { id: string } }) => {
  const supabase = getSupabaseClient()
  
  try {
    const { data: team, error } = await supabase
      .from('teams')
      .select(`
        *,
        owner:profiles!teams_owner_id_fkey (
          id,
          full_name,
          username,
          avatar_url,
          email
        ),
        team_members (
          id,
          role,
          joined_at,
          user:profiles (
            id,
            full_name,
            username,
            avatar_url,
            email
          )
        ),
        team_achievements (
          id,
          title,
          description,
          achievement_date,
          rank_position,
          tournament_name
        )
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ team })
  } catch (error) {
    console.error('Error fetching team:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})

// PUT /api/admin/teams/[id] - Update team
export const PUT = withModeratorAuth(async (req: NextRequest, user: any, { params }: { params: { id: string } }) => {
  const supabase = getSupabaseClient()
  
  try {
    const body = await req.json()
    const {
      name,
      game,
      logo_url,
      description,
      recruiting,
      owner_id
    } = body

    // Check if team exists
    const { data: existingTeam, error: teamError } = await supabase
      .from('teams')
      .select('id, owner_id')
      .eq('id', params.id)
      .single()

    if (teamError) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      )
    }

    // If changing owner, validate new owner exists
    if (owner_id && owner_id !== existingTeam.owner_id) {
      const { data: newOwner, error: ownerError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', owner_id)
        .single()

      if (ownerError) {
        return NextResponse.json(
          { error: 'New owner not found' },
          { status: 400 }
        )
      }

      // Update team member roles
      await supabase
        .from('team_members')
        .update({ role: 'member' })
        .eq('team_id', params.id)
        .eq('user_id', existingTeam.owner_id)

      // Add new owner as team member if not already a member
      const { data: existingMember } = await supabase
        .from('team_members')
        .select('id')
        .eq('team_id', params.id)
        .eq('user_id', owner_id)
        .single()

      if (!existingMember) {
        await supabase
          .from('team_members')
          .insert({
            team_id: params.id,
            user_id: owner_id,
            role: 'owner'
          })
      } else {
        await supabase
          .from('team_members')
          .update({ role: 'owner' })
          .eq('team_id', params.id)
          .eq('user_id', owner_id)
      }
    }

    const { data, error } = await supabase
      .from('teams')
      .update({
        name,
        game,
        logo_url,
        description,
        recruiting,
        owner_id,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: `Failed to update team: ${error.message}` },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Team updated successfully',
      team: data
    })
  } catch (error) {
    console.error('Error updating team:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})

// DELETE /api/admin/teams/[id] - Delete team
export const DELETE = withModeratorAuth(async (req: NextRequest, user: any, { params }: { params: { id: string } }) => {
  const supabase = getSupabaseClient()
  
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

    // Delete team (cascade will handle team_members and team_achievements)
    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', params.id)

    if (error) {
      return NextResponse.json(
        { error: `Failed to delete team: ${error.message}` },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: `Team "${team.name}" deleted successfully`
    })
  } catch (error) {
    console.error('Error deleting team:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})