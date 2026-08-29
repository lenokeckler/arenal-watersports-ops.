-- Arenal Ops — v4: lanchas have gas (4 lines) + engine hours like other motors.
-- Safe to run multiple times. Supabase SQL Editor.

-- Lanchas (Pontoon, Bennington) are motorized with 4 gas lines
update equipment_types
  set motorized = true, gas_max_default = 4
  where name in ('Pontoon','Bennington');

update units u
  set gas_max = 4, gas_level = 4, oil_change_at = coalesce(oil_change_at, 80)
  from equipment_types et
  where u.type_id = et.id and et.name in ('Pontoon','Bennington');
