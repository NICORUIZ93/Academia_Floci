# Módulo 6 · API Gateway y diseño de APIs REST

## ¿Qué es API Gateway?

API Gateway es el "portero" de tu backend: recibe peticiones HTTP, las valida, las enruta y las envía a Lambda (u otros backends). Te permite separar el contrato público de tu API de la implementación interna.

| AWS | Azure | GCP |
|-----|-------|-----|
| API Gateway v1 (REST) / v2 (HTTP) | Azure Functions con triggers HTTP | Cloud Run / API Gateway GCP |
| Puerto Floci: 4566 | Puerto Floci-az: 4577 | — |

---

## API Gateway v2 (HTTP API) — la opción moderna

La v2 es más simple, más rápida y más barata que la v1. Úsala para APIs nuevas.

### Crea la API + Lambda + ruta en un solo flujo

```bash
eval $(floci env)

# 1. Código de la Lambda API
cat > api_handler.py << 'EOF'
import json

def handler(event, context):
    metodo = event.get("requestContext", {}).get("http", {}).get("method", "")
    path = event.get("rawPath", "")
    body_raw = event.get("body", "{}")
    body = json.loads(body_raw) if body_raw else {}

    if path == "/tareas" and metodo == "GET":
        tareas = [
            {"id": "1", "titulo": "Aprender API Gateway", "estado": "pendiente"},
            {"id": "2", "titulo": "Desplegar Lambda", "estado": "completada"}
        ]
        return {"statusCode": 200, "body": json.dumps(tareas)}

    if path == "/tareas" and metodo == "POST":
        return {
            "statusCode": 201,
            "body": json.dumps({"mensaje": "Tarea creada", "datos": body})
        }

    return {"statusCode": 404, "body": json.dumps({"error": "Ruta no encontrada"})}
EOF

zip api.zip api_handler.py

# 2. Crea la Lambda
aws lambda create-function \
  --function-name api-tareas \
  --runtime python3.11 \
  --handler api_handler.handler \
  --role arn:aws:iam::000000000000:role/rol-lambda \
  --zip-file fileb://api.zip

# 3. Crea el API Gateway HTTP (v2)
API_ID=$(aws apigatewayv2 create-api \
  --name mi-api \
  --protocol-type HTTP \
  --query ApiId --output text)

echo "API ID: $API_ID"

# 4. Obtén el ARN de la Lambda
LAMBDA_ARN=$(aws lambda get-function \
  --function-name api-tareas \
  --query "Configuration.FunctionArn" --output text)

# 5. Crea la integración Lambda
INTEG_ID=$(aws apigatewayv2 create-integration \
  --api-id $API_ID \
  --integration-type AWS_PROXY \
  --integration-uri $LAMBDA_ARN \
  --payload-format-version 2.0 \
  --query IntegrationId --output text)

# 6. Agrega las rutas
aws apigatewayv2 create-route \
  --api-id $API_ID \
  --route-key "GET /tareas" \
  --target integrations/$INTEG_ID

aws apigatewayv2 create-route \
  --api-id $API_ID \
  --route-key "POST /tareas" \
  --target integrations/$INTEG_ID

# 7. Despliega el stage
aws apigatewayv2 create-stage \
  --api-id $API_ID \
  --stage-name dev \
  --auto-deploy

# 8. Obtén la URL
API_URL="http://localhost:4566/restapis/$API_ID/dev/_user_request_"
echo "URL: $API_URL"
```

### Prueba la API

```bash
# GET /tareas
curl "$API_URL/tareas" | jq .

# POST /tareas
curl -X POST "$API_URL/tareas" \
  -H "Content-Type: application/json" \
  -d '{"titulo":"Nueva tarea","estado":"pendiente"}' | jq .
```

---

## API Gateway v1 (REST API) — más potente y más configuración

```bash
# Crea la REST API
REST_ID=$(aws apigateway create-rest-api \
  --name api-rest-tareas \
  --query id --output text)

# Obtén el resource root
ROOT_ID=$(aws apigateway get-resources \
  --rest-api-id $REST_ID \
  --query "items[?path=='/'].id" --output text)

# Crea el recurso /tareas
TAREAS_ID=$(aws apigateway create-resource \
  --rest-api-id $REST_ID \
  --parent-id $ROOT_ID \
  --path-part tareas \
  --query id --output text)

# Agrega el método GET
aws apigateway put-method \
  --rest-api-id $REST_ID \
  --resource-id $TAREAS_ID \
  --http-method GET \
  --authorization-type NONE

# Integra con Lambda
aws apigateway put-integration \
  --rest-api-id $REST_ID \
  --resource-id $TAREAS_ID \
  --http-method GET \
  --type AWS_PROXY \
  --integration-http-method POST \
  --uri "arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/$LAMBDA_ARN/invocations"

# Despliega
aws apigateway create-deployment \
  --rest-api-id $REST_ID \
  --stage-name prod
```

---

## Parámetros de ruta y query strings

```python
def handler(event, context):
    # Parámetro de ruta: /tareas/{id}
    tarea_id = event.get("pathParameters", {}) or {}
    tarea_id = tarea_id.get("id", "")

    # Query string: /tareas?estado=pendiente
    query = event.get("queryStringParameters", {}) or {}
    estado = query.get("estado", "todos")

    # Headers
    headers = event.get("headers", {}) or {}
    content_type = headers.get("content-type", "")

    return {
        "statusCode": 200,
        "body": json.dumps({
            "id": tarea_id,
            "estado": estado,
            "content_type": content_type
        })
    }
```

---

## Diseño de API REST — buenas prácticas

```
# Bien — verbos HTTP hacen el trabajo, rutas son sustantivos
GET    /tareas           → lista todas las tareas
POST   /tareas           → crea una tarea
GET    /tareas/{id}      → obtiene una tarea
PUT    /tareas/{id}      → reemplaza una tarea
PATCH  /tareas/{id}      → actualiza campos específicos
DELETE /tareas/{id}      → elimina una tarea

# Mal — verbos en la ruta (esto no es REST)
POST /crearTarea
GET  /obtenerTareas
GET  /borrarTarea?id=123
```

Códigos HTTP correctos:
- 200 OK — operación exitosa
- 201 Created — recurso creado (POST)
- 400 Bad Request — input inválido del cliente
- 404 Not Found — recurso no existe
- 422 Unprocessable — input bien formado pero inválido (validación de negocio)
- 500 Internal Server Error — fallo del servidor

---

## Reto del módulo

1. Crea un HTTP API (v2) con rutas GET/POST/DELETE para `/tareas`
2. La Lambda debe persistir en DynamoDB (tabla del Módulo 3)
3. Prueba cada ruta con `curl` y verifica que los códigos HTTP son correctos
4. Agrega un parámetro de ruta: `GET /tareas/{id}` que retorne la tarea específica

## Preguntas de salida

1. ¿Qué diferencia hay entre API Gateway v1 y v2?
2. ¿Por qué el método de integración con Lambda es siempre POST aunque la ruta sea GET?
3. ¿Cuál es la diferencia entre PUT y PATCH?
4. ¿Qué código HTTP debes devolver cuando el JSON es inválido?
