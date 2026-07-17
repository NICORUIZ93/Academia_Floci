// Scope, closures y el modelo de ejecución (Módulo 2).
// Ejecutar: node closures-scope.js

// Un closure es una función que "recuerda" las variables de su scope léxico
// (donde fue DEFINIDA), incluso después de que ese scope ya terminó de ejecutarse.
function crearContador() {
  let cuenta = 0; // esta variable vive en el closure de las funciones de abajo

  return {
    incrementar() {
      cuenta += 1;
      return cuenta;
    },
    valorActual() {
      return cuenta;
    },
  };
}

const contadorA = crearContador();
const contadorB = crearContador();

contadorA.incrementar();
contadorA.incrementar();
contadorB.incrementar();

// Cada llamada a crearContador() crea un scope léxico nuevo e independiente:
// contadorA y contadorB NO comparten la misma variable `cuenta`.
console.log('Contador A:', contadorA.valorActual()); // 2
console.log('Contador B:', contadorB.valorActual()); // 1

// Error clásico de closures en loops con `var` (function-scoped, no block-scoped):
const funcionesVar = [];
for (var i = 0; i < 3; i++) {
  funcionesVar.push(() => i); // las tres funciones comparten la MISMA `i`
}
console.log('Con var:', funcionesVar.map((fn) => fn())); // [3, 3, 3]

// Con `let` (block-scoped), cada iteración del loop crea un binding nuevo de `i`:
const funcionesLet = [];
for (let j = 0; j < 3; j++) {
  funcionesLet.push(() => j);
}
console.log('Con let:', funcionesLet.map((fn) => fn())); // [0, 1, 2]
