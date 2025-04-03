import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface Report {
  id: number;
  client_id: string;
  report_date_range: string;
  actionables: string | null;
  highest_performing_content: string | null;
  observations: string | null;
  created_at: string;
  platform: string | null;
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
        const { data, error } = await supabase
          .from('reports')
          .select('*')
          .eq('client_id', clientId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setReports(data || []);
      } catch (err) {
        console.error('Error fetching reports:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch reports'));
      } finally {
        setLoading(false);
      }
    }

    fetchReports();
  }, [clientId]);

  return { reports, loading, error };
} 