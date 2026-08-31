# SDD ledger — plan: docs/superpowers/plans/2026-08-28-modelo-de-datos.md

Spec: docs/superpowers/specs/2026-08-28-modelo-de-datos-design.md
Branch: design/modelo-de-datos
Start commit: 102a099

## Pre-flight conflict scan

### Pares de tareas que comparten archivo o interfaz

| Productor | Consumidor | Qué produce / qué consume | Hallazgo |
| --- | --- | --- | --- |
| T1 scripts npm | T2–T17 | `db:reset`, `db:test`, `db:types` | OK |
| T2 `workers(id)` + 13 enums | T3, T4, T5, T7, T8, T9, T10 | FK y tipos | OK |
| T3 `has_area/has_mark/is_admin` | T13, T14 | funciones de permiso en toda política | OK |
| T4 `equipment_categories(id)` | T5, T6, T7, T8, T10 | FK | OK |
| T5 `equipment_units`, `equipment_stock` | T6, T7, T10, T11 | T6 los consulta; T7 los referencia | OK — T6 va después de T5, correcto |
| T7 `combos(id)`, `extras(id)` | T8 | `reservations.combo_id`, `reservation_items.extra_id` | OK — T7 antes de T8, correcto |
| T8 `reservations(id)` | T9, T10, T11, T15 | FK de dinero, daños, disponibilidad, retención | OK |
| T12 disparador de firma | T13 | T13 espera 42501 al insertar categoría sin permiso | **C3** — depende de que T12 llene `created_by` primero |
| T12 disparador de firma | T16 seed | seed pasa `created_by` explícito con `auth.uid()` nulo | OK — el `coalesce` conserva el valor explícito |
| T13/T14 RLS | T16 seed | seed corre como `postgres`, que salta RLS | OK |
| T15 publicación de tiempo real | — | requiere que existan las cuatro tablas | OK — T15 va después de T11 |

### Coherencia interna de cada tarea

| Tarea | Pruebas vs código que especifica | Hallazgo |
| --- | --- | --- |
| T1–T11 | insertan siempre con `created_by` explícito como `postgres` | OK |
| T12 | la prueba inserta en `auth.users` **después** de `set local role authenticated` | **C1** |
| T12 | el bucle solo cubre tablas con `created_by` **y** `updated_by` | **C2** |
| T13 | cambia a `postgres` a mitad de prueba y vuelve a `authenticated` | OK — el usuario de sesión es `postgres`, el `set role` de vuelta es válido |
| T14 | inserta todos los datos antes de cambiar de rol | OK |
| T15 | `purge_expired_history()` corre como `postgres`, que salta RLS | OK |
| T16 | `extensions.crypt` calificado | OK |
| T17 | `exclude` de vitest reemplaza los valores por defecto | OK — incluye `node_modules` y `.next` explícitamente |

## Rulings

**Ruling C1 (Task 12):** la prueba `011_audit.test.sql` inserta la segunda fila
de `auth.users` después de `set local role authenticated`, y ese rol no tiene
privilegio de inserción sobre `auth.users`. Se mueven las dos inserciones de
`auth.users` y de `workers` **antes** del cambio de rol. — Motivo: la prueba
mide que la firma no se puede falsificar, no los privilegios sobre el esquema
`auth`; tal como está fallaría por la razón equivocada. — Costo si me equivoco:
la prueba falla y se corrige en el mismo despacho.

**Ruling C2 (Task 12):** el bucle del plan solo pone el disparador en tablas que
tienen `created_by` **y** `updated_by`. Eso deja fuera a `equipment_stock` (solo
`updated_by`) y a las ocho tablas de solo inserción: `reservation_charges`,
`refunds`, `deposits`, `equipment_stock_movements`, `unit_condition_photos`,
`damage_reports`, `inventory_counts`, `inventory_count_lines`. En todas ellas la
firma la seguiría poniendo el cliente, que es justo el agujero que la
restricción global existe para cerrar — y son las tablas de dinero. Se amplía
T12 con `stamp_created_fields()` para las de solo inserción y
`stamp_updated_fields()` para `equipment_stock`, más una prueba que verifique
que un `created_by` falsificado en un cobro también se pisa. — Motivo: la
restricción global dice "la firma la pone la base" sin excepciones, y dejar los
cobros firmables desde el cliente contradice la spec. — Costo si me equivoco:
tres funciones y tres disparadores de más, sin efecto sobre el esquema.

**Ruling C3 (orden):** T12 tiene que ir antes de T13, porque la prueba de T13
espera `42501` (permiso denegado) al insertar una categoría, y sin el disparador
que llena `created_by` el error sería `23502` (no nulo). El plan ya las ordena
así; queda anotado para que ningún reordenamiento posterior lo rompa. — Costo si
me equivoco: ninguno, es una confirmación.

## Progreso

Task 1: dispatched (BASE 102a099, model sonnet, brief task-1-brief.md)
Task 1: paused on `supabase start` (image pull in progress, 2/~10 images). Controller checked ports 54321-54329 — all free; `sastreya-db` (5433) and the app on 3000 belong to other projects and are unrelated. Agent resumed with the diagnosis; no ruling needed.

**Ruling C4 (Task 1):** `supabase init` derivó `project_id = "1._Proyecto"` del nombre de la carpeta ("1. Proyecto"). Un punto y una mayúscula no son válidos en un nombre de proyecto de Docker Compose, y ese identificador se usa para nombrar todos los contenedores locales. Se fija a `arenal-watersports-ops`, que coincide con el nombre del repositorio. — Motivo: es una etiqueta local y determinista; dejarla derivada de una carpeta con espacio y punto es frágil y ya produjo un error de inspección de contenedor. — Costo si me equivoco: ninguno, es un identificador solo local que no viaja al proyecto de la nube.

**Nota operativa (Task 1):** el proceso de `supabase start` lanzado en segundo plano por el subagente muere cuando el agente termina su turno; las imágenes descargadas sí persisten (4 de ~10). Se le indica correrlo en primer plano con timeout largo y reintentar si hace falta, porque Docker reanuda desde las capas ya bajadas. No es un ruling: es una restricción del entorno.
Task 1: implementer DONE_WITH_CONCERNS (commit 175a67c). Concerns: (a) RED no se reprodujo literalmente — el CLI instala pgtap de forma transitoria en cada `test db`, GREEN verificado por consulta directa a `pg_extension`; (b) `supabase_vector` reinicia por red de Docker, Postgres sano; (c) project_id corregido por Ruling C4. Review dispatched (model sonnet, diff review-102a099..175a67c.diff).

**Ruling C5 (Task 1):** el revisor marcó spec ❌ porque el commit incluye un bloque `.superpowers/` en `.gitignore` que el brief no pedía. Ese hunk lo escribió el controlador durante la preparación del espacio de trabajo, antes de despachar la tarea, y estaba sin committear en el árbol cuando el implementador corrió `git add`. El reporte del implementador lo describe con precisión ("pre-existente, sin committear, provisto por el entorno"); el revisor interpretó "pre-existente" como "ya committeado". No es un defecto del implementador y la línea pertenece al repositorio, así que no se despacha ronda de arreglo. — Motivo: el hallazgo se apoya en una premisa que solo el controlador podía desmentir; mandar a corregir un reporte que es correcto sería trabajo perdido. — Costo si me equivoco: el commit de la tarea 1 mezcla una línea de configuración del entorno con el andamiaje de Supabase; visible en el historial y sin efecto funcional.

Task 1: complete (commits 102a099..175a67c, 1 parked)
Task 1: minor (deferred): `supabase/.gitignore` generado por el CLI duplica el ignore de `.branches`/`.temp` que ya cubre el `.gitignore` raíz. Inofensivo.
Task 1: minor (deferred): `app/types/database.types.ts` se generó para probar `db:types` y se borró; la tarea 17 debe regenerarlo.
Task 2: dispatched (BASE 175a67c, model sonnet, brief task-2-brief.md)
Task 2: implementer DONE (commit cbc8c06, 2 files, 135 insertions). Agent murió por error de API tras committear; controlador verificó el commit y corrió las pruebas (Files=2, Tests=8, PASS) antes de reanudarlo solo para escribir el reporte. Review dispatched (model sonnet).

**Ruling C6 (Task 2, hallazgo Important #1):** el revisor marca que `guard_admin_account()` no impide borrar trabajadores que no son el administrador, y pregunta si el bloqueo general está diferido. Lo está, y a propósito: la spec fija que "el servidor es quien restringe" mediante RLS, y en la tarea 13 la tabla `workers` recibe políticas de `select`, `insert` y `update` pero **ninguna de `delete`** — la ausencia de política ES la prohibición para el rol `authenticated`. El disparador de la tarea 2 protege una regla distinta y más fuerte: que la única cuenta de administración no se pueda borrar ni siquiera con privilegios que salten RLS. No se cambia nada en la tarea 2. — Motivo: duplicar la prohibición en un disparador contradiría el mecanismo que la spec eligió y complicaría la limpieza por retención, que corre con rol elevado. — Costo si me equivoco: entre ahora y la tarea 13, un `DELETE` con rol de servicio sobre `workers` no encuentra freno; nadie ejecuta eso fuera de las pruebas. Se lleva un puntero a esto en el despacho de la tarea 13 para que su revisor confirme que no existe política de `delete`.

**Ruling C7 (Task 2, hallazgo Important #2):** el brief mandaba `plan(7)` y siete aserciones; el revisor señala que dos reglas del dominio quedan sin probar (administrador sin correo personal, y cambio de rol del administrador). El brief manda menos cobertura de la que la spec exige, y la spec es la autoridad. Se despacha ronda de arreglo 1 para agregar esas dos aserciones. Se le suma un Minor de la misma revisión —la prueba positiva de que un guía externo bien formado sí se inserta— porque toca el mismo archivo y cubre un camino feliz del que dependen las tareas siguientes; sin él, una restricción mal escrita que rechace a TODOS los guías externos no se detectaría hasta muy tarde. — Costo si me equivoco: tres aserciones de más en un archivo de pruebas.

Task 2: minor (deferred): los otros 12 tipos enumerados no tienen aserción propia de existencia; su correctitud solo se implica de que la migración aplica.
Task 2: fix round 1/5 (3 addressed, 0 open — admin email constraint, admin role lock, positive external-guide insert; commits cbc8c06..3c1e0e9)
Task 2: complete (commits 175a67c..3c1e0e9, review clean)
Task 3: dispatched (BASE 3c1e0e9, model sonnet, brief task-3-brief.md)
Task 3: implementer DONE (commit c733eff, RED/GREEN limpio, 17/17 pgTAP). Review dispatched (model sonnet).

**Ruling C8 (Task 3):** el revisor aprueba el SQL pero encuentra que `has_mark` e `is_admin` no tienen ninguna aserción, y que la condición de cuenta activa y no vencida —la propiedad de seguridad central de la tarea— tampoco. El brief mandaba `plan(6)` y esas seis aserciones, así que el plan pedía menos cobertura de la que exige la spec; la spec manda. Mismo patrón que el Ruling C7. Se despacha ronda de arreglo 1. Se incluye también el Minor del dato de prueba muerto (`vencido@arenal.local`), porque la forma de resolverlo es exactamente escribir la prueba de caducidad que falta. — Motivo: las tres funciones son las primitivas de permiso de las que dependen TODAS las políticas de las tareas 13 y 14; un `is_admin()` roto no fallaría aquí, aparecería como bypass o bloqueo mucho después. — Costo si me equivoco: seis aserciones de más en un archivo de pruebas.
Task 3: fix round 1/5 (2 addressed, 0 open — has_mark/is_admin sin cobertura, compuerta de estado y caducidad sin ejercitar; commits c733eff..bb83fc9)
Task 3: complete (commits 3c1e0e9..bb83fc9, review clean)

**Ruling C9 (estructural, aplica de la tarea 4 en adelante):** tres tareas seguidas (2, 3 y antes la 2 de nuevo) recibieron el mismo hallazgo Important: el brief manda un `plan(N)` que solo cubre parte de las restricciones que la migración crea, y deja sin ejercitar los caminos de fallo. El defecto es del plan, que yo escribí, no de los implementadores. En vez de seguir pagando una ronda de arreglo por tarea, todo despacho de la tarea 4 en adelante lleva una instrucción permanente: por cada restricción `check`, índice único o disparador que la migración cree, escribir también la aserción del camino que DEBE fallar; y por cada función booleana, las dos direcciones. El `plan(N)` del brief es un piso, no un techo. — Motivo: una restricción sin prueba de su camino de fallo no está probada, y las tres revisiones anteriores lo confirmaron de forma independiente. — Costo si me equivoco: archivos de prueba más largos y algunos minutos más por tarea.

Task 4: dispatched (BASE bb83fc9, model sonnet, brief task-4-brief.md, con instrucción C9)
Task 4: implementer DONE (commit 359a1e3, 34/34 pgTAP, 7/7 restricciones check con su camino de fallo probado — 4 aserciones por encima del brief gracias a C9). Review dispatched (model sonnet).
Task 4: complete (commits bb83fc9..359a1e3, review clean, sin ronda de arreglo — primera tarea limpia, efecto de C9)
Task 4: minor (deferred): `categories_deposit_positive` es una restricción compuesta y solo se ejercita la rama de `deposit_usd`; la de `deposit_crc` queda sin probar.
Task 4: minor (deferred): sin índice sobre las llaves foráneas `created_by`/`updated_by`; anotar para cuando se midan patrones de consulta.
Task 5: dispatched (BASE 359a1e3, model sonnet, brief task-5-brief.md, con instrucción C9)
Task 5: implementer DONE (commit 8568b62, 48/48 pgTAP, 14 aserciones nuevas). Review dispatched (model sonnet).

**Ruling C10 (defecto de la spec, descubierto en Task 5):** ninguna restricción ata `equipment_units` / `equipment_stock` al `tracking_mode` de su categoría. Una categoría por cantidad puede acumular unidades que `unit_conflicts()` sí vería pero que `category_availability()` nunca contaría, y viceversa: pérdida silenciosa. No se puede expresar con un `check` porque es una regla entre tablas; requiere disparador. Se amplía la tarea 6 —que ya existe justo para la integridad de `tracking_mode`— con dos disparadores de validación, uno por tabla. — Motivo: la tarea 6 es la siguiente y su tema es exactamente este; diferirlo hasta la 11 dejaría cinco tareas construyendo sobre un modelo que admite datos imposibles. — Costo si me equivoco: dos disparadores y una validación por inserción sobre dos tablas de escritura poco frecuente.

Efecto secundario de C10: la prueba `004_inventory.test.sql` inserta hoy una unidad bajo la categoría "Chaleco" (`by_quantity`) para probar la unicidad del código entre categorías. Con el disparador nuevo eso dejaría de ser válido. Se corrige en la misma ronda de arreglo de la tarea 5, usando dos categorías `by_unit` distintas, que prueba lo mismo sin depender de un dato imposible.
Task 5: fix round 1/5 (2 addressed, 0 open — PK de equipment_stock sin probar, fixture de unicidad movido a dos categorías by_unit; commits 8568b62..a9c5e04)
Task 5: complete (commits 359a1e3..a9c5e04, review clean). Nota: el re-revisor desglosó mal el conteo (dijo 12 throws_ok); el controlador verificó directamente: plan(15) = 3 has_table + 11 throws_ok + 1 lives_ok. Coincide.
Task 5: minor (deferred): `equipment_stock_movements` no tiene checks de no-negatividad en sus columnas from_*/to_*; un movimiento podría registrar to_available = -5 aunque el stock vivo nunca pueda serlo.
Task 5: minor (deferred): `equipment_units.code` no tiene restricción de formato ni de no-vacío, a diferencia de `workers.username`.

**Ruling C11 (Task 6):** el brief nombra la migración `20260828000500_freeze_tracking_mode.sql`, pero con la ampliación de C10 el archivo ya no solo congela la modalidad: también valida que cada fila de inventario caiga en la tabla que su categoría permite. Se renombra a `20260828000500_tracking_mode_integrity.sql`. — Motivo: el nombre de una migración es documentación permanente y no se puede cambiar después de aplicarse; que describa la mitad de lo que hace es peor que renombrarla ahora, cuando todavía no se ha aplicado. — Costo si me equivoco: ninguno, la migración no existe todavía.

Task 6: dispatched (BASE a9c5e04, model sonnet, brief task-6-brief.md, ampliada por C10 y renombrada por C11)
Task 6: implementer DONE (commit 4a81813, 58/58 pgTAP, 9 aserciones nuevas). Amplió C10 (dos disparadores de tabla-modalidad) y aplicó C11 (renombre). Analizó el riesgo de los tres disparadores: ningún orden los derrota. Review dispatched (model sonnet).
Task 6: complete (commits a9c5e04..4a81813, review clean, sin ronda de arreglo). C10 cerrado: los dos disparadores de tabla-modalidad existen y están probados en insert y update, con camino positivo cada uno. El revisor trazó independientemente los tres órdenes de operaciones y no encontró bypass.
Task 6: minor (deferred): los disparadores de modalidad comparan con `<>` sobre una subconsulta; si devolviera nulo la fila pasaría. Hoy es imposible porque ambas FK son `not null` y no diferibles, pero la protección depende de que esa forma no cambie. Alternativa más robusta: `not exists (... and tracking_mode = ...)`.
Task 6: minor (deferred): el patrón de subconsulta está duplicado casi idéntico entre los dos disparadores; no amerita helper a este tamaño.
Task 7: dispatched (BASE 4a81813, model sonnet, brief task-7-brief.md, con instrucción C9)
Task 7: implementer DONE (commit 2e05b2a, 77/77 pgTAP, 19 aserciones nuevas). Review dispatched (model sonnet).
Task 7: fix round 1/5 (1 addressed, 0 open — unicidad de extras.name y combos.name sin probar, y ausentes de la tabla de cobertura; commits 2e05b2a..6d32953)
Task 7: complete (commits 4a81813..6d32953, review clean)
Task 7: minor (deferred): el check `occupies_quantity > 0` es una restricción inline sin nombre, a diferencia de sus hermanas nombradas en el mismo archivo.
Task 8: dispatched (BASE 6d32953, model sonnet, brief task-8-brief.md, con instrucción C9)

**Ruling C12 (defecto de la spec, descubierto en Task 8):** el SQL que yo escribí para `reservations.ends_at` no ejecuta. `timestamptz + interval` es STABLE y no IMMUTABLE, y Postgres rechaza una expresión no inmutable dentro de `generated always as ... stored`. El implementador lo diagnosticó consultando `pg_proc.provolatile` y lo resolvió pasando por `at time zone 'UTC'` en ambos lados, que sí es inmutable y da el mismo instante. Se acepta la corrección y se corrige también la spec y el plan (commit 2d8754d), porque la spec es la autoridad y contenía SQL que no corre. Verificado que es la única columna generada en todo el plan, así que el defecto no se repite. — Motivo: sumar en UTC es además semánticamente lo correcto para una duración en minutos, que es tiempo absoluto; Costa Rica no tiene horario de verano, así que no hay ambigüedad. — Costo si me equivoco: ninguno detectado; el valor calculado es idéntico.

Task 8: implementer DONE_WITH_CONCERNS (commit baf014e, 99/99 pgTAP, 20 aserciones nuevas). La única "concern" era C12, ya resuelta. Review dispatched (model sonnet).

**Ruling C13 (defecto de la spec, descubierto en Task 8):** el documento de flujo es inequívoco — "el cobro no se parte: se queda completo en la reserva original" y "la segunda salida nace sin cobro propio" — pero nada en el esquema lo impide. Una reserva hija puede recibir sus cuatro montos de tarifa, que es cobrarle dos veces al mismo cliente. Se agrega una restricción en una migración NUEVA (`20260828000750_split_child_no_charge.sql`), no editando la 000700 que ya se aplicó. Alcance: solo las cuatro columnas de tarifa (`list_amount_*`, `agreed_amount_*`). El tiempo adicional NO se ve afectado, porque vive en `reservation_charges` de la tarea 9 y una salida hija sí puede pasarse de su hora. — Motivo: cobrar dos veces es un daño real y concreto, y el documento no deja margen de interpretación. — Costo si me equivoco: si algún día el negocio necesita cobrar una salida hija por separado, hace falta una migración para soltar la restricción; el cambio es de una línea y el error sería visible de inmediato al intentarlo.
Task 8: fix round 1/5 (2 addressed, 0 open — restricción de cobro en reserva hija (C13) y cobertura de reservation_guides; commits baf014e..0a11352)
Task 8: complete (commits 6d32953..0a11352, review clean). Incluye el commit 2d8754d del controlador corrigiendo spec y plan por C12.
Task 8: minor (deferred): `combo_id` y `parent_reservation_id` omiten `on delete restrict` a diferencia del resto de las FK de la migración; funcionalmente equivalente bajo NO ACTION, inconsistente de estilo.
Task 8: minor (deferred): `fuel_out`/`fuel_in` en reservation_items no tienen check de rango 0-100, a diferencia de `equipment_units.current_fuel`.
Task 9: dispatched (BASE 0a11352, model sonnet, brief task-9-brief.md, con instrucción C9)
Task 9: implementer DONE (commit 1fd80d4, 122/122 pgTAP, 18 aserciones nuevas). Concern declarada: tres índices sin aserción propia. Review dispatched (model sonnet).

**Ruling C14 (defecto sistémico de la spec, descubierto por el ⚠️ de la revisión de Task 9):** el plan declaraba "ninguna tabla operativa acepta DELETE" y a la vez lo concedía en quince lugares, porque `for all` en PostgreSQL cubre select, insert, update Y delete. El caso más grave: `deposits_write for all` habría dejado a reservas borrar un depósito ya resuelto, evadiendo por completo el disparador que lo congela. Ninguna tarea posterior lo habría atrapado, porque el plan nunca pidió probar que un borrado se rechaza. Corregido en el commit 88ad221: las 15 políticas pasan a `for insert` + `for update` explícitas, la migración de la tarea 13 revoca el privilegio `delete` y ajusta los privilegios por defecto (Postgres evalúa los GRANT antes que las políticas, así que la regla queda inalcanzable y no solo no declarada), y el estándar de cobertura de la tarea 13 ahora exige una aserción de borrado rechazado. Briefs 13 y 14 regenerados. — Motivo: era la brecha más peligrosa encontrada hasta ahora; el resto de los hallazgos eran de cobertura, este concedía de verdad una operación que el sistema promete no permitir. — Costo si me equivoco: dos políticas por tabla en vez de una, y un revoke que habría que soltar si alguna vez se necesitara borrado real.
Task 9: fix round 1/5 (3 addressed, 0 open — predicado de deposits_pending_idx, cuarta rama de deposits_resolution_shape, porcentaje 100 aceptado; commits 1fd80d4..7e068dc)
Task 9: complete (commits 0a11352..7e068dc, review clean). Incluye el commit 88ad221 del controlador por C14.
Task 9: minor (deferred): charges_reservation_idx y charges_day_idx sin aserción estructural; son índices de rendimiento corrientes, decisión deliberada con precedente en Task 7.
Task 10: dispatched (BASE 7e068dc, model sonnet, brief task-10-brief.md, con instrucción C9)
Task 10: implementer DONE (commit de8d2b6, 142/142 pgTAP, 16 aserciones nuevas). Review dispatched (model sonnet).
Task 10: complete (commits 7e068dc..de8d2b6, review clean, sin ronda de arreglo). La regla corregida por el dueño (costo independiente de is_external) queda protegida por una aserción afirmativa.
Task 10: minor (deferred): `maintenance_records.cost_amount` es numeric(12,2) mientras las columnas de dinero equivalentes en la tarea 9 son numeric(14,2), dimensionadas para colones. Irrelevante a estas magnitudes; viene del brief.
Task 10: minor (deferred): el fixture positivo de línea por cantidad usa una categoría by_unit; nada lo prohíbe, pero es semánticamente raro y resta realismo a la prueba.
Task 10: minor (deferred): el comportamiento `on delete restrict` de las FK no tiene aserción propia; fuera del estándar de cobertura y sin precedente en la suite.
Task 11: dispatched (BASE de8d2b6, model sonnet, brief task-11-brief.md, con instrucción C9)
Task 11: implementer DONE (commit 381fc5c, 169/169 pgTAP, 27 aserciones nuevas). Review dispatched (model sonnet).

**Ruling C15 (defecto de la spec, confirmado empíricamente en Task 11):** `category_availability` usa un cross join implícito entre los CTE `stock` y `taken`. Si la categoría no tiene fila en `equipment_stock`, `stock` queda vacío y la función devuelve CERO filas en vez de una fila con `usable = 0`. Para quien la llama esperando una fila, eso es la diferencia entre "no hay ninguno libre" y un resultado vacío que la pantalla no sabe interpretar. El estado es alcanzable: cualquier categoría nueva que administración cree por el CRUD y todavía no inventaríe. Se corrige con left join y `coalesce(stock.usable, 0)`, en una migración NUEVA. — Motivo: la función existe para informar, y devolver nada no informa. — Costo si me equivoco: ninguno; una categoría sin stock registrado devolverá 0 libres, que es la verdad.

**Ruling C16 (defecto de la spec, confirmado empíricamente en Task 11):** `unit_current_state` ordena las reservas despachadas por `ends_at` ASCENDENTE y toma la primera, así que con dos despachos solapados sobre la misma unidad muestra el que TERMINA PRIMERO. Reproducido: A de 09:00 a 12:00 y B de 10:00 a 10:30 sobre la misma unidad hacen que el tablero diga "vuelve a las 10:30" mientras A sigue vigente hasta las 12:00. El estado es alcanzable en producción precisamente porque el choque de disponibilidad avisa pero no bloquea, que es una decisión explícita del negocio. La consecuencia es operativa y concreta: alguien vuelve a entregar un equipo que sigue en el agua. Se corrige a `order by r.ends_at desc`, porque la unidad no está libre hasta que termina el ÚLTIMO despacho activo. — Motivo: de las dos respuestas posibles, la tardía es la segura; equivocarse por exceso de cautela cuesta una espera, equivocarse por defecto cuesta entregar equipo que no está. — Costo si me equivoco: el tablero muestra una hora de regreso más tardía de la real en un caso de doble despacho, que es el lado correcto en el que fallar.
Task 11: fix round 1/5 (2 addressed, 0 open — C15 fila única de category_availability, C16 orden descendente en unit_current_state; commits 381fc5c..78f1a37). Spec y plan corregidos en f3807bd.
Task 11: complete (commits de8d2b6..78f1a37, review clean)

**Ampliación de C2 (Task 12), con inventario verificado:** el bucle del plan solo cubría tablas con `created_by` Y `updated_by`. El inventario real de las 21 tablas da SEIS formas distintas de columna de firma: (1) created_by+updated_by — 9 tablas; (2) created_by solo — 5 tablas, incluidas reservation_charges y refunds; (3) granted_by/granted_at — worker_areas, worker_marks; (4) assigned_by/assigned_at — reservation_guides; (5) uploaded_by/uploaded_at — unit_condition_photos; (6) updated_by solo — equipment_stock. Además `deposits` tiene `resolved_by`, que es una firma sobre una tabla de dinero y hoy la pondría el cliente. Sin cubrir las seis, la restricción global "la firma la pone la base" solo se cumple en 9 de 21 tablas, y las que quedan fuera incluyen todas las de dinero. Tres tablas puente (combo_items, extra_compatibility, inventory_count_lines) no tienen columnas de firma y quedan fuera por diseño; password_reset_pins solo tiene created_at con default.

Task 12: dispatched (BASE f3807bd, model sonnet, brief task-12-brief.md, ampliada por C1 y C2)
Task 12: implementer DONE (commit 355b25b, 192/192 pgTAP, 17 aserciones nuevas). RED correcto: fallaron las 12 de falsificación y supervivencia. Concerns: (a) mi conteo de "21 tablas" era 24, las listas por forma sí correctas; (b) la falsificación de deposits.resolved_by al INSERTAR no queda cubierta. Review dispatched (model sonnet).

**Ruling C17 (corrección de mi propio C2, confirmada en vivo):** mi ruling decía estampar `deposits.resolved_by` "cuando una actualización mueva el estado fuera de held", y esa redacción dejó fuera la INSERCIÓN. `deposits_resolution_shape` permite insertar una fila ya resuelta si trae `resolved_at` y `resolved_by`, así que un cliente con permiso de inserción puede crear un depósito ya resuelto y atribuir esa resolución a otra persona. El revisor lo reprodujo contra la base viva: autenticado como A, insertó con `resolved_by` = B y quedó guardado B. También probó la extensión y verificó que las pruebas de la tarea 9 que el implementador temía romper siguen pasando, porque corren como `postgres` con `auth.uid()` nulo y el `coalesce` no hace nada. Se extiende el estampado a la rama de INSERT cuando `status <> 'held'`. — Motivo: es una firma falsificable sobre una tabla de dinero, que es exactamente la clase de defecto que esta tarea existe para cerrar. — Costo si me equivoco: ninguno detectado; la extensión es un `coalesce` que respeta el valor explícito cuando no hay usuario autenticado.
Task 12: fix round 1/5 (1 addressed, 0 open — C17, falsificación de resolved_by al insertar; commits 355b25b..f5c7895). Cierre verificado reproduciendo el ataque contra la base viva.
Task 12: complete (commits f3807bd..f5c7895, review clean)
Task 12: minor (deferred): cinco funciones de disparador casi idénticas que solo difieren en nombres de columna; el propio encabezado de la migración justifica la repetición sobre una alternativa con TG_ARGV, priorizando auditabilidad sobre DRY en una migración de seguridad.
Task 13: dispatched (BASE f5c7895, model sonnet, brief task-13-brief.md regenerado con C14, más puntero a C6)

**Ruling C18 (Task 13):** activar RLS rompió `011_audit.test.sql`: su prueba de falsificación sobre la forma `granted_by` inserta en `worker_areas` como no-administrador, y la política nueva lo rechaza con razón. La suite quedó en rojo (`planned 18 tests but ran 8`). El implementador hizo lo correcto al reportarlo sin editarlo. Se repara autenticando como administración para esa aserción: sigue falsificando —suministra el id de otro trabajador en `granted_by` y verifica que se sobrescribe— y ahora es una operación permitida. Editar un archivo de PRUEBAS es legítimo; la regla de no editar aplica a migraciones aplicadas. — Motivo: la prueba medía trazabilidad, no permisos, y su fixture asumía un mundo sin RLS que ya no existe. — Costo si me equivoco: la forma `granted_by` quedaría probada solo bajo la cuenta de administración, que es de todos modos la única que puede otorgar áreas.

**Ruling C19 (defecto de mi spec, encontrado empíricamente en Task 13):** `seed_base_area()` es un disparador `after insert` sobre `workers` que inserta el área base en `worker_areas`. Al restringir esa tabla a administración, la inserción del propio disparador pasó a rechazarse cuando quien crea la cuenta NO es administración — es decir, exactamente en el escenario que el documento describe con más detalle: reservas con la marca `registro_guias_externos` creando un guía externo. Mi spec no previó que el disparador quedaría sujeto a la política que ella misma agregaba. El implementador lo detectó probando el escenario, no leyendo. Se acepta su corrección: `seed_base_area()` pasa a `security definer`, aplicada por `create or replace` en migración nueva sin tocar la de la tarea 3. Es seguro: es una función de disparador, no invocable directamente, y solo inserta el área base de la fila recién creada. — Motivo: sin esto la funcionalidad de guías externos no existe. — Costo si me equivoco: una función `security definer` más en la superficie de seguridad; acotada a una sola inserción derivada de NEW.
Task 13: implementer DONE (commits 0758b25 + bae079c, 257/257 pgTAP, 64 aserciones nuevas). Aplicó C19 (seed_base_area security definer) y C18 (reparación de 011_audit); encontró una segunda aserción afectada revisando el archivo completo. Review dispatched (model sonnet).
Task 13: complete (commits f5c7895..bae079c, review clean, sin ronda de arreglo tras C18/C19). Verificado en vivo: 33 políticas, ninguna ALL ni DELETE; el bloqueo de borrado lo hace el GRANT revocado; las tres ramas de negación de guías externos rechazadas; C19 sin camino de escalada.
Task 13: minor (deferred): el comentario de seed_base_area no dice que stamp_audit_fields (BEFORE INSERT, tarea 12) corre antes que este AFTER INSERT y es lo que hace confiable a new.created_by; quien reordene disparadores podría reabrir la atribución sin notarlo.
Task 13: minor (deferred): las tablas de solo inserción no tienen aserción explícita de "no existe política de update"; sin política todo update filtra a cero filas igual, pero sería más explícito.
Task 14: dispatched (BASE bae079c, model sonnet, brief task-14-brief.md regenerado con C14)
Task 14: implementer DONE (commit b4dc419, 296/296 pgTAP en 14 archivos, 39 aserciones nuevas). Reparó de nuevo 011_audit (tres formas) cambiando actor a reservas. Review dispatched (model sonnet).
Task 14: complete (commits bae079c..b4dc419, review clean, sin ronda de arreglo). Verificado en vivo: operaciones lee catálogo (1|1|1) y cero de dinero (0|0|0) sobre tablas con filas reales, reservas sí las ve (1|1|1); ninguna política ALL ni DELETE en todo el esquema.
Task 14: minor (deferred): las cuatro políticas de update de sub-tablas de catálogo (extras, extra_compatibility, combos, combo_items) no tienen prueba de negación propia. Verificadas correctas en vivo hoy, pero un aflojamiento futuro de cualquiera pasaría inadvertido. El implementador se ofreció a agregarlas: candidato claro para la revisión final.
Task 14: minor (deferred): reservation_charges no tiene política de update (solo inserción), lo cual es más estricto de lo pedido y es buena decisión —los movimientos de dinero son inmutables— pero no está documentado en el comentario de la migración.
Task 15: dispatched (BASE b4dc419, model sonnet, brief task-15-brief.md)

**Ruling C20 (defecto CRÍTICO de mi plan, confirmado por el controlador en Task 15):** `purge_expired_history()` es `security definer` con dueño `postgres` y su ACL quedó con el default de Postgres, que concede EXECUTE a PUBLIC. Verificado: `=X/postgres | anon=X/postgres | authenticated=X/postgres`. Es decir, cualquier cliente —incluido `anon`, sin autenticarse— puede invocarla y borrar cinco años de historial de reservas, saltándose RLS y la revocación de DELETE de la tarea 13, porque `security definer` corre con los privilegios del dueño. Es la ÚNICA función del sistema que puede borrar datos y era la única sin control de acceso. El implementador reportó "verificado que corre como authenticated" como señal de éxito; esa misma frase era el síntoma. Se revoca EXECUTE de PUBLIC, anon y authenticated en migración nueva, dejándola solo para el dueño y el rol de servicio, que es quien la agenda pg_cron. — Motivo: una función de borrado invocable por anónimos es la brecha más grave posible en un esquema cuya regla central es que nada se borra. — Costo si me equivoco: ninguno; el trabajo programado corre como postgres y no se ve afectado.
Task 15: fix round 1/5 (1 addressed, 0 open — C20, EXECUTE revocado de public/anon/authenticated; commits cfcf97d..9125f11)
Task 15: complete (commits b4dc419..9125f11, 325 aserciones). Revisión de tarea OMITIDA por decisión del usuario (ver ruling C21).

**Ruling C21 (decisión del usuario, 2026-08-29):** el usuario instruye construir la aplicación completa primero y dejar las pruebas profundas para el final, porque el ciclo de cobertura exhaustiva agota los límites de sesión y cada corte cuesta seis horas. A partir de la tarea 16: pruebas de humo en vez de cobertura exhaustiva, una revisión por módulo en vez de una por tarea, y rondas de arreglo solo ante rotura real. EXCEPCIÓN que el controlador mantiene salvo instrucción contraria: todo lo que toque autenticación, permisos o dinero conserva revisión propia — son los tres sitios donde un error no se ve y donde esta ejecución ya encontró cinco defectos reales (C13 doble cobro, C14 for all concedía DELETE, C16 tablero mandando a entregar equipo ocupado, C17 firma falsificable, C20 purgado invocable por anónimos). — Costo si me equivoco: los defectos de las capas de pantalla aterrizan igual pero se encuentran al final, juntos y más caros de rastrear; el usuario aceptó ese intercambio explícitamente.
Task 16+17: complete (commits 64b7d40 + 09a50e2, despachadas juntas y sin revisión propia por C21).

**Ruling C22 (Task 16, conflicto estructural real):** el seed carga el inventario real de la empresa y los 14 archivos pgTAP fijan los mismos valores únicos (`admin@arenal.local`, `Jet Ski`, `JET-01`). Resetear CON seed y luego correr la suite chocaba en esas llaves: 325/325 pasan sin seed, 8/325 con él. No es defecto del seed ni de las pruebas, es que comparten espacio de nombres. Se separa: `db:test` resetea con `--no-seed` (la suite corre contra un esquema vacío, que es lo que sus fixtures asumen) y `db:reset` sigue sembrando, que es lo que quiere quien abre la aplicación. Commit 6bf8f0e. — Motivo: la alternativa era renombrar valores en 14 archivos ya congelados, mucho más churn por el mismo resultado. — Costo si me equivoco: las pruebas nunca se ejercitan contra datos preexistentes; queda anotado como deuda para cuando se hagan las pruebas profundas.

Verificación final del modelo de datos: db:test 325/325 PASS · seed carga (4 jet skis, 2 lanchas, 6 kayaks dobles, 3 individuales, extras por unidad correctos) · lint PASS · typecheck PASS · vitest 1/1 · build PASS · tipos generados 55KB / 27 entidades.
Revisión final de rama OMITIDA por decisión del usuario (C21).
