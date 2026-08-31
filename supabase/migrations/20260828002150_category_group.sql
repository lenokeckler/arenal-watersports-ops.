-- Un kayak doble y un kayak individual son dos categorias de verdad: se
-- cuentan aparte, se cobran aparte y la reserva tiene que saber cual salio.
-- Pero para quien trabaja son "kayaks", y separarlas en el tablero llenaba
-- la pantalla de tarjetas donde deberia haber una, y obligaba a buscar dos
-- renglones distintos para un grupo que lleva dos dobles y tres
-- individuales.
--
-- `group_name` las junta solo para mostrarlas: una tarjeta "Kayak" en el
-- tablero con el total libre de las dos, y un solo bloque al reservar con
-- las dos cantidades juntas. Por dentro no cambia nada — el inventario, los
-- conteos y los items de la reserva siguen distinguiendo cual es cual — que
-- es justamente lo que se perderia fusionandolas de verdad.
--
-- Nulo significa "esta categoria se muestra sola", que es el caso de casi
-- todas.
alter table equipment_categories
  add column group_name text;

comment on column equipment_categories.group_name is
  'Nombre con el que varias categorias se muestran juntas en el tablero y al reservar. No las fusiona: cada una sigue siendo su propia categoria en el inventario y en la reserva.';

-- Sobre una base que ya tenga datos, deja los kayaks agrupados de una vez.
-- En local no alcanza a nada: las migraciones corren antes de la semilla, y
-- es `seed.sql` quien crea las categorias ya con su grupo.
update equipment_categories
   set group_name = 'Kayak'
 where name in ('Kayak doble', 'Kayak individual');

-- Agrupar solo tiene sentido entre categorias que se cuentan igual: mezclar
-- una por unidad con una por cantidad daria una tarjeta que no sabe sumar.
create function guard_group_tracking_mode() returns trigger
language plpgsql as $$
declare
  otro tracking_mode;
begin
  if new.group_name is null then
    return new;
  end if;

  select c.tracking_mode into otro
  from equipment_categories c
  where c.group_name = new.group_name
    and c.id <> new.id
  limit 1;

  if otro is not null and otro <> new.tracking_mode then
    raise exception 'Un grupo no mezcla categorias por unidad con categorias por cantidad';
  end if;

  return new;
end $$;

create trigger categories_guard_group_tracking_mode
  before insert or update on equipment_categories
  for each row execute function guard_group_tracking_mode();
