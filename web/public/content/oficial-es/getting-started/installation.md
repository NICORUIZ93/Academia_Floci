# Instalación

Floci se puede ejecutar de tres maneras: como una imagen Docker, como un binario nativo prediseñado o compilado desde el código fuente.

## Docker (Recomendado)

No requiere instalación más allá del propio Docker.

```bash
docker pull floci/floci:latest
```

### Requisitos de

- Docker 20.10+
- `docker compose` v2+ (sintaxis del complemento, no `docker-compose` independiente)

## Etiquetas de imagen

Cada etiqueta combina una **variante** (lo que hay dentro) y un **canal** (qué tan estable).

|  | Estándar | Compatibilidad (+ AWS CLI + boto3) |
|---|---|---|
| **Lanzamiento (último)** | `latest` ✅ | `latest-compat` |
| ** Lanzamiento (fijado) ** | `x.y.z` | `x.y.z-compat` |
| **Nocturno (flotante)** | `nightly` | `nightly-compat` |
| **Todas las noches (con fecha)** | `nightly-mmddyyyy` | `nightly-mmddyyyy-compat` |

Para ver el desglose completo, consulte [Imágenes Docker](../configuration/docker-images.md).

## Elegir una etiqueta

```yaml title="docker-compose.yml"
# Standard release — recommended for most use cases
services:
  floci:
    image: floci/floci:latest
    ports:
      - "4566:4566"
```

Utilice la imagen de compatibilidad si su flujo de trabajo requiere AWS CLI o boto3 disponibles dentro del contenedor:

```yaml title="docker-compose.yml"
services:
  floci:
    image: floci/floci:latest-compat
    ports:
      - "4566:4566"
```

Ambas variantes tienen un tiempo de inicio idéntico (~24 ms) y espacio de memoria (~13 MiB).

## Construir desde la fuente

### Requisitos previos de

- Java 25+
-Maven 3.9+
- (Opcional) Mandril GraalVM para compilación nativa

### Clonar y ejecutar

```bash
git clone https://github.com/floci-io/floci.git
cd floci
mvn quarkus:dev          # dev mode with hot reload on port 4566
```

### Construir un JAR de producción

```bash
mvn clean package -DskipTests
java -jar target/quarkus-app/quarkus-run.jar
```

### Construye un ejecutable nativo

```bash
mvn clean package -Pnative -DskipTests
./target/floci-runner
```

!!! nota
    La compilación nativa requiere GraalVM o Mandrel con la herramienta `native-image` en su PATH. El tiempo de construcción suele ser de 2 a 5 minutos.