import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/auth'
import { withAdminAuth } from '@/lib/auth'

// POST /api/admin/users/[id]/roles - Add role to user
export const POST = withAdminAuth(async (req: NextRequest, user: any, { params }: { params: { id: string } }) => {
  const supabase = getSupabaseClient()
  const userId = params.id

  try {
    const body = await req.json()
    const { role } = body

    if (!role || !['admin', 'moderator', 'vip', 'user'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be one of: admin, moderator, vip, user' },
        { status: 400 }
      )
    }

    // Check if user already has this role
    const { data: existingRole } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_id', userId)
      .eq('role', role)
      .single()

    if (existingRole) {
      return NextResponse.json(
        { error: 'User already has this role' },
        { status: 400 }
      )
    }

    // Add role
    const { data, error } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role,
        granted_by: user.id
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: `Failed to add role: ${error.message}` },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Role added successfully',
      role: data
    })
  } catch (error) {
    console.error('Error adding role:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})

// DELETE /api/admin/users/[id]/roles - Remove role from user
export const DELETE = withAdminAuth(async (req: NextRequest, user: any, { params }: { params: { id: string } }) => {
  const supabase = getSupabaseClient()
  const userId = params.id
  const { searchParams } = new URL(req.url)
  const role = searchParams.get('role')

  if (!role) {
    return NextResponse.json(
      { error: 'Role parameter is required' },
      { status: 400 }
    )
  }

  // Prevent removing admin role from self
  if (userId === user.id && role === 'admin') {
    return NextResponse.json(
      { error: 'Cannot remove admin role from your own account' },
      { status: 400 }
    )
  }

  try {
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role', role)

    if (error) {
      return NextResponse.json(
        { error: `Failed to remove role: ${error.message}` },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Role removed successfully'
    })
  } catch (error) {
    console.error('Error removing role:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})