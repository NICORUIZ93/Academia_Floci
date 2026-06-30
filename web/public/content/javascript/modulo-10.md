## Debounce vs throttle

Ambos limitan la frecuencia de ejecución, pero de forma distinta:

```js
function debounce(fn, ms) { // espera a que pare la actividad
  let t;
  return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}

function throttle(fn, ms) { // ejecuta como máximo una vez cada ms
  let bloqueado = false;
  return (...a) => {
    if (bloqueado) return;
    fn(...a);
    bloqueado = true;
    setTimeout(() => bloqueado = false, ms);
  };
}
```

`debounce` es ideal para un buscador (espera a que el usuario deje de teclear). `throttle` es ideal para scroll/resize (necesitas reaccionar periódicamente, no solo al final).

## Memoización

```js
function memoize(fn) {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (!cache.has(key)) cache.set(key, fn(...args));
    return cache.get(key);
  };
}

const fibMemo = memoize(function fib(n) {
  return n <= 1 ? n : fibMemo(n - 1) + fibMemo(n - 2);
});
```

Sin memoización, `fibonacci(35)` recalcula los mismos subproblemas millones de veces — con memoización, cada subproblema se calcula una sola vez.

## Web Workers

```js
// worker.js
self.onmessage = (e) => {
  const resultado = ordenarMillonDeNumeros(e.data);
  self.postMessage(resultado);
};

// main.js
const worker = new Worker("worker.js");
worker.postMessage(numerosSinOrdenar);
worker.onmessage = (e) => console.log("ordenado:", e.data);
```

El trabajo pesado corre en otro hilo — la UI principal nunca se congela. No puedes acceder al DOM desde un worker, solo intercambiar datos serializables.
