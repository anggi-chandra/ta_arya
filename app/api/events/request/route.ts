import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getSupabaseClient } from '@/lib/auth';

// POST /api/events/request - Create a new event request
export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token?.sub) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      title,
      description,
      game,
      image_url,
      location,
      starts_at,
      ends_at,
      price_cents = 0,
      capacity,
      live_url
    } = body;

    // Validate required fields
    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    if (!starts_at) {
      return NextResponse.json(
        { error: 'Start date and time is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Create event request
    const { data: eventRequest, error: requestError } = await supabase
      .from('event_requests')
      .insert({
        user_id: token.sub,
        title: title.trim(),
        description: description?.trim() || null,
        game: game?.trim() || null,
        image_url: image_url?.trim() || null,
        location: location?.trim() || null,
        starts_at: starts_at,
        ends_at: ends_at || null,
        price_cents: price_cents || 0,
        capacity: capacity || null,
        live_url: live_url?.trim() || null,
        status: 'pending'
      })
      .select()
      .single();

    if (requestError) {
      console.error('Error creating event request:', requestError);
      return NextResponse.json(
        { error: `Failed to create event request: ${requestError.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: 'Event request created successfully',
      eventRequest
    });
  } catch (error: any) {
    console.error('Error in create event request API:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/events/request - Get current user's event requests
export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token?.sub) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = getSupabaseClient();

    // Get user's event requests
    const { data: eventRequests, error: requestsError } = await supabase
      .from('event_requests')
      .select('*')
      .eq('user_id', token.sub)
      .order('created_at', { ascending: false });

    if (requestsError) {
      console.error('Error fetching event requests:', requestsError);
      return NextResponse.json(
        { error: 'Failed to fetch event requests' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      eventRequests: eventRequests || []
    });
  } catch (error: any) {
    console.error('Error in get event requests API:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

