-- update_v10.sql — Resolución de depósitos de garantía (devuelto / retenido).
--
-- El depósito solo lo generan los jet skis (única unidad damageable). Hasta ahora
-- `deposit_pending` era un booleano: true = aún por devolver. Esta migración añade
-- el desenlace para poder marcarlos y sacarlos de la lista de pendientes:
--   deposit_pending = false  +  deposit_resolution = 'returned' | 'retained'.
--
-- No requiere política RLS nueva: "write reservations" (roles.sql) ya permite a
-- admin/staff (can_operate) actualizar reservas; el rol `reservas` queda solo lectura.
--
-- Idempotente: re-ejecutable sin error.

alter table reservations
  add column if not exists deposit_resolution text
  check (deposit_resolution in ('returned', 'retained'));

comment on column reservations.deposit_resolution is
  'Desenlace del depósito de garantía: returned (devuelto al cliente) | retained (retenido). NULL mientras sigue pendiente.';
