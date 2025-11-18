import { NextRequest, NextResponse } from 'next/server'
import { withModeratorAuth } from '@/lib/auth'
import { getSupabaseClient } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// PUT /api/admin/tickets/[id] - Update ticket status (admin only)
export const PUT = withModeratorAuth(async (
  req: NextRequest,
  user: any,
  { params }: { params: { id: string } }
) => {
  const supabase = getSupabaseClient()
  const ticketId = params.id

  try {
    const body = await req.json()
    const { status } = body

    // Validate status
    const validStatuses = ['active', 'used', 'cancelled', 'transferred']
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      )
    }

    // Check if ticket exists
    const { data: existingTicket, error: fetchError } = await supabase
      .from('event_tickets')
      .select('id, status, used_at')
      .eq('id', ticketId)
      .single()

    if (fetchError || !existingTicket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    }

    // Set used_at if status is 'used' and it's not already set
    if (status === 'used' && !existingTicket.used_at) {
      updateData.used_at = new Date().toISOString()
    }

    // Update ticket
    const { data: updatedTicket, error: updateError } = await supabase
      .from('event_tickets')
      .update(updateData)
      .eq('id', ticketId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating ticket:', updateError)
      return NextResponse.json(
        { error: `Failed to update ticket: ${updateError.message}` },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Ticket status updated successfully',
      ticket: updatedTicket
    })
  } catch (error) {
    console.error('Error updating ticket status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})

