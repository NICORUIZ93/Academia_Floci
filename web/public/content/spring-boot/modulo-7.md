# Módulo 7: Observabilidad con Actuator

## Sílabo

**Objetivo general**

Exponer métricas y health checks listos para cualquier sistema de monitoreo usando Spring Boot Actuator, incluyendo métricas de negocio personalizadas con Micrometer.

**Objetivos específicos**

1. Exponer los endpoints clave de Actuator (`/health`, `/metrics`).
2. Crear un health indicator personalizado.
3. Definir una métrica de negocio custom con Micrometer.
4. Diferenciar liveness y readiness en el contexto de Kubernetes.
5. Configurar logging estructurado.

**Contenido**

- Spring Boot Actuator: endpoints clave.
- Micrometer y métricas custom.
- Health checks personalizados.
- Logging estructurado.

**Evaluación**

API con Actuator expuesto y al menos una métrica de negocio custom, más tres ejercicios de evaluación.

---

## Aprende construyendo

### Tema 1: Actuator y health checks personalizados

**Conceptos clave:** endpoints estándar de observabilidad, `HealthIndicator` propio.

`spring-boot-starter-actuator`, agregado como dependencia, expone automáticamente endpoints de observabilidad estándar como `/actuator/health` (estado general de la aplicación, `{"status": "UP"}` o `"DOWN"`) y `/actuator/metrics` (lista de métricas disponibles para inspección), configurables explícitamente en cuanto a qué endpoints específicos exponer (`management.endpoints.web.exposure.include: health, metrics, info`), dado que no todos los endpoints de Actuator deberían estar públicamente expuestos por defecto (algunos revelan información sensible sobre la configuración interna de la aplicación).

`@Component public class ServicioExternoHealthIndicator implements HealthIndicator { public Health health() { return servicioExterno.estaDisponible() ? Health.up().build() : Health.down().build(); } }` extiende el health check estándar más allá de simplemente verificar que la aplicación en sí está funcionando, incorporando también la disponibilidad real de dependencias externas críticas (un servicio externo del que la aplicación depende), permitiendo que un sistema de monitoreo o de orquestación (como Kubernetes) detecte no solo si la aplicación está viva, sino si efectivamente está en condiciones reales de operar correctamente considerando también sus dependencias externas.

**Analogía:** Actuator es como un panel de instrumentos estándar en el tablero de un vehículo, mostrando indicadores comunes esperables (nivel de combustible, temperatura); un health indicator personalizado es como agregar un sensor adicional específico que verifica una condición particular del vehículo relevante para ese modelo específico, más allá de los indicadores estándar genéricos.

**¿Por qué es importante?** Actuator expone endpoints estándar de observabilidad listos para consumir por cualquier sistema de monitoreo; un health indicator personalizado extiende esa verificación para incluir dependencias externas críticas específicas de la aplicación.

**Configuración del ejemplo:**

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health, metrics, info
```
```java
@Component
public class ServicioExternoHealthIndicator implements HealthIndicator {
    public Health health() {
        return servicioExterno.estaDisponible() ? Health.up().build() : Health.down().build();
    }
}
```

### Tema 2: Métricas de negocio con Micrometer

**Conceptos clave:** métricas custom, valor para el equipo de producto, no solo infraestructura.

Micrometer, la fachada de métricas integrada en Spring Boot Actuator, permite definir métricas custom específicas del dominio de negocio, no solo las métricas técnicas genéricas que Actuator expone automáticamente por defecto (uso de CPU, memoria, latencia de peticiones HTTP): `PedidoService(MeterRegistry registry) { this.pedidosCreados = registry.counter("pedidos.creados"); } void crear(Pedido p) { pedidosCreados.increment(); }` registra un contador que se incrementa cada vez que se crea un pedido, exponiendo esa métrica de negocio a través de `/actuator/metrics`, consumible directamente por sistemas de visualización como Prometheus/Grafana (Módulo 8 del track de DevOps).

Exponer este tipo de métrica de negocio (cuántos pedidos se crearon, no solo cuántos recursos técnicos consume el servidor) le da valor directo al equipo de producto y de negocio, no solo al equipo de infraestructura: permite observar en tiempo real tendencias de negocio reales (un pico o caída inusual en la tasa de creación de pedidos, por ejemplo), información que las métricas puramente técnicas de infraestructura no capturan por sí solas, ampliando el valor de la plataforma de observabilidad más allá de su propósito técnico original.

**Analogía:** las métricas técnicas son como los indicadores de funcionamiento interno de una fábrica (temperatura de las máquinas, consumo eléctrico); las métricas de negocio custom son como el conteo de productos efectivamente terminados y despachados, información que interesa directamente a quienes gestionan el negocio, no solo a quienes mantienen la maquinaria funcionando.

**¿Por qué es importante?** Las métricas de negocio custom expuestas con Micrometer le dan valor directo al equipo de producto, permitiendo observar tendencias reales de negocio, no solo el estado técnico de la infraestructura subyacente.

**Código del ejemplo:**

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

### Tema 3: Liveness vs readiness

**Conceptos clave:** ¿debe reiniciarse el pod? vs ¿debe recibir tráfico ahora?

`management.endpoint.health.probes.enabled: true` habilita que Actuator genere dos endpoints de salud separados y con un propósito distinto cada uno: `/actuator/health/liveness` responde a la pregunta "¿está la aplicación en un estado tan roto que Kubernetes debería reiniciar completamente este pod?" (un fallo de liveness dispara un reinicio del contenedor), mientras `/actuator/health/readiness` responde a una pregunta distinta: "¿está la aplicación actualmente en condiciones de recibir tráfico?" (un fallo de readiness simplemente saca temporalmente al pod de la rotación de balanceo de carga, sin reiniciarlo, esperando a que vuelva a estar listo por sí solo).

Esta distinción importa concretamente: una aplicación podría estar perfectamente viva (sin necesidad de reiniciarse) pero temporalmente no lista para recibir tráfico (por ejemplo, durante un arranque en curso mientras todavía inicializa conexiones a dependencias externas, o durante una recuperación temporal de una dependencia externa caída), un caso donde reiniciar el pod (como haría un fallo de liveness) sería contraproducente e innecesario, mientras que simplemente sacarlo temporalmente de la rotación de tráfico (como hace un fallo de readiness) es exactamente el comportamiento deseado hasta que la aplicación esté efectivamente lista de nuevo.

**Analogía:** liveness es como verificar si una persona sigue consciente y necesita atención médica de emergencia (reiniciar); readiness es como verificar si esa misma persona, aunque consciente y sana, está actualmente disponible para atender clientes en este momento específico (temporalmente ausente, por ejemplo, sin necesitar ninguna intervención de emergencia).

**¿Por qué es importante?** Distinguir liveness de readiness evita reinicios innecesarios de un pod que simplemente está temporalmente no listo para tráfico, reservando el reinicio (liveness) específicamente para casos donde la aplicación está genuinamente en un estado roto.

**Configuración del ejemplo:**

```yaml
management.endpoint.health.probes.enabled: true
```
```
liveness:  ¿debe Kubernetes REINICIAR el pod?
readiness: ¿debe el pod RECIBIR TRÁFICO ahora mismo?
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

**Objetivo del laboratorio:** exponer Actuator con al menos una métrica de negocio custom y health checks apropiados.

**Requisitos previos:** Módulos 0-6 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Agregar el starter de Actuator | Ver Tema 1 | Expón `/health` y `/metrics` |
| 2 | Crear un health indicator personalizado | Ver Tema 1 | Verifica un servicio externo |
| 3 | Definir una métrica de negocio custom | Ver Tema 2 | Verifica que aparece en `/actuator/metrics` |
| 4 | Configurar liveness/readiness separados | Ver Tema 3 | Para un futuro despliegue en Kubernetes |
| 5 | Configurar logging estructurado en JSON | — | Consumible por un sistema de logs centralizado |

**Verificación:** el laboratorio se considera exitoso si `/actuator/metrics` muestra la métrica de negocio custom incrementándose correctamente, y si liveness y readiness responden de forma independiente según el estado real de la aplicación.

**Errores comunes y soluciones**

- **Exponer todos los endpoints de Actuator públicamente sin restricción.** Configura explícitamente `exposure.include` con solo los endpoints necesarios.
- **Solo exponer métricas técnicas genéricas.** Agrega métricas de negocio custom con Micrometer para dar valor al equipo de producto.
- **Usar un único endpoint de salud genérico en Kubernetes.** Separa liveness de readiness para evitar reinicios innecesarios.

---



## Bibliografía y fundamento académico

Estas fuentes sustentan los conceptos y deben consultarse para verificar detalles que cambian entre versiones:

- VMware/Broadcom, documentación de *Spring Framework* y *Spring Boot*.
- IETF, especificaciones HTTP y OAuth 2.0.
- OWASP Foundation, *Application Security Verification Standard*.
- ACM/IEEE-CS/AAAI, *Computer Science Curricula 2023*.
- IEEE Computer Society, *SWEBOK Guide V4.0*.

## Resumen del módulo

**Puntos clave**

- Actuator expone endpoints estándar de observabilidad (`/health`, `/metrics`) listos para cualquier sistema de monitoreo.
- Un `HealthIndicator` personalizado extiende la verificación de salud hacia dependencias externas críticas.
- Micrometer permite definir métricas de negocio custom, dando valor directo al equipo de producto.
- Liveness y readiness responden preguntas distintas: reiniciar el pod frente a recibir tráfico ahora mismo.

**Conceptos aprendidos**

- Spring Boot Actuator y sus endpoints clave.
- Health checks personalizados.
- Métricas custom con Micrometer.
- Liveness vs readiness.

**Próximos pasos**

En el Módulo 8 aprenderás mensajería con Kafka/RabbitMQ: producers, consumers, y manejo de errores con dead-letter queues.

**Recursos adicionales**

- Documentación oficial de Spring Boot Actuator (docs.spring.io/spring-boot) y Micrometer (micrometer.io/docs).
