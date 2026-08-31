# SDD ledger — plan: módulo Acceso y Sesión (sin plan formal, protocolo ligero por C21)

Spec: docs/superpowers/specs/2026-08-29-modulo-acceso-design.md
Branch: feat/modulo-acceso
Start commit: 184a29c

Protocolo (C21): pruebas de humo, una revisión por módulo. EXCEPCIÓN: este módulo ES
autenticación y permisos de punta a punta, así que conserva revisión propia por lote.

**Ruling A1 (contradicción en US-ACC-002):** la historia pide mensaje propio para "usuario
no registrado" y para "contraseña incorrecta", y en el mismo párrafo exige que ningún
mensaje revele qué usuarios existen. Son incompatibles. Se resuelve del lado de la no
divulgación: esos dos casos comparten «Usuario o contraseña incorrectos». Los tres mensajes
de estado de cuenta (bloqueo por intentos, bloqueo por administración, sesión caducada)
conservan el suyo, porque su razón de ser es que la persona sepa si reintenta o busca a
administración. — Costo si me equivoco: los mensajes de bloqueo sí confirman que una cuenta
existe; aceptable en un sistema interno de seis personas, anotado por si algún día se expone.

**Ruling A2 (Stitch no disponible):** el MCP está configurado en .mcp.json pero no cargado,
porque Claude Code lee los servidores MCP al arrancar y el archivo se creó a mitad de sesión.
Se construye el módulo con los componentes de la base y los criterios de aceptación; el
diseño de Stitch se aplica después como reestilizado. — Motivo: la estructura y el
comportamiento son el 90% del trabajo y no dependen del visual. — Costo si me equivoco: una
pasada de reestilizado cuando el MCP cargue. Acción del usuario: reiniciar Claude Code.

Lote A: dispatched (BASE 184a29c, model sonnet) — constantes, rutas de servidor, middleware.

**Ruling A3 (defecto de mi seed, Task 16, reproducido por el controlador):** `supabase/seed.sql` inserta el administrador en `auth.users` con solo id, email, contraseña y confirmación. GoTrue exige además `instance_id`, `aud`, `role`, varias columnas de token no nulas y una fila correspondiente en `auth.identities`. Resultado: NINGUNA cuenta sembrada puede autenticarse. Reproducido con curl contra el endpoint de token: `{"code":400,"error_code":"invalid_credentials"}`. La tarea 16 se verificó contando filas, no intentando entrar — el protocolo ligero (C21) hizo exactamente lo que se esperaba de él. Se corrige el archivo del seed, no solo la base viva. — Costo si me equivoco: ninguno; sin esto el módulo entero es inarrancable.

**Ruling A4 (mi spec estaba mal, corregido por el implementador):** la spec dice `app/middleware.ts`. Está mal por partida doble: el middleware de Next va en la RAÍZ del proyecto, no dentro de `app/`, y Next 16.1.6 deprecia `middleware.ts` en favor de `proxy.ts`. El implementador lo confirmó contra el código de Next y una advertencia del build. Se acepta `proxy.ts` en la raíz y se corrige la spec. — Costo si me equivoco: ninguno; es lo que el framework exige.

**Ruling A5 (requisito del documento que la sección 4 no cubría):** el flujo dice que al bloquear una cuenta "las sesiones abiertas de esa persona se cierran en el momento". La sección 4 de mi spec no lo pedía y el proxy no lo hace. Como el proxy ya lee la fila del trabajador para decidir `must_change_password` y las áreas, comprobar `status = 'blocked'` y cerrar la sesión cuesta unas pocas líneas. Se agrega ahora en vez de diferirlo al módulo de Administración, donde el mecanismo tendría que vivir igual aquí. — Costo si me equivoco: una comprobación más por petición sobre datos que el proxy ya trajo.

Lote A: complete (commits 6069e67 seed + c4d0fcb fundaciones). Seed verificado emitiendo token real.
Lote B: complete (commits edd3ea5 sistema de diseño + 9701574 pantalla de ingreso). 21/21 vitest.

**Ruling A6 (segunda contradicción diseño vs historia, Lote B):** el diseño de Stitch de la pantalla de ingreso NO muestra las reglas de la contraseña; US-ACC-001 las exige explícitamente ("se muestran desde antes de escribirla, no después de fallar"). El implementador resolvió a favor del criterio de aceptación, que es lo correcto por defecto: la historia manda sobre el diseño. Se acepta. — Observación para el dueño: mostrar reglas de contraseña en una pantalla de INGRESO es inusual; las reglas importan al CREAR la clave, no al escribirla. Es probable que ese criterio estuviera pensado para las pantallas de cambio y se haya colado en la de ingreso al redactar, y el diseñador claramente no lo interpretó así. Queda implementado según la historia y señalado al dueño para que decida. — Costo si me equivoco: ruido visual en la pantalla más usada del sistema; revertirlo es quitar un componente.

Lote C: dispatched (BASE 9701574, model sonnet) — cambio de contraseña primer ingreso y voluntario, correo personal.

**Ruling A7 (defecto reproducido por el controlador):** `MaterialIcon` pinta el nombre del ícono como texto y depende de que Material Symbols lo convierta en glifo por ligadura. El Lote B dejó esa fuente en el CDN de Google, contradiciendo el motivo por el que autoaloja las otras dos ("la aplicación abre con mala señal"). Si la fuente no carga se leen las palabras: reproducido levantando el servidor, la página muestra `radio_button_unchecked` cinco veces y `login`. El usuario lo describió como "una fila alargada y no se entiende". Se autoaloja con `next/font/google`, eliminando el CDN. — Motivo: una app que se abre decenas de veces al día con mala señal no puede depender de un tercero para que sus botones sean legibles. — Costo si me equivoco: unos KB más en el bundle propio.

**Ruling A8 (revierte parcialmente A6, con desviación declarada de US-ACC-001):** las cinco reglas de contraseña se quitan de la pantalla de INGRESO y quedan solo en las de creación de contraseña, donde el usuario efectivamente crea una. Esto se aparta de la letra de US-ACC-001, que dice "las reglas se muestran desde antes de escribirla". Razones: el diseño de Stitch no las tiene; mostrar requisitos de creación en un formulario de entrada es incorrecto de experiencia; y el dueño vio el resultado y lo llamó "horrible". El criterio sigue cumplido donde tiene sentido — al crear y al cambiar la contraseña. — Costo si me equivoco: es un componente y una línea; revertirlo es trivial y el dueño puede pedirlo.

**Ruling C1 (premisa del encargo de la ruling A7 estaba mal, corregido con evidencia — mismo patrón que A4):** el encargo decía "next/font/google supports Material_Symbols_Outlined". Verificado contra `next/dist/compiled/@next/font/dist/google/font-data.json` (1907 fuentes, ninguna es Material Symbols) y contra un intento real de import: `tsc` falla con `TS2305`. La fuente no está en el catálogo que next/font indexa. El objetivo (autoalojar en vez del CDN) seguía siendo correcto; se logró con `next/font/local` sobre el woff2 real que Google sirve para esta fuente — la instancia **estática** (peso 400/FILL 0/GRAD 0/opsz 24, los únicos valores que este código renderiza), 320 KB, no la variable (~4 MB) que nada aquí necesita. — Costo si me equivoco: ninguno, es lo que el framework permite.

**Ruling C2 (hallazgo propio, verificando la ruling A7 en un navegador real):** al confirmar visualmente el fix de la fuente, la tarjeta de ingreso se veía como una tira de ~24px, no una tarjeta centrada. Causa: Tailwind v4 resuelve `max-w-<clave>` contra `--spacing-<clave>` antes que su propio `--container-<clave>` — confirmado en el CSS compilado (`.max-w-md{max-width:var(--spacing-md)}`). El `--spacing-md: 1.5rem` que el Lote B agregó (para `p-md`, `gap-md`, calcado de Stitch) reusa a propósito los mismos nombres `sm/md/lg/xl` de la escala de `max-width` de Tailwind, apagándola silenciosamente en toda la app desde que se agregó — no solo en este lote. Se agregó `--container-form: 28rem` (nombre que no colisiona) y se cambiaron las tres tarjetas del módulo de acceso de `max-w-md` a `max-w-form`. Quedan sin tocar (fuera de este módulo) `SessionTimeoutWarning.tsx` y `Toast.tsx`, rotos por el mismo motivo. — Costo si me equivoco: un token de más que nadie más usaba todavía.

**Nota sobre `--margin-mobile` (parte del mismo encargo, verificado y descartado):** el encargo afirmaba que `--margin-mobile` no está definido y que `px-margin-mobile` no hace nada. `--spacing-margin-mobile: 1rem` sí está definido (ya existía) y el CSS compilado lo confirma (`.px-margin-mobile{padding-inline:var(--spacing-margin-mobile)}`). No se cambió nada ahí.

Lote C: complete (commits 2b56e5e correcciones del lote B + 11dd2fd primer ingreso/cambio de contraseña + cb6fc97 perfil y correo personal). 30/30 vitest. Flujos verificados en Chrome real vía playwright-core (sin herramienta de navegador de Claude Code disponible): primer ingreso, rechazo de contraseña temporal incorrecta, limpieza de must_change_password confirmada en la base, cambio voluntario, correo obligatorio/opcional según el rol. Base reseteada al estado sembrado original al terminar (`npm run db:reset`).
Lote C: complete (2b56e5e arreglos + 11dd2fd cambio de contraseña + cb6fc97 perfil). 30/30 vitest.
Causa raíz de "la fila alargada": colisión de tokens en Tailwind 4 — definir --spacing-md regenera max-w-md desde la escala de espaciado y pisa el valor nativo, dejando toda tarjeta sin ancho máximo. Corregido. Los íconos como palabras (A7) eran un segundo problema, no el mismo.
Corrección a mi despacho: next/font/google NO soporta Material Symbols; se autoaloja con next/font/local.
Pendientes que quedan: el ícono de ojo da 404 en todo el proyecto (preexistente), y max-w-md/max-w-xs siguen rotos en dos archivos fuera de acceso.
Lote D (cierre de módulo): dispatched — PIN, modo de trabajo, reestilizado a escritorio, y los dos pendientes.

**Ruling D1 (bug real de mitad de sesión, no hipotético):** `.env.local` ya declaraba
`SMTP_HOST`/`SMTP_PORT` como cadenas vacías (scaffolding de un despliegue real futuro).
`EMAIL_CONFIG` los leía con `??`, que no reemplaza `""`. Habría resultado en host `""` y
puerto `0` — el correo de recuperación nunca habría salido. Encontrado al enviar un
correo de prueba de verdad contra Inbucket, no leyendo código. Corregido a `||`. — Costo
si me equivoco: ninguno, es estrictamente más correcto.

**Ruling D2 (bug real, mismo patrón que Ruling A7):** `SESSION_CONFIG.WORKDAY` codifica
"nunca caduca por inactividad" como `TOTAL_MINUTES: 0`, pero
`useInactivityTimeoutWithWarning` no trataba 0 como "desactivado": lo convertía en un
`setTimeout` de 0ms y cerraba la sesión al instante apenas se montaba el proveedor con
esa config — exactamente lo opuesto de lo que pide US-ACC-009. Bloqueante para que la
sesión de jornada funcionara en absoluto. Corregido: `timeoutMinutes <= 0` desactiva el
temporizador. — Costo si me equivoco: ninguno, es lo que `AUTO_LOGOUT: false` ya decía.

**Ruling D3 (limitación declarada, no resuelta):** la franja horaria se vigila por
sondeo del cliente cada 60s a `/api/acceso/jornada`, no por una marca de última
actividad en el servidor. Cruzar las 19:00 con más de 30 minutos ya inactivos reinicia
un temporizador completo de 30 minutos desde la detección, en vez de cerrar la sesión
al instante exacto. Resolverlo con precisión exige rastrear la última actividad por
sesión en el servidor, que no existe y no se pidió construir. Documentado en el reporte
del lote, no oculto.

Lote D: complete (commits c2ff6b2 fixes + d527e94 login + 9ba8fb7 PIN + aba4cab modo de
trabajo + 021bd10 sesión). 30/30 vitest (sin pruebas nuevas, verificación ligera pedida).
PIN de recuperación verificado de punta a punta contra Inbucket real. Base reseteada al
estado sembrado original al terminar.
Lote D: complete (c2ff6b2, d527e94, 9ba8fb7, aba4cab, 021bd10). MÓDULO ACCESO CERRADO — las 11 historias.
Dos defectos míos encontrados al ejecutar: (1) `??` no atrapa cadena vacía, así que un SMTP_HOST vacío pasaba como configurado; (2) WORKDAY.TOTAL_MINUTES = 0 (Fase 0) se leía como "cero minutos" y cerraba la sesión al instante — lo contrario exacto de US-ACC-009.
Limitación declarada: el cruce de las 19:00 se detecta por sondeo (~60s), no exacto.
Pendiente menor: los campos no tienen íconos de persona/candado; FieldFactory no tiene ranura para eso.
