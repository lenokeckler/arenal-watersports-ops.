-- La gasolina se leia como porcentaje del tanque, y ningun jet ski ni
-- lancha tiene un medidor que hable en porcentaje: tienen rayas fisicas en
-- el tablero, y en el muelle se lee "3 de 4", no "75%". El porcentaje
-- inventaba una precision que nadie puede leer del instrumento.
--
-- El maximo de rayas no es el mismo en toda la flota — una lancha puede
-- tener seis y un jet ski cuatro — asi que `fuel_max` vive por unidad, no
-- como una constante del sistema. `fuel_level` es la lectura de hoy, entre
-- 0 y ese maximo.
alter table equipment_units
  add column fuel_max integer not null default 4,
  add column fuel_level integer;

-- Dos restricciones separadas a proposito: una fija que el propio maximo
-- sea razonable, la otra ata la lectura a ese maximo. Juntas en una sola
-- confundirian cual de las dos fallo cuando el mensaje llega a pantalla.
--
-- La segunda es, ademas, la respuesta a "si fuel_max cambia, el nivel
-- guardado no puede quedar por encima": un CHECK sobre las dos columnas de
-- la misma fila se revisa en cualquier UPDATE que toque cualquiera de las
-- dos, asi que bajar el maximo por debajo de la lectura actual se rechaza
-- aqui, sin importar por que camino se intente. Mismo razonamiento que
-- `reservation_items_usage_never_goes_back`
-- (20260828001900_usage_readings_monotonic.sql): la garantia va en la base,
-- no en la pantalla que hoy la pide.
alter table equipment_units
  add constraint units_fuel_max_range check (fuel_max between 1 and 20),
  add constraint units_fuel_level_range
    check (fuel_level is null or (fuel_level >= 0 and fuel_level <= fuel_max));

comment on column equipment_units.fuel_max is
  'Cuantas rayas tiene el medidor de esta unidad -- el tope de fuel_level. Configurable por unidad: no todas las maquinas tienen el mismo tablero.';
comment on column equipment_units.fuel_level is
  'En cual raya esta el medidor hoy, entre 0 y fuel_max. Nulo es "sin lectura todavia", no "vacio".';

-- Convierte lo que hubiera en `current_fuel` a la escala de lineas de esta
-- misma fila. `fuel_max` recien se agrego con el default (4) en todas, asi
-- que la conversion usa ese mismo valor -- hoy no hay lecturas reales en
-- produccion, pero si las hubiera, esto las conserva en vez de tirarlas.
update equipment_units
   set fuel_level = round(current_fuel * fuel_max / 100)::integer
 where current_fuel is not null;

alter table equipment_units drop constraint units_fuel_range;
alter table equipment_units drop column current_fuel;

-- Mismo cambio del lado de la reserva: `fuel_out`/`fuel_in` pasan de
-- porcentaje a lineas, contra el `fuel_max` que la unidad tenia en ese
-- momento (la misma columna recien sembrada arriba). Sin unidad propia --
-- no deberia pasar, la gasolina siempre es de una unidad, pero la
-- conversion no asume que la base este limpia -- cae al default de la
-- flota.
--
-- `alter column ... type ... using` no acepta una subconsulta en la
-- expresion, asi que la conversion va en dos pasos: primero se reescribe el
-- valor en la propia columna numerica (el `update` si puede correlacionar
-- contra `equipment_units`), y solo despues se le cambia el tipo, donde el
-- `using` ya no necesita mirar otra tabla.
update reservation_items ri
   set fuel_out = round(
         ri.fuel_out * coalesce(
           (select eu.fuel_max from equipment_units eu where eu.id = ri.unit_id),
           4
         ) / 100
       )
 where ri.fuel_out is not null;

update reservation_items ri
   set fuel_in = round(
         ri.fuel_in * coalesce(
           (select eu.fuel_max from equipment_units eu where eu.id = ri.unit_id),
           4
         ) / 100
       )
 where ri.fuel_in is not null;

alter table reservation_items
  alter column fuel_out type integer using round(fuel_out)::integer,
  alter column fuel_in type integer using round(fuel_in)::integer;

comment on column reservation_items.fuel_out is
  'Con cuantas lineas salio la unidad, contra el fuel_max que tenia en ese momento.';
comment on column reservation_items.fuel_in is
  'Con cuantas lineas volvio la unidad. Sin restriccion de monotonia a proposito -- ver 20260828001900_usage_readings_monotonic.sql.';
