-- Defensa en profundidad para "ninguna tabla operativa acepta DELETE".
-- Las politicas de abajo nunca conceden `delete`, pero Postgres evalua los
-- GRANT antes que las politicas: revocar el privilegio hace que ningun
-- `for all` descuidado en el futuro pueda reabrir el borrado por accidente.
revoke delete on all tables in schema public from anon, authenticated;
alter default privileges in schema public
  revoke delete on tables from anon, authenticated;

alter table workers                   enable row level security;
alter table worker_areas              enable row level security;
alter table worker_marks              enable row level security;
alter table password_reset_pins       enable row level security;
alter table equipment_categories      enable row level security;
alter table equipment_units           enable row level security;
alter table equipment_stock           enable row level security;
alter table equipment_stock_movements enable row level security;
alter table unit_condition_photos     enable row level security;
alter table damage_reports            enable row level security;
alter table maintenance_records       enable row level security;
alter table inventory_counts          enable row level security;
alter table inventory_count_lines     enable row level security;

-- El disparador de la tarea 2 siembra worker_areas desde el mismo INSERT que
-- da de alta al trabajador. Esa siembra es contabilidad del sistema, no un
-- otorgamiento que el actor este pidiendo: si corre con los permisos de quien
-- inserta (invoker), un no-admin que de todas formas puede insertar en
-- workers -- por ejemplo reservas registrando un guia externo via
-- workers_insert -- se topa con worker_areas_insert (solo admin) y el alta
-- completa se cae. security definer hace que la siembra funcione sin volver
-- a abrir worker_areas_insert a cualquiera.
create or replace function seed_base_area() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into worker_areas (worker_id, area, granted_by)
  values (new.id, new.base_role, coalesce(new.created_by, new.id))
  on conflict do nothing;
  return new;
end $$;

-- ---------------- Identidad ----------------
create policy workers_select on workers
  for select to authenticated
  using (id = auth.uid() or is_admin());

create policy workers_update_admin on workers
  for update to authenticated
  using (is_admin()) with check (is_admin());

-- Cada quien actualiza su propio correo, su contrasena y su ultimo modo.
create policy workers_update_self on workers
  for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- Reservas solo puede crear cuentas temporales de guia externo, y solo con la
-- marca que administracion otorga. Sin ella, la base rechaza el insert aunque
-- se intente por otro camino.
create policy workers_insert on workers
  for insert to authenticated
  with check (
    is_admin()
    or (
      has_area('reservas')
      and has_mark('registro_guias_externos')
      and is_external_guide
      and base_role = 'operaciones'
      and expires_at is not null
    )
  );

create policy worker_areas_select on worker_areas
  for select to authenticated
  using (worker_id = auth.uid() or is_admin());
create policy worker_areas_insert on worker_areas
  for insert to authenticated
  with check (is_admin());
create policy worker_areas_update on worker_areas
  for update to authenticated
  using (is_admin()) with check (is_admin());

create policy worker_marks_select on worker_marks
  for select to authenticated
  using (worker_id = auth.uid() or is_admin());
create policy worker_marks_insert on worker_marks
  for insert to authenticated
  with check (is_admin());
create policy worker_marks_update on worker_marks
  for update to authenticated
  using (is_admin()) with check (is_admin());

-- Los PIN solo los toca el servidor con la llave de servicio, que salta RLS.
-- Ninguna politica para authenticated: nadie los lee desde el cliente.

-- ---------------- Catalogo ----------------
create policy categories_select on equipment_categories
  for select to authenticated using (true);
create policy categories_insert on equipment_categories
  for insert to authenticated
  with check (is_admin());
create policy categories_update on equipment_categories
  for update to authenticated
  using (is_admin()) with check (is_admin());

-- ---------------- Inventario ----------------
create policy units_select on equipment_units
  for select to authenticated using (true);
create policy units_insert on equipment_units
  for insert to authenticated
  with check (has_area('operaciones') or is_admin());
create policy units_update on equipment_units
  for update to authenticated
  using (has_area('operaciones') or is_admin()) with check (has_area('operaciones') or is_admin());

create policy stock_select on equipment_stock
  for select to authenticated using (true);
create policy stock_insert on equipment_stock
  for insert to authenticated
  with check (has_area('operaciones') or is_admin());
create policy stock_update on equipment_stock
  for update to authenticated
  using (has_area('operaciones') or is_admin()) with check (has_area('operaciones') or is_admin());

create policy stock_movements_select on equipment_stock_movements
  for select to authenticated using (true);
create policy stock_movements_insert on equipment_stock_movements
  for insert to authenticated
  with check (has_area('operaciones') or is_admin());

-- Solo el encargado general reemplaza las fotos de estado. El resto las ve.
create policy photos_select on unit_condition_photos
  for select to authenticated using (true);
create policy photos_insert on unit_condition_photos
  for insert to authenticated
  with check (has_mark('encargado_general') or is_admin());
create policy photos_update on unit_condition_photos
  for update to authenticated
  using (has_mark('encargado_general') or is_admin()) with check (has_mark('encargado_general') or is_admin());

create policy damage_select on damage_reports
  for select to authenticated using (true);
create policy damage_insert on damage_reports
  for insert to authenticated
  with check (has_area('operaciones') or is_admin());

create policy maintenance_select on maintenance_records
  for select to authenticated using (true);
create policy maintenance_insert on maintenance_records
  for insert to authenticated
  with check (has_area('operaciones') or is_admin());
create policy maintenance_update on maintenance_records
  for update to authenticated
  using (has_area('operaciones') or is_admin()) with check (has_area('operaciones') or is_admin());

create policy counts_select on inventory_counts
  for select to authenticated using (true);
create policy counts_insert on inventory_counts
  for insert to authenticated
  with check (has_area('operaciones') or is_admin());

create policy count_lines_select on inventory_count_lines
  for select to authenticated using (true);
create policy count_lines_insert on inventory_count_lines
  for insert to authenticated
  with check (has_area('operaciones') or is_admin());
