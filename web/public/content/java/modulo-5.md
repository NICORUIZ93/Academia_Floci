# Módulo 5: Concurrencia — hilos y virtual threads

## Sílabo

**Objetivo general**

Dominar la concurrencia en Java moderno: desde `Thread`/`ExecutorService` tradicionales hasta los virtual threads de Java 21, entendiendo condiciones de carrera, sincronización, y composición asíncrona con `CompletableFuture`.

**Objetivos específicos**

1. Crear y lanzar hilos manualmente y con `ExecutorService`.
2. Provocar y corregir una condición de carrera con `synchronized`.
3. Componer llamadas asíncronas con `CompletableFuture`.
4. Explicar por qué los virtual threads son considerablemente más baratos que los threads de plataforma.
5. Medir la diferencia de latencia entre threads de plataforma y virtual threads en cargas con I/O bloqueante.

**Contenido**

- Thread, Runnable y ExecutorService.
- CompletableFuture.
- Virtual threads (Project Loom, Java 21).
- Condiciones de carrera y sincronización.
- ReentrantLock, Semaphore, CountDownLatch y CyclicBarrier.
- ScheduledExecutorService e invokeAll().

**Evaluación**

Servicio concurrente que procesa N tareas en paralelo usando virtual threads, más tres ejercicios de evaluación.

---

## Aprende construyendo

### Tema 1: ExecutorService y gestión de hilos

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

### Tema 2: CompletableFuture

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

### Tema 3: Virtual threads

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

### Tema 4: Condiciones de carrera y sincronización

**Conceptos clave:** acceso concurrente no coordinado, `synchronized`, primitivas de coordinación.

Una condición de carrera ocurre cuando múltiples hilos acceden y modifican el mismo estado compartido mutable sin ninguna coordinación explícita entre ellos, produciendo resultados incorrectos que dependen del orden impredecible en que el sistema operativo efectivamente intercala la ejecución de esos hilos: dos hilos incrementando el mismo contador (`contador++`, que en realidad son tres operaciones separadas a nivel de máquina: leer el valor actual, sumarle uno, y escribir el resultado) pueden ambos leer el mismo valor antes de que cualquiera de los dos escriba su resultado incrementado, perdiendo efectivamente uno de los dos incrementos sin que ningún error explícito se produzca, simplemente un resultado final incorrecto y silencioso.

`synchronized void incrementar() { contador++; }` garantiza acceso exclusivo a la sección crítica marcada: solo un hilo a la vez puede ejecutar ese método sobre la misma instancia en un momento dado, bloqueando a cualquier otro hilo que intente invocarlo simultáneamente hasta que el primero termine, eliminando la posibilidad de que dos hilos lean el mismo valor obsoleto antes de que cualquiera escriba su resultado. `ReentrantLock` ofrece un mecanismo de bloqueo más flexible que `synchronized` (permitiendo, por ejemplo, intentar adquirir el bloqueo con un tiempo límite, o verificar si está actualmente bloqueado sin bloquearse); `Semaphore` limita el número de hilos que pueden acceder simultáneamente a un recurso a un máximo configurable; `CountDownLatch` permite que uno o más hilos esperen hasta que un conjunto de operaciones en otros hilos complete; `CyclicBarrier` sincroniza un grupo fijo de hilos para que todos esperen mutuamente hasta llegar juntos a un punto común antes de continuar.

**Analogía:** una condición de carrera es como dos personas mirando el mismo saldo de una cuenta compartida al mismo tiempo, cada una decidiendo retirar dinero basándose en ese saldo ya obsoleto para cuando efectivamente actualizan el registro, terminando con un saldo final incorrecto sin que ninguna operación individual haya fallado explícitamente; `synchronized` es como una ventanilla única que solo atiende a una persona a la vez para esa cuenta específica, garantizando que cada consulta y actualización del saldo ocurra de forma completamente aislada respecto a cualquier otra.

**¿Por qué es importante?** Una condición de carrera produce resultados incorrectos silenciosos dependientes del orden impredecible de ejecución de los hilos; `synchronized` y otras primitivas de coordinación garantizan acceso exclusivo o coordinado a estado compartido mutable, eliminando esa impredecibilidad.

**Código del ejemplo:**

```java
synchronized void incrementar() { contador++; } // garantiza acceso exclusivo a la sección crítica
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

- Oracle, *Java Language Specification* y *Java Virtual Machine Specification*.
- OpenJDK, documentación de Java SE, JFR y JMH.
- Bloch, J., *Effective Java*.
- ACM/IEEE-CS/AAAI, *Computer Science Curricula 2023*.
- IEEE Computer Society, *SWEBOK Guide V4.0*.

## Resumen del módulo

**Puntos clave**

- `ExecutorService` reutiliza un pool de hilos, evitando el costo de crear y destruir hilos individuales por tarea.
- `CompletableFuture` compone operaciones asíncronas dependientes de forma legible, con manejo de errores centralizado.
- Los virtual threads consumen una fracción de la memoria de los threads de plataforma, ideales para cargas dominadas por I/O bloqueante.
- Una condición de carrera produce resultados incorrectos silenciosos; `synchronized` y otras primitivas garantizan coordinación explícita.

**Conceptos aprendidos**

- Thread, Runnable y ExecutorService.
- CompletableFuture.
- Virtual threads (Project Loom, Java 21).
- Condiciones de carrera y primitivas de sincronización.

**Próximos pasos**

En el Módulo 6 aprenderás I/O, NIO.2 y serialización: `Path`/`Files`, Jackson, y lectura eficiente de archivos grandes.

**Recursos adicionales**

- Documentación oficial de Java (docs.oracle.com/en/java): "Concurrency" y "JEP 444: Virtual Threads".
