# Inicio rápido

Esta guía ejecuta Floci y verifica que los comandos AWS CLI funcionen en menos de cinco minutos.

## Paso 1: Inicie Floci

=== "Nativo (recomendado)"

    `latest` es la imagen nativa: inicio en menos de un segundo, memoria mínima:

    ```yaml
    services:
      floci:
        image: floci/floci:latest
        ports:
          - "4566:4566"
        volumes:
          # Local directory bind mount (default)
          - ./data:/app/data
    
          # OR named volume (optional):
          # - floci-data:/app/data
    
    # volumes:
    #   floci-data:
    ```

    ```bash
    docker compose up -d
    ```

=== "JVM"

    Utilice `latest-jvm` si necesita una compatibilidad de plataforma más amplia:

    ```yaml
    services:
      floci:
        image: floci/floci:latest-jvm
        ports:
          - "4566:4566"
        volumes:
          # Local directory bind mount (default)
          - ./data:/app/data
    
          # OR named volume (optional):
          # - floci-data:/app/data
    
    # volumes:
    #   floci-data:
    ```

    ```bash
    docker compose up -d
    ```

=== "Construir desde la fuente"

    ```bash
    git clone https://github.com/floci-io/floci.git
    cd floci
    mvn quarkus:dev   # hot reload, port 4566
    ```

## Paso 2: Configurar AWS CLI

Floci acepta cualquier credencial ficticia; no se necesita una cuenta AWS real.

```bash
export AWS_ENDPOINT_URL=http://localhost:4566
export AWS_DEFAULT_REGION=us-east-1
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
```

Agréguelos a su perfil de shell (`.bashrc` / `.zshrc`) para que persistan en todas las sesiones.

## Paso 3: verificar la configuración

Realice algunas pruebas rápidas de humo:

```bash
# S3 — create a bucket and upload a file
aws s3 mb s3://my-bucket --endpoint-url $AWS_ENDPOINT_URL
echo "hello floci" | aws s3 cp - s3://my-bucket/hello.txt --endpoint-url $AWS_ENDPOINT_URL
aws s3 ls s3://my-bucket --endpoint-url $AWS_ENDPOINT_URL

# SQS — create a queue and send a message
aws sqs create-queue --queue-name orders --endpoint-url $AWS_ENDPOINT_URL
aws sqs send-message \
  --queue-url $AWS_ENDPOINT_URL/000000000000/orders \
  --message-body '{"event":"order.placed"}' \
  --endpoint-url $AWS_ENDPOINT_URL

# DynamoDB — create a table
aws dynamodb create-table \
  --table-name Users \
  --attribute-definitions AttributeName=id,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --endpoint-url $AWS_ENDPOINT_URL
```

Deberías ver respuestas exitosas para los tres comandos.

## Paso 4: Úselo en su aplicación

Apunte su AWS SDK a Floci de la misma manera:

=== "Java"

    ```java
    S3Client s3 = S3Client.builder()
        .endpointOverride(URI.create("http://localhost:4566"))
        .region(Region.US_EAST_1)
        .credentialsProvider(StaticCredentialsProvider.create(
            AwsBasicCredentials.create("test", "test")))
        .build();
    ```

=== "Python (boto3)"

    ```python
    import boto3

    s3 = boto3.client(
        "s3",
        endpoint_url="http://localhost:4566",
        region_name="us-east-1",
        aws_access_key_id="test",
        aws_secret_access_key="test",
    )
    ```

=== "Node.js"

    ```javascript
    import { S3Client } from "@aws-sdk/client-s3";

    const s3 = new S3Client({
      endpoint: "http://localhost:4566",
      region: "us-east-1",
      credentials: { accessKeyId: "test", secretAccessKey: "test" },
      forcePathStyle: true,
    });
    ```

=== "Go"

    ```go
    cfg, _ := config.LoadDefaultConfig(context.TODO(),
        config.WithRegion("us-east-1"),
        config.WithEndpointResolverWithOptions(
            aws.EndpointResolverWithOptionsFunc(func(service, region string, opts ...interface{}) (aws.Endpoint, error) {
                return aws.Endpoint{URL: "http://localhost:4566"}, nil
            }),
        ),
    )
    client := s3.NewFromConfig(cfg)
    ```

## Paso 5: (opcional) Insertar y extraer una imagen de contenedor para emular el ECR

Floci emula ECR con un registro OCI real detrás, por lo que el cliente original `docker` funciona con los repositorios que crea a través de AWS CLI. No se necesita configuración de demonio: Floci devuelve URI de repositorio que se resuelven en bucle invertido, en los que `docker` confía automáticamente como inseguros.

```bash
# Create the repository (lazy-starts the backing registry container)
aws ecr create-repository --repository-name floci-it/app --endpoint-url $AWS_ENDPOINT

# Authenticate
aws ecr get-login-password --endpoint-url $AWS_ENDPOINT \
  | docker login --username AWS --password-stdin \
        000000000000.dkr.ecr.us-east-1.localhost:5000

# Push
docker pull alpine:3.19
docker tag  alpine:3.19 000000000000.dkr.ecr.us-east-1.localhost:5000/floci-it/app:v1
docker push             000000000000.dkr.ecr.us-east-1.localhost:5000/floci-it/app:v1

# Pull from a clean local image store
docker rmi  000000000000.dkr.ecr.us-east-1.localhost:5000/floci-it/app:v1
docker pull 000000000000.dkr.ecr.us-east-1.localhost:5000/floci-it/app:v1
```

Consulte los [documentos de servicio ECR](../services/ecr.md) para conocer la superficie de acción completa, la integración de Lambda con respaldo de imagen y la compatibilidad con CDK `DockerImageFunction`.

## Lambda en Linux nativo Docker (UFW)

Cuando Floci se ejecuta **de forma nativa en un host Linux** (no en el escritorio Docker), los contenedores de funciones Lambda llegan al servidor Runtime API de Floci a través de la puerta de enlace del puente acoplable. En Ubuntu/Pop!_OS/Debian con **UFW habilitado**, la política predeterminada de `INPUT DROP` descarta silenciosamente estos paquetes y las invocaciones de Lambda expiran con `Function.TimedOut`. Esto afecta a todos los tipos de empaquetado Lambda: funciones Zip *y* respaldadas por imágenes implementadas a través de ECR emulado.

**Solución única**, con alcance únicamente en el puente acoplable (no expone nada a la red; `docker0` es interno):

```bash
sudo ufw allow in on docker0 comment 'floci: containers reach host'
```

Si desea limitar el alcance solo a los rangos de puertos de registro Lambda Runtime API y ECR:

```bash
sudo ufw allow in on docker0 to any port 9200:9299 proto tcp comment 'floci lambda runtime api'
sudo ufw allow in on docker0 to any port 5000:5099 proto tcp comment 'floci ecr registry'
```

**Escritorio Docker** (macOS/Windows/Linux) no necesita esto: enruta el contenedor → el host a través de la máquina virtual Docker, que el `DockerHostResolver` de Floci detecta automáticamente.

**Floci-in-Docker** (que ejecuta la imagen Floci publicada dentro de un contenedor) tampoco necesita esto: los contenedores Lambda y Floci comparten la misma red acoplable y se comunican entre sí a través de IP de contenedor.

## Próximos pasos

- [Configurar Docker Compose con los puertos ElastiCache y RDS](../configuration/docker-compose.md)
- [Referencia de variables de entorno](../configuration/environment-variables.md)
- [Referencia de application.yml (compilaciones fuente)](../configuration/advanced/application-yml.md)
- [Buscar documentación por servicio](../services/index.md)
