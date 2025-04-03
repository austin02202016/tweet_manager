export interface YouTubeVideo {
  id: string
  channelurl: string | null
  channelname: string | null
  commentscount: number | null
  channelid: string | null
  channelusername: string | null
  input: string | null
  likes: number | null
  duration: number | null
  order: number | null
  thumbnailurl: string | null
  date: string | null
  text: string | null
  type: string | null
  viewcount: number | null
  progress: string | null
  descriptionlinks: {
    url?: string
    text?: string
    [key: string]: any
  }[] | null
  client_id: string | null
}

export type YouTubeSortColumn = "likes" | "commentscount" | "viewcount" | "date" | "" 