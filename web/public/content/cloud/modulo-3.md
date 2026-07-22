# Módulo 3: Mensajería asíncrona con SQS


## Aprende construyendo

### Tema 1: Colas, productores y consumidores

#### Paso 1 · Objetivo y preparación
Al finalizar podrás desacoplar productores y consumidores desde cero. Prerrequisitos: Docker y AWS CLI; verifica `node --version`.
#### Paso 2 · Contexto y caso real
Una entrega puede procesarse después sin bloquear la solicitud del cliente.
#### Paso 3 · Teoría, modelo mental y analogía
La cola es una bandeja numerada: productor deja trabajo y consumidor lo retira.
#### Paso 4 · Demostración guiada
Crea `src/queue.js` desde una carpeta vacía.
```bash
mkdir ejemplo-cola
node --version
```
Resultado esperado: Node disponible.
#### Paso 5 · Práctica guiada
Pista: publica en una cola inexistente para provocar un fallo deliberado y corrígelo.
#### Paso 6 · Práctica independiente
Publica y consume un mensaje, conservando la salida.
#### Paso 7 · Cierre y evidencia
Entrega comandos, salida, fallo y corrección; explica el resultado. Siguiente paso: visibilidad. Errores comunes: borrar antes de procesar y asumir exactamente una entrega. Fuente oficial: https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/welcome.html.
**Conceptos clave:** cola de mensajes, productor, consumidor, acoplamiento, comunicación asíncrona.

Una cola de mensajes es una estructura intermedia que permite que dos partes de un sistema se comuniquen sin estar activas al mismo tiempo ni conocerse directamente entre sí. Un productor es cualquier componente que envía mensajes a la cola: podría ser una API que recibe una petición de usuario y necesita procesarla en segundo plano. Un consumidor es cualquier componente que lee y procesa esos mensajes: podría ser una función Lambda, un proceso en un contenedor, o cualquier programa que consulte la cola periódicamente.

La clave de este patrón es que el productor no necesita saber nada sobre el consumidor —ni su dirección, ni si está disponible en ese momento, ni cuántas instancias de consumidor existen— y viceversa. El productor simplemente coloca un mensaje en la cola y continúa con su trabajo; SQS se encarga de almacenar ese mensaje de forma duradera hasta que algún consumidor lo recoja. Esto es exactamente lo opuesto a una llamada directa entre dos servicios (por ejemplo, una API que llama directamente a otra API por HTTP y espera su respuesta), donde ambas partes deben estar disponibles al mismo tiempo para que la comunicación funcione.

Esta independencia entre productor y consumidor es lo que se llama desacoplamiento, y es una de las técnicas más importantes para construir sistemas resilientes. Si el consumidor está temporalmente caído, sobrecargado, o simplemente más lento que el productor, los mensajes se acumulan en la cola de forma segura en vez de perderse o de bloquear al productor esperando una respuesta. Cuando el consumidor vuelve a estar disponible, retoma el procesamiento de los mensajes acumulados exactamente donde se quedó, sin que el productor haya tenido que hacer nada especial ni haberse enterado siquiera de que hubo un problema.

Este patrón también permite escalar productores y consumidores de forma completamente independiente: puedes tener un único productor generando mensajes a un ritmo constante, y ajustar el número de consumidores según la carga de trabajo (más consumidores si la cola crece, menos si está vacía), sin que eso afecte en absoluto al productor. Esta es la base de arquitecturas de procesamiento en segundo plano, colas de trabajos (job queues), y sistemas de eventos que vas a encontrar en prácticamente cualquier aplicación real de tamaño medio o grande.

**Analogía:** una cola de mensajes es como el buzón de correos de un edificio de apartamentos. El cartero (productor) deja las cartas en el buzón sin necesidad de que el destinatario (consumidor) esté en casa en ese momento. El destinatario recoge sus cartas cuando puede, en el orden que prefiera, sin que eso afecte al cartero, que ya siguió con su ruta. Si el destinatario se va de viaje una semana, las cartas simplemente se acumulan esperando, sin perderse.

**¿Por qué es importante?** El desacoplamiento vía colas de mensajes es uno de los patrones de diseño más usados en sistemas distribuidos reales, precisamente porque hace que un fallo o una lentitud temporal en una parte del sistema no se propague inmediatamente al resto. Sin este patrón, cualquier llamada directa entre servicios crea una dependencia frágil: si el servicio B está caído, todo lo que dependa de una respuesta inmediata de B falla también.

**Diagrama:**

```
┌──────────────┐   envía mensaje    ┌───────────────┐   recibe mensaje   ┌──────────────┐
│   Productor    │ ─────────────────▶│  Cola SQS       │◀─────────────────│  Consumidor    │
│ (API, servicio) │                   │ (almacena hasta  │                  │ (Lambda,       │
│                │                   │  que se procese) │                  │  proceso, etc.)│
└──────────────┘                    └───────────────┘                    └──────────────┘
  No sabe nada del consumidor,         Persiste el mensaje                  No sabe nada del
  no espera respuesta directa           de forma duradera                    productor
```

### Tema 2: Ciclo de vida de un mensaje

#### Paso 1 · Objetivo y preparación
Al finalizar podrás procesar mensajes de forma segura desde cero. Prerrequisitos: Docker y AWS CLI; verifica `node --version`.
#### Paso 2 · Contexto y caso real
Un trabajador necesita tiempo para completar una entrega sin duplicar trabajo.
#### Paso 3 · Teoría, modelo mental y analogía
Visibility timeout es el cartel de “en proceso”; ReceiptHandle identifica la copia recibida.
#### Paso 4 · Demostración guiada
Crea `src/worker.js` desde una carpeta vacía.
```bash
mkdir ejemplo-worker
node --version
```
Resultado esperado: Node disponible.
#### Paso 5 · Práctica guiada
Pista: no borres el mensaje para provocar un fallo deliberado y corrígelo.
#### Paso 6 · Práctica independiente
Configura timeout y prueba un reintento.
#### Paso 7 · Cierre y evidencia
Entrega comandos, salida, fallo y corrección; explica el resultado. Siguiente paso: DLQ. Errores comunes: timeout menor que el procesamiento y borrar antes del commit. Fuente oficial: https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-visibility-timeout.html.
**Conceptos clave:** envío (`send-message`), recepción (`receive-message`), tiempo de visibilidad (visibility timeout), ReceiptHandle, borrado (`delete-message`), entrega al menos una vez (at-least-once).

Un mensaje en SQS pasa por cuatro etapas bien definidas. Primero, un productor lo envía con `send-message`, especificando el cuerpo del mensaje (texto libre, normalmente JSON) y, opcionalmente, atributos adicionales. El mensaje queda almacenado en la cola, disponible para cualquier consumidor que lo solicite. Segundo, un consumidor lo recibe con `receive-message`; en este punto, SQS no elimina el mensaje de la cola —lo marca como invisible durante un periodo configurable llamado tiempo de visibilidad (visibility timeout)—, y le entrega al consumidor, junto con el contenido del mensaje, un identificador temporal llamado ReceiptHandle.

Este ReceiptHandle es distinto en cada recepción del mismo mensaje, y es la clave para la tercera etapa: el borrado. Una vez que el consumidor termina de procesar el mensaje con éxito, debe llamar explícitamente a `delete-message` usando ese ReceiptHandle, para indicarle a SQS que el mensaje ya fue procesado y puede eliminarse definitivamente de la cola. Si el consumidor no borra el mensaje dentro del tiempo de visibilidad —por ejemplo, porque el proceso se cayó a mitad de procesarlo, o simplemente tardó demasiado— el mensaje vuelve a hacerse visible automáticamente y SQS lo entrega de nuevo a cualquier consumidor disponible, como si nunca se hubiera recibido.

Este diseño explica una propiedad fundamental de SQS que sorprende a quien la ve por primera vez: la entrega "al menos una vez" (at-least-once delivery). Un mismo mensaje puede, en determinadas circunstancias, ser entregado más de una vez a un consumidor —por ejemplo, si el consumidor lo procesó correctamente pero falló al llamar a `delete-message` justo después, o si el tiempo de visibilidad era demasiado corto para el tiempo real que tomó procesarlo—. SQS nunca garantiza entrega exactamente una vez en su modo Standard (las colas FIFO sí ofrecen una garantía mucho más cercana a "exactamente una vez", con matices que verás en el Tema 4). Por esta razón, cualquier consumidor de una cola Standard debe diseñarse para ser idempotente: procesar el mismo mensaje dos veces no debería causar un efecto duplicado incorrecto (por ejemplo, cobrar dos veces al mismo cliente).

Elegir un tiempo de visibilidad adecuado es una decisión de diseño importante: debe ser lo suficientemente largo para que el consumidor típico termine de procesar el mensaje con margen, pero no tan largo que, si el consumidor efectivamente falla, el mensaje tarde demasiado en volver a estar disponible para un reintento. Una práctica común es fijar el tiempo de visibilidad en varias veces el tiempo medio de procesamiento esperado.

**Analogía:** el ciclo de vida de un mensaje es como sacar un libro prestado de una biblioteca con un sistema estricto: cuando lo sacas (`receive-message`), el sistema no lo borra del catálogo, pero lo marca como "prestado" durante un plazo fijo (el tiempo de visibilidad) y te da un recibo (ReceiptHandle) que demuestra que tú lo tienes en ese momento. Si lo devuelves a tiempo confirmando la lectura (`delete-message`), el libro sale definitivamente de circulación. Si no lo devuelves dentro del plazo, el sistema asume que lo perdiste o no lo vas a terminar, y vuelve a poner el libro disponible para el siguiente lector, aunque tú sigas teniéndolo físicamente.

**¿Por qué es importante?** Entender que SQS entrega "al menos una vez", y no "exactamente una vez", es la diferencia entre escribir un consumidor correcto y uno con un bug sutil que solo aparece bajo ciertas condiciones de fallo poco frecuentes, exactamente el tipo de error difícil de reproducir y depurar en producción si no se diseñó con esto en mente desde el principio.

**Diagrama:**

```
send-message ──▶ [Mensaje en cola, visible]
                        │
                receive-message
                        ▼
        [Mensaje invisible durante el visibility timeout]
                        │  (el consumidor recibe el ReceiptHandle)
              ┌─────────┴─────────┐
              ▼                   ▼
      delete-message a tiempo    Timeout expira sin borrado
              │                   │
              ▼                   ▼
      Mensaje eliminado      Mensaje vuelve a ser visible
      definitivamente         (posible entrega duplicada)
```

### Tema 3: Dead Letter Queues (DLQ)

#### Paso 1 · Objetivo y preparación
Al finalizar podrás aislar mensajes fallidos desde cero. Prerrequisitos: Docker y AWS CLI; verifica `node --version`.
#### Paso 2 · Contexto y caso real
Un mensaje inválido no debe bloquear toda la cola.
#### Paso 3 · Teoría, modelo mental y analogía
Una DLQ es la zona de inspección donde se retiene un paquete que no pasa controles.
#### Paso 4 · Demostración guiada
Crea `src/dlq.js` desde una carpeta vacía.
```bash
mkdir ejemplo-dlq
node --version
```
Resultado esperado: Node disponible.
#### Paso 5 · Práctica guiada
Pista: supera maxReceiveCount para provocar un fallo deliberado y corrígelo.
#### Paso 6 · Práctica independiente
Reprocesa un mensaje después de corregir la causa.
#### Paso 7 · Cierre y evidencia
Entrega configuración, salida, fallo y corrección; explica el resultado. Siguiente paso: colas FIFO. Errores comunes: ocultar poison messages y no medir edad. Fuente oficial: https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-dead-letter-queues.html.
**Conceptos clave:** Dead Letter Queue, `maxReceiveCount`, RedrivePolicy, mensaje envenenado (poison message).

Un mensaje "envenenado" es aquel que un consumidor recibe pero nunca logra procesar con éxito, sin importar cuántas veces se reintente: quizá su contenido está malformado, quizá dispara un error de código consistente, o quizá depende de un recurso externo que nunca va a estar disponible para ese caso concreto. Sin ningún mecanismo adicional, un mensaje así entraría en un ciclo infinito: se entrega, falla, el tiempo de visibilidad expira, vuelve a entregarse, vuelve a fallar, indefinidamente, consumiendo recursos de procesamiento sin ningún resultado útil y potencialmente bloqueando el procesamiento de mensajes válidos detrás de él.

Una Dead Letter Queue resuelve exactamente este problema: es una segunda cola, configurada como destino de una cola principal mediante una RedrivePolicy, que especifica un `maxReceiveCount` (el número máximo de veces que un mensaje puede ser recibido antes de considerarse fallido). Cuando un mensaje alcanza ese número de recepciones sin haber sido borrado exitosamente, SQS lo mueve automáticamente a la DLQ en vez de devolverlo a la cola principal una vez más. A partir de ese momento, el mensaje deja de interferir con el procesamiento normal de la cola principal, y queda disponible en la DLQ para que un proceso separado (o una persona) lo inspeccione manualmente, entienda por qué falló repetidamente, y decida si corregirlo y reprocesarlo, o descartarlo definitivamente.

Configurar una DLQ no es opcional en cualquier sistema serio que use colas de mensajes: es una práctica de resiliencia estándar. Sin ella, un solo mensaje problemático puede degradar silenciosamente el rendimiento de todo el sistema de procesamiento, consumiendo ciclos de los consumidores en reintentos infinitos sin que nadie se entere hasta que el problema ya es grave. Con una DLQ bien configurada, en cambio, ese mismo mensaje problemático queda aislado y visible rápidamente, normalmente disparando una alarma de monitorización (que verás en el módulo avanzado de CloudWatch) cuando la DLQ recibe su primer mensaje.

Un detalle importante de diseño: el `maxReceiveCount` debe elegirse con cuidado. Un valor demasiado bajo (por ejemplo, 1) puede mover a la DLQ mensajes que en realidad habrían tenido éxito en un segundo intento, por un fallo transitorio y no por un problema real del mensaje. Un valor demasiado alto retrasa la detección de mensajes genuinamente problemáticos. Un valor entre 3 y 5 es un punto de partida razonable para la mayoría de los casos, ajustable según cuánta tolerancia a fallos transitorios necesite tu sistema en particular.

**Analogía:** una DLQ es como la bandeja de "correo devuelto" de una oficina de correos. Si una carta no puede entregarse tras varios intentos (dirección incorrecta, destinatario desconocido), en vez de seguir intentándolo indefinidamente y bloqueando el flujo normal de reparto, la carta se aparta a una bandeja especial para que alguien la revise manualmente, entienda qué salió mal, y decida qué hacer con ella, sin que eso frene la entrega del resto del correo.

**¿Por qué es importante?** Los sistemas de colas de mensajes sin DLQ son frágiles ante el caso, casi inevitable en cualquier sistema real con suficiente volumen, de que aparezca al menos un mensaje que no se puede procesar correctamente por alguna razón imprevista. Configurar una DLQ desde el diseño inicial, en vez de añadirla después de un incidente en producción, es una de las decisiones de resiliencia más baratas de implementar y más valiosas en la práctica.

**Diagrama:**

```
Mensaje enviado ──▶ Cola principal
                        │
          recibido, falla, vuelve a ser visible
                        │  (se repite hasta maxReceiveCount)
                        ▼
             ¿Se alcanzó maxReceiveCount?
                    │            │
                   No            Sí
                    │            │
        Sigue en cola principal  ▼
        (reintento normal)   Dead Letter Queue
                              (para inspección manual)
```

### Tema 4: Colas FIFO vs Standard

#### Paso 1 · Objetivo y preparación
Al finalizar podrás elegir Standard o FIFO desde cero. Prerrequisitos: Docker y AWS CLI; verifica `node --version`.
#### Paso 2 · Contexto y caso real
Una ruta puede requerir orden, mientras una notificación tolera concurrencia.
#### Paso 3 · Teoría, modelo mental y analogía
FIFO es una fila única con turnos; Standard prioriza disponibilidad y escala.
#### Paso 4 · Demostración guiada
Crea `src/fifo.js` desde una carpeta vacía.
```bash
mkdir ejemplo-fifo
node --version
```
Resultado esperado: Node disponible.
#### Paso 5 · Práctica guiada
Pista: repite un deduplication id para provocar un fallo deliberado y corrígelo.
#### Paso 6 · Práctica independiente
Compara orden, throughput y coste.
#### Paso 7 · Cierre y evidencia
Entrega decisión, salida, fallo y corrección; explica el resultado. Siguiente paso: eventos. Errores comunes: exigir orden global y olvidar MessageGroupId. Fuente oficial: https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-fifo-queues.html.
**Conceptos clave:** cola Standard, cola FIFO, orden garantizado, deduplicación, `MessageGroupId`, `MessageDeduplicationId`.

Una cola Standard prioriza el rendimiento y la disponibilidad por encima del orden estricto: puede entregar mensajes en un orden distinto al que se enviaron, y como viste en el Tema 2, puede entregar el mismo mensaje más de una vez en casos poco frecuentes. A cambio, ofrece un rendimiento prácticamente ilimitado en cuanto a mensajes por segundo, lo que la hace adecuada para la gran mayoría de los casos de uso donde el orden exacto de procesamiento no es crítico para la corrección del sistema (por ejemplo, procesar imágenes subidas por distintos usuarios: no importa si la imagen del usuario A se procesa antes o después que la del usuario B).

Una cola FIFO (First In, First Out, identificada porque su nombre debe terminar en `.fifo`) garantiza dos propiedades que Standard no garantiza: el orden estricto de entrega dentro de un mismo grupo de mensajes, y una deduplicación automática de mensajes idénticos enviados en una ventana corta de tiempo. Para lograr esto, una cola FIFO introduce dos conceptos nuevos: el `MessageGroupId`, que agrupa mensajes que deben procesarse en orden entre sí (mensajes de grupos distintos sí pueden procesarse en paralelo, sin orden relativo entre ellos), y el `MessageDeduplicationId`, que SQS usa para descartar automáticamente mensajes duplicados enviados dentro de una ventana de deduplicación (por defecto, cinco minutos).

El precio de estas garantías es un límite de rendimiento notablemente menor que el de una cola Standard (aunque las colas FIFO con procesamiento por lotes de alto rendimiento pueden alcanzar cifras mucho más altas que las FIFO clásicas, siguen estando por debajo del rendimiento prácticamente ilimitado de Standard), y la necesidad de pensar explícitamente en cómo agrupar tus mensajes mediante el `MessageGroupId` para no perder el paralelismo que sí necesitas entre grupos independientes.

La decisión entre FIFO y Standard depende enteramente de si tu caso de uso requiere orden estricto o tolera reordenamiento. Ejemplos típicos que sí necesitan FIFO: procesar las transacciones de una misma cuenta bancaria en el orden exacto en que ocurrieron (aplicar un cargo antes que un reembolso importa), o aplicar actualizaciones de estado de un mismo pedido en secuencia (no puedes marcar un pedido como "entregado" antes de procesar el evento de "enviado"). Ejemplos típicos que toleran Standard: procesar notificaciones push independientes a distintos usuarios, o encolar tareas de procesamiento de imágenes sin relación de orden entre sí.

**Analogía:** una cola Standard es como una fila de autoservicio en una tienda con varias cajas abiertas: es rápida y eficiente, pero no hay garantía de que quien llegó primero a la tienda sea necesariamente el primero en pagar si eligió una caja más lenta. Una cola FIFO es como una única fila estricta de un solo carril, donde el orden de llegada se respeta exactamente, a costa de que todo el mundo avanza a la velocidad de una sola caja (o de un carril concreto, si divides la fila en varios `MessageGroupId` independientes).

**¿Por qué es importante?** Elegir el tipo de cola equivocado tiene consecuencias distintas según el error: usar Standard cuando se necesitaba orden estricto puede introducir bugs sutiles y difíciles de reproducir (que dependen del orden de llegada, algo que rara vez se prueba explícitamente); usar FIFO cuando no se necesitaba puede introducir un cuello de botella de rendimiento innecesario. Entender esta disyuntiva desde el diseño inicial evita ambos problemas.

**Diagrama:**

```
Cola Standard                      Cola FIFO (grupo A)      Cola FIFO (grupo B)
┌────────────────┐              ┌──────────────────┐    ┌──────────────────┐
│ Msg 3 │ Msg 1 │  │              │ Msg 1 → Msg 2 →   │    │ Msg 1 → Msg 2 →   │
│ Msg 2 (orden no  │              │ Msg 3 (orden       │    │ Msg 3 (orden       │
│ garantizado,     │              │ garantizado dentro  │    │ garantizado dentro  │
│ posible duplicado)│             │ del grupo A)         │    │ del grupo B)         │
└────────────────┘              └──────────────────┘    └──────────────────┘
                                  (A y B se procesan en paralelo entre sí)
```

---


## Laboratorio práctico

> Este laboratorio asume que ya ejecutaste `floci start` y `eval $(floci env)` (Módulo 1) en tu sesión de terminal, así que los comandos de `aws` no repiten `--endpoint-url`.

**Objetivo del laboratorio:** enviar, recibir y eliminar mensajes en una cola Standard, configurar una Dead Letter Queue, y crear una cola FIFO con agrupación de mensajes.

**Requisitos previos:** Floci corriendo con el servicio SQS activo, AWS CLI configurada contra `http://localhost:4566`.

### Laboratorio 3.1 — Ciclo completo con cola Standard y DLQ

| Paso | Acción | Comando | Explicación | Salida esperada |
|---|---|---|---|---|
| 1 | Crear la cola principal | `aws sqs create-queue --queue-name mi-cola` | Crea una cola Standard | Un JSON con `QueueUrl` |
| 2 | Enviar un mensaje | `aws sqs send-message --queue-url <QueueUrl> --message-body "Hola mundo"` | Coloca un mensaje en la cola | Un JSON con `MessageId` y `MD5OfMessageBody` |
| 3 | Recibir el mensaje | `aws sqs receive-message --queue-url <QueueUrl>` | Obtiene el mensaje y su `ReceiptHandle`, dejándolo temporalmente invisible | Un JSON con `Body: "Hola mundo"` y un `ReceiptHandle` largo |
| 4 | Eliminar el mensaje procesado | `aws sqs delete-message --queue-url <QueueUrl> --receipt-handle <ReceiptHandle>` | Confirma el procesamiento exitoso y elimina el mensaje definitivamente | Sin salida (comando exitoso) |
| 5 | Crear una cola secundaria para la DLQ | `aws sqs create-queue --queue-name mi-cola-dlq` | Esta cola recibirá los mensajes que fallen repetidamente | Un JSON con `QueueUrl` de la DLQ |
| 6 | Obtener el ARN de la DLQ | `aws sqs get-queue-attributes --queue-url <QueueUrl-DLQ> --attribute-names QueueArn` | Necesitas el ARN (no la URL) para configurar la RedrivePolicy | Un JSON con `QueueArn` |
| 7 | Enlazar la cola principal a la DLQ | `aws sqs set-queue-attributes --queue-url <QueueUrl-principal> --attributes "RedrivePolicy={\"deadLetterTargetArn\":\"<QueueArn-DLQ>\",\"maxReceiveCount\":\"2\"}"` | A partir de ahora, un mensaje que se reciba 2 veces sin ser borrado se mueve automáticamente a la DLQ | Sin salida (comando exitoso) |
| 8 | Enviar un mensaje de prueba y recibirlo dos veces sin borrarlo | Envía un mensaje, y ejecuta `receive-message` dos veces seguidas dejando expirar el tiempo de visibilidad entre cada una (o usa `change-message-visibility` para forzarlo a 0) | Simula un consumidor que nunca logra procesar el mensaje | Tras la segunda recepción sin borrado, el mensaje debería migrar a la DLQ |
| 9 | Verificar que el mensaje llegó a la DLQ | `aws sqs receive-message --queue-url <QueueUrl-DLQ>` | Confirma que el mensaje problemático quedó aislado en la DLQ | El mismo `Body` del mensaje de prueba aparece ahora en la DLQ |

### Laboratorio 3.2 — Cola FIFO con MessageGroupId

| Paso | Acción | Comando | Explicación | Salida esperada |
|---|---|---|---|---|
| 1 | Crear una cola FIFO | `aws sqs create-queue --queue-name mi-cola.fifo --attributes FifoQueue=true` | El nombre debe terminar en `.fifo`, y se debe declarar explícitamente el atributo `FifoQueue` | Un JSON con `QueueUrl` terminando en `.fifo` |
| 2 | Enviar tres mensajes al mismo grupo | `aws sqs send-message --queue-url <QueueUrl> --message-body "Paso 1" --message-group-id pedido-001 --message-deduplication-id d1` (repetir con "Paso 2"/`d2` y "Paso 3"/`d3`, mismo `message-group-id`) | Los tres mensajes pertenecen al mismo `MessageGroupId`, por lo que se entregarán en el orden exacto en que se enviaron | Tres respuestas, cada una con su propio `MessageId` |
| 3 | Recibir los mensajes en orden | `aws sqs receive-message --queue-url <QueueUrl> --max-number-of-messages 3` | Confirma que los tres mensajes llegan en el orden exacto de envío: "Paso 1", "Paso 2", "Paso 3" | Un JSON con los tres mensajes en ese orden exacto |

**Comprobación visual:** abre Floci UI y localiza la categoría **Queue**. Actualmente puede aparecer como placeholder: eso enseña una distinción profesional importante entre que el runtime soporte SQS y que la consola ya tenga conectada esa superficie. No interpretes un placeholder como ausencia de la cola ni inventes datos visuales; usa `aws sqs list-queues` y los atributos de la DLQ como fuente de verdad.

**Verificación:** el laboratorio se considera exitoso si, en el Laboratorio 3.1, el mensaje de prueba aparece finalmente en la cola DLQ tras alcanzar el `maxReceiveCount`, y si, en el Laboratorio 3.2, los tres mensajes del mismo `MessageGroupId` se reciben en el orden exacto en que fueron enviados, no en un orden distinto. Documenta además si Queue estaba conectada o marcada como placeholder en tu versión de Floci UI.

**Errores comunes y soluciones**

- **`Value {...} for parameter QueueName is invalid` al crear una cola FIFO.** El nombre de una cola FIFO debe terminar exactamente en `.fifo`; si lo olvidas, SQS rechaza la creación con el atributo `FifoQueue=true` activo.
- **`MissingParameter` al enviar un mensaje a una cola FIFO.** Las colas FIFO requieren `--message-group-id` en cada envío; olvidarlo es el error más común al migrar código de Standard a FIFO.
- **El mensaje nunca migra a la DLQ aunque lo recibas muchas veces.** Verifica que configuraste correctamente el `RedrivePolicy` con el ARN correcto de la DLQ (no la URL), y que el `maxReceiveCount` no sea demasiado alto para tu prueba. También confirma que realmente dejaste expirar el tiempo de visibilidad entre cada recepción, o que usaste `change-message-visibility` para forzarlo.
- **Confundir `QueueUrl` con `QueueArn`.** Son dos identificadores distintos del mismo recurso: la URL se usa en la mayoría de los comandos de la API (enviar, recibir, borrar), mientras que el ARN se usa específicamente en configuraciones como la RedrivePolicy. Usar uno donde se espera el otro produce errores de validación poco claros a primera vista.

---
