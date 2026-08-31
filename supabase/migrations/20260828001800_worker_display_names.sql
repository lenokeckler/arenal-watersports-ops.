-- RNF-022 / RNF-023: "toda reserva, despacho, cierre, cobro, conteo de
-- inventario, reporte de dano y trabajo de mantenimiento guarda quien lo
-- creo... esa firma se muestra en el detalle del registro y en el
-- historial". US-OPE-024 lo pide con todas sus letras para los conteos:
-- "cada conteo guarda su fecha y el nombre de quien lo levanto".
--
-- El problema es que workers_select es 'id = auth.uid() or is_admin()', y
-- workers_select_guides solo abre la fila de quien tiene la marca 'guia'.
-- Un reporte de dano firmado por un companero sin esa marca deja el nombre
-- en nulo: la firma existe en la base pero no se puede mostrar.
--
-- Abrir la fila entera de workers seria demasiado: ahi viven el nombre de
-- usuario, el correo personal, la cedula y el contador de intentos
-- fallidos, y el RLS es por fila, no por columna. Esta funcion es la
-- rendija minima equivalente: security definer, devuelve UNICAMENTE el
-- nombre visible, y solo de los identificadores que quien pregunta ya
-- tiene a la vista en la propia firma del registro (created_by de
-- damage_reports, maintenance_records, inventory_counts y
-- equipment_stock_movements, cuyas politicas de select ya son abiertas).
create function worker_display_names(p_worker_ids uuid[])
returns table (worker_id uuid, full_name text)
language sql stable security definer set search_path = public as $$
  select w.id, w.full_name
  from workers w
  where w.id = any (p_worker_ids);
$$;

comment on function worker_display_names(uuid[]) is
  'RNF-023: nombre visible de los firmantes de un registro, y nada mas. No sustituye a workers_select: la fila completa del companero sigue siendo privada.';

-- Sin sesion no hay firma que mostrar. El default de Postgres otorga
-- execute a public, asi que hay que revocarlo explicitamente antes de
-- concederlo a quien si lo necesita.
revoke execute on function worker_display_names(uuid[]) from public, anon;
grant execute on function worker_display_names(uuid[]) to authenticated;
