"use client"

import { useEffect, useState } from "react"
import { ExternalLink, Calendar, ArrowUpDown, Play, Heart, MessageCircle, Share2 } from 'lucide-react'
import { formatDate, formatNumber } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { TikTokPostPreview } from "@/components/tiktok/tiktok-post-preview"
import type { TikTokVideo, TikTokSortColumn } from "@/types/tiktok"
import type { Client } from "@/types/client"

interface TikTokTableProps {
  client: Client
  videos: TikTokVideo[]
  loading?: boolean
  searchQuery?: string
  sortColumn: TikTokSortColumn
  sortDirection: "asc" | "desc"
  onSort: (column: TikTokSortColumn, direction: "asc" | "desc") => void
}

export function TikTokTable({
  client,
  videos,
  loading = false,
  searchQuery = "",
  sortColumn,
  sortDirection,
  onSort,
}: TikTokTableProps) {
  const [selectedVideo, setSelectedVideo] = useState<TikTokVideo | null>(null)
  const [averageBaselineViews, setAverageBaselineViews] = useState<number>(0)

  useEffect(() => {
    if (videos.length > 0) {
      const totalViews = videos.reduce((sum, video) => sum + video.playcount, 0)
      setAverageBaselineViews(totalViews / videos.length)
    }
  }, [videos])

  // Filter videos based on search query
  const filteredVideos = videos.filter((video) => 
    video.text.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Sort videos based on sortColumn and sortDirection
  const sortedVideos = [...filteredVideos].sort((a, b) => {
    if (!sortColumn) return 0

    let valA: number | Date = 0
    let valB: number | Date = 0

    if (sortColumn === "date") {
      valA = new Date(a.date).getTime()
      valB = new Date(b.date).getTime()
    } else {
      valA = a[sortColumn]
      valB = b[sortColumn]
    }

    // Sort based on direction
    if (sortDirection === "asc") {
      return valA > valB ? 1 : valA < valB ? -1 : 0
    } else {
      return valA < valB ? 1 : valA > valB ? -1 : 0
    }
  })

  const handleSort = (column: TikTokSortColumn) => {
    onSort(column, sortColumn === column && sortDirection === "desc" ? "asc" : "desc")
  }

  const getPerformanceLabel = (views: number) => {
    if (views >= averageBaselineViews * 1.5) return { label: "High", color: "text-green-500" }
    if (views <= averageBaselineViews * 0.5) return { label: "Low", color: "text-red-500" }
    return { label: "Medium", color: "text-yellow-500" }
  }

  const getPreviewText = (text: string) => {
    const maxLength = 100
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }

  return (
    <div className="overflow-x-auto rounded-lg bg-[#192734] border border-[#38444d] shadow-lg">
      {loading ? (
        <div className="p-10 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-[#fe2c55] border-r-2 border-[#fe2c55] border-b-2 border-transparent"></div>
          <p className="mt-4 text-[#8899a6] font-medium">Loading videos...</p>
        </div>
      ) : videos.length === 0 ? (
        <div className="p-10 text-center">
          {searchQuery ? (
            <div>
              <p className="text-xl mb-2 font-semibold text-[#c4cfd6]">No matching videos found</p>
              <p className="text-[#8899a6]">Try adjusting your search query</p>
            </div>
          ) : (
            <div>
              <p className="text-xl mb-2 font-semibold text-[#c4cfd6]">No videos found for this client</p>
              <p className="text-[#8899a6]">Videos will appear here once created</p>
            </div>
          )}
        </div>
      ) : (
        <div className="relative">
          <table className="w-full border-collapse font-sans">
            <thead>
              <tr className="border-b border-[#38444d] text-left bg-[#1e2c3a]">
                <th className="sticky left-0 z-10 p-5 font-semibold text-[#8899a6] bg-[#1e2c3a] min-w-[250px]">Video</th>
                <th
                  className="p-5 font-semibold text-[#8899a6] cursor-pointer whitespace-nowrap"
                  onClick={() => handleSort("playcount")}
                >
                  <div className="flex items-center">
                    <Play className="h-4 w-4 mr-2" />
                    Views
                    {sortColumn === "playcount" ? (
                      <ArrowUpDown className={`h-4 w-4 ml-2 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                    ) : (
                      <ArrowUpDown className="h-4 w-4 ml-2" />
                    )}
                  </div>
                </th>
                <th
                  className="p-5 font-semibold text-[#8899a6] cursor-pointer whitespace-nowrap"
                  onClick={() => handleSort("diggcount")}
                >
                  <div className="flex items-center">
                    <Heart className="h-4 w-4 mr-2" />
                    Likes
                    {sortColumn === "diggcount" ? (
                      <ArrowUpDown className={`h-4 w-4 ml-2 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                    ) : (
                      <ArrowUpDown className="h-4 w-4 ml-2" />
                    )}
                  </div>
                </th>
                <th
                  className="p-5 font-semibold text-[#8899a6] cursor-pointer whitespace-nowrap"
                  onClick={() => handleSort("commentcount")}
                >
                  <div className="flex items-center">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Comments
                    {sortColumn === "commentcount" ? (
                      <ArrowUpDown className={`h-4 w-4 ml-2 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                    ) : (
                      <ArrowUpDown className="h-4 w-4 ml-2" />
                    )}
                  </div>
                </th>
                <th
                  className="p-5 font-semibold text-[#8899a6] cursor-pointer whitespace-nowrap"
                  onClick={() => handleSort("date")}
                >
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Date
                    {sortColumn === "date" ? (
                      <ArrowUpDown className={`h-4 w-4 ml-2 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                    ) : (
                      <ArrowUpDown className="h-4 w-4 ml-2" />
                    )}
                  </div>
                </th>
                <th className="p-5 font-semibold text-[#8899a6] text-center whitespace-nowrap">Performance</th>
                <th className="p-5 font-semibold text-[#8899a6] text-center whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#38444d]">
              {sortedVideos.map((video) => {
                const performance = getPerformanceLabel(video.playcount)
                return (
                  <tr key={video.id} className="hover:bg-[#22303c] transition-colors duration-150">
                    <td className="sticky left-0 z-10 p-0 bg-[#fe2c5515]">
                      <div className="p-5 border-l-4 border-[#fe2c55] h-full">
                        <div className="flex items-start gap-4">
                          <div 
                            className="relative h-20 w-20 overflow-hidden rounded-lg flex-shrink-0 cursor-pointer"
                            onClick={() => setSelectedVideo(video)}
                          >
                            <img
                              src={video.thumbnail || "/placeholder.svg"}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
                              <Play className="h-8 w-8 text-white" fill="white" />
                            </div>
                          </div>
                          <div>
                            <div 
                              className="font-semibold text-[#c4cfd6] hover:text-[#fe2c55] cursor-pointer transition-colors duration-200"
                              onClick={() => setSelectedVideo(video)}
                            >
                              {getPreviewText(video.text)}
                            </div>
                            <div className="flex items-center mt-2 text-xs text-[#8899a6]">
                              <span className="font-medium">@{client.tiktok_username || "tiktok_user"}</span>
                              <span className="mx-1">•</span>
                              <span>{formatDate(video.date)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="font-medium text-[#a9b9c6]">{formatNumber(video.playcount)}</div>
                    </td>
                    <td className="p-5">
                      <div className="font-medium text-[#a9b9c6]">{formatNumber(video.diggcount)}</div>
                    </td>
                    <td className="p-5">
                      <div className="font-medium text-[#a9b9c6]">{formatNumber(video.commentcount)}</div>
                    </td>
                    <td className="p-5">
                      <div className="font-medium text-[#a9b9c6]">{formatDate(video.date)}</div>
                    </td>
                    <td className="p-5">
                      <div className="flex flex-col items-center space-y-1">
                        <div className={`text-sm ${performance.color}`}>{performance.label}</div>
                        <span className="text-gray-400 text-xs">
                          {Math.round((video.playcount / averageBaselineViews) * 100)}%
                        </span>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex justify-center space-x-4">
                        <button
                          onClick={() => setSelectedVideo(video)}
                          className="text-[#8899a6] hover:text-[#c4cfd6] p-2 rounded-full hover:bg-[#38444d] transition-colors duration-200"
                          title="Preview Video"
                        >
                          <Play className="h-4 w-4" />
                        </button>
                        <a
                          href={`https://www.tiktok.com/@${client.tiktok_username}/video/${video.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#8899a6] hover:text-[#c4cfd6] p-2 rounded-full hover:bg-[#38444d] transition-colors duration-200"
                          title="View on TikTok"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* TikTok Video Preview Modal */}
      <TikTokPostPreview
        video={selectedVideo}
        client={client}
        open={!!selectedVideo}
        onOpenChange={(open) => !open && setSelectedVideo(null)}
      />
    </div>
  )
}
