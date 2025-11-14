import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getSupabaseClient } from '@/lib/auth';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// GET /api/dashboard/stats - Get user dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    
    if (!token?.sub) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = token.sub;
    const supabase = getSupabaseClient();

    // Get user's teams count (teams where user is a member OR owner)
    // First, count teams where user is a member
    const { count: memberTeamsCount, error: memberTeamsError } = await supabase
      .from('team_members')
      .select('team_id', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (memberTeamsError) {
      console.error('Error counting user teams (members):', memberTeamsError);
    }

    // Also count teams where user is the owner (in case owner is not in team_members)
    const { count: ownerTeamsCount, error: ownerTeamsError } = await supabase
      .from('teams')
      .select('id', { count: 'exact', head: true })
      .eq('owner_id', userId);

    if (ownerTeamsError) {
      console.error('Error counting user teams (owner):', ownerTeamsError);
    }

    // Get unique team IDs (user might be both owner and member)
    // Fetch team IDs from both sources and count unique
    const { data: memberTeams, error: memberTeamsDataError } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', userId);

    const { data: ownerTeams, error: ownerTeamsDataError } = await supabase
      .from('teams')
      .select('id')
      .eq('owner_id', userId);

    // Combine and get unique team IDs
    const memberTeamIds = memberTeams?.map(t => t.team_id) || [];
    const ownerTeamIds = ownerTeams?.map(t => t.id) || [];
    const uniqueTeamIds = new Set([...memberTeamIds, ...ownerTeamIds]);
    const teamsCount = uniqueTeamIds.size;

    // Get user's events count
    // Count events where user is the creator
    const { count: userEventsCount, error: userEventsError } = await supabase
      .from('events')
      .select('id', { count: 'exact', head: true })
      .eq('created_by', userId);

    if (userEventsError) {
      console.error('Error counting user events:', userEventsError);
    }

    // Also count event requests (pending + approved) for total event requests
    const { count: allEventRequestsCount, error: allEventRequestsError } = await supabase
      .from('event_requests')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (allEventRequestsError) {
      console.error('Error counting event requests:', allEventRequestsError);
    }

    // Get upcoming events count (events that haven't ended yet)
    // Events are upcoming if they haven't ended yet (ends_at is in the future or null and starts_at is in the future)
    const now = new Date().toISOString();
    const { data: allUserEvents, error: allUserEventsError } = await supabase
      .from('events')
      .select('id, starts_at, ends_at')
      .eq('created_by', userId);

    if (allUserEventsError) {
      console.error('Error fetching user events:', allUserEventsError);
    }

    // Filter upcoming events: events that haven't ended yet
    const upcomingEvents = (allUserEvents || []).filter((event: any) => {
      if (!event.ends_at) {
        // If no end date, check if start date is in the future
        return event.starts_at && new Date(event.starts_at) > new Date(now);
      }
      // If end date exists, check if it's in the future
      return new Date(event.ends_at) > new Date(now);
    });

    const upcomingEventsCount = upcomingEvents.length;

    // Get user's tournament registrations count
    const { count: tournamentsCount, error: tournamentsError } = await supabase
      .from('tournament_registrations')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (tournamentsError) {
      console.error('Error counting tournament registrations:', tournamentsError);
    }

    // Get user's activity count (event registrations)
    const { count: activityCount, error: activityError } = await supabase
      .from('event_registrations')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (activityError) {
      console.error('Error counting activity:', activityError);
    }

    return NextResponse.json({
      teams: teamsCount || 0,
      events: userEventsCount || 0,
      eventRequests: allEventRequestsCount || 0,
      upcomingEvents: upcomingEventsCount || 0,
      tournaments: tournamentsCount || 0,
      activity: activityCount || 0
    });
  } catch (error: any) {
    console.error('Error in dashboard stats API:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

