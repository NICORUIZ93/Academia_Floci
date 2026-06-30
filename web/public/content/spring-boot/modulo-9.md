## Mono y Flux

```java
Mono<Tarea> tarea = repositorio.findById(id);     // 0 o 1 elemento
Flux<Tarea> tareas = repositorio.findAll();        // 0 a N elementos
```

Ambos son tipos "perezosos": no hacen nada hasta que alguien se suscribe (en un `@RestController` reactivo, Spring se suscribe automáticamente al devolver la respuesta).

## WebClient: llamadas HTTP no bloqueantes

```java
Mono<Usuario> usuario = webClient.get().uri("/usuarios/{id}", id)
    .retrieve()
    .bodyToMono(Usuario.class);

Mono<Resultado> resultado = usuario.flatMap(u -> webClient.get()
    .uri("/pedidos/{id}", u.pedidoId())
    .retrieve().bodyToMono(Pedido.class)
    .map(p -> new Resultado(u, p)));
```

Ambas llamadas HTTP ocurren sin bloquear un thread esperando la respuesta — el thread queda libre para atender otras requests mientras espera.

## Cuándo vale la pena WebFlux

WebFlux brilla con muchas conexiones concurrentes con I/O (llamadas a otros servicios, streaming) y recursos limitados. Para CRUDs simples con poca concurrencia, Spring MVC tradicional (más simple de razonar, stack traces más legibles) suele ser suficiente — sobre todo ahora que los virtual threads de Java 21 cubren parte del mismo problema con un modelo de programación más simple.

## R2DBC

```java
Flux<Tarea> tareas = databaseClient.sql("SELECT * FROM tarea").map(this::mapearFila).all();
```

Acceso reactivo a base de datos — JDBC tradicional es bloqueante por diseño y no encaja con un pipeline completamente reactivo.
