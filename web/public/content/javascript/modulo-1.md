# Módulo 1: Operadores, control de flujo y funciones

## Sílabo

**Objetivo general**

Dominar las funciones como ciudadanos de primera clase en JavaScript: sus tres formas de declaración, los mecanismos de parámetros modernos (por defecto, rest, spread), y las funciones de orden superior como patrón fundamental para componer comportamiento reutilizable.

**Objetivos específicos**

1. Distinguir function declarations, function expressions y arrow functions, y explicar cuándo cada una es apropiada.
2. Usar parámetros por defecto y los operadores rest/spread correctamente.
3. Escribir funciones de orden superior que reciban o devuelvan otras funciones.
4. Reemplazar estructuras de control de flujo verbosas por alternativas más legibles cuando sea apropiado.
5. Explicar por qué las arrow functions no tienen su propio `this`.

**Contenido**

- Funciones declaradas, expresiones y arrow functions.
- Parámetros por defecto y rest/spread.
- Funciones de orden superior.
- Control de flujo: if/switch/loops.
- IIFE y el objeto `arguments`.
- `for...of`, `for...in` y `for await...of`.

**Evaluación**

Una biblioteca de funciones utilitarias (debounce, pipe, curry) sin dependencias externas, más tres ejercicios de evaluación sobre las tres formas de función, orden superior y control de flujo.

---

## Contenido teórico

### Tema 1: Tres formas de escribir una función

**Conceptos clave:** function declaration, function expression, arrow function, hoisting de funciones.

JavaScript ofrece tres sintaxis distintas para crear una función, y cada una tiene un comportamiento ligeramente distinto que conviene dominar con precisión. La function declaration (`function sumar(a, b) { return a + b; }`) se hoistea completa, no solo su nombre: esto significa que se puede invocar `sumar(2, 3)` en una línea de código anterior a donde está escrita la declaración, porque el motor de JavaScript procesa y registra la función completa antes de ejecutar el resto del script línea por línea. Esta propiedad permite, por ejemplo, organizar un archivo con la función principal al inicio y sus funciones auxiliares debajo, sin que el orden de lectura importe para la ejecución.

La function expression (`const sumar2 = function(a, b) { return a + b; };`) asigna una función anónima (o, opcionalmente, nombrada) a una variable, y sigue las reglas normales de hoisting de esa variable: si se usa `const` o `let`, la función no está disponible hasta que la línea de asignación se ejecuta (está en la Temporal Dead Zone hasta entonces, como se vio en el Módulo 0). Esta diferencia de comportamiento respecto a la declaración es importante: código que depende de invocar una function expression antes de su línea de definición fallará, mientras que el mismo código con una function declaration funcionaría sin problema.

Las arrow functions (`const sumar3 = (a, b) => a + b;`), introducidas en ES6, son la forma más concisa y tienen una diferencia semántica fundamental respecto a las dos anteriores, más allá de la sintaxis: no tienen su propio `this`. Una arrow function captura el valor de `this` del scope léxico donde fue definida (el mismo mecanismo de los closures que se estudiará en profundidad en el Módulo 2), en vez de que `this` dependa de cómo se invoca la función. Esta propiedad hace a las arrow functions especialmente útiles dentro de callbacks (por ejemplo, dentro de un método de un objeto que necesita preservar el `this` del objeto contenedor), pero inapropiadas para definir métodos de objeto que sí necesitan que `this` apunte dinámicamente al objeto sobre el que se invocan.

Elegir entre las tres formas no es arbitrario: usar function declarations para funciones de nivel superior que se quieren organizar libremente en el archivo (aprovechando el hoisting), function expressions cuando se necesita asignar condicionalmente distintas implementaciones a una misma variable, y arrow functions para callbacks concisos y para cualquier contexto donde se necesite preservar el `this` léxico externo, es la práctica más común y bien fundamentada en JavaScript moderno.

**Analogía:** una function declaration es como un empleado permanente ya contratado y en nómina desde el primer día de la empresa (disponible desde el inicio, sin importar en qué línea del organigrama aparezca escrito); una function expression es como un contratista que empieza a trabajar exactamente el día en que se firma su contrato (disponible solo a partir de esa línea); una arrow function es como un empleado que, sin importar a qué departamento lo transfieran, sigue reportando siempre al mismo jefe original con quien fue contratado (el `this` léxico no cambia según dónde se invoque).

**¿Por qué es importante?** Confundir estas tres formas —especialmente asumir que una arrow function se comporta como un método normal respecto a `this`— es una de las fuentes más comunes de bugs sutiles para quien aprende JavaScript, particularmente al escribir métodos de clase o callbacks dentro de objetos.

**Diagrama:**

```
function sumar(a,b){}     ← hoisteada completa, disponible desde el inicio
const s2 = function(a,b){} ← disponible solo tras esta línea (TDZ si const/let)
const s3 = (a,b) => a+b    ← disponible tras esta línea; SIN this propio
```

### Tema 2: Parámetros por defecto y rest/spread

**Conceptos clave:** valores por defecto, rest para recolectar argumentos, spread para expandir.

Los parámetros por defecto permiten especificar un valor que se usará automáticamente cuando el argumento correspondiente no se proporciona (o se pasa explícitamente como `undefined`): `function crearUsuario(nombre, rol = "lector")` asigna `"lector"` a `rol` si se invoca `crearUsuario("Ana")` sin segundo argumento. Esto reemplaza el patrón anterior a ES6, mucho más verboso, de verificar manualmente `rol = rol || "lector";` dentro del cuerpo de la función (patrón que además tenía un bug sutil: fallaba si el valor válido proporcionado era `0`, `""` o `false`, valores falsy legítimos que el operador `||` interpretaba incorrectamente como "ausentes").

El operador rest (`...args` en la posición de un parámetro) recolecta un número variable de argumentos sueltos en un único array dentro del cuerpo de la función: `function total(...montos) { return montos.reduce((acc, m) => acc + m, 0); }` permite invocar `total(10, 20, 30)` con cualquier cantidad de argumentos, todos disponibles como el array `montos`. El operador spread (`...algo` en la posición de un argumento de llamada, o dentro de un literal de array/objeto) hace exactamente lo contrario: expande un iterable existente en elementos individuales, ya sea para pasarlos como argumentos separados a una función, para combinar arrays (`[...arr1, ...arr2]`), o para clonar y extender objetos sin mutarlos (`{...objetoOriginal, propiedadNueva: valor}`).

Es importante no confundir rest y spread simplemente porque comparten la misma sintaxis visual (`...`): la diferencia está en el contexto donde aparecen. En la definición de una función (`function f(...args)`), es rest, y recolecta; en una llamada a función o dentro de un literal (`f(...arr)`, `[...arr]`), es spread, y expande. Este par de operadores, introducidos ambos en ES6 y extendidos progresivamente a más contextos en versiones posteriores del lenguaje, reemplazó patrones mucho más verbosos que existían anteriormente, como usar el objeto `arguments` (que se discutirá en el Tema 5) o `Array.prototype.slice.call(...)` para lograr efectos similares.

Combinar parámetros por defecto con rest en la misma función es perfectamente válido y frecuente: `function log(nivel = "info", ...mensajes)` permite invocar tanto `log()` como `log("error", "algo falló", "detalle adicional")` con un comportamiento predecible en ambos casos, siempre que el parámetro rest se coloque, como exige la sintaxis del lenguaje, al final de la lista de parámetros.

**Analogía:** un parámetro por defecto es como un formulario que ya viene con un valor precompletado en un campo opcional, que el usuario puede sobreescribir si lo desea; rest es como una caja de recolección que junta todo lo que sobra de una lista variable de artículos en un solo paquete; spread es la acción inversa, sacar todos los artículos de un paquete existente y esparcirlos individualmente sobre la mesa.

**¿Por qué es importante?** Rest y spread eliminan la necesidad de patrones antiguos verbosos para manejar número variable de argumentos o para combinar/clonar estructuras de datos, y son omnipresentes en JavaScript moderno, incluyendo dentro de frameworks como React (props spread) y Node.js.

**Diagrama:**

```
Definición (rest):           Llamada/literal (spread):
function f(...args) {}        f(...[1,2,3])       // expande el array en argumentos
  args = [1,2,3]               [...[1,2], ...[3,4]] // combina: [1,2,3,4]
  (recolecta en un array)       {...obj, x: 1}        // clona y extiende
```

### Tema 3: Funciones de orden superior

**Conceptos clave:** función que recibe función, función que devuelve función, composición.

Una función de orden superior es, por definición, cualquier función que reciba otra función como argumento, devuelva una función como resultado, o ambas cosas a la vez. Este concepto, tomado directamente de la programación funcional, es posible en JavaScript precisamente porque las funciones son "ciudadanos de primera clase": se pueden asignar a variables, pasar como argumentos y devolver como resultados, exactamente igual que cualquier otro valor del lenguaje como un número o un string.

`debounce(fn, ms)` es el ejemplo canónico de una función de orden superior extremadamente útil en la práctica: recibe una función `fn` y un tiempo `ms`, y devuelve una nueva función que, cada vez que se invoca, cancela cualquier temporizador pendiente de una invocación anterior y programa una nueva ejecución de `fn` solo si transcurre el tiempo `ms` completo sin que se vuelva a invocar la función devuelta. Este patrón resuelve un problema práctico muy común: evitar ejecutar una operación costosa (como una búsqueda contra un servidor) en cada pulsación de tecla de un campo de búsqueda, ejecutándola solo una vez que el usuario deja de escribir.

`pipe(...fns)` es otro ejemplo instructivo: recibe un número variable de funciones (usando rest, como se vio en el Tema 2) y devuelve una nueva función que, al invocarse con un valor `x`, aplica cada función de la lista en orden, pasando el resultado de una como entrada de la siguiente (`pipe(f, g, h)(x)` es equivalente a `h(g(f(x)))`). Este patrón de composición permite construir transformaciones complejas encadenando funciones pequeñas y bien definidas, en vez de escribir una única función monolítica que hace todo a la vez, mejorando tanto la legibilidad como la capacidad de probar cada paso de forma independiente.

El valor real de las funciones de orden superior no está en su elegancia sintáctica, sino en que permiten eliminar duplicación de código extrayendo un patrón de comportamiento común (como "esperar antes de ejecutar" en `debounce`, o "encadenar transformaciones" en `pipe`) en una única función reutilizable, parametrizada exactamente en los puntos donde varía cada caso de uso específico (qué función ejecutar, cuánto esperar, qué funciones encadenar).

**Analogía:** una función de orden superior es como una máquina que fabrica otras máquinas personalizadas: le entregas una especificación (la función `fn`) y algunos parámetros (como `ms`), y te devuelve una máquina nueva y lista para usar, con ese comportamiento específico ya incorporado, sin que tengas que construir esa máquina desde cero cada vez.

**¿Por qué es importante?** Las funciones de orden superior son la base de patrones extremadamente comunes en JavaScript moderno —`debounce`, `throttle`, `memoize`, `pipe`, `curry`— y entenderlas profundamente en este módulo facilita enormemente entender más adelante los Hooks de React o los operadores de RxJS en Angular, que son, en esencia, la misma idea aplicada a contextos más específicos.

**Diagrama:**

```
debounce(fn, ms) → nueva función
  cada llamada: cancela el temporizador anterior,
  programa uno nuevo; fn solo se ejecuta si pasan
  ms ms sin una nueva llamada

pipe(f, g, h)(x) === h(g(f(x)))
  x → f → resultado1 → g → resultado2 → h → resultado final
```

### Tema 4: Control de flujo — if, switch y loops

**Conceptos clave:** `if/else`, `switch`, bucles, objetos de mapeo como alternativa a `switch`.

`if/else` y `switch` son las estructuras de control de flujo condicional más básicas de JavaScript, y funcionan de forma prácticamente idéntica a como lo hacen en la mayoría de lenguajes de programación con sintaxis similar a C. Sin embargo, un `switch` con muchos casos (cuatro o más) suele volverse difícil de leer y de mantener, especialmente cuando cada caso ejecuta una lógica sustancialmente distinta; en JavaScript, una alternativa idiomática y frecuentemente más legible es reemplazar el `switch` por un objeto literal que mapea cada posible valor a la función correspondiente, invocando la función seleccionada dinámicamente mediante acceso por corchetes (`objeto[clave]`).

Este patrón de "objeto de mapeo" (lookup table) tiene ventajas concretas sobre un `switch` extenso: es más fácil de extender (añadir un caso nuevo es simplemente añadir una entrada al objeto, sin tocar ninguna estructura de control existente), es más fácil de testear de forma aislada (cada función del objeto puede probarse independientemente sin necesidad de ejecutar el `switch` completo), y elimina el riesgo de olvidar un `break` en un caso de `switch`, un error extremadamente común que provoca que la ejecución "caiga" (fall through) accidentalmente al siguiente caso.

En cuanto a los bucles, JavaScript ofrece varias formas: `for` clásico (con contador explícito), `while` y `do...while` (basados en condición), y las formas más modernas `for...of` (para iterar sobre los valores de cualquier iterable: arrays, strings, Maps, Sets) y `for...in` (para iterar sobre las claves enumerables de un objeto, generalmente desaconsejado para arrays porque también itera sobre propiedades heredadas del prototipo si existen). Elegir el bucle correcto según el tipo de dato que se recorre —`for...of` para iterables, métodos funcionales como `map`/`filter` (Módulo 4) cuando se transforma una colección— produce código más legible que forzar siempre el mismo `for` clásico con índice numérico para cualquier situación.

Aunque los bucles siguen siendo necesarios en muchos contextos (especialmente cuando se necesita `break` o `continue` con lógica compleja, algo que los métodos funcionales de array no permiten de forma directa), gran parte del código JavaScript moderno prefiere los métodos funcionales sobre arrays (que se estudiarán en profundidad en el Módulo 4) por su mayor expresividad y menor propensión a errores de índice fuera de rango.

**Analogía:** un `switch` extenso es como un mostrador de atención al cliente con un único empleado que memoriza de memoria qué hacer para cada uno de veinte tipos de solicitud distintos, revisando mentalmente cada caso uno por uno hasta encontrar el correcto; un objeto de mapeo es como un mostrador con veinte casilleros claramente etiquetados, donde el cliente (o el código) simplemente consulta directamente el casillero correspondiente a su solicitud, sin recorrer los demás.

**¿Por qué es importante?** Reconocer cuándo un `switch` extenso se beneficiaría de convertirse en un objeto de mapeo, y elegir el tipo de bucle apropiado según la estructura de datos, son señales de código JavaScript idiomático y mantenible, frente a código que simplemente "funciona" pero es difícil de extender con seguridad.

**Diagrama:**

```
switch extenso:                    Objeto de mapeo equivalente:
switch (tipoAccion) {               const acciones = {
  case "crear": ...; break;           crear: () => {...},
  case "borrar": ...; break;           borrar: () => {...},
  case "editar": ...; break;           editar: () => {...},
  default: ...;                      };
}                                    (acciones[tipoAccion] ?? default)();
```

### Tema 5: IIFE y el objeto arguments

**Conceptos clave:** Immediately Invoked Function Expression, encapsulación, `arguments` frente a rest.

Una IIFE (Immediately Invoked Function Expression) es una función que se define y se invoca inmediatamente en la misma expresión, típicamente envuelta entre paréntesis para forzar al parser a interpretarla como una expresión y no como una declaración: `(function() { console.log("ejecutado de inmediato"); })();`. Antes de que `let`/`const` introdujeran el scope de bloque (Módulo 0) y los módulos ESM (Módulo 7) introdujeran un scope de archivo aislado, las IIFE eran la técnica principal para crear un scope privado y evitar contaminar el scope global con variables temporales, un patrón extremadamente común en el JavaScript anterior a 2015.

Aunque las IIFE han perdido buena parte de su relevancia práctica con la llegada de módulos ESM (cada módulo ya tiene su propio scope aislado por defecto, sin necesidad de envolver el código en una función autoejecutada), siguen apareciendo en código legado y en ciertos patrones específicos, como ejecutar código de inicialización asíncrono en el nivel superior de un script antes de que existiera el top-level `await`.

El objeto `arguments` es una estructura similar a un array (pero no un array real: no tiene métodos como `map` o `filter` directamente) disponible automáticamente dentro de cualquier función declarada con `function` (no disponible dentro de arrow functions), que contiene todos los argumentos con los que se invocó la función, sin importar cuántos parámetros formales se hayan declarado. Antes de la introducción del operador rest en ES6, `arguments` era la única forma de acceder a un número variable de argumentos, típicamente requiriendo convertirlo primero en un array real con `Array.prototype.slice.call(arguments)` para poder usar métodos de array sobre él.

En JavaScript moderno, el operador rest (Tema 2) ha reemplazado prácticamente por completo la necesidad de usar `arguments` directamente: `function f(...args)` produce un array real desde el inicio, con todos los métodos de array disponibles de inmediato, sin necesidad de conversión adicional, y además funciona de forma consistente incluso dentro de arrow functions (donde `arguments` simplemente no existe, heredándose en su lugar del scope contenedor si lo hay). Por esta razón, el código nuevo debería preferir siempre rest sobre `arguments`, reservando el conocimiento de este último principalmente para entender y mantener código legado existente.

**Analogía:** una IIFE es como una habitación temporal montada y desmontada en el mismo instante para una reunión privada de un solo uso, sin dejar rastro visible en el resto del edificio; `arguments` es como una bolsa genérica que automáticamente recoge todo lo que alguien te entrega en la puerta, sin etiquetar ni organizar nada, mientras que rest es una caja etiquetada y organizada específicamente para ese propósito desde el diseño mismo de la función.

**¿Por qué es importante?** Aunque las IIFE y `arguments` son menos centrales en JavaScript moderno que hace una década, reconocerlas es esencial para leer y mantener código legado, que sigue siendo extremadamente común en proyectos de larga vida en la industria.

**Diagrama:**

```
IIFE:                              arguments (dentro de function):
(function() {                      function f(a, b) {
  let privado = "oculto";            console.log(arguments.length);
  console.log(privado);              console.log(arguments[0]); // = a
})();                              }
// privado no existe aquí afuera   f(1, 2, 3); // arguments = {0:1,1:2,2:3,length:3}
```

---

## Laboratorio práctico

**Objetivo del laboratorio:** construir una pequeña biblioteca de funciones utilitarias de orden superior, aplicando las tres formas de función, parámetros modernos y composición.

**Requisitos previos:** Node.js instalado, conocimiento del Módulo 0 (tipos, template literals).

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Escribir `sumar` en sus tres formas | `function sumar(a,b){}`, `const sumar2 = function(a,b){}`, `const sumar3 = (a,b)=>a+b` | Compara comportamiento de hoisting invocando cada una antes de su definición |
| 2 | Función con parámetro por defecto y rest | `function total(impuesto = 0, ...montos)` | Combina ambos mecanismos en una sola función |
| 3 | Combinar arrays y clonar objetos con spread | `[...a, ...b]`, `{...obj, nuevaProp: 1}` | Verifica que el original no se muta |
| 4 | Implementar `debounce(fn, ms)` | Ver Tema 3 | Pruébalo con `console.log` disparado por múltiples llamadas rápidas |
| 5 | Implementar `pipe(...fns)` | Ver Tema 3 | Verifica `pipe(f,g,h)(x) === h(g(f(x)))` con funciones simples |
| 6 | Reescribir un switch de 4 casos como objeto de mapeo | Ver Tema 4 | Compara legibilidad y facilidad de extensión |

**Verificación:** el laboratorio se considera exitoso si `pipe(x => x+1, x => x*2)(3)` devuelve `8`, y si `debounce` invocado 5 veces en rápida sucesión solo ejecuta la función una vez, tras el último de los 5 disparos.

**Errores comunes y soluciones**

- **Usar una arrow function como método de objeto y esperar que `this` apunte al objeto.** Recuerda que las arrow functions no tienen `this` propio; usa `function` normal o método abreviado (`metodo() {}`) para métodos que necesiten `this` dinámico.
- **Confundir rest y spread por la sintaxis idéntica (`...`).** Verifica el contexto: en la definición de parámetros es rest (recolecta), en una llamada o literal es spread (expande).
- **`pipe` compuesto en el orden equivocado.** Verifica que `pipe(f, g)(x)` aplica primero `f` y luego `g` sobre el resultado, no al revés (eso sería `compose`, el orden inverso).

---

## Ejercicios de evaluación

### Ejercicio 1: Hoisting comparado

**Enunciado:** dado el código `console.log(saludar()); function saludar() { return "hola"; }` y su variante `console.log(saludar2()); const saludar2 = () => "hola";`, predice qué ocurre en cada caso y explica por qué.

**Solución esperada:** el primero imprime `"hola"` sin error, porque las function declarations se hoistean completas. El segundo lanza un `ReferenceError: Cannot access 'saludar2' before initialization`, porque `const` se hoistea pero permanece en la Temporal Dead Zone hasta su línea de declaración.

**Criterios de éxito:**
- Identifica correctamente que el primero funciona y el segundo lanza error.
- Explica la causa en términos de hoisting completo (declaración) frente a TDZ (const/let).

### Ejercicio 2: Diseñar una función de orden superior propia

**Enunciado:** escribe `once(fn)`, una función de orden superior que devuelva una versión de `fn` que solo puede ejecutarse una vez; llamadas subsecuentes deben devolver el resultado de la primera ejecución sin volver a ejecutar `fn`.

**Solución esperada:**
```js
function once(fn) {
  let ejecutada = false;
  let resultado;
  return (...args) => {
    if (!ejecutada) {
      resultado = fn(...args);
      ejecutada = true;
    }
    return resultado;
  };
}
```

**Criterios de éxito:**
- La función devuelta ejecuta `fn` solo en la primera llamada.
- Llamadas subsecuentes devuelven el resultado cacheado de la primera ejecución, sin re-ejecutar `fn`.

### Ejercicio 3: rest frente a arguments

**Enunciado:** explica por qué esta función falla: `const sumarTodos = (...nums) => arguments.length;` al invocarse como `sumarTodos(1,2,3)`, y cómo corregirla.

**Solución esperada:** falla porque `arguments` no existe dentro de arrow functions (lanza `ReferenceError: arguments is not defined`, o hereda el `arguments` del scope contenedor si existe, dando un resultado incorrecto). La corrección es usar directamente `nums.length` (el array capturado por rest), sin necesidad de `arguments` en absoluto.

**Criterios de éxito:**
- Identifica que `arguments` no está disponible en arrow functions.
- Propone la corrección usando el parámetro rest directamente (`nums.length`).

---

## Resumen del módulo

**Puntos clave**

- Las tres formas de función (declaración, expresión, arrow) difieren en hoisting y en si tienen `this` propio.
- Los parámetros por defecto reemplazan el patrón antiguo y con bugs de `param || valorPorDefecto`.
- Rest recolecta argumentos variables en un array; spread expande un iterable en elementos individuales.
- Las funciones de orden superior (`debounce`, `pipe`) son la base de composición reutilizable en JavaScript.
- Un objeto de mapeo suele ser más legible y extensible que un `switch` con muchos casos.
- `arguments` es el mecanismo legado para argumentos variables; rest es su reemplazo moderno y preferido.

**Conceptos aprendidos**

- Diferencias de hoisting y de `this` entre las tres formas de función.
- Parámetros por defecto, rest y spread.
- Diseño de funciones de orden superior (`debounce`, `pipe`, `once`).
- Alternativas a `switch` extensos mediante objetos de mapeo.
- IIFE y el objeto `arguments` como mecanismos legados.

**Próximos pasos**

En el Módulo 2 profundizarás en el modelo de ejecución de JavaScript: scope léxico, closures, hoisting en detalle, el call stack, y cómo `this` se determina según la forma de invocación.

**Recursos adicionales**

- MDN Web Docs: "Functions" y "Rest parameters" / "Spread syntax".
- El libro "You Don't Know JS: Scope & Closures" (Kyle Simpson) para profundizar en el modelo de ejecución de funciones.
