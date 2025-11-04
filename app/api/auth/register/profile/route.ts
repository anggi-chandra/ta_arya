import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/auth'

// POST /api/auth/register/profile
// Body: { userId: string, email?: string, full_name?: string }
export async function POST(req: NextRequest) {
  const supabase = getSupabaseClient()
  try {
    const { userId, email, full_name } = await req.json()
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    // Ensure profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single()

    if (!existingProfile) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({ id: userId, full_name, username: email?.split('@')[0] })

      if (profileError) {
        return NextResponse.json({ error: profileError.message }, { status: 400 })
      }
    }

    // Ensure default role exists
    const { data: existingRole } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_id', userId)
      .eq('role', 'user')
      .single()

    if (!existingRole) {
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: 'user', granted_by: null })

      if (roleError) {
        return NextResponse.json({ error: roleError.message }, { status: 400 })
      }
    }

    return NextResponse.json({ message: 'Profile initialized' })
  } catch (error) {
    console.error('Error initializing profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}