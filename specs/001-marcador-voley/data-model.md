# Modelo de datos: Marcador de voley vpmadrid v0

Fuente: entidades clave de [spec.md](spec.md). Cómo se guardan:
[contracts/almacenamiento.md](contracts/almacenamiento.md).

## Equipo

Los dos equipos se identifican siempre como **A** (por defecto "Equipo 1") y **B** (por
defecto "Equipo 2"). Esa identidad no cambia al cambiar de lado.

| Campo | Tipo | Regla |
|---|---|---|
| `nombre` | texto | Se recortan los espacios. Máximo 20 caracteres. Si queda vacío, vuelve a "Equipo 1" o "Equipo 2" (casos límite). |
| `color` | id de la paleta | Uno de: `blanco`, `amarillo`, `negro`, `rojo`, `granate`, `naranja`, `verde`, `azul`, `azulMarino`, `morado` (RF-015). |
| `logo` | sí/no | Solo puede ser "sí" si `color` es `negro` (RF-016). Si el color deja de ser negro, pasa a "no". |

**Nombre y logo** (RF-016b): con `logo` en "sí", `nombre` es siempre "VPMadrid". Al pasar
`logo` de "sí" a "no", si el nombre sigue siendo "VPMadrid" vuelve al de por defecto
("Equipo 1" o "Equipo 2"); si se ha escrito otro, se respeta.

**Color del número** (RF-003 y RF-007): negro si `color` es `blanco` o `amarillo`; blanco
en cualquier otro caso. En el contador de sets (fondo blanco), el número va del color de la
camiseta, salvo blanco o amarillo, que van en negro.

## Partido (en curso)

| Campo | Tipo | Regla |
|---|---|---|
| `formato` | 3 o 5 | "Al mejor de 3" o "al mejor de 5". Por defecto, 5. |
| `equipos` | `{ A: Equipo, B: Equipo }` | Por defecto: A = "Equipo 1", azul, sin logo; B = "Equipo 2", rojo, sin logo. |
| `equipoIzquierda` | `"A"` o `"B"` | Qué equipo ocupa la mitad izquierda (o la de arriba en vertical). Por defecto, `"A"`. |
| `puntos` | lista de `"A"`/`"B"` | Cada punto sumado, en orden. Es la única fuente de verdad del marcador. |
| `rehacer` | lista de `"A"`/`"B"` | Puntos deshechos que se pueden rehacer. Se vacía al sumar un punto nuevo o al reiniciar. |
| `cronometro.acumuladoMs` | número ≥ 0 | Milisegundos acumulados mientras estuvo en marcha. |
| `cronometro.enMarchaDesde` | instante o vacío | Cuándo arrancó por última vez; vacío si está parado. |
| `cronometro.guardadoEn` | instante o vacío | Cuándo se guardó el partido por última vez. Sirve para saber cuánto tiempo contar si la app se cerró con el cronómetro en marcha. |
| `idHistorial` | texto o vacío | Id de la entrada del historial si el partido terminó y se guardó; vacío si no. |

### Valores calculados (no se guardan)

Se obtienen recorriendo `puntos` desde el principio:

- **Set decisivo**: el set número `formato` (el 3.º o el 5.º).
- **Puntos para ganar un set**: 15 en el set decisivo y 25 en los demás, con al menos 2 de
  ventaja.
- **Sets para ganar el partido**: 2 (formato 3) o 3 (formato 5).
- Al recorrer la lista: se suma el punto al equipo; si con él gana el set, se le suma un
  set y los puntos del set vuelven a 0 - 0; si con ese set alcanza los sets para ganar,
  es el **ganador** y el partido está **terminado**.
- Resultado: `puntosSet {A, B}`, `sets {A, B}`, `ganador` (`"A"`, `"B"` o ninguno).

Ejemplos (formato 5):
- `puntos` con 24 "A" y 20 "B", más un "A" → sets A 1 - 0 B, puntos 0 - 0.
- 24 - 24 y luego "A" → 25 - 24, el set sigue. Otro "A" → 26 - 24, set para A.
- Sets 2 - 2: el quinto set termina en 15 - 13, pero no en 15 - 14.

### Estados y transiciones

```text
             sumar punto (sin ganador)
              ┌─────────┐
              ▼         │
          ┌─────────────┴┐  sumar punto que da el partido  ┌────────────┐
 inicio → │   EN CURSO   │ ───────────────────────────────▶ │ TERMINADO  │
          └──────────────┘ ◀─────────────────────────────── └────────────┘
                 ▲            deshacer (reabre el partido)        │
                 │                                                │
                 └──── reiniciar marcador / nuevo partido ◀───────┘
                       (también desde EN CURSO, con confirmación)
```

- **EN CURSO → TERMINADO**: se crea la entrada del historial y se guarda su id en
  `idHistorial`; el cronómetro se pausa (RF-017b). Las mitades dejan de sumar puntos.
- **TERMINADO → EN CURSO (deshacer)**: se quita el último punto, se borra la entrada
  `idHistorial` del historial y `idHistorial` queda vacío. El cronómetro sigue pausado.
  Si después se rehace ese punto, el partido vuelve a terminar y se crea una entrada nueva.
- **Reiniciar marcador**: `puntos`, `rehacer` y `cronometro` vuelven a cero e
  `idHistorial` queda vacío. Se mantienen `formato`, `equipos` y `equipoIzquierda`. Si el
  partido ya había terminado, su entrada sigue en el historial; si no, no se guarda nada
  (RF-012).
- **Nuevo partido**: todo vuelve a los valores por defecto, salvo `formato`, que es el
  elegido en la confirmación.
- **Cambiar de lado**: solo cambia `equipoIzquierda`.

## Partido guardado (entrada del historial)

| Campo | Tipo | Regla |
|---|---|---|
| `id` | texto | Único. Se genera al guardar. |
| `fecha` | fecha y hora (ISO 8601) | Momento en que terminó el partido. |
| `nombreA`, `nombreB` | texto | Nombres de los equipos en ese momento. |
| `setsA`, `setsB` | número | Resultado en sets, por ejemplo 3 y 1. |

- Se muestra como `nombreA setsA - setsB nombreB` junto a la fecha (por ejemplo,
  "24/10/2026 · Las Rozas 3 - 1 Equipo 2").
- Orden: del más reciente al más antiguo.
- Se puede borrar una entrada o todo el historial, siempre tras confirmar (RF-022).
