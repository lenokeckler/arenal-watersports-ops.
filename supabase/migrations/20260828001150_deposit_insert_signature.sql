-- deposits_resolution_shape permite insertar un deposito que YA nace resuelto
-- (status <> 'held' con resolved_at y resolved_by presentes). stamp_deposit_audit
-- solo firmaba resolved_by en la actualizacion que saca el deposito de 'held',
-- asi que un cliente con permiso de insertar podia crear un deposito ya
-- resuelto y atribuirle la resolucion al worker que quisiera -- una firma
-- falsificada en una tabla de dinero, justo lo que esta tarea existe para
-- impedir.
--
-- resolved_at no se toca en la insercion: deposits_resolution_shape ya exige
-- que venga presente cuando status <> 'held', y pisarlo aqui cambiaria el
-- comportamiento que las pruebas de esa restriccion dependen de verificar
-- (un insert resuelto sin resolved_at debe seguir siendo rechazado).
create or replace function stamp_deposit_audit() returns trigger
language plpgsql as $$
begin
  if tg_op = 'INSERT' then
    new.created_by := coalesce(auth.uid(), new.created_by);
    new.created_at := now();
    if new.status <> 'held' then
      new.resolved_by := coalesce(auth.uid(), new.resolved_by);
    end if;
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
