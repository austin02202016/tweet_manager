export interface LinkedInPost {
  id: string
  text: string
  numlikes: number
  numcomments: number
  numshares: number
  date: string
  images: string[]
  type: string
  client_id: string
}

export type LinkedInSortColumn = "numlikes" | "numcomments" | "numshares" | "date" 