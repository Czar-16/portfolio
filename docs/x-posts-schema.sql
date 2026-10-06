-- Run once in the Supabase SQL Editor. The website accesses this only server-side.
create table if not exists public.x_posts (
  id text primary key check (id ~ '^[0-9]{1,25}$'),
  created_at timestamptz not null,
  payload jsonb not null check (payload->>'id' = id)
);
create index if not exists x_posts_created_at_idx on public.x_posts (created_at desc, id desc);
alter table public.x_posts enable row level security;
revoke all on public.x_posts from anon, authenticated;
grant select, insert, update on public.x_posts to service_role;
