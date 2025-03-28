"use client"

import { useState, useEffect } from "react"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts"
import { Twitter, Linkedin, Instagram, TrendingUp, Users, ArrowLeft } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import useOrganization from "@/hooks/useOrganization"
import useClients from "@/hooks/useClients"
import useThreads from "@/hooks/useThreads"
import type { Client } from "@/types/client"
import { supabase } from "@/lib/supabase"

export default function AnalyticsPage() {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [selectedTab, setSelectedTab] = useState<'engagement' | 'growth' | 'platforms'>('engagement')
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month')
  
  // Get organization
  const { organizationId } = useOrganization()
  
  // Get clients
  const { clients, loading: clientsLoading } = useClients(organizationId)
  
  // Handle URL parameters for client selection
  useEffect(() => {
    const getClientFromUrl = async () => {
      // Check for client parameter in URL
      const params = new URLSearchParams(window.location.search)
      const clientId = params.get('client')
      
      if (clientId) {
        try {
          // Try to fetch the client directly
          const { data, error } = await supabase
            .from('clients')
            .select('*')
            .eq('client_id', clientId)
            .single()
            
          if (error) throw error
          
          if (data) {
            setSelectedClient(data)
            return
          }
        } catch (err) {
          console.error('Error fetching client from URL:', err)
        }
      }
      
      // If no client in URL or client not found, select first from list when available
      if (!selectedClient && clients?.length > 0) {
        setSelectedClient(clients[0])
      }
    }
    
    getClientFromUrl()
  }, [clients, selectedClient])
  
  // Fetch threads for the selected client
  const { threads, loading: threadsLoading } = useThreads(selectedClient?.client_id || null)

  // Handle client selection
  const handleClientSelect = (client: Client) => {
    setSelectedClient(client)
    
    // Update URL with client_id without page refresh
    const url = new URL(window.location.href)
    url.searchParams.set('client', client.client_id)
    window.history.pushState({}, '', url)
  }

  // Generate engagement data
  const engagementData = threads.map(thread => ({
    name: thread.title.length > 20 ? thread.title.substring(0, 20) + '...' : thread.title,
    views: thread.views || 0,
    likes: thread.likes || 0,
    replies: thread.replies || 0,
  }))

  // Generate platform distribution data
  const platformData = [
    { name: 'Twitter', value: threads.length },
    { name: 'LinkedIn', value: threads.filter(t => t.repackaged_linkedin).length },
    { name: 'Instagram', value: threads.filter(t => t.repackaged_instagram).length },
  ]

  // Generate daily growth data (mocked)
  const generateGrowthData = () => {
    const data = []
    const now = new Date()
    
    const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 365
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      
      const formattedDate = date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
      
      // Generate some random but increasing numbers
      const followers = 5000 + Math.floor(Math.random() * 100) + (i * 10)
      const engagement = 500 + Math.floor(Math.random() * 50) + (i * 5)
      
      data.push({
        date: formattedDate,
        followers,
        engagement,
      })
    }
    
    return data
  }

  const growthData = generateGrowthData()
  
  // Colors for pie chart
  const COLORS = ['#1DA1F2', '#0A66C2', '#E4405F']

  return (
    <div className="min-h-screen bg-[#15202b] text-white">
      <div className="flex h-screen">
        {/* Sidebar with client selection */}
        <Sidebar 
          onClientSelect={handleClientSelect} 
          selectedClientId={selectedClient?.client_id} 
        />

        {/* Main content */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center">
                <a 
                  href="/"
                  className="text-[#8899a6] hover:text-white mr-4"
                >
                  <ArrowLeft className="h-5 w-5" />
                </a>
                <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
              </div>
              
              {/* Client selector (mobile only) */}
              {selectedClient && (
                <div className="md:hidden">
                  <div className="bg-[#192734] px-3 py-2 rounded-md text-sm">
                    {selectedClient.name}
                  </div>
                </div>
              )}
            </div>

            {clientsLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-xl text-[#8899a6]">Loading clients...</div>
              </div>
            ) : !selectedClient ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-xl text-[#8899a6]">
                  {clients.length === 0 ? (
                    <>
                      No clients found for this organization. 
                      <a href="/admin" className="text-[#1d9bf0] ml-2 hover:underline">
                        Create a client
                      </a>
                    </>
                  ) : (
                    'Please select a client from the sidebar'
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* Client Info */}
                <div className="mb-8">
                  <div className="flex items-center">
                    {selectedClient.profile_picture_url ? (
                      <div className="h-12 w-12 rounded-full overflow-hidden mr-4">
                        <img 
                          src={selectedClient.profile_picture_url} 
                          alt={selectedClient.name || 'Client'} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-gray-500 rounded-full mr-4 flex items-center justify-center text-white text-xl">
                        {(selectedClient.name || 'Client').slice(0, 1).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h2 className="text-xl font-bold">{selectedClient.name}</h2>
                      {selectedClient.twitter_username && (
                        <div className="text-[#1d9bf0]">@{selectedClient.twitter_username}</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Analytics Tabs */}
                <div className="flex border-b border-[#38444d] mb-8">
                  <button
                    className={`px-6 py-3 font-medium text-base flex items-center ${
                      selectedTab === 'engagement'
                        ? 'text-[#1d9bf0] border-b-2 border-[#1d9bf0]'
                        : 'text-[#8899a6] hover:text-white'
                    }`}
                    onClick={() => setSelectedTab('engagement')}
                  >
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Engagement
                  </button>
                  <button
                    className={`px-6 py-3 font-medium text-base flex items-center ${
                      selectedTab === 'growth'
                        ? 'text-[#1d9bf0] border-b-2 border-[#1d9bf0]'
                        : 'text-[#8899a6] hover:text-white'
                    }`}
                    onClick={() => setSelectedTab('growth')}
                  >
                    <Users className="h-5 w-5 mr-2" />
                    Growth
                  </button>
                  <button
                    className={`px-6 py-3 font-medium text-base flex items-center ${
                      selectedTab === 'platforms'
                        ? 'text-[#1d9bf0] border-b-2 border-[#1d9bf0]'
                        : 'text-[#8899a6] hover:text-white'
                    }`}
                    onClick={() => setSelectedTab('platforms')}
                  >
                    <Twitter className="h-5 w-5 mr-2" />
                    Platforms
                  </button>
                </div>

                {/* Analytics Content */}
                {threadsLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-xl text-[#8899a6]">Loading analytics data...</div>
                  </div>
                ) : threads.length === 0 ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-xl text-[#8899a6]">No threads found for this client.</div>
                  </div>
                ) : (
                  <>
                    {/* Engagement Tab */}
                    {selectedTab === 'engagement' && (
                      <div className="bg-[#192734] rounded-lg border border-[#38444d] p-6">
                        <h3 className="text-xl font-bold mb-6">Thread Engagement Analysis</h3>
                        <div className="h-96">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={engagementData}
                              margin={{
                                top: 20,
                                right: 30,
                                left: 20,
                                bottom: 100,
                              }}
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke="#38444d" />
                              <XAxis 
                                dataKey="name" 
                                stroke="#8899a6" 
                                angle={-45}
                                textAnchor="end"
                                height={80}
                              />
                              <YAxis stroke="#8899a6" />
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: '#192734', 
                                  borderColor: '#38444d',
                                  color: 'white'
                                }} 
                              />
                              <Legend />
                              <Bar dataKey="views" name="Views" fill="#1d9bf0" />
                              <Bar dataKey="likes" name="Likes" fill="#E4405F" />
                              <Bar dataKey="replies" name="Replies" fill="#0A66C2" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}

                    {/* Growth Tab */}
                    {selectedTab === 'growth' && (
                      <div className="bg-[#192734] rounded-lg border border-[#38444d] p-6">
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="text-xl font-bold">Audience Growth</h3>
                          <div className="flex bg-[#22303c] rounded-md overflow-hidden">
                            <button 
                              className={`px-3 py-1 text-sm ${timeRange === 'week' ? 'bg-[#38444d] text-white' : 'text-[#8899a6]'}`}
                              onClick={() => setTimeRange('week')}
                            >
                              Week
                            </button>
                            <button 
                              className={`px-3 py-1 text-sm ${timeRange === 'month' ? 'bg-[#38444d] text-white' : 'text-[#8899a6]'}`}
                              onClick={() => setTimeRange('month')}
                            >
                              Month
                            </button>
                            <button 
                              className={`px-3 py-1 text-sm ${timeRange === 'year' ? 'bg-[#38444d] text-white' : 'text-[#8899a6]'}`}
                              onClick={() => setTimeRange('year')}
                            >
                              Year
                            </button>
                          </div>
                        </div>
                        <div className="h-96">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                              data={growthData}
                              margin={{
                                top: 20,
                                right: 30,
                                left: 20,
                                bottom: 20,
                              }}
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke="#38444d" />
                              <XAxis dataKey="date" stroke="#8899a6" />
                              <YAxis stroke="#8899a6" />
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: '#192734', 
                                  borderColor: '#38444d',
                                  color: 'white'
                                }} 
                              />
                              <Legend />
                              <Line 
                                type="monotone" 
                                dataKey="followers" 
                                name="Followers" 
                                stroke="#1d9bf0" 
                                activeDot={{ r: 8 }} 
                              />
                              <Line 
                                type="monotone" 
                                dataKey="engagement" 
                                name="Engagement" 
                                stroke="#E4405F" 
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}

                    {/* Platforms Tab */}
                    {selectedTab === 'platforms' && (
                      <div className="bg-[#192734] rounded-lg border border-[#38444d] p-6">
                        <h3 className="text-xl font-bold mb-6">Platform Distribution</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="h-96 flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={platformData}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  outerRadius={120}
                                  fill="#8884d8"
                                  dataKey="value"
                                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                >
                                  {platformData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip 
                                  contentStyle={{ 
                                    backgroundColor: '#192734', 
                                    borderColor: '#38444d',
                                    color: 'white'
                                  }} 
                                />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="flex flex-col justify-center">
                            <div className="space-y-5">
                              <div>
                                <div className="flex items-center mb-2">
                                  <div className="w-4 h-4 bg-[#1DA1F2] rounded-full mr-2"></div>
                                  <span className="text-base font-medium">Twitter</span>
                                </div>
                                <div className="text-3xl font-bold">{threads.length}</div>
                                <div className="text-[#8899a6] text-sm">Total Threads</div>
                              </div>
                              
                              <div>
                                <div className="flex items-center mb-2">
                                  <div className="w-4 h-4 bg-[#0A66C2] rounded-full mr-2"></div>
                                  <span className="text-base font-medium">LinkedIn</span>
                                </div>
                                <div className="text-3xl font-bold">
                                  {threads.filter(t => t.repackaged_linkedin).length}
                                </div>
                                <div className="text-[#8899a6] text-sm">Repackaged Threads</div>
                              </div>
                              
                              <div>
                                <div className="flex items-center mb-2">
                                  <div className="w-4 h-4 bg-[#E4405F] rounded-full mr-2"></div>
                                  <span className="text-base font-medium">Instagram</span>
                                </div>
                                <div className="text-3xl font-bold">
                                  {threads.filter(t => t.repackaged_instagram).length}
                                </div>
                                <div className="text-[#8899a6] text-sm">Repackaged Threads</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 