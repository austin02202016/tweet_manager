// Supabase Edge Function: get_client_metrics
// This function aggregates metrics for a client's tweets and threads

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface Thread {
  thread_id: string
  title: string
  client_id: string
  created_at: string
  repackaged_instagram: boolean
  repackaged_linkedin: boolean
}

interface Tweet {
  id: string
  thread_id: string
  text: string
  date_posted: string
  created_at: string
  like_count: number
  reply_count: number
  view_count: number
  retweet_count: number
  quote_count: number
}

interface ClientMetrics {
  totalThreads: number
  totalTweets: number
  totalViews: number
  totalLikes: number
  totalReplies: number
  totalRetweets: number
  totalQuotes: number
  repackagedCount: number
  percentRepackaged: number
  periodComparison: {
    views: { current: number, previous: number, change: number, positive: boolean }
    likes: { current: number, previous: number, change: number, positive: boolean }
    replies: { current: number, previous: number, change: number, positive: boolean }
  }
  threadsByDate: Record<string, number>
  top5Threads: Array<{
    thread_id: string
    title: string
    metrics: { views: number, likes: number, replies: number }
  }>
}

serve(async (req) => {
  // Create a Supabase client with the Auth context of the function
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
  )

  // Parse request body
  const { client_id, period_days = 7 } = await req.json()

  if (!client_id) {
    return new Response(
      JSON.stringify({ error: 'client_id is required' }),
      { headers: { 'Content-Type': 'application/json' }, status: 400 }
    )
  }

  try {
    // Fetch all threads for this client
    const { data: threads, error: threadsError } = await supabaseClient
      .from('threads')
      .select('*')
      .eq('client_id', client_id)

    if (threadsError) throw new Error(threadsError.message)
    if (!threads || threads.length === 0) {
      return new Response(
        JSON.stringify({ metrics: getEmptyMetrics() }),
        { headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Get all tweets for these threads
    const threadIds = threads.map((thread: Thread) => thread.thread_id)
    const { data: tweets, error: tweetsError } = await supabaseClient
      .from('tweets')
      .select('*')
      .in('thread_id', threadIds)

    if (tweetsError) throw new Error(tweetsError.message)
    if (!tweets || tweets.length === 0) {
      return new Response(
        JSON.stringify({ 
          metrics: {
            ...getEmptyMetrics(),
            totalThreads: threads.length
          }
        }),
        { headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Calculate date ranges for period comparison
    const now = new Date()
    const currentPeriodStart = new Date(now)
    currentPeriodStart.setDate(now.getDate() - period_days)

    const previousPeriodStart = new Date(currentPeriodStart)
    previousPeriodStart.setDate(currentPeriodStart.getDate() - period_days)

    // Define metrics object
    const metrics: ClientMetrics = {
      totalThreads: threads.length,
      totalTweets: tweets.length,
      totalViews: 0,
      totalLikes: 0,
      totalReplies: 0,
      totalRetweets: 0,
      totalQuotes: 0,
      repackagedCount: 0,
      percentRepackaged: 0,
      periodComparison: {
        views: { current: 0, previous: 0, change: 0, positive: true },
        likes: { current: 0, previous: 0, change: 0, positive: true },
        replies: { current: 0, previous: 0, change: 0, positive: true }
      },
      threadsByDate: {},
      top5Threads: []
    }

    // Track metrics by thread for top 5 calculation
    const threadMetrics: Record<string, { 
      thread_id: string,
      title: string,
      views: number,
      likes: number,
      replies: number 
    }> = {}
    
    // Initialize thread metrics
    threads.forEach((thread: Thread) => {
      threadMetrics[thread.thread_id] = {
        thread_id: thread.thread_id,
        title: thread.title || 'Untitled Thread',
        views: 0,
        likes: 0,
        replies: 0
      }
      
      // Count repackaged threads
      if (thread.repackaged_linkedin || thread.repackaged_instagram) {
        metrics.repackagedCount++
      }
      
      // Add to threads by date
      const date = new Date(thread.created_at).toISOString().split('T')[0]
      metrics.threadsByDate[date] = (metrics.threadsByDate[date] || 0) + 1
    })
    
    // Aggregate metrics from tweets
    tweets.forEach((tweet: Tweet) => {
      // Total metrics
      metrics.totalViews += tweet.view_count || 0
      metrics.totalLikes += tweet.like_count || 0
      metrics.totalReplies += tweet.reply_count || 0
      metrics.totalRetweets += tweet.retweet_count || 0
      metrics.totalQuotes += tweet.quote_count || 0
      
      // Add to thread metrics for top 5
      if (threadMetrics[tweet.thread_id]) {
        threadMetrics[tweet.thread_id].views += tweet.view_count || 0
        threadMetrics[tweet.thread_id].likes += tweet.like_count || 0
        threadMetrics[tweet.thread_id].replies += tweet.reply_count || 0
      }

      // Period comparison
      const tweetDate = new Date(tweet.date_posted || tweet.created_at)
      
      if (tweetDate >= currentPeriodStart) {
        // Current period (last period_days days)
        metrics.periodComparison.views.current += tweet.view_count || 0
        metrics.periodComparison.likes.current += tweet.like_count || 0
        metrics.periodComparison.replies.current += tweet.reply_count || 0
      } else if (tweetDate >= previousPeriodStart && tweetDate < currentPeriodStart) {
        // Previous period (period before last period_days days)
        metrics.periodComparison.views.previous += tweet.view_count || 0
        metrics.periodComparison.likes.previous += tweet.like_count || 0
        metrics.periodComparison.replies.previous += tweet.reply_count || 0
      }
    })
    
    // Calculate percentage changes
    metrics.periodComparison.views.change = calculatePercentChange(
      metrics.periodComparison.views.current, 
      metrics.periodComparison.views.previous
    )
    metrics.periodComparison.views.positive = metrics.periodComparison.views.change >= 0
    
    metrics.periodComparison.likes.change = calculatePercentChange(
      metrics.periodComparison.likes.current, 
      metrics.periodComparison.likes.previous
    )
    metrics.periodComparison.likes.positive = metrics.periodComparison.likes.change >= 0
    
    metrics.periodComparison.replies.change = calculatePercentChange(
      metrics.periodComparison.replies.current, 
      metrics.periodComparison.replies.previous
    )
    metrics.periodComparison.replies.positive = metrics.periodComparison.replies.change >= 0
    
    // Calculate percentage of repackaged threads
    metrics.percentRepackaged = Math.round((metrics.repackagedCount / metrics.totalThreads) * 100)
    
    // Get top 5 threads by engagement (views + likes + replies)
    metrics.top5Threads = Object.values(threadMetrics)
      .sort((a, b) => {
        const aEngagement = a.views + a.likes + a.replies
        const bEngagement = b.views + b.likes + b.replies
        return bEngagement - aEngagement
      })
      .slice(0, 5)
      .map(thread => ({
        thread_id: thread.thread_id,
        title: thread.title,
        metrics: {
          views: thread.views,
          likes: thread.likes,
          replies: thread.replies
        }
      }))

    return new Response(
      JSON.stringify({ metrics }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error fetching client metrics:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

// Helper Functions
function calculatePercentChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  const change = ((current - previous) / previous) * 100
  return Math.round(change * 10) / 10 // Round to 1 decimal place
}

function getEmptyMetrics(): ClientMetrics {
  return {
    totalThreads: 0,
    totalTweets: 0,
    totalViews: 0,
    totalLikes: 0,
    totalReplies: 0,
    totalRetweets: 0,
    totalQuotes: 0,
    repackagedCount: 0,
    percentRepackaged: 0,
    periodComparison: {
      views: { current: 0, previous: 0, change: 0, positive: true },
      likes: { current: 0, previous: 0, change: 0, positive: true },
      replies: { current: 0, previous: 0, change: 0, positive: true }
    },
    threadsByDate: {},
    top5Threads: []
  }
} 