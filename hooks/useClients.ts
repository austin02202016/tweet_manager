import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Client } from '@/types/client';
import { useUser } from './useUser';

export const useClients = (organizationId: string | null) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();

  useEffect(() => {
    const fetchClients = async () => {
      if (!organizationId || !user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Different query based on user role
        if (user.role === 'agency_admin') {
          // Agency admins can see all clients in their organization
          const { data, error } = await supabase
            .from('clients')
            .select('*')
            .eq('organization_id', organizationId);

          if (error) throw error;
          setClients(data || []);
        } else if (user.role === 'agency_user') {
          // Agency users can only see clients assigned to them
          const { data, error } = await supabase
            .from('clients')
            .select('*')
            .eq('user_id', user.id);

          if (error) throw error;
          setClients(data || []);
        } else {
          // Default case - no clients
          setClients([]);
        }
      } catch (err: any) {
        console.error('Error fetching clients:', err);
        setError(err.message || 'Failed to fetch clients');
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [organizationId, user]);

  return { clients, loading, error };
};

export default useClients; 