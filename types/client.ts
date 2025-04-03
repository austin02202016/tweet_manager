export interface Client {
  id: string;
  client_id: string;
  name: string;
  twitter_username?: string;
  instagram_username?: string;
  youtube_username?: string;
  tiktok_username?: string;
  created_at: string;
  updated_at: string;
}

export type { Organization } from '@/types'; 