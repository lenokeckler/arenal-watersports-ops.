-- EP-ADM-06: los calculos de estadisticas y reportes los hace la base, no
-- TypeScript. Cada vista de aqui abajo lee directamente de las tablas ya
-- protegidas por RLS (rls_operations_money.sql, rls_identity_catalog.sql):
-- una vista corre con los privilegios de quien la consulta para efectos de
-- seguridad de filas, no con los del dueno que la creo, asi que
-- administracion ve todo y cualquier otro rol solo ve lo que sus propias
-- politicas ya permiten — exactamente el mismo principio que
-- unit_current_state y category_availability.

-- ============================ US-ADM-026/027: ingresos ============================

-- Cada renglon es un solo movimiento con signo — cobro, devolucion o
-- retencion de un deposito — nunca los tres mezclados en la misma columna,
-- para que sumarlos por dia o por mes sea una simple suma de columnas.
create view financial_movements with (security_invoker = true) as
select
  (created_at at time zone 'UTC')::date as occurred_on,
  currency,
  amount as gross_amount,
  0::numeric(14,2) as refunds_amount,
  0::numeric(14,2) as retained_amount
from reservation_charges
union all
select
  (created_at at time zone 'UTC')::date as occurred_on,
  currency,
  0::numeric(14,2) as gross_amount,
  amount as refunds_amount,
  0::numeric(14,2) as retained_amount
from refunds
union all
select
  (resolved_at at time zone 'UTC')::date as occurred_on,
  currency,
  0::numeric(14,2) as gross_amount,
  0::numeric(14,2) as refunds_amount,
  retained_amount
from deposits
where status in ('retained', 'partially_retained');

comment on view financial_movements is
  'US-ADM-026: un renglon por movimiento de dinero real (cobro, devolucion o retencion de deposito), con su propio signo. Base de daily_revenue_report y monthly_revenue_report.';

-- US-ADM-026: ingresos del dia, netos de devoluciones y con lo retenido de
-- depositos ya sumado (con su motivo disponible en la propia tabla
-- deposits), separados por moneda — nunca en un solo total, porque el
-- sistema no maneja tipo de cambio.
create view daily_revenue_report with (security_invoker = true) as
select
  occurred_on as day,
  currency,
  sum(gross_amount) as gross_amount,
  sum(refunds_amount) as refunds_amount,
  sum(retained_amount) as retained_amount,
  sum(gross_amount) - sum(refunds_amount) + sum(retained_amount) as net_amount
from financial_movements
group by occurred_on, currency;

comment on view daily_revenue_report is
  'US-ADM-026: ingresos de un dia por moneda: cobros, menos devoluciones, mas lo retenido de depositos.';

-- US-ADM-027: el mismo resumen agregado por mes, para comparar temporadas.
create view monthly_revenue_report with (security_invoker = true) as
select
  date_trunc('month', occurred_on)::date as month,
  currency,
  sum(gross_amount) as gross_amount,
  sum(refunds_amount) as refunds_amount,
  sum(retained_amount) as retained_amount,
  sum(gross_amount) - sum(refunds_amount) + sum(retained_amount) as net_amount
from financial_movements
group by date_trunc('month', occurred_on), currency;

comment on view monthly_revenue_report is
  'US-ADM-027: daily_revenue_report agregado por mes, para comparar temporadas.';

-- ============================ US-ADM-027: movimiento de salidas ============================

-- Cuantas salidas arrancaron cada dia. El dia es el de starts_at (cuando
-- sale la reserva), no el de created_at (cuando se agendo) — una reserva
-- cancelada nunca salio, asi que no cuenta.
create view daily_reservation_counts with (security_invoker = true) as
select
  (starts_at at time zone 'UTC')::date as day,
  count(*)::integer as reservations_count
from reservations
where status <> 'cancelled'
group by (starts_at at time zone 'UTC')::date;

comment on view daily_reservation_counts is
  'US-ADM-027: salidas por dia (por starts_at), excluyendo canceladas.';

create view monthly_reservation_counts with (security_invoker = true) as
select
  date_trunc('month', (starts_at at time zone 'UTC')::date)::date as month,
  count(*)::integer as reservations_count
from reservations
where status <> 'cancelled'
group by date_trunc('month', (starts_at at time zone 'UTC')::date);

comment on view monthly_reservation_counts is
  'US-ADM-027: daily_reservation_counts agregado por mes.';

-- ============================ US-ADM-029: reservas por trabajador ============================

-- Sale de la firma que queda en cada reserva (created_by: quien la
-- registro), no de quien la despacho o la cerro. El join interno deja
-- fuera a un trabajador sin ninguna reserva propia.
create view reservations_by_worker with (security_invoker = true) as
select
  w.id as worker_id,
  w.full_name as worker_name,
  count(r.id)::integer as reservations_count,
  min(r.starts_at) as first_reservation_at,
  max(r.starts_at) as last_reservation_at
from workers w
join reservations r on r.created_by = w.id and r.status <> 'cancelled'
group by w.id, w.full_name;

comment on view reservations_by_worker is
  'US-ADM-029: reservas atendidas por trabajador, segun created_by. Excluye canceladas y a quien nunca registro ninguna.';

-- ============================ US-ADM-030: costo de mantenimiento ============================

-- Se construye del historial de mantenimiento; solo las filas con costo
-- real entran — el trabajo interno sin costo (is_external = false y
-- cost_amount nulo) no aporta gasto.
create view maintenance_cost_by_unit with (security_invoker = true) as
select
  u.id as unit_id,
  u.code as unit_code,
  u.category_id,
  mr.cost_currency as currency,
  sum(mr.cost_amount) as total_cost,
  count(mr.id)::integer as records_count,
  max(mr.performed_at) as last_performed_at
from equipment_units u
join maintenance_records mr on mr.unit_id = u.id
where mr.cost_amount is not null
group by u.id, u.code, u.category_id, mr.cost_currency;

comment on view maintenance_cost_by_unit is
  'US-ADM-030: costo real de mantenimiento por unidad y moneda, a partir de maintenance_records. Un registro sin costo (trabajo interno) no aporta.';
