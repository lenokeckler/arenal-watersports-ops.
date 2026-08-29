-- Arenal Ops — v6: the "Paddleboard" boat extra consumes real paddleboard units.
-- Safe to run multiple times. Supabase SQL Editor.

-- When set, this add-on reserves N real units of that menu group (drops availability).
alter table addons add column if not exists consumes_type text not null default '';

update addons set consumes_type = 'Paddleboard' where name = 'Paddleboard';
