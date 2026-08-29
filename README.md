# Arenal Water Sports — Operaciones

Sistema interno de operaciones para Arenal Water Sports, un operador de alquiler
de equipo acuático y tours en el Lago Arenal. Reemplaza el agendado en Google
Calendar y la coordinación por WhatsApp por un solo lugar donde la información
vive y se consulta.

No es la página pública de la empresa. Los usuarios son los trabajadores, el
cliente final nunca entra, y por eso la aplicación se piensa primero para el
celular.

## Stack

| Capa              | Tecnología                         |
| ----------------- | ---------------------------------- |
| Framework         | Next.js 16 (App Router) + React 19 |
| Lenguaje          | TypeScript                         |
| Estado compartido | Redux Toolkit                      |
| Estilos           | Tailwind CSS 4                     |
| Backend           | Supabase                           |
| Diseño            | Google Stitch, vía servidor MCP    |

La base del proyecto viene de la plantilla del curso
(`Web_practice/BaseProyectos`): se conservan su arquitectura, sus convenciones y
su catálogo de skills. Lo que se removió fue el contenido específico del producto
de ejemplo y toda la capa de Firebase, sustituida por Supabase.

## Arrancar

```bash
npm install
cp .env.example .env.local     # y llenar las llaves de Supabase
npm run dev
```

La aplicación queda en http://localhost:3000.

Para el servidor MCP de Stitch, copiar `.mcp.json.example` a `.mcp.json` y poner
la API key. Ese archivo está en `.gitignore` porque lleva credenciales.

## Comandos

```bash
npm run dev          # desarrollo con Turbopack
npm run build        # build de producción
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
npm run format       # Prettier
```

Antes de mezclar una rama de tarea, los cuatro últimos deben pasar.

## Estructura

```
app/
  components/     componentes reutilizables (Button, FormField, Toast, Session…)
  constants/      strings, números y rutas — nada de literales sueltos
  features/       una carpeta por funcionalidad
  services/       acceso a Supabase (cliente de navegador y de servidor)
  store/          Redux Toolkit
  types/          tipos compartidos (Nullable, Optional…)
  utils/          helpers puros y hooks genéricos
docs/
  proyecto/       flujo, 111 historias de usuario y product backlog
  referencia/     material histórico de consulta, no es código del proyecto
.agents/skills/   estándares del stack (cross-IDE)
.claude/skills/   estándares de ingeniería y pipeline de subagentes
.claude/agents/   subagentes especializados
```

## Cómo se trabaja

`AGENTS.md` es el contrato: qué estándares aplican, en qué orden y con qué
precedencia. Cualquier agente de IA lo lee primero.

Los requisitos son vinculantes y viven en `docs/proyecto/`. Una pantalla no se
implementa de memoria: se abre la historia, se cumplen sus criterios de
aceptación y se dice cuáles cierra el cambio.

### Ramas

```
main                     tronco
 └── develop             rama de trabajo
      └── feat/…         una rama por tarea, se borra al mezclar
```

Nunca se commitea directo a `main` ni a `develop`.
