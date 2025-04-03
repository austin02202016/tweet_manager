"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import type { LinkedInPost } from "@/types/linkedin"

export function useLinkedIn(clientId: string | null) {
  const [posts, setPosts] = useState<LinkedInPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPosts() {
      if (!clientId) {
        setPosts([])
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const { data, error } = await supabase
          .from("linkedin_posts")
          .select("*")
          .eq("client_id", clientId)
          .order("postedattimestamp", { ascending: false })

        if (error) throw error

        // Transform the data to match our LinkedInPost type
        const transformedPosts = data.map((post) => ({
          id: post.urn,
          text: post.text || "",
          numlikes: post.numlikes || 0,
          numcomments: post.numcomments || 0,
          numshares: post.numshares || 0,
          date: post.postedattimestamp,
          images: post.images || [],
          type: post.type || "text",
          client_id: post.client_id
        }))

        setPosts(transformedPosts)
      } catch (err) {
        console.error("Error fetching LinkedIn posts:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch LinkedIn posts")
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [clientId])

  return { posts, loading, error }
} 