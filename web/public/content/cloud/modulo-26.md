# Módulo 26: Streaming e integración avanzada — Firehose y EventBridge Pipes

## Sílabo

**Objetivo general**

Completar el panorama de mensajería y streaming del curso con dos servicios de "conectar A con B sin escribir código intermedio": Amazon Data Firehose, que entrega streams de datos automáticamente a un destino como S3 sin que tengas que gestionar consumidores, y EventBridge Pipes, que conecta un origen (cola, stream) directamente a un destino (Lambda, otra cola, una máquina de estados) con enriquecimiento y filtrado opcional.

**Objetivos específicos**

1. Explicar la diferencia entre Kinesis Data Streams (Módulo 17) y Firehose: quién consume los datos y qué esfuerzo de código requiere cada uno.
2. Crear un stream de entrega Firehose y observar cómo los registros llegan automáticamente a S3.
3. Crear un pipe de EventBridge que conecte una cola SQS con una función Lambda sin código de polling intermedio.
4. Decidir correctamente cuándo usar Pipes frente a una regla EventBridge simple (Módulo 11) o una Step Function (Módulo 16).

**Contenido**

- Amazon Data Firehose: buffering, entrega automática y formato de salida.
- Firehose vs Kinesis Data Streams: quién consume los datos.
- EventBridge Pipes: fuentes, destinos y enriquecimiento opcional.
- Cuándo usar Pipes frente a reglas EventBridge o Step Functions.

**Evaluación**

Dos laboratorios prácticos (un stream Firehose que entrega a S3 automáticamente, y un pipe que conecta SQS con Lambda) y tres ejercicios de evaluación.

---

## Contenido teórico

### Tema 1: Amazon Data Firehose — entrega gestionada sin consumidores propios

**Conceptos clave:** `PutRecord`, `PutRecordBatch`, buffer en memoria, vaciado automático a S3.

Firehose resuelve un problema específico: quieres que los datos que produces lleguen automáticamente a un destino de almacenamiento o análisis —S3, en el caso más común— sin tener que escribir y operar tu propio proceso consumidor que lea, agrupe y escriba esos datos. Envías registros con `PutRecord` o, más eficientemente, en lote con `PutRecordBatch`, y Firehose se encarga del resto: los almacena en un búfer en memoria y los vacía automáticamente hacia el bucket de destino cuando se acumulan suficientes registros o pasa suficiente tiempo. En Floci, ese vaciado ocurre cada 5 registros para que tengas retroalimentación local inmediata en vez de esperar los minutos que tomaría en producción, y los datos se descargan como NDJSON (JSON delimitado por líneas nuevas) en el bucket `floci-firehose-results`.

Esta simplicidad tiene un costo: a diferencia de Kinesis Data Streams, donde tú controlas exactamente cuándo y cómo se procesa cada registro (útil para procesamiento en tiempo real con lógica personalizada), Firehose no te da ese control fino — su propósito es la entrega confiable y de bajo esfuerzo, no el procesamiento en tiempo real con lógica compleja.

**Analogía:** Firehose es como un servicio de correo que recoge tu correspondencia automáticamente de tu buzón cada cierto tiempo y la entrega en la oficina central sin que tengas que llevarla tú mismo; Kinesis Data Streams es más como tener tu propio mensajero que puede leer cada carta en el momento y decidir qué hacer con ella antes de que llegue a destino.

**¿Por qué es importante?** Elegir Firehose en vez de construir un consumidor Kinesis propio para el caso simple de "solo quiero que estos datos terminen en S3 para analizarlos después con Athena" ahorra código, operación y superficie de error — reservas la complejidad de un consumidor propio para cuando realmente necesitas lógica de procesamiento en el camino.

### Tema 2: Firehose vs Kinesis Data Streams — quién consume los datos

**Conceptos clave:** consumidor propio vs entrega gestionada, latencia de entrega, transformación en tránsito.

Ya viste Kinesis Data Streams en el Módulo 17: streams particionados con shards, donde tú escribes consumidores que leen registros con iteradores de shard y decides qué hacer con cada uno. Firehose, en cambio, no expone shards ni iteradores: no hay un "consumidor" que tú operes, porque el propio servicio actúa como consumidor gestionado que entrega hacia el destino configurado. Esta es la decisión de diseño que debes usar para elegir entre ambos: si necesitas procesamiento personalizado en tiempo real con múltiples consumidores independientes leyendo el mismo stream (fan-out), usas Kinesis Data Streams; si solo necesitas que los datos terminen de forma confiable en un destino de almacenamiento sin lógica intermedia compleja, usas Firehose.

En arquitecturas reales, ambos conviven con frecuencia: un productor escribe a un stream de Kinesis Data Streams, y Firehose se suscribe a ese mismo stream como uno de sus consumidores para garantizar que, además del procesamiento en tiempo real que hagan otros consumidores, siempre exista una copia completa y ordenada en S3 para análisis histórico.

**Analogía:** Kinesis Data Streams es una cinta transportadora donde varios trabajadores (consumidores) pueden inspeccionar cada paquete mientras pasa; Firehose es una cinta transportadora que termina automáticamente en un almacén (S3), sin trabajadores intermedios que decidan nada sobre cada paquete individual.

**¿Por qué es importante?** Esta distinción —¿necesito lógica de procesamiento en tránsito o solo entrega confiable?— es la misma pregunta de diseño que ya aplicaste al elegir entre SQS y SNS, o entre EventBridge y Step Functions: reconocer el patrón general de "¿cuánto control necesito realmente?" te ahorra sobre-ingeniería.

### Tema 3: EventBridge Pipes — conectar origen y destino sin código de pegamento

**Conceptos clave:** `CreatePipe`, origen, destino, enriquecimiento opcional.

EventBridge Pipes resuelve un problema de "código de pegamento" muy común: tienes una cola SQS y quieres que cada mensaje dispare una función Lambda, o tienes un stream de Kinesis y quieres que sus registros lleguen a una máquina de estados de Step Functions. La forma tradicional de hacer esto sería escribir una Lambda intermedia que haga polling de la cola y llame al destino — código que tú tienes que escribir, desplegar y mantener solo para mover datos de un lado a otro. Un pipe (`CreatePipe`) elimina ese código intermedio: declaras el origen (una cola SQS, un stream de Kinesis o DynamoDB, o un topic de Kafka/MSK) y el destino (una función Lambda, otra cola, un topic SNS, un stream Kinesis o una máquina de estados), y EventBridge se encarga de mover los datos entre ambos, con la opción de aplicar filtrado o una transformación de enriquecimiento en el camino.

Un pipe tiene un ciclo de vida propio: se crea en estado `STARTING`, pasa a `RUNNING` cuando está activo, y puedes detenerlo (`StopPipe`) sin eliminarlo si necesitas pausar temporalmente el flujo de datos, reanudándolo después con `StartPipe`.

**Analogía:** un pipe es como una tubería física instalada directamente entre dos tanques de agua: antes tenías que llenar baldes en un tanque y vaciarlos manualmente en el otro (tu código de pegamento); ahora el agua fluye sola por la tubería, y solo intervienes si quieres filtrar impurezas en el camino (el enriquecimiento opcional).

**¿Por qué es importante?** Cada línea de código de pegamento que no tienes que escribir es una línea que no puede tener bugs, no necesita pruebas, y no necesita mantenimiento; Pipes es el ejemplo más directo en este curso de cómo AWS moderno favorece la configuración declarativa sobre código intermedio cuando el caso de uso es simple.

### Tema 4: Cuándo usar Pipes frente a reglas EventBridge o Step Functions

**Conceptos clave:** integración punto a punto vs enrutamiento por patrones vs orquestación con estado.

Ya conoces dos primos cercanos de Pipes: las reglas EventBridge del Módulo 11, que enrutan eventos de un bus hacia múltiples destinos según patrones de contenido (fan-out desde una sola fuente lógica, el bus), y Step Functions del Módulo 16, que orquesta flujos complejos con lógica condicional, reintentos y múltiples pasos con estado. Pipes ocupa un espacio distinto: integración punto a punto entre un origen y un destino específicos, sin la lógica de enrutamiento por patrones de una regla EventBridge, y sin el estado y la lógica condicional de una máquina de estados.

La pregunta práctica para elegir es: si tienes UN origen conocido que necesita llegar a UN destino conocido, sin lógica compleja en el medio más que quizás un filtro simple, usa Pipes. Si necesitas que un mismo evento potencialmente dispare múltiples acciones distintas según su contenido, usa una regla EventBridge. Si necesitas coordinar múltiples pasos con lógica condicional, reintentos y posibles bifurcaciones, usa Step Functions — y de hecho, Step Functions es uno de los destinos válidos de un Pipe, así que en arquitecturas reales frecuentemente se combinan: un Pipe conecta una cola con la máquina de estados que orquesta el procesamiento complejo.

**Analogía:** un Pipe es un pasillo directo entre dos oficinas específicas; una regla EventBridge es una recepcionista que redirige cada visita según de qué se trate; una Step Function es el proceso completo de trámites con varios departamentos, formularios y aprobaciones que una visita compleja podría necesitar recorrer.

**¿Por qué es importante?** Elegir la herramienta con la complejidad justa para el problema —ni más simple de lo que necesitas ni más compleja de lo necesario— es una habilidad de diseño que se vuelve más valiosa cuanto más crece tu catálogo de servicios AWS disponibles.

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

## Ejercicios de evaluación

### Ejercicio 1: Firehose vs consumidor Kinesis propio

**Enunciado:** tienes un caso de uso donde solo necesitas que los eventos de clics de tu aplicación terminen en S3 para analizarlos después con Athena, sin ninguna lógica de procesamiento en tiempo real. Justifica si usarías Firehose o construirías un consumidor Kinesis Data Streams propio, y qué complejidad te ahorra la opción elegida.

**Solución esperada:** Firehose es la opción correcta — no necesitas lógica de procesamiento en tránsito, solo entrega confiable a S3. Construir un consumidor Kinesis propio significaría escribir, desplegar y operar código adicional (una Lambda o un proceso que haga polling de shards) sin ningún beneficio funcional para este caso de uso específico.

**Criterios de éxito:**
- La justificación se basa en la ausencia de necesidad de procesamiento en tránsito, no en preferencia arbitraria.
- Reconoce explícitamente qué código y operación se ahorra al elegir Firehose.

### Ejercicio 2: Diseña un pipe con filtrado

**Enunciado:** documenta cómo configurarías un pipe que solo invoque la Lambda destino cuando el mensaje de la cola SQS de origen contenga el campo `"prioridad": "alta"`, dejando pasar los demás mensajes sin disparar la Lambda.

**Solución esperada:** al crear o actualizar el pipe, se configura un criterio de filtrado (`FilterCriteria`) sobre el origen, especificando un patrón que solo coincide con mensajes donde el campo `prioridad` sea `"alta"`; los mensajes que no cumplan el patrón se descartan del flujo hacia el destino sin invocar la Lambda.

**Criterios de éxito:**
- Identifica correctamente que el filtrado se aplica sobre el origen antes de llegar al destino, no dentro del código de la Lambda.
- El patrón de filtro propuesto coincide específicamente con el campo y valor solicitados.

### Ejercicio 3: Elige la herramienta correcta para tres escenarios

**Enunciado:** para cada escenario, decide si usarías un Pipe, una regla EventBridge, o una Step Function, y justifica: (a) conectar una cola SQS directamente a una única Lambda de procesamiento; (b) un evento de "pedido creado" que debe disparar simultáneamente una notificación por email, una actualización de inventario y un registro de auditoría; (c) un proceso de aprobación de crédito con varios pasos condicionales, reintentos y posible intervención humana.

**Solución esperada:** (a) Pipe — origen y destino únicos y conocidos; (b) regla EventBridge — un evento debe enrutarse hacia múltiples destinos independientes según su tipo; (c) Step Functions — lógica condicional, reintentos y orquestación de múltiples pasos con estado.

**Criterios de éxito:**
- Las tres elecciones son correctas y justificadas con el criterio de complejidad apropiada, no solo "porque sí".
- Reconoce que estos tres servicios no son mutuamente excluyentes y pueden combinarse en una arquitectura real.

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

En este módulo completaste el panorama de mensajería y streaming del curso con dos servicios de integración de bajo código: Amazon Data Firehose, que entrega streams de datos automáticamente a S3 sin que operes un consumidor propio, y EventBridge Pipes, que conecta un origen y un destino directamente sin código de pegamento intermedio. Más allá de los comandos específicos, el valor de este módulo es afinar tu criterio de diseño: reconocer cuándo un problema de integración es lo suficientemente simple para resolverse declarativamente con Firehose o Pipes, y cuándo realmente necesitas el poder de Kinesis Data Streams, una regla EventBridge con enrutamiento por patrones, o una Step Function con orquestación de estado.
