import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: Request,
  { params }: { params: { clientId: string } }
) {
  try {
    // Make sure to await params or access it directly
    const clientId = params.clientId;
    
    if (!clientId) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      );
    }

    // First fetch all threads for this client
    const { data: threads, error: threadsError } = await supabase
      .from('threads')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (threadsError) {
      console.error('Error fetching threads:', threadsError);
      return NextResponse.json(
        { error: `Error fetching threads: ${threadsError.message}` },
        { status: 500 }
      );
    }

    if (!threads || threads.length === 0) {
      return NextResponse.json({
        total_views: 0,
        total_likes: 0,
        total_replies: 0,
        total_retweets: 0,
        total_quotes: 0,
        total_impressions: 0,
        engagement_rate: 0,
        weekly_growth: []
      });
    }

    // Get all thread_ids
    const threadIds = threads.map(thread => thread.thread_id);

    // Now fetch all tweets for these threads in a separate query
    const { data: tweets, error: tweetsError } = await supabase
      .from('tweets')
      .select('*')
      .in('thread_id', threadIds);

    if (tweetsError) {
      console.error('Error fetching tweets:', tweetsError);
      return NextResponse.json(
        { error: `Error fetching tweets: ${tweetsError.message}` },
        { status: 500 }
      );
    }

    // Group tweets by thread_id for easier processing
    const tweetsByThread = {};
    tweets?.forEach(tweet => {
      if (!tweetsByThread[tweet.thread_id]) {
        tweetsByThread[tweet.thread_id] = [];
      }
      tweetsByThread[tweet.thread_id].push(tweet);
    });

    // Attach tweets to their threads
    const threadsWithTweets = threads.map(thread => ({
      ...thread,
      tweets: tweetsByThread[thread.thread_id] || []
    }));

    // Calculate metrics
    const metrics = {
      total_views: 0,
      total_likes: 0,
      total_replies: 0,
      total_retweets: 0,
      total_quotes: 0,
      total_impressions: 0,
      engagement_rate: 0,
      weekly_growth: [],
    };

    // Process threads and calculate metrics
    threadsWithTweets.forEach(thread => {
      thread.tweets?.forEach(tweet => {
        metrics.total_views += parseInt(tweet.view_count || '0', 10);
        metrics.total_likes += parseInt(tweet.like_count || '0', 10);
        metrics.total_replies += parseInt(tweet.reply_count || '0', 10);
        metrics.total_retweets += parseInt(tweet.retweet_count || '0', 10);
        metrics.total_quotes += parseInt(tweet.quote_count || '0', 10);
        metrics.total_impressions += parseInt(tweet.impression_count || '0', 10);
      });
    });

    // Calculate engagement rate
    metrics.engagement_rate = metrics.total_views > 0
      ? ((metrics.total_likes + metrics.total_replies + metrics.total_retweets + metrics.total_quotes) / metrics.total_views) * 100
      : 0;

    // Calculate weekly metrics
    const weeklyData = new Map();
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Initialize last 12 weeks
    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date(startOfToday);
      weekStart.setDate(weekStart.getDate() - (i * 7));
      const weekKey = weekStart.toISOString().split('T')[0];
      weeklyData.set(weekKey, {
        weekStart: weekKey,
        views: 0,
        likes: 0,
        replies: 0,
        retweets: 0,
        quotes: 0,
        threadCount: 0,
        engagement: 0
      });
    }

    // Process threads into weekly data
    threadsWithTweets.forEach(thread => {
      if (!thread.tweets?.length) return;
      
      const firstTweet = thread.tweets[0];
      const tweetDate = new Date(firstTweet.date_posted || firstTweet.created_at);
      const weekStart = new Date(tweetDate);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (weeklyData.has(weekKey)) {
        const weekData = weeklyData.get(weekKey);
        weekData.threadCount++;
        
        thread.tweets.forEach(tweet => {
          weekData.views += parseInt(tweet.view_count || '0', 10);
          weekData.likes += parseInt(tweet.like_count || '0', 10);
          weekData.replies += parseInt(tweet.reply_count || '0', 10);
          weekData.retweets += parseInt(tweet.retweet_count || '0', 10);
          weekData.quotes += parseInt(tweet.quote_count || '0', 10);
        });
        
        weekData.engagement = weekData.views > 0
          ? ((weekData.likes + weekData.replies + weekData.retweets + weekData.quotes) / weekData.views) * 100
          : 0;
      }
    });

    metrics.weekly_growth = Array.from(weeklyData.values())
      .sort((a, b) => new Date(a.weekStart).getTime() - new Date(b.weekStart).getTime());

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error fetching client metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch client metrics', details: String(error) },
      { status: 500 }
    );
  }
} 