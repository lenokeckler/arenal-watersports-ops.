# Modelo de datos — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dejar el esquema completo de Supabase en migraciones versionadas, probado con pgTAP, con sus tipos de TypeScript generados y el inventario real cargado.

**Architecture:** Migraciones incrementales del CLI de Supabase, una por área del esquema, en orden de dependencia. Cada migración va con pruebas pgTAP que corren contra una base local en Docker. Las restricciones y las políticas viven en la base, no en la aplicación, así que las pruebas atacan la base directamente. Al final se generan los tipos de TypeScript desde el esquema real y se envuelven en la capa de servicios que ya existe.

**Tech Stack:** Supabase CLI · PostgreSQL 15 · pgTAP · Vitest · TypeScript

**Spec:** `docs/superpowers/specs/2026-08-28-modelo-de-datos-design.md`

## Global Constraints

Copiadas de la spec. Aplican a **toda** tarea de este plan.

- **Identificadores en inglés**, en `snake_case`. Los textos que ve el trabajador van en español y viven en la aplicación, no en la base.
- **Ninguna tabla operativa acepta `DELETE`.** Se usa `status`, baja o cancelación. Única excepción: la limpieza por retención, que corre con un rol propio.
- **`ocupado` no se guarda.** Es una vista. La disponibilidad por franja es una función.
- **La firma de trazabilidad la pone la base** desde `auth.uid()`, nunca la aplicación: `created_by`, `updated_by`, `created_at`, `updated_at`.
- **RLS activo en todas las tablas, sin excepción.**
- **Las monedas nunca se suman.** Cada cifra en su columna por moneda. No existe un campo "total".
- **Un solo inventario.** El tablero es un filtro sobre él, no un registro aparte.
- Cada migración se nombra `supabase/migrations/<timestamp>_<area>.sql` y **nunca se edita después de aplicarse**: un cambio es una migración nueva.
- Los mensajes de commit van en inglés.

---

## Estructura de archivos

| Archivo                                          | Responsabilidad                                        |
| ------------------------------------------------ | ------------------------------------------------------ |
| `supabase/config.toml`                           | Configuración del proyecto local                       |
| `supabase/migrations/*_foundations.sql`          | Tipos enumerados y `workers`                           |
| `supabase/migrations/*_identity_access.sql`      | Áreas, marcas, PIN, funciones de permiso               |
| `supabase/migrations/*_catalog.sql`              | `equipment_categories`                                 |
| `supabase/migrations/*_inventory.sql`            | Unidades, stock y movimientos                          |
| `supabase/migrations/*_offerings.sql`            | Extras, compatibilidad, combos, tarifas                |
| `supabase/migrations/*_reservations.sql`         | Reservas, ítems y guías                                |
| `supabase/migrations/*_money.sql`                | Cobros, devoluciones, depósitos                        |
| `supabase/migrations/*_unit_history.sql`         | Daños, mantenimiento, fotos, conteos                   |
| `supabase/migrations/*_availability.sql`         | Vista de estado efectivo y funciones de disponibilidad |
| `supabase/migrations/*_audit.sql`                | Disparador de firma sobre todas las tablas operativas  |
| `supabase/migrations/*_rls_identity_catalog.sql` | Políticas de identidad, catálogo e inventario          |
| `supabase/migrations/*_rls_operations_money.sql` | Políticas de reservas, operación y dinero              |
| `supabase/migrations/*_realtime_retention.sql`   | Publicación de tiempo real y limpieza por retención    |
| `supabase/tests/*.sql`                           | Pruebas pgTAP, una por migración                       |
| `supabase/seed.sql`                              | Inventario real de la empresa                          |
| `app/types/database.types.ts`                    | Tipos generados desde el esquema                       |
| `app/services/supabase/*.ts`                     | Clientes tipados (ya existen, se tipan aquí)           |

---

## Task 1: Supabase local y pgTAP

**Files:**

- Create: `supabase/config.toml` (lo genera el CLI)
- Create: `supabase/tests/000_setup.test.sql`
- Modify: `package.json`
- Modify: `.gitignore`

**Interfaces:**

- Consumes: nada.
- Produces: los comandos `npm run db:start`, `db:stop`, `db:reset`, `db:test`, `db:types`, que todas las tareas siguientes usan.

- [ ] **Step 1: Inicializar el proyecto local**

```bash
npx supabase init
```

Responder `n` cuando pregunte por los ajustes de VS Code y de Deno: el proyecto ya tiene su configuración.

- [ ] **Step 2: Agregar los guiones a `package.json`**

Dentro de `"scripts"`, junto a los que ya existen:

```json
"db:start": "supabase start",
"db:stop": "supabase stop",
"db:reset": "supabase db reset",
"db:test": "supabase test db",
"db:types": "supabase gen types typescript --local > app/types/database.types.ts"
```

Y en `"devDependencies"`:

```json
"supabase": "^2.116.0"
```

Luego:

```bash
npm install
```

- [ ] **Step 3: Ignorar lo que el CLI genera**

Agregar al final de `.gitignore`:

```gitignore
# Supabase local
supabase/.branches
supabase/.temp
```

`supabase/config.toml`, las migraciones, las pruebas y el seed **sí** se versionan.

- [ ] **Step 4: Levantar la base local**

```bash
npm run db:start
```

Expected: la primera vez descarga las imágenes de Docker y tarda varios minutos. Al terminar imprime `API URL`, `DB URL`, `anon key` y `service_role key`. Guardar la `anon key` y la `API URL`: van en `.env.local`.

- [ ] **Step 5: Escribir la prueba que verifica que pgTAP está disponible**

Crear `supabase/tests/000_setup.test.sql`:

```sql
begin;
select plan(1);

select has_extension('pgtap', 'pgTAP esta instalado');

select * from finish();
rollback;
```

- [ ] **Step 6: Correr la prueba y verla fallar**

```bash
npm run db:test
```

Expected: FAIL — pgTAP todavía no está instalado en la base local.

- [ ] **Step 7: Habilitar pgTAP con una migración**

Crear `supabase/migrations/20260828000000_enable_pgtap.sql`:

```sql
create extension if not exists pgtap with schema extensions;
```

- [ ] **Step 8: Aplicar y correr la prueba**

```bash
npm run db:reset
npm run db:test
```

Expected: PASS — `ok 1 - pgTAP esta instalado`.

- [ ] **Step 9: Commit**

```bash
git add supabase package.json package-lock.json .gitignore
git commit -m "chore: set up local Supabase with pgTAP for schema tests"
```

---

## Task 2: Tipos enumerados y tabla `workers`

**Files:**

- Create: `supabase/migrations/20260828000100_foundations.sql`
- Create: `supabase/tests/001_foundations.test.sql`

**Interfaces:**

- Consumes: pgTAP de la tarea 1.
- Produces: los trece tipos enumerados y la tabla `workers (id uuid, username text, full_name text, personal_email text, base_role work_area, is_external_guide boolean, national_id text, expires_at timestamptz, status worker_status, failed_attempts smallint, must_change_password boolean, last_work_area work_area, created_by uuid, updated_by uuid, created_at timestamptz, updated_at timestamptz)`. Todas las tareas siguientes referencian `workers(id)`.

- [ ] **Step 1: Escribir las pruebas que fallan**

Crear `supabase/tests/001_foundations.test.sql`:

```sql
begin;
select plan(7);

select has_type('public', 'work_area', 'existe el tipo work_area');
select has_table('public', 'workers', 'existe la tabla workers');

-- La cuenta de administracion es unica en todo el sistema.
insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'admin@arenal.local'),
  ('22222222-2222-2222-2222-222222222222', 'otro@arenal.local'),
  ('33333333-3333-3333-3333-333333333333', 'guia@arenal.local');

insert into workers (id, username, full_name, personal_email, base_role)
values ('11111111-1111-1111-1111-111111111111', 'admin', 'Leno', 'leno@correo.com', 'administracion');

select throws_ok(
  $$ insert into workers (id, username, full_name, personal_email, base_role)
     values ('22222222-2222-2222-2222-222222222222', 'admin2', 'Otro', 'o@correo.com', 'administracion') $$,
  '23505',
  null,
  'no se puede crear una segunda cuenta de administracion'
);

-- La cuenta de administracion no se bloquea ni se borra.
select throws_ok(
  $$ update workers set status = 'blocked' where username = 'admin' $$,
  'La cuenta de administracion no se bloquea'
);
select throws_ok(
  $$ delete from workers where username = 'admin' $$,
  'La cuenta de administracion no se elimina'
);

-- El correo personal solo es obligatorio en administracion.
select lives_ok(
  $$ insert into workers (id, username, full_name, base_role)
     values ('22222222-2222-2222-2222-222222222222', 'ismael', 'Ismael', 'operaciones') $$,
  'una cuenta que no es de administracion no exige correo personal'
);

-- El guia externo exige cedula y caducidad.
select throws_ok(
  $$ insert into workers (id, username, full_name, base_role, is_external_guide)
     values ('33333333-3333-3333-3333-333333333333', '112340567', 'Guia', 'operaciones', true) $$,
  '23514',
  null,
  'un guia externo sin cedula ni caducidad es rechazado'
);

select * from finish();
rollback;
```

- [ ] **Step 2: Correr y verlas fallar**

```bash
npm run db:test
```

Expected: FAIL — `relation "workers" does not exist`.

- [ ] **Step 3: Escribir la migración**

Crear `supabase/migrations/20260828000100_foundations.sql`:

```sql
-- ============================ Tipos ============================
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

-- ============================ workers ============================
create table workers (
  id                   uuid primary key references auth.users (id) on delete restrict,
  username             text          not null unique,
  full_name            text          not null,
  personal_email       text,
  base_role            work_area     not null,
  is_external_guide    boolean       not null default false,
  national_id          text,
  expires_at           timestamptz,
  status               worker_status not null default 'active',
  failed_attempts      smallint      not null default 0,
  must_change_password boolean       not null default true,
  last_work_area       work_area,
  created_by           uuid references workers (id),
  updated_by           uuid references workers (id),
  created_at           timestamptz   not null default now(),
  updated_at           timestamptz   not null default now(),

  constraint workers_username_format
    check (username = lower(btrim(username)) and length(username) between 3 and 40),

  -- El guia externo se registra con nombre y cedula, y su caducidad es obligatoria.
  constraint workers_external_guide_shape
    check (
      not is_external_guide
      or (expires_at is not null and national_id is not null and base_role = 'operaciones')
    ),

  -- Solo la cuenta de administracion exige correo personal: es su unica salida
  -- cuando pierde la contrasena, porque nadie mas puede desbloquearla.
  constraint workers_admin_needs_email
    check (base_role <> 'administracion' or personal_email is not null)
);

create unique index workers_single_admin on workers ((true))
  where base_role = 'administracion';

create index workers_status_idx     on workers (status);
create index workers_expires_at_idx on workers (expires_at) where expires_at is not null;

-- La cuenta de administracion no se bloquea ni se borra: el sistema quedaria
-- sin dueno y no hay otra cuenta que la reponga.
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

- [ ] **Step 4: Aplicar y correr**

```bash
npm run db:reset
npm run db:test
```

Expected: PASS — 7 de 7 en `001_foundations`.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260828000100_foundations.sql supabase/tests/001_foundations.test.sql
git commit -m "feat(db): add enum types and the workers table with the single-admin guard"
```

---

## Task 3: Áreas, marcas, PIN y funciones de permiso

**Files:**

- Create: `supabase/migrations/20260828000200_identity_access.sql`
- Create: `supabase/tests/002_identity_access.test.sql`

**Interfaces:**

- Consumes: `workers(id)`, tipos `work_area` y `worker_mark` de la tarea 2.
- Produces: tablas `worker_areas(worker_id, area, granted_by, granted_at)`, `worker_marks(worker_id, mark, granted_by, granted_at)`, `password_reset_pins(id, worker_id, pin_hash, expires_at, used_at, created_at)` y las funciones `has_area(work_area) → boolean`, `has_mark(worker_mark) → boolean`, `is_admin() → boolean`. Todas las políticas de las tareas 13 y 14 se apoyan en esas tres funciones.

- [ ] **Step 1: Escribir las pruebas que fallan**

Crear `supabase/tests/002_identity_access.test.sql`:

```sql
begin;
select plan(6);

select has_table('public', 'worker_areas', 'existe worker_areas');
select has_table('public', 'worker_marks', 'existe worker_marks');
select has_function('public', 'has_area', 'existe has_area');

insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'admin@arenal.local'),
  ('44444444-4444-4444-4444-444444444444', 'vencido@arenal.local');

insert into workers (id, username, full_name, personal_email, base_role)
values ('11111111-1111-1111-1111-111111111111', 'admin', 'Leno', 'leno@correo.com', 'administracion');

-- El rol base se siembra solo como area, para que los permisos miren un solo lugar.
select is(
  (select count(*)::int from worker_areas
   where worker_id = '11111111-1111-1111-1111-111111111111' and area = 'administracion'),
  1,
  'el rol base queda sembrado como area'
);

-- has_area responde segun el usuario autenticado.
set local role authenticated;
set local request.jwt.claims to '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';
select ok(has_area('administracion'), 'administracion tiene su propia area');
select ok(not has_area('reservas'), 'no tiene un area que nadie le habilito');

select * from finish();
rollback;
```

- [ ] **Step 2: Correr y verlas fallar**

```bash
npm run db:test
```

Expected: FAIL — `relation "worker_areas" does not exist`.

- [ ] **Step 3: Escribir la migración**

Crear `supabase/migrations/20260828000200_identity_access.sql`:

```sql
-- Areas y marcas van como filas y no como columnas booleanas: agregar una
-- marca nueva pasa a ser un dato y no una migracion, y cada fila guarda
-- quien la otorgo y cuando, que es lo que pide trazabilidad.
create table worker_areas (
  worker_id  uuid        not null references workers (id) on delete restrict,
  area       work_area   not null,
  granted_by uuid        not null references workers (id),
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

-- El rol base tambien vive en worker_areas, para que toda consulta de permiso
-- mire un solo lugar en vez de combinar dos fuentes.
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

-- security definer para que puedan leer worker_areas sin caer en la recursion
-- de su propia politica. stable para que el planificador las evalue una vez.
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

Las tres verifican de paso que la cuenta esté activa y no vencida. Por eso una cuenta de guía externo caducada pierde el acceso el instante en que pasa su fecha, sin que nadie corra un proceso.

- [ ] **Step 4: Aplicar y correr**

```bash
npm run db:reset
npm run db:test
```

Expected: PASS — 6 de 6 en `002_identity_access`.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260828000200_identity_access.sql supabase/tests/002_identity_access.test.sql
git commit -m "feat(db): add worker areas, marks, reset pins and the permission helpers"
```

---

## Task 4: Catálogo de categorías

**Files:**

- Create: `supabase/migrations/20260828000300_catalog.sql`
- Create: `supabase/tests/003_catalog.test.sql`

**Interfaces:**

- Consumes: `workers(id)`, tipos `tracking_mode`, `usage_metric`, `category_status`.
- Produces: `equipment_categories(id uuid, name text, status category_status, tracking_mode tracking_mode, is_reservable boolean, has_motor boolean, usage_metric usage_metric, consumes_fuel boolean, can_be_damaged boolean, has_condition_photos boolean, guide_only boolean, default_duration_minutes integer, deposit_usd numeric, deposit_crc numeric, alert_min_quantity integer, alert_expiry_days integer, ...)`.

- [ ] **Step 1: Escribir las pruebas que fallan**

Crear `supabase/tests/003_catalog.test.sql`:

```sql
begin;
select plan(5);

insert into auth.users (id, email)
values ('11111111-1111-1111-1111-111111111111', 'admin@arenal.local');
insert into workers (id, username, full_name, personal_email, base_role)
values ('11111111-1111-1111-1111-111111111111', 'admin', 'Leno', 'leno@correo.com', 'administracion');

select has_table('public', 'equipment_categories', 'existe equipment_categories');

-- Si lleva motor tiene que decir en que se mide el uso.
select throws_ok(
  $$ insert into equipment_categories
       (name, tracking_mode, has_motor, created_by, updated_by)
     values ('Jet Ski', 'by_unit', true,
             '11111111-1111-1111-1111-111111111111',
             '11111111-1111-1111-1111-111111111111') $$,
  '23514', null,
  'una categoria con motor exige metrica de uso'
);

-- Las fotos por angulo son de una pieza concreta.
select throws_ok(
  $$ insert into equipment_categories
       (name, tracking_mode, has_condition_photos, created_by, updated_by)
     values ('Chaleco', 'by_quantity', true,
             '11111111-1111-1111-1111-111111111111',
             '11111111-1111-1111-1111-111111111111') $$,
  '23514', null,
  'una categoria por cantidad no lleva fotos de estado'
);

-- Lo reservable necesita duracion por defecto.
select throws_ok(
  $$ insert into equipment_categories
       (name, tracking_mode, is_reservable, created_by, updated_by)
     values ('Kayak doble', 'by_quantity', true,
             '11111111-1111-1111-1111-111111111111',
             '11111111-1111-1111-1111-111111111111') $$,
  '23514', null,
  'una categoria reservable exige duracion por defecto'
);

-- Una categoria por cantidad y reservable es valida: es el caso de los kayaks.
select lives_ok(
  $$ insert into equipment_categories
       (name, tracking_mode, is_reservable, default_duration_minutes, created_by, updated_by)
     values ('Kayak doble', 'by_quantity', true, 60,
             '11111111-1111-1111-1111-111111111111',
             '11111111-1111-1111-1111-111111111111') $$,
  'una categoria reservable puede llevarse por cantidad'
);

select * from finish();
rollback;
```

La última prueba es la que fija la decisión híbrida: reservable **no** implica identificada una por una.

- [ ] **Step 2: Correr y verlas fallar**

```bash
npm run db:test
```

Expected: FAIL — `relation "equipment_categories" does not exist`.

- [ ] **Step 3: Escribir la migración**

Crear `supabase/migrations/20260828000300_catalog.sql`:

```sql
create table equipment_categories (
  id                       uuid primary key default gen_random_uuid(),
  name                     text not null unique,
  status                   category_status not null default 'active',

  -- El criterio no es si la categoria es reservable, sino si hace falta
  -- conocer la historia de esa pieza en particular.
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
  constraint categories_photos_need_units
    check (not has_condition_photos or tracking_mode = 'by_unit'),
  constraint categories_reservable_needs_duration
    check (not is_reservable or default_duration_minutes is not null),
  constraint categories_alert_quantity_positive
    check (alert_min_quantity is null or alert_min_quantity > 0),
  constraint categories_alert_expiry_positive
    check (alert_expiry_days is null or alert_expiry_days > 0),
  constraint categories_deposit_positive
    check ((deposit_usd is null or deposit_usd > 0)
       and (deposit_crc is null or deposit_crc > 0))
);
```

- [ ] **Step 4: Aplicar y correr**

```bash
npm run db:reset
npm run db:test
```

Expected: PASS — 5 de 5 en `003_catalog`.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260828000300_catalog.sql supabase/tests/003_catalog.test.sql
git commit -m "feat(db): add the equipment category catalog with its behaviour flags"
```

---

## Task 5: Unidades, stock y movimientos

**Files:**

- Create: `supabase/migrations/20260828000400_inventory.sql`
- Create: `supabase/tests/004_inventory.test.sql`

**Interfaces:**

- Consumes: `equipment_categories(id)`, `workers(id)`, tipo `unit_status`.
- Produces: `equipment_units(id uuid, category_id uuid, code text, status unit_status, current_fuel numeric, usage_total numeric, next_oil_change_at numeric, impact_count integer, decommissioned_at timestamptz, decommission_reason text, ...)`, `equipment_stock(category_id uuid pk, quantity_available integer, quantity_damaged integer, quantity_in_repair integer, expiry_date date, ...)` y `equipment_stock_movements(...)`. La tarea 11 lee las dos primeras para calcular disponibilidad.

- [ ] **Step 1: Escribir las pruebas que fallan**

Crear `supabase/tests/004_inventory.test.sql`:

```sql
begin;
select plan(5);

insert into auth.users (id, email)
values ('11111111-1111-1111-1111-111111111111', 'admin@arenal.local');
insert into workers (id, username, full_name, personal_email, base_role)
values ('11111111-1111-1111-1111-111111111111', 'admin', 'Leno', 'leno@correo.com', 'administracion');

insert into equipment_categories
  (id, name, tracking_mode, is_reservable, has_motor, usage_metric,
   default_duration_minutes, created_by, updated_by)
values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Jet Ski', 'by_unit', true, true, 'engine_hours', 60,
   '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111');

select has_table('public', 'equipment_units', 'existe equipment_units');

insert into equipment_units (category_id, code, created_by, updated_by)
values ('aaaaaaaa-0000-0000-0000-000000000001', 'JET-01',
        '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111');

-- El codigo es unico en toda la empresa, no solo dentro de su categoria.
select throws_ok(
  $$ insert into equipment_units (category_id, code, created_by, updated_by)
     values ('aaaaaaaa-0000-0000-0000-000000000001', 'JET-01',
             '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111') $$,
  '23505', null,
  'el codigo de una unidad no se repite'
);

-- La baja exige fecha y motivo, para que el historial siga cuadrando.
select throws_ok(
  $$ update equipment_units set status = 'decommissioned' where code = 'JET-01' $$,
  '23514', null,
  'dar de baja sin fecha es rechazado'
);
select lives_ok(
  $$ update equipment_units
     set status = 'decommissioned', decommissioned_at = now(),
         decommission_reason = 'Se vendio'
     where code = 'JET-01' $$,
  'dar de baja con fecha y motivo funciona'
);

-- Las cantidades nunca quedan negativas.
insert into equipment_categories
  (id, name, tracking_mode, created_by, updated_by)
values ('aaaaaaaa-0000-0000-0000-000000000002', 'Chaleco', 'by_quantity',
        '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111');

select throws_ok(
  $$ insert into equipment_stock (category_id, quantity_available, updated_by)
     values ('aaaaaaaa-0000-0000-0000-000000000002', -1,
             '11111111-1111-1111-1111-111111111111') $$,
  '23514', null,
  'una cantidad negativa es rechazada'
);

select * from finish();
rollback;
```

- [ ] **Step 2: Correr y verlas fallar**

```bash
npm run db:test
```

Expected: FAIL — `relation "equipment_units" does not exist`.

- [ ] **Step 3: Escribir la migración**

Crear `supabase/migrations/20260828000400_inventory.sql`:

```sql
create table equipment_units (
  id                  uuid primary key default gen_random_uuid(),
  category_id         uuid not null references equipment_categories (id) on delete restrict,
  code                text not null unique,   -- unico en toda la empresa
  status              unit_status not null default 'available',

  current_fuel        numeric(5,2),           -- porcentaje de tanque
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
  constraint units_impact_count_positive check (impact_count >= 0),
  constraint units_fuel_range
    check (current_fuel is null or (current_fuel >= 0 and current_fuel <= 100))
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

-- El historial deja ver de cuanto a cuanto bajo cada cantidad y en que fecha,
-- que es lo que reemplaza a la ficha por unidad en estas categorias.
create table equipment_stock_movements (
  id             uuid primary key default gen_random_uuid(),
  category_id    uuid not null references equipment_categories (id) on delete restrict,
  from_available integer not null, to_available integer not null,
  from_damaged   integer not null, to_damaged   integer not null,
  from_in_repair integer not null, to_in_repair integer not null,
  reason         text not null,
  created_by     uuid not null references workers (id),
  created_at     timestamptz not null default now()
);

create index stock_movements_category_idx
  on equipment_stock_movements (category_id, created_at desc);
```

- [ ] **Step 4: Aplicar y correr**

```bash
npm run db:reset
npm run db:test
```

Expected: PASS — 5 de 5 en `004_inventory`.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260828000400_inventory.sql supabase/tests/004_inventory.test.sql
git commit -m "feat(db): add equipment units, quantity stock and its movement history"
```

---

## Task 6: Congelar la modalidad de una categoría con registros

**Files:**

- Create: `supabase/migrations/20260828000500_freeze_tracking_mode.sql`
- Create: `supabase/tests/005_freeze_tracking_mode.test.sql`

**Interfaces:**

- Consumes: `equipment_categories`, `equipment_units`, `equipment_stock` de las tareas 4 y 5.
- Produces: el disparador `categories_freeze_tracking_mode`. Nada depende de él, pero protege todo lo demás.

Va en su propia migración y después del inventario porque el disparador consulta `equipment_units` y `equipment_stock`, que no existían cuando se creó la tabla de categorías.

- [ ] **Step 1: Escribir las pruebas que fallan**

Crear `supabase/tests/005_freeze_tracking_mode.test.sql`:

```sql
begin;
select plan(2);

insert into auth.users (id, email)
values ('11111111-1111-1111-1111-111111111111', 'admin@arenal.local');
insert into workers (id, username, full_name, personal_email, base_role)
values ('11111111-1111-1111-1111-111111111111', 'admin', 'Leno', 'leno@correo.com', 'administracion');

insert into equipment_categories
  (id, name, tracking_mode, is_reservable, default_duration_minutes, created_by, updated_by)
values ('aaaaaaaa-0000-0000-0000-000000000001', 'Kayak doble', 'by_quantity', true, 60,
        '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111');

-- Sin registros todavia se puede corregir.
select lives_ok(
  $$ update equipment_categories set tracking_mode = 'by_unit'
     where id = 'aaaaaaaa-0000-0000-0000-000000000001' $$,
  'una categoria sin registros todavia puede cambiar de modalidad'
);

insert into equipment_units (category_id, code, created_by, updated_by)
values ('aaaaaaaa-0000-0000-0000-000000000001', 'KAY-01',
        '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111');

-- Con registros ya no: cambiarla romperia las reservas viejas.
select throws_ok(
  $$ update equipment_categories set tracking_mode = 'by_quantity'
     where id = 'aaaaaaaa-0000-0000-0000-000000000001' $$,
  'La modalidad de una categoria con registros no se cambia'
);

select * from finish();
rollback;
```

- [ ] **Step 2: Correr y verlas fallar**

```bash
npm run db:test
```

Expected: FAIL — la segunda prueba no lanza excepción; el `update` pasa.

- [ ] **Step 3: Escribir la migración**

Crear `supabase/migrations/20260828000500_freeze_tracking_mode.sql`:

```sql
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
```

- [ ] **Step 4: Aplicar y correr**

```bash
npm run db:reset
npm run db:test
```

Expected: PASS — 2 de 2 en `005_freeze_tracking_mode`.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260828000500_freeze_tracking_mode.sql supabase/tests/005_freeze_tracking_mode.test.sql
git commit -m "feat(db): freeze a category tracking mode once it has records"
```

---

## Task 7: Extras, combos y tarifas

**Files:**

- Create: `supabase/migrations/20260828000600_offerings.sql`
- Create: `supabase/tests/006_offerings.test.sql`

**Interfaces:**

- Consumes: `equipment_categories(id)`, `equipment_units(id)`, `workers(id)`, tipos `reservation_type` y `category_status`.
- Produces: `extras(id, name, status, price_usd, price_crc, occupies_category_id, occupies_quantity, ...)`, `extra_compatibility(extra_id, unit_id)`, `combos(id, name, status, package_price_usd, package_price_crc, ...)`, `combo_items(combo_id, category_id, quantity)`, `tariffs(id, category_id, type, amount_usd, amount_crc, ...)`. La tarea 8 referencia `extras(id)` y `combos(id)`.

- [ ] **Step 1: Escribir las pruebas que fallan**

Crear `supabase/tests/006_offerings.test.sql`:

```sql
begin;
select plan(4);

insert into auth.users (id, email)
values ('11111111-1111-1111-1111-111111111111', 'admin@arenal.local');
insert into workers (id, username, full_name, personal_email, base_role)
values ('11111111-1111-1111-1111-111111111111', 'admin', 'Leno', 'leno@correo.com', 'administracion');

insert into equipment_categories
  (id, name, tracking_mode, is_reservable, has_motor, usage_metric,
   default_duration_minutes, created_by, updated_by)
values ('aaaaaaaa-0000-0000-0000-000000000001', 'Lancha', 'by_unit', true, true, 'engine_hours', 60,
        '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111');

insert into equipment_units (id, category_id, code, created_by, updated_by)
values ('bbbbbbbb-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'PONTOON',
        '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111');

select has_table('public', 'extras', 'existe extras');

-- Si ocupa equipo real tiene que decir cuanto ocupa.
select throws_ok(
  $$ insert into extras (name, occupies_category_id, created_by, updated_by)
     values ('Parrilla', 'aaaaaaaa-0000-0000-0000-000000000001',
             '11111111-1111-1111-1111-111111111111',
             '11111111-1111-1111-1111-111111111111') $$,
  '23514', null,
  'un extra que ocupa equipo exige cantidad'
);

-- La compatibilidad es por unidad: el pontoon lleva parrilla, la otra lancha no.
insert into extras (id, name, price_usd, created_by, updated_by)
values ('cccccccc-0000-0000-0000-000000000001', 'Parrilla', 25,
        '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111');

select lives_ok(
  $$ insert into extra_compatibility (extra_id, unit_id)
     values ('cccccccc-0000-0000-0000-000000000001',
             'bbbbbbbb-0000-0000-0000-000000000001') $$,
  'un extra se asocia a una unidad concreta'
);

-- Un combo no lleva tarifa por hora: se vende con su precio de paquete.
select throws_ok(
  $$ insert into tariffs (category_id, type, amount_usd, created_by, updated_by)
     values ('aaaaaaaa-0000-0000-0000-000000000001', 'combo', 100,
             '11111111-1111-1111-1111-111111111111',
             '11111111-1111-1111-1111-111111111111') $$,
  '23514', null,
  'no existe tarifa por hora para el tipo combo'
);

select * from finish();
rollback;
```

- [ ] **Step 2: Correr y verlas fallar**

```bash
npm run db:test
```

Expected: FAIL — `relation "extras" does not exist`.

- [ ] **Step 3: Escribir la migración**

Crear `supabase/migrations/20260828000600_offerings.sql`:

```sql
create table extras (
  id     uuid primary key default gen_random_uuid(),
  name   text not null unique,
  status category_status not null default 'active',

  price_usd numeric(12,2),
  price_crc numeric(14,2),

  -- Algunos extras son solo un cobro adicional. Los que ocupan equipo real
  -- descuentan disponibilidad como cualquier otra unidad.
  occupies_category_id uuid references equipment_categories (id),
  occupies_quantity    integer check (occupies_quantity > 0),

  created_by uuid not null references workers (id),
  updated_by uuid not null references workers (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint extras_occupies_shape
    check ((occupies_category_id is null) = (occupies_quantity is null))
);

-- Por unidad y no por categoria: las dos lanchas no admiten lo mismo. El
-- pontoon lleva paddleboard y parrilla; la otra va para wakeboard.
create table extra_compatibility (
  extra_id uuid not null references extras (id) on delete restrict,
  unit_id  uuid not null references equipment_units (id) on delete restrict,
  primary key (extra_id, unit_id)
);

create table combos (
  id     uuid primary key default gen_random_uuid(),
  name   text not null unique,
  status category_status not null default 'active',
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
  -- El combo se vende con su precio de paquete, no con una tarifa por hora.
  constraint tariffs_not_for_combo check (type <> 'combo')
);
```

- [ ] **Step 4: Aplicar y correr**

```bash
npm run db:reset
npm run db:test
```

Expected: PASS — 4 de 4 en `006_offerings`.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260828000600_offerings.sql supabase/tests/006_offerings.test.sql
git commit -m "feat(db): add extras, per-unit compatibility, combos and tariffs"
```

---

## Task 8: Reservas, ítems y guías

**Files:**

- Create: `supabase/migrations/20260828000700_reservations.sql`
- Create: `supabase/tests/007_reservations.test.sql`

**Interfaces:**

- Consumes: `combos(id)`, `extras(id)`, `equipment_units(id)`, `equipment_categories(id)`, `workers(id)`, tipos `reservation_type` y `reservation_status`.
- Produces: `reservations(id, code, customer_name, people_count, type, combo_id, starts_at, duration_minutes, ends_at, status, parent_reservation_id, cancellation_reason, dispatched_at, closed_at, extra_time_minutes, list_amount_usd, list_amount_crc, agreed_amount_usd, agreed_amount_crc, ...)`, `reservation_items(id, reservation_id, unit_id, category_id, quantity, extra_id, fuel_out, usage_out, fuel_in, usage_in, ...)`, `reservation_guides(reservation_id, worker_id, ...)` y la función `next_reservation_code() → text`. Las tareas 9, 10 y 11 dependen de estas.

- [ ] **Step 1: Escribir las pruebas que fallan**

Crear `supabase/tests/007_reservations.test.sql`:

```sql
begin;
select plan(5);

insert into auth.users (id, email)
values ('11111111-1111-1111-1111-111111111111', 'admin@arenal.local');
insert into workers (id, username, full_name, personal_email, base_role)
values ('11111111-1111-1111-1111-111111111111', 'admin', 'Leno', 'leno@correo.com', 'administracion');

insert into equipment_categories
  (id, name, tracking_mode, is_reservable, default_duration_minutes, created_by, updated_by)
values ('aaaaaaaa-0000-0000-0000-000000000001', 'Kayak doble', 'by_quantity', true, 60,
        '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111');

insert into reservations
  (id, customer_name, people_count, type, starts_at, duration_minutes, created_by, updated_by)
values ('dddddddd-0000-0000-0000-000000000001', 'Maria', 2, 'rental',
        '2026-09-05 10:00:00+00', 120,
        '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111');

-- El codigo se genera solo y es legible.
select matches(
  (select code from reservations where id = 'dddddddd-0000-0000-0000-000000000001'),
  '^R-[0-9]{6}$',
  'el codigo de reserva se genera con formato R-000000'
);

-- ends_at es columna generada: ninguna consulta la recalcula.
select is(
  (select ends_at from reservations where id = 'dddddddd-0000-0000-0000-000000000001'),
  '2026-09-05 12:00:00+00'::timestamptz,
  'ends_at sale de starts_at mas la duracion'
);

-- Cancelar exige motivo: sirve para revisar por que se cae la gente.
select throws_ok(
  $$ update reservations set status = 'cancelled'
     where id = 'dddddddd-0000-0000-0000-000000000001' $$,
  '23514', null,
  'cancelar sin motivo es rechazado'
);

-- Un item es una unidad concreta o una categoria con cantidad, nunca las dos.
select throws_ok(
  $$ insert into reservation_items
       (reservation_id, category_id, quantity, unit_id, created_by, updated_by)
     values ('dddddddd-0000-0000-0000-000000000001',
             'aaaaaaaa-0000-0000-0000-000000000001', 2,
             gen_random_uuid(),
             '11111111-1111-1111-1111-111111111111',
             '11111111-1111-1111-1111-111111111111') $$,
  '23514', null,
  'un item no puede ser unidad y cantidad a la vez'
);

select lives_ok(
  $$ insert into reservation_items
       (reservation_id, category_id, quantity, created_by, updated_by)
     values ('dddddddd-0000-0000-0000-000000000001',
             'aaaaaaaa-0000-0000-0000-000000000001', 2,
             '11111111-1111-1111-1111-111111111111',
             '11111111-1111-1111-1111-111111111111') $$,
  'un item por cantidad es valido'
);

select * from finish();
rollback;
```

- [ ] **Step 2: Correr y verlas fallar**

```bash
npm run db:test
```

Expected: FAIL — `relation "reservations" does not exist`.

- [ ] **Step 3: Escribir la migración**

Crear `supabase/migrations/20260828000700_reservations.sql`:

```sql
create sequence reservation_code_seq;

create function next_reservation_code() returns text
language sql volatile as $$
  select 'R-' || lpad(nextval('reservation_code_seq')::text, 6, '0');
$$;

create table reservations (
  id                    uuid primary key default gen_random_uuid(),
  code                  text not null unique default next_reservation_code(),
  customer_name         text not null,
  people_count          integer not null check (people_count > 0),

  type                  reservation_type not null,
  combo_id              uuid references combos (id),

  starts_at             timestamptz not null,
  duration_minutes      integer not null check (duration_minutes > 0),
  -- Columna generada: ninguna consulta de disponibilidad la recalcula y
  -- ningun camino de escritura puede dejarla inconsistente.
  -- timestamptz + interval es STABLE, no IMMUTABLE, y Postgres rechaza una
  -- expresion no inmutable en una columna generada. Pasar por UTC en ambos
  -- lados si es inmutable y da el mismo instante.
  ends_at               timestamptz generated always as
                          ((starts_at at time zone 'UTC'
                              + make_interval(mins => duration_minutes)) at time zone 'UTC') stored,

  status                reservation_status not null default 'scheduled',
  -- Al partir una reserva, la hija guarda de cual salio y nace sin cobro propio.
  parent_reservation_id uuid references reservations (id),

  cancellation_reason   text,
  dispatched_at         timestamptz,
  closed_at             timestamptz,
  extra_time_minutes    integer not null default 0 check (extra_time_minutes >= 0),

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

create index reservations_window_idx on reservations (starts_at, ends_at)
  where status in ('scheduled', 'dispatched');
create index reservations_status_idx on reservations (status, starts_at);

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

  -- El hibrido, expresado como restriccion: o una unidad concreta, o una
  -- categoria con cantidad. Nunca las dos, nunca ninguna.
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

-- No hay maximo de guias porque no hay maximo de personas por tour: se llena
-- hasta que se agota el equipo.
create table reservation_guides (
  reservation_id uuid not null references reservations (id) on delete restrict,
  worker_id      uuid not null references workers (id) on delete restrict,
  assigned_by    uuid not null references workers (id),
  assigned_at    timestamptz not null default now(),
  primary key (reservation_id, worker_id)
);
```

- [ ] **Step 4: Aplicar y correr**

```bash
npm run db:reset
npm run db:test
```

Expected: PASS — 5 de 5 en `007_reservations`.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260828000700_reservations.sql supabase/tests/007_reservations.test.sql
git commit -m "feat(db): add reservations, their committed items and assigned guides"
```

---

## Task 9: Cobros, devoluciones y depósitos

**Files:**

- Create: `supabase/migrations/20260828000800_money.sql`
- Create: `supabase/tests/008_money.test.sql`

**Interfaces:**

- Consumes: `reservations(id)`, `workers(id)`, tipos `currency_code`, `charge_kind`, `deposit_status`.
- Produces: `reservation_charges(id, reservation_id, kind, amount, currency, payment_method, ...)`, `refunds(id, reservation_id, percentage, amount, currency, reason, ...)`, `deposits(id, reservation_id, amount, currency, status, retained_amount, retention_reason, resolved_by, resolved_at, ...)`.

- [ ] **Step 1: Escribir las pruebas que fallan**

Crear `supabase/tests/008_money.test.sql`:

```sql
begin;
select plan(4);

insert into auth.users (id, email)
values ('11111111-1111-1111-1111-111111111111', 'admin@arenal.local');
insert into workers (id, username, full_name, personal_email, base_role)
values ('11111111-1111-1111-1111-111111111111', 'admin', 'Leno', 'leno@correo.com', 'administracion');

insert into reservations
  (id, customer_name, people_count, type, starts_at, duration_minutes, created_by, updated_by)
values ('dddddddd-0000-0000-0000-000000000001', 'Maria', 2, 'rental',
        '2026-09-05 10:00:00+00', 60,
        '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111');

-- Una misma reserva se cobra en tractos, y cada parte guarda su moneda.
insert into reservation_charges (reservation_id, kind, amount, currency, payment_method, created_by)
values ('dddddddd-0000-0000-0000-000000000001', 'tariff', 60, 'USD', 'Efectivo',
        '11111111-1111-1111-1111-111111111111'),
       ('dddddddd-0000-0000-0000-000000000001', 'tariff', 30000, 'CRC', 'SINPE',
        '11111111-1111-1111-1111-111111111111');

select is(
  (select count(distinct currency)::int from reservation_charges
   where reservation_id = 'dddddddd-0000-0000-0000-000000000001'),
  2,
  'una reserva se paga parte en dolares y parte en colones'
);

insert into deposits (id, reservation_id, amount, currency, created_by)
values ('eeeeeeee-0000-0000-0000-000000000001', 'dddddddd-0000-0000-0000-000000000001',
        200, 'USD', '11111111-1111-1111-1111-111111111111');

-- No se puede retener mas de lo que el cliente entrego.
select throws_ok(
  $$ update deposits
     set status = 'partially_retained', retained_amount = 500,
         retention_reason = 'Golpe', resolved_by = '11111111-1111-1111-1111-111111111111',
         resolved_at = now()
     where id = 'eeeeeeee-0000-0000-0000-000000000001' $$,
  '23514', null,
  'no se retiene mas de lo depositado'
);

update deposits
set status = 'returned', resolved_by = '11111111-1111-1111-1111-111111111111', resolved_at = now()
where id = 'eeeeeeee-0000-0000-0000-000000000001';

-- Un deposito resuelto no se reabre ni cambia de resolucion.
select throws_ok(
  $$ update deposits set status = 'held'
     where id = 'eeeeeeee-0000-0000-0000-000000000001' $$,
  'Un deposito ya resuelto no cambia de estado'
);
select throws_ok(
  $$ update deposits set status = 'retained', retained_amount = 200,
         retention_reason = 'Aparecio un golpe'
     where id = 'eeeeeeee-0000-0000-0000-000000000001' $$,
  'Un deposito ya resuelto no cambia de estado'
);

select * from finish();
rollback;
```

- [ ] **Step 2: Correr y verlas fallar**

```bash
npm run db:test
```

Expected: FAIL — `relation "reservation_charges" does not exist`.

- [ ] **Step 3: Escribir la migración**

Crear `supabase/migrations/20260828000800_money.sql`:

```sql
-- Cada movimiento guarda su moneda y ninguna consulta las suma: un reporte de
-- ingresos del dia devuelve siempre dos cifras.
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

create index charges_reservation_idx on reservation_charges (reservation_id);
create index charges_day_idx         on reservation_charges (created_at);

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

-- status = 'held' ES la lista de pendientes de resolver. El indice parcial hace
-- inmediata esa consulta sin importar cuantos depositos historicos haya.
create index deposits_pending_idx on deposits (created_at) where status = 'held';

-- Un deposito pasa de 'held' a uno de los tres estados finales y ahi se queda.
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

- [ ] **Step 4: Aplicar y correr**

```bash
npm run db:reset
npm run db:test
```

Expected: PASS — 4 de 4 en `008_money`.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260828000800_money.sql supabase/tests/008_money.test.sql
git commit -m "feat(db): add charges, refunds and guarantee deposits"
```

---

## Task 10: Historial de la unidad

**Files:**

- Create: `supabase/migrations/20260828000900_unit_history.sql`
- Create: `supabase/tests/009_unit_history.test.sql`

**Interfaces:**

- Consumes: `equipment_units(id)`, `equipment_categories(id)`, `reservations(id)`, `workers(id)`, tipos `damage_cause`, `photo_angle`, `unit_status`, `currency_code`.
- Produces: `unit_condition_photos(id, unit_id, angle, storage_path, ...)`, `damage_reports(id, unit_id, reservation_id, cause, description, impact_delta, ...)`, `maintenance_records(id, unit_id, work_type, description, is_external, cost_amount, cost_currency, performed_at, ...)`, `inventory_counts(id, counted_at, notes, ...)`, `inventory_count_lines(...)`.

- [ ] **Step 1: Escribir las pruebas que fallan**

Crear `supabase/tests/009_unit_history.test.sql`:

```sql
begin;
select plan(5);

insert into auth.users (id, email)
values ('11111111-1111-1111-1111-111111111111', 'admin@arenal.local');
insert into workers (id, username, full_name, personal_email, base_role)
values ('11111111-1111-1111-1111-111111111111', 'admin', 'Leno', 'leno@correo.com', 'administracion');

insert into equipment_categories
  (id, name, tracking_mode, is_reservable, has_motor, usage_metric,
   has_condition_photos, default_duration_minutes, created_by, updated_by)
values ('aaaaaaaa-0000-0000-0000-000000000001', 'Jet Ski', 'by_unit', true, true,
        'engine_hours', true, 60,
        '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111');

insert into equipment_units (id, category_id, code, created_by, updated_by)
values ('bbbbbbbb-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'JET-01',
        '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111');

-- Una foto por angulo: subir la del costado derecho reemplaza la anterior.
insert into unit_condition_photos (unit_id, angle, storage_path, uploaded_by)
values ('bbbbbbbb-0000-0000-0000-000000000001', 'right_side', 'fotos/jet-01-der.webp',
        '11111111-1111-1111-1111-111111111111');

select throws_ok(
  $$ insert into unit_condition_photos (unit_id, angle, storage_path, uploaded_by)
     values ('bbbbbbbb-0000-0000-0000-000000000001', 'right_side', 'fotos/otra.webp',
             '11111111-1111-1111-1111-111111111111') $$,
  '23505', null,
  'no se acumulan dos fotos del mismo angulo'
);

-- El personal registra su trabajo sin cobrar mano de obra.
select lives_ok(
  $$ insert into maintenance_records
       (unit_id, work_type, is_external, performed_at, created_by)
     values ('bbbbbbbb-0000-0000-0000-000000000001', 'Montar defensas', false,
             current_date, '11111111-1111-1111-1111-111111111111') $$,
  'un trabajo interno se registra sin costo'
);

-- Pero una pieza comprada cuesta aunque la instale operaciones.
select lives_ok(
  $$ insert into maintenance_records
       (unit_id, work_type, is_external, cost_amount, cost_currency, performed_at, created_by)
     values ('bbbbbbbb-0000-0000-0000-000000000001', 'Defensa nueva', false, 45, 'USD',
             current_date, '11111111-1111-1111-1111-111111111111') $$,
  'un trabajo interno con repuesto si lleva costo'
);

-- El monto y la moneda van juntos o no van.
select throws_ok(
  $$ insert into maintenance_records
       (unit_id, work_type, is_external, cost_amount, performed_at, created_by)
     values ('bbbbbbbb-0000-0000-0000-000000000001', 'Cambio de aceite', true, 80,
             current_date, '11111111-1111-1111-1111-111111111111') $$,
  '23514', null,
  'un costo sin moneda es rechazado'
);

-- Una linea de conteo es por unidad o por cantidad, nunca las dos.
insert into inventory_counts (id, created_by)
values ('ffffffff-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111');

select throws_ok(
  $$ insert into inventory_count_lines
       (count_id, category_id, unit_id, confirmed_status, quantity_available)
     values ('ffffffff-0000-0000-0000-000000000001',
             'aaaaaaaa-0000-0000-0000-000000000001',
             'bbbbbbbb-0000-0000-0000-000000000001', 'available', 3) $$,
  '23514', null,
  'una linea de conteo no mezcla unidad con cantidad'
);

select * from finish();
rollback;
```

- [ ] **Step 2: Correr y verlas fallar**

```bash
npm run db:test
```

Expected: FAIL — `relation "unit_condition_photos" does not exist`.

- [ ] **Step 3: Escribir la migración**

Crear `supabase/migrations/20260828000900_unit_history.sql`:

```sql
-- La unicidad por (unit_id, angle) es la que implementa "se reemplazan cuando
-- cambia el estado" y la que evita que el espacio crezca sin control.
create table unit_condition_photos (
  id           uuid primary key default gen_random_uuid(),
  unit_id      uuid not null references equipment_units (id) on delete restrict,
  angle        photo_angle not null,
  storage_path text not null,
  uploaded_by  uuid not null references workers (id),
  uploaded_at  timestamptz not null default now(),
  unique (unit_id, angle)
);

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

create index damage_reports_unit_idx on damage_reports (unit_id, created_at desc);

create table maintenance_records (
  id            uuid primary key default gen_random_uuid(),
  unit_id       uuid not null references equipment_units (id) on delete restrict,
  work_type     text not null,
  description   text,
  -- is_external dice QUIEN lo hizo, cost_amount dice CUANTO costo, y son
  -- independientes: el personal no cobra mano de obra, pero una defensa nueva
  -- se compro y ese monto es gasto real de esa maquina.
  is_external   boolean not null,
  cost_amount   numeric(12,2),
  cost_currency currency_code,
  performed_at  date not null,
  created_by    uuid not null references workers (id),
  updated_by    uuid references workers (id),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  constraint maintenance_cost_is_complete
    check ((cost_amount is null) = (cost_currency is null)),
  constraint maintenance_cost_positive
    check (cost_amount is null or cost_amount > 0)
);

create index maintenance_unit_idx on maintenance_records (unit_id, performed_at desc);

create table inventory_counts (
  id         uuid primary key default gen_random_uuid(),
  counted_at timestamptz not null default now(),
  notes      text,
  created_by uuid not null references workers (id),
  created_at timestamptz not null default now()
);

create table inventory_count_lines (
  id          uuid primary key default gen_random_uuid(),
  -- Unica excepcion al no borrado: son hijas de un conteo y no tienen vida
  -- propia. El conteo en si nunca se borra.
  count_id    uuid not null references inventory_counts (id) on delete cascade,
  category_id uuid not null references equipment_categories (id) on delete restrict,

  unit_id            uuid references equipment_units (id),
  confirmed_status   unit_status,

  quantity_available integer,
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

create index count_lines_count_idx on inventory_count_lines (count_id);
```

- [ ] **Step 4: Aplicar y correr**

```bash
npm run db:reset
npm run db:test
```

Expected: PASS — 5 de 5 en `009_unit_history`.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260828000900_unit_history.sql supabase/tests/009_unit_history.test.sql
git commit -m "feat(db): add condition photos, damage reports, maintenance and inventory counts"
```

---

## Task 11: Estado efectivo y disponibilidad

**Files:**

- Create: `supabase/migrations/20260828001000_availability.sql`
- Create: `supabase/tests/010_availability.test.sql`

**Interfaces:**

- Consumes: `equipment_units`, `equipment_stock`, `reservations`, `reservation_items`.
- Produces: la vista `unit_current_state(id, code, category_id, recorded_status, effective_status, reservation_id, returns_at)`, y las funciones `unit_conflicts(uuid, timestamptz, timestamptz, uuid) → setof (reservation_id uuid, code text, starts_at timestamptz, ends_at timestamptz)` y `category_availability(uuid, timestamptz, timestamptz, uuid) → table (usable integer, committed integer, free integer)`. La aplicación llama a estas tres para el tablero y para la advertencia de choque.

- [ ] **Step 1: Escribir las pruebas que fallan**

Crear `supabase/tests/010_availability.test.sql`:

```sql
begin;
select plan(5);

insert into auth.users (id, email)
values ('11111111-1111-1111-1111-111111111111', 'admin@arenal.local');
insert into workers (id, username, full_name, personal_email, base_role)
values ('11111111-1111-1111-1111-111111111111', 'admin', 'Leno', 'leno@correo.com', 'administracion');

insert into equipment_categories
  (id, name, tracking_mode, is_reservable, has_motor, usage_metric,
   default_duration_minutes, created_by, updated_by)
values ('aaaaaaaa-0000-0000-0000-000000000001', 'Jet Ski', 'by_unit', true, true, 'engine_hours', 60,
        '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111'),
       ('aaaaaaaa-0000-0000-0000-000000000002', 'Kayak doble', 'by_quantity', true, false, null, 60,
        '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111');

insert into equipment_units (id, category_id, code, created_by, updated_by)
values ('bbbbbbbb-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'JET-01',
        '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111');

insert into equipment_stock (category_id, quantity_available, updated_by)
values ('aaaaaaaa-0000-0000-0000-000000000002', 6, '11111111-1111-1111-1111-111111111111');

insert into reservations
  (id, customer_name, people_count, type, starts_at, duration_minutes, status, created_by, updated_by)
values ('dddddddd-0000-0000-0000-000000000001', 'Maria', 2, 'rental',
        '2026-09-05 10:00:00+00', 120, 'scheduled',
        '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111');

insert into reservation_items (reservation_id, unit_id, created_by, updated_by)
values ('dddddddd-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000001',
        '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111');

insert into reservation_items (reservation_id, category_id, quantity, created_by, updated_by)
values ('dddddddd-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000002', 2,
        '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111');

-- La pregunta es por franja, no por el instante actual.
select is(
  (select count(*)::int from unit_conflicts(
     'bbbbbbbb-0000-0000-0000-000000000001',
     '2026-09-05 11:00:00+00', '2026-09-05 13:00:00+00')),
  1,
  'una franja que se solapa devuelve el choque'
);
select is(
  (select count(*)::int from unit_conflicts(
     'bbbbbbbb-0000-0000-0000-000000000001',
     '2026-09-05 12:00:00+00', '2026-09-05 14:00:00+00')),
  0,
  'una franja que arranca justo al terminar la otra no choca'
);

-- La disponibilidad por cantidad descuenta lo comprometido en la franja.
select is(
  (select free from category_availability(
     'aaaaaaaa-0000-0000-0000-000000000002',
     '2026-09-05 10:00:00+00', '2026-09-05 12:00:00+00')),
  4,
  'quedan 4 kayaks libres de 6 con 2 comprometidos'
);

-- ocupado se calcula desde el despacho, no se digita.
select is(
  (select effective_status from unit_current_state
   where id = 'bbbbbbbb-0000-0000-0000-000000000001'),
  'available',
  'una reserva agendada todavia no ocupa la unidad'
);

update reservations set status = 'dispatched', dispatched_at = now()
where id = 'dddddddd-0000-0000-0000-000000000001';

select is(
  (select effective_status from unit_current_state
   where id = 'bbbbbbbb-0000-0000-0000-000000000001'),
  'occupied',
  'al despachar, la unidad aparece ocupada sin que nadie lo digite'
);

select * from finish();
rollback;
```

La segunda prueba fija que las franjas son medio abiertas: una reserva que arranca a las 12:00 no choca con otra que termina a las 12:00.

- [ ] **Step 2: Correr y verlas fallar**

```bash
npm run db:test
```

Expected: FAIL — `function unit_conflicts(...) does not exist`.

- [ ] **Step 3: Escribir la migración**

Crear `supabase/migrations/20260828001000_availability.sql`:

```sql
-- De aqui sale la tarjeta del tablero: la hora a la que regresa, a que reserva
-- pertenece y desde donde se abre su detalle.
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

-- Informa, no bloquea: la advertencia dice con cual reserva choca y deja
-- seguir, porque hay dias en que la operacion se acomoda sobre la marcha.
create function unit_conflicts(
  p_unit_id             uuid,
  p_starts_at           timestamptz,
  p_ends_at             timestamptz,
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

create function category_availability(
  p_category_id         uuid,
  p_starts_at           timestamptz,
  p_ends_at             timestamptz,
  p_exclude_reservation uuid default null
) returns table (usable integer, committed integer, free integer)
language sql stable as $$
  with stock as (
    -- Solo lo disponible cuenta: lo danado y lo que esta en reparacion no se ofrece.
    select quantity_available as usable
    from equipment_stock
    where category_id = p_category_id
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

- [ ] **Step 4: Aplicar y correr**

```bash
npm run db:reset
npm run db:test
```

Expected: PASS — 5 de 5 en `010_availability`.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260828001000_availability.sql supabase/tests/010_availability.test.sql
git commit -m "feat(db): compute effective unit state and availability per time window"
```

---

## Task 12: Firma de trazabilidad automática

**Files:**

- Create: `supabase/migrations/20260828001100_audit.sql`
- Create: `supabase/tests/011_audit.test.sql`

**Interfaces:**

- Consumes: todas las tablas operativas creadas hasta aquí.
- Produces: la función `stamp_audit_fields()` y su disparador sobre cada tabla operativa. A partir de esta tarea, ninguna escritura necesita pasar `created_by` ni `updated_by`.

- [ ] **Step 1: Escribir las pruebas que fallan**

Crear `supabase/tests/011_audit.test.sql`:

```sql
begin;
select plan(3);

insert into auth.users (id, email)
values ('11111111-1111-1111-1111-111111111111', 'admin@arenal.local');
insert into workers (id, username, full_name, personal_email, base_role)
values ('11111111-1111-1111-1111-111111111111', 'admin', 'Leno', 'leno@correo.com', 'administracion');

set local role authenticated;
set local request.jwt.claims to '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';

-- La firma la pone la base, no la aplicacion: no se puede olvidar ni falsificar.
insert into reservations (customer_name, people_count, type, starts_at, duration_minutes)
values ('Maria', 2, 'rental', '2026-09-05 10:00:00+00', 60);

select is(
  (select created_by from reservations where customer_name = 'Maria'),
  '11111111-1111-1111-1111-111111111111'::uuid,
  'created_by sale de auth.uid() sin que la aplicacion lo pase'
);

select is(
  (select updated_by from reservations where customer_name = 'Maria'),
  '11111111-1111-1111-1111-111111111111'::uuid,
  'updated_by tambien se firma al insertar'
);

-- Aunque el cliente intente mentir sobre quien hizo el cambio.
insert into auth.users (id, email) values ('22222222-2222-2222-2222-222222222222', 'otro@arenal.local');
insert into workers (id, username, full_name, base_role)
values ('22222222-2222-2222-2222-222222222222', 'ismael', 'Ismael', 'operaciones');

update reservations
set people_count = 3, updated_by = '22222222-2222-2222-2222-222222222222'
where customer_name = 'Maria';

select is(
  (select updated_by from reservations where customer_name = 'Maria'),
  '11111111-1111-1111-1111-111111111111'::uuid,
  'el disparador pisa un updated_by falsificado por el cliente'
);

select * from finish();
rollback;
```

La tercera prueba es la importante: verifica que la firma no se puede falsificar desde el cliente.

- [ ] **Step 2: Correr y verlas fallar**

```bash
npm run db:test
```

Expected: FAIL — `null value in column "created_by" violates not-null constraint`.

- [ ] **Step 3: Escribir la migración**

Crear `supabase/migrations/20260828001100_audit.sql`:

```sql
-- La firma la pone la base desde auth.uid() y no la aplicacion, asi no se
-- puede olvidar en un camino de escritura ni falsificar desde el cliente.
create function stamp_audit_fields() returns trigger
language plpgsql as $$
begin
  if tg_op = 'INSERT' then
    new.created_by := coalesce(auth.uid(), new.created_by);
    new.created_at := now();
  else
    new.created_by := old.created_by;
    new.created_at := old.created_at;
  end if;
  new.updated_by := coalesce(auth.uid(), new.updated_by);
  new.updated_at := now();
  return new;
end $$;

-- Se aplica a toda tabla que tenga las cuatro columnas de firma.
do $$
declare
  table_name text;
begin
  for table_name in
    select c.relname
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relkind = 'r'
      and exists (select 1 from pg_attribute a
                  where a.attrelid = c.oid and a.attname = 'created_by' and not a.attisdropped)
      and exists (select 1 from pg_attribute a
                  where a.attrelid = c.oid and a.attname = 'updated_by' and not a.attisdropped)
  loop
    execute format(
      'create trigger %I before insert or update on public.%I
       for each row execute function stamp_audit_fields()',
      table_name || '_stamp_audit', table_name
    );
  end loop;
end $$;
```

El bucle cubre las tablas que tienen las cuatro columnas. Las que solo llevan `created_by` —cobros, devoluciones, movimientos de stock, fotos, conteos— no se modifican después de creadas, así que no necesitan `updated_by`.

- [ ] **Step 4: Aplicar y correr**

```bash
npm run db:reset
npm run db:test
```

Expected: PASS — 3 de 3 en `011_audit`.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260828001100_audit.sql supabase/tests/011_audit.test.sql
git commit -m "feat(db): stamp the audit signature from auth.uid() instead of trusting the client"
```

---

## Task 13: Políticas de identidad, catálogo e inventario

**Files:**

- Create: `supabase/migrations/20260828001200_rls_identity_catalog.sql`
- Create: `supabase/tests/012_rls_identity_catalog.test.sql`

**Interfaces:**

- Consumes: `has_area()`, `has_mark()`, `is_admin()` de la tarea 3.
- Produces: RLS activo y políticas sobre `workers`, `worker_areas`, `worker_marks`, `password_reset_pins`, `equipment_categories`, `equipment_units`, `equipment_stock`, `equipment_stock_movements`, `unit_condition_photos`, `damage_reports`, `maintenance_records`, `inventory_counts`, `inventory_count_lines`.

Además de lo que sigue, la prueba debe incluir una aserción de que un
`delete` sobre una tabla operativa es rechazado para el rol `authenticated`.
Es la única forma de que la regla global de no borrado quede verificada y no
solo declarada.

- [ ] **Step 1: Escribir las pruebas que fallan**

Crear `supabase/tests/012_rls_identity_catalog.test.sql`:

```sql
begin;
select plan(4);

insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'admin@arenal.local'),
  ('22222222-2222-2222-2222-222222222222', 'ops@arenal.local'),
  ('33333333-3333-3333-3333-333333333333', 'res@arenal.local');

insert into workers (id, username, full_name, personal_email, base_role) values
  ('11111111-1111-1111-1111-111111111111', 'admin', 'Leno', 'leno@correo.com', 'administracion');
insert into workers (id, username, full_name, base_role) values
  ('22222222-2222-2222-2222-222222222222', 'ismael', 'Ismael', 'operaciones'),
  ('33333333-3333-3333-3333-333333333333', 'celso', 'Celso', 'reservas');

insert into equipment_categories
  (id, name, tracking_mode, is_reservable, has_motor, usage_metric,
   has_condition_photos, default_duration_minutes, created_by, updated_by)
values ('aaaaaaaa-0000-0000-0000-000000000001', 'Jet Ski', 'by_unit', true, true,
        'engine_hours', true, 60,
        '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111');

insert into equipment_units (id, category_id, code, created_by, updated_by)
values ('bbbbbbbb-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'JET-01',
        '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111');

-- Operaciones lee el catalogo pero no lo edita.
set local role authenticated;
set local request.jwt.claims to '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}';

select is(
  (select count(*)::int from equipment_categories),
  1,
  'operaciones lee el catalogo'
);

select throws_ok(
  $$ insert into equipment_categories (name, tracking_mode)
     values ('Inventada', 'by_quantity') $$,
  '42501', null,
  'operaciones no crea categorias'
);

-- Las fotos de estado exigen la marca de encargado general.
select throws_ok(
  $$ insert into unit_condition_photos (unit_id, angle, storage_path, uploaded_by)
     values ('bbbbbbbb-0000-0000-0000-000000000001', 'front', 'fotos/x.webp',
             '22222222-2222-2222-2222-222222222222') $$,
  '42501', null,
  'operaciones sin la marca no sube fotos de estado'
);

set local role postgres;
insert into worker_marks (worker_id, mark, granted_by)
values ('22222222-2222-2222-2222-222222222222', 'encargado_general',
        '11111111-1111-1111-1111-111111111111');

set local role authenticated;
set local request.jwt.claims to '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}';

select lives_ok(
  $$ insert into unit_condition_photos (unit_id, angle, storage_path, uploaded_by)
     values ('bbbbbbbb-0000-0000-0000-000000000001', 'front', 'fotos/x.webp',
             '22222222-2222-2222-2222-222222222222') $$,
  'con la marca de encargado general si sube fotos'
);

select * from finish();
rollback;
```

- [ ] **Step 2: Correr y verlas fallar**

```bash
npm run db:test
```

Expected: FAIL — sin RLS, los `insert` que deberían ser rechazados pasan.

- [ ] **Step 3: Escribir la migración**

Crear `supabase/migrations/20260828001200_rls_identity_catalog.sql`:

```sql
-- Defensa en profundidad para "ninguna tabla operativa acepta DELETE".
-- Las politicas de abajo nunca conceden `delete`, pero Postgres evalua los
-- GRANT antes que las politicas: revocar el privilegio hace que ningun
-- `for all` descuidado en el futuro pueda reabrir el borrado por accidente.
revoke delete on all tables in schema public from anon, authenticated;
alter default privileges in schema public
  revoke delete on tables from anon, authenticated;

alter table workers                   enable row level security;
alter table worker_areas              enable row level security;
alter table worker_marks              enable row level security;
alter table password_reset_pins       enable row level security;
alter table equipment_categories      enable row level security;
alter table equipment_units           enable row level security;
alter table equipment_stock           enable row level security;
alter table equipment_stock_movements enable row level security;
alter table unit_condition_photos     enable row level security;
alter table damage_reports            enable row level security;
alter table maintenance_records       enable row level security;
alter table inventory_counts          enable row level security;
alter table inventory_count_lines     enable row level security;

-- ---------------- Identidad ----------------
create policy workers_select on workers
  for select to authenticated
  using (id = auth.uid() or is_admin());

create policy workers_update_admin on workers
  for update to authenticated
  using (is_admin()) with check (is_admin());

-- Cada quien actualiza su propio correo, su contrasena y su ultimo modo.
create policy workers_update_self on workers
  for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- Reservas solo puede crear cuentas temporales de guia externo, y solo con la
-- marca que administracion otorga. Sin ella, la base rechaza el insert aunque
-- se intente por otro camino.
create policy workers_insert on workers
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

create policy worker_areas_select on worker_areas
  for select to authenticated
  using (worker_id = auth.uid() or is_admin());
create policy worker_areas_insert on worker_areas
  for insert to authenticated
  with check (is_admin());
create policy worker_areas_update on worker_areas
  for update to authenticated
  using (is_admin()) with check (is_admin());

create policy worker_marks_select on worker_marks
  for select to authenticated
  using (worker_id = auth.uid() or is_admin());
create policy worker_marks_insert on worker_marks
  for insert to authenticated
  with check (is_admin());
create policy worker_marks_update on worker_marks
  for update to authenticated
  using (is_admin()) with check (is_admin());

-- Los PIN solo los toca el servidor con la llave de servicio, que salta RLS.
-- Ninguna politica para authenticated: nadie los lee desde el cliente.

-- ---------------- Catalogo ----------------
create policy categories_select on equipment_categories
  for select to authenticated using (true);
create policy categories_insert on equipment_categories
  for insert to authenticated
  with check (is_admin());
create policy categories_update on equipment_categories
  for update to authenticated
  using (is_admin()) with check (is_admin());

-- ---------------- Inventario ----------------
create policy units_select on equipment_units
  for select to authenticated using (true);
create policy units_insert on equipment_units
  for insert to authenticated
  with check (has_area('operaciones') or is_admin());
create policy units_update on equipment_units
  for update to authenticated
  using (has_area('operaciones') or is_admin()) with check (has_area('operaciones') or is_admin());

create policy stock_select on equipment_stock
  for select to authenticated using (true);
create policy stock_insert on equipment_stock
  for insert to authenticated
  with check (has_area('operaciones') or is_admin());
create policy stock_update on equipment_stock
  for update to authenticated
  using (has_area('operaciones') or is_admin()) with check (has_area('operaciones') or is_admin());

create policy stock_movements_select on equipment_stock_movements
  for select to authenticated using (true);
create policy stock_movements_insert on equipment_stock_movements
  for insert to authenticated
  with check (has_area('operaciones') or is_admin());

-- Solo el encargado general reemplaza las fotos de estado. El resto las ve.
create policy photos_select on unit_condition_photos
  for select to authenticated using (true);
create policy photos_insert on unit_condition_photos
  for insert to authenticated
  with check (has_mark('encargado_general') or is_admin());
create policy photos_update on unit_condition_photos
  for update to authenticated
  using (has_mark('encargado_general') or is_admin()) with check (has_mark('encargado_general') or is_admin());

create policy damage_select on damage_reports
  for select to authenticated using (true);
create policy damage_insert on damage_reports
  for insert to authenticated
  with check (has_area('operaciones') or is_admin());

create policy maintenance_select on maintenance_records
  for select to authenticated using (true);
create policy maintenance_insert on maintenance_records
  for insert to authenticated
  with check (has_area('operaciones') or is_admin());
create policy maintenance_update on maintenance_records
  for update to authenticated
  using (has_area('operaciones') or is_admin()) with check (has_area('operaciones') or is_admin());

create policy counts_select on inventory_counts
  for select to authenticated using (true);
create policy counts_insert on inventory_counts
  for insert to authenticated
  with check (has_area('operaciones') or is_admin());

create policy count_lines_select on inventory_count_lines
  for select to authenticated using (true);
create policy count_lines_insert on inventory_count_lines
  for insert to authenticated
  with check (has_area('operaciones') or is_admin());
```

- [ ] **Step 4: Aplicar y correr**

```bash
npm run db:reset
npm run db:test
```

Expected: PASS — 4 de 4 en `012_rls_identity_catalog`.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260828001200_rls_identity_catalog.sql supabase/tests/012_rls_identity_catalog.test.sql
git commit -m "feat(db): add row level security for identity, catalog and inventory"
```

---

## Task 14: Políticas de reservas, operación y dinero

**Files:**

- Create: `supabase/migrations/20260828001300_rls_operations_money.sql`
- Create: `supabase/tests/013_rls_operations_money.test.sql`

**Interfaces:**

- Consumes: `has_area()`, `is_admin()`.
- Produces: RLS activo y políticas sobre `reservations`, `reservation_items`, `reservation_guides`, `extras`, `extra_compatibility`, `combos`, `combo_items`, `tariffs`, `reservation_charges`, `refunds`, `deposits`.

Esta es la tarea donde una política mal escrita no falla ruidosamente: simplemente deja pasar a quien no debía. Por eso las pruebas verifican tanto lo que se permite como lo que se niega.

- [ ] **Step 1: Escribir las pruebas que fallan**

Crear `supabase/tests/013_rls_operations_money.test.sql`:

```sql
begin;
select plan(5);

insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'admin@arenal.local'),
  ('22222222-2222-2222-2222-222222222222', 'ops@arenal.local'),
  ('33333333-3333-3333-3333-333333333333', 'res@arenal.local');

insert into workers (id, username, full_name, personal_email, base_role) values
  ('11111111-1111-1111-1111-111111111111', 'admin', 'Leno', 'leno@correo.com', 'administracion');
insert into workers (id, username, full_name, base_role) values
  ('22222222-2222-2222-2222-222222222222', 'ismael', 'Ismael', 'operaciones'),
  ('33333333-3333-3333-3333-333333333333', 'celso', 'Celso', 'reservas');

insert into equipment_categories
  (id, name, tracking_mode, is_reservable, default_duration_minutes, created_by, updated_by)
values ('aaaaaaaa-0000-0000-0000-000000000001', 'Jet Ski', 'by_unit', true, 60,
        '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111');

insert into tariffs (category_id, type, amount_usd, created_by, updated_by)
values ('aaaaaaaa-0000-0000-0000-000000000001', 'rental', 120,
        '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111');

insert into reservations
  (id, customer_name, people_count, type, starts_at, duration_minutes, created_by, updated_by)
values ('dddddddd-0000-0000-0000-000000000001', 'Maria', 2, 'rental',
        '2026-09-05 10:00:00+00', 60,
        '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111');

insert into reservation_charges (reservation_id, kind, amount, currency, payment_method, created_by)
values ('dddddddd-0000-0000-0000-000000000001', 'tariff', 120, 'USD', 'Efectivo',
        '11111111-1111-1111-1111-111111111111');

insert into deposits (reservation_id, amount, currency, created_by)
values ('dddddddd-0000-0000-0000-000000000001', 200, 'USD',
        '11111111-1111-1111-1111-111111111111');

-- Operaciones ve la reserva que tiene que despachar.
set local role authenticated;
set local request.jwt.claims to '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}';

select is(
  (select count(*)::int from reservations),
  1,
  'operaciones ve las reservas que despacha'
);

-- Operaciones SI ve precios: es informacion de catalogo, la misma que esta
-- pegada en la oficina, y le sirve para contestar en el muelle.
select is(
  (select count(*)::int from tariffs),
  1,
  'operaciones consulta las tarifas'
);

-- Operaciones NO ve movimientos de dinero de un cliente concreto.
select is(
  (select count(*)::int from reservation_charges),
  0,
  'operaciones no ve los cobros'
);
select is(
  (select count(*)::int from deposits),
  0,
  'operaciones no ve los depositos'
);

-- Reservas si los ve.
set local request.jwt.claims to '{"sub":"33333333-3333-3333-3333-333333333333","role":"authenticated"}';
select is(
  (select count(*)::int from deposits),
  1,
  'reservas si ve los depositos'
);

select * from finish();
rollback;
```

- [ ] **Step 2: Correr y verlas fallar**

```bash
npm run db:test
```

Expected: FAIL — sin RLS, operaciones ve cobros y depósitos.

- [ ] **Step 3: Escribir la migración**

Crear `supabase/migrations/20260828001300_rls_operations_money.sql`:

```sql
alter table reservations        enable row level security;
alter table reservation_items   enable row level security;
alter table reservation_guides  enable row level security;
alter table extras              enable row level security;
alter table extra_compatibility enable row level security;
alter table combos              enable row level security;
alter table combo_items         enable row level security;
alter table tariffs             enable row level security;
alter table reservation_charges enable row level security;
alter table refunds             enable row level security;
alter table deposits            enable row level security;

-- ---------------- Precios: son catalogo ----------------
-- La linea esta entre el precio de lista y el movimiento de dinero, no entre
-- "dinero si" y "dinero no". Quien esta en el muelle se topa con gente que baja
-- al lago y pregunta cuanto vale una hora de jet ski.
create policy tariffs_select on tariffs
  for select to authenticated using (true);
create policy tariffs_insert on tariffs
  for insert to authenticated
  with check (is_admin());
create policy tariffs_update on tariffs
  for update to authenticated
  using (is_admin()) with check (is_admin());

create policy extras_select on extras
  for select to authenticated using (true);
create policy extras_insert on extras
  for insert to authenticated
  with check (is_admin());
create policy extras_update on extras
  for update to authenticated
  using (is_admin()) with check (is_admin());

create policy extra_compat_select on extra_compatibility
  for select to authenticated using (true);
create policy extra_compat_insert on extra_compatibility
  for insert to authenticated
  with check (is_admin());
create policy extra_compat_update on extra_compatibility
  for update to authenticated
  using (is_admin()) with check (is_admin());

create policy combos_select on combos
  for select to authenticated using (true);
create policy combos_insert on combos
  for insert to authenticated
  with check (is_admin());
create policy combos_update on combos
  for update to authenticated
  using (is_admin()) with check (is_admin());

create policy combo_items_select on combo_items
  for select to authenticated using (true);
create policy combo_items_insert on combo_items
  for insert to authenticated
  with check (is_admin());
create policy combo_items_update on combo_items
  for update to authenticated
  using (is_admin()) with check (is_admin());

-- ---------------- Reservas ----------------
create policy reservations_select on reservations
  for select to authenticated
  using (has_area('reservas') or has_area('operaciones') or is_admin());

create policy reservations_insert on reservations
  for insert to authenticated
  with check (has_area('reservas') or is_admin());

-- Reservas modifica la reserva; operaciones despacha, cierra y ajusta la
-- duracion. Los dos escriben sobre la misma fila pero por razones distintas.
create policy reservations_update on reservations
  for update to authenticated
  using (has_area('reservas') or has_area('operaciones') or is_admin())
  with check (has_area('reservas') or has_area('operaciones') or is_admin());

create policy items_select on reservation_items
  for select to authenticated
  using (has_area('reservas') or has_area('operaciones') or is_admin());
create policy items_insert on reservation_items
  for insert to authenticated
  with check (has_area('reservas') or has_area('operaciones') or is_admin());
create policy items_update on reservation_items
  for update to authenticated
  using (has_area('reservas') or has_area('operaciones') or is_admin()) with check (has_area('reservas') or has_area('operaciones') or is_admin());

create policy guides_select on reservation_guides
  for select to authenticated
  using (has_area('reservas') or has_area('operaciones') or is_admin());
create policy guides_insert on reservation_guides
  for insert to authenticated
  with check (has_area('reservas') or is_admin());
create policy guides_update on reservation_guides
  for update to authenticated
  using (has_area('reservas') or is_admin()) with check (has_area('reservas') or is_admin());

-- ---------------- Dinero de un cliente concreto ----------------
-- Aqui si entra plata de alguien y operaciones no la recibe ni la resuelve.
-- No hay politica para operaciones: la base devuelve vacio.
create policy charges_select on reservation_charges
  for select to authenticated using (has_area('reservas') or is_admin());
create policy charges_insert on reservation_charges
  for insert to authenticated with check (has_area('reservas') or is_admin());

create policy refunds_select on refunds
  for select to authenticated using (has_area('reservas') or is_admin());
create policy refunds_insert on refunds
  for insert to authenticated with check (has_area('reservas') or is_admin());

create policy deposits_select on deposits
  for select to authenticated using (has_area('reservas') or is_admin());
create policy deposits_insert on deposits
  for insert to authenticated
  with check (has_area('reservas') or is_admin());
create policy deposits_update on deposits
  for update to authenticated
  using (has_area('reservas') or is_admin()) with check (has_area('reservas') or is_admin());
```

- [ ] **Step 4: Aplicar y correr**

```bash
npm run db:reset
npm run db:test
```

Expected: PASS — 5 de 5 en `013_rls_operations_money`.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260828001300_rls_operations_money.sql supabase/tests/013_rls_operations_money.test.sql
git commit -m "feat(db): add row level security for reservations, operations and money"
```

---

## Task 15: Tiempo real y retención

**Files:**

- Create: `supabase/migrations/20260828001400_realtime_retention.sql`
- Create: `supabase/tests/014_retention.test.sql`

**Interfaces:**

- Consumes: todas las tablas.
- Produces: la publicación de tiempo real sobre `reservations`, `reservation_items`, `equipment_units` y `equipment_stock`, y la función `purge_expired_history() → void`.

La limpieza por retención es **la única excepción a la regla de no borrar**. Por eso la función es `security definer` y la corre `pg_cron` con el rol de la base: la aplicación sigue sin ninguna política que le permita `DELETE`.

- [ ] **Step 1: Escribir las pruebas que fallan**

Crear `supabase/tests/014_retention.test.sql`:

```sql
begin;
select plan(3);

insert into auth.users (id, email)
values ('11111111-1111-1111-1111-111111111111', 'admin@arenal.local');
insert into workers (id, username, full_name, personal_email, base_role)
values ('11111111-1111-1111-1111-111111111111', 'admin', 'Leno', 'leno@correo.com', 'administracion');

-- El tablero se actualiza solo porque estas tablas estan publicadas.
select is(
  (select count(*)::int
   from pg_publication_tables
   where pubname = 'supabase_realtime'
     and tablename in ('reservations', 'reservation_items',
                       'equipment_units', 'equipment_stock')),
  4,
  'las cuatro tablas del tablero estan publicadas en tiempo real'
);

insert into reservations
  (id, customer_name, people_count, type, starts_at, duration_minutes,
   status, created_by, updated_by)
values
  ('dddddddd-0000-0000-0000-000000000001', 'Vieja', 2, 'rental',
   now() - interval '6 years', 60, 'closed',
   '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111'),
  ('dddddddd-0000-0000-0000-000000000002', 'Reciente', 2, 'rental',
   now() - interval '1 year', 60, 'closed',
   '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111');

insert into reservation_charges
  (reservation_id, kind, amount, currency, payment_method, created_by)
values ('dddddddd-0000-0000-0000-000000000001', 'tariff', 120, 'USD', 'Efectivo',
        '11111111-1111-1111-1111-111111111111');

select purge_expired_history();

select is(
  (select count(*)::int from reservations
   where id = 'dddddddd-0000-0000-0000-000000000001'),
  0,
  'una reserva de mas de cinco anos sale del historial con sus cobros'
);

select is(
  (select count(*)::int from reservations
   where id = 'dddddddd-0000-0000-0000-000000000002'),
  1,
  'una reserva dentro del plazo se conserva'
);

select * from finish();
rollback;
```

- [ ] **Step 2: Correr y verlas fallar**

```bash
npm run db:test
```

Expected: FAIL — `function purge_expired_history() does not exist`.

- [ ] **Step 3: Escribir la migración**

Crear `supabase/migrations/20260828001400_realtime_retention.sql`:

```sql
-- Es lo que hace que el tablero se actualice en todos los dispositivos cuando
-- un companero despacha, sin que nadie refresque la pantalla.
alter publication supabase_realtime add table reservations;
alter publication supabase_realtime add table reservation_items;
alter publication supabase_realtime add table equipment_units;
alter publication supabase_realtime add table equipment_stock;

create extension if not exists pg_cron with schema extensions;

-- Unica excepcion al no borrado: el principio protege el historial mientras es
-- util, y la retencion define hasta cuando lo es. Corre con el rol de la base;
-- la aplicacion no tiene ninguna politica que le permita DELETE.
create function purge_expired_history() returns void
language plpgsql security definer set search_path = public as $$
declare
  reservation_cutoff timestamptz := now() - interval '5 years';
  count_cutoff       timestamptz := now() - interval '1 year';
  expired            uuid[];
begin
  select array_agg(id) into expired
  from reservations
  where status in ('closed', 'cancelled')
    and ends_at < reservation_cutoff;

  if expired is not null then
    -- El reporte de dano sobrevive a la reserva: es historial de la maquina,
    -- y sin el no cuadra cuanto se ha gastado en mantenerla.
    update damage_reports set reservation_id = null
      where reservation_id = any(expired);

    -- Una reserva partida puede tener hijas mas nuevas que la original.
    update reservations set parent_reservation_id = null
      where parent_reservation_id = any(expired)
        and not (id = any(expired));

    delete from reservation_charges where reservation_id = any(expired);
    delete from refunds             where reservation_id = any(expired);
    delete from deposits            where reservation_id = any(expired);
    delete from reservation_guides  where reservation_id = any(expired);
    delete from reservation_items   where reservation_id = any(expired);
    delete from reservations        where id = any(expired);
  end if;

  -- Las lineas caen solas: son hijas del conteo y no tienen vida propia.
  delete from inventory_counts where counted_at < count_cutoff;
end $$;

-- Una vez al mes, de madrugada.
select cron.schedule(
  'purge-expired-history',
  '0 3 1 * *',
  $$ select purge_expired_history(); $$
);
```

Si el plan de Supabase no alcanza para cinco años de reservas, el ajuste es cambiar `interval '5 years'` a `'2 years'` en una migración nueva. El esquema no se toca.

- [ ] **Step 4: Aplicar y correr**

```bash
npm run db:reset
npm run db:test
```

Expected: PASS — 3 de 3 en `014_retention`.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260828001400_realtime_retention.sql supabase/tests/014_retention.test.sql
git commit -m "feat(db): publish the dashboard tables for realtime and add history retention"
```

---

## Task 16: Inventario real y catálogo inicial

**Files:**

- Create: `supabase/seed.sql`

**Interfaces:**

- Consumes: todo el esquema.
- Produces: las categorías con su comportamiento, las unidades que la empresa tiene hoy y la cuenta de administración inicial.

Las cantidades de jet skis, kayaks y lanchas salen del sistema anterior, que es dato verificado. Lo consumible —chalecos, remos, extintores— entra en cero: la aplicación es un CRUD y administración registra las cantidades reales desde su pantalla, que es justo la historia `US-ADM-...` de gestionar cantidades.

- [ ] **Step 1: Escribir el seed**

Crear `supabase/seed.sql`:

```sql
-- Datos iniciales de Arenal Water Sports.
-- Se aplica solo con `supabase db reset` en local; no corre en produccion.

-- La cuenta de administracion. Su correo personal es obligatorio porque es su
-- unica salida cuando pierde la contrasena.
insert into auth.users (id, email, encrypted_password, email_confirmed_at)
values ('00000000-0000-0000-0000-000000000001', 'admin@arenal.local',
        extensions.crypt('Arenal.2026', extensions.gen_salt('bf')), now())
on conflict do nothing;

insert into workers (id, username, full_name, personal_email, base_role, must_change_password)
values ('00000000-0000-0000-0000-000000000001', 'admin', 'Leno',
        'lenokeckler13@gmail.com', 'administracion', true)
on conflict do nothing;

-- ---------------- Categorias ----------------
-- Identificadas una por una: llevan motor, gasolina, uso, golpes y fotos.
insert into equipment_categories
  (name, tracking_mode, is_reservable, has_motor, usage_metric, consumes_fuel,
   has_condition_photos, guide_only, default_duration_minutes,
   deposit_usd, deposit_crc, created_by, updated_by)
values
  ('Jet Ski',     'by_unit', true, true, 'engine_hours', true, true, false, 60,
   200, 100000, '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001'),
  ('Lancha',      'by_unit', true, true, 'engine_hours', true, true, true,  60,
   200, 100000, '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001'),
  ('Cuadraciclo', 'by_unit', true, true, 'kilometers',   true, true, true,  60,
   200, 100000, '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001');

-- Llevadas por cantidad y reservables: no tienen historia propia por pieza.
insert into equipment_categories
  (name, tracking_mode, is_reservable, default_duration_minutes, created_by, updated_by)
values
  ('Kayak doble',      'by_quantity', true, 60,
   '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001'),
  ('Kayak individual', 'by_quantity', true, 60,
   '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001'),
  ('Paddleboard',      'by_quantity', true, 60,
   '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001'),
  ('Tabla de wake',    'by_quantity', true, 60,
   '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001');

-- Llevadas por cantidad y no reservables: viven en el inventario, se cuentan.
insert into equipment_categories
  (name, tracking_mode, is_reservable, alert_min_quantity, alert_expiry_days,
   created_by, updated_by)
values
  ('Chaleco',   'by_quantity', false, 5,    null,
   '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001'),
  ('Remo',      'by_quantity', false, 4,    null,
   '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001'),
  ('Extintor',  'by_quantity', false, null, 30,
   '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001'),
  ('Botiquin',  'by_quantity', false, null, 30,
   '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001'),
  ('Parrilla',  'by_quantity', false, null, null,
   '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001');

-- ---------------- Unidades ----------------
-- Cuatro jet skis, tal como los tiene la empresa.
insert into equipment_units (category_id, code, created_by, updated_by)
select c.id, 'JET-0' || n,
       '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001'
from equipment_categories c, generate_series(1, 4) n
where c.name = 'Jet Ski';

-- Las dos lanchas. No admiten los mismos extras, por eso llevan codigo propio.
insert into equipment_units (category_id, code, created_by, updated_by)
select c.id, code,
       '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001'
from equipment_categories c, (values ('PONTOON'), ('BENNINGTON')) as v(code)
where c.name = 'Lancha';

-- ---------------- Stock ----------------
-- Seis kayaks dobles y tres individuales, del inventario anterior. El resto
-- arranca en cero: administracion registra las cantidades reales desde la
-- aplicacion, que para eso es un CRUD.
insert into equipment_stock (category_id, quantity_available, updated_by)
select c.id,
       case c.name
         when 'Kayak doble'      then 6
         when 'Kayak individual' then 3
         else 0
       end,
       '00000000-0000-0000-0000-000000000001'
from equipment_categories c
where c.tracking_mode = 'by_quantity';

-- ---------------- Extras ----------------
insert into extras (name, price_usd, created_by, updated_by)
values
  ('Parrilla',    25, '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001'),
  ('Tubing',      30, '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001'),
  ('Wakeboard',   35, '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001'),
  ('Paddleboard', 20, '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001');

-- El pontoon lleva parrilla y paddleboard; el bennington va para wakeboard.
insert into extra_compatibility (extra_id, unit_id)
select e.id, u.id
from extras e, equipment_units u
where (e.name in ('Parrilla', 'Paddleboard') and u.code = 'PONTOON')
   or (e.name in ('Wakeboard', 'Tubing')     and u.code = 'BENNINGTON');
```

- [ ] **Step 2: Aplicar el seed**

```bash
npm run db:reset
```

Expected: las migraciones se aplican y el seed corre sin error.

- [ ] **Step 3: Verificar que quedó cargado**

La base local siempre escucha en el mismo puerto, así que la URL es fija:

```bash
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres \
  -c "select name, tracking_mode, is_reservable from equipment_categories order by name;" \
  -c "select code from equipment_units order by code;" \
  -c "select c.name, s.quantity_available from equipment_stock s join equipment_categories c on c.id = s.category_id order by c.name;"
```

Si `psql` no está instalado en la máquina, la misma consulta corre desde el
Studio local que `supabase start` deja en http://127.0.0.1:54323.

Expected: 12 categorías, 6 unidades (`BENNINGTON`, `JET-01` a `JET-04`, `PONTOON`), y el stock con 6 kayaks dobles, 3 individuales y el resto en cero.

- [ ] **Step 4: Correr toda la suite una vez más**

```bash
npm run db:test
```

Expected: PASS en los trece archivos de prueba. El seed no debe romper ninguno, porque cada prueba corre dentro de su propia transacción con `rollback`.

- [ ] **Step 5: Commit**

```bash
git add supabase/seed.sql
git commit -m "feat(db): seed the catalog, the real equipment and the admin account"
```

---

## Task 17: Tipos de TypeScript y capa de acceso

**Files:**

- Create: `app/types/database.types.ts` (generado)
- Create: `app/types/Database.ts`
- Create: `vitest.config.ts`
- Create: `app/services/supabase/tests/client.test.ts`
- Modify: `app/services/supabase/client.ts`
- Modify: `app/services/supabase/server.ts`
- Modify: `app/types/index.ts`
- Modify: `package.json`

**Interfaces:**

- Consumes: el esquema completo.
- Produces: el tipo `Database` y los clientes tipados `createBrowserSupabaseClient(): SupabaseClient<Database>` y `createServerSupabaseClient(): Promise<SupabaseClient<Database>>`. Todo el código de la aplicación consume estos dos.

- [ ] **Step 1: Generar los tipos desde el esquema real**

```bash
npm run db:types
```

Expected: crea `app/types/database.types.ts` con `export type Database = { public: { Tables: {...}, Enums: {...} } }`.

- [ ] **Step 2: Instalar Vitest**

El `unit-testing-standards` del profe dice que no hay runner en el repo y fija cuál usar al introducirlo.

```bash
npm install --save-dev vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom
```

Agregar a `"scripts"` en `package.json`:

```json
"test": "vitest",
"test:run": "vitest run"
```

- [ ] **Step 3: Configurar Vitest**

Crear `vitest.config.ts`:

```ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    exclude: ["node_modules", ".next", "docs"],
    // El cliente de Supabase valida la forma de la URL al construirse. Sin
    // esto la prueba fallaría por falta de entorno y no por lo que mide.
    env: {
      NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
      NEXT_PUBLIC_SUPABASE_ANON_KEY:
        "local-anon-key-for-tests",
    },
  },
  resolve: {
    alias: { "@": resolve(__dirname, ".") },
  },
});
```

`docs` va excluido porque `docs/referencia/` guarda código del sistema anterior que no compila contra este proyecto.

- [ ] **Step 4: Escribir la prueba que falla**

Crear `app/services/supabase/tests/client.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createBrowserSupabaseClient } from "@/app/services";

describe("createBrowserSupabaseClient", () => {
  it("expone las tablas del esquema con sus tipos", () => {
    const supabaseClient = createBrowserSupabaseClient();

    expect(supabaseClient.from("workers")).toBeDefined();
    expect(
      supabaseClient.from("reservations")
    ).toBeDefined();
    expect(
      supabaseClient.from("equipment_categories")
    ).toBeDefined();
  });
});
```

- [ ] **Step 5: Correr y verla fallar**

```bash
npm run test:run
```

Expected: FAIL — `Argument of type '"workers"' is not assignable`, porque el cliente todavía no está tipado.

- [ ] **Step 6: Crear el alias de tipos**

Crear `app/types/Database.ts`:

```ts
export type { Database } from "./database.types";
```

Agregar al final de `app/types/index.ts`:

```ts
export type { Database } from "./Database";
```

- [ ] **Step 7: Tipar los clientes**

En `app/services/supabase/client.ts`, reemplazar el cuerpo por:

```ts
import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE } from "@/app/constants";
import type { Database } from "@/app/types";

/**
 * Supabase client for Client Components.
 * Reads the session from the browser cookies written by the server client.
 */
export const createClient = () =>
  createBrowserClient<Database>(
    SUPABASE.URL,
    SUPABASE.ANON_KEY
  );
```

En `app/services/supabase/server.ts`, cambiar la línea de la llamada y agregar el import:

```ts
import type { Database } from "@/app/types";
```

```ts
  return createServerClient<Database>(
```

- [ ] **Step 8: Correr y verla pasar**

```bash
npm run test:run
```

Expected: PASS — 1 de 1.

- [ ] **Step 9: Verificar que el proyecto entero sigue sano**

```bash
npm run format
npm run lint
npm run typecheck
npm run build
```

Expected: los cuatro pasan.

- [ ] **Step 10: Commit**

```bash
git add app/types vitest.config.ts app/services/supabase package.json package-lock.json
git commit -m "feat: generate database types and wire them into the Supabase clients"
```

---

## Cierre

Al terminar las diecisiete tareas:

```bash
npm run db:reset && npm run db:test && npm run test:run && npm run build
```

Los cuatro tienen que pasar antes de mezclar la rama a `develop`.

**Lo que este plan deja listo:** el esquema completo en migraciones versionadas, catorce archivos de pruebas pgTAP que verifican las restricciones y las políticas, los tipos de TypeScript generados desde el esquema real, los clientes tipados, y el inventario cargado.

**Lo que no cubre, a propósito:** ninguna pantalla. El módulo de Acceso y Sesión es el siguiente ciclo de spec y plan, y arranca desde este esquema.

**Lo que hay que hacer aparte, fuera de este plan:** crear el proyecto de Supabase en la nube y aplicar las migraciones con `supabase link` y `supabase db push`. Eso necesita las credenciales del proyecto, que hoy no existen.
