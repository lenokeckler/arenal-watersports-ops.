-- Las cuatro columnas de precio vivian en `reservations`, y ahi las leia
-- cualquier trabajador con area de operaciones: reservations_select deja
-- pasar a reservas, a operaciones y a administracion por igual.
--
-- Eso contradice lo que el resto del esquema ya decidio. reservation_charges,
-- refunds y deposits tienen un RLS que le niega el dinero a operaciones a
-- proposito, y las pruebas de 20260828001500_reports.sql confirman que una
-- cuenta de operaciones ve cero filas del reporte de ingresos. Verificado
-- contra la base sembrada antes de este cambio: con una cuenta solo de
-- operaciones, `select count(*) from reservation_charges` devolvia 0 filas
-- mientras `select agreed_amount_usd from reservations` devolvia 480.00. Solo
-- la pantalla lo escondia, y US-TAB-007 pide justo lo contrario: la
-- restriccion no se queda en esconder botones, el servidor rechaza la
-- operacion aunque se intente por otro camino.
--
-- El RLS de Postgres es por fila y no por columna, y un
-- `revoke select (columna)` no sirve aqui porque reservas y operaciones son
-- el mismo rol `authenticated`: lo que los separa es has_area(), que solo se
-- puede evaluar en una politica. Por eso el precio se muda a su propia tabla,
-- con el mismo RLS que ya tienen los depositos.
create table reservation_pricing (
  reservation_id    uuid primary key references reservations(id) on delete cascade,
  list_amount_usd   numeric(12,2),
  list_amount_crc   numeric(14,2),
  agreed_amount_usd numeric(12,2),
  agreed_amount_crc numeric(14,2),
  created_by        uuid references workers(id),
  updated_by        uuid references workers(id),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create trigger reservation_pricing_stamp_audit
  before insert or update on reservation_pricing
  for each row execute function stamp_audit_fields();

insert into reservation_pricing
  (reservation_id, list_amount_usd, list_amount_crc,
   agreed_amount_usd, agreed_amount_crc, created_by, updated_by)
select id, list_amount_usd, list_amount_crc,
       agreed_amount_usd, agreed_amount_crc, created_by, updated_by
from reservations
where list_amount_usd is not null or list_amount_crc is not null
   or agreed_amount_usd is not null or agreed_amount_crc is not null;

-- 20260828000750_split_child_no_charge.sql garantizaba con un CHECK que la
-- hija de una division naciera sin cobro propio. Un CHECK solo puede mirar
-- columnas de su propia fila, asi que no puede seguir al precio a otra tabla:
-- lo reemplaza este trigger, que es mas estricto que el CHECK porque rechaza
-- en el momento de escribir el precio en vez de al validar la fila.
--
-- Va con security definer y search_path fijado a proposito: una garantia de
-- integridad no puede depender de que quien escribe alcance a ver la reserva
-- madre. Si la consulta corriera con los permisos del que llama y la fila no
-- le fuera visible, el `exists` daria falso y el precio pasaria.
create function reservation_pricing_reject_split_child()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if exists (
    select 1 from reservations r
    where r.id = new.reservation_id
      and r.parent_reservation_id is not null
  ) then
    raise exception
      'una salida nacida de una division no lleva cobro propio: se cobra por reserva y no por persona, asi que el cobro se queda completo en la reserva original';
  end if;
  return new;
end;
$$;

create trigger reservation_pricing_no_split_child
  before insert or update on reservation_pricing
  for each row execute function reservation_pricing_reject_split_child();

alter table reservations drop constraint reservations_split_child_no_charge;
alter table reservations
  drop column list_amount_usd,
  drop column list_amount_crc,
  drop column agreed_amount_usd,
  drop column agreed_amount_crc;

-- El mismo alcance que deposits_select / _insert / _update: reservas y
-- administracion. Operaciones no aparece, que es el punto de toda la
-- migracion. `delete` queda sin politica y sin permiso, como en el resto del
-- esquema: borrar exige la ruta de servidor con service role.
alter table reservation_pricing enable row level security;

create policy reservation_pricing_select on reservation_pricing
  for select to authenticated
  using (has_area('reservas') or is_admin());
create policy reservation_pricing_insert on reservation_pricing
  for insert to authenticated
  with check (has_area('reservas') or is_admin());
create policy reservation_pricing_update on reservation_pricing
  for update to authenticated
  using (has_area('reservas') or is_admin())
  with check (has_area('reservas') or is_admin());

grant select, insert, update on reservation_pricing to authenticated;
