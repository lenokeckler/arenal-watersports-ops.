-- Datos iniciales de Arenal Water Sports.
-- Se aplica solo con `supabase db reset` en local; no corre en produccion.

-- La cuenta de administracion. Su correo personal es obligatorio porque es su
-- unica salida cuando pierde la contrasena.
--
-- GoTrue (el servicio de Auth) exige mas columnas que id/email/password para
-- poder autenticar: instance_id, aud y role identifican la fila como un
-- usuario valido de este proyecto; las columnas de token no aceptan NULL al
-- leerlas de vuelta (fallan con "converting NULL to string"); y necesita una
-- fila en auth.identities para el proveedor 'email', que es donde resuelve
-- la identidad al iniciar sesion.
insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  confirmation_token, recovery_token, email_change_token_new, email_change,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
values (
  '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated', 'admin@arenal.local',
  extensions.crypt('Arenal.2026', extensions.gen_salt('bf')), now(),
  '', '', '', '',
  '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now()
)
on conflict do nothing;

insert into auth.identities (
  id, user_id, provider_id, identity_data, provider, last_sign_in_at,
  created_at, updated_at
)
values (
  gen_random_uuid(), '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  jsonb_build_object(
    'sub', '00000000-0000-0000-0000-000000000001',
    'email', 'admin@arenal.local'
  ),
  'email', now(), now(), now()
)
on conflict do nothing;

insert into workers (id, username, full_name, personal_email, base_role, must_change_password)
values ('00000000-0000-0000-0000-000000000001', 'admin', 'Leno',
        'lenokeckler13@gmail.com', 'administracion', true)
on conflict do nothing;

-- ---------------- Categorias ----------------
-- Identificadas una por una: llevan motor, gasolina, uso, golpes y fotos.
insert into equipment_categories
  (name, tracking_mode, is_reservable, has_motor, usage_metric, consumes_fuel,
   has_condition_photos, guide_only, default_duration_minutes,
   deposit_usd, deposit_crc, created_by, updated_by)
values
  ('Jet Ski',     'by_unit', true, true, 'engine_hours', true, true, false, 60,
   200, 100000, '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001'),
  ('Lancha',      'by_unit', true, true, 'engine_hours', true, true, true,  60,
   200, 100000, '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001'),
  ('Cuadraciclo', 'by_unit', true, true, 'kilometers',   true, true, true,  60,
   200, 100000, '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001');

-- Llevadas por cantidad y reservables: no tienen historia propia por pieza.
-- Los dos kayaks comparten grupo: se cuentan y se cobran aparte, pero para
-- quien trabaja son "kayaks", y un grupo de siete que lleva dos dobles y
-- tres individuales no deberia tener que buscarlos en dos renglones
-- distintos.
insert into equipment_categories
  (name, tracking_mode, is_reservable, group_name, default_duration_minutes, created_by, updated_by)
values
  ('Kayak doble',      'by_quantity', true, 'Kayak', 60,
   '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001'),
  ('Kayak individual', 'by_quantity', true, 'Kayak', 60,
   '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001'),
  ('Paddleboard',      'by_quantity', true, null, 60,
   '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001');

-- Llevadas por cantidad y no reservables: viven en el inventario, se cuentan.
insert into equipment_categories
  (name, tracking_mode, is_reservable, alert_min_quantity, alert_expiry_days,
   created_by, updated_by)
values
  ('Chaleco',   'by_quantity', false, 5,    null,
   '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001'),
  ('Remo',      'by_quantity', false, 4,    null,
   '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001'),
  ('Extintor',  'by_quantity', false, null, 30,
   '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001'),
  ('Botiquin',  'by_quantity', false, null, 30,
   '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001'),
  ('Parrilla',  'by_quantity', false, null, null,
   '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001'),
  -- La tabla de wake nunca se alquila sola: va con la lancha Bennington y se
  -- pide como extra. Sigue siendo inventario porque hay dos y se cuentan.
  ('Tabla de wake', 'by_quantity', false, null, null,
   '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001');

-- ---------------- Unidades ----------------
-- Cuatro jet skis y ocho cuadraciclos, tal como los tiene la empresa.
insert into equipment_units (category_id, code, created_by, updated_by)
select c.id, 'JET-0' || n,
       '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001'
from equipment_categories c, generate_series(1, 4) n
where c.name = 'Jet Ski';

insert into equipment_units (category_id, code, created_by, updated_by)
select c.id, 'CUAD-0' || n,
       '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001'
from equipment_categories c, generate_series(1, 8) n
where c.name = 'Cuadraciclo';

-- Las dos lanchas. No admiten los mismos extras, por eso llevan codigo propio.
insert into equipment_units (category_id, code, created_by, updated_by)
select c.id, code,
       '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001'
from equipment_categories c, (values ('PONTOON'), ('BENNINGTON')) as v(code)
where c.name = 'Lancha';

-- ---------------- Stock ----------------
-- Seis kayaks dobles y tres individuales, del inventario anterior. El resto
-- arranca en cero: administracion registra las cantidades reales desde la
-- aplicacion, que para eso es un CRUD.
insert into equipment_stock (category_id, quantity_available, updated_by)
select c.id,
       case c.name
         when 'Kayak doble'      then 6
         when 'Kayak individual' then 3
         when 'Tabla de wake'    then 2
         else 0
       end,
       '00000000-0000-0000-0000-000000000001'
from equipment_categories c
where c.tracking_mode = 'by_quantity';

-- ---------------- Extras ----------------
insert into extras (name, price_usd, created_by, updated_by)
-- Solo lo que no se alquila por aparte. El paddleboard y los kayaks si se
-- rentan solos, asi que llevarlos en una lancha es agregarlos como equipo de
-- la reserva, no como extra: tenerlos ademas aqui daba dos caminos y dos
-- precios para la misma cosa.
values
  ('Parrilla',  25, '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001'),
  ('Tubing',    30, '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001'),
  ('Wakeboard', 35, '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001');

-- El pontoon puede llevar parrilla si el cliente la pide. El wakeboard y el
-- tubing son solo de la bennington, que es la que arrastra.
insert into extra_compatibility (extra_id, unit_id)
select e.id, u.id
from extras e, equipment_units u
where (e.name = 'Parrilla'                and u.code = 'PONTOON')
   or (e.name in ('Wakeboard', 'Tubing')  and u.code = 'BENNINGTON');
