# Brief permanente para los agentes constructores

Este archivo existe para que ningún despacho vuelva a tropezar con algo que
este proyecto ya pagó caro. Cada punto de abajo salió de un defecto real, no
de una buena práctica genérica. Se le pasa completo a cada agente antes de
que escriba una línea.

Si algo de aquí contradice al código, gana el código. Si contradice a
`AGENTS.md`, gana `AGENTS.md`.

---

## Antes de escribir una línea

1. `AGENTS.md` en la raíz. Es el contrato: qué estándares aplican y en qué orden.
2. Los `SKILL.md` que apliquen, de `.agents/skills/` y `.claude/skills/`.
3. `docs/decisiones/ESTADO-ACTUAL.md`. Dice dónde quedó todo y por qué.
4. Las historias del alcance, en `docs/proyecto/historias-de-usuario.md`.
   **Son vinculantes.** Cada criterio de aceptación se cumple o se explica por
   qué no. Nada de implementar de memoria ni por analogía con el sistema viejo.

## Las nueve trampas. Ninguna es teórica.

1. **La disponibilidad la calcula la base, nunca TypeScript.** Ya existen
   `unit_conflicts(...)`, `category_availability(...)` y la vista
   `unit_current_state`. Resuelven el intervalo semiabierto `[)` y el caso de
   dos despachos sobre la misma unidad. Recalcular eso en el cliente es
   reintroducir un defecto que costó una reproducción en vivo encontrar.
2. **Toda vista nueva se crea con `with (security_invoker = true)`.** Sin
   excepción. Sin esa opción la vista evalúa el RLS como su dueño
   (`postgres`, superusuario) y se vuelve una puerta lateral alrededor de la
   seguridad por fila. Se arregló exactamente ese defecto en
   `unit_current_state` (migración `20260828001550`): un trabajador sin área
   leía por la vista el identificador y la hora de regreso de reservas que sus
   propias políticas le negaban.
3. **`DELETE` está revocado para `authenticated`.** Cualquier borrado necesita
   una ruta de servidor con `service role` bajo `app/api/...`. Insert y update
   sí van por el cliente del propio trabajador. Patrón:
   `app/api/administracion/categorias/[categoryId]/route.ts`.
4. **Ninguna consulta a Supabase ignora `error`.** Siempre
   `const { data, error } = await ...` y luego
   `throwIfSupabaseError(error, "modulo.nombreDeLaFuncion")` antes de tocar
   `data`. Dentro de un `Promise.all`, cada resultado se revisa por separado.
   Tragarse un error ya mostró una lista vacía en vez de un fallo, y diez
   historias terminadas parecieron rotas.
5. **`??` no atrapa la cadena vacía**, solo `null` y `undefined`. Una variable
   de entorno vacía pasó como configurada y el correo murió en silencio.
6. **Un `0` nunca significa "sin límite" por implicación.** `TOTAL_MINUTES: 0`
   quería decir "sin caducidad" y el código lo leyó como "cero minutos",
   cerrando la sesión al instante: lo contrario exacto de lo que se quería.
   Si hace falta un centinela, que sea explícito y con nombre.
7. **Precedencia cuando algo se contradice:** el esquema gana a la maqueta, y
   la historia gana a la maqueta. Precedentes ya resueltos con la dueña: los
   kayaks se llevan por cantidad aunque el diseño muestre tarjetas por unidad,
   y la navegación sigue la historia aunque los diseños de escritorio usen
   menú lateral.
8. **No correr `npm run format`.** `.prettierrc.json` fija `printWidth: 60` y
   buena parte del código viejo nunca pasó por ese ancho, así que `format`
   reescribe decenas de archivos ajenos a la tarea. Usar
   `npx prettier --check <archivos propios>` y arreglar solo los propios.
9. **No inventar tokens de Tailwind.** Reutilizar los del sistema de diseño;
   inventarlos ya produjo tarjetas estiradas.

## Verificación

Decisión de la dueña, por presupuesto: **construir primero, probar después.**
No escribir suites de pruebas nuevas ni invocar agentes revisores. Lo único
que se conserva, y es obligatorio, es **abrir las pantallas y mirarlas una
vez**. Cada defecto real de este proyecto fue invisible en el código y
evidente al ejecutarlo.

- La base local es Supabase en Docker. Si no responde, `npm run db:start`.
- Credenciales sembradas: `admin` / `Arenal.2026`. Esa cuenta arranca con
  `must_change_password = true`, así que el primer ingreso pasa siempre por
  `/acceso/primer-ingreso`. No es un defecto, es US-ACC-003.
- No hay navegador gráfico. El sustituto que funciona: sesión autenticada
  armada por script (Node + `@supabase/ssr` con un cookie jar en memoria),
  `curl` contra la app corriendo, y `psql` contra la base
  (`docker exec supabase_db_arenal-watersports-ops psql -U postgres -d postgres -c "..."`).
- Al terminar, dejar la base limpia con `npm run db:reset`.

## Higiene de procesos

La dueña llegó a tener ~20 procesos huérfanos y la computadora casi colapsa.
**Matar todo `npm run dev` que se levante**, y antes de cerrar verificar que
no queda nada propio corriendo (`tasklist //FI "IMAGENAME eq node.exe"`).
Los contenedores de Supabase los administra la sesión principal: dejarlos.

## Cómo entregar

- **Commit por épica**, no uno solo al final. Mensajes en inglés, diciendo qué
  historias cierran y qué se decidió donde la historia era ambigua.
- Código, comentarios y commits en **inglés**. Texto de interfaz y segmentos
  de URL en **español**.
- Antes de terminar, `npm run lint`, `npm run typecheck` y `npm run build`
  tienen que pasar los tres. No entregar en rojo.
- Si se acaba el margen a media tarea, **parar y commitear** con un mensaje
  `wip(...)` que diga qué quedó terminado y cuál es el siguiente paso. Un
  agente que muere sin commitear cuesta más que uno que entrega a medias.
- No cambiar de rama, no mezclar a `develop`, no hacer `git push`.

## Reporte final

En prosa breve, no en lista de archivos: qué historias quedaron cerradas, qué
se decidió donde la historia era ambigua o contradecía al esquema, qué
defectos aparecieron al ejecutar, y qué quedó sin hacer. Lo que la dueña tenga
que mirar o decidir, aparte y con claridad.
