"use client"

import React, { useEffect, useState } from "react"
import { ExternalLink, Images, Linkedin, Instagram, Calendar, ArrowUpDown, Eye, MessageCircle, Repeat, Heart, BarChart2, Share2 } from "lucide-react"
import { formatDate, formatNumber } from "@/lib/utils"
import type { Thread, ThreadSortColumn } from "@/types/thread"
import type { Client } from "@/types/client"

interface ThreadsTableProps {
  threads: Thread[]
  onThreadSelect: (thread: Thread) => void
  onCarouselSelect: (thread: Thread, index: number) => void
  onSort: (column: ThreadSortColumn, direction: "asc" | "desc") => void
  sortColumn: ThreadSortColumn
  sortDirection: "asc" | "desc"
  selectedClient: Client | null
}

export function ThreadsTable({
  threads,
  onThreadSelect,
  onCarouselSelect,
  onSort,
  sortColumn,
  sortDirection,
  selectedClient,
}: ThreadsTableProps) {
  const [avgBaseline, setAvgBaseline] = useState<number>(0)

  useEffect(() => {
    if (threads.length > 0) {
      // Calculate average baseline from views, filtering out undefined/null values
      const validThreads = threads.filter(t => typeof t.views === 'number' && t.views > 0)
      
      if (validThreads.length > 0) {
        const totalViews = validThreads.reduce((sum, t) => sum + t.views, 0)
        const average = totalViews / validThreads.length
        console.log('Valid threads:', validThreads)
        console.log('Total views:', totalViews)
        console.log('Average baseline:', average)
        setAvgBaseline(average)
      } else {
        setAvgBaseline(0)
      }
    } else {
      setAvgBaseline(0)
    }
  }, [threads])

  const getSortIcon = (column: ThreadSortColumn) => {
    if (sortColumn !== column) return <ArrowUpDown className="h-4 w-4" />
    return sortDirection === "asc" ? (
      <ArrowUpDown className="h-4 w-4 rotate-180" />
    ) : (
      <ArrowUpDown className="h-4 w-4" />
    )
  }

  const getPerformanceLabel = (views: number | undefined | null, allThreads: Thread[]): { label: string; color: string; percentage: string } => {
    // Filter out threads with undefined/null views
    const validThreads = allThreads.filter(thread => thread.views !== undefined && thread.views !== null && thread.views > 0);

    // If no valid threads or views is undefined/null/0, return N/A
    if (!views || views === 0 || validThreads.length === 0) {
      return { label: 'N/A', color: 'text-gray-500', percentage: '0%' };
    }

    // Calculate percentile based on position in sorted array
    const sortedViews = validThreads.map(t => t.views || 0).sort((a, b) => b - a);
    const position = sortedViews.indexOf(views);
    const percentile = Math.round((position / (sortedViews.length - 1)) * 100);

    // Determine label and color based on percentile
    let label: string;
    let color: string;

    if (percentile <= 20) {
      label = 'High';
      color = 'text-green-500';
    } else if (percentile <= 60) {
      label = 'Medium';
      color = 'text-yellow-500';
    } else {
      label = 'Low';
      color = 'text-red-500';
    }

    // Calculate inverse percentage (100% for best, decreasing from there)
    const inversePercentage = 100 - percentile;

    return {
      label,
      color,
      percentage: `${inversePercentage}%`
    };
  };

  // Function to get first 5-6 words of text
  const getPreviewText = (text: string | undefined) => {
    if (!text) return ""
    const words = text.split(" ")
    return words.slice(0, 6).join(" ") + (words.length > 6 ? "..." : "")
  }

  return (
    <div className="overflow-x-auto rounded-lg bg-[#192734] border border-[#38444d] shadow-lg">
      {threads.length === 0 ? (
        <div className="p-10 text-center">
          <div>
            <p className="text-xl mb-2 font-semibold text-[#c4cfd6]">No threads found</p>
            <p className="text-[#8899a6]">Threads will appear here once created</p>
          </div>
        </div>
      ) : (
        <div className="relative">
          <table className="w-full border-collapse font-sans">
            <thead>
              <tr className="border-b border-[#38444d] text-left bg-[#1e2c3a]">
                <th className="sticky left-0 z-10 p-5 font-semibold text-[#8899a6] bg-[#1e2c3a] min-w-[250px]">
                  Thread
                </th>
                <th
                  className="p-5 font-semibold text-[#8899a6] cursor-pointer whitespace-nowrap"
                  onClick={() => onSort("views", sortDirection === "asc" ? "desc" : "asc")}
                >
                  <div className="flex items-center">
                    Views
                    {getSortIcon("views")}
                  </div>
                </th>
                <th
                  className="p-5 font-semibold text-[#8899a6] cursor-pointer whitespace-nowrap"
                  onClick={() => onSort("likes", sortDirection === "asc" ? "desc" : "asc")}
                >
                  <div className="flex items-center">
                    Likes
                    {getSortIcon("likes")}
                  </div>
                </th>
                <th
                  className="p-5 font-semibold text-[#8899a6] cursor-pointer whitespace-nowrap"
                  onClick={() => onSort("replies", sortDirection === "asc" ? "desc" : "asc")}
                >
                  <div className="flex items-center">
                    Replies
                    {getSortIcon("replies")}
                  </div>
                </th>
                <th
                  className="p-5 font-semibold text-[#8899a6] cursor-pointer whitespace-nowrap"
                  onClick={() => onSort("date", sortDirection === "asc" ? "desc" : "asc")}
                >
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Date
                    {getSortIcon("date")}
                  </div>
                </th>
                <th className="p-5 font-semibold text-[#8899a6] text-center whitespace-nowrap">Performance</th>
                <th className="p-5 font-semibold text-[#8899a6] text-center whitespace-nowrap">Repackaged</th>
                <th className="p-5 font-semibold text-[#8899a6] text-center whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#38444d]">
              {threads.map((thread) => {
                const performance = getPerformanceLabel(thread.views, threads)
                return (
                  <tr key={thread.id} className="hover:bg-[#22303c] transition-colors duration-150">
                    <td className="sticky left-0 z-10 p-0 bg-[#1d9bf015]">
                      <div className="p-5 border-l-4 border-[#1d9bf0] h-full">
                        <div
                          className="font-semibold text-[#c4cfd6] hover:text-[#1d9bf0] cursor-pointer transition-colors duration-200"
                          onClick={() => onThreadSelect(thread)}
                        >
                          {thread.title || "Untitled Thread"}
                        </div>
                        <div className="text-sm text-[#8899a6] mt-1">{getPreviewText(thread.tweets[0]?.text)}</div>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="font-medium text-[#a9b9c6]">{formatNumber(thread.views || 0)}</div>
                    </td>
                    <td className="p-5">
                      <div className="font-medium text-[#a9b9c6]">{formatNumber(thread.likes || 0)}</div>
                    </td>
                    <td className="p-5">
                      <div className="font-medium text-[#a9b9c6]">{formatNumber(thread.replies || 0)}</div>
                    </td>
                    <td className="p-5">
                      <div className="font-medium text-[#a9b9c6]">
                        {formatDate(thread.date)}
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex flex-col items-center space-y-1">
                        <div className={`text-sm ${performance.color}`}>
                          {performance.label}
                        </div>
                        {performance.label !== 'N/A' && (
                          <span className="text-gray-400 text-xs">({performance.percentage})</span>
                        )}
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex justify-center space-x-3">
                        {thread.repackaged_linkedin ? (
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

                        {thread.repackaged_instagram ? (
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
                            onCarouselSelect(thread, 0)
                          }}
                          className="text-[#8899a6] hover:text-[#c4cfd6] p-2 rounded-full hover:bg-[#38444d] transition-colors duration-200"
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
                          className="text-[#8899a6] hover:text-[#c4cfd6] p-2 rounded-full hover:bg-[#38444d] transition-colors duration-200"
                          title="View on Twitter"
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
    </div>
  )
}

