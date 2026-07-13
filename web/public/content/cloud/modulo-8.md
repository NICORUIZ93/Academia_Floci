# Módulo 8: Azure y GCP con Floci

## Sílabo

**Objetivo general**

Repetir los patrones de almacenamiento y mensajería ya dominados en AWS, ahora en Azure (con floci-az) y GCP (con floci-gcp), consolidando la idea de que los conceptos de nube se transfieren entre proveedores aunque cambien los nombres.

**Objetivos específicos**

1. Levantar floci-az y operar Blob Storage y Queue Storage.
2. Levantar floci-gcp y operar Cloud Storage y Pub/Sub.
3. Explicar las diferencias y similitudes entre Cosmos DB, Firestore y DynamoDB.
4. Construir una tabla comparativa de los tres proveedores para un mismo caso de uso.
5. Justificar cuándo elegir un proveedor u otro según el servicio y el contexto.

**Contenido**

- floci-az: Blob Storage, Queue Storage, Table Storage, Cosmos DB, Functions.
- floci-gcp: Cloud Storage, Pub/Sub, Firestore, Cloud Functions.
- Comparativa AWS vs Azure vs GCP por categoría de servicio.

**Evaluación**

Dos laboratorios (uno por proveedor) y tres ejercicios de evaluación sobre equivalencias de servicios y criterios de elección entre proveedores.

---

## Contenido teórico

### Tema 1: floci-az — Blob Storage, Queue Storage, Table Storage, Cosmos DB, Functions

**Conceptos clave:** cuenta de almacenamiento, contenedor Blob, Queue Storage, Table Storage, Cosmos DB, Azure Functions.

Azure organiza sus servicios de almacenamiento bajo el paraguas de una "cuenta de almacenamiento" (storage account), un contenedor de nivel superior que agrupa varios tipos de almacenamiento relacionados pero distintos: Blob Storage para objetos binarios (el equivalente directo a S3), Queue Storage para colas de mensajes simples (el equivalente más cercano a SQS Standard, aunque con menos funcionalidades avanzadas como las DLQ nativas que viste en el Módulo 3), y Table Storage para datos NoSQL simples de clave-valor con un modelo más limitado que Cosmos DB.

Blob Storage organiza sus datos en contenedores (containers), el equivalente conceptual a un bucket de S3, y dentro de cada contenedor los archivos se llaman blobs, el equivalente a un objeto de S3. La lógica de nomenclatura plana que viste en el Módulo 2 —sin carpetas reales, solo claves que simulan una jerarquía visualmente— aplica de la misma forma en Blob Storage. Existen tres tipos de blob (block blob para archivos generales, append blob para escritura incremental tipo log, y page blob para acceso aleatorio de lectura/escritura, usado típicamente por discos de máquinas virtuales), aunque para el propósito de este módulo trabajarás únicamente con block blobs, el tipo más común y el análogo directo a un objeto S3 estándar.

Cosmos DB es el servicio de base de datos NoSQL insignia de Azure, y es notablemente más versátil que DynamoDB en un aspecto concreto: soporta múltiples modelos de API sobre el mismo motor subyacente, incluyendo una API de documentos (similar en espíritu a MongoDB), una API de clave-valor (similar a DynamoDB), y una API de grafos, entre otras. Para mantener el paralelismo más directo con lo que aprendiste en el Módulo 4, este módulo trabaja con Cosmos DB usando su modelo de datos más cercano al de DynamoDB: contenedores con items identificados por una clave de partición.

Azure Functions es el servicio serverless equivalente a Lambda: funciones que se ejecutan en respuesta a eventos (un archivo subido a Blob Storage, un mensaje en Queue Storage, una petición HTTP) sin gestión manual de servidores, con un modelo de programación de handler y evento de entrada conceptualmente equivalente al que ya conoces de Lambda en el Módulo 5, aunque con diferencias de sintaxis y de configuración específicas de la plataforma Azure.

**Analogía:** si ya sabes usar S3, SQS, DynamoDB y Lambda, aprender Blob Storage, Queue Storage, Cosmos DB y Azure Functions es como aprender a conducir un coche de una marca distinta después de haber aprendido con otra: el volante, los pedales y las señales de tráfico (los conceptos: objeto, cola, base de datos NoSQL, función serverless) son los mismos; lo que cambia es la disposición exacta de algunos controles y el nombre que el fabricante le pone a cada pieza.

**¿Por qué es importante?** Practicar en Azure inmediatamente después de dominar los conceptos equivalentes en AWS es la forma más eficiente de confirmar que realmente entendiste los conceptos subyacentes (almacenamiento de objetos, colas, NoSQL, serverless) y no solo memorizaste comandos específicos de una CLI. Si te cuesta trabajo reconocer el mismo patrón en Azure, es una señal de que vale la pena repasar el concepto original en AWS antes de continuar.

**Diagrama:**

```
AWS                    Azure (floci-az)
┌──────────────┐      ┌──────────────────┐
│ S3             │ ──▶  │ Blob Storage        │
│ SQS            │ ──▶  │ Queue Storage       │
│ DynamoDB       │ ──▶  │ Cosmos DB           │
│ Lambda         │ ──▶  │ Azure Functions     │
└──────────────┘      └──────────────────┘
```

### Tema 2: floci-gcp — Cloud Storage, Pub/Sub, Firestore, Cloud Functions

**Conceptos clave:** bucket de Cloud Storage, topic y suscripción de Pub/Sub, colección y documento de Firestore, Cloud Functions.

Google Cloud Storage es, de los tres equivalentes de almacenamiento de objetos que vas a ver en este módulo, el que más se parece conceptualmente a S3: organiza sus datos en buckets con nombre único, y dentro de cada bucket los archivos se identifican por una clave de objeto, siguiendo exactamente el mismo modelo plano sin carpetas reales que ya conoces. La terminología incluso coincide casi palabra por palabra con S3 en muchos comandos de su CLI (`gcloud storage`).

Pub/Sub es el servicio de mensajería de GCP, y su modelo es ligeramente distinto al de SQS: en vez de una cola de la que un consumidor extrae mensajes directamente, Pub/Sub se organiza alrededor de un topic (donde los productores publican mensajes) y una o varias suscripciones (subscriptions) sobre ese topic, cada una de las cuales recibe una copia independiente de cada mensaje publicado. Esto significa que Pub/Sub, de forma nativa, se parece más al patrón fan-out que vas a estudiar en detalle en un módulo avanzado con SNS y EventBridge, que a una cola SQS simple: un mismo mensaje publicado en un topic puede ser recibido por múltiples suscripciones independientes, cada una consumiéndolo a su propio ritmo, mientras que en SQS un mensaje es consumido una sola vez de la cola (a menos que uses el patrón SNS+SQS explícitamente para lograr ese mismo efecto de fan-out).

Firestore es la base de datos NoSQL de documentos de Google Cloud, organizada en colecciones (collections) que contienen documentos (documents), cada uno identificado por un ID único dentro de su colección. A diferencia de DynamoDB, donde defines explícitamente el esquema de la clave primaria al crear la tabla, Firestore no requiere definir de antemano ni siquiera esa estructura mínima: los documentos dentro de una colección pueden tener estructuras completamente distintas entre sí sin ninguna declaración previa, llevando la flexibilidad de esquema de NoSQL, que ya viste con DynamoDB, un paso más allá.

Cloud Functions completa el paralelo serverless: funciones que reaccionan a eventos de Cloud Storage, mensajes de Pub/Sub, o peticiones HTTP, con el mismo modelo conceptual de handler y evento de entrada que Lambda y Azure Functions, adaptado a las convenciones específicas de GCP.

**Analogía:** si Blob Storage de Azure es como aprender a conducir un coche de otra marca con los mismos controles, Pub/Sub de GCP introduce una variación real de comportamiento, no solo de nombre: es como pasar de un sistema de reparto de correo a un sistema de radiodifusión, donde un mismo mensaje transmitido llega simultáneamente a todos los receptores sintonizados (suscripciones), en vez de a un único destinatario que lo retira del buzón.

**¿Por qué es importante?** Notar que Pub/Sub no es un calco exacto de SQS —sino que se parece más a un patrón de fan-out nativo— es precisamente el tipo de matiz que separa una comparación superficial de nombres de una comprensión real de los patrones de mensajería en la nube. Vas a explorar este mismo patrón de fan-out con SNS y EventBridge en un módulo avanzado posterior a este track, y reconocerlo ya presente aquí, en Pub/Sub, refuerza esa idea de patrones que se repiten entre proveedores con implementaciones distintas.

**Diagrama:**

```
AWS                    GCP (floci-gcp)
┌──────────────┐      ┌──────────────────┐
│ S3             │ ──▶  │ Cloud Storage       │
│ SQS            │ ~~▶  │ Pub/Sub (más parecido│
│                │      │  a un patrón fan-out) │
│ DynamoDB       │ ──▶  │ Firestore           │
│ Lambda         │ ──▶  │ Cloud Functions     │
└──────────────┘      └──────────────────┘
```

### Tema 3: Comparativa AWS vs Azure vs GCP por categoría de servicio

**Conceptos clave:** equivalencia funcional, diferencias de modelo, criterios de elección de proveedor.

Aunque los tres proveedores resuelven los mismos problemas fundamentales —almacenamiento de objetos, mensajería, bases de datos NoSQL, cómputo serverless—, las diferencias de modelo que viste en los dos temas anteriores importan a la hora de diseñar un sistema real. En almacenamiento de objetos, los tres (S3, Blob Storage, Cloud Storage) son suficientemente equivalentes en concepto y comportamiento como para que la elección dependa casi enteramente de en qué proveedor ya está el resto de tu infraestructura, más que de una diferencia funcional decisiva entre ellos.

En mensajería, la elección tiene más matices reales: SQS es la opción más simple para el patrón clásico de "una cola, un grupo de consumidores que compiten por los mensajes", con soporte nativo para DLQ y colas FIFO como viste en el Módulo 3. Pub/Sub de GCP, al estar diseñado nativamente alrededor de topics y múltiples suscripciones independientes, es una elección más directa cuando tu caso de uso ya es, desde el diseño, un patrón de fan-out (un evento que interesa a varios consumidores distintos de forma independiente). Queue Storage de Azure es funcionalmente más básico que ambos, careciendo de algunas de las funcionalidades avanzadas nativas que SQS sí ofrece, aunque Azure resuelve casos de uso más complejos de mensajería con un servicio adicional distinto (Service Bus), que no se cubre en este curso introductorio.

En bases de datos NoSQL, DynamoDB exige definir explícitamente el esquema de la clave primaria desde la creación de la tabla, mientras que Firestore no exige ninguna declaración de esquema previo incluso para su clave de documento, y Cosmos DB ofrece la flexibilidad adicional de soportar múltiples modelos de API sobre el mismo servicio subyacente, incluyendo un modelo de grafos que ni DynamoDB ni Firestore ofrecen de forma nativa. Elegir entre ellas depende de si necesitas esa flexibilidad de modelo (Cosmos DB), la máxima simplicidad de esquema (Firestore), o la integración más profunda con el resto del ecosistema AWS si ya trabajas ahí (DynamoDB).

En cómputo serverless, Lambda, Azure Functions y Cloud Functions son funcionalmente muy similares entre sí en su propuesta de valor central (ejecutar código sin gestionar servidores, pagar por invocación), y la elección entre ellos suele depender más de en qué proveedor viven ya los servicios con los que esa función necesita integrarse (el mismo almacenamiento, la misma base de datos, la misma mensajería) que de una diferencia funcional decisiva entre los tres servicios de cómputo en sí mismos.

**Analogía:** comparar estos tres proveedores es como comparar tres cadenas de supermercados distintas que venden, en esencia, los mismos productos básicos (pan, leche, verduras), pero cada una con su propia disposición de pasillos, sus propias marcas propias, y algunas especialidades exclusivas de cada cadena (una tiene mejor sección de productos importados, otra tiene mejor panadería propia). Para la compra básica del día a día, cualquiera de las tres sirve igual de bien; la elección real depende de qué necesitas específicamente y de cuál está más cerca de donde ya haces el resto de tus compras.

**¿Por qué es importante?** Ser capaz de razonar sobre estas diferencias de matiz —no solo memorizar qué servicio de un proveedor "equivale" a cuál de otro— es exactamente la habilidad que distingue a alguien que realmente entiende los patrones de la nube de alguien que solo conoce los comandos de un proveedor específico. Esta habilidad es la que te permite, en un trabajo real, adaptarte rápidamente si tu empleador usa un proveedor distinto al que aprendiste primero, o si un proyecto requiere trabajar con más de uno a la vez.

**Diagrama:**

```
Categoría          AWS              Azure               GCP
────────────────────────────────────────────────────────────────
Almacenamiento      S3               Blob Storage         Cloud Storage
                     (equivalencia funcional muy directa entre los tres)

Mensajería           SQS              Queue Storage        Pub/Sub
                     (cola simple)    (más básico)          (fan-out nativo,
                                                              distinto de SQS)

Base de datos        DynamoDB         Cosmos DB            Firestore
NoSQL                (esquema de      (multi-modelo,       (sin esquema de
                      clave explícito) más flexible)        clave, más simple)

Serverless           Lambda           Azure Functions      Cloud Functions
                     (muy similares entre los tres en propuesta de valor central)
```

---

## Laboratorio práctico

**Objetivo del laboratorio:** subir y descargar un archivo en Blob Storage (Azure) y en Cloud Storage (GCP), crear una cola en Azure y un topic con suscripción en GCP, y documentar el mismo caso de uso resuelto en los tres proveedores.

**Requisitos previos:** floci-az y floci-gcp corriendo (imágenes separadas de Floci, como viste en el Módulo 0), CLI de Azure (`az`) y de GCP (`gcloud`) instaladas y configuradas para apuntar a los endpoints locales de floci-az y floci-gcp respectivamente.

### Laboratorio 8.1 — Azure: Blob Storage y Queue Storage

| Paso | Acción | Comando | Explicación | Salida esperada |
|---|---|---|---|---|
| 1 | Levantar floci-az | `docker run -d -p 10000:10000 -p 10001:10001 -p 10002:10002 floci/floci-az:latest` | Expone los puertos estándar de emulación de almacenamiento Azure (Blob, Queue, Table) | El contenedor aparece corriendo con `docker ps` |
| 2 | Crear un contenedor Blob | `az storage container create --name mi-contenedor --connection-string "<cadena-de-conexion-local>"` | Crea el equivalente a un bucket de S3 dentro de Blob Storage | `{"created": true}` |
| 3 | Subir un blob | `az storage blob upload --container-name mi-contenedor --file hola.txt --name hola.txt --connection-string "<cadena-de-conexion-local>"` | Sube el mismo archivo `hola.txt` que usaste en el Módulo 2 con S3 | Confirmación de subida sin errores |
| 4 | Descargar el blob | `az storage blob download --container-name mi-contenedor --name hola.txt --file hola-descargado-azure.txt --connection-string "<cadena-de-conexion-local>"` | Confirma el ciclo completo de subida y descarga, igual que hiciste con S3 | El contenido descargado coincide con el original |
| 5 | Crear una cola Queue Storage | `az storage queue create --name mi-cola-azure --connection-string "<cadena-de-conexion-local>"` | Crea el equivalente más cercano a una cola SQS Standard | Confirmación de creación |

### Laboratorio 8.2 — GCP: Cloud Storage y Pub/Sub

| Paso | Acción | Comando | Explicación | Salida esperada |
|---|---|---|---|---|
| 1 | Levantar floci-gcp | `docker run -d -p 4443:4443 -p 8085:8085 -p 8080:8080 floci/floci-gcp:latest` | Expone los puertos estándar de emulación de Cloud Storage, Pub/Sub y Firestore | El contenedor aparece corriendo con `docker ps` |
| 2 | Crear un bucket | `gcloud storage buckets create gs://mi-bucket-gcp --project mi-proyecto-local` | Crea el equivalente directo a un bucket de S3 | Confirmación de creación del bucket |
| 3 | Subir un archivo | `gcloud storage cp hola.txt gs://mi-bucket-gcp/` | Sube el mismo archivo de prueba a Cloud Storage | Confirmación de la subida |
| 4 | Crear un topic Pub/Sub | `gcloud pubsub topics create mi-topic --project mi-proyecto-local` | Crea el canal de publicación al que se enviarán mensajes | Confirmación de creación del topic |
| 5 | Crear una suscripción sobre ese topic | `gcloud pubsub subscriptions create mi-suscripcion --topic mi-topic --project mi-proyecto-local` | Crea el punto de recepción independiente que va a recibir copia de cada mensaje publicado en el topic | Confirmación de creación de la suscripción |
| 6 | Publicar un mensaje | `gcloud pubsub topics publish mi-topic --message "Hola desde GCP" --project mi-proyecto-local` | Envía un mensaje al topic; cualquier suscripción activa recibirá una copia | Un JSON con el `messageIds` del mensaje publicado |
| 7 | Confirmar la recepción del mensaje | `gcloud pubsub subscriptions pull mi-suscripcion --auto-ack --project mi-proyecto-local` | Extrae el mensaje de la suscripción y lo confirma automáticamente (`--auto-ack`) | El texto `Hola desde GCP` aparece en la respuesta |

**Verificación:** el laboratorio se considera exitoso si tanto el archivo subido a Blob Storage como el subido a Cloud Storage se descargan correctamente con el contenido original intacto, y si el mensaje publicado en el topic de Pub/Sub se recibe correctamente en la suscripción creada.

**Errores comunes y soluciones**

- **`az` no reconoce la cadena de conexión local.** Verifica que la cadena de conexión apunta explícitamente a los puertos locales de floci-az (10000-10002), no a una cuenta de Azure real; una cadena de conexión de Azure real y una apuntando a un emulador local tienen un formato similar pero con el host y los puertos claramente distintos.
- **`gcloud` intenta autenticarse contra Google Cloud real en vez de contra floci-gcp.** Asegúrate de configurar la variable de entorno del emulador correspondiente a cada servicio (por ejemplo, `STORAGE_EMULATOR_HOST` para Cloud Storage, `PUBSUB_EMULATOR_HOST` para Pub/Sub) antes de ejecutar cualquier comando de `gcloud` contra floci-gcp.
- **La suscripción de Pub/Sub no recibe ningún mensaje.** Confirma que la suscripción se creó sobre el mismo topic exacto donde publicaste el mensaje, y recuerda que una suscripción creada después de publicar un mensaje no recibe retroactivamente mensajes publicados antes de su creación (a menos que el topic tenga retención de mensajes configurada, un detalle avanzado fuera del alcance de este módulo).
- **Confundir el orden de creación en Pub/Sub.** A diferencia de SQS, donde solo existe la cola, en Pub/Sub necesitas crear primero el topic y después, por separado, al menos una suscripción sobre ese topic antes de que cualquier mensaje publicado tenga a dónde llegar de forma recuperable.

---

## Ejercicios de evaluación

### Ejercicio 1: Completar la tabla comparativa

**Enunciado:** sin mirar el Tema 3, completa de memoria esta tabla con el servicio equivalente de cada proveedor:

| Categoría | AWS | Azure | GCP |
|---|---|---|---|
| Almacenamiento de objetos | S3 | ? | ? |
| Mensajería | SQS | ? | ? |
| Base de datos NoSQL | DynamoDB | ? | ? |
| Serverless | Lambda | ? | ? |

**Solución esperada:**

| Categoría | AWS | Azure | GCP |
|---|---|---|---|
| Almacenamiento de objetos | S3 | Blob Storage | Cloud Storage |
| Mensajería | SQS | Queue Storage | Pub/Sub |
| Base de datos NoSQL | DynamoDB | Cosmos DB | Firestore |
| Serverless | Lambda | Azure Functions | Cloud Functions |

**Criterios de éxito:**
- Las ocho celdas completadas coinciden con la tabla de solución.
- Puedes explicar, sin mirar la tabla, por qué Pub/Sub no es un calco exacto de SQS (conectándolo con el Tema 2).

### Ejercicio 2: Elegir el servicio de mensajería correcto

**Enunciado:** estás diseñando un sistema donde un evento (por ejemplo, "pedido confirmado") debe procesarse de forma completamente independiente por tres sistemas distintos a la vez: uno que envía un correo de confirmación, otro que actualiza el inventario, y otro que genera una factura. ¿Usarías SQS, Queue Storage o Pub/Sub como base de este diseño, y por qué?

**Solución esperada:** Pub/Sub es la elección más directa, porque su modelo nativo de un topic con múltiples suscripciones independientes encaja exactamente con la necesidad de que tres sistemas distintos reciban y procesen, cada uno por su cuenta, una copia independiente del mismo evento. Replicar este mismo comportamiento con SQS requeriría combinarlo con un servicio adicional de fan-out (como SNS, que vas a ver en un módulo avanzado), mientras que Pub/Sub lo resuelve de forma nativa sin necesidad de un segundo servicio.

**Criterios de éxito:**
- Elige Pub/Sub como la opción más directa para este caso de uso.
- La justificación menciona explícitamente el modelo de topic con múltiples suscripciones independientes, conectándolo con el Tema 2 y el Tema 3.

### Ejercicio 3: Justificar la elección de proveedor por contexto

**Enunciado:** una empresa ya tiene toda su infraestructura de backend corriendo en AWS (Lambda, DynamoDB, S3), y necesita añadir una nueva función que procese archivos subidos por usuarios. ¿Recomendarías introducir Azure Functions y Blob Storage para esta nueva funcionalidad, o usar Lambda y S3? Justifica tu respuesta usando el criterio del Tema 3.

**Solución esperada:** usar Lambda y S3, manteniendo la nueva funcionalidad dentro del mismo proveedor donde ya vive el resto de la infraestructura. Como se explica en el Tema 3, cuando la equivalencia funcional entre proveedores es alta (como en almacenamiento de objetos y serverless), la elección debería basarse principalmente en la integración con lo que ya existe, no en una ventaja funcional decisiva de un proveedor sobre otro para este caso concreto; introducir un segundo proveedor añadiría complejidad operativa (gestión de credenciales adicionales, curva de aprendizaje del equipo, monitorización distribuida entre dos nubes) sin un beneficio claro que lo justifique.

**Criterios de éxito:**
- Recomienda mantenerse en AWS (Lambda y S3), no introducir Azure sin justificación.
- La justificación se basa en la integración con la infraestructura existente y el coste de complejidad de introducir un segundo proveedor, no en una supuesta superioridad técnica de un servicio sobre otro.

---

## Resumen del módulo

**Puntos clave**

- floci-az emula Blob Storage, Queue Storage, Table Storage, Cosmos DB y Azure Functions, con equivalencias directas a S3, SQS, DynamoDB y Lambda respectivamente.
- floci-gcp emula Cloud Storage, Pub/Sub, Firestore y Cloud Functions; Pub/Sub, en particular, tiene un modelo de topic y múltiples suscripciones más parecido a un patrón fan-out que a una cola SQS simple.
- El almacenamiento de objetos y el cómputo serverless tienen equivalencia funcional muy directa entre los tres proveedores; la mensajería y las bases de datos NoSQL tienen diferencias de modelo más relevantes que conviene entender antes de elegir.
- La elección de proveedor en un caso real depende principalmente de la integración con la infraestructura existente, y solo en segundo lugar de diferencias funcionales específicas entre servicios equivalentes.

**Conceptos aprendidos**

- Los servicios equivalentes de Azure (Blob Storage, Queue Storage, Cosmos DB, Azure Functions) frente a sus contrapartes de AWS.
- Los servicios equivalentes de GCP (Cloud Storage, Pub/Sub, Firestore, Cloud Functions) frente a sus contrapartes de AWS.
- Las diferencias de modelo entre SQS y Pub/Sub, y entre DynamoDB, Cosmos DB y Firestore.
- Criterios prácticos para elegir un proveedor u otro en un contexto real.

**Próximos pasos**

En el Módulo 9, el proyecto final del curso, vas a integrar S3, SQS, DynamoDB, Lambda, API Gateway e IAM en un solo Sistema de Gestión de Tareas, usando exclusivamente AWS (a través de Floci) para consolidar en un proyecto real todo lo aprendido en los módulos 1 a 7.

**Recursos adicionales**

- Documentación oficial de Azure Blob Storage, Queue Storage y Cosmos DB.
- Documentación oficial de Google Cloud Storage, Pub/Sub y Firestore.
- Comparativas oficiales de servicios entre AWS, Azure y GCP publicadas por cada proveedor y por analistas independientes de la industria.
