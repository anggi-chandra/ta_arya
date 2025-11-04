import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/auth'
import { withModeratorAuth } from '@/lib/auth'

// PUT /api/admin/teams/[id]/members/[memberId] - Update team member role
export const PUT = withModeratorAuth(async (req: NextRequest, user: any, { params }: { params: { id: string, memberId: string } }) => {
  const supabase = getSupabaseClient()
  
  try {
    const body = await req.json()
    const { role } = body

    if (!role) {
      return NextResponse.json(
        { error: 'Role is required' },
        { status: 400 }
      )
    }

    // Validate role
    const validRoles = ['owner', 'captain', 'member', 'substitute']
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be one of: owner, captain, member, substitute' },
        { status: 400 }
      )
    }

    // Check if team member exists
    const { data: member, error: memberError } = await supabase
      .from('team_members')
      .select(`
        id,
        role,
        team_id,
        user_id,
        user:profiles (
          id,
          full_name,
          username
        )
      `)
      .eq('id', params.memberId)
      .eq('team_id', params.id)
      .single()

    if (memberError) {
      return NextResponse.json(
        { error: 'Team member not found' },
        { status: 404 }
      )
    }

    // If promoting to owner, demote current owner
    if (role === 'owner') {
      await supabase
        .from('team_members')
        .update({ role: 'captain' })
        .eq('team_id', params.id)
        .eq('role', 'owner')

      // Update team owner
      await supabase
        .from('teams')
        .update({ owner_id: member.user_id })
        .eq('id', params.id)
    }

    const { data, error } = await supabase
      .from('team_members')
      .update({ role })
      .eq('id', params.memberId)
      .select(`
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
      `)
      .single()

    if (error) {
      return NextResponse.json(
        { error: `Failed to update member role: ${error.message}` },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: `Member role updated to ${role} successfully`,
      member: data
    })
  } catch (error) {
    console.error('Error updating team member:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})

// DELETE /api/admin/teams/[id]/members/[memberId] - Remove team member
export const DELETE = withModeratorAuth(async (req: NextRequest, user: any, { params }: { params: { id: string, memberId: string } }) => {
  const supabase = getSupabaseClient()
  
  try {
    // Check if team member exists
    const { data: member, error: memberError } = await supabase
      .from('team_members')
      .select(`
        id,
        role,
        user:profiles (
          id,
          full_name,
          username
        )
      `)
      .eq('id', params.memberId)
      .eq('team_id', params.id)
      .single()

    if (memberError) {
      return NextResponse.json(
        { error: 'Team member not found' },
        { status: 404 }
      )
    }

    // Prevent removing the owner (must transfer ownership first)
    if (member.role === 'owner') {
      return NextResponse.json(
        { error: 'Cannot remove team owner. Transfer ownership first.' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', params.memberId)

    if (error) {
      return NextResponse.json(
        { error: `Failed to remove member: ${error.message}` },
        { status: 400 }
      )
    }

    const userProfile = Array.isArray((member as any).user) ? (member as any).user[0] : (member as any).user
    const displayName = (userProfile?.full_name ?? userProfile?.username ?? 'Member')

    return NextResponse.json({
      message: `${displayName} removed from team successfully`
    })
  } catch (error) {
    console.error('Error removing team member:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})