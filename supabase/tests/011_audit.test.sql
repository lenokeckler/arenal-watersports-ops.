begin;
select plan(17);

-- La firma la pone la base desde auth.uid() y no la aplicacion: no se puede
-- olvidar en un camino de escritura ni falsificar desde el cliente. Hay seis
-- formas de firma en el esquema (ver task-12-report.md); esta prueba cubre
-- las seis, mas el caso especial de deposits.

-- Todas las filas de auth.users y workers se crean ANTES de cambiar de rol:
-- el rol authenticated no tiene privilegio de insercion sobre auth.users.
insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'admin@arenal.local'),
  ('22222222-2222-2222-2222-222222222222', 'ismael@arenal.local');

insert into workers (id, username, full_name, personal_email, base_role)
values ('11111111-1111-1111-1111-111111111111', 'admin', 'Leno', 'leno@correo.com', 'administracion');

insert into workers (id, username, full_name, base_role)
values ('22222222-2222-2222-2222-222222222222', 'ismael', 'Ismael', 'operaciones');

-- ============================ camino de siembra ============================
-- Sin sesion autenticada (aun no se cambia de rol), un valor explicito de
-- created_by/updated_by se conserva en vez de pisarse con null. La siembra
-- de la tarea 16 depende de este comportamiento.
insert into equipment_categories
  (id, name, tracking_mode, is_reservable, default_duration_minutes, created_by, updated_by)
values ('aaaaaaaa-0000-0000-0000-000000000001', 'Lancha rapida', 'by_unit', true, 60,
        '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111');

select is(
  (select created_by from equipment_categories where id = 'aaaaaaaa-0000-0000-0000-000000000001'),
  '11111111-1111-1111-1111-111111111111'::uuid,
  'siembra sin sesion: created_by explicito se conserva, no se pisa con null'
);
select is(
  (select updated_by from equipment_categories where id = 'aaaaaaaa-0000-0000-0000-000000000001'),
  '11111111-1111-1111-1111-111111111111'::uuid,
  'siembra sin sesion: updated_by explicito se conserva, no se pisa con null'
);

-- Fixtures adicionales, tambien sin sesion, para las formas 5 y 6.
insert into equipment_units (id, category_id, code, created_by, updated_by)
values ('bbbbbbbb-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'LANCHA-1',
        '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111');

insert into equipment_categories
  (id, name, tracking_mode, created_by, updated_by)
values ('aaaaaaaa-0000-0000-0000-000000000002', 'Chaleco', 'by_quantity',
        '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111');

-- ============================ forma 1: created_by + updated_by ============================
-- Tabla representativa: reservations.

set local role authenticated;
set local request.jwt.claims to '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';

-- El cliente intenta mentir sobre quien crea la reserva.
insert into reservations
  (id, customer_name, people_count, type, starts_at, duration_minutes, created_by, updated_by)
values ('dddddddd-0000-0000-0000-000000000001', 'Maria', 2, 'rental',
        '2026-09-05 10:00:00+00', 60,
        '22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222');

select is(
  (select created_by from reservations where id = 'dddddddd-0000-0000-0000-000000000001'),
  '11111111-1111-1111-1111-111111111111'::uuid,
  'forma created_by+updated_by: created_by sale de auth.uid(), no del cliente'
);
select is(
  (select updated_by from reservations where id = 'dddddddd-0000-0000-0000-000000000001'),
  '11111111-1111-1111-1111-111111111111'::uuid,
  'forma created_by+updated_by: updated_by tambien se firma al insertar'
);

reset role;
set local role authenticated;
set local request.jwt.claims to '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}';

-- Ismael actualiza, pero el cliente miente diciendo que fue el admin.
update reservations
set people_count = 3, updated_by = '11111111-1111-1111-1111-111111111111'
where id = 'dddddddd-0000-0000-0000-000000000001';

select is(
  (select updated_by from reservations where id = 'dddddddd-0000-0000-0000-000000000001'),
  '22222222-2222-2222-2222-222222222222'::uuid,
  'el disparador pisa un updated_by falsificado por el cliente'
);
select is(
  (select created_by from reservations where id = 'dddddddd-0000-0000-0000-000000000001'),
  '11111111-1111-1111-1111-111111111111'::uuid,
  'created_by sobrevive una actualizacion: sigue siendo quien creo la fila'
);

-- ============================ forma 2: created_by + created_at solamente ============================
-- Tabla representativa: reservation_charges (todavia autenticado como Ismael).

insert into reservation_charges (reservation_id, kind, amount, currency, payment_method, created_by)
values ('dddddddd-0000-0000-0000-000000000001', 'tariff', 60, 'USD', 'Efectivo',
        '11111111-1111-1111-1111-111111111111');

select is(
  (select created_by from reservation_charges
   where reservation_id = 'dddddddd-0000-0000-0000-000000000001' and amount = 60),
  '22222222-2222-2222-2222-222222222222'::uuid,
  'forma created_by+created_at: created_by sale de auth.uid(), no del cliente'
);

reset role;
set local role authenticated;
set local request.jwt.claims to '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';

-- El admin intenta apropiarse de un cobro que registro Ismael, actualizandolo.
update reservation_charges
set payment_method = 'SINPE', created_by = '11111111-1111-1111-1111-111111111111'
where reservation_id = 'dddddddd-0000-0000-0000-000000000001' and amount = 60;

select is(
  (select created_by from reservation_charges
   where reservation_id = 'dddddddd-0000-0000-0000-000000000001' and amount = 60),
  '22222222-2222-2222-2222-222222222222'::uuid,
  'created_by de una tabla de solo insercion queda congelado aunque se actualice despues'
);

-- ============================ forma 3: granted_by + granted_at ============================
-- Tabla representativa: worker_areas.

reset role;
set local role authenticated;
set local request.jwt.claims to '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}';

insert into worker_areas (worker_id, area, granted_by)
values ('22222222-2222-2222-2222-222222222222', 'reservas', '11111111-1111-1111-1111-111111111111');

select is(
  (select granted_by from worker_areas
   where worker_id = '22222222-2222-2222-2222-222222222222' and area = 'reservas'),
  '22222222-2222-2222-2222-222222222222'::uuid,
  'forma granted_by+granted_at: granted_by sale de auth.uid(), no del cliente'
);

-- ============================ forma 4: assigned_by + assigned_at ============================
-- Tabla representativa: reservation_guides (sigue autenticado como Ismael).

insert into reservation_guides (reservation_id, worker_id, assigned_by)
values ('dddddddd-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
        '11111111-1111-1111-1111-111111111111');

select is(
  (select assigned_by from reservation_guides
   where reservation_id = 'dddddddd-0000-0000-0000-000000000001'
     and worker_id = '11111111-1111-1111-1111-111111111111'),
  '22222222-2222-2222-2222-222222222222'::uuid,
  'forma assigned_by+assigned_at: assigned_by sale de auth.uid(), no del cliente'
);

-- ============================ forma 5: uploaded_by + uploaded_at ============================
-- Tabla representativa: unit_condition_photos (sigue autenticado como Ismael).

insert into unit_condition_photos (unit_id, angle, storage_path, uploaded_by)
values ('bbbbbbbb-0000-0000-0000-000000000001', 'right_side', 'fotos/lancha-1-der.webp',
        '11111111-1111-1111-1111-111111111111');

select is(
  (select uploaded_by from unit_condition_photos
   where unit_id = 'bbbbbbbb-0000-0000-0000-000000000001' and angle = 'right_side'),
  '22222222-2222-2222-2222-222222222222'::uuid,
  'forma uploaded_by+uploaded_at: uploaded_by sale de auth.uid(), no del cliente'
);

-- ============================ forma 6: updated_by + updated_at solamente ============================
-- Tabla representativa: equipment_stock (sigue autenticado como Ismael).

insert into equipment_stock (category_id, updated_by)
values ('aaaaaaaa-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111');

select is(
  (select updated_by from equipment_stock where category_id = 'aaaaaaaa-0000-0000-0000-000000000002'),
  '22222222-2222-2222-2222-222222222222'::uuid,
  'forma updated_by+updated_at solamente: updated_by sale de auth.uid(), no del cliente'
);

-- ============================ caso especial: deposits ============================

reset role;
set local role authenticated;
set local request.jwt.claims to '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';

-- created_by se firma igual que en la forma 2, aunque el cliente mienta.
insert into deposits (id, reservation_id, amount, currency, created_by)
values ('eeeeeeee-0000-0000-0000-000000000001', 'dddddddd-0000-0000-0000-000000000001',
        200, 'USD', '22222222-2222-2222-2222-222222222222');

select is(
  (select created_by from deposits where id = 'eeeeeeee-0000-0000-0000-000000000001'),
  '11111111-1111-1111-1111-111111111111'::uuid,
  'deposits: created_by sale de auth.uid(), no del cliente'
);

-- Mientras el deposito sigue held, resolved_by/resolved_at no se tocan:
-- estamparlos violaria deposits_resolution_shape.
update deposits set amount = 200 where id = 'eeeeeeee-0000-0000-0000-000000000001';

select ok(
  (select resolved_by is null from deposits where id = 'eeeeeeee-0000-0000-0000-000000000001'),
  'deposits: resolved_by no se estampa mientras el deposito sigue held'
);
select ok(
  (select resolved_at is null from deposits where id = 'eeeeeeee-0000-0000-0000-000000000001'),
  'deposits: resolved_at no se estampa mientras el deposito sigue held'
);

reset role;
set local role authenticated;
set local request.jwt.claims to '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}';

-- Ismael resuelve el deposito, pero el cliente miente diciendo que fue el admin.
update deposits
set status = 'returned', resolved_by = '11111111-1111-1111-1111-111111111111', resolved_at = now()
where id = 'eeeeeeee-0000-0000-0000-000000000001';

select is(
  (select resolved_by from deposits where id = 'eeeeeeee-0000-0000-0000-000000000001'),
  '22222222-2222-2222-2222-222222222222'::uuid,
  'deposits: resolved_by se estampa con auth.uid() al resolver, no con lo que mande el cliente'
);
select ok(
  (select resolved_at is not null from deposits where id = 'eeeeeeee-0000-0000-0000-000000000001'),
  'deposits: resolved_at se estampa al resolver'
);

select * from finish();
rollback;
