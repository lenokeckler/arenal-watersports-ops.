begin;
select plan(9);

insert into auth.users (id, email)
values ('11111111-1111-1111-1111-111111111111', 'admin@arenal.local');
insert into workers (id, username, full_name, personal_email, base_role)
values ('11111111-1111-1111-1111-111111111111', 'admin', 'Leno', 'leno@correo.com', 'administracion');

-- Categoria que arranca por cantidad y sin registros: la modalidad todavia
-- se puede corregir. Se le cambia el modo y luego se le archiva una unidad
-- para dejarla congelada (prueba 3).
insert into equipment_categories
  (id, name, tracking_mode, is_reservable, default_duration_minutes, created_by, updated_by)
values ('aaaaaaaa-0000-0000-0000-000000000001', 'Kayak doble', 'by_quantity', true, 60,
        '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111');

-- Categoria por cantidad que se queda asi: prueba el trigger de stock y,
-- con su renglon de stock, que el freeze tambien la protege sin tocar
-- equipment_units.
insert into equipment_categories
  (id, name, tracking_mode, created_by, updated_by)
values ('aaaaaaaa-0000-0000-0000-000000000002', 'Chaleco', 'by_quantity',
        '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111');

-- Categoria por unidad que se queda asi: blanco de los intentos de archivar
-- algo de la modalidad equivocada.
insert into equipment_categories
  (id, name, tracking_mode, has_motor, usage_metric, created_by, updated_by)
values ('aaaaaaaa-0000-0000-0000-000000000003', 'Cuadraciclo', 'by_unit', true, 'kilometers',
        '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111');

-- 1. Sin registros todavia se puede corregir la modalidad.
select lives_ok(
  $$ update equipment_categories set tracking_mode = 'by_unit'
     where id = 'aaaaaaaa-0000-0000-0000-000000000001' $$,
  'una categoria sin registros todavia puede cambiar de modalidad'
);

-- 2. Camino feliz del trigger de unidades: una unidad se archiva sin
-- problema bajo una categoria by_unit (0001, que acaba de pasar a by_unit
-- en la prueba 1). Esta fila tambien deja congelada a 0001 para la prueba 3.
select lives_ok(
  $$ insert into equipment_units (category_id, code, created_by, updated_by)
     values ('aaaaaaaa-0000-0000-0000-000000000001', 'KAY-01',
             '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111') $$,
  'una unidad se archiva sin problema bajo una categoria by_unit'
);

-- 3. Con registros en equipment_units la categoria ya no puede cambiar de
-- modalidad.
select throws_ok(
  $$ update equipment_categories set tracking_mode = 'by_quantity'
     where id = 'aaaaaaaa-0000-0000-0000-000000000001' $$,
  'La modalidad de una categoria con registros no se cambia'
);

-- 4. Camino feliz del trigger de stock: un renglon de stock se archiva sin
-- problema bajo una categoria by_quantity. Esta fila deja congelada a 0002
-- para la prueba 5, sin que 0002 tenga jamas una fila en equipment_units.
select lives_ok(
  $$ insert into equipment_stock (category_id, updated_by)
     values ('aaaaaaaa-0000-0000-0000-000000000002',
             '11111111-1111-1111-1111-111111111111') $$,
  'un renglon de stock se archiva sin problema bajo una categoria by_quantity'
);

-- 5. Con registros solo en equipment_stock la categoria tambien queda
-- congelada: el freeze no depende de que la evidencia este en
-- equipment_units.
select throws_ok(
  $$ update equipment_categories set tracking_mode = 'by_unit'
     where id = 'aaaaaaaa-0000-0000-0000-000000000002' $$,
  'La modalidad de una categoria con registros no se cambia'
);

-- 6. Una categoria by_quantity no admite una unidad individual.
select throws_ok(
  $$ insert into equipment_units (category_id, code, created_by, updated_by)
     values ('aaaaaaaa-0000-0000-0000-000000000002', 'CHA-01',
             '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111') $$,
  'Una categoria por cantidad no lleva unidades individuales'
);

-- 7. Una categoria by_unit no admite un renglon de conteo.
select throws_ok(
  $$ insert into equipment_stock (category_id, updated_by)
     values ('aaaaaaaa-0000-0000-0000-000000000003',
             '11111111-1111-1111-1111-111111111111') $$,
  'Una categoria identificada por unidad no lleva conteo de stock'
);

-- 8. Mover una unidad existente a una categoria de la modalidad equivocada
-- es el mismo defecto que archivarla ahi de una vez: el trigger tambien
-- vigila el update, no solo el insert.
select throws_ok(
  $$ update equipment_units set category_id = 'aaaaaaaa-0000-0000-0000-000000000002'
     where code = 'KAY-01' $$,
  'Una categoria por cantidad no lleva unidades individuales'
);

-- 9. Lo mismo para mover un renglon de stock existente a una categoria
-- by_unit.
select throws_ok(
  $$ update equipment_stock set category_id = 'aaaaaaaa-0000-0000-0000-000000000003'
     where category_id = 'aaaaaaaa-0000-0000-0000-000000000002' $$,
  'Una categoria identificada por unidad no lleva conteo de stock'
);

select * from finish();
rollback;
