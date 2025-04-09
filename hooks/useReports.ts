import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface ReportMetrics {
  posts_pct: number;
  engagements: number;
  impressions: number;
  audience_growth: number;
  engagements_pct: number;
  impressions_pct: number;
  posts_published: number;
  audience_growth_pct: number;
}

export interface ReportOverview {
  content_mix: string;
  new_content: string;
  live_content: string;
  creative_updates: string;
  platform_specific_content: string;
  platform_specific_initiatives: string;
}

export interface PlatformMetrics {
  new_followers: number;
  other_metrics: Record<string, any>;
  total_followers: number;
}

export interface PlatformBreakdown {
  [platform: string]: PlatformMetrics;
}

export interface ReportContent {
  month: string;
  metrics: ReportMetrics;
  overview: ReportOverview;
  user_name: string;
  next_steps: string[];
  next_call_date: string;
  client_first_name: string;
  platform_breakdown: PlatformBreakdown;
}

export interface Report {
  id: number;
  client_id: string;
  report_date_range: string;
  actionables: string | null;
  highest_performing_content: string | null;
  observations: string | null;
  platform: string | null;
  content: ReportContent | null;
  month: string | null;
  first_name: string | null;
}

export function useReports(clientId: string | null) {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchReports() {
      if (!clientId) {
        setReports([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from('reports')
          .select('*')
          .eq('client_id', clientId)
          .order('id', { ascending: false });

        // If there's a database error, throw it
        if (error) throw error;
        
        // Set reports data (empty array is fine)
        setReports(data || []);
      } catch (err) {
        // Skip logging for empty objects
        if (err && typeof err === 'object' && Object.keys(err).length === 0) {
          // Silent handling for empty object errors
          setReports([]);
        } else {
          // Only log real errors
          console.error('Error fetching reports:', err);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchReports();
  }, [clientId]);

  return { reports, loading, error };
} 