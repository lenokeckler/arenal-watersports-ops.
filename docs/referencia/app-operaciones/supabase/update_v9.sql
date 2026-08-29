-- update_v9.sql — Retención de 12 meses para el historial de reservas.
--
-- Borra automáticamente las reservas con más de 12 meses de antigüedad para
-- mantener la base de datos liviana. Las tablas hijas caen solas:
--   reservation_units / reservation_guides / reservation_addons → ON DELETE CASCADE
--   damage_reports → ON DELETE SET NULL (el historial de daños del equipo se conserva,
--                    solo se desliga de la reserva borrada).
--
-- ⚠️  ES UN BORRADO PERMANENTE. Pasados 12 meses, esas reservas (y sus gráficos
--     en el historial mensual) ya no se podrán consultar.
--
-- Idempotente: re-ejecutable sin error.

-- 1) Función de purga. Borra reservas cuyo start_time tenga más de N meses (por defecto 12).
--    Devuelve cuántas filas borró (útil para probarla a mano sin programarla).
create or replace function public.purge_old_reservations(keep_months integer default 12)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  deleted integer;
begin
  delete from public.reservations
  where start_time < (now() - make_interval(months => keep_months));
  get diagnostics deleted = row_count;
  return deleted;
end;
$$;

-- 2) Programación mensual con pg_cron.
--    Si esta línea da error "extension pg_cron is not available", habilita primero
--    pg_cron en Supabase: Database → Extensions → buscar "pg_cron" → Enable.
create extension if not exists pg_cron;

-- cron.schedule con nombre es idempotente: re-programa el job si ya existía.
-- '0 3 1 * *' = el día 1 de cada mes a las 03:00.
select cron.schedule(
  'purge-old-reservations',
  '0 3 1 * *',
  $$ select public.purge_old_reservations(12); $$
);

-- --- Cómo verificarlo / operarlo (no es necesario ejecutarlo) ---------------
-- Borrar ahora mismo lo que ya tiene >12 meses (y ver cuántas borró):
--   select public.purge_old_reservations(12);
-- Ver el job programado:
--   select * from cron.job where jobname = 'purge-old-reservations';
-- Quitar la programación (si algún día quieres dejar de borrar):
--   select cron.unschedule('purge-old-reservations');
