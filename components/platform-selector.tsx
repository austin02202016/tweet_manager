"use client"

import { Twitter, Linkedin, Instagram, Youtube } from "lucide-react"

interface PlatformSelectorProps {
  activePlatform: "threads" | "instagram" | "youtube" | "tiktok"
  onPlatformSelect: (platform: "threads" | "instagram" | "youtube" | "tiktok") => void
}

export function PlatformSelector({ activePlatform, onPlatformSelect }: PlatformSelectorProps) {
  return (
    <div className="flex border-b border-[#38444d] bg-[#192734] rounded-t-xl overflow-hidden">
      <button
        className={`px-8 py-4 font-medium text-base flex items-center transition-all duration-200 ${
          activePlatform === "threads"
            ? "text-[#1d9bf0] border-b-2 border-[#1d9bf0] bg-[#1d9bf01a]"
            : "text-[#8899a6] hover:text-white hover:bg-[#ffffff0a]"
        }`}
        onClick={() => onPlatformSelect("threads")}
      >
        <Twitter
          className={`h-5 w-5 mr-2 ${activePlatform === "threads" ? "text-[#1d9bf0]" : "text-[#8899a6]"}`}
        />
        Threads
      </button>
      <button
        className={`px-8 py-4 font-medium text-base flex items-center transition-all duration-200 ${
          activePlatform === "instagram"
            ? "text-[#E4405F] border-b-2 border-[#E4405F] bg-[#E4405F1a]"
            : "text-[#8899a6] hover:text-white hover:bg-[#ffffff0a]"
        }`}
        onClick={() => onPlatformSelect("instagram")}
      >
        <Instagram
          className={`h-5 w-5 mr-2 ${activePlatform === "instagram" ? "text-[#E4405F]" : "text-[#8899a6]"}`}
        />
        Instagram
      </button>
      <button
        className={`px-8 py-4 font-medium text-base flex items-center transition-all duration-200 ${
          activePlatform === "youtube"
            ? "text-[#FF0000] border-b-2 border-[#FF0000] bg-[#FF00001a]"
            : "text-[#8899a6] hover:text-white hover:bg-[#ffffff0a]"
        }`}
        onClick={() => onPlatformSelect("youtube")}
      >
        <Youtube
          className={`h-5 w-5 mr-2 ${activePlatform === "youtube" ? "text-[#FF0000]" : "text-[#8899a6]"}`}
        />
        YouTube
      </button>
      <button
        className={`px-8 py-4 font-medium text-base flex items-center transition-all duration-200 ${
          activePlatform === "tiktok"
            ? "text-[#FF0000] border-b-2 border-[#FF0000] bg-[#FF00001a]"
            : "text-[#8899a6] hover:text-white hover:bg-[#ffffff0a]"
        }`}
        onClick={() => onPlatformSelect("tiktok")}
      >
        TikTok
      </button>
    </div>
  )
} 