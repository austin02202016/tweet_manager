import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Client } from '@/types/client';

export const useClient = (clientId: string | null) => {
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClient = async () => {
      if (!clientId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .eq('client_id', clientId)
          .single();

        if (error) {
          throw error;
        }

        setClient(data || null);
      } catch (err: any) {
        console.error('Error fetching client:', err);
        setError(err.message || 'Failed to fetch client');
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [clientId]);

  return { client, loading, error };
};

export async function fetchUserData(clientId: string) {
  const { data, error } = await supabase
    .from('clients')
    .select('profile_photo_url, username')
    .eq('auth_user_id', clientId)
    .single();

  if (error) {
    console.error('Error fetching user data:', error);
    return null;
  }

  return data;
}

export default useClient; 