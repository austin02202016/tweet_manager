"use client"

import { useRef } from "react"
import { ThumbsUp, MessageCircle, Share2, X, Play, Clock, ExternalLink } from "lucide-react"
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { formatNumber, formatDuration } from "@/lib/utils"
import type { YouTubeVideo } from "@/types/youtube"
import type { Client } from "@/types/client"

interface YouTubePostPreviewProps {
  video: YouTubeVideo | null
  client: Client | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function YouTubePostPreview({ video, client, open, onOpenChange }: YouTubePostPreviewProps) {
  const contentRef = useRef<HTMLDivElement>(null)

  if (!video) return null

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Unknown date"

    const postDate = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - postDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return "1 day ago"
    if (diffDays < 30) return `${diffDays} days ago`

    const diffMonths = Math.floor(diffDays / 30)
    if (diffMonths === 1) return "1 month ago"
    if (diffMonths < 12) return `${diffMonths} months ago`

    return postDate.toLocaleDateString()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] max-h-[600px] p-0 overflow-hidden bg-[#192734] border border-[#38444d] text-white rounded-xl shadow-xl">
        <div className="flex items-center justify-between p-3 border-b border-[#38444d]">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-[#38444d] text-[#a9b9c6] border-[#38444d] flex items-center gap-1">
              <Play className="h-3 w-3" />
              <span>YouTube</span>
            </Badge>
            {video.duration && (
              <Badge variant="outline" className="bg-[#38444d] text-[#a9b9c6] border-[#38444d] flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{formatDuration(video.duration)}</span>
              </Badge>
            )}
          </div>
          <DialogClose className="h-8 w-8 rounded-full hover:bg-[#253341] flex items-center justify-center">
            <X className="h-4 w-4 text-[#8899a6]" />
          </DialogClose>
        </div>

        <div
          className="overflow-y-auto scrollbar-hide"
          style={{
            maxHeight: "calc(600px - 110px)",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
          ref={contentRef}
        >
          <div className="p-4">
            <div className="rounded-lg overflow-hidden border border-[#38444d] relative mb-4">
              <div className="aspect-video bg-black">
                <img
                  src={video.thumbnailurl || "/placeholder.svg?height=720&width=1280"}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <div className="w-16 h-16 rounded-full bg-[#FF0000] flex items-center justify-center">
                    <Play className="h-8 w-8 text-white ml-1" fill="white" />
                  </div>
                </div>
              </div>
            </div>

            <h3 className="text-lg font-bold text-white mb-2">{video.text || "Untitled Video"}</h3>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#38444d] flex items-center justify-center overflow-hidden flex-shrink-0">
                  <span className="text-sm font-bold text-[#8899a6]">
                    {video.channelname?.charAt(0).toUpperCase() || "Y"}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-white">{video.channelname || "YouTube Channel"}</div>
                  <div className="text-xs text-[#8899a6]">{formatDate(video.date)}</div>
                </div>
              </div>

              <a
                href={video.input || `https://www.youtube.com/watch?v=${video.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[#8899a6] hover:text-[#FF0000] transition-colors px-3 py-1 rounded-full border border-[#38444d] hover:border-[#FF0000]"
              >
                <ExternalLink className="h-3 w-3" />
                <span className="text-xs">Watch on YouTube</span>
              </a>
            </div>

            <div className="flex items-center gap-4 p-3 bg-[#253341] rounded-lg">
              <div className="flex flex-col items-center">
                <div className="text-[#8899a6] text-xs mb-1">Views</div>
                <div className="font-bold text-white">{formatNumber(video.viewcount || 0)}</div>
              </div>
              <div className="h-8 w-px bg-[#38444d]"></div>
              <div className="flex flex-col items-center">
                <div className="text-[#8899a6] text-xs mb-1">Likes</div>
                <div className="font-bold text-white">{formatNumber(video.likes || 0)}</div>
              </div>
              <div className="h-8 w-px bg-[#38444d]"></div>
              <div className="flex flex-col items-center">
                <div className="text-[#8899a6] text-xs mb-1">Comments</div>
                <div className="font-bold text-white">{formatNumber(video.commentscount || 0)}</div>
              </div>
            </div>

            {video.descriptionlinks && video.descriptionlinks.length > 0 && (
              <div className="mt-4">
                <div className="text-sm font-medium text-[#8899a6] mb-2">Description Links</div>
                <div className="space-y-1">
                  {video.descriptionlinks.slice(0, 3).map((link, index) => (
                    <a
                      key={index}
                      href={link.url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-sm text-[#1d9bf0] hover:underline truncate"
                    >
                      {link.text || link.url || "Link"}
                    </a>
                  ))}
                  {video.descriptionlinks.length > 3 && (
                    <div className="text-xs text-[#8899a6]">+{video.descriptionlinks.length - 3} more links</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <style jsx global>{`
          /* Hide scrollbar for Chrome, Safari and Opera */
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          
          /* Hide scrollbar for IE, Edge and Firefox */
          .scrollbar-hide {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;  /* Firefox */
          }
        `}</style>

        <div className="p-3 border-t border-[#38444d] bg-[#15202b] flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <ThumbsUp className="h-4 w-4 text-[#8899a6]" />
              <span className="text-sm text-[#8899a6]">{formatNumber(video.likes || 0)}</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-[#8899a6]" />
              <span className="text-sm text-[#8899a6]">{formatNumber(video.commentscount || 0)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Play className="h-4 w-4 text-[#8899a6]" />
              <span className="text-sm text-[#8899a6]">{formatNumber(video.viewcount || 0)}</span>
            </div>
          </div>
          <div>
            <Share2 className="h-4 w-4 text-[#8899a6]" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

