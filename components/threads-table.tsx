"use client"

import { ExternalLink, Images, Linkedin, Instagram, Calendar } from "lucide-react"
import type { Thread } from "@/types/thread"
import type { Client } from "@/types/client"

interface ThreadsTableProps {
  threads: Thread[]
  loading: boolean
  searchQuery: string
  sortColumn: "views" | "likes" | "replies" | "date" | ""
  sortDirection: "asc" | "desc"
  handleSort: (column: "views" | "likes" | "replies" | "date" | "") => void
  handleThreadSelect: (thread: Thread) => void
  handleCarouselSelect: (thread: Thread) => void
  selectedClient: Client | null
}

export function ThreadsTable({
  threads,
  loading,
  searchQuery,
  sortColumn,
  sortDirection,
  handleSort,
  handleThreadSelect,
  handleCarouselSelect,
  selectedClient,
}: ThreadsTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg bg-[#192734] border border-[#38444d] shadow-lg">
      {loading ? (
        <div className="p-10 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-[#1d9bf0] border-r-2 border-[#1d9bf0] border-b-2 border-transparent"></div>
          <p className="mt-4 text-[#8899a6]">Loading threads...</p>
        </div>
      ) : threads.length === 0 ? (
        <div className="p-10 text-center">
          {searchQuery ? (
            <div>
              <p className="text-xl mb-2">No matching threads found</p>
              <p className="text-[#8899a6]">Try adjusting your search query</p>
            </div>
          ) : (
            <div>
              <p className="text-xl mb-2">No threads found for this client</p>
              <p className="text-[#8899a6]">Threads will appear here once created</p>
            </div>
          )}
        </div>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-[#38444d] text-left">
              <th className="p-5 font-medium text-[#8899a6]">Thread</th>
              <th className="p-5 font-medium text-[#8899a6] cursor-pointer" onClick={() => handleSort("views")}>
                <div className="flex items-center">
                  Views
                  {sortColumn === "views" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
                </div>
              </th>
              <th className="p-5 font-medium text-[#8899a6] cursor-pointer" onClick={() => handleSort("likes")}>
                <div className="flex items-center">
                  Likes
                  {sortColumn === "likes" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
                </div>
              </th>
              <th className="p-5 font-medium text-[#8899a6] cursor-pointer" onClick={() => handleSort("replies")}>
                <div className="flex items-center">
                  Replies
                  {sortColumn === "replies" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
                </div>
              </th>
              <th className="p-5 font-medium text-[#8899a6] cursor-pointer" onClick={() => handleSort("date")}>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Date
                  {sortColumn === "date" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
                </div>
              </th>
              <th className="p-5 font-medium text-[#8899a6] text-center">Repackaged</th>
              <th className="p-5 font-medium text-[#8899a6] text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {threads.map((thread) => (
              <tr key={thread.id} className="border-b border-[#38444d] hover:bg-[#22303c] transition-colors">
                <td className="p-5">
                  <div
                    className="font-medium hover:text-[#1d9bf0] cursor-pointer transition-colors duration-200"
                    onClick={() => handleThreadSelect(thread)}
                  >
                    {thread.title || "Untitled Thread"}
                  </div>
                  <div className="text-xs text-[#8899a6] mt-1 line-clamp-1">
                    {thread.tweets[0]?.text?.split("\n")[0]}
                  </div>
                </td>
                <td className="p-5">
                  <div className="font-medium">{thread.views?.toLocaleString() || "0"}</div>
                </td>
                <td className="p-5">
                  <div className="font-medium">{thread.likes?.toLocaleString() || "0"}</div>
                </td>
                <td className="p-5">
                  <div className="font-medium">{thread.replies?.toLocaleString() || "0"}</div>
                </td>
                <td className="p-5">
                  <div className="font-medium">
                    {thread.date
                      ? new Date(thread.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "Unknown"}
                  </div>
                </td>
                <td className="p-5">
                  <div className="flex justify-center space-x-3">
                    {thread.repackaged_linkedin ? (
                      <div
                        className="w-7 h-7 rounded-full bg-[#0A66C2] flex items-center justify-center shadow-md"
                        title="LinkedIn"
                      >
                        <Linkedin className="h-3.5 w-3.5 text-white" />
                      </div>
                    ) : (
                      <div
                        className="w-7 h-7 rounded-full bg-[#38444d] flex items-center justify-center opacity-30"
                        title="Not on LinkedIn"
                      >
                        <Linkedin className="h-3.5 w-3.5 text-white" />
                      </div>
                    )}

                    {thread.repackaged_instagram ? (
                      <div
                        className="w-7 h-7 rounded-full bg-[#E4405F] flex items-center justify-center shadow-md"
                        title="Instagram"
                      >
                        <Instagram className="h-3.5 w-3.5 text-white" />
                      </div>
                    ) : (
                      <div
                        className="w-7 h-7 rounded-full bg-[#38444d] flex items-center justify-center opacity-30"
                        title="Not on Instagram"
                      >
                        <Instagram className="h-3.5 w-3.5 text-white" />
                      </div>
                    )}
                  </div>
                </td>
                <td className="p-5">
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={() => handleCarouselSelect(thread)}
                      className="text-[#8899a6] hover:text-white p-2 rounded-full hover:bg-[#38444d] transition-colors duration-200"
                      title="Generate Images"
                    >
                      <Images className="h-4 w-4" />
                    </button>
                    <a
                      href={`https://twitter.com/${selectedClient?.twitter_username || "username"}/status/${
                        thread.tweets[0]?.id
                      }`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#8899a6] hover:text-white p-2 rounded-full hover:bg-[#38444d] transition-colors duration-200"
                      title="View on Twitter"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

