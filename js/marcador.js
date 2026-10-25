// Reglas del marcador: funciones puras, sin pantalla ni almacenamiento.
// Ninguna modifica el partido recibido; todas devuelven uno nuevo.

// Paleta fija de camisetas (RF-015). textoOscuro: el número va en negro (RF-003).
export const PALETA = [
  { id: "blanco", nombre: "Blanco", fondo: "#FFFFFF", textoOscuro: true },
  { id: "amarillo", nombre: "Amarillo", fondo: "#FFD100", textoOscuro: true },
  { id: "negro", nombre: "Negro", fondo: "#000000", textoOscuro: false },
  { id: "rojo", nombre: "Rojo", fondo: "#D32F2F", textoOscuro: false },
  { id: "granate", nombre: "Granate", fondo: "#7B1E2B", textoOscuro: false },
  { id: "naranja", nombre: "Naranja", fondo: "#E65100", textoOscuro: false },
  { id: "verde", nombre: "Verde", fondo: "#2E7D32", textoOscuro: false },
  { id: "azul", nombre: "Azul", fondo: "#1565C0", textoOscuro: false },
  { id: "azulMarino", nombre: "Azul marino", fondo: "#0D1B4C", textoOscuro: false },
  { id: "morado", nombre: "Morado", fondo: "#6A1B9A", textoOscuro: false },
];

export function colorNumeroOscuro(color) {
  return PALETA.some((c) => c.id === color && c.textoOscuro);
}

export function otroEquipo(equipo) {
  return equipo === "A" ? "B" : "A";
}

export function partidoNuevo(formato = 5) {
  return {
    formato,
    equipos: {
      A: { nombre: "Equipo 1", color: "azul", logo: false },
      B: { nombre: "Equipo 2", color: "rojo", logo: false },
    },
    equipoIzquierda: "A",
    puntos: [],
    rehacer: [],
    cronometro: { acumuladoMs: 0, enMarchaDesde: null },
    idHistorial: null,
  };
}

// Recorre la lista de puntos y aplica las reglas de set y partido (RF-005, RF-006):
// el set decisivo (el número `formato`) va a 15 y el resto a 25, siempre con 2 de ventaja.
export function calcular(partido) {
  const puntosSet = { A: 0, B: 0 };
  const sets = { A: 0, B: 0 };
  const setsParaGanar = (partido.formato + 1) / 2;
  let ganador = null;

  for (const equipo of partido.puntos) {
    if (ganador) break;
    puntosSet[equipo]++;
    const objetivo = sets.A + sets.B + 1 === partido.formato ? 15 : 25;
    const ventaja = puntosSet[equipo] - puntosSet[otroEquipo(equipo)];
    if (puntosSet[equipo] >= objetivo && ventaja >= 2) {
      sets[equipo]++;
      puntosSet.A = 0;
      puntosSet.B = 0;
      if (sets[equipo] === setsParaGanar) ganador = equipo;
    }
  }

  // Con el partido terminado, el set actual es el último que se jugó
  const setActual = sets.A + sets.B + (ganador ? 0 : 1);
  return { puntosSet, sets, setActual, ganador };
}

// Con el partido terminado no se suman más puntos (RF-006)
export function sumarPunto(partido, equipo) {
  if (calcular(partido).ganador) return partido;
  return { ...partido, puntos: [...partido.puntos, equipo], rehacer: [] };
}
