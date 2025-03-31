import { Twitter, TrendingUp, Settings, Search, Home, Users, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import useOrganization from '@/hooks/useOrganization';
import useClients from '@/hooks/useClients';
import type { Client } from '@/types/client';
import { supabase } from '@/lib/supabase';
import { UserService } from '@/lib/user-service';
import { useUser } from '@/hooks/useUser';

interface SidebarProps {
  onClientSelect: (client: Client) => void;
  selectedClientId?: string;
}

interface Organization {
  id: string;
  name: string;
  // Add other fields as necessary
}

export function Sidebar({ onClientSelect, selectedClientId }: SidebarProps) {
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const { user } = useUser();
  
  // Get organization
  const { organization, organizationId, loading: orgLoading } = useOrganization();
  
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
    <div className="w-64 border-r border-[#38444d] h-screen flex flex-col bg-[#192734]">
      {/* Logo and brand */}
      <div className="p-4 border-b border-[#38444d]">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-[#1d9bf0] rounded-full flex items-center justify-center mr-3">
            <Twitter className="h-6 w-6 text-white" />
          </div>
          <span className="font-bold text-xl">TweetManager</span>
        </div>
      </div>

      {/* Main sidebar content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Organization Name */}
        {organization && (
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
          <h3 className="text-[#8899a6] text-xs uppercase font-semibold tracking-wider mb-2">
            NAVIGATION
          </h3>
          <div className="space-y-1">
            <a 
              href="/"
              className="flex items-center px-3 py-2 text-white hover:bg-[#253341] rounded-md transition-colors"
            >
              <Home className="h-4 w-4 mr-3 text-[#1d9bf0]" />
              Dashboard
            </a>
            {/* <a 
              href="/analytics"
              className="flex items-center px-3 py-2 text-white hover:bg-[#253341] rounded-md transition-colors"
            >
              <TrendingUp className="h-4 w-4 mr-3 text-[#1d9bf0]" />
              Analytics
            </a> */}
            {/* <a 
              href="/admin"
              className="flex items-center px-3 py-2 text-white hover:bg-[#253341] rounded-md transition-colors"
            >
              <Settings className="h-4 w-4 mr-3 text-[#1d9bf0]" />
              Admin
            </a> */}
          </div>
        </div>

        {/* Clients List with search */}
        <div className="px-4 py-3 flex-1 overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-[#8899a6] text-xs uppercase font-semibold tracking-wider">
              CLIENTS
            </h3>
            <span className="text-xs text-[#8899a6]">
              {filteredClients.length}/{clients.length}
            </span>
          </div>
          
          {/* Client search */}
          <div className="relative mb-3">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-3 w-3 text-[#8899a6]" />
            </div>
            <input
              type="text"
              value={clientSearchQuery}
              onChange={(e) => setClientSearchQuery(e.target.value)}
              placeholder="Search clients..."
              className="w-full bg-[#253341] text-sm text-white rounded-md pl-8 pr-4 py-1.5 border border-[#38444d] focus:border-[#1d9bf0] focus:outline-none"
            />
          </div>
          
          {/* Clients list */}
          <div className="overflow-y-auto flex-1 -mx-1 px-1">
            {(orgLoading || clientsLoading) ? (
              <div className="text-[#8899a6] py-4 text-sm flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-[#1d9bf0] border-r-2 border-[#1d9bf0] border-b-2 border-transparent mr-2"></div>
                Loading...
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="text-[#8899a6] py-4 text-sm text-center">
                {clients.length === 0 ? 'No clients found.' : 'No matching clients.'}
              </div>
            ) : (
              <div className="space-y-1">
                {filteredClients.map(client => (
                  <div 
                    key={client.client_id}
                    onClick={() => onClientSelect(client)}
                    className={`flex items-center px-3 py-2 rounded-md cursor-pointer transition-colors ${
                      selectedClientId === client.client_id 
                        ? 'bg-[#1d9bf0]/10 text-[#1d9bf0] border-l-2 border-[#1d9bf0]' 
                        : 'text-white hover:bg-[#253341] border-l-2 border-transparent'
                    }`}
                  >
                    {client.profile_photo_url ? (
                      <div className="w-7 h-7 rounded-full overflow-hidden mr-3 border border-[#38444d]">
                        <img 
                          src={client.profile_photo_url}
                          alt={client.name || "Client profile"}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-7 h-7 bg-gradient-to-br from-[#1a8cd8] to-[#1d9bf0] rounded-full flex items-center justify-center text-white text-xs mr-3">
                        {(client.name || client.twitter_username || 'C').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {client.name || client.twitter_username || client.client_id}
                      </div>
                      {client.twitter_username && (
                        <div className="text-xs text-[#8899a6] truncate">
                          @{client.twitter_username}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User account section */}
      <div className="p-4 border-t border-[#38444d]">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full overflow-hidden mr-3 border border-[#38444d] flex-shrink-0">
              <img 
                src="/sei.png"
                alt="User avatar"
                className="w-full h-full object-contain bg-white"
              />
            </div>
            <div>
              <div className="font-medium">{user?.first_name || 'User'}</div>
              <div className="text-[#8899a6] text-xs">{user?.email || 'No email'}</div>
            </div>
          </div>
          <button className="text-[#8899a6] hover:text-white p-1 rounded-md hover:bg-[#253341]">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Sidebar; 