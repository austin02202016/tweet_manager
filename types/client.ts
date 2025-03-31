export interface Client {
  client_id: string;
  created_at: string;
  organization_id: string;
  name: string;
  profile_photo_url?: string;
  twitter_username?: string;
}

export type { Organization } from '@/types'; 