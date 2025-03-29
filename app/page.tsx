"use client"

import { useState, useEffect, useMemo } from "react"
import { Twitter, Linkedin, Instagram, Search, Filter } from "lucide-react"
import { ThreadDetailModal } from "@/components/thread-detail-modal"
import { CarouselModal } from "@/components/carousel-modal"
import { Sidebar } from "@/components/sidebar"
import { ThreadsTable } from "@/components/threads-table"
import useThreads from "@/hooks/useThreads"
import useThreadActions from "@/hooks/useThreadActions"
import useOrganization from "@/hooks/useOrganization"
import useClients from "@/hooks/useClients"
import { supabase } from "@/lib/supabase"
import type { Thread } from "@/types/thread"
import type { Client } from "@/types/client"

type Platform = "twitter" | "linkedin" | "instagram"
type FilterOption = "all" | "repackaged" | "not_repackaged"

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
  // console.log("Organization ID:", organizationId)
  

  // Get clients
  const { clients, loading: clientsLoading } = useClients(organizationId)

  // Handle URL parameters for client selection
  useEffect(() => {
    const getClientFromUrl = async () => {
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
    const url = new URL(window.location.href)
    url.searchParams.set("client", client.client_id)
    window.history.pushState({}, "", url)
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
    <div className="min-h-screen bg-[#15202b] text-white">
      <div className="flex h-screen">
        {/* Sidebar with client selection */}
        <Sidebar onClientSelect={handleClientSelect} selectedClientId={selectedClient?.client_id} />

        {/* Main content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6 md:p-8 lg:p-10">
            <div className="flex justify-between items-center mb-8">
              <div>{/* Empty div for layout */}</div>
              <div className="flex items-center space-x-4">
                
              </div>
            </div>

            {clientsLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-xl text-[#8899a6]">Loading clients...</div>
              </div>
            ) : selectedClient ? (
              <>
                {/* Display Client Profile Photo and Personalized Greeting */}
                <div className="flex items-center space-x-5 mb-10 bg-[#192734] p-6 rounded-xl border border-[#38444d] shadow-md">
                  <img
                    src={selectedClient.profile_photo_url || "/default-profile.png"} // Fallback image
                    alt={`${selectedClient.name}'s profile`}
                    className="w-16 h-16 rounded-full object-cover border-2 border-[#1d9bf0]"
                  />
                  <div>
                    <h1 className="text-2xl font-bold mb-1">Hey {selectedClient.name}</h1>
                    <p className="text-sm text-[#8899a6]">Welcome to your content dashboard</p>
                  </div>
                </div>

                {/* Platform Tabs */}
                <div className="flex border-b border-[#38444d] mb-10">
                  <button
                    className={`px-8 py-4 font-medium text-base flex items-center transition-colors duration-200 ${
                      activePlatform === "twitter"
                        ? "text-[#1d9bf0] border-b-2 border-[#1d9bf0]"
                        : "text-[#8899a6] hover:text-white"
                    }`}
                    onClick={() => setActivePlatform("twitter")}
                  >
                    <Twitter className="h-5 w-5 mr-2" />
                    Twitter
                  </button>
                  <button
                    className={`px-8 py-4 font-medium text-base flex items-center transition-colors duration-200 ${
                      activePlatform === "linkedin"
                        ? "text-[#0A66C2] border-b-2 border-[#0A66C2]"
                        : "text-[#8899a6] hover:text-white"
                    }`}
                    onClick={() => setActivePlatform("linkedin")}
                  >
                    <Linkedin className="h-5 w-5 mr-2" />
                    LinkedIn
                  </button>
                  <button
                    className={`px-8 py-4 font-medium text-base flex items-center transition-colors duration-200 ${
                      activePlatform === "instagram"
                        ? "text-[#E4405F] border-b-2 border-[#E4405F]"
                        : "text-[#8899a6] hover:text-white"
                    }`}
                    onClick={() => setActivePlatform("instagram")}
                  >
                    <Instagram className="h-5 w-5 mr-2" />
                    Instagram
                  </button>
                </div>

                {activePlatform === "twitter" && (
                  <>
                    {/* Section Header with Search and Filters */}
                    <div className="mb-8">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                        <div>
                          <h2 className="text-2xl font-bold">Your Threads</h2>
                          <p className="text-[#8899a6] mt-2">Manage and track your Twitter threads</p>
                        </div>

                        {/* Search and filter controls */}
                        <div className="flex flex-col sm:flex-row gap-4 mt-4 md:mt-0 w-full md:w-auto">
                          {/* Search input */}
                          <div className="relative w-full sm:w-64">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Search className="h-4 w-4 text-[#8899a6]" />
                            </div>
                            <input
                              type="text"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              placeholder="Search threads..."
                              className="w-full bg-[#253341] text-white rounded-md pl-10 pr-4 py-2 border border-[#38444d] focus:border-[#1d9bf0] focus:outline-none transition-colors duration-200"
                            />
                          </div>

                          {/* Filter dropdown */}
                          <div className="relative w-full sm:w-auto">
                            <select
                              value={filterOption}
                              onChange={(e) => setFilterOption(e.target.value as FilterOption)}
                              className="appearance-none w-full bg-[#253341] text-white rounded-md pl-10 pr-8 py-2 border border-[#38444d] focus:border-[#1d9bf0] focus:outline-none transition-colors duration-200"
                            >
                              <option value="all">All Threads</option>
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

                      {/* Results info */}
                      <div className="text-sm text-[#8899a6] mb-2">
                        Showing {filteredAndSortedThreads.length} of {threads.length} threads
                        {searchQuery && ` matching "${searchQuery}"`}
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
              <div className="flex items-center justify-center h-64 bg-[#192734] p-8 rounded-xl border border-[#38444d]">
                <div className="text-xl text-[#8899a6]">
                  {clients.length === 0 ? (
                    <>
                      No clients found for this organization.
                      <a href="/admin" className="text-[#1d9bf0] ml-2 hover:underline">
                        Create a client
                      </a>
                    </>
                  ) : (
                    "Please select a client from the sidebar"
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Thread Detail Modal */}
      {selectedThread && (
        <ThreadDetailModal
          thread={selectedThread}
          onClose={() => setSelectedThread(null)}
          onRepackagedChange={handleRepackagedChange}
        />
      )}

      {/* Carousel Modal */}
      {carouselThread && <CarouselModal thread={carouselThread} onClose={() => setCarouselThread(null)} />}
    </div>
  )
}

