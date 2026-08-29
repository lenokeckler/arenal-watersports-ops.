-- Arenal Ops — v3: guides are users, lanchas/cuadraciclos are tour-only.
-- Run AFTER roles.sql. Safe to run multiple times. Supabase SQL Editor.

-- 1) Tour-only equipment (always a tour, never a rental)
alter table equipment_types add column if not exists tour_only bool not null default false;
update equipment_types set tour_only = true where name in ('Pontoon','Bennington','Cuadraciclo');

-- 2) Fixed guides are user profiles (Federico, Allan, ...) with persistent login
alter table profiles add column if not exists is_guide bool not null default false;
alter table profiles add column if not exists phone text not null default '';
alter table profiles add column if not exists color text not null default 'lake';

-- 3) Reservation guides now reference user profiles (not a separate table)
drop table if exists reservation_guides;
drop table if exists guides;

create table reservation_guides (
  reservation_id uuid not null references reservations(id) on delete cascade,
  guide_id uuid not null references profiles(id),
  primary key (reservation_id, guide_id)
);

alter table reservation_guides enable row level security;
create policy "read res_guides" on reservation_guides for select to authenticated using (true);
create policy "write res_guides" on reservation_guides for all to authenticated
  using (can_operate()) with check (can_operate());

-- Profiles need to be updatable by admin to mark guides / set phone+color
drop policy if exists "admin update profiles" on profiles;
create policy "admin update profiles" on profiles for update to authenticated
  using (is_admin()) with check (is_admin());

-- To mark a user as a fixed guide:
--   update profiles set is_guide = true, phone = '8888-8888', color = 'coral'
--   where id = (select id from auth.users where email = 'federico@...');
