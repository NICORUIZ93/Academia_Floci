# Módulo 2: Scope, closures y el modelo de ejecución

## Sílabo

**Objetivo general**

Entender qué ocurre "por dentro" cuando se ejecuta código JavaScript: el call stack, el hoisting, la Temporal Dead Zone, y por qué un closure es capaz de "recordar" variables de un entorno que, en apariencia, ya debería haber terminado de existir.

**Objetivos específicos**

1. Explicar el scope léxico y demostrar un closure funcional propio.
2. Diferenciar hoisting de declaraciones de funciones frente a hoisting de variables con TDZ.
3. Razonar sobre el call stack y diagnosticar un stack overflow.
4. Determinar el valor de `this` según la forma de invocación de una función.
5. Usar `call`, `apply` y `bind` para fijar `this` explícitamente.
6. Implementar el module pattern y factory functions usando closures.

**Contenido**

- Scope léxico y closures.
- Hoisting y Temporal Dead Zone.
- Call stack y contexto de ejecución.
- `this` según el modo de invocación.
- Module pattern y factory functions.
- Execution Context, Scope Chain y Lexical Environment.

**Evaluación**

Implementación de un contador privado y un módulo con estado usando closures, más tres ejercicios de evaluación sobre closures, TDZ y `this`.

---

## Aprende construyendo

### Tema 1: Scope léxico y closures

**Conceptos clave:** scope léxico, closure, variable privada, entorno capturado.

El scope léxico significa que el alcance de una variable se determina por dónde está escrita físicamente en el código fuente (su posición "léxica"), no por dónde se invoca la función en tiempo de ejecución. Una función definida dentro de otra tiene acceso a las variables de la función contenedora, sin importar desde dónde se llame después esa función interna; este acceso permanece fijo según la estructura del código, no según el flujo dinámico de ejecución.

Un closure ocurre cuando una función "recuerda" y mantiene acceso a las variables de su entorno de creación, incluso después de que ese entorno (la ejecución de la función contenedora) haya terminado formalmente. El ejemplo canónico, `createCounter()`, define una variable local `valor` y devuelve un objeto con tres funciones (`increment`, `decrement`, `value`) que la referencian; aunque la ejecución de `createCounter()` termina inmediatamente después de devolver ese objeto, las tres funciones devueltas siguen teniendo acceso a `valor`, porque mantienen una referencia activa a su entorno léxico de creación, evitando que el motor de JavaScript libere esa memoria mediante el recolector de basura (que se estudiará con más detalle en el Módulo 5, en el contexto del motor V8).

Este mecanismo es lo que permite crear variables verdaderamente privadas en JavaScript sin depender de sintaxis especial: `valor` es inaccesible desde fuera de las funciones devueltas por `createCounter()`, no existe ninguna forma de leerla o modificarla directamente salvo a través de la interfaz controlada (`increment`, `decrement`, `value`) que la función expone deliberadamente. Este patrón de "estado privado + interfaz pública controlada" precede históricamente a la introducción de campos privados reales con `#` en clases (vista en el Módulo 3), y sigue siendo ampliamente usado, especialmente en código funcional que no usa clases.

Es importante notar que cada invocación de `createCounter()` crea un entorno completamente nuevo e independiente: `const contadorA = createCounter(); const contadorB = createCounter();` produce dos contadores con sus propias variables `valor` privadas, totalmente aisladas entre sí, aunque ambas fueron creadas por la misma función. Esto es consecuencia directa de que cada llamada a una función crea un nuevo Execution Context (contexto de ejecución, discutido en el Tema 6), con su propio Lexical Environment (entorno léxico) asociado.

**Analogía:** un closure es como un investigador que, tras terminar formalmente un proyecto de investigación en un laboratorio, se lleva consigo un cuaderno de notas privado con los datos exactos de ese proyecto; aunque el laboratorio (la ejecución de la función contenedora) ya cerró, el investigador (la función devuelta) sigue teniendo acceso completo a esas notas específicas, sin que nadie más externo pueda leerlas directamente.

**¿Por qué es importante?** Los closures son el mecanismo fundamental detrás de patrones extremadamente comunes en JavaScript: variables privadas, factory functions, memoización (Módulo 10), y el propio modelo de Hooks de React, que depende internamente de closures para mantener el estado entre renderizados.

**Diagrama:**

```
function createCounter() {
  let valor = 0;              ← variable privada capturada por closure
  return {
    increment: () => ++valor,  ← estas funciones "recuerdan" valor
    value: () => valor,          aunque createCounter() ya terminó
  };
}
const c1 = createCounter();  // valor propio e independiente
const c2 = createCounter();  // otro valor, totalmente aislado de c1
```

### Tema 2: Hoisting y Temporal Dead Zone

**Conceptos clave:** hoisting de declaraciones, TDZ de let/const, orden de evaluación.

El hoisting es el comportamiento por el cual el motor de JavaScript procesa ciertas declaraciones antes de ejecutar el código línea por línea, "elevándolas" conceptualmente al inicio de su scope. Las function declarations se hoistean completas (cuerpo incluido), lo que permite invocarlas antes de su línea de definición en el código fuente, como se vio en el Módulo 1. Las declaraciones `var` se hoistean solo su existencia, inicializadas automáticamente con `undefined`, de modo que leerlas antes de su asignación no lanza error, simplemente devuelve `undefined` silenciosamente.

`let` y `const` también se hoistean —técnicamente existen desde el inicio de su scope de bloque— pero permanecen en la Temporal Dead Zone (TDZ) hasta que la línea de su declaración se ejecuta efectivamente. Intentar leerlas dentro de la TDZ no devuelve `undefined` silenciosamente como haría `var`, sino que lanza un `ReferenceError: Cannot access 'x' before initialization`, un error explícito y fácil de diagnosticar. Este diseño deliberado de la TDZ fue introducido específicamente para hacer que errores de orden de código, que con `var` fallaban silenciosamente, se conviertan en errores ruidosos y detectables durante el desarrollo.

Es fundamental distinguir la TDZ de un simple "todavía no declarada": la variable técnicamente ya existe en el motor interno de JavaScript desde el inicio del bloque (por eso el error dice "before initialization", antes de inicialización, y no "is not defined", no está definida), pero el acceso está bloqueado deliberadamente hasta el punto exacto de su declaración en el código. Esta distinción técnica explica por qué el mensaje de error de la TDZ es diferente del mensaje que se obtiene al referenciar una variable que jamás fue declarada en absoluto en ningún scope accesible.

Comprender el hoisting con precisión evita errores de razonamiento comunes, como asumir que declarar una variable con `let` en cualquier punto del código la hace disponible desde el inicio de la función solo porque técnicamente "ya existe" en el motor; en la práctica, para todo propósito de uso correcto del código, una variable `let`/`const` debe tratarse como si no existiera en absoluto hasta la línea exacta de su declaración.

**Analogía:** el hoisting de `var` es como reservar una mesa en un restaurante con antelación, donde la mesa existe (está reservada) pero la comida ("el valor real") aún no ha llegado y se sirve automáticamente un plato vacío (`undefined`) si preguntas antes de tiempo; la TDZ de `let`/`const` es como una mesa que existe en el plano del restaurante pero está físicamente bloqueada con una cinta hasta el momento exacto de la reserva, y cualquiera que intente sentarse antes recibe una alarma inmediata (`ReferenceError`) en vez de servírsele algo vacío silenciosamente.

**¿Por qué es importante?** Entender la TDZ con precisión es la base para depurar correctamente errores de "variable no accesible" en código moderno con `let`/`const`, distinguiéndolos de errores genuinos de variable jamás declarada.

**Diagrama:**

```
{
  // TDZ de x comienza aquí (existe pero bloqueada)
  console.log(x); // ReferenceError: Cannot access 'x' before initialization
  let x = 5;      // TDZ termina aquí
  console.log(x); // 5, acceso normal
}
```

### Tema 3: Call stack y contexto de ejecución

**Conceptos clave:** call stack, frame de ejecución, recursión, stack overflow.

Cada vez que se invoca una función, el motor de JavaScript crea un nuevo "frame" (marco) de ejecución y lo apila sobre el call stack (pila de llamadas), una estructura de datos LIFO (último en entrar, primero en salir) que registra la secuencia de funciones actualmente en ejecución. Cuando una función retorna (termina su ejecución), su frame se desapila, y el control vuelve al frame anterior, exactamente en el punto donde había quedado pausado esperando el resultado de la llamada.

Una función recursiva —una función que se llama a sí misma— apila un nuevo frame en cada invocación recursiva, y cada frame consume una porción finita de memoria. Si la recursión no tiene un caso base que detenga las llamadas recursivas (o si el caso base nunca se alcanza debido a un error lógico), el call stack crece indefinidamente hasta agotar el límite de memoria asignado, lanzando el error `RangeError: Maximum call stack size exceeded`, comúnmente conocido como "stack overflow".

Leer un stack trace (la traza que JavaScript imprime automáticamente al lanzar cualquier error, incluyendo un stack overflow) es una habilidad de depuración fundamental: la traza lista, en orden, cada frame que estaba activo en el momento del error, permitiendo identificar exactamente la cadena de llamadas que condujo al problema. En el caso de una recursión sin caso base, la traza típicamente muestra la misma función repetida cientos de veces consecutivas, una señal inequívoca de recursión descontrolada que ayuda a localizar rápidamente el origen del bug.

El call stack también explica por qué JavaScript es fundamentalmente síncrono en su ejecución de código normal (no asíncrono): mientras el call stack no esté vacío, el motor no puede procesar ninguna otra tarea pendiente, incluyendo callbacks de temporizadores o promesas resueltas (el mecanismo completo del Event Loop, que coordina el call stack con las colas de tareas asíncronas, se estudiará en profundidad en el Módulo 5).

**Analogía:** el call stack es como una pila de bandejas en una cafetería de autoservicio: cada vez que alguien coge una tarea nueva (invoca una función), se apila una bandeja nueva encima; cuando termina esa tarea (la función retorna), se retira la bandeja superior y se vuelve a la que estaba debajo. Una recursión sin caso base es como seguir apilando bandejas sin nunca retirar ninguna, hasta que la pila colapsa por su propio peso (stack overflow).

**¿Por qué es importante?** Entender el call stack es indispensable para depurar recursiones descontroladas, para leer cualquier stack trace de error con criterio, y como base conceptual necesaria antes de abordar el Event Loop en el Módulo 5.

**Diagrama:**

```
factorial(3) invocado:
┌─────────────────────┐
│ factorial(1) → 1       │ ← tope de la pila, retorna primero
├─────────────────────┤
│ factorial(2)             │
├─────────────────────┤
│ factorial(3)             │ ← base de la pila, invocada primero
└─────────────────────┘
```

### Tema 4: this según el modo de invocación

**Conceptos clave:** `this` dinámico, invocación como método, `call`/`apply`/`bind`.

A diferencia de la mayoría de variables en JavaScript, cuyo valor se determina por scope léxico (dónde está escrita la función), el valor de `this` dentro de una función normal (no arrow) se determina por cómo se invoca esa función, no por dónde se define. La misma función exacta puede tener valores completamente distintos de `this` según la sintaxis de invocación: invocada como método de un objeto (`obj.metodo()`), `this` apunta a `obj`; invocada como función suelta (`const fn = obj.metodo; fn()`), `this` es `undefined` en modo estricto (o el objeto global en modo no estricto); invocada con `new` (`new Constructor()`), `this` apunta a la instancia recién creada.

Las arrow functions rompen deliberadamente esta regla dinámica: no tienen su propio `this` en absoluto, y en su lugar heredan (capturan léxicamente, como un closure) el `this` del scope donde fueron definidas. Esto explica por qué un método de objeto definido como arrow function (`obj = { nombre: "Ana", flecha: () => this?.nombre }`) no apunta a `obj` al invocarse como `obj.flecha()`: la arrow function captura el `this` del scope léxico externo (típicamente el módulo o el objeto global), no el de `obj`, sin importar cómo se invoque después.

`call`, `apply` y `bind` son tres métodos disponibles en toda función normal que permiten fijar explícitamente el valor de `this` en una invocación, en vez de dejar que se determine implícitamente por la sintaxis de la llamada. `fn.call(contexto, arg1, arg2)` invoca `fn` inmediatamente con `this` fijado a `contexto` y los argumentos listados individualmente; `fn.apply(contexto, [arg1, arg2])` hace lo mismo pero recibiendo los argumentos como un array; `fn.bind(contexto)` no invoca la función inmediatamente, sino que devuelve una nueva función con `this` permanentemente fijado a `contexto`, útil quando se necesita pasar una referencia a la función (por ejemplo, como callback de un evento) preservando su `this` original.

Comprender profundamente esta mecánica de `this` es esencial antes de trabajar con clases (Módulo 3), donde es común encontrarse con el bug clásico de pasar un método de una instancia como callback (`boton.addEventListener("click", instancia.metodo)`) y descubrir que, al invocarse, `this` dentro de `metodo` ya no apunta a `instancia`, sino que es `undefined`, precisamente porque la forma de invocación cambió (ya no es `instancia.metodo()`, sino una invocación suelta disparada por el listener de eventos).

**Analogía:** `this` es como un pronombre que se refiere a "quien está hablando en este momento", y depende de quién pronuncia la frase, no de dónde se escribió el guion originalmente; `bind` es como grabar esa frase en un audio permanente donde el hablante queda fijado para siempre, sin importar quién reproduzca después la grabación.

**¿Por qué es importante?** El comportamiento dinámico de `this` es una de las características más distintivas (y más propensas a confusión) de JavaScript frente a otros lenguajes orientados a objetos, y dominarlo es un prerequisito indispensable para trabajar con clases, event listeners, y frameworks que dependen de callbacks de métodos.

**Diagrama:**

```
const obj = { nombre: "Ana", normal() { return this.nombre; } };
obj.normal();                    // "Ana" — invocado como método
const suelto = obj.normal;
suelto();                         // undefined — invocado suelto, this perdido
const fijado = obj.normal.bind(obj);
fijado();                         // "Ana" — this fijado permanentemente con bind
```

### Tema 5: Module pattern y factory functions

**Conceptos clave:** module pattern, factory function, encapsulación sin clases.

El module pattern es una técnica, anterior a la existencia de módulos ESM nativos (Módulo 7), que usa una IIFE (Módulo 1) combinada con closures para crear un scope privado con estado interno y una interfaz pública controlada, exactamente el mismo principio que `createCounter()` del Tema 1 pero aplicado típicamente a un módulo completo de funcionalidad relacionada, en vez de a una única pieza de estado simple. Aunque los módulos ESM han reemplazado en gran medida la necesidad práctica de este patrón para organizar código en archivos separados, el mecanismo subyacente de "closure como encapsulación" sigue siendo directamente relevante y ampliamente usado dentro de un mismo archivo o función.

Una factory function es, simplemente, cualquier función que devuelve un nuevo objeto cada vez que se invoca, encapsulando la lógica de construcción de ese objeto en un único lugar reutilizable, sin necesidad de usar `class` ni `new`. `createCounter()` del Tema 1 es, en sí misma, una factory function: cada invocación produce un objeto nuevo e independiente, con su propio estado privado capturado por closure. Este enfoque es una alternativa completamente válida a las clases para modelar objetos con estado y comportamiento, y algunos desarrolladores la prefieren explícitamente por evitar la complejidad adicional de `this`, `new` y la cadena de prototipos, apoyándose en cambio exclusivamente en closures, que tienen una semántica más simple y predecible de scope léxico puro.

La elección entre factory functions (basadas en closures) y clases (basadas en prototipos, Módulo 3) no tiene una respuesta universal correcta: las clases ofrecen herencia formal con `extends`/`super` y son la convención dominante en frameworks como Angular; las factory functions evitan por completo la complejidad dinámica de `this` (cada método definido dentro de la factory captura el estado por closure de forma directa y predecible, sin depender de cómo se invoque después), lo cual algunos equipos consideran una ventaja de simplicidad y previsibilidad frente a las clases.

En la práctica, es común encontrar ambos enfoques conviviendo dentro de una misma base de código: clases para modelar jerarquías de objetos con herencia explícita y bien definida, y factory functions para módulos de utilidad con estado simple donde la encapsulación por closure resulta más directa y con menos superficie de error potencial que gestionar manualmente el valor de `this`.

**Analogía:** una factory function es como una línea de producción que entrega, en cada pedido, un producto completamente nuevo y ensamblado según una especificación fija, con todas sus piezas internas ya montadas y ocultas dentro de una carcasa sellada (el closure), sin que el comprador final necesite entender ni pueda acceder directamente a los mecanismos internos.

**¿Por qué es importante?** Las factory functions son una alternativa legítima y ampliamente usada a las clases para encapsular estado y comportamiento, y entender ambos enfoques (closures frente a prototipos/clases) da flexibilidad real para elegir la herramienta más apropiada según el contexto específico de cada problema.

**Diagrama:**

```
Factory function (closure):        Clase (prototipo):
function crearContador() {          class Contador {
  let valor = 0;                      #valor = 0;
  return {                            increment() { return ++this.#valor; }
    increment: () => ++valor,       }
  };                                 const c = new Contador();
}                                    c.increment(); // depende de `this`
const c = crearContador();
c.increment(); // sin depender de `this`
```

### Tema 6: Execution Context, Scope Chain y Lexical Environment

**Conceptos clave:** Execution Context, Scope Chain, Lexical Environment, Global Execution Context.

Cada vez que el motor de JavaScript ejecuta código —ya sea el script completo al cargar, o el cuerpo de una función al invocarse— crea una estructura interna llamada Execution Context (contexto de ejecución), que contiene, entre otra información, el Lexical Environment (entorno léxico) correspondiente: un registro de todas las variables y funciones declaradas en ese contexto, junto con una referencia al Lexical Environment del contexto contenedor (el scope "padre" léxicamente). Esta referencia encadenada hacia el contexto padre es lo que se llama la Scope Chain (cadena de scope): cuando el motor necesita resolver una variable que no encuentra en el contexto actual, la busca sucesivamente en cada Lexical Environment de la cadena, hacia afuera, hasta llegar eventualmente al Global Execution Context (el contexto más externo de todos).

Este mecanismo interno es, precisamente, lo que hace posible el scope léxico y los closures descritos en el Tema 1: cuando una función interna se define dentro de otra, su Lexical Environment mantiene una referencia al Lexical Environment de la función contenedora, y esa referencia persiste (evitando que el recolector de basura libere esa memoria) mientras exista alguna función que aún la necesite, incluso después de que la ejecución de la función contenedora original haya terminado formalmente.

Es importante distinguir la Scope Chain (determinada estáticamente por dónde está escrito el código, resuelta en cada acceso a variable) de la Call Stack del Tema 3 (determinada dinámicamente por el orden real de invocación de funciones en tiempo de ejecución): ambas son estructuras distintas que coexisten, una gestionando la resolución de variables, la otra gestionando el orden de ejecución y retorno de funciones. Confundir ambas es un error conceptual común, pero comprender que son mecanismos independientes (aunque relacionados) es clave para razonar correctamente sobre el comportamiento completo del motor de JavaScript.

Aunque estos términos —Execution Context, Lexical Environment, Scope Chain— rara vez se usan explícitamente en el código cotidiano, entenderlos conceptualmente proporciona un modelo mental preciso y verificable de por qué el scope léxico y los closures funcionan exactamente como funcionan, en vez de simplemente memorizar el comportamiento observado sin entender su causa subyacente en el diseño del motor.

**Analogía:** el Lexical Environment de cada función es como una libreta de contactos personal que, además de sus propios contactos, incluye una referencia a la libreta de contactos de la persona que la "presentó" originalmente en la organización; si buscas un contacto que no está en tu libreta, consultas automáticamente la libreta de quien te presentó, y así sucesivamente hacia arriba en la jerarquía, hasta llegar a la libreta general de toda la organización (el scope global).

**¿Por qué es importante?** Este modelo formal (aunque interno y rara vez visible directamente) es lo que sustenta y explica con precisión todo el comportamiento de scope y closures estudiado en este módulo, dando una base conceptual sólida en vez de reglas memorizadas sin justificación subyacente.

**Diagrama:**

```
Global Execution Context (Lexical Environment global)
        │
        ▼ (Scope Chain)
Execution Context de funciónExterna (su Lexical Environment)
        │
        ▼ (Scope Chain)
Execution Context de funciónInterna (su Lexical Environment)
   busca una variable no local → sube por la Scope Chain
   hasta encontrarla, o hasta llegar al global sin encontrarla
   (ReferenceError si nunca se encuentra)
```

---

## Criterio transversal de calidad del código

Aplica estas decisiones en todos los ejemplos y en tu entrega:

- usa nombres que expresen intención, dominio y unidades; evita `data`, `temp`, `manager` o `process` cuando exista un término preciso;
- mantén funciones, componentes, clases, consultas y módulos cohesionados alrededor de una responsabilidad comprobable;
- haz visibles las dependencias y los efectos de red, tiempo, archivos, estado y base de datos;
- valida entradas en la frontera y representa errores con contexto, sin ocultar la causa ni registrar secretos;
- elimina duplicación de reglas, no toda repetición textual; una abstracción incorrecta cuesta más que dos líneas parecidas;
- escribe primero la solución más simple que satisface el requisito y refactoriza con pruebas verdes;
- aplica SOLID únicamente cuando exista una necesidad real de cambio, extensión, sustitución o aislamiento.

**SOLID con criterio:** responsabilidad única significa una razón coherente de cambio, no una clase por función. Abierto/cerrado justifica estrategias cuando hay variantes reales. Sustitución exige respetar contratos. Segregación evita obligar a consumidores a depender de operaciones que no usan. Inversión de dependencias protege el dominio frente a detalles externos; no exige crear interfaces para cada objeto.

**Comprobación antes de continuar:** ¿otra persona puede entender los nombres y el flujo?, ¿los casos de error son observables?, ¿una prueba demuestra la regla principal?, ¿cada abstracción aporta más claridad de la que cuesta? Registra una decisión de refactorización y una decisión consciente de *no abstraer*.

## Laboratorio práctico

**Objetivo del laboratorio:** implementar closures funcionales reales (contador privado y módulo con estado), y demostrar experimentalmente el comportamiento de la TDZ, el call stack y `this`.

**Requisitos previos:** Node.js o consola del navegador, Módulos 0 y 1 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Implementar `createCounter()` | Ver Tema 1 | Verifica que dos instancias tienen estado independiente |
| 2 | Demostrar la TDZ | `console.log(x); let x = 5;` | Captura y examina el `ReferenceError` exacto |
| 3 | Reproducir el bug clásico de `var` en un loop | `for (var i=0;i<3;i++) setTimeout(()=>console.log(i), 0);` luego con `let` | Observa que `var` imprime `3,3,3` y `let` imprime `0,1,2` |
| 4 | Comparar `this` en método normal y arrow | Ver Tema 4 | Invoca ambos como `obj.metodo()` y compara resultados |
| 5 | Usar `call`, `apply` y `bind` | Invoca la misma función con 3 contextos distintos de `this` | Verifica que cada mecanismo produce el resultado esperado |
| 6 | Provocar un stack overflow deliberado | Recursión sin caso base | Lee el stack trace y localiza la función repetida |

**Verificación:** el laboratorio se considera exitoso si `createCounter()` produce instancias con estado verdaderamente independiente, si el bug de `var` en el loop se reproduce y se corrige con `let`, y si el stack trace del stack overflow se lee e interpreta correctamente.

**Errores comunes y soluciones**

- **Esperar que `let` en un loop comparta la misma variable entre iteraciones (comportamiento de `var`).** Recuerda que `let` crea un nuevo binding por cada iteración del bucle, resolviendo exactamente el bug clásico de closures dentro de loops con `var`.
- **Pasar un método de una instancia como callback y perder `this`.** Usa `.bind(instancia)` explícitamente, o una arrow function que capture `this` léxicamente, al pasar el método como referencia a un callback.
- **Confundir la Scope Chain con el Call Stack.** Recuerda: la Scope Chain resuelve variables según dónde está escrito el código; el Call Stack gestiona el orden de invocación y retorno de funciones en tiempo de ejecución. Son mecanismos distintos.

---


## Rúbrica del proyecto

Esta rúbrica evalúa el laboratorio y los ejercicios como evidencia de dominio, no la mera finalización de pasos.

| Criterio | Peso | Evidencia esperada |
|---|---:|---|
| Comprensión conceptual | 20% | Explica el mecanismo, sus límites y por qué la solución funciona. |
| Implementación funcional | 30% | El artefacto satisface requisitos normales, límite y de error. |
| Verificación | 20% | Incluye pruebas, mediciones o inspecciones reproducibles. |
| Diseño y calidad | 15% | Nombres, estructura, seguridad y mantenibilidad son deliberados. |
| Comunicación profesional | 15% | README, decisiones, comandos y resultados permiten repetir el trabajo. |

Se alcanza competencia con 70/100 y sin cero en implementación o verificación. El nivel experto exige comparar alternativas, justificar trade-offs y reconocer condiciones donde la solución dejaría de ser válida.

## Bibliografía y fundamento académico

Estas fuentes sustentan los conceptos y deben consultarse para verificar detalles que cambian entre versiones:

- ECMA International, *ECMAScript Language Specification*.
- MDN Web Docs, guías de JavaScript y Web APIs.
- WHATWG, *HTML Living Standard* y *Fetch Standard*.
- ACM/IEEE-CS/AAAI, *Computer Science Curricula 2023*.
- IEEE Computer Society, *SWEBOK Guide V4.0*.

## Resumen del módulo

**Puntos clave**

- El scope léxico determina el alcance de una variable según dónde está escrita en el código, no según dónde se invoca la función.
- Un closure permite que una función "recuerde" el entorno de su creación, incluso después de que ese entorno terminó de ejecutarse.
- La TDZ convierte errores de orden con `let`/`const` en errores explícitos, a diferencia del comportamiento silencioso de `var`.
- El call stack gestiona el orden de invocación y retorno de funciones; una recursión sin caso base lo desborda (stack overflow).
- `this` se determina dinámicamente por cómo se invoca una función normal; las arrow functions capturan `this` léxicamente en su lugar.
- `call`, `apply` y `bind` permiten fijar `this` explícitamente; factory functions basadas en closures son una alternativa a las clases.

**Conceptos aprendidos**

- Closures y su aplicación en variables privadas y módulos con estado.
- Hoisting detallado y la Temporal Dead Zone.
- Call stack, recursión y diagnóstico de stack overflow.
- Determinación dinámica de `this` y las herramientas `call`/`apply`/`bind`.
- Module pattern y factory functions como alternativa a clases.
- Execution Context, Lexical Environment y Scope Chain como modelo formal subyacente.

**Próximos pasos**

En el Módulo 3 aplicarás estos conceptos al sistema de objetos y clases de JavaScript: prototipos, `class`/`extends`/`super`, y encapsulación real con campos privados.

**Recursos adicionales**

- MDN Web Docs: "Closures" y "this".
- El libro "You Don't Know JS: Scope & Closures" (Kyle Simpson).
- ECMA-262 (especificación del lenguaje) sección sobre Execution Contexts, para quien quiera el detalle formal completo.
