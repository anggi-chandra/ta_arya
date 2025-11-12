import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/auth';
import { withModeratorAuth } from '@/lib/auth';

// GET /api/admin/event-requests - Get all event requests (for admin)
export const GET = withModeratorAuth(async (req: NextRequest, user: any) => {
  const { searchParams } = new URL(req.url);
  
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const status = searchParams.get('status') || '';
  
  const offset = (page - 1) * limit;

  try {
    const supabase = getSupabaseClient();

    // Build query
    let query = supabase
      .from('event_requests')
      .select('*', { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('requested_at', { ascending: false });

    // Add status filter
    if (status) {
      query = query.eq('status', status);
    }

    const { data: eventRequests, error: requestsError, count } = await query;

    if (requestsError) {
      console.error('Error fetching event requests:', requestsError);
      return NextResponse.json(
        { error: 'Failed to fetch event requests' },
        { status: 500 }
      );
    }

    // Get user info for each request
    const userIds = [...new Set(eventRequests?.map((r: any) => r.user_id).filter(Boolean) || [])];
    let usersMap = new Map();
    
    if (userIds.length > 0) {
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id, username, full_name, email')
        .in('id', userIds);

      if (!usersError && users) {
        usersMap = new Map(users.map((u: any) => [u.id, u]));
      }
    }

    // Combine event requests with user info
    const eventRequestsWithUsers = eventRequests?.map((request: any) => {
      const user = usersMap.get(request.user_id);
      return {
        ...request,
        user: user || null
      };
    }) || [];

    return NextResponse.json({
      eventRequests: eventRequestsWithUsers,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error: any) {
    console.error('Error in get event requests API:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
});

