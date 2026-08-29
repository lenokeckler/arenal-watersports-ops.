-- Al partir una reserva, el cobro no se parte: se queda completo en la
-- reserva original, a nombre del mismo cliente, porque la empresa cobra por
-- reserva y no por persona. La hija nace sin cobro propio en estas cuatro
-- columnas; el tiempo extra que corra por su cuenta se factura aparte, en
-- reservation_charges (tarea 9), y esta restriccion no lo toca.
alter table reservations
  add constraint reservations_split_child_no_charge
  check (
    parent_reservation_id is null
    or (list_amount_usd is null and list_amount_crc is null
        and agreed_amount_usd is null and agreed_amount_crc is null)
  );
