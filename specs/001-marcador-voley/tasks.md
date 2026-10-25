---
description: "Lista de tareas para implementar el marcador de voley vpmadrid v0"
---

# Tareas: Marcador de voley vpmadrid v0

**Entrada**: documentos de diseño en `specs/001-marcador-voley/`

**Requisitos previos**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md),
[data-model.md](data-model.md), [contracts/](contracts/), [quickstart.md](quickstart.md)

**Pruebas**: el plan (research D10) pide pruebas automáticas **solo para las reglas** de
`js/marcador.js`, con `node --test`. Se escriben antes que el código que prueban y deben
fallar primero. El resto se valida a mano con [quickstart.md](quickstart.md).

**Organización**: una fase por historia de usuario de la spec, en orden de prioridad.

## Formato: `[ID] [P?] [Historia] Descripción`

- **[P]**: se puede hacer en paralelo (archivo distinto y sin depender de tareas pendientes).
- **[US1]…[US6]**: historia de la spec a la que pertenece la tarea.

## Convenciones del proyecto

- Proyecto estático en la raíz del repositorio (plan.md, "Código fuente"): `index.html`,
  `css/`, `js/`, `assets/` y `tests/`. Sin frameworks, sin compilación y sin dependencias.
- Identificadores del código y comentarios en español (constitución II).
- Todos los textos visibles se copian **literalmente** de [contracts/ui.md](contracts/ui.md).
- Las funciones de `js/marcador.js` no modifican el partido recibido: devuelven uno nuevo
  ([contracts/marcador.md](contracts/marcador.md)).
- Varias historias tocan los mismos archivos (`index.html`, `css/estilos.css`,
  `js/app.js`), así que se hacen en orden y no en paralelo.

---

## Fase 1: Preparación

**Propósito**: crear el esqueleto del proyecto.

- [X] T001 Crear las carpetas `css/`, `js/` y `tests/` y el archivo `package.json` con solo `{"name": "vpmadrid", "private": true, "type": "module", "scripts": {"test": "node --test"}}`, sin dependencias. `"type": "module"` permite que Node cargue `js/marcador.js` como módulo
- [X] T002 [P] Crear `index.html` con `<html lang="es-ES">`, `<meta charset="utf-8">`, `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`, `<meta name="theme-color" content="#000000">`, `<title>vpmadrid</title>`, enlace a `css/estilos.css` y `<script type="module" src="js/app.js"></script>`. El `<body>` queda vacío por ahora
- [X] T003 [P] Crear `css/estilos.css` con la base: `box-sizing: border-box`, `html, body` a toda la pantalla (`height: 100dvh`, `margin: 0`, `overflow: hidden`), fuente del sistema, `user-select: none`, `-webkit-tap-highlight-color: transparent` y `touch-action: manipulation`, para que los toques rápidos no hagan zoom y no se pierdan (CE-002)
- [X] T004 [P] Generar `assets/icono-192.png` y `assets/icono-512.png`: cuadrados negros (`#000000`) con `assets/logo-vpmadrid-transparente.png` centrado, ocupando el 80 % del ancho

---

## Fase 2: Base (bloquea todas las historias)

**Propósito**: el modelo de datos, el cálculo del marcador y el almacenamiento. Todas las
historias dependen de ello.

**⚠️ CRÍTICO**: ninguna historia puede empezar hasta terminar esta fase.

- [X] T005 Crear `js/marcador.js` y exportar `PALETA`, una lista de `{ id, nombre, fondo, textoOscuro }` en este orden: `blanco` "Blanco" `#FFFFFF` (oscuro), `amarillo` "Amarillo" `#FFD100` (oscuro), `negro` "Negro" `#000000`, `rojo` "Rojo" `#D32F2F`, `granate` "Granate" `#7B1E2B`, `naranja` "Naranja" `#E65100`, `verde` "Verde" `#2E7D32`, `azul` "Azul" `#1565C0`, `azulMarino` "Azul marino" `#0D1B4C`, `morado` "Morado" `#6A1B9A`. Exportar también `colorNumeroOscuro(color)`, que devuelve `true` solo para `blanco` y `amarillo` (RF-003, RF-015)
- [X] T006 Añadir a `js/marcador.js` `partidoNuevo(formato = 5)`, que devuelve el partido por defecto de [data-model.md](data-model.md#partido-en-curso): `formato`, `equipos.A = { nombre: "Equipo 1", color: "azul", logo: false }`, `equipos.B = { nombre: "Equipo 2", color: "rojo", logo: false }`, `equipoIzquierda: "A"`, `puntos: []`, `rehacer: []`, `cronometro: { acumuladoMs: 0, enMarchaDesde: null }` e `idHistorial: null`
- [X] T007 [P] Crear `tests/marcador.test.js` con `node:test` y `node:assert/strict`, con pruebas de `calcular()` que deben FALLAR antes de T008. Un ayudante `conPuntos(lista, formato)` crea el partido. Casos: 24 "A" + 23 "B" + "A" → sets A 1 - 0, puntos 0 - 0; 24 - 24 + "A" → 25 - 24 sin set; + otro "A" → set para A; con formato 5 y sets 2 - 2, el quinto set se cierra en 15 - 13 y no en 15 - 14; con formato 3 y sets 1 - 1, el tercero se cierra a 15; formato 5 → `ganador` al tercer set; formato 3 → al segundo; `setActual` correcto en cada caso
- [X] T008 Implementar `calcular(partido)` en `js/marcador.js`, que recorre `partido.puntos` y devuelve `{ puntosSet: {A, B}, sets: {A, B}, setActual, ganador }` con las reglas literales de [data-model.md](data-model.md#valores-calculados-no-se-guardan): "15 en el set decisivo y 25 en los demás, con al menos 2 de ventaja"; el set decisivo es "el set número `formato`"; sets para ganar: "2 (formato 3) o 3 (formato 5)". Los puntos posteriores a un ganador se ignoran. `node --test` debe pasar
- [X] T009 Crear `js/almacen.js` (depende de T006) según [contracts/almacenamiento.md](contracts/almacenamiento.md), con las claves `vpmadrid.partido` y `vpmadrid.historial` y `version: 1`. Exporta `cargarPartido()`, `guardarPartido(partido)`, `cargarHistorial()` (devuelve la lista `partidos`), `guardarHistorial(partidos)`, `anadirAlHistorial(entrada)` y `borrarDelHistorial(id)`. Cada acceso a `localStorage` va en `try/catch`. Si una clave falta, no se puede leer o tiene otra `version`, devuelve `partidoNuevo()` o `[]` sin lanzar errores. `guardarPartido()` pone `cronometro.guardadoEn = Date.now()` antes de guardar. Exportar también la función pura `cronometroTrasCierre(crono)`: si `crono.enMarchaDesde` tiene valor, devuelve `{ acumuladoMs: acumuladoMs + (guardadoEn - enMarchaDesde), enMarchaDesde: null, guardadoEn }`; si no, lo devuelve igual. `cargarPartido()` la aplica siempre, así que el cronómetro vuelve pausado con el tiempo que llevaba al guardarse (RF-019, [contracts/almacenamiento.md](contracts/almacenamiento.md)). El acceso a `localStorage` va solo dentro de las funciones, para que Node pueda importar el módulo en las pruebas

**Punto de control**: reglas probadas y almacenamiento listo.

---

## Fase 3: Historia 1 - Contar los puntos y sets de un partido (Prioridad: P1) 🎯 MVP

**Objetivo**: pantalla dividida en dos. Se pulsa para sumar puntos, los sets se cierran
solos y al terminar el partido aparece el ganador, que se guarda en el historial.

**Prueba independiente**: jugar un partido simulado pulsando cada mitad hasta que un
equipo gane; comprobar puntos, sets, el anuncio del ganador y que el estado se recupera al
recargar (quickstart, comprobaciones 1, 2, 4, 6 y 13).

### Pruebas de la Historia 1

- [X] T010 [US1] Añadir a `tests/marcador.test.js` pruebas de `sumarPunto(partido, equipo)`: añade el equipo al final de `puntos`; vacía `rehacer`; no modifica el partido original; con `ganador` ya decidido devuelve el partido sin cambios. Deben FALLAR antes de T011

### Implementación de la Historia 1

- [X] T011 [US1] Implementar `sumarPunto(partido, equipo)` en `js/marcador.js` según [contracts/marcador.md](contracts/marcador.md)
- [X] T012 [US1] Añadir al `<body>` de `index.html`: `<header id="barra-superior">`, vacío por ahora (lo llena US4); `<div id="contador-sets">` con `<span id="sets-izquierda">`, el texto " - " y `<span id="sets-derecha">`; y `<main id="campo">` con dos `<section class="mitad" id="mitad-izquierda">` y `id="mitad-derecha"`, cada una con `<div class="nombre-equipo">` y `<div class="numero-puntos">`. Añadir también `<dialog id="dialogo-fin">` con `<h2>`, `<p>` y el botón "Aceptar"
- [X] T013 [US1] Añadir a `css/estilos.css`: `#campo` en `display: flex; flex-direction: column` (en vertical, una mitad encima de otra); cada `.mitad` con `flex: 1`, el fondo en la variable `--fondo` y el color del texto en `--texto`; `.numero-puntos` grande, de unos `35vmin`, en negrita, con `font-variant-numeric: tabular-nums`; `.nombre-equipo` encima del número, de unos `6vmin`; `#contador-sets` con fondo `#FFFFFF`, centrado bajo `#barra-superior` y con números de unos `7vmin`
- [X] T014 [US1] Crear `js/app.js`. Importa `js/marcador.js` y `js/almacen.js`, carga el estado con `cargarPartido()` y define `render()`. Para cada mitad (equipo = `equipoIzquierda` o el otro) pinta `--fondo` con el color de `PALETA`, `--texto` en `#000000` si `colorNumeroOscuro()` y si no en `#FFFFFF`, el nombre y `calcular().puntosSet`. En `#contador-sets` pinta los sets de cada lado con el color de la camiseta, o `#000000` si `colorNumeroOscuro()` (RF-007)
- [X] T015 [US1] En `js/app.js`, crear la función central `aplicar(cambio)`: calcula `antes = calcular(partido)`, aplica el cambio, calcula `despues`, guarda con `guardarPartido()` y llama a `render()`. Si `antes.ganador` es `null` y `despues.ganador` no: crear con `anadirAlHistorial()` una entrada `{ id, fecha: new Date().toISOString(), nombreA, nombreB, setsA, setsB }` con `id = Date.now().toString(36)`, guardar el id en `partido.idHistorial`, pausar el cronómetro sumando el tiempo en marcha a `acumuladoMs` (RF-017b) y abrir `#dialogo-fin` con "¡{nombre} gana el partido!" y "{setsGanador} - {setsPerdedor} en sets. Guardado en el historial."
- [X] T016 [US1] En `js/app.js`, escuchar `pointerdown` en cada `.mitad` y llamar a `aplicar(p => sumarPunto(p, equipoDeEsaMitad))`, de modo que el punto vaya al equipo que se ve en esa mitad. Guardar también con `guardarPartido()` en `visibilitychange` (estado `hidden`) y en `pagehide` (RF-019)

**Punto de control**: se puede llevar un partido completo; es el MVP.

---

## Fase 4: Historia 2 - Corregir errores y reiniciar (Prioridad: P1)

**Objetivo**: globito con "+" (nuevo partido o reiniciar marcador) y "↶" (deshacer o
rehacer); deshacer reabre un partido terminado.

**Prueba independiente**: sumar puntos, deshacer y rehacer, y probar los dos reinicios
cancelando y confirmando (quickstart, comprobaciones 5, 7 y 15).

### Pruebas de la Historia 2

- [X] T017 [US2] Añadir a `tests/marcador.test.js` pruebas que deben FALLAR antes de T018: `deshacer` quita el último punto y lo pasa a `rehacer`; sin puntos no cambia nada; deshacer el punto que cerró un set devuelve sets 0 - 0 y puntos 24 - 20; deshacer el punto que cerró el partido deja `ganador` en `null`; `rehacer` vuelve a aplicar el punto; sumar después de deshacer vacía `rehacer`; `reiniciarMarcador` vacía `puntos` y `rehacer`, pone `cronometro` a `{ acumuladoMs: 0, enMarchaDesde: null }` e `idHistorial` a `null`, y mantiene `formato`, `equipos` y `equipoIzquierda`; `partidoNuevo(3)` tiene `formato: 3`

### Implementación de la Historia 2

- [X] T018 [US2] Implementar `deshacer(partido)`, `rehacer(partido)` y `reiniciarMarcador(partido)` en `js/marcador.js` según [contracts/marcador.md](contracts/marcador.md). `rehacer` no debe vaciar la lista de rehacer pendiente, a diferencia de `sumarPunto`
- [X] T019 [US2] Añadir a `index.html` el globito `<div id="globito">`, fijo abajo en el centro, con un botón principal (●) y un contenedor `#globito-botones`, oculto por defecto, con `<button id="boton-partido" aria-label="Partido">＋</button>` y `<button id="boton-deshacer" aria-label="Deshacer o rehacer">↶</button>`. Añadir los menús `#menu-partido` ("Nuevo partido", "Reiniciar marcador") y `#menu-deshacer` ("Deshacer", "Rehacer"), y los diálogos `#dialogo-reiniciar` y `#dialogo-nuevo` con los títulos, textos y botones exactos de [contracts/ui.md](contracts/ui.md#diálogos-y-textos-exactos). El de nuevo partido lleva los radios "Al mejor de 3" y "Al mejor de 5", con "Al mejor de 5" marcado
- [X] T020 [US2] Añadir a `css/estilos.css` los estilos del globito: cerrado es un círculo de al menos 48 px; ampliado muestra los botones en fila, de al menos 48 × 48 px. También los menús y los `<dialog>`: centrados, legibles y con botones de al menos 48 px de alto. Todo con `z-index` por encima de `#campo`
- [X] T021 [US2] En `js/app.js`, programar el globito: al pulsar ● se amplía o se cierra; al pulsar fuera se cierra; los `pointerdown` dentro del globito, sus menús y los diálogos llaman a `stopPropagation()` para no sumar puntos ("Toque en el lápiz o en el globito: no suma ningún punto"). "Deshacer" y "Rehacer" se ponen `disabled` cuando `puntos` o `rehacer` están vacíos. Si el globito está ampliado o hay un menú abierto, el `pointerdown` en una `.mitad` solo los cierra y no llama a `sumarPunto` ("Pulsar en una mitad con el globito o un menú abierto: solo los cierra; no suma ningún punto")
- [X] T022 [US2] En `js/app.js`, conectar "Deshacer" y "Rehacer" a `aplicar()`. Ampliar `aplicar()` para que, si `antes.ganador` no es `null` y `despues.ganador` sí, borre la entrada con `borrarDelHistorial(partido.idHistorial)` (solo si `idHistorial` tiene valor, porque el usuario puede haberla borrado ya desde el historial) y ponga `idHistorial` a `null`, dejando el cronómetro pausado (aclaración P1 de /speckit-clarify y RF-009). Si "Rehacer" vuelve a terminar el partido, la rama de T015 crea una entrada nueva
- [X] T023 [US2] En `js/app.js`, conectar los diálogos. "Reiniciar" llama a `aplicar(reiniciarMarcador)`. "Empezar" sustituye el partido por `partidoNuevo(formatoElegido)`, lo guarda y llama a `render()`. "Cancelar" cierra sin cambiar nada. Un partido sin terminar nunca se añade al historial (RF-012)

**Punto de control**: las historias 1 y 2 funcionan; se pueden corregir los errores.

---

## Fase 5: Historia 3 - Personalizar los equipos (Prioridad: P2)

**Objetivo**: lápiz por equipo para cambiar el nombre y el color, y el logo VPMadrid con
camiseta negra.

**Prueba independiente**: editar ambos equipos y comprobar nombre, fondo, color del
número y logo (quickstart, comprobaciones 3 y 8).

### Pruebas de la Historia 3

- [X] T024 [US3] Añadir a `tests/marcador.test.js` pruebas de `editarEquipo()` que deben FALLAR antes de T025: "  Las Rozas  " se guarda como "Las Rozas"; un nombre de 25 caracteres se corta a 20; un nombre vacío o de solo espacios vuelve a "Equipo 1" (A) o "Equipo 2" (B); un color que no está en `PALETA` se rechaza y se mantiene el anterior; `logo: true` con un color distinto de `negro` queda en `false`; pasar de `negro` con logo a `verde` deja `logo: false`

### Implementación de la Historia 3

- [X] T025 [US3] Implementar `editarEquipo(partido, equipo, { nombre, color, logo })` en `js/marcador.js` con las reglas literales de [data-model.md](data-model.md#equipo): nombre — "Se recortan los espacios. Máximo 20 caracteres. Si queda vacío, vuelve a "Equipo 1" o "Equipo 2""; color — uno de los `id` de `PALETA`; logo — "Solo puede ser "sí" si `color` es `negro`. Si el color deja de ser negro, pasa a "no""
- [X] T026 [US3] Añadir a cada `.mitad` de `index.html` un `<button class="lapiz" aria-label="Editar equipo">✎</button>` en la esquina superior derecha y un `<img class="logo" src="assets/logo-vpmadrid-transparente.png" alt="VPMadrid" hidden>`. Añadir el `<dialog id="dialogo-equipo">` con el título "Editar equipo", el campo "Nombre" (`maxlength="20"`), el grupo "Color de la camiseta" (lo rellena `app.js` a partir de `PALETA`), la casilla "Mostrar logo VPMadrid" y los botones "Cancelar" y "Guardar"
- [X] T027 [US3] Añadir a `css/estilos.css`: `.lapiz` de al menos 48 × 48 px con el color `--texto`; `.logo` en la mitad, con un ancho máximo del 40 %, sin tapar el número y con `pointer-events: none`, para que pulsar sobre el logo siga sumando puntos (contracts/ui.md: "No cambia la zona que suma puntos"); muestras de color de la paleta de al menos 44 px, con su nombre y un borde visible para el blanco
- [X] T028 [US3] En `js/app.js`: el `pointerdown` del `.lapiz` llama a `stopPropagation()`, así que nunca suma un punto, y abre `#dialogo-equipo` relleno con el equipo de esa mitad. Las muestras se generan desde `PALETA` con su `nombre`. La casilla del logo solo se ve con `negro` seleccionado y se oculta y desmarca al elegir otro color. "Guardar" llama a `aplicar(p => editarEquipo(p, equipo, valores))`; "Cancelar" cierra sin cambios. `render()` muestra el `.logo` solo si `equipos[x].logo` es `true`

**Punto de control**: las historias 1, 2 y 3 funcionan.

---

## Fase 6: Historia 4 - Cronómetro del partido (Prioridad: P3)

**Objetivo**: cronómetro `mm:ss` arriba, con play/pausa a la izquierda y reiniciar.

**Prueba independiente**: iniciar, pausar, reanudar y reiniciar comparando con un reloj
(quickstart, comprobación 12).

### Pruebas de la Historia 4

- [X] T029 [US4] Añadir a `tests/marcador.test.js` pruebas que deben FALLAR antes de T030: `tiempoMs({ acumuladoMs: 5000, enMarchaDesde: 1000 }, 4000)` vale `8000`; con `enMarchaDesde: null` devuelve `acumuladoMs`; `formatearTiempo(0)` vale `"00:00"`; `formatearTiempo(754000)` vale `"12:34"`; `formatearTiempo(4512000)` vale `"75:12"`; `pausarCronometro(crono, ahora)` suma el tramo en marcha a `acumuladoMs` y deja `enMarchaDesde: null`; `arrancarCronometro(crono, ahora)` pone `enMarchaDesde: ahora`. Añadir también una prueba de `cronometroTrasCierre` (de `js/almacen.js`, T009): con `{ acumuladoMs: 5000, enMarchaDesde: 1000, guardadoEn: 61000 }` devuelve `acumuladoMs: 65000` y `enMarchaDesde: null`; con `enMarchaDesde: null` no cambia nada

### Implementación de la Historia 4

- [X] T030 [US4] Implementar en `js/marcador.js` las funciones puras `tiempoMs(crono, ahora)`, `formatearTiempo(ms)` (minutos con al menos 2 cifras, sin pasar a horas), `arrancarCronometro(crono, ahora)` y `pausarCronometro(crono, ahora)`, según research D6. Hacer que la pausa de T015 use `pausarCronometro`
- [X] T031 [US4] Rellenar `#barra-superior` en `index.html` con `<button id="boton-play" aria-label="Iniciar cronómetro">▶</button>`, `<span id="cronometro">00:00</span>` y `<button id="boton-reiniciar-crono" aria-label="Reiniciar cronómetro">↺</button>`, en ese orden. Añadir sus estilos en `css/estilos.css`: barra compacta, botones de al menos 44 px y cifras con `tabular-nums`
- [X] T032 [US4] En `js/app.js`: play alterna entre `arrancarCronometro` y `pausarCronometro` (usando `Date.now()`) y cambia el icono (▶ / ❚❚) y el `aria-label` ("Iniciar cronómetro" / "Pausar cronómetro"). Reiniciar deja `{ acumuladoMs: 0, enMarchaDesde: null }` sin pedir confirmación. Un `setInterval` de 250 ms pinta `formatearTiempo(tiempoMs(...))`. Pasar a segundo plano NO pausa el cronómetro: solo se guarda (ya lo hace T016) y, al volver a `visible`, se repinta con el tiempo real (research D6). Con el partido terminado, play sigue funcionando

**Punto de control**: el cronómetro funciona y se para solo al terminar el partido.

---

## Fase 7: Historia 5 - Cambiar de lado y girar el móvil (Prioridad: P3)

**Objetivo**: intercambiar los equipos de lado con todos sus datos y adaptar la pantalla
a vertical y horizontal.

**Prueba independiente**: con un partido a medias, cambiar de lado y girar el móvil sin
perder nada (quickstart, comprobaciones 10 y 11).

### Pruebas de la Historia 5

- [X] T033 [US5] Añadir a `tests/marcador.test.js` pruebas que deben FALLAR antes de T034: `cambiarLado` alterna `equipoIzquierda` entre "A" y "B"; `calcular()` devuelve los mismos `puntosSet` y `sets` de cada equipo antes y después del cambio

### Implementación de la Historia 5

- [X] T034 [US5] Implementar `cambiarLado(partido)` en `js/marcador.js` según [contracts/marcador.md](contracts/marcador.md)
- [X] T035 [US5] Añadir a `#globito-botones` de `index.html` el `<button id="boton-lado" aria-label="Cambiar de lado">⇄</button>`, y conectarlo en `js/app.js` a `aplicar(cambiarLado)` sin pedir confirmación
- [X] T036 [US5] Añadir a `css/estilos.css` `@media (orientation: landscape)`: `#campo` en `flex-direction: row` (mitades una al lado de la otra), y la barra superior y el contador de sets más compactos para que quepan. Los tamaños en `vmin` se mantienen legibles en ambas orientaciones (RF-018)

**Punto de control**: las historias 1 a 5 funcionan.

---

## Fase 8: Historia 6 - Historial de partidos (Prioridad: P3)

**Objetivo**: consultar los partidos terminados y borrar uno o todos.

**Prueba independiente**: terminar dos partidos, abrir el historial, borrar uno y luego
todos (quickstart, comprobación 16).

### Implementación de la Historia 6

- [X] T037 [US6] Añadir a `#globito-botones` de `index.html` el `<button id="boton-historial" aria-label="Historial">🕘</button>` y los diálogos `#dialogo-historial` (título "Historial", lista `<ul id="lista-historial">`, mensaje "Todavía no hay partidos guardados", botones "Borrar todo" y "Cerrar"), `#dialogo-borrar-uno` ("¿Borrar este partido?", "Cancelar", "Borrar") y `#dialogo-borrar-todo` ("¿Borrar todo el historial?", "Se borrarán todos los partidos guardados.", "Cancelar", "Borrar todo"), con los textos de [contracts/ui.md](contracts/ui.md#diálogos-y-textos-exactos)
- [X] T038 [US6] En `js/app.js`, `pintarHistorial()` ordena `cargarHistorial()` por `fecha` de más reciente a más antigua y pinta cada fila como "dd/mm/aaaa · {nombreA} {setsA} - {setsB} {nombreB}", con la fecha formateada mediante `toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" })`, y un botón "Borrar" por fila. Con la lista vacía muestra solo "Todavía no hay partidos guardados" y oculta "Borrar todo"
- [X] T039 [US6] En `js/app.js`, conectar los botones. "Borrar" de una fila abre `#dialogo-borrar-uno` con el texto de esa fila; al confirmar llama a `borrarDelHistorial(id)` y vuelve a pintar. "Borrar todo" abre `#dialogo-borrar-todo`; al confirmar llama a `guardarHistorial([])`. Si se borra la entrada `partido.idHistorial` del partido actual, `idHistorial` pasa a `null`. Añadir a `css/estilos.css` los estilos de la lista: filas legibles y con scroll si hay muchas

**Punto de control**: todas las historias funcionan.

---

## Fase 9: Remate y requisitos transversales

**Propósito**: pantalla siempre encendida, instalación, funcionamiento sin conexión y
revisión final.

- [X] T040 En `js/app.js`, mantener la pantalla encendida (RF-019b, research D7): si existe `navigator.wakeLock`, pedir `navigator.wakeLock.request("screen")` al arrancar y de nuevo en cada `visibilitychange` a `visible`, todo dentro de `try/catch`. Si no existe o falla, la app sigue funcionando sin mostrar errores
- [X] T041 [P] Crear `manifest.webmanifest` con `"name": "vpmadrid"`, `"short_name": "vpmadrid"`, `"lang": "es-ES"`, `"start_url": "./"`, `"scope": "./"`, `"display": "standalone"`, `"orientation": "any"`, `"background_color": "#000000"`, `"theme_color": "#000000"` y los iconos `assets/icono-192.png` y `assets/icono-512.png`. Enlazarlo en `index.html` con `<link rel="manifest">` y añadir `<link rel="apple-touch-icon" href="assets/icono-192.png">` y `<meta name="apple-mobile-web-app-capable" content="yes">`
- [X] T042 [P] Crear `sw.js` (research D2) con la constante `CACHE = "vpmadrid-v1"` y la lista de archivos: `./`, `index.html`, `manifest.webmanifest`, `css/estilos.css`, `js/app.js`, `js/marcador.js`, `js/almacen.js`, `assets/logo-vpmadrid-transparente.png`, `assets/icono-192.png` y `assets/icono-512.png`. En `install` los guarda en caché; en `activate` borra las cachés con otro nombre; en `fetch` responde primero desde la caché y, si no está, desde la red
- [X] T043 Registrar el service worker en `js/app.js` con `navigator.serviceWorker.register("sw.js")` si `"serviceWorker" in navigator`, dentro de `try/catch`
- [X] T044 Revisar `index.html` y `js/app.js` contra [contracts/ui.md](contracts/ui.md): todos los textos visibles y `aria-label` coinciden literalmente y no hay ningún texto en otro idioma (CE-008, constitución II). Comprobar también que no hay ninguna funcionalidad que no esté en la spec o en contracts/ui.md (constitución III)
- [X] T045 Ejecutar `node --test` y comprobar que no falla ninguna prueba
- [ ] T046 Seguir [quickstart.md](quickstart.md), sección 2: las 18 comprobaciones manuales en un móvil, con la 14 (Wake Lock) y la 17 (sin conexión) en la versión publicada con HTTPS. Apuntar cualquier fallo como tarea nueva en este archivo

---

## Fase 10: Cambio - Nombre "VPMadrid" con el logo (Historia 3, RF-016b)

**Objetivo**: con "Mostrar logo VPMadrid" activado, el equipo se llama "VPMadrid" y el
nombre no se puede cambiar; al quitar el logo vuelve al nombre por defecto (aclaración del
2026-10-25).

**Prueba independiente**: activar y quitar el logo en la edición y comprobar el nombre
(quickstart, comprobación 8).

- [X] T047 [US3] Añadir a `tests/marcador.test.js` pruebas que deben FALLAR antes de T048: con `color: "negro"`, `logo: true` y `nombre: "Las Rozas"` el nombre queda "VPMadrid"; desde un equipo "VPMadrid" con logo, guardar `logo: false` con `nombre: "VPMadrid"` deja "Equipo 1" (A) o "Equipo 2" (B); en ese mismo caso, con `nombre: "Las Rozas"` se respeta "Las Rozas"; pasar de negro con logo a `verde` con `nombre: "VPMadrid"` deja "Equipo 1"
- [X] T048 [US3] En `editarEquipo()` de `js/marcador.js`, aplicar la regla "Nombre y logo" de [data-model.md](data-model.md#equipo): "con `logo` en "sí", `nombre` es siempre "VPMadrid". Al pasar `logo` de "sí" a "no", si el nombre sigue siendo "VPMadrid" vuelve al de por defecto ("Equipo 1" o "Equipo 2"); si se ha escrito otro, se respeta"
- [X] T049 [US3] En `js/app.js`, en el diálogo "Editar equipo": al marcar "Mostrar logo VPMadrid", el campo "Nombre" pasa a "VPMadrid" y queda `disabled`; al desmarcarlo (o al elegir otro color, que lo desmarca) vuelve a "Equipo 1"/"Equipo 2" y se habilita. Al abrir la edición de un equipo con logo, el campo aparece ya bloqueado con "VPMadrid"
- [X] T050 Cambiar `CACHE` de `"vpmadrid-v1"` a `"vpmadrid-v2"` en `sw.js` para que los móviles que ya tienen la app reciban la versión nueva, y publicar

---

## Dependencias y orden de ejecución

### Dependencias entre fases

- **Preparación (fase 1)**: sin dependencias.
- **Base (fase 2)**: depende de la fase 1 y **bloquea** todas las historias.
- **Historia 1 (fase 3)**: depende de la base. Crea `index.html`, `estilos.css` y `app.js`
  (con `render()` y `aplicar()`), que usan todas las demás.
- **Historias 2 a 6 (fases 4–8)**: dependen de la historia 1, porque amplían sus archivos.
  Entre ellas solo dependen del globito:
  - US2 crea el globito; US5 (⇄) y US6 (🕘) le añaden botones, así que van después de US2.
  - US3 y US4 solo dependen de US1.
- **Remate (fase 9)**: después de las historias que se vayan a entregar. T041 y T042 se
  pueden adelantar en cualquier momento.

### Dentro de cada historia

- La prueba (`tests/marcador.test.js`) se escribe primero y debe fallar.
- Después, las reglas en `js/marcador.js`, luego `index.html`, luego `css/estilos.css` y
  por último `js/app.js`.

### Oportunidades de paralelismo

- Fase 1: T002, T003 y T004 en paralelo (archivos distintos).
- Fase 2: T007 (pruebas) en paralelo con T005–T006; T009 (almacenamiento) después de
  T006, en paralelo con T007 y T008.
- Fase 9: T041 y T042 en paralelo.
- En las historias casi todo es secuencial, porque comparten `index.html`, `estilos.css`,
  `app.js` y el archivo de pruebas. Con una sola persona trabajando, el paralelismo no
  aporta y se recomienda el orden por prioridad.

---

## Ejemplo de paralelismo: base

```text
Tarea: "T007 Pruebas de calcular() en tests/marcador.test.js"
Tarea: "T009 Crear js/almacen.js según contracts/almacenamiento.md"
```

## Ejemplo de paralelismo: remate

```text
Tarea: "T041 Crear manifest.webmanifest"
Tarea: "T042 Crear sw.js"
```

---

## Estrategia de implementación

### Primero el MVP (solo la historia 1)

1. Fase 1 (preparación) y fase 2 (base).
2. Fase 3 (historia 1).
3. **PARAR Y VALIDAR**: comprobaciones 1, 2, 4, 6 y 13 del quickstart. Ya se puede contar
   un partido real.

### Entrega incremental

1. MVP → validar → foto en Git.
2. \+ Historia 2 (corregir errores) → validar → foto. Con esto el marcador ya es fiable en
   un partido real.
3. \+ Historia 3 (personalizar) → validar → foto.
4. \+ Historias 4, 5 y 6 → validar cada una → foto.
5. Remate (fase 9) → quickstart completo → publicar.

---

## Notas

- [P] = archivo distinto y sin dependencias pendientes.
- La etiqueta de historia permite saber de qué parte de la spec sale cada tarea.
- Hacer un commit al terminar cada fase (es la "foto" a la que se puede volver).
- Si durante la implementación surge una idea que no está en la spec, se apunta como
  propuesta y no se construye (constitución III).
