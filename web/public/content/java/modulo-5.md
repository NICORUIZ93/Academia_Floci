# Módulo 5: Concurrencia — hilos y virtual threads


## Aprende construyendo

### Tema 1: ExecutorService y gestión de hilos

#### Paso 1 · Objetivo y preparación
Al finalizar podrás reemplazar la creación manual de un `Thread` por tarea con un `ExecutorService` de pool fijo, cerrado correctamente. Prerrequisitos: JDK 21 y un editor. Comprueba java --version.

#### Paso 2 · Contexto y caso real
Procesar 200 solicitudes de cálculo de tarifa creando un `Thread` nuevo para cada una agota rápidamente la memoria disponible; limitar el trabajo concurrente a un pool fijo de tamaño conocido evita ese problema.

#### Paso 3 · Teoría, modelo mental y analogía
Un pool de hilos reutiliza un número fijo de hilos ya creados, en vez de crear y destruir uno por tarea. La analogía: contratar y despedir un trabajador nuevo para cada tarea breve, frente a mantener un equipo fijo ya entrenado que toma la siguiente tarea disponible.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-executor-pool
cd ejemplo-executor-pool
mkdir -p src/main/java/academia/concurrencia
```
Crea `ProcesadorTarifas.java` que mida, con `Thread` crudo primero y con `Executors.newFixedThreadPool(4)` después, el tiempo de procesar 200 tareas breves. Compila y ejecuta, cerrando el pool en un bloque `finally`:
```bash
javac -d out src/main/java/academia/concurrencia/ProcesadorTarifas.java
java -cp out academia.concurrencia.ProcesadorTarifas
```

#### Paso 5 · Práctica guiada
Pista: omite deliberadamente `pool.shutdown()` en el `finally` para provocar un fallo diagnosticable; el proceso de la JVM no termina porque el pool sigue esperando tareas. Resultado esperado: restaurar el `shutdown()` correcto en `finally` hace que el proceso termine normalmente.

#### Paso 6 · Práctica independiente
Reemplaza `submit()` individual por `invokeAll()` para enviar las 200 tareas de una vez y esperar a que todas terminen antes de continuar; compara el código resultante con el de `submit()` uno por uno.

#### Paso 7 · Cierre y evidencia
Guarda ambas versiones (Thread crudo y pool), el bug del pool sin cerrar y la corrección; como siguiente paso estudia CompletableFuture. Errores comunes: crear un hilo por tarea sin límite, bloquear el common pool, ignorar cancelación y usar synchronized sin medir. Fuentes oficiales: https://dev.java/learn/concurrency/ y https://docs.oracle.com/en/java/javase/21/core/virtual-threads.html.
**¿Por qué es importante?** Porque concurrencia sin límites convierte una mejora de latencia en una caída de servicio.
**Evidencia de aprendizaje:** entrega implementación, fallo de carrera, corrección y medición.
**Conceptos clave:** pool de hilos, reutilización, `submit`/`shutdown`.

Cada operación concurrente del proyecto integrador de este track (procesar un lote de tareas, consultar varias fuentes a la vez) usará un `ExecutorService` con un tamaño de pool medido, nunca un `Thread` por tarea sin límite.

**Cuándo no usarlo:** para un puñado de tareas ocasionales (menos de una decena, sin repetirse con frecuencia), crear un `ExecutorService` y gestionarlo correctamente es más ceremonia que simplemente esperar secuencialmente o lanzar un par de `Thread` directos.

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

### Tema 2: CompletableFuture

#### Paso 1 · Objetivo y preparación
Al finalizar podrás encadenar una obtención de datos asíncrona, una transformación y un manejo de errores centralizado con `CompletableFuture`. Prerrequisitos: JDK 21 y un editor. Comprueba java --version.

#### Paso 2 · Contexto y caso real
Consultar la tarifa de una ruta requiere primero obtener la distancia (una llamada lenta) y luego calcular el precio con ella; anidar callbacks manualmente para esta secuencia se vuelve ilegible apenas se agrega un paso más.

#### Paso 3 · Teoría, modelo mental y analogía
`CompletableFuture` compone pasos asíncronos dependientes como una cadena lineal (`thenApply`, `thenCompose`), con `exceptionally` centralizando el manejo de errores de toda la cadena. La analogía: encargar tareas sucesivas a distintos proveedores, donde cada uno empieza su parte solo cuando el anterior entrega la suya, sin que quien encarga espere bloqueado frente a cada uno.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-completable-future
cd ejemplo-completable-future
mkdir -p src/main/java/academia/asincrono
```
Crea `CalculoTarifa.java` con `CompletableFuture.supplyAsync(() -> obtenerDistancia(ruta)).thenApply(distancia -> calcularTarifa(distancia)).thenAccept(tarifa -> ...).exceptionally(...)`. Compila y ejecuta:
```bash
javac -d out src/main/java/academia/asincrono/CalculoTarifa.java
java -cp out academia.asincrono.CalculoTarifa
```

#### Paso 5 · Práctica guiada
Pista: haz que `obtenerDistancia` lance una excepción deliberadamente para provocar un fallo en medio de la cadena; confirma que `exceptionally` la captura sin necesidad de un `try/catch` en cada paso intermedio. Resultado esperado: el error se maneja en un único lugar, no en cada etapa.

#### Paso 6 · Práctica independiente
Agrega un segundo paso asíncrono con `thenCompose` (que a su vez devuelva otro `CompletableFuture`, por ejemplo verificar disponibilidad del conductor) y confirma que la cadena completa sigue siendo lineal y legible.

#### Paso 7 · Cierre y evidencia
Guarda la cadena completa, la salida exitosa y el error capturado por `exceptionally`; como siguiente paso estudia virtual threads. Errores comunes: crear un hilo por tarea sin límite, bloquear el common pool, ignorar cancelación y usar synchronized sin medir. Fuentes oficiales: https://dev.java/learn/concurrency/ y https://docs.oracle.com/en/java/javase/21/core/virtual-threads.html.
**¿Por qué es importante?** Porque concurrencia sin límites convierte una mejora de latencia en una caída de servicio.
**Evidencia de aprendizaje:** entrega implementación, fallo de carrera, corrección y medición.
**Conceptos clave:** composición de operaciones asíncronas, manejo de errores en la cadena.

Cada secuencia de llamadas dependientes entre sí del proyecto integrador de este track (obtener datos, transformarlos, reaccionar al resultado) se beneficiará de esta misma composición lineal en vez de callbacks anidados.

**Cuándo no usarlo:** para una única llamada asíncrona sin pasos dependientes posteriores, encadenar `CompletableFuture` agrega sintaxis sin beneficio; basta con `supplyAsync` y esperar su resultado directamente.

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

### Tema 3: Virtual threads

#### Paso 1 · Objetivo y preparación
Al finalizar podrás lanzar decenas de miles de tareas concurrentes de I/O bloqueante con virtual threads, algo inviable con threads de plataforma. Prerrequisitos: JDK 21 y un editor. Comprueba java --version.

#### Paso 2 · Contexto y caso real
Simular 50 000 solicitudes de tracking de entregas que cada una espera una respuesta de red simulada agotaría la memoria disponible con threads de plataforma tradicionales (aproximadamente 1 MB de stack cada uno); con virtual threads es viable.

#### Paso 3 · Teoría, modelo mental y analogía
Un virtual thread es gestionado por la JVM, no mapea 1:1 a un hilo del sistema operativo, y se suspende automáticamente durante una espera de I/O liberando el "carrier thread" real. La analogía: una sala de espera compartida y económica donde miles esperan a la vez, y solo se asigna un recurso físico real a quien está siendo atendido en ese instante.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-virtual-threads
cd ejemplo-virtual-threads
mkdir -p src/main/java/academia/virtuales
```
Crea `TrackingMasivo.java` que lance 50 000 tareas con `Executors.newVirtualThreadPerTaskExecutor()`, cada una simulando una espera de I/O con `Thread.sleep(50)`. Compila y ejecuta, midiendo el tiempo total:
```bash
javac -d out src/main/java/academia/virtuales/TrackingMasivo.java
java -cp out academia.virtuales.TrackingMasivo
```

#### Paso 5 · Práctica guiada
Pista: cambia deliberadamente el executor a `Executors.newFixedThreadPool(200)` con las mismas 50 000 tareas para provocar un fallo de expectativa; el tiempo total aumenta drásticamente porque solo 200 tareas pueden esperar a la vez. Resultado esperado: confirmas que los virtual threads permiten mucha más concurrencia de I/O con el mismo hardware.

#### Paso 6 · Práctica independiente
Reemplaza `Thread.sleep(50)` por un cálculo puro de CPU (por ejemplo, contar primos) y repite la comparación; confirma que ahí los virtual threads no ofrecen ninguna ventaja sobre un pool de plataforma bien dimensionado.

#### Paso 7 · Cierre y evidencia
Guarda ambas mediciones (I/O bloqueante y CPU pura) y la conclusión sobre cuándo virtual threads ayudan; como siguiente paso estudia condiciones de carrera. Errores comunes: crear un hilo por tarea sin límite, bloquear el common pool, ignorar cancelación y usar synchronized sin medir. Fuentes oficiales: https://dev.java/learn/concurrency/ y https://docs.oracle.com/en/java/javase/21/core/virtual-threads.html.
**¿Por qué es importante?** Porque concurrencia sin límites convierte una mejora de latencia en una caída de servicio.
**Evidencia de aprendizaje:** entrega implementación, fallo de carrera, corrección y medición.
**Conceptos clave:** hilos gestionados por la JVM, costo de memoria drásticamente menor, ideal para I/O bloqueante.

Cualquier operación del proyecto integrador de este track dominada por espera de I/O (consultar varias fuentes externas a la vez) se beneficiará de virtual threads exactamente como en esta medición.

**Cuándo no usarlo:** los virtual threads no aceleran cálculo puro de CPU; para código CPU-intensivo sin I/O bloqueante, un pool de threads de plataforma bien dimensionado al número de núcleos disponibles sigue siendo la elección correcta.

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

### Tema 4: Condiciones de carrera y sincronización

#### Paso 1 · Objetivo y preparación
Al finalizar podrás reproducir una condición de carrera real con un contador compartido y corregirla con `synchronized`. Prerrequisitos: JDK 21 y un editor. Comprueba java --version.

#### Paso 2 · Contexto y caso real
Cien hilos incrementando simultáneamente un contador compartido de "entregas procesadas hoy" sin ninguna coordinación pierden incrementos silenciosamente: el total final es menor al esperado, sin ningún error explícito.

#### Paso 3 · Teoría, modelo mental y analogía
`contador++` son en realidad tres operaciones (leer, sumar, escribir); dos hilos pueden leer el mismo valor antes de que cualquiera escriba el incrementado, perdiendo uno de los dos. La analogía: dos personas mirando el mismo saldo de una cuenta compartida al mismo tiempo, cada una decidiendo retirar dinero basándose en ese saldo ya obsoleto.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-condicion-carrera
cd ejemplo-condicion-carrera
mkdir -p src/main/java/academia/concurrencia
```
Crea `ContadorEntregas.java` con un campo `int contador` incrementado por 100 hilos concurrentes sin sincronización, y compara con la misma clase usando `synchronized void incrementar()`. Compila y ejecuta ambas versiones:
```bash
javac -d out src/main/java/academia/concurrencia/ContadorEntregas.java
java -cp out academia.concurrencia.ContadorEntregas
```

#### Paso 5 · Práctica guiada
Pista: ejecuta la versión sin sincronizar varias veces seguidas para provocar el fallo deliberado; el resultado final varía entre ejecuciones y es menor a 100 veces la cantidad de incrementos por hilo. Resultado esperado: con `synchronized`, el resultado es siempre el mismo valor correcto, sin importar cuántas veces lo ejecutes.

#### Paso 6 · Práctica independiente
Reemplaza `synchronized` por `AtomicInteger` (usando `incrementAndGet()`) y confirma que el resultado sigue siendo correcto y determinista, sin necesidad de un bloque `synchronized` explícito.

#### Paso 7 · Cierre y evidencia
Guarda ambas versiones (sin sincronizar y con `synchronized`/`AtomicInteger`), los resultados inconsistentes y el resultado corregido; como siguiente paso estudia NIO.2. Errores comunes: crear un hilo por tarea sin límite, bloquear el common pool, ignorar cancelación y usar synchronized sin medir. Fuentes oficiales: https://dev.java/learn/concurrency/ y https://docs.oracle.com/en/java/javase/21/core/virtual-threads.html.
**¿Por qué es importante?** Porque concurrencia sin límites convierte una mejora de latencia en una caída de servicio.
**Evidencia de aprendizaje:** entrega implementación, fallo de carrera, corrección y medición.
**Conceptos clave:** acceso concurrente no coordinado, `synchronized`, primitivas de coordinación.

Cualquier contador o estado mutable compartido entre hilos del proyecto integrador de este track necesitará esta misma protección (`synchronized`, `AtomicInteger` o una estructura concurrente), nunca acceso concurrente sin coordinar.

**Cuándo no usarlo:** `synchronized` en cada acceso a un contador de alta frecuencia introduce contención entre hilos; para ese caso específico, `AtomicInteger` (basado en operaciones atómicas de hardware) suele rendir mejor que un bloque `synchronized` completo.

Una condición de carrera ocurre cuando múltiples hilos acceden y modifican el mismo estado compartido mutable sin ninguna coordinación explícita entre ellos, produciendo resultados incorrectos que dependen del orden impredecible en que el sistema operativo efectivamente intercala la ejecución de esos hilos: dos hilos incrementando el mismo contador (`contador++`, que en realidad son tres operaciones separadas a nivel de máquina: leer el valor actual, sumarle uno, y escribir el resultado) pueden ambos leer el mismo valor antes de que cualquiera de los dos escriba su resultado incrementado, perdiendo efectivamente uno de los dos incrementos sin que ningún error explícito se produzca, simplemente un resultado final incorrecto y silencioso.

`synchronized void incrementar() { contador++; }` garantiza acceso exclusivo a la sección crítica marcada: solo un hilo a la vez puede ejecutar ese método sobre la misma instancia en un momento dado, bloqueando a cualquier otro hilo que intente invocarlo simultáneamente hasta que el primero termine, eliminando la posibilidad de que dos hilos lean el mismo valor obsoleto antes de que cualquiera escriba su resultado. `ReentrantLock` ofrece un mecanismo de bloqueo más flexible que `synchronized` (permitiendo, por ejemplo, intentar adquirir el bloqueo con un tiempo límite, o verificar si está actualmente bloqueado sin bloquearse); `Semaphore` limita el número de hilos que pueden acceder simultáneamente a un recurso a un máximo configurable; `CountDownLatch` permite que uno o más hilos esperen hasta que un conjunto de operaciones en otros hilos complete; `CyclicBarrier` sincroniza un grupo fijo de hilos para que todos esperen mutuamente hasta llegar juntos a un punto común antes de continuar.

**Analogía:** una condición de carrera es como dos personas mirando el mismo saldo de una cuenta compartida al mismo tiempo, cada una decidiendo retirar dinero basándose en ese saldo ya obsoleto para cuando efectivamente actualizan el registro, terminando con un saldo final incorrecto sin que ninguna operación individual haya fallado explícitamente; `synchronized` es como una ventanilla única que solo atiende a una persona a la vez para esa cuenta específica, garantizando que cada consulta y actualización del saldo ocurra de forma completamente aislada respecto a cualquier otra.

**¿Por qué es importante?** Una condición de carrera produce resultados incorrectos silenciosos dependientes del orden impredecible de ejecución de los hilos; `synchronized` y otras primitivas de coordinación garantizan acceso exclusivo o coordinado a estado compartido mutable, eliminando esa impredecibilidad.

**Código del ejemplo:**

```java
synchronized void incrementar() { contador++; } // garantiza acceso exclusivo a la sección crítica
```

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
