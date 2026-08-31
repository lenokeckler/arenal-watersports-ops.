-- US-RES-011: un extra que no ocupa inventario (solo cobro adicional, por
-- ejemplo una parrilla que no tiene occupies_category_id) no tiene ni unidad
-- ni categoria/cantidad que registrar -- pero sigue siendo parte del
-- compromiso de la salida y tiene que quedar asociado a la reserva. La forma
-- original de item_is_unit_or_quantity solo aceptaba las dos mitades del
-- hibrido "unidad" o "categoria+cantidad"; esta migracion agrega una tercera
-- forma, solo valida cuando extra_id esta presente y las tres columnas de
-- inventario quedan vacias. Un item que no es ni unidad, ni categoria/cantidad,
-- ni extra sigue rechazado exactamente igual que antes.
alter table reservation_items
  drop constraint item_is_unit_or_quantity;

alter table reservation_items
  add constraint item_is_unit_or_quantity
  check (
    (unit_id is not null and category_id is null and quantity is null)
    or
    (unit_id is null and category_id is not null and quantity is not null)
    or
    (unit_id is null and category_id is null and quantity is null
     and extra_id is not null)
  );
