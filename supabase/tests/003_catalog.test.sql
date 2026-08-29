begin;
select plan(9);

insert into auth.users (id, email)
values ('11111111-1111-1111-1111-111111111111', 'admin@arenal.local');
insert into workers (id, username, full_name, personal_email, base_role)
values ('11111111-1111-1111-1111-111111111111', 'admin', 'Leno', 'leno@correo.com', 'administracion');

select has_table('public', 'equipment_categories', 'existe equipment_categories');

-- Si lleva motor tiene que decir en que se mide el uso.
select throws_ok(
  $$ insert into equipment_categories
       (name, tracking_mode, has_motor, created_by, updated_by)
     values ('Jet Ski', 'by_unit', true,
             '11111111-1111-1111-1111-111111111111',
             '11111111-1111-1111-1111-111111111111') $$,
  '23514', null,
  'una categoria con motor exige metrica de uso'
);

-- La metrica de uso no aplica si la categoria no lleva motor.
select throws_ok(
  $$ insert into equipment_categories
       (name, tracking_mode, has_motor, usage_metric, created_by, updated_by)
     values ('Bote sin motor', 'by_unit', false, 'engine_hours',
             '11111111-1111-1111-1111-111111111111',
             '11111111-1111-1111-1111-111111111111') $$,
  '23514', null,
  'una categoria sin motor no lleva metrica de uso'
);

-- Las fotos por angulo son de una pieza concreta.
select throws_ok(
  $$ insert into equipment_categories
       (name, tracking_mode, has_condition_photos, created_by, updated_by)
     values ('Chaleco', 'by_quantity', true,
             '11111111-1111-1111-1111-111111111111',
             '11111111-1111-1111-1111-111111111111') $$,
  '23514', null,
  'una categoria por cantidad no lleva fotos de estado'
);

-- Lo reservable necesita duracion por defecto.
select throws_ok(
  $$ insert into equipment_categories
       (name, tracking_mode, is_reservable, created_by, updated_by)
     values ('Kayak doble', 'by_quantity', true,
             '11111111-1111-1111-1111-111111111111',
             '11111111-1111-1111-1111-111111111111') $$,
  '23514', null,
  'una categoria reservable exige duracion por defecto'
);

-- El minimo de alerta de inventario no puede ser cero ni negativo.
select throws_ok(
  $$ insert into equipment_categories
       (name, tracking_mode, alert_min_quantity, created_by, updated_by)
     values ('Chaleco reserva', 'by_quantity', 0,
             '11111111-1111-1111-1111-111111111111',
             '11111111-1111-1111-1111-111111111111') $$,
  '23514', null,
  'alert_min_quantity no acepta cero ni negativos'
);

-- Los dias de alerta de vencimiento no pueden ser cero ni negativos.
select throws_ok(
  $$ insert into equipment_categories
       (name, tracking_mode, alert_expiry_days, created_by, updated_by)
     values ('Extintor vencimiento', 'by_quantity', -5,
             '11111111-1111-1111-1111-111111111111',
             '11111111-1111-1111-1111-111111111111') $$,
  '23514', null,
  'alert_expiry_days no acepta cero ni negativos'
);

-- El deposito en dolares no puede ser cero ni negativo.
select throws_ok(
  $$ insert into equipment_categories
       (name, tracking_mode, deposit_usd, created_by, updated_by)
     values ('Tabla deposito', 'by_quantity', 0,
             '11111111-1111-1111-1111-111111111111',
             '11111111-1111-1111-1111-111111111111') $$,
  '23514', null,
  'deposit_usd no acepta cero ni negativos'
);

-- Una categoria por cantidad y reservable es valida: es el caso de los kayaks.
select lives_ok(
  $$ insert into equipment_categories
       (name, tracking_mode, is_reservable, default_duration_minutes, created_by, updated_by)
     values ('Kayak doble', 'by_quantity', true, 60,
             '11111111-1111-1111-1111-111111111111',
             '11111111-1111-1111-1111-111111111111') $$,
  'una categoria reservable puede llevarse por cantidad'
);

select * from finish();
rollback;
