import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/auth'
import { withModeratorAuth } from '@/lib/auth'

// GET /api/admin/tournaments/[id] - Get specific tournament
export const GET = withModeratorAuth(async (req: NextRequest, user: any, { params }: { params: { id: string } }) => {
  const authHeader = req.headers.get('authorization')
  const supabase = getSupabaseClient(authHeader?.replace('Bearer ', ''))
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
  const authHeader = req.headers.get('authorization')
  const supabase = getSupabaseClient(authHeader?.replace('Bearer ', ''))
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

    // Validate dates if provided
    if (starts_at && ends_at) {
      const startDate = new Date(starts_at)
      const endDate = new Date(ends_at)

      if (endDate <= startDate) {
        return NextResponse.json(
          { error: 'End date must be after start date' },
          { status: 400 }
        )
      }
    }

    if (starts_at && registration_deadline) {
      const startDate = new Date(starts_at)
      const regDeadline = new Date(registration_deadline)

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
    if (description !== undefined) updateData.description = description
    if (game !== undefined) updateData.game = game
    if (validTournamentType !== undefined) updateData.tournament_type = validTournamentType
    if (validFormat !== undefined) updateData.format = validFormat
    if (max_participants !== undefined) updateData.max_participants = parseInt(max_participants)
    if (prize_pool !== undefined) updateData.prize_pool = parseInt(prize_pool) || 0
    if (currency !== undefined) updateData.currency = currency
    if (entry_fee !== undefined) updateData.entry_fee = parseInt(entry_fee) || 0
    if (location !== undefined) updateData.location = location
    if (starts_at !== undefined) updateData.starts_at = starts_at
    if (ends_at !== undefined) updateData.ends_at = ends_at
    if (registration_deadline !== undefined) updateData.registration_deadline = registration_deadline
    if (tournamentStatus !== undefined) updateData.status = tournamentStatus
    if (rules !== undefined) updateData.rules = rules
    if (banner_url !== undefined) updateData.banner_url = banner_url
    updateData.updated_at = new Date().toISOString()

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
  const authHeader = req.headers.get('authorization')
  const supabase = getSupabaseClient(authHeader?.replace('Bearer ', ''))
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

