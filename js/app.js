// Conecta la pantalla con las reglas del marcador y el almacenamiento.
import {
  PALETA,
  arrancarCronometro,
  calcular,
  cambiarLado,
  colorNumeroOscuro,
  deshacer,
  editarEquipo,
  formatearTiempo,
  otroEquipo,
  partidoNuevo,
  pausarCronometro,
  rehacer,
  reiniciarMarcador,
  sumarPunto,
  tiempoMs,
} from "./marcador.js";
import {
  anadirAlHistorial,
  borrarDelHistorial,
  cargarHistorial,
  cargarPartido,
  guardarHistorial,
  guardarPartido,
} from "./almacen.js";

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
    const { nombre, color, logo } = partido.equipos[equipo];
    const fondo = fondoDe(color);
    const oscuro = colorNumeroOscuro(color);

    const mitad = mitades[lado];
    mitad.style.setProperty("--fondo", fondo);
    mitad.style.setProperty("--texto", oscuro ? "#000000" : "#FFFFFF");
    mitad.querySelector(".nombre-equipo").textContent = nombre;
    mitad.querySelector(".numero-puntos").textContent = puntosSet[equipo];
    mitad.querySelector(".logo").hidden = !logo;

    const numeroSets = document.getElementById(`sets-${lado}`);
    numeroSets.textContent = sets[equipo];
    numeroSets.style.color = oscuro ? "#000000" : fondo;
  }
  pintarCronometro();
}

const botonPlay = document.getElementById("boton-play");
const textoCronometro = document.getElementById("cronometro");

function pintarCronometro() {
  const crono = partido.cronometro;
  const enMarcha = crono.enMarchaDesde != null;
  textoCronometro.textContent = formatearTiempo(tiempoMs(crono, Date.now()));
  botonPlay.textContent = enMarcha ? "❚❚" : "▶";
  botonPlay.setAttribute("aria-label", enMarcha ? "Pausar cronómetro" : "Iniciar cronómetro");
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

  partido = {
    ...partido,
    idHistorial: entrada.id,
    cronometro: pausarCronometro(partido.cronometro, Date.now()),
  };

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
  // Deshacer reabre el partido terminado y lo quita del historial (RF-009).
  // Reiniciar deja idHistorial vacío, así que el partido guardado se queda.
  if (antes.ganador && !despues.ganador && partido.idHistorial) {
    borrarDelHistorial(partido.idHistorial);
    partido = { ...partido, idHistorial: null };
  }
  guardarPartido(partido);
  render();
}

for (const lado of LADOS) {
  mitades[lado].addEventListener("pointerdown", () => {
    // Con el globito o un menú abierto, el toque solo los cierra
    if (globitoAbierto()) {
      cerrarGlobito();
      return;
    }
    aplicar((p) => sumarPunto(p, equipoEn(lado)));
  });
}

// Globito (RF-008)
const globito = document.getElementById("globito");
const botonesGlobito = document.getElementById("globito-botones");
const menus = {
  partido: document.getElementById("menu-partido"),
  deshacer: document.getElementById("menu-deshacer"),
};

function globitoAbierto() {
  return !botonesGlobito.hidden;
}

function cerrarGlobito() {
  botonesGlobito.hidden = true;
  for (const menu of Object.values(menus)) menu.hidden = true;
}

function alternarMenu(nombre) {
  const abrir = menus[nombre].hidden;
  for (const menu of Object.values(menus)) menu.hidden = true;
  menus[nombre].hidden = !abrir;
}

document.getElementById("boton-globito").addEventListener("click", () => {
  if (globitoAbierto()) cerrarGlobito();
  else botonesGlobito.hidden = false;
});

document.getElementById("boton-partido").addEventListener("click", () => alternarMenu("partido"));

document.getElementById("boton-deshacer").addEventListener("click", () => {
  document.getElementById("opcion-deshacer").disabled = partido.puntos.length === 0;
  document.getElementById("opcion-rehacer").disabled = partido.rehacer.length === 0;
  alternarMenu("deshacer");
});

// Pulsar fuera del globito lo cierra
document.addEventListener("pointerdown", (evento) => {
  if (globitoAbierto() && !globito.contains(evento.target)) cerrarGlobito();
});

document.getElementById("opcion-deshacer").addEventListener("click", () => {
  cerrarGlobito();
  aplicar(deshacer);
});

document.getElementById("opcion-rehacer").addEventListener("click", () => {
  cerrarGlobito();
  aplicar(rehacer);
});

document.getElementById("boton-lado").addEventListener("click", () => {
  cerrarGlobito();
  aplicar(cambiarLado);
});

// Abre un diálogo de confirmación y llama a alConfirmar si se pulsa el botón "confirmar"
function confirmar(dialogo, alConfirmar) {
  dialogo.returnValue = "";
  dialogo.addEventListener(
    "close",
    () => {
      if (dialogo.returnValue === "confirmar") alConfirmar();
    },
    { once: true }
  );
  dialogo.showModal();
}

const dialogoReiniciar = document.getElementById("dialogo-reiniciar");
const dialogoNuevo = document.getElementById("dialogo-nuevo");

document.getElementById("opcion-reiniciar").addEventListener("click", () => {
  cerrarGlobito();
  confirmar(dialogoReiniciar, () => aplicar(reiniciarMarcador));
});

document.getElementById("opcion-nuevo").addEventListener("click", () => {
  cerrarGlobito();
  dialogoNuevo.querySelector('input[value="5"]').checked = true;
  confirmar(dialogoNuevo, () => {
    const formato = Number(dialogoNuevo.querySelector('input[name="formato"]:checked').value);
    aplicar(() => partidoNuevo(formato));
  });
});

// Editar equipo (RF-014 a RF-016)
const dialogoEquipo = document.getElementById("dialogo-equipo");
const campoNombre = document.getElementById("campo-nombre");
const campoLogo = document.getElementById("campo-logo");
const opcionLogo = document.getElementById("opcion-logo");
const paleta = document.getElementById("paleta");

for (const { id, nombre, fondo } of PALETA) {
  const etiqueta = document.createElement("label");
  const radio = document.createElement("input");
  radio.type = "radio";
  radio.name = "color";
  radio.value = id;
  const muestra = document.createElement("span");
  muestra.className = "muestra";
  muestra.style.background = fondo;
  etiqueta.append(radio, muestra, nombre);
  paleta.append(etiqueta);
}

function colorElegido() {
  return paleta.querySelector('input[name="color"]:checked')?.value;
}

// La opción del logo solo aparece con camiseta negra
function actualizarOpcionLogo() {
  opcionLogo.hidden = colorElegido() !== "negro";
  if (opcionLogo.hidden) campoLogo.checked = false;
}

paleta.addEventListener("change", actualizarOpcionLogo);

function abrirEdicion(equipo) {
  const { nombre, color, logo } = partido.equipos[equipo];
  campoNombre.value = nombre;
  paleta.querySelector(`input[value="${color}"]`).checked = true;
  campoLogo.checked = logo;
  actualizarOpcionLogo();
  confirmar(dialogoEquipo, () => {
    const valores = { nombre: campoNombre.value, color: colorElegido(), logo: campoLogo.checked };
    aplicar((p) => editarEquipo(p, equipo, valores));
  });
}

for (const lado of LADOS) {
  const lapiz = mitades[lado].querySelector(".lapiz");
  // El lápiz nunca suma un punto
  lapiz.addEventListener("pointerdown", (evento) => evento.stopPropagation());
  lapiz.addEventListener("click", () => {
    cerrarGlobito();
    abrirEdicion(equipoEn(lado));
  });
}

// Historial (RF-021, RF-022)
const dialogoHistorial = document.getElementById("dialogo-historial");
const listaHistorial = document.getElementById("lista-historial");
const historialVacio = document.getElementById("historial-vacio");
const botonBorrarTodo = document.getElementById("boton-borrar-todo");
const dialogoBorrarUno = document.getElementById("dialogo-borrar-uno");
const dialogoBorrarTodo = document.getElementById("dialogo-borrar-todo");

function textoPartidoGuardado({ fecha, nombreA, setsA, setsB, nombreB }) {
  const dia = new Date(fecha).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
  return `${dia} · ${nombreA} ${setsA} - ${setsB} ${nombreB}`;
}

// Si se borra el partido actual del historial, ya no hay entrada que quitar al deshacer
function olvidarEntradaActual(ids) {
  if (partido.idHistorial && ids.includes(partido.idHistorial)) {
    aplicar((p) => ({ ...p, idHistorial: null }));
  }
}

function pintarHistorial() {
  const partidos = cargarHistorial().sort((a, b) => b.fecha.localeCompare(a.fecha));
  listaHistorial.replaceChildren(
    ...partidos.map((guardado) => {
      const fila = document.createElement("li");
      const texto = document.createElement("span");
      texto.textContent = textoPartidoGuardado(guardado);
      const borrar = document.createElement("button");
      borrar.type = "button";
      borrar.className = "secundario";
      borrar.textContent = "Borrar";
      borrar.addEventListener("click", () => {
        document.getElementById("texto-borrar-uno").textContent = texto.textContent;
        confirmar(dialogoBorrarUno, () => {
          borrarDelHistorial(guardado.id);
          olvidarEntradaActual([guardado.id]);
          pintarHistorial();
        });
      });
      fila.append(texto, borrar);
      return fila;
    })
  );
  historialVacio.hidden = partidos.length > 0;
  botonBorrarTodo.hidden = partidos.length === 0;
}

document.getElementById("boton-historial").addEventListener("click", () => {
  cerrarGlobito();
  pintarHistorial();
  dialogoHistorial.showModal();
});

botonBorrarTodo.addEventListener("click", () => {
  confirmar(dialogoBorrarTodo, () => {
    olvidarEntradaActual(cargarHistorial().map((p) => p.id));
    guardarHistorial([]);
    pintarHistorial();
  });
});

// Cronómetro (RF-017): play alterna entre arrancar y pausar; reiniciar sin confirmación
botonPlay.addEventListener("click", () => {
  const ahora = Date.now();
  aplicar((p) => ({
    ...p,
    cronometro:
      p.cronometro.enMarchaDesde == null
        ? arrancarCronometro(p.cronometro, ahora)
        : pausarCronometro(p.cronometro, ahora),
  }));
});

document.getElementById("boton-reiniciar-crono").addEventListener("click", () => {
  aplicar((p) => ({ ...p, cronometro: { acumuladoMs: 0, enMarchaDesde: null } }));
});

setInterval(pintarCronometro, 250);

// Pantalla siempre encendida (RF-019b). El navegador suelta el bloqueo al ocultarse
// la app, así que se pide de nuevo al volver. Si el móvil no lo admite, se sigue sin él.
async function mantenerPantallaEncendida() {
  try {
    if ("wakeLock" in navigator && document.visibilityState === "visible") {
      await navigator.wakeLock.request("screen");
    }
  } catch {
    // Sin permiso o sin soporte: la pantalla sigue los ajustes del móvil
  }
}

// Guardar al salir o cambiar de app (RF-019). Cambiar de app no pausa el
// cronómetro: sigue contando y al volver se repinta con el tiempo real.
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    guardarPartido(partido);
  } else {
    pintarCronometro();
    mantenerPantallaEncendida();
  }
});
window.addEventListener("pagehide", () => guardarPartido(partido));

// Funcionar sin conexión
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}

render();
mantenerPantallaEncendida();
