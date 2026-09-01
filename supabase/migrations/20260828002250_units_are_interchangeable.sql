-- `tracking_mode` decide como se cuenta el inventario (por unidad o por
-- cantidad); esta columna decide algo distinto: si a Reservas le importa
-- CUAL unidad sale. Un jet ski se agenda por unidad hoy porque cada uno
-- lleva su propia historia de gasolina, horas y golpes -- pero nadie en el
-- muelle sabe, al momento de agendar, cual de los cuatro va a estar libre,
-- cargado y sin golpes dentro de tres horas. Esa decision es de operaciones,
-- en el momento del despacho, no de Reservas con tres horas de anticipacion.
--
-- La Bennington es la excepcion real: es la unica lancha que arrastra, y el
-- wakeboard y el tubing solo se piden con ella (`extra_compatibility` en
-- `supabase/seed.sql`). Ahi si importa cual sale, y Reservas sigue
-- eligiendo la unidad concreta.
--
-- Por default todas las categorias son intercambiables: la unica que no lo
-- es es la lancha, y esta migracion corre antes que `seed.sql` en local, asi
-- que es la semilla quien la deja en `false` desde que se crea.
alter table equipment_categories
  add column units_are_interchangeable boolean not null default true;

comment on column equipment_categories.units_are_interchangeable is
  'Si Reservas pide esta categoria por cantidad (verdadero, jet skis y cuadraciclos) o eligiendo la unidad concreta (falso, la lancha). Independiente de tracking_mode: una categoria por unidad puede ser intercambiable igual, y es operaciones quien asigna la unidad real al despachar.';

-- Sobre una base que ya tenga datos, deja la lancha como la excepcion.
-- En local no alcanza a nada: las migraciones corren antes de la semilla, y
-- es `seed.sql` quien crea la lancha ya con esta columna en falso.
update equipment_categories
   set units_are_interchangeable = false
 where name = 'Lancha';
