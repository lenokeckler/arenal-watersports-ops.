# Los cinco despachos que faltan

Cada uno se lanza con el contenido completo de `BRIEF-AGENTES.md` seguido del
alcance de abajo. Uno a la vez: los dos verifican contra la misma base local y
ambos terminan con `npm run db:reset`.

Maquetas en `docs/referencia/stitch/`, catalogadas con sus historias en
`docs/referencia/pantallas-stitch.md`.

---

## Despacho 2 — Reservas: tipos, combos, extras y guias (Sonnet)

7 historias, dos epicas.

- **EP-RES-03**: US-RES-008 tipo de reserva, US-RES-009 combo predefinido,
  US-RES-010 combo a la medida, US-RES-011 extras de una salida de lancha.
- **EP-RES-04**: US-RES-012 asignacion de guias a un tour, US-RES-013 cuenta
  temporal de guia externo, US-RES-014 consulta del guia de cada tour.

Maquetas: `tipo-de-salida`, `combo-predefinido`, `combo-a-la-medida`,
`extras-de-la-salida`, `guias-de-la-salida-asignacion`,
`cuenta-temporal-guia-externo`.

Ojo: la cuenta temporal de guia externo ya existe como concepto en
Administracion (EP-ADM-01 la construyo con caducidad y reposicion de
contrasena). Reutilizar esa ruta y ese flujo, no construir un segundo camino.
El extra que ocupa cupo de una categoria por cantidad ya esta modelado en
`extras.occupies_category_id` / `occupies_quantity`.

## Despacho 3 — Reservas: cambios sobre una reserva (Sonnet)

5 historias, EP-RES-06: US-RES-018 modificacion, US-RES-019 division en varias
salidas, US-RES-020 posposicion, US-RES-021 cancelacion, US-RES-022
cancelacion de una salida en curso.

Maquetas: `detalle-de-la-reserva`, `dividir-la-salida`,
`posponer-la-reserva`, `cancelar-la-reserva`.

Reglas que las historias fijan y no se negocian: al dividir, **el cobro no se
parte** — se queda completo en la original y la segunda salida nace sin cobro
propio; el deposito tambien se queda en la original. Al posponer, **el cobro y
el deposito se conservan** para la fecha nueva y al cliente no se le vuelve a
cobrar; una reserva ya despachada solo se pospone por clima, y en ese caso el
equipo se cierra registrando lo que si se uso. El motivo de cancelacion es
obligatorio. Ya existe la migracion `20260828000750_split_child_no_charge.sql`.

## Despacho 4 — Reservas: cobros, descuentos y depositos (Opus)

11 historias, EP-RES-07: US-RES-023 a US-RES-033.

Maqueta: `cobros-y-depositos--movil`.

Va con Opus porque aqui se cuenta plata. Lo que ya esta resuelto en el
esquema y no se replica en TypeScript: `reservation_charges` guarda su propio
monto, independiente de `tariffs`, para que cambiar una tarifa nunca toque
dinero ya cobrado; `refunds` y `deposits` tienen su forma y su RLS; las vistas
de `20260828001500_reports.sql` ya calculan ingresos por dia y por mes **y por
moneda**, sin sumar monedas jamas, porque el sistema no maneja tipo de cambio.
US-RES-032 (ingresos del dia) y US-RES-033 (depositos pendientes) leen de ahi.

## Despacho 5 — Operaciones: despacho y cierre (Sonnet)

9 historias.

- **EP-OPE-01**: US-OPE-001 a US-OPE-008.
- **EP-OPE-02**: US-OPE-009 cierre de una reserva.

Maquetas: `reservas-pendientes-de-despachar`, `gasolina-y-horas-al-despachar`,
`tiempo-restante-despachado`, `despacho-de-salidas--movil`,
`cierre-de-salida--movil`, `centro-de-operaciones-escritorio--escritorio`.

El estado y la disponibilidad salen de `unit_current_state` y
`category_availability`, nunca de un calculo en el cliente.

## Despacho 6 — Operaciones: maquinas, mantenimiento e inventario (Opus)

18 historias.

- **EP-OPE-03**: US-OPE-010 a US-OPE-020.
- **EP-OPE-04**: US-OPE-021 a US-OPE-027.

Maquetas: `reporte-de-dano`, `fotos-de-estado-de-maquina`,
`unidad-en-mantenimiento`, `historial-de-mantenimiento`,
`levantamiento-de-conteo`, `historial-de-conteos`, `avisos-del-inventario`,
`inventario-y-flota--movil`.

Va con Opus por volumen y porque toca el registro de lo que volvio del agua:
`equipment_units.usage_total` es el acumulado que operaciones mantiene y del
que ya lee el reporte de horas de uso (US-ADM-028). Las fotos necesitan
Supabase Storage, que ya esta levantado pero al que ninguna historia ha
escrito todavia: revisar la politica del bucket antes de subir nada.
