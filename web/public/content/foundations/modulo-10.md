# Sistemas distribuidos, resiliencia y observabilidad

Una aplicación local puede asumir que una llamada termina o falla de forma visible. Cuando dos procesos se comunican por red aparece una tercera posibilidad: el resultado es **desconocido**. La respuesta puede perderse después de que el servidor confirmó un pedido; un mensaje puede llegar dos veces; dos réplicas pueden observar órdenes diferentes. Este módulo enseña a razonar bajo esa incertidumbre sin prometer garantías que el sistema no puede cumplir.


## Aprende construyendo

### Tema 1: La red convierte el resultado en una incertidumbre

**Conceptos clave:** sistema distribuido, nodo, mensaje, latencia, ancho de banda, timeout, fallo parcial, pérdida, duplicación, reordenamiento, reloj físico, reloj lógico, causalidad y deadline.

Un sistema distribuido contiene componentes que cooperan mediante mensajes y no comparten una memoria ni un reloj perfecto. Un proceso puede continuar mientras otro está caído, lento o aislado. Esto produce **fallos parciales**: desde un nodo no siempre es posible distinguir si el receptor falló, la red está lenta o solo se perdió la respuesta.

Si el cliente envía “retirar 1 unidad” y vence su timeout, no sabe si el servidor nunca recibió, recibió pero falló o completó y perdió la respuesta. Repetir sin identidad puede retirar dos veces. Un timeout es un límite de espera local, no una prueba sobre el estado remoto.

La latencia tiene distribución y cola; no es una constante. Un deadline comunica cuánto tiempo total queda para una operación y debe propagarse a dependencias. Si cada capa usa un timeout independiente de cinco segundos, una solicitud puede consumir muchos múltiplos del presupuesto original.

Los relojes físicos derivan y se sincronizan con error. No uses una marca temporal como prueba absoluta de orden entre máquinas. Cuando importa la relación “A ocurrió antes que B”, registra causalidad mediante versión, secuencia o reloj lógico. Dos eventos sin relación causal pueden ser concurrentes aunque sus timestamps parezcan ordenados.

```python
from dataclasses import dataclass

@dataclass(frozen=True)
class Command:
    operation_id: str
    product_id: int
    quantity: int

def withdraw(client, command: Command, deadline_seconds: float):
    # operation_id conserva identidad a través de reintentos.
    return client.post("/withdrawals", json=command.__dict__, timeout=deadline_seconds)
```

**Analogía:** envías una carta certificada y no recibes el acuse. El silencio no permite saber si la carta no llegó o si llegó y el acuse se perdió. Reenviar una orden sin número único puede ejecutar dos compras.

**¿Por qué es importante?** porque muchos defectos distribuidos nacen al tratar una llamada remota como una función local. La red añade latencia, pérdida, independencia de fallos y estados desconocidos.

**Casos de uso reales:** pagos con respuesta perdida, API lenta, servicio DNS intermitente, petición móvil que cambia de red, procesamiento fuera de orden y jobs ejecutados tras un reinicio.

**Diagrama:**

```text
cliente -- comando op-42 --> servidor -- commit --> base
cliente <-- respuesta X ----- servidor
   |
 timeout: estado desconocido; reintentar op-42, no crear op-43
```

### Tema 2: Replicación, consistencia y decisiones explícitas

**Conceptos clave:** réplica, líder, seguidor, quorum, partición, disponibilidad, consistencia linealizable, consistencia eventual, lectura obsoleta, conflicto, consenso, CAP, PACELC y fencing token.

Replicar datos mejora tolerancia a fallos y capacidad de lectura, pero exige decidir qué valor observar cuando las copias difieren. En replicación con líder, las escrituras pasan por una autoridad y seguidores aplican cambios después. Leer un seguidor puede devolver estado anterior. En multi-líder o peer-to-peer aparecen conflictos que requieren reglas de resolución compatibles con el dominio.

**Consistencia** no significa una sola cosa. La linealizabilidad hace que operaciones parezcan ocurrir en un orden único compatible con tiempo real; es útil para reservar el último artículo, pero cuesta coordinación. La consistencia eventual promete convergencia si cesan actualizaciones; puede ser suficiente para un contador analítico, no necesariamente para autorizar un retiro.

CAP no dice “elige dos para siempre”. Durante una partición de red, una operación concreta debe rechazar o esperar para conservar consistencia, o aceptar y arriesgar divergencia para conservar disponibilidad. Sin partición, PACELC recuerda que aún existe un compromiso entre latencia y consistencia. La elección se hace por invariante y operación, no por etiqueta del producto.

El consenso permite acordar una secuencia o líder pese a ciertos fallos; protocolos como Raft requieren mayorías y no crean disponibilidad cuando no existe quorum. Un lock distribuido con lease puede expirar mientras el antiguo propietario sigue trabajando. Un **fencing token** creciente permite que el recurso rechace escrituras de propietarios obsoletos.

```text
Invariante fuerte: ninguna ubicación vende más unidades de las asignadas.
Opción A: coordinar cada venta con autoridad central.
Opción B: reservar cupos por ubicación y reconciliar transferencias.
```

La opción B conserva autonomía usando partición explícita del inventario; no elimina el invariante, lo reformula con derechos de venta limitados.

**Analogía:** dos taquillas desconectadas no pueden vender libremente el mismo último asiento y garantizar que nunca se duplique. Pueden esperar conexión o recibir previamente cupos diferentes.

**¿Por qué es importante?** porque seleccionar una base “AP” o “CP” no sustituye analizar qué inconsistencia soporta el negocio y cómo se repara.

**Casos de uso reales:** catálogos con lecturas obsoletas tolerables, stock y saldos fuertes, elección de líder, cachés, réplicas geográficas y bloqueos de jobs.

**Diagrama:**

```text
          partición
réplica A    X    réplica B
aceptar ambas -> disponibilidad + posible conflicto
esperar quorum -> protege orden + rechaza temporalmente
decisión guiada por el invariante de la operación
```

### Tema 3: Mensajes que se procesan con efectos exactamente una vez

**Conceptos clave:** productor, broker, consumidor, ack, entrega al menos una vez, como máximo una vez, exactamente una vez efectiva, idempotencia, deduplicación, retry, backoff, jitter, dead-letter queue, outbox y saga.

Los brokers desacoplan tiempo y capacidad: el productor publica y el consumidor procesa después. Pero el acknowledgement puede perderse y el broker reenviar. “Al menos una vez” implica posibles duplicados; “como máximo una vez” puede perder trabajo. Muchos sistemas que anuncian exactly-once limitan la garantía a una frontera. El efecto de negocio requiere diseño idempotente de extremo a extremo.

Una operación idempotente produce el mismo efecto observable al repetirse con la misma identidad. Guarda `operation_id` bajo restricción única en la misma transacción del cambio. Si llega otra vez, devuelve el resultado registrado sin repetir el retiro.

El problema de doble escritura ocurre al actualizar la base y publicar un evento como pasos separados. Si la aplicación cae entre ambos, uno queda sin el otro. El patrón **transactional outbox** escribe cambio y evento pendiente en una transacción local; un relay publica después y marca progreso. Puede publicar dos veces, por lo que el consumidor también deduplica.

```sql
BEGIN;
UPDATE products SET stock = stock - 1
 WHERE id = 7 AND stock >= 1;
INSERT INTO outbox(event_id, kind, payload, published)
 VALUES ('evt-42', 'StockWithdrawn', '{"product_id":7}', 0);
COMMIT;
```

Los reintentos se reservan para errores transitorios y usan backoff exponencial con jitter para evitar una estampida sincronizada. Deben respetar deadline y presupuesto máximo. Errores permanentes van a revisión o dead-letter con contexto y procedimiento; una DLQ sin propietario es un cementerio silencioso.

Una saga coordina una transacción de negocio entre servicios mediante pasos y compensaciones. Compensar no viaja atrás en el tiempo: crea una acción nueva y puede fallar. Diseña estados intermedios visibles, operaciones idempotentes y recuperación manual.

**Analogía:** el outbox es el libro de correspondencia de una oficina. La decisión y la nota “enviar aviso” se registran juntas; un mensajero puede intentar varias veces y el destinatario reconoce el número de expediente.

**¿Por qué es importante?** porque una entrega duplicada es normal bajo recuperación. Sin identidad e invariantes, los reintentos que mejoran disponibilidad corrompen datos.

**Casos de uso reales:** cobros, emails, webhooks, integración de inventario, workers, importaciones masivas y publicación de eventos de dominio.

**Diagrama:**

```text
comando op-42 -> [transacción: stock + outbox evt-42]
                                  |
                              relay -> broker -> consumidor
                                          reentrega evt-42
                              tabla dedupe -> efecto una vez
```

### Tema 4: Resiliencia y observabilidad orientadas a objetivos

**Conceptos clave:** resiliencia, bulkhead, circuit breaker, load shedding, degradación, observabilidad, log, métrica, traza, correlation ID, SLI, SLO, error budget, alerta, runbook, incidente y postmortem.

Resiliencia es mantener una función aceptable y recuperarse; no fingir que nada falla. Timeouts limitan espera; bulkheads aíslan recursos; circuit breakers evitan insistir sobre una dependencia que falla; load shedding rechaza temprano cuando aceptar empeoraría todo. Cada patrón tiene coste y estado propio. Un circuit breaker mal configurado puede ocultar recuperación o amplificar oscilaciones.

La observabilidad permite inferir estado interno desde señales. Los logs describen eventos con campos estructurados; métricas agregan series numéricas; trazas conectan el camino de una solicitud entre componentes. Incluye `trace_id`, `operation_id` y versión, pero evita contraseñas, tokens y datos personales. Alta cardinalidad como `user_id` puede volver inviable una métrica; pertenece normalmente a logs protegidos o atributos muestreados.

Un SLI mide comportamiento que importa: proporción de retiros válidos completados bajo 300 ms, por ejemplo. El SLO fija un objetivo y ventana: 99.9 % durante 28 días. El error budget es la fracción permitida de incumplimiento y facilita decidir entre velocidad de cambio y trabajo de confiabilidad. Una alerta debe representar consumo significativo del presupuesto y tener acción humana clara.

```python
def availability_sli(events):
    eligible = [e for e in events if e["valid_request"]]
    good = [e for e in eligible if e["status"] == "ok" and e["ms"] <= 300]
    return len(good) / len(eligible) if eligible else 1.0
```

Durante un incidente: declara coordinación, limita impacto, conserva línea temporal, comunica y recupera. Después, un postmortem sin culpables analiza condiciones y defensas, no busca una persona “causante”. Las acciones deben tener propietario, prioridad y criterio verificable.

**Analogía:** el tablero de un avión no evita turbulencia; ofrece señales relacionadas para reconocerla y procedimientos practicados para mantener vuelo seguro.

**¿Por qué es importante?** porque un sistema distribuido no puede operarse con `print` desconectados ni alertas sobre cada error. Se necesitan objetivos de usuario, correlación y decisiones ensayadas.

**Casos de uso reales:** latencia de checkout, saturación de pool, dependencia caída, cola acumulada, despliegue defectuoso, guardia operativa y game days.

**Diagrama:**

```text
experiencia usuario -> SLI -> SLO -> error budget -> decisión
petición -> traza distribuida
             |- logs con contexto
             `- métricas agregadas -> alerta -> runbook
```

## Proyecto transversal RutaFlow: Dominio, algoritmos y contabilidad

RutaFlow conecta este track con una plataforma completa de paquetería. La implementación de referencia está en `examples/rutaflow/foundation/domain.py` y `examples/rutaflow/database/schema.sql`; se estudia como punto de partida pequeño, no como sistema terminado.

### Capacidad y fundamento

Modela estados e invariantes antes de elegir tecnología. Compara una heurística de vecino más cercano con distancia total, explica por qué no garantiza el óptimo y construye casos que refuten decisiones incorrectas. En datos, usa restricciones para impedir estados imposibles y un libro mayor de débito/crédito: el saldo se deriva de movimientos inmutables, no se edita directamente.

### Implementación guiada

1. Copia el contrato y escribe primero casos normales, límite, inválidos y duplicados.
2. Ejecuta la referencia, provoca un fallo y explica el mensaje antes de modificarla.
3. Implementa una mejora pequeña manteniendo nombres de dominio, efectos visibles y errores tipados.
4. Integra con el contrato del track anterior sin compartir tablas, estado mutable ni detalles de framework.
5. Registra la decisión en el README y etiqueta el hito de RutaFlow correspondiente.

### Verificación profesional

Prueba cada transición válida e inválida, un conjunto donde la heurística no produzca el óptimo y una transacción contable balanceada/rechazada. Entrega tabla de casos, complejidad, diagrama de estados y consultas de integridad.

El capítulo se completa cuando la evidencia permite a otra persona reproducir el flujo y explicar qué garantías ofrece y cuáles todavía no.


## Laboratorio práctico

### Proyecto 10: inventario distribuido mínimo y observable

No dividas el sistema en muchos microservicios. Conserva el núcleo modular y añade únicamente un proceso API, un relay de outbox y un consumidor de reportes. La meta es observar garantías y fallos, no acumular infraestructura.

1. Define los invariantes de retiro y reporte, modelo de consistencia y garantía de entrega.
2. Agrega `operation_id` a comandos y una restricción única. Prueba repetición secuencial y concurrente.
3. Escribe el cambio de stock y evento outbox en una sola transacción SQLite.
4. Implementa un relay reiniciable que pueda publicar duplicados deliberadamente.
5. Implementa consumidor con tabla de eventos procesados y efecto idempotente.
6. Conecta los tres procesos con Docker Compose y una cola simple apropiada para aprendizaje.
7. Crea un proxy o adaptador de fallos configurable: latencia, pérdida de respuesta, duplicación y pausa del consumidor.
8. Instrumenta logs JSON, métricas y trazas con identificadores correlacionados.
9. Define un SLI, SLO y alerta. Genera carga normal y un fallo que consuma presupuesto.
10. Ejecuta un game day: reinicia relay después del commit, duplica mensajes, llena cola y recupera siguiendo el runbook.
11. Entrega línea temporal y postmortem con impacto, factores contribuyentes, detección, recuperación y acciones verificables.

**Verificación:** demuestra mediante consultas que cada `operation_id` afecta stock una vez, cada evento converge a un único efecto y ningún evento comprometido se pierde tras reinicios. Muestra una traza completa, métricas antes/durante/después y logs correlacionados. Ejecuta todo desde un clon limpio con un solo comando documentado.

**Errores comunes y soluciones**

- Reintentar todo: clasifica errores permanentes, transitorios y ambiguos; limita por deadline.
- Confundir ACK con efecto único: deduplica junto al efecto del consumidor.
- Marcar outbox antes de publicar: publica y luego marca; acepta duplicación segura.
- Usar timestamp como orden global: utiliza secuencia o relación causal.
- Crear una métrica por usuario: controla cardinalidad y privacidad.
- SLO basado en CPU: vincúlalo con resultado y latencia percibidos por usuario.
- Postmortem “el operador falló”: investiga por qué una acción humana podía causar impacto sin barreras.
