-- Create a table for public profiles
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  website text,
  role text default 'user' check (role in ('user', 'admin'))
);

-- Set up Row Level Security (RLS)
-- See https://supabase.com/docs/guides/auth/row-level-security for more details.
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

create policy "Users can insert their own profile." on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on public.profiles
  for update using (auth.uid() = id);

-- This triggers a reaction whenever a new user is created
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, role)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', 'user');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ========================================================
-- UPDATE POLICIES FOR EXISTING TABLES (RBAC)
-- ========================================================

-- Drop permissive policies
drop policy if exists "dev_allow_all" on proyectos;
drop policy if exists "dev_allow_all" on nudos;
drop policy if exists "dev_allow_all" on tramos;
drop policy if exists "dev_allow_all" on calculos;

-- Proyectos: 
-- Admin sees all. 
-- User sees only their own (where usuario_id = auth.uid())

create policy "Admins can do everything on projects"
  on proyectos
  for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Users can view own projects"
  on proyectos
  for select
  using ( auth.uid() = usuario_id );

create policy "Users can insert own projects"
  on proyectos
  for insert
  with check ( auth.uid() = usuario_id );

create policy "Users can update own projects"
  on proyectos
  for update
  using ( auth.uid() = usuario_id );

create policy "Users can delete own projects"
  on proyectos
  for delete
  using ( auth.uid() = usuario_id );

-- Child tables (nudos, tramos, etc.)
-- Inherit access based on project ownership

-- Helper function to check project access
-- (Optional, but cleaner. For now we can join or exists)
-- Actually, simple check: project must belong to user OR user is admin.

create policy "Project members access nudos"
  on nudos
  for all
  using (
    exists (
      select 1 from proyectos p
      where p.id = nudos.proyecto_id
      and (p.usuario_id = auth.uid() or exists (select 1 from profiles where id = auth.uid() and role = 'admin'))
    )
  );

create policy "Project members access tramos"
  on tramos
  for all
  using (
    exists (
      select 1 from proyectos p
      where p.id = tramos.proyecto_id
      and (p.usuario_id = auth.uid() or exists (select 1 from profiles where id = auth.uid() and role = 'admin'))
    )
  );

-- Repeat for validation/calculos tables if needed
create policy "Project members access calculos"
  on calculos
  for all
  using (
     exists (
      select 1 from proyectos p
      where p.id = calculos.proyecto_id
      and (p.usuario_id = auth.uid() or exists (select 1 from profiles where id = auth.uid() and role = 'admin'))
    )
  );
