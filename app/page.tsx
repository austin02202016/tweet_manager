"use client"

import { useState, useEffect, useMemo } from "react"
import { Twitter, Linkedin, Instagram, Search, Filter } from "lucide-react"
import { ThreadDetailModal } from "@/components/thread-detail-modal"
import { CarouselModal } from "@/components/carousel-modal"
import { Sidebar } from "@/components/sidebar"
import { ThreadsTable } from "@/components/threads-table"
import { WelcomeHeader } from "@/components/welcome-header"
import { ReportsSection } from "@/components/reports-section"
import useThreads from "@/hooks/useThreads"
import useThreadActions from "@/hooks/useThreadActions"
import useOrganization from "@/hooks/useOrganization"
import useClients from "@/hooks/useClients"
import { supabase } from "@/lib/supabase"
import type { Thread } from "@/types/thread"
import type { Client } from "@/types/client"
import { useUser } from "@/hooks/useUser"

type Platform = "twitter" | "linkedin" | "instagram"
type FilterOption = "all" | "repackaged" | "not_repackaged"

// Sample reports data
const sampleReports = [
  {
    id: "1",
    title: "Twitter Performance Analysis",
    dateRange: "March 14-28, 2025",
    summary:
      "Solo tweets outperform threads, photo tweets generate highest engagement, and text-only tweets drive highest views.",
    date: "March 30, 2025",
    content: `Twitter Performance Analysis (March 14-28, 2025)
Key Metrics by Format:
- Solo tweets outperform threads (78 vs 36 avg likes)
- Photo tweets generate highest engagement (102 avg likes)
- Text-only tweets drive highest views (11,366 avg)
- Thread starters perform well, but engagement drops 87% in replies

Top Performers:
- "At the end of your life..." - 289 likes, 53 RTs, 52,304 views
- "You're exhausted..." - 275 likes, 37 RTs, 40,100 views
- "A one-minute habit..." - 191 likes, 27 RTs, 34,434 views
- All top tweets were text-only thread starters with philosophical/motivational themes.

Actionable for Me:
- Craft compelling standalone tweets and thread starters
- Increase photo content in the content mix - already doing this but 
- Keep threads shorter (I'll make them up to 4 or 5 max)
- Test mid-morning and early evening posting times (don't need to implement just a trend)
- (Subject matter emphasis) Prioritize emotional, universal themes over tactical advice
- (Subject matter emphasis) Focus on resilience and meaning-focused topics`,
  } 
]

export default function ThreadsPage() {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [activePlatform, setActivePlatform] = useState<Platform>("twitter")
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null)
  const [carouselThread, setCarouselThread] = useState<Thread | null>(null)
  const [sortColumn, setSortColumn] = useState<"views" | "likes" | "replies" | "date" | "">("")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterOption, setFilterOption] = useState<FilterOption>("all")

  // Get organization
  const { organizationId } = useOrganization()

  // Get clients
  const { clients, loading: clientsLoading } = useClients(organizationId)

  // Get user
  const { user } = useUser()

  // Handle URL parameters for client selection
  useEffect(() => {
    const getClientFromUrl = async () => {
      if (typeof window === "undefined") return // Skip during SSR

      // Check for client parameter in URL
      const params = new URLSearchParams(window.location.search)
      const clientId = params.get("client")

      if (clientId) {
        try {
          // Try to fetch the client directly
          const { data, error } = await supabase.from("clients").select("*").eq("client_id", clientId).single()

          if (error) throw error

          if (data) {
            setSelectedClient(data)
            return
          }
        } catch (err) {
          console.error("Error fetching client from URL:", err)
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
  const { threads, loading } = useThreads(selectedClient?.client_id || null)

  // Thread actions
  const { updateRepackagedStatus } = useThreadActions()

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client)
    // Reset thread selection when changing clients
    setSelectedThread(null)
    setCarouselThread(null)

    // Update URL with client_id without page refresh
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href)
      url.searchParams.set("client", client.client_id)
      window.history.pushState({}, "", url)
    }
  }

  const handleThreadSelect = (thread: Thread) => {
    setSelectedThread(thread)
  }

  const handleCarouselSelect = (thread: Thread) => {
    setCarouselThread(thread)
  }

  const handleRepackagedChange = async (platform: "linkedin" | "instagram", value: boolean) => {
    if (selectedThread) {
      const success = await updateRepackagedStatus(selectedThread.id, platform, value)
      if (success) {
        // Update the selected thread in memory
        setSelectedThread({
          ...selectedThread,
          [platform === "linkedin" ? "repackaged_linkedin" : "repackaged_instagram"]: value,
        })
      }
    }
  }

  const handleSort = (column: "views" | "likes" | "replies" | "date" | "") => {
    if (sortColumn === column) {
      // Flip direction
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortColumn(column)
      setSortDirection("desc")
    }
  }

  const filteredAndSortedThreads = useMemo(() => {
    // First filter by search query
    let filtered = threads

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase()
      filtered = threads.filter(
        (thread) =>
          thread.title?.toLowerCase().includes(query) ||
          thread.tweets.some((tweet) => tweet.text?.toLowerCase().includes(query)),
      )
    }

    // Apply repackaging filter
    if (filterOption === "repackaged") {
      filtered = filtered.filter((thread) => thread.repackaged_linkedin || thread.repackaged_instagram)
    } else if (filterOption === "not_repackaged") {
      filtered = filtered.filter((thread) => !thread.repackaged_linkedin && !thread.repackaged_instagram)
    }

    // Then sort
    return [...filtered].sort((a, b) => {
      if (!sortColumn) return 0

      const valA = sortColumn === "date" ? new Date(a.date).getTime() : (a as any)[sortColumn]
      const valB = sortColumn === "date" ? new Date(b.date).getTime() : (b as any)[sortColumn]

      return sortDirection === "asc" ? valA - valB : valB - valA
    })
  }, [threads, searchQuery, filterOption, sortColumn, sortDirection])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#15202b] to-[#1a2836] text-white">
      <div className="flex h-screen">
        {/* Sidebar with client selection */}
        <Sidebar onClientSelect={handleClientSelect} selectedClientId={selectedClient?.client_id} />

        {/* Main content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6 md:p-8 lg:p-10">
            {clientsLoading ? (
              <div className="flex items-center justify-center h-64 bg-[#192734] rounded-xl border border-[#38444d] shadow-md">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 border-4 border-[#1d9bf0] border-t-transparent rounded-full animate-spin mb-4"></div>
                </div>
              </div>
            ) : selectedClient ? (
              <>
                {/* Welcome Header Component */}
                <WelcomeHeader userName={user?.first_name || ''} clientName={selectedClient.name} />

                {/* Reports Section */}
                <ReportsSection reports={sampleReports} />

                {/* Platform Tabs */}
                <div className="flex border-b border-[#38444d] mb-8 bg-[#192734] rounded-t-xl overflow-hidden">
                  <button
                    className={`px-8 py-4 font-medium text-base flex items-center transition-all duration-200 ${
                      activePlatform === "twitter"
                        ? "text-[#1d9bf0] border-b-2 border-[#1d9bf0] bg-[#1d9bf01a]"
                        : "text-[#8899a6] hover:text-white hover:bg-[#ffffff0a]"
                    }`}
                    onClick={() => setActivePlatform("twitter")}
                  >
                    <Twitter
                      className={`h-5 w-5 mr-2 ${activePlatform === "twitter" ? "text-[#1d9bf0]" : "text-[#8899a6]"}`}
                    />
                    Twitter
                  </button>
                  <button
                    className={`px-8 py-4 font-medium text-base flex items-center transition-all duration-200 ${
                      activePlatform === "linkedin"
                        ? "text-[#0A66C2] border-b-2 border-[#0A66C2] bg-[#0A66C21a]"
                        : "text-[#8899a6] hover:text-white hover:bg-[#ffffff0a]"
                    }`}
                    onClick={() => setActivePlatform("linkedin")}
                  >
                    <Linkedin
                      className={`h-5 w-5 mr-2 ${activePlatform === "linkedin" ? "text-[#0A66C2]" : "text-[#8899a6]"}`}
                    />
                    LinkedIn
                  </button>
                  <button
                    className={`px-8 py-4 font-medium text-base flex items-center transition-all duration-200 ${
                      activePlatform === "instagram"
                        ? "text-[#E4405F] border-b-2 border-[#E4405F] bg-[#E4405F1a]"
                        : "text-[#8899a6] hover:text-white hover:bg-[#ffffff0a]"
                    }`}
                    onClick={() => setActivePlatform("instagram")}
                  >
                    <Instagram
                      className={`h-5 w-5 mr-2 ${activePlatform === "instagram" ? "text-[#E4405F]" : "text-[#8899a6]"}`}
                    />
                    Instagram
                  </button>
                </div>

                {activePlatform === "twitter" && (
                  <>
                    {/* Search and Filter Controls - Simplified */}
                    <div className="mb-6">
                      <div className="flex flex-col sm:flex-row gap-4 w-full">
                        {/* Search input */}
                        <div className="relative w-full sm:w-64">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-[#8899a6]" />
                          </div>
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search..."
                            className="w-full bg-[#253341] text-white rounded-md pl-10 pr-4 py-2 border border-[#38444d] focus:border-[#1d9bf0] focus:ring-2 focus:ring-[#1d9bf033] focus:outline-none transition-colors duration-200"
                          />
                        </div>

                        {/* Filter dropdown */}
                        <div className="relative w-full sm:w-auto">
                          <select
                            value={filterOption}
                            onChange={(e) => setFilterOption(e.target.value as FilterOption)}
                            className="appearance-none w-full bg-[#253341] text-white rounded-md pl-10 pr-8 py-2 border border-[#38444d] focus:border-[#1d9bf0] focus:ring-2 focus:ring-[#1d9bf033] focus:outline-none transition-colors duration-200"
                          >
                            <option value="all">All</option>
                            <option value="repackaged">Repackaged</option>
                            <option value="not_repackaged">Not Repackaged</option>
                          </select>
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Filter className="h-4 w-4 text-[#8899a6]" />
                          </div>
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <svg
                              className="h-4 w-4 text-[#8899a6]"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Threads Table Component */}
                    <ThreadsTable
                      threads={filteredAndSortedThreads}
                      loading={loading}
                      searchQuery={searchQuery}
                      sortColumn={sortColumn}
                      sortDirection={sortDirection}
                      handleSort={handleSort}
                      handleThreadSelect={handleThreadSelect}
                      handleCarouselSelect={handleCarouselSelect}
                      selectedClient={selectedClient}
                    />
                  </>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-64 bg-[#192734] p-8 rounded-xl border border-[#38444d] shadow-md">
                <div className="text-center">
                  {clients.length === 0 ? (
                    <a
                      href="/admin"
                      className="inline-block px-4 py-2 bg-gradient-to-r from-[#1d9bf0] to-[#0d8bd7] text-white rounded-md hover:opacity-90 transition-opacity duration-200 shadow-lg"
                    >
                      Create a client
                    </a>
                  ) : (
                    <div className="text-xl font-medium text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">
                      Select a client
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Thread Detail Modal */}
      {selectedThread && selectedClient && (
        <ThreadDetailModal 
          thread={selectedThread} 
          onClose={() => setSelectedThread(null)} 
          selectedClient={selectedClient}
        />
      )}

      {/* Carousel Modal */}
      {carouselThread && <CarouselModal thread={carouselThread} onClose={() => setCarouselThread(null)} />}
    </div>
  )
}

