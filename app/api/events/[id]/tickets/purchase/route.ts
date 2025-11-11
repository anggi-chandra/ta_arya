import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { getSupabaseClient } from '@/lib/auth'

// POST /api/events/[id]/tickets/purchase - Purchase event tickets
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = await getToken({ req: request })
  
  if (!token?.sub) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = token.sub
  const eventId = params.id
  const supabase = getSupabaseClient()

  try {
    const body = await request.json()
    const { ticket_type = 'regular', quantity = 1 } = body

    if (quantity < 1 || quantity > 10) {
      return NextResponse.json(
        { error: 'Quantity must be between 1 and 10' },
        { status: 400 }
      )
    }

    // Fetch event
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single()

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Check if event has started
    if (event.starts_at) {
      const startsAt = new Date(event.starts_at)
      if (new Date() >= startsAt) {
        return NextResponse.json(
          { error: 'Event has already started' },
          { status: 400 }
        )
      }
    }

    // Determine ticket price
    let ticketPriceCents = 0
    if (event.ticket_types) {
      // Parse ticket_types if it's a string (JSON)
      let ticketTypes = event.ticket_types
      if (typeof ticketTypes === 'string') {
        try {
          ticketTypes = JSON.parse(ticketTypes)
        } catch (e) {
          console.error('Error parsing ticket_types:', e)
        }
      }
      
      if (ticketTypes && ticketTypes[ticket_type]) {
        const ticketTypeData = ticketTypes[ticket_type]
        // Price is already in rupiah, convert to cents
        ticketPriceCents = Math.round((ticketTypeData.price || 0) * 100)
        
        // Check availability
        if (ticketTypeData.available !== undefined && ticketTypeData.available !== null) {
          if (ticketTypeData.available < quantity) {
            return NextResponse.json(
              { error: `Hanya tersedia ${ticketTypeData.available} tiket untuk ${ticket_type}` },
              { status: 400 }
            )
          }
        }
      } else {
        return NextResponse.json(
          { error: `Jenis tiket ${ticket_type} tidak tersedia` },
          { status: 400 }
        )
      }
    } else if (event.price_cents) {
      ticketPriceCents = event.price_cents
    }

    // Check capacity
    if (event.capacity) {
      const { count: ticketsSold, error: countError } = await supabase
        .from('event_tickets')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId)
        .neq('status', 'cancelled')

      if (countError) {
        console.error('Error counting tickets:', countError)
      }

      const availableSeats = event.capacity - (ticketsSold || 0)
      if (availableSeats < quantity) {
        return NextResponse.json(
          { error: `Only ${availableSeats} seats available` },
          { status: 400 }
        )
      }
    }

    // Generate QR codes and create tickets
    const tickets = []
    const timestamp = Date.now()
    for (let i = 0; i < quantity; i++) {
      // Generate unique QR code: EVT-{eventId_8chars}-{userId_8chars}-{timestamp}-{index}
      const eventIdShort = eventId.replace(/-/g, '').substring(0, 8).toUpperCase()
      const userIdShort = userId.replace(/-/g, '').substring(0, 8).toUpperCase()
      const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase()
      const qrCode = `EVT-${eventIdShort}-${userIdShort}-${timestamp}-${i}-${randomSuffix}`
      
      tickets.push({
        event_id: eventId,
        user_id: userId,
        ticket_type: ticket_type,
        price_cents: ticketPriceCents,
        qr_code: qrCode,
        status: 'active'
      })
    }

    // Insert tickets
    const { data: insertedTickets, error: insertError } = await supabase
      .from('event_tickets')
      .insert(tickets)
      .select()

    if (insertError) {
      console.error('Error creating tickets:', insertError)
      return NextResponse.json(
        { error: `Failed to create tickets: ${insertError.message}` },
        { status: 500 }
      )
    }

    // Update ticket_types availability if needed
    if (event.ticket_types && event.ticket_types[ticket_type] && event.ticket_types[ticket_type].available !== undefined) {
      const updatedTicketTypes = { ...event.ticket_types }
      if (updatedTicketTypes[ticket_type]) {
        updatedTicketTypes[ticket_type] = {
          ...updatedTicketTypes[ticket_type],
          available: (updatedTicketTypes[ticket_type].available || 0) - quantity
        }

        // Update event ticket_types
        const { error: updateError } = await supabase
          .from('events')
          .update({ ticket_types: updatedTicketTypes })
          .eq('id', eventId)

        if (updateError) {
          console.error('Error updating ticket availability:', updateError)
          // Don't fail the request, just log the error
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `${quantity} tiket berhasil dibeli`,
      tickets: insertedTickets,
      total_price: ticketPriceCents * quantity
    })
  } catch (error: any) {
    console.error('Error in ticket purchase API:', error)
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

