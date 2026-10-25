# Especificación: Marcador de voley vpmadrid v0

**Rama**: `001-marcador-voley`

**Creada**: 2026-10-24

**Estado**: Borrador

**Entrada**: descripción del usuario "Especificación: Vpmadrid v0" (HU1–HU10, RF1–RF2) y
las respuestas a 8 preguntas de aclaración (ver "Aclaraciones").

## Aclaraciones

### Sesión 2026-10-24

- P: ¿Cómo se gana un set? → R: Automático, reglas oficiales: set a 25 con 2 de diferencia;
  el set decisivo a 15 con 2 de diferencia.
- P: ¿Cuándo termina un partido? → R: El usuario elige "al mejor de 3" o "al mejor de 5".
- P: ¿Cuándo se guarda un partido en el historial y dónde se consulta? → R: Automáticamente al
  terminar el partido; el historial se abre desde el globito de abajo.
- P: ¿Cómo se elige el color de camiseta? → R: Paleta fija de colores.
- P: ¿Cómo aparece el logo de VPMadrid? → R: Opción en el lápiz, solo disponible si el equipo
  tiene camiseta negra; desactivada por defecto.
- P: ¿Qué se puede deshacer/rehacer? → R: Solo puntos (si el punto cerró un set, el set
  también se deshace).
- P: ¿Qué pasa si se cierra la app a mitad de partido? → R: Al volver se recupera tal cual;
  el cronómetro queda en pausa.
- P: ¿Qué pasa al pulsar "Nuevo partido" o "Reiniciar marcador" con un partido en curso? →
  R: Pide confirmación y el partido sin terminar no se guarda.
- P: Si el último punto de un partido se suma por error, ¿se puede deshacer aunque el partido
  ya haya terminado y se haya guardado? → R: Sí. "Deshacer" reabre el partido, quita el
  último punto y borra ese partido del historial; al volver a terminar se guarda de nuevo.
- P: Mientras la app está abierta durante un partido, ¿debe impedir que la pantalla se
  apague sola? → R: Sí, siempre que la app esté en primer plano.
- P: ¿En qué aparatos tiene que funcionar bien la app en esta versión? → R: Solo móviles
  (Android e iPhone).
- P: ¿Debe incluir la paleta el amarillo u otros colores claros? → R: Se añade el amarillo;
  con camiseta blanca o amarilla el número va en negro, con el resto en blanco.
- P: Cuando un partido termina, ¿qué hace el cronómetro? → R: Se para solo y muestra la
  duración total; si "Deshacer" reabre el partido, sigue parado hasta pulsar play.

### Sesión 2026-10-25 (tras /speckit-analyze)

- P: ¿Se puede instalar la app en la pantalla de inicio? → R: Sí, con el icono de VPMadrid y
  a pantalla completa; también funciona sin instalarla.
- P: Con el globito o un menú abierto, ¿pulsar en una mitad suma un punto? → R: No, solo los
  cierra.
- P: ¿Cambiar un momento a otra app pausa el cronómetro? → R: No, sigue contando; solo queda
  en pausa si la app se cierra del todo o se recarga.

## Escenarios de usuario y pruebas *(obligatorio)*

### Historia 1 - Contar los puntos y sets de un partido (Prioridad: P1)

El usuario abre la app y ve la pantalla dividida en dos mitades, una por equipo
("Equipo 1" y "Equipo 2"). Cada mitad muestra encima el nombre del equipo y debajo, en
números grandes, sus puntos. Cada vez que pulsa en la mitad de un equipo, ese equipo suma un
punto. Cuando un equipo gana un set, la app lo suma al contador de sets y pone los puntos a
cero. Cuando un equipo gana el partido, la app lo anuncia y lo guarda en el historial.
(HU1, HU3, HU6, HU7, HU8)

**Por qué esta prioridad**: es el objetivo de negocio: contar los puntos de un partido.

**Prueba independiente**: jugar un partido simulado pulsando en cada mitad hasta que un
equipo gane, y comprobar los puntos, los sets y el anuncio del ganador.

**Escenarios de aceptación**:

1. **Dado** un partido nuevo, **cuando** abro la app, **entonces** veo la pantalla dividida
   en dos mitades con "Equipo 1" y "Equipo 2" encima de un 0 grande en cada una, y el
   contador de sets 0 - 0.
2. **Dado** un partido en curso, **cuando** pulso en la mitad del Equipo 1, **entonces** su
   número sube en 1 y el del Equipo 2 no cambia.
3. **Dado** un marcador 24 - 20 en un set que no es el decisivo, **cuando** el Equipo 1 suma
   un punto, **entonces** el Equipo 1 gana el set, su contador de sets sube en 1 y ambos
   marcadores de puntos vuelven a 0.
4. **Dado** un marcador 24 - 24, **cuando** el Equipo 1 suma un punto (25 - 24),
   **entonces** el set NO termina; termina cuando un equipo tenga 2 puntos de ventaja
   (por ejemplo 27 - 25).
5. **Dado** un partido "al mejor de 5" con sets 2 - 2, **cuando** se juega el quinto set,
   **entonces** ese set lo gana el primer equipo que llega a 15 con 2 de diferencia.
6. **Dado** un partido "al mejor de 3" con sets 1 - 1, **cuando** se juega el tercer set,
   **entonces** ese set lo gana el primer equipo que llega a 15 con 2 de diferencia.
7. **Dado** un partido "al mejor de 5", **cuando** un equipo gana su tercer set,
   **entonces** la app muestra quién ha ganado, deja de sumar puntos al pulsar las mitades y
   guarda el partido en el historial.
8. **Dado** un equipo con camiseta de cualquier color salvo blanco o amarillo, **cuando**
   miro su mitad, **entonces** el número de puntos se ve en blanco; **si** la camiseta es
   blanca o amarilla, el número se ve en negro.
9. **Dado** el contador de sets (debajo del cronómetro), **cuando** lo miro, **entonces**
   tiene fondo blanco y el número de sets de cada equipo se ve del color de su camiseta
   (en negro si la camiseta es blanca o amarilla).

---

### Historia 2 - Corregir errores y reiniciar (Prioridad: P1)

Abajo hay un globito. Al pulsarlo se amplía y muestra cuatro botones: "+", "deshacer",
"cambiar de lado" (dos flechas) e "historial". El "+" ofrece "Nuevo partido" y "Reiniciar marcador".
"Deshacer" ofrece "Deshacer" y "Rehacer". (HU9, parte de deshacer y reinicios)

**Por qué esta prioridad**: sin poder corregir un toque por error el marcador deja de ser
fiable durante el partido.

**Prueba independiente**: sumar puntos, deshacer y rehacer, y usar ambos reinicios,
comprobando el marcador tras cada acción.

**Escenarios de aceptación**:

1. **Dado** el globito cerrado, **cuando** lo pulso, **entonces** se amplía y muestra "+",
   "deshacer", las dos flechas e "historial".
2. **Dado** un marcador 10 - 8 tras un punto del Equipo 1, **cuando** elijo "Deshacer",
   **entonces** el marcador vuelve a 9 - 8.
3. **Dado** que acabo de deshacer un punto, **cuando** elijo "Rehacer", **entonces** el
   punto vuelve a sumarse.
4. **Dado** que el último punto cerró un set (sets 1 - 0, puntos 0 - 0), **cuando** elijo
   "Deshacer", **entonces** vuelven los sets 0 - 0 y los puntos que había antes de ese
   punto (por ejemplo 24 - 20).
5. **Dado** que no hay ningún punto que deshacer, **cuando** abro "deshacer", **entonces**
   la opción "Deshacer" aparece desactivada (y lo mismo "Rehacer" si no hay nada que
   rehacer).
6. **Dado** que deshago un punto y después sumo uno nuevo, **cuando** abro "deshacer",
   **entonces** "Rehacer" aparece desactivado.
7. **Dado** un partido recién terminado y guardado en el historial, **cuando** elijo
   "Deshacer", **entonces** el partido se reabre sin el último punto, desaparece del
   historial y las mitades vuelven a sumar puntos; cuando vuelva a terminar, se guarda de
   nuevo.
8. **Dado** un partido en curso, **cuando** elijo "Reiniciar marcador" y confirmo,
   **entonces** puntos, sets y cronómetro vuelven a 0 y se mantienen nombres, colores, logo
   y formato del partido.
9. **Dado** un partido en curso, **cuando** elijo "Nuevo partido", **entonces** se me pide
   confirmar y elegir "al mejor de 3" o "al mejor de 5"; al confirmar, todo vuelve a los
   valores predeterminados (nombres, colores, logo, lado, puntos, sets y cronómetro) con el
   formato elegido.
10. **Dado** cualquiera de los dos reinicios, **cuando** cancelo la confirmación,
    **entonces** no cambia nada.
11. **Dado** un partido sin terminar, **cuando** lo reinicio de cualquiera de las dos
    formas, **entonces** ese partido no aparece en el historial.

---

### Historia 3 - Personalizar los equipos (Prioridad: P2)

Cada mitad tiene un lápiz. Al pulsarlo el usuario puede cambiar el nombre del equipo y
elegir el color de su camiseta de una paleta; la mitad toma ese color de fondo. Si el
color es negro, puede activar el logo de VPMadrid. (HU2, HU6, HU10)

**Por qué esta prioridad**: ayuda a saber de un vistazo qué lado es de qué equipo, pero se
puede contar un partido sin ello.

**Prueba independiente**: editar ambos equipos y comprobar nombre, color de fondo, color
del número y logo.

**Escenarios de aceptación**:

1. **Dado** un equipo, **cuando** pulso su lápiz, **entonces** se abre la edición del equipo
   y NO se suma ningún punto.
2. **Dado** la edición abierta, **cuando** escribo "Las Rozas" y guardo, **entonces** encima
   del número aparece "Las Rozas" en lugar de "Equipo 1".
3. **Dado** la edición abierta, **cuando** elijo el color rojo, **entonces** el fondo de esa
   mitad pasa a rojo y su número de sets se ve en rojo.
4. **Dado** la edición abierta, **cuando** elijo el blanco o el amarillo, **entonces** el
   número de puntos se ve en negro.
5. **Dado** un equipo con camiseta negra, **cuando** abro su edición, **entonces** veo la
   opción "Mostrar logo VPMadrid", desactivada por defecto; al activarla el logo aparece en
   su mitad.
6. **Dado** un equipo con otro color que no sea negro, **cuando** abro su edición,
   **entonces** no aparece la opción del logo.
7. **Dado** un equipo con el logo activado, **cuando** le cambio el color a otro distinto
   del negro, **entonces** el logo deja de mostrarse.
8. **Dado** la edición abierta, **cuando** la cierro sin guardar, **entonces** no cambia
   nada.

---

### Historia 4 - Cronómetro del partido (Prioridad: P3)

Arriba hay un cronómetro pequeño "00:00" con un botón de play a su izquierda y un botón de
reiniciar. (HU5)

**Por qué esta prioridad**: aporta información útil pero no es necesario para contar.

**Prueba independiente**: iniciar, pausar, reanudar y reiniciar el cronómetro comparándolo
con un reloj.

**Escenarios de aceptación**:

1. **Dado** el cronómetro en 00:00 parado, **cuando** pulso play, **entonces** empieza a
   contar segundos.
2. **Dado** el cronómetro en marcha, **cuando** pulso play, **entonces** se pausa y conserva
   el tiempo.
3. **Dado** el cronómetro pausado en 12:30, **cuando** pulso play, **entonces** continúa
   desde 12:30.
4. **Dado** el cronómetro en cualquier estado, **cuando** pulso reiniciar, **entonces**
   vuelve a 00:00 y queda parado.
5. **Dado** el cronómetro en marcha, **cuando** pasan 2 minutos según un reloj,
   **entonces** marca 02:00 (±1 segundo).
6. **Dado** el cronómetro en marcha, **cuando** un equipo gana el partido, **entonces** el
   cronómetro se para solo y muestra la duración total.
7. **Dado** un partido terminado con el cronómetro parado, **cuando** "Deshacer" reabre el
   partido, **entonces** el cronómetro sigue parado hasta que pulso play.

---

### Historia 5 - Cambiar de lado y girar el móvil (Prioridad: P3)

Las dos flechas del globito intercambian los equipos de lado. La pantalla funciona en
vertical y en horizontal. (HU4, HU9 parte de las flechas)

**Por qué esta prioridad**: en voley se cambia de campo entre sets, pero el marcador sigue
siendo correcto sin ello.

**Prueba independiente**: con un partido a medias, cambiar de lado y girar el móvil
comprobando que nada se pierde.

**Escenarios de aceptación**:

1. **Dado** el Equipo 1 a la izquierda con 10 puntos y 1 set, **cuando** pulso las dos
   flechas, **entonces** el Equipo 1 pasa a la derecha con su nombre, color, logo, 10 puntos
   y 1 set, y el Equipo 2 pasa a la izquierda con los suyos.
2. **Dado** los equipos cambiados de lado, **cuando** pulso en la mitad de un equipo,
   **entonces** el punto se suma a ese equipo (el que se ve en esa mitad).
3. **Dado** el móvil en vertical, **cuando** lo giro a horizontal, **entonces** la pantalla
   se reorganiza (mitades una encima de otra en vertical, una al lado de otra en
   horizontal) y conserva todos los datos.

---

### Historia 6 - Historial de partidos (Prioridad: P3)

Los partidos terminados se guardan solos en un historial que se abre desde el globito. El
usuario puede borrar un partido o todo el historial. (RF1, RF2)

**Por qué esta prioridad**: es útil para recordar resultados, pero no para contar el
partido de hoy.

**Prueba independiente**: terminar dos partidos, abrir el historial, borrar uno y luego
todos.

**Escenarios de aceptación**:

1. **Dado** que un partido termina, **cuando** abro el historial, **entonces** aparece con
   la fecha, los nombres de los dos equipos y el resultado en sets (por ejemplo
   "Las Rozas 3 - 1 Equipo 2").
2. **Dado** varios partidos guardados, **cuando** abro el historial, **entonces** aparecen
   ordenados del más reciente al más antiguo.
3. **Dado** un partido en el historial, **cuando** elijo borrarlo y confirmo, **entonces**
   desaparece y los demás siguen.
4. **Dado** el historial con partidos, **cuando** elijo "Borrar todo" y confirmo,
   **entonces** el historial queda vacío.
5. **Dado** el historial vacío, **cuando** lo abro, **entonces** veo el mensaje "Todavía no
   hay partidos guardados".

---

### Casos límite

- **Toque en el lápiz o en el globito**: no suma ningún punto. La zona que suma puntos es
  la mitad del equipo salvo el lápiz y su alrededor inmediato.
- **Pulsar en una mitad con el globito o un menú abierto**: solo los cierra; no suma
  ningún punto.
- **Cambiar un momento a otra app o bloquear el móvil con el cronómetro en marcha**: el
  cronómetro sigue contando y al volver muestra el tiempo real.
- **Pulsar en las mitades con el partido terminado**: no suma puntos. Se puede empezar un
  "Nuevo partido", "Reiniciar marcador" o usar "Deshacer".
- **Deshacer con el partido terminado**: reabre el partido sin el último punto y lo borra
  del historial; al volver a terminar se guarda de nuevo (una sola vez).
- **Reiniciar tras terminar un partido**: el partido ya guardado se queda en el historial.
- **Los dos equipos con el mismo color**: se permite (decisión del usuario).
- **Nombre vacío**: si se guarda un nombre vacío, el equipo recupera su nombre por defecto
  ("Equipo 1" o "Equipo 2").
- **Nombre muy largo**: el nombre admite hasta 20 caracteres.
- **Cronómetro de más de una hora**: sigue contando en minutos y segundos (por ejemplo
  75:12).
- **Cerrar o recargar la app a mitad de partido**: al volver se ven los mismos puntos, sets,
  nombres, colores, logo, formato y tiempo; el cronómetro queda en pausa.
- **Cambiar de lado o girar el móvil a mitad de set**: no altera ningún dato.
- **Formato "al mejor de 3"**: el set decisivo es el tercero; con "al mejor de 5", el quinto.

## Requisitos *(obligatorio)*

### Requisitos funcionales

**Marcador**
- **RF-001**: La app DEBE mostrar la pantalla dividida en dos mitades, una por equipo.
- **RF-002**: Cada mitad DEBE mostrar el nombre del equipo encima de sus puntos en números
  grandes.
- **RF-003**: Los números de puntos DEBEN verse en blanco, salvo con camiseta blanca o
  amarilla, que se verán en negro.
- **RF-004**: Pulsar en la mitad de un equipo (fuera del lápiz) DEBE sumar 1 punto a ese
  equipo.
- **RF-005**: La app DEBE dar el set por ganado al equipo que llegue a 25 puntos con 2 de
  ventaja (15 con 2 de ventaja en el set decisivo), sumarle el set y poner los puntos a 0.
- **RF-006**: La app DEBE dar el partido por ganado al equipo que gane 2 sets ("al mejor de
  3") o 3 sets ("al mejor de 5"), anunciar el ganador y dejar de sumar puntos.
- **RF-007**: Debajo del cronómetro DEBE haber un contador de sets con fondo blanco donde el
  número de cada equipo se ve del color de su camiseta (en negro si es blanca o amarilla).

**Globito y correcciones**
- **RF-008**: En la parte de abajo DEBE haber un globito que al pulsarlo muestre "+",
  "deshacer", "cambiar de lado" e "historial".
- **RF-009**: "Deshacer" DEBE quitar el último punto sumado (y el set si ese punto lo
  cerró); "Rehacer" DEBE volver a aplicar el último punto deshecho. Solo afectan a puntos.
  Si el partido ya había terminado, "Deshacer" DEBE reabrirlo y quitarlo del historial.
- **RF-010**: "Reiniciar marcador" DEBE, tras confirmar, poner a 0 puntos, sets y
  cronómetro, manteniendo nombres, colores, logo y formato.
- **RF-011**: "Nuevo partido" DEBE, tras confirmar y elegir "al mejor de 3" o "al mejor de
  5", volver a los valores predeterminados.
- **RF-012**: Un partido reiniciado sin terminar NO DEBE guardarse en el historial.
- **RF-013**: "Cambiar de lado" DEBE intercambiar las mitades de los equipos con todos sus
  datos.

**Equipos**
- **RF-014**: Cada mitad DEBE tener un lápiz para editar el nombre (hasta 20 caracteres) y
  el color de camiseta del equipo.
- **RF-015**: El color se DEBE elegir de una paleta fija: blanco, amarillo, negro, rojo,
  granate, naranja, verde, azul, azul marino y morado. El fondo de la mitad toma ese color.
- **RF-016**: Si el color es negro, la edición DEBE ofrecer "Mostrar logo VPMadrid"
  (desactivado por defecto), que muestra el logo en esa mitad.

**Cronómetro**
- **RF-017**: Arriba DEBE haber un cronómetro en formato mm:ss con un botón play/pausa a la
  izquierda y un botón de reiniciar.
- **RF-017b**: Al terminar el partido, el cronómetro DEBE pararse solo y mostrar la duración
  total. Si "Deshacer" reabre el partido, sigue parado hasta que el usuario pulse play.

**Pantalla y continuidad**
- **RF-018**: La app DEBE funcionar en vertical y en horizontal, reorganizando las mitades
  al girar el móvil sin perder datos.
- **RF-019**: Si la app se cierra a mitad de partido, al volver DEBE recuperar el estado
  completo con el cronómetro en pausa.
- **RF-019b**: Mientras la app esté en primer plano, la pantalla del móvil NO DEBE apagarse
  sola, sean cuales sean los ajustes de bloqueo del móvil, en los móviles indicados en
  Supuestos.

**Historial**
- **RF-020**: Al terminar un partido, la app DEBE guardar automáticamente en el historial la
  fecha, los nombres de los dos equipos y el resultado en sets.
- **RF-021**: El historial DEBE abrirse desde el globito y mostrar los partidos del más
  reciente al más antiguo.
- **RF-022**: El usuario DEBE poder borrar, tras confirmar, un partido concreto o todo el
  historial.

**Idioma**
- **RF-023**: Todos los textos de la app DEBEN estar en español de España.

### Entidades clave

- **Partido**: formato (al mejor de 3 o de 5), los dos equipos, sets de cada equipo,
  puntos del set en curso, tiempo del cronómetro, si ha terminado y quién ha ganado.
- **Equipo**: nombre, color de camiseta, si muestra el logo, lado de la pantalla.
- **Partido guardado (historial)**: fecha, nombres de los dos equipos y resultado en sets.

## Criterios de éxito *(obligatorio)*

Todos se comprueban usando la app, sin leer código.

### Resultados medibles

- **CE-001**: Una persona que no ha visto nunca la app puede llevar el marcador de un
  partido completo sin ayuda ni instrucciones.
- **CE-002**: Cada toque en la mitad de un equipo se refleja en el marcador al instante
  (sin espera perceptible), en 50 de 50 toques de prueba.
- **CE-003**: En un partido simulado completo, la app asigna correctamente cada set y el
  ganador según las reglas de esta spec en el 100 % de los casos (incluidos 24 - 24 y el
  set decisivo a 15).
- **CE-004**: Corregir un punto sumado por error lleva como máximo 3 toques.
- **CE-005**: Tras cerrar y volver a abrir la app a mitad de partido, el marcador es
  idéntico al que había.
- **CE-006**: El cronómetro se desvía como máximo 1 segundo cada 10 minutos frente a un
  reloj.
- **CE-007**: Los números de los puntos se leen sin esfuerzo a 3 metros del móvil con
  cualquier color de la paleta.
- **CE-008**: Ningún texto de la app aparece en otro idioma que no sea español de España.
- **CE-009**: Con el móvil configurado para bloquearse a los 30 segundos, la app abierta
  sin tocarla durante 5 minutos mantiene la pantalla encendida.

## Supuestos

- El nombre del producto es vpmadrid (la descripción decía "Reservas" por error).
- La app se usa en un móvil (Android o iPhone), por una sola persona, sin cuentas de usuario ni conexión a
  internet. El partido en curso y el historial se guardan en el propio dispositivo.
- La app se puede instalar en la pantalla de inicio del móvil, con el icono de VPMadrid,
  y se abre a pantalla completa, sin la barra del navegador. Funciona igual sin instalarla.
- Mantener la pantalla encendida (RF-019b) requiere Android con Chrome actualizado o
  iPhone con iOS 16.4 o superior (18.4 o superior si la app está instalada). En móviles
  más antiguos la app funciona igual, pero la pantalla sigue los ajustes del móvil.
- Valores predeterminados: "Equipo 1" con camiseta azul a la izquierda (o arriba),
  "Equipo 2" con camiseta roja a la derecha (o abajo), logo desactivado, "al mejor de 5",
  cronómetro 00:00 parado. La primera vez que se abre la app empieza con estos valores.
- Los únicos colores claros de la paleta son el blanco y el amarillo (ambos con número en
  negro); no hay otros colores claros como el celeste.
- El logo de VPMadrid lo aporta el propietario del proyecto como imagen; no se puede subir
  otro logo desde la app.
- Hay un solo cronómetro para todo el partido; no se reinicia solo al cambiar de set ni
  arranca solo al sumar un punto. Lo único automático es que se para al terminar el partido.
- Cambiar de lado es siempre manual; la app no cambia de lado sola entre sets.
- El historial no guarda los parciales de cada set ni el tiempo, solo lo pedido en RF1
  (fecha, equipos y resultado).

## Fuera de alcance (v0)

- Saque, rotaciones, tiempos muertos y sustituciones.
- Restar puntos de otra forma que no sea "Deshacer".
- Deshacer cambios de nombre, color, lado o reinicios.
- Colores libres fuera de la paleta.
- Puntos por set configurables.
- Estadísticas, compartir resultados, exportar el historial.
- Cuentas de usuario, sincronización entre dispositivos.
- Otros idiomas.
- Tablets y ordenadores (la app puede abrirse en ellos, pero no se diseña ni se prueba
  para ellos).
