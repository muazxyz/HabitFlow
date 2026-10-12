-- ===== HabitFlow access control. Run once in Supabase > SQL Editor. =====
create table public.profiles(
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null, email text not null,
  role text not null default 'user' check (role in ('user','admin')),
  status text not null default 'pending' check (status in ('pending','approved','blocked')),
  created_at timestamptz default now());
alter table public.profiles enable row level security;

create function public.is_admin() returns boolean language sql security definer set search_path=public stable as
$$ select exists(select 1 from profiles where id=auth.uid() and role='admin' and status='approved') $$;
create function public.is_approved() returns boolean language sql security definer set search_path=public stable as
$$ select exists(select 1 from profiles where id=auth.uid() and status='approved') $$;

-- users see only themselves and can never edit their own status; admins manage everyone
create policy "read own"       on public.profiles for select using (id=auth.uid());
create policy "admin read all" on public.profiles for select using (public.is_admin());
create policy "admin update"   on public.profiles for update using (public.is_admin());
create policy "admin delete"   on public.profiles for delete using (public.is_admin());

-- every signup automatically becomes a 'pending' profile
create function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as
$$ begin insert into profiles(id,username,email) values(new.id,new.raw_user_meta_data->>'username',new.email); return new; end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- login by username: finds the email for a username
create function public.get_email_by_username(uname text) returns text language sql security definer set search_path=public stable as
$$ select email from profiles where lower(username)=lower(uname) $$;

-- FUTURE TABLES (finance, habits...): copy this pattern so only approved owners get their own rows
-- create policy "own rows" on public.finance for all using (public.is_approved() and user_id=auth.uid());

-- MAKE YOURSELF ADMIN (after signing up once): 
-- update public.profiles set role='admin', status='approved' where username='YOUR_USERNAME';
