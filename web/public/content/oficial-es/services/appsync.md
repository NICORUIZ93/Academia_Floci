# AppSync

**Protocolo:** REST JSON
**Punto final:** `http://localhost:4566/v1/apis/...`

Floci implementa AWS AppSync Management API, proporcionando emulación local de la configuración de GraphQL API, administración de esquemas, enlace de fuentes de datos, mapeo de resolución, aprovisionamiento de claves API, dominios personalizados y espacios de nombres de canales.

## Operaciones compatibles

### GraphQL API

| Operación | Descripción |
|---|---|
| `CreateGraphqlApi` | Crear un GraphQL API |
| `GetGraphqlApi` | Obtenga un GraphQL API por ID |
| `UpdateGraphqlApi` | Actualizar un GraphQL API |
| `DeleteGraphqlApi` | Eliminar un GraphQL API y todos los recursos secundarios |
| `ListGraphqlApis` | Enumere todas las API de GraphQL |

### Esquema

| Operación | Descripción |
|---|---|
| `StartSchemaCreation` | Iniciar la creación del esquema: valida y analiza SDL usando Graphql-Java (SDL no válido devuelve 400) |
| `GetSchemaCreationStatus` | Obtener el estado de creación del esquema |
| `GetIntrospectionSchema` | Obtenga el esquema de introspección |

### Fuentes de datos

| Operación | Descripción |
|---|---|
| `CreateDataSource` | Crear una fuente de datos |
| `GetDataSource` | Obtener una fuente de datos por nombre |
| `UpdateDataSource` | Actualizar una fuente de datos |
| `DeleteDataSource` | Eliminar una fuente de datos |
| `ListDataSources` | Enumere todas las fuentes de datos para un API |

### Resolutores

| Operación | Descripción |
|---|---|
| `CreateResolver` | Crear un solucionador |
| `GetResolver` | Obtenga un solucionador por tipo y campo |
| `UpdateResolver` | Actualizar un solucionador |
| `DeleteResolver` | Eliminar un solucionador |
| `ListResolvers` | Enumere todos los solucionadores para un API |
| `ListResolversByType` | Listar solucionadores para un tipo específico |
| `ListResolversByFunction` | Lista de solucionadores adjuntos a una función específica |

### Funciones

| Operación | Descripción |
|---|---|
| `CreateFunction` | Crear una configuración de función |
| `GetFunction` | Obtener una función por ID |
| `UpdateFunction` | Actualizar una función |
| `DeleteFunction` | Eliminar una función |
| `ListFunctions` | Enumere todas las funciones de un API |

### Tipos de

| Operación | Descripción |
|---|---|
| `CreateType` | Crear un tipo |
| `GetType` | Obtener un tipo por nombre |
| `UpdateType` | Actualizar un tipo |
| `DeleteType` | Eliminar un tipo |
| `ListTypes` | Enumere todos los tipos de API |

### Teclas API

| Operación | Descripción |
|---|---|
| `CreateApiKey` | Cree una clave API |
| `GetApiKey` | Obtenga una clave API por ID |
| `UpdateApiKey` | Actualizar una clave API |
| `DeleteApiKey` | Eliminar una clave API |
| `ListApiKeys` | Enumere todas las claves API para un API |

### Etiquetas

| Operación | Descripción |
|---|---|
| `TagResource` | Agregar etiquetas a un recurso |
| `UntagResource` | Eliminar etiquetas de un recurso |
| `ListTagsForResource` | Listar etiquetas en un recurso |

### Variables de entorno

| Operación | Descripción |
|---|---|
| `GetEnvironmentVariables` | Obtenga variables de entorno para API |
| `PutEnvironmentVariables` | Establecer variables de entorno para un API |

### Nombres de dominio

| Operación | Descripción |
|---|---|
| `CreateDomainName` | Registre un nombre de dominio personalizado |
| `GetDomainName` | Obtener configuración de nombre de dominio |
| `UpdateDomainName` | Actualizar la descripción del nombre de dominio |
| `ListDomainNames` | Listar todos los nombres de dominio |
| `DeleteDomainName` | Eliminar un nombre de dominio personalizado |
| `AssociateApi` | Asociar un nombre de dominio con un GraphQL API |
| `GetAssociatedApi` | Obtener el API asociado a un nombre de dominio |
| `DisassociateApi` | Desasociar un nombre de dominio de un GraphQL API |
| `ListApiAssociations` | Enumere todas las asociaciones de un API |

### Espacios de nombres de canal

| Operación | Descripción |
|---|---|
| `CreateChannelNamespace` | Crear un espacio de nombres de canal |
| `GetChannelNamespace` | Obtener un espacio de nombres de canal por nombre |
| `UpdateChannelNamespace` | Actualizar la descripción del espacio de nombres de un canal |
| `ListChannelNamespaces` | Enumere todos los espacios de nombres de canales para un API |
| `DeleteChannelNamespace` | Eliminar un espacio de nombres de canal |

### Asociaciones API fusionadas

| Operación | Descripción |
|---|---|
| `CreateApiAssociation` | Asociar una fuente API con un API fusionado |
| `GetApiAssociation` | Obtenga una asociación API fusionada |
| `DeleteApiAssociation` | Eliminar una asociación API fusionada |
| `ListApiAssociations` | Listar todas las asociaciones API fusionadas |

### Métricas mejoradas de

| Operación | Descripción |
|---|---|
| `GetEnhancedMetricsConfig` | Obtenga la configuración de métricas mejorada |

## Registro de esquema

`StartSchemaCreation` valida el SDL GraphQL proporcionado usando [graphql-java](https://github.com/graphql-java/graphql-java). Los esquemas no válidos se rechazan con un `BadRequestException` (400) en el momento del registro, lo que evita que se detecten más adelante durante la ejecución de la consulta.

Los siguientes **tipos escalares AWS** están prerregistrados y disponibles en cualquier esquema sin requerir declaraciones `scalar` explícitas:

| Escalar | Tipo Java | Validación |
|--------|-----------|------------|
| `AWSJSON` | Cadena | Sintaxis válida de JSON |
| `AWSDateTime` | Cadena | Fecha y hora ISO 8601 |
| `AWSDate` | Cadena | Fecha ISO 8601 (aaaa-MM-dd) |
| `AWSTime` | Cadena | Hora ISO 8601 |
| `AWSTimestamp` | Largo | Segundos de época Unix (0 a 32503680000) |
| `AWSEmail` | Cadena | Formato de correo electrónico RFC 5322 |
| `AWSURL` | Cadena | URL válida |
| `AWSPhone` | Cadena | Formato E.164 (+1234567890) |
| `AWSIPAddress` | Cadena | IPv4 o IPv6 |
| `AWSBoolean` | booleano | Valor booleano |
| `AWSLong` | Largo | Entero con signo de 64 bits |
| `AWSInteger` | Entero | Entero con signo de 32 bits |
| `AWSShort` | Entero | Entero con signo de 16 bits (-32768 a 32767) |
| `AWSFloat` | Doble | IEEE 754 de doble precisión |
| `AWSBigDecimal` | Cadena | Decimal de precisión arbitraria |
| `AWSBigInt` | Cadena | Entero de precisión arbitraria |
| `AWSByte` | Cadena | Matriz de bytes codificada en Base64 |

Las siguientes **directivas AppSync** están predefinidas y reconocidas en los esquemas:

| Directiva | Ubicaciones | Propósito |
|-----------|-----------|---------|
| `@aws_api_key` | OBJETO, FIELD_DEFINITION | Requerir autenticación de clave API |
| `@aws_iam` | OBJETO, FIELD_DEFINITION | Requerir autenticación IAM |
| `@aws_cognito_user_pools(cognito_groups: [String!]!)` | OBJETO, FIELD_DEFINITION | Requerir autenticación del grupo de usuarios de Cognito |
| `@aws_oidc` | OBJETO, FIELD_DEFINITION | Requerir autenticación OIDC |
| `@aws_lambda` | OBJETO, FIELD_DEFINITION | Requerir autenticación Lambda |
| `@aws_subscribe(mutations: [String!]!)` | FIELD_DEFINITION | Enlace de suscripción a la mutación |
| `@aws_auth(cognito_groups: [String!]!)` | OBJETO | Requerir grupos de Cognito |
| `@aws_delta_sync` | OBJETO | Configuración de sincronización delta |

Las directivas desconocidas se rechazan durante el registro del esquema.

Las extensiones de esquema (`extend type Query { ... }`) se admiten de forma nativa a través de graphql-java.

## Paginación

Todas las operaciones de `List` admiten la paginación basada en cursor mediante parámetros de consulta:

| Parámetro | Descripción |
|---|---|
| `maxResults` | Número máximo de artículos a devolver |
| `nextToken` | Token opaco para la página siguiente |

El `nextToken` es un desplazamiento entero codificado en URL Base64. Un token faltante comienza desde el desplazamiento 0. Un token no válido devuelve `InvalidNextTokenException` (400).

```bash
# First page
aws appsync list-graphql-apis \
  --max-results 10 \
  --endpoint-url $AWS_ENDPOINT_URL

# Next page (use the nextToken from previous response)
aws appsync list-graphql-apis \
  --max-results 10 \
  --next-token "eyJvZmZzZXQiOjEwfQ==" \
  --endpoint-url $AWS_ENDPOINT_URL
```

## Eliminación en cascada

Al eliminar un GraphQL API (`DeleteGraphqlApi`), se eliminan automáticamente todos los recursos secundarios:

- Estado de creación de esquemas y esquemas.
- Todas las fuentes de datos
- Todos los solucionadores
- Todas las funciones
- Todos los tipos
- Todas las claves API
- Todos los espacios de nombres de canales
- Todas las asociaciones de nombres de dominio.

Esto coincide con el comportamiento de AWS, donde al eliminar un API se elimina toda su configuración.

## no implementado

Estas operaciones AWS AppSync aún no están implementadas y se les realiza un seguimiento en fases futuras:

- **Motor de ejecución** (Fase 5): ejecución de consultas GraphQL, envío de resolución, evaluación de plantillas VTL
- **Adaptadores de fuente de datos** (Fase 7): Conectores DynamoDB, Lambda, HTTP, EventBridge, OpenSearch, RDS
- **Resolvedores de tuberías** (Fase 8): Encadenamiento de funciones con `$prev` y `$stash`
- **Suscripciones** (Fase 9): suscripciones en tiempo real WebSocket
- **Almacenamiento en caché** (Fase 10): almacenamiento en caché a nivel API y por resolución
- **Autenticación** (Fase 4): Validación de la clave API en el endpoint GraphQL
- **Introspección** (Fase 6): consultas `__schema` y `__type`
- **Administración de fuente API fusionada**: `AssociateMergedGraphqlApi`, `AssociateSourceGraphqlApi`, `StartSchemaMerge`, `ListTypesByAssociation`
- **Introspección de fuentes de datos**: `StartDataSourceIntrospection`, `GetDataSourceIntrospection`

## Configuración

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_APPSYNC_ENABLED` | `true` | Activar o desactivar el servicio |

## Ejemplos

```bash
export AWS_ENDPOINT_URL=http://localhost:4566

# Create a GraphQL API
aws appsync create-graphql-api \
  --name my-api \
  --authentication-type API_KEY \
  --endpoint-url $AWS_ENDPOINT_URL

# Start schema creation
aws appsync start-schema-creation \
  --api-id API_ID \
  --definition 'type Query { hello: String }' \
  --endpoint-url $AWS_ENDPOINT_URL

# Create a data source (NONE type for local resolvers)
aws appsync create-data-source \
  --api-id API_ID \
  --name my-datasource \
  --type NONE \
  --endpoint-url $AWS_ENDPOINT_URL

# Create a resolver
aws appsync create-resolver \
  --api-id API_ID \
  --type-name Query \
  --field-name hello \
  --data-source-name my-datasource \
  --endpoint-url $AWS_ENDPOINT_URL

# Create an API key
aws appsync create-api-key \
  --api-id API_ID \
  --description "Test key" \
  --endpoint-url $AWS_ENDPOINT_URL

# List all APIs
aws appsync list-graphql-apis \
  --endpoint-url $AWS_ENDPOINT_URL

# Register a custom domain
aws appsync create-domain-name \
  --domain-name api.example.com \
  --certificate-arn arn:aws:acm:us-east-1:000000000000:certificate/123 \
  --endpoint-url $AWS_ENDPOINT_URL

# Associate domain with API
aws appsync associate-api \
  --domain-name api.example.com \
  --api-id API_ID \
  --endpoint-url $AWS_ENDPOINT_URL

# Create a channel namespace
aws appsync create-channel-namespace \
  --api-id API_ID \
  --name my-channels \
  --endpoint-url $AWS_ENDPOINT_URL
```
