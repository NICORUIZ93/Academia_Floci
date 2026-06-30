## ExecutorService

```java
ExecutorService pool = Executors.newFixedThreadPool(4);
pool.submit(() -> procesarTarea());
pool.shutdown();
```

## CompletableFuture

```java
CompletableFuture.supplyAsync(() -> obtenerDatos())
    .thenApply(datos -> transformar(datos))
    .thenAccept(resultado -> System.out.println(resultado))
    .exceptionally(error -> { log.error("Falló", error); return null; });
```

## Virtual threads (Java 21+)

```java
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    for (int i = 0; i < 100_000; i++) {
        executor.submit(() -> hacerLlamadaIO());
    }
}
```

Un thread de plataforma tradicional consume ~1MB de memoria y está limitado por el sistema operativo (miles, no millones). Un **virtual thread** es gestionado por la JVM, consume una fracción de esa memoria, y permite lanzar cientos de miles de tareas concurrentes con código de aspecto completamente síncrono — ideal para cargas con mucha I/O bloqueante (llamadas HTTP, consultas a base de datos).

## Condiciones de carrera

```java
synchronized void incrementar() { contador++; } // garantiza acceso exclusivo a la sección crítica
```

Sin `synchronized` (u otro mecanismo de sincronización), dos hilos pueden leer el mismo valor antes de que cualquiera escriba el resultado incrementado, perdiendo una actualización.
