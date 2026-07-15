# Módulo 10: Microservicios con Spring Cloud

## Sílabo

**Objetivo general**

Coordinar múltiples servicios Spring Boot con configuración centralizada, descubrimiento de servicios, un gateway como punto de entrada único, y resiliencia con circuit breakers.

**Objetivos específicos**

1. Registrar y descubrir microservicios por nombre con Eureka.
2. Configurar Spring Cloud Gateway como punto de entrada único.
3. Explicar qué problema resuelve un Config Server centralizado.
4. Implementar un circuit breaker con Resilience4j y observar el fallback en acción.
5. Explicar el propósito de `@RefreshScope` para configuración dinámica.

**Contenido**

- Config Server.
- Service discovery (Eureka).
- Spring Cloud Gateway.
- Resiliencia con Resilience4j (circuit breaker).
- `@Retry`, `@RateLimiter`, `@Bulkhead` y `@TimeLimiter`.
- Spring Cloud Bus y `@RefreshScope`.

**Evaluación**

Dos microservicios Spring Boot comunicándose vía gateway con circuit breaker, más tres ejercicios de evaluación.

---

## Contenido teórico

### Tema 1: Config Server y service discovery

**Conceptos clave:** configuración centralizada respaldada por Git, resolución por nombre en vez de URL fija.

En un sistema con muchos microservicios independientes, cada uno manteniendo su propio `application.yml` local, cambiar un valor de configuración compartido entre varios servicios (una URL de un servicio externo común, por ejemplo) requeriría modificar y redesplegar cada servicio individual que use ese valor; un Config Server centraliza la configuración de todos los microservicios en un único lugar (típicamente respaldado por un repositorio Git, permitiendo versionar y revisar cambios de configuración como cualquier otro cambio de código), de modo que cambiar un valor compartido en el Config Server puede propagarse a todos los servicios que lo consumen sin necesidad de redesplegar cada uno individualmente.

`@FeignClient(name = "servicio-pedidos") interface PedidosClient { @GetMapping("/pedidos/{id}") Pedido obtener(@PathVariable Long id); }` demuestra el patrón de service discovery: en vez de codificar una URL fija hacia el servicio de pedidos (que podría cambiar según el entorno, o tener múltiples instancias corriendo simultáneamente para balanceo de carga), el cliente se resuelve por nombre lógico (`servicio-pedidos`), y Eureka (el servidor de registro, `@EnableEurekaServer`) mantiene un directorio actualizado de qué instancias físicas específicas corresponden actualmente a ese nombre lógico, permitiendo que instancias se agreguen, se quiten, o cambien de ubicación sin que el código cliente necesite ninguna actualización.

**Analogía:** un Config Server centralizado es como un directorio maestro de políticas compartidas entre todas las sucursales de una franquicia, actualizable en un único lugar en vez de tener que visitar cada sucursal individual para actualizar su copia local; el service discovery con Eureka es como un directorio telefónico que se actualiza automáticamente cada vez que una sucursal cambia de dirección, permitiendo que quien llame simplemente marque el nombre de la sucursal sin necesitar conocer su dirección física exacta y actualizada en cada momento.

**¿Por qué es importante?** Un Config Server centralizado evita tener que redesplegar cada microservicio individualmente ante un cambio de configuración compartida; el service discovery permite que los servicios se comuniquen por nombre lógico, tolerando cambios de ubicación o escalado de instancias sin actualizar el código cliente.

**Diagrama:**

```java
@EnableEurekaServer // servidor de registro
@EnableDiscoveryClient // cada microservicio se registra aquí

@FeignClient(name = "servicio-pedidos") // se resuelve por nombre, no por URL fija
interface PedidosClient { @GetMapping("/pedidos/{id}") Pedido obtener(@PathVariable Long id); }
```

### Tema 2: Spring Cloud Gateway

**Conceptos clave:** punto de entrada único, enrutamiento centralizado.

`spring: cloud: gateway: routes: - id: pedidos uri: lb://servicio-pedidos predicates: [Path=/api/pedidos/**]` configura un único punto de entrada para todo el sistema de microservicios, enrutando cada petición entrante hacia el microservicio correcto según el patrón de la ruta solicitada (`/api/pedidos/**` dirigiéndose específicamente hacia `servicio-pedidos`, resuelto a su vez por service discovery mediante el prefijo `lb://`, indicando balanceo de carga entre las instancias disponibles de ese servicio).

Centralizar el enrutamiento en un gateway único es también el lugar natural para centralizar responsabilidades transversales que de otro modo tendrían que duplicarse en cada microservicio individual: autenticación (verificar el token una única vez en el gateway antes de enrutar hacia el servicio correspondiente, en vez de que cada microservicio individual repita esa misma verificación), rate limiting (limitar la tasa de peticiones antes de que lleguen a los servicios internos), y logging centralizado de todas las peticiones entrantes al sistema completo, sin duplicar esa lógica transversal en cada microservicio individual.

**Analogía:** un gateway es como la recepción única de un complejo de oficinas con múltiples departamentos internos, donde los visitantes se registran una única vez en la recepción y son dirigidos automáticamente al departamento correcto, en vez de que cada departamento individual tenga que gestionar su propia recepción y verificación de visitantes por separado.

**¿Por qué es importante?** Un gateway centraliza el enrutamiento hacia los microservicios correctos, y es el lugar natural para centralizar autenticación, rate limiting y logging transversal, evitando duplicar esa lógica en cada microservicio individual.

**Diagrama:**

```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: pedidos
          uri: lb://servicio-pedidos
          predicates: [Path=/api/pedidos/**]
```

### Tema 3: Circuit breaker con Resilience4j

**Conceptos clave:** abrir el circuito ante fallos repetidos, fallback inmediato.

`@CircuitBreaker(name = "servicioPedidos", fallbackMethod = "fallbackPedidos") public Pedido obtenerPedido(Long id) { return pedidosClient.obtener(id); } public Pedido fallbackPedidos(Long id, Exception e) { return Pedido.vacio(); }` protege una llamada a un servicio externo (o a otro microservicio) contra fallos repetidos y sostenidos: si `servicio-pedidos` comienza a fallar consistentemente (superando un umbral configurable de tasa de fallo), el circuit breaker "abre el circuito", dejando de intentar realizar la llamada real hacia ese servicio caído durante un período configurable, y en su lugar invocando inmediatamente el método de fallback (`fallbackPedidos`, devolviendo un resultado por defecto razonable), evitando que las peticiones se acumulen esperando indefinidamente una respuesta de un servicio que sabe, con alta probabilidad, que actualmente no va a responder exitosamente.

Sin un circuit breaker, un servicio caído puede arrastrar en cascada a todos los servicios que dependen de él: cada petición hacia el servicio caído esperaría su timeout completo antes de fallar, acumulando peticiones en espera activa que consumen recursos (threads, conexiones) del servicio que realiza la llamada, potencialmente agotando esos recursos y haciendo que ese servicio dependiente también empiece a fallar por agotamiento de recursos, propagando el fallo original en cascada hacia arriba en la cadena de dependencias del sistema completo. `@Retry`, `@RateLimiter`, `@Bulkhead` y `@TimeLimiter` son primitivas de resiliencia complementarias de Resilience4j: reintentar automáticamente ante fallos transitorios, limitar la tasa de peticiones salientes, aislar recursos (como pools de threads) por dependencia específica para que el agotamiento de uno no afecte a los demás, y establecer límites de tiempo explícitos para cualquier llamada individual, respectivamente.

**Analogía:** un circuit breaker es como un disyuntor eléctrico que corta automáticamente el circuito ante una sobrecarga detectada, evitando que el problema se propague y dañe el resto del sistema eléctrico, y que permite reintentar conectar la corriente después de un tiempo prudencial, en vez de dejar que la sobrecarga continúe indefinidamente causando daño acumulativo.

**¿Por qué es importante?** Un circuit breaker evita que las llamadas hacia un servicio caído se acumulen esperando indefinidamente, previniendo que un fallo se propague en cascada hacia los servicios dependientes por agotamiento de recursos compartidos.

**Diagrama:**

```java
@CircuitBreaker(name = "servicioPedidos", fallbackMethod = "fallbackPedidos")
public Pedido obtenerPedido(Long id) { return pedidosClient.obtener(id); }
public Pedido fallbackPedidos(Long id, Exception e) { return Pedido.vacio(); }
```

---

## Laboratorio práctico

**Objetivo del laboratorio:** construir dos microservicios Spring Boot comunicándose vía gateway con circuit breaker.

**Requisitos previos:** Módulos 0-9 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Levantar dos microservicios que se comuniquen por HTTP | — | Verifica la comunicación básica |
| 2 | Registrar ambos en Eureka | Ver Tema 1 | Descubrimiento por nombre, no URL fija |
| 3 | Configurar Spring Cloud Gateway | Ver Tema 2 | Punto de entrada único |
| 4 | Agregar un circuit breaker con Resilience4j | Ver Tema 3 | Simula un fallo y observa el fallback |

**Verificación:** el laboratorio se considera exitoso si el gateway enruta correctamente hacia ambos microservicios según la ruta solicitada, y si el circuit breaker efectivamente invoca el fallback tras simular fallos repetidos del servicio dependiente.

**Errores comunes y soluciones**

- **Codificar URLs fijas entre microservicios.** Usa service discovery para resolver por nombre lógico.
- **No configurar un circuit breaker para llamadas entre servicios.** Sin él, un servicio caído puede arrastrar en cascada a sus dependientes.
- **Duplicar autenticación en cada microservicio individual.** Centraliza esa responsabilidad transversal en el gateway.

---

## Ejercicios de evaluación

### Ejercicio 1: Problema resuelto por un Config Server centralizado

**Enunciado:** ¿qué problema de configuración resuelve un Config Server centralizado en un sistema de muchos microservicios?

**Solución esperada:** evita tener que modificar y redesplegar cada microservicio individual ante un cambio de configuración compartida entre varios de ellos, centralizando esa configuración en un único lugar (típicamente respaldado por Git) desde donde se propaga a todos los servicios que la consumen.

**Criterios de éxito:**
- Explica correctamente la evitación de redespliegues individuales como el problema resuelto.

### Ejercicio 2: Qué hace un circuit breaker

**Enunciado:** ¿qué hace un circuit breaker y por qué es mejor que dejar que las llamadas fallidas se acumulen sin control?

**Solución esperada:** un circuit breaker detiene automáticamente los intentos de llamar a un servicio que está fallando repetidamente, invocando en su lugar un fallback inmediato, evitando que las peticiones se acumulen esperando timeouts completos y agotando recursos (threads, conexiones) que podrían propagar el fallo en cascada hacia los servicios dependientes.

**Criterios de éxito:**
- Explica correctamente la prevención del agotamiento de recursos y la propagación en cascada como beneficio del circuit breaker.

### Ejercicio 3: Service discovery por nombre

**Enunciado:** ¿qué ventaja da resolver un servicio por nombre lógico (service discovery) en vez de una URL fija hardcodeada?

**Solución esperada:** permite que las instancias físicas de un servicio cambien de ubicación, se escalen horizontalmente, o se reemplacen, sin que el código cliente necesite ninguna actualización, dado que la resolución de la ubicación física actual ocurre dinámicamente a través del servidor de registro (Eureka) en el momento de cada llamada.

**Criterios de éxito:**
- Explica correctamente la tolerancia a cambios de ubicación/escalado sin modificar el código cliente.

---

## Resumen del módulo

**Puntos clave**

- Un Config Server centralizado evita redespliegues individuales ante cambios de configuración compartida.
- El service discovery con Eureka resuelve servicios por nombre lógico, tolerando cambios de ubicación o escalado.
- Spring Cloud Gateway centraliza el enrutamiento y responsabilidades transversales como autenticación y rate limiting.
- Un circuit breaker con Resilience4j previene que un servicio caído arrastre en cascada a sus dependientes.

**Conceptos aprendidos**

- Config Server y service discovery con Eureka.
- Spring Cloud Gateway.
- Circuit breaker y primitivas de resiliencia de Resilience4j.

**Próximos pasos**

En el Módulo 11 aprenderás empaquetado y despliegue: fat JAR frente a capas de Docker, GraalVM native image, y health checks para Kubernetes.

**Recursos adicionales**

- Documentación oficial de Spring Cloud (spring.io/projects/spring-cloud) y Resilience4j (resilience4j.readme.io).
