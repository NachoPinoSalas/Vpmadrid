# Contrato del módulo de reglas (`js/marcador.js`)

Módulo de JavaScript puro: no toca la pantalla ni el almacenamiento, así que se puede
probar con `node --test`. Las funciones no modifican el partido recibido: devuelven uno
nuevo.

| Función | Entrada | Devuelve |
|---|---|---|
| `partidoNuevo(formato = 5)` | 3 o 5 | Partido con los valores por defecto. |
| `calcular(partido)` | Partido | `{ puntosSet: {A, B}, sets: {A, B}, setActual, ganador }`; `ganador` es `"A"`, `"B"` o `null`. |
| `sumarPunto(partido, equipo)` | Partido, `"A"`/`"B"` | Partido con el punto añadido y `rehacer` vacío. Si ya hay ganador, lo devuelve sin cambios. |
| `deshacer(partido)` | Partido | Partido sin el último punto (que pasa a `rehacer`). Sin puntos, lo devuelve sin cambios. |
| `rehacer(partido)` | Partido | Partido con el último punto de `rehacer` aplicado de nuevo. Con `rehacer` vacío, lo devuelve sin cambios. |
| `reiniciarMarcador(partido)` | Partido | Partido con `puntos`, `rehacer`, `cronometro` e `idHistorial` a cero o vacíos; mantiene formato, equipos y lados. |
| `cambiarLado(partido)` | Partido | Partido con `equipoIzquierda` cambiado. |
| `editarEquipo(partido, equipo, {nombre, color, logo})` | ... | Partido con el equipo validado según [data-model.md](../data-model.md#equipo). |
| `colorNumeroOscuro(color)` | id de color | `true` para `blanco` y `amarillo`. |

Las reglas de set y partido son las de [data-model.md](../data-model.md#valores-calculados-no-se-guardan).

El cronómetro y el historial (guardar o borrar la entrada al terminar o reabrir) los
gestiona `js/app.js` comparando `calcular()` antes y después de cada acción.
