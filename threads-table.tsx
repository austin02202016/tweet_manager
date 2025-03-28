"use client"

import { useState } from "react"
import type { Thread } from "@/types/thread"
import { ArrowUpDown, ExternalLink, Linkedin, Instagram } from "lucide-react"

interface ThreadsTableProps {
  threads: Thread[]
  onThreadSelect: (thread: Thread) => void
}

type SortColumn = "views" | "likes" | "replies" | "date" | ""

export function ThreadsTable({ threads, onThreadSelect }: ThreadsTableProps) {
  const [sortColumn, setSortColumn] = useState<SortColumn>("")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      // Flip direction
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortColumn(column)
      setSortDirection("desc")
    }
  }

  const sortedThreads = [...threads].sort((a, b) => {
    if (!sortColumn) return 0

    const valA = sortColumn === "date" ? new Date(a.date).getTime() : (a as any)[sortColumn]
    const valB = sortColumn === "date" ? new Date(b.date).getTime() : (b as any)[sortColumn]

    return sortDirection === "asc" ? valA - valB : valB - valA
  })

  const SortableHeader = ({ column, label }: { column: SortColumn; label: string }) => (
    <th
      className="p-3 font-medium text-twitter-gray cursor-pointer hover:text-white transition-colors"
      onClick={() => handleSort(column)}
    >
      <div className="flex items-center space-x-1">
        <span>{label}</span>
        <ArrowUpDown
          className={`w-3.5 h-3.5 ${sortColumn === column ? "text-twitter-blue" : "text-twitter-gray/50"}`}
        />
      </div>
    </th>
  )

  return (
    <div className="overflow-x-auto rounded-lg bg-twitter-darkBlue">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-twitter-lightGray text-left">
            <th className="p-3 font-medium text-twitter-gray">Thread</th>
            <SortableHeader column="views" label="Views" />
            <SortableHeader column="likes" label="Likes" />
            <SortableHeader column="replies" label="Replies" />
            <SortableHeader column="date" label="Date" />
            <th className="p-3 font-medium text-twitter-gray text-center">Platforms</th>
            <th className="p-3 font-medium text-twitter-gray"></th>
          </tr>
        </thead>
        <tbody>
          {sortedThreads.map((thread) => (
            <tr
              key={thread.id}
              className="border-b border-twitter-lightGray hover:bg-twitter-black/30 transition-colors"
            >
              <td className="p-3">
                <div className="line-clamp-1 font-medium">{thread.title}</div>
              </td>
              <td className="p-3">{thread.views.toLocaleString()}</td>
              <td className="p-3">{thread.likes.toLocaleString()}</td>
              <td className="p-3">{thread.replies.toLocaleString()}</td>
              <td className="p-3">{new Date(thread.date).toLocaleDateString()}</td>
              <td className="p-3">
                <div className="flex justify-center space-x-4">
                  <Linkedin
                    className={`h-5 w-5 ${
                      thread.repackaged_linkedin ? "text-[#0A66C2]" : "text-twitter-lightGray/50"
                    } transition-colors`}
                  />
                  <Instagram
                    className={`h-5 w-5 ${
                      thread.repackaged_instagram ? "text-[#E4405F]" : "text-twitter-lightGray/50"
                    } transition-colors`}
                  />
                </div>
              </td>
              <td className="p-3">
                <button
                  onClick={() => onThreadSelect(thread)}
                  className="px-3 py-1 bg-twitter-blue text-white rounded-full text-sm hover:bg-twitter-blue/80 transition-colors flex items-center"
                >
                  <span>View</span>
                  <ExternalLink className="ml-1 w-3 h-3" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ThreadsTable

