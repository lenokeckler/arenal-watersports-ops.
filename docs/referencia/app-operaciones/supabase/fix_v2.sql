-- Arenal Ops — v2 backfill (SAFE to run multiple times; no policies here)
-- Run this in the Supabase SQL Editor if the categories/menu groups are missing.

-- Make sure the menu/flag columns exist (no-op if already there)
alter table equipment_types add column if not exists menu_group text not null default '';
alter table equipment_types add column if not exists damageable bool not null default false;
alter table equipment_types add column if not exists motorized bool not null default false;
alter table equipment_types add column if not exists gas_max_default int not null default 0;

-- Backfill menu groups + flags (idempotent updates)
update equipment_types set menu_group = 'Jet Ski', damageable = true, motorized = true, gas_max_default = 4 where name = 'Jet Ski';
update equipment_types set menu_group = 'Kayak' where name in ('Kayak doble','Kayak individual');
update equipment_types set menu_group = 'Lanchas' where name in ('Pontoon','Bennington');
update equipment_types set menu_group = 'Paddleboard' where name = 'Paddleboard';
update equipment_types set menu_group = 'Cuadraciclos', motorized = true, gas_max_default = 6 where name = 'Cuadraciclo';

-- Jet ski gas + oil + base X (changeable later to real values)
update units u set gas_max = 4, gas_level = 4, oil_change_at = 80
from equipment_types et where u.type_id = et.id and et.name = 'Jet Ski';

update units u set damage_count = 12 from equipment_types et where u.type_id = et.id and et.name = 'Jet Ski' and u.label = '1';
update units u set damage_count = 7  from equipment_types et where u.type_id = et.id and et.name = 'Jet Ski' and u.label = '2';
update units u set damage_count = 1  from equipment_types et where u.type_id = et.id and et.name = 'Jet Ski' and u.label = '3';
update units u set damage_count = 3  from equipment_types et where u.type_id = et.id and et.name = 'Jet Ski' and u.label = '4';

-- Cuadraciclo gas + oil
update units u set gas_max = 6, gas_level = 6, oil_change_at = 80
from equipment_types et where u.type_id = et.id and et.name = 'Cuadraciclo';

-- Quick check: how each menu group maps
select menu_group, count(*) as unidades
from units u join equipment_types et on et.id = u.type_id
where u.active
group by menu_group
order by menu_group;
