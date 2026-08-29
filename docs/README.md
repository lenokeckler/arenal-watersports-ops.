# Documentación

## `proyecto/` — requisitos vinculantes

Lo que hay que construir. Generado desde los documentos originales en
`docs_proyecto/`, que se conservan tal cual los entregó el curso.

| Archivo                   | Qué es                                                                                                                                 |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `flujo-del-proyecto.md`   | El flujo completo de la aplicación en orden de uso. Cada viñeta de primer nivel es un epic y cada una de segundo nivel es una historia |
| `historias-de-usuario.md` | Las 111 historias en 23 epics, cada una con su descripción y sus criterios de aceptación                                               |
| `product-backlog.md`      | El backlog con dueño y estado por historia                                                                                             |
| `historias-agregadas.md`  | Historias que salieron de decisiones de diseño y todavía no están en el backlog del curso                                              |

**Los criterios de aceptación son la definición de terminado.** Ninguna pantalla
se implementa de memoria ni por analogía con el sistema viejo.

### Módulos

| Módulo               | Epics          | Historias |
| -------------------- | -------------- | --------- |
| Acceso y Sesión      | EP-ACC-01 a 02 | 11        |
| Tablero y Navegación | EP-TAB-01 a 04 | 9         |
| Administración       | EP-ADM-01 a 06 | 31        |
| Reservas             | EP-RES-01 a 07 | 33        |
| Operaciones          | EP-OPE-01 a 04 | 27        |

## `referencia/` — consulta, no código

Material histórico. **Nada de aquí se importa, se copia ni se migra.**

| Carpeta                      | Qué es                                                                                                                                                             |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `app-operaciones/`           | La versión anterior del sistema en Astro + Svelte + Supabase. Su esquema no modela lo que piden las historias nuevas, por eso el modelo de datos se diseña de cero |
| `ejemplo-feature-userLists/` | La feature de ejemplo que traía la base del curso. Se guarda porque muestra el patrón de carpetas que espera `component-architecture`                              |
| `pantallas-stitch.md`        | Catálogo de las 23 pantallas diseñadas en Google Stitch, con sus IDs                                                                                               |

## `superpowers/` — diseño e implementación

Se llena conforme avanza el proyecto.

| Carpeta  | Qué es                                                      |
| -------- | ----------------------------------------------------------- |
| `specs/` | El diseño validado de cada módulo, antes de escribir código |
| `plans/` | El plan de implementación que sale de cada spec             |
