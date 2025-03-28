import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface PeriodComparison {
  current: number;
  previous: number;
  change: number;
  positive: boolean;
}

export interface ClientMetrics {
  totalThreads: number;
  totalTweets: number;
  totalViews: number;
  totalLikes: number;
  totalReplies: number;
  totalRetweets: number;
  totalQuotes: number;
  repackagedCount: number;
  percentRepackaged: number;
  periodComparison: {
    views: PeriodComparison;
    likes: PeriodComparison;
    replies: PeriodComparison;
  };
  threadsByDate: Record<string, number>;
  top5Threads: Array<{
    thread_id: string;
    title: string;
    metrics: { 
      views: number;
      likes: number;
      replies: number;
    };
  }>;
}

export const useClientMetrics = (clientId: string | null, periodDays: number = 7) => {
  const [metrics, setMetrics] = useState<ClientMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClientMetrics = async () => {
      if (!clientId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Call the Supabase Edge Function
        const { data, error } = await supabase.functions.invoke('get_client_metrics', {
          body: { 
            client_id: clientId,
            period_days: periodDays
          }
        });

        if (error) {
          throw new Error(error.message);
        }

        setMetrics(data.metrics);
      } catch (err: any) {
        console.error('Error fetching client metrics:', err);
        setError(err.message || 'Failed to fetch client metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchClientMetrics();
  }, [clientId, periodDays]);

  return { metrics, loading, error };
};

export default useClientMetrics; 