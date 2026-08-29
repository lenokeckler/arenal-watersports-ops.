# App_operaciones — referencia historica

Codigo de la version anterior del sistema (Astro + Svelte + Supabase), que
vivia en `Desktop/Arenal WaterSports/App_operaciones`.

**Esto no es codigo del proyecto.** Nada de aqui se importa, se copia ni se
migra. Esta guardado solo para consultar como se resolvieron algunos
problemas de dominio antes.

## Por que no se reutiliza el esquema

Las 111 historias de usuario piden cosas que esta version no modela:

- Roles con areas habilitables por cuenta, en vez de un rol fijo.
- Marcas sobre la cuenta: guia, encargado general, registro de guias externos.
- Cuentas temporales de guia externo con fecha de caducidad obligatoria.
- Bloqueo por diez intentos fallidos y recuperacion por PIN al correo personal.
- Categorias que se identifican unidad por unidad frente a categorias que se
  llevan por cantidad.
- Extras de lanchas, combos con precio de paquete y depositos de garantia.
- Tablero que se actualiza solo cuando un companero despacha o cierra.

El modelo de datos del proyecto se disena de cero a partir de las historias.

## Contenido

| Carpeta | Que es |
| --- | --- |
| `supabase/` | Esquema y migraciones de la version vieja |
| `logica/` | Modulos de dominio en TypeScript: auth, disponibilidad, reservas, guias, admin |
| `historias-de-usuario-version-vieja.md` | Historias anteriores, superadas por `docs/proyecto/historias-de-usuario.md` |
