-- Un combo se arma para nacionales o para extranjeros, y el precio cambia
-- segun a quien se le vende: los nacionales pagan en colones y los
-- extranjeros en dolares. No son dos precios del mismo paquete sino dos
-- paquetes distintos, cada uno armado y cotizado en su propia seccion.
create type combo_audience as enum ('national', 'foreign');

alter table combos
  add column audience combo_audience;

-- Los combos que ya existen se clasifican por la moneda que tienen puesta,
-- que es exactamente la senal que distingue a un publico del otro.
update combos
   set audience = case
     when package_price_crc is not null then 'national'
     else 'foreign'
   end::combo_audience;

alter table combos
  alter column audience set not null;

comment on column combos.audience is
  'Para quien es el combo. Decide en que seccion aparece y en que moneda se cotiza: nacionales en colones, extranjeros en dolares.';

-- El mismo paquete puede existir para los dos publicos —"Jet Ski + Kayak 2
-- horas" se le vende a ambos, a distinto precio— asi que el nombre deja de
-- ser unico por si solo y pasa a serlo dentro de su seccion.
alter table combos drop constraint combos_name_key;
alter table combos
  add constraint combos_name_per_audience_key unique (name, audience);

-- El precio va en la moneda de su publico, y solo en esa. Sin esto un combo
-- de nacionales podria quedar cotizado en dolares, que es justo la mezcla
-- que estas dos secciones existen para evitar. Y exige que haya precio: un
-- combo sin precio no se puede vender, y armarlo con su precio es lo que se
-- hace en la seccion.
alter table combos
  add constraint combos_price_matches_audience
  check (
    (audience = 'national'
      and package_price_crc is not null
      and package_price_usd is null)
    or
    (audience = 'foreign'
      and package_price_usd is not null
      and package_price_crc is null)
  );
