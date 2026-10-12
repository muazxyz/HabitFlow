-- ===== Round A: per-user data (habits, settings, remark) + the rule that friends only see habits with the eye ON. Run AFTER schema 1-3. =====
create table public.user_data(
  user_id uuid primary key references public.profiles(id) on delete cascade default auth.uid(),
  habits jsonb,        -- {joined, habits:[{id,n,i,note,vis,created}], log:{'YYYY-MM-DD':[habitId,...]}}
  settings jsonb,      -- {theme, font, customs:[...], unlocked:{...}}
  remark jsonb,        -- {text, saved, shown}
  updated_at timestamptz default now());
alter table public.user_data enable row level security;
create policy "read own data"   on public.user_data for select using (user_id=auth.uid() and public.is_approved());
create policy "insert own data" on public.user_data for insert with check (user_id=auth.uid() and public.is_approved());
create policy "update own data" on public.user_data for update using (user_id=auth.uid() and public.is_approved());

-- A friend's habits, filtered by the database itself: only accepted friends, only habits with vis=true, and only log entries of those habits.
create function public.friend_habits(fid uuid) returns jsonb language plpgsql security definer set search_path=public stable as $$
declare d jsonb; vis jsonb; ids text[]; lg jsonb;
begin
  if not exists(select 1 from public.friendships f where f.status='accepted' and ((f.requester=auth.uid() and f.addressee=fid) or (f.requester=fid and f.addressee=auth.uid()))) then return null; end if;
  select habits into d from public.user_data where user_id=fid;
  if d is null then return null; end if;
  select coalesce(jsonb_agg(h),'[]'::jsonb), coalesce(array_agg(h->>'id'),'{}'::text[]) into vis, ids
    from jsonb_array_elements(coalesce(d->'habits','[]'::jsonb)) h where coalesce((h->>'vis')::boolean,true);
  select coalesce(jsonb_object_agg(e.key,(select coalesce(jsonb_agg(x),'[]'::jsonb) from jsonb_array_elements_text(e.value) x where x = any(ids))),'{}'::jsonb) into lg
    from jsonb_each(coalesce(d->'log','{}'::jsonb)) e;
  return jsonb_build_object('joined',d->'joined','habits',vis,'log',lg);
end $$;
