-- ===== Skill programs + friends. Run AFTER schema.sql (needs profiles, is_approved()). =====
create table public.programs(id uuid primary key default gen_random_uuid(), name text not null, description text,
  creator uuid not null references public.profiles(id) on delete cascade default auth.uid(), created_at timestamptz default now());
create table public.program_tasks(id uuid primary key default gen_random_uuid(), program_id uuid not null references public.programs(id) on delete cascade,
  position int not null default 0, title text not null, url text not null);
create table public.program_members(program_id uuid references public.programs(id) on delete cascade, user_id uuid references public.profiles(id) on delete cascade default auth.uid(),
  status text not null default 'joined' check (status in ('joined','completed')), primary key(program_id,user_id));
create table public.task_progress(task_id uuid references public.program_tasks(id) on delete cascade, user_id uuid references public.profiles(id) on delete cascade default auth.uid(), primary key(task_id,user_id));
create table public.friendships(id uuid primary key default gen_random_uuid(), requester uuid not null references public.profiles(id) on delete cascade default auth.uid(),
  addressee uuid not null references public.profiles(id) on delete cascade, status text not null default 'pending' check (status in ('pending','accepted')), unique(requester,addressee));
alter table public.programs enable row level security; alter table public.program_tasks enable row level security; alter table public.program_members enable row level security;
alter table public.task_progress enable row level security; alter table public.friendships enable row level security;

create policy "read programs"  on public.programs for select using (public.is_approved());
create policy "make program"   on public.programs for insert with check (public.is_approved() and creator=auth.uid());
create policy "edit own program" on public.programs for update using (creator=auth.uid());
create policy "delete own program" on public.programs for delete using (creator=auth.uid());
create policy "read tasks"     on public.program_tasks for select using (public.is_approved());
create policy "creator manages tasks" on public.program_tasks for all using (exists(select 1 from public.programs p where p.id=program_id and p.creator=auth.uid()))
  with check (exists(select 1 from public.programs p where p.id=program_id and p.creator=auth.uid()));
create policy "read members"   on public.program_members for select using (public.is_approved());
create policy "join"           on public.program_members for insert with check (public.is_approved() and user_id=auth.uid());
create policy "update own membership" on public.program_members for update using (user_id=auth.uid());
create policy "leave"          on public.program_members for delete using (user_id=auth.uid());
create policy "own progress"   on public.task_progress for all using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy "see my friendships" on public.friendships for select using (requester=auth.uid() or addressee=auth.uid());
create policy "send request"   on public.friendships for insert with check (requester=auth.uid() and public.is_approved());
create policy "accept"         on public.friendships for update using (addressee=auth.uid());
create policy "unfriend"       on public.friendships for delete using (requester=auth.uid() or addressee=auth.uid());

create function public.username_exists(uname text) returns boolean language sql security definer set search_path=public stable as
$$ select exists(select 1 from profiles where lower(username)=lower(uname) and status='approved') $$;
-- LATER (when habits move to Supabase): let accepted friends read only habits where vis=true.
