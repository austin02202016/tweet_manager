"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import type { TikTokVideo } from "@/types/tiktok"

export function useTikTok(clientId: string | null) {
  const [videos, setVideos] = useState<TikTokVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchVideos() {
      if (!clientId) {
        setVideos([])
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const { data, error } = await supabase
          .from("tiktok")
          .select("*")
          .eq("client_id", clientId)
          .order("createtime", { ascending: false })

        if (error) throw error

        // Transform the data to match our TikTokVideo type
        const transformedVideos = data.map((video) => ({
          id: video.id,
          text: video.text || "",
          playcount: video.playcount || 0,
          diggcount: video.diggcount || 0,
          commentcount: video.commentcount || 0,
          date: new Date(video.createtime * 1000).toISOString(), // Convert to ISO string
          thumbnail: video.videometa?.cover || "", // Get thumbnail from videometa
          client_id: video.client_id
        }))

        setVideos(transformedVideos)
      } catch (err) {
        console.error("Error fetching TikTok videos:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch TikTok videos")
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [clientId])

  return { videos, loading, error }
} 