-- Corrige dos defectos encontrados en la revision de la migracion
-- 20260828001000_availability.sql, que ya esta aplicada y no se toca.

-- C15: cuando la categoria todavia no tiene fila en equipment_stock (una
-- categoria por cantidad recien creada, antes de registrar existencias), el
-- cruce implicito entre "stock" y "taken" devolvia cero filas en vez de una
-- fila con usable = 0. La funcion existe para informar; no devolver ninguna
-- fila es el peor resultado posible para quien la llama esperando siempre
-- una. Ahora "stock" trae exactamente una fila siempre, con 0 si no hay
-- registro, y el cruce con "taken" (que tambien trae siempre una fila) queda
-- garantizado en una unica fila de salida.
create or replace function category_availability(
  p_category_id         uuid,
  p_starts_at           timestamptz,
  p_ends_at             timestamptz,
  p_exclude_reservation uuid default null
) returns table (usable integer, committed integer, free integer)
language sql stable as $$
  with stock as (
    -- Solo lo disponible cuenta: lo danado y lo que esta en reparacion no se
    -- ofrece. Si la categoria no tiene fila de stock todavia, usable es 0,
    -- no "sin fila".
    select coalesce(
      (select quantity_available from equipment_stock where category_id = p_category_id),
      0
    )::integer as usable
  ),
  taken as (
    select coalesce(sum(ri.quantity), 0)::integer as committed
    from reservation_items ri
    join reservations r on r.id = ri.reservation_id
    where ri.category_id = p_category_id
      and r.status in ('scheduled', 'dispatched')
      and r.id is distinct from p_exclude_reservation
      and tstzrange(r.starts_at, r.ends_at, '[)')
          && tstzrange(p_starts_at, p_ends_at, '[)')
  )
  select stock.usable, taken.committed, stock.usable - taken.committed
  from stock, taken;
$$;

-- C16: con dos reservas despachadas encima de la misma unidad (la operacion
-- se reacomoda sobre la marcha y eso pasa de verdad), "order by r.ends_at
-- limit 1" tomaba la que termina primero, no la que sigue teniendo la unidad
-- de verdad. Errar tarde solo cuesta una espera; errar temprano entrega un
-- equipo que todavia esta en el agua. Ahora se toma la de fin mas tardio.
create or replace view unit_current_state as
select
  u.id,
  u.code,
  u.category_id,
  u.status as recorded_status,
  case
    when u.status <> 'available' then u.status::text
    when active_trip.reservation_id is not null then 'occupied'
    else 'available'
  end as effective_status,
  active_trip.reservation_id,
  active_trip.returns_at
from equipment_units u
left join lateral (
  select r.id as reservation_id, r.ends_at as returns_at
  from reservation_items ri
  join reservations r on r.id = ri.reservation_id
  where ri.unit_id = u.id
    and r.status = 'dispatched'
  order by r.ends_at desc
  limit 1
) active_trip on true;
