-- `category_availability` solo sabia leer `equipment_stock`, asi que una
-- categoria `by_unit` (jet skis, lanchas, cuadraciclos) no tenia fila ahi y
-- la funcion no servia para ella. Con `units_are_interchangeable`
-- (20260828002250) eso deja de ser un caso raro: un jet ski intercambiable
-- ahora se agenda por cantidad, y esta funcion es exactamente lo que
-- `ReservationFormQuantityCategory` lee para mostrar "6 de 6 libres".
--
-- `usable` se resuelve distinto segun `tracking_mode`, no segun
-- `units_are_interchangeable`: lo que cambia es de donde sale el numero
-- (`equipment_stock` contra contar `equipment_units`), no si la categoria es
-- intercambiable.
--
-- `committed` ahora suma las dos formas en que un compromiso puede vivir
-- sobre una categoria por unidad, porque despues de este cambio conviven en
-- la misma categoria: una reserva agendada por cantidad (Reservas, antes de
-- despachar) y otra ya despachada con unidades concretas (Operaciones,
-- `applyReservationEquipmentEdit` convierte la una en la otra al despachar).
-- Antes de este cambio esa segunda forma nunca competia por cantidad, asi
-- que sumarla no cambia nada para una categoria `by_quantity` (`ri.unit_id`
-- nunca apunta a una unidad de una categoria por cantidad -- ver
-- `check_unit_category_mode`, 20260828000500).
create or replace function category_availability(
  p_category_id         uuid,
  p_starts_at           timestamptz,
  p_ends_at             timestamptz,
  p_exclude_reservation uuid default null
) returns table (usable integer, committed integer, free integer)
language sql stable as $$
  with category as (
    select tracking_mode from equipment_categories where id = p_category_id
  ),
  stock as (
    -- by_quantity: lo disponible en equipment_stock, igual que siempre (una
    -- categoria recien creada sin fila todavia usa 0, no "sin fila" -- C15,
    -- 20260828001050). by_unit: cuenta sus propias unidades, con el mismo
    -- criterio que unit_current_state usa para decir "available" -- ni de
    -- baja, ni danada, ni en mantenimiento o reparacion.
    select case (select tracking_mode from category)
      when 'by_quantity' then coalesce(
        (select quantity_available from equipment_stock where category_id = p_category_id), 0)
      else (
        select count(*) from equipment_units
        where category_id = p_category_id and status = 'available')
    end::integer as usable
  ),
  taken as (
    select
      coalesce((
        -- Comprometido por cantidad: una linea de categoria+cantidad, la
        -- forma en que Reservas agenda cualquier categoria intercambiable.
        select sum(ri.quantity)::integer
        from reservation_items ri
        join reservations r on r.id = ri.reservation_id
        where ri.category_id = p_category_id
          and r.status in ('scheduled', 'dispatched')
          and r.id is distinct from p_exclude_reservation
          and tstzrange(r.starts_at, r.ends_at, '[)')
              && tstzrange(p_starts_at, p_ends_at, '[)')
      ), 0)
      +
      coalesce((
        -- Comprometido por unidad: una linea con unit_id propio, cuya
        -- unidad pertenece a esta categoria -- la lancha (nunca
        -- intercambiable) y cualquier categoria por unidad ya despachada
        -- (la cantidad convertida en unidades concretas).
        select count(*)::integer
        from reservation_items ri
        join reservations r on r.id = ri.reservation_id
        join equipment_units u on u.id = ri.unit_id
        where u.category_id = p_category_id
          and r.status in ('scheduled', 'dispatched')
          and r.id is distinct from p_exclude_reservation
          and tstzrange(r.starts_at, r.ends_at, '[)')
              && tstzrange(p_starts_at, p_ends_at, '[)')
      ), 0) as committed
  )
  select stock.usable, taken.committed, stock.usable - taken.committed
  from stock, taken;
$$;
