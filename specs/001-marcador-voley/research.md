# Investigación (Fase 0): Marcador de voley vpmadrid v0

Cada decisión aplica el principio I de la constitución: ante dos opciones, la más simple.

## D1. Tipo de app

- **Decisión**: aplicación web instalable (PWA) hecha con HTML, CSS y JavaScript sin
  frameworks ni paso de compilación.
- **Por qué**: un único código sirve para Android e iPhone (aclaración P3), se instala en la
  pantalla de inicio sin tiendas de apps y funciona sin conexión. La app tiene una sola
  pantalla y unos pocos diálogos: un framework no aporta nada que compense su complejidad.
- **Alternativas descartadas**: app nativa (dos códigos, Android e iOS, y publicación en
  tiendas); React/Vue/Svelte (dependencias y compilación para una sola pantalla); Flutter
  o React Native (herramientas pesadas para una v1).

## D2. Funcionamiento sin conexión

- **Decisión**: un `manifest.webmanifest` (para poder instalarla) y un service worker mínimo
  que guarda en caché los archivos de la app la primera vez y los sirve desde la caché.
- **Por qué**: en un pabellón puede no haber cobertura; la app no necesita internet para
  nada más.
- **Alternativas descartadas**: librerías de service worker como Workbox (una dependencia
  para unas 15 líneas de código).

## D3. Dónde se guardan los datos

- **Decisión**: `localStorage` del navegador, con dos claves: el partido en curso y el
  historial (ver [contracts/almacenamiento.md](contracts/almacenamiento.md)).
- **Por qué**: los datos son minúsculos (unos KB incluso con cientos de partidos), la API
  es síncrona y sencilla, y no hay servidor ni cuentas (spec, Supuestos).
- **Alternativas descartadas**: IndexedDB (API mucho más compleja para tan pocos datos);
  servidor o nube (fuera de alcance: sin cuentas ni sincronización).
- **Riesgo asumido**: si el usuario borra los datos del navegador se pierde el historial.
  Es coherente con "datos en el propio dispositivo".

## D4. Cómo se calculan puntos, sets, ganador y deshacer

- **Decisión**: el partido guarda la **lista de puntos** en orden (`["A","A","B",...]`,
  donde A y B son los equipos, no los lados). Puntos del set, sets y ganador se **calculan**
  recorriendo esa lista con las reglas del formato. "Deshacer" quita el último elemento
  de la lista y lo pasa a una lista de "rehacer"; sumar un punto nuevo vacía "rehacer".
- **Por qué**: una sola fuente de verdad. Deshacer un punto que cerró un set o el partido
  (aclaración P1) sale gratis: al recalcular, el set o la victoria simplemente
  desaparecen. No hay casos especiales que puedan quedar desincronizados.
- **Alternativas descartadas**: guardar contadores y una pila de fotos del estado
  (duplica datos y obliga a tratar a mano el cierre de set y de partido).
- **Coste**: recalcular un partido de unos 250 puntos como máximo es instantáneo.

## D5. Cambio de lado

- **Decisión**: un único dato `equipoIzquierda` (`"A"` o `"B"`). Los puntos se apuntan
  al equipo, nunca al lado; cambiar de lado solo cambia ese dato.
- **Por qué**: cumple la Historia 5 (el equipo se lleva todos sus datos) sin copiar nada.

## D6. Cronómetro

- **Decisión**: se guarda el tiempo acumulado (`acumuladoMs`) y, si está en marcha, el
  instante en que arrancó (`enMarchaDesde`). El tiempo mostrado es
  `acumuladoMs + (ahora - enMarchaDesde)`. La pantalla se refresca cada segundo, pero el
  tiempo sale del reloj del sistema, no de contar ticks.
- **Por qué**: no acumula desfase (CE-006: máximo 1 s cada 10 min) aunque el navegador
  retrase los temporizadores.
- **Al cambiar de app o cerrarla**: al pasar a segundo plano se guarda el partido tal
  cual, con `enMarchaDesde`, y el cronómetro sigue contando (si se vuelve sin haber
  cerrado la app, muestra el tiempo real). Cada guardado anota `guardadoEn`, el instante
  del guardado. Si la app se cierra del todo, al abrirla de nuevo se suma a `acumuladoMs`
  el tramo `guardadoEn - enMarchaDesde` y queda en pausa (RF-019, aclaración del
  2026-10-25).
- **Al terminar el partido**: se pausa igual (RF-017b). Si "Deshacer" reabre el partido,
  sigue pausado.

## D7. Mantener la pantalla encendida (RF-019b)

- **Decisión**: Screen Wake Lock API (`navigator.wakeLock.request("screen")`), pedida al
  abrir la app y de nuevo cada vez que vuelve a primer plano (el navegador la suelta al
  ocultarse).
- **Compatibilidad**: Chrome en Android y Safari en iPhone (iOS 16.4 o superior; con la
  app instalada en la pantalla de inicio, iOS 18.4 o superior). Exige HTTPS.
- **Si el móvil no la soporta**: la app funciona igual y la pantalla sigue los ajustes del
  móvil. Se deja anotado en el quickstart como limitación conocida.
- **Alternativas descartadas**: el truco del vídeo invisible en bucle (frágil, gasta
  batería y es más código).

## D8. Pantalla en vertical y en horizontal

- **Decisión**: CSS con `@media (orientation: landscape)`: en horizontal, las mitades van
  una al lado de la otra; en vertical, una encima de otra. Los números se dimensionan con
  unidades relativas a la pantalla (`vmin`) para que se lean a 3 metros (CE-007).
- **Por qué**: no necesita JavaScript y no pierde datos al girar (RF-018).

## D9. Colores y contraste

- **Decisión**: la paleta de RF-015 se define una vez en el código como una lista de
  `{ id, nombre, fondo, textoOscuro }`; blanco y amarillo tienen `textoOscuro: true`.
- **Por qué**: la regla de HU3 y de la aclaración P4 queda en un solo sitio.

## D10. Pruebas

- **Decisión**:
  - Las reglas del marcador (D4) van en un módulo de JavaScript puro, sin acceso a la
    pantalla, probado con el ejecutor de pruebas que trae Node (`node --test`), sin
    instalar nada.
  - Todo lo demás se comprueba a mano en un móvil siguiendo
    [quickstart.md](quickstart.md), que reproduce los criterios de éxito (principio IV).
- **Por qué**: las reglas de set y partido son lo único con lógica delicada (24-24, set
  decisivo a 15, deshacer tras cerrar set o partido) y una prueba automática las cubre en
  segundos. Probar la interfaz de forma automática exigiría herramientas pesadas
  (Playwright...) que la v1 no necesita.
- **Alternativas descartadas**: Jest o Vitest (dependencias innecesarias); pruebas
  automáticas de interfaz.

## D11. Publicación

- **Decisión**: hosting estático con HTTPS; se propone GitHub Pages (gratuito).
- **Por qué**: el service worker y el Wake Lock solo funcionan con HTTPS. No hace falta
  servidor propio.
- **Dependencia**: requiere que el proyecto esté en Git (pendiente) y una cuenta de
  GitHub. Para probar en local basta con `npx serve` o cualquier servidor estático.

## D12. Logo de VPMadrid

- **Decisión**: la app usa `assets/logo-vpmadrid-transparente.png` (496×236 px, negro y
  amarillo, fondo transparente). Se ha generado a partir del original aportado por el
  propietario (`assets/logo-vpmadrid.png`, 554×554 con fondo blanco), quitando el fondo
  blanco y recortando los márgenes vacíos.
- **Por qué**: sobre la camiseta negra, el fondo blanco del original se vería como un
  cuadrado blanco.
