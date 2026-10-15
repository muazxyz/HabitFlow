-- ===== Display names + live notifications. Run AFTER schema 1-6. =====
alter table public.profiles add column if not exists display_name text check (char_length(display_name)<=30);
create or replace function public.set_my_profile(p_bio text, p_avatar text, p_name text) returns void language sql security definer set search_path=public as
$$ update profiles set bio=p_bio, avatar_url=p_avatar, display_name=nullif(trim(p_name),'') where id=auth.uid() $$;
drop function if exists public.community();
create function public.community() returns table(id uuid, username text, display_name text, bio text, avatar_url text, created_at timestamptz)
language sql security definer set search_path=public stable as
$$ select id,username,display_name,bio,avatar_url,created_at from profiles where status='approved' and public.is_approved() $$;
-- live notifications (safe to run twice)
do $$ begin alter publication supabase_realtime add table public.notifications; exception when duplicate_object then null; end $$;
