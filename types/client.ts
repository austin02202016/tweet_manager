export interface Client {
  client_id: string;
  created_at: string;
  organization_id: string;
  name: string;
  profile_picture_url?: string;
  twitter_username?: string;
}

export interface Organization {
  id: string;
  created_at: string;
  clerk_org_id: string | null;
  name: string | null;
} 