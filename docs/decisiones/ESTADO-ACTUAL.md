# Estado actual — retomar desde aquí

Última actualización: 2026-08-31.

Este archivo existe para que el trabajo se pueda retomar mañana, o desde otra
máquina, o por otra persona, sin depender de que nadie recuerde nada. Si algo
de aquí contradice al código, gana el código.

---

## Cómo volver a arrancar la máquina

Después de reiniciar, la base de datos local **no queda levantada sola**. Los
contenedores de Supabase corren en Docker y hay que volver a encenderlos:

```bash
cd "C:/Users/lenok/Desktop/TEC SEMESTRE II, 2026/WEB/1. Proyecto"
npm run db:start      # tarda un poco la primera vez tras reiniciar
npm run dev
```

Para retomar la conversación con Claude Code, en esa misma carpeta:

```bash
claude --continue
```

Credenciales sembradas tras `npm run db:reset`: usuario `admin`, contraseña
`Arenal.2026`. Esa cuenta arranca con `must_change_password = true`, así que
el primer inicio de sesión pasa siempre por `/acceso/primer-ingreso` antes de
llegar a cualquier otra pantalla — no es un defecto, es la historia
US-ACC-003.

Comandos que importan:

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Levanta la aplicación en http://localhost:3000 |
| `npm run db:start` / `db:stop` | Enciende y apaga Supabase local |
| `npm run db:reset` | Rehace la base y carga el inventario real |
| `npm run db:test` | Corre las 365 pruebas del esquema (sin seed, a propósito) |
| `npm run lint` / `typecheck` / `build` | Verificación de la aplicación |

### Cuidado con `npm run format`

`.prettierrc.json` fija `printWidth: 60`, más angosto de lo habitual, y una
buena parte del código ya escrito (varios archivos de `worker-form`,
`worker-detail`, `board`, `acceso`, etc.) nunca se pasó por ese ancho —
probablemente porque se escribió antes de que ese valor quedara fijado, o
porque un agente lo escribió a mano sin correr `format` después. El resultado
es que `npm run format` hoy reescribe decenas de archivos ajenos a lo que se
esté tocando, solo por el ancho de línea, no por errores de estilo reales.

**No commitear ese reformateo masivo por accidente.** Antes de comprometer
cualquier cambio: revisar `git status`, y si `format` tocó archivos fuera del
alcance de la tarea, hacer `git checkout HEAD -- <esos archivos>` y dejar solo
el propio diff. Sí vale la pena correr `npx prettier --check <los archivos
propios>` para confirmar que el código nuevo cumple el ancho de 60, sin
arrastrar al resto del repositorio. Esta sesión se topó con esto y así lo
resolvió; vale la pena corregir el drift de una vez en una tarea dedicada,
pero no como efecto secundario de otra cosa.

---

## Convención de manejo de errores en la capa de datos

Toda la capa de lectura (`app/utils/**`) desestructuraba `const { data } =
await supabase...` sin mirar `error`. Eso ya costó un defecto real: el embed
ambiguo de `worker_areas` (ver más abajo, "Validó EP-ADM-01") fallaba con
`PGRST201` en cada petición, y `fetchWorkersPage` se tragaba el error y
mostraba "No hay trabajadores" con la cuenta de administración sembrada en
la base. Diez historias terminadas se veían como una pantalla vacía.

**La regla desde ahora:** cualquier consulta o `.rpc()` contra Supabase
desestructura `error` junto con `data` y lo pasa por
`throwIfSupabaseError(error, "modulo.nombreDeLaFuncion")` —
`app/utils/supabase-error/SupabaseError.ts` — antes de tocar `data`. Esa
función lanza `SupabaseQueryError` cuando `error` no es `null`; un
`data: null` legítimo (por ejemplo `.maybeSingle()` sin filas) sigue
devolviendo `null`/lista vacía como siempre, porque ese caso reporta
`error: null`. Dentro de un `Promise.all`, cada resultado se revisa por
separado después del `await` (ver `categoryHasRecords`,
`fetchWorkerPermissionState`, `fetchWorkerAreaState`, `fetchPriceList` para
el patrón).

El mensaje de `SupabaseQueryError` lleva el código y el texto crudo de
Postgrest — es solo para el registro del servidor (`console.error`/logs de
`next start`), nunca se muestra al usuario.

**La interfaz de error que faltaba** también se construyó en esta sesión:

- `app/error.tsx` — límite de error de Next.js (App Router). Atrapa
  cualquier excepción no manejada bajo el layout raíz, incluida la que
  ahora lanza `throwIfSupabaseError`. Botones para reintentar (`reset`) y
  volver a `/tablero`.
- `app/not-found.tsx` — para una URL que no resuelve. Botón para volver a
  `/tablero`.
- `app/global-error.tsx` — el límite de último recurso si el propio
  `app/layout.tsx` falla; define su propio `<html>`/`<body>` según exige
  Next.js, y no importa componentes compartidos por si la falla viene de un
  provider del que esos componentes también dependen.

Los tres están en español, con lenguaje de persona, y sin volcar el error
crudo ni el stack en pantalla. Los textos viven en
`app/constants/errors/ErrorScreen.constants.ts` y
`.../NotFoundScreen.constants.ts`.

**Una limitación real de verificación, para que el próximo agente no se
alarme:** un límite de error de React (`error.tsx`) solo se puede confirmar
visualmente con un navegador real. En `next start` (producción), la
respuesta inicial para una ruta que lanza una excepción es un documento
HTML casi vacío (`<html id="__next_error__">` con un `<div hidden>`) — el
contenido real de `error.tsx` se monta recién cuando React hidrata en el
cliente. `curl` nunca ejecuta JavaScript, así que nunca va a "ver" el texto
de `error.tsx` en el HTML crudo, aun cuando todo funciona bien. Lo que sí
se puede confirmar sin navegador, y es lo que se confirmó en esta sesión:

1. El código de estado cambia de `200` (con contenido vacío disfrazado de
   "sin resultados") a `500` real.
2. El `RSC payload`/manifest de la ruta referencia `app/error.tsx` como el
   componente de error de ese segmento (`grep` sobre
   `.next/server/app/<ruta>/page_client-reference-manifest.js` por
   `"app/error.tsx"`).
3. El log del servidor (`next start`/`next dev`, stdout) imprime el mensaje
   de `SupabaseQueryError` con la consulta exacta que falló, no un error
   genérico.

Se rompió a propósito `WORKER_SELECT` en
`app/utils/administracion/workers.ts` (el mismo `worker_areas(area)` sin
calificar del defecto original) contra la base reseteada, se confirmaron
los tres puntos de arriba, y se revirtió. La base terminó con
`npm run db:reset` para no dejar la cuenta `admin` con
`must_change_password = false` (se cambió temporalmente por script para
poder armar una sesión autenticada sin pasar por `/acceso/primer-ingreso`
en cada prueba).

---

## Qué está terminado

| | Estado |
| --- | --- |
| Base del profe adaptada, Firebase sustituido por Supabase | ✅ |
| Agentes y skills a nivel de proyecto, documentos convertidos | ✅ |
| **Modelo de datos** — 24 tablas, seguridad por fila, disponibilidad, tiempo real, retención | ✅ 365 pruebas |
| **Sistema de diseño** — tokens de Stitch en Tailwind 4, fuentes autoalojadas, imágenes del equipo | ✅ |
| **Módulo Acceso y Sesión** — 11 historias | ✅ |
| **Módulo Tablero y Navegación** — 10 historias | ✅ |
| **EP-ADM-01 — Trabajadores** — validado de punta a punta contra la app corriendo | ✅ |
| **EP-ADM-02 — Catálogo de categorías** | ✅ |
| **EP-ADM-03 — Unidades y artículos del inventario** | ✅ |
| **EP-ADM-04 — Extras de las lanchas** | ✅ |
| **EP-ADM-05 — Combos y tarifas** | ✅ |
| **EP-ADM-06 — Estadísticas y reportes** | ✅ |
| **Módulo Administración completo** — 31 historias, EP-ADM-01 a EP-ADM-06 | ✅ |
| **Módulo Reservas completo** — 33 historias, EP-RES-01 a EP-RES-07 | ✅ |Progreso: **85 de 112 historias, un 76%**. Son las 11 de Acceso, las 10 de
Tablero (9 del backlog original más `US-TAB-010`), las 31 de Administración y
las 33 de Reservas. Queda un solo módulo: **Operaciones, 27 historias**.

La aplicación ya hace el trabajo de la empresa: se puede agendar una reserva,
armarla con combos y extras, asignarle guías, modificarla, dividirla,
posponerla, cancelarla, cobrarla en dos tractos y en dos monedas, y resolver
su depósito. Lo que falta es el lado del muelle: despachar, cerrar, y el
cuidado de las máquinas y del inventario.

---

## Dónde se quedó el trabajo

**Rama activa: `feat/modulo-administracion`**, sacada de `develop`.

El módulo de Administración quedó **completo**: las seis épicas, las 31
historias, de US-ADM-001 a US-ADM-031. Lo que se construyó por dispatch, en
orden:

| Commit | Épica | Historias |
| --- | --- | --- |
| `d37953a` y anteriores | EP-ADM-01 a 03 — trabajadores, categorías, unidades | US-ADM-001 a 018 |
| `3d1de5e` | EP-ADM-04 — extras de las lanchas | US-ADM-019 a 021 |
| `f819b6c` | EP-ADM-05 — combos y tarifas | US-ADM-022 a 025 |
| `28e858b` | EP-ADM-06 — estadísticas y reportes | US-ADM-026 a 031 |
| `968acd0` | Arreglo de seguridad sobre `unit_current_state` | — |

Las decisiones que conviene no volver a discutir:

- **EP-ADM-04.** La compatibilidad de un extra es **por unidad, no por
  categoría**, porque esa es la forma de `extra_compatibility`. Solo se puede
  editar una vez que el extra existe. `occupies_category_id` y
  `occupies_quantity` se mueven juntos y el selector solo ofrece categorías
  `by_quantity`: una categoría `by_unit` tiene fichas, no una cantidad que
  algo pueda ocupar. Un extra nunca usado se borra de verdad; uno ya usado
  solo se marca inactivo.
- **EP-ADM-05.** Los ítems de un combo solo se editan cuando el combo ya
  existe. Agregar y cambiar cantidad van por el cliente del propio
  administrador; **quitar** necesita ruta de servidor con `service role`,
  porque `DELETE` está revocado para `authenticated` a nivel de base — igual
  que el borrado de categorías y el de extras. Las tarifas no tienen borrado:
  la historia solo pide crear y modificar, y `reservation_charges` guarda su
  propio monto, así que cambiar una tarifa nunca toca dinero ya cobrado. Al
  editar una tarifa, categoría y tipo quedan bloqueados (cambiarlos podría
  chocar con la fila única `(category_id, type)`).
- **EP-ADM-06.** **Los números los calcula la base, no TypeScript.** La
  migración `20260828001500_reports.sql` agrega siete vistas, todas con
  `security_invoker = true`. Los ingresos se agrupan por día o mes **y por
  moneda**: dos monedas el mismo día son dos renglones, nunca una suma, porque
  el sistema no maneja tipo de cambio. El tablero de reportes es un Server
  Component con un gráfico de barras en CSS puro — no se agregó ninguna
  librería de gráficos.

### El arreglo de seguridad que cerró el hallazgo pendiente

El dispatch de EP-ADM-06 dejó anotado un hallazgo sin resolver: las vistas
`unit_current_state` y `category_availability` se habrían creado sin
`security_invoker`. Se revisó y **la mitad era falsa**:
`category_availability` y `unit_conflicts` son **funciones**, no vistas, y
ninguna es `security definer`, así que ya corrían con los privilegios de
quien las llama. La otra mitad era real y ya está arreglada.

`unit_current_state` sí era la única vista del esquema sin la opción. Por
omisión Postgres deja `security_invoker` en `false`, así que la vista
evaluaba la seguridad por fila como su dueño —`postgres`, superusuario— y no
como quien consulta. `units_select` es abierto a cualquier autenticado, así
que las columnas de la unidad no filtraban nada nuevo; pero
`reservations_select` e `items_select` exigen
`has_area('reservas') or has_area('operaciones') or is_admin()`, y la vista
expone `reservation_id` y `returns_at` sacados justo de esas dos tablas.

Se reprodujo contra la base sembrada, antes de arreglar, con un trabajador
al que se le quitó su única área: `select count(*) from reservations` le
devolvía **0 filas**, y la misma persona leía por la vista el identificador
de la reserva despachada y su hora de regreso. `US-TAB-007` pide lo
contrario con todas sus letras — la restricción no se queda en esconder
botones — y una vista que salta el RLS es exactamente ese otro camino.

La migración `20260828001550_unit_current_state_security_invoker.sql` lo
corrige con un `alter view ... set (security_invoker = true)`: no recrea la
vista, no toca su definición ni sus dependientes, solo cambia cómo se evalúa
el RLS. Los permisos de `select` que la vista ahora necesita sobre las tablas
de abajo ya estaban otorgados a `authenticated`, así que no hizo falta
ninguno nuevo.

**La regla, de aquí en adelante:** toda vista nueva se crea con
`with (security_invoker = true)`, sin excepción. Una vista sin esa opción es
una puerta lateral alrededor del RLS, y en este esquema el RLS es la única
capa que separa lo que ve administración de lo que ve un guía.

Cinco pruebas pgTAP nuevas en `010_availability.test.sql` lo fijan: un
trabajador sin área sigue viendo la fila de la unidad —`units_select` es
abierto— pero recibe `null` en `reservation_id` y en `returns_at` y lee la
unidad como disponible (menos información, nunca información ajena), mientras
que operaciones sigue viendo el despacho activo igual que antes. La suite va
en **362 pruebas, todas pasando**.

**Lo que falta del proyecto:** Reservas (33 historias, siete épicas, de
EP-RES-01 calendario a EP-RES-07 cobros, descuentos y depósitos) y
Operaciones (27 historias). Son los dos módulos donde vive la lógica real del
negocio —despacho, cierre, choques de disponibilidad, cobros y depósitos— así
que son bastante más difíciles que Administración, que era sobre todo CRUD.


## Cómo se está trabajando

Decisión del dueño, tomada por presupuesto: **construir primero, probar
después.** Sin suites de pruebas por tarea, sin agentes revisores, sin
rondas de arreglo.

Lo único que se conserva es que cada agente **abra las pantallas y las mire
una vez**. No es control de calidad, es la diferencia entre entregar algo
que funciona y algo que compila: los últimos defectos del proyecto —el seed
que no dejaba entrar a nadie, los íconos que se leían como palabras, las
tarjetas estiradas, y ahora el embed ambiguo de `worker_areas`— eran todos
invisibles en el código y evidentes en pantalla o en una petición real. Sin
navegador gráfico, el sustituto que ha funcionado en esta sesión es una
sesión autenticada armada por script (ver más arriba) más `curl` contra la
app y consultas directas a la base con `psql` para confirmar el resultado.

Cuando el dueño lo diga, viene una pasada de pruebas y de detalles.

---

## Lo que hace falta del dueño

Ninguna de estas frena el trabajo, pero sin ellas el proyecto no sale de
local:

1. **Credenciales del proyecto de Supabase en la nube.** Todo corre y se
   prueba contra la base local; no existe todavía un proyecto en la nube al
   que subir las migraciones.
2. **Las cantidades reales de remos, extintores y botiquines** (chalecos ya
   se puede registrar desde `/administracion/unidades`, que para eso es un
   CRUD ahora). Siguen en cero a propósito.

Y dos pendientes de mirar, no de hacer:

- **Nadie ha visto ninguna pantalla con ojos.** El entorno donde corren los
  agentes no tiene navegador, así que todo se verificó con peticiones
  autenticadas y lectura del texto renderizado; el comportamiento a 390px y a
  1440px se dedujo de las clases Tailwind usadas, nunca se miró. Ya son once
  pantallas sin revisar: `/tablero`, `/administracion/categorias`,
  `/administracion/unidades`, `/administracion/extras`,
  `/administracion/combos`, `/administracion/tarifas` y
  `/administracion/reportes`, más los formularios de cada una. Vale la pena
  abrirlas y decir si algo se ve mal **antes** de arrancar Reservas, porque
  Reservas reutiliza estos mismos patrones de lista y de formulario y
  cualquier defecto visual se va a multiplicar.
- **El drift de `npm run format`** descrito arriba. No bloquea nada, pero
  cuanto más tiempo pase, más grande será el diff de la limpieza.

---

## Dónde está cada cosa

| Ruta | Qué hay |
| --- | --- |
| `docs/proyecto/` | Las 112 historias, el flujo y el backlog, en Markdown |
| `docs/superpowers/specs/` | El diseño del modelo de datos y el del módulo de acceso |
| `docs/superpowers/plans/` | El plan de implementación del modelo de datos |
| `docs/referencia/stitch/` | Los 23 diseños descargados, con su HTML y CSS |
| `docs/decisiones/` | Este archivo y la bitácora de decisiones tomadas |
| `supabase/migrations/` | El esquema, migración por migración |
| `supabase/tests/` | Las 325 pruebas pgTAP |
| `scripts/stitch.sh` | Habla con el servidor MCP de Stitch por HTTP |

`AGENTS.md` en la raíz es el contrato: qué estándares aplican y en qué orden.
Cualquier agente lo lee primero.
