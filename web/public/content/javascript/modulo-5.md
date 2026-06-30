## El Event Loop, en una frase

JavaScript ejecuta un único hilo: vacía el call stack, luego procesa todas las microtasks pendientes (promesas), y solo después procesa una macrotask (setTimeout, eventos de I/O).

```js
console.log("1");
setTimeout(() => console.log("2 (macrotask)"), 0);
Promise.resolve().then(() => console.log("3 (microtask)"));
console.log("4");
// Orden real: 1, 4, 3, 2
```

Las microtasks (promesas) siempre se vacían por completo antes de pasar a la siguiente macrotask, sin importar que el `setTimeout` tenga delay `0`.

## Promesas

Una promesa representa un valor que estará disponible en el futuro, en uno de tres estados: `pending`, `fulfilled` o `rejected`.

```js
function esperar(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

esperar(1000).then(() => console.log("pasó 1 segundo"));
```

## Promise.all, allSettled y race

```js
const peticiones = [fetch(url1), fetch(url2), fetch(url3)];

await Promise.all(peticiones);       // falla entera si UNA falla
await Promise.allSettled(peticiones); // espera a todas, exitosas o no
await Promise.race(peticiones);       // resuelve con la primera que termine
```

`Promise.all` es ideal cuando necesitas que TODO tenga éxito. `allSettled` cuando quieres el resultado de cada una sin importar fallos parciales. `race` es la base para implementar timeouts manuales.
