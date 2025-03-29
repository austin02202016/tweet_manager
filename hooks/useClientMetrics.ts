import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface WeeklyGrowth {
  weekStart: string;
  views: number;
  likes: number;
  replies: number;
  retweets: number;
  quotes: number;
  threadCount: number;
  engagement: number;
}

interface ThreadMetric {
  id: string;
  title: string;
  views: number;
  likes: number;
  replies: number;
  engagement: number;
}

interface Metrics {
  totalViews: number;
  totalLikes: number;
  totalReplies: number;
  totalRetweets: number;
  totalQuotes: number;
  totalImpressions: number;
  engagement_rate: number;
  weekly_growth: WeeklyGrowth[];
  threadCount: number;
  topThreads: ThreadMetric[];
  periodComparison: {
    views: { change: number; positive: boolean; },
    likes: { change: number; positive: boolean; },
    replies: { change: number; positive: boolean; },
  };
}

export default function useClientMetrics(clientId: string | null) {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClientMetrics = async () => {
      if (!clientId) {
        setMetrics(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // First fetch all threads for this client
        const { data: threads, error: threadsError } = await supabase
          .from('threads')
          .select('*')
          .eq('client_id', clientId)
          .order('created_at', { ascending: false });

        if (threadsError) {
          throw new Error(`Error fetching threads: ${threadsError.message}`);
        }

        if (!threads || threads.length === 0) {
          setMetrics({
            totalViews: 0,
            totalLikes: 0,
            totalReplies: 0,
            totalRetweets: 0,
            totalQuotes: 0,
            totalImpressions: 0,
            engagement_rate: 0,
            weekly_growth: [],
            threadCount: 0,
            topThreads: [],
            periodComparison: {
              views: { change: 0, positive: true },
              likes: { change: 0, positive: true },
              replies: { change: 0, positive: true },
            }
          });
          setLoading(false);
          return;
        }

        // Get all thread_ids
        const threadIds = threads.map(thread => thread.thread_id);

        // Now fetch all tweets for these threads
        const { data: tweets, error: tweetsError } = await supabase
          .from('tweets')
          .select('*')
          .in('thread_id', threadIds);

        if (tweetsError) {
          throw new Error(`Error fetching tweets: ${tweetsError.message}`);
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
        const calculatedMetrics = {
          totalViews: 0,
          totalLikes: 0,
          totalReplies: 0,
          totalRetweets: 0,
          totalQuotes: 0,
          totalImpressions: 0,
          engagement_rate: 0,
          weekly_growth: [],
          threadCount: threads.length,
          topThreads: [],
          periodComparison: {
            views: { change: 0, positive: true },
            likes: { change: 0, positive: true },
            replies: { change: 0, positive: true },
          }
        };

        // Calculate per-thread metrics for top threads sorting
        const threadMetrics: ThreadMetric[] = [];

        // Process threads and calculate metrics
        threadsWithTweets.forEach(thread => {
          let threadViews = 0;
          let threadLikes = 0;
          let threadReplies = 0;
          let threadRetweets = 0;
          let threadQuotes = 0;
          
          thread.tweets?.forEach(tweet => {
            const views = parseInt(tweet.view_count || '0', 10);
            const likes = parseInt(tweet.like_count || '0', 10);
            const replies = parseInt(tweet.reply_count || '0', 10);
            const retweets = parseInt(tweet.retweet_count || '0', 10);
            const quotes = parseInt(tweet.quote_count || '0', 10);
            
            threadViews += views;
            threadLikes += likes;
            threadReplies += replies;
            threadRetweets += retweets;
            threadQuotes += quotes;
            
            calculatedMetrics.totalViews += views;
            calculatedMetrics.totalLikes += likes;
            calculatedMetrics.totalReplies += replies;
            calculatedMetrics.totalRetweets += retweets;
            calculatedMetrics.totalQuotes += quotes;
          });
          
          // Calculate engagement rate for this thread
          const threadEngagement = threadViews > 0 
            ? ((threadLikes + threadReplies) / threadViews) * 100 
            : 0;
            
          // Store thread metrics for sorting
          threadMetrics.push({
            id: thread.thread_id,
            title: thread.title || 'Untitled Thread',
            views: threadViews,
            likes: threadLikes,
            replies: threadReplies,
            engagement: threadEngagement
          });
        });

        // Sort threads by engagement rate and get top threads
        calculatedMetrics.topThreads = threadMetrics
          .sort((a, b) => b.engagement - a.engagement)
          .slice(0, 10);

        // Calculate engagement rate
        calculatedMetrics.engagement_rate = calculatedMetrics.totalViews > 0
          ? ((calculatedMetrics.totalLikes + calculatedMetrics.totalReplies + 
              calculatedMetrics.totalRetweets + calculatedMetrics.totalQuotes) / 
              calculatedMetrics.totalViews) * 100
          : 0;

        // Calculate weekly metrics
        const weeklyData = calculateWeeklyMetrics(threadsWithTweets);
        calculatedMetrics.weekly_growth = weeklyData;
        
        // Calculate period comparison (this week vs last week)
        if (weeklyData.length >= 2) {
          const currentWeek = weeklyData[weeklyData.length - 1];
          const previousWeek = weeklyData[weeklyData.length - 2];
          
          const calculateChange = (current, previous) => {
            if (previous === 0) return { change: 0, positive: true };
            const change = ((current - previous) / previous) * 100;
            return { 
              change: Math.abs(Math.round(change * 10) / 10),
              positive: change >= 0
            };
          };
          
          calculatedMetrics.periodComparison = {
            views: calculateChange(currentWeek.views, previousWeek.views),
            likes: calculateChange(currentWeek.likes, previousWeek.likes),
            replies: calculateChange(currentWeek.replies, previousWeek.replies)
          };
        }

        setMetrics(calculatedMetrics);
      } catch (err: any) {
        console.error('Error calculating client metrics:', err);
        setError(err.message || 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchClientMetrics();
  }, [clientId]);

  return { metrics, loading, error };
}

function calculateWeeklyMetrics(threadsWithTweets: any[]): WeeklyGrowth[] {
  const weeklyData = new Map<string, WeeklyGrowth>();
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Initialize dates for last 12 weeks with proper start dates (Mondays)
  for (let i = 11; i >= 0; i--) {
    const weekStart = new Date(startOfToday);
    weekStart.setDate(weekStart.getDate() - (weekStart.getDay() + 7 * i));
    
    // Format as ISO string date (YYYY-MM-DD)
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
    
    // Sort tweets by date to get the first tweet
    const sortedTweets = [...thread.tweets].sort((a, b) => {
      const dateA = new Date(a.date_posted || a.created_at);
      const dateB = new Date(b.date_posted || b.created_at);
      return dateA.getTime() - dateB.getTime();
    });
    
    const firstTweet = sortedTweets[0];
    const tweetDate = new Date(firstTweet.date_posted || firstTweet.created_at);
    
    // Get the Monday of the tweet's week
    const weekStart = new Date(tweetDate);
    weekStart.setDate(tweetDate.getDate() - tweetDate.getDay() + (tweetDate.getDay() === 0 ? -6 : 1));
    weekStart.setHours(0, 0, 0, 0);
    
    const weekKey = weekStart.toISOString().split('T')[0];
    
    // If this week exists in our data, update it
    // Otherwise create a new entry
    const weekData = weeklyData.get(weekKey) || {
      weekStart: weekKey,
      views: 0,
      likes: 0,
      replies: 0,
      retweets: 0,
      quotes: 0,
      threadCount: 0,
      engagement: 0
    };
    
    weekData.threadCount++;
    
    thread.tweets.forEach(tweet => {
      weekData.views += parseInt(tweet.view_count || '0', 10);
      weekData.likes += parseInt(tweet.like_count || '0', 10);
      weekData.replies += parseInt(tweet.reply_count || '0', 10);
      weekData.retweets += parseInt(tweet.retweet_count || '0', 10);
      weekData.quotes += parseInt(tweet.quote_count || '0', 10);
    });
    
    // Calculate engagement rate for this week
    const interactions = weekData.likes + weekData.replies + weekData.retweets + weekData.quotes;
    weekData.engagement = weekData.views > 0
      ? (interactions / weekData.views) * 100
      : 0;
      
    weeklyData.set(weekKey, weekData);
  });

  // Return sorted array of weekly data
  const sortedWeeklyData = Array.from(weeklyData.values())
    .sort((a, b) => new Date(a.weekStart).getTime() - new Date(b.weekStart).getTime());
    
  return sortedWeeklyData;
} 