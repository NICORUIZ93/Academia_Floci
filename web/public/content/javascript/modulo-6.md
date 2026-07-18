# Módulo 6: Asincronía II — async/await y fetch

## Sílabo

**Objetivo general**

Escribir código asíncrono que se lee como código síncrono usando `async`/`await`, con manejo explícito de errores, cancelación de peticiones y patrones robustos de reintento y timeout.

**Objetivos específicos**

1. Reescribir cadenas de `.then()` como funciones `async` con `try/catch` equivalente.
2. Consumir una API pública con `fetch`, manejando errores de red y de estado HTTP.
3. Implementar cancelación de peticiones con `AbortController`.
4. Diseñar una función de reintentos con backoff.
5. Implementar un timeout manual combinando `Promise.race`.
6. Explicar generadores (`function*`, `yield`) y Proxies a nivel introductorio.

**Contenido**

- `async`/`await` sobre promesas.
- `try`/`catch` en flujos asíncronos.
- `fetch` API y `AbortController`.
- Reintentos y timeouts manuales.
- Generadores: `function*`, `yield` y `yield*`.
- Proxies y Reflect: traps `get`/`set`/`has`.

**Evaluación**

Un cliente que consume una API pública con reintentos, timeout y cancelación, más tres ejercicios de evaluación.

---

## Comienza desde cero: prepara este capítulo

Este recorrido parte de una carpeta vacía. Al finalizar tendrás **Un cliente que consume una API pública con reintentos, timeout y cancelación, más tres ejercicios de evaluación.** No avances ejecutando comandos que no comprendes: primero identifica la entrada, la transformación y la evidencia que comprobará el resultado.

### 1. Comprueba las herramientas

Los comandos funcionan en macOS, Linux y WSL. En PowerShell usa el equivalente indicado por la herramienta.

```bash
node --version
npm --version
git --version
```

Si un comando no existe, detente e instala esa herramienta desde su sitio oficial. Cierra y abre la terminal después de modificar `PATH`. Las versiones deben ser compatibles entre sí antes de crear archivos.

### 2. Crea o recupera el proyecto del track

```bash
npm create vite@latest academia-labs/javascript -- --template vanilla-ts
cd academia-labs/javascript
npm install
git init
```

Trabaja dentro de `academia-labs/javascript`. Si ya existe, no lo vuelvas a generar: entra en la carpeta, confirma `git status` y continúa sobre una rama propia.

### 3. Ubica cada tema antes de escribir

```text
academia-labs/javascript/
├─ src/
│  └─ module-6/
├─ tests/
├─ docs/decisions/
├─ evidence/module-6/
└─ README.md
```

| Tema | Archivo o decisión | Evidencia mínima |
|---|---|---|
| 1. async/await sobre promesas | `src/module-6/topic-1-async-await-sobre-promesas.ts` | prueba + salida observable |
| 2. try/catch en flujos asíncronos | `src/module-6/topic-2-try-catch-en-flujos-asincronos.ts` | prueba + salida observable |
| 3. fetch API y AbortController | `src/module-6/topic-3-fetch-api-y-abortcontroller.ts` | prueba + salida observable |
| 4. Reintentos y timeouts manuales | `src/module-6/topic-4-reintentos-y-timeouts-manuales.ts` | prueba + salida observable |
| 5. Generadores — function*, yield y yield* | `src/module-6/topic-5-generadores-function-yield-y-yield.ts` | prueba + salida observable |
| 6. Proxies y Reflect | `src/module-6/topic-6-proxies-y-reflect.ts` | prueba + salida observable |

Un ejemplo técnico vive en el archivo indicado y debe tener una prueba. Un tema conceptual vive en `docs/decisions/`: compara opciones usando restricciones medibles; no escribas código decorativo solo para llenar espacio.

### 4. Ejecuta una línea base

Desde `academia-labs/javascript`:

```bash
npm test && npm run dev
```

**Resultado esperado:** el comando reconoce el proyecto y termina sin errores antes de introducir el cambio del capítulo. Después del incremento, la evidencia debe demostrar: **Un cliente que consume una API pública con reintentos, timeout y cancelación, más tres ejercicios de evaluación.**

Si falla la línea base, no continúes. Localiza el primer mensaje que indique archivo, línea o dependencia; formula una causa y compruébala con un cambio pequeño.

### 5. Provoca un fallo y recupérate

Prueba un valor límite, un tipo inesperado o una operación fuera de orden; compara la salida con tu predicción. Guarda en `evidence/module-6/` el comando, la salida relevante, tu hipótesis y la corrección. Revierte únicamente el cambio deliberado; no borres todo el proyecto para ocultar la causa.

### 6. Conecta el capítulo con RutaFlow

Aplica el aprendizaje de **Asincronía II — async/await y fetch** a un incremento vertical de RutaFlow. Define qué componente produce el dato, qué contrato lo transporta, quién lo consume y cómo observarás un fallo. La entrega final incluye archivo o decisión, prueba, salida, error corregido y una limitación que todavía validarías en producción.

---

## Contenido teórico

### Tema 1: async/await sobre promesas

**Conceptos clave:** azúcar sintáctica sobre Promesas, pausa no bloqueante, legibilidad secuencial.

`async`/`await`, introducido en ES2017, no es un mecanismo de concurrencia distinto de las Promesas estudiadas en el Módulo 5: es sintaxis construida directamente encima de ellas, diseñada para que el código asíncrono se lea de forma secuencial y familiar, en vez de encadenar múltiples `.then()`. Declarar una función con la palabra clave `async` garantiza que esa función siempre devuelve una Promesa (incluso si internamente retorna un valor simple, JavaScript lo envuelve automáticamente en una Promesa resuelta), y habilita el uso de `await` dentro de su cuerpo.

`await` pausa la ejecución de la función `async` (no del programa completo, ni del hilo único de JavaScript) hasta que la Promesa a su derecha se resuelve, devolviendo entonces el valor resuelto directamente como si fuera una expresión síncrona normal. Es fundamental entender que esta "pausa" no bloquea el hilo principal de ejecución: mientras la función `async` está pausada esperando un `await`, el Event Loop (Módulo 5) sigue libre para procesar otras tareas pendientes (otros eventos, otras funciones), y solo cuando la Promesa esperada se resuelve, la ejecución de esa función específica se reanuda, como una microtask.

Esta distinción —pausa de una función específica frente a bloqueo del hilo completo— es la razón por la que `async`/`await` no sacrifica ninguna de las propiedades no bloqueantes de JavaScript: es exactamente el mismo modelo de concurrencia basado en Promesas y en el Event Loop, simplemente expresado con una sintaxis que se lee de arriba a abajo como código síncrono tradicional, en vez de requerir seguir visualmente una cadena de callbacks anidados o de `.then()` encadenados.

Reescribir una cadena de `.then().then().catch()` como una función `async` con `try/catch` no cambia el comportamiento en tiempo de ejecución (ambas formas son, en el fondo, exactamente las mismas Promesas resolviéndose de la misma manera), pero mejora sustancialmente la legibilidad, especialmente cuando hay lógica condicional o manejo de errores intercalado entre pasos asíncronos sucesivos, un escenario donde el anidamiento de `.then()` puede volverse difícil de seguir visualmente.

**Analogía:** `async`/`await` es como leer una receta de cocina escrita en pasos secuenciales normales ("hierve el agua, luego añade la pasta, luego escurre"), en vez de la misma receta escrita como una cadena de instrucciones condicionales anidadas ("cuando el agua hierva, entonces añade la pasta, y cuando la pasta esté lista, entonces escurre"); el resultado final es idéntico, pero la primera forma se sigue con mucha menos carga cognitiva.

**¿Por qué es importante?** `async`/`await` es la forma dominante y recomendada de escribir código asíncrono en JavaScript moderno, y entender que es sintaxis sobre Promesas (no un mecanismo distinto) evita confusiones sobre cómo interactúa con el Event Loop y con los combinadores de Promesas del Módulo 5.

**Diagrama:**

```
// Con .then():                        // Con async/await (equivalente):
fetch(url)                              async function obtener() {
  .then(r => r.json())                    const r = await fetch(url);
  .then(datos => procesar(datos))          const datos = await r.json();
  .catch(err => manejar(err));             return procesar(datos);
                                         } // errores: envolver en try/catch
```

### Tema 2: try/catch en flujos asíncronos

**Conceptos clave:** captura de rechazos, manejo explícito de errores, propagación de excepciones asíncronas.

Dentro de una función `async`, un `await` sobre una Promesa que se rechaza lanza una excepción síncrona equivalente en el punto exacto del `await`, que puede capturarse con un bloque `try/catch` normal, exactamente igual que cualquier error síncrono. Esto es lo que permite que el manejo de errores asíncronos se exprese con la misma sintaxis familiar de manejo de errores síncronos, en vez de requerir un segundo argumento o un `.catch()` separado como en la cadena de Promesas tradicional.

Es crítico rodear con `try/catch` cualquier `await` cuya Promesa pueda rechazarse de forma esperada (por ejemplo, una petición de red que puede fallar por conectividad, o un servidor que puede responder con un código de error); omitir el manejo de errores en una función `async` no hace que el error desaparezca, sino que la Promesa devuelta por la función `async` completa se rechaza con esa misma razón, propagando la responsabilidad de manejarlo hacia quien haya invocado la función, y si nadie en la cadena lo maneja finalmente, se produce una advertencia de "unhandled promise rejection", el mismo problema mencionado en el Módulo 5 para Promesas no capturadas.

Un patrón común y recomendado es manejar el error lo más cerca posible del punto donde tiene sentido decidir qué hacer al respecto: mostrar un mensaje al usuario, reintentar la operación, o usar un valor por defecto, en vez de dejar que el error se propague silenciosamente hacia capas superiores del programa que quizás no tengan suficiente contexto para decidir la respuesta apropiada. `fetch` tiene una particularidad importante que sorprende a quien lo usa por primera vez: no rechaza la Promesa ante respuestas HTTP de error (404, 500); solo rechaza ante fallos de red genuinos (sin conexión, DNS no resuelto). Por esta razón, es necesario verificar explícitamente `respuesta.ok` (o el código `respuesta.status`) y lanzar un error manualmente si la respuesta indica un fallo, para que ese caso también sea capturado correctamente por el `try/catch`.

Combinar `try/catch` con un bloque `finally` es útil para ejecutar lógica de limpieza que debe ocurrir sin importar si la operación tuvo éxito o falló, como ocultar un indicador de carga que se mostró antes de iniciar la petición asíncrona, garantizando que ese indicador se oculte tanto en el camino de éxito como en el de error.

**Analogía:** `try/catch` alrededor de un `await` es como tener una red de seguridad instalada exactamente debajo de un tramo específico y conocido de un trapecio: si el artista (la operación asíncrona) cae en ese tramo exacto, la red lo atrapa ahí mismo; si no se instala ninguna red en ese tramo, la caída continúa hacia abajo (se propaga) hasta encontrar, si existe, una red instalada en un nivel inferior (un `try/catch` en una función que invocó a esta).

**¿Por qué es importante?** Manejar explícitamente los errores en cada punto de `await` que pueda fallar de forma esperada es la diferencia entre una aplicación que degrada de forma controlada ante fallos de red (mostrando un mensaje útil al usuario) y una que simplemente se rompe silenciosamente o produce errores no manejados en la consola.

**Código del ejemplo:**

```js
async function obtenerUsuarios() {
  try {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`HTTP ${r.status}`); // fetch NO rechaza por 404/500 solo
    return await r.json();
  } catch (error) {
    console.error("Fallo:", error.message);
    return []; // valor por defecto controlado
  } finally {
    ocultarIndicadorDeCarga(); // se ejecuta siempre, éxito o error
  }
}
```

### Tema 3: fetch API y AbortController

**Conceptos clave:** `fetch`, `Response`, cancelación de peticiones en curso.

`fetch(url, opciones)` es la API estándar y moderna para realizar peticiones HTTP desde JavaScript, reemplazando a `XMLHttpRequest` (la API anterior, mucho más verbosa y basada en callbacks) en prácticamente todo código nuevo. `fetch` devuelve una Promesa que se resuelve con un objeto `Response`, del cual se puede extraer el cuerpo en distintos formatos (`.json()`, `.text()`, `.blob()`), cada uno de ellos también devolviendo, a su vez, una Promesa (porque leer el cuerpo completo de la respuesta es en sí mismo una operación potencialmente asíncrona, especialmente para respuestas grandes).

`AbortController` es el mecanismo estándar para cancelar una petición `fetch` en curso: se crea una instancia (`const controlador = new AbortController();`), se pasa su propiedad `signal` en las opciones de `fetch` (`fetch(url, { signal: controlador.signal })`), y en cualquier momento posterior se puede invocar `controlador.abort()` para cancelar la petición, lo que hace que la Promesa de `fetch` se rechace con un error cuyo `name` es `"AbortError"`, distinguible explícitamente de otros tipos de fallo de red en el bloque `catch`.

El caso de uso más común de `AbortController` es una interfaz de búsqueda en vivo: cada vez que el usuario escribe un nuevo carácter, se dispara una nueva petición de búsqueda, pero si la petición anterior aún está en curso cuando llega la nueva, cancelarla explícitamente evita que una respuesta desactualizada (correspondiente a una búsqueda anterior y ya obsoleta) llegue después que la respuesta de la búsqueda más reciente, y sobrescriba incorrectamente los resultados mostrados al usuario con datos obsoletos, un bug de "race condition" (condición de carrera) extremadamente común en interfaces de búsqueda mal implementadas sin cancelación explícita.

Combinar `AbortController` con `debounce` (visto en el Módulo 1) es un patrón robusto y frecuente: `debounce` evita disparar una petición nueva en cada pulsación de tecla individual, esperando una pequeña pausa en la escritura; `AbortController` cancela cualquier petición previa que aún esté en curso cuando efectivamente se dispara la siguiente, cubriendo conjuntamente tanto el problema de exceso de peticiones como el de respuestas desordenadas llegando fuera de secuencia.

**Analogía:** `fetch` sin `AbortController` es como enviar una carta por correo sin ninguna forma de interceptarla una vez enviada, incluso si te das cuenta después de que ya no la necesitas; `AbortController` es como tener la capacidad de llamar a la oficina de correos y cancelar el envío mientras la carta aún está en tránsito, antes de que llegue a su destino.

**¿Por qué es importante?** La cancelación explícita de peticiones evita condiciones de carrera donde una respuesta desactualizada sobrescribe una más reciente, un bug sutil y frecuente en interfaces de búsqueda o de filtrado dinámico sin esta protección.

**Código del ejemplo:**

```js
const controlador = new AbortController();
fetch(url, { signal: controlador.signal })
  .catch(error => {
    if (error.name === "AbortError") console.log("petición cancelada");
  });
// en una interacción posterior del usuario (nueva búsqueda):
controlador.abort(); // cancela la petición anterior en curso
```

### Tema 4: Reintentos y timeouts manuales

**Conceptos clave:** backoff exponencial, reintentos limitados, timeout con `Promise.race`.

Una función de reintentos automáticos (`fetchConReintentos`) mejora la robustez de una aplicación frente a fallos de red transitorios (una petición que falla ocasionalmente por una interrupción momentánea de conectividad, pero que probablemente tendría éxito si se intentara de nuevo unos instantes después). El patrón típico ejecuta la operación en un bucle acotado (con un número máximo de intentos, para evitar reintentar indefinidamente ante un fallo permanente), y entre cada intento fallido espera un tiempo antes de reintentar, típicamente con backoff (el tiempo de espera aumenta progresivamente en cada intento sucesivo, en vez de reintentar inmediatamente), para no sobrecargar un servidor que ya está teniendo problemas con reintentos inmediatos y repetidos.

Un timeout manual —limitar cuánto tiempo se está dispuesto a esperar una operación antes de considerarla fallida, aunque la operación en sí no tenga ningún mecanismo nativo de timeout— se implementa combinando `Promise.race` (visto en el Módulo 5) entre la operación real y una Promesa que se rechaza automáticamente tras un tiempo límite fijo usando `setTimeout`. Cualquiera de las dos que se resuelva primero determina el resultado: si la operación real termina antes del límite, su resultado gana la carrera; si el límite de tiempo se cumple primero, la Promesa de timeout gana, y el código trata ese caso como un fallo por tiempo excedido.

Combinar reintentos con timeout requiere cuidado en el orden de composición: normalmente se aplica el timeout a cada intento individual (para no esperar indefinidamente en un intento específico que esté colgado), y el bucle de reintentos envuelve esa combinación completa, de modo que si un intento individual excede su timeout, se cuenta como un fallo de ese intento específico y se procede al siguiente intento del bucle de reintentos, en vez de que el timeout aplique una sola vez al conjunto completo de todos los reintentos sumados.

Estas dos técnicas —reintentos con backoff y timeout manual— son extremadamente comunes en clientes de API de producción, y su ausencia es una causa frecuente de aplicaciones frágiles que fallan completamente ante cualquier interrupción transitoria de red, en vez de recuperarse automáticamente de forma silenciosa para el usuario final.

**Analogía:** el backoff en reintentos es como llamar por teléfono a alguien que no contesta: en vez de volver a marcar inmediatamente una y otra vez sin pausa (lo cual sería inútil e insistente), esperas un poco más cada vez antes de volver a intentar, dando tiempo a que la situación que impidió la respuesta se resuelva por sí sola. Un timeout manual es como decidir de antemano que, si nadie contesta después de cierto número de tonos, cuelgas y consideras la llamada fallida, en vez de esperar indefinidamente sin límite.

**¿Por qué es importante?** Reintentos con backoff y timeouts manuales son prácticas de robustez estándar en cualquier cliente de API de producción seria, protegiendo a la aplicación de fallos transitorios de red sin requerir intervención manual del usuario.

**Código del ejemplo:**

```js
async function fetchConReintentos(url, intentos = 3) {
  for (let i = 0; i < intentos; i++) {
    try {
      const r = await fetch(url);
      if (r.ok) return await r.json();
    } catch { /* reintenta */ }
    await new Promise(res => setTimeout(res, 300 * (i + 1))); // backoff
  }
  throw new Error("Falló tras varios intentos");
}

function conTimeout(promesa, ms) {
  const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), ms));
  return Promise.race([promesa, timeout]);
}
```

### Tema 5: Generadores — function*, yield y yield*

**Conceptos clave:** funciones generadoras, pausar y reanudar ejecución, iteradores personalizados.

Una función generadora, declarada con `function*` (asterisco después de la palabra clave `function`), tiene una capacidad única entre las funciones de JavaScript: puede pausar su propia ejecución en cualquier punto marcado con `yield`, devolviendo un valor en ese punto exacto, y reanudar su ejecución exactamente desde donde se pausó cuando se solicita el siguiente valor. Invocar una función generadora no ejecuta su cuerpo inmediatamente (a diferencia de una función normal); en cambio, devuelve un objeto iterador especial, y cada llamada a `.next()` sobre ese iterador ejecuta el cuerpo de la función hasta el siguiente `yield` (o hasta el final de la función), devolviendo un objeto `{value, done}` con el valor producido y un booleano que indica si el generador ya terminó.

Esta capacidad de pausar y reanudar ejecución hace a los generadores la herramienta idónea para implementar iteradores personalizados y flujos de datos que se producen de forma perezosa (uno a la vez, bajo demanda), en vez de generar una colección completa en memoria de antemano. Un generador que produce una secuencia infinita (por ejemplo, números de Fibonacci sin límite) es perfectamente viable, porque cada valor solo se calcula cuando efectivamente se solicita con `.next()`, sin necesidad de calcular ni almacenar toda la secuencia infinita de antemano, algo imposible con un array normal.

`yield*` delega la iteración a otro iterable (incluyendo otro generador), permitiendo componer generadores más pequeños en generadores más grandes, de forma similar a cómo `pipe` (Módulo 1) compone funciones más pequeñas en transformaciones más complejas. Los generadores también son la base conceptual sobre la que históricamente se construyeron algunas implementaciones tempranas de `async`/`await` (antes de que se estandarizara como sintaxis nativa del lenguaje), porque comparten la misma capacidad fundamental de pausar y reanudar ejecución en puntos específicos.

Aunque los generadores son una herramienta relativamente especializada en el uso cotidiano (comparado con `map`/`filter`/`async`/`await`, mucho más frecuentes en código de aplicación típico), aparecen en contextos específicos como la implementación de iteradores personalizados para estructuras de datos propias (haciendo que una clase propia sea compatible con `for...of`), y en bibliotecas de gestión de efectos asíncronos complejos como Redux-Saga en el ecosistema React.

**Analogía:** una función normal es como una película que, una vez que empieza a reproducirse, corre de principio a fin sin posibilidad de pausa intermedia controlada por quien la mira; una función generadora es como un video con capacidad de pausa en marcadores específicos predefinidos, donde cada vez que se pulsa "reproducir" de nuevo, continúa exactamente desde el marcador donde se pausó anteriormente, no desde el principio.

**¿Por qué es importante?** Los generadores permiten expresar secuencias perezosas e infinitas de forma natural, y son la base conceptual de mecanismos avanzados de control de flujo asíncrono en bibliotecas especializadas del ecosistema JavaScript.

**Código del ejemplo:**

```js
function* contarHasta(n) {
  for (let i = 1; i <= n; i++) yield i;
}
const gen = contarHasta(3);
gen.next(); // { value: 1, done: false }
gen.next(); // { value: 2, done: false }
gen.next(); // { value: 3, done: false }
gen.next(); // { value: undefined, done: true }
```

### Tema 6: Proxies y Reflect

**Conceptos clave:** intercepción de operaciones sobre objetos, traps (`get`/`set`/`has`), `Reflect`.

Un `Proxy` envuelve un objeto (llamado el "target") y permite interceptar y personalizar operaciones fundamentales sobre él —leer una propiedad, asignar una propiedad, comprobar si una propiedad existe con `in`, entre otras— mediante funciones llamadas "traps" (trampas), definidas en un segundo objeto llamado "handler". Por ejemplo, un trap `get` se ejecuta cada vez que se intenta leer cualquier propiedad del Proxy, permitiendo ejecutar lógica personalizada (registrar accesos, calcular valores derivados, lanzar validaciones) de forma completamente transparente para quien usa el objeto, sin que necesite saber que está interactuando con un Proxy en vez de con el objeto original directamente.

`Reflect` es un objeto global que expone, como métodos estáticos, exactamente las mismas operaciones fundamentales que los traps de `Proxy` interceptan, proporcionando la forma "por defecto" y estándar de realizar cada operación. Dentro de un trap de `Proxy`, es una práctica extremadamente común invocar el método correspondiente de `Reflect` para delegar hacia el comportamiento original si el trap no necesita modificarlo (por ejemplo, un trap `set` que solo necesita registrar un log antes de la asignación real invocaría `Reflect.set(target, propiedad, valor)` para efectivamente realizar la asignación tras registrar el log), evitando reimplementar manualmente la semántica exacta de esa operación fundamental.

Un caso de uso instructivo de Proxy es implementar validación transparente: un Proxy sobre un objeto de configuración cuyo trap `set` verifica que el valor asignado sea del tipo esperado antes de permitir la asignación, lanzando un error si no lo es, de forma completamente invisible para el código que simplemente asigna `configuracion.puerto = 8080` como si fuera un objeto normal, sin necesidad de llamar a un método de validación explícito por separado. Frameworks reactivos modernos (Vue.js, notablemente) usan Proxies internamente para detectar automáticamente cuándo cambia una propiedad de un objeto de estado y disparar actualizaciones de la interfaz de forma transparente, sin que el desarrollador necesite llamar manualmente a una función de notificación de cambio.

Aunque Proxy es una herramienta de uso relativamente avanzado y especializado (rara vez necesaria en código de aplicación cotidiano), entender su existencia y su propósito —interceptar y personalizar operaciones fundamentales sobre objetos de forma transparente— completa el panorama de las capacidades de metaprogramación de JavaScript, y ayuda a entender internamente cómo funcionan ciertos frameworks reactivos populares.

**Analogía:** un Proxy es como un asistente personal que intercepta todas las llamadas telefónicas dirigidas a ti (las operaciones sobre el objeto original), decide qué hacer con cada una según reglas personalizadas (los traps), y puede optar por pasarte la llamada exactamente como llegó (delegando con `Reflect`) o gestionarla de forma completamente distinta antes de responder.

**¿Por qué es importante?** Proxy y Reflect son la base de metaprogramación transparente en JavaScript, usada internamente por frameworks reactivos modernos para detectar cambios de estado automáticamente, un mecanismo que vale la pena entender conceptualmente aunque rara vez se implemente Proxies propios en código de aplicación típico.

**Código del ejemplo:**

```js
const configuracion = new Proxy({}, {
  set(target, prop, valor) {
    if (prop === "puerto" && typeof valor !== "number") {
      throw new TypeError("puerto debe ser number");
    }
    return Reflect.set(target, prop, valor); // delega la asignación real
  },
});
configuracion.puerto = 8080;   // ok
configuracion.puerto = "8080"; // TypeError, interceptado transparentemente
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

**Objetivo del laboratorio:** construir un cliente de API robusto que consuma una API pública con manejo de errores, cancelación, reintentos y timeout, usando `async`/`await` de principio a fin.

**Requisitos previos:** Módulos 0-5 completados, acceso a `https://jsonplaceholder.typicode.com`.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Reescribir una cadena `.then()` como `async`/`try/catch` | Ver Tema 1 | Verifica comportamiento idéntico entre ambas formas |
| 2 | Consumir la API pública con `fetch` | `await fetch(".../users")` | Verifica `respuesta.ok` antes de parsear el JSON |
| 3 | Manejar un fetch que falla (URL inválida) | `try/catch` con mensaje claro al usuario | Distingue error de red de error HTTP |
| 4 | Implementar cancelación con `AbortController` | Ver Tema 3 | Simula una nueva búsqueda cancelando la anterior |
| 5 | Implementar `fetchConReintentos` | Ver Tema 4 | Verifica hasta 3 intentos con backoff creciente |
| 6 | Implementar timeout manual de 5 segundos | `conTimeout(fetch(url), 5000)` | Verifica que se rechaza si la petición excede el límite |

**Verificación:** el laboratorio se considera exitoso si el cliente maneja correctamente los tres escenarios de fallo (red caída, HTTP de error, timeout excedido), mostrando en cada caso un mensaje claro y distinto al usuario, sin ningún error no manejado en la consola.

**Errores comunes y soluciones**

- **Asumir que `fetch` rechaza automáticamente ante un 404 o 500.** `fetch` solo rechaza ante fallos de red genuinos; verifica siempre `respuesta.ok` explícitamente y lanza un error manualmente si es necesario.
- **Reintentar sin backoff, machacando el servidor con peticiones inmediatas repetidas.** Añade una espera creciente entre cada intento fallido.
- **Olvidar distinguir un `AbortError` de otros tipos de error en el `catch`.** Verifica `error.name === "AbortError"` para no tratar una cancelación intencional como un fallo real que deba mostrarse al usuario.

---

## Ejercicios de evaluación

### Ejercicio 1: ¿await bloquea el hilo?

**Enunciado:** un compañero afirma que `await` "bloquea" el hilo de JavaScript mientras espera. Explica por qué esto es impreciso y qué ocurre realmente durante la espera.

**Solución esperada:** `await` pausa la ejecución de la función `async` específica donde aparece, pero no bloquea el hilo único de JavaScript ni el Event Loop; mientras esa función está pausada, el Event Loop sigue libre para procesar otras tareas (otros eventos, otras funciones), y la función pausada se reanuda como una microtask cuando la Promesa esperada se resuelve.

**Criterios de éxito:**
- Distingue correctamente "pausa de una función específica" de "bloqueo del hilo completo".
- Explica que el Event Loop sigue procesando otras tareas durante la espera.

### Ejercicio 2: Diseñar manejo de errores en cadena

**Enunciado:** escribe una función `async` que obtenga un usuario por id y, si la petición falla, devuelva un objeto de usuario "invitado" por defecto en vez de propagar el error.

**Solución esperada:**
```js
async function obtenerUsuarioOInvitado(id) {
  try {
    const r = await fetch(`/usuarios/${id}`);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.json();
  } catch {
    return { id: null, nombre: "Invitado", esInvitado: true };
  }
}
```

**Criterios de éxito:**
- Verifica `respuesta.ok` antes de parsear.
- Devuelve el objeto por defecto en el `catch`, sin propagar el error hacia quien invocó la función.

### Ejercicio 3: AbortController en un escenario de búsqueda

**Enunciado:** explica qué bug ocurriría en una interfaz de búsqueda en vivo si NO se usa `AbortController` para cancelar peticiones anteriores, y cómo `AbortController` lo resuelve.

**Solución esperada:** sin cancelación, si el usuario escribe rápido, se disparan múltiples peticiones que pueden resolver en un orden distinto al que se dispararon (por ejemplo, la petición de la búsqueda "gat" podría resolver después que la de "gato" si la red tarda de forma variable), sobrescribiendo los resultados correctos con datos obsoletos de una búsqueda anterior ya irrelevante. `AbortController` resuelve esto cancelando explícitamente la petición anterior en cuanto se dispara una nueva, evitando que su respuesta (si llegara tarde) sobrescriba los resultados correctos.

**Criterios de éxito:**
- Identifica correctamente el bug de condición de carrera (respuesta desordenada sobrescribiendo resultados más recientes).
- Explica que `AbortController` cancela explícitamente la petición obsoleta antes de que su respuesta pueda causar daño.

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

- `async`/`await` es sintaxis sobre Promesas que permite código asíncrono legible como síncrono, sin bloquear el hilo único de JavaScript.
- `try/catch` alrededor de un `await` captura rechazos de Promesa como excepciones síncronas normales.
- `fetch` no rechaza ante errores HTTP (404/500); hay que verificar `respuesta.ok` explícitamente.
- `AbortController` permite cancelar peticiones en curso, evitando condiciones de carrera con respuestas desactualizadas.
- Reintentos con backoff y timeouts manuales (`Promise.race`) son prácticas de robustez estándar en clientes de API.
- Los generadores permiten pausar y reanudar ejecución; los Proxies permiten interceptar operaciones sobre objetos de forma transparente.

**Conceptos aprendidos**

- `async`/`await` y su relación exacta con las Promesas del Módulo 5.
- Manejo robusto de errores en flujos asíncronos.
- `fetch`, `AbortController` y cancelación de peticiones.
- Patrones de reintento con backoff y timeout manual.
- Generadores (`function*`, `yield`) y Proxies/Reflect a nivel introductorio.

**Próximos pasos**

En el Módulo 7 aprenderás sobre módulos modernos (ESM frente a CommonJS) y herramientas de build como Vite, entendiendo qué hace realmente un bundler antes de usarlo sin comprenderlo.

**Recursos adicionales**

- MDN Web Docs: "async function", "AbortController", "Iterators and generators", "Proxy".
- Documentación oficial de la Fetch API en MDN.
