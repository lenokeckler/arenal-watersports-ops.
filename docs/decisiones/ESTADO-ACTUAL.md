# Estado actual — retomar desde aquí

Última actualización: 2026-08-30.

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
| `npm run db:test` | Corre las 325 pruebas del esquema (sin seed, a propósito) |
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

## Qué está terminado

| | Estado |
| --- | --- |
| Base del profe adaptada, Firebase sustituido por Supabase | ✅ |
| Agentes y skills a nivel de proyecto, documentos convertidos | ✅ |
| **Modelo de datos** — 24 tablas, seguridad por fila, disponibilidad, tiempo real, retención | ✅ 325 pruebas |
| **Sistema de diseño** — tokens de Stitch en Tailwind 4, fuentes autoalojadas, imágenes del equipo | ✅ |
| **Módulo Acceso y Sesión** — 11 historias | ✅ |
| **Módulo Tablero y Navegación** — 10 historias | ✅ |
| **EP-ADM-01 — Trabajadores** — validado de punta a punta contra la app corriendo | ✅ |
| **EP-ADM-02 — Catálogo de categorías** | ✅ |
| **EP-ADM-03 — Unidades y artículos del inventario** | ✅ |

Progreso general estimado: **~40%**. Son alrededor de 27 de 112 historias
(EP-ADM-01 ya contaba; EP-ADM-02 son 4 historias más, EP-ADM-03 son 3 más),
con la fundación —esquema, seguridad, diseño, autenticación— completa desde
antes.

---

## Dónde se quedó el trabajo

**Rama activa: `feat/modulo-administracion`**, sacada de `develop`. No se hizo
merge; eso lo hace el dueño.

Esta sesión hizo dos cosas, en este orden:

### 1. Validó EP-ADM-01 de punta a punta y encontró un defecto real

Nadie había ejecutado nunca la gestión de trabajadores. Se levantó el
servidor, se armó una sesión autenticada por script (Node + `@supabase/ssr`
con un cookie jar en memoria, porque el entorno no tiene navegador — el mismo
truco sirve para cualquier tarea futura que necesite probar algo detrás de
sesión) y se recorrió la cadena completa: login como `admin`, primer ingreso
forzado, creación de un trabajador desde la propia interfaz, login como ese
trabajador con la contraseña temporal, su propio primer ingreso, filtros y
paginación de la lista, otorgar y revocar un área y una marca, bloquear
(con el corte de sesión inmediato que exige el proxy) y reactivar, reponer
contraseña temporal, y un guía externo con extensión de caducidad. Cada paso
quedó verificado contra la base real, no simulado.

**El defecto encontrado y arreglado** (commit `fix(admin): disambiguate the
worker_areas/worker_marks embed`): `worker_areas` y `worker_marks` tienen cada
una dos llaves foráneas hacia `workers` (`worker_id` y `granted_by`), así que
el embed sin calificar `worker_areas(area)` en `WORKER_SELECT`
(`app/utils/administracion/workers.ts`) fallaba con `PGRST201` en **cada**
petición. `fetchWorkerDetail` lo mostraba como un 404 en toda ficha de
trabajador; `fetchWorkersPage` se tragaba el error y mostraba la lista vacía
— con la cuenta de administración ya sembrada en la base. Arreglado
calificando ambos embeds con el nombre exacto de la relación
(`worker_areas!worker_areas_worker_id_fkey`, etc.).

También se detectó que la contraseña sembrada del `admin` no coincidía con
`Arenal.2026` en el volumen de Docker que traía esta máquina (probablemente de
una siembra anterior a la actual `seed.sql`). Se resolvió con `npm run
db:reset`, que documentación y seed ya cubren — no era un defecto del código,
solo una base desincronizada.

### 2. Construyó EP-ADM-02 y EP-ADM-03 sobre el camino que ya estaba trazado

**EP-ADM-02 — Catálogo de categorías** (US-ADM-012 a 015): `/administracion/
categorias` (lista con búsqueda, filtro por modalidad y por estado,
paginación en servidor, igual que `WorkerList`) y `/administracion/
categorias/nueva` + `/[categoryId]` con un `CategoryForm` compartido. El
`tracking_mode` se bloquea en edición cuando `categoryHasRecords` es
verdadero — verificado en vivo con Jet Ski (tiene unidades: aparece
bloqueado) y con una categoría recién creada (no lo está). El botón elimina
cuando la categoría nunca tuvo registros y marca inactiva cuando ya los tuvo,
con reactivación disponible. Insertar y actualizar van directo por el cliente
autenticado del propio administrador; borrar necesitó la única ruta de
servidor nueva de este dispatch (`DELETE /api/administracion/categorias/
[categoryId]`), porque `DELETE` está revocado para `authenticated` a nivel de
base. La contradicción de la historia (una categoría reservable "siempre" se
identifica por unidad) sigue resuelta como ya estaba documentado: los kayaks
son reservables y se llevan por cantidad, y el código sigue el esquema, no el
texto de la historia.

**EP-ADM-03 — Unidades y artículos** (US-ADM-016 a 018): `/administracion/
unidades` es un hub sobre toda categoría activa, que entra a
`/administracion/unidades/[categoryId]`, y esa pantalla se bifurca según
`tracking_mode` — exactamente la misma decisión que ya toma la base
(`units_check_category_mode` / `stock_check_category_mode`):

- **`by_unit`**: lista de fichas (`UnitList`), con `/nueva` y `/[unitId]`
  compartiendo `UnitForm`. Los campos de gasolina y uso de motor solo
  aparecen si la categoría realmente consume gasolina o lleva motor. Dar de
  baja es una acción aparte y terminal: pide el motivo con un
  `window.prompt` (no existe un componente de diálogo con campo de texto en
  este código base todavía; se documentó la decisión en el propio hook), y
  la unidad desaparece de la lista para siempre, aunque su URL directa sigue
  resolviendo con la nota de "dada de baja".
- **`by_quantity`**: `StockForm` edita la única fila de existencias de la
  categoría y, solo cuando alguna cantidad realmente cambia, registra un
  movimiento en `equipment_stock_movements` y lo antepone al historial
  visible — tocar solo la fecha de vencimiento no registra nada. Si la fila
  de stock nunca se aprovisionó (categoría creada después del seed), el
  formulario cae a un insert en vez de un update.

Ninguna escritura de este dispatch necesitó ruta de servidor nueva salvo el
borrado de categorías: nada más en EP-ADM-03 se elimina.

Todo lo anterior quedó verificado en vivo contra la app corriendo y Supabase
local, y la base se dejó reseteada al estado sembrado limpio al terminar
(`npm run db:reset`) — no quedan trabajadores ni categorías de prueba.

**Lo que falta de Administración:** EP-ADM-04 (extras de las lanchas),
EP-ADM-05 (combos y tarifas) y EP-ADM-06 (estadísticas y reportes). Ninguno
tiene una sola pantalla construida todavía.

**Después de Administración:** Reservas (33 historias) y Operaciones (27). Son
los dos módulos donde vive la lógica real del negocio —despacho, cierre,
choques de disponibilidad, cobros y depósitos— así que son más difíciles que
Administración, que es sobre todo CRUD.

---

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

- **Nadie ha visto el tablero, ni las pantallas nuevas de esta sesión, con
  ojos.** El entorno donde corren los agentes no tiene navegador, así que se
  verificó con peticiones y lectura del texto renderizado a 
  390px/1440px solo por las clases Tailwind usadas, nunca visualmente. Vale
  la pena abrir `/tablero`, `/administracion/categorias` y
  `/administracion/unidades` y decir si algo se ve mal.
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
