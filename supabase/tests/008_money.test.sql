begin;
select plan(18);

insert into auth.users (id, email)
values ('11111111-1111-1111-1111-111111111111', 'admin@arenal.local');
insert into workers (id, username, full_name, personal_email, base_role)
values ('11111111-1111-1111-1111-111111111111', 'admin', 'Leno', 'leno@correo.com', 'administracion');

insert into reservations
  (id, customer_name, people_count, type, starts_at, duration_minutes, created_by, updated_by)
values ('dddddddd-0000-0000-0000-000000000001', 'Maria', 2, 'rental',
        '2026-09-05 10:00:00+00', 60,
        '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111');

-- ============================ reservation_charges ============================

-- Una misma reserva se cobra en tractos, y cada parte guarda su moneda.
insert into reservation_charges (reservation_id, kind, amount, currency, payment_method, created_by)
values ('dddddddd-0000-0000-0000-000000000001', 'tariff', 60, 'USD', 'Efectivo',
        '11111111-1111-1111-1111-111111111111'),
       ('dddddddd-0000-0000-0000-000000000001', 'tariff', 30000, 'CRC', 'SINPE',
        '11111111-1111-1111-1111-111111111111');

select is(
  (select count(distinct currency)::int from reservation_charges
   where reservation_id = 'dddddddd-0000-0000-0000-000000000001'),
  2,
  'una reserva se paga parte en dolares y parte en colones'
);

-- El monto de un cobro tiene que ser positivo.
select throws_ok(
  $$ insert into reservation_charges (reservation_id, kind, amount, currency, payment_method, created_by)
     values ('dddddddd-0000-0000-0000-000000000001', 'tariff', 0, 'USD', 'Efectivo',
             '11111111-1111-1111-1111-111111111111') $$,
  '23514', null,
  'un cobro con monto cero es rechazado'
);

-- ============================ refunds ============================

-- El monto de una devolucion tiene que ser positivo.
select throws_ok(
  $$ insert into refunds (reservation_id, percentage, amount, currency, reason, created_by)
     values ('dddddddd-0000-0000-0000-000000000001', 50, 0, 'USD', 'Cancelacion',
             '11111111-1111-1111-1111-111111111111') $$,
  '23514', null,
  'una devolucion con monto cero es rechazada'
);

-- percentage no acepta cero.
select throws_ok(
  $$ insert into refunds (reservation_id, percentage, amount, currency, reason, created_by)
     values ('dddddddd-0000-0000-0000-000000000001', 0, 20, 'USD', 'Cancelacion',
             '11111111-1111-1111-1111-111111111111') $$,
  '23514', null,
  'un porcentaje de devolucion de cero es rechazado'
);

-- percentage no acepta negativos.
select throws_ok(
  $$ insert into refunds (reservation_id, percentage, amount, currency, reason, created_by)
     values ('dddddddd-0000-0000-0000-000000000001', -10, 20, 'USD', 'Cancelacion',
             '11111111-1111-1111-1111-111111111111') $$,
  '23514', null,
  'un porcentaje de devolucion negativo es rechazado'
);

-- percentage no acepta mas de 100.
select throws_ok(
  $$ insert into refunds (reservation_id, percentage, amount, currency, reason, created_by)
     values ('dddddddd-0000-0000-0000-000000000001', 101, 20, 'USD', 'Cancelacion',
             '11111111-1111-1111-1111-111111111111') $$,
  '23514', null,
  'un porcentaje de devolucion mayor a 100 es rechazado'
);

-- Camino feliz: un porcentaje valido se acepta.
select lives_ok(
  $$ insert into refunds (reservation_id, percentage, amount, currency, reason, created_by)
     values ('dddddddd-0000-0000-0000-000000000001', 50, 30, 'USD', 'Cancelacion parcial',
             '11111111-1111-1111-1111-111111111111') $$,
  'un porcentaje de devolucion valido se acepta'
);

-- ============================ deposits ============================

-- El monto de un deposito tiene que ser positivo.
select throws_ok(
  $$ insert into deposits (reservation_id, amount, currency, created_by)
     values ('dddddddd-0000-0000-0000-000000000001', 0, 'USD',
             '11111111-1111-1111-1111-111111111111') $$,
  '23514', null,
  'un deposito con monto cero es rechazado'
);

-- status por defecto queda en 'held'.
insert into deposits (id, reservation_id, amount, currency, created_by)
values ('eeeeeeee-0000-0000-0000-000000000001', 'dddddddd-0000-0000-0000-000000000001',
        200, 'USD', '11111111-1111-1111-1111-111111111111');

select is(
  (select status from deposits where id = 'eeeeeeee-0000-0000-0000-000000000001'),
  'held'::deposit_status,
  'un deposito nuevo queda en estado held'
);

-- deposits_resolution_shape: un deposito held no puede llevar resolved_at.
select throws_ok(
  $$ insert into deposits (reservation_id, amount, currency, status, resolved_at, created_by)
     values ('dddddddd-0000-0000-0000-000000000001', 100, 'USD', 'held', now(),
             '11111111-1111-1111-1111-111111111111') $$,
  '23514', null,
  'un deposito held no puede llevar resolved_at'
);

-- deposits_resolution_shape: un deposito resuelto exige resolved_at.
select throws_ok(
  $$ insert into deposits (reservation_id, amount, currency, status, resolved_by, created_by)
     values ('dddddddd-0000-0000-0000-000000000001', 100, 'USD', 'returned',
             '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111') $$,
  '23514', null,
  'un deposito resuelto sin resolved_at es rechazado'
);

-- deposits_resolution_shape: un deposito resuelto exige resolved_by.
select throws_ok(
  $$ insert into deposits (reservation_id, amount, currency, status, resolved_at, created_by)
     values ('dddddddd-0000-0000-0000-000000000001', 100, 'USD', 'returned', now(),
             '11111111-1111-1111-1111-111111111111') $$,
  '23514', null,
  'un deposito resuelto sin resolved_by es rechazado'
);

-- deposits_retention_needs_reason: falta retained_amount.
select throws_ok(
  $$ insert into deposits (reservation_id, amount, currency, status, retention_reason,
                            resolved_by, resolved_at, created_by)
     values ('dddddddd-0000-0000-0000-000000000001', 100, 'USD', 'retained', 'Golpe',
             '11111111-1111-1111-1111-111111111111', now(),
             '11111111-1111-1111-1111-111111111111') $$,
  '23514', null,
  'un deposito retenido sin retained_amount es rechazado'
);

-- deposits_retention_needs_reason: falta retention_reason.
select throws_ok(
  $$ insert into deposits (reservation_id, amount, currency, status, retained_amount,
                            resolved_by, resolved_at, created_by)
     values ('dddddddd-0000-0000-0000-000000000001', 100, 'USD', 'retained', 50,
             '11111111-1111-1111-1111-111111111111', now(),
             '11111111-1111-1111-1111-111111111111') $$,
  '23514', null,
  'un deposito retenido sin retention_reason es rechazado'
);

-- No se puede retener mas de lo que el cliente entrego.
select throws_ok(
  $$ update deposits
     set status = 'partially_retained', retained_amount = 500,
         retention_reason = 'Golpe', resolved_by = '11111111-1111-1111-1111-111111111111',
         resolved_at = now()
     where id = 'eeeeeeee-0000-0000-0000-000000000001' $$,
  '23514', null,
  'no se retiene mas de lo depositado'
);

-- Camino feliz del trigger: un deposito held si se puede resolver.
insert into deposits (id, reservation_id, amount, currency, created_by)
values ('eeeeeeee-0000-0000-0000-000000000007', 'dddddddd-0000-0000-0000-000000000001',
        100, 'USD', '11111111-1111-1111-1111-111111111111');

select lives_ok(
  $$ update deposits
     set status = 'retained', retained_amount = 50, retention_reason = 'Golpe leve',
         resolved_by = '11111111-1111-1111-1111-111111111111', resolved_at = now()
     where id = 'eeeeeeee-0000-0000-0000-000000000007' $$,
  'un deposito held se puede resolver'
);

update deposits
set status = 'returned', resolved_by = '11111111-1111-1111-1111-111111111111', resolved_at = now()
where id = 'eeeeeeee-0000-0000-0000-000000000001';

-- Un deposito resuelto no se reabre ni cambia de resolucion.
select throws_ok(
  $$ update deposits set status = 'held'
     where id = 'eeeeeeee-0000-0000-0000-000000000001' $$,
  'Un deposito ya resuelto no cambia de estado'
);
select throws_ok(
  $$ update deposits set status = 'retained', retained_amount = 200,
         retention_reason = 'Aparecio un golpe'
     where id = 'eeeeeeee-0000-0000-0000-000000000001' $$,
  'Un deposito ya resuelto no cambia de estado'
);

select * from finish();
rollback;
