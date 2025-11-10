import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getToken } from 'next-auth/jwt'

// POST /api/events/[id]/register - Register for an event
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Get user from JWT token
  const token = await getToken({ req: request })
  
  if (!token?.sub) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = token.sub

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
        }
      }
    }
  )

  const eventId = params.id

  try {
    // Check if event exists
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, max_participants, starts_at')
      .eq('id', eventId)
      .single()

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Check if event has started
    if (event.starts_at) {
      const startsAt = new Date(event.starts_at)
      if (new Date() >= startsAt) {
        return NextResponse.json({ error: 'Event has already started' }, { status: 400 })
      }
    }

    // Check if user is already registered
    const { data: existingRegistration } = await supabase
      .from('event_registrations')
      .select('event_id, user_id')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .single()

    if (existingRegistration) {
      return NextResponse.json({ error: 'Already registered' }, { status: 400 })
    }

    // Check if event is full
    if (event.max_participants) {
      const { data: registrations } = await supabase
        .from('event_registrations')
        .select('event_id')
        .eq('event_id', eventId)

      if (registrations && registrations.length >= event.max_participants) {
        return NextResponse.json({ error: 'Event is full' }, { status: 400 })
      }
    }

    // Register user
    const { data: registration, error: registerError } = await supabase
      .from('event_registrations')
      .insert({
        event_id: eventId,
        user_id: userId,
        status: 'registered'
      })
      .select()
      .single()

    if (registerError) {
      console.error('Error registering:', registerError)
      return NextResponse.json({ error: 'Failed to register' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      registration 
    })
  } catch (error: any) {
    console.error('Error in register API:', error)
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 })
  }
}

// GET /api/events/[id]/register/status - Check registration status
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Get user from JWT token
  const token = await getToken({ req: request })
  
  if (!token?.sub) {
    return NextResponse.json({ isRegistered: false })
  }

  const userId = token.sub

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
        }
      }
    }
  )

  const eventId = params.id

  try {
    const { data: registration } = await supabase
      .from('event_registrations')
      .select('event_id, user_id')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .single()

    return NextResponse.json({ 
      isRegistered: !!registration 
    })
  } catch (error: any) {
    console.error('Error checking registration status:', error)
    return NextResponse.json({ isRegistered: false })
  }
}
