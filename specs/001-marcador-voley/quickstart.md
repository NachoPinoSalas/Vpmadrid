# Guía rápida de validación: Marcador de voley vpmadrid v0

Cómo arrancar la app y comprobar que cumple la spec. Las comprobaciones manuales se hacen
usando la app, sin leer código (principio IV).

## Requisitos previos

- Node.js 18 o superior (solo para las pruebas automáticas y el servidor local).
- Un móvil Android (Chrome) o un iPhone (Safari, iOS 16.4 o superior) en la misma red wifi
  que el ordenador, o la app ya publicada con HTTPS.

## Arrancar

```text
node --test tests/                 # pruebas automáticas de las reglas
npx serve .                        # servidor local en http://localhost:3000
```

- En el ordenador: abrir `http://localhost:3000` con la vista de móvil del navegador.
- En el móvil: el Wake Lock y la instalación exigen HTTPS. Para probarlos hay que usar la
  versión publicada (research D11). Todo lo demás se puede probar con la IP local del
  ordenador.

## 1. Pruebas automáticas (reglas, CE-003)

`node --test tests/` debe terminar sin fallos. Cubren al menos:

- 25 - 23 cierra el set; 25 - 24 no; 26 - 24 sí.
- El set decisivo va a 15 (5.º en "al mejor de 5" y 3.º en "al mejor de 3").
- El partido termina con 3 sets (formato 5) o 2 sets (formato 3) y no admite más puntos.
- Deshacer el punto que cerró un set devuelve el set y los puntos anteriores.
- Deshacer el punto que cerró el partido quita el ganador.
- Rehacer, y que sumar un punto nuevo vacía "rehacer".
- Cambiar de lado no altera puntos ni sets de cada equipo.
- Validación del nombre (vacío y más de 20 caracteres) y del logo (solo con negro).

## 2. Comprobaciones manuales en el móvil

| # | Pasos | Resultado esperado | Spec |
|---|---|---|---|
| 1 | Abrir la app por primera vez. | "Equipo 1" (azul) y "Equipo 2" (rojo) con 0, sets 0 - 0, cronómetro 00:00. | Historia 1, esc. 1 |
| 2 | Pulsar 10 veces en el Equipo 1 y 8 en el Equipo 2. | 10 - 8 al instante, sin fallar ningún toque. | CE-002 |
| 3 | Pulsar el lápiz del Equipo 1. | Se abre "Editar equipo" y el marcador sigue en 10 - 8. | Historia 3, esc. 1 |
| 4 | Llevar el Equipo 1 a 25 - 20. | Sets 1 - 0 y puntos 0 - 0. | Historia 1, esc. 3 |
| 5 | Globito → ↶ → "Deshacer". | Sets 0 - 0, puntos 24 - 20. "Rehacer" lo devuelve a 1 - 0. | Historia 2, esc. 4 |
| 6 | Pedir a alguien que no conoce la app que lleve un partido "al mejor de 3" hasta el final. | Lo consigue sin ayuda; sale "¡… gana el partido!" y el cronómetro se para. | CE-001, RF-017b |
| 7 | Con el partido terminado: globito → ↶ → "Deshacer". Abrir el historial. | El partido se reabre y no aparece en el historial. Al volver a ganarlo, aparece una vez. | Historia 2, esc. 7 |
| 8 | Editar equipos: blanco, amarillo y negro con logo. Pasar el negro a verde. | Números en negro con blanco y amarillo. El logo aparece con negro y desaparece al pasar a verde. | Historia 3 |
| 9 | Mirar el móvil desde 3 metros con cada color de la paleta. | Los números se leen sin esfuerzo. | CE-007 |
| 10 | ⇄ con 10 - 8 y sets 1 - 0; luego pulsar en cada mitad. | Cada equipo cambia de lado con sus datos; el punto va al equipo de esa mitad. | Historia 5 |
| 11 | Girar el móvil a horizontal y volver a vertical. | Mitades lado a lado / una encima de otra, mismos datos. | RF-018 |
| 12 | Cronómetro en marcha 10 minutos junto a un reloj. | Diferencia de 1 segundo como máximo. | CE-006 |
| 13 | A mitad de partido, cerrar la app del todo y volver a abrirla. | Todo idéntico; cronómetro pausado con el tiempo que tenía. | CE-005 |
| 14 | Bloqueo de pantalla del móvil en 30 s; dejar la app abierta 5 minutos sin tocarla (versión publicada con HTTPS). | La pantalla no se apaga. | CE-009 |
| 15 | "Reiniciar marcador" y "Nuevo partido": primero cancelar y luego confirmar. | Al cancelar no cambia nada. Al confirmar, se reinicia lo indicado en cada caso. | Historia 2, esc. 8–11 |
| 16 | Historial: borrar un partido y luego "Borrar todo". | Desaparece el elegido; después, "Todavía no hay partidos guardados". | Historia 6 |
| 17 | Modo avión y abrir la app instalada. | Funciona igual. | Supuestos |
| 18 | Recorrer todas las pantallas y diálogos. | Ningún texto en otro idioma. | CE-008 |

## Limitaciones conocidas

- Si el móvil no admite el Wake Lock (iOS anterior a 16.4, o anterior a 18.4 con la app
  instalada), la pantalla se apaga según los ajustes del móvil (research D7).
- Borrar los datos del navegador borra el historial y el partido en curso (research D3).
