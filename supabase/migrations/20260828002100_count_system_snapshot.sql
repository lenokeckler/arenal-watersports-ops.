-- US-OPE-024 existe para "ver como ha cambiado el inventario y desde cuando
-- falta algo". Un conteo guardaba solo lo que se conto, asi que la
-- diferencia contra lo que el sistema creia tener se veia una sola vez —
-- mientras se contaba, al lado del campo— y despues se perdia. Al abrir un
-- conteo de hace tres meses no habia forma de saber si aquel dia faltaba
-- algo.
--
-- Compararlo despues contra las existencias de hoy no sirve: el inventario
-- cambia todo el tiempo, y esa resta diria cuanto falta ahora, no cuanto
-- faltaba entonces. Lo unico honesto es guardar lo que el sistema decia en
-- el momento del conteo, que es justo lo que la pantalla ya le mostraba a
-- quien contaba.
--
-- Nulo en las lineas que ya existen y en las de categorias por unidad, donde
-- la comparacion es unidad por unidad y no una cantidad.
alter table inventory_count_lines
  add column system_quantity_available integer,
  add column system_quantity_damaged integer,
  add column system_quantity_in_repair integer;

comment on column inventory_count_lines.system_quantity_available is
  'Lo que el sistema tenia registrado el dia del conteo. Congelado a proposito: comparar contra las existencias de hoy diria cuanto falta ahora, no cuanto faltaba entonces.';
