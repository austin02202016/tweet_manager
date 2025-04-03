export interface TikTokVideo {
  id: string
  text: string
  playcount: number
  diggcount: number
  commentcount: number
  date: string
  thumbnail: string
  client_id: string
}

export type TikTokSortColumn = "playcount" | "diggcount" | "commentcount" | "date" 