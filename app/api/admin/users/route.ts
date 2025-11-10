import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/auth'
import { withAdminAuth } from '@/lib/auth'

// GET /api/admin/users - Get all users with pagination
export const GET = withAdminAuth(async (req: NextRequest) => {
  const supabase = getSupabaseClient()
  const { searchParams } = new URL(req.url)
  
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const search = searchParams.get('search') || ''
  const role = searchParams.get('role') || ''
  
  const offset = (page - 1) * limit

  try {
    // Fetch profiles first (without relationship to avoid PostgREST issues)
    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    // Add search filter
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,username.ilike.%${search}%`)
    }

    const { data: profiles, error: profilesError, count } = await query

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError)
      console.error('Query details:', { page, limit, search, offset })
      return NextResponse.json(
        { error: `Failed to fetch users: ${profilesError.message}` },
        { status: 500 }
      )
    }

    console.log('Fetched profiles:', { count: profiles?.length || 0, total: count || 0, search })

    // Fetch roles separately for all users
    let usersWithRoles = profiles || []
    if (profiles && profiles.length > 0) {
      const userIds = profiles.map((p: any) => p.id)
      
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('id, role, granted_at, granted_by, user_id')
        .in('user_id', userIds)

      if (rolesError) {
        console.error('Error fetching roles:', rolesError)
        // Don't fail, just continue without roles
      }

      // Combine profiles with roles
      // If user has no roles, assign default 'user' role
      usersWithRoles = profiles.map((profile: any) => {
        const userRoles = rolesData?.filter((r: any) => r.user_id === profile.id).map((r: any) => ({
          id: r.id,
          role: r.role,
          granted_at: r.granted_at,
          granted_by: r.granted_by
        })) || []
        
        // If no roles found, add default 'user' role
        if (userRoles.length === 0) {
          userRoles.push({
            id: 'default',
            role: 'user',
            granted_at: profile.created_at || new Date().toISOString(),
            granted_by: null
          })
        }
        
        return {
          ...profile,
          user_roles: userRoles
        }
      })
    } else if (profiles && profiles.length === 0) {
      // No profiles found
      console.log('No profiles found in database')
      usersWithRoles = []
    } else {
      // Profiles exist but no roles data - assign default role
      usersWithRoles = (profiles || []).map((profile: any) => ({
        ...profile,
        user_roles: [{
          id: 'default',
          role: 'user',
          granted_at: profile.created_at || new Date().toISOString(),
          granted_by: null
        }]
      }))
    }

    // Filter by role if specified
    let filteredUsers = usersWithRoles
    if (role) {
      filteredUsers = usersWithRoles.filter((user: any) => 
        user.user_roles?.some((r: any) => r.role === role)
      )
    }

    return NextResponse.json({
      users: filteredUsers || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error: any) {
    console.error('Error fetching users:', error)
    console.error('Error stack:', error?.stack)
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
})

// POST /api/admin/users - Create new user (admin only)
export const POST = withAdminAuth(async (req: NextRequest, user: any) => {
  const supabase = getSupabaseClient()
  
  try {
    const body = await req.json()
    const { email, password, full_name, username, role = 'user' } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Create user in auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })

    if (authError) {
      return NextResponse.json(
        { error: `Failed to create user: ${authError.message}` },
        { status: 400 }
      )
    }

    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        full_name,
        username
      })

    if (profileError) {
      // Cleanup: delete auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(
        { error: `Failed to create profile: ${profileError.message}` },
        { status: 400 }
      )
    }

    // Assign role if not default
    if (role !== 'user') {
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role,
          granted_by: user.id
        })

      if (roleError) {
        console.error('Failed to assign role:', roleError)
      }
    }

    return NextResponse.json({
      message: 'User created successfully',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        full_name,
        username,
        role
      }
    })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})