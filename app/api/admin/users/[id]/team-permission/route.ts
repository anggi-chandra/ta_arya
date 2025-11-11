import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/auth'
import { withAdminAuth } from '@/lib/auth'

// PUT /api/admin/users/[id]/team-permission - Update user's team creation permission
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAdminAuth(async (req: NextRequest, adminUser: any) => {
    const supabase = getSupabaseClient()
    const userId = params.id

    try {
      const body = await req.json()
      const { can_create_team } = body

      if (typeof can_create_team !== 'boolean') {
        return NextResponse.json(
          { error: 'can_create_team must be a boolean' },
          { status: 400 }
        )
      }

      // Update user's team creation permission
      const { data, error } = await supabase
        .from('profiles')
        .update({ can_create_team })
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        console.error('Error updating team permission:', error)
        return NextResponse.json(
          { error: `Failed to update permission: ${error.message}` },
          { status: 400 }
        )
      }

      return NextResponse.json({
        message: `Team creation permission ${can_create_team ? 'enabled' : 'disabled'} successfully`,
        user: data
      })
    } catch (error: any) {
      console.error('Error in team permission API:', error)
      return NextResponse.json(
        { error: error?.message || 'Internal server error' },
        { status: 500 }
      )
    }
  })(request)
}

