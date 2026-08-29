-- ============================================================================
-- La firma la pone la base desde auth.uid() y no la aplicacion: no se puede
-- olvidar en un camino de escritura ni falsificar desde el cliente. Toda
-- reserva, despacho, cierre, cobro, conteo, reporte de dano y registro de
-- mantenimiento tiene que quedar firmado por quien realmente lo hizo.
--
-- El esquema no usa una sola forma de firma: hay seis, segun que columnas
-- lleva cada tabla. Cada forma tiene su propia funcion de disparador, con
-- los nombres de columna escritos a mano en vez de una funcion generica
-- parametrizada por TG_ARGV. Una version generica habria necesitado volcar
-- NEW a jsonb y reconstruirlo con jsonb_populate_record para poder asignar
-- una columna cuyo nombre solo se conoce en tiempo de ejecucion; en una
-- migracion que existe justamente para que la firma sea confiable y facil
-- de auditar, seis funciones cortas y explicitas son mas claras que esa
-- indireccion, aunque haya algo de repeticion entre ellas.
--
-- Cada forma se ata a sus tablas con un bloque DO que busca por columnas,
-- igual que el bloque original de esta tarea: si mas adelante se agrega una
-- tabla con las mismas columnas, queda cubierta sin tocar esta migracion.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Forma 1: created_by + updated_by (con created_at/updated_at).
-- Tablas: workers, equipment_categories, equipment_units, extras, combos,
-- tariffs, reservations, reservation_items, maintenance_records.
-- ---------------------------------------------------------------------------
create function stamp_audit_fields() returns trigger
language plpgsql as $$
begin
  if tg_op = 'INSERT' then
    new.created_by := coalesce(auth.uid(), new.created_by);
    new.created_at := now();
  else
    new.created_by := old.created_by;
    new.created_at := old.created_at;
  end if;
  new.updated_by := coalesce(auth.uid(), new.updated_by);
  new.updated_at := now();
  return new;
end $$;

do $$
declare
  table_name text;
begin
  for table_name in
    select c.relname
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relkind = 'r'
      and exists (select 1 from pg_attribute a
                  where a.attrelid = c.oid and a.attname = 'created_by' and not a.attisdropped)
      and exists (select 1 from pg_attribute a
                  where a.attrelid = c.oid and a.attname = 'updated_by' and not a.attisdropped)
  loop
    execute format(
      'create trigger %I before insert or update on public.%I
       for each row execute function stamp_audit_fields()',
      table_name || '_stamp_audit', table_name
    );
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Forma 2: created_by + created_at solamente (tablas de solo insercion).
-- Tablas: reservation_charges, refunds, damage_reports,
-- equipment_stock_movements, inventory_counts. deposits queda fuera de este
-- bloque a proposito (tiene ademas resolved_by/resolved_at) y se resuelve
-- aparte, mas abajo.
--
-- La firma queda congelada desde que se crea la fila: si alguien la
-- actualiza despues, created_by/created_at no cambian, igual que en la
-- forma 1.
-- ---------------------------------------------------------------------------
create function stamp_created_only() returns trigger
language plpgsql as $$
begin
  if tg_op = 'INSERT' then
    new.created_by := coalesce(auth.uid(), new.created_by);
    new.created_at := now();
  else
    new.created_by := old.created_by;
    new.created_at := old.created_at;
  end if;
  return new;
end $$;

do $$
declare
  table_name text;
begin
  for table_name in
    select c.relname
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relkind = 'r'
      and exists (select 1 from pg_attribute a
                  where a.attrelid = c.oid and a.attname = 'created_by' and not a.attisdropped)
      and not exists (select 1 from pg_attribute a
                       where a.attrelid = c.oid and a.attname = 'updated_by' and not a.attisdropped)
      and not exists (select 1 from pg_attribute a
                       where a.attrelid = c.oid and a.attname = 'resolved_by' and not a.attisdropped)
  loop
    execute format(
      'create trigger %I before insert or update on public.%I
       for each row execute function stamp_created_only()',
      table_name || '_stamp_audit', table_name
    );
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Forma 3: granted_by + granted_at. Tablas: worker_areas, worker_marks.
-- ---------------------------------------------------------------------------
create function stamp_granted() returns trigger
language plpgsql as $$
begin
  if tg_op = 'INSERT' then
    new.granted_by := coalesce(auth.uid(), new.granted_by);
    new.granted_at := now();
  else
    new.granted_by := old.granted_by;
    new.granted_at := old.granted_at;
  end if;
  return new;
end $$;

do $$
declare
  table_name text;
begin
  for table_name in
    select c.relname
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relkind = 'r'
      and exists (select 1 from pg_attribute a
                  where a.attrelid = c.oid and a.attname = 'granted_by' and not a.attisdropped)
  loop
    execute format(
      'create trigger %I before insert or update on public.%I
       for each row execute function stamp_granted()',
      table_name || '_stamp_audit', table_name
    );
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Forma 4: assigned_by + assigned_at. Tabla: reservation_guides.
-- ---------------------------------------------------------------------------
create function stamp_assigned() returns trigger
language plpgsql as $$
begin
  if tg_op = 'INSERT' then
    new.assigned_by := coalesce(auth.uid(), new.assigned_by);
    new.assigned_at := now();
  else
    new.assigned_by := old.assigned_by;
    new.assigned_at := old.assigned_at;
  end if;
  return new;
end $$;

do $$
declare
  table_name text;
begin
  for table_name in
    select c.relname
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relkind = 'r'
      and exists (select 1 from pg_attribute a
                  where a.attrelid = c.oid and a.attname = 'assigned_by' and not a.attisdropped)
  loop
    execute format(
      'create trigger %I before insert or update on public.%I
       for each row execute function stamp_assigned()',
      table_name || '_stamp_audit', table_name
    );
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Forma 5: uploaded_by + uploaded_at. Tabla: unit_condition_photos.
-- ---------------------------------------------------------------------------
create function stamp_uploaded() returns trigger
language plpgsql as $$
begin
  if tg_op = 'INSERT' then
    new.uploaded_by := coalesce(auth.uid(), new.uploaded_by);
    new.uploaded_at := now();
  else
    new.uploaded_by := old.uploaded_by;
    new.uploaded_at := old.uploaded_at;
  end if;
  return new;
end $$;

do $$
declare
  table_name text;
begin
  for table_name in
    select c.relname
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relkind = 'r'
      and exists (select 1 from pg_attribute a
                  where a.attrelid = c.oid and a.attname = 'uploaded_by' and not a.attisdropped)
  loop
    execute format(
      'create trigger %I before insert or update on public.%I
       for each row execute function stamp_uploaded()',
      table_name || '_stamp_audit', table_name
    );
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Forma 6: updated_by + updated_at solamente, sin created_by. Tabla:
-- equipment_stock (una fila por categoria que se va actualizando; no hay
-- "quien la creo", solo "quien la toco por ultima vez").
-- ---------------------------------------------------------------------------
create function stamp_updated_only() returns trigger
language plpgsql as $$
begin
  new.updated_by := coalesce(auth.uid(), new.updated_by);
  new.updated_at := now();
  return new;
end $$;

do $$
declare
  table_name text;
begin
  for table_name in
    select c.relname
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relkind = 'r'
      and exists (select 1 from pg_attribute a
                  where a.attrelid = c.oid and a.attname = 'updated_by' and not a.attisdropped)
      and not exists (select 1 from pg_attribute a
                       where a.attrelid = c.oid and a.attname = 'created_by' and not a.attisdropped)
  loop
    execute format(
      'create trigger %I before insert or update on public.%I
       for each row execute function stamp_updated_only()',
      table_name || '_stamp_audit', table_name
    );
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Caso especial: deposits. created_by se firma igual que en la forma 2
-- (congelado desde la insercion). resolved_by/resolved_at se firman
-- SOLAMENTE en la actualizacion que saca el deposito de 'held' -- nunca en
-- la insercion (para no interferir con la validacion de
-- deposits_resolution_shape sobre un insert que llega incompleto a
-- proposito) y nunca mientras el deposito se queda en 'held' (estamparlos
-- ahi violaria esa misma restriccion).
-- ---------------------------------------------------------------------------
create function stamp_deposit_audit() returns trigger
language plpgsql as $$
begin
  if tg_op = 'INSERT' then
    new.created_by := coalesce(auth.uid(), new.created_by);
    new.created_at := now();
    -- resolved_by/resolved_at, si vienen, se dejan tal cual el cliente los
    -- mando: la firma de resolucion se pone en la actualizacion que resuelve
    -- el deposito, no aqui. Si vienen con datos invalidos para un deposito
    -- 'held', deposits_resolution_shape los rechaza como siempre.
  else
    new.created_by := old.created_by;
    new.created_at := old.created_at;
    if old.status = 'held' and new.status <> 'held' then
      new.resolved_by := coalesce(auth.uid(), new.resolved_by);
      new.resolved_at := now();
    else
      new.resolved_by := old.resolved_by;
      new.resolved_at := old.resolved_at;
    end if;
  end if;
  return new;
end $$;

create trigger deposits_stamp_audit
  before insert or update on deposits
  for each row execute function stamp_deposit_audit();
