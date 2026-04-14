create extension if not exists "pgcrypto";

create table if not exists public.comment_submissions (
  id uuid primary key default gen_random_uuid(),
  nickname text not null,
  name text not null,
  phone text not null,
  message text not null,
  like_count integer not null default 0,
  ip_address text,
  country text,
  region text,
  city text,
  timezone text,
  user_agent text,
  created_at timestamptz not null default now()
);

alter table public.comment_submissions add column if not exists ip_address text;
alter table public.comment_submissions add column if not exists country text;
alter table public.comment_submissions add column if not exists region text;
alter table public.comment_submissions add column if not exists city text;
alter table public.comment_submissions add column if not exists timezone text;
alter table public.comment_submissions add column if not exists user_agent text;
alter table public.comment_submissions add column if not exists like_count integer not null default 0;

create table if not exists public.public_comments (
  id uuid primary key,
  nickname text not null,
  message text not null,
  like_count integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.public_comments add column if not exists like_count integer not null default 0;

create table if not exists public.site_settings (
  setting_key text primary key,
  setting_value text,
  updated_at timestamptz not null default now()
);

create or replace function public.sync_public_comment()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.public_comments (id, nickname, message, like_count, created_at)
  values (new.id, new.nickname, new.message, new.like_count, new.created_at);

  return new;
end;
$$;

create or replace function public.increment_public_comment_like(target_comment_id uuid)
returns integer
language plpgsql
security definer
as $$
declare
  next_count integer;
begin
  update public.public_comments
  set like_count = like_count + 1
  where id = target_comment_id
  returning like_count into next_count;

  return coalesce(next_count, 0);
end;
$$;

drop trigger if exists comment_submissions_sync_public on public.comment_submissions;

create trigger comment_submissions_sync_public
after insert on public.comment_submissions
for each row execute procedure public.sync_public_comment();

do $$
begin
  alter publication supabase_realtime add table public.public_comments;
exception
  when duplicate_object then null;
end $$;

alter table public.comment_submissions enable row level security;
alter table public.public_comments enable row level security;
alter table public.site_settings enable row level security;

drop policy if exists "public comments selectable" on public.public_comments;
create policy "public comments selectable"
on public.public_comments
for select
to anon, authenticated
using (true);

drop policy if exists "public comments updatable like count" on public.public_comments;
create policy "public comments updatable like count"
on public.public_comments
for update
to anon, authenticated
using (true)
with check (true);
