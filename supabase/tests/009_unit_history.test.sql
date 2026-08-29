begin;
select plan(16);

insert into auth.users (id, email)
values ('11111111-1111-1111-1111-111111111111', 'admin@arenal.local');
insert into workers (id, username, full_name, personal_email, base_role)
values ('11111111-1111-1111-1111-111111111111', 'admin', 'Leno', 'leno@correo.com', 'administracion');

insert into equipment_categories
  (id, name, tracking_mode, is_reservable, has_motor, usage_metric,
   has_condition_photos, default_duration_minutes, created_by, updated_by)
values ('aaaaaaaa-0000-0000-0000-000000000001', 'Jet Ski', 'by_unit', true, true,
        'engine_hours', true, 60,
        '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111');

insert into equipment_units (id, category_id, code, created_by, updated_by)
values ('bbbbbbbb-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'JET-01',
        '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111');

insert into equipment_units (id, category_id, code, created_by, updated_by)
values ('bbbbbbbb-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000001', 'JET-02',
        '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111');

-- ============================ unit_condition_photos ============================

-- Una foto por angulo: subir la del costado derecho reemplaza la anterior.
insert into unit_condition_photos (unit_id, angle, storage_path, uploaded_by)
values ('bbbbbbbb-0000-0000-0000-000000000001', 'right_side', 'fotos/jet-01-der.webp',
        '11111111-1111-1111-1111-111111111111');

select throws_ok(
  $$ insert into unit_condition_photos (unit_id, angle, storage_path, uploaded_by)
     values ('bbbbbbbb-0000-0000-0000-000000000001', 'right_side', 'fotos/otra.webp',
             '11111111-1111-1111-1111-111111111111') $$,
  '23505', null,
  'no se acumulan dos fotos del mismo angulo'
);

-- El mismo angulo en OTRA unidad si se acepta: la unicidad es por (unit_id, angle),
-- no solo por angle.
select lives_ok(
  $$ insert into unit_condition_photos (unit_id, angle, storage_path, uploaded_by)
     values ('bbbbbbbb-0000-0000-0000-000000000002', 'right_side', 'fotos/jet-02-der.webp',
             '11111111-1111-1111-1111-111111111111') $$,
  'el mismo angulo en otra unidad si se acepta'
);

-- ============================ damage_reports ============================

-- impact_delta no acepta negativos.
select throws_ok(
  $$ insert into damage_reports (unit_id, cause, description, impact_delta, created_by)
     values ('bbbbbbbb-0000-0000-0000-000000000001', 'collision', 'Golpe en el casco', -1,
             '11111111-1111-1111-1111-111111111111') $$,
  '23514', null,
  'un impact_delta negativo es rechazado'
);

-- Camino feliz: un reporte de dano valido se acepta, incluso sin reservation_id
-- porque el dano sobrevive a la reserva que lo origino.
select lives_ok(
  $$ insert into damage_reports (unit_id, cause, description, impact_delta, created_by)
     values ('bbbbbbbb-0000-0000-0000-000000000001', 'collision', 'Golpe en el casco', 1,
             '11111111-1111-1111-1111-111111111111') $$,
  'un reporte de dano valido, sin reserva, se acepta'
);

-- ============================ maintenance_records ============================

-- El personal registra su trabajo sin cobrar mano de obra.
select lives_ok(
  $$ insert into maintenance_records
       (unit_id, work_type, is_external, performed_at, created_by)
     values ('bbbbbbbb-0000-0000-0000-000000000001', 'Montar defensas', false,
             current_date, '11111111-1111-1111-1111-111111111111') $$,
  'un trabajo interno se registra sin costo'
);

-- Pero una pieza comprada cuesta aunque la instale operaciones.
select lives_ok(
  $$ insert into maintenance_records
       (unit_id, work_type, is_external, cost_amount, cost_currency, performed_at, created_by)
     values ('bbbbbbbb-0000-0000-0000-000000000001', 'Defensa nueva', false, 45, 'USD',
             current_date, '11111111-1111-1111-1111-111111111111') $$,
  'un trabajo interno con repuesto si lleva costo'
);

-- El monto y la moneda van juntos o no van: monto sin moneda.
select throws_ok(
  $$ insert into maintenance_records
       (unit_id, work_type, is_external, cost_amount, performed_at, created_by)
     values ('bbbbbbbb-0000-0000-0000-000000000001', 'Cambio de aceite', true, 80,
             current_date, '11111111-1111-1111-1111-111111111111') $$,
  '23514', null,
  'un costo sin moneda es rechazado'
);

-- El monto y la moneda van juntos o no van: moneda sin monto.
select throws_ok(
  $$ insert into maintenance_records
       (unit_id, work_type, is_external, cost_currency, performed_at, created_by)
     values ('bbbbbbbb-0000-0000-0000-000000000001', 'Cambio de aceite', true, 'USD',
             current_date, '11111111-1111-1111-1111-111111111111') $$,
  '23514', null,
  'una moneda sin monto es rechazada'
);

-- El costo debe ser positivo: cero se rechaza.
select throws_ok(
  $$ insert into maintenance_records
       (unit_id, work_type, is_external, cost_amount, cost_currency, performed_at, created_by)
     values ('bbbbbbbb-0000-0000-0000-000000000001', 'Cambio de aceite', true, 0, 'USD',
             current_date, '11111111-1111-1111-1111-111111111111') $$,
  '23514', null,
  'un costo de cero es rechazado'
);

-- El costo debe ser positivo: negativo se rechaza.
select throws_ok(
  $$ insert into maintenance_records
       (unit_id, work_type, is_external, cost_amount, cost_currency, performed_at, created_by)
     values ('bbbbbbbb-0000-0000-0000-000000000001', 'Cambio de aceite', true, -10, 'USD',
             current_date, '11111111-1111-1111-1111-111111111111') $$,
  '23514', null,
  'un costo negativo es rechazado'
);

-- ============================ inventory_counts / inventory_count_lines ============================

insert into inventory_counts (id, created_by)
values ('ffffffff-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111');

-- Una linea de conteo es por unidad o por cantidad, nunca las dos: aqui trae ambas.
select throws_ok(
  $$ insert into inventory_count_lines
       (count_id, category_id, unit_id, confirmed_status, quantity_available)
     values ('ffffffff-0000-0000-0000-000000000001',
             'aaaaaaaa-0000-0000-0000-000000000001',
             'bbbbbbbb-0000-0000-0000-000000000001', 'available', 3) $$,
  '23514', null,
  'una linea de conteo no mezcla unidad con cantidad'
);

-- ...ni tampoco puede traer ninguna de las dos.
select throws_ok(
  $$ insert into inventory_count_lines
       (count_id, category_id)
     values ('ffffffff-0000-0000-0000-000000000001',
             'aaaaaaaa-0000-0000-0000-000000000001') $$,
  '23514', null,
  'una linea de conteo no puede quedar sin unidad y sin cantidad'
);

-- Camino feliz: una linea por unidad, sola, se acepta.
select lives_ok(
  $$ insert into inventory_count_lines
       (count_id, category_id, unit_id, confirmed_status)
     values ('ffffffff-0000-0000-0000-000000000001',
             'aaaaaaaa-0000-0000-0000-000000000001',
             'bbbbbbbb-0000-0000-0000-000000000001', 'available') $$,
  'una linea de conteo por unidad, sola, se acepta'
);

-- Camino feliz: una linea por cantidad, sola, se acepta.
select lives_ok(
  $$ insert into inventory_count_lines
       (count_id, category_id, quantity_available, quantity_damaged, quantity_in_repair)
     values ('ffffffff-0000-0000-0000-000000000001',
             'aaaaaaaa-0000-0000-0000-000000000001', 5, 1, 0) $$,
  'una linea de conteo por cantidad, sola, se acepta'
);

-- El borrado de un conteo si arrastra sus lineas: es la unica excepcion documentada
-- al no borrado, porque la linea es hija del conteo y no tiene vida propia.
select is(
  (select count(*)::int from inventory_count_lines
   where count_id = 'ffffffff-0000-0000-0000-000000000001'),
  2,
  'el conteo tiene dos lineas antes de borrarlo'
);

delete from inventory_counts where id = 'ffffffff-0000-0000-0000-000000000001';

select is(
  (select count(*)::int from inventory_count_lines
   where count_id = 'ffffffff-0000-0000-0000-000000000001'),
  0,
  'borrar el conteo arrastra sus lineas por cascada'
);

select * from finish();
rollback;
