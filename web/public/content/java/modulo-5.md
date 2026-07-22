# Módulo 5: Concurrencia — hilos y virtual threads


## Aprende construyendo

### Tema 1: ExecutorService y gestión de hilos

#### Paso 1 · Objetivo y preparación
Al finalizar podrás ejecutar trabajo concurrente de forma segura. Prerrequisitos: JDK 21 y un editor. Comprueba java --version.

#### Paso 2 · Contexto y caso real
En un caso real, se consultan rutas y tarifas al mismo tiempo, pero hay que limitar recursos, propagar errores y evitar duplicar estados.

#### Paso 3 · Teoría, modelo mental y analogía
ExecutorService administra un presupuesto de hilos; CompletableFuture compone etapas y errores; virtual threads reducen el coste de tareas bloqueantes, no eliminan límites externos. Una condición de carrera aparece cuando dos actores modifican el mismo estado sin coordinación. La analogía es una central con operadores: más operadores no arreglan una caja registradora compartida sin reglas.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-java-m5
cd ejemplo-java-m5
mkdir -p src/main/java/com/example
```
Crea src/main/java/com/example/Main.java que use ExecutorService para procesar tres entregas y cierre el executor en finally; compila con javac -d out y ejecuta.

#### Paso 5 · Práctica guiada
Pista: comparte deliberadamente un contador no protegido para provocar un fallo deliberado de carrera; observa el total incorrecto y corrígelo con AtomicInteger o confinamiento. Resultado esperado: total determinista.

#### Paso 6 · Práctica independiente
Reescribe la tarea con CompletableFuture y virtual threads, añade timeout, cancelación y una prueba que ejecute 100 solicitudes.

#### Paso 7 · Cierre y evidencia
Guarda resultados, tiempos y logs; como siguiente paso estudia backpressure. Errores comunes: crear un hilo por tarea sin límite, bloquear el common pool, ignorar cancelación y usar synchronized sin medir. Fuentes oficiales: https://dev.java/learn/concurrency/ y https://docs.oracle.com/en/java/javase/21/core/virtual-threads.html.
**¿Por qué es importante?** Porque concurrencia sin límites convierte una mejora de latencia en una caída de servicio.
**Evidencia de aprendizaje:** entrega implementación, fallo de carrera, corrección y medición.
**Conceptos clave:** pool de hilos, reutilización, `submit`/`shutdown`.

Crear un `Thread` manualmente por cada tarea concurrente es costoso (cada thread de plataforma tradicional consume aproximadamente 1 MB de memoria para su stack, y el sistema operativo impone límites prácticos de miles, no millones, de threads de plataforma simultáneos) y no reutiliza recursos entre tareas sucesivas; `ExecutorService pool = Executors.newFixedThreadPool(4); pool.submit(() -> procesarTarea());` gestiona un conjunto fijo de hilos reutilizables (un "pool"), donde cada tarea enviada con `submit()` se ejecuta en uno de esos hilos ya existentes tan pronto como quede disponible, en vez de crear un hilo completamente nuevo para cada tarea individual, reduciendo significativamente el overhead de creación y destrucción repetida de hilos para cargas de trabajo con muchas tareas concurrentes.

`pool.shutdown()` inicia un cierre ordenado del pool, permitiendo que las tareas ya en curso completen normalmente, pero rechazando cualquier tarea nueva enviada después de esa llamada; `invokeAll()` envía un conjunto de tareas simultáneamente y bloquea hasta que todas completen, devolviendo sus resultados combinados, apropiado cuando se necesita esperar explícitamente a que un lote completo de tareas termine antes de continuar. `ScheduledExecutorService` extiende esta misma idea para tareas que deben ejecutarse después de un retraso específico, o repetidamente a intervalos regulares, sin necesidad de gestionar manualmente temporizadores.

**Analogía:** crear un `Thread` por tarea es como contratar y despedir a un trabajador completamente nuevo para cada tarea individual, incluso si esas tareas son breves y frecuentes; un `ExecutorService` es como mantener un equipo fijo de trabajadores ya entrenados, asignándoles nuevas tareas conforme quedan disponibles, sin el costo repetido de contratar y despedir para cada tarea individual.

**¿Por qué es importante?** `ExecutorService` reutiliza un pool de hilos existente en vez de crear y destruir hilos individuales por cada tarea, reduciendo significativamente el overhead para cargas con muchas tareas concurrentes.

**Código del ejemplo:**

```java
ExecutorService pool = Executors.newFixedThreadPool(4);
pool.submit(() -> procesarTarea());
pool.shutdown();
```

#### Construcción RutaFlow: lote con cierre ordenado

Crea `src/main/java/academia/entregas/ProcesadorLote.java`. Construye un pool fijo de cuatro hilos, envía diez `Callable<String>` que devuelvan `guia + " procesada"`, recoge sus `Future` y cierra el ejecutor dentro de `finally`. Ejecuta `javac -d out src/main/java/academia/entregas/ProcesadorLote.java` y `java -cp out academia.entregas.ProcesadorLote`; debes recibir diez resultados y el proceso debe terminar sin quedar abierto.

Comenta `shutdown()` y observa que la JVM puede permanecer activa por los hilos del pool; restáuralo y usa `awaitTermination` con límite. Provoca una tarea fallida y diagnostica la causa dentro de `ExecutionException`, sin reportarla como un simple `null`. Como modificación, limita la cola con `ThreadPoolExecutor` y define qué ocurre al saturarse. Este procesador sirve para trabajo CPU acotado; no crees un pool nuevo por cada guía.

### Tema 2: CompletableFuture

#### Paso 1 · Objetivo y preparación
Al finalizar podrás ejecutar trabajo concurrente de forma segura. Prerrequisitos: JDK 21 y un editor. Comprueba java --version.

#### Paso 2 · Contexto y caso real
En un caso real, se consultan rutas y tarifas al mismo tiempo, pero hay que limitar recursos, propagar errores y evitar duplicar estados.

#### Paso 3 · Teoría, modelo mental y analogía
ExecutorService administra un presupuesto de hilos; CompletableFuture compone etapas y errores; virtual threads reducen el coste de tareas bloqueantes, no eliminan límites externos. Una condición de carrera aparece cuando dos actores modifican el mismo estado sin coordinación. La analogía es una central con operadores: más operadores no arreglan una caja registradora compartida sin reglas.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-java-m5
cd ejemplo-java-m5
mkdir -p src/main/java/com/example
```
Crea src/main/java/com/example/Main.java que use ExecutorService para procesar tres entregas y cierre el executor en finally; compila con javac -d out y ejecuta.

#### Paso 5 · Práctica guiada
Pista: comparte deliberadamente un contador no protegido para provocar un fallo deliberado de carrera; observa el total incorrecto y corrígelo con AtomicInteger o confinamiento. Resultado esperado: total determinista.

#### Paso 6 · Práctica independiente
Reescribe la tarea con CompletableFuture y virtual threads, añade timeout, cancelación y una prueba que ejecute 100 solicitudes.

#### Paso 7 · Cierre y evidencia
Guarda resultados, tiempos y logs; como siguiente paso estudia backpressure. Errores comunes: crear un hilo por tarea sin límite, bloquear el common pool, ignorar cancelación y usar synchronized sin medir. Fuentes oficiales: https://dev.java/learn/concurrency/ y https://docs.oracle.com/en/java/javase/21/core/virtual-threads.html.
**¿Por qué es importante?** Porque concurrencia sin límites convierte una mejora de latencia en una caída de servicio.
**Evidencia de aprendizaje:** entrega implementación, fallo de carrera, corrección y medición.
**Conceptos clave:** composición de operaciones asíncronas, manejo de errores en la cadena.

`CompletableFuture` representa un valor que estará disponible en el futuro como resultado de una operación asíncrona, permitiendo encadenar transformaciones y reacciones sobre ese valor futuro sin bloquear el hilo actual esperando su resultado: `CompletableFuture.supplyAsync(() -> obtenerDatos()).thenApply(datos -> transformar(datos)).thenAccept(resultado -> System.out.println(resultado)).exceptionally(error -> { log.error("Falló", error); return null; });` encadena una obtención de datos asíncrona, una transformación de esos datos, una acción final con el resultado, y un manejo de errores que se activa si cualquier paso anterior de la cadena falla.

Esta composición fluida resuelve el problema de anidar callbacks asíncronos sucesivos de forma manual (el llamado "callback hell", un problema análogo al estudiado para JavaScript en el Módulo 5 del track de JavaScript sobre Promesas), permitiendo expresar una secuencia de pasos asíncronos dependientes entre sí como una cadena lineal legible, en vez de callbacks anidados progresivamente más profundos; `thenCompose` encadena otra operación que a su vez devuelve un `CompletableFuture` (aplanando el resultado, análogo conceptualmente a `flatMap`), mientras `exceptionally` captura cualquier error ocurrido en cualquier punto anterior de toda la cadena, centralizando el manejo de errores en un único lugar en vez de repetirlo en cada paso individual.

**Analogía:** `CompletableFuture` es como encargar una serie de tareas sucesivas a distintos proveedores, donde cada proveedor solo empieza su parte cuando el anterior efectivamente entrega su resultado, sin que quien encargó todo el proceso tenga que esperar bloqueado presencialmente frente a cada proveedor mientras trabaja.

**¿Por qué es importante?** `CompletableFuture` permite componer operaciones asíncronas dependientes entre sí de forma legible y lineal, con manejo de errores centralizado, evitando la anidación progresiva de callbacks manuales.

**Código del ejemplo:**

```java
CompletableFuture.supplyAsync(() -> obtenerDatos())
    .thenApply(datos -> transformar(datos))
    .thenAccept(resultado -> System.out.println(resultado))
    .exceptionally(error -> { log.error("Falló", error); return null; });
```

#### Construcción RutaFlow: componer consulta y tarifa

Crea `src/main/java/academia/entregas/ConsultaAsincrona.java`. Modela `consultarGuia` y `consultarTarifa` como `CompletableFuture`, combínalos con `thenCombine` y termina con `join()` únicamente en el borde del demo. Compila y ejecuta la clase; el resultado esperado contiene la guía y su tarifa una sola vez.

Haz que `consultarTarifa` lance una excepción y observa `CompletionException`; usa `handle` para traducir el fallo a un resultado explícito sin perder la causa. Prueba después la diferencia entre `thenApply` y `thenCompose` cuando el siguiente método ya devuelve un future: el primero anida, el segundo aplana. Como modificación, añade `orTimeout` y una salida diferenciada para demora. RutaFlow usará esta composición solo donde varias fuentes independientes puedan avanzar en paralelo.

### Tema 3: Virtual threads

#### Paso 1 · Objetivo y preparación
Al finalizar podrás ejecutar trabajo concurrente de forma segura. Prerrequisitos: JDK 21 y un editor. Comprueba java --version.

#### Paso 2 · Contexto y caso real
En un caso real, se consultan rutas y tarifas al mismo tiempo, pero hay que limitar recursos, propagar errores y evitar duplicar estados.

#### Paso 3 · Teoría, modelo mental y analogía
ExecutorService administra un presupuesto de hilos; CompletableFuture compone etapas y errores; virtual threads reducen el coste de tareas bloqueantes, no eliminan límites externos. Una condición de carrera aparece cuando dos actores modifican el mismo estado sin coordinación. La analogía es una central con operadores: más operadores no arreglan una caja registradora compartida sin reglas.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-java-m5
cd ejemplo-java-m5
mkdir -p src/main/java/com/example
```
Crea src/main/java/com/example/Main.java que use ExecutorService para procesar tres entregas y cierre el executor en finally; compila con javac -d out y ejecuta.

#### Paso 5 · Práctica guiada
Pista: comparte deliberadamente un contador no protegido para provocar un fallo deliberado de carrera; observa el total incorrecto y corrígelo con AtomicInteger o confinamiento. Resultado esperado: total determinista.

#### Paso 6 · Práctica independiente
Reescribe la tarea con CompletableFuture y virtual threads, añade timeout, cancelación y una prueba que ejecute 100 solicitudes.

#### Paso 7 · Cierre y evidencia
Guarda resultados, tiempos y logs; como siguiente paso estudia backpressure. Errores comunes: crear un hilo por tarea sin límite, bloquear el common pool, ignorar cancelación y usar synchronized sin medir. Fuentes oficiales: https://dev.java/learn/concurrency/ y https://docs.oracle.com/en/java/javase/21/core/virtual-threads.html.
**¿Por qué es importante?** Porque concurrencia sin límites convierte una mejora de latencia en una caída de servicio.
**Evidencia de aprendizaje:** entrega implementación, fallo de carrera, corrección y medición.
**Conceptos clave:** hilos gestionados por la JVM, costo de memoria drásticamente menor, ideal para I/O bloqueante.

Un thread de plataforma tradicional está respaldado directamente por un hilo del sistema operativo, con un costo de memoria considerable (aproximadamente 1 MB de stack por thread) y un límite práctico impuesto por el sistema operativo de, típicamente, unos pocos miles de threads simultáneos como máximo razonable; un virtual thread (introducido de forma estable en Java 21, resultado del proyecto Loom) es gestionado enteramente por la JVM en vez de mapear directamente a un hilo del sistema operativo, consumiendo una fracción diminuta de esa memoria, y permitiendo lanzar cientos de miles (o incluso millones) de tareas concurrentes con código de aspecto completamente síncrono y familiar, sin necesidad de reescribir la lógica en un estilo asíncrono basado en callbacks o `CompletableFuture` explícito.

`try (var executor = Executors.newVirtualThreadPerTaskExecutor()) { for (int i = 0; i < 100_000; i++) { executor.submit(() -> hacerLlamadaIO()); } }` lanza 100,000 tareas concurrentes, cada una en su propio virtual thread dedicado, un volumen que sería completamente inviable con threads de plataforma tradicionales debido a su costo de memoria; la JVM multiplexa internamente muchos virtual threads sobre un número mucho más pequeño de threads de plataforma reales (llamados "carrier threads"), suspendiendo automáticamente un virtual thread mientras espera una operación de I/O bloqueante (una llamada de red, una consulta a base de datos) y liberando ese carrier thread real para que atienda a otro virtual thread mientras tanto, siendo esta la razón por la que los virtual threads son particularmente apropiados para cargas dominadas por I/O bloqueante, donde la mayor parte del tiempo de cada tarea se pasa esperando una respuesta externa, no calculando activamente.

**Analogía:** un thread de plataforma es como reservar una habitación de hotel completa dedicada exclusivamente a una única tarea, con un costo fijo considerable sin importar cuánto tiempo esa tarea pase simplemente esperando sin hacer nada; un virtual thread es como una sala de espera compartida y económica donde miles de personas pueden esperar simultáneamente, y solo se asigna un recurso físico real (el carrier thread) a quien efectivamente está siendo atendido en ese instante específico, liberándolo inmediatamente para atender a otra persona en cuanto la primera simplemente vuelve a esperar.

**¿Por qué es importante?** Los virtual threads consumen una fracción de la memoria de los threads de plataforma y permiten lanzar cientos de miles de tareas concurrentes con código síncrono familiar, siendo especialmente apropiados para cargas dominadas por I/O bloqueante.

**Código del ejemplo:**

```java
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    for (int i = 0; i < 100_000; i++) {
        executor.submit(() -> hacerLlamadaIO());
    }
}
```

#### Construcción RutaFlow: simular consultas bloqueantes

Crea `src/main/java/academia/entregas/ConsultasVirtuales.java` con 1.000 tareas que duerman 50 ms para representar I/O. Ejecuta cada tarea en `Executors.newVirtualThreadPerTaskExecutor()`, espera los `Future` y cuenta resultados. Compila con JDK 21 y ejecuta la clase; el resultado esperado es `completadas=1000` en mucho menos que 50 segundos.

Ejecuta con un JDK anterior y diagnostica el error de compilación verificando `java --version` y `javac --version`; no reemplaces la API sin comprender la versión. Añade una operación larga dentro de `synchronized` y observa que puede reducir escalabilidad; usa JFR para investigar *pinning* cuando sea relevante. Como modificación, controla la concurrencia hacia un proveedor con `Semaphore(20)`: virtual no significa ilimitado. RutaFlow protege así el servicio de mapas y su cuota externa.

### Tema 4: Condiciones de carrera y sincronización

#### Paso 1 · Objetivo y preparación
Al finalizar podrás ejecutar trabajo concurrente de forma segura. Prerrequisitos: JDK 21 y un editor. Comprueba java --version.

#### Paso 2 · Contexto y caso real
En un caso real, se consultan rutas y tarifas al mismo tiempo, pero hay que limitar recursos, propagar errores y evitar duplicar estados.

#### Paso 3 · Teoría, modelo mental y analogía
ExecutorService administra un presupuesto de hilos; CompletableFuture compone etapas y errores; virtual threads reducen el coste de tareas bloqueantes, no eliminan límites externos. Una condición de carrera aparece cuando dos actores modifican el mismo estado sin coordinación. La analogía es una central con operadores: más operadores no arreglan una caja registradora compartida sin reglas.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-java-m5
cd ejemplo-java-m5
mkdir -p src/main/java/com/example
```
Crea src/main/java/com/example/Main.java que use ExecutorService para procesar tres entregas y cierre el executor en finally; compila con javac -d out y ejecuta.

#### Paso 5 · Práctica guiada
Pista: comparte deliberadamente un contador no protegido para provocar un fallo deliberado de carrera; observa el total incorrecto y corrígelo con AtomicInteger o confinamiento. Resultado esperado: total determinista.

#### Paso 6 · Práctica independiente
Reescribe la tarea con CompletableFuture y virtual threads, añade timeout, cancelación y una prueba que ejecute 100 solicitudes.

#### Paso 7 · Cierre y evidencia
Guarda resultados, tiempos y logs; como siguiente paso estudia backpressure. Errores comunes: crear un hilo por tarea sin límite, bloquear el common pool, ignorar cancelación y usar synchronized sin medir. Fuentes oficiales: https://dev.java/learn/concurrency/ y https://docs.oracle.com/en/java/javase/21/core/virtual-threads.html.
**¿Por qué es importante?** Porque concurrencia sin límites convierte una mejora de latencia en una caída de servicio.
**Evidencia de aprendizaje:** entrega implementación, fallo de carrera, corrección y medición.
**Conceptos clave:** acceso concurrente no coordinado, `synchronized`, primitivas de coordinación.

Una condición de carrera ocurre cuando múltiples hilos acceden y modifican el mismo estado compartido mutable sin ninguna coordinación explícita entre ellos, produciendo resultados incorrectos que dependen del orden impredecible en que el sistema operativo efectivamente intercala la ejecución de esos hilos: dos hilos incrementando el mismo contador (`contador++`, que en realidad son tres operaciones separadas a nivel de máquina: leer el valor actual, sumarle uno, y escribir el resultado) pueden ambos leer el mismo valor antes de que cualquiera de los dos escriba su resultado incrementado, perdiendo efectivamente uno de los dos incrementos sin que ningún error explícito se produzca, simplemente un resultado final incorrecto y silencioso.

`synchronized void incrementar() { contador++; }` garantiza acceso exclusivo a la sección crítica marcada: solo un hilo a la vez puede ejecutar ese método sobre la misma instancia en un momento dado, bloqueando a cualquier otro hilo que intente invocarlo simultáneamente hasta que el primero termine, eliminando la posibilidad de que dos hilos lean el mismo valor obsoleto antes de que cualquiera escriba su resultado. `ReentrantLock` ofrece un mecanismo de bloqueo más flexible que `synchronized` (permitiendo, por ejemplo, intentar adquirir el bloqueo con un tiempo límite, o verificar si está actualmente bloqueado sin bloquearse); `Semaphore` limita el número de hilos que pueden acceder simultáneamente a un recurso a un máximo configurable; `CountDownLatch` permite que uno o más hilos esperen hasta que un conjunto de operaciones en otros hilos complete; `CyclicBarrier` sincroniza un grupo fijo de hilos para que todos esperen mutuamente hasta llegar juntos a un punto común antes de continuar.

**Analogía:** una condición de carrera es como dos personas mirando el mismo saldo de una cuenta compartida al mismo tiempo, cada una decidiendo retirar dinero basándose en ese saldo ya obsoleto para cuando efectivamente actualizan el registro, terminando con un saldo final incorrecto sin que ninguna operación individual haya fallado explícitamente; `synchronized` es como una ventanilla única que solo atiende a una persona a la vez para esa cuenta específica, garantizando que cada consulta y actualización del saldo ocurra de forma completamente aislada respecto a cualquier otra.

**¿Por qué es importante?** Una condición de carrera produce resultados incorrectos silenciosos dependientes del orden impredecible de ejecución de los hilos; `synchronized` y otras primitivas de coordinación garantizan acceso exclusivo o coordinado a estado compartido mutable, eliminando esa impredecibilidad.

**Código del ejemplo:**

```java
synchronized void incrementar() { contador++; } // garantiza acceso exclusivo a la sección crítica
```

#### Construcción RutaFlow: demostrar una carrera

Crea `src/main/java/academia/entregas/ContadorEscaneos.java` con un `int total` y lanza 100.000 incrementos concurrentes desde `CarreraDemo.java`. Ejecuta varias veces: sin coordinación el resultado puede ser menor que 100.000. Cambia a `AtomicInteger.incrementAndGet()` y verifica exactamente `100000` en cada ejecución.

La ausencia de fallo en una ejecución no prueba corrección; aumenta repeticiones y coordina el inicio con `CountDownLatch` para ampliar la ventana de carrera. Después compara `synchronized` y `AtomicInteger`, explicando qué invariante protege cada solución. Como modificación, usa `ConcurrentHashMap<String,LongAdder>` para contar por centro operativo. RutaFlow evita compartir mutabilidad siempre que puede; sincroniza la mínima frontera cuando compartir sea inevitable.

---


## Construcción guiada del capítulo

**Objetivo del laboratorio:** construir un servicio concurrente que procese N tareas en paralelo usando virtual threads, corrigiendo una condición de carrera provocada intencionalmente.

**Requisitos previos:** Módulos 0-4 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Lanzar un `Thread` manual y luego con `ExecutorService` | Ver Tema 1 | Compara la reutilización de hilos |
| 2 | Provocar una condición de carrera y corregirla | Ver Tema 4 | Con `synchronized` |
| 3 | Componer llamadas con `CompletableFuture` | Ver Tema 2 | `thenCompose` + `exceptionally` |
| 4 | Crear 100,000 virtual threads | Ver Tema 3 | Compara el uso de memoria contra threads de plataforma |
| 5 | Medir latencia de I/O con threads de plataforma vs virtuales | Ver Tema 3 | Con 1000 tareas de I/O bloqueante |

**Verificación:** el laboratorio se considera exitoso si el contador sin sincronizar muestra un resultado incorrecto reproducible, corregido correctamente con `synchronized`, y si la comparación de virtual threads muestra una diferencia mensurable de uso de memoria o de capacidad de concurrencia frente a threads de plataforma.

**Errores comunes y soluciones**

- **Crear un `Thread` nuevo por cada tarea en cargas con muchas tareas.** Usa un `ExecutorService` para reutilizar hilos.
- **Modificar estado compartido sin sincronización.** Usa `synchronized`, `ReentrantLock`, o estructuras concurrentes como `ConcurrentHashMap`.
- **Usar virtual threads para código CPU-intensivo puro sin I/O.** Los virtual threads no aceleran cálculo puro; su beneficio es específico para I/O bloqueante.

---
