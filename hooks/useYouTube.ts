"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import type { YouTubeVideo } from "@/types/youtube"

export function useYouTube(clientId: string | null) {
  const [videos, setVideos] = useState<YouTubeVideo[]>([])
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
          .from("youtube_data")
          .select("*")
          .eq("client_id", clientId)
          .order("date", { ascending: false })

        if (error) throw error

        // Transform the data to match our YouTubeVideo type
        const transformedVideos = data.map((video) => ({
          id: video.id,
          channelurl: video.channelurl,
          channelname: video.channelname,
          commentscount: video.commentscount,
          channelid: video.channelid,
          channelusername: video.channelusername,
          input: video.input,
          likes: video.likes,
          duration: video.duration,
          order: video.order,
          thumbnailurl: video.thumbnailurl,
          date: video.date,
          text: video.text,
          type: video.type,
          viewcount: video.viewcount,
          progress: video.progress,
          descriptionlinks: video.descriptionlinks,
          client_id: video.client_id
        }))

        setVideos(transformedVideos)
      } catch (err) {
        console.error("Error fetching YouTube videos:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch YouTube videos")
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [clientId])

  return { videos, loading, error }
} 