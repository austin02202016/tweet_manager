create table public.organizations (
  created_at timestamp with time zone not null default now(),
  clerk_org_id text null,
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

create table public.tweets (
  id text not null,
  created_at timestamp with time zone not null default now(),
  author_id text null,
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
  constraint tweets_pkey primary key (id)
) TABLESPACE pg_default;

create table public.clients (
  created_at timestamp with time zone not null default now(),
  organization_id uuid null,
  name text null,
  client_id text not null,
  constraint clients_pkey primary key (client_id),
  constraint clients_organization_id_fkey foreign key (organization_id) references organizations (id)
) TABLESPACE pg_default;
