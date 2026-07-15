# Módulo 9: Programación reactiva con WebFlux

## Sílabo

**Objetivo general**

Entender el modelo no bloqueante de Spring WebFlux para alta concurrencia con recursos limitados, dominando Mono/Flux, WebClient reactivo, y cuándo esta complejidad adicional realmente se justifica frente a Spring MVC tradicional.

**Objetivos específicos**

1. Crear endpoints reactivos que devuelvan `Mono` y `Flux`.
2. Componer llamadas HTTP externas de forma no bloqueante con `WebClient` y `flatMap`.
3. Comparar el modelo reactivo con el equivalente bloqueante de Spring MVC.
4. Explicar qué ocurre al mezclar código bloqueante dentro de un flujo reactivo.
5. Conectar a una base de datos con R2DBC.

**Contenido**

- Mono y Flux.
- WebClient reactivo.
- Cuándo WebFlux vale la complejidad frente a MVC.
- R2DBC para acceso reactivo a datos.

**Evaluación**

Endpoint reactivo que compone múltiples llamadas no bloqueantes con WebClient, más tres ejercicios de evaluación.

---

## Contenido teórico

### Tema 1: Mono y Flux

**Conceptos clave:** 0 o 1 elemento frente a 0 a N elementos, evaluación perezosa con suscripción.

`Mono<Tarea> tarea = repositorio.findById(id);` representa un flujo reactivo de cero o un elemento (análogo conceptualmente a un `Optional` asíncrono, Módulo 4 del track de Java, pero para un valor que llegará en el futuro, no uno ya disponible); `Flux<Tarea> tareas = repositorio.findAll();` representa un flujo de cero a N elementos, análogo conceptualmente a un `Stream` (Módulo 4 del track de Java) pero para una secuencia de valores que llega de forma asíncrona a lo largo del tiempo, no una colección ya completamente disponible en memoria.

Ambos tipos son perezosos por diseño (de forma similar a los Observables de RxJS, Módulo 6 del track de Angular): no ejecutan ninguna lógica productora hasta que alguien efectivamente se suscribe a ellos, con Spring suscribiéndose automáticamente cuando un `@RestController` reactivo devuelve un `Mono`/`Flux` como resultado de un endpoint, sin que el código de la aplicación tenga que llamar manualmente a `.subscribe()` en ese caso común, aunque la suscripción explícita sigue siendo necesaria (y relevante de entender) en otros contextos donde Spring no la gestiona automáticamente.

**Analogía:** `Mono` es como un recibo de entrega que promete traer cero o un paquete específico en el futuro; `Flux` es como una cinta transportadora que entregará una secuencia de paquetes a lo largo del tiempo, cero o muchos, sin que ninguno de los dos comience a producir realmente sus paquetes hasta que alguien efectivamente se registre para recibirlos.

**¿Por qué es importante?** `Mono` y `Flux` modelan explícitamente la cardinalidad esperada del resultado asíncrono (cero-o-uno frente a cero-a-N), con evaluación perezosa que no ejecuta nada hasta que existe un suscriptor real interesado en el resultado.

**Diagrama:**

```java
Mono<Tarea> tarea = repositorio.findById(id);     // 0 o 1 elemento
Flux<Tarea> tareas = repositorio.findAll();        // 0 a N elementos
```

### Tema 2: WebClient y composición no bloqueante

**Conceptos clave:** thread libre mientras espera I/O, composición con `flatMap`.

`WebClient` reemplaza al histórico `RestTemplate` (ahora considerado legado) para realizar llamadas HTTP salientes de forma completamente no bloqueante: `Mono<Usuario> usuario = webClient.get().uri("/usuarios/{id}", id).retrieve().bodyToMono(Usuario.class);` inicia la petición sin bloquear el thread actual esperando la respuesta, liberando ese thread para atender otras peticiones concurrentes mientras la respuesta de la llamada externa todavía está en tránsito, un modelo fundamentalmente distinto al de `RestTemplate` (o cualquier cliente HTTP bloqueante tradicional), que mantendría el thread ocupado y esperando activamente durante toda la duración de la llamada de red.

`usuario.flatMap(u -> webClient.get().uri("/pedidos/{id}", u.pedidoId()).retrieve().bodyToMono(Pedido.class).map(p -> new Resultado(u, p)))` compone dos llamadas HTTP dependientes entre sí (la segunda necesita el resultado de la primera) sin bloquear el thread en ningún punto de la cadena, de forma directamente análoga a `thenCompose` de `CompletableFuture` (Módulo 5 del track de Java): ambas llamadas ocurren de forma completamente no bloqueante, con el thread liberado para otras tareas durante toda la espera de ambas respuestas de red.

**Analogía:** `WebClient` es como un mensajero que, tras enviar una solicitud, no se queda esperando parado frente a la puerta hasta recibir la respuesta, sino que atiende otras tareas mientras tanto, volviendo a ocuparse de esa solicitud específica únicamente cuando la respuesta efectivamente llega, sin desperdiciar tiempo de espera activa e improductiva.

**¿Por qué es importante?** `WebClient` realiza llamadas HTTP sin bloquear el thread durante la espera de la respuesta, liberándolo para atender otras peticiones concurrentes, un beneficio directo para sistemas con alta concurrencia de I/O.

**Diagrama:**

```java
Mono<Usuario> usuario = webClient.get().uri("/usuarios/{id}", id)
    .retrieve()
    .bodyToMono(Usuario.class);

Mono<Resultado> resultado = usuario.flatMap(u -> webClient.get()
    .uri("/pedidos/{id}", u.pedidoId())
    .retrieve().bodyToMono(Pedido.class)
    .map(p -> new Resultado(u, p)));
```

### Tema 3: Cuándo WebFlux vale la complejidad, y R2DBC

**Conceptos clave:** alta concurrencia con recursos limitados frente a CRUD simple, JDBC bloqueante en un pipeline reactivo.

WebFlux brilla específicamente en sistemas con muchas conexiones concurrentes dominadas por I/O (llamadas hacia otros servicios, streaming de datos) donde los recursos de threads son limitados y se desea evitar el costo de mantener un thread bloqueado por conexión activa esperando I/O; para CRUDs simples con concurrencia moderada, Spring MVC tradicional (bloqueante, pero con un modelo de programación considerablemente más simple de razonar, con stack traces lineales y legibles, en vez del flujo de ejecución más difícil de seguir de una cadena reactiva) suele ser suficiente, un balance que se ha vuelto todavía más relevante desde la introducción de los virtual threads de Java 21 (Módulo 5 del track de Java), que cubren buena parte del mismo problema original de WebFlux (muchas conexiones concurrentes con I/O bloqueante) pero con un modelo de programación síncrono y considerablemente más simple de escribir y depurar.

Mezclar código bloqueante tradicional (como JDBC clásico) dentro de un pipeline reactivo es un antipatrón grave: ese código bloqueante ocuparía uno de los pocos threads del pool reactivo (diseñado específicamente para nunca bloquearse) durante toda la duración de la operación bloqueante, potencialmente agotando ese pool pequeño y compartido y afectando negativamente a todas las demás peticiones reactivas concurrentes que dependen de esos mismos threads limitados; R2DBC es la alternativa reactiva a JDBC específicamente diseñada para no bloquear, siendo la elección correcta para acceso a datos dentro de un pipeline completamente reactivo, en vez de JDBC bloqueante por diseño.

**Analogía:** mezclar código bloqueante en un pipeline reactivo es como detener por completo una de las pocas líneas de ensamblaje rápidas y especializadas de una fábrica para realizar manualmente una tarea lenta que debería hacerse en otra área separada, deteniendo el flujo de toda esa línea rápida mientras dura esa tarea lenta específica.

**¿Por qué es importante?** WebFlux se justifica específicamente para alta concurrencia con recursos limitados, no para CRUDs simples donde Spring MVC (o virtual threads) es más simple; mezclar código bloqueante en un pipeline reactivo puede agotar el pool de threads reactivos compartido, afectando a todas las peticiones concurrentes.

**Diagrama:**

```java
Flux<Tarea> tareas = databaseClient.sql("SELECT * FROM tarea").map(this::mapearFila).all();
```
```
WebFlux: justificado con muchas conexiones I/O concurrentes + recursos limitados
Spring MVC / virtual threads: más simple, suficiente para CRUDs de concurrencia moderada
```

---

## Laboratorio práctico

**Objetivo del laboratorio:** construir un endpoint reactivo que compone múltiples llamadas no bloqueantes con WebClient.

**Requisitos previos:** Módulos 0-8 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Crear endpoints `Mono<Tarea>` y `Flux<Tarea>` | Ver Tema 1 | Verifica la evaluación perezosa |
| 2 | Componer dos llamadas HTTP con `WebClient`/`flatMap` | Ver Tema 2 | Sin bloquear el thread |
| 3 | Comparar con el equivalente en Spring MVC | Ver Tema 3 | Documenta la diferencia de modelo mental |
| 4 | Conectar con R2DBC y ejecutar una query reactiva | Ver Tema 3 | Verifica que no bloquea |

**Verificación:** el laboratorio se considera exitoso si la composición de llamadas con `WebClient` no bloquea ningún thread durante la espera de red, y si puedes explicar concretamente cuándo elegirías WebFlux frente a Spring MVC para un caso de uso real específico.

**Errores comunes y soluciones**

- **Mezclar JDBC bloqueante dentro de un pipeline reactivo.** Usa R2DBC para acceso a datos reactivo consistente.
- **Adoptar WebFlux para un CRUD simple sin necesidad real de alta concurrencia.** Evalúa si Spring MVC (o virtual threads) sería más simple y suficiente.
- **Usar `RestTemplate` en vez de `WebClient` para llamadas reactivas.** `RestTemplate` es bloqueante y está considerado legado; usa `WebClient`.

---

## Ejercicios de evaluación

### Ejercicio 1: Cuándo WebFlux justifica su complejidad

**Enunciado:** ¿cuándo el modelo no bloqueante de WebFlux realmente justifica su complejidad adicional frente a Spring MVC?

**Solución esperada:** cuando el sistema maneja muchas conexiones concurrentes dominadas por I/O (llamadas a otros servicios, streaming) con recursos de threads limitados, donde evitar mantener un thread bloqueado por conexión activa aporta un beneficio real de escalabilidad; para CRUDs simples con concurrencia moderada, Spring MVC (más simple de razonar) suele ser suficiente.

**Criterios de éxito:**
- Identifica correctamente alta concurrencia de I/O con recursos limitados como el escenario que justifica WebFlux.

### Ejercicio 2: Riesgo de mezclar código bloqueante en un flujo reactivo

**Enunciado:** ¿qué pasa si mezclas código bloqueante (ej. JDBC tradicional) dentro de un flujo reactivo?

**Solución esperada:** ese código bloqueante ocupa uno de los pocos threads del pool reactivo (diseñado para nunca bloquearse) durante toda la duración de la operación bloqueante, pudiendo agotar ese pool compartido y afectar negativamente a todas las demás peticiones reactivas concurrentes.

**Criterios de éxito:**
- Explica correctamente el agotamiento del pool reactivo compartido como la consecuencia del código bloqueante mezclado.

### Ejercicio 3: Mono vs Flux

**Enunciado:** ¿cuándo usarías `Mono` y cuándo `Flux` para el retorno de un endpoint?

**Solución esperada:** `Mono` cuando el resultado esperado es de cero o un único elemento (buscar una entidad por su id); `Flux` cuando el resultado esperado es una secuencia de cero a N elementos (listar todas las entidades de un tipo).

**Criterios de éxito:**
- Distingue correctamente la cardinalidad esperada (cero-o-uno frente a cero-a-N) como criterio de elección.

---

## Resumen del módulo

**Puntos clave**

- `Mono` (0 o 1) y `Flux` (0 a N) modelan explícitamente la cardinalidad de un resultado asíncrono, con evaluación perezosa.
- `WebClient` realiza llamadas HTTP sin bloquear threads, componibles con `flatMap` de forma similar a `CompletableFuture`.
- WebFlux se justifica para alta concurrencia de I/O con recursos limitados, no para CRUDs simples.
- Mezclar código bloqueante en un pipeline reactivo puede agotar el pool de threads reactivos compartido; R2DBC es la alternativa reactiva a JDBC.

**Conceptos aprendidos**

- Mono y Flux.
- WebClient reactivo y composición no bloqueante.
- Criterios para elegir WebFlux frente a Spring MVC.
- R2DBC.

**Próximos pasos**

En el Módulo 10 aprenderás microservicios con Spring Cloud: Config Server, service discovery, gateway, y circuit breakers.

**Recursos adicionales**

- Documentación oficial de Spring WebFlux (docs.spring.io/spring-framework) y R2DBC (r2dbc.io).
