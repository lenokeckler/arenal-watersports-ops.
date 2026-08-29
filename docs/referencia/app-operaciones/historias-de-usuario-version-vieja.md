# Historias de usuario: Arenal Ops

Escritas a partir del contexto del proyecto. Los detalles entre paréntesis son las condiciones que la historia tiene que cumplir para darse por terminada.

## Roles

- Administrador
- Reservas
- Operación

El guía no es un rol aparte. Es una marca sobre la cuenta de un trabajador de operación, porque la misma persona despacha equipo y sale de guía en un tour.

## Todos los roles

### Login

- Como usuario puedo iniciar sesión en el sistema (Ingreso por nombre de usuario y contraseña, ojito para ver u ocultar la contraseña, feedback de lo que debe llevar la contraseña visible desde antes de escribirla, feedback de errores en mensajes rojos)
- Como usuario puedo registrar mi correo personal en mi cuenta para poder recuperar la contraseña (La empresa no da correo propio, cada trabajador pone el suyo)
- Como usuario puedo recuperar mi contraseña (Solicitud al correo personal registrado, enlace de un solo uso, si no hay correo la administración genera una temporal)
- Como usuario se me bloquea la cuenta al llegar al máximo de 5 intentos fallidos (Contador por cuenta, mensaje que explica el bloqueo, solo la administración desbloquea)
- Como usuario se me genera el token de seguridad al iniciar sesión (El token acompaña cada acción y es lo que se revisa para permitir o rechazar la operación)
- Como usuario se me cierra la sesión por tiempo de inactividad (Ventana de treinta minutos, el tiempo corre desde la última acción del usuario y no desde el inicio de sesión, cada acción reinicia el conteo, aviso antes de cerrar, tope máximo mensual que se ejecuta de madrugada)
- Como usuario puedo cambiar mi contraseña si es la primera vez que ingreso (Verificar si es el primer inicio, confirmar la contraseña temporal, escribir la nueva, repetir la nueva, no se avanza a ninguna pantalla hasta completarlo)
- Como usuario puedo cambiar mi contraseña cuando yo quiera (Confirmar la actual, escribir la nueva, repetirla, la nueva cumple los requisitos de seguridad)
- Como usuario puedo cerrar sesión desde cualquier pantalla

### Generales

- Como usuario puedo ver el tablero con las categorías de equipo y cuántas unidades libres hay sobre el total
- Como usuario puedo entrar a una categoría y ver el estado de cada unidad (Disponible, ocupada o en mantenimiento, con la hora de regreso cuando está ocupada)
- Como usuario veo el tablero actualizarse solo cuando otro compañero despacha o cierra una reserva (Sin refrescar la página)
- Como usuario veo solo las opciones que me corresponden por mi rol (Lo que no me toca no se muestra, y aunque se intente por otro camino el sistema lo rechaza)
- Como usuario puedo usar la aplicación desde el celular con una sola mano (Botones grandes y separados, toda la interfaz en español)
- Como usuario puedo abrir la aplicación con señal mala y que cargue rápido

## Administrador

### Gestión de usuarios

- Como administrador puedo agregar usuarios y asignarles su rol (Contraseña temporal de un solo uso, ingreso por nombre de usuario, rol de administrador, reservas u operación)
- Como administrador puedo exigir que la contraseña cumpla los requisitos (Mayúsculas, minúsculas, números, símbolos, largo mínimo y largo máximo)
- Como administrador puedo desbloquear la cuenta de un usuario que llegó a los 5 intentos fallidos
- Como administrador puedo generar una nueva contraseña temporal para un usuario que perdió la suya
- Como administrador puedo bloquear la cuenta de un trabajador que sale de la empresa (La cuenta se bloquea, no se borra, para no perder el historial de lo que hizo)
- Como administrador puedo reactivar la cuenta de un trabajador que vuelve
- Como administrador puedo marcar a un trabajador como guía (La marca se pone sobre su cuenta, no crea un rol nuevo)
- Como administrador no puedo bloquear ni degradar a la última cuenta de administración activa (El sistema lo impide para no quedarse sin dueño)
- Como administrador puedo ver quién hizo cada cambio sensible (Movimientos de dinero y ajustes de inventario quedan a nombre de quien los hizo)

### Gestión de categorías y equipo

- Como administrador puedo crear, consultar, modificar y eliminar categorías de equipo (Jet ski, kayak, paddleboard, lancha, cuadraciclo)
- Como administrador puedo definir el comportamiento de cada categoría (Si lleva motor, si consume gasolina, si se puede dañar, si solo sale con guía, cuánto dura por defecto una salida)
- Como administrador puedo crear, consultar, modificar y eliminar unidades dentro de una categoría (Cada unidad se identifica una por una porque no da lo mismo cuál sale)
- Como administrador puedo dar de baja una unidad sin borrar su historial
- Como administrador puedo crear, consultar, modificar y eliminar los extras de las lanchas (Parrilla, tubing, wake, tablas)
- Como administrador puedo definir a cuál embarcación aplica cada extra (No todas admiten lo mismo)
- Como administrador puedo definir cuáles extras ocupan equipo real del inventario (Cuando lo ocupan, descuentan disponibilidad)

### Combos y tarifas

- Como administrador puedo crear, consultar, modificar y eliminar combos predefinidos (Por ejemplo lancha con jet ski y paddleboard)
- Como administrador puedo asignarle a cada combo su precio de paquete (El combo se vende como paquete y no como la suma de las partes)
- Como administrador puedo definir la tarifa de cada equipo y de cada tipo de salida (Por ejemplo ciento veinte dólares o sesenta mil colones la hora de jet ski)
- Como administrador puedo modificar una tarifa cuando cambia el precio
- Como administrador puedo reemplazar la foto de un jet ski para dejar constancia de su estado actual (Una sola foto por máquina, se reemplaza cuando el estado cambia, operación la ve pero no la cambia)

### Inventario

- Como administrador puedo crear, consultar, modificar y eliminar categorías de inventario (La lista no queda cerrada de antemano)
- Como administrador puedo crear, consultar, modificar y eliminar artículos de inventario (Kayaks, tablas, remos, chalecos, botiquines y lo que el equipo decida agregar)
- Como administrador puedo definir la cantidad mínima de un artículo para que salte el aviso de faltante

### Estadísticas

- Como administrador puedo ver los ingresos del día con sus descuentos y devoluciones
- Como administrador puedo ver el movimiento por día y por mes en gráficos
- Como administrador puedo ver cuántas horas salió cada equipo y cuáles casi no se usan
- Como administrador puedo ver qué reservas atendió cada trabajador
- Como administrador puedo ver cuánto se ha gastado en mantener cada máquina (A partir del historial de mantenimiento)
- Como administrador puedo confiar en que el historial de reservas se conserva doce meses y después se borra solo (Ampliable a dos años si hace falta)

## Reservas

### Agenda y calendario

- Como persona de reservas puedo crear una reserva (Nombre a que va la reserva, cantidad de personas, fecha, hora, duración y equipo que va a ocupar)
- Como persona de reservas puedo registrar en el momento al cliente que llega a la oficina sin haber agendado (Toda reserva entra por el mismo lugar)
- Como persona de reservas puedo elegir el tipo de reserva (Renta, tour o combo)
- Como persona de reservas puedo armar un combo a la medida escogiendo libremente qué equipos entran
- Como persona de reservas puedo elegir un combo predefinido de una lista
- Como persona de reservas puedo asociar a la reserva los equipos concretos que va a ocupar (Cada equipo baja de la disponibilidad)
- Como persona de reservas puedo agregarle extras a una reserva de lancha (Solo se ofrecen los extras que aplican a esa embarcación)
- Como persona de reservas puedo asignarle uno o más guías a un tour (Un tour grande puede ir con dos guías)
- Como persona de reservas puedo registrar un guía externo sin cuenta en el sistema (Se guardan su nombre y su cédula, nada más)
- Como persona de reservas puedo ver el calendario en vista diaria, semanal, mensual y anual (Escojo la vista según lo que esté haciendo)
- Como persona de reservas puedo ver en el calendario qué hay agendado, a qué hora, con qué equipo y a nombre de quién
- Como persona de reservas puedo agendar una salida fuera del horario de nueve a cinco (Hay días con horas extra)
- Como persona de reservas recibo una advertencia cuando agendo equipo que ya está tomado en esa franja (El sistema avisa pero deja seguir, no bloquea)

### Cambios sobre una reserva

- Como persona de reservas puedo modificar una reserva agendada
- Como persona de reservas puedo partir una reserva en dos salidas (Cuando el grupo llega incompleto y sale en tandas)
- Como persona de reservas puedo posponer una reserva para otra fecha, incluso si ya fue despachada (Por ejemplo cuando empieza a llover con la gente en el agua)
- Como persona de reservas puedo cancelar una reserva registrando el motivo (La reserva queda como cancelada y deja de aparecerle a operación)
- Como persona de reservas puedo cancelar una salida que ya está en curso (Operación lo reporta por radio en el canal 4 y yo lo registro desde la oficina)

### Cobros e ingresos

- Como persona de reservas puedo cobrar una reserva aplicando la tarifa correspondiente
- Como persona de reservas puedo modificar la tarifa al momento de cobrar (Manejo un margen de descuento y no siempre se cobra lo de lista)
- Como persona de reservas puedo registrar el cobro en la moneda en que entró (Dólares o colones, el sistema no convierte ni maneja tipo de cambio)
- Como persona de reservas puedo anotar el método de pago (Efectivo, tarjeta, PayPal, SINPE u otro, como texto, el sistema no procesa pagos ni valida tarjetas)
- Como persona de reservas puedo registrar una devolución parcial cuando se cancela una salida (Yo pongo el porcentaje devuelto desde la app, quién lo autoriza en la práctica es asunto interno de la empresa, la cuenta del día refleja lo que de verdad entró)
- Como persona de reservas puedo ver los ingresos del día y sus gráficos (Separados por moneda y sin sumarse en un solo total, operación no ve esta información)
- Como persona de reservas puedo ver qué depósitos siguen pendientes de resolver

## Operación

### Despacho y cierre

- Como persona de operación puedo ver las reservas del día que faltan por despachar
- Como persona de operación puedo despachar una reserva seleccionándola de la lista (No vuelvo a escribir los datos, el equipo queda ocupado y arranca el conteo hasta la hora de regreso)
- Como persona de operación puedo ver cuánto falta para que vuelva cada equipo que está afuera
- Como persona de operación veo como pendiente la reserva que pasó su hora de regreso y no ha vuelto (No se cierra sola ni desaparece, el cobro del tiempo de más se decide aparte)
- Como persona de operación puedo extender o recortar la duración de una reserva en curso
- Como persona de operación puedo cerrar una reserva registrando cómo volvió el equipo
- Como persona de operación puedo marcar que el depósito quedó pendiente de devolver al cerrar
- Como persona de operación puedo ver el calendario del día y de la semana (No necesito las vistas de mes ni de año)
- Como persona de operación puedo ver quién lleva cada tour

### Máquinas

- Como persona de operación puedo registrar la gasolina con la que sale y con la que vuelve una unidad
- Como persona de operación puedo registrar las horas de motor acumuladas de una unidad
- Como persona de operación recibo el aviso de cambio de aceite cuando una unidad llega a sus horas
- Como persona de operación puedo levantar un reporte de daño de un jet ski (Vuelco, choque, falla de máquina u otra causa, con descripción de lo ocurrido y cuánto subió el conteo de golpes)
- Como persona de operación puedo consultar los reportes de daño anteriores de una unidad
- Como persona de operación puedo ver la foto actualizada de un jet ski junto a su número de golpes (Solo la administración puede reemplazarla)
- Como persona de operación puedo marcar una unidad como en mantenimiento (Sale de la disponibilidad sin borrarse)
- Como persona de operación puedo registrar un trabajo de mantenimiento sobre una máquina (Cambio de llanta, cambio de pieza, cambio de aceite, con su fecha)
- Como persona de operación puedo consultar el historial de mantenimiento de una máquina
- Como persona de operación puedo corregir la gasolina, las horas, los golpes o el estado de una unidad sin abrir una reserva

### Inventario

- Como persona de operación puedo ver el inventario con la cantidad de cada artículo
- Como persona de operación puedo registrar la cantidad y el estado de cada artículo (Buenos, defectuosos y en espera de reparación)
- Como persona de operación puedo levantar un conteo de inventario cuando lo decidamos (En teoría es mensual, pero lo hacemos cuando se pueda)
- Como persona de operación puedo consultar los conteos de inventario del último año (Con su fecha y el nombre de quien lo levantó)
- Como persona de operación puedo modificar el inventario y el cambio queda registrado a mi nombre
- Como persona de operación recibo un aviso cuando un artículo baja de su cantidad mínima
- Como persona de operación recibo un aviso cuando hay que reponer el contenido de un botiquín (Salta por cantidad cuando baja del mínimo y por fecha cuando se acerca el vencimiento)

## Pendiente de confirmar

Estas dos no bloquean ninguna historia, pero conviene cerrarlas. Están anotadas igual en el contexto del proyecto.

- Qué plan de Supabase cubre el proyecto y si ese plan incluye respaldo automático de la base de datos, además de quién prueba una restauración para saber que el respaldo sirve.
- Si los treinta minutos de inactividad resultan cómodos en la operación real o hay que subirlos a una hora.
