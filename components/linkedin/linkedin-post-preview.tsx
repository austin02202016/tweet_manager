"use client"

import { useRef } from "react"
import Image from "next/image"
import { MessageCircle, Share2, ThumbsUp, Bookmark, X } from "lucide-react"
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog"
import type { LinkedInPost } from "@/types/linkedin"
import type { Client } from "@/types/client"

interface LinkedInPostPreviewProps {
  post: LinkedInPost | null
  client: Client | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LinkedInPostPreview({ post, client, open, onOpenChange }: LinkedInPostPreviewProps) {
  const contentRef = useRef<HTMLDivElement>(null)

  if (!post) return null

  const formatDate = (date: string) => {
    const postDate = new Date(date)
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
          <div className="text-sm text-[#8899a6]">Posted on {new Date(post.date).toLocaleDateString()}</div>
          <DialogClose className="h-8 w-8 rounded-full hover:bg-[#253341] flex items-center justify-center">
            <X className="h-4 w-4 text-[#8899a6]" />
          </DialogClose>
        </div>

        <div
          className="overflow-y-auto scrollbar-hide"
          style={{
            maxHeight: "calc(550px - 110px)",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
          ref={contentRef}
        >
          <div className="p-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-[#38444d] flex items-center justify-center overflow-hidden flex-shrink-0">
                {client?.profile_image_url ? (
                  <Image
                    src={client.profile_image_url || "/placeholder.svg"}
                    alt={client.name}
                    width={32}
                    height={32}
                    className="object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#38444d] flex items-center justify-center text-white">
                    {client?.name?.charAt(0) || "J"}
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="font-bold text-white">{client?.name || "Jesse Itzler"}</span>
                  <span className="text-sm text-[#8899a6]">· {formatDate(post.date)}</span>
                </div>
                <div className="mt-3 text-[#e7e9ea] whitespace-pre-line">{post.text}</div>
              </div>
            </div>

            {post.images && post.images.length > 0 && (
              <div className="mt-3 rounded-lg overflow-hidden border border-[#38444d]">
                {post.images.map((image, index) => (
                  <div key={index} className="w-full">
                    <img
                      src={image || "/placeholder.svg"}
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
              <MessageCircle className="h-4 w-4 text-[#8899a6]" />
              <span className="text-sm text-[#8899a6]">{post.numcomments}</span>
            </div>
            <div className="flex items-center gap-2">
              <Share2 className="h-4 w-4 text-[#8899a6]" />
              <span className="text-sm text-[#8899a6]">{post.numshares}</span>
            </div>
            <div className="flex items-center gap-2">
              <ThumbsUp className="h-4 w-4 text-[#8899a6]" />
              <span className="text-sm text-[#8899a6]">{post.numlikes}</span>
            </div>
          </div>
          <div>
            <Bookmark className="h-4 w-4 text-[#8899a6]" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

