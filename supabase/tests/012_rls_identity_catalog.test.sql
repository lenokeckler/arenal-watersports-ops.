begin;
select plan(67);

-- ============================================================
-- Fixtures
-- ============================================================
-- Administracion (admin), operaciones (ismael) y reservas (celso), mas los
-- auth.users que hacen falta para las cuentas que se crean durante la
-- prueba: el guia externo que celso registra con la marca, y el trabajador
-- que administracion da de alta directamente.
insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'admin@arenal.local'),
  ('22222222-2222-2222-2222-222222222222', 'ops@arenal.local'),
  ('33333333-3333-3333-3333-333333333333', 'res@arenal.local'),
  ('77777777-7777-7777-7777-777777777777', 'guia@arenal.local'),
  ('88888888-8888-8888-8888-888888888888', 'nuevo@arenal.local');

insert into workers (id, username, full_name, personal_email, base_role) values
  ('11111111-1111-1111-1111-111111111111', 'admin', 'Leno', 'leno@correo.com', 'administracion');
insert into workers (id, username, full_name, base_role) values
  ('22222222-2222-2222-2222-222222222222', 'ismael', 'Ismael', 'operaciones'),
  ('33333333-3333-3333-3333-333333333333', 'celso', 'Celso', 'reservas');

insert into equipment_categories
  (id, name, tracking_mode, is_reservable, has_motor, usage_metric,
   has_condition_photos, default_duration_minutes, created_by, updated_by)
values ('aaaaaaaa-0000-0000-0000-000000000001', 'Jet Ski', 'by_unit', true, true,
        'engine_hours', true, 60,
        '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111');

insert into equipment_categories
  (id, name, tracking_mode, created_by, updated_by)
values ('aaaaaaaa-0000-0000-0000-000000000002', 'Chaleco', 'by_quantity',
        '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111');

insert into equipment_units (id, category_id, code, created_by, updated_by)
values ('bbbbbbbb-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'JET-01',
        '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111');

insert into equipment_stock (category_id, quantity_available, updated_by)
values ('aaaaaaaa-0000-0000-0000-000000000002', 10, '11111111-1111-1111-1111-111111111111');

-- Una marca existente antes de las pruebas de worker_marks, para que "cada
-- quien ve solo la suya" tenga algo que filtrar.
insert into worker_marks (worker_id, mark, granted_by)
values ('33333333-3333-3333-3333-333333333333', 'guia', '11111111-1111-1111-1111-111111111111');

-- ============================================================
-- Prohibicion global de DELETE (defensa en profundidad: revoke + sin politica)
-- Se prueba con administracion, el rol autenticado mas privilegiado: si ni
-- siquiera el admin puede borrar, el rechazo no depende de una politica que
-- alguien pueda ampliar por error.
-- ============================================================
set local role authenticated;
set local request.jwt.claims to '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';

select throws_ok(
  $$ delete from equipment_categories where id = 'aaaaaaaa-0000-0000-0000-000000000001' $$,
  '42501', null,
  'ni administracion puede borrar de una tabla operativa'
);

-- ============================================================
-- workers: select (propia fila) y update (propia fila / administracion)
-- ============================================================
reset role;
set local role authenticated;
set local request.jwt.claims to '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}';

-- Ismael ve su propia fila y la de Celso, porque Celso ya tiene la marca
-- 'guia' (fixture de arriba) y workers_select_guides deja pasar la fila de
-- cualquier guia a quien tenga area reservas u operaciones (US-RES-012/
-- US-RES-014).
select is(
  (select count(*)::int from workers),
  2,
  'ismael ve su propia fila y la de cualquier guia'
);

reset role;
set local role authenticated;
set local request.jwt.claims to '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';

select is(
  (select count(*)::int from workers),
  3,
  'administracion ve todas las filas de workers'
);

-- Ismael actualiza su propia fila.
reset role;
set local role authenticated;
set local request.jwt.claims to '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}';

with u as (
     update workers set full_name = 'Ismael Ops' where id = '22222222-2222-2222-2222-222222222222'
     returning 1
)
select is((select count(*)::int from u), 1, 'ismael actualiza su propia fila de workers');

-- Ismael no puede tocar la fila de Celso: no es su propia fila y no es admin.
with u as (
     update workers set full_name = 'Hackeado' where id = '33333333-3333-3333-3333-333333333333'
     returning 1
)
select is((select count(*)::int from u), 0, 'ismael no actualiza la fila de celso');

-- Administracion si puede actualizar la fila de otro trabajador.
reset role;
set local role authenticated;
set local request.jwt.claims to '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';

with u as (
     update workers set full_name = 'Celso R.' where id = '33333333-3333-3333-3333-333333333333'
     returning 1
)
select is((select count(*)::int from u), 1, 'administracion actualiza la fila de otro trabajador');

-- ============================================================
-- workers: insert (guias externos por reservas con la marca)
-- ============================================================
-- Celso (reservas) sin la marca no puede registrar un guia externo.
reset role;
set local role authenticated;
set local request.jwt.claims to '{"sub":"33333333-3333-3333-3333-333333333333","role":"authenticated"}';

select throws_ok(
  $$ insert into workers (id, username, full_name, base_role, is_external_guide, national_id, expires_at)
     values ('55555555-5555-5555-5555-555555555555', 'guia1', 'Guia Uno', 'operaciones', true,
             '111110001', now() + interval '30 days') $$,
  '42501', null,
  'reservas sin la marca no registra guias externos'
);

reset role;
set local role postgres;
insert into worker_marks (worker_id, mark, granted_by)
values ('33333333-3333-3333-3333-333333333333', 'registro_guias_externos',
        '11111111-1111-1111-1111-111111111111');

set local role authenticated;
set local request.jwt.claims to '{"sub":"33333333-3333-3333-3333-333333333333","role":"authenticated"}';

-- Con la marca, pero intentando colar personal de planta (is_external_guide = false).
select throws_ok(
  $$ insert into workers (id, username, full_name, base_role, is_external_guide)
     values ('55555555-5555-5555-5555-555555555555', 'planta1', 'Personal Planta', 'operaciones', false) $$,
  '42501', null,
  'reservas con la marca no crea personal de planta por esta via'
);

-- Con la marca, pero intentando colar una cuenta de administracion.
select throws_ok(
  $$ insert into workers (id, username, full_name, personal_email, base_role, is_external_guide)
     values ('66666666-6666-6666-6666-666666666666', 'admin2', 'Otro Admin', 'otro@correo.com',
             'administracion', false) $$,
  '42501', null,
  'reservas con la marca no crea una cuenta de administracion'
);

-- Con la marca, pero intentando colar un cambio de rol (reservas en vez de operaciones).
select throws_ok(
  $$ insert into workers (id, username, full_name, base_role, is_external_guide)
     values ('66666666-6666-6666-6666-666666666666', 'res2', 'Otro Reservas', 'reservas', false) $$,
  '42501', null,
  'reservas con la marca no crea un trabajador con otro rol'
);

-- Con la marca y con la forma correcta de guia externo, si puede.
select lives_ok(
  $$ insert into workers (id, username, full_name, base_role, is_external_guide, national_id, expires_at)
     values ('77777777-7777-7777-7777-777777777777', 'guia1', 'Guia Uno', 'operaciones', true,
             '111110001', now() + interval '30 days') $$,
  'reservas con la marca si registra un guia externo'
);

-- Administracion tambien puede dar de alta un trabajador directamente.
reset role;
set local role authenticated;
set local request.jwt.claims to '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';

select lives_ok(
  $$ insert into workers (id, username, full_name, base_role)
     values ('88888888-8888-8888-8888-888888888888', 'nuevo', 'Nuevo Trabajador', 'operaciones') $$,
  'administracion da de alta un trabajador directamente'
);

-- ============================================================
-- worker_areas: select (propia/admin), insert y update (solo admin)
-- ============================================================
reset role;
set local role authenticated;
set local request.jwt.claims to '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}';

select is(
  (select count(*)::int from worker_areas),
  1,
  'ismael solo ve su propia fila en worker_areas'
);

reset role;
set local role authenticated;
set local request.jwt.claims to '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';

select is(
  (select count(*)::int from worker_areas),
  5,
  'administracion ve todas las filas de worker_areas'
);

-- Ismael no es admin: no puede otorgar areas.
reset role;
set local role authenticated;
set local request.jwt.claims to '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}';

select throws_ok(
  $$ insert into worker_areas (worker_id, area, granted_by)
     values ('33333333-3333-3333-3333-333333333333', 'operaciones', '22222222-2222-2222-2222-222222222222') $$,
  '42501', null,
  'ismael no otorga areas'
);

-- Administracion si puede. Se le otorga el area extra a "nuevo" (88888888),
-- no a celso: darle 'operaciones' a celso rompería en silencio todas las
-- pruebas de mas abajo que asumen que reservas no puede escribir inventario.
reset role;
set local role authenticated;
set local request.jwt.claims to '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';

with i as (
     insert into worker_areas (worker_id, area, granted_by)
     values ('88888888-8888-8888-8888-888888888888', 'reservas', '11111111-1111-1111-1111-111111111111')
     returning 1
)
select is((select count(*)::int from i), 1, 'administracion otorga areas');

-- Ismael no puede actualizar worker_areas.
reset role;
set local role authenticated;
set local request.jwt.claims to '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}';

with u as (
     update worker_areas set granted_by = '22222222-2222-2222-2222-222222222222'
     where worker_id = '22222222-2222-2222-2222-222222222222' and area = 'operaciones'
     returning 1
)
select is((select count(*)::int from u), 0, 'ismael no actualiza worker_areas');

-- Administracion si puede.
reset role;
set local role authenticated;
set local request.jwt.claims to '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';

with u as (
     update worker_areas set granted_by = '11111111-1111-1111-1111-111111111111'
     where worker_id = '33333333-3333-3333-3333-333333333333' and area = 'reservas'
     returning 1
)
select is((select count(*)::int from u), 1, 'administracion actualiza worker_areas');

-- ============================================================
-- worker_marks: select (propia/admin), insert y update (solo admin)
-- ============================================================
reset role;
set local role authenticated;
set local request.jwt.claims to '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}';

-- Ismael ve la marca 'guia' de Celso (worker_marks_select_guides), pero
-- ninguna otra marca ajena: 'registro_guias_externos' sigue privada.
select is(
  (select count(*)::int from worker_marks),
  1,
  'ismael solo ve la marca guia de otro trabajador'
);

reset role;
set local role authenticated;
set local request.jwt.claims to '{"sub":"33333333-3333-3333-3333-333333333333","role":"authenticated"}';

select is(
  (select count(*)::int from worker_marks),
  2,
  'celso ve sus propias marcas'
);

reset role;
set local role authenticated;
set local request.jwt.claims to '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';

select is(
  (select count(*)::int from worker_marks),
  2,
  'administracion ve todas las marcas'
);

-- Ismael no es admin: no puede otorgar marcas.
reset role;
set local role authenticated;
set local request.jwt.claims to '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}';

select throws_ok(
  $$ insert into worker_marks (worker_id, mark, granted_by)
     values ('22222222-2222-2222-2222-222222222222', 'encargado_general', '22222222-2222-2222-2222-222222222222') $$,
  '42501', null,
  'ismael no otorga marcas'
);

-- Administracion si puede, y de paso le da a ismael la marca que usan las
-- pruebas de fotos de estado mas abajo.
reset role;
set local role authenticated;
set local request.jwt.claims to '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';

with i as (
     insert into worker_marks (worker_id, mark, granted_by)
     values ('22222222-2222-2222-2222-222222222222', 'encargado_general', '11111111-1111-1111-1111-111111111111')
     returning 1
)
select is((select count(*)::int from i), 1, 'administracion otorga marcas');

-- Ismael no puede actualizar worker_marks.
reset role;
set local role authenticated;
set local request.jwt.claims to '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}';

with u as (
     update worker_marks set granted_by = '22222222-2222-2222-2222-222222222222'
     where worker_id = '33333333-3333-3333-3333-333333333333' and mark = 'guia'
     returning 1
)
select is((select count(*)::int from u), 0, 'ismael no actualiza worker_marks');

-- Administracion si puede.
reset role;
set local role authenticated;
set local request.jwt.claims to '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';

with u as (
     update worker_marks set granted_by = '11111111-1111-1111-1111-111111111111'
     where worker_id = '33333333-3333-3333-3333-333333333333' and mark = 'guia'
     returning 1
)
select is((select count(*)::int from u), 1, 'administracion actualiza worker_marks');

-- ============================================================
-- password_reset_pins: RLS activo, sin politicas -> nadie autenticado entra
-- ============================================================
reset role;
set local role postgres;
insert into password_reset_pins (worker_id, pin_hash, expires_at)
values ('22222222-2222-2222-2222-222222222222', 'hash-x', now() + interval '1 day');

set local role authenticated;
set local request.jwt.claims to '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';

-- Sin politica de select, la fila existe pero queda invisible incluso para
-- administracion: solo el service role (que salta RLS) la ve.
select is(
  (select count(*)::int from password_reset_pins),
  0,
  'ni administracion ve password_reset_pins desde authenticated'
);

-- Sin politica de insert, el intento de insertar se rechaza.
select throws_ok(
  $$ insert into password_reset_pins (worker_id, pin_hash, expires_at)
     values ('11111111-1111-1111-1111-111111111111', 'hash-y', now() + interval '1 day') $$,
  '42501', null,
  'ni administracion inserta en password_reset_pins desde authenticated'
);

-- ============================================================
-- Catalogo: equipment_categories
-- ============================================================
reset role;
set local role authenticated;
set local request.jwt.claims to '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}';

select is(
  (select count(*)::int from equipment_categories),
  2,
  'operaciones lee el catalogo'
);

select throws_ok(
  $$ insert into equipment_categories (name, tracking_mode)
     values ('Inventada', 'by_quantity') $$,
  '42501', null,
  'operaciones no crea categorias'
);

with u as (
     update equipment_categories set name = 'Jet Ski Hackeado'
     where id = 'aaaaaaaa-0000-0000-0000-000000000001'
     returning 1
)
select is((select count(*)::int from u), 0, 'operaciones no actualiza categorias');

reset role;
set local role authenticated;
set local request.jwt.claims to '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';

select lives_ok(
  $$ insert into equipment_categories (id, name, tracking_mode, created_by, updated_by)
     values ('aaaaaaaa-0000-0000-0000-000000000003', 'Ancla', 'by_quantity',
             '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111') $$,
  'administracion crea categorias'
);

with u as (
     update equipment_categories set name = 'Jet Ski Deluxe'
     where id = 'aaaaaaaa-0000-0000-0000-000000000001'
     returning 1
)
select is((select count(*)::int from u), 1, 'administracion actualiza categorias');

-- ============================================================
-- Inventario: equipment_units
-- ============================================================
reset role;
set local role authenticated;
set local request.jwt.claims to '{"sub":"33333333-3333-3333-3333-333333333333","role":"authenticated"}';

select is(
  (select count(*)::int from equipment_units),
  1,
  'reservas lee las unidades'
);

select throws_ok(
  $$ insert into equipment_units (category_id, code)
     values ('aaaaaaaa-0000-0000-0000-000000000001', 'JET-99') $$,
  '42501', null,
  'reservas no crea unidades'
);

with u as (
     update equipment_units set fuel_level = 2
     where id = 'bbbbbbbb-0000-0000-0000-000000000001'
     returning 1
)
select is((select count(*)::int from u), 0, 'reservas no actualiza unidades');

reset role;
set local role authenticated;
set local request.jwt.claims to '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}';

select lives_ok(
  $$ insert into equipment_units (category_id, code)
     values ('aaaaaaaa-0000-0000-0000-000000000001', 'JET-02') $$,
  'operaciones crea unidades'
);

with u as (
     update equipment_units set fuel_level = 4
     where id = 'bbbbbbbb-0000-0000-0000-000000000001'
     returning 1
)
select is((select count(*)::int from u), 1, 'operaciones actualiza unidades');

-- ============================================================
-- Inventario: equipment_stock
-- ============================================================
reset role;
set local role authenticated;
set local request.jwt.claims to '{"sub":"33333333-3333-3333-3333-333333333333","role":"authenticated"}';

select is(
  (select count(*)::int from equipment_stock),
  1,
  'reservas lee el stock'
);

select throws_ok(
  $$ insert into equipment_stock (category_id, quantity_available)
     values ('aaaaaaaa-0000-0000-0000-000000000003', 3) $$,
  '42501', null,
  'reservas no crea filas de stock'
);

with u as (
     update equipment_stock set quantity_available = 999
     where category_id = 'aaaaaaaa-0000-0000-0000-000000000002'
     returning 1
)
select is((select count(*)::int from u), 0, 'reservas no actualiza el stock');

reset role;
set local role authenticated;
set local request.jwt.claims to '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}';

select lives_ok(
  $$ insert into equipment_stock (category_id, quantity_available)
     values ('aaaaaaaa-0000-0000-0000-000000000003', 3) $$,
  'operaciones crea filas de stock'
);

with u as (
     update equipment_stock set quantity_available = 7
     where category_id = 'aaaaaaaa-0000-0000-0000-000000000002'
     returning 1
)
select is((select count(*)::int from u), 1, 'operaciones actualiza el stock');

-- ============================================================
-- Inventario: equipment_stock_movements (solo select + insert)
-- ============================================================
reset role;
set local role authenticated;
set local request.jwt.claims to '{"sub":"33333333-3333-3333-3333-333333333333","role":"authenticated"}';

select is(
  (select count(*)::int from equipment_stock_movements),
  0,
  'reservas lee el historial de movimientos (vacio, pero sin error)'
);

select throws_ok(
  $$ insert into equipment_stock_movements
       (category_id, from_available, to_available, from_damaged, to_damaged,
        from_in_repair, to_in_repair, reason)
     values ('aaaaaaaa-0000-0000-0000-000000000002', 10, 7, 0, 0, 0, 0, 'ajuste') $$,
  '42501', null,
  'reservas no registra movimientos de stock'
);

reset role;
set local role authenticated;
set local request.jwt.claims to '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}';

select lives_ok(
  $$ insert into equipment_stock_movements
       (category_id, from_available, to_available, from_damaged, to_damaged,
        from_in_repair, to_in_repair, reason)
     values ('aaaaaaaa-0000-0000-0000-000000000002', 10, 7, 0, 0, 0, 0, 'ajuste') $$,
  'operaciones registra movimientos de stock'
);

-- ============================================================
-- unit_condition_photos: la unica marca que habilita una capacidad, no solo
-- visibilidad.
-- ============================================================
reset role;
set local role authenticated;
set local request.jwt.claims to '{"sub":"33333333-3333-3333-3333-333333333333","role":"authenticated"}';

select is(
  (select count(*)::int from unit_condition_photos),
  0,
  'reservas lee las fotos de estado (vacio, pero sin error)'
);

reset role;
set local role authenticated;
set local request.jwt.claims to '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}';

-- Ismael ya tiene la marca encargado_general (otorgada mas arriba).
select lives_ok(
  $$ insert into unit_condition_photos (unit_id, angle, storage_path, uploaded_by)
     values ('bbbbbbbb-0000-0000-0000-000000000001', 'front', 'fotos/x.webp',
             '22222222-2222-2222-2222-222222222222') $$,
  'con la marca de encargado general si sube fotos de estado'
);

with u as (
     update unit_condition_photos set storage_path = 'fotos/y.webp'
     where unit_id = 'bbbbbbbb-0000-0000-0000-000000000001' and angle = 'front'
     returning 1
)
select is((select count(*)::int from u), 1, 'con la marca de encargado general si reemplaza fotos de estado');

reset role;
set local role authenticated;
set local request.jwt.claims to '{"sub":"33333333-3333-3333-3333-333333333333","role":"authenticated"}';

select throws_ok(
  $$ insert into unit_condition_photos (unit_id, angle, storage_path, uploaded_by)
     values ('bbbbbbbb-0000-0000-0000-000000000001', 'left_side', 'fotos/z.webp',
             '33333333-3333-3333-3333-333333333333') $$,
  '42501', null,
  'sin la marca de encargado general no se suben fotos de estado'
);

with u as (
     update unit_condition_photos set storage_path = 'fotos/w.webp'
     where unit_id = 'bbbbbbbb-0000-0000-0000-000000000001' and angle = 'front'
     returning 1
)
select is((select count(*)::int from u), 0, 'sin la marca de encargado general no se reemplazan fotos de estado');

-- ============================================================
-- damage_reports (solo select + insert)
-- ============================================================
reset role;
set local role authenticated;
set local request.jwt.claims to '{"sub":"33333333-3333-3333-3333-333333333333","role":"authenticated"}';

select is(
  (select count(*)::int from damage_reports),
  0,
  'reservas lee los reportes de dano (vacio, pero sin error)'
);

select throws_ok(
  $$ insert into damage_reports (unit_id, cause, description)
     values ('bbbbbbbb-0000-0000-0000-000000000001', 'collision', 'golpe leve') $$,
  '42501', null,
  'reservas no reporta danos'
);

reset role;
set local role authenticated;
set local request.jwt.claims to '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}';

select lives_ok(
  $$ insert into damage_reports (unit_id, cause, description)
     values ('bbbbbbbb-0000-0000-0000-000000000001', 'collision', 'golpe leve') $$,
  'operaciones reporta danos'
);

-- ============================================================
-- maintenance_records
-- ============================================================
reset role;
set local role authenticated;
set local request.jwt.claims to '{"sub":"33333333-3333-3333-3333-333333333333","role":"authenticated"}';

select is(
  (select count(*)::int from maintenance_records),
  0,
  'reservas lee el mantenimiento (vacio, pero sin error)'
);

select throws_ok(
  $$ insert into maintenance_records (unit_id, work_type, is_external, performed_at)
     values ('bbbbbbbb-0000-0000-0000-000000000001', 'cambio de aceite', false, current_date) $$,
  '42501', null,
  'reservas no registra mantenimiento'
);

reset role;
set local role authenticated;
set local request.jwt.claims to '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}';

select lives_ok(
  $$ insert into maintenance_records (unit_id, work_type, is_external, performed_at)
     values ('bbbbbbbb-0000-0000-0000-000000000001', 'cambio de aceite', false, current_date) $$,
  'operaciones registra mantenimiento'
);

reset role;
set local role authenticated;
set local request.jwt.claims to '{"sub":"33333333-3333-3333-3333-333333333333","role":"authenticated"}';

with u as (
     update maintenance_records set description = 'hackeado'
     where unit_id = 'bbbbbbbb-0000-0000-0000-000000000001'
     returning 1
)
select is((select count(*)::int from u), 0, 'reservas no actualiza el mantenimiento');

reset role;
set local role authenticated;
set local request.jwt.claims to '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}';

with u as (
     update maintenance_records set description = 'aceite 10w40'
     where unit_id = 'bbbbbbbb-0000-0000-0000-000000000001'
     returning 1
)
select is((select count(*)::int from u), 1, 'operaciones actualiza el mantenimiento');

-- ============================================================
-- inventory_counts (solo select + insert)
-- ============================================================
reset role;
set local role authenticated;
set local request.jwt.claims to '{"sub":"33333333-3333-3333-3333-333333333333","role":"authenticated"}';

select is(
  (select count(*)::int from inventory_counts),
  0,
  'reservas lee los conteos (vacio, pero sin error)'
);

select throws_ok(
  $$ insert into inventory_counts (notes) values ('conteo de prueba') $$,
  '42501', null,
  'reservas no crea conteos'
);

reset role;
set local role authenticated;
set local request.jwt.claims to '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}';

select lives_ok(
  $$ insert into inventory_counts (id, notes)
     values ('cccccccc-0000-0000-0000-000000000001', 'conteo de prueba') $$,
  'operaciones crea conteos'
);

-- ============================================================
-- inventory_count_lines (solo select + insert)
-- ============================================================
reset role;
set local role authenticated;
set local request.jwt.claims to '{"sub":"33333333-3333-3333-3333-333333333333","role":"authenticated"}';

select is(
  (select count(*)::int from inventory_count_lines),
  0,
  'reservas lee las lineas de conteo (vacio, pero sin error)'
);

select throws_ok(
  $$ insert into inventory_count_lines
       (count_id, category_id, quantity_available, quantity_damaged, quantity_in_repair)
     values ('cccccccc-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000002', 10, 0, 0) $$,
  '42501', null,
  'reservas no crea lineas de conteo'
);

reset role;
set local role authenticated;
set local request.jwt.claims to '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}';

select lives_ok(
  $$ insert into inventory_count_lines
       (count_id, category_id, quantity_available, quantity_damaged, quantity_in_repair)
     values ('cccccccc-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000002', 10, 0, 0) $$,
  'operaciones crea lineas de conteo'
);

-- ============================================================
-- El otro borde de workers_select_guides / worker_marks_select_guides
-- ============================================================

-- Las dos politicas que 20260828001650 agrega para que reservas pueda
-- asignar guias exigen has_area('reservas') or has_area('operaciones'). Las
-- pruebas de arriba confirman que un area valida si pasa; estas confirman
-- que sin area no pasa nada, que es el lado que de verdad protege. Se agrega
-- al final a proposito: creando a Diego aqui, ninguna cuenta de filas
-- anterior cambia.
--
-- Diego entra como operaciones y se le retira su unica area, para
-- representar a quien no tiene ninguna: ni reservas, ni operaciones, ni
-- administracion.
reset role;
insert into auth.users (id, email)
values ('44444444-4444-4444-4444-444444444444', 'diego@arenal.local');
insert into workers (id, username, full_name, base_role)
values ('44444444-4444-4444-4444-444444444444', 'diego', 'Diego', 'operaciones');
delete from worker_areas
 where worker_id = '44444444-4444-4444-4444-444444444444' and area = 'operaciones';

set local role authenticated;
set local request.jwt.claims to '{"sub":"44444444-4444-4444-4444-444444444444","role":"authenticated"}';

select is(
  (select count(*)::int from workers),
  1,
  'sin area, workers_select_guides no aplica: solo se ve la fila propia'
);
select is(
  (select count(*)::int from workers
   where id = '33333333-3333-3333-3333-333333333333'),
  0,
  'sin area, la fila de un guia sigue invisible aunque tenga la marca'
);
select is(
  (select count(*)::int from worker_marks),
  0,
  'sin area, la marca guia de otro trabajador sigue invisible'
);

reset role;

select * from finish();
rollback;
