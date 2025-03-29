import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Client } from '@/types/client';

export const useClients = (organizationId: string | null) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClients = async () => {
      if (!organizationId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('clients')
          .select('client_id, name, profile_photo_url, created_at, organization_id')
          .eq('organization_id', organizationId);

        if (error) {
          throw error;
        }

        setClients(data || []);
      } catch (err: any) {
        console.error('Error fetching clients:', err);
        setError(err.message || 'Failed to fetch clients');
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [organizationId]);

  return { clients, loading, error };
};

export default useClients; 