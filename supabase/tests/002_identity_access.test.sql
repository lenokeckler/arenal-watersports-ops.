begin;
select plan(14);

select has_table('public', 'worker_areas', 'existe worker_areas');
select has_table('public', 'worker_marks', 'existe worker_marks');
select has_function('public', 'has_area', 'existe has_area');
select has_function('public', 'has_mark', 'existe has_mark');
select has_function('public', 'is_admin', 'existe is_admin');

insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'admin@arenal.local'),
  ('22222222-2222-2222-2222-222222222222', 'operativo@arenal.local'),
  ('33333333-3333-3333-3333-333333333333', 'bloqueado@arenal.local'),
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

-- Cuenta activa sin marcas, area operaciones, para probar is_admin/has_mark en negativo.
insert into workers (id, username, full_name, base_role)
values ('22222222-2222-2222-2222-222222222222', 'operativo', 'Operativo', 'operaciones');

-- Cuenta que se bloquea despues de sembrar su area, para probar el guardian de estado.
-- No es la cuenta de administracion, asi que el trigger de la tarea 2 no lo impide.
insert into workers (id, username, full_name, base_role)
values ('33333333-3333-3333-3333-333333333333', 'bloqueado', 'Bloqueado', 'operaciones');

update workers set status = 'blocked' where id = '33333333-3333-3333-3333-333333333333';

-- Guia externo vencido desde ayer, para probar el guardian de caducidad.
insert into workers (id, username, full_name, base_role, is_external_guide, national_id, expires_at)
values ('44444444-4444-4444-4444-444444444444', 'vencido', 'Vencido', 'operaciones', true,
        '400560789', now() - interval '1 day');

-- has_area / is_admin responden segun el usuario autenticado.
set local role authenticated;
set local request.jwt.claims to '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';
select ok(has_area('administracion'), 'administracion tiene su propia area');
select ok(not has_area('reservas'), 'no tiene un area que nadie le habilito');
select ok(is_admin(), 'is_admin es true para la cuenta de administracion');

-- Volver a un rol con privilegios antes de cambiar de usuario autenticado.
reset role;
set local role authenticated;
set local request.jwt.claims to '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}';
select ok(not is_admin(), 'is_admin es false para quien solo tiene el area operaciones');
select ok(not has_mark('guia'), 'has_mark es false antes de otorgar la marca');

reset role;
insert into worker_marks (worker_id, mark, granted_by)
values ('22222222-2222-2222-2222-222222222222', 'guia', '11111111-1111-1111-1111-111111111111');

set local role authenticated;
set local request.jwt.claims to '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}';
select ok(has_mark('guia'), 'has_mark es true despues de otorgar la marca');

reset role;
set local role authenticated;
set local request.jwt.claims to '{"sub":"33333333-3333-3333-3333-333333333333","role":"authenticated"}';
select ok(not has_area('operaciones'), 'una cuenta bloqueada pierde el area que tiene');

reset role;
set local role authenticated;
set local request.jwt.claims to '{"sub":"44444444-4444-4444-4444-444444444444","role":"authenticated"}';
select ok(not has_area('operaciones'), 'un guia externo vencido pierde el area el instante que pasa su fecha');

select * from finish();
rollback;
