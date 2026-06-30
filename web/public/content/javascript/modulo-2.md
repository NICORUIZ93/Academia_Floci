## Scope léxico y closures

Un closure es una función que "recuerda" las variables de su entorno de creación, incluso después de que ese entorno terminó de ejecutarse.

```js
function createCounter() {
  let valor = 0; // privada: nadie fuera de createCounter puede tocarla directamente
  return {
    increment: () => ++valor,
    decrement: () => --valor,
    value: () => valor,
  };
}

const contador = createCounter();
contador.increment();
contador.increment();
contador.value(); // 2
```

`valor` sigue viva porque las funciones devueltas mantienen una referencia a ella — eso es el closure.

## Hoisting y Temporal Dead Zone (TDZ)

Las declaraciones `function` se hoistean completas. `let`/`const` se hoistean pero quedan en TDZ: existen pero no se pueden leer hasta su línea de declaración.

```js
console.log(x); // ReferenceError: Cannot access 'x' before initialization
let x = 5;
```

## Call stack

Cada llamada a función apila un "frame" en el call stack. Cuando una función retorna, su frame se desapila. Una recursión sin caso base agota la pila (`RangeError: Maximum call stack size exceeded`).

```js
function factorial(n) {
  if (n <= 1) return 1; // caso base: sin esto, stack overflow
  return n * factorial(n - 1);
}
```

## this según la invocación

`this` no depende de dónde se *define* la función sino de *cómo se invoca*:

```js
const obj = {
  nombre: "Ana",
  normal() { return this.nombre; },        // this = obj al invocar obj.normal()
  flecha: () => this?.nombre,                // this = el de scope externo, no obj
};

obj.normal(); // "Ana"
obj.flecha(); // undefined (o el this léxico externo)
```

`call`, `apply` y `bind` permiten fijar explícitamente el valor de `this` en una invocación.
