import { test } from "node:test";
import assert from "node:assert/strict";
import { partidoNuevo, calcular, sumarPunto } from "../js/marcador.js";

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
