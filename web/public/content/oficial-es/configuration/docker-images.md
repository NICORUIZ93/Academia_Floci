# Docker Imágenes

Floci publica imágenes en [Docker Hub (`floci/floci`)](https://hub.docker.com/r/floci/floci).

Cada etiqueta de imagen combina dos opciones independientes: **qué hay dentro** (variante) y **qué tan estable es** (canal).

## Eje 1: variante (lo que hay dentro)

| Variante | Contenidos | Cuándo utilizar |
|---|---|---|
| **Estándar** | Floci solo binario nativo | Uso general: CI, desarrollo local, Testcontainers **(recomendado)** |
| **Compatible** | Floci + Python 3 + AWS CLI + boto3 | Flujos de trabajo que necesitan herramientas AWS disponibles dentro del contenedor |

La imagen compatible se construye sobre la imagen estándar: el tiempo de inicio y el uso de memoria son idénticos. Sólo aumenta el tamaño de la imagen.

## Eje 2: canal (qué tan estable)

| Canal | Fuente | Publicado |
|---|---|---|
| **Lanzamiento** | Versión etiquetada (por ejemplo, `1.5.11`) | En cada lanzamiento |
| **Todas las noches** | Punta de `main` | Todas las noches a las 22:00 CT |

Las imágenes de lanzamiento son estables y se recomiendan para la mayoría de los casos de uso. Las imágenes nocturnas siguen el desarrollo activo y pueden incluir cambios inéditos.

## Matriz de etiquetas completa

Combinando ambos ejes se obtiene el conjunto completo de etiquetas publicadas:

|  | Estándar | Compatibilidad |
|---|---|---|
| **Lanzamiento (último)** | `latest` ✅ | `latest-compat` |
| ** Lanzamiento (fijado) ** | `x.y.z` | `x.y.z-compat` |
| **Nocturno (flotante)** | `nightly` | `nightly-compat` |
| **Todas las noches (con fecha)** | `nightly-mmddyyyy` | `nightly-mmddyyyy-compat` |

Las etiquetas nocturnas con fecha (por ejemplo, `nightly-05022026`) son fijas y nunca se mueven; úselas para compilaciones reproducibles de `main`.

!!! advertencia
    Las imágenes nocturnas pueden incluir cambios inéditos o experimentales. Utilice etiquetas de versión en entornos similares a los de producción.

## Referencia rápida

```yaml title="docker-compose.yml"
# Standard release — recommended
image: floci/floci:latest

# Compat release — includes AWS CLI and boto3
image: floci/floci:latest-compat

# Pinned release — reproducible builds
image: floci/floci:1.5.11

# Nightly — track main
image: floci/floci:nightly
```

## Multiarquitectura

Todas las imágenes se publican como manifiestos de múltiples arcos que admiten `linux/amd64` y `linux/arm64`. Docker selecciona la variante correcta automáticamente.

## ¿Qué hay en la imagen de compatibilidad?

La imagen compatible instala lo siguiente encima de la imagen estándar:

- Python 3 + pipa
- [AWS CLI](https://pypi.org/project/awscli/) (vía pip)
- [boto3](https://pypi.org/project/boto3/) (vía pip)

El AWS CLI está preconfigurado para comunicarse con el punto final local Floci; no se necesita ningún indicador `--endpoint-url` en los scripts de enlace:

```sh
# !/bin/sh
aws sqs create-queue --queue-name my-queue   # works without --endpoint-url
aws s3 mb s3://my-bucket
```

Las siguientes variables de entorno se configuran tanto en la imagen estándar como en la compatible:

| Variables | Valor |
|---|---|
| `AWS_DEFAULT_REGION` | `us-east-1` |
| `AWS_ACCESS_KEY_ID` | `test` |
| `AWS_SECRET_ACCESS_KEY` | `test` |
| `AWS_CONFIG_FILE` | `/etc/floci/aws/config` |

La imagen de compatibilidad establece además:

| Variables | Valor |
|---|---|
| `AWS_ENDPOINT_URL` | `http://localhost:4566` |

Anule cualquiera de ellos en tiempo de ejecución a través de `docker run -e` o el bloque Compose `environment`.

## Desarrollo Local

El proyecto incluye un `docker-compose.yml` en la raíz del repositorio configurado para el desarrollo local. De forma predeterminada, utiliza `docker/Dockerfile` (una compilación rápida de JVM adecuada para la iteración). Cambie la entrada `dockerfile` para probar la imagen nativa localmente:

```yaml title="docker-compose.yml"
build:
  context: .
  dockerfile: docker/Dockerfile.native   # or docker/Dockerfile for fast JVM dev build
```
