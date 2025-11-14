import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/auth'
import { withAdminAuth } from '@/lib/auth'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// GET /api/admin/analytics/users - Get user analytics data
export const GET = withAdminAuth(async (req: NextRequest) => {
  const supabase = getSupabaseClient()
  const { searchParams } = new URL(req.url)
  
  const period = searchParams.get('period') || '30' // days
  const groupBy = searchParams.get('groupBy') || 'day' // day, week, month
  
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - parseInt(period))

  try {
    // Get user registration trends
    const { data: userTrends, error: trendsError } = await supabase
      .from('profiles')
      .select('created_at')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true })

    if (trendsError) {
      console.error('Error fetching user trends:', trendsError)
    }

    // Get user roles distribution
    const { data: roleDistribution, error: rolesError } = await supabase
      .from('user_roles')
      .select(`
        role,
        profiles!user_roles_user_id_fkey (
          id
        )
      `)

    if (rolesError) {
      console.error('Error fetching role distribution:', rolesError)
    }

    // Get active users (users who have logged in recently)
    const activeUsersDate = new Date()
    activeUsersDate.setDate(activeUsersDate.getDate() - 7) // Last 7 days

    const { data: activeUsers, error: activeUsersError } = await supabase
      .from('profiles')
      .select('id, last_sign_in_at')
      .gte('last_sign_in_at', activeUsersDate.toISOString())

    if (activeUsersError) {
      console.error('Error fetching active users:', activeUsersError)
    }

    // Process user registration trends by groupBy period
    const processedTrends = processTimeSeriesData(userTrends || [], groupBy, startDate, endDate)

    // Process role distribution
    const roleStats = processRoleDistribution(roleDistribution || [])

    // Get top user activities (mock data for demonstration)
    const topActivities = [
      { activity: 'Event Registrations', count: 245, percentage: 35.2 },
      { activity: 'Team Joins', count: 189, percentage: 27.1 },
      { activity: 'Forum Posts', count: 156, percentage: 22.4 },
      { activity: 'Content Views', count: 107, percentage: 15.3 }
    ]

    return NextResponse.json({
      userAnalytics: {
        trends: processedTrends,
        roleDistribution: roleStats,
        activeUsers: {
          count: activeUsers?.length || 0,
          percentage: 0 // Will be calculated based on total users
        },
        topActivities,
        summary: {
          totalUsers: userTrends?.length || 0,
          averageDaily: Math.round((userTrends?.length || 0) / parseInt(period)),
          peakDay: findPeakRegistrationDay(processedTrends)
        }
      },
      period: `${period} days`,
      groupBy
    })
  } catch (error) {
    console.error('Error fetching user analytics:', error)
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

  // Count registrations by date
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

// Helper function to process role distribution
function processRoleDistribution(data: any[]) {
  const roleCount = new Map<string, number>()
  
  data.forEach(item => {
    const role = item.role || 'user'
    roleCount.set(role, (roleCount.get(role) || 0) + 1)
  })

  const total = Array.from(roleCount.values()).reduce((sum, count) => sum + count, 0)
  
  return Array.from(roleCount.entries()).map(([role, count]) => ({
    role,
    count,
    percentage: total > 0 ? ((count / total) * 100).toFixed(1) : '0'
  }))
}

// Helper function to find peak registration day
function findPeakRegistrationDay(trends: { date: string; count: number }[]) {
  if (!trends.length) return null
  
  const peak = trends.reduce((max, current) => 
    current.count > max.count ? current : max
  )
  
  return {
    date: peak.date,
    count: peak.count
  }
}