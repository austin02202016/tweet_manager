"use client"

import { useState, useEffect } from "react"
import { PlusCircle, Check, X, ChevronRight, Edit, Trash, Loader2, Database } from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { Organization, Client } from "@/types/client"

export default function AdminPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)
  const [seedingSuccess, setSeedingSuccess] = useState<boolean | null>(null)
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null)
  const [newOrgName, setNewOrgName] = useState("")
  const [showNewOrgForm, setShowNewOrgForm] = useState(false)
  const [showNewClientForm, setShowNewClientForm] = useState(false)
  const [newClient, setNewClient] = useState({
    name: "",
    twitter_username: "",
    profile_picture_url: "",
  })

  // Fetch all organizations
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase.from("organizations").select("*")
        
        if (error) throw error
        
        setOrganizations(data || [])
        
        // If org_id is preselected, use it
        
        setSelectedOrgId(data[0].id)
   
      } catch (err) {
        console.error("Error fetching organizations:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchOrganizations()
  }, [])

  // Fetch clients for selected organization
  useEffect(() => {
    const fetchClients = async () => {
      if (!selectedOrgId) return

      try {
        setLoading(true)
        const { data, error } = await supabase
          .from("clients")
          .select("*")
          .eq("organization_id", selectedOrgId)
        
        if (error) throw error
        
        setClients(data || [])
      } catch (err) {
        console.error("Error fetching clients:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchClients()
  }, [selectedOrgId])

  // Create a new organization
  const handleCreateOrg = async () => {
    if (!newOrgName.trim()) return

    try {
      const { data, error } = await supabase
        .from("organizations")
        .insert([{ name: newOrgName }])
        .select()
      
      if (error) throw error
      
      setOrganizations([...organizations, data[0]])
      setSelectedOrgId(data[0].id)
      setNewOrgName("")
      setShowNewOrgForm(false)
    } catch (err) {
      console.error("Error creating organization:", err)
    }
  }

  // Create a new client
  const handleCreateClient = async () => {
    if (!selectedOrgId || !newClient.name.trim()) return

    try {
      const { data, error } = await supabase
        .from("clients")
        .insert([{
          name: newClient.name,
          twitter_username: newClient.twitter_username,
          profile_picture_url: newClient.profile_picture_url,
          organization_id: selectedOrgId
        }])
        .select()
      
      if (error) throw error
      
      setClients([...clients, data[0]])
      setNewClient({ name: "", twitter_username: "", profile_picture_url: "" })
      setShowNewClientForm(false)
    } catch (err) {
      console.error("Error creating client:", err)
    }
  }

  // Delete a client
  const handleDeleteClient = async (clientId: string) => {
    if (!confirm("Are you sure you want to delete this client?")) return

    try {
      const { error } = await supabase
        .from("clients")
        .delete()
        .eq("client_id", clientId)
      
      if (error) throw error
      
      setClients(clients.filter(client => client.client_id !== clientId))
    } catch (err) {
      console.error("Error deleting client:", err)
    }
  }

  // Seed the database with sample data
  const seedDatabase = async () => {
    setSeeding(true)
    setSeedingSuccess(null)
    
    try {
      const response = await fetch('/api/seed')
      const data = await response.json()
      
      if (response.ok) {
        setSeedingSuccess(true)
        // Refresh the data
        window.location.reload()
      } else {
        setSeedingSuccess(false)
        console.error('Error seeding database:', data)
      }
    } catch (err) {
      setSeedingSuccess(false)
      console.error('Error seeding database:', err)
    } finally {
      setSeeding(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#15202b] text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="flex justify-between items-center mb-8">
        <a 
          href="/"
          className="text-[#1d9bf0] hover:underline"
        >
          ← Back to Dashboard
        </a>
        
        <button
          onClick={seedDatabase}
          disabled={seeding}
          className={`flex items-center gap-2 px-4 py-2 rounded-md ${
            seeding ? 'bg-[#38444d] cursor-not-allowed' : 'bg-[#1d9bf0] hover:bg-[#1a87d0]'
          }`}
        >
          {seeding ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Database className="w-4 h-4" />
          )}
          Seed Database with Sample Data
        </button>
      </div>
      
      {seedingSuccess === true && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-md text-green-400">
          Database seeded successfully! The page will refresh.
        </div>
      )}
      
      {seedingSuccess === false && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-md text-red-400">
          Failed to seed database. Check console for details.
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Organizations Panel */}
        <div className="bg-[#192734] rounded-lg border border-[#38444d] p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Organizations</h2>
            <button 
              onClick={() => setShowNewOrgForm(!showNewOrgForm)}
              className="text-[#1d9bf0] hover:text-white"
            >
              <PlusCircle className="w-5 h-5" />
            </button>
          </div>
          
          {/* New Organization Form */}
          {showNewOrgForm && (
            <div className="mb-4 p-3 bg-[#22303c] rounded-md">
              <input 
                type="text" 
                value={newOrgName}
                onChange={e => setNewOrgName(e.target.value)}
                placeholder="Organization name" 
                className="w-full bg-[#15202b] rounded p-2 mb-2 text-white border border-[#38444d]"
              />
              <div className="flex justify-end space-x-2">
                <button 
                  onClick={() => setShowNewOrgForm(false)}
                  className="p-1 text-[#8899a6] hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
                <button 
                  onClick={handleCreateOrg}
                  className="p-1 text-[#1d9bf0] hover:text-white"
                >
                  <Check className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
          
          {/* Organizations List */}
          <div className="space-y-2">
            {loading && organizations.length === 0 ? (
              <div className="text-[#8899a6]">Loading organizations...</div>
            ) : organizations.length === 0 ? (
              <div className="text-[#8899a6]">No organizations found.</div>
            ) : (
              organizations.map(org => (
                <div 
                  key={org.id}
                  onClick={() => setSelectedOrgId(org.id)}
                  className={`flex items-center justify-between p-3 rounded-md cursor-pointer ${
                    selectedOrgId === org.id ? 'bg-[#22303c] text-[#1d9bf0]' : 'hover:bg-[#22303c]'
                  }`}
                >
                  <div className="flex items-center">
                    <span className="text-sm">{org.name || org.id}</span>
                  </div>
                  {selectedOrgId === org.id && (
                    <ChevronRight className="w-4 h-4 text-[#1d9bf0]" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Clients Panel */}
        <div className="bg-[#192734] rounded-lg border border-[#38444d] p-6 md:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">
              {selectedOrgId ? 
                `Clients ${organizations.find(org => org.id === selectedOrgId)?.name ? `for ${organizations.find(org => org.id === selectedOrgId)?.name}` : ''}` : 
                'Select an organization'}
            </h2>
            {selectedOrgId && (
              <button 
                onClick={() => setShowNewClientForm(!showNewClientForm)}
                className="text-[#1d9bf0] hover:text-white"
              >
                <PlusCircle className="w-5 h-5" />
              </button>
            )}
          </div>
          
          {/* New Client Form */}
          {showNewClientForm && (
            <div className="mb-4 p-4 bg-[#22303c] rounded-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-[#8899a6] text-sm mb-1">Name</label>
                  <input 
                    type="text" 
                    value={newClient.name}
                    onChange={e => setNewClient({...newClient, name: e.target.value})}
                    placeholder="Client name" 
                    className="w-full bg-[#15202b] rounded p-2 text-white border border-[#38444d]"
                  />
                </div>
                <div>
                  <label className="block text-[#8899a6] text-sm mb-1">Twitter Username</label>
                  <input 
                    type="text" 
                    value={newClient.twitter_username}
                    onChange={e => setNewClient({...newClient, twitter_username: e.target.value})}
                    placeholder="@username" 
                    className="w-full bg-[#15202b] rounded p-2 text-white border border-[#38444d]"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[#8899a6] text-sm mb-1">Profile Picture URL</label>
                  <input 
                    type="text" 
                    value={newClient.profile_picture_url}
                    onChange={e => setNewClient({...newClient, profile_picture_url: e.target.value})}
                    placeholder="https://example.com/image.jpg" 
                    className="w-full bg-[#15202b] rounded p-2 text-white border border-[#38444d]"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <button 
                  onClick={() => setShowNewClientForm(false)}
                  className="p-1 text-[#8899a6] hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
                <button 
                  onClick={handleCreateClient}
                  className="p-1 text-[#1d9bf0] hover:text-white"
                >
                  <Check className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
          
          {/* Clients List */}
          {!selectedOrgId ? (
            <div className="text-[#8899a6] p-4 text-center">Select an organization to view its clients</div>
          ) : loading ? (
            <div className="text-[#8899a6] p-4 text-center">Loading clients...</div>
          ) : clients.length === 0 ? (
            <div className="text-[#8899a6] p-4 text-center">No clients found for this organization.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="text-left border-b border-[#38444d]">
                    <th className="p-3 text-[#8899a6] font-medium">Name</th>
                    <th className="p-3 text-[#8899a6] font-medium">Twitter</th>
                    <th className="p-3 text-[#8899a6] font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map(client => (
                    <tr key={client.client_id} className="border-b border-[#38444d]">
                      <td className="p-3">
                        <div className="flex items-center">
                          {client.profile_picture_url ? (
                            <div className="w-8 h-8 rounded-full overflow-hidden mr-3">
                              <img 
                                src={client.profile_picture_url} 
                                alt={client.name} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-8 h-8 bg-[#38444d] rounded-full flex items-center justify-center mr-3">
                              {client.name?.charAt(0).toUpperCase() || '?'}
                            </div>
                          )}
                          <span>{client.name || 'Unnamed Client'}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        {client.twitter_username ? (
                          <span className="text-[#1d9bf0]">@{client.twitter_username}</span>
                        ) : (
                          <span className="text-[#8899a6]">—</span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleDeleteClient(client.client_id)}
                            className="text-[#8899a6] hover:text-red-500"
                            title="Delete Client"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                          <a 
                            href={`/?client=${client.client_id}`}
                            className="text-[#8899a6] hover:text-[#1d9bf0]"
                            title="View Dashboard"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 