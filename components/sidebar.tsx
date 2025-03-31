import { Twitter, TrendingUp, Settings, Search, Home, Users, LogOut, CreditCard } from 'lucide-react';
import { useState, useEffect } from 'react';
import useOrganization from '@/hooks/useOrganization';
import useClients from '@/hooks/useClients';
import type { Client } from '@/types/client';
import { supabase } from '@/lib/supabase';
import { UserService } from '@/lib/user-service';
import { useUser } from '@/hooks/useUser';
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Icons } from '@/components/icons'
import type { Organization } from '@/types'

interface SidebarProps {
  organization: Organization | null
  selectedClientId?: string
  onClientSelect: (clientId: string) => void
}

export function Sidebar({ organization, selectedClientId, onClientSelect }: SidebarProps) {
  const pathname = usePathname()
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useUser();
  
  // Get organization
  const { organizationId, loading: orgLoading } = useOrganization();
  
  // Get clients for this organization
  const { clients, loading: clientsLoading } = useClients(organizationId);

  // Filter clients based on search query
  const filteredClients = clients.filter(client => {
    const searchString = clientSearchQuery.toLowerCase().trim();
    if (!searchString) return true;
    
    return (
      client.name?.toLowerCase().includes(searchString) ||
      client.twitter_username?.toLowerCase().includes(searchString) ||
      client.client_id.toLowerCase().includes(searchString)
    );
  });

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.from("organizations").select("*");

        if (error) throw error;

        setOrganizations(data || []);

        // Set the selected organization based on the user's organization ID
        const userOrgId = organizationId;
        if (data?.some(org => org.id === userOrgId)) {
          setSelectedOrgId(userOrgId);
        } else if (data?.length > 0) {
          setSelectedOrgId(data[0].id);
        }
      } catch (err) {
        console.error("Error fetching organizations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizations();
  }, []);

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} border-r border-[#38444d] h-screen flex flex-col bg-[#192734] transition-all duration-300`}>
      {/* Logo and brand */}
      <div className="p-4 border-b border-[#38444d]">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-[#1d9bf0] rounded-full flex items-center justify-center mr-3">
            <Twitter className="h-6 w-6 text-white" />
          </div>
          {!isCollapsed && <span className="font-bold text-xl">TweetManager</span>}
        </div>
      </div>

      {/* Main sidebar content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Organization Name */}
        {organization && !isCollapsed && (
          <div className="px-4 py-3 border-b border-[#38444d]">
            <h3 className="text-[#8899a6] text-xs uppercase font-semibold tracking-wider mb-1">
              ORGANIZATION
            </h3>
            <div className="font-medium">
              {organization.name || 'Your Organization'}
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <div className="px-4 py-3">
          {!isCollapsed && (
            <h3 className="text-[#8899a6] text-xs uppercase font-semibold tracking-wider mb-2">
              NAVIGATION
            </h3>
          )}
          <div className="space-y-1">
            <Link 
              href="/"
              className="flex items-center px-3 py-2 text-white hover:bg-[#253341] rounded-md transition-colors"
            >
              <Home className="h-4 w-4 mr-3 text-[#1d9bf0]" />
              {!isCollapsed && <span>Dashboard</span>}
            </Link>
            {/* <Link 
              href="/billing"
              className="flex items-center px-3 py-2 text-white hover:bg-[#253341] rounded-md transition-colors"
            >
              <CreditCard className="h-4 w-4 mr-3 text-[#1d9bf0]" />
              {!isCollapsed && <span>Billing</span>}
            </Link> */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar; 