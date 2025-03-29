"use client"

import { useState, useEffect, useMemo } from "react"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts"
import { Twitter, Linkedin, Instagram, TrendingUp, Users, ArrowLeft, ArrowUp, Calendar, Eye, Edit, Trash, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import useOrganization from "@/hooks/useOrganization"
import useClients from "@/hooks/useClients"
import useThreads from "@/hooks/useThreads"
import useClientMetrics from "@/hooks/useClientMetrics"
import type { Client } from "@/types/client"
import { supabase } from "@/lib/supabase"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatNumber } from '@/lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { addDays, format, subDays, subMonths } from "date-fns"

export default function AnalyticsPage() {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month')
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: subMonths(new Date(), 1),
    to: new Date(),
  })
  
  // Get organization
  const { organizationId } = useOrganization()
  
  // Get clients
  const { clients, loading: clientsLoading } = useClients(organizationId)
  
  // Get metrics for the selected client
  const { metrics, loading: metricsLoading, error: metricsError } = useClientMetrics(selectedClient?.client_id || null)
  
  // Fetch threads for the selected client
  const { threads, loading: threadsLoading } = useThreads(selectedClient?.client_id || null)

  // Helper functions for growth calculations
  const calculateGrowth = (current: number, previous: number) => {
    if (!previous) return 0;
    return ((current - previous) / previous) * 100;
  };

  const renderGrowthIndicator = (growth: number) => {
    if (growth > 0) {
      return <ArrowUpRight className="text-green-500" />;
    } else if (growth < 0) {
      return <ArrowDownRight className="text-red-500" />;
    }
    return <Minus className="text-gray-500" />;
  };

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
  
  // Handle client selection
  const handleClientSelect = (client: Client) => {
    setSelectedClient(client)
    
    // Update URL with client_id without page refresh
    const url = new URL(window.location.href)
    url.searchParams.set('client', client.client_id)
    window.history.pushState({}, '', url)
  }

  // Generate engagement data with proper metrics
  const engagementData = useMemo(() => {
    if (!threads?.length) return [];
    
    return threads.map(thread => {
      // Calculate total metrics for this thread
      const threadMetrics = thread.tweets?.reduce((totals, tweet) => {
        // Ensure proper number conversion with parseInt
        const views = parseInt(tweet.view_count || '0', 10);
        const likes = parseInt(tweet.like_count || '0', 10);
        const replies = parseInt(tweet.reply_count || '0', 10);
        const retweets = parseInt(tweet.retweet_count || '0', 10);
        const quotes = parseInt(tweet.quote_count || '0', 10);

        return {
          views: totals.views + views,
          likes: totals.likes + likes,
          replies: totals.replies + replies,
          retweets: totals.retweets + retweets,
          quotes: totals.quotes + quotes,
          total: totals.total + likes + replies + retweets + quotes
        };
      }, { views: 0, likes: 0, replies: 0, retweets: 0, quotes: 0, total: 0 });

      // Calculate engagement rate
      const engagement = threadMetrics.views > 0 
        ? (threadMetrics.total / threadMetrics.views) * 100 
        : 0;

      return {
        id: thread.id, // Ensure thread ID for unique key prop
        thread_id: thread.thread_id, // Also include thread_id for extra uniqueness
        name: thread.title?.length > 20 ? thread.title.substring(0, 20) + '...' : thread.title || 'Untitled',
        views: threadMetrics.views,
        likes: threadMetrics.likes,
        replies: threadMetrics.replies,
        retweets: threadMetrics.retweets,
        quotes: threadMetrics.quotes,
        engagement
      };
    })
    .sort((a, b) => b.engagement - a.engagement);
  }, [threads]);

  // Generate platform distribution data
  const platformData = useMemo(() => {
    if (!threads?.length) return [];
    
    const platforms = new Map();
    let index = 0;
    
    threads.forEach(thread => {
      const platform = thread.platform || 'twitter';
      const current = platforms.get(platform) || { id: platform + '_' + index++, name: platform, count: 0 };
      current.count++;
      platforms.set(platform, current);
    });

    return Array.from(platforms.values());
  }, [threads]);

  // Use empty metrics as fallback
  const safeMetrics = metrics || {
    totalViews: 0,
    totalLikes: 0,
    totalReplies: 0,
    totalRetweets: 0,
    totalQuotes: 0,
    totalImpressions: 0,
    engagement_rate: 0,
    weekly_growth: []
  };

  // Generate weekly growth data
  const weeklyGrowthData = useMemo(() => {
    if (!safeMetrics?.weekly_growth || safeMetrics.weekly_growth.length === 0) {
      return [];
    }
    return safeMetrics.weekly_growth.map(week => {
      const weekDate = new Date(week.weekStart);
      return {
        weekStart: week.weekStart,
        weekDate: weekDate,
        // Format the date as "MMM D" (e.g., "Jan 10")
        name: `${weekDate.toLocaleString('en-US', { month: 'short' })} ${weekDate.getDate()}`,
        views: week.views || 0,
        engagement: week.engagement || 0,
        threadCount: week.threadCount || 0,
        likes: week.likes || 0,
        replies: week.replies || 0,
        retweets: week.retweets || 0,
        quotes: week.quotes || 0
      };
    }).sort((a, b) => new Date(a.weekStart).getTime() - new Date(b.weekStart).getTime());
  }, [safeMetrics]);

  // Get last week and previous week data safely
  const lastWeekIndex = safeMetrics?.weekly_growth?.length ? safeMetrics.weekly_growth.length - 1 : -1;
  const lastWeek = lastWeekIndex >= 0 ? safeMetrics.weekly_growth[lastWeekIndex] : null;
  const previousWeek = lastWeekIndex > 0 ? safeMetrics.weekly_growth[lastWeekIndex - 1] : null;

  // Calculate growth rates safely
  const viewsGrowth = calculateGrowth(lastWeek?.views || 0, previousWeek?.views || 0);
  const engagementGrowth = calculateGrowth(lastWeek?.engagement || 0, previousWeek?.engagement || 0);
  const threadGrowth = calculateGrowth(lastWeek?.threadCount || 0, previousWeek?.threadCount || 0);

  // Colors for pie chart
  const COLORS = ['#1DA1F2', '#0A66C2', '#E4405F']

  // Loading and error states
  if (clientsLoading || threadsLoading || metricsLoading) {
    return (
      <div className="min-h-screen bg-[#15202b] text-white flex items-center justify-center">
        <div className="text-xl text-[#8899a6]">Loading analytics data...</div>
      </div>
    );
  }

  if (metricsError) {
    return (
      <div className="min-h-screen bg-[#15202b] text-white flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="text-xl text-[#8899a6]">Error loading metrics: {metricsError}</div>
          <Button 
            onClick={() => window.location.reload()}
            className="bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!selectedClient) {
    return (
      <div className="min-h-screen bg-[#15202b] text-white flex items-center justify-center">
        <div className="text-xl text-[#8899a6]">
          {clients.length === 0 ? (
            <>
              No clients found for this organization. 
              <a href="/" className="text-[#1d9bf0] ml-2 hover:underline">
                Return to dashboard
              </a>
            </>
          ) : (
            'Please select a client from the sidebar'
          )}
        </div>
      </div>
    );
  }

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
          <div className="p-5">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <a 
                  href="/"
                  className="text-[#8899a6] hover:text-white mr-4"
                >
                  <ArrowLeft className="h-5 w-5" />
                </a>
                <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
              </div>
              
              {/* Date range picker */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="ml-auto border-[#38444d] bg-transparent text-white hover:bg-[#2d3741] hover:text-white"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-[#15202b] border-[#38444d]" align="end">
                  <CalendarComponent
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange.from}
                    selected={{
                      from: dateRange.from,
                      to: dateRange.to,
                    }}
                    onSelect={(range) => {
                      if (range?.from && range?.to) {
                        setDateRange({ from: range.from, to: range.to });
                      }
                    }}
                    numberOfMonths={2}
                    className="bg-[#15202b] text-white"
                  />
                  <div className="p-3 border-t border-[#38444d] flex justify-between">
                    <Button 
                      variant="outline" 
                      className="text-xs border-[#38444d] bg-transparent text-white hover:bg-[#2d3741]"
                      onClick={() => setDateRange({
                        from: subDays(new Date(), 7),
                        to: new Date()
                      })}
                    >
                      Last 7 days
                    </Button>
                    <Button 
                      variant="outline" 
                      className="text-xs border-[#38444d] bg-transparent text-white hover:bg-[#2d3741]"
                      onClick={() => setDateRange({
                        from: subDays(new Date(), 30),
                        to: new Date()
                      })}
                    >
                      Last 30 days
                    </Button>
                    <Button 
                      variant="outline" 
                      className="text-xs border-[#38444d] bg-transparent text-white hover:bg-[#2d3741]"
                      onClick={() => setDateRange({
                        from: subMonths(new Date(), 3),
                        to: new Date()
                      })}
                    >
                      Last 3 months
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Client Info */}
            <div className="mb-6">
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

            {/* Analytics Content */}
            {threads.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-xl text-[#8899a6]">No threads found for this client.</div>
              </div>
            ) : (
              <>
                {/* Engagement Tab - Now always visible */}
                <div className="space-y-5">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Total Views */}
                    <MetricCard
                      title="Total Views"
                      value={formatNumber(safeMetrics.totalViews)}
                      growth={viewsGrowth}
                    />
                    
                    {/* Average Engagement */}
                    <MetricCard
                      title="Engagement Rate"
                      value={`${safeMetrics.engagement_rate.toFixed(2)}%`}
                      growth={engagementGrowth}
                    />
                    
                    {/* Total Interactions */}
                    <MetricCard
                      title="Total Threads"
                      value={formatNumber(threads?.length || 0)}
                      growth={threadGrowth}
                    />
                    
                    {/* Best Performing Thread */}
                    <MetricCard
                      title="Best Performing Week"
                      value={formatNumber(Math.max(...safeMetrics.weekly_growth.map(w => w.views || 0)))}
                    />
                  </div>

                  {/* Week-by-Week Metrics */}
                  <WeeklyMetricsTable data={weeklyGrowthData} />

                  {/* Thread Engagement Chart */}
                  <div className="bg-[#192734] rounded-lg border border-[#38444d] p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold">Thread Engagement Analysis</h3>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-[#1d9bf0] rounded-full mr-1"></div>
                          <span className="text-xs text-[#8899a6]">Views</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-[#E4405F] rounded-full mr-1"></div>
                          <span className="text-xs text-[#8899a6]">Likes</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-[#0A66C2] rounded-full mr-1"></div>
                          <span className="text-xs text-[#8899a6]">Replies</span>
                        </div>
                      </div>
                    </div>
                    <div className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={engagementData}
                          margin={{
                            top: 10,
                            right: 10,
                            left: 10,
                            bottom: 100,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#38444d" />
                          <XAxis 
                            dataKey="name" 
                            stroke="#8899a6" 
                            angle={-45}
                            textAnchor="end"
                            height={100}
                            tick={{ fontSize: 11 }}
                            interval={0}
                          />
                          <YAxis 
                            stroke="#8899a6"
                            tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(1)}K` : value}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#192734', 
                              borderColor: '#38444d',
                              color: 'white',
                              fontSize: '12px',
                              padding: '8px'
                            }}
                            formatter={(value: number, name: string) => {
                              // Format large numbers with K/M suffix
                              if (value >= 1000000) {
                                return [`${(value/1000000).toFixed(1)}M`, name];
                              }
                              if (value >= 1000) {
                                return [`${(value/1000).toFixed(1)}K`, name];
                              }
                              return [value.toLocaleString(), name];
                            }}
                            cursor={{ fill: 'rgba(136, 153, 166, 0.1)' }}
                          />
                          <Bar 
                            dataKey="views" 
                            name="Views" 
                            fill="#1d9bf0"
                            radius={[4, 4, 0, 0]}
                            key="views-bar"
                          />
                          <Bar 
                            dataKey="likes" 
                            name="Likes" 
                            fill="#E4405F"
                            radius={[4, 4, 0, 0]}
                            key="likes-bar"
                          />
                          <Bar 
                            dataKey="replies" 
                            name="Replies" 
                            fill="#0A66C2"
                            radius={[4, 4, 0, 0]}
                            key="replies-bar"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Top Performing Threads Table */}
                  <div className="bg-[#192734] rounded-lg border border-[#38444d] p-4">
                    <h3 className="text-xl font-bold mb-3">Top Performing Threads</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="text-[#8899a6] text-sm border-b border-[#38444d]">
                            <th className="text-left pb-2">Thread</th>
                            <th className="text-right pb-2">Views</th>
                            <th className="text-right pb-2">Likes</th>
                            <th className="text-right pb-2">Replies</th>
                            <th className="text-right pb-2">Engagement</th>
                          </tr>
                        </thead>
                        <tbody>
                          {engagementData.slice(0, 5).map((thread) => (
                            <tr key={`thread-${thread.id || thread.thread_id}`} className="border-b border-[#38444d] last:border-0">
                              <td className="py-2 pr-4">{thread.name}</td>
                              <td className="py-2 text-right">{thread.views.toLocaleString()}</td>
                              <td className="py-2 text-right">{thread.likes.toLocaleString()}</td>
                              <td className="py-2 text-right">{thread.replies.toLocaleString()}</td>
                              <td className="py-2 text-right font-medium">
                                {thread.engagement.toFixed(2)}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Platform Distribution - Always visible now */}
                  <div className="bg-[#192734] rounded-lg border border-[#38444d] p-4 mt-5">
                    <h3 className="text-xl font-bold mb-4">Platform Distribution</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="h-80 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={platformData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={100}
                              fill="#8884d8"
                              dataKey="count"
                              nameKey="name"
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            >
                              {platformData.map((entry, index) => (
                                <Cell key={`cell-${entry.id}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: '#192734', 
                                borderColor: '#38444d',
                                color: 'white'
                              }}
                              formatter={(value: number) => [formatNumber(value), 'Threads']}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex flex-col justify-center">
                        <div className="space-y-4">
                          {platformData.map((platform, index) => (
                            <div key={`platform-${platform.id}`}>
                              <div className="flex items-center mb-1">
                                <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                <span className="text-base font-medium capitalize">{platform.name}</span>
                              </div>
                              <div className="text-2xl font-bold">{platform.count}</div>
                              <div className="text-[#8899a6] text-xs">
                                {platform.name === 'twitter' ? 'Total Threads' : 'Repackaged Threads'}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ title, value, growth }: { title: string; value: string; growth?: number }) {
  const renderGrowthIndicator = (growth: number) => {
    if (growth > 0) {
      return <ArrowUpRight className="text-[#00ba7c] h-4 w-4" />;
    } else if (growth < 0) {
      return <ArrowDownRight className="text-[#f91880] h-4 w-4" />;
    }
    return <Minus className="text-[#8899a6] h-4 w-4" />;
  };

  return (
    <div className="bg-[#192734] rounded-lg border border-[#38444d] p-3">
      <div className="text-[#8899a6] text-xs mb-1">{title}</div>
      <div className="flex items-baseline">
        <div className="text-xl font-bold">{value}</div>
        {growth !== undefined && (
          <div className="ml-2 flex items-center text-xs">
            {renderGrowthIndicator(growth)}
            <span className={`ml-1 ${
              growth > 0 ? 'text-[#00ba7c]' : 
              growth < 0 ? 'text-[#f91880]' : 
              'text-[#8899a6]'
            }`}>
              {Math.abs(growth).toFixed(1)}%
            </span>
          </div>
        )}
      </div>
      <div className="text-[#8899a6] text-xs mt-1">
        {title === "Total Views" && "Across all threads"}
        {title === "Engagement Rate" && "Interactions / views"}
        {title === "Total Threads" && "Published content"}
        {title === "Best Performing Week" && "Highest weekly views"}
      </div>
    </div>
  );
}

function MetricRow({ label, value, total }: { label: string; value: number; total: number }) {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  
  return (
    <div className="flex justify-between items-center">
      <span className="text-[#8899a6]">{label}</span>
      <div className="flex items-center space-x-2">
        <span className="font-medium">{formatNumber(value)}</span>
        <span className="text-xs text-[#8899a6]">({percentage.toFixed(1)}%)</span>
      </div>
    </div>
  );
}

// Week-by-Week Metrics component
function WeeklyMetricsTable({ data }: { data: any[] }) {
  // Get date formatter for consistent display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      monthDay: `${date.toLocaleString('default', { month: 'short' })} ${date.getDate()}`,
      fullDate: date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    };
  };

  return (
    <div className="bg-[#192734] rounded-lg border border-[#38444d] p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Weekly Performance Metrics</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-[#8899a6] text-sm border-b border-[#38444d]">
              <th className="text-left pb-2">Week of</th>
              <th className="text-right pb-2">Views</th>
              <th className="text-right pb-2">Likes</th>
              <th className="text-right pb-2">Replies</th>
              <th className="text-right pb-2">Threads</th>
              <th className="text-right pb-2">Engagement</th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((week) => {
                const { monthDay, fullDate } = formatDate(week.weekStart);
                return (
                  <tr key={week.weekStart} className="border-b border-[#38444d] last:border-0">
                    <td className="py-2 pr-4">
                      <span title={fullDate}>{monthDay}</span>
                    </td>
                    <td className="py-2 text-right">{formatNumber(week.views)}</td>
                    <td className="py-2 text-right">{formatNumber(week.likes)}</td>
                    <td className="py-2 text-right">{formatNumber(week.replies)}</td>
                    <td className="py-2 text-right">{formatNumber(week.threadCount)}</td>
                    <td className="py-2 text-right font-medium">
                      {week.engagement.toFixed(2)}%
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="py-4 text-center text-[#8899a6]">
                  No weekly data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 