# Módulo 5 · Funciones sin servidor: Lambda, Azure Functions y GCP Cloud Functions

## ¿Qué es una función sin servidor (serverless)?

Serverless significa que el proveedor gestiona el servidor — tú solo escribes código. La función ejecuta en respuesta a un evento y pagas solo por el tiempo de ejecución, no por servidores 24/7.

| AWS | Azure | GCP |
|-----|-------|-----|
| AWS Lambda | Azure Functions | Cloud Functions |
| Floci: puerto 4566 | Floci-az: puerto 4577 | No en Floci-gcp |

**Floci usa Docker real para Lambda** — cada función corre en un contenedor real del runtime correspondiente.

---

## AWS Lambda con Floci

### Crea tu primera función Lambda

```bash
eval $(floci env)

# 1. Escribe el código de la función
cat > handler.py << 'EOF'
import json

def lambda_handler(event, context):
    nombre = event.get("nombre", "mundo")
    return {
        "statusCode": 200,
        "body": json.dumps({"mensaje": f"Hola, {nombre}! Desde Lambda local"})
    }
EOF

# 2. Empaqueta en un ZIP
zip function.zip handler.py

# 3. Crea la función
aws lambda create-function \
  --function-name mi-funcion \
  --runtime python3.11 \
  --handler handler.lambda_handler \
  --role arn:aws:iam::000000000000:role/rol-lambda \
  --zip-file fileb://function.zip

# 4. Invoca la función
aws lambda invoke \
  --function-name mi-funcion \
  --payload '{"nombre":"Alice"}' \
  --cli-binary-format raw-in-base64-out \
  resultado.json

cat resultado.json
```

### Actualiza el código

```bash
# Modifica el handler.py y vuelve a empaquetar
zip function.zip handler.py

aws lambda update-function-code \
  --function-name mi-funcion \
  --zip-file fileb://function.zip
```

### Lambda con variables de entorno

```bash
aws lambda update-function-configuration \
  --function-name mi-funcion \
  --environment Variables="{ENTORNO=local,TABLA=Tareas,COLA=mi-cola}"
```

```python
import os, json

def lambda_handler(event, context):
    return {
        "statusCode": 200,
        "body": json.dumps({
            "entorno": os.environ.get("ENTORNO"),
            "tabla": os.environ.get("TABLA")
        })
    }
```

### Lambda con Node.js

```bash
cat > index.js << 'EOF'
exports.handler = async (event) => {
    const nombre = event.nombre || 'mundo';
    return {
        statusCode: 200,
        body: JSON.stringify({ mensaje: `Hola, ${nombre}! Desde Node.js Lambda` })
    };
};
EOF

zip node-function.zip index.js

aws lambda create-function \
  --function-name mi-funcion-node \
  --runtime nodejs18.x \
  --handler index.handler \
  --role arn:aws:iam::000000000000:role/rol-lambda \
  --zip-file fileb://node-function.zip
```

### Lambda que lee DynamoDB

```python
import boto3, json, os

dynamodb = boto3.resource("dynamodb",
    endpoint_url=os.environ.get("AWS_ENDPOINT_URL", "http://localhost:4566"),
    region_name="us-east-1",
    aws_access_key_id="test",
    aws_secret_access_key="test"
)

def lambda_handler(event, context):
    table = dynamodb.Table("Tareas")
    resp = table.get_item(Key={"PK": event["PK"], "SK": event["SK"]})
    item = resp.get("Item", {})
    return {"statusCode": 200, "body": json.dumps(item)}
```

### Lambda con trigger de SQS

```bash
# Conecta la Lambda a la cola SQS (event source mapping)
QUEUE_ARN=$(aws sqs get-queue-attributes \
  --queue-url $(aws sqs get-queue-url --queue-name mi-cola --query QueueUrl --output text) \
  --attribute-names QueueArn \
  --query Attributes.QueueArn --output text)

aws lambda create-event-source-mapping \
  --function-name mi-funcion \
  --event-source-arn $QUEUE_ARN \
  --batch-size 5
```

### Listar y gestionar funciones

```bash
aws lambda list-functions --query "Functions[*].[FunctionName,Runtime,LastModified]" --output table

aws lambda get-function --function-name mi-funcion

aws lambda delete-function --function-name mi-funcion
```

---

## Azure Functions con Floci-az

```bash
eval $(floci az env)
```

```python
import azure.functions as func
import json

app = func.FunctionApp()

@app.function_name("HolaMundo")
@app.route(route="hola", methods=["GET", "POST"])
def hola_mundo(req: func.HttpRequest) -> func.HttpResponse:
    nombre = req.params.get("nombre") or "mundo"
    return func.HttpResponse(
        json.dumps({"mensaje": f"Hola, {nombre}!"}),
        mimetype="application/json"
    )
```

---

## Patrón: función que transforma y persiste datos

```python
import boto3, json

s3 = boto3.client("s3", endpoint_url="http://localhost:4566",
    region_name="us-east-1", aws_access_key_id="test", aws_secret_access_key="test")

dynamodb = boto3.resource("dynamodb", endpoint_url="http://localhost:4566",
    region_name="us-east-1", aws_access_key_id="test", aws_secret_access_key="test")

def lambda_handler(event, context):
    # Evento viene de S3 (trigger cuando sube un archivo)
    bucket = event["Records"][0]["s3"]["bucket"]["name"]
    key = event["Records"][0]["s3"]["object"]["key"]

    # Lee el archivo
    obj = s3.get_object(Bucket=bucket, Key=key)
    datos = json.loads(obj["Body"].read())

    # Persiste en DynamoDB
    table = dynamodb.Table("Tareas")
    table.put_item(Item={
        "PK": f"FILE#{key}",
        "SK": "META",
        "bucket": bucket,
        "registros": len(datos)
    })

    return {"statusCode": 200, "body": f"Procesados {len(datos)} registros"}
```

---

## Comparación

| | Lambda (AWS) | Azure Functions | Cloud Functions (GCP) |
|-|-------------|-----------------|----------------------|
| Runtimes | Python, Node, Java, Go, Ruby, .NET | C#, Python, Node, Java, PowerShell | Python, Node, Go, Java, PHP |
| Timeout máximo | 15 min | 10 min (Consumption) | 60 min (Gen2) |
| Cold start | ~100ms (contenedor cálido) | Similar | Similar |
| Trigger SQS/Queues | Sí nativo | Sí nativo | Sí nativo |

---

## Reto del módulo

1. Crea una Lambda Python que reciba `{"PK": "...", "titulo": "..."}` y guarde en DynamoDB tabla `Tareas`
2. Invoca la Lambda con la CLI y verifica el registro en DynamoDB
3. Crea una segunda Lambda que lista las tareas de un usuario y devuelve el JSON
4. (Bonus) Conecta la segunda Lambda a una cola SQS con event source mapping

## Preguntas de salida

1. ¿Por qué Lambda usa Docker en Floci y qué ventaja tiene eso?
2. ¿Qué es el cold start y cuándo importa?
3. ¿Cómo pasas credenciales seguras a una Lambda en producción?
4. ¿Qué diferencia hay entre invocar Lambda síncronamente vs asíncronamente?
## Verificación del aprendizaje

Antes de marcar este módulo como completado, confirma esto con evidencia propia:

1. **Lo puedo explicar en una frase.** Escribe qué problema resuelve este módulo y para qué lo usarías en una aplicación real.
2. **Lo ejecuté, no solo lo leí.** Guarda el comando principal que corriste y una salida real de tu terminal.
3. **Lo puedo verificar.** Consulta el recurso con AWS CLI, Azure CLI, GCP CLI o StackPort cuando aplique. La evidencia debe mostrar nombre, estado o contenido del recurso.
4. **Entiendo un fallo común.** Provoca o identifica un error sencillo, copia el mensaje completo y explica cómo lo diagnosticaste.
5. **Sé cuándo avanzar.** Avanza solo si puedes repetir el laboratorio desde una carpeta limpia sin depender de copiar a ciegas.

Evidencia mínima sugerida:

```text
Comando ejecutado:
Salida obtenida:
Qué significa la salida:
Error o duda encontrada:
Cómo la resolví:
```

