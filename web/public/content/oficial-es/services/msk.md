# MSK (Transmisión administrada para Kafka)

**Protocolo:** REST-JSON
**Punto final:** `http://localhost:4566/`

Floci emula Amazon MSK orquestando contenedores **Redpanda**. Esto proporciona una alta compatibilidad con Kafka API manteniendo un tamaño reducido.

## Acciones admitidas

| Acción | Descripción |
|---|---|
| `CreateCluster` | Genera un nuevo contenedor Redpanda para el clúster |
| `CreateClusterV2` | Creación moderna sin servidor/aprovisionada (asignada a aprovisionada) |
| `ListClusters` | Listar todos los clústeres emulados |
| `ListClustersV2` | Enumere todos los clústeres emulados que utilizan V2 API |
| `DescribeCluster` | Obtener metadatos y estado del clúster |
| `DescribeClusterV2` | Obtenga metadatos y estado del clúster usando V2 API |
| `DeleteCluster` | Detiene y elimina el contenedor Redpanda |
| `GetBootstrapBrokers` | Obtenga las cadenas de conexión para el clúster |

## Configuración

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_MSK_ENABLED` | `true` | Activar o desactivar el servicio |
| `FLOCI_SERVICES_MSK_MOCK` | `false` | `true` = CRUD solo de metadatos, sin contenedores Docker |
| `FLOCI_SERVICES_MSK_DEFAULT_IMAGE` | `redpandadata/redpanda:latest` | Imagen Docker para contenedores Redpanda (Kafka) |

## Cómo funciona

Cuando `mock` está configurado en `false` (predeterminado), Floci usa Docker API para iniciar un contenedor Redpanda para cada clúster creado. Para la configuración del socket Docker, la autenticación del registro privado y otras configuraciones de Docker, consulte [Configuración Docker](../configuration/docker.md).

- **Asignación de puertos**: El Kafka API (9092) se asigna a un puerto de host dinámico.
- **Persistencia**: cada clúster obtiene un volumen Docker con nombre (`floci-msk-{volumeId}`). En el modo de memoria, el volumen se elimina al eliminar el clúster; en modos persistentes se conserva a menos que `FLOCI_STORAGE_PRUNE_VOLUMES_ON_DELETE=true`.
- **Preparación**: el estado del clúster cambia a `ACTIVE` una vez que se puede acceder al punto final Redpanda `/ready`.

## Ejemplos

```bash
export AWS_ENDPOINT_URL=http://localhost:4566

# Create a cluster
aws kafka create-cluster \
  --cluster-name my-cluster \
  --kafka-version "3.6.1" \
  --numberOfBrokerNodes 1 \
  --broker-node-group-info '{"InstanceType":"kafka.m5.large","ClientSubnets":["subnet-1"]}' \
  --endpoint-url $AWS_ENDPOINT_URL

# List clusters
aws kafka list-clusters --endpoint-url $AWS_ENDPOINT_URL

# Get bootstrap brokers
CLUSTER_ARN=$(aws kafka list-clusters --query 'ClusterInfoList[0].ClusterArn' --output text --endpoint-url $AWS_ENDPOINT_URL)
aws kafka get-bootstrap-brokers --cluster-arn $CLUSTER_ARN --endpoint-url $AWS_ENDPOINT_URL

# Delete a cluster
aws kafka delete-cluster --cluster-arn $CLUSTER_ARN --endpoint-url $AWS_ENDPOINT_URL
```
