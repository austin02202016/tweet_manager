create table public.clients (
  created_at timestamp with time zone not null default now(),
  organization_id uuid null,
  name text null,
  client_id text not null,
  profile_photo_url text null,
  username text null,
  constraint clients_pkey primary key (client_id),
  constraint clients_organization_id_fkey foreign KEY (organization_id) references organizations (id)
) TABLESPACE pg_default;

create table public.instagram (
  timestamp timestamp with time zone null,
  inputurl text null,
  ownerusername text null,
  commentscount integer null,
  likescount integer null,
  caption text null,
  hashtags jsonb null,
  videoviewcount integer null,
  videoplaycount integer null,
  shortcode text null,
  videoduration double precision null,
  type text null,
  musicinfo jsonb null,
  images jsonb null,
  ownerid text null,
  id text not null,
  taggedusers jsonb null,
  coauthorproducers jsonb null,
  client_id text null,
  constraint instagram_pkey primary key (id),
  constraint instagram_client_id_fkey foreign KEY (client_id) references clients (client_id)
) TABLESPACE pg_default;

create table public.linkedin_posts (
  numlikes integer null,
  linkedinvideo text null,
  article text null,
  author text null,
  inputurl text null,
  images jsonb null,
  numcomments integer null,
  numshares integer null,
  text text null,
  urn text not null,
  postedattimestamp timestamp with time zone null,
  isrepost boolean null,
  type text null,
  client_id text null,
  constraint linkedin_posts_pkey primary key (urn),
  constraint linkedin_posts_client_id_fkey foreign KEY (client_id) references clients (client_id)
) TABLESPACE pg_default;

create table public.organizations (
  created_at timestamp with time zone not null default now(),
  name text null,
  id uuid not null default gen_random_uuid (),
  constraint organizations_pkey primary key (id)
) TABLESPACE pg_default;

create table public.threads (
  created_at timestamp with time zone not null default now(),
  title text null,
  theme text null,
  repackaged_linkedin boolean null,
  repackaged_instagram boolean null,
  thread_id text not null,
  client_id text null,
  constraint threads_pkey primary key (thread_id)
) TABLESPACE pg_default;

create table public.tiktok (
  text text null,
  webvideourl text null,
  collectcount integer null,
  playcount integer null,
  videometa jsonb null,
  diggcount integer null,
  id text not null,
  musicmeta jsonb null,
  sharecount integer null,
  input text null,
  commentcount integer null,
  createtime integer null,
  authormeta jsonb null,
  client_id text null,
  constraint tiktok_pkey primary key (id),
  constraint tiktok_client_id_fkey foreign KEY (client_id) references clients (client_id)
) TABLESPACE pg_default;

create table public.tweets (
  id text not null,
  created_at timestamp with time zone not null default now(),
  client_id text null,
  text text null,
  like_count text null,
  retweet_count text null,
  reply_count text null,
  quote_count text null,
  media jsonb null,
  extra_data jsonb null,
  view_count text null,
  date_posted text null,
  thread_id text null,
  constraint tweets_pkey primary key (id),
  constraint tweets_client_id_fkey foreign KEY (client_id) references clients (client_id)
) TABLESPACE pg_default;

create table public.users (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone null default now(),
  email text not null,
  organization_id uuid null,
  role text null,
  auth_user_id uuid null,
  first_name text null,
  stripe_customer_id text null,
  constraint users_pkey primary key (id),
  constraint users_email_key unique (email),
  constraint users_organization_id_fkey foreign KEY (organization_id) references organizations (id)
) TABLESPACE pg_default;

create table public.youtube_data (
  channelurl text null,
  channelname text null,
  commentscount integer null,
  channelid text null,
  channelusername text null,
  input text null,
  likes integer null,
  duration double precision null,
  "order" integer null,
  thumbnailurl text null,
  id text not null,
  date timestamp with time zone null,
  text text null,
  type text null,
  viewcount integer null,
  progress / key text null,
  descriptionlinks jsonb null,
  client_id text null,
  constraint youtube_data_pkey primary key (id),
  constraint youtube_data_client_id_fkey foreign KEY (client_id) references clients (client_id)
) TABLESPACE pg_default;

create table public.reports (
  id serial not null,
  client_id text not null,
  report_date_range text not null,
  actionables text null,
  highest_performing_content text null,
  observations text null,
  created_at timestamp with time zone not null default now(),
  platform text null,
  constraint reports_pkey primary key (id),
  constraint reports_client_id_fkey foreign KEY (client_id) references clients (client_id)
) TABLESPACE pg_default;