import { supabase } from './supabase';
import type { User } from './user-service';
import type { Client } from '@/types/client';

/**
 * Check if a user has access to a specific client
 * @param user - Current user object
 * @param clientId - The client ID to check
 * @returns Boolean indicating if user has access
 */
export async function hasClientAccess(user: User | null, clientId: string): Promise<boolean> {
  if (!user || !clientId) return false;
  
  try {
    // For agency_admin, check if client is in their organization
    if (user.role === 'agency_admin') {
      const { data, error } = await supabase
        .from('clients')
        .select('client_id')
        .eq('client_id', clientId)
        .eq('organization_id', user.organization_id)
        .single();
      
      return !!data && !error;
    }
    
    // For agency_user, check if client is assigned to them
    if (user.role === 'agency_user') {
      const { data, error } = await supabase
        .from('clients')
        .select('client_id')
        .eq('client_id', clientId)
        .eq('user_id', user.id)
        .single();
      
      return !!data && !error;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking client access:', error);
    return false;
  }
}

/**
 * Filter a list of clients based on user access permissions
 * @param user - Current user object
 * @param allClients - All clients to filter
 * @returns Only the clients the user has access to
 */
export function filterClientsByAccess(user: User | null, allClients: Client[]): Client[] {
  if (!user || !allClients.length) return [];
  
  // Agency admin can access all clients in their organization
  if (user.role === 'agency_admin') {
    return allClients.filter(client => client.organization_id === user.organization_id);
  }
  
  // Agency user can only access clients assigned to them
  if (user.role === 'agency_user') {
    return allClients.filter(client => client.user_id === user.id);
  }
  
  return [];
} 