# Contrato de interfaz: pantalla y textos

Qué ve y qué puede hacer el usuario. Todos los textos están en español de España (RF-023)
y deben aparecer **exactamente** así.

## Pantalla principal

```text
VERTICAL                         HORIZONTAL
┌───────────────────────┐        ┌─────────────────────────────────────────┐
│ ▶  00:00  ↺           │        │ ▶ 00:00 ↺                               │
│ ┌───────────────────┐ │        │        ┌──────────┐                     │
│ │  1   -   0        │ │        │        │ 1  -  0  │                     │
│ └───────────────────┘ │        │        └──────────┘                     │
├───────────────────────┤        ├────────────────────┬────────────────────┤
│ Equipo 1          ✎   │        │ Equipo 1       ✎   │ Equipo 2       ✎   │
│                       │        │                    │                    │
│          12           │        │        12          │         9          │
│                       │        │                    │                    │
├───────────────────────┤        │                    │                    │
│ Equipo 2          ✎   │        │                    │                    │
│                       │        │                    │                    │
│           9           │        │                    │                    │
│          (●)          │        │                (●)                      │
└───────────────────────┘        └────────────────────┴────────────────────┘
```

| Elemento | Dónde | Comportamiento |
|---|---|---|
| Botón play/pausa | Arriba, a la izquierda del cronómetro | Arranca o pausa el cronómetro. Icono ▶ cuando está parado y ❚❚ cuando está en marcha. Etiqueta accesible: "Iniciar cronómetro" / "Pausar cronómetro". |
| Cronómetro | Arriba | Formato `mm:ss`. Pasada una hora sigue en minutos (por ejemplo, `75:12`). |
| Botón reiniciar cronómetro | A la derecha del cronómetro | Pone `00:00` y lo deja parado, sin pedir confirmación. Etiqueta: "Reiniciar cronómetro". |
| Contador de sets | Debajo del cronómetro | Fondo blanco. `setsIzquierda - setsDerecha`, cada número del color de su camiseta (negro si es blanca o amarilla). |
| Mitad de equipo | Una por equipo | Fondo del color de la camiseta. Al pulsarla (fuera del lápiz) suma 1 punto a ese equipo, salvo con el partido terminado. |
| Nombre del equipo | Encima del número | El nombre del equipo. |
| Número de puntos | Centro de la mitad | Muy grande; blanco, o negro con camiseta blanca o amarilla. |
| Lápiz ✎ | Esquina de la mitad | Abre "Editar equipo". Es una zona propia: pulsarlo nunca suma puntos. Etiqueta: "Editar equipo". |
| Logo VPMadrid | En la mitad, si está activado | Solo con camiseta negra. No cambia la zona que suma puntos. |
| Globito (●) | Abajo, en el centro | Al pulsarlo se amplía y muestra cuatro botones. Pulsarlo nunca suma puntos. |

### Globito ampliado

| Botón | Etiqueta | Al pulsarlo |
|---|---|---|
| ＋ | "Partido" | Menú con "Nuevo partido" y "Reiniciar marcador". |
| ↶ | "Deshacer o rehacer" | Menú con "Deshacer" y "Rehacer"; cada opción aparece desactivada si no hay nada que deshacer o rehacer. |
| ⇄ | "Cambiar de lado" | Intercambia los equipos de lado al instante. |
| 🕘 | "Historial" | Abre el historial. |

Al pulsar fuera del globito ampliado (o de un menú abierto), se cierra y ese toque no
suma ningún punto.

> El botón "Historial" no aparece en HU9: es el acceso que exige RF-021 ("el historial
> se abre desde el globito", spec, sección Aclaraciones).

## Diálogos y textos exactos

| Situación | Título | Texto | Botones |
|---|---|---|---|
| Reiniciar marcador | "¿Reiniciar marcador?" | "Los puntos, los sets y el cronómetro volverán a cero. Los nombres y colores se mantienen." | "Cancelar" · "Reiniciar" |
| Nuevo partido | "¿Nuevo partido?" | "Se perderá el partido actual si no ha terminado." + selector "Al mejor de 3" / "Al mejor de 5" (marcado "Al mejor de 5") | "Cancelar" · "Empezar" |
| Fin del partido | "¡{nombre} gana el partido!" | "{setsGanador} - {setsPerdedor} en sets. Guardado en el historial." | "Aceptar" |
| Editar equipo | "Editar equipo" | Campo "Nombre" (máx. 20) · "Color de la camiseta" (paleta) · casilla "Mostrar logo VPMadrid" (solo si el color es negro) | "Cancelar" · "Guardar" |
| Historial | "Historial" | Lista "dd/mm/aaaa · {nombreA} {setsA} - {setsB} {nombreB}", con un botón "Borrar" en cada fila. Si está vacío: "Todavía no hay partidos guardados". | "Borrar todo" (solo si hay partidos) · "Cerrar" |
| Borrar un partido | "¿Borrar este partido?" | "{fila del partido}" | "Cancelar" · "Borrar" |
| Borrar todo | "¿Borrar todo el historial?" | "Se borrarán todos los partidos guardados." | "Cancelar" · "Borrar todo" |

Nombres de los colores en la paleta: Blanco, Amarillo, Negro, Rojo, Granate, Naranja,
Verde, Azul, Azul marino, Morado.
