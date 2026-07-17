# AWS IoT Núcleo

El servicio IoT de Floci emula el plano de control central AWS IoT, las API de sombra de datos IoT y el comportamiento del plano de datos MQTT utilizado por el dispositivo local y las pruebas SDK.

## Cobertura MVP 1

Estado: completo para el segmento del emulador local.

Comportamiento MVP 1 admitido:

- Cosa CRUD con `CreateThing` idéntico e idempotente, semántica de conflicto duplicado, `UpdateThing.expectedVersion` y paginación de listas.
- Conceptos básicos de certificados: `CreateKeysAndCertificate`, `CreateCertificateFromCsr`, `DescribeCertificate`, `ListCertificates`, `UpdateCertificate` y `DeleteCertificate` con restricciones de eliminación activas/adjuntas.
- Conceptos básicos de políticas: `CreatePolicy`, `GetPolicy`, `ListPolicies`, `DeletePolicy`, ciclo de vida de la versión de políticas, `AttachPolicy`, `DetachPolicy`, `ListAttachedPolicies` y `ListTargetsForPolicy`.
- Conceptos básicos principales de las cosas: `AttachThingPrincipal`, `DetachThingPrincipal`, `ListThingPrincipals` y `ListPrincipalThings`.
- Etiquetas para cosas, certificados, políticas y reglas de temas.
- Mensajes de datos retenidos de IoT: `Publish` retenidos, `GetRetainedMessage` y `ListRetainedMessages` paginados.
- Comportamiento de eliminación nula y conflicto de versiones para HTTP y rutas de servicios compartidos.
- Semántica de duplicación/eliminación/reemplazo de reglas de tema, además de envío de acciones `republish`, `sqs`, `sns`, `s3`, `dynamoDBv2`, `kinesis` y `lambda`.

Limitaciones actuales de MVP 1:

- El manejo de certificados CSR crea certificados locales del emulador; no realiza firma CA real.
- La autenticación MQTT sigue siendo permisiva; Los recursos de certificados y políticas están modelados para compatibilidad de aprovisionamiento, pero aún no se aplican como autorización de intermediario.
- Las reglas admiten únicamente la extracción de filtros de temas básicos y el envío de acciones; La proyección SQL, la evaluación WHERE, las sustituciones y las acciones de error siguen siendo alcance de seguimiento.

## Cobertura MVP 2

Estado: implementado para el segmento de compatibilidad actual SDK.

Comportamiento soportado de MVP 2:

- Tipos de cosas: `CreateThingType`, `DescribeThingType`, `ListThingTypes`, `UpdateThingType`, `DeprecateThingType` y `DeleteThingType` con asociación `CreateThing` escrita y protección contra eliminación en uso.
- Grupos de cosas estáticas: `CreateThingGroup`, `DescribeThingGroup`, `ListThingGroups`, `UpdateThingGroup`, `DeleteThingGroup`, `AddThingToThingGroup`, `RemoveThingFromThingGroup`, `ListThingsInThingGroup` y `ListThingGroupsForThing`.
- Plano de control de trabajos: `CreateJob`, `DescribeJob` y `ListJobs`, incluidos objetivos de objetos ARN y objetivos de grupos de objetos estáticos.
- Plano de datos de trabajos: listado de trabajos pendientes, `StartNextPendingJobExecution`, `DescribeJobExecution` y `UpdateJobExecution` con conflictos de versión y comprobaciones de estado terminal.
- El descubrimiento de puntos finales acepta `iot:Jobs` además de los tipos de puntos finales de datos IoT.
- Los clientes MQTT pueden usar rutas de suscripción/publicación QoS 1 con broker PUBACK y comportamiento de entrega.
- API de conexión de datos IoT para sesiones MQTT en vivo: `GetConnection`, `DeleteConnection`, `ListSubscriptions` y `SendDirectMessage`.
- `DeleteConnection` cierra las sesiones activas del cliente MQTT a través del intermediario integrado y, opcionalmente, purga el estado de la sesión del intermediario para `cleanSession=true`.
- Las reglas IoT pueden enviar cargas útiles coincidentes a los objetivos de republicación SQS, SNS, S3, DynamoDB v2, Kinesis, Lambda y MQTT.

Limitaciones actuales de MVP 2:

- Se acepta `DeleteConnection.preventWillMessage` para la compatibilidad de solicitudes de SDK, pero el agente integrado no expone la supresión selectiva de última voluntad.
- Datos de HTTP IoT `Publish` todavía trata los metadatos de QoS y MQTT5 solo como entradas de compatibilidad; esas propiedades aún no se han reenviado ni persistido por completo.
- `SendDirectMessage` publica en el tema MQTT solicitado a través del intermediario integrado. A diferencia de AWS IoT Core, aún no omite la coincidencia de suscripciones para entregar a un cliente que no está suscrito a ese tema.
- `GetConnection` y `ListSubscriptions` informan únicamente del estado del broker en memoria en vivo; Los informes de suscripción a sesiones persistentes sin conexión aún no están modelados.
- Los temas de Jobs reservados MQTT siguen siendo alcance de seguimiento; Las API Jobs Data HTTP se implementan primero.
- Los grupos de objetos dinámicos, la indexación de flotas, las implementaciones y cancelaciones de trabajos, los documentos de S3 y la programación avanzada de trabajos aún no están modelados.

## Agente MQTT

Estado: completo.

Floci utiliza Vert.x MQTT como servidor de protocolo MQTT integrado. `IotMqttBrokerService` posee el ciclo de vida del broker, el registro de sesiones en vivo, el registro de suscripciones, la distribución MQTT y el puente hacia el comportamiento del servicio IoT.

Alcance del corredor:

- Dirigirse a clientes MQTT de estilo AWS IoT/dispositivo SDK reales, no solo pruebas de paquetes artesanales.
- Admite el manejo MQTT v3 y MQTT 5 CONNECT utilizado por las pruebas de compatibilidad locales.
- Admite el comportamiento de publicación/suscripción de QoS 0 y QoS 1 para el segmento local AWS IoT.
- Mantenga MQTT solo en texto plano para esta fase; TLS y mTLS están fuera de alcance.
- Mantenga la autorización MQTT permisiva por ahora, pero deje espacio para un certificado IoT y un autorizador de políticas conectables más adelante.
- Mantenga el registro del corredor MQTT al mínimo.
- Validar las pruebas de compatibilidad pertinentes de IoT contra el binario nativo antes de considerar completa la fase.

## Temas reservados

Los temas reservados AWS IoT, como `$aws/things/{thingName}/shadow/update`, son temas de control de servicios, no temas de aplicaciones comunes. Floci debe manejar estas publicaciones invocando el comportamiento de sombra de IoT y luego publicando los temas de respuesta compatibles con AWS a través del intermediario.

Comportamiento de tema reservado requerido de la fase 7:

- Sombras clásicas sin nombre: `$aws/things/{thingName}/shadow/update`, `get` y `delete`.
- Sombras con nombre: `$aws/things/{thingName}/shadow/name/{shadowName}/update`, `get` y `delete`.
- Temas de respuesta en sombra: `accepted`, `rejected`, `documents` y `delta`, cuando corresponda.
- Las familias de temas de ingesta básica y trabajos son el alcance de seguimiento deseado, pero no deben bloquear la restauración del intermediario a menos que se incluya explícitamente en la fase de implementación.

Los temas de solicitud reservados son manejados por Floci antes de la distribución normal de MQTT. La publicación de solicitud `$aws/...` original no se enruta como un mensaje de aplicación; Los documentos aceptados, rechazados y las respuestas delta generadas se publican nuevamente a través de `IotMqttBrokerService.publish(...)`, de modo que los suscriptores MQTT coincidentes reciban mensajes nativos del corredor.

Notas de implementación:

- Vert.x MQTT maneja el protocolo de cable y el ciclo de vida de la conexión.
- La sesión propiedad de Floci, la suscripción y el estado de mensajes retenidos impulsan el comportamiento de compatibilidad local de AWS IoT.
- El cliente normal publica la llamada `IotService.publish(...)`, por lo que el almacenamiento de mensajes retenidos, la grabación de eventos y la evaluación de reglas siguen siendo propiedad del servicio.
- Las publicaciones del intermediario interno se distribuyen solo para los suscriptores de MQTT y no evalúan de forma recursiva las reglas del tema IoT.

Limitación aceptada actual:

- La autorización de certificados y políticas aún no se aplica en la capa de intermediario.
- Las sesiones persistentes sin conexión aún no se han modelado.
- QoS 2 y la semántica de propiedad avanzada MQTT 5 siguen siendo alcance de seguimiento.

## Forma de implementación

La integración MQTT debería mantener el comportamiento del servicio separado de la mecánica del corredor:

- `IotMqttBrokerService` posee el ciclo de vida Vert.x MQTT y los asistentes de publicación nativos del broker.
- El controlador de publicación del intermediario detecta temas reservados AWS IoT.
- El manejo de temas reservados IoT se encuentra en el código de servicio IoT o en un controlador de temas reservados enfocado, no en el código de análisis de paquetes.
- Las respuestas ocultas generadas por AWS se publican nuevamente a través de `IotMqttBrokerService.publish(...)` para que los suscriptores habituales de MQTT reciban mensajes nativos del agente.

## Criterios de finalización de la fase 7 de

Criterios de finalización de la Fase 7:

- Vert.x MQTT es la implementación activa del broker MQTT.
- Los temas ocultos reservados se manejan desde el controlador de publicación del agente.
- Las respuestas ocultas generadas por AWS se publican a través del servicio de intermediario, no escribiendo manualmente paquetes MQTT.
- MQTT 5 CONNECT y el comportamiento de publicación/suscripción están cubiertos por pruebas automatizadas.
- Los temas clásicos de MQTT ocultos sin nombre se cubren mediante pruebas automatizadas.
- Los temas MQTT ocultos con nombre se cubren mediante pruebas automatizadas.
- Las pruebas de compatibilidad relevantes de IoT se superan con el binario nativo.

## Motor de reglas

Estado: completo para el segmento de acción de MVP 2.

La fase 8 agrega reglas de temas IoT almacenadas y envía publicaciones de IoT coincidentes con acciones de reglas.

Comportamiento de reglas admitido:

- Rutas del plano de control IoT compatibles con `CreateTopicRule`, `GetTopicRule`, `ListTopicRules`, `EnableTopicRule`, `DisableTopicRule` y `DeleteTopicRule` hasta AWS SDK.
- Extracción de filtro de temas SQL para reglas con forma de `SELECT * FROM 'topic/filter'`.
- Coincidencia de filtro de temas estilo MQTT para temas exactos, `+` y terminal `#`.
- Las publicaciones de datos IoT `Publish` y MQTT utilizan la misma ruta de envío de reglas.
- La acción `republish` vuelve a publicar la carga útil original en otro tema MQTT a través de `IotMqttBrokerService`.
- La acción `sqs` envía la carga útil original a una cola SQS a través del límite de servicio SQS de Floci.
- La acción `sns` publica la carga útil original en un tema SNS a través del límite de servicio SNS de Floci.
- La acción `s3` escribe la carga útil original en el depósito/clave configurado a través del límite de servicio S3 de Floci.
- La acción `dynamoDBv2` escribe campos de carga útil del objeto JSON como valores de atributo DynamoDB a través del límite de servicio DynamoDB de Floci.
- La acción `kinesis` coloca la carga útil original en una secuencia Kinesis a través del límite de servicio Kinesis de Floci.
- La acción `lambda` invoca la función configurada ARN a través del límite de servicio Lambda de Floci.

Limitaciones actuales:

- La proyección SQL, las cláusulas WHERE, las funciones, las sustituciones, las acciones de error y los tipos de acciones de reglas menos comunes AWS IoT son el alcance de seguimiento.

Abrir alcance de seguimiento para la fase 7 a menos que se aplace explícitamente:

- Temas básicos de ingesta en `$aws/rules/...`.
- AWS IoT Temas reservados de trabajos y comportamiento requerido del ciclo de vida del trabajo.
