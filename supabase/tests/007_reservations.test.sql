begin;
select plan(25);

insert into auth.users (id, email)
values ('11111111-1111-1111-1111-111111111111', 'admin@arenal.local');
insert into workers (id, username, full_name, personal_email, base_role)
values ('11111111-1111-1111-1111-111111111111', 'admin', 'Leno', 'leno@correo.com', 'administracion');

insert into equipment_categories
  (id, name, tracking_mode, is_reservable, default_duration_minutes, created_by, updated_by)
values ('aaaaaaaa-0000-0000-0000-000000000001', 'Kayak doble', 'by_quantity', true, 60,
        '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111');

-- Categoria by_unit, aparte del kayak, para tener una unidad concreta con la
-- que probar la mitad "unidad" del hibrido de reservation_items.
insert into equipment_categories
  (id, name, tracking_mode, created_by, updated_by)
values ('aaaaaaaa-0000-0000-0000-000000000002', 'Lancha rapida', 'by_unit',
        '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111');

insert into equipment_units (id, category_id, code, created_by, updated_by)
values ('bbbbbbbb-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000002', 'LANCHA-1',
        '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111');

insert into combos (id, name, package_price_usd, created_by, updated_by)
values ('cccccccc-0000-0000-0000-000000000001', 'Paquete kayak', 100,
        '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111');

insert into reservations
  (id, customer_name, people_count, type, starts_at, duration_minutes, created_by, updated_by)
values ('dddddddd-0000-0000-0000-000000000001', 'Maria', 2, 'rental',
        '2026-09-05 10:00:00+00', 120,
        '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111');

-- El codigo se genera solo y es legible.
select matches(
  (select code from reservations where id = 'dddddddd-0000-0000-0000-000000000001'),
  '^R-[0-9]{6}$',
  'el codigo de reserva se genera con formato R-000000'
);

-- ends_at es columna generada: ninguna consulta la recalcula.
select is(
  (select ends_at from reservations where id = 'dddddddd-0000-0000-0000-000000000001'),
  '2026-09-05 12:00:00+00'::timestamptz,
  'ends_at sale de starts_at mas la duracion'
);

-- status por defecto es 'scheduled'.
select is(
  (select status from reservations where id = 'dddddddd-0000-0000-0000-000000000001'),
  'scheduled'::reservation_status,
  'una reserva nueva queda en estado scheduled'
);

-- extra_time_minutes por defecto es 0.
select is(
  (select extra_time_minutes from reservations where id = 'dddddddd-0000-0000-0000-000000000001'),
  0,
  'extra_time_minutes arranca en cero'
);

insert into reservations
  (id, customer_name, people_count, type, starts_at, duration_minutes, created_by, updated_by)
values ('dddddddd-0000-0000-0000-000000000009', 'Pedro', 1, 'rental',
        '2026-09-06 09:00:00+00', 60,
        '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111');

-- La secuencia del codigo avanza: dos reservas no comparten codigo.
select isnt(
  (select code from reservations where id = 'dddddddd-0000-0000-0000-000000000009'),
  (select code from reservations where id = 'dddddddd-0000-0000-0000-000000000001'),
  'dos reservas reciben codigos distintos'
);

-- El codigo es unico: forzar el mismo codigo en dos reservas revienta.
select lives_ok(
  $$ insert into reservations
       (id, customer_name, people_count, type, starts_at, duration_minutes, code,
        created_by, updated_by)
     values ('dddddddd-0000-0000-0000-000000000010', 'Ana', 1, 'rental',
             '2026-09-07 09:00:00+00', 60, 'R-555555',
             '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111') $$,
  'una reserva con codigo explicito valido se inserta bien'
);

select throws_ok(
  $$ insert into reservations
       (customer_name, people_count, type, starts_at, duration_minutes, code,
        created_by, updated_by)
     values ('Otro', 1, 'rental', '2026-09-08 09:00:00+00', 60, 'R-555555',
             '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111') $$,
  '23505', null,
  'el codigo de reserva no se repite'
);

-- people_count tiene que ser positivo.
select throws_ok(
  $$ insert into reservations
       (customer_name, people_count, type, starts_at, duration_minutes, created_by, updated_by)
     values ('Sin gente', 0, 'rental', '2026-09-09 09:00:00+00', 60,
             '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111') $$,
  '23514', null,
  'people_count exige un valor positivo'
);

-- duration_minutes tiene que ser positivo.
select throws_ok(
  $$ insert into reservations
       (customer_name, people_count, type, starts_at, duration_minutes, created_by, updated_by)
     values ('Sin duracion', 1, 'rental', '2026-09-09 09:00:00+00', 0,
             '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111') $$,
  '23514', null,
  'duration_minutes exige un valor positivo'
);

-- extra_time_minutes no puede ser negativo.
select throws_ok(
  $$ insert into reservations
       (customer_name, people_count, type, starts_at, duration_minutes, extra_time_minutes,
        created_by, updated_by)
     values ('Tiempo negativo', 1, 'rental', '2026-09-09 09:00:00+00', 60, -1,
             '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111') $$,
  '23514', null,
  'extra_time_minutes no acepta valores negativos'
);

-- combo_id solo tiene sentido cuando type es combo.
select throws_ok(
  $$ insert into reservations
       (customer_name, people_count, type, combo_id, starts_at, duration_minutes,
        created_by, updated_by)
     values ('Combo mal puesto', 1, 'rental', 'cccccccc-0000-0000-0000-000000000001',
             '2026-09-09 09:00:00+00', 60,
             '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111') $$,
  '23514', null,
  'una reserva que no es combo no puede llevar combo_id'
);

-- Camino feliz: una reserva de tipo combo si puede llevar combo_id.
select lives_ok(
  $$ insert into reservations
       (customer_name, people_count, type, combo_id, starts_at, duration_minutes,
        created_by, updated_by)
     values ('Grupo combo', 4, 'combo', 'cccccccc-0000-0000-0000-000000000001',
             '2026-09-09 09:00:00+00', 60,
             '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111') $$,
  'una reserva de tipo combo con combo_id se inserta bien'
);

-- Una reserva no puede ser su propia reserva padre.
select throws_ok(
  $$ insert into reservations
       (id, customer_name, people_count, type, starts_at, duration_minutes,
        parent_reservation_id, created_by, updated_by)
     values ('dddddddd-0000-0000-0000-000000000099', 'Auto padre', 1, 'rental',
             '2026-09-09 09:00:00+00', 60, 'dddddddd-0000-0000-0000-000000000099',
             '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111') $$,
  '23514', null,
  'una reserva no puede apuntarse a si misma como padre'
);

-- Al partir una reserva, la hija no puede llevar cobro propio: el cobro se
-- queda entero en la original, a nombre del mismo cliente.
select throws_ok(
  $$ insert into reservations
       (customer_name, people_count, type, starts_at, duration_minutes,
        parent_reservation_id, agreed_amount_usd, created_by, updated_by)
     values ('Hija con cobro', 1, 'rental', '2026-09-10 09:00:00+00', 60,
             'dddddddd-0000-0000-0000-000000000001', 50,
             '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111') $$,
  '23514', null,
  'una reserva hija no puede llevar cobro propio'
);

-- Camino feliz: la hija nace sin cobro propio en las cuatro columnas.
select lives_ok(
  $$ insert into reservations
       (customer_name, people_count, type, starts_at, duration_minutes,
        parent_reservation_id, created_by, updated_by)
     values ('Hija sin cobro', 1, 'rental', '2026-09-10 09:00:00+00', 60,
             'dddddddd-0000-0000-0000-000000000001',
             '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111') $$,
  'una reserva hija sin cobro propio se inserta bien'
);

-- Un item es una unidad concreta o una categoria con cantidad, nunca las dos.
select throws_ok(
  $$ insert into reservation_items
       (reservation_id, category_id, quantity, unit_id, created_by, updated_by)
     values ('dddddddd-0000-0000-0000-000000000001',
             'aaaaaaaa-0000-0000-0000-000000000001', 2,
             gen_random_uuid(),
             '11111111-1111-1111-1111-111111111111',
             '11111111-1111-1111-1111-111111111111') $$,
  '23514', null,
  'un item no puede ser unidad y cantidad a la vez'
);

-- Ni tampoco ninguna de las dos formas: sin unidad y sin categoria/cantidad.
select throws_ok(
  $$ insert into reservation_items
       (reservation_id, created_by, updated_by)
     values ('dddddddd-0000-0000-0000-000000000001',
             '11111111-1111-1111-1111-111111111111',
             '11111111-1111-1111-1111-111111111111') $$,
  '23514', null,
  'un item no puede quedar sin unidad y sin categoria/cantidad'
);

-- Camino feliz: un item por unidad concreta.
select lives_ok(
  $$ insert into reservation_items
       (reservation_id, unit_id, created_by, updated_by)
     values ('dddddddd-0000-0000-0000-000000000001',
             'bbbbbbbb-0000-0000-0000-000000000001',
             '11111111-1111-1111-1111-111111111111',
             '11111111-1111-1111-1111-111111111111') $$,
  'un item por unidad concreta es valido'
);

-- Camino feliz: un item por categoria con cantidad.
select lives_ok(
  $$ insert into reservation_items
       (reservation_id, category_id, quantity, created_by, updated_by)
     values ('dddddddd-0000-0000-0000-000000000001',
             'aaaaaaaa-0000-0000-0000-000000000001', 2,
             '11111111-1111-1111-1111-111111111111',
             '11111111-1111-1111-1111-111111111111') $$,
  'un item por cantidad es valido'
);

-- La cantidad de un item por categoria tambien tiene que ser positiva.
select throws_ok(
  $$ insert into reservation_items
       (reservation_id, category_id, quantity, created_by, updated_by)
     values ('dddddddd-0000-0000-0000-000000000001',
             'aaaaaaaa-0000-0000-0000-000000000001', 0,
             '11111111-1111-1111-1111-111111111111',
             '11111111-1111-1111-1111-111111111111') $$,
  '23514', null,
  'la cantidad de un item por categoria exige un valor positivo'
);

-- Camino feliz: asignar un guia a una reserva.
select lives_ok(
  $$ insert into reservation_guides (reservation_id, worker_id, assigned_by)
     values ('dddddddd-0000-0000-0000-000000000001',
             '11111111-1111-1111-1111-111111111111',
             '11111111-1111-1111-1111-111111111111') $$,
  'asignar un guia a una reserva es valido'
);

-- assigned_at se llena solo, con el momento de la asignacion.
select ok(
  (select assigned_at is not null from reservation_guides
     where reservation_id = 'dddddddd-0000-0000-0000-000000000001'
       and worker_id = '11111111-1111-1111-1111-111111111111'),
  'assigned_at se llena con el default'
);

-- El mismo guia no se asigna dos veces a la misma reserva.
select throws_ok(
  $$ insert into reservation_guides (reservation_id, worker_id, assigned_by)
     values ('dddddddd-0000-0000-0000-000000000001',
             '11111111-1111-1111-1111-111111111111',
             '11111111-1111-1111-1111-111111111111') $$,
  '23505', null,
  'un guia no se asigna dos veces a la misma reserva'
);

-- Cancelar exige motivo: sirve para revisar por que se cae la gente.
select throws_ok(
  $$ update reservations set status = 'cancelled'
     where id = 'dddddddd-0000-0000-0000-000000000001' $$,
  '23514', null,
  'cancelar sin motivo es rechazado'
);

-- Camino feliz: cancelar con motivo si se deja.
select lives_ok(
  $$ update reservations set status = 'cancelled', cancellation_reason = 'Cliente no se presento'
     where id = 'dddddddd-0000-0000-0000-000000000001' $$,
  'cancelar con motivo se acepta'
);

select * from finish();
rollback;
