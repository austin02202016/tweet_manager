import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface Report {
  id: string;
  organization_id: string;
  title: string;
  date_range: string;
  summary: string;
  date: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export function useReports(organizationId: string | null) {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchReports() {
      if (!organizationId) {
        console.debug('No organization ID provided, skipping reports fetch');
        setReports([]);
        setLoading(false);
        return;
      }

      try {
        console.debug('Fetching reports for organization:', organizationId);
        setLoading(true);
        
        // First check if we have a valid session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error('Session error:', sessionError);
          throw sessionError;
        }
        if (!session) {
          console.error('No active session found');
          throw new Error('No active session');
        }

        const { data, error } = await supabase
          .from('reports')
          .select('*')
          .eq('organization_id', organizationId)
          .order('date', { ascending: false })
          .limit(5);

        if (error) {
          console.error('Supabase query error:', error);
          throw error;
        }

        console.debug('Successfully fetched reports:', data?.length || 0);
        setReports(data || []);
      } catch (err) {
        console.error('Error in useReports:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch reports'));
      } finally {
        setLoading(false);
      }
    }

    fetchReports();
  }, [organizationId]);

  return { reports, loading, error };
} 