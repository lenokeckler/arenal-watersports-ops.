-- Arenal Ops — v7: bloqueo de trabajadores (despido) sin borrar historial.
-- Idempotente. Correr en el SQL Editor de Supabase.

-- 'blocked' refleja en la UI que la cuenta está vetada. El bloqueo real del
-- ingreso lo hace el ban de Supabase Auth; la Netlify Function espeja esta
-- columna para que el navegador (anon key) muestre el estado sin Admin API.
alter table profiles add column if not exists blocked boolean not null default false;
