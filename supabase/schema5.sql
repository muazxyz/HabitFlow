-- ===== Round B: friendship integrity. Run AFTER schema 1-4. =====
alter table public.friendships add constraint friendships_no_self check (requester <> addressee);
create unique index if not exists friendships_pair on public.friendships (least(requester,addressee), greatest(requester,addressee));   -- one friendship per pair, in either direction
