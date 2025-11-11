import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// GET /api/events/[id] - Get single event by ID (public access)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Use anon key for public access
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  const eventId = params.id

  try {
    // Fetch event
    const { data: event, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single()

    if (error) {
      console.error('Error fetching event:', error)
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Get participant count from registrations
    const { data: registrations, error: regError } = await supabase
      .from('event_registrations')
      .select('event_id')
      .eq('event_id', eventId)

    if (regError) {
      console.error('Error fetching registrations:', regError)
    }

    const participantCount = registrations?.length || 0

    // Get tickets count and sold tickets
    const { count: ticketsCount, error: ticketsError } = await supabase
      .from('event_tickets')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId)
      .neq('status', 'cancelled')

    if (ticketsError) {
      console.error('Error fetching tickets count:', ticketsError)
    }

    const ticketsSold = ticketsCount || 0

    // Fetch tournament banner if event has tournament_id and no image_url
    let tournamentBannerUrl: string | null = null
    if (event.tournament_id && !event.image_url) {
      const { data: tournament, error: tournamentError } = await supabase
        .from('tournaments')
        .select('banner_url, title')
        .eq('id', event.tournament_id)
        .single()
      
      if (!tournamentError && tournament?.banner_url) {
        tournamentBannerUrl = tournament.banner_url
      }
    }

    // Add participant count and status to event
    // Use status from database if exists, otherwise calculate from dates
    const now = new Date()
    const startsAt = event.starts_at ? new Date(event.starts_at) : null
    const endsAt = event.ends_at ? new Date(event.ends_at) : null

    let status: 'draft' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled' = 'upcoming'
    
    // If status exists in database and is valid, use it
    if (event.status && ['draft', 'upcoming', 'ongoing', 'completed', 'cancelled'].includes(event.status)) {
      status = event.status as 'draft' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
    } else {
      // Otherwise, calculate from dates
      if (startsAt && endsAt) {
        if (now >= startsAt && now <= endsAt) {
          status = 'ongoing'
        } else if (now > endsAt) {
          status = 'completed'
        } else {
          status = 'upcoming'
        }
      } else if (startsAt) {
        if (now >= startsAt) {
          status = 'completed'
        } else {
          status = 'upcoming'
        }
      }
    }

    // Use tournament banner as fallback if event has no image_url
    const displayImageUrl = event.image_url || tournamentBannerUrl || null
    const isUsingTournamentBanner = !event.image_url && tournamentBannerUrl !== null

    const eventWithStats = {
      ...event,
      image_url: displayImageUrl, // Override with tournament banner if no image_url
      tournament_banner_url: tournamentBannerUrl, // Keep original tournament banner for reference
      is_using_tournament_banner: isUsingTournamentBanner, // Flag to indicate if using tournament banner
      event_stats: {
        participants: participantCount,
        tickets_sold: ticketsSold
      },
      status
    }

    return NextResponse.json({ event: eventWithStats })
  } catch (error: any) {
    console.error('Error in events API:', error)
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 })
  }
}