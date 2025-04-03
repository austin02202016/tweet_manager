import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Organization } from '@/types/client';

export const useOrganization = (orgId?: string) => {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Get organization_id from parameter or from localStorage if available
  let storedOrgId: string | null = null;
  if (typeof window !== 'undefined') {
    storedOrgId = localStorage.getItem('organizationId');
  }
  const organizationId = orgId || storedOrgId;

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!organizationId) {
          throw new Error('No organization ID provided.');
        }
        console.log("Organization ID:", organizationId)
        const { data, error } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', organizationId)
          .single();

        if (error) {
          console.error('Error fetching organization:', error);
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

    if (organizationId) {
      fetchOrganization();
    }
  }, [organizationId]);

  return { organization, organizationId, loading, error };
};

export default useOrganization;
