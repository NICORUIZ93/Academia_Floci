## Config Server centralizado

En vez de cada microservicio leyendo su propio `application.yml` local, un Config Server centraliza la configuración de todos (típicamente respaldado por un repositorio Git) — cambiar un valor compartido no requiere redeploy de cada servicio individualmente.

## Service discovery con Eureka

```java
@EnableEurekaServer // servidor de registro
@EnableDiscoveryClient // cada microservicio se registra aquí
```

```java
@FeignClient(name = "servicio-pedidos") // se resuelve por nombre, no por URL fija
interface PedidosClient { @GetMapping("/pedidos/{id}") Pedido obtener(@PathVariable Long id); }
```

## Spring Cloud Gateway

```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: pedidos
          uri: lb://servicio-pedidos
          predicates: [Path=/api/pedidos/**]
```

Un único punto de entrada que enruta a los microservicios correctos, donde también es natural centralizar autenticación, rate limiting y logging.

## Circuit breaker con Resilience4j

```java
@CircuitBreaker(name = "servicioPedidos", fallbackMethod = "fallbackPedidos")
public Pedido obtenerPedido(Long id) { return pedidosClient.obtener(id); }

public Pedido fallbackPedidos(Long id, Exception e) { return Pedido.vacio(); }
```

Si `servicio-pedidos` empieza a fallar repetidamente, el circuit breaker "abre el circuito" y deja de intentar llamarlo por un tiempo, devolviendo el fallback inmediatamente — evita que un servicio caído arrastre en cascada a los que dependen de él.
