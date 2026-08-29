-- Cambiar la modalidad de una categoria que ya tiene registros dejaria
-- reservas viejas apuntando a una forma de inventario que ya no existe.
create function freeze_tracking_mode() returns trigger
language plpgsql as $$
begin
  if new.tracking_mode <> old.tracking_mode
     and (exists (select 1 from equipment_units where category_id = old.id)
          or exists (select 1 from equipment_stock where category_id = old.id))
  then
    raise exception 'La modalidad de una categoria con registros no se cambia';
  end if;
  return new;
end $$;

create trigger categories_freeze_tracking_mode
  before update on equipment_categories
  for each row execute function freeze_tracking_mode();

-- Que una fila caiga en la tabla equivocada es silencioso: nada la marca
-- como invalida, pero tampoco la cuenta nadie. category_availability() lee
-- equipment_stock y unit_conflicts() lee equipment_units, asi que una
-- unidad archivada bajo una categoria by_quantity (o un renglon de stock
-- bajo una by_unit) deja de ser vista por completo, sin que nada truene.
create function check_unit_category_mode() returns trigger
language plpgsql as $$
begin
  if (select tracking_mode from equipment_categories where id = new.category_id) <> 'by_unit' then
    raise exception 'Una categoria por cantidad no lleva unidades individuales';
  end if;
  return new;
end $$;

create trigger units_check_category_mode
  before insert or update on equipment_units
  for each row execute function check_unit_category_mode();

create function check_stock_category_mode() returns trigger
language plpgsql as $$
begin
  if (select tracking_mode from equipment_categories where id = new.category_id) <> 'by_quantity' then
    raise exception 'Una categoria identificada por unidad no lleva conteo de stock';
  end if;
  return new;
end $$;

create trigger stock_check_category_mode
  before insert or update on equipment_stock
  for each row execute function check_stock_category_mode();
