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

const NOMBRE_POR_DEFECTO = { A: "Equipo 1", B: "Equipo 2" };
export const NOMBRE_CON_LOGO = "VPMadrid";
const MAX_NOMBRE = 20;

export function nombrePorDefecto(equipo) {
  return NOMBRE_POR_DEFECTO[equipo];
}

export function partidoNuevo(formato = 5) {
  return {
    formato,
    equipos: {
      A: { nombre: NOMBRE_POR_DEFECTO.A, color: "azul", logo: false },
      B: { nombre: NOMBRE_POR_DEFECTO.B, color: "rojo", logo: false },
    },
    equipoIzquierda: "A",
    puntos: [],
    rehacer: [],
    cronometro: { acumuladoMs: 0, enMarchaDesde: null },
    idHistorial: null,
  };
}

// Jugada de un set sumado a mano (RF-005b): "setA" o "setB"
const SET_A_MANO = { A: "setA", B: "setB" };

// Recorre la lista de jugadas y aplica las reglas de set y partido (RF-005, RF-006):
// el set decisivo (el número `formato`) va a 15 y el resto a 25, siempre con 2 de ventaja.
// Un set sumado a mano no toca los puntos del set en curso (RF-005b).
export function calcular(partido) {
  const puntosSet = { A: 0, B: 0 };
  const sets = { A: 0, B: 0 };
  const setsParaGanar = (partido.formato + 1) / 2;
  let ganador = null;

  for (const jugada of partido.puntos) {
    if (ganador) break;
    if (jugada === SET_A_MANO.A || jugada === SET_A_MANO.B) {
      const equipo = jugada === SET_A_MANO.A ? "A" : "B";
      sets[equipo]++;
      if (sets[equipo] === setsParaGanar) ganador = equipo;
      continue;
    }
    const equipo = jugada;
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

// Con el partido terminado no se suman más puntos ni sets (RF-006)
function anadirJugada(partido, jugada) {
  if (calcular(partido).ganador) return partido;
  return { ...partido, puntos: [...partido.puntos, jugada], rehacer: [] };
}

export function sumarPunto(partido, equipo) {
  return anadirJugada(partido, equipo);
}

export function sumarSet(partido, equipo) {
  return anadirJugada(partido, SET_A_MANO[equipo]);
}

// Deshacer y rehacer solo afectan a puntos (RF-009). Como sets y ganador se calculan
// a partir de la lista, deshacer el punto que cerró un set o el partido también los deshace.
export function deshacer(partido) {
  if (partido.puntos.length === 0) return partido;
  return {
    ...partido,
    puntos: partido.puntos.slice(0, -1),
    rehacer: [...partido.rehacer, partido.puntos.at(-1)],
  };
}

export function rehacer(partido) {
  if (partido.rehacer.length === 0) return partido;
  return {
    ...partido,
    puntos: [...partido.puntos, partido.rehacer.at(-1)],
    rehacer: partido.rehacer.slice(0, -1),
  };
}

// Nombre: sin espacios sobrantes, máximo 20 caracteres y, si queda vacío, el de por
// defecto. Color: solo de la paleta. Logo: solo con camiseta negra (RF-014 a RF-016).
// Con logo, el equipo se llama "VPMadrid"; al quitarlo, ese nombre vuelve al de por
// defecto, pero se respeta uno nuevo escrito (RF-016b).
export function editarEquipo(partido, equipo, { nombre, color, logo }) {
  const actual = partido.equipos[equipo];
  const colorValido = PALETA.some((c) => c.id === color) ? color : actual.color;
  const conLogo = Boolean(logo) && colorValido === "negro";
  let nombreLimpio = String(nombre ?? "").trim().slice(0, MAX_NOMBRE).trim();
  if (conLogo) nombreLimpio = NOMBRE_CON_LOGO;
  else if (actual.logo && nombreLimpio === NOMBRE_CON_LOGO) nombreLimpio = "";
  return {
    ...partido,
    equipos: {
      ...partido.equipos,
      [equipo]: {
        nombre: nombreLimpio || NOMBRE_POR_DEFECTO[equipo],
        color: colorValido,
        logo: conLogo,
      },
    },
  };
}

// Cronómetro: el tiempo sale del reloj del sistema, no de contar ticks (CE-006)
export function tiempoMs(crono, ahora) {
  return crono.enMarchaDesde == null ? crono.acumuladoMs : crono.acumuladoMs + ahora - crono.enMarchaDesde;
}

export function formatearTiempo(ms) {
  const segundos = Math.floor(ms / 1000);
  const minutos = Math.floor(segundos / 60);
  return `${String(minutos).padStart(2, "0")}:${String(segundos % 60).padStart(2, "0")}`;
}

export function arrancarCronometro(crono, ahora) {
  if (crono.enMarchaDesde != null) return crono;
  return { ...crono, enMarchaDesde: ahora };
}

export function pausarCronometro(crono, ahora) {
  if (crono.enMarchaDesde == null) return crono;
  return { ...crono, acumuladoMs: tiempoMs(crono, ahora), enMarchaDesde: null };
}

// Los puntos van al equipo, no al lado: cambiar de lado no toca el marcador (RF-013)
export function cambiarLado(partido) {
  return { ...partido, equipoIzquierda: otroEquipo(partido.equipoIzquierda) };
}

// Al abrir la app solo se recupera sin preguntar un partido a medias (RF-011b)
export function partidoAMedias(partido) {
  return partido.puntos.length > 0 && !calcular(partido).ganador;
}

// Tras un partido terminado, uno nuevo por defecto; sin empezar, solo cambia el formato
export function elegirFormatoInicial(partido, formato) {
  if (calcular(partido).ganador) return partidoNuevo(formato);
  return { ...partido, formato, rehacer: [] };
}

// Mantiene formato, equipos y lados (RF-010)
export function reiniciarMarcador(partido) {
  return {
    ...partido,
    puntos: [],
    rehacer: [],
    cronometro: { acumuladoMs: 0, enMarchaDesde: null },
    idHistorial: null,
  };
}
