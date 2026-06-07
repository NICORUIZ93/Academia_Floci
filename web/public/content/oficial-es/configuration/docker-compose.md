# Ejecutando con Docker

Floci se distribuye como una imagen Docker. Toda la configuración se realiza a través de variables de entorno: no se requieren archivos de configuración ni YAML montado en volumen.

## Inicio rápido de

```bash
docker run --rm -p 4566:4566 floci/floci:latest
```

Eso es todo. La configuración predeterminada funciona de inmediato para la mayoría de los servicios: SQS, SNS, S3, DynamoDB, SSM, Lambda, API Gateway, Cognito, KMS, Kinesis, Secrets Manager, CloudFormation, Funciones de paso, IAM, STS, EventBridge, Programador y CloudWatch.

## Docker Redactar

### Mínimo (sin estado)

```yaml title="docker-compose.yml"
services:
  floci:
    image: floci/floci:latest
    ports:
      - "4566:4566"
    environment:
      FLOCI_HOSTNAME: floci
```

### Con persistencia

Agregue dos variables de entorno y un volumen; no se necesita ningún archivo de configuración:

```yaml title="docker-compose.yml"
services:
  floci:
    image: floci/floci:latest
    ports:
      - "4566:4566"
    volumes:
      - floci-data:/app/data
    environment:
      FLOCI_HOSTNAME: floci
      FLOCI_STORAGE_MODE: persistent
      FLOCI_STORAGE_PERSISTENT_PATH: /app/data

volumes:
  floci-data:
```

### con ElastiCache y RDS

Conexiones proxy ElastiCache y RDS de TCP a contenedores Docker reales. Los puertos de esos contenedores deben ser accesibles desde su host, por lo que se exponen rangos de puertos adicionales. Se requiere el socket Docker para que Floci administre esos contenedores:

```yaml title="docker-compose.yml"
services:
  floci:
    image: floci/floci:latest
    ports:
      - "4566:4566"
      - "6379-6399:6379-6399"  # ElastiCache proxy ports
      - "7001-7099:7001-7099"  # RDS proxy ports
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - floci-data:/app/data
    environment:
      FLOCI_HOSTNAME: floci
      FLOCI_SERVICES_DOCKER_NETWORK: myproject_default
      FLOCI_STORAGE_MODE: persistent
      FLOCI_STORAGE_PERSISTENT_PATH: /app/data

volumes:
  floci-data:
```

!!! advertencia "zócalo Docker"
    Lambda, ElastiCache, RDS, OpenSearch y MSK requieren acceso al socket Docker (`/var/run/docker.sock`) para generar y administrar contenedores. Si no utiliza estos servicios, puede omitir ese volumen.

!!! nota "puerto ECR"
    ECR está respaldado por un contenedor sidecar `registry:2` (`floci-ecr-registry`) que Floci inicia y administra. Ese contenedor vincula su propio puerto de host (predeterminado `5100`) directamente; no agregue `5100-5199` a la lista `ports` del servicio Floci. Consulte [Referencia de puertos → ECR](./ports.md#ports-51005199--ecr-registry).

## Redes de contenedores múltiples

De forma predeterminada, Floci incorpora `localhost` en las URL de respuesta; por ejemplo, las URL de cola SQS se parecen a `http://localhost:4566/000000000000/my-queue`. Esto funciona cuando su aplicación se ejecuta en la misma máquina, pero falla dentro de Docker Compose porque otros contenedores no pueden alcanzar `localhost` del contenedor Floci.

Establezca `FLOCI_HOSTNAME` en el nombre del servicio Compose para que Floci use ese nombre en cada URL que genere:

```yaml title="docker-compose.yml"
services:
  floci:
    image: floci/floci:latest
    ports:
      - "4566:4566"
    environment:
      FLOCI_HOSTNAME: floci   # (1)

  app:
    build: .
    environment:
      AWS_ENDPOINT_URL: http://floci:4566
    depends_on:
      - floci
```

1. Debe coincidir con el nombre del servicio Compose para que otros contenedores puedan resolverlo mediante DNS.

Con esta configuración, Floci devuelve URL como `http://floci:4566/000000000000/my-queue` a las que pueden acceder otros contenedores.

Floci adjunta automáticamente los contenedores Lambda que genera a la misma red Compose cuando no se configura ninguna red Docker explícita. La configuración de `FLOCI_HOSTNAME` garantiza que esos contenedores reciban un punto final accesible y que los campos de respuesta como SQS `QueueUrl` utilicen el nombre de servicio Docker en lugar de `localhost`.

Campos afectados:

-SQS — `QueueUrl`
- SNS — tema ARN URL de devolución de llamada y puntos finales de suscripción
- Cualquier URL prefirmada o devolución de llamada generada desde `FLOCI_BASE_URL`

!!! consejo "tuberías de CI"
    En Acciones GitHub o GitLab CI donde tanto su aplicación como Floci se ejecutan como `services`, configure `FLOCI_HOSTNAME` con el nombre del servicio (por ejemplo, `floci`) y apunte su SDK a `http://floci:4566`.

## Ganchos de inicialización

Monte scripts de shell en directorios de enlaces para ejecutar la lógica de configuración o desmontaje en cada fase del ciclo de vida. No se necesita ninguna variable de configuración: Floci detecta scripts por directorio:

```yaml title="docker-compose.yml"
services:
  floci:
    image: floci/floci:latest-compat
    ports:
      - "4566:4566"
    volumes:
      - ./init/boot.d:/etc/floci/init/boot.d:ro    # before storage loads — no AWS APIs yet
      - ./init/start.d:/etc/floci/init/start.d:ro  # after HTTP server is ready
      - ./init/ready.d:/etc/floci/init/ready.d:ro  # after all start hooks complete
      - ./init/stop.d:/etc/floci/init/stop.d:ro    # during shutdown, while HTTP is still up
```

Utilice la imagen `latest-compat` cuando sus scripts llamen a `aws` o `boto3`; incluye AWS, CLI y boto3 preconfigurados para el punto final local, por lo que no se necesita ningún indicador `--endpoint-url`.

Si tiene scripts de inicio LocalStack existentes, móntelos en las rutas compatibles con LocalStack y se ejecutarán sin cambios:

```yaml
volumes:
  - ./localstack-init/ready.d:/etc/localstack/init/ready.d:ro
```

Consulte [Ganchos de inicialización](./initialization-hooks.md) para conocer el orden de ejecución, los tipos de secuencias de comandos y el comportamiento del código de salida.

## Ejemplo de canalización de CI

```yaml title=".github/workflows/test.yml"
services:
  floci:
    image: floci/floci:latest
    ports:
      - "4566:4566"

steps:
  - name: Run tests
    env:
      AWS_ENDPOINT_URL: http://localhost:4566
      AWS_DEFAULT_REGION: us-east-1
      AWS_ACCESS_KEY_ID: test
      AWS_SECRET_ACCESS_KEY: test
    run: mvn test
```

## Variables de entorno comunes

Las variables configuradas con más frecuencia cuando se ejecuta Floci como una imagen Docker:

| Variables | Predeterminado | Propósito |
|---|---|---|
| `FLOCI_HOSTNAME` | _(ninguno)_ | Nombre de host incrustado en las URL de respuesta. Establezca el nombre del servicio Redactar en configuraciones de múltiples contenedores |
| `FLOCI_DEFAULT_REGION` | `us-east-1` | Región AWS reportada en ARN y respuestas |
| `FLOCI_DEFAULT_ACCOUNT_ID` | `000000000000` | ID de cuenta AWS utilizado en ARN |
| `FLOCI_STORAGE_MODE` | `memory` | `memory`, `persistent`, `hybrid` o `wal` |
| `FLOCI_STORAGE_PERSISTENT_PATH` | `./data` | Directorio para almacenamiento persistente |
| `FLOCI_SERVICES_DOCKER_NETWORK` | _(ninguno)_ | Red Docker para contenedores generados (Lambda, ElastiCache, RDS, OpenSearch, MSK) |
| `FLOCI_AUTH_VALIDATE_SIGNATURES` | `false` | Verificar firmas de solicitud AWS |
| `FLOCI_SERVICES_LAMBDA_EPHEMERAL` | `false` | Eliminar contenedores Lambda después de cada invocación |

Para obtener la lista completa de cada variable `FLOCI_*`, consulte [Referencia de variables de entorno](./environment-variables.md).

## Configuración de Docker

Para conocer el socket del demonio Docker, la autenticación de registro privado, la rotación de registros y la configuración de red, consulte [Configuración Docker](./docker.md).
