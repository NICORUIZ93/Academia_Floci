# Módulo 0: Fundamentos del lenguaje y el entorno


## Antes de comenzar: tu primer entorno de programación

Para comenzar solo necesitas un navegador moderno y Visual Studio Code. También instalaremos Node.js LTS para ejecutar JavaScript fuera del navegador y Git para guardar la historia de tu trabajo.

| Sistema | Pasos |
|---|---|
| Windows | Instala VS Code, Git y Node.js LTS con sus instaladores oficiales; usa PowerShell en la terminal de VS Code |
| macOS | Instala VS Code; usa Homebrew para `node` y `git`, o sus instaladores oficiales |
| Ubuntu/Debian | Instala Git con `apt`, Node LTS con `nvm` y VS Code desde su repositorio oficial |

Comprueba `node -v` y `git --version`. Crea una carpeta `primer-js`, ábrela en VS Code y guarda `index.html`:

```html
<!doctype html>
<html lang="es">
  <body>
    <h1 id="saludo">Hola</h1>
    <script>document.querySelector('#saludo').textContent = 'JavaScript funciona';</script>
  </body>
</html>
```

Ábrelo en el navegador y usa `F12` → **Console** para ver errores. Crea también `hola.js` con `console.log('Hola')` y ejecuta `node hola.js`. Así distingues desde el primer día los dos entornos: navegador (DOM) y Node.js (sistema operativo/servidor).

## Aprende construyendo

### Tema 1: Variables — let, const y var

**Conceptos clave:** scope de función frente a scope de bloque, hoisting, Temporal Dead Zone (TDZ), reasignación frente a mutación.

JavaScript ofrece tres formas de declarar variables, y entender sus diferencias es el primer paso ineludible antes de escribir cualquier línea de código seria. `var`, la forma original del lenguaje, tiene scope de función: una variable declarada con `var` dentro de un bloque `if` o un bucle `for` es visible en toda la función que la contiene, no solo dentro de ese bloque, lo que históricamente causó numerosos bugs sutiles. Además, `var` se "hoistea" (se eleva) al inicio de su función con un valor inicial de `undefined`, de modo que referenciarla antes de su línea de declaración no lanza un error, sino que simplemente devuelve `undefined`, un comportamiento que oculta silenciosamente errores de orden en el código.

`let` y `const`, introducidas en ES6 (2015), resuelven este problema adoptando scope de bloque: una variable declarada con `let` dentro de un `if {}` o un `for {}` solo existe dentro de ese bloque específico delimitado por las llaves. Ambas también se hoistean, pero a diferencia de `var`, quedan en lo que se llama la Temporal Dead Zone (zona muerta temporal): existen en memoria pero acceder a ellas antes de su línea de declaración lanza un `ReferenceError` explícito, en vez de devolver silenciosamente `undefined`. Este comportamiento, aparentemente más estricto, es en realidad una mejora deliberada: convierte errores de orden de código, que antes fallaban silenciosamente, en errores explícitos y fáciles de detectar durante el desarrollo.

La diferencia entre `let` y `const` no es "variable" frente a "constante" en el sentido matemático estricto, sino reasignación frente a mutación: `const` impide reasignar el identificador a un valor completamente distinto (`const x = 5; x = 6;` lanza error), pero si el valor es un objeto o un array, sus propiedades internas sí pueden modificarse (`const arr = [1,2]; arr.push(3);` es perfectamente válido, porque no se está reasignando `arr` a un array distinto, sino mutando el array existente al que `arr` apunta). Esta distinción entre "no se puede reasignar el identificador" y "no se puede modificar el contenido" es una fuente frecuente de confusión para quienes recién llegan al lenguaje, y merece practicarse deliberadamente hasta interiorizarse.

La recomendación ampliamente adoptada en la industria moderna es usar `const` por defecto para toda variable que no necesite reasignarse, reservar `let` únicamente para las que sí lo necesiten, y evitar `var` completamente en código nuevo, salvo en contextos muy específicos de compatibilidad con código legado extremadamente antiguo. Esta disciplina no es un capricho estilístico: declarar con `const` comunica una intención explícita al resto del equipo ("este valor no debería cambiar"), y el motor de JavaScript refuerza esa intención lanzando un error si alguien intenta violarla accidentalmente.

**Analogía:** `var` es como una nota adhesiva pegada en el pasillo compartido de toda una oficina (visible y modificable desde cualquier escritorio de esa oficina); `let` y `const` son como una nota adhesiva pegada dentro de una sala de reuniones específica, visible solo mientras estás dentro de esa sala concreta, y desaparece en cuanto sales de ella.

**¿Por qué es importante?** El scope de bloque de `let`/`const` y la protección de la Temporal Dead Zone eliminan de raíz una categoría entera de bugs sutiles relacionados con el orden y el alcance de las variables que fueron endémicos en JavaScript durante sus primeros veinte años de existencia, antes de ES6.

**Diagrama:**

```
var (scope de función):          let/const (scope de bloque):
function f() {                    function f() {
  if (true) {                       if (true) {
    var x = 1;                        let x = 1;
  }                                  }
  console.log(x); // 1 (visible)     console.log(x); // ReferenceError
}                                  }
```

### Tema 2: Tipos primitivos y typeof

**Conceptos clave:** los 7 tipos primitivos, `typeof`, el caso especial de `null`.

JavaScript define exactamente 7 tipos primitivos: `string`, `number`, `boolean`, `null`, `undefined`, `symbol` (introducido en ES6, para crear identificadores únicos) y `bigint` (introducido más recientemente, para enteros de precisión arbitraria que exceden el rango seguro de `number`). Todo lo demás en el lenguaje —arrays, objetos literales, funciones, fechas— es, técnicamente, de tipo `object` (con la particularidad de que `typeof` sobre una función devuelve `"function"` como una conveniencia práctica del operador, aunque internamente una función es un objeto invocable).

El operador `typeof` permite inspeccionar en tiempo de ejecución el tipo de cualquier valor, y es una herramienta fundamental de depuración y de narrowing (el proceso de restringir el tipo posible de una variable dentro de una rama condicional). Sin embargo, `typeof` tiene un caso especial ampliamente conocido que conviene memorizar explícitamente: `typeof null` devuelve `"object"`, no `"null"`. Este es un bug histórico del lenguaje, presente desde su primera implementación en 1995, que nunca se corrigió porque hacerlo habría roto una enorme cantidad de código existente en la web que dependía (a veces sin saberlo) de ese comportamiento específico.

Distinguir `null` de `undefined` es otra fuente frecuente de confusión: `undefined` es el valor que JavaScript asigna automáticamente a una variable declarada pero no inicializada, o a un parámetro de función no proporcionado; `null` es un valor que un desarrollador asigna deliberadamente para representar "la ausencia intencional de un valor". Esta distinción semántica —"nadie lo inicializó" frente a "alguien decidió explícitamente que no hay valor aquí"— es útil mantenerla consistentemente en el propio código, aunque el lenguaje no la impone de forma estricta.

Practicar `typeof` sobre cada uno de los 7 tipos primitivos, además de sobre un array y un objeto literal, es un ejercicio de calibración importante antes de avanzar: quien puede predecir correctamente el resultado de `typeof` sobre cualquier valor tiene una base sólida para razonar sobre el sistema de tipos dinámico de JavaScript en el resto del track.

**Analogía:** los tipos primitivos son como las unidades de medida básicas de un sistema (metro, kilogramo, segundo): un número limitado de categorías fundamentales sobre las que se construye todo lo demás; que `typeof null` devuelva `"object"` es como si, por un error histórico de definición nunca corregido, una "ausencia de longitud" se catalogara bajo la unidad "longitud" en vez de tener su propia categoría, un detalle que hay que simplemente recordar como excepción.

**¿Por qué es importante?** Entender los tipos primitivos y sus peculiaridades (como el caso de `null`) es la base para razonar correctamente sobre coerción, comparaciones e incluso sobre por qué TypeScript (Módulo 11) existe como una capa adicional de seguridad sobre este sistema de tipos dinámico.

**Diagrama:**

```
typeof "hola"      → "string"
typeof 42          → "number"
typeof true        → "boolean"
typeof null        → "object"   ← caso especial, bug histórico
typeof undefined   → "undefined"
typeof Symbol()    → "symbol"
typeof 10n         → "bigint"
typeof {}          → "object"
typeof []          → "object"
typeof function(){} → "function" (conveniencia del operador)
```

### Tema 3: Coerción implícita — == frente a ===

**Conceptos clave:** coerción de tipos, igualdad estricta, reglas impredecibles de `==`.

El operador `==` (igualdad "suelta") convierte automáticamente los operandos a un tipo común antes de compararlos, siguiendo un conjunto de reglas de coerción que, aunque están formalmente especificadas, producen resultados que sorprenden incluso a desarrolladores experimentados si no se han memorizado explícitamente: `0 == "0"` es `true` (el string se convierte a número), `"" == 0` es también `true` (el string vacío se convierte a `0`), pero `"" == "0"` es `false` (ninguno se convierte, se comparan como strings directamente, y son distintos). Esta inconsistencia aparente —cuándo exactamente ocurre la coerción y hacia qué tipo— es precisamente lo que hace que depender de `==` sea propenso a errores difíciles de predecir sin memorizar la tabla completa de reglas de coerción.

El operador `===` (igualdad estricta) no realiza ninguna conversión: si los operandos son de tipos distintos, la comparación es directamente `false`, sin excepciones ni casos especiales que memorizar. Por esta razón, la recomendación prácticamente universal en JavaScript moderno es usar siempre `===` (y su contraparte `!==`) por defecto, reservando `==` únicamente para el caso idiomático específico y ampliamente reconocido de comparar contra `null` de forma laxa (`valor == null` es `true` tanto si `valor` es `null` como si es `undefined`, lo cual es, en ocasiones, una comprobación deliberada y útil).

Esta preferencia por `===` no es un dogma arbitrario de estilo: es una decisión pragmática basada en que la coerción implícita rara vez expresa una intención real del desarrollador, y con mucha más frecuencia enmascara un bug (comparar un string que llegó de un formulario HTML contra un número, sin haberlo convertido explícitamente primero). Convertir explícitamente los tipos antes de comparar (`Number(valorDelFormulario) === 5`) hace la intención del código visible y verificable, en vez de delegar esa conversión a las reglas implícitas y menos legibles del operador `==`.

Herramientas de linting como ESLint (que se estudiará en el Módulo 9) suelen incluir una regla (`eqeqeq`) que directamente prohíbe el uso de `==` salvo en el caso explícito de comparación contra `null`, formalizando en el propio proceso de desarrollo esta práctica recomendada, de modo que el equipo completo la siga de forma consistente sin depender de la disciplina individual de cada desarrollador.

**Analogía:** `==` es como un cajero de tienda que acepta pagos en cualquier moneda extranjera, convirtiéndola mentalmente y de forma aproximada al momento del cobro, con reglas de conversión que no siempre son obvias para el cliente; `===` es un cajero que solo acepta exactamente la moneda local, sin conversión alguna, eliminando cualquier ambigüedad sobre cuánto se está cobrando realmente.

**¿Por qué es importante?** Preferir `===` elimina una categoría entera de bugs sutiles relacionados con comparaciones inesperadas entre tipos distintos, haciendo el comportamiento del código predecible sin necesidad de memorizar la tabla completa de reglas de coerción de `==`.

**Diagrama:**

```
0 == "0"        → true   (coerción: "0" se convierte a 0)
0 === "0"       → false  (tipos distintos, sin conversión)
null == undefined  → true   (caso especial reconocido de ==)
null === undefined → false  (tipos distintos)
"" == 0         → true   (coerción: "" se convierte a 0)
"" == "0"       → false  (ambos strings, sin conversión, distintos)
```

### Tema 4: Template literals

**Conceptos clave:** interpolación de expresiones, strings multilínea, backticks.

Los template literals, delimitados por backticks (`` ` ``) en vez de comillas simples o dobles, permiten interpolar directamente variables y expresiones arbitrarias dentro de un string usando la sintaxis `${expresión}`, evitando la concatenación manual con el operador `+` que dominaba el código JavaScript anterior a ES6. Dentro de `${}` se puede colocar cualquier expresión válida de JavaScript, no solo una variable simple: una operación aritmética, una llamada a función, o incluso una expresión condicional ternaria, y el resultado se convierte automáticamente a string e se inserta en la posición correspondiente del template.

Además de la interpolación, los template literals soportan strings multilínea de forma nativa, sin necesidad de caracteres de escape especiales (`\n`) ni de concatenar múltiples líneas con `+`: cualquier salto de línea real dentro de los backticks se preserva literalmente en el string resultante, lo cual es particularmente útil para generar bloques de HTML, mensajes de correo, o cualquier texto estructurado de múltiples líneas directamente desde JavaScript.

Una capacidad más avanzada, menos usada en el día a día pero importante de conocer, son los "tagged templates" (templates etiquetados): anteponer una función antes de los backticks (`miFuncion\`texto ${variable}\``) permite que esa función procese el string y sus interpolaciones de forma personalizada antes de producir el resultado final, una técnica que bibliotecas como `styled-components` (en el ecosistema React) usan internamente para permitir escribir CSS dentro de JavaScript de forma natural.

Adoptar template literals de forma consistente en vez de concatenación con `+` no es solo una cuestión de preferencia estética: mejora directamente la legibilidad del código al mantener el texto y las variables interpoladas en su posición visual natural dentro de la frase, en vez de fragmentarlos en múltiples piezas concatenadas que el lector debe recomponer mentalmente para entender el mensaje final.

**Analogía:** concatenar strings con `+` es como escribir una carta pegando recortes de papel de distintas fuentes uno junto a otro; un template literal es como escribir la misma carta directamente a mano, dejando huecos marcados donde se insertan los datos variables, con el texto completo legible de corrido en su forma natural.

**¿Por qué es importante?** Los template literals son la forma idiomática y ampliamente adoptada de construir strings dinámicos en JavaScript moderno, y se usan constantemente en prácticamente cualquier código real, desde mensajes de log hasta la generación de HTML dinámico.

**Diagrama:**

```
Concatenación clásica:                Template literal:
"Hola " + nombre + ", tienes " +      `Hola ${nombre}, tienes
  edad + " años"                       ${edad} años`
```

### Tema 5: Entorno — navegador frente a Node.js

**Conceptos clave:** motor JavaScript compartido (V8), APIs específicas del entorno, `window` frente a `process`.

Un punto de confusión frecuente para quien empieza en JavaScript es no distinguir claramente entre "el lenguaje JavaScript" y "el entorno en el que ese lenguaje se ejecuta". El lenguaje en sí —su sintaxis, sus tipos, sus reglas de scope, los closures— es exactamente el mismo tanto si el código corre en la consola de Chrome como si corre en un script de Node.js ejecutado desde la terminal: ambos entornos, de hecho, ejecutan el mismo motor subyacente, V8 (el motor de Google que impulsa Chrome y que Node adoptó como su núcleo de ejecución).

Lo que cambia radicalmente entre ambos entornos son las APIs adicionales que cada uno expone por encima del lenguaje base. El navegador expone `window` como objeto global, junto con `document` y toda la API del DOM (que se estudiará en profundidad en el Módulo 8) para manipular una página web, además de APIs específicas del navegador como `localStorage`, `fetch`, o `IntersectionObserver`. Node.js, en cambio, no tiene ni `window` ni `document` (no hay una página web que manipular), pero expone `process` (para leer variables de entorno, argumentos de línea de comandos, y controlar el ciclo de vida del proceso), el módulo `fs` (para leer y escribir archivos del sistema), y un sistema de módulos propio para organizar código en archivos separados.

Esta distinción tiene una consecuencia práctica inmediata al escribir código: una función que use `document.querySelector(...)` funcionará perfectamente en el navegador pero lanzará un `ReferenceError` en Node (porque `document` simplemente no existe ahí), y de forma simétrica, código que use `require("fs")` o `process.argv` fallará si se intenta ejecutar directamente en la consola del navegador. Escribir código verdaderamente "isomórfico" (que funcione en ambos entornos sin cambios) requiere evitar deliberadamente las APIs específicas de cada entorno, o detectar en tiempo de ejecución en cuál se está ejecutando antes de usar la API correspondiente.

Node.js fue, históricamente, lo que permitió a JavaScript salir del navegador y convertirse en un lenguaje de propósito general capaz de escribir servidores backend completos (tema central del track de Node.js), scripts de automatización, y herramientas de línea de comandos, expandiendo enormemente el alcance práctico de un lenguaje que originalmente se diseñó únicamente para añadir interactividad a páginas web estáticas.

**Analogía:** el lenguaje JavaScript es como el idioma español hablado; el navegador y Node.js son como dos países distintos donde se habla ese mismo idioma, pero cada uno con su propio vocabulario técnico local específico de su industria dominante (términos marítimos en un país costero, términos agrícolas en otro): el idioma base es idéntico y mutuamente inteligible, pero cada contexto tiene vocabulario adicional que no tiene sentido fuera de ese contexto específico.

**¿Por qué es importante?** Distinguir claramente "lenguaje" de "entorno" evita la confusión frecuente de intentar usar `document` en Node o `fs` en el navegador, y sienta las bases para entender, más adelante en el curso, por qué frameworks como Angular o React corren en el navegador mientras que Node.js es la base típica de un servidor backend.

**Diagrama:**

```
              JavaScript (el lenguaje: sintaxis, tipos, closures)
                              │
            ┌─────────────────┴─────────────────┐
            ▼                                     ▼
       Navegador (V8 en Chrome)              Node.js (V8 embebido)
       window, document, DOM,                process, fs, require,
       fetch, localStorage                    módulos del sistema
```

---

## Ruta de proyecto progresivo desde carpeta vacía

No crees un proyecto desechable por módulo. Conserva un único repositorio que evoluciona durante todo el track y etiqueta cada hito (`git tag modulo-N`). Empieza con `mkdir academia-javascript && cd academia-javascript && git init && npm init -y`. Ejecuta el comando paso a paso, inspecciona los archivos generados y registra versiones y precondiciones en el README.

| Hito | Evolución acumulativa | Evidencia antes de avanzar |
|---|---|---|
| Base | HTML/DOM. | Arranque reproducible, commit limpio y prueba mínima. |
| Aplicación | API y persistencia. | Casos normales, límite y error automatizados. |
| Integración | Conecta capas y reemplaza dobles por infraestructura controlada. | Diagrama, contratos y prueba de integración. |
| Experto | calidad, seguridad y rendimiento. | Perfil o threat model, telemetría y runbook de recuperación. |

Al iniciar cada laboratorio crea una rama `modulo-N`, implementa el incremento, verifica el criterio de éxito y fusiona solo con pruebas verdes. Si un módulo necesita un experimento aislado, colócalo en `experiments/modulo-N/`; el producto acumulativo permanece ejecutable. Al terminar, otra persona debe poder clonar el repositorio y reproducir el último hito siguiendo únicamente el README.


## Laboratorio práctico

**Objetivo del laboratorio:** ejecutar el mismo código base en el navegador y en Node.js, demostrando dominio de variables, tipos, coerción, template literals y scope.

**Requisitos previos:** un navegador moderno con herramientas de desarrollador, Node.js instalado (verificar con `node --version`), un editor de texto.

| Paso | Acción | Comando/Código | Explicación |
|---|---|---|---|
| 1 | Abrir la consola del navegador | F12 → pestaña Console | Entorno interactivo para experimentar rápido |
| 2 | Declarar variables con let y const | `let contador = 0; const PI = 3.1416; contador = 1;` intenta `PI = 3;` | Observa el `TypeError` al reasignar `const` |
| 3 | Crear el archivo `fundamentos.mjs` | Declarar una variable de cada uno de los 7 tipos primitivos | La extensión `.mjs` fuerza a Node a interpretar el archivo como ESM |
| 4 | Ejecutar el script en Node | `node fundamentos.mjs` | Verifica que Node ejecuta el mismo JavaScript que el navegador |
| 5 | Comparar `==` frente a `===` | `console.log(1 == "1", 1 === "1")` en ambos entornos | Debe imprimir `true false` idéntico en navegador y Node |
| 6 | Probar `typeof` sobre los 7 tipos | `typeof null`, `typeof undefined`, etc. | Anota especialmente el resultado de `typeof null` |
| 7 | Demostrar scope de bloque | Declarar la misma variable `let` dentro de dos bloques `{}` distintos sin conflicto | Confirma que no hay colisión entre scopes de bloque separados |

**Verificación:** el laboratorio se considera exitoso si el script `fundamentos.mjs` ejecuta sin errores tanto pegado en la consola del navegador (ajustando la sintaxis de módulos si es necesario) como con `node fundamentos.mjs`, produciendo exactamente la misma salida en ambos casos.

**Errores comunes y soluciones**

- **`SyntaxError: Cannot use import statement outside a module` al ejecutar con Node.** Asegúrate de que el archivo tenga extensión `.mjs`, o que el `package.json` del proyecto tenga `"type": "module"`.
- **Confundir `null` y `undefined` en las comparaciones.** Recuerda: `undefined` es lo que JavaScript asigna automáticamente; `null` es lo que un desarrollador asigna deliberadamente para indicar ausencia intencional de valor.
- **Usar `==` sin darse cuenta y obtener un resultado "raro".** Si una comparación da un resultado inesperado, la primera pregunta a hacerse es si se usó `==` en vez de `===`; reemplázalo y observa si el resultado cambia.

---
