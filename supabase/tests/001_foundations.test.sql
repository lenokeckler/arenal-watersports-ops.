begin;
select plan(10);

select has_type('public', 'work_area', 'existe el tipo work_area');
select has_table('public', 'workers', 'existe la tabla workers');

-- La cuenta de administracion es unica en todo el sistema.
insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'admin@arenal.local'),
  ('22222222-2222-2222-2222-222222222222', 'otro@arenal.local'),
  ('33333333-3333-3333-3333-333333333333', 'guia@arenal.local');

-- La cuenta de administracion exige correo personal: se prueba antes de que
-- exista otra cuenta de administracion, para que el rechazo sea por el check
-- (23514) y no por el indice unico de una sola administracion (23505).
select throws_ok(
  $$ insert into workers (id, username, full_name, base_role)
     values ('11111111-1111-1111-1111-111111111111', 'admin', 'Leno', 'administracion') $$,
  '23514',
  null,
  'una cuenta de administracion sin correo personal es rechazada'
);

insert into workers (id, username, full_name, personal_email, base_role)
values ('11111111-1111-1111-1111-111111111111', 'admin', 'Leno', 'leno@correo.com', 'administracion');

select throws_ok(
  $$ insert into workers (id, username, full_name, personal_email, base_role)
     values ('22222222-2222-2222-2222-222222222222', 'admin2', 'Otro', 'o@correo.com', 'administracion') $$,
  '23505',
  null,
  'no se puede crear una segunda cuenta de administracion'
);

-- La cuenta de administracion no se bloquea, no cambia de rol, ni se borra.
select throws_ok(
  $$ update workers set status = 'blocked' where username = 'admin' $$,
  'La cuenta de administracion no se bloquea'
);
select throws_ok(
  $$ update workers set base_role = 'operaciones' where username = 'admin' $$,
  'La cuenta de administracion no cambia de rol'
);
select throws_ok(
  $$ delete from workers where username = 'admin' $$,
  'La cuenta de administracion no se elimina'
);

-- El correo personal solo es obligatorio en administracion.
select lives_ok(
  $$ insert into workers (id, username, full_name, base_role)
     values ('22222222-2222-2222-2222-222222222222', 'ismael', 'Ismael', 'operaciones') $$,
  'una cuenta que no es de administracion no exige correo personal'
);

-- El guia externo exige cedula y caducidad.
select throws_ok(
  $$ insert into workers (id, username, full_name, base_role, is_external_guide)
     values ('33333333-3333-3333-3333-333333333333', '112340567', 'Guia', 'operaciones', true) $$,
  '23514',
  null,
  'un guia externo sin cedula ni caducidad es rechazado'
);

-- Un guia externo bien formado se inserta correctamente.
select lives_ok(
  $$ insert into workers (id, username, full_name, base_role, is_external_guide, national_id, expires_at)
     values ('33333333-3333-3333-3333-333333333333', '112340567', 'Guia', 'operaciones', true,
             '112340567', now() + interval '1 year') $$,
  'un guia externo con cedula y caducidad se inserta correctamente'
);

select * from finish();
rollback;
