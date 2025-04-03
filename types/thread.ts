export interface Tweet {
  id: string
  text: string
  likes: number
  replies: number
  views: number
  created_at: string
}

export interface Thread {
  thread_id: string
  client_id: string
  title: string
  date: string
  created_at: string
  theme: string
  repackaged_linkedin: boolean
  repackaged_instagram: boolean
  tweets: Tweet[]
  views?: number
  likes?: number
  replies?: number
}

export type ThreadSortColumn = "date" | "views" | "likes" | "replies"

