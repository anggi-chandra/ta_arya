import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/auth'
import { withAdminAuth } from '@/lib/auth'

// GET /api/admin/analytics/events - Get event analytics data
export const GET = withAdminAuth(async (req: NextRequest) => {
  const supabase = getSupabaseClient()
  const { searchParams } = new URL(req.url)
  
  const period = searchParams.get('period') || '30' // days
  const groupBy = searchParams.get('groupBy') || 'day' // day, week, month
  
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - parseInt(period))

  try {
    // Get event creation trends
    const { data: eventTrends, error: trendsError } = await supabase
      .from('events')
      .select('created_at, game, max_participants')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true })

    if (trendsError) {
      console.error('Error fetching event trends:', trendsError)
    }

    // Get event registrations data
    const { data: registrationData, error: registrationError } = await supabase
      .from('event_registrations')
      .select(`
        created_at,
        status,
        event:events (
          id,
          title,
          game,
          max_participants
        )
      `)
      .gte('created_at', startDate.toISOString())

    if (registrationError) {
      console.error('Error fetching registration data:', registrationError)
    }

    // Get events by status
    const { data: eventsByStatus, error: statusError } = await supabase
      .from('events')
      .select('id, status, start_date, end_date')

    if (statusError) {
      console.error('Error fetching events by status:', statusError)
    }

    // Get popular games
    const { data: gamePopularity, error: gameError } = await supabase
      .from('events')
      .select('game')

    if (gameError) {
      console.error('Error fetching game popularity:', gameError)
    }

    // Process event creation trends
    const processedTrends = processTimeSeriesData(eventTrends || [], groupBy, startDate, endDate)

    // Process registration trends
    const registrationTrends = processTimeSeriesData(registrationData || [], groupBy, startDate, endDate)

    // Process events by status
    const statusDistribution = processEventStatus(eventsByStatus || [])

    // Process game popularity
    const gameStats = processGamePopularity(gamePopularity || [])

    // Calculate registration rates
    const registrationRates = calculateRegistrationRates(eventTrends || [], registrationData || [])

    // Get top performing events (mock calculation)
    const topEvents = await getTopPerformingEvents(supabase, startDate)

    return NextResponse.json({
      eventAnalytics: {
        creationTrends: processedTrends,
        registrationTrends,
        statusDistribution,
        gamePopularity: gameStats,
        registrationRates,
        topEvents,
        summary: {
          totalEvents: eventTrends?.length || 0,
          totalRegistrations: registrationData?.length || 0,
          averageRegistrationsPerEvent: registrationRates.average,
          mostPopularGame: gameStats[0]?.game || 'N/A'
        }
      },
      period: `${period} days`,
      groupBy
    })
  } catch (error) {
    console.error('Error fetching event analytics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})

// Helper function to process time series data
function processTimeSeriesData(data: any[], groupBy: string, startDate: Date, endDate: Date) {
  const result: { date: string; count: number }[] = []
  const dateMap = new Map<string, number>()

  // Initialize date range
  const current = new Date(startDate)
  while (current <= endDate) {
    const key = formatDateByGroup(current, groupBy)
    dateMap.set(key, 0)
    current.setDate(current.getDate() + (groupBy === 'week' ? 7 : groupBy === 'month' ? 30 : 1))
  }

  // Count items by date
  data.forEach(item => {
    const date = new Date(item.created_at)
    const key = formatDateByGroup(date, groupBy)
    dateMap.set(key, (dateMap.get(key) || 0) + 1)
  })

  // Convert to array
  dateMap.forEach((count, date) => {
    result.push({ date, count })
  })

  return result.sort((a, b) => a.date.localeCompare(b.date))
}

// Helper function to format date by grouping
function formatDateByGroup(date: Date, groupBy: string): string {
  switch (groupBy) {
    case 'week':
      const weekStart = new Date(date)
      weekStart.setDate(date.getDate() - date.getDay())
      return weekStart.toISOString().split('T')[0]
    case 'month':
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    default: // day
      return date.toISOString().split('T')[0]
  }
}

// Helper function to process event status
function processEventStatus(events: any[]) {
  const now = new Date()
  const statusCount = {
    upcoming: 0,
    ongoing: 0,
    completed: 0
  }

  events.forEach(event => {
    const startDate = new Date(event.start_date)
    const endDate = new Date(event.end_date)

    if (now < startDate) {
      statusCount.upcoming++
    } else if (now >= startDate && now <= endDate) {
      statusCount.ongoing++
    } else {
      statusCount.completed++
    }
  })

  const total = statusCount.upcoming + statusCount.ongoing + statusCount.completed

  return Object.entries(statusCount).map(([status, count]) => ({
    status,
    count,
    percentage: total > 0 ? ((count / total) * 100).toFixed(1) : '0'
  }))
}

// Helper function to process game popularity
function processGamePopularity(events: any[]) {
  const gameCount = new Map<string, number>()
  
  events.forEach(event => {
    const game = event.game || 'Unknown'
    gameCount.set(game, (gameCount.get(game) || 0) + 1)
  })

  const total = Array.from(gameCount.values()).reduce((sum, count) => sum + count, 0)
  
  return Array.from(gameCount.entries())
    .map(([game, count]) => ({
      game,
      count,
      percentage: total > 0 ? ((count / total) * 100).toFixed(1) : '0'
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10) // Top 10 games
}

// Helper function to calculate registration rates
function calculateRegistrationRates(events: any[], registrations: any[]) {
  if (!events.length) {
    return { average: 0, highest: 0, lowest: 0 }
  }

  const eventRegistrationCount = new Map<string, number>()
  
  registrations.forEach(reg => {
    if (reg.event?.id) {
      const eventId = reg.event.id
      eventRegistrationCount.set(eventId, (eventRegistrationCount.get(eventId) || 0) + 1)
    }
  })

  const rates = Array.from(eventRegistrationCount.values())
  
  return {
    average: rates.length > 0 ? Math.round(rates.reduce((sum, rate) => sum + rate, 0) / rates.length) : 0,
    highest: rates.length > 0 ? Math.max(...rates) : 0,
    lowest: rates.length > 0 ? Math.min(...rates) : 0
  }
}

// Helper function to get top performing events
async function getTopPerformingEvents(supabase: any, startDate: Date) {
  try {
    const { data: topEvents, error } = await supabase
      .from('events')
      .select(`
        id,
        title,
        game,
        max_participants,
        event_registrations (
          id,
          status
        )
      `)
      .gte('created_at', startDate.toISOString())
      .limit(5)

    if (error) {
      console.error('Error fetching top events:', error)
      return []
    }

    return topEvents?.map((event: any) => ({
      id: event.id,
      title: event.title,
      game: event.game,
      maxParticipants: event.max_participants,
      registrations: event.event_registrations?.length || 0,
      fillRate: event.max_participants > 0 ? 
        ((event.event_registrations?.length || 0) / event.max_participants * 100).toFixed(1) : '0'
    }))
    .sort((a: any, b: any) => b.registrations - a.registrations) || []
  } catch (error) {
    console.error('Error in getTopPerformingEvents:', error)
    return []
  }
}