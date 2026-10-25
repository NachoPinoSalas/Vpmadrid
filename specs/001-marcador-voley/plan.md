# Plan de implementación: Marcador de voley vpmadrid v0

**Rama**: `001-marcador-voley` | **Fecha**: 2026-10-24 | **Spec**: [spec.md](spec.md)

**Entrada**: especificación de `specs/001-marcador-voley/spec.md`

## Resumen

Marcador de voley para móvil: pantalla dividida en dos equipos, se pulsa para sumar puntos,
y la app aplica las reglas oficiales de set y partido (al mejor de 3 o de 5). Incluye
cronómetro, deshacer y rehacer, personalización de equipos (nombre, color, logo VPMadrid),
cambio de lado e historial de partidos terminados.

Enfoque técnico: una **aplicación web instalable** (PWA) en HTML, CSS y JavaScript sin
frameworks ni compilación, que funciona sin conexión y guarda los datos en el móvil. El
marcador se calcula a partir de la lista de puntos sumados, así que deshacer y rehacer son
triviales y siempre coherentes ([research.md](research.md), D4).

## Contexto técnico

**Lenguaje/versión**: HTML5, CSS3, JavaScript (ES2022, módulos nativos del navegador)

**Dependencias principales**: ninguna. Solo para desarrollo: `npx serve` como servidor local

**Almacenamiento**: `localStorage` del navegador ([contracts/almacenamiento.md](contracts/almacenamiento.md))

**Pruebas**: `node --test` (incluido en Node.js 18+) para las reglas; comprobaciones manuales
de [quickstart.md](quickstart.md) para todo lo demás

**Plataforma objetivo**: navegadores de móvil: Chrome para Android y Safari para iPhone
(iOS 16.4+). Instalable en la pantalla de inicio

**Tipo de proyecto**: aplicación web estática (PWA), una sola pantalla

**Objetivos de rendimiento**: cada toque se refleja al instante (CE-002); cronómetro con un
desfase máximo de 1 s cada 10 min (CE-006)

**Restricciones**: funciona sin conexión; pantalla siempre encendida en primer plano
(Wake Lock, requiere HTTPS); todos los textos en español de España; sin servidor ni cuentas

**Escala/alcance**: 1 usuario por móvil, 1 pantalla y 7 diálogos, historial de hasta unos
cientos de partidos

## Comprobación de la constitución

*PUERTA: debe superarse antes de la fase 0 y volver a comprobarse tras la fase 1.*

| Principio | Comprobación | Antes de la fase 0 | Tras la fase 1 |
|---|---|---|---|
| I. Simplicidad ante todo | Sin frameworks, sin compilación, sin servidor, sin dependencias de ejecución. Una sola fuente de verdad (lista de puntos). En cada decisión de research.md consta la alternativa más compleja que se descartó. | ✅ | ✅ |
| II. Español de España | Todos los textos de la interfaz están fijados en [contracts/ui.md](contracts/ui.md). Documentación en español. Identificadores del código en español (`sumarPunto`, `partido`...). | ✅ | ✅ |
| III. Cero alcance fantasma | Cada elemento de [contracts/ui.md](contracts/ui.md) remite a una HU, un RF o una aclaración. Elementos que no son una HU literal pero sí están en la spec: el service worker (funcionar sin conexión, Supuestos), la instalación en la pantalla de inicio con manifest e iconos (Supuestos, aclaración del 2026-10-25), el diálogo de fin de partido ("anunciar el ganador", RF-006) y el botón "Historial" del globito (RF-008, RF-021). Ningún otro extra. | ✅ | ✅ |
| IV. Verificable por una persona no técnica | Cada CE tiene su comprobación manual en [quickstart.md](quickstart.md), sección 2. Las pruebas automáticas son un apoyo, no sustituyen esas comprobaciones. | ✅ | ✅ |

Resultado: **se supera** sin infracciones; la tabla de complejidad queda vacía.

## Estructura del proyecto

### Documentación (esta funcionalidad)

```text
specs/001-marcador-voley/
├── spec.md              # Especificación
├── plan.md              # Este archivo
├── research.md          # Fase 0: decisiones técnicas
├── data-model.md        # Fase 1: datos, reglas y estados
├── quickstart.md        # Fase 1: cómo arrancar y validar
├── contracts/
│   ├── ui.md            # Pantalla, botones y textos exactos
│   ├── almacenamiento.md# Formato de lo que se guarda en el móvil
│   └── marcador.md      # Funciones del módulo de reglas
├── checklists/
│   └── requirements.md
└── tasks.md             # Fase 2 (/speckit-tasks, aún no creado)
```

### Código fuente (raíz del repositorio)

```text
index.html               # La única pantalla y sus diálogos
manifest.webmanifest     # Nombre, iconos y colores para instalar la app
sw.js                    # Service worker: caché para funcionar sin conexión
css/
└── estilos.css          # Diseño, orientación vertical/horizontal, paleta
js/
├── marcador.js          # Reglas puras: puntos, sets, ganador, deshacer (sin pantalla)
├── almacen.js           # Leer/guardar partido e historial en localStorage
└── app.js               # Conecta la pantalla con las reglas: toques, diálogos,
                         # cronómetro, Wake Lock, historial
assets/
├── logo-vpmadrid.png    # Logo original (fondo blanco), solo como referencia
├── logo-vpmadrid-transparente.png  # Logo que usa la app (fondo transparente)
├── icono-192.png        # Iconos de la app instalada
└── icono-512.png
tests/
└── marcador.test.js     # Pruebas de las reglas con node --test
```

**Decisión de estructura**: proyecto único y estático en la raíz, sin carpetas `src/` ni
separación frontend/backend, porque no hay backend. Las reglas (`marcador.js`) van aparte
de la pantalla (`app.js`) solo para poder probarlas con `node --test`.

## Seguimiento de complejidad

No hay infracciones de la constitución que justificar.
