# Módulo 0: El runtime de Node — V8, libuv y el Event Loop

## Sílabo

**Objetivo general**

Entender que Node.js no es simplemente "JavaScript en el servidor", sino un runtime completo con I/O no bloqueante construido sobre V8 y libuv, dominando las fases del Event Loop específicas de Node y los módulos core esenciales.

**Objetivos específicos**

1. Explicar la diferencia entre el Event Loop del navegador y el de Node.
2. Describir las fases del Event Loop de Node (timers, poll, check, entre otras).
3. Predecir el orden de ejecución entre `setTimeout`, `setImmediate` y `process.nextTick`.
4. Usar el objeto `process` para leer argumentos, variables de entorno e información del runtime.
5. Identificar los módulos core más relevantes de Node (`os`, `buffer`, `crypto`, `util`, `child_process`, `cluster`).

**Contenido**

- Diferencias entre el Event Loop del navegador y el de Node.
- Fases del Event Loop (timers, poll, check).
- `process`, `global` y módulos core.
- `npx` y la CLI de Node.
- Módulos core: `os`, `buffer`, `crypto`, `util`, `child_process` y `cluster`.
- Event-driven architecture y non-blocking I/O.

**Evaluación**

Un script que demuestra el orden de ejecución entre `setImmediate`, `setTimeout` y `process.nextTick`, más tres ejercicios de evaluación.

---

## Comienza desde cero: prepara este capítulo

Este recorrido parte de una carpeta vacía. Al finalizar tendrás **Un script que demuestra el orden de ejecución entre `setImmediate`, `setTimeout` y `process.nextTick`, más tres ejercicios de evaluación.** No avances ejecutando comandos que no comprendes: primero identifica la entrada, la transformación y la evidencia que comprobará el resultado.

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
mkdir -p academia-labs/node-api/src
cd academia-labs/node-api
npm init -y
npm install fastify
npm install -D typescript tsx @types/node
git init
```

Trabaja dentro de `academia-labs/node-api`. Si ya existe, no lo vuelvas a generar: entra en la carpeta, confirma `git status` y continúa sobre una rama propia.

### 3. Ubica cada tema antes de escribir

```text
academia-labs/node-api/
├─ src/
│  └─ module-0/
├─ tests/
├─ docs/decisions/
├─ evidence/module-0/
└─ README.md
```

| Tema | Archivo o decisión | Evidencia mínima |
|---|---|---|
| 1. Node no es "JavaScript en el servidor" sin más | `src/module-0/topic-1-node-no-es-javascript-en-el-servidor-sin-mas.ts` | prueba + salida observable |
| 2. Fases del Event Loop de Node | `src/module-0/topic-2-fases-del-event-loop-de-node.ts` | prueba + salida observable |
| 3. process, global y módulos core | `src/module-0/topic-3-process-global-y-modulos-core.ts` | prueba + salida observable |
| 4. Event-driven architecture y non-blocking I/O | `src/module-0/topic-4-event-driven-architecture-y-non-blocking-i-o.ts` | prueba + salida observable |

Un ejemplo técnico vive en el archivo indicado y debe tener una prueba. Un tema conceptual vive en `docs/decisions/`: compara opciones usando restricciones medibles; no escribas código decorativo solo para llenar espacio.

### 4. Ejecuta una línea base

Desde `academia-labs/node-api`:

```bash
npm test && npm run dev
```

**Resultado esperado:** el comando reconoce el proyecto y termina sin errores antes de introducir el cambio del capítulo. Después del incremento, la evidencia debe demostrar: **Un script que demuestra el orden de ejecución entre `setImmediate`, `setTimeout` y `process.nextTick`, más tres ejercicios de evaluación.**

Si falla la línea base, no continúes. Localiza el primer mensaje que indique archivo, línea o dependencia; formula una causa y compruébala con un cambio pequeño.

### 5. Provoca un fallo y recupérate

Envía una entrada inválida o desconecta una dependencia; verifica estado HTTP, cuerpo y log con contexto. Guarda en `evidence/module-0/` el comando, la salida relevante, tu hipótesis y la corrección. Revierte únicamente el cambio deliberado; no borres todo el proyecto para ocultar la causa.

### 6. Conecta el capítulo con RutaFlow

Aplica el aprendizaje de **El runtime de Node — V8, libuv y el Event Loop** a un incremento vertical de RutaFlow. Define qué componente produce el dato, qué contrato lo transporta, quién lo consume y cómo observarás un fallo. La entrega final incluye archivo o decisión, prueba, salida, error corregido y una limitación que todavía validarías en producción.

---

## Antes de comenzar: instala Node sin problemas de permisos

Instala una versión **LTS** de Node.js, Git y Visual Studio Code. Recomendamos un administrador de versiones porque más adelante distintos proyectos pueden requerir versiones distintas: `nvm-windows` en Windows y `nvm` en macOS/Linux.

- **Windows:** instala Git, VS Code y nvm-windows; abre PowerShell nuevo, ejecuta `nvm install lts` y `nvm use lts`.
- **macOS:** instala Homebrew/Git y luego `nvm`, o usa el instalador oficial de Node LTS.
- **Ubuntu/Debian:** instala Git con `apt` y Node LTS mediante `nvm`; evita el paquete `nodejs` antiguo de algunas distribuciones.

Verifica `node --version`, `npm --version` y `git --version`. Crea una carpeta y tu primer programa:

```bash
mkdir hola-node
cd hola-node
npm init -y
node -e "console.log('Node funciona', process.version)"
```

`npm init -y` crea `package.json`, el documento que describe el proyecto. Nunca copies `node_modules` ni lo subas a Git: se reconstruye con `npm install`. Si npm muestra `EACCES`, no lo arregles con `sudo`; reinstala Node con un administrador de versiones.

## Contenido teórico

### Tema 1: Node no es "JavaScript en el servidor" sin más

**Conceptos clave:** runtime, V8, libuv, I/O no bloqueante.

Node.js es un runtime de JavaScript construido combinando dos componentes con responsabilidades bien diferenciadas: V8, el motor de JavaScript de Google (el mismo que impulsa Chrome, estudiado en profundidad en el track de JavaScript), que compila y ejecuta el código JavaScript en sí; y libuv, una biblioteca escrita en C que proporciona el Event Loop y el acceso a operaciones de I/O (entrada/salida) no bloqueantes del sistema operativo subyacente —leer archivos, abrir conexiones de red, resolver DNS— capacidades que V8 por sí solo, diseñado originalmente para ejecutarse dentro de un navegador, no proporciona de forma nativa.

Esta arquitectura de dos capas es la razón exacta por la que Node puede manejar miles de conexiones simultáneas con un único hilo de JavaScript: cuando el código JavaScript solicita una operación de I/O (por ejemplo, leer un archivo), Node delega esa operación a libuv, que la ejecuta de forma asíncrona usando los mecanismos de I/O no bloqueante del sistema operativo (o, para ciertas operaciones que el sistema operativo no ofrece de forma asíncrona nativa, usando un pool de hilos internos gestionado por la propia libuv, invisible para el código JavaScript de la aplicación), liberando inmediatamente el hilo único de JavaScript para seguir procesando otro código mientras esa operación de I/O se completa en segundo plano.

Esta característica es fundamentalmente distinta del modelo de muchos runtimes de servidor tradicionales, que dedican un hilo del sistema operativo completo a cada conexión entrante, un modelo que escala pobremente con miles de conexiones simultáneas debido al coste de memoria y de cambio de contexto asociado a mantener tantos hilos activos. Node, al usar un único hilo de JavaScript combinado con I/O no bloqueante gestionado por libuv, puede sostener un volumen mucho mayor de conexiones concurrentes con una huella de memoria sustancialmente menor, siempre que el trabajo realizado en cada conexión sea predominantemente de I/O (esperar respuestas de una base de datos, de una API externa, de un sistema de archivos) y no de cómputo intensivo de CPU, un caso que bloquearía el único hilo de JavaScript disponible (el mismo problema estudiado en el Módulo 5 del track de JavaScript, ahora con implicaciones directas para un servidor que debe atender múltiples clientes simultáneamente).

Comprender esta arquitectura de dos capas —V8 ejecutando JavaScript, libuv gestionando I/O asíncrono y el Event Loop— es la base conceptual indispensable para todo lo demás en este track: explica tanto las fortalezas de Node (excelente para cargas de trabajo dominadas por I/O, como típicas APIs REST) como sus limitaciones (pobre para cómputo intensivo de CPU sostenido sin delegar ese trabajo a Worker Threads, estudiados en el Módulo 8).

**Analogía:** Node es como un único mesero extremadamente eficiente en un restaurante que, en vez de esperar de pie junto a la cocina hasta que cada plato individual esté listo (bloqueando su capacidad de atender a otros clientes mientras tanto), toma el pedido de una mesa, lo entrega a la cocina (libuv), y de inmediato atiende a la siguiente mesa mientras la cocina prepara el plato en paralelo, siendo notificado exactamente cuándo cada plato específico está listo para servir.

**¿Por qué es importante?** Entender que Node es I/O no bloqueante de un solo hilo (no "multi-hilo mágico") explica directamente por qué es excelente para APIs con mucho I/O y por qué el cómputo intensivo de CPU requiere una estrategia deliberada distinta (Worker Threads o clustering, Módulo 8).

**Diagrama:**

```
JavaScript (V8)  ──solicita I/O──▶  libuv (Event Loop + thread pool interno)
      │                                          │
      │◄────── callback cuando el I/O termina ───┘
      │
  hilo único de JS libre mientras tanto para procesar OTRO código
```

### Tema 2: Fases del Event Loop de Node

**Conceptos clave:** timers, pending callbacks, poll, check, close callbacks.

El Event Loop de Node, aunque conceptualmente relacionado con el del navegador (estudiado en el Módulo 5 del track de JavaScript), tiene una estructura más elaborada, organizada en fases secuenciales que se ejecutan en un orden fijo y repetido en cada vuelta del ciclo. La fase de timers ejecuta los callbacks de `setTimeout` y `setInterval` cuyo tiempo ya expiró; la fase de pending callbacks ejecuta ciertos callbacks de operaciones del sistema diferidas de la vuelta anterior; la fase de poll es la más central, donde Node recupera nuevos eventos de I/O y ejecuta sus callbacks correspondientes (aquí es donde la mayoría de callbacks de red y de archivos se procesan), y puede bloquearse esperando nuevos eventos si no hay timers pendientes próximos a expirar; la fase de check ejecuta específicamente los callbacks registrados con `setImmediate`; y la fase de close callbacks maneja callbacks de cierre, como los de un socket cerrado.

`setImmediate(callback)` está diseñado específicamente para ejecutarse en la fase de check, inmediatamente después de que la fase de poll actual termine, lo que lo hace útil para ejecutar código deliberadamente después de que cualquier operación de I/O pendiente en el ciclo actual haya sido procesada. `process.nextTick(callback)`, a pesar de su nombre similar a un timer, no pertenece en absoluto a ninguna fase del Event Loop descrita: se procesa inmediatamente después de que la operación síncrona actual termine, antes de que el Event Loop continúe hacia su siguiente fase, dándole una prioridad incluso mayor que las microtasks de Promesas (que en Node se procesan justo después de la cola de `nextTick`, ambas antes de continuar hacia cualquier fase del Event Loop).

Esta jerarquía de prioridad —`process.nextTick` primero, luego microtasks de Promesas, y solo después las fases normales del Event Loop— es importante recordarla precisamente porque un uso excesivo o mal considerado de `process.nextTick` (por ejemplo, llamándolo recursivamente sin ningún límite) puede, en teoría, monopolizar el Event Loop indefinidamente, impidiendo que cualquier fase normal (incluyendo I/O) llegue a procesarse, un antipatrón conocido como "I/O starvation" (inanición de I/O) que vale la pena conocer para evitarlo deliberadamente en código de producción real.

El orden exacto entre `setTimeout(fn, 0)` y `setImmediate(fn)` es, de hecho, no determinista cuando ambos se programan desde el nivel superior del script (fuera de cualquier callback de I/O), porque depende de detalles de temporización del sistema operativo sobre cuánto tarda exactamente en iniciar el ciclo del Event Loop; sin embargo, dentro de un callback de I/O (por ejemplo, dentro de `fs.readFile(..., callback)`), el orden se vuelve determinista y predecible: `setImmediate` siempre se ejecuta antes que `setTimeout(fn, 0)` en ese contexto específico, porque la fase de check (donde vive `setImmediate`) ocurre inmediatamente después de la fase de poll donde ese callback de I/O se está ejecutando, mientras que la fase de timers ya pasó en esa vuelta del ciclo.

**Analogía:** las fases del Event Loop de Node son como las estaciones fijas y en orden de una ronda de inspección en una fábrica: primero se revisan los relojes vencidos (timers), luego los pendientes de la ronda anterior, luego se atiende el correo entrante (poll), luego los pendientes específicamente marcados como "revisar justo después del correo" (check), y finalmente los cierres. `process.nextTick` es como un mensaje urgente que se atiende inmediatamente al terminar cualquier tarea actual, antes incluso de continuar con la siguiente estación de la ronda.

**¿Por qué es importante?** Entender las fases del Event Loop de Node explica comportamientos de temporización que sorprenden a quien viene del navegador, y es esencial para diagnosticar correctamente problemas de orden de ejecución en aplicaciones Node reales.

**Diagrama:**

```
timers → pending callbacks → poll (I/O) → check (setImmediate) → close callbacks
                                    ↑
                    (vuelve a timers, repite el ciclo)

process.nextTick(): se procesa INMEDIATAMENTE tras el código síncrono actual,
                     ANTES de continuar a cualquier fase del Event Loop
```

### Tema 3: process, global y módulos core

**Conceptos clave:** el objeto `process`, `global`, módulos incluidos en Node.

El objeto `process`, disponible globalmente sin necesidad de importarlo, expone información y control sobre el proceso de Node actualmente en ejecución: `process.argv` contiene los argumentos de línea de comandos con los que se invocó el script; `process.env` expone las variables de entorno del sistema, el mecanismo estándar para inyectar configuración externa (como cadenas de conexión de base de datos, o el puerto en el que debe escuchar un servidor) sin necesidad de codificarla directamente en el código fuente; `process.version` y `process.platform` reportan la versión de Node y el sistema operativo subyacente respectivamente; y `process.exit(codigo)` termina el proceso explícitamente con un código de salida específico, útil en scripts de línea de comandos que necesitan comunicar éxito o fallo a quien los invocó.

`global` es el objeto global de Node, análogo conceptual a `window` en el navegador (estudiado en el Módulo 0 del track de JavaScript), aunque su uso directo es mucho menos común en código Node idiomático que el uso de `window` en código de navegador, precisamente porque Node fomenta el uso de módulos (Módulo 1 de este track) para compartir funcionalidad entre archivos, en vez de depender de variables verdaderamente globales compartidas implícitamente entre todo el código de la aplicación.

Node incluye un conjunto de módulos "core" (integrados directamente en el runtime, sin necesidad de instalarlos vía npm) que cubren funcionalidad fundamental del sistema: `os` expone información del sistema operativo (número de CPUs, memoria disponible, útil para decisiones de clustering en el Módulo 8); `buffer` maneja datos binarios crudos, una capacidad que JavaScript en el navegador no necesitaba tradicionalmente pero que es esencial para un runtime de servidor que procesa archivos y protocolos de red a bajo nivel; `crypto` proporciona funciones criptográficas (hashing, cifrado) directamente integradas, sin depender de una biblioteca externa para operaciones criptográficas básicas; `util` incluye utilidades variadas, incluyendo `util.promisify` (que convierte una función basada en callbacks al estilo Node clásico en una que devuelve una Promesa, un patrón mencionado en el Módulo 5 del track de JavaScript); `child_process` permite lanzar y comunicarse con otros procesos del sistema operativo; y `cluster`, que se estudiará en profundidad en el Módulo 8, permite bifurcar múltiples procesos Node para aprovechar múltiples núcleos de CPU.

Prefijar las importaciones de módulos core con `node:` (por ejemplo, `import { readFile } from "node:fs/promises";`) es la convención moderna recomendada, dejando explícito e inequívoco que el módulo importado es un módulo core de Node, y no un paquete de terceros instalado vía npm que coincidentemente tuviera un nombre similar, una ambigüedad que existía antes de que esta convención con prefijo se popularizara ampliamente en el ecosistema.

**Analogía:** `process` es como el panel de control y los indicadores de un vehículo, exponiendo información operativa (velocímetro, nivel de combustible) y controles directos (encender, apagar) sobre el vehículo mismo, en este caso el propio proceso de Node en ejecución; los módulos core son como el kit de herramientas de fábrica que viene incluido con el vehículo desde el concesionario, sin necesidad de comprarlas por separado en una tienda externa.

**¿Por qué es importante?** `process` y los módulos core proporcionan las capacidades fundamentales de un runtime de servidor (acceso a variables de entorno, información del sistema, datos binarios, criptografía) que JavaScript en el navegador nunca necesitó exponer de la misma forma directa.

**Código del ejemplo:**

```js
process.argv;         // argumentos de línea de comandos
process.env.PORT;     // variables de entorno externas (configuración)
process.version;      // versión de Node en ejecución

import { readFile } from "node:fs/promises"; // convención moderna con prefijo node:
import os from "node:os";
os.cpus().length; // número de núcleos disponibles, relevante para clustering
```

### Tema 4: Event-driven architecture y non-blocking I/O

**Conceptos clave:** arquitectura orientada a eventos, `EventEmitter`, no bloqueo como principio de diseño.

Node adopta de forma sistemática una arquitectura orientada a eventos como patrón de diseño central, no solo como un detalle de implementación aislado del Event Loop: gran parte de la API core de Node (streams, servidores HTTP, procesos hijo) se construye sobre `EventEmitter`, una clase base que permite a un objeto emitir eventos con nombre (`emitter.emit("dato", valor)`) y registrar listeners para reaccionar a ellos (`emitter.on("dato", callback)`), un patrón que se repite consistentemente a través de prácticamente toda la superficie de la API de Node, y que las bibliotecas del ecosistema (Express, estudiado en el Módulo 4) también adoptan como convención familiar y predecible.

El principio de no bloqueo, mencionado en el Tema 1, se extiende como una convención de diseño que atraviesa el ecosistema completo de Node: las APIs asíncronas son la norma esperada y preferida, y las versiones síncronas de operaciones de I/O (como `fs.readFileSync`) existen deliberadamente como la excepción, reservadas para contextos específicos donde el bloqueo es aceptable o incluso deseable (como scripts de configuración ejecutados una sola vez al inicio de un proceso, antes de que el servidor empiece a atender tráfico real), pero desaconsejadas explícitamente dentro del código que maneja peticiones activas de un servidor en producción, donde bloquear el único hilo de JavaScript detendría el procesamiento de cualquier otra petición concurrente mientras esa operación síncrona se completa.

Esta convención de "asíncrono por defecto, síncrono como excepción deliberada" es una diferencia cultural importante frente a otros lenguajes de servidor donde el modelo predominante es sincrónico con concurrencia gestionada mediante múltiples hilos del sistema operativo; en Node, escribir código bloqueante dentro del camino crítico de una petición HTTP es un error de diseño con impacto directo y medible en la capacidad del servidor de atender múltiples clientes simultáneamente, no simplemente una preferencia estilística sin consecuencias prácticas reales.

Reconocer esta arquitectura orientada a eventos y el principio de no bloqueo como los dos pilares de diseño que unifican prácticamente toda la superficie de la API de Node —desde el manejo de streams (Módulo 2) hasta los servidores HTTP (Módulo 3)— proporciona un marco conceptual coherente para anticipar cómo se comportará y cómo debería usarse correctamente cualquier API nueva de Node que se encuentre por primera vez, incluso sin haberla usado nunca antes.

**Analogía:** la arquitectura orientada a eventos de Node es como un sistema de notificaciones de una oficina moderna, donde en vez de que cada empleado deba consultar activa y repetidamente el estado de cada tarea pendiente (sondeo costoso), cada empleado simplemente se suscribe a notificaciones específicas relevantes para su trabajo, y es notificado automáticamente exactamente cuándo ocurre el evento que le interesa, sin desperdiciar tiempo revisando constantemente algo que aún no ha cambiado.

**¿Por qué es importante?** Reconocer la arquitectura orientada a eventos y el no bloqueo como los principios de diseño unificadores de Node da un marco predictivo para entender rápidamente cualquier nueva API del ecosistema, y explica por qué código bloqueante en el camino crítico de una petición es un error de diseño serio, no solo una preferencia de estilo.

**Código del ejemplo:**

```js
import { EventEmitter } from "node:events";
const emisor = new EventEmitter();
emisor.on("dato", (valor) => console.log("recibido:", valor));
emisor.emit("dato", 42); // "recibido: 42"
// El mismo patrón subyace a streams, servidores HTTP, procesos hijo, etc.
```

---

## Ruta de proyecto progresivo desde carpeta vacía

No crees un proyecto desechable por módulo. Conserva un único repositorio que evoluciona durante todo el track y etiqueta cada hito (`git tag modulo-N`). Empieza con `mkdir academia-node && cd academia-node && git init && npm init -y`. Ejecuta el comando paso a paso, inspecciona los archivos generados y registra versiones y precondiciones en el README.

| Hito | Evolución acumulativa | Evidencia antes de avanzar |
|---|---|---|
| Base | CLI y HTTP. | Arranque reproducible, commit limpio y prueba mínima. |
| Aplicación | API, datos y autenticación. | Casos normales, límite y error automatizados. |
| Integración | Conecta capas y reemplaza dobles por infraestructura controlada. | Diagrama, contratos y prueba de integración. |
| Experto | observabilidad, resiliencia y operación. | Perfil o threat model, telemetría y runbook de recuperación. |

Al iniciar cada laboratorio crea una rama `modulo-N`, implementa el incremento, verifica el criterio de éxito y fusiona solo con pruebas verdes. Si un módulo necesita un experimento aislado, colócalo en `experiments/modulo-N/`; el producto acumulativo permanece ejecutable. Al terminar, otra persona debe poder clonar el repositorio y reproducir el último hito siguiendo únicamente el README.

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

**Objetivo del laboratorio:** predecir y verificar el orden exacto de ejecución entre `setTimeout`, `setImmediate` y `process.nextTick`, y explorar el objeto `process` y los módulos core.

**Requisitos previos:** Node.js instalado, terminal.

| Paso | Acción | Comando/Código | Explicación |
|---|---|---|---|
| 1 | Ejecutar un script y el REPL | `node script.js`, luego `node` a secas | Compara ejecución de archivo con exploración interactiva |
| 2 | Mezclar `console.log`, `setTimeout`, `setImmediate`, `process.nextTick` | Predice el orden ANTES de ejecutar | Verifica tu predicción contra el resultado real |
| 3 | Inspeccionar `process` | `process.version`, `process.platform`, `process.argv` | Entiende qué expone cada propiedad |
| 4 | Leer una variable de entorno propia | `PORT=4000 node script.js` con `process.env.PORT` | Verifica la inyección de configuración externa |
| 5 | Comparar el orden dentro de un callback de I/O | Mismo ejemplo del paso 2 pero dentro de `fs.readFile(..., callback)` | Verifica que el orden se vuelve determinista dentro de I/O |

**Verificación:** el laboratorio se considera exitoso si la predicción del paso 2 (hecha antes de ejecutar) se corrige correctamente tras el resultado real, y si el paso 5 confirma que `setImmediate` se ejecuta de forma determinista antes que `setTimeout(fn, 0)` dentro de un callback de I/O.

**Errores comunes y soluciones**

- **Asumir que `setTimeout(fn, 0)` y `setImmediate(fn)` siempre tienen un orden fijo.** Fuera de un callback de I/O, el orden entre ambos no es determinista; dentro de un callback de I/O, `setImmediate` siempre gana.
- **Usar `process.nextTick` recursivamente sin límite.** Esto puede monopolizar el Event Loop indefinidamente (I/O starvation); evita la recursión no acotada de `nextTick`.
- **Confundir `global` con el uso idiomático de módulos.** Node fomenta módulos explícitos sobre variables verdaderamente globales; reserva `global` para casos muy específicos.

---

## Ejercicios de evaluación

### Ejercicio 1: Predecir el orden de ejecución

**Enunciado:** predice el orden de salida de: `console.log("A"); setTimeout(() => console.log("B"), 0); setImmediate(() => console.log("C")); process.nextTick(() => console.log("D")); console.log("E");` (ejecutado en el nivel superior de un script, fuera de cualquier callback de I/O).

**Solución esperada:** el orden es `A, E, D, ` y luego `B` y `C` en un orden que puede variar entre ejecuciones (no determinista fuera de I/O), aunque `D` (`process.nextTick`) siempre se ejecuta antes que ambos, inmediatamente después del código síncrono.

**Criterios de éxito:**
- Identifica correctamente que el código síncrono (`A`, `E`) se ejecuta primero.
- Identifica que `process.nextTick` (`D`) tiene prioridad sobre `setTimeout` y `setImmediate`.
- Reconoce que el orden entre `setTimeout` y `setImmediate` no es determinista en este contexto específico (fuera de I/O).

### Ejercicio 2: Por qué Node maneja miles de conexiones con un hilo

**Enunciado:** explica, en tus propias palabras, qué hace posible que Node maneje miles de conexiones simultáneas con un único hilo de JavaScript, y qué tipo de carga de trabajo rompería esta ventaja.

**Solución esperada:** es posible porque las operaciones de I/O se delegan a libuv, que las ejecuta de forma asíncrona (usando el sistema operativo o un pool de hilos interno), liberando el hilo único de JavaScript para atender otras peticiones mientras cada I/O se completa en segundo plano. Esta ventaja se rompe con cargas de trabajo dominadas por cómputo intensivo de CPU (no I/O), que bloquearían el único hilo de JavaScript disponible, impidiendo procesar cualquier otra petición concurrente mientras ese cómputo se completa.

**Criterios de éxito:**
- Explica correctamente el rol de libuv delegando I/O de forma asíncrona.
- Identifica que el cómputo intensivo de CPU (no I/O) es el caso que rompe esta ventaja.

### Ejercicio 3: Diagnosticar bloqueo del Event Loop

**Enunciado:** una API Node responde con lentitud creciente a medida que aumenta el tráfico, y un compañero sospecha que hay una operación síncrona bloqueando el Event Loop en el camino crítico de las peticiones. ¿Qué buscarías en el código para confirmar o descartar esta sospecha?

**Solución esperada:** buscaría el uso de funciones síncronas (terminadas en `Sync`, como `fs.readFileSync`) dentro de manejadores de rutas HTTP, o cómputo intensivo de CPU ejecutado directamente en el hilo principal sin delegarlo a un Worker Thread (Módulo 8); también verificaría si hay bucles largos o recursión de `process.nextTick` sin límite que pudieran monopolizar el Event Loop.

**Criterios de éxito:**
- Identifica correctamente las funciones síncronas como sospechosas principales dentro del camino crítico de peticiones.
- Menciona al menos una alternativa correcta (delegar a Worker Thread) para cómputo intensivo de CPU.

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

- OpenJS Foundation, *Node.js Documentation*.
- IETF, especificaciones HTTP Semantics, OAuth 2.0 y JSON.
- OWASP Foundation, *Application Security Verification Standard*.
- ACM/IEEE-CS/AAAI, *Computer Science Curricula 2023*.
- IEEE Computer Society, *SWEBOK Guide V4.0*.

## Resumen del módulo

**Puntos clave**

- Node combina V8 (ejecuta JavaScript) con libuv (Event Loop e I/O no bloqueante), permitiendo manejar miles de conexiones con un solo hilo si la carga es dominada por I/O.
- El Event Loop de Node tiene fases (timers, poll, check, entre otras) ejecutadas en orden fijo y repetido.
- `process.nextTick` tiene prioridad incluso sobre las fases del Event Loop; su uso recursivo sin límite puede causar inanición de I/O.
- `process` expone información y control sobre el proceso Node en ejecución; los módulos core cubren capacidades fundamentales de un runtime de servidor.
- La arquitectura orientada a eventos (`EventEmitter`) y el no bloqueo son los dos principios de diseño que unifican la API de Node.

**Conceptos aprendidos**

- La arquitectura de dos capas de Node (V8 + libuv).
- Las fases del Event Loop y la prioridad de `process.nextTick`.
- El objeto `process` y los módulos core esenciales.
- Event-driven architecture y el principio de no bloqueo.

**Próximos pasos**

En el Módulo 1 aprenderás a gestionar dependencias de forma reproducible con npm/pnpm, entendiendo lockfiles, semver y workspaces para monorepos.

**Recursos adicionales**

- Documentación oficial de Node.js: "The Node.js Event Loop, Timers, and process.nextTick()".
- Documentación de libuv (libuv.org) para quien quiera profundizar en el detalle de implementación.
- Ejemplos de código ejecutables de este track, en JavaScript: carpeta [`examples/tracks/node/`](https://github.com/NICORUIZ93/Academia_Floci/tree/main/examples/tracks/node) del repositorio — `http-server-native.js` (Módulo 3), `express-middleware.js` (Módulo 4), `db-orm.js` (Módulo 5), `jwt-auth.js` (Módulo 6), `async-patterns.js` (Módulo 8).
