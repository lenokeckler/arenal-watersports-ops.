# Tema claro — Arenal Ops

Estado: propuesto. Fuente: `app/globals.css` (líneas 26–74), auditado contra el uso real en
componentes. Es la paleta clara completa con su verificación de contraste; no implementa nada.

## 0. Por qué esto no es "invertir el hex"

Material 3 no invierte valores entre temas: sigue una tabla de tonos por rol. Para cada token se
comprobó cuál de estas tres cosas aplicaba:

1. **Cambia de banda tonal pero conserva el matiz** (fondo, superficies, texto, acentos).
2. **Es invariante entre temas** por definición (los roles `-fixed`). Se dejan igual.
3. **Es una referencia cruzada** (los roles `inverse-*`). Se resuelven tomando el valor que el tema
   oscuro ya tiene para el rol equivalente.

Contraste calculado con la fórmula WCAG, no estimado a ojo. Mínimos: **4.5:1** texto normal, **3:1**
texto grande e iconos. Donde el uso real es botón, insignia o cuerpo de texto se apuntó a **6:1–7:1**
por la exposición a sol directo.

## 1. Los 47 tokens

```
--color-background: #f5f7fb
--color-error: #ba1a1a
--color-error-container: #ffdad6
--color-inverse-on-surface: #dae2fd
--color-inverse-primary: #57f1db
--color-inverse-surface: #0b1326
--color-on-background: #0b1326
--color-on-error: #ffffff
--color-on-error-container: #410002
--color-on-primary: #ffffff
--color-on-primary-container: #00201c
--color-on-primary-fixed: #ffffff
--color-on-primary-fixed-variant: #005047
--color-on-secondary: #ffffff
--color-on-secondary-container: #2a1800
--color-on-secondary-fixed: #410006
--color-on-secondary-fixed-variant: #881d24
--color-on-surface: #0b1326
--color-on-surface-variant: #3c4a46
--color-on-tertiary: #ffffff
--color-on-tertiary-container: #001e30
--color-on-tertiary-fixed: #001e2c
--color-on-tertiary-fixed-variant: #004c69
--color-outline: #66857c
--color-outline-variant: #d3e6e0
--color-primary: #006b5f
--color-primary-container: #a6f2e4
--color-primary-fixed: #62fae3
--color-primary-fixed-dim: #3cddc7
--color-secondary: #7a5200
--color-secondary-container: #ffddb3
--color-secondary-fixed: #ffdad8
--color-secondary-fixed-dim: #ffb3b0
--color-surface: #f5f7fb
--color-surface-bright: #f5f7fb
--color-surface-container: #e8ecf4
--color-surface-container-high: #e0e5ef
--color-surface-container-highest: #d8deea
--color-surface-container-low: #eff2f8
--color-surface-container-lowest: #ffffff
--color-surface-dim: #d6dbe7
--color-surface-tint: #3cddc7
--color-surface-variant: #d8deea
--color-tertiary: #085d91
--color-tertiary-container: #c7e7ff
--color-tertiary-fixed: #c4e7ff
--color-tertiary-fixed-dim: #7bd0ff
```

## 2. Contraste verificado

### 2.1 Texto y superficies

| Par | Ratio | Mínimo |
| --- | --- | --- |
| `on-surface` sobre `surface` | **17.24:1** | 4.5:1 |
| `on-surface-variant` sobre `surface` | **8.66:1** | 4.5:1 |
| `on-surface-variant` sobre `surface-variant` | **6.88:1** | 4.5:1 |
| `outline` sobre `surface` | **3.76:1** | 3:1 |
| `outline` sobre `surface-container-lowest` | **4.03:1** | 3:1 |

### 2.2 Botones y acentos

| Par | Ratio |
| --- | --- |
| `on-primary` sobre `primary` | **6.42:1** |
| `on-primary-container` sobre `primary-container` | **13.44:1** |
| `on-secondary` sobre `secondary` | **6.93:1** |
| `on-secondary-container` sobre `secondary-container` | **13.21:1** |
| `on-tertiary` sobre `tertiary` | **7.04:1** |
| `on-tertiary-container` sobre `tertiary-container` | **13.28:1** |
| `on-error` sobre `error` | **6.45:1** |
| `on-error-container` sobre `error-container` | **13.26:1** |

Los cuatro acentos quedan entre 6.4 y 7.0:1 a propósito: ninguno grita más que otro solo por
contraste. La jerarquía de urgencia la da el matiz.

### 2.3 Texto de estado sobre `surface`

| Texto | Ratio |
| --- | --- |
| `text-primary` (disponible) | **5.99:1** |
| `text-secondary` (mantenimiento, vencida) | **6.46:1** |
| `text-tertiary` (ocupada) | **6.56:1** |
| `text-error` (dañada) | **6.01:1** |

### 2.4 Texto sobre tinte al 10 por ciento

| Par | Ratio estimado |
| --- | --- |
| `text-primary` sobre `bg-primary/10` | **≈5.5:1** |
| `text-secondary` sobre `bg-secondary/10` | **≈5.9:1** |
| `text-tertiary` sobre `bg-tertiary/10` | **≈6.0:1** |
| `text-error` sobre `bg-error/10` | **≈5.5:1** |

No bajar del 10 por ciento de opacidad para texto de estado sobre tinte: al 5 varios caerían del
mínimo.

### 2.5 Dónde el margen es corto

- **`outline` a 3.76:1** es el ratio más ajustado del sistema. Oscurecerlo más lo haría competir con
  `on-surface-variant` y borraría la distinción entre borde y texto atenuado. Si se ve débil al sol,
  el siguiente valor a probar es `#5a7369`, que sube a 4.3:1.
- **Las insignias con tinte al 10 por ciento** ceden margen frente al resto. Es el costo de que lean
  como aviso suave y no como botón. Para más peso ya existe `EQUIPMENT_UNIT_STATUS_CARD_TINT`.
- **Las insignias sobre foto** no las gobierna ningún token: su fondo real es la fotografía. El riesgo
  ya existe en el tema oscuro. Si aparecen ilegibles, la solución es un degradado detrás, no un color.

## 3. Jerarquía de estados

| Rol | Matiz | Significado | Estados |
| --- | --- | --- | --- |
| `primary` | Teal | Positivo, disponible | `available` |
| `tertiary` | Azul | Informativo, en uso | `occupied` |
| `secondary` | Ámbar | Atención pronto | `in_maintenance`, vencida |
| `error` | Rojo | Crítico | `damaged` |
| neutro | Gris | Fuera de servicio | `decommissioned`, `in_repair` |

En el tema oscuro, `secondary` (#ffb3b0) y `error` (#ffb4ab) están a 6 grados de matiz: son
indistinguibles a simple vista. Es una debilidad preexistente. En claro, `secondary` se llevó a un
ámbar franco para que "necesita mantenimiento" y "está dañada" se separen de un vistazo, siguiendo el
criterio de la señalética industrial. El icono y la etiqueta siguen siendo la fuente de verdad: el
color nunca es el único portador del significado.

## 4. Qué no debe invertirse

### 4.1 `surface-bright` y `surface-dim` no intercambian roles

En oscuro, `surface-bright` es la excepción que sube. En claro el blanco ya es el tope, así que
`surface-bright` iguala a `surface` y la excepción pasa a ser `surface-dim`, la única que baja de
verdad. Invertir el valor literal habría dado una superficie más oscura llamada "bright".

### 4.2 Los contenedores de color se unifican

En oscuro conviven dos patrones: `primary-container` es relleno brillante con texto oscuro, mientras
`secondary-container` y `error-container` son rellenos oscuros con texto claro. En claro se unifica a
un solo patrón para los cuatro: tinte pálido del matiz con texto oscuro y saturado encima.

### 4.3 Los roles `-fixed` no cambian, con una excepción

`on-primary-fixed` no se usa aquí según su semántica de Material 3: es un alias de facto de
`on-primary` en unos 30 botones. Dejarlo invariante daría texto casi negro sobre un `primary` que en
claro también es oscuro, o sea ilegible. Se define igual a `on-primary`. Deuda técnica: consolidar
esos 30 usos a `text-on-primary`.

### 4.4 Los roles `inverse-*` se toman prestados del otro tema

Representan cómo se ve algo en el tema contrario. El tema claro toma literalmente `surface`,
`on-surface` y `primary` del oscuro. Validación cruzada: el `inverse-primary` que ya existía en el
archivo oscuro (#006b5f) coincide con el `primary` derivado aquí de forma independiente.

### 4.5 `surface-tint` no sigue la regla de contenedores

No es una superficie visible: es el matiz de referencia para simular elevación a baja opacidad. Se
deja fijo en ambos temas, atando la sensación de elevación a la identidad de marca.

## 5. Bordes: el hallazgo más urgente

`border-white/10` y `border-white/5` aparecen en **88 archivos, 116 usos**. Es el patrón de borde por
defecto de toda tarjeta, panel y modal de la aplicación. Es blanco puro a opacidad reducida, no una
variable: no se recalcula solo. Sobre fondo claro, `border-white/10` queda casi invisible y
`border-white/5` desaparece. **Esto rompe visualmente cada tarjeta y panel en cuanto se active el tema
claro.**

| Clase actual | Reemplazo |
| --- | --- |
| `border-white/10` | `border-outline-variant` |
| `border-white/5` | `border-outline-variant/50` |

No requiere ningún hex nuevo. Es un cambio mecánico de clase.

Aparte, hay usos sueltos de `text-white` y `bg-white` fuera del patrón de bordes en 18 archivos
(`Toast`, `ActionSheet`, `Logo`, botones, spinner). Mismo riesgo: blanco puro no se adapta al cambiar
de tema. Merece una pasada equivalente al implementar.

## 6. Fuera de alcance

El mecanismo para alternar el tema es decisión de arquitectura, no de paleta. Este documento asume que
resuelve a las mismas 47 variables bajo el mismo bloque `@theme`. Tipografía, espaciado, radios y
animaciones no cambian entre temas.

## 7. Notas para quien implemente

1. Los 47 valores van en un segundo juego de tokens con exactamente los mismos nombres. Ningún
   componente necesita cambiar de clase, salvo lo de la sección 5.
2. Los tintes `bg-{rol}/10`, `border-{rol}/30` y demás se recalculan solos al cambiar la variable.
3. Los únicos cambios de código que el tema exige son el reemplazo de bordes y la definición de
   `on-primary-fixed`.
4. **Verificar en un dispositivo real, al sol, antes de dar por cerrado.** WCAG no modela reflejo de
   pantalla ni brillo de panel: por eso este documento apunta por encima del mínimo.
