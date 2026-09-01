# Estado actual — retomar desde aquí

Última actualización: 2026-09-01.

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
| `npm run db:test` | Corre las 418 pruebas del esquema (sin seed, a propósito) |
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

**Las 112 historias del proyecto están construidas.**

| | Estado |
| --- | --- |
| Base del profe adaptada, Firebase sustituido por Supabase | ✅ |
| Agentes y skills a nivel de proyecto, documentos convertidos | ✅ |
| **Modelo de datos** — seguridad por fila, disponibilidad, tiempo real, retención | ✅ 418 pruebas |
| **Sistema de diseño** — tokens de Stitch en Tailwind 4, fuentes autoalojadas | ✅ |
| **Maquetas** — 44 pantallas en `docs/referencia/stitch/` | ✅ |
| **Módulo Acceso y Sesión** — 11 historias | ✅ |
| **Módulo Tablero y Navegación** — 10 historias | ✅ |
| **Módulo Administración** — 31 historias, EP-ADM-01 a 06 | ✅ |
| **Módulo Reservas** — 33 historias, EP-RES-01 a 07 | ✅ |
| **Módulo Operaciones** — 27 historias, EP-OPE-01 a 04 | ✅ |

Verificación al cierre: `npm run lint`, `npm run typecheck`, `npm run build`,
`npm run test:run` (**62 unitarias**) y `npm run db:test` (**418 pgTAP**)
pasan los cinco. 68 rutas en el build.

---

## Dónde se quedó el trabajo

### Lo que salió de usar la aplicación de verdad

Con la aplicación ya desplegada, el dueño la revisó y pidió siete cambios. Todos están hechos y
verificados en el navegador, no solo compilando. Lo interesante es que **casi nada era una regla
nueva**: eran historias ya escritas que se habían implementado a medias.

- **El botón de cerrar sesión vivía en una píldora flotante arriba a la derecha, a `z-40`**, encima
  del botón "Agregar" que pintan siete pantallas en esa misma esquina. Fallar por un centímetro
  cerraba la sesión sin preguntar nada. Ahora hay un panel lateral con la identidad, el selector de
  área con su nombre escrito, el perfil y un cierre de sesión que pregunta una vez.
- **`/perfil` era inalcanzable**: nada en la interfaz enlazaba ahí, y como es donde se cambia la
  contraseña propia, ningún trabajador podía cambiarla sin escribir la URL de memoria.
- **La hoja de despacho salía vacía para kayaks y paddleboards**, porque filtraba a lo que tuviera
  motor o gasolina. El operador no veía ni qué estaba entregando.
- **No se podía cambiar el equipo al despachar.** Pasa todos los días: el cliente reservó paddleboard,
  pide kayak por radio, y el muelle le da otra cosa. Ahora se confirma el equipo antes de marcar la
  reserva como despachada, mientras sigue en `scheduled`, así ninguna policy ni guarda de estado tuvo
  que moverse.
- **La gasolina volvió a los cuartos que pedía la maqueta** (`docs/referencia/stitch/gasolina-y-horas-al-despachar--movil.html`),
  conservando el campo numérico para valores exactos.
- **El despacho no escribía la gasolina de la unidad**, solo la de la reserva: durante toda la salida
  la ficha de la máquina mostraba el nivel del cierre anterior.
- **El tablero no decía qué estaba en el agua**, que es justo la pregunta que el WhatsApp existía para
  contestar. Y las categorías por cantidad no tenían ninguna noción de "en uso ahora": tres kayaks en
  el lago y el tablero seguía ofreciendo nueve.

### Tres errores del mismo tipo, que solo aparecen usando la aplicación

Cada vez que una pantalla mostró **dos números calculados con reglas distintas**, se contradijeron.
Ninguno lo atrapaba el compilador ni los tests.

1. `libres` salía de `category_availability`, que razona por **ventana horaria**; `en uso` salía del
   **estado** de la reserva. Una salida que se pasó de la hora "liberaba" equipo que seguía en el lago.
2. Lo mismo un nivel más abajo: "3 disponibles / 3 en uso" sobre un stock de 3.
3. Y `unit_current_state` (por unidad) ya razonaba por estado, mientras las categorías por cantidad
   razonaban por tiempo — las dos formas de llevar inventario contestaban distinto a la misma pregunta.

La regla que quedó: **una unidad despachada nunca cuenta como libre, aunque su franja haya vencido**, y
`libres + en uso` nunca supera el total. `category_availability` **no se tocó**: el formulario de
reservas pregunta "¿puedo agendar a las 3?", y ahí razonar por ventana sí es lo correcto.

### La regla de guía, aplicada en tres lugares

`US-RES-008` dice que una renta nunca lleva equipo que solo sale con guía. Estaba aplicada solo en el
formulario de nueva reserva. El paso de sustitución del despacho la ignoraba (defecto nuevo) y el
modal de edición también (defecto anterior). Ahora los tres usan
`filterCategoriesForReservationType`, para que la próxima pantalla que ofrezca equipo la herede en vez
de olvidarla.

### El tema claro

Ver `docs/decisiones/tema-claro.md`. Lo caro no fue la paleta: `border-white/10` y `/5` aparecían
**313 veces en 178 archivos** y son el borde por defecto de toda tarjeta, panel y modal. Blanco puro
sobre fondo claro no se ve, así que sin ese reemplazo el tema claro no servía de nada.

La preferencia se guarda **por dispositivo**, no por cuenta: el mismo trabajador usa el teléfono al sol
y la computadora bajo techo.

**Pendiente de verificación humana:** el contraste al sol. WCAG no modela reflejo de pantalla, por eso
la paleta apunta a 6:1 y 7:1 en vez del mínimo de 4.5:1, pero eso hay que probarlo afuera.


**Rama activa: `develop`**, sincronizada con GitHub. Acceso, Tablero,
Administración, Reservas y Operaciones están todos mezclados ahí. Los 56
commits del trabajo de esta sesión ya están subidos.

Reservas y Operaciones se construyeron en seis despachos, uno a la vez —
nunca dos agentes en paralelo, porque los dos verifican contra la misma base
local y ambos terminan con `npm run db:reset`. El brief permanente que se le
pasa a cada uno vive en `docs/decisiones/BRIEF-AGENTES.md`.

### Las tres brechas de seguridad, y por qué eran la misma

Las tres tuvieron exactamente la misma forma: **se ejercitaba el camino
permitido y se asumía el negado.** Vale tenerlo presente porque es el error
que este proyecto comete cuando nadie lo vigila.

1. **`worker_areas` / `worker_marks`** — embed ambiguo que fallaba con
   `PGRST201` en cada petición, y el error se tragaba mostrando una lista
   vacía. Apareció dos veces, la segunda en `fetchGuides`.
2. **`unit_current_state`** — vista sin `security_invoker`, evaluaba el RLS
   como su dueño superusuario. Un trabajador sin área leía por ella el
   identificador y la hora de regreso de reservas que sus políticas le
   negaban. Migración `20260828001550`.
3. **Las columnas de precio de `reservations`** — `list_amount_*` y
   `agreed_amount_*` vivían en la fila de la reserva, que operaciones sí
   puede leer, aunque el RLS le niega `reservation_charges`, `refunds` y
   `deposits` a propósito. Solo la pantalla las escondía, y US-TAB-007 pide
   lo contrario. Migración `20260828001850`: el precio se mudó a
   `reservation_pricing`, con el mismo RLS que los depósitos —
   `has_area('reservas') or is_admin()`, sin operaciones.

**La regla que queda:** toda vista nueva se crea con
`with (security_invoker = true)`, y toda política nueva se prueba **de los dos
lados**: que quien debe ver, ve, y que quien no debe, no ve. Ese segundo lado
es el que faltó las tres veces.

Un detalle del arreglo 3 que conviene no redescubrir: el CHECK
`reservations_split_child_no_charge` garantizaba que la hija de una división
naciera sin cobro propio. **Un CHECK solo mira columnas de su propia fila**,
así que no podía seguir al precio a otra tabla. Lo reemplaza el trigger
`reservation_pricing_no_split_child`, `security definer` con `search_path`
fijado — más estricto que el CHECK, porque rechaza al escribir el precio y no
depende de que quien escribe alcance a ver la reserva madre.

### Otras decisiones de seguridad tomadas en el camino

- **`worker_display_names(uuid[])`** (`20260828001800`): RNF-023 pide mostrar
  el nombre de quien firmó cada registro, y `workers_select` solo deja ver la
  fila propia. Abrir la fila entera habría expuesto cédula, correo personal y
  contador de intentos fallidos. La función es `security definer` con
  `search_path` fijado, devuelve **solo** `id` y `full_name`, y tiene
  `execute` revocado de `public` y `anon`.
- **`worker_marks_select_guides` / `workers_select_guides`**
  (`20260828001650`): reservas necesita listar quién tiene la marca `guia`.
  Solo se abre esa marca — `encargado_general` y `registro_guias_externos`
  siguen privadas — y solo para quien tiene área de reservas u operaciones.
- **Bucket `unit-condition-photos`** (`20260828001750`): privado, servido con
  URLs firmadas de una hora. `delete` no tiene política a propósito.
- Las **12 vistas** del esquema tienen `security_invoker = true` y las **6
  funciones `security definer`** tienen `search_path` fijado. Auditado
  directamente contra `pg_class` y `pg_proc`.


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

Ya no hay historias por construir. Lo que queda es esto.

### Lo único grande: nadie ha visto ninguna pantalla con ojos

Son **23 pantallas** entre Administración, Reservas y Operaciones. Todo se
verificó con sesiones autenticadas reales, `curl` contra la app corriendo y
consultas directas con `psql`; el comportamiento a 390px y a 1440px está
**deducido de las clases de Tailwind, nunca mirado**. El entorno donde corren
los agentes no tiene navegador.

Es el pendiente más grande del proyecto y **ya no crece**, porque no queda
módulo por construir. Cada defecto que se encontró en este proyecto —el seed
que no dejaba entrar a nadie, los íconos que se leían como palabras, las
tarjetas estiradas, el embed ambiguo, la ficha sin fotos que devolvía 500—
era invisible en el código y evidente al ejecutarlo.

```bash
npm run db:start
npm run dev
```

### Despliegue: dónde va y qué falta

El proyecto en la nube ya existe y el esquema ya está allá. Lo que falta es
sembrar los datos iniciales y conectar Vercel.

**Proyecto de Supabase.** `arenal-watersports-ops`, ref `vzqbwlvheickxscrwvpw`,
región `us-east-1` (North Virginia), Postgres 17.6.1. La región se eligió a
mano contra la recomendación del panel, que ofrecía Oregon: el tráfico de
Costa Rica sale por Miami, y Vercel corre sus funciones en `iad1`, que es esa
misma región. Base y funciones quedan del lado.

**Las tres opciones del panel están las tres encendidas**, incluida «exponer
automáticamente nuevas tablas», que Supabase recomienda apagar. Acá tiene que
estar encendida: las migraciones otorgan permisos explícitos sobre una sola
tabla, y las otras 24 dependen de los privilegios por defecto. Apagarla deja
la aplicación entera en «permission denied». No es un hueco porque la cerradura
de este proyecto no son los permisos sino el RLS: las 25 tablas lo tienen
activo y un usuario anónimo lee cero filas de reservas, trabajadores y cobros.

**Las 33 migraciones ya están aplicadas.** Se verificó que el esquema remoto
es idéntico al local comparando una firma md5 de tablas, vistas, funciones,
enums, políticas y triggers: `c6e8dc292f8fb01386cb4bb7c1adb0ef`, 173 elementos
de cada lado. Lo único de más allá es `rls_auto_enable`, que agregó Supabase
por la opción de RLS automático.

**El seed ya está aplicado.** Se corrió desde el editor SQL del panel, no desde
la CLI. Dos intentos por la CLI fallaron antes, por razones de transporte que
conviene no volver a pisar:

1. Las comillas dobles del literal JSON de `raw_app_meta_data` no sobreviven
   al pasar el SQL como un solo argumento. Se cambió a `jsonb_build_object`,
   que usa solo comillas simples. Arreglado en el seed.
2. El seed aplanado son 5866 caracteres y `npx` pasa por `cmd.exe`, que corta
   en 8191 contando su propio envoltorio. Hay que correrlo **sentencia por
   sentencia**; la más grande son 1154 caracteres.

3. La CLI de Supabase **necesita Docker corriendo incluso para consultas
   remotas**. Con el demonio apagado, `supabase db query --linked` se cuelga
   sin decir por qué. Si algo de la CLI se queda pegado, revisar Docker antes
   de buscar en la red.

La salida es el **editor SQL del panel**, en
`https://supabase.com/dashboard/project/vzqbwlvheickxscrwvpw/sql/new`: acepta
el archivo entero con comentarios, no pasa por `cmd.exe` y no necesita Docker.
Para cualquier SQL futuro contra producción, ese es el camino — además de que
escribir a producción está bloqueado por el clasificador de permisos, así que
lo corre el dueño, no el agente.

**Vercel todavía no se ha tocado.** El código ya está en GitHub (`develop`
sincronizado). Las variables que hay que cargar allá son las de
`.env.example`: las tres de Supabase más las cinco de SMTP. `SMTP_FROM` tiene
un valor por defecto pero en producción hay que ponerla, porque Gmail rechaza
un remitente que no sea la cuenta autenticada.

**La contraseña del admin es `Arenal.2026` y está en el repo.** El seed marca
`must_change_password`, así que la aplicación obliga a cambiarla en el primer
ingreso. Hay que entrar y cambiarla apenas despliegue, antes de repartir
accesos.

**Sobre secretos:** la contraseña de la base se filtró una vez al chat y al
historial de PowerShell. Se limpió el historial y el dueño la rotó. La CLI no
la guarda en `supabase/.temp`. Regla para adelante: contraseñas y llaves nunca
por chat; el agente abre una terminal y el dueño las escribe ahí.

### Deudas técnicas conocidas, ninguna bloqueante

- **Crear una reserva son cuatro escrituras sin transacción**: la reserva, su
  precio, sus ítems y sus guías. El orden se eligió con criterio —el precio va
  antes que el equipo, porque una reserva sin precio se confunde con una renta
  sin cotizar mientras que una sin ítems se ve rota apenas se abre— pero si
  falla una de las cuatro queda a medias. Cerrarlo exige una función de base
  que haga las cuatro de una, y eso cambia el contrato de creación completo:
  **necesita el visto bueno del dueño antes de que alguien lo escriba.**
- **El calendario resuelve "hoy" y "ahora" con la hora local del entorno**, no
  con el offset explícito de Costa Rica que `workday.ts` y
  `dateConversion.ts` ya usan. En esta máquina coinciden. Si el servidor de
  producción corre en otra zona, los límites del día se correrían unas horas
  cerca de la medianoche.
- **`applyStockAdjustment` escribe la cantidad y luego el movimiento**, sin
  transacción, igual que el camino de administración que ya existía. Si el
  movimiento falla, la cantidad ya cambió.
- **Dos módulos con reglas de verdad sin cobertura**: `countSheetState.ts`
  (qué renglones entran a un conteo) y `maintenanceFormValues.ts` (cuándo
  monto y moneda viajan juntos). Son los primeros candidatos de la pasada de
  pruebas.
- **`ReservationDetail` es componente cliente completo.** La página sigue
  siendo Server Component y baja los datos por props, así que no hay cascada
  de peticiones; pero las secciones de solo lectura podrían quedarse en
  servidor.
- **El drift de `npm run format`** descrito arriba. Sigue sin bloquear nada.

### Decisiones menores que el dueño puede querer cambiar

- El ícono de Inventario lleva a **dos lugares distintos**: administración a
  `/inventario` (catálogo plano, US-TAB-001) y operaciones a
  `/operaciones/inventario` (por categoría, con contar y marcar estado). Son
  el mismo registro visto de dos maneras; se unifican sin drama.
- **El umbral de cambio de aceite se mueve desde el formulario de
  mantenimiento.** Si se prefiere que solo administración lo toque, se quita
  de ahí — pero entonces el aviso de una máquina a la que ya se le cambió el
  aceite se queda encendido hasta que administración entre a apagarlo.
- **El pendiente cuando el cliente paga en dos monedas** se muestra como dos
  pendientes separados para siempre, porque no hay tipo de cambio con el cual
  saber que la reserva ya quedó saldada. Es una ambigüedad real de
  US-RES-026; poder marcarla saldada a mano sería una historia nueva.
- **`supabase/config.toml` no declara el bucket.** Es una línea si se quiere
  que exista también en un arranque local desde cero.


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
