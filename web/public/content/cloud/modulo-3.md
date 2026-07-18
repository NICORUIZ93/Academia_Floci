# Módulo 3: Mensajería asíncrona con SQS

## Sílabo

**Objetivo general**

Entender por qué desacoplar componentes con colas de mensajes hace los sistemas más resilientes, dominar el ciclo de vida completo de un mensaje en SQS, y saber cuándo usar una Dead Letter Queue y cuándo elegir una cola FIFO frente a una Standard.

**Objetivos específicos**

1. Explicar qué significa desacoplar productores y consumidores con una cola de mensajes.
2. Describir el ciclo de vida completo de un mensaje: envío, recepción, visibilidad y borrado.
3. Configurar una Dead Letter Queue (DLQ) y explicar cuándo un mensaje termina en ella.
4. Diferenciar colas FIFO y Standard, y justificar cuándo usar cada una.
5. Enviar, recibir y eliminar mensajes en SQS usando la AWS CLI.

**Contenido**

- Colas, productores y consumidores.
- Ciclo de vida de un mensaje.
- Dead Letter Queues (DLQ).
- Colas FIFO vs Standard.

**Evaluación**

Un laboratorio con el ciclo completo de una cola estándar y una DLQ, otro laboratorio con una cola FIFO, y tres ejercicios de evaluación sobre entrega duplicada, DLQ y elección de tipo de cola.

---

## Comienza desde cero: prepara este capítulo

Este recorrido parte de una carpeta vacía. Al finalizar tendrás **Un laboratorio con el ciclo completo de una cola estándar y una DLQ, otro laboratorio con una cola FIFO, y tres ejercicios de evaluación sobre entrega duplicada, DLQ y elección de tipo de cola.** No avances ejecutando comandos que no comprendes: primero identifica la entrada, la transformación y la evidencia que comprobará el resultado.

### 1. Comprueba las herramientas

Los comandos funcionan en macOS, Linux y WSL. En PowerShell usa el equivalente indicado por la herramienta.

```bash
docker --version
aws --version
terraform version
```

Si un comando no existe, detente e instala esa herramienta desde su sitio oficial. Cierra y abre la terminal después de modificar `PATH`. Las versiones deben ser compatibles entre sí antes de crear archivos.

### 2. Crea o recupera el proyecto del track

```bash
mkdir -p academia-labs/cloud/{infra,tests,evidence}
cd academia-labs/cloud
git init
docker compose up -d
```

Trabaja dentro de `academia-labs/cloud`. Si ya existe, no lo vuelvas a generar: entra en la carpeta, confirma `git status` y continúa sobre una rama propia.

### 3. Ubica cada tema antes de escribir

```text
academia-labs/cloud/
├─ infra/
│  └─ module-3/
├─ tests/
├─ docs/decisions/
├─ evidence/module-3/
└─ README.md
```

| Tema | Archivo o decisión | Evidencia mínima |
|---|---|---|
| 1. Colas, productores y consumidores | `infra/module-3/topic-1-colas-productores-y-consumidores.tf` | prueba + salida observable |
| 2. Ciclo de vida de un mensaje | `infra/module-3/topic-2-ciclo-de-vida-de-un-mensaje.tf` | prueba + salida observable |
| 3. Dead Letter Queues (DLQ) | `infra/module-3/topic-3-dead-letter-queues-dlq.tf` | prueba + salida observable |
| 4. Colas FIFO vs Standard | `infra/module-3/topic-4-colas-fifo-vs-standard.tf` | prueba + salida observable |

Un ejemplo técnico vive en el archivo indicado y debe tener una prueba. Un tema conceptual vive en `docs/decisions/`: compara opciones usando restricciones medibles; no escribas código decorativo solo para llenar espacio.

### 4. Ejecuta una línea base

Desde `academia-labs/cloud`:

```bash
terraform -chdir=infra validate
```

**Resultado esperado:** el comando reconoce el proyecto y termina sin errores antes de introducir el cambio del capítulo. Después del incremento, la evidencia debe demostrar: **Un laboratorio con el ciclo completo de una cola estándar y una DLQ, otro laboratorio con una cola FIFO, y tres ejercicios de evaluación sobre entrega duplicada, DLQ y elección de tipo de cola.**

Si falla la línea base, no continúes. Localiza el primer mensaje que indique archivo, línea o dependencia; formula una causa y compruébala con un cambio pequeño.

### 5. Provoca un fallo y recupérate

Cambia un endpoint, permiso o identificador por un valor inválido; inspecciona la respuesta del emulador antes de corregir. Guarda en `evidence/module-3/` el comando, la salida relevante, tu hipótesis y la corrección. Revierte únicamente el cambio deliberado; no borres todo el proyecto para ocultar la causa.

### 6. Conecta el capítulo con RutaFlow

Aplica el aprendizaje de **Mensajería asíncrona con SQS** a un incremento vertical de RutaFlow. Define qué componente produce el dato, qué contrato lo transporta, quién lo consume y cómo observarás un fallo. La entrega final incluye archivo o decisión, prueba, salida, error corregido y una limitación que todavía validarías en producción.

---

## Contenido teórico

### Tema 1: Colas, productores y consumidores

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

## Ejercicios de evaluación

### Ejercicio 1: Explicar la entrega duplicada

**Enunciado:** un compañero de equipo te dice: "SQS garantiza que cada mensaje se entrega exactamente una vez, así que no me preocupo por procesar el mismo mensaje dos veces". Explica por qué esta afirmación es incorrecta para una cola Standard, y qué debería hacer ese compañero en su código para manejar esta situación correctamente.

**Solución esperada:** SQS Standard garantiza entrega "al menos una vez", no "exactamente una vez"; un mensaje puede entregarse más de una vez si, por ejemplo, el consumidor lo procesa correctamente pero falla al llamar a `delete-message`, o si el tiempo de visibilidad expira antes de que termine de procesarlo. El compañero debería diseñar su lógica de procesamiento para ser idempotente: por ejemplo, verificando primero si ese mensaje (identificado por un ID único de negocio, no necesariamente el `MessageId` de SQS) ya fue procesado antes de aplicar su efecto, para que procesarlo dos veces no duplique el resultado.

**Criterios de éxito:**
- Identifica correctamente que Standard es "al menos una vez", no "exactamente una vez".
- Explica al menos una causa concreta de la entrega duplicada.
- Propone idempotencia (o un mecanismo equivalente de verificación) como solución, no simplemente "confiar en que no pasará".

### Ejercicio 2: Configurar un maxReceiveCount razonable

**Enunciado:** tu equipo está debatiendo qué valor de `maxReceiveCount` usar para la DLQ de una cola que procesa pagos, donde los fallos transitorios (por ejemplo, una demora de red hacia un servicio de facturación externo) son ocasionales pero normales. Alguien propone `maxReceiveCount=1`. Explica por qué ese valor es probablemente demasiado bajo, y propón un valor alternativo con su justificación.

**Solución esperada:** con `maxReceiveCount=1`, cualquier mensaje que falle una sola vez —incluso por un problema transitorio y no por un error real del mensaje— se mueve inmediatamente a la DLQ sin darle ninguna oportunidad de reintento, lo que probablemente movería a la DLQ pagos que en realidad se habrían procesado bien en un segundo intento. Un valor entre 3 y 5 permite absorber fallos transitorios ocasionales sin retrasar demasiado la detección de mensajes genuinamente problemáticos.

**Criterios de éxito:**
- Explica correctamente por qué `maxReceiveCount=1` no distingue entre fallo transitorio y mensaje genuinamente problemático.
- Propone un valor razonable (entre 3 y 5 es aceptable) con una justificación relacionada con el Tema 3.

### Ejercicio 3: Elegir entre FIFO y Standard

**Enunciado:** describe, para cada uno de estos dos sistemas, si usarías una cola FIFO o Standard, justificando tu elección: (a) un sistema que envía un correo electrónico de bienvenida cada vez que un usuario nuevo se registra; (b) un sistema que procesa eventos de un carrito de compras (agregar producto, aplicar cupón, confirmar compra) donde aplicar los eventos fuera de orden produciría un total incorrecto.

**Solución esperada:** (a) Standard, porque el orden entre distintos correos de bienvenida a distintos usuarios no importa, y el mayor rendimiento de Standard es preferible; (b) FIFO, agrupando los eventos de un mismo carrito bajo el mismo `MessageGroupId`, porque el orden de aplicación de esos eventos afecta directamente a la corrección del resultado final.

**Criterios de éxito:**
- Ambas respuestas coinciden con la solución esperada.
- La justificación de (b) menciona explícitamente que el orden afecta a la corrección del resultado, no solo "por si acaso".

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

- AWS, Microsoft Azure y Google Cloud, marcos oficiales de arquitectura bien diseñada.
- NIST, *Cloud Computing Standards Roadmap* y *Secure Software Development Framework*.
- Beyer et al., *Site Reliability Engineering*.
- ACM/IEEE-CS/AAAI, *Computer Science Curricula 2023*.
- IEEE Computer Society, *SWEBOK Guide V4.0*.

## Resumen del módulo

**Puntos clave**

- Las colas de mensajes desacoplan productores de consumidores, permitiendo que cada uno funcione, falle o escale de forma independiente del otro.
- El ciclo de vida de un mensaje pasa por envío, recepción (con tiempo de visibilidad y ReceiptHandle) y borrado explícito; sin ese borrado, el mensaje vuelve a estar disponible.
- SQS Standard entrega mensajes "al menos una vez", nunca "exactamente una vez"; los consumidores deben diseñarse para ser idempotentes.
- Una Dead Letter Queue aísla automáticamente los mensajes que fallan repetidamente (según un `maxReceiveCount`), evitando que bloqueen el procesamiento normal.
- Las colas FIFO garantizan orden estricto dentro de un `MessageGroupId` y deduplicación automática, a costa de menor rendimiento que Standard.

**Conceptos aprendidos**

- Desacoplamiento de productores y consumidores mediante colas.
- Ciclo de vida completo de un mensaje: envío, visibilidad, ReceiptHandle y borrado.
- Entrega "al menos una vez" y la necesidad de idempotencia.
- Dead Letter Queues y el parámetro `maxReceiveCount`.
- Colas FIFO frente a Standard, `MessageGroupId` y `MessageDeduplicationId`.

**Próximos pasos**

En el Módulo 4 vas a modelar y consultar datos en una base de datos NoSQL con DynamoDB, entendiendo claves primarias, índices, y por qué Query es preferible a Scan.

**Recursos adicionales**

- Documentación oficial de Amazon SQS: conceptos básicos y guía de desarrollador.
- Documentación oficial sobre colas FIFO de SQS y sus límites de rendimiento.
- Documentación oficial sobre Dead Letter Queues y políticas de redrive.
- Código ejecutable de cada operación (crear cola, enviar, recibir, eliminar mensaje) en Node.js, Python, Java, Go y Rust: carpeta [`examples/`](https://github.com/NICORUIZ93/Academia_Floci/tree/main/examples) del repositorio, archivos que empiezan por `sqs-`/`sqs_`/`Sqs` (ver [`examples/README.md`](https://github.com/NICORUIZ93/Academia_Floci/blob/main/examples/README.md) para la lista completa).
