"use client"

import { useRef } from "react"
import { Heart, MessageCircle, Share2, Bookmark, X, Play, Calendar, Music } from 'lucide-react'
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { formatNumber } from "@/lib/utils"
import type { TikTokVideo } from "@/types/tiktok"
import type { Client } from "@/types/client"

interface TikTokPostPreviewProps {
  video: TikTokVideo | null
  client: Client | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TikTokPostPreview({ video, client, open, onOpenChange }: TikTokPostPreviewProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  
  if (!video) return null

  const formatDate = (dateString: string) => {
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
      <DialogContent className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[450px] max-h-[550px] p-0 overflow-hidden bg-[#192734] border border-[#38444d] text-white rounded-xl shadow-xl">
        <div className="flex items-center justify-between p-3 border-b border-[#38444d]">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-[#38444d] text-[#a9b9c6] border-[#38444d] flex items-center gap-1">
              <Play className="h-3 w-3" />
              <span>TikTok</span>
            </Badge>
            <Badge variant="outline" className="bg-[#38444d] text-[#a9b9c6] border-[#38444d] flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{new Date(video.date).toLocaleDateString()}</span>
            </Badge>
          </div>
          <DialogClose className="h-8 w-8 rounded-full hover:bg-[#253341] flex items-center justify-center">
            <X className="h-4 w-4 text-[#8899a6]" />
          </DialogClose>
        </div>

        <div 
          className="overflow-y-auto scrollbar-hide" 
          style={{ 
            maxHeight: "calc(550px - 110px)",
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }} 
          ref={contentRef}
        >
          <div className="p-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-[#38444d] flex items-center justify-center overflow-hidden flex-shrink-0">
                <span className="text-sm font-bold text-[#8899a6]">
                  {client?.tiktok_username?.charAt(0).toUpperCase() || "T"}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="font-bold text-white">@{client?.tiktok_username || "tiktok_user"}</span>
                  <span className="text-sm text-[#8899a6]">· {formatDate(video.date)}</span>
                </div>
                
                <div className="mt-3 text-[#e7e9ea] whitespace-pre-line">
                  {video.text}
                </div>
                
                <div className="flex items-center gap-2 mt-2 text-xs text-[#8899a6]">
                  <Music className="h-3 w-3" />
                  <span>Original sound</span>
                </div>
              </div>
            </div>

            <div className="mt-3 rounded-lg overflow-hidden border border-[#38444d] relative">
              <img
                src={video.thumbnail || "/placeholder.svg"}
                alt=""
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <div className="w-16 h-16 rounded-full bg-[#fe2c55] flex items-center justify-center">
                  <Play className="h-8 w-8 text-white" fill="white" />
                </div>
              </div>
            </div>
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
              <Heart className="h-4 w-4 text-[#8899a6]" />
              <span className="text-sm text-[#8899a6]">{formatNumber(video.diggcount)}</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-[#8899a6]" />
              <span className="text-sm text-[#8899a6]">{formatNumber(video.commentcount)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Play className="h-4 w-4 text-[#8899a6]" />
              <span className="text-sm text-[#8899a6]">{formatNumber(video.playcount)}</span>
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
