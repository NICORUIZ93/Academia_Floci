# Ganchos de inicialización

Floci admite scripts de enlace de inicio que se ejecutan en puntos definidos en el ciclo de vida de inicio y apagado.
Utilícelos para inicializar recursos, configurar el estado o limpiar después de una ejecución, antes o después de que las API AWS estén disponibles.

!!! consejo "Utilice la imagen de compatibilidad para scripts que llamen a `aws` o `boto3`"
    Los scripts que invocan AWS CLI o Python boto3 requieren la imagen de compatibilidad, que incluye Python 3, AWS, CLI y boto3, todos preconfigurados para `http://localhost:4566`.
    Utilice `floci/floci:latest-compat` (o un `x.y.z-compat` fijado) en lugar de la imagen estándar.

## Fases del ciclo de vida de

Floci ejecuta ganchos en cuatro fases ordenadas:

| Fase | Cuando se ejecuta | ¿API AWS disponibles? | Directorio |
|---|---|---|---|
| **arranque** | Antes de cargar el almacenamiento, antes de que comiencen los servicios | No | `boot.d` |
| **inicio** | Una vez que el servidor HTTP esté listo en el puerto 4566 | Sí ✅ | `start.d` |
| **listo** | Después de que todos los ganchos `start` estén completos | Sí ✅ | `ready.d` |
| **parar** | Durante el apagado previo, mientras el servidor HTTP aún está activo | Sí ✅ | `stop.d` |

Los puntos finales `/_floci/init` y `/_localstack/init` reflejan el estado de finalización de cada fase en tiempo real, por lo que las herramientas externas pueden esperar a `ready` antes de continuar.

## Directorios de ganchos

Floci combina scripts de dos árboles de directorios. El árbol nativo de Floci tiene prioridad: si existe el mismo nombre de archivo en ambos, se ejecuta la copia de Floci y se omite la copia de LocalStack:

| Fase | Ruta Floci | Ruta compatible con LocalStack |
|---|---|---|
| arranque | `/etc/floci/init/boot.d` | `/etc/localstack/init/boot.d` |
| inicio | `/etc/floci/init/start.d` | `/etc/localstack/init/start.d` |
| listo | `/etc/floci/init/ready.d` | `/etc/localstack/init/ready.d` |
| detener | `/etc/floci/init/stop.d` o `/etc/floci/init/shutdown.d` | `/etc/localstack/init/shutdown.d` |

Las rutas compatibles con LocalStack permiten que los scripts de arranque LocalStack existentes funcionen sin modificaciones.
Móntelos bajo `/etc/localstack/init/` y se ejecutarán tal cual.

## Tipos de secuencias de comandos

Floci descubre scripts con las siguientes extensiones:

- `.sh`: ejecutado con el shell configurado (predeterminado `/bin/sh`)
- `.py` — ejecutado con `python3`

Se ignoran los archivos con cualquier otra extensión.

## Orden de ejecución y comportamiento de

Dentro de cada fase, los scripts se ejecutan en **orden lexicográfico** y **secuencialmente** (uno a la vez).
Prefije los nombres de archivos con números para controlar el orden: `01-`, `02-`, `03-`, etc.

Floci utiliza una estrategia de prueba rápida:

- Si un script sale con un estado distinto de cero, los scripts restantes en esa fase se omiten.
- Si un script excede el tiempo de espera configurado, se finaliza y se trata como un error.
- Una falla en el enlace `boot` o `start`/`ready` hace que Floci se apague.
- Se registra una falla en el enlace `stop`, pero no impide el apagado ni la limpieza de recursos.

## AWS CLI en scripts de gancho

La imagen de compatibilidad (`floci/floci:latest-compat`) incluye AWS CLI y boto3 con el punto final local preconfigurado.
Los scripts pueden llamar a `aws` directamente; no se necesita el indicador `--endpoint-url`:

```sh
# !/bin/sh
set -eu
aws sqs create-queue --queue-name my-queue
aws s3 mb s3://my-bucket
aws ssm put-parameter --name /app/config --type String --value production
```

Las siguientes variables de entorno están preestablecidas en la imagen de compatibilidad:

| Variables | Valor |
|---|---|
| `AWS_DEFAULT_REGION` | `us-east-1` |
| `AWS_ACCESS_KEY_ID` | `test` |
| `AWS_SECRET_ACCESS_KEY` | `test` |
| `AWS_ENDPOINT_URL` | `http://localhost:4566` |
| `AWS_CONFIG_FILE` | `/etc/floci/aws/config` |

Anule cualquiera de ellos a través de `docker run -e` o el bloque de redacción `environment`.

Los scripts Python pueden usar boto3 de la misma manera: el archivo de configuración se lee automáticamente:

```python
# !/usr/bin/env python3
import boto3

sqs = boto3.client("sqs")
sqs.create_queue(QueueName="my-queue")

s3 = boto3.client("s3")
s3.create_bucket(Bucket="my-bucket")
```

## Directorios de ganchos de montaje

```yaml title="docker-compose.yml"
services:
  floci:
    image: floci/floci:latest-compat
    ports:
      - "4566:4566"
    volumes:
      - ./init/boot.d:/etc/floci/init/boot.d:ro
      - ./init/start.d:/etc/floci/init/start.d:ro
      - ./init/ready.d:/etc/floci/init/ready.d:ro
      - ./init/stop.d:/etc/floci/init/stop.d:ro
```

Se pueden omitir las fases que no necesita: Floci omite los directorios vacíos o faltantes.

### Migrando desde LocalStack

Si tiene scripts de inicio LocalStack existentes, móntelos en las rutas compatibles con LocalStack y funcionarán sin cambios:

```yaml title="docker-compose.yml"
volumes:
  - ./localstack-init/ready.d:/etc/localstack/init/ready.d:ro
```

Para anular scripts individuales con versiones específicas de Floci y conservar el resto:

```yaml title="docker-compose.yml"
volumes:
  - ./localstack-init/ready.d:/etc/localstack/init/ready.d:ro   # existing scripts
  - ./floci-init/ready.d:/etc/floci/init/ready.d:ro             # overrides (take priority)
```

## Ejemplos

### Recursos semilla al inicio

```sh title="/etc/floci/init/ready.d/01-seed.sh"
# !/bin/sh
set -eu
aws sqs create-queue --queue-name orders
aws s3 mb s3://assets
aws ssm put-parameter --name /app/bootstrapped --type String --value true
```

### Semilla con Python + boto3

```python title="/etc/floci/init/ready.d/01-seed.py"
# !/usr/bin/env python3
import boto3

boto3.client("sqs").create_queue(QueueName="orders")
boto3.client("s3").create_bucket(Bucket="assets")
```

### Limpiar al apagar

```sh title="/etc/floci/init/stop.d/01-cleanup.sh"
# !/bin/sh
set -eu
aws ssm delete-parameter --name /app/bootstrapped
```

!!! nota "Tiempo de apagado"
    Los enlaces de detención se ejecutan antes de que se apague el servidor HTTP, por lo que el tiempo total de apagado de Floci aumenta en
    el tiempo de ejecución acumulativo de todos los ganchos de parada. Ajuste el período de gracia de su orquestador en consecuencia
    (por ejemplo, Kubernetes `terminationGracePeriodSeconds`, Docker componen `stop_grace_period`).

## Configuración

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_INIT_HOOKS_SHELL_EXECUTABLE` | `/bin/sh` | Shell utilizado para ejecutar scripts `.sh` |
| `FLOCI_INIT_HOOKS_TIMEOUT_SECONDS` | `30` | Tiempo de ejecución máximo por script antes de que se elimine y se trate como un error |
| `FLOCI_INIT_HOOKS_SHUTDOWN_GRACE_PERIOD_SECONDS` | `2` | Espera adicional después de finalizar un script con tiempo de espera agotado |

Ejemplo: ampliar el tiempo de espera para scripts de inicialización lentos:

```bash
FLOCI_INIT_HOOKS_TIMEOUT_SECONDS=120
```

O en Docker Redactar:

```yaml
environment:
  FLOCI_INIT_HOOKS_TIMEOUT_SECONDS: "120"
  FLOCI_INIT_HOOKS_SHELL_EXECUTABLE: /bin/bash
```
