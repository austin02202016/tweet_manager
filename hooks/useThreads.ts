import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Thread, Tweet } from '@/types/thread';

export const useThreads = (clientId: string | null) => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchThreads = async () => {
      if (!clientId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // First, fetch all threads for this client
        const { data: threadsData, error: threadsError } = await supabase
          .from('threads')
          .select('*')
          .eq('client_id', clientId);

        if (threadsError) {
          throw threadsError;
        }

        if (!threadsData || threadsData.length === 0) {
          setThreads([]);
          return;
        }

        // For each thread, fetch its tweets
        const threadIds = threadsData.map(thread => thread.thread_id);
        const { data: tweetsData, error: tweetsError } = await supabase
          .from('tweets')
          .select('*')
          .in('thread_id', threadIds);

        if (tweetsError) {
          throw tweetsError;
        }

        // Group tweets by thread_id
        const tweetsByThread: Record<string, Tweet[]> = {};
        tweetsData?.forEach((tweet) => {
          if (!tweetsByThread[tweet.thread_id]) {
            tweetsByThread[tweet.thread_id] = [];
          }
          tweetsByThread[tweet.thread_id].push(tweet);
        });

        // Combine threads with their tweets
        const threadsWithTweets = threadsData.map(thread => {
          const tweets = tweetsByThread[thread.thread_id] || [];
          
          // Get the first tweet's metrics
          const firstTweet = tweets[0] || {};
          
          // Use the first tweet's text as the thread title if not set
          const threadTitle = thread.title || 
            (firstTweet.text ? firstTweet.text.split('\n')[0] : 'Untitled Thread');
          
          return {
            ...thread,
            title: threadTitle,
            likes: firstTweet.like_count || 0,
            replies: firstTweet.reply_count || 0,
            views: firstTweet.view_count || 0,
            date: firstTweet.date_posted || thread.created_at,
            tweets
          };
        });

        setThreads(threadsWithTweets);
      } catch (err: any) {
        console.error('Error fetching threads:', err);
        setError(err.message || 'Failed to fetch threads');
      } finally {
        setLoading(false);
      }
    };

    fetchThreads();
  }, [clientId]);

  return { threads, loading, error };
};

export default useThreads; 