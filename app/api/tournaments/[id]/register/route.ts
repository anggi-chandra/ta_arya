import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { getSupabaseClient } from '@/lib/auth'

// GET /api/tournaments/[id]/register/status - Check if user's team is registered for tournament
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = await getToken({ req: request })
  
  if (!token?.sub) {
    return NextResponse.json({ isRegistered: false }, { status: 200 })
  }

  const userId = token.sub
  const tournamentId = params.id
  const supabase = getSupabaseClient()

  try {
    // Get user's teams (teams where user is owner or member)
    const { data: userTeams, error: teamsError } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', userId)

    if (teamsError) {
      console.error('Error fetching user teams:', teamsError)
      return NextResponse.json({ isRegistered: false }, { status: 200 })
    }

    if (!userTeams || userTeams.length === 0) {
      return NextResponse.json({ isRegistered: false }, { status: 200 })
    }

    const teamIds = userTeams.map((ut: any) => ut.team_id)

    // Check if any of user's teams is registered for this tournament
    const { data: registration, error: regError } = await supabase
      .from('tournament_participants')
      .select('tournament_id, team_id')
      .eq('tournament_id', tournamentId)
      .in('team_id', teamIds)
      .maybeSingle()

    if (regError) {
      console.error('Error checking registration:', regError)
      return NextResponse.json({ isRegistered: false }, { status: 200 })
    }

    return NextResponse.json({ 
      isRegistered: !!registration,
      teamId: registration?.team_id || null
    })
  } catch (error: any) {
    console.error('Error in tournament registration status check:', error)
    return NextResponse.json({ isRegistered: false }, { status: 200 })
  }
}

// POST /api/tournaments/[id]/register - Register team for tournament
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = await getToken({ req: request })
  
  if (!token?.sub) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = token.sub
  const tournamentId = params.id
  const supabase = getSupabaseClient()

  try {
    const body = await request.json().catch(() => ({}))
    const { team_id } = body

    // If team_id is provided, use it; otherwise, get user's first team
    let teamId = team_id

    if (!teamId) {
      // Get user's teams
      const { data: userTeams, error: teamsError } = await supabase
        .from('team_members')
        .select('team_id, role')
        .eq('user_id', userId)

      if (teamsError || !userTeams || userTeams.length === 0) {
        return NextResponse.json(
          { error: 'Anda belum memiliki tim. Silakan buat tim terlebih dahulu.' },
          { status: 400 }
        )
      }

      // Get team where user is owner or captain
      const ownerTeam = userTeams.find((ut: any) => ut.role === 'owner' || ut.role === 'captain')
      teamId = ownerTeam?.team_id || userTeams[0]?.team_id

      if (!teamId) {
        return NextResponse.json(
          { error: 'Tim tidak ditemukan. Silakan buat tim terlebih dahulu.' },
          { status: 400 }
        )
      }
    }

    // Verify user is owner or captain of the team
    const { data: teamMember, error: memberError } = await supabase
      .from('team_members')
      .select('team_id, role')
      .eq('team_id', teamId)
      .eq('user_id', userId)
      .single()

    if (memberError || !teamMember) {
      return NextResponse.json(
        { error: 'Anda bukan anggota tim ini atau tim tidak ditemukan' },
        { status: 403 }
      )
    }

    // Only owner or captain can register team
    if (teamMember.role !== 'owner' && teamMember.role !== 'captain') {
      return NextResponse.json(
        { error: 'Hanya pemilik atau kapten tim yang dapat mendaftarkan tim' },
        { status: 403 }
      )
    }

    // Check if tournament exists
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .select('id, max_participants, registration_deadline, starts_at, format')
      .eq('id', tournamentId)
      .single()

    if (tournamentError || !tournament) {
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 }
      )
    }

    // Check if tournament has started (pendaftaran ditutup setelah turnamen dimulai)
    // Registration deadline hanya sebagai informasi, bukan batas mutlak untuk menutup pendaftaran
    // Pendaftaran hanya ditutup ketika turnamen sudah dimulai
    if (tournament.starts_at) {
      const startsAt = new Date(tournament.starts_at)
      if (new Date() >= startsAt) {
        return NextResponse.json(
          { error: 'Pendaftaran sudah ditutup karena turnamen sudah dimulai' },
          { status: 400 }
        )
      }
    }
    
    // Note: Registration deadline tidak digunakan untuk menutup pendaftaran
    // Deadline hanya sebagai informasi untuk user
    // Pendaftaran tetap terbuka sampai turnamen dimulai

    // Check if team is already registered
    const { data: existingRegistration } = await supabase
      .from('tournament_participants')
      .select('tournament_id, team_id')
      .eq('tournament_id', tournamentId)
      .eq('team_id', teamId)
      .single()

    if (existingRegistration) {
      return NextResponse.json(
        { error: 'Tim sudah terdaftar untuk tournament ini' },
        { status: 400 }
      )
    }

    // Check if tournament is full
    if (tournament.max_participants) {
      const { count, error: countError } = await supabase
        .from('tournament_participants')
        .select('*', { count: 'exact', head: true })
        .eq('tournament_id', tournamentId)

      if (!countError && count !== null && count >= tournament.max_participants) {
        return NextResponse.json(
          { error: 'Tournament sudah penuh' },
          { status: 400 }
        )
      }
    }

    // Validate team size matches tournament format
    if (tournament.format) {
      const { data: teamMembers, error: membersError } = await supabase
        .from('team_members')
        .select('user_id')
        .eq('team_id', teamId)

      if (!membersError && teamMembers) {
        const teamSize = teamMembers.length
        const formatMap: Record<string, number> = {
          '1v1': 1,
          '2v2': 2,
          '3v3': 3,
          '4v4': 4,
          '5v5': 5,
          'custom': 0 // No validation for custom
        }

        const requiredSize = formatMap[tournament.format]
        if (requiredSize > 0 && teamSize !== requiredSize) {
          return NextResponse.json(
            { error: `Tim harus memiliki ${requiredSize} anggota untuk format ${tournament.format}` },
            { status: 400 }
          )
        }
      }
    }

    // Check if entry fee needs to be paid (future implementation)
    // For now, just register the team

    // Register team
    const { data: registration, error: registerError } = await supabase
      .from('tournament_participants')
      .insert({
        tournament_id: tournamentId,
        team_id: teamId,
        status: 'registered'
      })
      .select()
      .single()

    if (registerError) {
      console.error('Error registering team:', registerError)
      return NextResponse.json(
        { error: `Failed to register: ${registerError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      registration,
      message: 'Tim berhasil mendaftar untuk tournament'
    })
  } catch (error: any) {
    console.error('Error in tournament registration API:', error)
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/tournaments/[id]/register - Unregister team from tournament
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = await getToken({ req: request })
  
  if (!token?.sub) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = token.sub
  const tournamentId = params.id
  const supabase = getSupabaseClient()

  try {
    const body = await request.json().catch(() => ({}))
    const { team_id } = body

    // Get user's teams
    const { data: userTeams, error: teamsError } = await supabase
      .from('team_members')
      .select('team_id, role')
      .eq('user_id', userId)

    if (teamsError || !userTeams || userTeams.length === 0) {
      return NextResponse.json(
        { error: 'Anda tidak memiliki tim terdaftar' },
        { status: 400 }
      )
    }

    // If team_id is provided, verify user is owner/captain of that team
    // Otherwise, find the team that is registered for this tournament
    let teamId = team_id

    if (!teamId) {
      const teamIds = userTeams.map((ut: any) => ut.team_id)
      
      // Find which team is registered for this tournament
      const { data: registration, error: regError } = await supabase
        .from('tournament_participants')
        .select('team_id')
        .eq('tournament_id', tournamentId)
        .in('team_id', teamIds)
        .maybeSingle()

      if (regError || !registration) {
        return NextResponse.json(
          { error: 'Tim tidak terdaftar untuk tournament ini' },
          { status: 404 }
        )
      }

      teamId = registration.team_id
    }

    // Verify user is owner or captain of the team
    const teamMember = userTeams.find((ut: any) => ut.team_id === teamId)
    if (!teamMember) {
      return NextResponse.json(
        { error: 'Anda bukan anggota tim ini' },
        { status: 403 }
      )
    }

    // Only owner or captain can unregister team
    if (teamMember.role !== 'owner' && teamMember.role !== 'captain') {
      return NextResponse.json(
        { error: 'Hanya pemilik atau kapten tim yang dapat membatalkan pendaftaran' },
        { status: 403 }
      )
    }

    // Check if tournament has started (might not allow unregistration after start)
    const { data: tournament } = await supabase
      .from('tournaments')
      .select('starts_at')
      .eq('id', tournamentId)
      .single()

    if (tournament?.starts_at) {
      const startsAt = new Date(tournament.starts_at)
      if (new Date() >= startsAt) {
        return NextResponse.json(
          { error: 'Tidak dapat membatalkan pendaftaran setelah tournament dimulai' },
          { status: 400 }
        )
      }
    }

    // Remove registration
    const { error: deleteError } = await supabase
      .from('tournament_participants')
      .delete()
      .eq('tournament_id', tournamentId)
      .eq('team_id', teamId)

    if (deleteError) {
      console.error('Error unregistering team:', deleteError)
      return NextResponse.json(
        { error: `Failed to unregister: ${deleteError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      message: 'Pendaftaran berhasil dibatalkan'
    })
  } catch (error: any) {
    console.error('Error in tournament unregistration API:', error)
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

