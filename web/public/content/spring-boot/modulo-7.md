## Actuator

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health, metrics, info
```

```
GET /actuator/health    → { "status": "UP" }
GET /actuator/metrics   → lista de métricas disponibles
```

## Health indicator personalizado

```java
@Component
public class ServicioExternoHealthIndicator implements HealthIndicator {
    public Health health() {
        return servicioExterno.estaDisponible() ? Health.up().build() : Health.down().build();
    }
}
```

## Métricas custom con Micrometer

```java
@Service
public class PedidoService {
    private final Counter pedidosCreados;

    PedidoService(MeterRegistry registry) {
        this.pedidosCreados = registry.counter("pedidos.creados");
    }

    void crear(Pedido p) { pedidosCreados.increment(); /* ... */ }
}
```

Esta métrica de negocio (no solo CPU/memoria) le da a Prometheus/Grafana (track DevOps) datos que importan al producto, no solo a infraestructura.

## Liveness vs readiness

```yaml
management.endpoint.health.probes.enabled: true
```

Genera `/actuator/health/liveness` (¿debe Kubernetes reiniciar el pod?) y `/actuator/health/readiness` (¿debe recibir tráfico ahora mismo?) por separado.
