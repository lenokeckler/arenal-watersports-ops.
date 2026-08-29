-- Arenal Water Sports — Ops Board schema
-- Run this in the Supabase SQL Editor (Database → SQL Editor → New query).

-- =========================================================
-- Tables
-- =========================================================

-- profiles (extends auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  role text not null default 'staff' check (role in ('admin','staff'))
);

create table equipment_types (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'watercraft',
  default_duration_min int not null default 60,
  color text not null default 'lake',
  sort_order int not null default 0,
  active bool not null default true
);

create table units (
  id uuid primary key default gen_random_uuid(),
  type_id uuid not null references equipment_types(id) on delete cascade,
  label text not null,
  damage_count int not null default 0,
  damage_notes text default '',
  status text not null default 'available' check (status in ('available','maintenance')),
  active bool not null default true
);

create table addons (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  active bool not null default true
);

create table reservations (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references units(id),
  customer_name text not null,
  start_time timestamptz not null default now(),
  duration_min int not null default 60 check (duration_min > 0),
  end_time timestamptz not null,
  status text not null default 'active' check (status in ('active','returned','cancelled')),
  notes text default '',
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create table reservation_addons (
  reservation_id uuid not null references reservations(id) on delete cascade,
  addon_id uuid not null references addons(id),
  quantity int not null default 1,
  primary key (reservation_id, addon_id)
);

-- =========================================================
-- Triggers
-- =========================================================

-- auto-fill end_time = start_time + duration_min
create or replace function set_end_time() returns trigger as $$
begin
  new.end_time := new.start_time + (new.duration_min || ' minutes')::interval;
  return new;
end; $$ language plpgsql;

create trigger trg_end_time before insert or update on reservations
  for each row execute function set_end_time();

-- create a profile row automatically when a user signs up
-- security definer + empty search_path requires fully-qualified table names
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger trg_new_user after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================================================
-- Row Level Security
-- =========================================================

alter table profiles enable row level security;
alter table equipment_types enable row level security;
alter table units enable row level security;
alter table addons enable row level security;
alter table reservations enable row level security;
alter table reservation_addons enable row level security;

-- helper: is the current user an admin?
create or replace function is_admin()
returns bool
language sql
security definer
set search_path = ''
as $$
  select exists(
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- authenticated users can read everything
create policy "read all" on equipment_types for select to authenticated using (true);
create policy "read all" on units for select to authenticated using (true);
create policy "read all" on addons for select to authenticated using (true);
create policy "read all" on reservations for select to authenticated using (true);
create policy "read all" on reservation_addons for select to authenticated using (true);
create policy "read profiles" on profiles for select to authenticated using (true);

-- staff can manage reservations and update units (status / damage)
create policy "write reservations" on reservations for all to authenticated using (true) with check (true);
create policy "write reservation_addons" on reservation_addons for all to authenticated using (true) with check (true);
create policy "update units" on units for update to authenticated using (true) with check (true);

-- admin-only configuration
create policy "admin types" on equipment_types for all to authenticated using (is_admin()) with check (is_admin());
create policy "admin units insert" on units for insert to authenticated with check (is_admin());
create policy "admin units delete" on units for delete to authenticated using (is_admin());
create policy "admin addons" on addons for all to authenticated using (is_admin()) with check (is_admin());
