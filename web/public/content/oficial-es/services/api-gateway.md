# Puerta de enlace API

Floci admite API Gateway v1 (API REST) y API Gateway v2 (API HTTP).

## API Puerta de enlace v1 (API REST) {#v1}

**Protocolo:** REST JSON
**Punto final:** `http://localhost:4566/restapis/...`

### Operaciones compatibles con

| Categoría | Operaciones |
|---|---|
| **API** | CreateRestApi, ImportRestApi, PutRestApi, GetRestApi, GetRestApis, UpdateRestApi, DeleteRestApi |
| **Recursos** | CreateResource, GetResource, GetResources, UpdateResource, DeleteResource |
| **Métodos** | PutMethod, GetMethod, UpdateMethod, DeleteMethod |
| **Respuestas del método** | PutMethodResponse, GetMethodResponse |
| **Integraciones** | PutIntegration, GetIntegration, UpdateIntegration, DeleteIntegration |
| **Respuestas de integración** | PutIntegrationResponse, GetIntegrationResponse |
| **Implementaciones** | CreateDeployment, GetDeployments |
| **Etapas** | CreateStage, GetStage, GetStages, UpdateStage, DeleteStage |
| **Autorizadores** | CreateAuthorizer, GetAuthorizer, GetAuthorizers |
| **Teclas API** | CreateApiKey, GetApiKeys |
| **Planes de uso** | CreateUsagePlan, GetUsagePlans, DeleteUsagePlan |
| **Claves del plan de uso** | CreateUsagePlanKey, GetUsagePlanKey, GetUsagePlanKeys, DeleteUsagePlanKey |
| **Solicitar validadores** | CreateRequestValidator, GetRequestValidator, GetRequestValidators, DeleteRequestValidator |
| **Modelos** | CreateModel, GetModel, GetModels, DeleteModel |
| **Nombres de dominio** | CreateDomainName, GetDomainName, GetDomainNames, DeleteDomainName |
| **Asignaciones de rutas base** | CreateBasePathMapping, GetBasePathMapping, GetBasePathMappings, DeleteBasePathMapping |
| **Cuenta** | GetAccount, UpdateAccount |
| **Etiquetas** | TagResource, UntagResource, GetTags (ListTagsForResource) |

### no implementado

Estas operaciones del plano de gestión no tienen controlador en v1. Las llamadas devolverán `404` o un error:

- Detalle de implementación y ciclo de vida: `GetDeployment`, `UpdateDeployment`, `DeleteDeployment`
- Ciclo de vida del autorizador: `UpdateAuthorizer`, `DeleteAuthorizer`, `TestInvokeAuthorizer`
- Detalle clave de API: `GetApiKey`, `UpdateApiKey`, `DeleteApiKey`, `ImportApiKeys`
- Detalle del plan de uso: `GetUsagePlan`, `UpdateUsagePlan`
- Actualizaciones de modelos y plantillas: `UpdateModel`, `GetModelTemplate`
- Respuestas de Gateway (toda la familia: `PutGatewayResponse`, `GetGatewayResponse`, etc.)
- Documentación de piezas y versiones (toda la familia, 10 operaciones)
- Enlaces VPC (5 operaciones)
- Certificados de Cliente (5 operaciones)
- `GetExport` / `ImportDocumentationParts`

El plano de ejecución (tráfico HTTP proxy real a través de `/restapis/{id}/{stage}/_user_request_/…`) se implementa por separado y no se cuenta como operaciones del plano de administración.

### Ejemplos de

```bash
export AWS_ENDPOINT_URL=http://localhost:4566

# Create a REST API
API_ID=$(aws apigateway create-rest-api \
  --name "My API" \
  --query id --output text \
  --endpoint-url $AWS_ENDPOINT_URL)

# Get the root resource
ROOT_ID=$(aws apigateway get-resources \
  --rest-api-id $API_ID \
  --query 'items[?path==`/`].id' --output text \
  --endpoint-url $AWS_ENDPOINT_URL)

# Create a resource
RESOURCE_ID=$(aws apigateway create-resource \
  --rest-api-id $API_ID \
  --parent-id $ROOT_ID \
  --path-part users \
  --query id --output text \
  --endpoint-url $AWS_ENDPOINT_URL)

# Add a GET method
aws apigateway put-method \
  --rest-api-id $API_ID \
  --resource-id $RESOURCE_ID \
  --http-method GET \
  --authorization-type NONE \
  --endpoint-url $AWS_ENDPOINT_URL

# Add a Lambda integration
aws apigateway put-integration \
  --rest-api-id $API_ID \
  --resource-id $RESOURCE_ID \
  --http-method GET \
  --type AWS_PROXY \
  --integration-http-method POST \
  --uri "arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/arn:aws:lambda:us-east-1:000000000000:function:my-function/invocations" \
  --endpoint-url $AWS_ENDPOINT_URL

# Deploy to a stage
aws apigateway create-deployment \
  --rest-api-id $API_ID \
  --stage-name dev \
  --endpoint-url $AWS_ENDPOINT_URL

# Call the deployed API
curl http://localhost:4566/restapis/$API_ID/dev/_user_request_/users
```

---

## Configuración

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_APIGATEWAY_ENABLED` | `true` | Habilitar o deshabilitar API Gateway v1 (API REST) |
| `FLOCI_SERVICES_APIGATEWAYV2_ENABLED` | `true` | Habilitar o deshabilitar API Gateway v2 (API HTTP y WebSocket) |

## API Gateway v2 (API HTTP y WebSocket) {#v2}

**Protocolo:** REST JSON
**Punto final:** `http://localhost:4566/v2/apis/...`

Ambos tipos de protocolo HTTP y WebSocket son totalmente compatibles, incluido el plano de datos WebSocket (manejo de conexión real, enrutamiento de mensajes y administración `@connections` API).

### Operaciones compatibles con

| Categoría | Operaciones |
|---|---|
| **API** | CreateApi, GetApi, GetApis, UpdateApi, DeleteApi |
| **Rutas** | CreateRoute, GetRoute, GetRoutes, UpdateRoute, DeleteRoute |
| **Respuestas de ruta** | CreateRouteResponse, GetRouteResponse, GetRouteResponses, UpdateRouteResponse, DeleteRouteResponse |
| **Integraciones** | CreateIntegration, GetIntegration, GetIntegrations, UpdateIntegration, DeleteIntegration |
| **Respuestas de integración** | CreateIntegrationResponse, GetIntegrationResponse, GetIntegrationResponses, UpdateIntegrationResponse, DeleteIntegrationResponse |
| **Autorizadores** | CreateAuthorizer, GetAuthorizer, GetAuthorizers, UpdateAuthorizer, DeleteAuthorizer |
| **Etapas** | CreateStage, GetStage, GetStages, UpdateStage, DeleteStage |
| **Implementaciones** | CreateDeployment, GetDeployment, GetDeployments, UpdateDeployment, DeleteDeployment |
| **Modelos** | CreateModel, GetModel, GetModels, UpdateModel, DeleteModel |
| **Etiquetas** | TagResource, UntagResource, GetTags |

### WebSocket Plano de datos {#websocket-data-plane}

Floci admite conexiones WebSocket reales para las API API Gateway v2 WebSocket. Los clientes se conectan a través de:

```
ws://localhost:4566/ws/{apiId}/{stageName}
```

#### Funciones compatibles con

| Característica | Estado |
|---------|--------|
| Ruta `$connect` con integración Lambda | ✅ |
| Ruta `$disconnect` con integración Lambda | ✅ |
| Ruta `$default` (alternativa) | ✅ |
| Rutas personalizadas a través de `routeSelectionExpression` | ✅ |
| Expresión de selección de respuesta de ruta | ✅ |
| Lambda SOLICITAR autorizador en `$connect` | ✅ |
| Validación de fuente de identidad (encabezado/cadena de consulta) | ✅ |
| `@connections` POST (enviar mensaje al cliente) | ✅ |
| `@connections` GET (obtener información de conexión) | ✅ |
| `@connections` DELETE (desconectar cliente) | ✅ |
| Sustitución de variables de etapa en URI de integración | ✅ |
| Integración AWS_PROXY (Lambda) | ✅ |
| Integración AWS (Lambda con plantillas VTL) | ✅ |
| Integración HTTP_PROXY | ✅ |
| Integración HTTP (con plantillas VTL) | ✅ |
| Integración simulada | ✅ |
| GoneException (410) para conexiones desconectadas | ✅ |
| Soporte de marco binario (`isBase64Encoded: true`) | ✅ |
| Propagación de encabezados de respuesta `$connect` | ✅ |
| Aplicación del límite de tamaño de carga útil de 128 KB | ✅ |
| Tiempo de inactividad de 10 minutos | ✅ |
| Duración máxima de la conexión de 2 horas | ✅ |

#### @conexiones Gestión API

`@connections` API permite que el código del lado del servidor (por ejemplo, funciones Lambda) envíe mensajes a clientes conectados, recupere metadatos de conexión o desconecte clientes:

```
POST   /execute-api/{apiId}/{stageName}/@connections/{connectionId}  — Send message
GET    /execute-api/{apiId}/{stageName}/@connections/{connectionId}  — Get connection info
DELETE /execute-api/{apiId}/{stageName}/@connections/{connectionId}  — Disconnect client
```

#### Notas de comportamiento de

- **URL de conexión**: Floci usa `ws://localhost:4566/ws/{apiId}/{stage}` en lugar de `wss://{api-id}.execute-api.{region}.amazonaws.com/{stage}` de AWS.
- **Tiempo de espera de inactividad**: 10 minutos (coincide con el valor predeterminado de AWS). No configurable según API.
- **Duración máxima de la conexión**: 2 horas (coincidente con AWS). Las conexiones se cierran automáticamente.
- **Límite de tamaño de carga útil**: 128 KB por cuadro (que coincide con AWS). Los mensajes de gran tamaño reciben un marco de error.

### no implementado

- `ReimportApi`, `ExportApi`, `GetApiMapping`, `CreateApiMapping`, `DeleteApiMapping`
- `GetDomainName`, `CreateDomainName`, `DeleteDomainName`
- `CreateVpcLink`, `GetVpcLink`, `GetVpcLinks`, `UpdateVpcLink`, `DeleteVpcLink`

### Ejemplos de

```bash
export AWS_ENDPOINT_URL=http://localhost:4566

# Create an HTTP API
API_ID=$(aws apigatewayv2 create-api \
  --name "My HTTP API" \
  --protocol-type HTTP \
  --query ApiId --output text \
  --endpoint-url $AWS_ENDPOINT_URL)

# Create a Lambda integration
INTEGRATION_ID=$(aws apigatewayv2 create-integration \
  --api-id $API_ID \
  --integration-type AWS_PROXY \
  --integration-uri "arn:aws:lambda:us-east-1:000000000000:function:my-function" \
  --payload-format-version 2.0 \
  --query IntegrationId --output text \
  --endpoint-url $AWS_ENDPOINT_URL)

# Create a route
aws apigatewayv2 create-route \
  --api-id $API_ID \
  --route-key "GET /users" \
  --target "integrations/$INTEGRATION_ID" \
  --endpoint-url $AWS_ENDPOINT_URL

# Deploy
aws apigatewayv2 create-stage \
  --api-id $API_ID \
  --stage-name dev \
  --auto-deploy \
  --endpoint-url $AWS_ENDPOINT_URL
```

#### WebSocket API

```bash
export AWS_ENDPOINT_URL=http://localhost:4566

# Create a WebSocket API
WS_API_ID=$(aws apigatewayv2 create-api \
  --name "My WebSocket API" \
  --protocol-type WEBSOCKET \
  --route-selection-expression '$request.body.action' \
  --query ApiId --output text \
  --endpoint-url $AWS_ENDPOINT_URL)

# Create a Lambda integration
WS_INTEGRATION_ID=$(aws apigatewayv2 create-integration \
  --api-id $WS_API_ID \
  --integration-type AWS_PROXY \
  --integration-uri "arn:aws:lambda:us-east-1:000000000000:function:my-ws-handler" \
  --query IntegrationId --output text \
  --endpoint-url $AWS_ENDPOINT_URL)

# Create $connect, $disconnect, and $default routes
aws apigatewayv2 create-route \
  --api-id $WS_API_ID \
  --route-key '$connect' \
  --target "integrations/$WS_INTEGRATION_ID" \
  --endpoint-url $AWS_ENDPOINT_URL

aws apigatewayv2 create-route \
  --api-id $WS_API_ID \
  --route-key '$disconnect' \
  --target "integrations/$WS_INTEGRATION_ID" \
  --endpoint-url $AWS_ENDPOINT_URL

aws apigatewayv2 create-route \
  --api-id $WS_API_ID \
  --route-key '$default' \
  --route-response-selection-expression '$default' \
  --target "integrations/$WS_INTEGRATION_ID" \
  --endpoint-url $AWS_ENDPOINT_URL

# Deploy
aws apigatewayv2 create-stage \
  --api-id $WS_API_ID \
  --stage-name prod \
  --endpoint-url $AWS_ENDPOINT_URL

# Connect via WebSocket (using wscat or any WebSocket client)
# wscat -c ws://localhost:4566/ws/$WS_API_ID/prod

# Send a message to a connected client via @connections API
# curl -X POST http://localhost:4566/execute-api/$WS_API_ID/prod/@connections/$CONNECTION_ID \
#   -d "Hello from server"

# Get connection info
# curl http://localhost:4566/execute-api/$WS_API_ID/prod/@connections/$CONNECTION_ID

# Disconnect a client
# curl -X DELETE http://localhost:4566/execute-api/$WS_API_ID/prod/@connections/$CONNECTION_ID
```
