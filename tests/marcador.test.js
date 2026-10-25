import { test } from "node:test";
import assert from "node:assert/strict";
import {
  partidoNuevo,
  calcular,
  sumarPunto,
  deshacer,
  rehacer,
  reiniciarMarcador,
  editarEquipo,
  tiempoMs,
  formatearTiempo,
  arrancarCronometro,
  pausarCronometro,
  cambiarLado,
} from "../js/marcador.js";
import { cronometroTrasCierre } from "../js/almacen.js";

// Partido con una lista de puntos ya jugados.
function conPuntos(lista, formato = 5) {
  return { ...partidoNuevo(formato), puntos: lista };
}

// Lista con n puntos de un equipo.
function repetir(equipo, n) {
  return Array(n).fill(equipo);
}

// Puntos para que el equipo gane un set a 25 - 0.
function setPara(equipo) {
  return repetir(equipo, 25);
}

test("partido nuevo: todo a cero en el primer set", () => {
  assert.deepEqual(calcular(partidoNuevo()), {
    puntosSet: { A: 0, B: 0 },
    sets: { A: 0, B: 0 },
    setActual: 1,
    ganador: null,
  });
});

test("25 - 23 cierra el set y los puntos vuelven a 0 - 0", () => {
  const r = calcular(conPuntos([...repetir("A", 24), ...repetir("B", 23), "A"]));
  assert.deepEqual(r.sets, { A: 1, B: 0 });
  assert.deepEqual(r.puntosSet, { A: 0, B: 0 });
  assert.equal(r.setActual, 2);
});

test("24 - 24 y un punto más: 25 - 24, el set sigue", () => {
  const r = calcular(conPuntos([...repetir("A", 24), ...repetir("B", 24), "A"]));
  assert.deepEqual(r.puntosSet, { A: 25, B: 24 });
  assert.deepEqual(r.sets, { A: 0, B: 0 });
});

test("26 - 24 cierra el set", () => {
  const r = calcular(conPuntos([...repetir("A", 24), ...repetir("B", 24), "A", "A"]));
  assert.deepEqual(r.sets, { A: 1, B: 0 });
});

test("al mejor de 5: el quinto set se cierra en 15 - 13 y no en 15 - 14", () => {
  const dosDos = [...setPara("A"), ...setPara("B"), ...setPara("A"), ...setPara("B")];
  const a1514 = calcular(conPuntos([...dosDos, ...repetir("B", 14), ...repetir("A", 15)]));
  assert.deepEqual(a1514.puntosSet, { A: 15, B: 14 });
  assert.equal(a1514.ganador, null);
  assert.equal(a1514.setActual, 5);
  const a1513 = calcular(conPuntos([...dosDos, ...repetir("B", 13), ...repetir("A", 15)]));
  assert.equal(a1513.ganador, "A");
  assert.deepEqual(a1513.sets, { A: 3, B: 2 });
});

test("al mejor de 3: el tercer set va a 15", () => {
  const unoUno = [...setPara("A"), ...setPara("B")];
  const r = calcular(conPuntos([...unoUno, ...repetir("B", 15)], 3));
  assert.equal(r.ganador, "B");
  assert.deepEqual(r.sets, { A: 1, B: 2 });
});

test("al mejor de 3: los dos primeros sets van a 25", () => {
  const r = calcular(conPuntos(repetir("A", 15), 3));
  assert.deepEqual(r.puntosSet, { A: 15, B: 0 });
  assert.deepEqual(r.sets, { A: 0, B: 0 });
});

test("al mejor de 5: gana quien llega a 3 sets", () => {
  const r = calcular(conPuntos([...setPara("A"), ...setPara("A"), ...setPara("A")]));
  assert.equal(r.ganador, "A");
  assert.deepEqual(r.sets, { A: 3, B: 0 });
  assert.equal(r.setActual, 3);
});

test("al mejor de 3: gana quien llega a 2 sets", () => {
  const r = calcular(conPuntos([...setPara("B"), ...setPara("B")], 3));
  assert.equal(r.ganador, "B");
  assert.equal(r.setActual, 2);
});

test("los puntos posteriores a un ganador se ignoran", () => {
  const r = calcular(conPuntos([...setPara("A"), ...setPara("A"), ...setPara("A"), "B"]));
  assert.equal(r.ganador, "A");
  assert.deepEqual(r.puntosSet, { A: 0, B: 0 });
});

// Historia 1: sumar puntos

test("sumarPunto añade el punto al final y vacía rehacer", () => {
  const antes = { ...conPuntos(["A"]), rehacer: ["B"] };
  const despues = sumarPunto(antes, "B");
  assert.deepEqual(despues.puntos, ["A", "B"]);
  assert.deepEqual(despues.rehacer, []);
});

test("sumarPunto no modifica el partido original", () => {
  const antes = conPuntos(["A"]);
  sumarPunto(antes, "B");
  assert.deepEqual(antes.puntos, ["A"]);
});

test("sumarPunto con el partido terminado no cambia nada", () => {
  const terminado = conPuntos([...setPara("A"), ...setPara("A"), ...setPara("A")]);
  assert.equal(sumarPunto(terminado, "B"), terminado);
});

// Historia 2: deshacer, rehacer y reiniciar

test("deshacer quita el último punto y lo pasa a rehacer", () => {
  const r = deshacer(conPuntos(["A", "B"]));
  assert.deepEqual(r.puntos, ["A"]);
  assert.deepEqual(r.rehacer, ["B"]);
});

test("deshacer sin puntos no cambia nada", () => {
  const vacio = partidoNuevo();
  assert.equal(deshacer(vacio), vacio);
});

test("deshacer el punto que cerró un set devuelve el set y los puntos anteriores", () => {
  const r = calcular(deshacer(conPuntos([...repetir("A", 24), ...repetir("B", 20), "A"])));
  assert.deepEqual(r.sets, { A: 0, B: 0 });
  assert.deepEqual(r.puntosSet, { A: 24, B: 20 });
});

test("deshacer el punto que cerró el partido quita el ganador", () => {
  const terminado = conPuntos([...setPara("A"), ...setPara("A"), ...setPara("A")]);
  assert.equal(calcular(terminado).ganador, "A");
  assert.equal(calcular(deshacer(terminado)).ganador, null);
});

test("rehacer vuelve a aplicar el punto deshecho", () => {
  const r = rehacer(deshacer(conPuntos(["A", "B"])));
  assert.deepEqual(r.puntos, ["A", "B"]);
  assert.deepEqual(r.rehacer, []);
});

test("rehacer sin nada que rehacer no cambia nada", () => {
  const p = conPuntos(["A"]);
  assert.equal(rehacer(p), p);
});

test("sumar después de deshacer vacía rehacer", () => {
  const r = sumarPunto(deshacer(conPuntos(["A", "B"])), "A");
  assert.deepEqual(r.puntos, ["A", "A"]);
  assert.deepEqual(r.rehacer, []);
});

test("reiniciarMarcador pone a cero puntos y cronómetro y mantiene equipos, formato y lados", () => {
  const p = {
    ...conPuntos(["A", "B"], 3),
    rehacer: ["A"],
    equipoIzquierda: "B",
    cronometro: { acumuladoMs: 5000, enMarchaDesde: 1000 },
    idHistorial: "abc",
  };
  p.equipos = { ...p.equipos, A: { nombre: "Las Rozas", color: "verde", logo: false } };
  const r = reiniciarMarcador(p);
  assert.deepEqual(r.puntos, []);
  assert.deepEqual(r.rehacer, []);
  assert.deepEqual(r.cronometro, { acumuladoMs: 0, enMarchaDesde: null });
  assert.equal(r.idHistorial, null);
  assert.equal(r.formato, 3);
  assert.equal(r.equipoIzquierda, "B");
  assert.equal(r.equipos.A.nombre, "Las Rozas");
});

test("partidoNuevo(3) es al mejor de 3", () => {
  assert.equal(partidoNuevo(3).formato, 3);
});

// Historia 3: personalizar equipos

const datosA = (p) => p.equipos.A;

test("editarEquipo recorta los espacios del nombre", () => {
  const r = editarEquipo(partidoNuevo(), "A", { nombre: "  Las Rozas  ", color: "azul", logo: false });
  assert.equal(datosA(r).nombre, "Las Rozas");
});

test("editarEquipo corta el nombre a 20 caracteres", () => {
  const r = editarEquipo(partidoNuevo(), "A", { nombre: "A".repeat(25), color: "azul", logo: false });
  assert.equal(datosA(r).nombre, "A".repeat(20));
});

test("un nombre vacío vuelve al nombre por defecto", () => {
  const p = editarEquipo(partidoNuevo(), "A", { nombre: "Las Rozas", color: "azul", logo: false });
  assert.equal(datosA(editarEquipo(p, "A", { nombre: "   ", color: "azul", logo: false })).nombre, "Equipo 1");
  assert.equal(editarEquipo(p, "B", { nombre: "", color: "rojo", logo: false }).equipos.B.nombre, "Equipo 2");
});

test("un color que no está en la paleta se rechaza y se mantiene el anterior", () => {
  const r = editarEquipo(partidoNuevo(), "A", { nombre: "Equipo 1", color: "celeste", logo: false });
  assert.equal(datosA(r).color, "azul");
});

test("el logo solo se activa con camiseta negra", () => {
  const conVerde = editarEquipo(partidoNuevo(), "A", { nombre: "Equipo 1", color: "verde", logo: true });
  assert.equal(datosA(conVerde).logo, false);
  const conNegro = editarEquipo(partidoNuevo(), "A", { nombre: "Equipo 1", color: "negro", logo: true });
  assert.equal(datosA(conNegro).logo, true);
});

test("pasar de negro con logo a verde quita el logo", () => {
  const conNegro = editarEquipo(partidoNuevo(), "A", { nombre: "Equipo 1", color: "negro", logo: true });
  const conVerde = editarEquipo(conNegro, "A", { nombre: "Equipo 1", color: "verde", logo: true });
  assert.equal(datosA(conVerde).logo, false);
});

test("editarEquipo no toca al otro equipo ni el marcador", () => {
  const p = conPuntos(["A", "B"]);
  const r = editarEquipo(p, "A", { nombre: "Las Rozas", color: "verde", logo: false });
  assert.deepEqual(r.equipos.B, p.equipos.B);
  assert.deepEqual(r.puntos, ["A", "B"]);
});

// Historia 4: cronómetro

test("tiempoMs suma el tramo en marcha", () => {
  assert.equal(tiempoMs({ acumuladoMs: 5000, enMarchaDesde: 1000 }, 4000), 8000);
});

test("tiempoMs parado devuelve el acumulado", () => {
  assert.equal(tiempoMs({ acumuladoMs: 5000, enMarchaDesde: null }, 4000), 5000);
});

test("formatearTiempo en mm:ss, sin pasar a horas", () => {
  assert.equal(formatearTiempo(0), "00:00");
  assert.equal(formatearTiempo(754000), "12:34");
  assert.equal(formatearTiempo(4512000), "75:12");
  assert.equal(formatearTiempo(59999), "00:59");
});

test("pausarCronometro suma el tramo en marcha y lo deja parado", () => {
  assert.deepEqual(pausarCronometro({ acumuladoMs: 5000, enMarchaDesde: 1000 }, 4000), {
    acumuladoMs: 8000,
    enMarchaDesde: null,
  });
});

test("arrancarCronometro anota cuándo arranca", () => {
  assert.deepEqual(arrancarCronometro({ acumuladoMs: 5000, enMarchaDesde: null }, 4000), {
    acumuladoMs: 5000,
    enMarchaDesde: 4000,
  });
});

test("cronometroTrasCierre suma hasta el último guardado y lo deja en pausa", () => {
  const r = cronometroTrasCierre({ acumuladoMs: 5000, enMarchaDesde: 1000, guardadoEn: 61000 });
  assert.equal(r.acumuladoMs, 65000);
  assert.equal(r.enMarchaDesde, null);
});

test("cronometroTrasCierre parado no cambia nada", () => {
  const crono = { acumuladoMs: 5000, enMarchaDesde: null, guardadoEn: 61000 };
  assert.deepEqual(cronometroTrasCierre(crono), crono);
});

// Historia 5: cambiar de lado

test("cambiarLado alterna el equipo de la izquierda", () => {
  const una = cambiarLado(partidoNuevo());
  assert.equal(una.equipoIzquierda, "B");
  assert.equal(cambiarLado(una).equipoIzquierda, "A");
});

test("cambiarLado no altera puntos ni sets de cada equipo", () => {
  const p = conPuntos([...setPara("A"), ...repetir("A", 10), ...repetir("B", 8)]);
  const antes = calcular(p);
  const despues = calcular(cambiarLado(p));
  assert.deepEqual(despues.puntosSet, antes.puntosSet);
  assert.deepEqual(despues.sets, antes.sets);
});
