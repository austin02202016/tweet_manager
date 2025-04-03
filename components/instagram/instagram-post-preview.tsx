"use client"

import { useRef } from "react"
import Image from "next/image"
import { Heart, MessageCircle, Share2, Bookmark, X, Music, Clock, Tag, Users, Instagram } from 'lucide-react'
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { formatNumber, formatDuration } from "@/lib/utils"
import type { InstagramPost } from "@/types/instagram"
import type { Client } from "@/types/client"

interface InstagramPostPreviewProps {
  post: InstagramPost | null
  client: Client | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InstagramPostPreview({ post, client, open, onOpenChange }: InstagramPostPreviewProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  
  if (!post) return null

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
      <DialogContent className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[450px] max-h-[550px] p-0 overflow-hidden bg-[#192734] border border-[#38444d] text-white rounded-xl shadow-xl">
        <div className="flex items-center justify-between p-3 border-b border-[#38444d]">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-[#38444d] text-[#a9b9c6] border-[#38444d] flex items-center gap-1">
              <Instagram className="h-3 w-3" />
              <span>{post.type || "Post"}</span>
            </Badge>
            {post.videoduration && (
              <Badge variant="outline" className="bg-[#38444d] text-[#a9b9c6] border-[#38444d] flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{formatDuration(post.videoduration)}</span>
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
                  {post.ownerusername?.charAt(0).toUpperCase() || "I"}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="font-bold text-white">{post.ownerusername || "Instagram User"}</span>
                  <span className="text-sm text-[#8899a6]">· {formatDate(post.timestamp)}</span>
                </div>
                
                {post.musicinfo && post.musicinfo.title && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-[#8899a6]">
                    <Music className="h-3 w-3" />
                    <span>{post.musicinfo.artist ? `${post.musicinfo.artist} - ` : ""}{post.musicinfo.title}</span>
                  </div>
                )}
                
                {(post.taggedusers && post.taggedusers.length > 0) || (post.coauthorproducers && post.coauthorproducers.length > 0) ? (
                  <div className="flex items-center gap-3 mt-1 text-xs text-[#8899a6]">
                    {post.taggedusers && post.taggedusers.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        <span>{post.taggedusers.length} tagged</span>
                      </div>
                    )}
                    {post.coauthorproducers && post.coauthorproducers.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{post.coauthorproducers.length} co-authors</span>
                      </div>
                    )}
                  </div>
                ) : null}
                
                <div className="mt-3 text-[#e7e9ea] whitespace-pre-line">
                  {post.caption || "No caption"}
                </div>
                
                {post.hashtags && post.hashtags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {post.hashtags.map((tag, index) => (
                      <span key={index} className="text-[#1d9bf0] text-sm">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {post.images && post.images.length > 0 && (
              <div className="mt-3 rounded-lg overflow-hidden border border-[#38444d]">
                {post.images.map((image, index) => (
                  <div key={index} className="w-full">
                    <img
                      src={image.url || "/placeholder.svg"}
                      alt=""
                      className="w-full h-auto object-contain max-h-[400px]"
                    />
                  </div>
                ))}
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
              <Heart className="h-4 w-4 text-[#8899a6]" />
              <span className="text-sm text-[#8899a6]">{formatNumber(post.likescount || 0)}</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-[#8899a6]" />
              <span className="text-sm text-[#8899a6]">{formatNumber(post.commentscount || 0)}</span>
            </div>
            {post.type === "video" && post.videoviewcount && (
              <div className="flex items-center gap-2">
                <Share2 className="h-4 w-4 text-[#8899a6]" />
                <span className="text-sm text-[#8899a6]">{formatNumber(post.videoviewcount)}</span>
              </div>
            )}
          </div>
          <div>
            <Bookmark className="h-4 w-4 text-[#8899a6]" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
