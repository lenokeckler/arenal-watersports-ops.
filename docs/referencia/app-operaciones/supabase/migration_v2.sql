-- Arenal Ops — Migration v2
-- Adds: menu categories, multi-unit reservations, guides, tour/rental kind,
-- damage reports, gas level + engine hours. Safe to run on existing data.
-- Run in Supabase SQL Editor.

-- =========================================================
-- equipment_types: menu grouping + flags
-- =========================================================
alter table equipment_types add column if not exists menu_group text not null default '';
alter table equipment_types add column if not exists damageable bool not null default false;
alter table equipment_types add column if not exists motorized bool not null default false;
alter table equipment_types add column if not exists gas_max_default int not null default 0;

-- =========================================================
-- units: gas + engine hours
-- =========================================================
alter table units add column if not exists gas_level int not null default 0;
alter table units add column if not exists gas_max int not null default 0;
alter table units add column if not exists engine_hours numeric not null default 0;
alter table units add column if not exists oil_change_at numeric;  -- alert when engine_hours >= this

-- =========================================================
-- reservations: tour/rental kind, guide freelance, deposit/return
-- =========================================================
alter table reservations add column if not exists kind text not null default 'renta'
  check (kind in ('tour','renta'));
alter table reservations add column if not exists guide_freelance text not null default '';
alter table reservations add column if not exists return_ok bool;
alter table reservations add column if not exists deposit_pending bool not null default false;
-- multi-unit: unit_id becomes optional (units now live in reservation_units)
alter table reservations alter column unit_id drop not null;

-- =========================================================
-- New tables
-- =========================================================
create table if not exists guides (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null default '',
  color text not null default 'lake',
  active bool not null default true
);

create table if not exists reservation_units (
  reservation_id uuid not null references reservations(id) on delete cascade,
  unit_id uuid not null references units(id),
  primary key (reservation_id, unit_id)
);

create table if not exists reservation_guides (
  reservation_id uuid not null references reservations(id) on delete cascade,
  guide_id uuid not null references guides(id),
  primary key (reservation_id, guide_id)
);

create table if not exists damage_reports (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references units(id),
  reservation_id uuid references reservations(id) on delete set null,
  kind text not null default 'otro' check (kind in ('vuelco','choque','error_maquina','otro')),
  description text not null default '',
  x_added int not null default 0,
  resolved bool not null default false,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

-- =========================================================
-- RLS for new tables
-- =========================================================
alter table guides enable row level security;
alter table reservation_units enable row level security;
alter table reservation_guides enable row level security;
alter table damage_reports enable row level security;

create policy "read guides" on guides for select to authenticated using (true);
create policy "write guides" on guides for all to authenticated using (true) with check (true);

create policy "read res_units" on reservation_units for select to authenticated using (true);
create policy "write res_units" on reservation_units for all to authenticated using (true) with check (true);

create policy "read res_guides" on reservation_guides for select to authenticated using (true);
create policy "write res_guides" on reservation_guides for all to authenticated using (true) with check (true);

create policy "read damage" on damage_reports for select to authenticated using (true);
create policy "write damage" on damage_reports for all to authenticated using (true) with check (true);

-- =========================================================
-- Backfill existing equipment_types with menu groups + flags
-- =========================================================
update equipment_types set menu_group = 'Jet Ski', damageable = true, motorized = true, gas_max_default = 4 where name = 'Jet Ski';
update equipment_types set menu_group = 'Kayak' where name in ('Kayak doble','Kayak individual');
update equipment_types set menu_group = 'Lanchas' where name in ('Pontoon','Bennington');

-- =========================================================
-- New equipment types: Paddleboard (10), Cuadraciclo (6)
-- =========================================================
insert into equipment_types (name, category, default_duration_min, color, sort_order, menu_group, motorized, gas_max_default)
select 'Paddleboard','board',60,'lake',6,'Paddleboard',false,0
where not exists (select 1 from equipment_types where name = 'Paddleboard');

insert into equipment_types (name, category, default_duration_min, color, sort_order, menu_group, motorized, gas_max_default)
select 'Cuadraciclo','atv',120,'navy',7,'Cuadraciclos',true,6
where not exists (select 1 from equipment_types where name = 'Cuadraciclo');

-- Paddleboard units 1-10
insert into units (type_id, label, gas_max, gas_level)
select et.id, 'PB ' || g, 0, 0
from equipment_types et, generate_series(1,10) g
where et.name = 'Paddleboard'
  and not exists (select 1 from units u where u.type_id = et.id);

-- Cuadraciclo units 1-6 (gas 6 lines, full, oil alert at 80h)
insert into units (type_id, label, gas_max, gas_level, oil_change_at)
select et.id, g::text, 6, 6, 80
from equipment_types et, generate_series(1,6) g
where et.name = 'Cuadraciclo'
  and not exists (select 1 from units u where u.type_id = et.id);

-- =========================================================
-- Jet ski gas + oil + base X (changeable later to real values)
-- =========================================================
update units u set gas_max = 4, gas_level = 4, oil_change_at = 80
from equipment_types et where u.type_id = et.id and et.name = 'Jet Ski';

update units u set damage_count = 12 from equipment_types et where u.type_id = et.id and et.name = 'Jet Ski' and u.label = '1';
update units u set damage_count = 7  from equipment_types et where u.type_id = et.id and et.name = 'Jet Ski' and u.label = '2';
update units u set damage_count = 1  from equipment_types et where u.type_id = et.id and et.name = 'Jet Ski' and u.label = '3';
update units u set damage_count = 3  from equipment_types et where u.type_id = et.id and et.name = 'Jet Ski' and u.label = '4';

-- =========================================================
-- Migrate any existing single-unit reservations into reservation_units
-- =========================================================
insert into reservation_units (reservation_id, unit_id)
select id, unit_id from reservations
where unit_id is not null
  and not exists (select 1 from reservation_units ru where ru.reservation_id = reservations.id);
