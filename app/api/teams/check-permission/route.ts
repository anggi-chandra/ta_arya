import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { getSupabaseClient } from '@/lib/auth'

// GET /api/teams/check-permission - Check if current user can create teams
export async function GET(request: NextRequest) {
  const token = await getToken({ req: request })
  
  if (!token?.sub) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = token.sub
  const supabase = getSupabaseClient()

  try {
    // Check if user is admin or moderator (they can always create teams)
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)

    if (!rolesError && userRoles) {
      const isAdminOrModerator = userRoles.some((r: any) => 
        r.role === 'admin' || r.role === 'moderator'
      )
      
      if (isAdminOrModerator) {
        return NextResponse.json({ 
          can_create_team: true,
          reason: 'admin_or_moderator'
        })
      }
    }

    // Check user's team creation permission
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('can_create_team')
      .eq('id', userId)
      .single()

    if (profileError) {
      console.error('Error fetching profile:', profileError)
      return NextResponse.json(
        { error: 'Failed to check permission' },
        { status: 500 }
      )
    }

    // Default to true if can_create_team is null (for backward compatibility)
    const canCreateTeam = profile?.can_create_team !== false

    return NextResponse.json({ 
      can_create_team: canCreateTeam,
      reason: canCreateTeam ? 'allowed' : 'disabled_by_admin'
    })
  } catch (error: any) {
    console.error('Error in check-permission API:', error)
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

