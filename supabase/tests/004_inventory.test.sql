begin;
select plan(16);

insert into auth.users (id, email)
values ('11111111-1111-1111-1111-111111111111', 'admin@arenal.local');
insert into workers (id, username, full_name, personal_email, base_role)
values ('11111111-1111-1111-1111-111111111111', 'admin', 'Leno', 'leno@correo.com', 'administracion');

insert into equipment_categories
  (id, name, tracking_mode, is_reservable, has_motor, usage_metric,
   default_duration_minutes, created_by, updated_by)
values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Jet Ski', 'by_unit', true, true, 'engine_hours', 60,
   '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111');

insert into equipment_categories
  (id, name, tracking_mode, created_by, updated_by)
values ('aaaaaaaa-0000-0000-0000-000000000002', 'Chaleco', 'by_quantity',
        '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111');

-- Segunda categoria by_unit, para probar unicidad de codigo entre categorias
-- sin dejar una unidad colgando de una categoria by_quantity (eso es lo que
-- la tarea 6 empezara a prohibir).
insert into equipment_categories
  (id, name, tracking_mode, has_motor, usage_metric, created_by, updated_by)
values ('aaaaaaaa-0000-0000-0000-000000000003', 'Cuadraciclo', 'by_unit', true, 'kilometers',
        '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111');

select has_table('public', 'equipment_units', 'existe equipment_units');
select has_table('public', 'equipment_stock', 'existe equipment_stock');
select has_table('public', 'equipment_stock_movements', 'existe equipment_stock_movements');

insert into equipment_units (category_id, code, created_by, updated_by)
values ('aaaaaaaa-0000-0000-0000-000000000001', 'JET-01',
        '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111');

-- El codigo es unico en toda la empresa, no solo dentro de su categoria.
select throws_ok(
  $$ insert into equipment_units (category_id, code, created_by, updated_by)
     values ('aaaaaaaa-0000-0000-0000-000000000001', 'JET-01',
             '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111') $$,
  '23505', null,
  'el codigo de una unidad no se repite dentro de la misma categoria'
);

-- La unicidad del codigo cruza categorias: no es unique(category_id, code).
-- Se usa otra categoria by_unit (Cuadraciclo) para no dejar una unidad
-- colgando de una categoria by_quantity.
select throws_ok(
  $$ insert into equipment_units (category_id, code, created_by, updated_by)
     values ('aaaaaaaa-0000-0000-0000-000000000003', 'JET-01',
             '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111') $$,
  '23505', null,
  'el codigo de una unidad no se repite ni en otra categoria'
);

-- La baja exige fecha y motivo, para que el historial siga cuadrando.
select throws_ok(
  $$ update equipment_units set status = 'decommissioned' where code = 'JET-01' $$,
  '23514', null,
  'dar de baja sin fecha es rechazado'
);

-- Poner fecha de baja sin marcar el estado tambien rompe la forma esperada.
select throws_ok(
  $$ update equipment_units
     set decommissioned_at = now(), decommission_reason = 'Se vendio'
     where code = 'JET-01' $$,
  '23514', null,
  'poner fecha de baja sin cambiar el estado es rechazado'
);

-- La fecha de baja sin motivo tambien se rechaza, aunque el estado si cuadre.
select throws_ok(
  $$ update equipment_units
     set status = 'decommissioned', decommissioned_at = now(), decommission_reason = null
     where code = 'JET-01' $$,
  '23514', null,
  'dar de baja sin motivo es rechazado'
);

select lives_ok(
  $$ update equipment_units
     set status = 'decommissioned', decommissioned_at = now(),
         decommission_reason = 'Se vendio'
     where code = 'JET-01' $$,
  'dar de baja con fecha y motivo funciona'
);

-- El contador de impactos nunca es negativo.
select throws_ok(
  $$ insert into equipment_units (category_id, code, impact_count, created_by, updated_by)
     values ('aaaaaaaa-0000-0000-0000-000000000001', 'JET-02', -1,
             '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111') $$,
  '23514', null,
  'un impact_count negativo es rechazado'
);

-- El combustible se lee por lineas, no por porcentaje: fuel_max es el tope
-- fisico del medidor de esa unidad.
select throws_ok(
  $$ insert into equipment_units (category_id, code, fuel_max, created_by, updated_by)
     values ('aaaaaaaa-0000-0000-0000-000000000001', 'JET-03', 25,
             '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111') $$,
  '23514', null,
  'un fuel_max fuera de 1-20 es rechazado'
);

-- fuel_level nunca queda por encima del propio fuel_max de la unidad, ni al
-- insertar ni al bajar el maximo despues.
select throws_ok(
  $$ insert into equipment_units (category_id, code, fuel_max, fuel_level, created_by, updated_by)
     values ('aaaaaaaa-0000-0000-0000-000000000001', 'JET-03', 4, 5,
             '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111') $$,
  '23514', null,
  'un fuel_level mayor que fuel_max es rechazado'
);

-- Las cantidades de equipment_stock nunca quedan negativas.
select throws_ok(
  $$ insert into equipment_stock (category_id, quantity_available, updated_by)
     values ('aaaaaaaa-0000-0000-0000-000000000002', -1,
             '11111111-1111-1111-1111-111111111111') $$,
  '23514', null,
  'una cantidad disponible negativa es rechazada'
);

select throws_ok(
  $$ insert into equipment_stock (category_id, quantity_damaged, updated_by)
     values ('aaaaaaaa-0000-0000-0000-000000000002', -1,
             '11111111-1111-1111-1111-111111111111') $$,
  '23514', null,
  'una cantidad dañada negativa es rechazada'
);

select throws_ok(
  $$ insert into equipment_stock (category_id, quantity_in_repair, updated_by)
     values ('aaaaaaaa-0000-0000-0000-000000000002', -1,
             '11111111-1111-1111-1111-111111111111') $$,
  '23514', null,
  'una cantidad en reparacion negativa es rechazada'
);

-- Una categoria solo lleva un renglon de stock: category_id es la clave
-- primaria porque es la regla de negocio, no un identificador de superficie.
insert into equipment_stock (category_id, updated_by)
values ('aaaaaaaa-0000-0000-0000-000000000002',
        '11111111-1111-1111-1111-111111111111');

select throws_ok(
  $$ insert into equipment_stock (category_id, updated_by)
     values ('aaaaaaaa-0000-0000-0000-000000000002',
             '11111111-1111-1111-1111-111111111111') $$,
  '23505', null,
  'una categoria no puede tener dos renglones de stock'
);

select * from finish();
rollback;
