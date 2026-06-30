## Producer con Spring Kafka

```java
@Service
public class EventoPublisher {
    private final KafkaTemplate<String, TareaCreadaEvent> kafka;

    void publicar(TareaCreadaEvent evento) {
        kafka.send("tareas.creadas", evento);
    }
}
```

## Consumer

```java
@KafkaListener(topics = "tareas.creadas", groupId = "notificaciones")
public void escuchar(TareaCreadaEvent evento) {
    enviarNotificacion(evento);
}
```

Publicar el evento desacopla `TareaService` de `NotificacionService` — ninguno conoce al otro directamente, ambos solo conocen el topic de Kafka.

## Dead-letter queue

```java
@Bean
DefaultErrorHandler errorHandler(KafkaTemplate<Object, Object> template) {
    var recoverer = new DeadLetterPublishingRecoverer(template);
    return new DefaultErrorHandler(recoverer, new FixedBackOff(1000L, 3)); // 3 reintentos, luego a DLQ
}
```

Sin una dead-letter queue, un mensaje que falla repetidamente puede bloquear el procesamiento de todos los mensajes siguientes (según la configuración del consumer) o perderse silenciosamente.

## RabbitMQ (Spring AMQP)

```java
@RabbitListener(queues = "tareas.creadas")
public void escuchar(TareaCreadaEvent evento) { ... }
```

A diferencia de Kafka (log distribuido, retiene mensajes por tiempo configurable, ideal para muchos consumidores leyendo el mismo stream), RabbitMQ es un broker de colas tradicional, más simple para patrones punto-a-punto.
