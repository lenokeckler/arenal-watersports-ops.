-- Arenal Ops — roles: admin, staff (operaciones), reservas (solo lectura)
-- Safe to run multiple times. Run in the Supabase SQL Editor.

-- 1) Allow the 'reservas' role
alter table profiles drop constraint if exists profiles_role_check;
alter table profiles add constraint profiles_role_check check (role in ('admin','staff','reservas'));

-- 2) Helper: can this user operate (create/close reservations, edit equipment)?
create or replace function can_operate()
returns bool
language sql
security definer
set search_path = ''
as $$
  select exists(
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin','staff')
  );
$$;

-- 3) Restrict writes to admin + staff. Reservas keeps SELECT (read) only.
drop policy if exists "write reservations" on reservations;
create policy "write reservations" on reservations for all to authenticated
  using (can_operate()) with check (can_operate());

drop policy if exists "write res_units" on reservation_units;
create policy "write res_units" on reservation_units for all to authenticated
  using (can_operate()) with check (can_operate());

drop policy if exists "write res_guides" on reservation_guides;
create policy "write res_guides" on reservation_guides for all to authenticated
  using (can_operate()) with check (can_operate());

drop policy if exists "update units" on units;
create policy "update units" on units for update to authenticated
  using (can_operate()) with check (can_operate());

drop policy if exists "write damage" on damage_reports;
create policy "write damage" on damage_reports for all to authenticated
  using (can_operate()) with check (can_operate());

drop policy if exists "write guides" on guides;
create policy "write guides" on guides for all to authenticated
  using (can_operate()) with check (can_operate());

-- To set someone as read-only reservations staff:
--   update profiles set role = 'reservas' where id = (select id from auth.users where email = 'CORREO');
-- Roles: 'admin' (todo), 'staff' (operaciones), 'reservas' (solo ver).
