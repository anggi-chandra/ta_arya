import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/auth'
import { withModeratorAuth } from '@/lib/auth'

// GET /api/admin/events/[id] - Get specific event with registrations
export const GET = withModeratorAuth(async (req: NextRequest, user: any, { params }: { params: { id: string } }) => {
  const supabase = getSupabaseClient()
  const eventId = params.id

  try {
    // Get event
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single()

    if (eventError) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Get registrations
    const { data: registrations, error: registrationsError } = await supabase
      .from('event_registrations')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false })

    if (registrationsError) {
      console.error('Error fetching registrations:', registrationsError)
    }

    // Get tickets count
    const { count: ticketsCount, error: ticketsError } = await supabase
      .from('event_tickets')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId)
      .neq('status', 'cancelled')

    if (ticketsError) {
      console.error('Error fetching tickets count:', ticketsError)
    }

    // Get creator profile if exists
    let creator = null
    if (event.created_by) {
      const { data: creatorProfile } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url')
        .eq('id', event.created_by)
        .single()
      
      if (creatorProfile) {
        creator = creatorProfile
      }
    }

    return NextResponse.json({
      event: {
        ...event,
        creator,
        registrations: registrations || [],
        tickets_count: ticketsCount || 0
      }
    })
  } catch (error) {
    console.error('Error fetching event:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})

// PUT /api/admin/events/[id] - Update event
export const PUT = withModeratorAuth(async (req: NextRequest, user: any, { params }: { params: { id: string } }) => {
  const supabase = getSupabaseClient()
  const eventId = params.id

  try {
    const body = await req.json()
    const {
      title,
      description,
      game,
      image_url,
      location,
      starts_at,
      ends_at,
      price_cents,
      capacity,
      ticket_types,
      check_in_required,
      tournament_id,
      live_url,
      status
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

    // Validate status if provided
    const validStatuses = ['draft', 'upcoming', 'ongoing', 'completed', 'cancelled']
    const eventStatus = status && validStatuses.includes(status) ? status : undefined

    // Validate tournament_id if provided
    if (tournament_id) {
      const { data: tournament, error: tournamentError } = await supabase
        .from('tournaments')
        .select('id')
        .eq('id', tournament_id)
        .single()
      
      if (tournamentError || !tournament) {
        return NextResponse.json(
          { error: 'Invalid tournament_id' },
          { status: 400 }
        )
      }
    }

    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description || null
    if (game !== undefined) updateData.game = game || null
    if (image_url !== undefined) updateData.image_url = image_url || null
    if (location !== undefined) updateData.location = location || null
    if (starts_at !== undefined) updateData.starts_at = starts_at
    if (ends_at !== undefined) updateData.ends_at = ends_at || null
    if (price_cents !== undefined) updateData.price_cents = price_cents || 0
    if (capacity !== undefined) updateData.capacity = capacity || null
    if (ticket_types !== undefined) updateData.ticket_types = ticket_types || null
    if (check_in_required !== undefined) updateData.check_in_required = check_in_required
    if (tournament_id !== undefined) updateData.tournament_id = tournament_id || null
    if (live_url !== undefined) updateData.live_url = live_url || null
    if (eventStatus !== undefined) updateData.status = eventStatus
    updateData.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('events')
      .update(updateData)
      .eq('id', eventId)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: `Failed to update event: ${error.message}` },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Event updated successfully',
      event: data
    })
  } catch (error) {
    console.error('Error updating event:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})

// DELETE /api/admin/events/[id] - Delete event
export const DELETE = withModeratorAuth(async (req: NextRequest, user: any, { params }: { params: { id: string } }) => {
  const supabase = getSupabaseClient()
  const eventId = params.id

  try {
    // Check if event exists
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id')
      .eq('id', eventId)
      .single()

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Delete event - registrations will be automatically deleted via CASCADE
    // This is handled by the database foreign key constraint: 
    // event_registrations.event_id references events(id) on delete cascade
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId)

    if (error) {
      console.error('Error deleting event:', error)
      return NextResponse.json(
        { error: `Failed to delete event: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Event deleted successfully',
      eventId: eventId
    })
  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})