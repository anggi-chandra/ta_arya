import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/auth';
import { withModeratorAuth } from '@/lib/auth';

// PUT /api/admin/event-requests/[id] - Approve or reject an event request
export const PUT = withModeratorAuth(async (
  req: NextRequest,
  user: any,
  { params }: { params: { id: string } }
) => {
  try {
    const body = await req.json();
    const { action, rejection_reason } = body;

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "approve" or "reject"' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Get the event request
    const { data: eventRequest, error: requestError } = await supabase
      .from('event_requests')
      .select('*')
      .eq('id', params.id)
      .single();

    if (requestError || !eventRequest) {
      return NextResponse.json(
        { error: 'Event request not found' },
        { status: 404 }
      );
    }

    if (eventRequest.status !== 'pending') {
      return NextResponse.json(
        { error: `Event request has already been ${eventRequest.status}` },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    if (action === 'approve') {
      // Update event request status
      const { error: updateError } = await supabase
        .from('event_requests')
        .update({
          status: 'approved',
          reviewed_at: now,
          reviewed_by: user.id
        })
        .eq('id', params.id);

      if (updateError) {
        console.error('Error updating event request:', updateError);
        return NextResponse.json(
          { error: 'Failed to update event request' },
          { status: 500 }
        );
      }

      // Create the event from the request
      const { data: event, error: eventError } = await supabase
        .from('events')
        .insert({
          title: eventRequest.title,
          description: eventRequest.description,
          game: eventRequest.game,
          image_url: eventRequest.image_url,
          location: eventRequest.location,
          starts_at: eventRequest.starts_at,
          ends_at: eventRequest.ends_at,
          price_cents: eventRequest.price_cents || 0,
          capacity: eventRequest.capacity,
          live_url: eventRequest.live_url,
          status: 'upcoming',
          created_by: eventRequest.user_id
        })
        .select()
        .single();

      if (eventError) {
        console.error('Error creating event:', eventError);
        // Rollback the request status update
        await supabase
          .from('event_requests')
          .update({
            status: 'pending',
            reviewed_at: null,
            reviewed_by: null
          })
          .eq('id', params.id);

        return NextResponse.json(
          { error: `Failed to create event: ${eventError.message}` },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message: 'Event request approved and event created successfully',
        eventRequest: {
          ...eventRequest,
          status: 'approved',
          reviewed_at: now,
          reviewed_by: user.id
        },
        event
      });
    } else if (action === 'reject') {
      // Update event request status
      const { error: updateError } = await supabase
        .from('event_requests')
        .update({
          status: 'rejected',
          reviewed_at: now,
          reviewed_by: user.id,
          rejection_reason: rejection_reason?.trim() || null
        })
        .eq('id', params.id);

      if (updateError) {
        console.error('Error updating event request:', updateError);
        return NextResponse.json(
          { error: 'Failed to update event request' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message: 'Event request rejected successfully',
        eventRequest: {
          ...eventRequest,
          status: 'rejected',
          reviewed_at: now,
          reviewed_by: user.id,
          rejection_reason: rejection_reason?.trim() || null
        }
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error in update event request API:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
});

