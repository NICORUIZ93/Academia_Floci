# Módulo 27: APIs GraphQL con AppSync y correo transaccional con SES


## Aprende construyendo

### Tema 1: AppSync — APIs GraphQL gestionadas

**Conceptos clave:** `CreateGraphqlApi`, esquema GraphQL, tipo de autenticación.

AppSync resuelve el mismo problema de fondo que API Gateway del Módulo 6 —exponer una API a tus clientes—, pero con GraphQL en vez de REST: en lugar de múltiples endpoints donde cada uno devuelve una forma fija de datos, GraphQL expone un único endpoint donde el cliente especifica exactamente qué campos necesita en cada consulta, evitando tanto la sobre-obtención (recibir campos que no usas) como la sub-obtención (tener que hacer varias llamadas para juntar los datos que necesitas). Crear una API con `CreateGraphqlApi` requiere elegir un tipo de autenticación —`API_KEY` es el más simple para empezar— y luego definir el esquema con `StartSchemaCreation`, que en Floci es siempre síncrono: no hay espera de procesamiento como en otros servicios.

Una vez definido el esquema, cada campo de tipo `Query`, `Mutation` o `Subscription` necesita un resolver que le diga a AppSync de dónde sacar los datos. Este desacoplamiento entre "qué forma tienen mis datos" (esquema) y "de dónde vienen realmente" (resolvers) es lo que hace GraphQL flexible para evolucionar sin romper a los clientes existentes.

**Analogía:** una API REST es como un menú de restaurante con platos fijos predefinidos; una API GraphQL es como pedirle al chef exactamente los ingredientes que quieres en tu plato, ni más ni menos, en un solo pedido.

**¿Por qué es importante?** Elegir GraphQL sobre REST no es gratis —añade la complejidad de definir un esquema y resolvers—, así que reconocer cuándo el problema real es "mis clientes necesitan formas de datos muy variables" (donde GraphQL brilla) frente a "necesito operaciones CRUD simples y predecibles" (donde REST suele ser más simple) es la decisión de diseño central de este tema.

### Tema 2: Fuentes de datos y resolvers

**Conceptos clave:** fuente de datos tipo `NONE`, resolvers locales, función.

Un resolver conecta un campo del esquema con una fuente de datos (`CreateDataSource`): puede ser DynamoDB, Lambda, o el tipo especial `NONE`, que permite resolvers completamente locales sin backend externo — útiles para prototipar rápidamente antes de conectar un origen de datos real, exactamente lo que vas a practicar en el laboratorio de este módulo. Los resolvers se pueden crear directamente sobre un campo (`CreateResolver`) o como funciones reutilizables (`CreateFunction`) que varios resolvers pueden compartir, evitando duplicar lógica cuando varios campos necesitan un patrón de acceso a datos similar.

Un detalle de comportamiento importante para gestionar el ciclo de vida de tu API: eliminar una API GraphQL con `DeleteGraphqlApi` elimina en cascada absolutamente todo lo que depende de ella —esquema, fuentes de datos, resolvers, funciones, tipos y claves API—, replicando fielmente el comportamiento de AWS real, donde no hay forma de eliminar una API "a medias" dejando huérfanos sus recursos hijos.

**Analogía:** una fuente de datos tipo `NONE` es como un mesero que puede confirmar tu pedido y darte una respuesta inmediata sin tener que ir a la cocina — útil cuando la "cocina" (backend real) todavía no existe pero necesitas probar el flujo completo de todos modos.

**¿Por qué es importante?** Empezar con resolvers `NONE` te permite validar el diseño de tu esquema GraphQL con clientes reales antes de invertir tiempo conectando fuentes de datos definitivas — un patrón de "maqueta funcional primero" útil en cualquier desarrollo de API.

### Tema 3: SES — identidades, envío y plantillas

**Conceptos clave:** `VerifyEmailIdentity`, `SendEmail`, plantilla de correo, SES v1 vs v2.

Enviar correo transaccional desde una aplicación —confirmaciones de pedido, restablecimiento de contraseña, notificaciones— requiere primero verificar la identidad remitente: en AWS real, esto implica probar que controlas esa dirección o dominio (mediante un enlace de confirmación o un registro DNS); en Floci, `VerifyEmailIdentity` y `VerifyDomainIdentity` marcan la identidad como verificada de inmediato, sin ese flujo de validación real, para que puedas iterar rápido en desarrollo. A partir de ahí, `SendEmail` envía un correo estructurado con asunto y cuerpo de texto o HTML, `SendRawEmail` acepta un mensaje MIME completo para casos con adjuntos o estructura compleja, y `SendTemplatedEmail` resuelve una plantilla previamente creada con `CreateTemplate` contra los datos que le pases, útil cuando el mismo tipo de correo se envía con distintos valores miles de veces.

SES existe en dos versiones de API en Floci: la consulta clásica v1 (la que usan los comandos `aws ses ...`) y la REST JSON v2 (`aws sesv2 ...`), pero comparten el mismo estado subyacente — una identidad o plantilla creada con v1 es completamente visible y utilizable desde v2, y viceversa, así que puedes mezclar ambas superficies según lo que tu SDK o código existente use.

**Analogía:** verificar una identidad de correo es como validar tu remitente en un servicio postal antes de que acepten enviar cartas en tu nombre: en Floci ese trámite se aprueba al instante para que puedas concentrarte en probar el contenido y el flujo de tus correos, no el papeleo de verificación.

**¿Por qué es importante?** Practicar plantillas y envío estructurado desde el principio —en vez de concatenar strings de HTML manualmente en cada llamada— es el hábito que evita correos inconsistentes o rotos cuando tu aplicación crece y empieza a enviar decenas de tipos distintos de notificación.

### Tema 4: El simulador de buzones y el punto de inspección local

**Conceptos clave:** direcciones del simulador (`success@`, `bounce@`, `complaint@`), punto de inspección `/_aws/ses`, eventos deterministas.

Probar cómo reacciona tu aplicación ante un correo que rebota (bounce) o genera una queja (complaint) es difícil contra un proveedor de correo real: no puedes forzar esos eventos a voluntad de forma confiable. AWS resuelve esto con direcciones de simulador de buzones de correo especiales —`success@simulator.amazonses.com`, `bounce@simulator.amazonses.com`, `complaint@simulator.amazonses.com`, `suppressionlist@simulator.amazonses.com`— que generan de forma determinista el evento correspondiente cada vez que envías un correo a esa dirección, sin enviar correo real a nadie. Floci reconoce estas mismas direcciones especiales e implementa la misma emisión determinista de eventos, así que puedes escribir pruebas automatizadas de tu manejador de rebotes o quejas sin depender de infraestructura de correo real ni de comportamiento aleatorio.

Además, cada correo enviado —simulador o no— queda almacenado en un buzón de inspección local accesible en `GET /_aws/ses`, donde puedes consultar exactamente qué se envió, a quién y con qué contenido, o borrar el buzón capturado con `DELETE /_aws/ses` entre pruebas para empezar limpio.

**Analogía:** las direcciones del simulador son como un maniquí de entrenamiento de primeros auxilios que reacciona de forma predecible a cada procedimiento que practiques, en vez de tener que esperar una emergencia real para poder entrenar la respuesta correcta.

**¿Por qué es importante?** Un sistema de notificaciones por correo que nunca fue probado contra un rebote o una queja real fallará silenciosamente en producción la primera vez que ocurra uno; el simulador te permite escribir esa prueba desde el primer día, sin excusas.

---


## Laboratorio práctico

> Este laboratorio asume que ya ejecutaste `floci start` y `eval $(floci env)` (Módulo 1) en tu sesión de terminal, así que los comandos de `aws` no repiten `--endpoint-url`.

**Objetivo del laboratorio:** crear una API GraphQL básica en AppSync con un resolver local, y luego verificar una identidad SES y probar los tres flujos deterministas del simulador de buzones (éxito, rebote, queja).

**Requisitos previos:** ninguno adicional a Floci corriendo.

### Laboratorio 27.1 — API GraphQL con resolver local

| Paso | Acción | Comando | Explicación | Salida esperada |
|---|---|---|---|---|
| 1 | Crea la API | `aws appsync create-graphql-api --name mi-api --authentication-type API_KEY` | Registra la API con autenticación por clave | Un `apiId` |
| 2 | Define el esquema | `aws appsync start-schema-creation --api-id <api-id> --definition 'type Query { saludo: String }'` | Crea el esquema de forma síncrona | Confirmación inmediata |
| 3 | Crea la fuente de datos local | `aws appsync create-data-source --api-id <api-id> --name origen-local --type NONE` | Sin backend externo, útil para prototipar | Confirmación de la fuente |
| 4 | Crea el resolver | `aws appsync create-resolver --api-id <api-id> --type-name Query --field-name saludo --data-source-name origen-local` | Conecta el campo `saludo` con la fuente local | Confirmación del resolver |
| 5 | Crea una clave API para probar | `aws appsync create-api-key --api-id <api-id> --description "clave de prueba"` | Genera credenciales para consultar la API | Una clave API |

### Laboratorio 27.2 — Simulador de entrega, rebote y queja con SES

| Paso | Acción | Comando | Explicación | Salida esperada |
|---|---|---|---|---|
| 1 | Verifica tu identidad remitente | `aws ses verify-email-identity --email-address remitente@example.com` | Marca la identidad como verificada de inmediato | Confirmación |
| 2 | Envía a la dirección de éxito | `aws ses send-email --from remitente@example.com --destination ToAddresses=success@simulator.amazonses.com --message "Subject={Data=Prueba exito},Body={Text={Data=Hola}}"` | Genera un evento `Delivery` determinista | Un `MessageId` |
| 3 | Envía a la dirección de rebote | `aws ses send-email --from remitente@example.com --destination ToAddresses=bounce@simulator.amazonses.com --message "Subject={Data=Prueba rebote},Body={Text={Data=Hola}}"` | Genera un evento `Bounce` determinista | Un `MessageId` |
| 4 | Envía a la dirección de queja | `aws ses send-email --from remitente@example.com --destination ToAddresses=complaint@simulator.amazonses.com --message "Subject={Data=Prueba queja},Body={Text={Data=Hola}}"` | Genera un evento `Complaint` determinista | Un `MessageId` |
| 5 | Inspecciona el buzón local | `curl http://localhost:4566/_aws/ses` | Confirma los tres correos capturados | Una lista con los tres mensajes enviados |

**Verificación:** el laboratorio se considera exitoso si `create-resolver` conecta correctamente el campo `saludo` con la fuente de datos local sin errores, y si el buzón de inspección `GET /_aws/ses` muestra los tres correos enviados a las direcciones del simulador, confirmando que cada uno llegó al almacenamiento local independientemente del tipo de evento que representa.

**Errores comunes y soluciones**

- **`CreateResolver` falla porque el campo no existe en el esquema.** El nombre de campo y tipo (`Query`/`Mutation`) debe coincidir exactamente con lo definido en `StartSchemaCreation`; revisa el esquema con `GetIntrospectionSchema` si tienes dudas.
- **`DeleteGraphqlApi` deja recursos "huérfanos" en tu script de limpieza.** No debería pasar: la eliminación en cascada es automática. Si tu script falla al intentar eliminar un resolver después de eliminar la API, es que el orden de eliminación está invertido — elimina la API primero, no al final.
- **Los correos al simulador no generan el evento esperado.** Verifica que la dirección de destino sea exactamente una de las cuatro reconocidas (`success@`, `bounce@`, `complaint@`, `suppressionlist@simulator.amazonses.com`); cualquier otra dirección solo emite el evento `Send` genérico.
- **El buzón de inspección parece acumular correos de pruebas anteriores.** Usa `DELETE /_aws/ses` al inicio de tu suite de pruebas para partir de un estado limpio y evitar falsos positivos por mensajes de ejecuciones previas.

---
