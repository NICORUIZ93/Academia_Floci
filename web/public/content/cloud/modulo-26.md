# Módulo 26: Streaming e integración avanzada — Firehose y EventBridge Pipes


## Aprende construyendo

### Tema 1: Amazon Data Firehose — entrega gestionada sin consumidores propios

#### Paso 1 · Objetivo y preparación
Al finalizar podrás enviar registros a un stream desde cero. Prerrequisitos: Node.js y Docker; verifica `node --version`.
#### Paso 2 · Contexto y caso real
La telemetría de vehículos llega continuamente y debe persistir sin perder lotes.
#### Paso 3 · Teoría, modelo mental y analogía
El buffer es una bandeja que agrupa registros antes de transportarlos.
#### Paso 4 · Demostración guiada
Crea `src/firehose.js` desde una carpeta vacía.
```bash
mkdir ejemplo-firehose
node --version
```
Resultado esperado: Node disponible.
#### Paso 5 · Práctica guiada
Pista: envía un registro inválido para provocar un fallo deliberado y corrígelo.
#### Paso 6 · Práctica independiente
Compara PutRecord y Batch.
#### Paso 7 · Cierre y evidencia
Entrega flujo, salida, fallo y corrección; explica el resultado. Siguiente paso: consumidores. Errores comunes: buffers sin límite y no comprobar entrega. Fuente oficial: https://docs.aws.amazon.com/firehose/latest/dev/what-is-this-service.html.
**Conceptos clave:** `PutRecord`, `PutRecordBatch`, buffer en memoria, vaciado automático a S3.

Firehose resuelve un problema específico: quieres que los datos que produces lleguen automáticamente a un destino de almacenamiento o análisis —S3, en el caso más común— sin tener que escribir y operar tu propio proceso consumidor que lea, agrupe y escriba esos datos. Envías registros con `PutRecord` o, más eficientemente, en lote con `PutRecordBatch`, y Firehose se encarga del resto: los almacena en un búfer en memoria y los vacía automáticamente hacia el bucket de destino cuando se acumulan suficientes registros o pasa suficiente tiempo. En Floci, ese vaciado ocurre cada 5 registros para que tengas retroalimentación local inmediata en vez de esperar los minutos que tomaría en producción, y los datos se descargan como NDJSON (JSON delimitado por líneas nuevas) en el bucket `floci-firehose-results`.

Esta simplicidad tiene un costo: a diferencia de Kinesis Data Streams, donde tú controlas exactamente cuándo y cómo se procesa cada registro (útil para procesamiento en tiempo real con lógica personalizada), Firehose no te da ese control fino — su propósito es la entrega confiable y de bajo esfuerzo, no el procesamiento en tiempo real con lógica compleja.

**Analogía:** Firehose es como un servicio de correo que recoge tu correspondencia automáticamente de tu buzón cada cierto tiempo y la entrega en la oficina central sin que tengas que llevarla tú mismo; Kinesis Data Streams es más como tener tu propio mensajero que puede leer cada carta en el momento y decidir qué hacer con ella antes de que llegue a destino.

**¿Por qué es importante?** Elegir Firehose en vez de construir un consumidor Kinesis propio para el caso simple de "solo quiero que estos datos terminen en S3 para analizarlos después con Athena" ahorra código, operación y superficie de error — reservas la complejidad de un consumidor propio para cuando realmente necesitas lógica de procesamiento en el camino.

**Practícalo tú:**

```bash
# archivo: src/labs/modulo-26/tema-1-firehose.sh — ejecutar con: bash tema-1-firehose.sh
aws firehose create-delivery-stream --delivery-stream-name demo-eventos
for i in 1 2 3 4 5; do
  aws firehose put-record --delivery-stream-name demo-eventos \
    --record "{\"Data\": \"{\\\"guia\\\": \\\"RF-00$i\\\", \\\"evento\\\": \\\"entregado\\\"}\"}"
done
aws s3 ls s3://floci-firehose-results/ --recursive
```

**Resultado esperado:** tras el quinto `put-record`, Floci vacía el búfer automáticamente; `s3 ls` muestra un archivo NDJSON nuevo en `floci-firehose-results` con los 5 eventos, uno por línea, sin que hayas escrito ningún consumidor.

**Modifica esto:** envía solo 3 registros y confirma que el archivo todavía no aparece en S3 — el vaciado en Floci ocurre cada 5 registros, no en cada `put-record` individual.

**Cuándo no usarlo:** no uses Firehose si necesitas reaccionar a cada registro individualmente en tiempo real (por ejemplo, alertar apenas llega un evento crítico); para eso necesitas un consumidor propio sobre Kinesis Data Streams, como viste en el Módulo 17.

**Cómo crece tu proyecto:** este stream acumula cada evento de "entregado" del proyecto y los deja en S3 listos para análisis histórico con Athena.

### Tema 2: Firehose vs Kinesis Data Streams — quién consume los datos

#### Paso 1 · Objetivo y preparación
Al finalizar podrás elegir entrega gestionada desde cero. Prerrequisitos: Node.js y Docker; verifica `node --version`.
#### Paso 2 · Contexto y caso real
Una organización puede operar consumidores o delegar entrega a un servicio.
#### Paso 3 · Teoría, modelo mental y analogía
Consumidor propio es conducir el camión; gestionado es contratar logística.
#### Paso 4 · Demostración guiada
Crea `src/consumer-choice.js` desde una carpeta vacía.
```bash
mkdir ejemplo-consumidor
node --version
```
Resultado esperado: Node disponible.
#### Paso 5 · Práctica guiada
Pista: configura una latencia incompatible para provocar un fallo deliberado y corrígelo.
#### Paso 6 · Práctica independiente
Compara coste, control y transformación.
#### Paso 7 · Cierre y evidencia
Entrega matriz, salida, fallo y corrección; explica el resultado. Siguiente paso: Pipes. Errores comunes: olvidar latencia de buffer y responsabilidad operativa. Fuente oficial: https://docs.aws.amazon.com/firehose/latest/dev/what-is-this-service.html.
**Conceptos clave:** consumidor propio vs entrega gestionada, latencia de entrega, transformación en tránsito.

Ya viste Kinesis Data Streams en el Módulo 17: streams particionados con shards, donde tú escribes consumidores que leen registros con iteradores de shard y decides qué hacer con cada uno. Firehose, en cambio, no expone shards ni iteradores: no hay un "consumidor" que tú operes, porque el propio servicio actúa como consumidor gestionado que entrega hacia el destino configurado. Esta es la decisión de diseño que debes usar para elegir entre ambos: si necesitas procesamiento personalizado en tiempo real con múltiples consumidores independientes leyendo el mismo stream (fan-out), usas Kinesis Data Streams; si solo necesitas que los datos terminen de forma confiable en un destino de almacenamiento sin lógica intermedia compleja, usas Firehose.

En arquitecturas reales, ambos conviven con frecuencia: un productor escribe a un stream de Kinesis Data Streams, y Firehose se suscribe a ese mismo stream como uno de sus consumidores para garantizar que, además del procesamiento en tiempo real que hagan otros consumidores, siempre exista una copia completa y ordenada en S3 para análisis histórico.

**Analogía:** Kinesis Data Streams es una cinta transportadora donde varios trabajadores (consumidores) pueden inspeccionar cada paquete mientras pasa; Firehose es una cinta transportadora que termina automáticamente en un almacén (S3), sin trabajadores intermedios que decidan nada sobre cada paquete individual.

**¿Por qué es importante?** Esta distinción —¿necesito lógica de procesamiento en tránsito o solo entrega confiable?— es la misma pregunta de diseño que ya aplicaste al elegir entre SQS y SNS, o entre EventBridge y Step Functions: reconocer el patrón general de "¿cuánto control necesito realmente?" te ahorra sobre-ingeniería.

**Practícalo tú:**

```bash
# archivo: src/labs/modulo-26/tema-2-comparar-firehose-kinesis.sh — ejecutar con: bash tema-2-comparar-firehose-kinesis.sh
aws firehose describe-delivery-stream --delivery-stream-name demo-eventos \
  --query 'DeliveryStreamDescription.DeliveryStreamStatus'
aws kinesis describe-stream --stream-name demo-stream --query 'StreamDescription.Shards' 2>&1 | head -5
```

**Resultado esperado:** Firehose responde con un estado simple (`ACTIVE`) y ningún concepto de shard; Kinesis Data Streams responde con una lista de shards que tú tendrías que iterar manualmente para leer registros — la diferencia estructural entre "entrega gestionada" y "stream que tú consumes".

**Modifica esto:** crea un stream Kinesis (`aws kinesis create-stream --stream-name demo-stream --shard-count 1`) y repite la comparación para verla con datos reales en vez de un stream inexistente.

**Cuándo no usarlo:** no migres un consumidor Kinesis existente a Firehose solo por simplicidad si ese consumidor depende de leer registros en tiempo real con múltiples lectores independientes (fan-out); perderías esa capacidad.

**Cómo crece tu proyecto:** El proyecto usa Kinesis Data Streams para el tracking GPS en tiempo real (Módulo 17) y Firehose en paralelo para el histórico de entregas — la misma combinación que describe este tema.

### Tema 3: EventBridge Pipes — conectar origen y destino sin código de pegamento

#### Paso 1 · Objetivo y preparación
Al finalizar podrás conectar origen y destino desde cero. Prerrequisitos: Node.js y Docker; verifica `node --version`.
#### Paso 2 · Contexto y caso real
Un evento de entrega debe pasar a un procesador sin código de pegamento.
#### Paso 3 · Teoría, modelo mental y analogía
Pipe es una tubería con origen, filtro, enriquecimiento y destino.
#### Paso 4 · Demostración guiada
Crea `src/pipe.js` desde una carpeta vacía.
```bash
mkdir ejemplo-pipe
node --version
```
Resultado esperado: Node disponible.
#### Paso 5 · Práctica guiada
Pista: usa un destino incompatible para provocar un fallo deliberado y corrígelo.
#### Paso 6 · Práctica independiente
Añade filtro y enriquecimiento.
#### Paso 7 · Cierre y evidencia
Entrega definición, salida, fallo y corrección; explica el resultado. Siguiente paso: patrones. Errores comunes: permisos incompletos y eventos sin esquema. Fuente oficial: https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-pipes.html.
**Conceptos clave:** `CreatePipe`, origen, destino, enriquecimiento opcional.

EventBridge Pipes resuelve un problema de "código de pegamento" muy común: tienes una cola SQS y quieres que cada mensaje dispare una función Lambda, o tienes un stream de Kinesis y quieres que sus registros lleguen a una máquina de estados de Step Functions. La forma tradicional de hacer esto sería escribir una Lambda intermedia que haga polling de la cola y llame al destino — código que tú tienes que escribir, desplegar y mantener solo para mover datos de un lado a otro. Un pipe (`CreatePipe`) elimina ese código intermedio: declaras el origen (una cola SQS, un stream de Kinesis o DynamoDB, o un topic de Kafka/MSK) y el destino (una función Lambda, otra cola, un topic SNS, un stream Kinesis o una máquina de estados), y EventBridge se encarga de mover los datos entre ambos, con la opción de aplicar filtrado o una transformación de enriquecimiento en el camino.

Un pipe tiene un ciclo de vida propio: se crea en estado `STARTING`, pasa a `RUNNING` cuando está activo, y puedes detenerlo (`StopPipe`) sin eliminarlo si necesitas pausar temporalmente el flujo de datos, reanudándolo después con `StartPipe`.

**Analogía:** un pipe es como una tubería física instalada directamente entre dos tanques de agua: antes tenías que llenar baldes en un tanque y vaciarlos manualmente en el otro (tu código de pegamento); ahora el agua fluye sola por la tubería, y solo intervienes si quieres filtrar impurezas en el camino (el enriquecimiento opcional).

**¿Por qué es importante?** Cada línea de código de pegamento que no tienes que escribir es una línea que no puede tener bugs, no necesita pruebas, y no necesita mantenimiento; Pipes es el ejemplo más directo en este curso de cómo AWS moderno favorece la configuración declarativa sobre código intermedio cuando el caso de uso es simple.

**Practícalo tú:**

```bash
# archivo: src/labs/modulo-26/tema-3-pipe.sh — ejecutar con: bash tema-3-pipe.sh
# Crea la cola aquí mismo: el ejercicio no depende de haber corrido nada antes.
aws sqs create-queue --queue-name demo-cola
COLA_URL=$(aws sqs get-queue-url --queue-name demo-cola --query QueueUrl --output text)

aws pipes create-pipe --name demo-pipe \
  --source arn:aws:sqs:us-east-1:000000000000:demo-cola \
  --target arn:aws:lambda:us-east-1:000000000000:function:demo-notificar \
  --role-arn arn:aws:iam::000000000000:role/pipe-role
aws sqs send-message --queue-url "$COLA_URL" --message-body '{"tarea":"notificar-entrega"}'
aws logs tail /aws/lambda/demo-notificar --since 1m
```

**Resultado esperado:** el pipe queda `RUNNING`; segundos después de enviar el mensaje a la cola, los logs de la Lambda muestran que recibió el evento — sin que hayas escrito ningún código de polling entre la cola y la función.

**Modifica esto:** detén el pipe con `stop-pipe`, envía otro mensaje a la cola, y confirma que la Lambda esta vez NO se invoca — el mensaje queda esperando en la cola hasta que reanudes el pipe con `start-pipe`.

**Cuándo no usarlo:** no uses un pipe si necesitas transformar significativamente el payload antes de que llegue al destino más allá de un filtro simple; para lógica de transformación compleja, una Lambda intermedia explícita sigue siendo más clara y testeable.

**Cómo crece tu proyecto:** este pipe dispara la notificación al cliente en cuanto se encola un evento de entrega, sin una Lambda adicional dedicada solo a hacer polling de la cola.

### Tema 4: Cuándo usar Pipes frente a reglas EventBridge o Step Functions

#### Paso 1 · Objetivo y preparación
Al finalizar podrás elegir integración desde cero. Prerrequisitos: Node.js y Docker; verifica `node --version`.
#### Paso 2 · Contexto y caso real
Cada flujo necesita equilibrio entre simplicidad, flexibilidad y trazabilidad.
#### Paso 3 · Teoría, modelo mental y analogía
Punto a punto es pasillo directo; eventos es central de clasificación; workflow es supervisor.
#### Paso 4 · Demostración guiada
Crea `src/integration-choice.js` desde una carpeta vacía.
```bash
mkdir ejemplo-integraciones
node --version
```
Resultado esperado: Node disponible.
#### Paso 5 · Práctica guiada
Pista: elige una herramienta sin soporte para provocar un fallo deliberado y corrígelo.
#### Paso 6 · Práctica independiente
Construye matriz de latencia, estado y mantenimiento.
#### Paso 7 · Cierre y evidencia
Entrega decisión, salida, fallo y corrección; explica el resultado. Siguiente paso: gobierno. Errores comunes: usar workflow para todo y ocultar errores. Fuente oficial: https://docs.aws.amazon.com/decision-guides/latest/event-driven-architecture-on-aws/.
**Conceptos clave:** integración punto a punto vs enrutamiento por patrones vs orquestación con estado.

Ya conoces dos primos cercanos de Pipes: las reglas EventBridge del Módulo 11, que enrutan eventos de un bus hacia múltiples destinos según patrones de contenido (fan-out desde una sola fuente lógica, el bus), y Step Functions del Módulo 16, que orquesta flujos complejos con lógica condicional, reintentos y múltiples pasos con estado. Pipes ocupa un espacio distinto: integración punto a punto entre un origen y un destino específicos, sin la lógica de enrutamiento por patrones de una regla EventBridge, y sin el estado y la lógica condicional de una máquina de estados.

La pregunta práctica para elegir es: si tienes UN origen conocido que necesita llegar a UN destino conocido, sin lógica compleja en el medio más que quizás un filtro simple, usa Pipes. Si necesitas que un mismo evento potencialmente dispare múltiples acciones distintas según su contenido, usa una regla EventBridge. Si necesitas coordinar múltiples pasos con lógica condicional, reintentos y posibles bifurcaciones, usa Step Functions — y de hecho, Step Functions es uno de los destinos válidos de un Pipe, así que en arquitecturas reales frecuentemente se combinan: un Pipe conecta una cola con la máquina de estados que orquesta el procesamiento complejo.

**Analogía:** un Pipe es un pasillo directo entre dos oficinas específicas; una regla EventBridge es una recepcionista que redirige cada visita según de qué se trate; una Step Function es el proceso completo de trámites con varios departamentos, formularios y aprobaciones que una visita compleja podría necesitar recorrer.

**¿Por qué es importante?** Elegir la herramienta con la complejidad justa para el problema —ni más simple de lo que necesitas ni más compleja de lo necesario— es una habilidad de diseño que se vuelve más valiosa cuanto más crece tu catálogo de servicios AWS disponibles.

**Practícalo tú:**

```bash
# archivo: src/labs/modulo-26/tema-4-cuando-cada-uno.sh — ejecutar con: bash tema-4-cuando-cada-uno.sh
aws pipes describe-pipe --name demo-pipe --query 'Source'
aws events list-rules --event-bus-name demo-bus --query 'Rules[].Name' 2>&1 | head -5
aws stepfunctions list-state-machines --query 'stateMachines[].name' 2>&1 | head -5
```

**Resultado esperado:** los tres comandos muestran, lado a lado, las tres piezas: un origen fijo para el pipe punto a punto, reglas de EventBridge que enrutan por patrón desde un bus compartido, y máquinas de estado que orquestan pasos múltiples — la misma jerarquía de complejidad que acabas de leer, visible en la API real.

**Modifica esto:** dibuja (en papel o en un README) qué pieza usarías para "cuando llega un pedido nuevo, verificar inventario, cobrar, y si algo falla reintentar 3 veces" — y justifica por qué no es un simple pipe.

**Cuándo no usarlo:** no fuerces todo a pasar por Step Functions "por si acaso necesitas lógica compleja después"; empezar con un pipe simple y migrar a Step Functions cuando la complejidad real aparezca es más barato que sobre-diseñar desde el principio.

**Cómo crece tu proyecto:** El proyecto combina las tres piezas: pipes para integraciones directas, reglas EventBridge para reaccionar a eventos de negocio, y Step Functions para el flujo completo de una entrega con reintentos.

---


## Laboratorio práctico

> Este laboratorio asume que ya ejecutaste `floci start` y `eval $(floci env)` (Módulo 1) en tu sesión de terminal, así que los comandos de `aws` no repiten `--endpoint-url`.

**Objetivo del laboratorio:** crear un stream Firehose que entrega registros automáticamente a S3, y luego un pipe que conecta una cola SQS con una función Lambda sin código de polling intermedio.

**Requisitos previos:** una función Lambda de módulos anteriores lista para recibir eventos, y una cola SQS existente del Módulo 3.

### Laboratorio 26.1 — Entrega automática con Firehose

| Paso | Acción | Comando | Explicación | Salida esperada |
|---|---|---|---|---|
| 1 | Crea el stream de entrega | `aws firehose create-delivery-stream --delivery-stream-name mi-stream` | Registra el stream, listo para recibir registros | Confirmación con el ARN del stream |
| 2 | Envía varios registros | `for i in 1 2 3 4 5; do aws firehose put-record --delivery-stream-name mi-stream --record "{\"Data\": \"{\\\"id\\\": $i, \\\"evento\\\": \\\"prueba\\\"}\"}"; done` | Cada 5 registros, Floci vacía el búfer automáticamente a S3 | Un `RecordId` por cada envío |
| 3 | Verifica la entrega en S3 | `aws s3 ls s3://floci-firehose-results/ --recursive` | Confirma que los registros llegaron sin ningún consumidor propio | Al menos un archivo NDJSON |
| 4 | Inspecciona el contenido | `aws s3 cp s3://floci-firehose-results/<archivo> -` | Lee el contenido descargado | Los 5 registros JSON, uno por línea |

### Laboratorio 26.2 — Pipe de SQS a Lambda sin código intermedio

| Paso | Acción | Comando | Explicación | Salida esperada |
|---|---|---|---|---|
| 1 | Crea el pipe | `aws pipes create-pipe --name mi-pipe --source arn:aws:sqs:us-east-1:000000000000:mi-cola --target arn:aws:lambda:us-east-1:000000000000:function:mi-funcion --role-arn arn:aws:iam::000000000000:role/pipe-role` | Conecta la cola con la Lambda directamente | Estado `RUNNING` |
| 2 | Envía un mensaje a la cola de origen | `aws sqs send-message --queue-url <url-de-mi-cola> --message-body '{"tarea":"procesar"}'` | Simula el evento que debe disparar la Lambda | Confirmación de envío |
| 3 | Verifica la invocación de la Lambda | `aws logs tail /aws/lambda/mi-funcion --since 1m` | Confirma que la Lambda recibió el mensaje sin que tú escribieras ningún código de polling | Logs mostrando el evento recibido |
| 4 | Detén el pipe | `aws pipes stop-pipe --name mi-pipe` | Pausa el flujo sin eliminar la configuración | Estado `STOPPED` |

**Verificación:** el laboratorio se considera exitoso si `s3 ls` muestra al menos un archivo NDJSON en `floci-firehose-results` con los registros enviados a Firehose, y si los logs de CloudWatch de tu función Lambda muestran que recibió el mensaje enviado a la cola SQS sin que hayas escrito ningún código intermedio de lectura de la cola.

**Errores comunes y soluciones**

- **Los registros de Firehose no aparecen en S3 inmediatamente.** El vaciado ocurre cada 5 registros en Floci; si enviaste menos de 5, espera a completar el lote o revisa si hay un vaciado por tiempo configurado.
- **El pipe se crea pero la Lambda nunca se invoca.** Verifica que el estado del pipe sea `RUNNING` (no `STOPPED` ni `STOPPING`) con `describe-pipe`, y que el ARN de origen apunte exactamente a la cola donde enviaste el mensaje.
- **Confusión entre Firehose y Kinesis Data Streams.** Si necesitas leer y procesar cada registro con lógica personalizada antes de que llegue a destino, el servicio correcto es Kinesis Data Streams (Módulo 17), no Firehose — Firehose no expone un mecanismo de lectura intermedia.

---
