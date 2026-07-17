# Lambda

**Protocolo:** REST JSON
**Punto final:** `http://localhost:4566/2015-03-31/functions/...`

Floci Lambda ejecuta su código de función localmente dentro de contenedores Docker reales, lo suficientemente cerca como lo hace AWS Lambda (usando la micro VM Firecracker).

## Operaciones compatibles

| Operación | Descripción |
|---|---|
| `CreateFunction` | Implementar una función Lambda |
| `GetFunction` | Obtenga detalles de la función y descargue la URL |
| `GetFunctionConfiguration` | Obtener configuración de tiempo de ejecución |
| `ListFunctions` | Listar todas las funciones |
| `UpdateFunctionCode` | Cargar nuevo código |
| `UpdateFunctionConfiguration` | Actualizar el tiempo de ejecución, el controlador, la memoria, el tiempo de espera, el entorno, las arquitecturas, el seguimiento, las capas y más |
| `DeleteFunction` | Eliminar una función |
| `Invoke` | Invocar una función de forma síncrona o asíncrona |
| `CreateEventSourceMapping` | Conecte transmisiones SQS / Kinesis / DynamoDB a una función |
| `GetEventSourceMapping` | Obtener detalles de asignación de origen de eventos |
| `ListEventSourceMappings` | Listar todas las asignaciones de fuentes de eventos |
| `UpdateEventSourceMapping` | Actualizar un mapeo |
| `DeleteEventSourceMapping` | Eliminar una asignación |
| `PublishVersion` | Publicar una versión inmutable |
| `ListVersionsByFunction` | Listar todas las versiones publicadas de una función |
| `CreateAlias` | Cree un alias con nombre que apunte a una versión |
| `GetAlias` | Obtener detalles del alias |
| `ListAliases` | Listar todos los alias de una función |
| `UpdateAlias` | Actualizar un alias |
| `DeleteAlias` | Eliminar un alias |
| `AddPermission` | Agregar una declaración de política de recursos |
| `GetPolicy` | Obtenga la función política de recursos |
| `RemovePermission` | Eliminar una declaración de política de recursos |
| `GetFunctionCodeSigningConfig` | Devolver configuración de firma de código (siempre vacía) |
| `CreateFunctionUrlConfig` | Aprovisionar una URL de función |
| `GetFunctionUrlConfig` | Leer configuración de URL de función |
| `UpdateFunctionUrlConfig` | Actualizar configuración de URL de función |
| `DeleteFunctionUrlConfig` | Eliminar configuración de URL de función |
| `ListTags` | Listar etiquetas en una función |
| `TagResource` | Etiquetar una función |
| `UntagResource` | Desetiquetar una función |
| `PutFunctionConcurrency` | Establecer ejecuciones simultáneas reservadas |
| `GetFunctionConcurrency` | Obtener ejecuciones simultáneas reservadas |
| `DeleteFunctionConcurrency` | Borrar ejecuciones concurrentes reservadas |

## Recarga en caliente mediante sincronización reactiva S3

Floci admite un mecanismo automático de recarga en caliente cuando las funciones se implementan a través de S3. Esto sigue el comportamiento estándar de AWS donde interactúan S3 y Lambda, pero está optimizado para una experiencia de desarrollo local perfecta.

Cuando se crea una función Lambda utilizando un depósito y una clave S3, Floci mantiene un vínculo entre la función y su objeto de origen. Cualquier actualización posterior de ese objeto S3 (por ejemplo, a través de `s3:PutObject`) activa automáticamente una sincronización reactiva:

1. **Detección**: Floci detecta la actualización de S3 a través de un sistema de eventos interno.
2. **Sincronización**: el nuevo código se vuelve a extraer automáticamente al almacenamiento de código local.
3. **Invalidación**: Todos los contenedores "tibios" activos para esa función se drenan de forma proactiva.
4. **Recargar**: la siguiente invocación inicia un contenedor nuevo con el código actualizado.

Esto le permite actualizar su código Lambda simplemente volviendo a cargar su ZIP en S3, sin tener que llamar manualmente a `UpdateFunctionCode` ni reiniciar ningún contenedor.

### Ejemplo

```bash
# 1. Create a function linked to S3
aws lambda create-function \
  --function-name my-function \
  --code S3Bucket=my-bucket,S3Key=function.zip \
  ...

# 2. Invoke (starts a warm container)
aws lambda invoke --function-name my-function out.json

# 3. Update the code in S3 (Triggers Reactive Sync)
aws s3 cp updated-function.zip s3://my-bucket/function.zip

# 4. Invoke again (automatically picks up the new code)
aws lambda invoke --function-name my-function out.json
```

!!! tenga en cuenta "Comportamiento estándar"
    Este mecanismo no requiere configuración personalizada ni cadenas mágicas no estándar. Funciona con los SDK AWS estándar y las herramientas CLI, lo que proporciona una sensación de desarrollo "en vivo" mientras se mantiene dentro del contrato AWS API.

## Recarga en caliente mediante Bind Mount

Para lograr el ciclo de desarrollo de bucle interno más estricto, Floci admite un modo **bind-mount hot-reload**. En lugar de empaquetar el código en un ZIP y cargarlo en S3, apunta Floci directamente a un directorio en su máquina host. El directorio está enlazado en `/var/task` dentro del contenedor, por lo que cada invocación ejecuta los archivos tal como existen actualmente en el disco: sin cargar ni volver a implementar.

Esto se habilita usando el nombre del depósito mágico `hot-reload` al crear una función:

```bash
aws lambda create-function \
  --function-name my-function \
  --runtime nodejs22.x \
  --role arn:aws:iam::000000000000:role/lambda-role \
  --handler index.handler \
  --code S3Bucket=hot-reload,S3Key=/absolute/path/to/your/code \
  --endpoint-url http://localhost:4566
```

`S3Key` debe ser una **ruta absoluta** a la que pueda acceder el demonio Docker. Cuando Floci se ejecuta en Docker Compose, esta es la ruta en el host Docker (la máquina que ejecuta Docker), no la ruta dentro del contenedor Floci.

### Cómo funciona

1. `CreateFunction` con `S3Bucket=hot-reload` marca la función como una función de recarga en caliente; `S3Key` se almacena como la ruta del lado del host.
2. En cada invocación, Floci inicia un **contenedor efímero nuevo** con la ruta del host montada en enlace en `/var/task`.
3. El contenedor ejecuta los archivos tal como existen en el momento de la invocación: edita un archivo y la invocación inmediata recoge el cambio sin ninguna llamada a API.
4. Una vez completada la invocación, el contenedor se detiene y elimina, lo que garantiza que la siguiente invocación siempre vea el estado actual del directorio.

### Configuración de

La recarga en caliente debe habilitarse explícitamente. De forma predeterminada, está deshabilitado para que `S3Bucket=hot-reload` se trate como un nombre de depósito S3 normal.

```bash
FLOCI_SERVICES_LAMBDA_HOT_RELOAD_ENABLED=true

# Optional: restrict which host paths may be bind-mounted (comma-separated)
FLOCI_SERVICES_LAMBDA_HOT_RELOAD_ALLOWED_PATHS=/home/user/projects,/tmp
```

**Docker Compose setup**: habilite la función y comparta el socket Docker:

```yaml
services:
  floci:
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      FLOCI_SERVICES_LAMBDA_HOT_RELOAD_ENABLED: "true"
```

### Limitaciones de

- La ruta `S3Key` es interpretada por el demonio **Docker**, no por Floci. Cuando Floci se ejecuta dentro de Docker, la ruta debe existir en la máquina host Docker, no dentro del contenedor Floci.
- Los contenedores de recarga en caliente son siempre efímeros: no se pueden reutilizar. Cada invocación paga una penalización por arranque en frío.
- `UpdateFunctionCode` en una función de recarga en caliente la convierte nuevamente en una función Zip estándar (se elimina el soporte de enlace de recarga en caliente).
- La sincronización reactiva S3 se omite para las funciones de recarga en caliente: las ediciones se recogen directamente desde el disco.

### Diferencia con sincronización reactiva S3

| | Sincronización reactiva S3 | Recarga en caliente con montaje vinculado |
|---|---|---|
| Gatillo | Cargue un nuevo ZIP en S3 | Editar archivos en el disco |
| Arranque en frío | Sólo después de cargar | Cada invocación |
| Requiere paso de carga | Sí | No |
| Funciona sin `hot-reload` habilitado | Sí | No |
| Se requiere ruta en el host | No | Sí |

!!! nota "Aplicación de concurrencia"
    Se aplica la simultaneidad reservada: invocaciones más allá del valor reservado
    devolver `TooManyRequestsException` (HTTP 429). Funciones sin reserva
    compartir valor en un grupo **por región**: el límite de "nivel de cuenta" de AWS Lambda es
    de hecho, una cuota por cuenta por región, y Floci refleja eso al
    contadores de partición en el segmento de región del ARN. El tamaño de la piscina (predeterminado
    1000) es configurable a través de `floci.services.lambda.region-concurrency-limit`
    y se aplica independientemente a cada región. `PutFunctionConcurrency`
    valida que el valor solicitado salga al menos
    `floci.services.lambda.unreserved-concurrency-min` (predeterminado 100) disponible
    para funciones sin reservas en esa región. `PutProvisionedConcurrencyConfig`
    y las operaciones conexas provisionadas y concurrentes siguen sin implementarse.

    Reducir o borrar el valor reservado de una función no mata
    invocaciones que ya están en vuelo: esto coincide con AWS, que
    aplica los cambios sólo a nuevas invocaciones. Como consecuencia, durante el
    ventana de drenaje `Σreserved-inflight + unreserved-inflight` puede brevemente
    exceder `region-concurrency-limit`.

También se puede acceder a las URL de funciones directamente en `/{proxy:.*}` bajo el controlador de URL Lambda, que enruta la solicitud a la ruta normal `Invoke`.

**Stubbed:** `ListLayers` y `ListLayerVersions` devuelven matrices vacías. No existe ningún almacenamiento de capas.

## no implementado

Estas operaciones AWS Lambda no tienen controlador en Floci. Las llamadas devolverán `404` o un error:

- Capas (`PublishLayerVersion`, `DeleteLayerVersion`, `GetLayerVersion`, `GetLayerVersionByArn`, `AddLayerVersionPermission`, `RemoveLayerVersionPermission`, `GetLayerVersionPolicy`)
- Simultaneidad aprovisionada (`PutProvisionedConcurrencyConfig`, `GetProvisionedConcurrencyConfig`, `ListProvisionedConcurrencyConfigs`, `DeleteProvisionedConcurrencyConfig`)
- Operaciones de mensajes fallidos, configuración de invocación asíncrona y configuración de invocación de eventos
- `InvokeWithResponseStream`
- Gestión de firma de código (solo está cableado `GetFunctionCodeSigningConfig`; no hay `PutFunctionCodeSigningConfig` ni `CreateCodeSigningConfig`)
- Cuenta y configuración regional (`GetAccountSettings`)

## Configuración

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_LAMBDA_ENABLED` | `true` | Activar o desactivar el servicio |
| `FLOCI_SERVICES_LAMBDA_EPHEMERAL` | `false` | Eliminar contenedores después de cada invocación |
| `FLOCI_SERVICES_LAMBDA_DEFAULT_MEMORY_MB` | `128` | Memoria de función predeterminada (MB) |
| `FLOCI_SERVICES_LAMBDA_DEFAULT_TIMEOUT_SECONDS` | `3` | Tiempo de espera de la función predeterminada (segundos) |
| `FLOCI_SERVICES_LAMBDA_RUNTIME_API_BASE_PORT` | `9200` | Primer puerto de la gama Lambda Runtime API |
| `FLOCI_SERVICES_LAMBDA_RUNTIME_API_MAX_PORT` | `9299` | Último puerto en la gama Lambda Runtime API |
| `FLOCI_SERVICES_LAMBDA_CODE_PATH` | `./data/lambda-code` | Directorio donde se almacenan los archivos ZIP Lambda |
| `FLOCI_SERVICES_LAMBDA_POLL_INTERVAL_MS` | `1000` | Intervalo de sondeo de mapeo de origen de eventos (milisegundos) |
| `FLOCI_SERVICES_LAMBDA_CONTAINER_IDLE_TIMEOUT_SECONDS` | `300` | Tiempo de espera de cierre del contenedor inactivo (segundos) |
| `FLOCI_SERVICES_LAMBDA_REGION_CONCURRENCY_LIMIT` | `1000` | Ejecuciones máximas simultáneas por región |
| `FLOCI_SERVICES_LAMBDA_UNRESERVED_CONCURRENCY_MIN` | `100` | Capacidad mínima no reservada `PutFunctionConcurrency` debe salir |
| `FLOCI_SERVICES_LAMBDA_HOT_RELOAD_ENABLED` | `false` | Habilite la recarga en caliente de montaje vinculado a través de `S3Bucket=hot-reload` |
| `FLOCI_SERVICES_LAMBDA_HOT_RELOAD_ALLOWED_PATHS` | *(desarmado)* | Lista permitida separada por comas de rutas de host que pueden montarse mediante enlace |
| `FLOCI_SERVICES_LAMBDA_DOCKER_NETWORK` | *(desarmado)* | Red Docker para conectar contenedores Lambda (anula `FLOCI_SERVICES_DOCKER_NETWORK`) |
| `FLOCI_SERVICES_LAMBDA_DOCKER_HOST_OVERRIDE` | *(desarmado)* | Host/IP explícito que generó los contenedores Lambda que se utilizan para alcanzar el tiempo de ejecución API de Floci, evitando la detección automática |

### Anulación del host en tiempo de ejecución API

Cuando se inicia un contenedor Lambda, vuelve a llamar al tiempo de ejecución API de Floci para recuperar
eventos y publicar resultados. Floci detecta automáticamente las direcciones que deben usar los contenedores
para esa devolución de llamada (su propia IP de contenedor en la red compartida, o
`host.docker.internal` cuando se ejecuta en el host). En la mayoría de las configuraciones esto es
correcto y no necesita configuración.

En topologías de red inusuales, por ejemplo Podman desarraigado, detección automática
puede elegir una dirección que el contenedor Lambda no puede alcanzar y las invocaciones fallan con
`connect ECONNREFUSED <ip>:9200`. Conjunto `FLOCI_SERVICES_LAMBDA_DOCKER_HOST_OVERRIDE`
al host o IP en el que los contenedores realmente pueden llegar a Floci, y Floci lo usa
palabra por palabra en lugar de detección automática:

```bash
FLOCI_SERVICES_LAMBDA_DOCKER_HOST_OVERRIDE=floci
```

Consulte [Configuración Docker → Ejecución en Podman (sin raíz)](../configuration/docker.md#running-on-podman-rootless)
para obtener un tutorial completo de Podman sin raíz.

### Requisitos del zócalo Docker

Lambda requiere el zócalo Docker. Móntalo en tu archivo de redacción:

```yaml
services:
  floci:
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
```

### S3 direccionamiento de estilo alojado virtual dentro de contenedores Lambda

Los SDK de AWS utilizan **estilo de alojamiento virtual** direccionamiento S3 de forma predeterminada, formando URL como
`https://my-bucket.s3.amazonaws.com/key`. Contra Floci se vuelve el mismo patrón
`http://my-bucket.localhost.floci.io:4566/key`.

Cuando Floci se ejecuta **dentro de Docker**, los contenedores Lambda están en el mismo Docker.
red. El DNS integrado de Docker resuelve el alias exacto `localhost.floci.io`
correctamente, pero no admite comodines: `my-bucket.localhost.floci.io`
falla en el DNS público y se resuelve en la IP incorrecta, lo que provoca el error Lambda
invocación de tiempo de espera.

**Floci resuelve esto automáticamente** ejecutando un servidor DNS integrado (UDP/53)
en la IP de su contenedor. Todos los contenedores Lambda lanzados por Floci están configurados para
Úselo como su solucionador de DNS. El servidor DNS integrado:

- Resuelve la IP de red Docker de `*.localhost.floci.io` → Floci.
- Reenvía todas las demás consultas a los solucionadores ascendentes desde `/etc/resolv.conf`,
  recurrir a solucionadores públicos para que los **nombres de host públicos** (p. ej.
  `business-api.tiktok.com`) se resuelve desde el interior de los contenedores Lambda

No se necesita configuración adicional ni `cap_add`: los contenedores Docker tienen
`CAP_NET_BIND_SERVICE` en su conjunto de capacidades predeterminado, por lo que Floci (ejecutándose como
usuario no root) puede vincular UDP/53 sin realizar ningún cambio en su archivo de redacción.

!!! nota "Resolución de nombres de host públicos de Lambda"
    Un Lambda cuyo controlador llega a un host público (`fetch()`/HTTPS, por ejemplo.
    `business-api.tiktok.com`) lo resuelve a través del DNS integrado de Floci. como un
    red de seguridad, Floci también agrega solucionadores públicos configurables (predeterminado
    `8.8.8.8`, `8.8.4.4`) después de su propia IP en la lista DNS de cada contenedor generado,
    por lo que la resolución de nombres aún funciona si el reenviador integrado no puede responder.

    Sintonice o deshabilite esto para redes fuera de línea/bloqueadas donde esos solucionadores
    están bloqueados:

    ```bash
    FLOCI_DNS_CONTAINER_FALLBACK_SERVERS=1.1.1.1,1.0.0.1   # use different resolvers
    FLOCI_DNS_CONTAINER_FALLBACK_ENABLED=false             # inject only Floci's DNS
    ```

!!! consejo "Docker Redactar nombres de servicios"
    Si Floci se ejecuta como un servicio de composición Docker, configure `FLOCI_HOSTNAME` en el
    nombre del servicio, por ejemplo `FLOCI_HOSTNAME=floci`. Cuando no hay ningún Lambda explícito
    La red Docker está configurada, Floci se conecta automáticamente a Lambda.
    contenedores a la red Compose actual. Floci luego inyecta
    `AWS_ENDPOINT_URL=http://floci:4566` en contenedores y devoluciones Lambda
    Valores SQS `QueueUrl` con el mismo host accesible.

    Esto evita reescrituras del lado de la función desde `localhost` o `localhost.floci.io`.
    a `floci` y mantiene a los clientes AWS SDK normales apuntando al nombre DNS Docker
    que el contenedor Lambda puede resolver.

!!! nota "Estilo de ruta como solución alternativa"
    Si no puede utilizar el estilo de alojamiento virtual (por ejemplo, Floci se ejecuta de forma nativa en
    el host, no en Docker), configure el cliente SDK con
    `forcePathStyle: true` / `s3ForcePathStyle: true`. Las solicitudes irán a
    `http://localhost:4566/my-bucket/key` en su lugar y trabajar sin DNS.

#### Migrando desde LocalStack

Si tus funciones Lambda tienen `AWS_ENDPOINT_URL=http://localhost.localstack.cloud:4566`
codificado, agregue el sufijo LocalStack al solucionador DNS de Floci para que se resuelva en
IP de Floci sin ningún cambio en el lado funcional:

A través de una variable de entorno: utilice una lista separada por comas para varios sufijos:

```bash
# Single suffix
FLOCI_DNS_EXTRA_SUFFIXES=localhost.localstack.cloud

# Multiple suffixes
FLOCI_DNS_EXTRA_SUFFIXES=localhost.localstack.cloud,localhost.example.internal
```

### Credenciales reales de AWS

De forma predeterminada, Floci inyecta credenciales de marcador de posición (`test`/`test`/`test`) en contenedores Lambda. Esto es suficiente cuando todas las llamadas a SDK tienen como objetivo los servicios emulados de Floci.

Para pruebas híbridas locales/en la nube, donde algunos servicios se emulan y otros alcanzan el AWS real, puede montar su directorio host `~/.aws` en contenedores Lambda:

```yaml
services:
  floci:
    image: floci/floci:latest
    environment:
      FLOCI_SERVICES_LAMBDA_AWS_CONFIG_PATH: /Users/me/.aws
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
```

Cuando se configura `aws-config-path`:

- La ruta del host está montada mediante enlace **de solo lectura** en cada contenedor Lambda en `/opt/aws-config`
- Las variables de entorno `AWS_SHARED_CREDENTIALS_FILE` y `AWS_CONFIG_FILE` están configuradas para que SDK descubra las credenciales independientemente del directorio INICIO del contenedor.
- No se inyectan variables env `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` / `AWS_SESSION_TOKEN`

Cuando no está configurado (predeterminado), Floci lee las credenciales de su propio entorno y recurre a `test`/`test`/`test`.

!!! consejo "Enrutamiento de servicios específicos al AWS real"
    Para mantener algunos servicios en Floci mientras otros alcanzan el AWS real, borre el punto final global y establezca anulaciones específicas del servicio en el `--environment` de su función:

    ```
    AWS_ENDPOINT_URL=                                          # clear Floci's global endpoint
    AWS_ENDPOINT_URL_SES=http://localhost.floci.io:4566       # SES stays on Floci
    AWS_ENDPOINT_URL_CLOUDWATCHLOGS=http://localhost.floci.io:4566  # CloudWatch stays on Floci
    ```

    El AWS SDK admite `AWS_ENDPOINT_URL_<SERVICE>` de forma nativa. Los servicios sin anulación utilizarán puntos finales AWS reales.

!!! nota "Paso de credenciales sin montaje"
    Si no necesita el directorio `~/.aws` completo (por ejemplo, solo tiene credenciales estáticas), puede pasarlas directamente al entorno de Floci. Cuando `aws-config-path` no está configurado, Floci reenvía sus propias variables de entorno `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` y `AWS_SESSION_TOKEN` a contenedores Lambda:

    ```yaml
    environment:
      AWS_ACCESS_KEY_ID: ${AWS_ACCESS_KEY_ID}
      AWS_SECRET_ACCESS_KEY: ${AWS_SECRET_ACCESS_KEY}
      AWS_SESSION_TOKEN: ${AWS_SESSION_TOKEN}
    ```

### Autenticación de registro privado

Las funciones de imagen de contenedor (`"PackageType": "Image"`) que se extraen de registros privados necesitan credenciales Docker. Consulte [Configuración Docker → Autenticación de registro privado](../configuration/docker.md#private-registry-authentication) para obtener la guía completa.

## Ejemplos

```bash
export AWS_ENDPOINT_URL=http://localhost:4566

# Package a simple Node.js function
cat > index.mjs << 'EOF'
export const handler = async (event) => {
  console.log("Event:", JSON.stringify(event));
  return { statusCode: 200, body: JSON.stringify({ hello: "world" }) };
};
EOF
zip function.zip index.mjs

# Deploy the function
aws lambda create-function \
  --function-name my-function \
  --runtime nodejs22.x \
  --role arn:aws:iam::000000000000:role/lambda-role \
  --handler index.handler \
  --zip-file fileb://function.zip \
  --endpoint-url $AWS_ENDPOINT_URL

# Invoke synchronously
aws lambda invoke \
  --function-name my-function \
  --payload '{"key":"value"}' \
  --cli-binary-format raw-in-base64-out \
  response.json \
  --endpoint-url $AWS_ENDPOINT_URL

cat response.json

# Invoke asynchronously
aws lambda invoke \
  --function-name my-function \
  --invocation-type Event \
  --payload '{"key":"value"}' \
  --cli-binary-format raw-in-base64-out \
  /dev/null \
  --endpoint-url $AWS_ENDPOINT_URL

# Update code
zip function.zip index.mjs
aws lambda update-function-code \
  --function-name my-function \
  --zip-file fileb://function.zip \
  --endpoint-url $AWS_ENDPOINT_URL
```

## Asignaciones de orígenes de eventos

Conecte Lambda a las transmisiones SQS, Kinesis o DynamoDB:

```bash
# SQS trigger
QUEUE_ARN=$(aws sqs get-queue-attributes \
  --queue-url $AWS_ENDPOINT_URL/000000000000/orders \
  --attribute-names QueueArn \
  --query Attributes.QueueArn --output text \
  --endpoint-url $AWS_ENDPOINT_URL)

aws lambda create-event-source-mapping \
  --function-name my-function \
  --event-source-arn $QUEUE_ARN \
  --batch-size 10 \
  --endpoint-url $AWS_ENDPOINT_URL
```

### ScalingConfig (solo SQS)

`CreateEventSourceMapping` y `UpdateEventSourceMapping` aceptan un
`ScalingConfig.MaximumConcurrency` entero entre 2 y 1000 en SQS
fuentes de eventos, que coinciden con el formato de cable AWS. `GetEventSourceMapping` y
`ListEventSourceMappings` repite el valor cuando se establece; respuestas omitir
el campo `ScalingConfig` por completo cuando no se configura ningún límite.

```bash
aws lambda create-event-source-mapping \
  --function-name my-function \
  --event-source-arn $QUEUE_ARN \
  --scaling-config MaximumConcurrency=5 \
  --endpoint-url $AWS_ENDPOINT_URL
```

Espejos de validación AWS: los valores fuera de 2–1000 se rechazan con
`InvalidParameterValueException` y `ScalingConfig` en un evento que no es SQS
fuente (Kinesis / DynamoDB Streams) también se rechaza: esos servicios
utilice `ParallelizationFactor` en su lugar, que es un campo separado.

!!! nota "Estado de aplicación"
    El `MaximumConcurrency` configurado se conserva y se devuelve en el
    cable, pero el sondeador SQS aún no limita las invocaciones simultáneas en
    este valor (el encuestador hoy serializa las invocaciones por ESM a uno
    a la vez independientemente). Envío paralelo real limitado por
    Se realiza un seguimiento de `MaximumConcurrency` como seguimiento.

## Tiempos de ejecución compatibles con

Cualquier tiempo de ejecución que tenga una imagen de contenedor oficial AWS Lambda funciona con Floci (por ejemplo, `nodejs22.x`, `python3.13`, `java21`, `go1.x`, `provided.al2023`).
