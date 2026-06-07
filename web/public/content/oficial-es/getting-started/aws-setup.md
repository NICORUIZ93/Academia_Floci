# Configuración de AWS CLI y SDK

Floci acepta cualquier credencial que no esté vacía; no se necesita una cuenta AWS real.

## Variables de entorno

El enfoque más sencillo para el desarrollo local:

```bash
export AWS_ENDPOINT_URL=http://localhost:4566
export AWS_DEFAULT_REGION=us-east-1
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
```

## Perfil AWS CLI

Agregue un perfil dedicado a `~/.aws/config` y `~/.aws/credentials`:

```ini title="~/.aws/config"
[profile floci]
region = us-east-1
output = json
```

```ini title="~/.aws/credentials"
[floci]
aws_access_key_id = test
aws_secret_access_key = test
```

Luego úselo con cada comando:

```bash
aws s3 ls --profile floci --endpoint-url http://localhost:4566
```

O configúrelo como predeterminado para su sesión de shell:

```bash
export AWS_PROFILE=floci
export AWS_ENDPOINT_URL=http://localhost:4566
```

## Configuración de SDK

### Java (AWS SDK v2)

```java
// Reusable endpoint override
URI endpoint = URI.create("http://localhost:4566");
AwsCredentialsProvider creds = StaticCredentialsProvider.create(
    AwsBasicCredentials.create("test", "test"));
Region region = Region.US_EAST_1;

// Build any client the same way
DynamoDbClient dynamo = DynamoDbClient.builder()
    .endpointOverride(endpoint)
    .region(region)
    .credentialsProvider(creds)
    .build();

SqsClient sqs = SqsClient.builder()
    .endpointOverride(endpoint)
    .region(region)
    .credentialsProvider(creds)
    .build();
```

### Python (boto3)

```python
import boto3

def floci_client(service):
    return boto3.client(
        service,
        endpoint_url="http://localhost:4566",
        region_name="us-east-1",
        aws_access_key_id="test",
        aws_secret_access_key="test",
    )

s3   = floci_client("s3")
sqs  = floci_client("sqs")
dynamo = floci_client("dynamodb")
```

### Node.js / TypeScript

```typescript
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { SQSClient } from "@aws-sdk/client-sqs";

const config = {
  endpoint: "http://localhost:4566",
  region: "us-east-1",
  credentials: { accessKeyId: "test", secretAccessKey: "test" },
};

const dynamo = new DynamoDBClient(config);
const sqs = new SQSClient(config);
```

!!! consejo "URL de estilo de ruta S3"
    Cuando utilice S3 con AWS SDK v3 (Node.js), agregue `forcePathStyle: true` al objeto de configuración. Floci sirve a S3 en modo de estilo de ruta (`http://localhost:4566/bucket-name`).

### Go

```go
import (
    "github.com/aws/aws-sdk-go-v2/config"
    "github.com/aws/aws-sdk-go-v2/credentials"
)

cfg, err := config.LoadDefaultConfig(context.TODO(),
    config.WithRegion("us-east-1"),
    config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider("test", "test", "")),
    config.WithEndpointResolverWithOptions(
        aws.EndpointResolverWithOptionsFunc(
            func(service, region string, opts ...interface{}) (aws.Endpoint, error) {
                return aws.Endpoint{URL: "http://localhost:4566"}, nil
            },
        ),
    ),
)
```

## ID de cuenta

Floci utiliza el ID de cuenta `000000000000` en todos los ARN y URL de cola de forma predeterminada:

```
arn:aws:sqs:us-east-1:000000000000:my-queue
http://localhost:4566/000000000000/my-queue
```

Cambie el valor predeterminado con `FLOCI_DEFAULT_ACCOUNT_ID`:

```bash
FLOCI_DEFAULT_ACCOUNT_ID=123456789012
```

**También se admite el aislamiento de múltiples cuentas**: si su ID de clave de acceso tiene exactamente 12 dígitos, Floci la usa directamente como ID de cuenta y aísla completamente los recursos de esa cuenta de todos los demás. Consulte [Aislamiento de cuentas múltiples](../configuration/multi-account.md) para obtener más detalles.