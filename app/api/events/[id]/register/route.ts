import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient, withAuth } from '@/lib/auth'

// GET /api/events/[id]/register - Check current user's registration status
export const GET = withAuth(async (req: NextRequest, user: any, { params }: { params: { id: string } }) => {
  const supabase = getSupabaseClient()
  const eventId = params.id
  const userId = user.id

  try {
    const { data, error } = await supabase
      .from('event_registrations')
      .select('*')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .single()

    if (error && (error as any).code !== 'PGRST116') { // not found code
      return NextResponse.json({ error: 'Failed to check registration' }, { status: 500 })
    }

    return NextResponse.json({ registered: !!data, registration: data || null })
  } catch (err) {
    console.error('Error checking registration:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

// POST /api/events/[id]/register - Register current user to event
export const POST = withAuth(async (req: NextRequest, user: any, { params }: { params: { id: string } }) => {
  const supabase = getSupabaseClient()
  const eventId = params.id
  const userId = user.id

  try {
    // Ensure event exists and check capacity
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, max_participants')
      .eq('id', eventId)
      .single()

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // If already registered, return 400
    const { data: existing } = await supabase
      .from('event_registrations')
      .select('event_id, user_id')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Already registered' }, { status: 400 })
    }

    // Capacity check if set
    if (event.max_participants) {
      const { count } = await supabase
        .from('event_registrations')
        .select('user_id', { count: 'exact', head: true })
        .eq('event_id', eventId)
        .eq('status', 'registered')

      if (count && count >= event.max_participants) {
        return NextResponse.json({ error: 'Event is full' }, { status: 400 })
      }
    }

    // Insert registration
    const { data, error } = await supabase
      .from('event_registrations')
      .insert({ event_id: eventId, user_id: userId, status: 'registered' })
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({ error: `Failed to register: ${error.message}` }, { status: 400 })
    }

    return NextResponse.json({ message: 'Registered successfully', registration: data })
  } catch (err) {
    console.error('Error registering to event:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

// DELETE /api/events/[id]/register - Unregister current user from event
export const DELETE = withAuth(async (req: NextRequest, user: any, { params }: { params: { id: string } }) => {
  const supabase = getSupabaseClient()
  const eventId = params.id
  const userId = user.id

  try {
    const { error } = await supabase
      .from('event_registrations')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', userId)

    if (error) {
      return NextResponse.json({ error: `Failed to unregister: ${error.message}` }, { status: 400 })
    }

    return NextResponse.json({ message: 'Unregistered successfully' })
  } catch (err) {
    console.error('Error unregistering from event:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})