-- ===== Profiles, community listing, notifications groundwork. Run AFTER schema.sql and schema2.sql. =====
alter table public.profiles add column if not exists bio text check (char_length(bio)<=400);
alter table public.profiles add column if not exists avatar_url text;      -- store the image in a Storage bucket named 'avatars' (<=200KB) and keep its public URL here
alter table public.friendships add column if not exists accepted_at timestamptz;   -- "friends since"

-- users may change ONLY their own bio/avatar (status/role stay admin-only)
create function public.set_my_profile(p_bio text, p_avatar text) returns void language sql security definer set search_path=public as
$$ update profiles set bio=p_bio, avatar_url=p_avatar where id=auth.uid() $$;

-- safe community list for leaderboards/profiles (no emails), visible to approved members only
create function public.community() returns table(id uuid, username text, bio text, avatar_url text, created_at timestamptz)
language sql security definer set search_path=public stable as
$$ select id,username,bio,avatar_url,created_at from profiles where status='approved' and public.is_approved() $$;

-- notifications (the bell UI is built later; the app already records the events)
create table public.notifications(id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null, data jsonb not null default '{}', read boolean not null default false, created_at timestamptz default now());
alter table public.notifications enable row level security;
create policy "read own notifications"   on public.notifications for select using (user_id=auth.uid());
create policy "mark own read"            on public.notifications for update using (user_id=auth.uid());
create policy "delete own notifications" on public.notifications for delete using (user_id=auth.uid());
create policy "notify others"            on public.notifications for insert with check (public.is_approved());
-- realtime: alter publication supabase_realtime add table public.notifications;
