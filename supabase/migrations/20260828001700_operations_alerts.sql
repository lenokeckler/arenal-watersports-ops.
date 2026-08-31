-- EP-OPE-03 / EP-OPE-04: los avisos y los conteos por categoria los calcula
-- la base, no TypeScript. No es preferencia de estilo: PostgREST no sabe
-- comparar dos columnas entre si (usage_total contra next_oil_change_at,
-- quantity_available contra alert_min_quantity), asi que sin estas vistas la
-- regla terminaria recalculada en el cliente sobre una lista completa.
--
-- Todas van con security_invoker = true. Sin esa opcion la vista evalua la
-- seguridad por fila como su dueno (postgres, superusuario) y se convierte en
-- una puerta lateral alrededor del RLS -- exactamente el defecto que se
-- corrigio en unit_current_state (migracion 20260828001550).

-- ============================ US-OPE-012: cambio de aceite ============================

-- Una fila por unidad viva que tenga umbral configurado en su ficha. El
-- aviso es alcanzar el umbral, tal cual lo dice la historia: "cuando las
-- horas o el kilometraje acumulado lo alcanzan". La vista devuelve tambien
-- las unidades que todavia no llegan, con is_oil_change_due en false, para
-- que la ficha de la maquina pueda mostrar cuanto le falta sin que nadie
-- reste dos columnas a mano en el cliente.
create view unit_service_status with (security_invoker = true) as
select
  u.id                                        as unit_id,
  u.code,
  u.category_id,
  c.name                                      as category_name,
  c.usage_metric,
  u.status,
  u.usage_total,
  u.next_oil_change_at,
  (u.next_oil_change_at - u.usage_total)      as remaining_usage,
  (u.usage_total >= u.next_oil_change_at)     as is_oil_change_due
from equipment_units u
join equipment_categories c on c.id = u.category_id
where u.next_oil_change_at is not null
  and u.status <> 'decommissioned';

comment on view unit_service_status is
  'US-OPE-012: umbral de cambio de aceite por unidad. is_oil_change_due marca la que ya lo alcanzo; remaining_usage dice cuanto le falta a la que no.';

-- ============================ US-OPE-021: inventario por categoria ============================

-- El inventario es un solo registro: las categorias identificadas una por una
-- cuentan fichas y las llevadas por cantidad leen su fila de existencias. La
-- vista normaliza las dos formas a las mismas columnas para que la pantalla
-- de inventario no tenga que ramificar antes de saber cuanto hay.
create view inventory_category_summary with (security_invoker = true) as
select
  c.id            as category_id,
  c.name          as category_name,
  c.tracking_mode,
  c.is_reservable,
  case when c.tracking_mode = 'by_unit'
       then coalesce(units.available, 0)
       else coalesce(stock.quantity_available, 0) end as quantity_available,
  case when c.tracking_mode = 'by_unit'
       then coalesce(units.damaged, 0)
       else coalesce(stock.quantity_damaged, 0) end   as quantity_damaged,
  case when c.tracking_mode = 'by_unit'
       then coalesce(units.in_repair, 0)
       else coalesce(stock.quantity_in_repair, 0) end as quantity_in_repair,
  -- Solo una ficha puede estar en el taller: una categoria por cantidad no
  -- tiene columna para eso y no se inventa una.
  case when c.tracking_mode = 'by_unit'
       then coalesce(units.in_maintenance, 0)
       else 0 end                                     as quantity_in_maintenance,
  case when c.tracking_mode = 'by_unit'
       then coalesce(units.total, 0)
       else coalesce(stock.quantity_available, 0)
          + coalesce(stock.quantity_damaged, 0)
          + coalesce(stock.quantity_in_repair, 0) end as quantity_total
from equipment_categories c
left join lateral (
  select
    count(*) filter (where eu.status = 'available')::integer      as available,
    count(*) filter (where eu.status = 'damaged')::integer        as damaged,
    count(*) filter (where eu.status = 'in_repair')::integer      as in_repair,
    count(*) filter (where eu.status = 'in_maintenance')::integer as in_maintenance,
    count(*)::integer                                             as total
  from equipment_units eu
  where eu.category_id = c.id
    and eu.status <> 'decommissioned'
) units on c.tracking_mode = 'by_unit'
left join equipment_stock stock
  on stock.category_id = c.id and c.tracking_mode = 'by_quantity'
where c.status = 'active';

comment on view inventory_category_summary is
  'US-OPE-021: cuanto hay y en que estado por categoria, contando fichas cuando es by_unit y leyendo existencias cuando es by_quantity. Da de baja fuera del conteo.';

-- ============================ US-OPE-026: aviso por cantidad minima ============================

-- Aplica solo a las categorias que administracion configuro con aviso por
-- cantidad: sin alert_min_quantity la categoria no entra, no avisa con cero.
create view inventory_quantity_alerts with (security_invoker = true) as
select
  c.id   as category_id,
  c.name as category_name,
  c.alert_min_quantity,
  s.quantity_available,
  (c.alert_min_quantity - s.quantity_available) as missing_quantity
from equipment_categories c
join equipment_stock s on s.category_id = c.id
where c.status = 'active'
  and c.alert_min_quantity is not null
  and s.quantity_available < c.alert_min_quantity;

comment on view inventory_quantity_alerts is
  'US-OPE-026: categorias por cantidad que bajaron de su minimo configurado, con cuanto falta para volver a el.';

-- ============================ US-OPE-027: aviso por vencimiento ============================

-- La anticipacion sale de la configuracion de la categoria
-- (alert_expiry_days), no de un numero fijo aqui adentro. Lo ya vencido
-- entra tambien, con days_to_expiry negativo.
create view inventory_expiry_alerts with (security_invoker = true) as
select
  c.id   as category_id,
  c.name as category_name,
  c.alert_expiry_days,
  s.expiry_date,
  (s.expiry_date - current_date)::integer as days_to_expiry,
  (s.expiry_date <= current_date)         as is_expired
from equipment_categories c
join equipment_stock s on s.category_id = c.id
where c.status = 'active'
  and c.alert_expiry_days is not null
  and s.expiry_date is not null
  and s.expiry_date <= current_date + c.alert_expiry_days;

comment on view inventory_expiry_alerts is
  'US-OPE-027: categorias cuya fecha de vencimiento cae dentro de la anticipacion configurada en la propia categoria, o que ya vencieron.';
