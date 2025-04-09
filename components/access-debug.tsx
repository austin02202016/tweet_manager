import { useState } from 'react';
import { useUser } from '@/hooks/useUser';
import { useClients } from '@/hooks/useClients';
import { AlertCircle, Users, Lock, User, ChevronDown, ChevronUp } from 'lucide-react';

export function AccessDebugInfo() {
  const [expanded, setExpanded] = useState(false);
  const { user } = useUser();
  const { clients } = useClients(user?.organization_id || null);

  if (!user) return null;

  return (
    <div className="fixed bottom-0 right-0 mb-4 mr-4 z-50">
      <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden max-w-md">
        <div 
          className="px-4 py-3 cursor-pointer flex items-center justify-between bg-gray-700"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center text-white">
            <Lock className="w-4 h-4 mr-2" />
            <span className="font-medium">Access Control Debug</span>
          </div>
          {expanded ? (
            <ChevronDown className="w-4 h-4 text-white" />
          ) : (
            <ChevronUp className="w-4 h-4 text-white" />
          )}
        </div>
        
        {expanded && (
          <div className="p-4 text-white text-sm">
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <User className="w-4 h-4 mr-2 text-blue-400" />
                <span className="font-medium">User Information</span>
              </div>
              <div className="ml-6 space-y-1">
                <div><span className="text-gray-400">ID:</span> {user.id}</div>
                <div><span className="text-gray-400">Email:</span> {user.email}</div>
                <div>
                  <span className="text-gray-400">Role:</span> 
                  <span className={`ml-1 px-1.5 py-0.5 rounded text-[10px] uppercase ${
                    user.role === 'agency_admin' 
                      ? 'bg-green-600' 
                      : 'bg-blue-600'
                  }`}>
                    {user.role}
                  </span>
                </div>
                <div><span className="text-gray-400">Organization:</span> {user.organization_id}</div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center mb-2">
                <Users className="w-4 h-4 mr-2 text-blue-400" />
                <span className="font-medium">Client Access ({clients.length})</span>
              </div>
              <div className="ml-6 space-y-2">
                {clients.length === 0 ? (
                  <div className="text-gray-400 italic">No clients accessible</div>
                ) : (
                  <div className="max-h-40 overflow-y-auto pr-2">
                    {clients.map(client => (
                      <div key={client.client_id} className="flex items-start py-1 border-b border-gray-700">
                        <div className="w-6 h-6 flex-shrink-0 bg-gray-600 rounded-full flex items-center justify-center mr-2 text-xs">
                          {client.name?.[0] || 'C'}
                        </div>
                        <div>
                          <div>{client.name}</div>
                          <div className="text-xs text-gray-400">
                            {client.client_id}
                            {client.user_id === user.id && (
                              <span className="ml-2 bg-blue-600 px-1 rounded text-[10px]">ASSIGNED</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-4 bg-gray-700 p-2 rounded flex items-start">
              <AlertCircle className="w-4 h-4 text-yellow-400 mr-2 flex-shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-medium block mb-1">Access Control:</span>
                <ul className="list-disc ml-4 space-y-1 text-gray-300">
                  <li>Agency admins can access all clients in their organization</li>
                  <li>Agency users can only access clients assigned to them</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AccessDebugInfo; 