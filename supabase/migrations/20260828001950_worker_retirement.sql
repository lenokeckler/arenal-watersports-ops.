-- Cuando alguien deja de trabajar aqui su perfil no tiene por que seguir
-- existiendo, pero el historial de lo que hizo si: quien creo una reserva,
-- quien despacho una salida, quien levanto un conteo, quien cobro.
--
-- Un `delete` de verdad no sirve para eso. Hay 36 llaves foraneas apuntando
-- a `workers` y casi todas son `no action`, asi que Postgres rechaza el
-- borrado en cuanto la persona firmo cualquier cosa — y las pocas que
-- cascadearan borrarian justamente el historial que hay que conservar.
--
-- Asi que "eliminar" aqui significa lo que la duena pidio, no menos: la
-- cuenta desaparece, no se puede volver a entrar con ella, los datos
-- personales se van, y la persona sale de todas las listas. Lo unico que
-- sobrevive es el minimo que el historial necesita para seguir explicando
-- quien hizo que: el identificador y el nombre que firma cada registro.
--
-- El borrado de la fila de `auth.users`, el de las areas y marcas, y el
-- borrado de los datos personales los hace la ruta de servidor con service
-- role (`DELETE /api/administracion/trabajadores/[workerId]`). Aqui va lo
-- que ninguna ruta puede saltarse.
alter table workers
  add column deleted_at timestamptz;

comment on column workers.deleted_at is
  'Cuando el perfil se elimino. La fila sobrevive solo para que la firma de los registros que la persona dejo siga teniendo nombre; no es una cuenta.';

-- Toda lista de trabajadores filtra por esto, asi que el indice cubre el
-- caso comun: los perfiles que siguen existiendo.
create index workers_active_profile_idx
  on workers (deleted_at)
  where deleted_at is null;

-- La cuenta de administracion ya no se puede borrar ni bloquear; tampoco se
-- puede retirar. Es la unica cuenta que puede volver a crear a las demas.
create or replace function guard_admin_account() returns trigger
language plpgsql as $$
begin
  if old.base_role = 'administracion' then
    if tg_op = 'DELETE' then
      raise exception 'La cuenta de administracion no se elimina';
    end if;
    if new.status = 'blocked' then
      raise exception 'La cuenta de administracion no se bloquea';
    end if;
    if new.base_role <> 'administracion' then
      raise exception 'La cuenta de administracion no cambia de rol';
    end if;
    if new.deleted_at is not null then
      raise exception 'La cuenta de administracion no se elimina';
    end if;
  end if;
  -- En un BEFORE DELETE, NEW es nulo y devolver nulo cancelaria el borrado.
  return case when tg_op = 'DELETE' then old else new end;
end $$;

-- Un perfil eliminado no vuelve. Sin esto, un `update` cualquiera podria
-- resucitar una cuenta que ya se despidio, y encima con sus areas y marcas
-- viejas si alguien las volviera a insertar.
create function guard_worker_stays_deleted() returns trigger
language plpgsql as $$
begin
  if old.deleted_at is not null and new.deleted_at is null then
    raise exception 'Un perfil eliminado no se reactiva: cree una cuenta nueva';
  end if;
  return new;
end $$;

create trigger workers_guard_deleted
  before update on workers
  for each row execute function guard_worker_stays_deleted();
