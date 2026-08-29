begin;
select plan(27);

insert into auth.users (id, email)
values ('11111111-1111-1111-1111-111111111111', 'admin@arenal.local');
insert into workers (id, username, full_name, personal_email, base_role)
values ('11111111-1111-1111-1111-111111111111', 'admin', 'Leno', 'leno@correo.com', 'administracion');

insert into equipment_categories
  (id, name, tracking_mode, is_reservable, has_motor, usage_metric,
   default_duration_minutes, created_by, updated_by)
values ('aaaaaaaa-0000-0000-0000-000000000001', 'Jet Ski', 'by_unit', true, true, 'engine_hours', 60,
        '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111'),
       ('aaaaaaaa-0000-0000-0000-000000000002', 'Kayak doble', 'by_quantity', true, false, null, 60,
        '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111');

insert into equipment_units (id, category_id, code, created_by, updated_by)
values ('bbbbbbbb-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'JET-01',
        '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111');

insert into equipment_stock (category_id, quantity_available, updated_by)
values ('aaaaaaaa-0000-0000-0000-000000000002', 6, '11111111-1111-1111-1111-111111111111');

insert into reservations
  (id, customer_name, people_count, type, starts_at, duration_minutes, status, created_by, updated_by)
values ('dddddddd-0000-0000-0000-000000000001', 'Maria', 2, 'rental',
        '2026-09-05 10:00:00+00', 120, 'scheduled',
        '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111');

insert into reservation_items (reservation_id, unit_id, created_by, updated_by)
values ('dddddddd-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000001',
        '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111');

insert into reservation_items (reservation_id, category_id, quantity, created_by, updated_by)
values ('dddddddd-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000002', 2,
        '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111');

-- ============================ unit_conflicts: solape y bordes ============================

-- La pregunta es por franja, no por el instante actual.
select is(
  (select count(*)::int from unit_conflicts(
     'bbbbbbbb-0000-0000-0000-000000000001',
     '2026-09-05 11:00:00+00', '2026-09-05 13:00:00+00')),
  1,
  'una franja que se solapa devuelve el choque'
);
select is(
  (select count(*)::int from unit_conflicts(
     'bbbbbbbb-0000-0000-0000-000000000001',
     '2026-09-05 12:00:00+00', '2026-09-05 14:00:00+00')),
  0,
  'una franja que arranca justo al terminar la otra no choca'
);
-- El otro lado del mismo borde: una franja que termina justo cuando arranca
-- la otra tampoco choca.
select is(
  (select count(*)::int from unit_conflicts(
     'bbbbbbbb-0000-0000-0000-000000000001',
     '2026-09-05 08:00:00+00', '2026-09-05 10:00:00+00')),
  0,
  'una franja que termina justo al arrancar la otra no choca'
);
-- Un minuto de solape ya es choque real.
select is(
  (select count(*)::int from unit_conflicts(
     'bbbbbbbb-0000-0000-0000-000000000001',
     '2026-09-05 09:59:00+00', '2026-09-05 10:01:00+00')),
  1,
  'un minuto de solape si choca'
);

-- ============================ disponibilidad por cantidad ============================

-- La disponibilidad por cantidad descuenta lo comprometido en la franja.
select is(
  (select free from category_availability(
     'aaaaaaaa-0000-0000-0000-000000000002',
     '2026-09-05 10:00:00+00', '2026-09-05 12:00:00+00')),
  4,
  'quedan 4 kayaks libres de 6 con 2 comprometidos'
);

-- ============================ estado efectivo: agendada vs despachada ============================

-- ocupado se calcula desde el despacho, no se digita.
select is(
  (select effective_status from unit_current_state
   where id = 'bbbbbbbb-0000-0000-0000-000000000001'),
  'available',
  'una reserva agendada todavia no ocupa la unidad'
);

update reservations set status = 'dispatched', dispatched_at = now()
where id = 'dddddddd-0000-0000-0000-000000000001';

select is(
  (select effective_status from unit_current_state
   where id = 'bbbbbbbb-0000-0000-0000-000000000001'),
  'occupied',
  'al despachar, la unidad aparece ocupada sin que nadie lo digite'
);

-- La tarjeta necesita saber a cual reserva pertenece y a que hora regresa.
select is(
  (select reservation_id from unit_current_state
   where id = 'bbbbbbbb-0000-0000-0000-000000000001'),
  'dddddddd-0000-0000-0000-000000000001'::uuid,
  'la unidad ocupada apunta a la reserva que la tiene'
);
select ok(
  (select returns_at from unit_current_state
   where id = 'bbbbbbbb-0000-0000-0000-000000000001')
  = '2026-09-05 12:00:00+00'::timestamptz,
  'returns_at es el ends_at de la reserva que la ocupa'
);

-- Una reserva despachada tambien es un choque real, no solo una agendada.
select is(
  (select count(*)::int from unit_conflicts(
     'bbbbbbbb-0000-0000-0000-000000000001',
     '2026-09-05 11:00:00+00', '2026-09-05 13:00:00+00')),
  1,
  'una reserva despachada tambien choca'
);
-- p_exclude_reservation existe para que editar una reserva no choque consigo misma.
select is(
  (select count(*)::int from unit_conflicts(
     'bbbbbbbb-0000-0000-0000-000000000001',
     '2026-09-05 11:00:00+00', '2026-09-05 13:00:00+00',
     'dddddddd-0000-0000-0000-000000000001')),
  0,
  'excluir la propia reserva la saca del choque'
);
-- Ninguna de las dos funciones revienta ante una franja totalmente ocupada.
select lives_ok(
  $$ select * from unit_conflicts(
       'bbbbbbbb-0000-0000-0000-000000000001',
       '2026-09-05 10:00:00+00', '2026-09-05 12:00:00+00') $$,
  'unit_conflicts no revienta sobre una franja totalmente choque'
);

-- ============================ estado efectivo: el status registrado gana ============================

insert into equipment_units (id, category_id, code, status, created_by, updated_by)
values ('bbbbbbbb-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000001', 'JET-02',
        'in_maintenance',
        '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111'),
       ('bbbbbbbb-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000001', 'JET-03',
        'damaged',
        '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111'),
       ('bbbbbbbb-0000-0000-0000-000000000004', 'aaaaaaaa-0000-0000-0000-000000000001', 'JET-04',
        'in_repair',
        '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111'),
       ('bbbbbbbb-0000-0000-0000-000000000006', 'aaaaaaaa-0000-0000-0000-000000000001', 'JET-06',
        'available',
        '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111'),
       ('bbbbbbbb-0000-0000-0000-000000000007', 'aaaaaaaa-0000-0000-0000-000000000001', 'JET-07',
        'available',
        '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111');

insert into equipment_units (id, category_id, code, status, decommissioned_at, decommission_reason,
                              created_by, updated_by)
values ('bbbbbbbb-0000-0000-0000-000000000005', 'aaaaaaaa-0000-0000-0000-000000000001', 'JET-05',
        'decommissioned', now(), 'fin de vida util',
        '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111');

-- Cada una de estas unidades queda con una reserva despachada encima, para
-- probar que el status registrado gana incluso mientras hay un despacho activo.
insert into reservations
  (id, customer_name, people_count, type, starts_at, duration_minutes, status, dispatched_at,
   created_by, updated_by)
values ('dddddddd-0000-0000-0000-000000000002', 'Carlos', 1, 'rental',
        '2026-09-06 09:00:00+00', 60, 'dispatched', now(),
        '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111'),
       ('dddddddd-0000-0000-0000-000000000003', 'Carlos', 1, 'rental',
        '2026-09-06 09:00:00+00', 60, 'dispatched', now(),
        '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111'),
       ('dddddddd-0000-0000-0000-000000000004', 'Carlos', 1, 'rental',
        '2026-09-06 09:00:00+00', 60, 'dispatched', now(),
        '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111'),
       ('dddddddd-0000-0000-0000-000000000005', 'Carlos', 1, 'rental',
        '2026-09-06 09:00:00+00', 60, 'dispatched', now(),
        '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111');

insert into reservation_items (reservation_id, unit_id, created_by, updated_by)
values ('dddddddd-0000-0000-0000-000000000002', 'bbbbbbbb-0000-0000-0000-000000000002',
        '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111'),
       ('dddddddd-0000-0000-0000-000000000003', 'bbbbbbbb-0000-0000-0000-000000000003',
        '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111'),
       ('dddddddd-0000-0000-0000-000000000004', 'bbbbbbbb-0000-0000-0000-000000000004',
        '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111'),
       ('dddddddd-0000-0000-0000-000000000005', 'bbbbbbbb-0000-0000-0000-000000000005',
        '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111');

select is(
  (select effective_status from unit_current_state
   where id = 'bbbbbbbb-0000-0000-0000-000000000002'),
  'in_maintenance',
  'en mantenimiento gana aunque haya un despacho activo encima'
);
select is(
  (select effective_status from unit_current_state
   where id = 'bbbbbbbb-0000-0000-0000-000000000003'),
  'damaged',
  'danada gana aunque haya un despacho activo encima'
);
select is(
  (select effective_status from unit_current_state
   where id = 'bbbbbbbb-0000-0000-0000-000000000004'),
  'in_repair',
  'en reparacion gana aunque haya un despacho activo encima'
);
select is(
  (select effective_status from unit_current_state
   where id = 'bbbbbbbb-0000-0000-0000-000000000005'),
  'decommissioned',
  'dada de baja gana aunque haya un despacho activo encima'
);

-- ============================ estado efectivo: solo despachada ocupa ============================

insert into reservations
  (id, customer_name, people_count, type, starts_at, duration_minutes, status, closed_at,
   created_by, updated_by)
values ('dddddddd-0000-0000-0000-000000000006', 'Ana', 1, 'rental',
        '2026-09-06 09:00:00+00', 60, 'closed', now(),
        '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111');
insert into reservations
  (id, customer_name, people_count, type, starts_at, duration_minutes, status, cancellation_reason,
   created_by, updated_by)
values ('dddddddd-0000-0000-0000-000000000007', 'Ana', 1, 'rental',
        '2026-09-06 09:00:00+00', 60, 'cancelled', 'cliente cancelo',
        '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111');

insert into reservation_items (reservation_id, unit_id, created_by, updated_by)
values ('dddddddd-0000-0000-0000-000000000006', 'bbbbbbbb-0000-0000-0000-000000000006',
        '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111'),
       ('dddddddd-0000-0000-0000-000000000007', 'bbbbbbbb-0000-0000-0000-000000000007',
        '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111');

select is(
  (select effective_status from unit_current_state
   where id = 'bbbbbbbb-0000-0000-0000-000000000006'),
  'available',
  'una reserva cerrada no ocupa la unidad'
);
select is(
  (select effective_status from unit_current_state
   where id = 'bbbbbbbb-0000-0000-0000-000000000007'),
  'available',
  'una reserva cancelada no ocupa la unidad'
);
select is(
  (select count(*)::int from unit_conflicts(
     'bbbbbbbb-0000-0000-0000-000000000006',
     '2026-09-06 09:00:00+00', '2026-09-06 10:00:00+00')),
  0,
  'una reserva cerrada no cuenta como choque'
);
select is(
  (select count(*)::int from unit_conflicts(
     'bbbbbbbb-0000-0000-0000-000000000007',
     '2026-09-06 09:00:00+00', '2026-09-06 10:00:00+00')),
  0,
  'una reserva cancelada no cuenta como choque'
);

-- ============================ disponibilidad por cantidad: mas casos ============================

-- Una reserva fuera de la franja consultada no reduce lo disponible.
insert into reservations
  (id, customer_name, people_count, type, starts_at, duration_minutes, status,
   created_by, updated_by)
values ('dddddddd-0000-0000-0000-000000000008', 'Pedro', 2, 'rental',
        '2026-09-05 14:00:00+00', 60, 'scheduled',
        '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111');
insert into reservation_items (reservation_id, category_id, quantity, created_by, updated_by)
values ('dddddddd-0000-0000-0000-000000000008', 'aaaaaaaa-0000-0000-0000-000000000002', 1,
        '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111');

select is(
  (select free from category_availability(
     'aaaaaaaa-0000-0000-0000-000000000002',
     '2026-09-05 10:00:00+00', '2026-09-05 12:00:00+00')),
  4,
  'una reserva fuera de la franja no reduce lo disponible'
);

-- Una reserva cancelada, aunque caiga dentro de la franja, no compromete cantidad.
insert into reservations
  (id, customer_name, people_count, type, starts_at, duration_minutes, status, cancellation_reason,
   created_by, updated_by)
values ('dddddddd-0000-0000-0000-000000000009', 'Pedro', 2, 'rental',
        '2026-09-05 10:30:00+00', 30, 'cancelled', 'no llego',
        '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111');
insert into reservation_items (reservation_id, category_id, quantity, created_by, updated_by)
values ('dddddddd-0000-0000-0000-000000000009', 'aaaaaaaa-0000-0000-0000-000000000002', 3,
        '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111');

select is(
  (select free from category_availability(
     'aaaaaaaa-0000-0000-0000-000000000002',
     '2026-09-05 10:00:00+00', '2026-09-05 12:00:00+00')),
  4,
  'una reserva cancelada dentro de la franja no compromete cantidad'
);

-- Una reserva cerrada, aunque caiga dentro de la franja, tampoco compromete cantidad.
insert into reservations
  (id, customer_name, people_count, type, starts_at, duration_minutes, status, closed_at,
   created_by, updated_by)
values ('dddddddd-0000-0000-0000-000000000010', 'Pedro', 2, 'rental',
        '2026-09-05 10:15:00+00', 30, 'closed', now(),
        '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111');
insert into reservation_items (reservation_id, category_id, quantity, created_by, updated_by)
values ('dddddddd-0000-0000-0000-000000000010', 'aaaaaaaa-0000-0000-0000-000000000002', 1,
        '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111');

select is(
  (select free from category_availability(
     'aaaaaaaa-0000-0000-0000-000000000002',
     '2026-09-05 10:00:00+00', '2026-09-05 12:00:00+00')),
  4,
  'una reserva cerrada dentro de la franja no compromete cantidad'
);

-- p_exclude_reservation en category_availability: editar la reserva de Maria
-- no debe chocar con su propio compromiso de cantidad.
select is(
  (select committed from category_availability(
     'aaaaaaaa-0000-0000-0000-000000000002',
     '2026-09-05 10:00:00+00', '2026-09-05 12:00:00+00',
     'dddddddd-0000-0000-0000-000000000001')),
  0,
  'excluir la propia reserva la saca de lo comprometido'
);
select is(
  (select free from category_availability(
     'aaaaaaaa-0000-0000-0000-000000000002',
     '2026-09-05 10:00:00+00', '2026-09-05 12:00:00+00',
     'dddddddd-0000-0000-0000-000000000001')),
  6,
  'sin su propio compromiso quedan las 6 unidades de cupo'
);

-- Franja totalmente agotada: el aritmetico no revienta y da libre = 0.
insert into reservations
  (id, customer_name, people_count, type, starts_at, duration_minutes, status,
   created_by, updated_by)
values ('dddddddd-0000-0000-0000-000000000011', 'Sofia', 4, 'rental',
        '2026-09-05 10:00:00+00', 60, 'scheduled',
        '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111');
insert into reservation_items (reservation_id, category_id, quantity, created_by, updated_by)
values ('dddddddd-0000-0000-0000-000000000011', 'aaaaaaaa-0000-0000-0000-000000000002', 4,
        '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111');

select is(
  (select free from category_availability(
     'aaaaaaaa-0000-0000-0000-000000000002',
     '2026-09-05 10:00:00+00', '2026-09-05 12:00:00+00')),
  0,
  'con los 6 kayaks comprometidos quedan 0 libres'
);
select lives_ok(
  $$ select * from category_availability(
       'aaaaaaaa-0000-0000-0000-000000000002',
       '2026-09-05 10:00:00+00', '2026-09-05 12:00:00+00') $$,
  'category_availability no revienta sobre una franja totalmente agotada'
);

select * from finish();
rollback;
