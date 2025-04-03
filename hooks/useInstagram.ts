"use client"

import { useEffect, useState } from "react"
import type { InstagramPost } from "@/types/instagram"

export function useInstagram(clientId: string | null) {
  const [posts, setPosts] = useState<InstagramPost[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPosts = async () => {
      if (!clientId) {
        setPosts([])
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/instagram?client_id=${clientId}`)
        if (!response.ok) {
          throw new Error("Failed to fetch Instagram posts")
        }
        const data = await response.json()
        setPosts(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [clientId])

  return { posts, loading, error }
} 