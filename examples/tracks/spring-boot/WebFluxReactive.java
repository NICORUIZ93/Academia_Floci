// Programación reactiva con WebFlux (Módulo 9): Mono/Flux frente a bloqueo tradicional.
package com.ejemplo.tareas;

import java.time.Duration;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
class TareaReactiveController {

  // Mono<T>: 0 o 1 elemento asíncrono — el equivalente reactivo de una Promise/Future.
  @GetMapping("/api/reactive/tareas/{id}")
  Mono<String> obtenerTarea(String id) {
    return Mono.just("Tarea " + id)
        // delayElement simula I/O asíncrono (una llamada a BD reactiva real
        // devolvería su propio Mono, sin necesidad de este delay artificial).
        .delayElement(Duration.ofMillis(100));
  }

  // Flux<T>: 0 a N elementos asíncronos, como un Stream pero no bloqueante —
  // los elementos se emiten a medida que están listos, no todos de una vez.
  @GetMapping(value = "/api/reactive/tareas", produces = "text/event-stream")
  Flux<String> streamTareas() {
    return Flux.interval(Duration.ofSeconds(1))
        .map(i -> "Tarea número " + i)
        .take(5);
  }

  // La diferencia clave frente a un @RestController tradicional (Módulo 2): con
  // WebFlux, el hilo que atiende la petición NO se bloquea esperando el resultado;
  // queda libre para atender otras peticiones mientras el Mono/Flux se resuelve,
  // lo que permite manejar muchas más conexiones concurrentes con menos hilos.
}
