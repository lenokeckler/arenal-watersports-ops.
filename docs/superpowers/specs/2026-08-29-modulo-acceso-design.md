# Módulo Acceso y Sesión — Diseño

**Fecha:** 2026-08-29
**Alcance:** las once historias de EP-ACC-01 y EP-ACC-02.
**Depende de:** `docs/superpowers/specs/2026-08-28-modelo-de-datos-design.md`, ya implementado.

Este documento define cómo se construye el módulo. No repite las historias: están en
`docs/proyecto/historias-de-usuario.md` y sus criterios de aceptación son la definición
de terminado.

---

## 1. Cómo se autentica

El ingreso es por **nombre de usuario**, nunca por correo, y no hay proveedores externos.
Supabase Auth trabaja con correo, así que cada cuenta vive en `auth.users` con un correo
sintético `<username>@arenal.local` que el trabajador nunca ve ni escribe.

**El cliente no necesita consultar nada para traducir el usuario.** Compone el correo
sintético en el navegador y llama a `signInWithPassword`. Eso evita una ruta de servidor
en el camino más caliente de la aplicación y evita exponer una consulta que diga si un
usuario existe.

Lo que sí exige servidor, porque necesita la llave de servicio:

| Operación | Por qué no puede ir en el cliente |
| --- | --- |
| Contar intentos fallidos y bloquear a los diez | El cliente no puede escribir `workers.failed_attempts` de otra persona, y no debe poder saltarse el conteo |
| Enviar el PIN de recuperación | Requiere SMTP y leer el correo personal de una cuenta ajena |
| Verificar el PIN y reponer la contraseña | Cambia la contraseña de una cuenta sin conocer la anterior |
| Evaluar la franja horaria | El reloj del dispositivo es del atacante; si se leyera de ahí bastaría cambiar la hora del teléfono para no salir nunca |

---

## 2. Los mensajes de error, y la contradicción que resuelven

US-ACC-002 pide dos cosas incompatibles: un mensaje propio para *usuario no registrado* y
otro para *contraseña incorrecta*, y a la vez que **ningún mensaje revele cuáles nombres de
usuario existen**. Decir "usuario no registrado" es exactamente revelarlo.

**Resolución:** los dos casos que permitirían enumerar usuarios comparten mensaje; los que
describen el estado de una cuenta conservan el suyo, porque su razón de ser es que la
persona sepa si reintenta o si busca a administración.

| Situación | Mensaje | Clave |
| --- | --- | --- |
| Usuario no existe | «Usuario o contraseña incorrectos» | `INVALID_CREDENTIALS` |
| Contraseña incorrecta | «Usuario o contraseña incorrectos» | `INVALID_CREDENTIALS` |
| Bloqueada por intentos | «Cuenta bloqueada por intentos fallidos. Busque a administración.» | `BLOCKED_ATTEMPTS` |
| Bloqueada por administración | «Cuenta bloqueada por administración.» | `BLOCKED_ADMIN` |
| Sesión cerrada por inactividad | «Su sesión se cerró por inactividad.» | `SESSION_EXPIRED` |

Los dos mensajes de bloqueo sí confirman que la cuenta existe. Es un intercambio aceptado:
el sistema es interno, el equipo son seis personas conocidas, y el valor operativo de que
alguien sepa que tiene que buscar a administración pesa más que ocultar la existencia de un
usuario a un atacante que ya está dentro de la red. Queda anotado por si algún día el
sistema se expone hacia afuera.

`SESSION_EXPIRED` no se produce al intentar entrar: llega como parámetro cuando el sistema
devuelve a la persona al login, y por eso se muestra arriba del formulario y no junto a un
campo.

---

## 3. Reglas de la contraseña

Se muestran **desde antes de escribirla**, no después de fallar, y se van marcando en verde
conforme se cumplen. Salen de las validaciones del documento de flujo:

- Entre 8 y 72 caracteres. El máximo no es arbitrario: bcrypt, que es lo que usa Supabase,
  ignora todo lo que pase de 72 bytes, así que aceptar más daría una falsa sensación de
  fuerza.
- Al menos una mayúscula, una minúscula, un número y un símbolo.

`app/utils/password/passwordUtils.ts` ya trae `checkPasswordValidity`, que devuelve un
objeto con una bandera por regla. Se extiende con el largo máximo y se reutiliza tal cual;
no se escribe una validación nueva.

---

## 4. Rutas y qué protege cada una

```
/acceso/ingreso                  público
/acceso/recuperar-contrasena     público
/acceso/primer-ingreso           sesión válida + must_change_password
/acceso/cambio-contrasena        sesión válida
/acceso/modo-de-trabajo          sesión válida + más de un área
/…todo lo demás                  sesión válida + contraseña ya cambiada + modo escogido
```

El middleware de Next.js es el único lugar donde se decide. Su orden importa:

1. Sin sesión y ruta privada → al ingreso.
2. Con sesión y `must_change_password` → a primer ingreso, **desde cualquier ruta**, sin
   excepción. La historia dice "no se avanza a ninguna pantalla del sistema hasta
   completarlo" y eso incluye escribir la URL a mano.
3. Con sesión, contraseña ya cambiada, más de un área y sin modo escogido → al selector.
4. Con sesión y ruta pública → al tablero.

El middleware también refresca la sesión de Supabase en cada petición, que es lo que
mantiene vivas las cookies.

---

## 5. La franja horaria de la sesión

De 7:00 a 19:00 la sesión no caduca por inactividad. Fuera de esa franja, treinta minutos
sin actividad la cierran, sin aviso previo.

`WORKDAY_HOURS` y `SESSION_CONFIG` ya existen en
`app/components/session/constants/Session.constants.ts` con esos valores.

**La franja la decide el servidor.** El middleware calcula si estamos en jornada y lo
comunica al cliente; el temporizador de inactividad del navegador solo se arma cuando la
respuesta dice que estamos fuera de jornada. El reloj del dispositivo no participa en la
decisión, solo en la cuenta regresiva local una vez que el servidor dijo que aplica.

Al cruzar las 19:00, la persona que lleva más de treinta minutos sin actividad sale en la
siguiente petición. No hace falta un proceso que vigile: el middleware ya corre en cada
navegación.

---

## 6. Intentos fallidos

Una ruta de servidor registra cada fallo y bloquea a los diez. La cuenta de administración
**nunca se bloquea**: al llegar a diez, en vez de cerrarse, ofrece el proceso de
recuperación, porque no existe otra cuenta que pueda desbloquearla.

El contador vuelve a cero en dos momentos: cuando el ingreso es correcto, y cuando se
completa una recuperación por PIN.

La ruta responde siempre lo mismo ante un usuario inexistente y ante una contraseña
incorrecta, para no filtrar por diferencia de respuesta lo que los mensajes ya cuidan.

---

## 7. Recuperación por PIN

1. La persona escribe su nombre de usuario en la pantalla de recuperación.
2. El servidor busca la cuenta. Si tiene correo personal, genera un PIN de seis dígitos, lo
   guarda **hasheado** en `password_reset_pins` con vencimiento a diez minutos, y lo envía.
   Si no tiene correo, responde que debe buscar a administración para una temporal.
3. **La respuesta al navegador es idéntica en los tres casos** — cuenta inexistente, cuenta
   sin correo, PIN enviado — para no revelar qué usuarios existen. La diferencia se ve en el
   correo que llega o no llega.
4. La persona escribe el PIN y la contraseña nueva. El servidor lo verifica contra el hash,
   comprueba que no esté usado ni vencido, cambia la contraseña con la llave de servicio,
   marca el PIN como usado y pone `failed_attempts` en cero.

El PIN es de un solo uso. Se escogió sobre el enlace porque en el celular se escribe mejor
que se abre un correo.

**En desarrollo** el correo sale al Inbucket que Supabase levanta en el puerto 54324, así
que el flujo completo se puede probar sin credenciales de SMTP reales.

---

## 8. Modo de trabajo

`workers.last_work_area` guarda el último modo usado. Al entrar:

- Una sola área → directo a su módulo. Nunca ve el selector.
- Más de un área y hay `last_work_area` → directo a ese modo.
- Más de un área y no hay ninguno guardado → selector, con un cuadro grande por área.

El modo activo vive en Redux y se puede cambiar sin cerrar sesión, desde un control siempre
visible. Dentro de un modo la aplicación se comporta como si la cuenta solo tuviera esa
área: **el modo filtra lo que se muestra, no lo que se puede hacer.** Lo que se puede hacer
lo siguen decidiendo las políticas de la base, que no saben nada del modo. Un trabajador con
dos áreas que cambie de modo no gana ni pierde permisos, solo cambia de pantallas.

---

## 9. Estructura de archivos

Sigue `component-architecture` del proyecto: carpeta por funcionalidad, `.tsx` para lo que
pinta y `use*ViewModel.ts` para lo que decide.

```
app/
  middleware.ts                        decide toda redirección
  acceso/
    ingreso/page.tsx                   + LoginForm/ con su ViewModel
    primer-ingreso/page.tsx
    cambio-contrasena/page.tsx
    recuperar-contrasena/page.tsx      pide PIN y lo verifica
    modo-de-trabajo/page.tsx
  api/acceso/
    intento/route.ts                   registra fallo, bloquea a los diez
    pin-recuperacion/route.ts          genera y envía el PIN
    verificar-pin/route.ts             verifica y repone la contraseña
    jornada/route.ts                   responde si estamos en jornada
  components/
    password-rules/                    lista de reglas que se marcan en verde
    work-area-switcher/                control de cambio de modo
  constants/
    acceso/                            mensajes, claves de error, rutas de la API
  store/slices/
    workAreaSlice.ts                   modo activo
```

Los componentes que la base ya trae —`Button`, `FormField`, `Input`, `Toast`, `Spinner`,
`session/`— se reutilizan. No se crean equivalentes nuevos.

---

## 10. Diseño visual

Las pantallas *Ingreso al Sistema* y *Modo de Trabajo* existen en Stitch. El servidor MCP
está configurado pero no cargado en la sesión actual, así que **el módulo se construye con
los componentes de la base y los criterios de aceptación**, y el diseño de Stitch se aplica
después como reestilizado.

Lo que no se difiere, porque son requisitos y no estética: botones grandes y separados,
pensados para una sola mano y con las manos mojadas; toda la interfaz en español; y arranque
rápido, porque la aplicación se abre y se cierra decenas de veces al día con mala señal.

---

## 11. Decisiones tomadas en este diseño

1. **El cliente compone el correo sintético** en vez de consultar el usuario en el servidor.
   Menos latencia en el camino más frecuente y una consulta menos que pudiera filtrar
   existencia.
2. **Usuario inexistente y contraseña incorrecta comparten mensaje.** Resuelve la
   contradicción de US-ACC-002 del lado de la no divulgación.
3. **Los mensajes de bloqueo sí confirman existencia**, a cambio de que la persona sepa que
   debe buscar a administración. Aceptado por ser un sistema interno; anotado por si algún
   día se expone.
4. **El largo máximo de contraseña es 72** por el límite real de bcrypt, no por gusto.
5. **El modo filtra pantallas, no permisos.** Los permisos siguen viviendo en las políticas
   de la base, que no conocen el concepto de modo.
