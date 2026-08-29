begin;
select plan(7);

select has_type('public', 'work_area', 'existe el tipo work_area');
select has_table('public', 'workers', 'existe la tabla workers');

-- La cuenta de administracion es unica en todo el sistema.
insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'admin@arenal.local'),
  ('22222222-2222-2222-2222-222222222222', 'otro@arenal.local'),
  ('33333333-3333-3333-3333-333333333333', 'guia@arenal.local');

insert into workers (id, username, full_name, personal_email, base_role)
values ('11111111-1111-1111-1111-111111111111', 'admin', 'Leno', 'leno@correo.com', 'administracion');

select throws_ok(
  $$ insert into workers (id, username, full_name, personal_email, base_role)
     values ('22222222-2222-2222-2222-222222222222', 'admin2', 'Otro', 'o@correo.com', 'administracion') $$,
  '23505',
  null,
  'no se puede crear una segunda cuenta de administracion'
);

-- La cuenta de administracion no se bloquea ni se borra.
select throws_ok(
  $$ update workers set status = 'blocked' where username = 'admin' $$,
  'La cuenta de administracion no se bloquea'
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

select * from finish();
rollback;
