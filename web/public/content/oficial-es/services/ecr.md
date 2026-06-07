# ECR

**Protocolo:** JSON 1.1 (`X-Amz-Target: AmazonEC2ContainerRegistry_V20150921.*`) para el plano de control.
**Plano de datos:** OCI Distribution Spec v2 (`/v2/...`), servido por un contenedor `registry:2` real administrado por Floci.
**Punto final:** `POST http://localhost:4566/` para el plano de control; `<account>.dkr.ecr.<region>.localhost:<port>/<repo>` para `docker push` / `docker pull`.

## Acciones admitidas

| Acción | Descripción |
| --- | --- |
| `CreateRepository` | Crear un nuevo repositorio (inicia lentamente el registro de respaldo en la primera llamada) |
| `DescribeRepositories` | Listar repositorios o buscar por nombre |
| `DeleteRepository` | Eliminar un repositorio (con semántica `force=true` para repositorios no vacíos) |
| `GetAuthorizationToken` | Devuelve un token de inicio de sesión de Docker + punto final proxy |
| `ListImages` | Enumerar etiquetas y resúmenes en un repositorio |
| `DescribeImages` | Metadatos de imagen: resumen, tamaño, marca de tiempo de envío, tipo de medio de manifiesto |
| `BatchGetImage` | Obtener manifiestos de imágenes, en honor a `acceptedMediaTypes` |
| `BatchDeleteImage` | Eliminar imágenes por etiqueta o resumen |
| `PutImageTagMutability` | Establecer mutabilidad de etiquetas (ida y vuelta; no se aplica al insertar) |
| `TagResource` / `UntagResource` / `ListTagsForResource` | Etiquetado de recursos |
| `PutLifecyclePolicy` / `GetLifecyclePolicy` / `DeleteLifecyclePolicy` | Política de ciclo de vida de ida y vuelta (almacenada, no aplicada) |
| `SetRepositoryPolicy` / `GetRepositoryPolicy` / `DeleteRepositoryPolicy` | Política de repositorio de ida y vuelta (almacenada, no aplicada) |

### Puntos finales de administración

| Punto final | Descripción |
| --- | --- |
| `POST /_floci/ecr/gc` | Ejecute la recolección de basura en el contenedor `registry:2` de respaldo para recuperar el disco después de la eliminación de imágenes |

## Comportamiento de emulación

- **Respaldo de registro real OCI.** Un único contenedor `registry:2` compartido por instancia de Floci sirve a todos los repositorios. El contenedor se inicia de forma diferida en la primera llamada a ECR API y se reutiliza en los reinicios de Floci (`keep-running-on-shutdown: true` de forma predeterminada), por lo que los bytes de imagen enviados sobreviven a los reinicios.
- **Esquema de URI de bucle invertido.** Los URI del repositorio siguen a `<account>.dkr.ecr.<region>.localhost:<registryPort>/<repoName>`. RFC 6761 reserva `*.localhost` para resolver en la dirección de bucle invertido, y el demonio acoplable confía automáticamente en el bucle invertido como un registro inseguro, por lo que **no se requieren cambios en la configuración del demonio**: `docker push` y `docker pull` funcionan de inmediato. Un respaldo de estilo URI `path` (`localhost:<port>/<account>/<region>/<repo>`) está disponible a través de `floci.services.ecr.uri-style: path` para entornos donde la resolución `*.localhost` no se comporta correctamente.
- **Autorización.** `GetAuthorizationToken` devuelve `Base64("AWS:floci")` más un punto final proxy. El `registry:2` de respaldo se ejecuta sin autenticación, por lo que cualquier `aws ecr get-login-password | docker login` tiene éxito.
- **Negociación de formato de manifiesto.** `BatchGetImage` reenvía el `acceptedMediaTypes` de la persona que llama como el encabezado `Accept` ascendente. Se admiten los manifiestos OCI modernos (`application/vnd.oci.image.manifest.v1+json`) y el esquema 2 de Docker v2.
- **Aislamiento entre cuentas/regiones.** Internamente, los repositorios de espacios de nombres de registro son `<account>/<region>/<repoName>`, por lo que el mismo nombre de repositorio en diferentes cuentas o regiones no puede colisionar.
- **Conciliar en el primer inicio.** Cuando se inicia el contenedor de registro, Floci consulta `GET /v2/_catalog` y recrea las entradas de metadatos de `Repository` para cualquier espacio de nombres presente en el registro pero que falta en el almacenamiento local. Esto significa que los bytes de imagen nunca quedan huérfanos tras los reinicios.
- **Integración Lambda.** Las funciones Lambda respaldadas por imágenes (`PackageType=Image`) hacen referencia al mismo loopback `repositoryUri`. El corredor Lambda de Floci reescribe los URI de `<account>.dkr.ecr.<region>.amazonaws.com/...` con forma de AWS real en el registro de bucle invertido en el momento de la extracción, por lo que `DockerImageFunction` de CDK (que genera URI con forma de AWS en plantillas CloudFormation) funciona sin ningún reescritura del lado del usuario.

## Configuración

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_ECR_ENABLED` | `true` | Habilite el plano de control ECR y el inicio diferido del registro |
| `FLOCI_SERVICES_ECR_REGISTRY_IMAGE` | `registry:2` | Copia de seguridad de la imagen de registro OCI |
| `FLOCI_SERVICES_ECR_REGISTRY_CONTAINER_NAME` | `floci-ecr-registry` | Nombre del contenedor utilizado para la reutilización idempotente entre reinicios |
| `FLOCI_SERVICES_ECR_REGISTRY_BASE_PORT` | `5100` | Primer puerto en el rango de puertos de registro |
| `FLOCI_SERVICES_ECR_REGISTRY_MAX_PORT` | `5199` | Último puerto en el rango de puertos de registro |
| `FLOCI_SERVICES_ECR_DATA_PATH` | `./data/ecr` | Raíz de montaje vinculado para el directorio de datos de registro |
| `FLOCI_SERVICES_ECR_KEEP_RUNNING_ON_SHUTDOWN` | `true` | Deje el contenedor de registro ejecutándose para que el próximo inicio de Floci lo adopte |
| `FLOCI_SERVICES_ECR_URI_STYLE` | `hostname` | `hostname` = `*.dkr.ecr.<region>.localhost`; `path` = `localhost:<port>/<account>/<region>/<repo>` |
| `FLOCI_SERVICES_ECR_TLS_ENABLED` | `false` | Reservado para el futuro TLS respaldado por ACM |

### Docker Asignación de puertos de composición

El contenedor complementario de registro ECR vincula su puerto de host directamente; **no** agregue `5100-5199` al `ports` del servicio floci en `docker-compose.yml`. Agregar ese rango preasigna esos puertos en el contenedor floci y evita que el sidecar los vincule:

```yaml
# Correct — no ECR port range on the floci service
services:
  floci:
    image: floci/floci:latest
    ports:
      - "4566:4566"
      - "6379-6399:6379-6399"   # ElastiCache
      - "7001-7099:7001-7099"   # RDS
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
```

`docker login localhost:5100` funciona automáticamente una vez que Floci inicia el sidecar de registro; no se necesita asignación de puertos adicional.

## Ejemplos

```bash
export AWS_ENDPOINT=http://localhost:4566

# Create a repository
aws ecr create-repository \
  --repository-name floci-it/app \
  --endpoint-url $AWS_ENDPOINT
# {
#   "repository": {
#     "repositoryArn":  "arn:aws:ecr:us-east-1:000000000000:repository/floci-it/app",
#     "repositoryUri":  "000000000000.dkr.ecr.us-east-1.localhost:5100/floci-it/app",
#     "imageTagMutability": "MUTABLE",
#     ...
#   }
# }

# Authenticate stock docker against the emulated registry
aws ecr get-login-password --endpoint-url $AWS_ENDPOINT \
  | docker login --username AWS --password-stdin \
        000000000000.dkr.ecr.us-east-1.localhost:5100

# Push an image
docker pull alpine:3.19
docker tag  alpine:3.19 \
            000000000000.dkr.ecr.us-east-1.localhost:5100/floci-it/app:v1
docker push 000000000000.dkr.ecr.us-east-1.localhost:5100/floci-it/app:v1

# Inspect via the AWS CLI
aws ecr list-images     --repository-name floci-it/app --endpoint-url $AWS_ENDPOINT
aws ecr describe-images --repository-name floci-it/app --endpoint-url $AWS_ENDPOINT

# Pull from a clean local image store
docker rmi  000000000000.dkr.ecr.us-east-1.localhost:5100/floci-it/app:v1
docker pull 000000000000.dkr.ecr.us-east-1.localhost:5100/floci-it/app:v1

# Use the image as a Lambda function
aws lambda create-function \
  --function-name my-image-fn \
  --package-type Image \
  --code ImageUri=000000000000.dkr.ecr.us-east-1.localhost:5100/floci-it/app:v1 \
  --role arn:aws:iam::000000000000:role/lambda-role \
  --endpoint-url $AWS_ENDPOINT

aws lambda invoke --function-name my-image-fn /tmp/out.json --endpoint-url $AWS_ENDPOINT

# Tear down
aws ecr batch-delete-image --repository-name floci-it/app \
    --image-ids imageTag=v1 --endpoint-url $AWS_ENDPOINT
aws ecr delete-repository  --repository-name floci-it/app --force \
    --endpoint-url $AWS_ENDPOINT
```

## SDK Ejemplo (Java)

```java
EcrClient ecr = EcrClient.builder()
    .endpointOverride(URI.create("http://localhost:4566"))
    .region(Region.US_EAST_1)
    .credentialsProvider(StaticCredentialsProvider.create(
        AwsBasicCredentials.create("test", "test")))
    .build();

// Create a repository
Repository repo = ecr.createRepository(req -> req.repositoryName("floci-it/app"))
    .repository();

// Get a docker login token
GetAuthorizationTokenResponse auth = ecr.getAuthorizationToken();
AuthorizationData data = auth.authorizationData().get(0);
String decoded = new String(Base64.getDecoder().decode(data.authorizationToken()));
// decoded = "AWS:floci" → pipe to `docker login --username AWS --password-stdin <proxyEndpoint>`

// List images after a docker push
ListImagesResponse images = ecr.listImages(req -> req.repositoryName("floci-it/app"));
images.imageIds().forEach(System.out::println);

// Force-delete the repository
ecr.deleteRepository(req -> req.repositoryName("floci-it/app").force(true));
```

## Uso con AWS CDK

`DockerImageFunction` de CDK funciona contra Floci sin cambios:

```typescript
import * as lambda from 'aws-cdk-lib/aws-lambda';

new lambda.DockerImageFunction(this, 'MyFn', {
  functionName: 'hello',
  code: lambda.DockerImageCode.fromImageAsset('./docker-fn'),  // local Dockerfile
});
```

`cdk bootstrap` crea el repositorio de activos ECR (`cdk-hnb659fds-container-assets-…`) a través del aprovisionador CloudFormation de Floci; `cdk deploy` ejecuta `docker build` + `docker push` contra el registro emulado; Luego, `aws lambda invoke` extrae la imagen del registro de bucle invertido y ejecuta el controlador. Consulte [`compatibility-tests/compat-cdk`](https://github.com/floci-io/floci/tree/main/compatibility-tests/compat-cdk) para ver un ejemplo funcional de un extremo a otro.

## No implementado

Las siguientes funciones de ECR **no** están implementadas. Los valores almacenados para políticas y reglas de ciclo de vida viajan de ida y vuelta a través de API, pero no se aplican en tiempo de ejecución:

- Replicación y caché pull-through
- Escaneo de imágenes (`StartImageScan`, `DescribeImageScanFindings`)
- Imagen de firma y anexos notariales.
- Aplicación de políticas de ciclo de vida (el texto de la política se almacena pero no se aplica)
- Aplicación de políticas de repositorio (sin evaluación IAM de políticas a nivel de repositorio)
- TLS a través de ACM emulado

## Solución de problemas

**`Function.TimedOut` al invocar Lambdas respaldados por imágenes en Linux nativo Docker.** Los contenedores Lambda llegan al servidor Runtime API de Floci a través de la puerta de enlace del puente acoplable. En Ubuntu/Pop!_OS/Debian con UFW habilitado, la política predeterminada `INPUT DROP` bloquea esta ruta. Consulte [Inicio rápido → Lambda en Linux nativo Docker](../getting-started/quick-start.md#lambda-on-native-linux-docker-ufw) para obtener la solución de una línea `ufw allow in on docker0`.

**`docker login` falla con errores TLS.** El registro emulado de Floci sirve para HTTP simple. Docker confía automáticamente en las direcciones de bucle invertido (`127.0.0.1`, `*.localhost`) como registros inseguros, por lo que esto no debería suceder normalmente. Si sus URI terminan apuntando a algún lugar que no sea de bucle invertido (por ejemplo, configuró `FLOCI_HOSTNAME=floci` para Docker Compose), agregue el nombre de host a la matriz `insecure-registries` del demonio en `/etc/docker/daemon.json`.

**El disco no se recupera después de eliminar imágenes.** `BatchDeleteImage` elimina los manifiestos, pero los blobs permanecen en el disco hasta que se ejecuta la recolección de elementos no utilizados. Dispárelo con `curl -X POST http://localhost:4566/_floci/ecr/gc`. El punto de conexión ejecuta `registry garbage-collect` dentro del contenedor de respaldo y devuelve la lista de blobs recuperados. La operación se serializa: las llamadas de ECR API se bloquean durante su duración (normalmente unos segundos).

**`*.localhost` no resuelve el bucle invertido en esta plataforma.** Configure `floci.services.ecr.uri-style: path` para que recurra a los URI de `localhost:<port>/<account>/<region>/<repo>`.
