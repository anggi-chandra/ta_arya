import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/auth'
import { withAdminAuth } from '@/lib/auth'

// GET /api/admin/users/[id] - Get specific user
export const GET = withAdminAuth(async (req: NextRequest, user: any, { params }: { params: { id: string } }) => {
  const supabase = getSupabaseClient()
  const userId = params.id

  try {
    // Get user profile with roles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(`
        *,
        user_roles (
          id,
          role,
          granted_at,
          granted_by,
          granted_by_profile:profiles!user_roles_granted_by_fkey (
            full_name,
            username
          )
        )
      `)
      .eq('id', userId)
      .single()

    if (profileError) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get user auth info
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId)

    if (authError) {
      return NextResponse.json(
        { error: 'Failed to fetch user auth data' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      user: {
        ...profile,
        email: authUser.user.email,
        email_confirmed: authUser.user.email_confirmed_at !== null,
        last_sign_in: authUser.user.last_sign_in_at,
        created_at: authUser.user.created_at
      }
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})

// PUT /api/admin/users/[id] - Update user
export const PUT = withAdminAuth(async (req: NextRequest, user: any, { params }: { params: { id: string } }) => {
  const supabase = getSupabaseClient()
  const userId = params.id

  try {
    const body = await req.json()
    const { full_name, username, bio, email, roles } = body

    // Update profile
    if (full_name !== undefined || username !== undefined || bio !== undefined) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          ...(full_name !== undefined && { full_name }),
          ...(username !== undefined && { username }),
          ...(bio !== undefined && { bio })
        })
        .eq('id', userId)

      if (profileError) {
        return NextResponse.json(
          { error: `Failed to update profile: ${profileError.message}` },
          { status: 400 }
        )
      }
    }

    // Update email if provided
    if (email) {
      const { error: emailError } = await supabase.auth.admin.updateUserById(userId, {
        email
      })

      if (emailError) {
        return NextResponse.json(
          { error: `Failed to update email: ${emailError.message}` },
          { status: 400 }
        )
      }
    }

    // Update roles if provided
    if (roles && Array.isArray(roles)) {
      // Remove existing roles
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)

      // Add new roles
      if (roles.length > 0) {
        const roleInserts = roles.map(role => ({
          user_id: userId,
          role,
          granted_by: user.id
        }))

        const { error: rolesError } = await supabase
          .from('user_roles')
          .insert(roleInserts)

        if (rolesError) {
          return NextResponse.json(
            { error: `Failed to update roles: ${rolesError.message}` },
            { status: 400 }
          )
        }
      }
    }

    return NextResponse.json({
      message: 'User updated successfully'
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})

// DELETE /api/admin/users/[id] - Delete user
export const DELETE = withAdminAuth(async (req: NextRequest, user: any, { params }: { params: { id: string } }) => {
  const supabase = getSupabaseClient()
  const userId = params.id

  // Prevent self-deletion
  if (userId === user.id) {
    return NextResponse.json(
      { error: 'Cannot delete your own account' },
      { status: 400 }
    )
  }

  try {
    // Delete user from auth (this will cascade delete profile and roles due to foreign key constraints)
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId)

    if (deleteError) {
      return NextResponse.json(
        { error: `Failed to delete user: ${deleteError.message}` },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'User deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})