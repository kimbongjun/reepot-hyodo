create extension if not exists "pgcrypto";

create table if not exists public.comment_submissions (
  id uuid primary key default gen_random_uuid(),
  nickname text not null,
  name text not null,
  phone text not null,
  hospital text,
  message text not null,
  like_count integer not null default 0,
  hidden boolean not null default false,
  ip_address text,
  country text,
  region text,
  city text,
  timezone text,
  user_agent text,
  created_at timestamptz not null default now()
);

alter table public.comment_submissions add column if not exists hospital text;
alter table public.comment_submissions add column if not exists ip_address text;
alter table public.comment_submissions add column if not exists country text;
alter table public.comment_submissions add column if not exists region text;
alter table public.comment_submissions add column if not exists city text;
alter table public.comment_submissions add column if not exists timezone text;
alter table public.comment_submissions add column if not exists user_agent text;
alter table public.comment_submissions add column if not exists like_count integer not null default 0;
alter table public.comment_submissions add column if not exists hidden boolean not null default false;

create table if not exists public.public_comments (
  id uuid primary key,
  nickname text not null,
  message text not null,
  like_count integer not null default 0,
  hidden boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.public_comments add column if not exists like_count integer not null default 0;
alter table public.public_comments add column if not exists hidden boolean not null default false;

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
  insert into public.public_comments (id, nickname, message, like_count, hidden, created_at)
  values (new.id, new.nickname, new.message, new.like_count, new.hidden, new.created_at)
  on conflict (id) do update
  set
    nickname = excluded.nickname,
    message = excluded.message,
    like_count = excluded.like_count,
    hidden = excluded.hidden,
    created_at = excluded.created_at;

  return new;
end;
$$;

create or replace function public.delete_public_comment()
returns trigger
language plpgsql
security definer
as $$
begin
  delete from public.public_comments
  where id = old.id;

  return old;
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
  update public.comment_submissions
  set like_count = like_count + 1
  where id = target_comment_id
  returning like_count into next_count;

  return coalesce(next_count, 0);
end;
$$;

drop trigger if exists comment_submissions_sync_public on public.comment_submissions;
drop trigger if exists comment_submissions_delete_public on public.comment_submissions;

create trigger comment_submissions_sync_public
after insert or update on public.comment_submissions
for each row execute procedure public.sync_public_comment();

create trigger comment_submissions_delete_public
after delete on public.comment_submissions
for each row execute procedure public.delete_public_comment();

update public.comment_submissions
set hidden = false
where hidden = true;

insert into public.public_comments (id, nickname, message, like_count, hidden, created_at)
select
  id,
  nickname,
  message,
  like_count,
  hidden,
  created_at
from public.comment_submissions
on conflict (id) do update
set
  nickname = excluded.nickname,
  message = excluded.message,
  like_count = excluded.like_count,
  hidden = excluded.hidden,
  created_at = excluded.created_at;

update public.public_comments as public_comments
set like_count = comment_submissions.like_count
from public.comment_submissions as comment_submissions
where public_comments.id = comment_submissions.id
  and public_comments.like_count <> comment_submissions.like_count;

do $$
begin
  alter publication supabase_realtime add table public.public_comments;
exception
  when duplicate_object then null;
end $$;

create table if not exists public.admin_users (
  email text primary key,
  created_at timestamptz not null default now()
);

alter table public.comment_submissions enable row level security;
alter table public.public_comments enable row level security;
alter table public.site_settings enable row level security;
alter table public.admin_users enable row level security;

drop policy if exists "public comments selectable" on public.public_comments;
create policy "public comments selectable"
on public.public_comments
for select
to anon, authenticated
using (true);

-- like_count 증가는 increment_public_comment_like RPC(SECURITY DEFINER)가 처리하므로
-- 익명 UPDATE 정책은 불필요하며 보안 위험(닉네임·메시지 직접 변조 가능)이 있어 제거
drop policy if exists "public comments updatable like count" on public.public_comments;
