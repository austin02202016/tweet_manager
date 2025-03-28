import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Organization } from '@/types/client';

// In a real app, you'd get the org ID from auth context
// For demo purposes, we'll use a hard-coded org ID or allow it to be passed in
export const useOrganization = (orgId?: string) => {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // For demo purposes - in a real app this would come from auth
  const defaultOrgId = 'f2b9fd95-2607-4232-8119-ae56401b3bad';
  const organizationId = orgId || defaultOrgId;

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', organizationId)
          .single();

        if (error) {
          throw error;
        }

        setOrganization(data || null);
      } catch (err: any) {
        console.error('Error fetching organization:', err);
        setError(err.message || 'Failed to fetch organization');
      } finally {
        setLoading(false);
      }
    };

    fetchOrganization();
  }, [organizationId]);

  return { organization, organizationId, loading, error };
};

export default useOrganization; 