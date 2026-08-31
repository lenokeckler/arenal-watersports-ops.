-- US-RES-012/US-RES-014: reservas necesita listar quien tiene la marca
-- 'guia' para asignarlo a un tour, y tanto reservas como operaciones
-- necesitan ver el nombre de los guias ya asignados en el tablero, el
-- detalle de una reserva y el historial -- las tres pantallas que
-- reservation_guides ya expone via el embed a `workers`.
--
-- workers_select ('id = auth.uid() or is_admin()') y worker_marks_select
-- ('worker_id = auth.uid() or is_admin()') no dejan pasar ninguno de los
-- dos casos para quien no es admin: cada embed a `workers` de un guia que
-- no sea la propia persona vuelve nulo, y una consulta directa a
-- worker_marks filtrando por mark = 'guia' no ve ninguna fila ajena.
--
-- Las dos politicas de abajo abren una rendija minima y no recursiva:
-- worker_marks solo se abre para la marca 'guia' en si (no para
-- 'encargado_general' ni 'registro_guias_externos', que siguen privadas), y
-- workers solo se abre para la fila de quien ya tiene esa marca. La
-- subconsulta de workers_select_guides se resuelve contra worker_marks bajo
-- las politicas de quien pregunta -- ya permitidas por
-- worker_marks_select_guides -- asi que no hace falta ninguna funcion
-- security definer nueva.
create policy worker_marks_select_guides on worker_marks
  for select to authenticated
  using (
    (has_area('reservas') or has_area('operaciones'))
    and mark = 'guia'
  );

create policy workers_select_guides on workers
  for select to authenticated
  using (
    (has_area('reservas') or has_area('operaciones'))
    and exists (
      select 1 from worker_marks wm
      where wm.worker_id = workers.id and wm.mark = 'guia'
    )
  );
