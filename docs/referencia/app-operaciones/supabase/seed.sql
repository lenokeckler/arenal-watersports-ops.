-- Arenal Water Sports — initial inventory
-- Run AFTER schema.sql, in the Supabase SQL Editor.

-- Equipment types
insert into equipment_types (name, category, default_duration_min, color, sort_order) values
  ('Jet Ski','watercraft',60,'coral',1),
  ('Kayak doble','paddle',60,'lake',2),
  ('Kayak individual','paddle',60,'lake',3),
  ('Pontoon','watercraft',60,'navy',4),
  ('Bennington','watercraft',60,'navy',5);

-- Jet Skis 1-4
insert into units (type_id, label)
select id, g::text from equipment_types, generate_series(1,4) g where name = 'Jet Ski';

-- Kayak doble 1-6
insert into units (type_id, label)
select id, 'Doble ' || g from equipment_types, generate_series(1,6) g where name = 'Kayak doble';

-- Kayak individual 1-3
insert into units (type_id, label)
select id, 'Ind ' || g from equipment_types, generate_series(1,3) g where name = 'Kayak individual';

-- Pontoon + Bennington
insert into units (type_id, label) select id, 'Pontoon' from equipment_types where name = 'Pontoon';
insert into units (type_id, label) select id, 'Bennington' from equipment_types where name = 'Bennington';

-- Add-ons
insert into addons (name) values
  ('Towing'),('Paddleboard'),('Wakeboard'),('Chaleco'),('Remo'),('Dry bag'),('Hielera');
