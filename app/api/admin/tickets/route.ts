import { NextRequest, NextResponse } from 'next/server'
import { withModeratorAuth } from '@/lib/auth'
import { getSupabaseClient } from '@/lib/auth'

// GET /api/admin/tickets - Get all event tickets (admin only)
export const GET = withModeratorAuth(async (req: NextRequest) => {
  const supabase = getSupabaseClient()
  const { searchParams } = new URL(req.url)
  
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const search = searchParams.get('search') || ''
  const eventId = searchParams.get('event_id') || ''
  const status = searchParams.get('status') || ''
  const ticketType = searchParams.get('ticket_type') || ''
  const userId = searchParams.get('user_id') || ''
  
  const offset = (page - 1) * limit

  try {
    // Fetch tickets with user and event info
    let query = supabase
      .from('event_tickets')
      .select('*') // Select all columns, fetch related data separately
      .order('purchased_at', { ascending: false })

    if (eventId) {
      query = query.eq('event_id', eventId)
    }
    if (status) {
      query = query.eq('status', status)
    }
    if (ticketType) {
      query = query.eq('ticket_type', ticketType)
    }
    if (userId) {
      query = query.eq('user_id', userId)
    }
    
    // For search, we need to fetch more tickets to filter by user data
    // Since we can't search user data in DB query, we fetch more and filter in memory
    const fetchLimit = search ? Math.min(limit * 10, 200) : limit // Max 200 tickets when searching
    if (search) {
      // When searching, fetch from start to get more results for filtering
      // We'll apply pagination after filtering
      query = query.range(0, fetchLimit - 1)
    } else {
      // Normal pagination when not searching
      query = query.range(offset, offset + limit - 1)
    }

    const { data: tickets, error: ticketsError } = await query

    if (ticketsError) {
      console.error('Error fetching tickets:', ticketsError)
      return NextResponse.json(
        { error: 'Failed to fetch tickets', details: ticketsError.message },
        { status: 500 }
      )
    }

    // Fetch user and event info separately for each ticket
    let ticketsWithDetails = []
    if (tickets && tickets.length > 0) {
      ticketsWithDetails = await Promise.all(
        tickets.map(async (ticket: any) => {
          // Fetch user info
          let user = null
          if (ticket.user_id) {
            try {
              // Fetch profile first
              const { data: userData, error: userError } = await supabase
                .from('profiles')
                .select('id, full_name, username, avatar_url')
                .eq('id', ticket.user_id)
                .single()
              
              // Fetch email from auth.users
              let userEmail = null
              try {
                const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(ticket.user_id)
                if (!authError && authUser?.user) {
                  userEmail = authUser.user.email
                }
              } catch (authErr) {
                console.error(`Error fetching auth user for ticket ${ticket.id}:`, authErr)
              }
              
              if (!userError && userData) {
                user = {
                  ...userData,
                  email: userEmail
                }
              } else if (userEmail) {
                // If profile doesn't exist but email exists, create minimal user object
                user = {
                  id: ticket.user_id,
                  full_name: null,
                  username: null,
                  email: userEmail,
                  avatar_url: null
                }
              }
            } catch (err) {
              console.error(`Error fetching user for ticket ${ticket.id}:`, err)
              // Try to get email at least
              try {
                const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(ticket.user_id)
                if (!authError && authUser?.user?.email) {
                  user = {
                    id: ticket.user_id,
                    full_name: null,
                    username: null,
                    email: authUser.user.email,
                    avatar_url: null
                  }
                }
              } catch (authErr) {
                console.error(`Error fetching auth user for ticket ${ticket.id}:`, authErr)
              }
            }
          }

          // Fetch event info
          let event = null
          if (ticket.event_id) {
            try {
              const { data: eventData, error: eventError } = await supabase
                .from('events')
                .select('id, title, starts_at, location')
                .eq('id', ticket.event_id)
                .single()
              
              if (!eventError && eventData) {
                event = eventData
              }
            } catch (err) {
              console.error(`Error fetching event for ticket ${ticket.id}:`, err)
            }
          }

          return {
            ...ticket,
            user,
            event
          }
        })
      )
    }

    // Filter tickets by search if provided
    // Search in QR code and user data (name, username, email)
    let filteredTickets = ticketsWithDetails
    if (search) {
      const searchLower = search.toLowerCase()
      filteredTickets = ticketsWithDetails.filter((ticket: any) => {
        // Check QR code match
        if (ticket.qr_code?.toLowerCase().includes(searchLower)) {
          return true
        }
        // Check user data
        if (ticket.user) {
          return (
            ticket.user.full_name?.toLowerCase().includes(searchLower) ||
            ticket.user.username?.toLowerCase().includes(searchLower) ||
            ticket.user.email?.toLowerCase().includes(searchLower)
          )
        }
        return false
      })
    }
    
    // Apply pagination to filtered results
    const paginatedTickets = filteredTickets.slice(offset, offset + limit)

    // Get total count
    // If searching, use filtered count (approximate - based on fetched tickets)
    // If not searching, get accurate count from DB
    let totalCount = filteredTickets.length
    if (!search) {
      // Get accurate count from DB when not searching
      let countQuery = supabase
        .from('event_tickets')
        .select('id', { count: 'exact', head: true })

      if (eventId) {
        countQuery = countQuery.eq('event_id', eventId)
      }
      if (status) {
        countQuery = countQuery.eq('status', status)
      }
      if (ticketType) {
        countQuery = countQuery.eq('ticket_type', ticketType)
      }
      if (userId) {
        countQuery = countQuery.eq('user_id', userId)
      }

      const { count: dbCount, error: countError } = await countQuery

      if (!countError && dbCount !== null) {
        totalCount = dbCount
      }
    }
    // Note: For search queries, totalCount is approximate (based on fetched tickets)
    // This is a limitation when searching by user data since we filter in memory

    return NextResponse.json({
      tickets: paginatedTickets || [],
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching tickets:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})
