export interface InstagramPost {
    id: string
    timestamp: string | null
    inputurl: string | null
    ownerusername: string | null
    commentscount: number | null
    likescount: number | null
    caption: string | null
    hashtags: string[] | null
    videoviewcount: number | null
    videoplaycount: number | null
    shortcode: string | null
    videoduration: number | null
    type: string | null
    musicinfo: {
        artist?: string
        title?: string
        [key: string]: any
    } | null
    images: {
        url?: string
        width?: number
        height?: number
        [key: string]: any
    }[] | null
    ownerid: string | null
    taggedusers: string[] | null
    coauthorproducers: string[] | null
    client_id: string | null
    repackaged_linkedin?: boolean
    repackaged_instagram?: boolean
}

export type InstagramSortColumn = "likescount" | "commentscount" | "videoviewcount" | "videoplaycount" | "timestamp" | ""

export interface Client {
    id: string
    name: string
    instagram_username: string | null
}
  
  