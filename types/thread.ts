export interface Tweet {
  id: string
  created_at: string
  thread_id: string
  author_id: string
  text: string
  like_count: number
  retweet_count: number
  reply_count: number
  view_count: number
  date_posted: string
  quote_count: number
  media: any
  extra_data: any
  original_url?: string
}

export interface Thread {
  created_at: string
  client_id: string
  id: string
  title: string
  theme: string
  likes: number
  replies: number
  date: string
  views: number
  repackaged_instagram: boolean
  repackaged_linkedin: boolean
  tweets: Tweet[]
}

