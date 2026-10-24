# Contrato de almacenamiento (`localStorage`)

Todo se guarda en el propio móvil, en dos claves. El campo `version` permite cambiar el
formato en el futuro; si una clave falta o no se puede leer, la app empieza con los valores
por defecto (partido nuevo o historial vacío) en lugar de fallar.

## `vpmadrid.partido`

Partido en curso. Se guarda tras cada cambio y al pasar la app a segundo plano.

```json
{
  "version": 1,
  "formato": 5,
  "equipos": {
    "A": { "nombre": "Equipo 1", "color": "azul", "logo": false },
    "B": { "nombre": "Equipo 2", "color": "rojo", "logo": false }
  },
  "equipoIzquierda": "A",
  "puntos": ["A", "A", "B"],
  "rehacer": [],
  "cronometro": { "acumuladoMs": 754000, "enMarchaDesde": null },
  "idHistorial": null
}
```

- Al cargar, `cronometro.enMarchaDesde` siempre se trata como `null` (el cronómetro vuelve
  pausado, RF-019). Antes de guardar al pasar a segundo plano, el tiempo en marcha se suma
  a `acumuladoMs`.
- Reglas de cada campo: [data-model.md](../data-model.md#partido-en-curso).

## `vpmadrid.historial`

```json
{
  "version": 1,
  "partidos": [
    {
      "id": "m3k9x2",
      "fecha": "2026-10-24T18:42:10.000Z",
      "nombreA": "Las Rozas",
      "nombreB": "Equipo 2",
      "setsA": 3,
      "setsB": 1
    }
  ]
}
```

- `partidos` se guarda en cualquier orden; al mostrarse se ordena por `fecha`, de la más
  reciente a la más antigua.
