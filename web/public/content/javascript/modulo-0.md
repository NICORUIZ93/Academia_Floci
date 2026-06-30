## Variables: let, const y var

`var` tiene scope de función y se "hoistea" con valor `undefined`. `let` y `const` tienen scope de bloque y viven en una zona muerta temporal (TDZ) hasta que se ejecuta su línea de declaración. En código nuevo, usa `const` por defecto y `let` solo cuando necesites reasignar. Evita `var`.

```js
const PI = 3.1416;
let contador = 0;
contador += 1; // ok, let permite reasignar
// PI = 3; // error: no se puede reasignar const
```

## Tipos primitivos

JavaScript tiene 7 tipos primitivos: `string`, `number`, `boolean`, `null`, `undefined`, `symbol` y `bigint`. Todo lo demás (arrays, objetos, funciones) es de tipo `object` (las funciones también, aunque `typeof` devuelve `"function"` por conveniencia).

```js
typeof "hola";      // "string"
typeof 42;           // "number"
typeof true;          // "boolean"
typeof null;          // "object" — bug histórico del lenguaje, nunca se corrigió
typeof undefined;     // "undefined"
```

## Coerción: == vs ===

`==` convierte los tipos antes de comparar (coerción implícita); `===` compara sin convertir. La recomendación casi universal es usar siempre `===` para evitar sorpresas como `"" == 0` siendo `true`.

```js
0 == "0";   // true  (coerción)
0 === "0";  // false (tipos distintos)
null == undefined;  // true
null === undefined; // false
```

## Plantillas de string

Los template literals (backticks) permiten interpolar expresiones y escribir strings multilínea sin concatenar manualmente.

```js
const nombre = "Ana";
const edad = 28;
console.log(`${nombre} tiene ${edad} años y en 5 cumplirá ${edad + 5}.`);
```

## Navegador vs Node.js

Ambos ejecutan el mismo motor JavaScript (V8 en Chrome y en Node), pero exponen APIs distintas: el navegador da `window`, `document` y el DOM; Node da `process`, `fs`, módulos del sistema. El lenguaje (sintaxis, tipos, closures) es idéntico en los dos — lo que cambia es el entorno que lo rodea.
