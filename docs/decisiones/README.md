# Decisiones tomadas durante la construcción

Bitácora de las decisiones que se tomaron mientras se construía el proyecto,
copiada del espacio de trabajo de ejecución para que sobreviva a la sesión.

Cada entrada marcada como **Ruling** es una decisión que se tomó sin consultar,
con su motivo y con lo que cuesta si estuvo equivocada. Se registraron así a
propósito: son decisiones tomadas en nombre del dueño del proyecto, y él tiene
que poder revisarlas y revertir las que no comparta.

| Archivo | Qué cubre |
| --- | --- |
| `2026-08-28-modelo-de-datos.md` | El esquema completo: 24 tablas, seguridad por fila, disponibilidad, retención |
| `2026-08-29-modulo-acceso.md` | Ingreso, contraseñas, PIN de recuperación, sesión y modo de trabajo |

Las decisiones más consecuentes, por si se lee solo una cosa: **C13** (partir una
reserva permitía cobrar dos veces), **C14** (las políticas concedían el borrado
que el sistema promete no permitir), **C16** (el tablero mandaba a entregar
equipo que seguía en el agua), **C20** (la función de purgado era invocable sin
autenticarse) y **A1** (la contradicción de US-ACC-002 sobre qué revelan los
mensajes de error).
