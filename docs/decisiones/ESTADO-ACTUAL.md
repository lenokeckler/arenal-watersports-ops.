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
