import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/auth'
import { withModeratorAuth } from '@/lib/auth'

// GET /api/admin/tournaments/[id] - Get specific tournament
export const GET = withModeratorAuth(async (req: NextRequest, user: any, { params }: { params: { id: string } }) => {
  const supabase = getSupabaseClient()
  const tournamentId = params.id

  try {
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .select('*')
      .eq('id', tournamentId)
      .single()

    if (tournamentError) {
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ tournament })
  } catch (error) {
    console.error('Error fetching tournament:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})

// PUT /api/admin/tournaments/[id] - Update tournament
export const PUT = withModeratorAuth(async (req: NextRequest, user: any, { params }: { params: { id: string } }) => {
  const supabase = getSupabaseClient()
  const tournamentId = params.id

  try {
    const body = await req.json()
    const {
      title,
      description,
      game,
      tournament_type,
      format,
      max_participants,
      prize_pool,
      currency,
      entry_fee,
      location,
      starts_at,
      ends_at,
      registration_deadline,
      status,
      rules,
      banner_url
    } = body

    // Convert datetime-local strings to ISO strings if provided
    let startsAtISO = starts_at
    let endsAtISO = ends_at
    let registrationDeadlineISO = registration_deadline

    if (starts_at) {
      // If it's in datetime-local format (YYYY-MM-DDTHH:mm), convert to ISO
      if (starts_at.length === 16) {
        startsAtISO = new Date(starts_at).toISOString()
      }
    }

    if (ends_at) {
      if (ends_at.length === 16) {
        endsAtISO = new Date(ends_at).toISOString()
      }
    }

    if (registration_deadline) {
      if (registration_deadline.length === 16) {
        registrationDeadlineISO = new Date(registration_deadline).toISOString()
      }
    }

    // Validate dates if provided
    if (startsAtISO && endsAtISO) {
      const startDate = new Date(startsAtISO)
      const endDate = new Date(endsAtISO)

      if (endDate <= startDate) {
        return NextResponse.json(
          { error: 'End date must be after start date' },
          { status: 400 }
        )
      }
    }

    if (startsAtISO && registrationDeadlineISO) {
      const startDate = new Date(startsAtISO)
      const regDeadline = new Date(registrationDeadlineISO)

      if (regDeadline >= startDate) {
        return NextResponse.json(
          { error: 'Registration deadline must be before start date' },
          { status: 400 }
        )
      }
    }

    // Validate status if provided
    const validStatuses = ['upcoming', 'ongoing', 'completed', 'cancelled']
    const tournamentStatus = status && validStatuses.includes(status) ? status : undefined

    // Validate tournament_type if provided
    const validTournamentTypes = ['single_elimination', 'double_elimination', 'round_robin', 'swiss']
    const validTournamentType = tournament_type && validTournamentTypes.includes(tournament_type) ? tournament_type : undefined

    // Validate format if provided
    const validFormats = ['1v1', '2v2', '3v3', '4v4', '5v5', 'custom']
    const validFormat = format && validFormats.includes(format) ? format : undefined

    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description || null
    if (game !== undefined) updateData.game = game
    if (validTournamentType !== undefined) updateData.tournament_type = validTournamentType
    if (validFormat !== undefined) updateData.format = validFormat
    if (max_participants !== undefined && max_participants !== null) {
      updateData.max_participants = parseInt(String(max_participants))
    }
    // Always update prize_pool if provided (even if 0)
    if (prize_pool !== undefined && prize_pool !== null) {
      const prizePoolNum = parseInt(String(prize_pool))
      updateData.prize_pool = isNaN(prizePoolNum) ? 0 : prizePoolNum
    }
    if (currency !== undefined) updateData.currency = currency || 'IDR'
    // Always update entry_fee if provided (even if 0)
    if (entry_fee !== undefined && entry_fee !== null) {
      const entryFeeNum = parseInt(String(entry_fee))
      updateData.entry_fee = isNaN(entryFeeNum) ? 0 : entryFeeNum
    }
    if (location !== undefined) updateData.location = location || null
    if (startsAtISO !== undefined) updateData.starts_at = startsAtISO
    if (endsAtISO !== undefined) updateData.ends_at = endsAtISO || null
    if (registrationDeadlineISO !== undefined) updateData.registration_deadline = registrationDeadlineISO
    if (tournamentStatus !== undefined) updateData.status = tournamentStatus
    if (rules !== undefined) updateData.rules = rules || null
    if (banner_url !== undefined) updateData.banner_url = banner_url || null
    updateData.updated_at = new Date().toISOString()
    
    console.log('Update data for tournament:', updateData)
    console.log('Prize pool value:', prize_pool, '->', updateData.prize_pool)

    console.log('Updating tournament:', tournamentId, 'with data:', updateData)

    const { data, error } = await supabase
      .from('tournaments')
      .update(updateData)
      .eq('id', tournamentId)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: `Failed to update tournament: ${error.message}` },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Tournament updated successfully',
      tournament: data
    })
  } catch (error) {
    console.error('Error updating tournament:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})

// DELETE /api/admin/tournaments/[id] - Delete tournament
export const DELETE = withModeratorAuth(async (req: NextRequest, user: any, { params }: { params: { id: string } }) => {
  const supabase = getSupabaseClient()
  const tournamentId = params.id

  try {
    // Check if tournament exists
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .select('id')
      .eq('id', tournamentId)
      .single()

    if (tournamentError || !tournament) {
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 }
      )
    }

    // Delete tournament - registrations will be automatically deleted via CASCADE if exists
    const { error } = await supabase
      .from('tournaments')
      .delete()
      .eq('id', tournamentId)

    if (error) {
      console.error('Error deleting tournament:', error)
      return NextResponse.json(
        { error: `Failed to delete tournament: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Tournament deleted successfully',
      tournamentId: tournamentId
    })
  } catch (error) {
    console.error('Error deleting tournament:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})

