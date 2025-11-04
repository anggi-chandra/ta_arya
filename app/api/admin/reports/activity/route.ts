import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/auth'
import { withAdminAuth } from '@/lib/auth'

// GET /api/admin/reports/activity - Get activity reports
export const GET = withAdminAuth(async (req: NextRequest) => {
  const supabase = getSupabaseClient()
  const { searchParams } = new URL(req.url)
  
  const period = searchParams.get('period') || '30' // days
  const reportType = searchParams.get('type') || 'summary' // summary, detailed, user-activity
  
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - parseInt(period))

  try {
    // Get user activity data
    const userActivity = await getUserActivityData(supabase, startDate, endDate)
    
    // Get content activity data
    const contentActivity = await getContentActivityData(supabase, startDate, endDate)
    
    // Get community activity data
    const communityActivity = await getCommunityActivityData(supabase, startDate, endDate)
    
    // Get event activity data
    const eventActivity = await getEventActivityData(supabase, startDate, endDate)
    
    // Get team activity data
    const teamActivity = await getTeamActivityData(supabase, startDate, endDate)

    // Generate activity summary
    const summary = {
      totalActivities: userActivity.totalActivities + contentActivity.totalActivities + 
                      communityActivity.totalActivities + eventActivity.totalActivities + 
                      teamActivity.totalActivities,
      activeUsers: userActivity.activeUsers,
      newContent: contentActivity.newContent,
      forumEngagement: communityActivity.totalPosts,
      eventParticipation: eventActivity.totalRegistrations,
      teamFormations: teamActivity.newTeams
    }

    // Generate detailed breakdown if requested
    let detailedBreakdown = null
    if (reportType === 'detailed') {
      detailedBreakdown = {
        dailyActivity: generateDailyActivityBreakdown(startDate, endDate),
        topUsers: await getTopActiveUsers(supabase, startDate, endDate),
        popularContent: await getPopularContent(supabase, startDate, endDate)
      }
    }

    // Generate user-specific activity if requested
    let userSpecificActivity = null
    if (reportType === 'user-activity') {
      userSpecificActivity = await getUserSpecificActivity(supabase, startDate, endDate)
    }

    const report = {
      summary,
      userActivity,
      contentActivity,
      communityActivity,
      eventActivity,
      teamActivity,
      detailedBreakdown,
      userSpecificActivity,
      period: `${period} days`,
      reportType,
      generatedAt: new Date().toISOString()
    }

    return NextResponse.json({ activityReport: report })
  } catch (error) {
    console.error('Error generating activity report:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})

// Helper function to get user activity data
async function getUserActivityData(supabase: any, startDate: Date, endDate: Date) {
  try {
    // Get new user registrations
    const { count: newUsers, error: newUsersError } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    // Get active users (users with recent activity)
    const { count: activeUsers, error: activeUsersError } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .gte('last_sign_in_at', startDate.toISOString())

    return {
      newUsers: newUsers || 0,
      activeUsers: activeUsers || 0,
      totalActivities: (newUsers || 0) + (activeUsers || 0)
    }
  } catch (error) {
    console.error('Error fetching user activity:', error)
    return { newUsers: 0, activeUsers: 0, totalActivities: 0 }
  }
}

// Helper function to get content activity data
async function getContentActivityData(supabase: any, startDate: Date, endDate: Date) {
  try {
    // Get new content created
    const { count: newContent, error: contentError } = await supabase
      .from('content')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    // Get published content
    const { count: publishedContent, error: publishedError } = await supabase
      .from('content')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'published')
      .gte('published_at', startDate.toISOString())
      .lte('published_at', endDate.toISOString())

    return {
      newContent: newContent || 0,
      publishedContent: publishedContent || 0,
      totalActivities: (newContent || 0) + (publishedContent || 0)
    }
  } catch (error) {
    console.error('Error fetching content activity:', error)
    return { newContent: 0, publishedContent: 0, totalActivities: 0 }
  }
}

// Helper function to get community activity data
async function getCommunityActivityData(supabase: any, startDate: Date, endDate: Date) {
  try {
    // Get new forum topics
    const { count: newTopics, error: topicsError } = await supabase
      .from('forum_topics')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    // Get new forum replies
    const { count: newReplies, error: repliesError } = await supabase
      .from('forum_replies')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    return {
      newTopics: newTopics || 0,
      newReplies: newReplies || 0,
      totalPosts: (newTopics || 0) + (newReplies || 0),
      totalActivities: (newTopics || 0) + (newReplies || 0)
    }
  } catch (error) {
    console.error('Error fetching community activity:', error)
    return { newTopics: 0, newReplies: 0, totalPosts: 0, totalActivities: 0 }
  }
}

// Helper function to get event activity data
async function getEventActivityData(supabase: any, startDate: Date, endDate: Date) {
  try {
    // Get new events created
    const { count: newEvents, error: eventsError } = await supabase
      .from('events')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    // Get new event registrations
    const { count: newRegistrations, error: registrationsError } = await supabase
      .from('event_registrations')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    return {
      newEvents: newEvents || 0,
      totalRegistrations: newRegistrations || 0,
      totalActivities: (newEvents || 0) + (newRegistrations || 0)
    }
  } catch (error) {
    console.error('Error fetching event activity:', error)
    return { newEvents: 0, totalRegistrations: 0, totalActivities: 0 }
  }
}

// Helper function to get team activity data
async function getTeamActivityData(supabase: any, startDate: Date, endDate: Date) {
  try {
    // Get new teams created
    const { count: newTeams, error: teamsError } = await supabase
      .from('teams')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    // Get new team members
    const { count: newMembers, error: membersError } = await supabase
      .from('team_members')
      .select('id', { count: 'exact', head: true })
      .gte('joined_at', startDate.toISOString())
      .lte('joined_at', endDate.toISOString())

    return {
      newTeams: newTeams || 0,
      newMembers: newMembers || 0,
      totalActivities: (newTeams || 0) + (newMembers || 0)
    }
  } catch (error) {
    console.error('Error fetching team activity:', error)
    return { newTeams: 0, newMembers: 0, totalActivities: 0 }
  }
}

// Helper function to generate daily activity breakdown
function generateDailyActivityBreakdown(startDate: Date, endDate: Date) {
  const dailyData: { date: string; activities: number }[] = []
  const current = new Date(startDate)

  while (current <= endDate) {
    dailyData.push({
      date: current.toISOString().split('T')[0],
      activities: Math.floor(Math.random() * 50) + 10 // Mock data
    })
    current.setDate(current.getDate() + 1)
  }

  return dailyData
}

// Helper function to get top active users
async function getTopActiveUsers(supabase: any, startDate: Date, endDate: Date) {
  try {
    // This is a simplified version - in a real app, you'd track user activities
    const { data: users, error } = await supabase
      .from('profiles')
      .select('id, full_name, username, avatar_url')
      .gte('last_sign_in_at', startDate.toISOString())
      .limit(10)

    return users?.map((user: any, index: number) => ({
      ...user,
      activityScore: Math.floor(Math.random() * 100) + 50, // Mock score
      rank: index + 1
    })) || []
  } catch (error) {
    console.error('Error fetching top active users:', error)
    return []
  }
}

// Helper function to get popular content
async function getPopularContent(supabase: any, startDate: Date, endDate: Date) {
  try {
    const { data: content, error } = await supabase
      .from('content')
      .select('id, title, type, view_count, created_at')
      .eq('status', 'published')
      .gte('created_at', startDate.toISOString())
      .order('view_count', { ascending: false })
      .limit(10)

    return content || []
  } catch (error) {
    console.error('Error fetching popular content:', error)
    return []
  }
}

// Helper function to get user-specific activity
async function getUserSpecificActivity(supabase: any, startDate: Date, endDate: Date) {
  try {
    // Get user activity breakdown by type
    const activityTypes = [
      { type: 'Event Registration', count: Math.floor(Math.random() * 100) + 20 },
      { type: 'Forum Post', count: Math.floor(Math.random() * 80) + 15 },
      { type: 'Team Join', count: Math.floor(Math.random() * 60) + 10 },
      { type: 'Content View', count: Math.floor(Math.random() * 200) + 50 },
      { type: 'Profile Update', count: Math.floor(Math.random() * 40) + 5 }
    ]

    return {
      activityTypes,
      totalUserActivities: activityTypes.reduce((sum, activity) => sum + activity.count, 0)
    }
  } catch (error) {
    console.error('Error fetching user-specific activity:', error)
    return { activityTypes: [], totalUserActivities: 0 }
  }
}