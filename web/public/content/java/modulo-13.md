## Arquitectura del proyecto

```
src/main/java/com/miapp/
  dominio/        ← records, sealed interfaces (módulo 7)
  servicio/        ← lógica de negocio, usa virtual threads para I/O concurrente (módulo 5)
  infraestructura/ ← persistencia, clientes externos
  Main.java
src/test/java/com/miapp/
  servicio/        ← tests con JUnit 5 + Mockito (módulo 9)
```

## Uniendo los módulos del track

Este proyecto integra: modelado de dominio inmutable con records y sealed interfaces (módulo 7), procesamiento concurrente con virtual threads para tareas con I/O (módulo 5), manejo robusto de excepciones con try-with-resources (módulo 3), tests unitarios aislados con mocks (módulo 9), y un build reproducible con Gradle o Maven (módulo 8) que cualquiera puede ejecutar con un solo comando.

```java
sealed interface ResultadoProcesamiento permits Exito, Error {}
record Exito(String datos) implements ResultadoProcesamiento {}
record Error(String motivo) implements ResultadoProcesamiento {}

List<ResultadoProcesamiento> resultados;
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    resultados = tareas.stream()
        .map(t -> executor.submit(() -> procesar(t)))
        .map(this::obtenerResultado)
        .toList();
}
```

## Cierre del track

Java moderno (17-21) reduce significativamente el boilerplate que históricamente se le criticaba al lenguaje, sin sacrificar el tipado fuerte ni el rendimiento de la JVM — records, pattern matching y virtual threads son las herramientas que hacen que Java se sienta tan productivo hoy como cualquier lenguaje más reciente.
