# AppSync

**Protocolo:** REST JSON
**Punto final:** `http://localhost:4566/v1/apis/...`

Floci implementa AWS AppSync Management API, proporcionando emulación local de la configuración de GraphQL API, administración de esquemas, enlace de fuentes de datos, mapeo de resolución y aprovisionamiento de claves API.

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
| `StartSchemaCreation` | Iniciar la creación del esquema (siempre sincrónico) |
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

## Paginación

Todas las operaciones de `List` admiten la paginación basada en cursor mediante parámetros de consulta:

| Parámetro | Descripción |
|---|---|
| `maxResults` | Número máximo de artículos a devolver |
| `nextToken` | Token opaco para la página siguiente |

`nextToken` es un desplazamiento entero codificado en URL Base64. Un token faltante comienza desde el desplazamiento 0. Un token no válido devuelve `InvalidNextTokenException` (400).

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

Esto coincide con el comportamiento de AWS, donde al eliminar un API se elimina toda su configuración.

## no implementado

Estas operaciones AWS AppSync aún no están implementadas:

- Suscripciones en tiempo real (WebSocket)
- Resolutores de tuberías
- Nombres de dominio personalizados
- Gestión de proveedores de autenticación adicionales.
- Validación del rol del servicio de origen de datos.

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
```
