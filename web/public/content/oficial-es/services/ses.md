# SES

**Protocolo:** Consulta (XML) con parámetro `Action=`
**Punto final:** `POST http://localhost:4566/`

Floci expone la consulta clásica de Amazon SES API utilizada por los comandos `aws ses ...` y los SDK destinados a SES v1.

## Acciones admitidas

| Acción | Descripción |
|-------------------------------|-----------------------------------------------------------|
| `VerifyEmailIdentity` | Marcar una dirección de correo electrónico como verificada |
| `VerifyEmailAddress` | Alias ​​heredado para verificación de correo electrónico |
| `VerifyDomainIdentity` | Marcar un dominio como verificado y devolver un token de verificación |
| `DeleteIdentity` | Eliminar una identidad de dominio o correo electrónico |
| `ListIdentities` | Listar identidades verificadas |
| `GetIdentityVerificationAttributes` | Obtener estado de verificación para una o más identidades |
| `SendEmail` | Envíe un correo electrónico estructurado con texto o cuerpo HTML |
| `SendRawEmail` | Enviar una carga útil MIME sin procesar |
| `SendTemplatedEmail` | Enviar un correo electrónico resolviendo una plantilla almacenada |
| `SendBulkTemplatedEmail` | Enviar un correo electrónico con plantilla a múltiples destinos |
| `CreateTemplate` | Cree una plantilla de correo electrónico con partes de asunto/texto/html |
| `GetTemplate` | Leer una plantilla almacenada |
| `UpdateTemplate` | Reemplazar el contenido de una plantilla almacenada |
| `DeleteTemplate` | Eliminar una plantilla almacenada |
| `ListTemplates` | Listar plantillas almacenadas |
| `TestRenderTemplate` | Representa una plantilla almacenada con los datos proporcionados y devuelve el mensaje MIME |
| `GetSendQuota` | Devolver contadores de cuotas de envío locales |
| `GetSendStatistics` | Devolver estadísticas de entrega agregadas para mensajes enviados |
| `GetAccountSendingEnabled` | Informar si el envío está habilitado |
| `UpdateAccountSendingEnabled` | Activar o desactivar el envío a toda la cuenta |
| `ListVerifiedEmailAddresses` | Listar identidades de correo electrónico verificadas |
| `DeleteVerifiedEmailAddress` | Eliminar una identidad de correo electrónico verificada |
| `SetIdentityNotificationTopic` | Almacenar ARN del tema de notificación SNS para una identidad |
| `GetIdentityNotificationAttributes` | Leer la configuración del tema de notificación almacenado |
| `SetIdentityFeedbackForwardingEnabled` | Alternar reenvío de comentarios para una identidad |
| `SetIdentityHeadersInNotificationsEnabled` | Alternar encabezados en notificaciones por tipo de notificación |
| `SetIdentityMailFromDomain` | Establecer o borrar el dominio MAIL FROM para una identidad |
| `GetIdentityMailFromDomainAttributes` | Leer CORREO DESDE la configuración del dominio |
| `GetIdentityDkimAttributes` | Devolver el estado DKIM para identidades |
| `CreateConfigurationSet` | Crear un conjunto de configuración |
| `DescribeConfigurationSet` | Leer un conjunto de configuración |
| `ListConfigurationSets` | Listar conjuntos de configuración |
| `DeleteConfigurationSet` | Eliminar un conjunto de configuración |
| `CreateConfigurationSetEventDestination` | Adjuntar un destino de evento a un conjunto de configuración |
| `UpdateConfigurationSetEventDestination` | Actualizar un destino de evento existente en un conjunto de configuración |
| `DeleteConfigurationSetEventDestination` | Eliminar un destino de evento de un conjunto de configuración |

## Configuración

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_SES_ENABLED` | `true` | Activar o desactivar el servicio SES |
| `FLOCI_SERVICES_SES_SMTP_HOST` | *(desarmado)* | Host de servidor SMTP para retransmisión de correo electrónico (vacío = solo tienda) |
| `FLOCI_SERVICES_SES_SMTP_PORT` | `25` | Puerto del servidor SMTP |
| `FLOCI_SERVICES_SES_SMTP_USER` | *(desarmado)* | Nombre de usuario de autenticación SMTP |
| `FLOCI_SERVICES_SES_SMTP_PASS` | *(desarmado)* | Contraseña de autenticación SMTP |
| `FLOCI_SERVICES_SES_SMTP_STARTTLS` | `DISABLED` | Modo STARTTLS: `DISABLED`, `OPTIONAL` o `REQUIRED` |

### Relé SMTP

Cuando se configura `smtp-host`, `SendEmail` y `SendRawEmail` reenvían
correos electrónicos al servidor SMTP especificado además de almacenarlos en el
Punto final de inspección local. Esto permite realizar pruebas de integración con herramientas.
como [Mailpit](https://mailpit.axllent.org/) o cualquier servidor SMTP estándar.

```yaml
# docker-compose.yml
services:
  floci:
    image: floci/floci:latest
    ports: ["4566:4566"]
    environment:
      FLOCI_SERVICES_SES_SMTP_HOST: mailpit
      FLOCI_SERVICES_SES_SMTP_PORT: 1025
    networks: [floci]

  mailpit:
    image: axllent/mailpit
    ports:
      - "8025:8025"   # Web UI
      - "1025:1025"   # SMTP
    networks: [floci]

networks:
  floci:
```

- Los correos electrónicos siempre se almacenan localmente independientemente de la retransmisión: el
  El punto final de inspección `/_aws/ses` funciona con o sin SMTP.
- Las fallas del relé se registran pero no afectan la respuesta de API.
- Los mensajes MIME sin procesar se analizan con Apache Mime4j para extraer los mensajes comunes.
  campos (De, Para, Cc, Asunto, texto/sin formato y texto/partes html) y
  transmitido como un mensaje reconstruido. Encabezados arbitrarios, archivos adjuntos,
  y las estructuras complejas de varias partes no se conservan en el relevo.

## Punto final de inspección local

Para afirmaciones de prueba y depuración, Floci expone un extremo de buzón de correo compatible con LocalStack:

- `GET /_aws/ses` enumera los mensajes capturados
- `GET /_aws/ses?id=<message-id>` devuelve un mensaje capturado específico
- `DELETE /_aws/ses` borra el buzón capturado

Los mensajes se almacenan localmente mediante Floci y pueden persistir cuando el almacenamiento SES está respaldado por almacenamiento persistente o híbrido.

## Ejemplos

```bash
export AWS_ENDPOINT_URL=http://localhost:4566

# Verify sender and recipient identities
aws ses verify-email-identity \
  --email-address sender@example.com \
  --endpoint-url $AWS_ENDPOINT_URL

aws ses verify-email-identity \
  --email-address recipient@example.com \
  --endpoint-url $AWS_ENDPOINT_URL

# Verify a domain
aws ses verify-domain-identity \
  --domain example.com \
  --endpoint-url $AWS_ENDPOINT_URL

# List all identities
aws ses list-identities \
  --endpoint-url $AWS_ENDPOINT_URL

# Send a plain-text email
aws ses send-email \
  --from sender@example.com \
  --destination ToAddresses=recipient@example.com \
  --message "Subject={Data=Hello},Body={Text={Data=Sent from Floci SES}}" \
  --endpoint-url $AWS_ENDPOINT_URL

# Send a raw MIME email
aws ses send-raw-email \
  --raw-message Data="$(printf 'Subject: Raw test\r\n\r\nHello from raw SES')" \
  --source sender@example.com \
  --destinations recipient@example.com \
  --endpoint-url $AWS_ENDPOINT_URL

# Inspect locally captured messages
curl $AWS_ENDPOINT_URL/_aws/ses
```

## Comportamiento actual de

- La verificación de identidad se realiza de inmediato; no se requiere ningún DNS real ni un flujo de verificación de la bandeja de entrada.
- `SendEmail` almacena el cuerpo del texto o el cuerpo HTML como el cuerpo del mensaje capturado.
- `SetIdentityNotificationTopic` almacena los ARN de los temas SNS y los devuelve a través de `GetIdentityNotificationAttributes`.
- Los temas de notificación son solo metadatos de configuración; Los eventos de entrega, rebote o queja de SES no se emiten automáticamente.
- Para REST JSON API, consulte [SES v2](#v2) a continuación.

## SES v2 (REST JSON) {#v2}

**Protocolo:** REST JSON
**Punto final:** `http://localhost:4566/v2/email/...`

Además de la consulta clásica API, Floci implementa un subconjunto de SES v2 REST JSON API utilizado por los comandos `aws sesv2 ...` y los clientes SDK v2 dirigidos a los clientes modernos. Superficie SES.

### Operaciones compatibles con

| Método | Camino | Acción |
|---|---|---|
| `POST` | `/v2/email/identities` | `CreateEmailIdentity` |
| `GET` | `/v2/email/identities` | `ListEmailIdentities` |
| `GET` | `/v2/email/identities/{emailIdentity}` | `GetEmailIdentity` |
| `DELETE` | `/v2/email/identities/{emailIdentity}` | `DeleteEmailIdentity` |
| `PUT` | `/v2/email/identities/{emailIdentity}/dkim` | `PutEmailIdentityDkimAttributes` |
| `PUT` | `/v2/email/identities/{emailIdentity}/feedback` | `PutEmailIdentityFeedbackAttributes` |
| `PUT` | `/v2/email/identities/{emailIdentity}/mail-from` | `PutEmailIdentityMailFromAttributes` |
| `POST` | `/v2/email/outbound-emails` | `SendEmail` (simple/sin formato/con plantilla) |
| `POST` | `/v2/email/outbound-bulk-emails` | `SendBulkEmail` (con plantilla, múltiples destinos) |
| `GET` | `/v2/email/account` | `GetAccount` |
| `PUT` | `/v2/email/account/sending` | `PutAccountSendingAttributes` |
| `PUT` | `/v2/email/account/suppression` | `PutAccountSuppressionAttributes` |
| `POST` | `/v2/email/templates` | `CreateEmailTemplate` |
| `GET` | `/v2/email/templates` | `ListEmailTemplates` |
| `GET` | `/v2/email/templates/{templateName}` | `GetEmailTemplate` |
| `PUT` | `/v2/email/templates/{templateName}` | `UpdateEmailTemplate` |
| `DELETE` | `/v2/email/templates/{templateName}` | `DeleteEmailTemplate` |
| `POST` | `/v2/email/templates/{templateName}/render` | `TestRenderEmailTemplate` |
| `POST` | `/v2/email/configuration-sets` | `CreateConfigurationSet` |
| `GET` | `/v2/email/configuration-sets` | `ListConfigurationSets` |
| `GET` | `/v2/email/configuration-sets/{name}` | `GetConfigurationSet` |
| `DELETE` | `/v2/email/configuration-sets/{name}` | `DeleteConfigurationSet` |
| `POST` | `/v2/email/configuration-sets/{name}/event-destinations` | `CreateConfigurationSetEventDestination` |
| `GET` | `/v2/email/configuration-sets/{name}/event-destinations` | `GetConfigurationSetEventDestinations` |
| `PUT` | `/v2/email/configuration-sets/{name}/event-destinations/{eventDestinationName}` | `UpdateConfigurationSetEventDestination` |
| `DELETE` | `/v2/email/configuration-sets/{name}/event-destinations/{eventDestinationName}` | `DeleteConfigurationSetEventDestination` |
| `PUT` | `/v2/email/configuration-sets/{name}/suppression-options` | `PutConfigurationSetSuppressionOptions` |
| `PUT` | `/v2/email/suppression/addresses` | `PutSuppressedDestination` |
| `GET` | `/v2/email/suppression/addresses/{EmailAddress}` | `GetSuppressedDestination` |
| `DELETE` | `/v2/email/suppression/addresses/{EmailAddress}` | `DeleteSuppressedDestination` |
| `GET` | `/v2/email/suppression/addresses` | `ListSuppressedDestinations` (filtro de consulta `Reason` opcional) |
| `POST` | `/v2/email/tags` | `TagResource` |
| `DELETE` | `/v2/email/tags?ResourceArn=...&TagKeys=...` | `UntagResource` |
| `GET` | `/v2/email/tags?ResourceArn=...` | `ListTagsForResource` |

Los destinos de eventos del conjunto de configuración se almacenan como configuración. La existencia del objetivo no está validada; Los objetivos faltantes hacen que Floci registre una advertencia y omita ese destino. Cada destino de evento debe especificar exactamente un tipo de destino y al menos un tipo de evento coincidente. Un destino CloudWatch requiere una lista de configuración de dimensiones que no esté vacía y un destino Pinpoint requiere una aplicación ARN.

Floci publica eventos SES en `SnsDestination` solo en esta versión (`KinesisFirehoseDestination` / `EventBridgeDestination` / `CloudWatchDestination` / `PinpointDestination` registran una advertencia y omiten). La carga útil publicada coincide con el formato de notificación AWS SES SNS con un `eventType` externo más `mail` y bloques específicos del tipo de evento. Los eventos se activan cada vez que un conjunto de configuración tiene al menos un destino de evento que coincide con el tipo de evento: deshabilite por destino a través de `EventDestination.Enabled=false` o elimine el destino por completo.

Floci reconoce las [direcciones del simulador de buzones de correo] AWS (https://docs.aws.amazon.com/ses/latest/dg/send-an-email-from-console.html#send-email-simulator) para una emisión determinista de tipo de evento:

| Dirección del destinatario | Eventos emitidos (además de `Send`) |
|---|---|
| `success@simulator.amazonses.com` | `Delivery` |
| `bounce@simulator.amazonses.com` | `Bounce` |
| `complaint@simulator.amazonses.com` | `Complaint` |
| `suppressionlist@simulator.amazonses.com` | `Reject` |

Un envío exitoso sin un destinatario de dirección de simulador emite solo el evento `Send`.

Las entradas de la lista de supresión se almacenan por región con `Reason` ∈ {`BOUNCE`, `COMPLAINT`}. En el momento del envío, un destinatario se suprime cuando aparece en la lista de supresión AND. Su `Reason` almacenado está contenido en el `SuppressedReasons` **efectivo** para el envío. La lista efectiva es `SuppressionOptions.SuppressedReasons` del conjunto de configuración (establecido a través de `PutConfigurationSetSuppressionOptions`) cuando está presente; una **lista vacía se conserva como un "filtro sin supresión explícito para este conjunto de configuración"**; de lo contrario, vuelve al nivel de cuenta `AccountSuppressionAttributes.SuppressedReasons` (establecido a través de `PutAccountSuppressionAttributes`, predeterminado `[BOUNCE, COMPLAINT]`). Tras el contrato AWS V2, no existe ninguna acción `GetConfigurationSetSuppressionOptions` dedicada; una vez configurado, el bloque se vuelve a leer a través de la respuesta de `GetConfigurationSet` (el campo se omite cuando la configuración establecida no tiene anulación).

Los destinatarios suprimidos se filtran del paso de retransmisión SMTP (los destinatarios no suprimidos en el mismo envío aún llegan a la retransmisión normalmente) y los destinos de eventos del conjunto de configuración reciben un evento sintético `Bounce` o `Complaint` junto con el evento `Send` siempre emitido. La respuesta `SendEmail` API (`200` + `MessageId`), el `SentEmail` almacenado visible en `GET /_aws/ses` y el `mail.destination` del evento publicado conservan la lista de destinatarios original, que coincide con el contrato AWS de que el mensaje es "aceptado, pero no enviado" para suprimido. direcciones.

Las operaciones de etiquetas admiten estos formularios ARN: `arn:aws:ses:<region>:<account>:configuration-set/<name>`, `arn:aws:ses:<region>:<account>:template/<name>` y `arn:aws:ses:<region>:<account>:identity/<email-or-domain>`. Las etiquetas suministradas a `CreateConfigurationSet`, `CreateEmailTemplate` y `CreateEmailIdentity` son accesibles a través de `ListTagsForResource`; `UpdateEmailTemplate` no modifica etiquetas. Otros tipos de recursos devuelven `NotFoundException`.

La identidad, la plantilla, el conjunto de configuración y el estado del mensaje enviado se comparten entre la consulta v1 API y la v2 REST JSON API, por lo que una plantilla creada con `CreateTemplate` se resuelve a través de `SendEmail` en v2 (y viceversa), un conjunto de configuración creado con `CreateConfigurationSet` es visible tanto para `DescribeConfigurationSet` (v1) como para `GetConfigurationSet` (v2), y cada envío aparece en el mismo buzón de inspección `GET /_aws/ses`.
