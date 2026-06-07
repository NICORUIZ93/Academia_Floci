# Referencia de puertos

## Descripción general del puerto

| Puerto / Rango | Protocolo | Propósito | ¿Se requiere el mapeo de Docker-Compose? |
|---|---|---|---|
| `4566` | HTTP | Todas las llamadas AWS API (todos los servicios) | Sí |
| `5100–5199` | HTTP | Sidecar de registro ECR: vinculado directamente por el contenedor `registry:2` | **No** (ver nota) |
| `6379–6399` | TCP | Proxy ElastiCache Redis (dentro de Floci) | Sí |
| `6500–6599` | HTTPS | Servidor EKS k3s API: vinculado directamente por cada contenedor k3s | **No** |
| `7001–7099` | TCP | Proxy RDS (dentro de Floci) | Sí |
| `9200–9299` | HTTP | Lambda Tiempo de ejecución API (interno, solo red Docker) | **No** |
| `9400–9499` | HTTP | Plano de datos OpenSearch: vinculado directamente por cada contenedor OpenSearch | **No** |

## Por qué algunos puertos no necesitan mapeo de composición acoplable

Hay dos patrones distintos que utiliza Floci para exponer los puertos de contenedores:

### Proxy en Floci (ElastiCache, RDS)

Floci ejecuta un **proceso proxy TCP dentro de su propio contenedor**. El proxy escucha en el puerto del host y reenvía el tráfico al contenedor backend.

```
host:6379  →  [docker-compose ports mapping]  →  Floci container:6379  →  Redis container:6379
```

Debido a que el oyente está dentro del contenedor Floci, se requiere `ports:` en `docker-compose.yml` para que sea accesible desde el host.

### Vinculación directa de contenedores (ECR, EKS, OpenSearch)

Floci le dice al demonio Docker que inicie un contenedor de servicio/sidecar y vincule su puerto **directamente en el host**. El propio Floci se comunica con el contenedor a través de la red compartida Docker (nombre del contenedor + puerto interno). El puerto de host está vinculado a Docker, no a Floci.

```
host:9400  ←──  opensearch container:9200  (Docker binds 9400 directly on the host)
                        ↑
       Floci reaches it via Docker network: floci-opensearch-{name}:9200
```

No se necesita ninguna asignación `docker-compose.yml` `ports:`: el puerto ya está en el host.

## Puerto 4566 — AWS API

Cada llamada a AWS, SDK y CLI va al puerto `4566`. Esto incluye todas las operaciones del plano de gestión: crear colas, colocar elementos, invocar Lambdas, etc.

```bash
aws s3 ls --endpoint-url http://localhost:4566
aws sqs list-queues --endpoint-url http://localhost:4566
aws lambda list-functions --endpoint-url http://localhost:4566
```

## Puertos 6379–6399 — ElastiCache

Cuando crea un grupo de replicación ElastiCache, Floci inicia un contenedor Valkey/Redis Docker y crea un proxy TCP en el siguiente puerto disponible en el rango `6379–6399`. El proxy se ejecuta dentro del contenedor Floci, por lo que este rango debe asignarse en `docker-compose.yml`.

```bash
# Create a replication group
aws elasticache create-replication-group \
  --replication-group-id my-redis \
  --replication-group-description "dev cache" \
  --endpoint-url http://localhost:4566

# Connect directly on the proxied port (returned in DescribeReplicationGroups Endpoint.Port)
redis-cli -h localhost -p 6379
```

!!! nota
    Configure la gama con `FLOCI_SERVICES_ELASTICACHE_PROXY_BASE_PORT` y `FLOCI_SERVICES_ELASTICACHE_PROXY_MAX_PORT`.

## Puertos 6500–6599 — EKS (modo real)

Cuando crea un clúster EKS en modo real, Floci le pide al demonio Docker que inicie un contenedor k3s y vincule su puerto de servidor API (6443) al siguiente puerto de host disponible en `6500–6599`. El puerto está vinculado directamente al host mediante Docker; no se necesita asignación de `docker-compose.yml`.

El campo `endpoint` devuelto por `DescribeCluster` apunta a `https://localhost:<hostPort>` cuando se ejecuta fuera de un contenedor, o a `https://floci-eks-<name>:6443` cuando Floci se ejecuta dentro de Docker.

```bash
aws eks create-cluster \
  --name my-cluster \
  --role-arn arn:aws:iam::000000000000:role/eks-role \
  --resources-vpc-config subnetIds=[],securityGroupIds=[] \
  --endpoint-url http://localhost:4566

# DescribeCluster returns the API server address, e.g. https://localhost:6500
```

!!! nota
    Configure la gama con `FLOCI_SERVICES_EKS_API_SERVER_BASE_PORT` y `FLOCI_SERVICES_EKS_API_SERVER_MAX_PORT`.

## Puertos 7001–7099 — RDS

Cuando crea una instancia de base de datos RDS, Floci inicia un contenedor PostgreSQL o MySQL Docker y crea un proxy TCP en el siguiente puerto disponible en el rango `7001–7099`. El proxy se ejecuta dentro del contenedor Floci, por lo que este rango debe asignarse en `docker-compose.yml`.

```bash
aws rds create-db-instance \
  --db-instance-identifier mydb \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username admin \
  --master-user-password secret \
  --endpoint-url http://localhost:4566

# Connect using the proxied port (returned in DescribeDBInstances Endpoint.Port)
psql -h localhost -p 7001 -U admin
```

!!! nota
    Configure la gama con `FLOCI_SERVICES_RDS_PROXY_BASE_PORT` y `FLOCI_SERVICES_RDS_PROXY_MAX_PORT`.

## Puertos 9200–9299 — Tiempo de ejecución Lambda API (interno)

Floci vincula un puerto Runtime API en `9200–9299` para cada contenedor caliente Lambda para sondear. Estos puertos son consumidos únicamente por contenedores en la red compartida Docker; nunca se accede a ellos desde el host y **no** deben asignarse en `docker-compose.yml`.

Configure la gama con `FLOCI_SERVICES_LAMBDA_RUNTIME_API_BASE_PORT` y `FLOCI_SERVICES_LAMBDA_RUNTIME_API_MAX_PORT`.

## Puertos 9400–9499 — OpenSearch (modo real)

Cuando crea un dominio OpenSearch en modo real, Floci le pide al demonio Docker que inicie un contenedor `opensearchproject/opensearch` y vincule su puerto REST (9200) al siguiente puerto de host disponible en `9400–9499`. El puerto está vinculado directamente al host mediante Docker; no se necesita asignación de `docker-compose.yml`.

El campo `endpoint` devuelto por `DescribeDomain` apunta a `http://localhost:<hostPort>` cuando se ejecuta fuera de un contenedor, o a `http://floci-opensearch-<name>:9200` cuando Floci se ejecuta dentro de Docker.

```bash
aws opensearch create-domain \
  --domain-name my-search \
  --engine-version OpenSearch_2.11 \
  --endpoint-url http://localhost:4566

# DescribeDomain returns the data-plane address, e.g. http://localhost:9400
curl http://localhost:9400/_cluster/health
```

!!! nota
    Configure la gama con `FLOCI_SERVICES_OPENSEARCH_PROXY_BASE_PORT` y `FLOCI_SERVICES_OPENSEARCH_PROXY_MAX_PORT`.

## Puertos 5100–5199 — Registro ECR

ECR está respaldado por un contenedor sidecar `registry:2` independiente (`floci-ecr-registry`) que Floci inicia en la primera llamada ECR API. Ese contenedor vincula su puerto directamente en el host; **no** agregue `5100-5199` al `ports` del servicio floci en Docker Compose. Al hacerlo, se preasigna esos puertos en el contenedor Floci y se evita que el sidecar los vincule.

```
host:5100  ←──  floci-ecr-registry (registry:2 container, started by Floci)
```

`docker login localhost:5100` funciona porque el sidecar tiene un enlace de puerto de host directo.

!!! advertencia "No exponga el rango de puertos ECR en el servicio floci"
    Agregar `- "5100-5199:5100-5199"` a los puertos de servicio de floci entrará en conflicto con el sidecar ECR y romperá `docker push`/`docker pull`.

## Exposición de puertos en Docker Compose

Solo los servicios basados en proxy (ElastiCache y RDS) necesitan asignaciones de puertos en `docker-compose.yml`. Los servicios de enlace directo (ECR, EKS, OpenSearch) enlazan sus puertos en el host automáticamente a través de Docker:

```yaml
services:
  floci:
    image: floci/floci:latest
    ports:
      - "4566:4566"           # All AWS API calls
      - "6379-6399:6379-6399" # ElastiCache / Redis proxy (proxy in Floci)
      - "7001-7099:7001-7099" # RDS proxy (proxy in Floci)
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
```

Los puertos EKS (6500–6599) y OpenSearch (9400–9499) están vinculados directamente en el host por Docker y son accesibles sin ninguna entrada `ports:`. No se debe agregar ECR (5100–5199).

Si su aplicación se ejecuta dentro de la misma red Docker Compose, puede llegar a Floci directamente en el puerto del contenedor `4566`; la asignación del puerto del host solo es necesaria para las herramientas que se ejecutan en el host (CLI, complementos IDE, etc.).
