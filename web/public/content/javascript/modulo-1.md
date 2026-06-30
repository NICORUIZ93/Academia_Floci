## Tres formas de escribir una función

```js
function sumar(a, b) { return a + b; }          // declaración: se "hoistea" completa
const sumar2 = function (a, b) { return a + b; }; // expresión: no se hoistea
const sumar3 = (a, b) => a + b;                   // arrow function: sin su propio this
```

Las funciones declaradas se pueden invocar antes de su línea de definición (hoisting). Las expresiones y arrow functions no — viven en la variable a la que se asignan.

## Parámetros por defecto, rest y spread

```js
function crearUsuario(nombre, rol = "lector") { return { nombre, rol }; }

function total(...montos) { // rest: junta argumentos sueltos en un array
  return montos.reduce((acc, m) => acc + m, 0);
}

const base = [1, 2, 3];
const extendido = [...base, 4, 5]; // spread: expande un array en otro
```

## Funciones de orden superior

Una función de orden superior recibe y/o devuelve otra función. Es la base de patrones como `debounce`, `throttle` o `pipe`.

```js
function debounce(fn, ms) {
  let temporizador;
  return (...args) => {
    clearTimeout(temporizador);
    temporizador = setTimeout(() => fn(...args), ms);
  };
}

const buscarConDebounce = debounce(texto => console.log("buscando:", texto), 300);
```

## Control de flujo

`if/else`, `switch` y los bucles (`for`, `while`, `for...of`, `for...in`) cubren la mayoría de casos. Un `switch` con muchos casos suele poder reemplazarse por un objeto de mapeo, más legible y más fácil de extender:

```js
const acciones = {
  crear: () => console.log("creando"),
  borrar: () => console.log("borrando"),
};
(acciones[tipoAccion] ?? (() => console.log("desconocido")))();
```
