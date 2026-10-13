-- ===== Round 2: public stats for the community leaderboard. Run AFTER schema 1-5. =====
-- Each user's app publishes only three numbers (never habit names); everyone approved can read them to rank the community.
create table public.public_stats(
  user_id uuid primary key references public.profiles(id) on delete cascade default auth.uid(),
  streak int not null default 0, best int not null default 0, month_done int not null default 0, updated_at timestamptz default now());
alter table public.public_stats enable row level security;
create policy "read stats"        on public.public_stats for select using (public.is_approved());
create policy "insert own stats"  on public.public_stats for insert with check (user_id=auth.uid() and public.is_approved());
create policy "update own stats"  on public.public_stats for update using (user_id=auth.uid());
