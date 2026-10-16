-- ===== Program approval, delete requests, ratings. Run AFTER schema 1-7. =====
alter table public.programs add column if not exists status text not null default 'pending' check (status in ('pending','approved','rejected','delete_requested'));
alter table public.programs add column if not exists reject_note text;
alter table public.programs add column if not exists delete_reason text;
update public.programs set status='approved' where status='pending';   -- programs that already exist stay live

-- only admins may change status/notes (the review functions below set a flag to pass this guard); new programs start pending (admins' own start approved)
create or replace function public.guard_program() returns trigger language plpgsql security definer set search_path=public as $$
begin
  if tg_op='INSERT' then new.status := case when public.is_admin() then 'approved' else 'pending' end; new.reject_note:=null; new.delete_reason:=null;
  elsif not public.is_admin() and current_setting('hf.bypass',true) is distinct from '1'
        and (new.status is distinct from old.status or new.reject_note is distinct from old.reject_note or new.delete_reason is distinct from old.delete_reason) then
    raise exception 'Only an admin can change a program status';
  end if; return new; end $$;
drop trigger if exists guard_program on public.programs;
create trigger guard_program before insert or update on public.programs for each row execute function public.guard_program();

create or replace function public.notify_new_program() returns trigger language plpgsql security definer set search_path=public as $$
begin if new.status='pending' then
  insert into public.notifications(user_id,type,data) select id,'program_submitted',jsonb_build_object('program',new.name,'by',(select username from public.profiles where id=new.creator)) from public.profiles where role='admin' and status='approved';
end if; return new; end $$;
drop trigger if exists notify_new_program on public.programs;
create trigger notify_new_program after insert on public.programs for each row execute function public.notify_new_program();

-- who can see / change what
drop policy if exists "read programs" on public.programs; drop policy if exists "make program" on public.programs; drop policy if exists "edit own program" on public.programs; drop policy if exists "delete own program" on public.programs;
create policy "read programs" on public.programs for select using (public.is_approved() and (status in ('approved','delete_requested') or creator=auth.uid() or public.is_admin()));
create policy "make program"  on public.programs for insert with check (public.is_approved() and creator=auth.uid());
create policy "edit program"  on public.programs for update using (creator=auth.uid() or public.is_admin());
create policy "delete program" on public.programs for delete using ((creator=auth.uid() and status in ('pending','rejected')) or public.is_admin());   -- approved programs need an admin
drop policy if exists "read tasks" on public.program_tasks;
create policy "read tasks" on public.program_tasks for select using (public.is_approved() and exists(select 1 from public.programs p where p.id=program_id));
drop policy if exists "join" on public.program_members;
create policy "join" on public.program_members for insert with check (public.is_approved() and user_id=auth.uid() and exists(select 1 from public.programs p where p.id=program_id and (p.status in ('approved','delete_requested') or p.creator=auth.uid())));

create or replace function public.review_program(pid uuid, decision text, note text) returns void language plpgsql security definer set search_path=public as $$
declare c uuid; n text;
begin
  if not public.is_admin() then raise exception 'admin only'; end if;
  select creator,name into c,n from public.programs where id=pid;
  perform set_config('hf.bypass','1',true);
  update public.programs set status=case when decision='approve' then 'approved' else 'rejected' end, reject_note=case when decision='approve' then null else nullif(note,'') end where id=pid;
  insert into public.notifications(user_id,type,data) values (c, case when decision='approve' then 'program_approved' else 'program_rejected' end, jsonb_build_object('program',n,'note',coalesce(note,'')));
end $$;
create or replace function public.request_program_delete(pid uuid, reason text) returns void language plpgsql security definer set search_path=public as $$
declare n text;
begin
  select name into n from public.programs where id=pid and creator=auth.uid() and status='approved';
  if n is null then raise exception 'Not allowed'; end if;
  perform set_config('hf.bypass','1',true);
  update public.programs set status='delete_requested', delete_reason=reason where id=pid;
  insert into public.notifications(user_id,type,data) select id,'program_delete_request',jsonb_build_object('program',n,'reason',reason,'by',(select username from public.profiles where id=auth.uid())) from public.profiles where role='admin' and status='approved';
end $$;
create or replace function public.resolve_delete(pid uuid, approve boolean) returns void language plpgsql security definer set search_path=public as $$
declare c uuid; n text;
begin
  if not public.is_admin() then raise exception 'admin only'; end if;
  select creator,name into c,n from public.programs where id=pid;
  if approve then delete from public.programs where id=pid;
  else perform set_config('hf.bypass','1',true); update public.programs set status='approved', delete_reason=null where id=pid; end if;
  insert into public.notifications(user_id,type,data) values (c, case when approve then 'program_deleted' else 'program_delete_denied' end, jsonb_build_object('program',n));
end $$;

-- ratings: 1-5 stars, members only, not on your own program
create table if not exists public.program_ratings(program_id uuid references public.programs(id) on delete cascade, user_id uuid references public.profiles(id) on delete cascade default auth.uid(),
  stars int not null check (stars between 1 and 5), primary key(program_id,user_id));
alter table public.program_ratings enable row level security;
create policy "read ratings" on public.program_ratings for select using (public.is_approved());
create policy "rate"   on public.program_ratings for insert with check (user_id=auth.uid() and exists(select 1 from public.program_members m where m.program_id=program_ratings.program_id and m.user_id=auth.uid()) and not exists(select 1 from public.programs p where p.id=program_ratings.program_id and p.creator=auth.uid()));
create policy "change rating" on public.program_ratings for update using (user_id=auth.uid());
create policy "remove rating" on public.program_ratings for delete using (user_id=auth.uid());
