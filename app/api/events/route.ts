import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// GET /api/events - Get all events (public access)
export async function GET(request: NextRequest) {
  // Use anon key for public access
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const search = searchParams.get('search')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  
  try {
    // Fetch events without event_stats (view cannot be used in relationship)
    let query = supabase
      .from('events')
      .select('*', { count: 'exact' })
    
    // Filter by status (default to upcoming for homepage)
    const now = new Date().toISOString()
    if (status) {
      if (status === 'upcoming') {
        query = query.gt('starts_at', now)
      } else if (status === 'ongoing') {
        query = query.lte('starts_at', now).gte('ends_at', now)
      } else if (status === 'completed') {
        query = query.lt('ends_at', now)
      }
    } else {
      // Default: show upcoming events
      query = query.gt('starts_at', now)
    }
    
    // Search functionality
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,location.ilike.%${search}%`)
    }
    
    // Pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to).order('starts_at', { ascending: true })
    
    const { data: events, error, count } = await query
    
    if (error) {
      console.error('Error fetching events:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    // Get participant counts for each event
    if (events && events.length > 0) {
      const eventIds = events.map((e: any) => e.id)
      
      const { data: registrations, error: regError } = await supabase
        .from('event_registrations')
        .select('event_id')
        .in('event_id', eventIds)

      if (regError) {
        console.error('Error fetching registrations:', regError)
      }

      // Count participants per event
      const participantCounts: Record<string, number> = {}
      if (registrations) {
        registrations.forEach((reg: any) => {
          participantCounts[reg.event_id] = (participantCounts[reg.event_id] || 0) + 1
        })
      }

      // Add participant counts to events
      const eventsWithStats = events.map((event: any) => ({
        ...event,
        event_stats: {
          participants: participantCounts[event.id] || 0
        }
      }))
      
      const totalPages = count ? Math.ceil(count / limit) : 0
      
      return NextResponse.json({
        events: eventsWithStats || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages
        }
      })
    }
    
    const totalPages = count ? Math.ceil(count / limit) : 0
    
    return NextResponse.json({
      events: events || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages
      }
    })
  } catch (error: any) {
    console.error('Error in events API:', error)
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 })
  }
}
