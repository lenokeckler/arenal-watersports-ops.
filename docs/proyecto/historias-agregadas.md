# Historias agregadas después del backlog original

Historias que **no** vienen de `Historias_de_Usuario_Completo.docx` ni del
Product Backlog, sino de decisiones tomadas durante el diseño.

Se listan aparte a propósito: `historias-de-usuario.md` y `product-backlog.md` se
generan desde los documentos originales y tienen que seguir siendo fieles a
ellos. Cuando estas historias se pasen al backlog del curso, se anota aquí.

| ID         | Módulo               | Historia                              | Origen                                 | Estado               |
| ---------- | -------------------- | ------------------------------------- | -------------------------------------- | -------------------- |
| US-TAB-010 | Tablero y Navegación | Consulta de precios desde operaciones | Diseño del modelo de datos, 2026-08-28 | Por pasar al backlog |

---

## US-TAB-010 — Consulta de precios desde operaciones

**Historia de usuario**

Como una persona de operaciones que está en el muelle,
necesito consultar los precios de rentas, tours y combos,
con la finalidad de contestarle a quien baja al lago y pregunta cuánto vale una
salida, sin tener que subir a la oficina.

**Descripción**

Buena parte de los clientes llega caminando por el lago y pregunta el precio en
el momento. Hoy la persona de operaciones no tiene esa información y tiene que
subir a preguntar o llamar por radio. Es una pantalla de solo lectura sobre el
catálogo de tarifas, extras y combos que administración ya mantiene: la misma
información que está pegada en la oficina, en el teléfono.

No se muestra ningún movimiento de dinero. Operaciones sigue sin ver cobros,
devoluciones ni depósitos, porque no recibe dinero de nadie.

**Criterios de aceptación**

- La pantalla lista las tarifas por categoría y por tipo de salida.
- Lista también los precios de los extras y los precios de paquete de los combos.
- Los montos se muestran separados por moneda y nunca se suman.
- Es de solo lectura: desde ahí no se modifica ninguna tarifa.
- No muestra cobros, devoluciones ni depósitos de ninguna reserva.
- Solo aparecen las tarifas, los extras y los combos activos.

**Nota técnica**

El modelo de datos ya la soporta sin cambios. Las políticas de seguridad dan
lectura de `tariffs`, `extras` y `combos` a cualquier trabajador activo, y niegan
`reservation_charges`, `refunds` y `deposits` a operaciones. Ver
`docs/superpowers/specs/2026-08-28-modelo-de-datos-design.md`, sección 8.
