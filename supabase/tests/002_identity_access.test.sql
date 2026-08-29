begin;
select plan(6);

select has_table('public', 'worker_areas', 'existe worker_areas');
select has_table('public', 'worker_marks', 'existe worker_marks');
select has_function('public', 'has_area', 'existe has_area');

insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'admin@arenal.local'),
  ('44444444-4444-4444-4444-444444444444', 'vencido@arenal.local');

insert into workers (id, username, full_name, personal_email, base_role)
values ('11111111-1111-1111-1111-111111111111', 'admin', 'Leno', 'leno@correo.com', 'administracion');

-- El rol base se siembra solo como area, para que los permisos miren un solo lugar.
select is(
  (select count(*)::int from worker_areas
   where worker_id = '11111111-1111-1111-1111-111111111111' and area = 'administracion'),
  1,
  'el rol base queda sembrado como area'
);

-- has_area responde segun el usuario autenticado.
set local role authenticated;
set local request.jwt.claims to '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';
select ok(has_area('administracion'), 'administracion tiene su propia area');
select ok(not has_area('reservas'), 'no tiene un area que nadie le habilito');

select * from finish();
rollback;
