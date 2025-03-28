"use client"

import { useState } from "react"
import { Twitter, Linkedin, Instagram, ArrowUp, ArrowDown } from "lucide-react"
import { ThreadsTable } from "./threads-table"
import { ThreadDetailModal } from "./thread-detail-modal"
import type { Thread } from "@/types/thread"

// Sample threads data
const sampleThreads: Thread[] = [
  {
    id: "1",
    created_at: "2023-03-15T10:30:00Z",
    client_id: "client123",
    title:
      "It's not about spending money or doing something crazy. It's about breaking the routine and creating unforgettable moments.",
    views: 45678,
    likes: 3210,
    replies: 156,
    date: "2023-03-15",
    repackaged_linkedin: true,
    repackaged_instagram: false,
    theme: "Lifestyle",
    tweets: [
      {
        id: "t1",
        created_at: "2023-03-15T10:30:00Z",
        thread_id: "1",
        author_id: "author123",
        text: "It's not about spending money or doing something crazy.\n\nIt's about breaking the routine and creating unforgettable moments.",
        reply_count: 45,
        retweet_count: 156,
        like_count: 1200,
        view_count: 45678,
        date_posted: "2023-03-15",
        quote_count: 12,
        media: [],
        extra_data: {},
      },
    ],
  },
  {
    id: "2",
    created_at: "2023-03-10T14:20:00Z",
    client_id: "client123",
    title: "What's your next mini-adventure?",
    views: 34567,
    likes: 2345,
    replies: 178,
    date: "2023-03-10",
    repackaged_linkedin: true,
    repackaged_instagram: true,
    theme: "Motivation",
    tweets: [
      {
        id: "t2",
        created_at: "2023-03-10T14:20:00Z",
        thread_id: "2",
        author_id: "author123",
        text: "If you're reading this:\n\nWhat's your next mini-adventure?",
        reply_count: 78,
        retweet_count: 98,
        like_count: 876,
        view_count: 34567,
        date_posted: "2023-03-10",
        quote_count: 8,
        media: [],
        extra_data: {},
      },
    ],
  },
  {
    id: "3",
    created_at: "2023-03-05T08:45:00Z",
    client_id: "client123",
    title: "The 4:30 am club changed my life. Here's why:",
    views: 28976,
    likes: 1987,
    replies: 134,
    date: "2023-03-05",
    repackaged_linkedin: false,
    repackaged_instagram: false,
    theme: "Productivity",
    tweets: [
      {
        id: "t3",
        created_at: "2023-03-05T08:45:00Z",
        thread_id: "3",
        author_id: "author123",
        text: "The 4:30 am club changed my life. Here's why:\n\n1. Quiet time for deep work\n2. No distractions\n3. Builds discipline\n4. Ahead of the competition\n5. More time for family later",
        reply_count: 56,
        retweet_count: 87,
        like_count: 765,
        view_count: 28976,
        date_posted: "2023-03-05",
        quote_count: 15,
        media: [],
        extra_data: {},
      },
    ],
  },
  {
    id: "4",
    created_at: "2023-03-01T16:10:00Z",
    client_id: "client123",
    title: "3 habits that transformed my productivity:",
    views: 23456,
    likes: 1654,
    replies: 98,
    date: "2023-03-01",
    repackaged_linkedin: false,
    repackaged_instagram: true,
    theme: "Productivity",
    tweets: [
      {
        id: "t4",
        created_at: "2023-03-01T16:10:00Z",
        thread_id: "4",
        author_id: "author123",
        text: "3 habits that transformed my productivity:\n\n1. Time blocking\n2. Single-tasking\n3. Regular breaks",
        reply_count: 34,
        retweet_count: 65,
        like_count: 543,
        view_count: 23456,
        date_posted: "2023-03-01",
        quote_count: 7,
        media: [],
        extra_data: {},
      },
    ],
  },
]

type Platform = "twitter" | "linkedin" | "instagram"

export default function ContentDashboard() {
  const [activePlatform, setActivePlatform] = useState<Platform>("twitter")
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null)

  const handleThreadSelect = (thread: Thread) => {
    setSelectedThread(thread)
  }

  const handleRepackagedChange = (platform: "linkedin" | "instagram", value: boolean) => {
    if (selectedThread) {
      // In a real app, you would update the thread in your database
      console.log(`Updated ${platform} repackaged status to ${value} for thread ${selectedThread.id}`)
    }
  }

  // Calculate total metrics
  const totalViews = sampleThreads.reduce((sum, thread) => sum + thread.views, 0)
  const totalLikes = sampleThreads.reduce((sum, thread) => sum + thread.likes, 0)
  const totalReplies = sampleThreads.reduce((sum, thread) => sum + thread.replies, 0)
  const repackagedCount = sampleThreads.filter((t) => t.repackaged_linkedin || t.repackaged_instagram).length

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Platform Tabs */}
        <div className="flex border-b border-twitter-lightGray/30 mb-6">
          <button
            className={`px-6 py-3 font-medium text-sm flex items-center ${
              activePlatform === "twitter"
                ? "text-twitter-blue border-b-2 border-twitter-blue"
                : "text-twitter-gray hover:text-white"
            }`}
            onClick={() => setActivePlatform("twitter")}
          >
            <Twitter className="h-4 w-4 mr-2" />
            Twitter
          </button>
          <button
            className={`px-6 py-3 font-medium text-sm flex items-center ${
              activePlatform === "linkedin"
                ? "text-[#0A66C2] border-b-2 border-[#0A66C2]"
                : "text-twitter-gray hover:text-white"
            }`}
            onClick={() => setActivePlatform("linkedin")}
          >
            <Linkedin className="h-4 w-4 mr-2" />
            LinkedIn
          </button>
          <button
            className={`px-6 py-3 font-medium text-sm flex items-center ${
              activePlatform === "instagram"
                ? "text-[#E4405F] border-b-2 border-[#E4405F]"
                : "text-twitter-gray hover:text-white"
            }`}
            onClick={() => setActivePlatform("instagram")}
          >
            <Instagram className="h-4 w-4 mr-2" />
            Instagram
          </button>
        </div>

        {activePlatform === "twitter" && (
          <>
            {/* Simple Dashboard Stats */}
            <div className="bg-twitter-darkBlue rounded-lg border border-twitter-lightGray/20 p-4 mb-6">
              <div className="grid grid-cols-4 gap-4">
                <div className="border-r border-twitter-lightGray/20 pr-4 last:border-0">
                  <div className="text-twitter-gray text-xs mb-1">Total Views</div>
                  <div className="text-xl font-bold">{totalViews.toLocaleString()}</div>
                  <div className="text-green-500 text-xs flex items-center mt-1">
                    <ArrowUp className="h-3 w-3 mr-1" />
                    8.2% this week
                  </div>
                </div>

                <div className="border-r border-twitter-lightGray/20 pr-4 last:border-0">
                  <div className="text-twitter-gray text-xs mb-1">Total Likes</div>
                  <div className="text-xl font-bold">{totalLikes.toLocaleString()}</div>
                  <div className="text-green-500 text-xs flex items-center mt-1">
                    <ArrowUp className="h-3 w-3 mr-1" />
                    12.5% this week
                  </div>
                </div>

                <div className="border-r border-twitter-lightGray/20 pr-4 last:border-0">
                  <div className="text-twitter-gray text-xs mb-1">Total Replies</div>
                  <div className="text-xl font-bold">{totalReplies.toLocaleString()}</div>
                  <div className="text-red-500 text-xs flex items-center mt-1">
                    <ArrowDown className="h-3 w-3 mr-1" />
                    3.1% this week
                  </div>
                </div>

                <div>
                  <div className="text-twitter-gray text-xs mb-1">Repackaged</div>
                  <div className="text-xl font-bold">
                    {repackagedCount}/{sampleThreads.length}
                  </div>
                  <div className="text-twitter-gray text-xs mt-1">threads repackaged</div>
                </div>
              </div>
            </div>

            {/* Threads Table */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Recent Threads</h2>
              </div>
              <ThreadsTable threads={sampleThreads} onThreadSelect={handleThreadSelect} />
            </div>
          </>
        )}

        {activePlatform === "linkedin" && (
          <div className="text-center text-twitter-gray py-8 bg-twitter-darkBlue rounded-lg border border-twitter-lightGray/20">
            LinkedIn dashboard will be implemented in the next phase
          </div>
        )}

        {activePlatform === "instagram" && (
          <div className="text-center text-twitter-gray py-8 bg-twitter-darkBlue rounded-lg border border-twitter-lightGray/20">
            Instagram dashboard will be implemented in the next phase
          </div>
        )}
      </div>

      {selectedThread && (
        <ThreadDetailModal
          thread={selectedThread}
          onClose={() => setSelectedThread(null)}
          onRepackagedChange={handleRepackagedChange}
        />
      )}
    </div>
  )
}

