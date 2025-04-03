"use client"

import { useState } from "react"
import Image from "next/image"
import { ArrowUpDown, Calendar, Eye, MessageSquare, Share2, ThumbsUp } from "lucide-react"
import type { LinkedInPost, LinkedInSortColumn } from "@/types/linkedin"
import type { Client } from "@/types/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { LinkedInPostPreview } from "./linkedin-post-preview"

interface LinkedInTableProps {
  posts: LinkedInPost[]
  loading: boolean
  searchQuery: string
  sortColumn: LinkedInSortColumn
  sortDirection: "asc" | "desc"
  onSort: (column: LinkedInSortColumn, direction: "asc" | "desc") => void
  selectedClient: Client
}

export function LinkedInTable({
  posts,
  loading,
  searchQuery,
  sortColumn,
  sortDirection,
  onSort,
  selectedClient,
}: LinkedInTableProps) {
  const [selectedPost, setSelectedPost] = useState<LinkedInPost | null>(null)

  // Filter posts based on search query
  const filteredPosts = posts.filter((post) => post.text.toLowerCase().includes(searchQuery.toLowerCase()))

  // Sort posts
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (!sortColumn) return 0

    const valA = sortColumn === "date" ? new Date(a.date).getTime() : a[sortColumn]
    const valB = sortColumn === "date" ? new Date(b.date).getTime() : b[sortColumn]

    return sortDirection === "asc" ? valA - valB : valB - valA
  })

  const handleSort = (column: LinkedInSortColumn) => {
    onSort(column, sortColumn === column && sortDirection === "asc" ? "desc" : "asc")
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return formatDistanceToNow(date, { addSuffix: true })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-[#192734] rounded-xl border border-[#38444d] shadow-md">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-[#1da1f2] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-[#8899a6]">Loading LinkedIn posts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-[#192734] rounded-xl border border-[#38444d] shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#38444d] bg-[#15202b]">
                <th className="px-6 py-4 text-left text-sm font-medium text-[#8899a6]">Post</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-[#8899a6] w-32">
                  <button
                    className="flex items-center gap-1 hover:text-white transition-colors"
                    onClick={() => handleSort("date")}
                  >
                    <Calendar className="h-4 w-4" />
                    <span>Date</span>
                    {sortColumn === "date" && (
                      <ArrowUpDown className={`h-4 w-4 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                    )}
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-[#8899a6] w-24">
                  <button
                    className="flex items-center gap-1 hover:text-white transition-colors"
                    onClick={() => handleSort("numlikes")}
                  >
                    <ThumbsUp className="h-4 w-4" />
                    <span>Likes</span>
                    {sortColumn === "numlikes" && (
                      <ArrowUpDown className={`h-4 w-4 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                    )}
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-[#8899a6] w-24">
                  <button
                    className="flex items-center gap-1 hover:text-white transition-colors"
                    onClick={() => handleSort("numcomments")}
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>Comments</span>
                    {sortColumn === "numcomments" && (
                      <ArrowUpDown className={`h-4 w-4 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                    )}
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-[#8899a6] w-24">
                  <button
                    className="flex items-center gap-1 hover:text-white transition-colors"
                    onClick={() => handleSort("numshares")}
                  >
                    <Share2 className="h-4 w-4" />
                    <span>Shares</span>
                    {sortColumn === "numshares" && (
                      <ArrowUpDown className={`h-4 w-4 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                    )}
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-[#8899a6] w-24">
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>Preview</span>
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedPosts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-[#8899a6]">
                    No LinkedIn posts found
                  </td>
                </tr>
              ) : (
                sortedPosts.map((post) => (
                  <tr key={post.id} className="border-b border-[#38444d] hover:bg-[#253341] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-4">
                        {post.images && post.images.length > 0 ? (
                          <div className="relative w-16 h-16 flex-shrink-0">
                            <Image
                              src={post.images[0] || "/placeholder.svg"}
                              alt=""
                              fill
                              className="object-cover rounded-lg"
                            />
                            {post.images.length > 1 && (
                              <Badge className="absolute -top-2 -right-2 bg-[#1da1f2]">+{post.images.length - 1}</Badge>
                            )}
                          </div>
                        ) : (
                          <div className="w-16 h-16 bg-[#253341] rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-[#8899a6] text-xs">No image</span>
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="text-sm text-white line-clamp-2">{post.text}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs font-normal border-[#38444d] text-[#8899a6]">
                              {post.type}
                            </Badge>
                            <span className="text-xs text-[#8899a6]">{formatDate(post.date)}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#8899a6]">{new Date(post.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="h-4 w-4 text-[#1da1f2]" />
                        <span className="text-sm font-medium text-white">{post.numlikes.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4 text-[#1da1f2]" />
                        <span className="text-sm font-medium text-white">{post.numcomments.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Share2 className="h-4 w-4 text-[#1da1f2]" />
                        <span className="text-sm font-medium text-white">{post.numshares.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-[#1da1f2] border-[#38444d] hover:bg-[#253341] hover:text-white"
                        onClick={() => setSelectedPost(post)}
                      >
                        Preview
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* LinkedIn Post Preview Modal */}
      <LinkedInPostPreview
        post={selectedPost}
        client={selectedClient}
        open={!!selectedPost}
        onOpenChange={(open) => !open && setSelectedPost(null)}
      />
    </div>
  )
}

