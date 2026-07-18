# Módulo 8: Mensajería — Kafka/RabbitMQ

## Sílabo

**Objetivo general**

Desacoplar servicios mediante mensajería asíncrona desde Spring, usando Spring Kafka y Spring AMQP (RabbitMQ), con manejo robusto de errores mediante dead-letter queues.

**Objetivos específicos**

1. Publicar eventos con `KafkaTemplate` desde una API.
2. Consumir eventos con `@KafkaListener`.
3. Serializar mensajes explícitamente como JSON.
4. Configurar una estrategia de reintentos y una dead-letter queue.
5. Comparar el modelo de entrega de Kafka con RabbitMQ.

**Contenido**

- Spring Kafka: producers y consumers.
- Spring AMQP (RabbitMQ).
- Serialización de mensajes.
- Manejo de errores y dead-letter.

**Evaluación**

Servicio que publica y consume eventos vía Kafka con manejo de errores, más tres ejercicios de evaluación.

---

## Contenido teórico

### Tema 1: Producers y consumers con Spring Kafka

**Conceptos clave:** desacoplamiento vía topic, `@KafkaListener`.

`@Service public class EventoPublisher { private final KafkaTemplate<String, TareaCreadaEvent> kafka; void publicar(TareaCreadaEvent evento) { kafka.send("tareas.creadas", evento); } }` publica un evento hacia un topic específico de Kafka sin que el código publicador conozca ni le importe quién, si acaso alguien, está consumiendo ese evento en este momento: `@KafkaListener(topics = "tareas.creadas", groupId = "notificaciones") public void escuchar(TareaCreadaEvent evento) { enviarNotificacion(evento); }` define un consumidor completamente independiente que escucha ese mismo topic y reacciona a cada evento recibido, sin ninguna dependencia directa (ni de compilación, ni de conocimiento en tiempo de ejecución) entre el publicador y el consumidor.

Este desacoplamiento resuelve un problema estructural concreto: sin mensajería, `TareaService` tendría que invocar directamente a `NotificacionService` para enviar una notificación tras crear una tarea, requiriendo que `TareaService` conozca la existencia y la interfaz específica de `NotificacionService`, y que ambos estén disponibles simultáneamente para que la operación completa funcione; con mensajería, `TareaService` simplemente publica el evento y continúa, completamente ajeno a cuántos consumidores distintos (o ninguno) están escuchando ese topic específico, permitiendo agregar o quitar consumidores adicionales sin modificar en absoluto el código publicador.

**Analogía:** la mensajería es como publicar un anuncio en un tablón público en vez de llamar personalmente a cada interesado específico: quien publica el anuncio no necesita saber quién lo leerá ni cuántas personas están interesadas, y se pueden agregar nuevos lectores interesados en el futuro sin que quien publica el anuncio original tenga que hacer nada distinto.

**¿Por qué es importante?** Publicar un evento en vez de llamar directamente a otro servicio desacopla completamente al publicador de sus consumidores, permitiendo agregar o modificar consumidores sin afectar al código publicador original.

**Código del ejemplo:**

```java
@Service
public class EventoPublisher {
    private final KafkaTemplate<String, TareaCreadaEvent> kafka;
    void publicar(TareaCreadaEvent evento) {
        kafka.send("tareas.creadas", evento);
    }
}
@KafkaListener(topics = "tareas.creadas", groupId = "notificaciones")
public void escuchar(TareaCreadaEvent evento) {
    enviarNotificacion(evento);
}
```

### Tema 2: Dead-letter queue

**Conceptos clave:** reintentos limitados, destino final para mensajes que fallan repetidamente.

`@Bean DefaultErrorHandler errorHandler(KafkaTemplate<Object, Object> template) { var recoverer = new DeadLetterPublishingRecoverer(template); return new DefaultErrorHandler(recoverer, new FixedBackOff(1000L, 3)); }` configura una estrategia donde, si el procesamiento de un mensaje falla, se reintenta un número limitado de veces (3 reintentos, con 1 segundo de espera entre cada uno en este ejemplo), y si todos los reintentos agotados también fallan, el mensaje se redirige automáticamente hacia una dead-letter queue (una cola separada específicamente destinada a mensajes que no pudieron procesarse exitosamente), en vez de perderse silenciosamente o bloquear indefinidamente el procesamiento de los mensajes siguientes en la cola original.

Sin una dead-letter queue configurada, un mensaje que falla repetidamente al procesarse puede tener dos consecuencias problemáticas según la configuración específica del consumer: bloquear el procesamiento de todos los mensajes siguientes en la misma partición (si el consumer está configurado para no avanzar hasta procesar exitosamente el mensaje actual), o simplemente perderse silenciosamente sin ningún registro (si el consumer descarta el mensaje fallido sin ninguna estrategia de manejo), ambos escenarios considerablemente peores que aislar explícitamente esos mensajes problemáticos en una cola separada donde puedan investigarse y reprocesarse manualmente más adelante sin bloquear el flujo normal de mensajes exitosos.

**Analogía:** una dead-letter queue es como una bandeja separada de correspondencia no entregable en una oficina de correos, donde las cartas que no pudieron entregarse tras varios intentos se archivan para investigación manual posterior, en vez de bloquear indefinidamente el resto de la correspondencia normal detrás de esa carta problemática, o simplemente descartarla sin dejar ningún rastro de que existió.

**¿Por qué es importante?** Una dead-letter queue aísla mensajes que fallan repetidamente sin bloquear el procesamiento de mensajes exitosos posteriores, y sin perder silenciosamente el registro de esos mensajes problemáticos.

**Código del ejemplo:**

```java
@Bean
DefaultErrorHandler errorHandler(KafkaTemplate<Object, Object> template) {
    var recoverer = new DeadLetterPublishingRecoverer(template);
    return new DefaultErrorHandler(recoverer, new FixedBackOff(1000L, 3)); // 3 reintentos, luego a DLQ
}
```

### Tema 3: Kafka frente a RabbitMQ

**Conceptos clave:** log distribuido retenido frente a broker de colas tradicional.

`@RabbitListener(queues = "tareas.creadas") public void escuchar(TareaCreadaEvent evento) { ... }` demuestra que el patrón de consumo desacoplado con Spring AMQP (para RabbitMQ) es sintácticamente muy similar al de Spring Kafka, pero los modelos subyacentes de entrega de mensajes de ambas tecnologías son conceptualmente distintos: Kafka es fundamentalmente un log distribuido que retiene mensajes durante un período configurable (independientemente de si ya fueron consumidos o no), permitiendo que múltiples consumidores distintos (o el mismo consumidor releyendo desde un punto anterior) lean el mismo stream completo de eventos históricos de forma independiente; RabbitMQ es un broker de colas tradicional, donde un mensaje típicamente se entrega y se elimina de la cola una vez consumido exitosamente (en el patrón punto-a-punto más común), un modelo más simple y directo para casos donde no se necesita retener ni releer el historial completo de mensajes.

Elegir entre ambas tecnologías depende del patrón de uso real necesario: Kafka es apropiado cuando múltiples consumidores independientes necesitan leer el mismo stream completo de eventos (posiblemente en distintos momentos, o incluso releyendo eventos ya procesados anteriormente), o cuando se necesita alto throughput con particionamiento para escalar horizontalmente el consumo; RabbitMQ es apropiado para patrones más simples de punto-a-punto o de distribución de trabajo entre consumidores competidores, donde retener el historial completo de mensajes no es un requisito real del caso de uso.

**Analogía:** Kafka es como un registro público permanente que cualquiera puede consultar en cualquier momento, incluso eventos ya "vistos" anteriormente por otros; RabbitMQ es como un sistema de reparto de correspondencia tradicional donde cada carta se entrega a su destinatario específico y luego se considera completada, sin quedar disponible para que alguien más la vuelva a leer después.

**¿Por qué es importante?** Elegir Kafka frente a RabbitMQ depende del patrón de consumo real necesario: retención y relectura del historial completo de eventos (Kafka) frente a distribución simple de trabajo punto-a-punto (RabbitMQ).

**Código del ejemplo:**

```java
@RabbitListener(queues = "tareas.creadas")
public void escuchar(TareaCreadaEvent evento) { ... }
```
```
Kafka: log distribuido, retiene mensajes, múltiples consumidores leen el mismo stream
RabbitMQ: broker de colas tradicional, más simple para patrones punto-a-punto
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

**Objetivo del laboratorio:** construir un servicio que publica y consume eventos vía Kafka con manejo robusto de errores.

**Requisitos previos:** Módulos 0-7 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Levantar Kafka en Docker Compose | — | Configura `KafkaTemplate` |
| 2 | Implementar un `@KafkaListener` | Ver Tema 1 | Consume y procesa el evento |
| 3 | Serializar mensajes explícitamente como JSON | — | Serializer configurado explícitamente |
| 4 | Configurar reintentos y dead-letter queue | Ver Tema 2 | Verifica el mensaje fallido en la DLQ |
| 5 | Repetir con RabbitMQ y comparar | Ver Tema 3 | Compara los modelos de entrega |

**Verificación:** el laboratorio se considera exitoso si un mensaje que falla repetidamente termina correctamente en la dead-letter queue configurada tras agotar los reintentos, sin bloquear el procesamiento de mensajes posteriores exitosos.

**Errores comunes y soluciones**

- **No configurar una dead-letter queue.** Sin ella, un mensaje que falla repetidamente puede bloquear o perderse silenciosamente.
- **Confundir el modelo de retención de Kafka con el de RabbitMQ.** Verifica cuál patrón de consumo real necesita tu caso de uso antes de elegir.
- **No serializar explícitamente el formato del mensaje.** Configura un serializer explícito para evitar ambigüedad de formato entre productor y consumidor.

---

## Ejercicios de evaluación

### Ejercicio 1: Problema de acoplamiento resuelto por mensajería

**Enunciado:** ¿qué problema de acoplamiento resuelve publicar un evento en vez de llamar directamente a otro servicio?

**Solución esperada:** publicar un evento desacopla completamente al servicio publicador de sus consumidores: el publicador no necesita conocer la existencia ni la interfaz de ningún consumidor específico, y se pueden agregar o quitar consumidores sin modificar el código publicador, a diferencia de una llamada directa que acopla ambos servicios explícitamente.

**Criterios de éxito:**
- Explica correctamente el desacoplamiento entre publicador y consumidores como el problema resuelto.

### Ejercicio 2: Consecuencia sin dead-letter queue

**Enunciado:** ¿qué pasa con un mensaje que falla repetidamente sin una dead-letter queue configurada?

**Solución esperada:** según la configuración específica del consumer, puede bloquear el procesamiento de todos los mensajes siguientes en la misma partición, o perderse silenciosamente sin ningún registro, ambos escenarios problemáticos comparados con aislarlo explícitamente en una cola separada para investigación posterior.

**Criterios de éxito:**
- Menciona correctamente al menos una de las dos consecuencias (bloqueo o pérdida silenciosa) como riesgo sin dead-letter queue.

### Ejercicio 3: Kafka vs RabbitMQ

**Enunciado:** ¿en qué escenario elegirías Kafka sobre RabbitMQ, y viceversa?

**Solución esperada:** Kafka cuando múltiples consumidores independientes necesitan leer el mismo stream completo de eventos, posiblemente releyendo eventos históricos ya procesados, o cuando se necesita alto throughput particionado; RabbitMQ para patrones más simples de distribución de trabajo punto-a-punto donde retener el historial completo no es un requisito real.

**Criterios de éxito:**
- Distingue correctamente el caso de retención/múltiples lectores (Kafka) del caso simple punto-a-punto (RabbitMQ).

---

## Rúbrica del proyecto

Esta rúbrica evalúa el laboratorio y los ejercicios como evidencia de dominio, no la mera finalización de pasos.

| Criterio | Peso | Evidencia esperada |
|---|---:|---|
| Comprensión conceptual | 20% | Explica el mecanismo, sus límites y por qué la solución funciona. |
| Implementación funcional | 30% | El artefacto satisface requisitos normales, límite y de error. |
| Verificación | 20% | Incluye pruebas, mediciones o inspecciones reproducibles. |
| Diseño y calidad | 15% | Nombres, estructura, seguridad y mantenibilidad son deliberados. |
| Comunicación profesional | 15% | README, decisiones, comandos y resultados permiten repetir el trabajo. |

Se alcanza competencia con 70/100 y sin cero en implementación o verificación. El nivel experto exige comparar alternativas, justificar trade-offs y reconocer condiciones donde la solución dejaría de ser válida.

## Bibliografía y fundamento académico

Estas fuentes sustentan los conceptos y deben consultarse para verificar detalles que cambian entre versiones:

- VMware/Broadcom, documentación de *Spring Framework* y *Spring Boot*.
- IETF, especificaciones HTTP y OAuth 2.0.
- OWASP Foundation, *Application Security Verification Standard*.
- ACM/IEEE-CS/AAAI, *Computer Science Curricula 2023*.
- IEEE Computer Society, *SWEBOK Guide V4.0*.

## Resumen del módulo

**Puntos clave**

- Publicar eventos vía Kafka/RabbitMQ desacopla completamente al publicador de sus consumidores.
- Una dead-letter queue aísla mensajes que fallan repetidamente, evitando bloqueo o pérdida silenciosa.
- Kafka retiene mensajes como un log distribuido para múltiples lectores; RabbitMQ es un broker de colas tradicional más simple para punto-a-punto.

**Conceptos aprendidos**

- Spring Kafka: producers y consumers.
- Spring AMQP (RabbitMQ).
- Dead-letter queues y manejo de errores.

**Próximos pasos**

En el Módulo 9 aprenderás programación reactiva con WebFlux: Mono/Flux, WebClient, y cuándo el modelo no bloqueante realmente vale la complejidad.

**Recursos adicionales**

- Documentación oficial de Spring Kafka (docs.spring.io/spring-kafka) y Spring AMQP (docs.spring.io/spring-amqp).
