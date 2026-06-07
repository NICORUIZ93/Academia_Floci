# Aislamiento de múltiples cuentas

Floci admite el aislamiento completo de recursos por cuenta desde el primer momento. Los recursos creados por una cuenta son invisibles para todas las demás; no se requiere ningún indicador de configuración.

## Cómo funciona

Cada solicitud entrante lleva un encabezado AWS SigV4 `Authorization`. Floci lee el **ID de clave de acceso** (AKID) de ese encabezado y aplica una regla simple:

> **Si el AKID tiene exactamente 12 dígitos, se utiliza como ID de cuenta.**  
> Cualquier otro formato de clave (por ejemplo, `AKIAIOSFODNN7EXAMPLE`) vuelve a ser `FLOCI_DEFAULT_ACCOUNT_ID`.

```
Authorization: AWS4-HMAC-SHA256 Credential=111111111111/20260510/us-east-1/sqs/aws4_request, ...
                                            ^^^^^^^^^^^^
                                            12-digit AKID → account ID 111111111111
```

Una vez que se determina el ID de la cuenta, cada lectura y escritura de almacenamiento tiene un espacio de nombres transparente debajo de él. Una cola SQS denominada `orders` creada por la cuenta `111111111111` se almacena y se recupera como `111111111111/orders`, completamente separada del mismo nombre de cola en la cuenta `222222222222`.

!!! nota "La misma convención que LocalStack"
    Esta regla de ID de cuenta AKID → de 12 dígitos coincide con el comportamiento de múltiples cuentas de LocalStack, por lo que las configuraciones de prueba de múltiples cuentas existentes funcionan sin cambios.

## Comportamiento predeterminado de (cuenta única)

Si utiliza credenciales que no sean de 12 dígitos (por ejemplo, `test`, `AKIA…`), todas las solicitudes se resuelven en el ID de cuenta predeterminado:

```bash
FLOCI_DEFAULT_ACCOUNT_ID=000000000000   # default
```

Todos los ARN y URL utilizan este valor:

```
arn:aws:sqs:us-east-1:000000000000:my-queue
http://localhost:4566/000000000000/my-queue
```

Puede cambiar el ID de cuenta predeterminado sin habilitar el aislamiento por solicitud:

```bash
FLOCI_DEFAULT_ACCOUNT_ID=123456789012
```

## Habilitación del aislamiento de múltiples cuentas

Utilice ID de clave de acceso numérica de 12 dígitos. La clave de acceso secreta puede ser cualquier cadena que no esté vacía: Floci no valida firmas de forma predeterminada.

### AWS CLI

```bash
# Configure two named profiles
aws configure --profile account-a
# AWS Access Key ID: 111111111111
# AWS Secret Access Key: test

aws configure --profile account-b
# AWS Access Key ID: 222222222222
# AWS Secret Access Key: test

export AWS_ENDPOINT_URL=http://localhost:4566

# Create the same queue name under both accounts
aws sqs create-queue --queue-name orders --profile account-a
aws sqs create-queue --queue-name orders --profile account-b

# Each account sees only its own queue
aws sqs list-queues --profile account-a   # → .../111111111111/orders
aws sqs list-queues --profile account-b   # → .../222222222222/orders
```

### AWS SDK (Java)

```java
StaticCredentialsProvider accountA = StaticCredentialsProvider.create(
    AwsBasicCredentials.create("111111111111", "test"));

StaticCredentialsProvider accountB = StaticCredentialsProvider.create(
    AwsBasicCredentials.create("222222222222", "test"));

SqsClient clientA = SqsClient.builder()
    .endpointOverride(URI.create("http://localhost:4566"))
    .region(Region.US_EAST_1)
    .credentialsProvider(accountA)
    .build();

SqsClient clientB = SqsClient.builder()
    .endpointOverride(URI.create("http://localhost:4566"))
    .region(Region.US_EAST_1)
    .credentialsProvider(accountB)
    .build();

// Both calls succeed, resources are fully isolated
clientA.createQueue(r -> r.queueName("orders"));
clientB.createQueue(r -> r.queueName("orders"));
```

### AWS SDK (Python)

```python
import boto3

def client(service, account_id):
    return boto3.client(
        service,
        endpoint_url="http://localhost:4566",
        region_name="us-east-1",
        aws_access_key_id=account_id,      # 12-digit → account ID
        aws_secret_access_key="test",
    )

sqs_a = client("sqs", "111111111111")
sqs_b = client("sqs", "222222222222")

sqs_a.create_queue(QueueName="orders")
sqs_b.create_queue(QueueName="orders")

print(sqs_a.list_queues()["QueueUrls"])  # [".../111111111111/orders"]
print(sqs_b.list_queues()["QueueUrls"])  # [".../222222222222/orders"]
```

## Los ARN de incluyen el ID de cuenta correcto

Floci incorpora el ID de cuenta resuelto en cada ARN que genera:

```
arn:aws:sqs:us-east-1:111111111111:orders
arn:aws:lambda:us-east-1:222222222222:function:my-fn
arn:aws:s3:::my-bucket                         # S3 ARNs are account-agnostic
```

## Alcance de aislamiento

Todos los servicios que utilizan `StorageFactory` participan en el aislamiento de la cuenta automáticamente. Esto cubre todos los servicios en Floci: SQS, SNS, S3, DynamoDB, Lambda, SSM, Secrets Manager, KMS, Kinesis, EventBridge, Cognito, RDS, ElastiCache, OpenSearch, MSK y más.

Los trabajadores en segundo plano (sondeadores de origen de eventos Lambda, barredor TTL DynamoDB, sondeador de preparación MSK, sondeador de preparación OpenSearch) iteran en todas las cuentas internamente y enrutan las escrituras de regreso a la cuenta de origen. No se filtran datos entre cuentas a través de estas rutas asíncronas.

## Validación de firma

De forma predeterminada, Floci **no** valida las firmas de SigV4; solo el ID de la clave de acceso importa para la resolución de la cuenta. La clave de acceso secreta puede ser cualquier cadena que no esté vacía.

Para hacer cumplir la validación de firma real:

```bash
FLOCI_AUTH_VALIDATE_SIGNATURES=true
FLOCI_AUTH_PRESIGN_SECRET=your-secret   # for pre-signed URL verification
```

Cuando `validate-signatures` es `false` (el valor predeterminado), el aislamiento de la cuenta aún funciona correctamente: el AKID se extrae del encabezado `Authorization` independientemente de si la firma en sí está verificada.

## Persistencia y aislamiento de cuentas

Las claves de almacenamiento tienen espacios de nombres por cuenta en la capa de persistencia. Cuando se utilizan los modos de almacenamiento `persistent`, `hybrid` o `wal`, los datos de cada cuenta se almacenan bajo su propio prefijo de clave. Al reiniciar Floci se restauran los recursos de cada cuenta de forma independiente.

## Referencia de configuración de

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_DEFAULT_ACCOUNT_ID` | `000000000000` | ID de cuenta utilizada cuando el AKID no tiene exactamente 12 dígitos |
| `FLOCI_DEFAULT_REGION` | `us-east-1` | Región utilizada cuando no se puede derivar del encabezado `Authorization` |
| `FLOCI_AUTH_VALIDATE_SIGNATURES` | `false` | Hacer cumplir la verificación de firma SigV4 |
