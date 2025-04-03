"use client"

import { useEffect, useState } from "react"
import {
  ExternalLink,
  Images,
  Linkedin,
  Instagram,
  Calendar,
  ArrowUpDown,
  Eye,
  MessageCircle,
  Heart,
  Music,
  Video,
  Clock,
  Users,
  Tag,
} from "lucide-react"
import { instagramFormatDate, formatNumber, formatDuration } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { InstagramPostPreview } from "./instagram-post-preview"
import type { InstagramPost, InstagramSortColumn } from "@/types/instagram"
import type { Client } from "@/types/client"

interface InstagramTableProps {
  posts: InstagramPost[]
  loading: boolean
  searchQuery: string
  sortColumn: InstagramSortColumn
  sortDirection: "asc" | "desc"
  handleSort: (column: InstagramSortColumn) => void
  handleCarouselSelect: (post: InstagramPost) => void
  selectedClient: Client | null
}

export function InstagramTable({
  posts,
  loading,
  searchQuery,
  sortColumn,
  sortDirection,
  handleSort,
  handleCarouselSelect,
  selectedClient,
}: InstagramTableProps) {
  const [selectedPost, setSelectedPost] = useState<InstagramPost | null>(null)
  const [avgBaseline, setAvgBaseline] = useState<{
    likes: number
    comments: number
    views: number
  }>({ likes: 0, comments: 0, views: 0 })

  useEffect(() => {
    if (posts.length > 0) {
      // Calculate average baselines for different metrics
      const validPostsLikes = posts.filter((p) => typeof p.likescount === "number" && p.likescount > 0)
      const validPostsComments = posts.filter((p) => typeof p.commentscount === "number" && p.commentscount > 0)
      const validPostsViews = posts.filter((p) => typeof p.videoviewcount === "number" && p.videoviewcount > 0)

      let avgLikes = 0
      let avgComments = 0
      let avgViews = 0

      if (validPostsLikes.length > 0) {
        const totalLikes = validPostsLikes.reduce((sum, p) => sum + (p.likescount || 0), 0)
        avgLikes = totalLikes / validPostsLikes.length
      }

      if (validPostsComments.length > 0) {
        const totalComments = validPostsComments.reduce((sum, p) => sum + (p.commentscount || 0), 0)
        avgComments = totalComments / validPostsComments.length
      }

      if (validPostsViews.length > 0) {
        const totalViews = validPostsViews.reduce((sum, p) => sum + (p.videoviewcount || 0), 0)
        avgViews = totalViews / validPostsViews.length
      }

      setAvgBaseline({ likes: avgLikes, comments: avgComments, views: avgViews })
    }
  }, [posts])

  // Filter posts based on search query
  const filteredPosts = posts.filter(
    (post) =>
      post.caption?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.ownerusername?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.hashtags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  // Sort posts based on sortColumn and sortDirection
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (!sortColumn || sortColumn === "") return 0

    // Handle null values by treating them as 0
    let valA: number | string | Date = 0
    let valB: number | string | Date = 0

    if (sortColumn === "timestamp") {
      valA = a.timestamp ? new Date(a.timestamp).getTime() : 0
      valB = b.timestamp ? new Date(b.timestamp).getTime() : 0
    } else if (sortColumn === "likescount") {
      valA = a.likescount || 0
      valB = b.likescount || 0
    } else if (sortColumn === "commentscount") {
      valA = a.commentscount || 0
      valB = b.commentscount || 0
    } else if (sortColumn === "videoviewcount") {
      valA = a.videoviewcount || 0
      valB = b.videoviewcount || 0
    } else if (sortColumn === "videoplaycount") {
      valA = a.videoplaycount || 0
      valB = b.videoplaycount || 0
    }

    // Sort based on direction
    if (sortDirection === "asc") {
      return valA > valB ? 1 : valA < valB ? -1 : 0
    } else {
      return valA < valB ? 1 : valA > valB ? -1 : 0
    }
  })

  const getSortIcon = (column: InstagramSortColumn) => {
    if (sortColumn !== column) return <ArrowUpDown className="h-4 w-4" />
    return sortDirection === "asc" ? (
      <ArrowUpDown className="h-4 w-4 rotate-180" />
    ) : (
      <ArrowUpDown className="h-4 w-4" />
    )
  }

  const getPerformanceLabel = (
    post: InstagramPost,
    allPosts: InstagramPost[],
  ): { label: string; color: string; percentage: string } => {
    // Determine which metric to use based on post type
    let metric: number | null = null
    let metricType = ""
    let validPosts: InstagramPost[] = []

    if (post.type === "video" && post.videoviewcount) {
      metric = post.videoviewcount
      metricType = "views"
      validPosts = allPosts.filter(
        (p) =>
          p.type === "video" && p.videoviewcount !== undefined && p.videoviewcount !== null && p.videoviewcount > 0,
      )
    } else {
      // For images or when video views aren't available, use likes
      metric = post.likescount
      metricType = "likes"
      validPosts = allPosts.filter((p) => p.likescount !== undefined && p.likescount !== null && p.likescount > 0)
    }

    // If no valid metric or posts, return N/A
    if (!metric || metric === 0 || validPosts.length === 0) {
      return { label: "N/A", color: "text-gray-500", percentage: "0%" }
    }

    // Calculate percentile based on position in sorted array
    const sortedMetrics = validPosts
      .map((p) => (metricType === "views" ? p.videoviewcount || 0 : p.likescount || 0))
      .sort((a, b) => b - a)

    const position = sortedMetrics.indexOf(metric)
    const percentile = Math.round((position / (sortedMetrics.length - 1)) * 100)

    // Determine label and color based on percentile
    let label: string
    let color: string

    if (percentile <= 20) {
      label = "High"
      color = "text-green-500"
    } else if (percentile <= 60) {
      label = "Medium"
      color = "text-yellow-500"
    } else {
      label = "Low"
      color = "text-red-500"
    }

    // Calculate inverse percentage (100% for best, decreasing from there)
    const inversePercentage = 100 - percentile

    return {
      label,
      color,
      percentage: `${inversePercentage}%`,
    }
  }

  // Function to get first 5-6 words of text
  const getPreviewText = (text: string | undefined | null) => {
    if (!text) return ""
    const words = text.split(" ")
    return words.slice(0, 6).join(" ") + (words.length > 6 ? "..." : "")
  }

  // Function to get post type badge
  const getPostTypeBadge = (type: string | null) => {
    if (!type) return null

    switch (type.toLowerCase()) {
      case "video":
        return (
          <Badge variant="outline" className="bg-[#38444d] text-[#a9b9c6] border-[#38444d] flex items-center gap-1">
            <Video className="h-3 w-3" />
            <span>Video</span>
          </Badge>
        )
      case "carousel_album":
        return (
          <Badge variant="outline" className="bg-[#38444d] text-[#a9b9c6] border-[#38444d] flex items-center gap-1">
            <Images className="h-3 w-3" />
            <span>Carousel</span>
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-[#38444d] text-[#a9b9c6] border-[#38444d] flex items-center gap-1">
            <Instagram className="h-3 w-3" />
            <span>Image</span>
          </Badge>
        )
    }
  }

  return (
    <div className="overflow-x-auto rounded-lg bg-[#192734] border border-[#38444d] shadow-lg">
      {loading ? (
        <div className="p-10 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-[#1d9bf0] border-r-2 border-[#1d9bf0] border-b-2 border-transparent"></div>
          <p className="mt-4 text-[#8899a6] font-medium">Loading posts...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="p-10 text-center">
          {searchQuery ? (
            <div>
              <p className="text-xl mb-2 font-semibold text-[#c4cfd6]">No matching posts found</p>
              <p className="text-[#8899a6]">Try adjusting your search query</p>
            </div>
          ) : (
            <div>
              <p className="text-xl mb-2 font-semibold text-[#c4cfd6]">No posts found for this client</p>
              <p className="text-[#8899a6]">Posts will appear here once created</p>
            </div>
          )}
        </div>
      ) : (
        <div className="relative">
          <table className="w-full border-collapse font-sans">
            <thead>
              <tr className="border-b border-[#38444d] text-left bg-[#1e2c3a]">
                <th className="sticky left-0 z-10 p-5 font-semibold text-[#8899a6] bg-[#1e2c3a] min-w-[250px]">Post</th>
                <th
                  className="p-5 font-semibold text-[#8899a6] cursor-pointer whitespace-nowrap"
                  onClick={() => handleSort("likescount")}
                >
                  <div className="flex items-center">
                    <Heart className="h-4 w-4 mr-2" />
                    Likes
                    {getSortIcon("likescount")}
                  </div>
                </th>
                <th
                  className="p-5 font-semibold text-[#8899a6] cursor-pointer whitespace-nowrap"
                  onClick={() => handleSort("commentscount")}
                >
                  <div className="flex items-center">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Comments
                    {getSortIcon("commentscount")}
                  </div>
                </th>
                <th
                  className="p-5 font-semibold text-[#8899a6] cursor-pointer whitespace-nowrap"
                  onClick={() => handleSort("videoviewcount")}
                >
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 mr-2" />
                    Views
                    {getSortIcon("videoviewcount")}
                  </div>
                </th>
                <th
                  className="p-5 font-semibold text-[#8899a6] cursor-pointer whitespace-nowrap"
                  onClick={() => handleSort("timestamp")}
                >
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Date
                    {getSortIcon("timestamp")}
                  </div>
                </th>
                <th className="p-5 font-semibold text-[#8899a6] text-center whitespace-nowrap">Performance</th>
                <th className="p-5 font-semibold text-[#8899a6] text-center whitespace-nowrap">Repackaged</th>
                <th className="p-5 font-semibold text-[#8899a6] text-center whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#38444d]">
              {sortedPosts.map((post) => {
                const performance = getPerformanceLabel(post, posts)
                return (
                  <tr key={post.id} className="hover:bg-[#22303c] transition-colors duration-150">
                    <td className="sticky left-0 z-10 p-0 bg-[#1d9bf015]">
                      <div className="p-5 border-l-4 border-[#1d9bf0] h-full">
                        <div className="flex items-center gap-2 mb-1.5">
                          {getPostTypeBadge(post.type)}
                          {post.videoduration && (
                            <Badge
                              variant="outline"
                              className="bg-[#38444d] text-[#a9b9c6] border-[#38444d] flex items-center gap-1"
                            >
                              <Clock className="h-3 w-3" />
                              <span>{formatDuration(post.videoduration)}</span>
                            </Badge>
                          )}
                          {post.musicinfo && post.musicinfo.title && (
                            <Badge
                              variant="outline"
                              className="bg-[#38444d] text-[#a9b9c6] border-[#38444d] flex items-center gap-1"
                            >
                              <Music className="h-3 w-3" />
                              <span>{post.musicinfo.title}</span>
                            </Badge>
                          )}
                        </div>
                        <div
                          className="font-semibold text-[#c4cfd6] hover:text-[#1d9bf0] cursor-pointer transition-colors duration-200"
                          onClick={() => setSelectedPost(post)}
                        >
                          {post.caption ? getPreviewText(post.caption) : "Untitled Post"}
                        </div>
                        <div className="flex items-center mt-2 text-xs text-[#8899a6]">
                          <span className="font-medium">{post.ownerusername || "unknown"}</span>
                          {post.taggedusers && post.taggedusers.length > 0 && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center ml-2">
                                    <Tag className="h-3 w-3 mr-1" />
                                    <span>{post.taggedusers.length}</span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>
                                    Tagged users: {post.taggedusers.slice(0, 3).join(", ")}
                                    {post.taggedusers.length > 3 ? "..." : ""}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          {post.coauthorproducers && post.coauthorproducers.length > 0 && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center ml-2">
                                    <Users className="h-3 w-3 mr-1" />
                                    <span>{post.coauthorproducers.length}</span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>
                                    Co-authors: {post.coauthorproducers.slice(0, 3).join(", ")}
                                    {post.coauthorproducers.length > 3 ? "..." : ""}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="font-medium text-[#a9b9c6]">{formatNumber(post.likescount || 0)}</div>
                    </td>
                    <td className="p-5">
                      <div className="font-medium text-[#a9b9c6]">{formatNumber(post.commentscount || 0)}</div>
                    </td>
                    <td className="p-5">
                      <div className="font-medium text-[#a9b9c6]">
                        {post.type === "video" ? formatNumber(post.videoviewcount || 0) : "-"}
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="font-medium text-[#a9b9c6]">
                        {post.timestamp ? instagramFormatDate(new Date(post.timestamp)) : "-"}
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex flex-col items-center space-y-1">
                        <div className={`text-sm ${performance.color}`}>{performance.label}</div>
                        {performance.label !== "N/A" && (
                          <span className="text-gray-400 text-xs">({performance.percentage})</span>
                        )}
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex justify-center space-x-3">
                        {post.repackaged_linkedin ? (
                          <div
                            className="w-8 h-8 rounded-full bg-[#0A66C2] flex items-center justify-center shadow-md hover:brightness-110 transition-all"
                            title="LinkedIn"
                          >
                            <Linkedin className="h-4 w-4 text-[#e0e6eb]" />
                          </div>
                        ) : (
                          <div
                            className="w-8 h-8 rounded-full bg-[#38444d] flex items-center justify-center opacity-30"
                            title="Not on LinkedIn"
                          >
                            <Linkedin className="h-4 w-4 text-[#e0e6eb]" />
                          </div>
                        )}

                        {post.repackaged_instagram ? (
                          <div
                            className="w-8 h-8 rounded-full bg-[#E4405F] flex items-center justify-center shadow-md hover:brightness-110 transition-all"
                            title="Instagram"
                          >
                            <Instagram className="h-4 w-4 text-[#e0e6eb]" />
                          </div>
                        ) : (
                          <div
                            className="w-8 h-8 rounded-full bg-[#38444d] flex items-center justify-center opacity-30"
                            title="Not on Instagram"
                          >
                            <Instagram className="h-4 w-4 text-[#e0e6eb]" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex justify-center space-x-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleCarouselSelect(post)
                          }}
                          className="text-[#8899a6] hover:text-[#c4cfd6] p-2 rounded-full hover:bg-[#38444d] transition-colors duration-200"
                          title="Generate Images"
                        >
                          <Images className="h-4 w-4" />
                        </button>
                        <a
                          href={post.inputurl || `https://instagram.com/p/${post.shortcode}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#8899a6] hover:text-[#c4cfd6] p-2 rounded-full hover:bg-[#38444d] transition-colors duration-200"
                          title="View on Instagram"
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

      {/* Instagram Post Preview Modal */}
      <InstagramPostPreview
        post={selectedPost}
        client={selectedClient}
        open={!!selectedPost}
        onOpenChange={(open) => !open && setSelectedPost(null)}
      />
    </div>
  )
}

