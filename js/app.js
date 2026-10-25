// Conecta la pantalla con las reglas del marcador y el almacenamiento.
import { PALETA, calcular, colorNumeroOscuro, otroEquipo, sumarPunto } from "./marcador.js";
import { anadirAlHistorial, cargarPartido, guardarPartido } from "./almacen.js";

let partido = cargarPartido();

const LADOS = ["izquierda", "derecha"];
const mitades = {
  izquierda: document.getElementById("mitad-izquierda"),
  derecha: document.getElementById("mitad-derecha"),
};
const dialogoFin = document.getElementById("dialogo-fin");

function equipoEn(lado) {
  return lado === "izquierda" ? partido.equipoIzquierda : otroEquipo(partido.equipoIzquierda);
}

function fondoDe(color) {
  return PALETA.find((c) => c.id === color)?.fondo ?? "#000000";
}

function render() {
  const { puntosSet, sets } = calcular(partido);
  for (const lado of LADOS) {
    const equipo = equipoEn(lado);
    const { nombre, color } = partido.equipos[equipo];
    const fondo = fondoDe(color);
    const oscuro = colorNumeroOscuro(color);

    const mitad = mitades[lado];
    mitad.style.setProperty("--fondo", fondo);
    mitad.style.setProperty("--texto", oscuro ? "#000000" : "#FFFFFF");
    mitad.querySelector(".nombre-equipo").textContent = nombre;
    mitad.querySelector(".numero-puntos").textContent = puntosSet[equipo];

    const numeroSets = document.getElementById(`sets-${lado}`);
    numeroSets.textContent = sets[equipo];
    numeroSets.style.color = oscuro ? "#000000" : fondo;
  }
}

// Al terminar el partido: se guarda en el historial, se para el cronómetro
// (RF-017b) y se anuncia el ganador (RF-006).
function terminarPartido({ ganador, sets }) {
  const entrada = {
    id: Date.now().toString(36),
    fecha: new Date().toISOString(),
    nombreA: partido.equipos.A.nombre,
    nombreB: partido.equipos.B.nombre,
    setsA: sets.A,
    setsB: sets.B,
  };
  anadirAlHistorial(entrada);

  const crono = partido.cronometro;
  const acumuladoMs =
    crono.enMarchaDesde == null ? crono.acumuladoMs : crono.acumuladoMs + Date.now() - crono.enMarchaDesde;
  partido = { ...partido, idHistorial: entrada.id, cronometro: { acumuladoMs, enMarchaDesde: null } };

  dialogoFin.querySelector("h2").textContent = `¡${partido.equipos[ganador].nombre} gana el partido!`;
  dialogoFin.querySelector("p").textContent =
    `${sets[ganador]} - ${sets[otroEquipo(ganador)]} en sets. Guardado en el historial.`;
  dialogoFin.showModal();
}

// Punto único por el que pasa cualquier cambio del partido
function aplicar(cambio) {
  const antes = calcular(partido);
  partido = cambio(partido);
  const despues = calcular(partido);
  if (!antes.ganador && despues.ganador) terminarPartido(despues);
  guardarPartido(partido);
  render();
}

for (const lado of LADOS) {
  mitades[lado].addEventListener("pointerdown", () => {
    aplicar((p) => sumarPunto(p, equipoEn(lado)));
  });
}

// Guardar al salir o cambiar de app (RF-019)
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") guardarPartido(partido);
});
window.addEventListener("pagehide", () => guardarPartido(partido));

render();
