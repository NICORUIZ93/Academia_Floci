# Neptune

**Protocolo:** Consulta (XML) para gestión API + Gremlin / HTTP para plano de datos
**Punto final de gestión:** `POST http://localhost:4566/`
**Punto final de datos:** `localhost:<proxy-port>` (TCP / WebSocket)

Floci administra contenedores reales [Apache TinkerPop Gremlin Server](https://tinkerpop.apache.org/) Docker y conexiones proxy a ellos, proporcionando una emulación de Neptune compatible con API para desarrollo y pruebas locales.

## Acciones admitidas

| Acción | Descripción |
|--------|-------------|
| `CreateDBCluster` | Cree un clúster Neptune e inicie un contenedor de Gremlin Server |
| `DescribeDBClusters` | Listar clústeres y sus detalles de conexión |
| `DeleteDBCluster` | Detener y eliminar un clúster |
| `ModifyDBCluster` | Actualizar la configuración del clúster |
| `CreateDBInstance` | Agregar una instancia a un clúster |
| `DescribeDBInstances` | Listar instancias |
| `DeleteDBInstance` | Eliminar una instancia de un clúster |
| `ModifyDBInstance` | Actualizar configuración de instancia |

## Configuración

| Variables | Predeterminado | Descripción |
|----------|---------|-------------|
| `FLOCI_SERVICES_NEPTUNE_ENABLED` | `true` | Activar o desactivar Neptune |
| `FLOCI_SERVICES_NEPTUNE_PROXY_BASE_PORT` | `8182` | Primer puerto de host en el rango de proxy Gremlin |
| `FLOCI_SERVICES_NEPTUNE_PROXY_MAX_PORT` | `8282` | Último puerto de host en el rango de proxy de Gremlin |
| `FLOCI_SERVICES_NEPTUNE_DEFAULT_IMAGE` | `tinkerpop/gremlin-server:3.7.3` | Imagen del servidor Gremlin Docker |
| `FLOCI_SERVICES_NEPTUNE_DOCKER_NETWORK` | _(valor predeterminado del host)_ | Red Docker para conectividad de contenedores |

### Docker Componer

Neptune requiere que el socket Docker y el rango de puertos proxy Gremlin estén expuestos. El primer grupo afirma `PROXY_BASE_PORT`; cada clúster adicional incrementa el puerto.

```yaml
services:
  floci:
    image: floci/floci:latest
    ports:
      - "4566:4566"
      - "8182-8282:8182-8282"   # Neptune Gremlin proxy ports
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      FLOCI_SERVICES_DOCKER_NETWORK: my-project_default
```

Para la autenticación de registro privado y otras configuraciones de Docker, consulte [Configuración de Docker](../configuration/docker.md).

## Ejemplos

### Gestión API (AWS CLI)

```bash
export AWS_ENDPOINT_URL=http://localhost:4566
export AWS_DEFAULT_REGION=us-east-1
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test

# Create a Neptune cluster
aws neptune create-db-cluster \
  --db-cluster-identifier my-neptune \
  --engine neptune

# Get cluster details and Gremlin endpoint port
aws neptune describe-db-clusters \
  --db-cluster-identifier my-neptune \
  --query 'DBClusters[0].{Endpoint:Endpoint,Port:Port}'

# Create an instance in the cluster
aws neptune create-db-instance \
  --db-instance-identifier my-neptune-instance \
  --db-cluster-identifier my-neptune \
  --db-instance-class db.r5.large \
  --engine neptune

# Delete instance and cluster
aws neptune delete-db-instance \
  --db-instance-identifier my-neptune-instance
aws neptune delete-db-cluster \
  --db-cluster-identifier my-neptune \
  --skip-final-snapshot
```

### Plano de datos gráficos (Python + gremlin-python)

```python
from gremlin_python.driver import client, serializer

# Use the port returned by DescribeDBClusters
gremlin = client.Client(
    "ws://localhost:8182/gremlin",
    "g",
    message_serializer=serializer.GraphSONSerializersV2d0(),
)

# Add a vertex
gremlin.submit("g.addV('person').property('name', 'Alice')").all().result()

# Query vertices
result = gremlin.submit("g.V().valueMap(true)").all().result()
print(result)

gremlin.close()
```

### Gestión API (Python / boto3)

```python
import boto3

neptune = boto3.client(
    "neptune",
    endpoint_url="http://localhost:4566",
    region_name="us-east-1",
)

cluster = neptune.create_db_cluster(
    DBClusterIdentifier="my-neptune",
    Engine="neptune",
)
print(cluster["DBCluster"]["Endpoint"])
```

## Fuera de alcance

- Autenticación de base de datos IAM para conexiones Gremlin.
- Neptune Analytics (búsqueda vectorial, análisis de gráficos).
- Neptune Pausa/reanudación automática sin servidor.
- Operaciones de instantánea y restauración.
