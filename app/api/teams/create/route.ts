// This endpoint now creates a team request instead of creating a team directly
import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { getSupabaseClient } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const token = await getToken({ req: request })
  
  if (!token?.sub) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = token.sub
  const supabase = getSupabaseClient()

  try {
    const body = await request.json()
    const {
      name,
      game,
      logo_url,
      description,
      recruiting = false
    } = body

    if (!name || !game) {
      return NextResponse.json(
        { error: 'Team name and game are required' },
        { status: 400 }
      )
    }

    // Check if user already has a pending request with the same name
    const { data: existingRequest } = await supabase
      .from('team_requests')
      .select('id')
      .eq('user_id', userId)
      .eq('name', name)
      .eq('status', 'pending')
      .single()

    if (existingRequest) {
      return NextResponse.json(
        { error: 'Anda sudah memiliki permintaan yang sedang menunggu untuk tim dengan nama ini' },
        { status: 400 }
      )
    }

    // Check if team with same name already exists
    const { data: existingTeam } = await supabase
      .from('teams')
      .select('id')
      .eq('name', name)
      .single()

    if (existingTeam) {
      return NextResponse.json(
        { error: 'Tim dengan nama ini sudah ada' },
        { status: 400 }
      )
    }

    // Create team request
    const { data: teamRequest, error: requestError } = await supabase
      .from('team_requests')
      .insert({
        user_id: userId,
        name,
        game,
        logo_url,
        description,
        recruiting,
        status: 'pending'
      })
      .select()
      .single()

    if (requestError) {
      console.error('Error creating team request:', requestError)
      return NextResponse.json(
        { error: `Gagal mengajukan permintaan: ${requestError.message}` },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Permintaan pembuatan tim berhasil dikirim. Silakan tunggu persetujuan dari admin.',
      request: teamRequest
    })
  } catch (error: any) {
    console.error('Error in create team API:', error)
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

