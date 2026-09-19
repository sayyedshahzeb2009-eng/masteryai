create table if not exists connected_accounts (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  account_id text not null,
  account_name text,
  access_token text not null,
  refresh_token text,
  token_expires_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(provider, account_id)
);

create table if not exists news_items (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  title text not null,
  url text not null unique,
  published_at timestamptz,
  summary text,
  created_at timestamptz not null default now()
);

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  account_id text,
  source_news_id uuid references news_items(id) on delete set null,
  status text not null default 'draft',
  title text,
  caption text,
  hashtags text[] not null default '{}',
  image_url text,
  video_url text,
  scheduled_at timestamptz,
  published_at timestamptz,
  platform_post_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists posts_schedule_idx on posts(status, scheduled_at);
create index if not exists news_created_idx on news_items(created_at desc);
