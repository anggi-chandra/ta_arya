import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/auth'
import { withModeratorAuth } from '@/lib/auth'

// GET /api/admin/events/[id] - Get specific event with registrations
export const GET = withModeratorAuth(async (req: NextRequest, user: any, { params }: { params: { id: string } }) => {
  const authHeader = req.headers.get('authorization')
  const supabase = getSupabaseClient(authHeader?.replace('Bearer ', ''))
  const eventId = params.id

  try {
    // Get event with creator info
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select(`
        *,
        creator:profiles!events_created_by_fkey (
          full_name,
          username,
          avatar_url
        )
      `)
      .eq('id', eventId)
      .single()

    if (eventError) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Get registrations with user info
    const { data: registrations, error: registrationsError } = await supabase
      .from('event_registrations')
      .select(`
        *,
        user:profiles!event_registrations_user_id_fkey (
          full_name,
          username,
          avatar_url
        )
      `)
      .eq('event_id', eventId)
      .order('created_at', { ascending: false })

    if (registrationsError) {
      return NextResponse.json(
        { error: 'Failed to fetch registrations' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      event: {
        ...event,
        registrations: registrations || []
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
  const authHeader = req.headers.get('authorization')
  const supabase = getSupabaseClient(authHeader?.replace('Bearer ', ''))
  const eventId = params.id

  try {
    const body = await req.json()
    const {
      title,
      description,
      image_url,
      location,
      starts_at,
      ends_at,
      max_participants,
      price_cents,
      live_url
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

    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (image_url !== undefined) updateData.image_url = image_url
    if (location !== undefined) updateData.location = location
    if (starts_at !== undefined) updateData.starts_at = starts_at
    if (ends_at !== undefined) updateData.ends_at = ends_at
    if (max_participants !== undefined) updateData.max_participants = max_participants
    if (price_cents !== undefined) updateData.price_cents = price_cents
    if (live_url !== undefined) updateData.live_url = live_url

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
  const authHeader = req.headers.get('authorization')
  const supabase = getSupabaseClient(authHeader?.replace('Bearer ', ''))
  const eventId = params.id

  try {
    // Check if event has registrations
    const { data: registrations, error: regError } = await supabase
      .from('event_registrations')
      .select('id')
      .eq('event_id', eventId)
      .limit(1)

    if (regError) {
      return NextResponse.json(
        { error: 'Failed to check registrations' },
        { status: 500 }
      )
    }

    if (registrations && registrations.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete event with existing registrations' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId)

    if (error) {
      return NextResponse.json(
        { error: `Failed to delete event: ${error.message}` },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Event deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})