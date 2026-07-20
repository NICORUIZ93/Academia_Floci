# Módulo 13: Consistencia, contratos y operación distribuida

Anotar un método con `@Transactional`, publicar en Kafka y exponer Actuator no demuestra que un microservicio preserve datos bajo fallos. Spring automatiza infraestructura mediante proxies y convenciones; para usarla con rigor debes conocer la frontera exacta de cada garantía. Este módulo convierte supuestos en pruebas de integración e incidentes controlados.


## Aprende construyendo

### Tema 1: `@Transactional` funciona en una frontera, no como encantamiento

**Conceptos clave:** proxy AOP, interceptor, transaction manager, boundary, propagation, REQUIRED, REQUIRES_NEW, isolation, dirty read, non-repeatable read, phantom, rollback rule, checked exception, self-invocation, optimistic lock y pessimistic lock.

En el modo habitual, Spring envuelve el bean en un proxy. Una llamada que entra por el proxy activa `TransactionInterceptor`, obtiene una transacción y ejecuta el método. Una llamada `this.metodoInterno()` no cruza el proxy; su anotación puede no aplicar. La solución no es “poner `@Transactional` en todo”: ubica el caso de uso público en un bean con límite coherente, o usa `TransactionTemplate` cuando la secuencia dinámica lo exige.

```java
@Service
public class TransferService {
    private final AccountRepository accounts;

    @Transactional
    public TransferReceipt transfer(AccountId from, AccountId to, Money amount) {
        Account source = accounts.findForUpdate(from).orElseThrow();
        Account target = accounts.findForUpdate(to).orElseThrow();
        source.withdraw(amount);
        target.deposit(amount);
        return new TransferReceipt(from, to, amount);
    }
}
```

`REQUIRED` participa en la transacción existente o crea una. `REQUIRES_NEW` suspende la exterior y usa recursos distintos; puede agotar el pool si cada request sostiene una conexión exterior y pide otra. Además, un commit interno permanece aunque la operación exterior falle, lo cual debe ser intención explícita, por ejemplo auditoría cuidadosamente diseñada.

Spring revierte por defecto ante excepciones unchecked, no necesariamente checked. Define reglas según semántica y prueba el tipo real. Capturar una excepción dentro del boundary y devolver éxito impide rollback salvo que marques estado; suele ser mejor propagar una excepción de negocio apropiada y mapearla fuera.

El aislamiento controla fenómenos entre transacciones, pero el soporte depende de base/driver. No copies un nivel máximo: más coordinación reduce concurrencia. Para actualizaciones, `@Version` detecta conflicto optimista y obliga a reintentar o informar; un lock pesimista puede ser correcto en sección corta y altamente conflictiva, pero aumenta deadlocks.

No mantengas transacción abierta durante HTTP remoto: sostiene locks/conexión mientras una dependencia incierta responde y no puede revertir el sistema externo. Persiste intención y coordina con outbox/saga.

**Analogía:** el proxy es el torniquete que registra entrada y salida de una zona protegida. Caminar entre habitaciones dentro de la zona no vuelve a pasar por el torniquete, aunque la puerta interna tenga un cartel `@Transactional`.

**¿Por qué es importante?** porque una anotación presente en código puede no existir en runtime por self-invocation, excepción capturada o método fuera del proxy; el fallo aparece como datos parcialmente comprometidos.

**Casos de uso reales:** transferencia, creación con auditoría, import batch, evento de dominio, rollback por checked exception, actualización concurrente y llamada remota dentro de transacción.

**Diagrama:**

```text
cliente -> proxy Spring -> begin -> método bean -> repositorios -> commit/rollback
                    |
                    `-> this.metodoInterno() no cruza proxy
DB transaction no atraviesa HTTP/Kafka externo
```

### Tema 2: Recuperación implica duplicación segura

**Conceptos clave:** timeout, idempotency key, atomicidad, unique constraint, optimistic locking, double write, transactional outbox, relay, at-least-once, Kafka transaction, offset, deduplication, poison message y reconciliation.

Un timeout después del commit deja resultado ambiguo. El cliente repite; el servidor debe reconocer la misma intención. Guarda clave de idempotencia asociada a principal, operación y hash de request en la misma transacción del efecto. Una restricción única decide carreras; un `find` previo no basta.

```java
@Transactional
public CreateOrderResult create(CreateOrder command, IdempotencyKey key, UserId user) {
    IdempotencyRecord record = keys.claim(user, "create-order", key, command.hash());
    if (record.completed()) return record.previousResult();

    Order order = orders.save(Order.create(command));
    outbox.save(OutboxEvent.orderCreated(order));
    keys.complete(record, order.id());
    return CreateOrderResult.created(order);
}
```

Guardar entidad y llamar `kafkaTemplate.send` no es una transacción atómica entre PostgreSQL y Kafka. Puede comprometer base y caer antes de publicar, o publicar y luego revertir. Transactional outbox guarda evento junto al agregado; un relay lo publica después. Puede publicar dos veces si cae tras enviar antes de marcar, de modo que el consumidor registra `eventId` junto a su efecto.

Las transacciones de Spring Kafka pueden ofrecer exactly-once para una secuencia Kafka read-process-write cuando offsets y publicaciones participan en la transacción del broker. Eso no vuelve atómica una escritura arbitraria en PostgreSQL ni una llamada HTTP. Declara la frontera exacta. Si mezclas transaction managers mediante sincronización, analiza orden de commit y modo de recuperación; no existe rollback mágico de un recurso ya comprometido.

Retries se aplican a fallos transitorios, con backoff, jitter y límite. Un mensaje inválido repetido bloquea partición; tras intentos y clasificación va a DLT con headers, alerta y runbook. Corregir y replay necesita idempotencia. La reconciliación compara fuente de verdad con proyección para reparar eventos ausentes incluso si el pipeline de retry falló.

Optimistic locking y idempotencia resuelven preguntas distintas: `@Version` detecta edición sobre versión obsoleta; la clave reconoce repetición de la misma operación. Pueden coexistir.

**Analogía:** outbox es el libro de correspondencia escrito en la misma operación que el pedido. El mensajero puede copiar una entrega, pero el destinatario reconoce el número de expediente.

**¿Por qué es importante?** porque reintentar mejora disponibilidad y, sin identidad, multiplica efectos. Los fallos más dañinos ocurren entre dos sistemas que cada uno comprometió correctamente.

**Casos de uso reales:** pedidos, pagos, webhooks, email, proyección CQRS, consumidor reiniciado, Kafka rebalance, DLT y actualización optimista de perfil.

**Diagrama:**

```text
request key K -> TX PostgreSQL [dedupe K + pedido + outbox E]
                                           |
                                        relay -> Kafka E (>=1)
                                                     |
                                           consumer TX [dedupe E + efecto]
reconciliador: pedidos vs proyección -> reparar
```

### Tema 3: Contratos ejecutables protegen despliegues independientes

**Conceptos clave:** OpenAPI, schema, Problem Details, consumer, provider, contract test, stub, backward compatibility, additive change, enum, deprecation, versioning y semantic change.

OpenAPI documenta request, response, seguridad y errores. Define DTOs públicos, no entidades JPA. Usa `application/problem+json` para errores consistentes con type, title, status, detail e instance/correlation ID sin stack. Verifica el documento contra MockMvc o tráfico de integración; generar una página Swagger no garantiza coincidencia.

Spring Cloud Contract convierte expectativas en tests del proveedor y stubs para consumidores. Un contrato debe representar comportamiento que el consumidor realmente necesita, no duplicar cada campo y volver imposible evolucionar.

```groovy
Contract.make {
  request {
    method POST()
    url '/api/orders'
    headers { contentType(applicationJson()) }
    body([productId: $(consumer(regex('[A-Z0-9-]+')), producer('SKU-1')), quantity: 1])
  }
  response {
    status CREATED()
    headers { contentType(applicationJson()) }
    body([id: anyUuid(), status: 'ACCEPTED'])
  }
}
```

Los stubs permiten al consumidor probar sin proveedor vivo, pero no sustituyen un test de compatibilidad desplegada ni semántica compartida. Publica versión del stub y verifica en pipeline del proveedor antes de release.

Cambios aditivos suelen ser más seguros: campo opcional, endpoint nuevo. Aun así, un consumidor con parser estricto puede romper. Agregar enum es un cambio frecuentemente incompatible para switches exhaustivos. Cambiar unidad, zona horaria, orden o significado rompe sin alterar JSON Schema.

Versiona solo cuando no puedes evolucionar de manera compatible. Mide uso, anuncia deprecación, ofrece período dual y fecha de sunset. No mantengas dos comportamientos indefinidos bajo la misma ruta. Una migración frontend/móvil necesita considerar clientes antiguos instalados.

**Analogía:** el contrato no es una foto del proveedor, sino el calibre que ambos equipos pasan antes de ensamblar. Si mide detalles innecesarios, impide cualquier mejora; si no mide nada, deja piezas incompatibles.

**¿Por qué es importante?** porque tests internos verdes no ejecutan código de consumidores desplegados por otros equipos o en dispositivos que no se actualizan juntos.

**Casos de uso reales:** app móvil, gateway, SDK, evento Kafka versionado, Problem Details, enum extendido, deprecación y despliegue independiente.

**Diagrama:**

```text
consumidor -> contrato mínimo -> repositorio de contratos -> tests proveedor
                                     `-> stub versionado -> tests consumidor
OpenAPI -> validación de superficie; contratos -> expectativas reales
telemetría -> deprecación -> período dual -> sunset
```

### Tema 4: Observabilidad sirve a un objetivo y a una decisión

**Conceptos clave:** Observation, trace, span, metric, log, baggage, cardinality, correlation, OpenTelemetry, SLI, SLO, error budget, timeout, retry, circuit breaker, bulkhead, readiness, incident y postmortem.

Spring Boot usa Micrometer Observation para métricas y trazas. Instrumentación automática cubre HTTP y repositorios; agrega observación de negocio donde responde una pregunta, evitando duplicar la automática con anotaciones. Tags de baja cardinalidad incluyen resultado o tipo de operación; `userId`, orderId y URL cruda pertenecen a logs/traces protegidos, no labels métricos.

```java
return Observation.createNotStarted("order.create", registry)
    .lowCardinalityKeyValue("channel", command.channel().name())
    .observe(() -> orderService.create(command));
```

Propaga trace context por HTTP y mensajería. Correlation ID de negocio puede acompañar, pero no reemplaza trace/span IDs. No metas secretos o PII en baggage: se propaga a múltiples servicios.

Define SLI desde usuario: proporción de pedidos válidos aceptados en menos de 500 ms. El SLO usa ventana; error budget guía riesgo. CPU y pool son causas posibles, no disponibilidad del usuario. Alertas por burn rate con ventanas corta/larga reducen ruido y enlazan runbook.

Resilience4j necesita presupuesto: timeout por llamada menor al deadline total; retries solo si operación es segura; circuit breaker para evitar insistencia; bulkhead para que una dependencia no consuma todo. Multiplicar retries entre gateway y servicio crea tormenta. Un fallback debe preservar semántica: devolver lista vacía cuando la dependencia falló miente.

Readiness indica si debe recibir tráfico; liveness si el proceso necesita reinicio. Hacer liveness depender de base provoca reinicios masivos durante caída externa. En incidente conserva timeline, versión, trazas y cambios; mitiga, comunica y luego crea postmortem sin culpas con acciones verificables.

**Analogía:** observabilidad es un sistema de instrumentos con objetivos, no llenar la cabina de luces. Una alarma útil indica impacto y conduce a un procedimiento.

**¿Por qué es importante?** porque logs aislados no reconstruyen una operación entre HTTP, DB y Kafka, y retries sin presupuesto convierten una lentitud en saturación total.

**Casos de uso reales:** pool agotado, consumer lag, trace pedido-evento, tag explosivo, dependencia 503, retry storm, burn-rate alert y rollback.

**Diagrama:**

```text
request -> span HTTP -> span DB -> outbox -> span Kafka -> consumer
                  logs correlacionados + métricas baja cardinalidad
experiencia -> SLI -> SLO/error budget -> alerta burn rate -> runbook
deadline -> timeout -> retry limitado -> breaker/bulkhead
```

## Revisión oficial de plataforma — julio de 2026

### Spring Boot 4.1 y actualización con compatibilidad comprobada

**Spring Boot 4.1** añade soporte de **Spring gRPC**, mejoras de OpenTelemetry, configuración renovada de Jackson y mitigación SSRF en clientes HTTP mediante `InetAddressFilter`. Adoptar una versión mayor exige revisar release notes, Java mínimo, cambios de namespaces, starters, observabilidad y dependencias administradas. La protección SSRF complementa validación y egress; no convierte URLs suministradas por usuarios en confiables.

**Aplicación al proyecto:** migra una rama, añade una prueba que bloquee loopback/metadatos cloud mediante InetAddressFilter, instrumenta una llamada gRPC y compara trazas HTTP/gRPC antes de promover el cambio.


## Laboratorio práctico

### Proyecto: microservicio comprobado bajo fallos

Evoluciona el proyecto 12 mediante una vertical de “crear pedido y proyectar resumen”.

1. Dibuja límites transaccionales y recursos. Escribe invariantes antes de anotar métodos.
2. Crea tests para unchecked, checked, excepción capturada, self-invocation, `REQUIRES_NEW` y conflicto `@Version`.
3. Observa conexiones/locks y prueba deadlock o conflicto de orden controlado; define retry solo para la víctima segura.
4. Implementa `Idempotency-Key` bajo restricción única y transacción. Ejecuta 20 requests paralelos iguales.
5. Guarda pedido y outbox juntos. Mata relay después de publicar/antes de marcar y prueba duplicación segura.
6. Implementa consumer con dedupe transaccional, DLT, replay y reconciliación.
7. Describe OpenAPI/Problem Details y añade contratos de consumidor. Rompe status, campo y enum para demostrar gates.
8. Instrumenta traza HTTP→DB→Kafka→consumer, logs correlacionados y métricas sin alta cardinalidad.
9. Define SLI/SLO. Inyecta latencia, timeout, 503 y lag; ajusta deadlines, breaker, bulkhead y readiness.
10. Ejecuta game day, recupera con runbook y entrega postmortem con timeline y acciones.

**Verificación:** consultas prueban un pedido por clave y un efecto por evento; contratos fallan ante incompatibilidad; una traza conecta todo el flujo; alerta refleja burn rate; reinicios no pierden outbox. CI usa PostgreSQL/Kafka reales efímeros y reproduce escenarios críticos.

**Errores comunes y soluciones**

- `@Transactional` en método private/self-called: mueve boundary a llamada que atraviesa proxy o usa template explícito.
- Capturar excepción y devolver null: propaga semántica y prueba rollback.
- Transacción alrededor de HTTP: persiste intención y coordina asíncronamente.
- `find` antes de idempotencia: usa unicidad y transacción contra carrera.
- Confiar en Kafka EOS para PostgreSQL: declara frontera y usa outbox/dedupe.
- Contrato que copia respuesta entera: conserva expectativas mínimas significativas.
- Tag con ID: usa baja cardinalidad en métricas y contexto protegido en trace/log.
- Liveness consulta todas las dependencias: separa vida de preparación para tráfico.




## Atlas completo de temas oficiales

Derivado de la [documentación oficial](https://docs.spring.io/spring-boot/reference/), sus referencias, migraciones y guías de operación. Inventariar no equivale a dominar: cada selección se demuestra con código, prueba, medición y explicación. **Cobertura: 54 temas.**

| Área | Temas que deben poder explicarse y aplicarse | Evidencia práctica |
|---|---|---|
| Núcleo | `auto-configuration` · `starters` · `configuration properties` · `profiles` · `DI` · `lifecycle` · `logging` · `failure analyzers` | entregas RutaFlow |
| Web | `MVC` · `WebFlux` · `validación` · `Problem Details` · `filtros` · `CORS` · `REST clients` · `GraphQL` · `WebSocket` · `gRPC` | entregas RutaFlow |
| Datos | `JDBC` · `JPA` · `R2DBC` · `transacciones` · `migrations` · `MongoDB` · `Redis` · `cache` · `locking` · `Testcontainers` | entregas RutaFlow |
| Seguridad | `Spring Security` · `OAuth2 y OIDC` · `resource server` · `method security` · `CSRF` · `headers` · `secretos` · `SAML` | entregas RutaFlow |
| Integración | `Kafka` · `AMQP` · `JMS` · `scheduling` · `batch` · `mail` · `outbox` · `idempotencia` · `circuit breakers` · `contratos` | entregas RutaFlow |
| Operación | `Actuator` · `Micrometer` · `OpenTelemetry` · `health groups` · `graceful shutdown` · `native images` · `Buildpacks` · `Kubernetes` | entregas RutaFlow |

### Método de estudio y proyecto de ampliación

Para cada tema responde qué problema resuelve, cuál es su modelo mental, cómo falla, cómo se verifica y cuándo no conviene. Elige uno por área e intégralos en una vertical RutaFlow. Entrega diagrama, ADR, pruebas de éxito y fallo, una medición, una amenaza y el enlace oficial con versión y fecha. Una API preview se aísla en laboratorio y nunca se presenta como base estable.
<!-- OFFICIAL-TOPIC-ATLAS:END -->
