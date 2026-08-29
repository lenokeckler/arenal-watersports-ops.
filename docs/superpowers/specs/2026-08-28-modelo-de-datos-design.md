# Modelo de datos — Arenal Water Sports Operaciones

**Fecha:** 2026-08-28
**Estado:** aprobado en diseño, pendiente de implementación
**Alcance:** el esquema completo de Supabase que sostiene los cinco módulos y las 111 historias.

Este documento define el modelo de datos, sus restricciones, sus políticas de
seguridad y las funciones que calculan disponibilidad. No define pantallas: cada
módulo tendrá su propia spec y se apoyará en este esquema.

---

## 1. Principios que rigen el esquema

Salen de las reglas transversales del flujo del proyecto y no se negocian tabla
por tabla.

| Principio                      | Cómo se implementa                                                                           |
| ------------------------------ | -------------------------------------------------------------------------------------------- |
| Sin borrado físico             | Ninguna tabla operativa acepta `DELETE`. Se usa `status`, baja o cancelación                 |
| Lo calculado no se digita      | `ocupado` y la disponibilidad por franja son funciones y vistas, nunca columnas              |
| Trazabilidad en cada registro  | `created_by`, `updated_by`, `created_at`, `updated_at` por disparador desde `auth.uid()`     |
| El servidor es quien restringe | RLS en todas las tablas. Esconder un botón no es una restricción                             |
| Las monedas no se suman        | Toda cifra vive en su columna por moneda. No existe un campo "total"                         |
| Un solo inventario             | Jet skis, chalecos y extintores viven en el mismo registro. El tablero es un filtro sobre él |

### Convención de nombres

Identificadores en inglés, en `snake_case`, siguiendo `AGENTS.md`. Los textos que
ve el trabajador van en español y viven en la aplicación, no en la base.

### Orden de migración

El DDL de este documento está agrupado por tema para que se lea, no en el orden
en que se ejecuta. Hay dependencias cruzadas —`damage_reports` apunta a
`reservations`, y `reservation_items` apunta a `extras`— así que la migración
real va en este orden: tipos enumerados, `workers` y sus tablas, catálogo,
unidades y stock, extras y combos, tarifas, reservas y sus ítems, tablas de
dinero, tablas que dependen de reservas (daños, mantenimiento, conteos),
funciones, vistas, disparadores y por último las políticas.

---

## 2. Tipos enumerados

```sql
create type work_area          as enum ('administracion', 'reservas', 'operaciones');
create type worker_mark        as enum ('guia', 'encargado_general', 'registro_guias_externos');
create type worker_status      as enum ('active', 'blocked');

create type tracking_mode      as enum ('by_unit', 'by_quantity');
create type usage_metric       as enum ('engine_hours', 'kilometers');
create type category_status    as enum ('active', 'inactive');
create type unit_status        as enum ('available', 'in_maintenance', 'damaged',
                                        'in_repair', 'decommissioned');
create type photo_angle        as enum ('right_side', 'left_side', 'front', 'bottom');
create type damage_cause       as enum ('rollover', 'collision', 'machine_failure', 'other');

create type reservation_type   as enum ('rental', 'tour', 'combo');
create type reservation_status as enum ('scheduled', 'dispatched', 'closed', 'cancelled');

create type currency_code      as enum ('USD', 'CRC');
create type charge_kind        as enum ('tariff', 'extra_time');
create type deposit_status     as enum ('held', 'returned', 'retained', 'partially_retained');
```

`ocupado` **no aparece** en `unit_status`. Es el resultado de un despacho vivo, y
el documento lo dice de forma explícita: _"el estado ocupada lo calcula el
sistema a partir de los despachos, no se digita"_. Si fuera un valor guardado, un
cierre a medias dejaría un jet ski ocupado para siempre.

---

## 3. Identidad y acceso

### 3.1 Cómo se apoya en Supabase Auth

El ingreso es por **nombre de usuario**, nunca por correo, y no hay proveedores
externos. Supabase Auth trabaja con correo, así que cada cuenta se crea en
`auth.users` con un correo sintético `<username>@arenal.local` que el trabajador
nunca ve ni escribe. Al ingresar, el servidor traduce el usuario a ese correo y
llama a `signInWithPassword`.

Con eso Supabase sigue encargándose del hash de la contraseña, del token y del
refresco de sesión, y `auth.uid()` sirve de base para todas las políticas. Lo que
Supabase no trae —bloqueo por intentos, contraseña temporal de un solo uso, PIN
al correo personal, cuenta de administración que nunca se bloquea— vive en las
tablas de abajo y se resuelve en rutas de servidor con la llave de servicio.

### 3.2 `workers`

```sql
create table workers (
  id                   uuid primary key references auth.users (id) on delete restrict,
  username             text        not null unique,
  full_name            text        not null,
  personal_email       text,
  base_role            work_area   not null,
  is_external_guide    boolean     not null default false,
  national_id          text,
  expires_at           timestamptz,
  status               worker_status not null default 'active',
  failed_attempts      smallint    not null default 0,
  must_change_password boolean     not null default true,
  last_work_area       work_area,
  created_by           uuid references workers (id),
  updated_by           uuid references workers (id),
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),

  constraint workers_username_format
    check (username = lower(btrim(username)) and length(username) between 3 and 40),

  -- El guía externo se registra con nombre y cédula, y su caducidad es obligatoria.
  constraint workers_external_guide_shape
    check (
      not is_external_guide
      or (expires_at is not null and national_id is not null
          and base_role = 'operaciones')
    ),

  -- Solo la cuenta de administración exige correo personal, porque es su única
  -- salida cuando pierde la contraseña.
  constraint workers_admin_needs_email
    check (base_role <> 'administracion' or personal_email is not null)
);

-- El sistema tiene una sola cuenta de administración.
create unique index workers_single_admin on workers ((true))
  where base_role = 'administracion';

create index workers_status_idx      on workers (status);
create index workers_expires_at_idx  on workers (expires_at) where expires_at is not null;
```

La cuenta de administración no se puede bloquear ni borrar, y eso se garantiza en
la base y no en la aplicación:

```sql
create function guard_admin_account() returns trigger
language plpgsql as $$
begin
  if old.base_role = 'administracion' then
    if tg_op = 'DELETE' then
      raise exception 'La cuenta de administracion no se elimina';
    end if;
    if new.status = 'blocked' then
      raise exception 'La cuenta de administracion no se bloquea';
    end if;
    if new.base_role <> 'administracion' then
      raise exception 'La cuenta de administracion no cambia de rol';
    end if;
  end if;
  -- En un BEFORE DELETE, NEW es nulo y devolver nulo cancelaria el borrado.
  return case when tg_op = 'DELETE' then old else new end;
end $$;

create trigger workers_guard_admin
  before update or delete on workers
  for each row execute function guard_admin_account();
```

### 3.3 Áreas y marcas

Van como filas y no como columnas booleanas por dos razones. El documento dice
_"hoy son tres"_ marcas, lo que anticipa una cuarta: como filas, agregarla es
meter un dato y no una migración. Y cada fila guarda quién la otorgó y cuándo,
que es lo que pide trazabilidad.

```sql
create table worker_areas (
  worker_id  uuid      not null references workers (id) on delete restrict,
  area       work_area not null,
  granted_by uuid      not null references workers (id),
  granted_at timestamptz not null default now(),
  primary key (worker_id, area)
);

create table worker_marks (
  worker_id  uuid        not null references workers (id) on delete restrict,
  mark       worker_mark not null,
  granted_by uuid        not null references workers (id),
  granted_at timestamptz not null default now(),
  primary key (worker_id, mark)
);
```

El rol base también se guarda como fila en `worker_areas`, para que las consultas
de permiso tengan un solo lugar donde mirar:

```sql
create function seed_base_area() returns trigger
language plpgsql as $$
begin
  insert into worker_areas (worker_id, area, granted_by)
  values (new.id, new.base_role, coalesce(new.created_by, new.id))
  on conflict do nothing;
  return new;
end $$;

create trigger workers_seed_base_area
  after insert on workers
  for each row execute function seed_base_area();
```

### 3.4 Recuperación por PIN

```sql
create table password_reset_pins (
  id         uuid primary key default gen_random_uuid(),
  worker_id  uuid        not null references workers (id) on delete restrict,
  pin_hash   text        not null,
  expires_at timestamptz not null,
  used_at    timestamptz,
  created_at timestamptz not null default now()
);

create index password_reset_pins_lookup
  on password_reset_pins (worker_id, expires_at)
  where used_at is null;
```

El PIN se guarda hasheado, nunca en claro. Es de un solo uso —`used_at` lo
quema— y vence a los pocos minutos. Al completar la recuperación de la cuenta de
administración, `failed_attempts` vuelve a cero, que es lo que la desatasca sin
depender de nadie.

### 3.5 Funciones de permiso

Todas las políticas se apoyan en estas tres. Son `security definer` para que
puedan leer `worker_areas` sin caer en la recursión de su propia política, y
`stable` para que el planificador las evalúe una vez por consulta.

```sql
create function has_area(target work_area) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from worker_areas wa
    join workers w on w.id = wa.worker_id
    where wa.worker_id = auth.uid()
      and wa.area = target
      and w.status = 'active'
      and (w.expires_at is null or w.expires_at > now())
  );
$$;

create function has_mark(target worker_mark) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from worker_marks wm
    join workers w on w.id = wm.worker_id
    where wm.worker_id = auth.uid()
      and wm.mark = target
      and w.status = 'active'
      and (w.expires_at is null or w.expires_at > now())
  );
$$;

create function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select has_area('administracion');
$$;
```

Las tres verifican de paso que la cuenta esté activa y no vencida. Por eso una
cuenta de guía externo caducada deja de poder hacer cualquier cosa el mismo
instante en que pasa su fecha, sin que nadie tenga que correr un proceso.

---

## 4. Catálogo e inventario

### 4.1 `equipment_categories`

```sql
create table equipment_categories (
  id                       uuid primary key default gen_random_uuid(),
  name                     text not null unique,
  status                   category_status not null default 'active',

  tracking_mode            tracking_mode not null,
  is_reservable            boolean not null default false,

  has_motor                boolean not null default false,
  usage_metric             usage_metric,
  consumes_fuel            boolean not null default false,
  can_be_damaged           boolean not null default true,
  has_condition_photos     boolean not null default false,
  guide_only               boolean not null default false,
  default_duration_minutes integer,

  deposit_usd              numeric(12,2),
  deposit_crc              numeric(14,2),

  alert_min_quantity       integer,
  alert_expiry_days        integer,

  created_by uuid not null references workers (id),
  updated_by uuid not null references workers (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint categories_motor_needs_metric
    check (not has_motor or usage_metric is not null),
  constraint categories_metric_needs_motor
    check (usage_metric is null or has_motor),

  -- Las fotos por ángulo y el conteo de golpes son de una pieza concreta.
  constraint categories_photos_need_units
    check (not has_condition_photos or tracking_mode = 'by_unit'),

  -- Lo que se cuenta no se agenda con hora de regreso propia por unidad,
  -- pero sí puede reservarse por cantidad: kayaks, tablas.
  constraint categories_reservable_needs_duration
    check (not is_reservable or default_duration_minutes is not null),

  constraint categories_alert_quantity_positive
    check (alert_min_quantity is null or alert_min_quantity > 0),
  constraint categories_alert_expiry_positive
    check (alert_expiry_days is null or alert_expiry_days > 0)
);
```

**`tracking_mode` es la decisión híbrida.** El criterio no es si la categoría es
reservable, sino si hace falta conocer la historia de esa pieza en particular:

|           | `by_unit`                                                                                                      | `by_quantity`                                                                 |
| --------- | -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Qué entra | Jet ski, lancha, cuadraciclo                                                                                   | Kayak, paddleboard, tabla, chaleco, remo, extintor                            |
| Por qué   | Gasolina, horas o kilometraje, golpes, fotos, mantenimiento, y el depósito se retiene según cuál volvió dañada | Nada de eso aplica. Si uno se raja, se marca uno como dañado y baja el conteo |
| Ficha     | Una por unidad, con código                                                                                     | Una fila de conteo por categoría                                              |

Ese modo **no cambia una vez que la categoría tiene registros**, porque cambiarlo
rompería las reservas viejas:

```sql
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
```

Una categoría que nunca tuvo registros se elimina; una que sí, pasa a
`inactive`. El mismo disparador de arriba cubre la mitad, y la restricción de
llave foránea `on delete restrict` cubre la otra.

### 4.2 `equipment_units` y `equipment_stock`

```sql
create table equipment_units (
  id                  uuid primary key default gen_random_uuid(),
  category_id         uuid not null references equipment_categories (id) on delete restrict,
  code                text not null unique,          -- único en toda la empresa
  status              unit_status not null default 'available',

  current_fuel        numeric(5,2),                  -- porcentaje de tanque
  usage_total         numeric(12,2) not null default 0,
  next_oil_change_at  numeric(12,2),
  impact_count        integer not null default 0,

  decommissioned_at   timestamptz,
  decommission_reason text,

  created_by uuid not null references workers (id),
  updated_by uuid not null references workers (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint units_decommission_shape
    check ((status = 'decommissioned') = (decommissioned_at is not null)),
  constraint units_decommission_needs_reason
    check (decommissioned_at is null or decommission_reason is not null),
  constraint units_impact_count_positive check (impact_count >= 0)
);

create index units_category_status_idx on equipment_units (category_id, status);

create table equipment_stock (
  category_id        uuid primary key references equipment_categories (id) on delete restrict,
  quantity_available integer not null default 0 check (quantity_available >= 0),
  quantity_damaged   integer not null default 0 check (quantity_damaged   >= 0),
  quantity_in_repair integer not null default 0 check (quantity_in_repair >= 0),
  expiry_date        date,
  updated_by uuid not null references workers (id),
  updated_at timestamptz not null default now()
);
```

Una unidad dada de baja _"desaparece del inventario, del tablero y de todo lo que
se pueda agendar"_ pero conserva sus reportes y su mantenimiento. Por eso la baja
es un estado y las llaves foráneas son `restrict`: el registro sigue ahí para que
las reservas viejas cuadren.

El historial de conteos guarda de cuánto a cuánto se movió cada cantidad:

```sql
create table equipment_stock_movements (
  id           uuid primary key default gen_random_uuid(),
  category_id  uuid not null references equipment_categories (id) on delete restrict,
  from_available integer not null,  to_available integer not null,
  from_damaged   integer not null,  to_damaged   integer not null,
  from_in_repair integer not null,  to_in_repair integer not null,
  reason       text not null,
  created_by   uuid not null references workers (id),
  created_at   timestamptz not null default now()
);
```

### 4.3 Fotos, daños y mantenimiento

```sql
create table unit_condition_photos (
  id           uuid primary key default gen_random_uuid(),
  unit_id      uuid not null references equipment_units (id) on delete restrict,
  angle        photo_angle not null,
  storage_path text not null,
  uploaded_by  uuid not null references workers (id),
  uploaded_at  timestamptz not null default now(),
  unique (unit_id, angle)
);
```

La unicidad por `(unit_id, angle)` es la que implementa _"se reemplazan cuando
cambia el estado"_: subir la del costado derecho pisa la anterior. Es también lo
que evita que el espacio crezca sin control, que fue la razón de descartar una
foto por salida.

```sql
create table damage_reports (
  id             uuid primary key default gen_random_uuid(),
  unit_id        uuid not null references equipment_units (id) on delete restrict,
  reservation_id uuid references reservations (id),
  cause          damage_cause not null,
  description    text not null,
  impact_delta   integer not null default 0 check (impact_delta >= 0),
  created_by     uuid not null references workers (id),
  created_at     timestamptz not null default now()
);

create table maintenance_records (
  id            uuid primary key default gen_random_uuid(),
  unit_id       uuid not null references equipment_units (id) on delete restrict,
  work_type     text not null,
  description   text,
  is_external   boolean not null,
  cost_amount   numeric(12,2),
  cost_currency currency_code,
  performed_at  date not null,
  created_by    uuid not null references workers (id),
  created_at    timestamptz not null default now(),
  updated_by    uuid references workers (id),
  updated_at    timestamptz not null default now(),

  -- El costo es independiente de quien hizo el trabajo. El personal no cobra
  -- mano de obra porque ya se le paga el salario, pero una defensa nueva o una
  -- pieza de repuesto si cuestan aunque las instale operaciones.
  constraint maintenance_cost_is_complete
    check ((cost_amount is null) = (cost_currency is null)),
  constraint maintenance_cost_positive
    check (cost_amount is null or cost_amount > 0)
);
```

Todo trabajo se registra, lo haga el personal o un taller. `is_external` dice
**quién** lo hizo y `cost_amount` dice **cuánto costó**, y son dos cosas
independientes: montar una defensa nueva la hace operaciones y no se paga mano de
obra, pero la defensa se compró y ese monto es gasto real de esa máquina.

El reporte _"cuánto se ha gastado en mantener cada máquina"_ suma todos los
costos registrados, sin importar quién ejecutó el trabajo. `is_external` sirve
para desglosar cuánto se va en talleres frente a cuánto en repuestos.

### 4.4 Conteos de inventario

```sql
create table inventory_counts (
  id         uuid primary key default gen_random_uuid(),
  counted_at timestamptz not null default now(),
  notes      text,
  created_by uuid not null references workers (id),
  created_at timestamptz not null default now()
);

create table inventory_count_lines (
  id          uuid primary key default gen_random_uuid(),
  count_id    uuid not null references inventory_counts (id) on delete cascade,
  category_id uuid not null references equipment_categories (id) on delete restrict,

  unit_id            uuid references equipment_units (id),   -- categorías by_unit
  confirmed_status   unit_status,

  quantity_available integer,                                -- categorías by_quantity
  quantity_damaged   integer,
  quantity_in_repair integer,

  constraint count_line_is_one_shape
    check (
      (unit_id is not null and confirmed_status is not null
        and quantity_available is null and quantity_damaged is null
        and quantity_in_repair is null)
      or
      (unit_id is null and confirmed_status is null
        and quantity_available is not null and quantity_damaged is not null
        and quantity_in_repair is not null)
    )
);
```

`on delete cascade` en las líneas es la única excepción a la regla de no borrar:
son hijas de un conteo y no tienen vida propia. El conteo en sí nunca se borra.

---

## 5. Reservas

### 5.1 `reservations`

```sql
create table reservations (
  id                    uuid primary key default gen_random_uuid(),
  code                  text not null unique,          -- legible: R-000482
  customer_name         text not null,
  people_count          integer not null check (people_count > 0),

  type                  reservation_type not null,
  combo_id              uuid references combos (id),

  starts_at             timestamptz not null,
  duration_minutes      integer not null check (duration_minutes > 0),
  -- timestamptz + interval es STABLE, no IMMUTABLE, y Postgres rechaza una
  -- expresion no inmutable en una columna generada. Pasar por UTC en ambos
  -- lados si es inmutable y da el mismo instante.
  ends_at               timestamptz generated always as
                          ((starts_at at time zone 'UTC'
                              + make_interval(mins => duration_minutes)) at time zone 'UTC') stored,

  status                reservation_status not null default 'scheduled',
  parent_reservation_id uuid references reservations (id),

  cancellation_reason   text,
  dispatched_at         timestamptz,
  closed_at             timestamptz,
  extra_time_minutes    integer not null default 0,

  list_amount_usd       numeric(12,2),
  list_amount_crc       numeric(14,2),
  agreed_amount_usd     numeric(12,2),
  agreed_amount_crc     numeric(14,2),

  created_by uuid not null references workers (id),
  updated_by uuid not null references workers (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint reservations_cancel_needs_reason
    check (status <> 'cancelled' or cancellation_reason is not null),
  constraint reservations_combo_shape
    check (combo_id is null or type = 'combo'),
  constraint reservations_not_own_parent
    check (parent_reservation_id is distinct from id)
);

create sequence reservation_code_seq;

create function next_reservation_code() returns text
language sql volatile as $$
  select 'R-' || lpad(nextval('reservation_code_seq')::text, 6, '0');
$$;

alter table reservations alter column code set default next_reservation_code();

create index reservations_window_idx on reservations (starts_at, ends_at)
  where status in ('scheduled', 'dispatched');
create index reservations_status_idx on reservations (status, starts_at);
```

**Los cuatro estados y nada más.** Posponer no agrega uno: mueve `starts_at` y
devuelve la reserva a `scheduled`, dejando el rastro en la firma de modificación.
Partirla crea una hija con `parent_reservation_id`, y esa hija nace sin cobro
propio porque _"el cobro no se parte"_.

`ends_at` es columna generada. Así ninguna consulta de disponibilidad tiene que
recalcularla y ningún camino de escritura puede dejarla inconsistente.

### 5.2 `reservation_items`

```sql
create table reservation_items (
  id             uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references reservations (id) on delete restrict,

  unit_id        uuid references equipment_units (id),
  category_id    uuid references equipment_categories (id),
  quantity       integer check (quantity > 0),

  extra_id       uuid references extras (id),

  fuel_out       numeric(5,2),
  usage_out      numeric(12,2),
  fuel_in        numeric(5,2),
  usage_in       numeric(12,2),

  created_by uuid not null references workers (id),
  updated_by uuid not null references workers (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- El híbrido, expresado como restricción: o una unidad concreta,
  -- o una categoría con cantidad. Nunca las dos, nunca ninguna.
  constraint item_is_unit_or_quantity
    check (
      (unit_id is not null and category_id is null and quantity is null)
      or
      (unit_id is null and category_id is not null and quantity is not null)
    )
);

create index items_unit_idx        on reservation_items (unit_id) where unit_id is not null;
create index items_category_idx    on reservation_items (category_id) where category_id is not null;
create index items_reservation_idx on reservation_items (reservation_id);
```

Una misma tabla sirve para el equipo agendado y para los extras que ocupan equipo
real, porque _"un extra reservable se compromete por franja igual que cualquier
otra unidad"_. `extra_id` solo dice de dónde vino.

### 5.3 Guías

```sql
create table reservation_guides (
  reservation_id uuid not null references reservations (id) on delete restrict,
  worker_id      uuid not null references workers (id) on delete restrict,
  assigned_by    uuid not null references workers (id),
  assigned_at    timestamptz not null default now(),
  primary key (reservation_id, worker_id)
);
```

No hay máximo de guías porque no hay máximo de personas por tour: se llena hasta
que se agota el equipo. Al asignar solo se listan trabajadores con la marca
`guia`, y eso se valida también en la política de escritura.

### 5.4 Extras, combos y tarifas

```sql
create table extras (
  id              uuid primary key default gen_random_uuid(),
  name            text not null unique,
  status          category_status not null default 'active',
  price_usd       numeric(12,2),
  price_crc       numeric(14,2),

  -- Los extras que ocupan equipo real descuentan disponibilidad.
  -- Los que son solo un cobro adicional, no.
  occupies_category_id uuid references equipment_categories (id),
  occupies_quantity    integer check (occupies_quantity > 0),

  created_by uuid not null references workers (id),
  updated_by uuid not null references workers (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint extras_occupies_shape
    check ((occupies_category_id is null) = (occupies_quantity is null))
);

-- La compatibilidad es por unidad y no por categoría: el pontoon lleva
-- paddleboard y parrilla, la otra lancha va para wakeboard.
create table extra_compatibility (
  extra_id uuid not null references extras (id) on delete restrict,
  unit_id  uuid not null references equipment_units (id) on delete restrict,
  primary key (extra_id, unit_id)
);

create table combos (
  id                uuid primary key default gen_random_uuid(),
  name              text not null unique,
  status            category_status not null default 'active',
  package_price_usd numeric(12,2),
  package_price_crc numeric(14,2),
  created_by uuid not null references workers (id),
  updated_by uuid not null references workers (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table combo_items (
  combo_id    uuid not null references combos (id) on delete restrict,
  category_id uuid not null references equipment_categories (id) on delete restrict,
  quantity    integer not null check (quantity > 0),
  primary key (combo_id, category_id)
);

create table tariffs (
  id          uuid primary key default gen_random_uuid(),
  category_id uuid not null references equipment_categories (id) on delete restrict,
  type        reservation_type not null,
  amount_usd  numeric(12,2),
  amount_crc  numeric(14,2),
  created_by uuid not null references workers (id),
  updated_by uuid not null references workers (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (category_id, type),
  constraint tariffs_has_some_price
    check (amount_usd is not null or amount_crc is not null),
  constraint tariffs_not_for_combo check (type <> 'combo')
);
```

**Las tarifas se editan en su lugar y no llevan versiones.** El requisito es que
_"las reservas ya cobradas conservan el monto con el que se cobraron"_, y eso ya
lo cumple `reservations.agreed_amount_*`, que es una fotografía. Un histórico de
tarifas no agregaría nada y complicaría cada consulta con una condición de
vigencia.

El combo predefinido se vende con su precio de paquete. El combo a la medida
tiene `combo_id` nulo, y el sistema propone la suma de las tarifas individuales
como `list_amount_*`, que reservas ajusta en `agreed_amount_*`.

---

## 6. Dinero

```sql
create table reservation_charges (
  id             uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references reservations (id) on delete restrict,
  kind           charge_kind not null,
  amount         numeric(14,2) not null check (amount > 0),
  currency       currency_code not null,
  payment_method text not null,
  created_by     uuid not null references workers (id),
  created_at     timestamptz not null default now()
);

create table refunds (
  id             uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references reservations (id) on delete restrict,
  percentage     numeric(5,2) not null check (percentage > 0 and percentage <= 100),
  amount         numeric(14,2) not null check (amount > 0),
  currency       currency_code not null,
  reason         text not null,
  created_by     uuid not null references workers (id),
  created_at     timestamptz not null default now()
);

create table deposits (
  id               uuid primary key default gen_random_uuid(),
  reservation_id   uuid not null references reservations (id) on delete restrict,
  amount           numeric(14,2) not null check (amount > 0),
  currency         currency_code not null,
  status           deposit_status not null default 'held',
  retained_amount  numeric(14,2),
  retention_reason text,
  resolved_by      uuid references workers (id),
  resolved_at      timestamptz,
  created_by       uuid not null references workers (id),
  created_at       timestamptz not null default now(),

  constraint deposits_resolution_shape
    check (
      (status = 'held' and resolved_at is null and retained_amount is null)
      or
      (status <> 'held' and resolved_at is not null and resolved_by is not null)
    ),
  constraint deposits_retention_needs_reason
    check (status not in ('retained', 'partially_retained')
           or (retained_amount is not null and retention_reason is not null)),
  constraint deposits_retained_within_amount
    check (retained_amount is null or retained_amount <= amount)
);

create index deposits_pending_idx on deposits (created_at) where status = 'held';

-- Un deposito pasa de 'held' a uno de los tres estados finales y ahi se queda.
-- Nunca vuelve a quedar abierto ni cambia de resolucion.
create function freeze_resolved_deposit() returns trigger
language plpgsql as $$
begin
  if old.status <> 'held' and new.status is distinct from old.status then
    raise exception 'Un deposito ya resuelto no cambia de estado';
  end if;
  return new;
end $$;

create trigger deposits_freeze_resolution
  before update on deposits
  for each row execute function freeze_resolved_deposit();
```

`status = 'held'` **es** la lista de pendientes de resolver. No hace falta otra
tabla ni una bandera aparte, y el índice parcial hace que esa consulta sea
inmediata sin importar cuántos depósitos históricos haya.

Cada movimiento guarda su moneda y ninguna consulta las suma. Un reporte de
ingresos del día devuelve siempre dos cifras.

---

## 7. Lo que se calcula

### 7.1 Estado efectivo de una unidad

```sql
create view unit_current_state as
select
  u.id,
  u.code,
  u.category_id,
  u.status as recorded_status,
  case
    when u.status <> 'available' then u.status::text
    when active_trip.reservation_id is not null then 'occupied'
    else 'available'
  end as effective_status,
  active_trip.reservation_id,
  active_trip.returns_at
from equipment_units u
left join lateral (
  select r.id as reservation_id, r.ends_at as returns_at
  from reservation_items ri
  join reservations r on r.id = ri.reservation_id
  where ri.unit_id = u.id
    and r.status = 'dispatched'
  order by r.ends_at
  limit 1
) active_trip on true;
```

De aquí sale la tarjeta del tablero: la hora a la que regresa, a qué reserva
pertenece y desde dónde se abre su detalle.

### 7.2 Disponibilidad por franja

La pregunta del documento no es por el instante actual sino por una franja: _"si
un kayak está libre el sábado de diez a doce"_.

```sql
-- Categorías by_unit: devuelve las reservas con las que choca esa unidad.
create function unit_conflicts(
  p_unit_id    uuid,
  p_starts_at  timestamptz,
  p_ends_at    timestamptz,
  p_exclude_reservation uuid default null
) returns table (reservation_id uuid, code text, starts_at timestamptz, ends_at timestamptz)
language sql stable as $$
  select r.id, r.code, r.starts_at, r.ends_at
  from reservation_items ri
  join reservations r on r.id = ri.reservation_id
  where ri.unit_id = p_unit_id
    and r.status in ('scheduled', 'dispatched')
    and r.id is distinct from p_exclude_reservation
    and tstzrange(r.starts_at, r.ends_at, '[)')
        && tstzrange(p_starts_at, p_ends_at, '[)');
$$;

-- Categorías by_quantity: cuántos hay libres en esa franja.
create function category_availability(
  p_category_id uuid,
  p_starts_at   timestamptz,
  p_ends_at     timestamptz,
  p_exclude_reservation uuid default null
) returns table (usable integer, committed integer, free integer)
language sql stable as $$
  with stock as (
    -- Solo lo disponible cuenta: lo dañado y lo que está en reparación no se ofrece.
    select quantity_available as usable from equipment_stock where category_id = p_category_id
  ),
  taken as (
    select coalesce(sum(ri.quantity), 0)::integer as committed
    from reservation_items ri
    join reservations r on r.id = ri.reservation_id
    where ri.category_id = p_category_id
      and r.status in ('scheduled', 'dispatched')
      and r.id is distinct from p_exclude_reservation
      and tstzrange(r.starts_at, r.ends_at, '[)')
          && tstzrange(p_starts_at, p_ends_at, '[)')
  )
  select stock.usable, taken.committed, stock.usable - taken.committed
  from stock, taken;
$$;
```

Las dos **informan, no bloquean**. La advertencia por choque avisa con cuál
reserva choca y deja seguir, porque así se decidió: _"hay días en que la
operación se acomoda sobre la marcha y un bloqueo estorbaría más de lo que
ayuda"_. Lo que sí se impide es ofrecer equipo en mantenimiento o dado de baja,
y eso es un filtro sobre `unit_current_state`, no una advertencia.

### 7.3 Trazabilidad automática

```sql
create function stamp_audit_fields() returns trigger
language plpgsql as $$
begin
  if tg_op = 'INSERT' then
    new.created_by := coalesce(new.created_by, auth.uid());
    new.created_at := now();
  end if;
  new.updated_by := auth.uid();
  new.updated_at := now();
  return new;
end $$;
```

Se aplica a toda tabla operativa. La firma la pone la base desde `auth.uid()` y
no la aplicación, así no se puede olvidar en un camino de escritura ni
falsificar desde el cliente.

---

## 8. Políticas de seguridad

RLS activo en **todas** las tablas, sin excepción. El patrón general:

| Grupo de tablas                                       | Lectura                                                          | Escritura                                                                                         |
| ----------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `workers`, `worker_areas`, `worker_marks`             | La propia fila, o cualquiera si `is_admin()`                     | `is_admin()`. Excepción: reservas con marca `registro_guias_externos` inserta guías externos      |
| Catálogo, tarifas, extras, combos                     | Cualquier trabajador activo, operaciones incluida                | `is_admin()`                                                                                      |
| Unidades, stock, fotos, daños, mantenimiento, conteos | Cualquier trabajador activo                                      | `has_area('operaciones')` o `is_admin()`. Las fotos exigen además `has_mark('encargado_general')` |
| Reservas, ítems, guías                                | `has_area('reservas')`, `has_area('operaciones')` o `is_admin()` | Crear y modificar: `has_area('reservas')`. Despachar y cerrar: `has_area('operaciones')`          |
| Cobros, devoluciones, depósitos                       | `has_area('reservas')` o `is_admin()` — operaciones nunca        | `has_area('reservas')`                                                                            |

**La línea está entre el precio de lista y el movimiento de dinero**, y no entre
"dinero sí" y "dinero no".

Operaciones **sí ve precios**: las tarifas, los precios de los extras y el precio
de paquete de los combos. La razón es de operación, no de sistema — la persona
que está en el muelle se topa con gente que baja al lago y pregunta cuánto vale
una hora de jet ski, y hoy tiene que subir a preguntar. Es información de
catálogo, la misma que está en la lista de precios pegada en la oficina.

Operaciones **no ve movimientos de dinero**: ni cobros, ni devoluciones, ni
depósitos. Ahí sí entra plata de un cliente concreto y operaciones no la recibe
ni la resuelve.

Eso no se implementa escondiendo una pantalla: se implementa no dándole `SELECT`
sobre `reservation_charges`, `refunds` ni `deposits`. Aunque alguien llame la API
directamente, la base devuelve vacío.

> **Nota de alcance.** La pantalla de consulta de precios para operaciones **no
> está en las 111 historias**: sale de una decisión tomada durante este diseño.
> El esquema ya la soporta sin cambios, pero la historia hay que agregarla al
> backlog antes de construirla. Queda anotada como `US-TAB-010 — Consulta de
precios desde operaciones`, en el módulo Tablero y Navegación.

Ejemplo del caso más delicado, la creación de guías externos por parte de
reservas:

```sql
create policy workers_insert_external_guide on workers
  for insert to authenticated
  with check (
    is_admin()
    or (
      has_area('reservas')
      and has_mark('registro_guias_externos')
      and is_external_guide
      and base_role = 'operaciones'
      and expires_at is not null
    )
  );
```

Sin la marca, la política rechaza el `INSERT` aunque la opción se fuerce por otro
camino. Y aun con la marca, reservas **solo** puede crear ese tipo de cuenta: no
trabajadores de planta, no administración, no cambios de rol.

---

## 9. Tiempo real y retención

**Tiempo real.** Publicación de Supabase sobre `reservations`,
`reservation_items`, `equipment_units` y `equipment_stock`. Es lo que hace que el
tablero se actualice en todos los dispositivos cuando un compañero despacha,
sin refrescar la pantalla.

**Retención.** Cinco años de historial de reservas y un año de conteos de
inventario, con `pg_cron`. Si el plan de veinticinco dólares no alcanza para ese
volumen, el de reservas baja a dos años cambiando un parámetro y no el esquema.

Esta es **la única excepción a la regla de no borrar**, y es deliberada: el
principio de no borrado protege el historial mientras es útil, y la retención
define hasta cuándo lo es. Para que la excepción no se cuele por otro lado, el
borrado por retención corre con un rol propio y no con el de la aplicación, que
sigue sin permiso de `DELETE` sobre ninguna tabla.

**Paginación.** Obligatoria en todos los listados y resuelta en el servidor. Los
índices de `reservations (status, starts_at)` y `equipment_units (category_id,
status)` son los que la sostienen.

---

## 10. Cobertura de las historias

| Módulo                   | Qué del esquema lo sostiene                                                                                                                                  |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Acceso y Sesión (11)     | `workers`, `worker_areas`, `worker_marks`, `password_reset_pins`, correo sintético en `auth.users`, índice de administración única                           |
| Tablero y Navegación (9) | `unit_current_state`, `category_availability`, publicación de tiempo real, índices de paginación                                                             |
| Administración (31)      | `equipment_categories`, `equipment_units`, `equipment_stock`, `extras`, `combos`, `tariffs`, y sobre `workers` el alta, bloqueo, desbloqueo y caducidad      |
| Reservas (33)            | `reservations`, `reservation_items`, `reservation_guides`, `reservation_charges`, `refunds`, `deposits`, `unit_conflicts`                                    |
| Operaciones (27)         | Estados de `reservations`, `fuel_out`/`usage_out`/`fuel_in`/`usage_in`, `damage_reports`, `maintenance_records`, `unit_condition_photos`, `inventory_counts` |

## 11. Decisiones tomadas en este diseño

Las que el documento no cerraba y quedan fijadas aquí:

1. **Autenticación con correo sintético** `<username>@arenal.local` sobre Supabase Auth, en vez de autenticación propia. Se conserva el manejo de contraseñas y sesiones de Supabase; lo que él no trae vive en tablas nuestras.
2. **`tracking_mode` híbrido por categoría.** El criterio es si hace falta la historia de la pieza, no si la categoría es reservable. Corrige la única línea del documento que se contradecía con su propia lista.
3. **Compatibilidad de extras por unidad**, no por categoría, porque las dos lanchas no admiten lo mismo.
4. **Costo de mantenimiento independiente de quién hizo el trabajo.** Se registra todo trabajo, y el costo va aparte: una pieza comprada cuesta aunque la instale el personal.
5. **Tarifas sin versionado histórico**, porque la reserva guarda su propia fotografía del monto acordado.
6. **`ocupado` como vista y no como columna**, y la disponibilidad como función y no como tabla.
7. **Operaciones ve precios pero no movimientos de dinero.** Las tarifas y los precios de extras y combos son catálogo y los lee cualquier trabajador; los cobros, las devoluciones y los depósitos son de reservas y administración.
8. **Un depósito resuelto no se reabre.** Pasa de `held` a uno de los tres estados finales y ahí se queda, garantizado por disparador.
