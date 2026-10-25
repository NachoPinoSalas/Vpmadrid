// Guarda el partido en curso y el historial en el propio móvil (localStorage).
// Si algo no se puede leer, se empieza de cero en lugar de fallar.
import { partidoNuevo } from "./marcador.js";

const CLAVE_PARTIDO = "vpmadrid.partido";
const CLAVE_HISTORIAL = "vpmadrid.historial";
const VERSION = 1;

function leer(clave) {
  try {
    const texto = localStorage.getItem(clave);
    return texto ? JSON.parse(texto) : null;
  } catch {
    return null;
  }
}

function escribir(clave, valor) {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
  } catch {
    // Sin almacenamiento (modo privado, cuota llena...): la app sigue funcionando
  }
}

// Si la app se cerró con el cronómetro en marcha, suma el tramo hasta el último
// guardado y lo deja en pausa (RF-019).
export function cronometroTrasCierre(crono) {
  if (crono.enMarchaDesde == null) return crono;
  const hasta = crono.guardadoEn ?? crono.enMarchaDesde;
  return {
    acumuladoMs: crono.acumuladoMs + Math.max(0, hasta - crono.enMarchaDesde),
    enMarchaDesde: null,
    guardadoEn: crono.guardadoEn,
  };
}

export function cargarPartido() {
  const datos = leer(CLAVE_PARTIDO);
  const valido =
    datos?.version === VERSION &&
    Array.isArray(datos.puntos) &&
    Array.isArray(datos.rehacer) &&
    datos.equipos?.A &&
    datos.equipos?.B &&
    datos.cronometro;
  if (!valido) return partidoNuevo();
  const { version, ...partido } = datos;
  return { ...partido, cronometro: cronometroTrasCierre(partido.cronometro) };
}

export function guardarPartido(partido) {
  escribir(CLAVE_PARTIDO, {
    version: VERSION,
    ...partido,
    cronometro: { ...partido.cronometro, guardadoEn: Date.now() },
  });
}

export function cargarHistorial() {
  const datos = leer(CLAVE_HISTORIAL);
  return datos?.version === VERSION && Array.isArray(datos.partidos) ? datos.partidos : [];
}

export function guardarHistorial(partidos) {
  escribir(CLAVE_HISTORIAL, { version: VERSION, partidos });
}

export function anadirAlHistorial(entrada) {
  guardarHistorial([...cargarHistorial(), entrada]);
}

export function borrarDelHistorial(id) {
  guardarHistorial(cargarHistorial().filter((p) => p.id !== id));
}
