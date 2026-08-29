-- Arenal Ops — v5: boat add-ons (extras) scoped per lancha.
-- Safe to run multiple times. Supabase SQL Editor.

-- Which lancha each add-on applies to: '' = both lanchas, else a type name.
alter table addons add column if not exists applies_to text not null default '';

-- Paddleboards go on either lancha
update addons set applies_to = '', active = true where name = 'Paddleboard';

-- Bennington-only extras
update addons set applies_to = 'Bennington', active = true where name in ('Towing','Wakeboard');

-- Pontoon-only: parrilla
insert into addons (name, applies_to)
select 'Parrilla', 'Pontoon' where not exists (select 1 from addons where name = 'Parrilla');

-- Bennington: tubing
insert into addons (name, applies_to)
select 'Tubing', 'Bennington' where not exists (select 1 from addons where name = 'Tubing');

-- Old paddle-rental extras are not boat add-ons; hide them from the lancha picker
update addons set active = false where name in ('Chaleco','Remo','Dry bag','Hielera');
