# Estado actual — retomar desde aquí

Última actualización: 2026-08-29.

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
`Arenal.2026`.

Comandos que importan:

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Levanta la aplicación en http://localhost:3000 |
| `npm run db:start` / `db:stop` | Enciende y apaga Supabase local |
| `npm run db:reset` | Rehace la base y carga el inventario real |
| `npm run db:test` | Corre las 325 pruebas del esquema (sin seed, a propósito) |
| `npm run lint` / `typecheck` / `build` | Verificación de la aplicación |

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

Progreso general estimado: **~35%**. Son 21 de 112 historias, pero la fundación
—esquema, seguridad, diseño, autenticación— está completa, y es la parte que más
caro sale equivocar.

---

## Dónde se quedó el trabajo

**Rama activa: `feat/modulo-administracion`**, sacada de `develop`.

Se estaba construyendo la **primera mitad del módulo Administración**:

- **EP-ADM-01** — trabajadores, roles, áreas adicionales y las tres marcas
  (`guia`, `encargado_general`, `registro_guias_externos`), altas con contraseña
  temporal, bloqueo y desbloqueo, guías externos con caducidad.
- **EP-ADM-02** — el catálogo de categorías del inventario.

El commit con prefijo `wip(admin):` dice qué quedó terminado y qué a medias. Hay
que leerlo antes de seguir.

### Lo primero que hay que hacer mañana

**El typecheck falla.** Seis errores de tipos, todos en un solo archivo:
`app/utils/administracion/categories.ts`, líneas 114-119. Supabase infiere
`GenericStringError` en vez del tipo de la fila, así que `id`, `name`,
`status`, `tracking_mode`, `is_reservable` y `usage_metric` no existen para
TypeScript. El lint sí pasa, y nada de esto está mezclado a `develop`, así que
no rompe nada más. Es un arreglo pequeño y contenido.

**El punto más riesgoso sin verificar**, señalado por quien lo escribió:
`app/api/administracion/trabajadores/[workerId]/permisos/route.ts` usa
`ReturnType<typeof handlePermissionChange>` para exportar `POST` y `DELETE`.
Merece una mirada antes que nada.

**Nunca se ejecutó nada de esto:** el servidor de desarrollo, el build, ni se
creó un trabajador desde la interfaz para entrar como él. Esa última es la
prueba que de verdad valida el módulo, porque atraviesa la cuenta sintética, la
contraseña temporal y el primer ingreso forzado.

### Lo que quedó construido de EP-ADM-01

`/administracion` como hub; `/administracion/trabajadores` con búsqueda,
filtros y paginación en servidor; `/administracion/trabajadores/nuevo` que
muestra la contraseña temporal de un solo uso; y el detalle de cada trabajador
con áreas, las tres marcas, bloqueo y reactivación, reposición de temporal y
extensión de caducidad para guías externos. La cuenta de administración aparece
sin acciones, como debe ser. La barra inferior ganó su icono, visible solo en
modo administración.

Las rutas de servidor usan el rol de servicio y comprueban permisos en código,
porque ese rol se salta la seguridad por fila. El borrado necesita rol de
servicio porque `DELETE` está revocado a `authenticated` a nivel de base.

### Lo que falta de EP-ADM-02, con el camino ya trazado

No existe ninguna pantalla de categorías. Pero la capa de datos ya está escrita
en `app/utils/administracion/categories.ts` (`fetchCategoriesPage`,
`fetchCategoryDetail`, `categoryHasRecords`), y **las categorías no necesitan
ruta de servidor**: la política ya permite a un administrador autenticado
insertar y actualizar directamente, igual que hace `ProfileForm`.

El siguiente paso concreto era copiar la forma de `WorkerList` para la lista, y
después un `CategoryForm` compartido entre crear y editar, con `tracking_mode`
bloqueado en edición cuando `categoryHasRecords` sea verdadero, los campos
condicionales (`usage_metric` solo si lleva motor, avisos, depósito por moneda)
y el botón que borra o desactiva según si la categoría ya tuvo registros.

### Una contradicción ya resuelta, por si reaparece

Las validaciones de EP-ADM-02 dicen que una categoría reservable siempre se
identifica una por una. **Eso es falso y ya se decidió así con el dueño**: los
kayaks son reservables y se llevan por cantidad. El esquema no tiene esa
restricción y el seed los siembra de esa forma a propósito. Está registrado como
la decisión del modo híbrido. No hay que volver a abrirla.

**Lo que falta de Administración**, que era un segundo despacho y no se empezó:
EP-ADM-03 (unidades y artículos), EP-ADM-04 (extras de las lanchas), EP-ADM-05
(combos y tarifas) y EP-ADM-06 (estadísticas y reportes).

**Después de Administración:** Reservas (33 historias) y Operaciones (27). Son
los dos módulos donde vive la lógica real del negocio —despacho, cierre, choques
de disponibilidad, cobros y depósitos— así que son más difíciles que
Administración, que es sobre todo CRUD.

---

## Cómo se está trabajando

Decisión del dueño, tomada por presupuesto: **construir primero, probar después.**
Sin suites de pruebas por tarea, sin agentes revisores, sin rondas de arreglo.

Lo único que se conserva es que cada agente **abra las pantallas y las mire una
vez**. No es control de calidad, es la diferencia entre entregar algo que
funciona y algo que compila: los últimos defectos del proyecto —el seed que no
dejaba entrar a nadie, los íconos que se leían como palabras, las tarjetas
estiradas— eran todos invisibles en el código y evidentes en pantalla.

Cuando el dueño lo diga, viene una pasada de pruebas y de detalles.

---

## Lo que hace falta del dueño

Ninguna de estas dos frena el trabajo, pero sin ellas el proyecto no sale de
local:

1. **Credenciales del proyecto de Supabase en la nube.** Todo corre y se prueba
   contra la base local; no existe todavía un proyecto en la nube al que subir
   las migraciones.
2. **Las cantidades reales de chalecos, remos, extintores y botiquines.** Están
   en cero a propósito, para que administración las registre desde la
   aplicación, que para eso es un CRUD. Si se prefiere sembrarlas, hacen falta
   los números.

Y una pendiente de mirar, no de hacer: **nadie ha visto el tablero con ojos.**
El entorno donde corren los agentes no tiene navegador, así que se verificó con
peticiones y lectura del texto renderizado. Los datos y los textos están bien.
Vale la pena abrir `/tablero` y decir si algo se ve mal.

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
