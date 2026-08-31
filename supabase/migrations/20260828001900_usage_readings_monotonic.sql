-- El horometro de una maquina solo sube. `usage_out` se escribe al despachar
-- y `usage_in` al cerrar, y de esa resta sale `equipment_units.usage_total`,
-- que es el acumulado del que leen el reporte de horas de uso (US-ADM-028) y
-- el aviso de cambio de aceite (US-OPE-012), que compara ese acumulado contra
-- `next_oil_change_at`.
--
-- Nada impedia cerrar con una lectura menor que la de salida. Reproducido
-- contra la aplicacion corriendo: se desapacho el PONTOON con 12.5 horas y se
-- cerro con 11, la salida se cerro sin una sola queja y `usage_total` bajo de
-- 12.50 a 11.00. Un digito mal tecleado en el muelle mueve el acumulado hacia
-- atras para siempre y corre el aviso de aceite sin que nadie se entere: el
-- reporte sigue dando un numero, solo que uno falso.
--
-- La pantalla de cierre ahora muestra con que lectura salio la unidad, para
-- que el numero que no cuadra se vea en el momento. Pero eso es ayuda, no
-- garantia: la garantia va aqui, donde no se puede saltar por ninguna via.
--
-- Un CHECK basta y es lo correcto: las dos columnas viven en la misma fila.
-- El combustible no lleva restriccion equivalente a proposito — gastar
-- gasolina es justamente lo que se espera, asi que `fuel_in` menor que
-- `fuel_out` es lo normal, y volver con mas es legitimo si la maquina se
-- tanqueo durante la salida.
alter table reservation_items
  add constraint reservation_items_usage_never_goes_back
  check (
    usage_out is null
    or usage_in is null
    or usage_in >= usage_out
  );
