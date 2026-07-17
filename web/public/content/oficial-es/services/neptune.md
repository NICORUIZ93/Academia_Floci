# Neptune

**Protocolo:** Consulta (XML) para gestión API + Gremlin / HTTP / Bolt para plano de datos
**Punto final de gestión:** `POST http://localhost:4566/`
**Punto final de datos:** `localhost:<proxy-port>` (TCP / WebSocket / Bolt)

Floci administra contenedores Docker de bases de datos de gráficos reales y conexiones proxy a ellos, proporcionando una emulación de Neptune compatible con API para desarrollo y pruebas locales.

## Motor trasero (`db-type`)

Neptune admite múltiples lenguajes de consulta. Floci respalda cada uno con un contenedor diferente y representa el protocolo de conexión coincidente, seleccionado globalmente a través de `FLOCI_SERVICES_NEPTUNE_DB_TYPE` (reflejando el `NEPTUNE_DB_TYPE` de LocalStack):

| `db-type` | Imagen de fondo | Idioma de consulta | Protocolo de cable |
|-----------|---------------|----------------|---------------|
| `gremlin` _(predeterminado)_ | [Servidor Apache TinkerPop Gremlin](https://tinkerpop.apache.org/) | duendecillo | WebSocket |
| `neo4j` | [Neo4j](https://neo4j.com/) | openCypher | Perno |

El proxy es una retransmisión de bytes transparente, por lo que el rango de puertos del proxy orientado al host no cambia independientemente del motor; solo difiere el protocolo con el que se conecta. Conéctese al puerto proxy de un clúster (del rango `8182`–`8282`, devuelto por `DescribeDBClusters`), no al puerto nativo del backend. El backend de Neo4j se ejecuta con `NEO4J_AUTH=none`, coincidiendo con el modelo de autenticación de Neptune en el borde AWS (IAM) en lugar de en el protocolo gráfico; conecte su controlador Bolt/openCypher sin autenticación.

## Acciones compatibles con

<!-- floci:actions:start -->
| Acción | Descripción |
| --- | --- |
| `CreateDBCluster` | Cree un clúster Neptune e inicie un contenedor de Gremlin Server |
| `DescribeDBClusters` | Listar clústeres y sus detalles de conexión |
| `DeleteDBCluster` | Detener y eliminar un clúster |
| `ModifyDBCluster` | Actualizar la configuración del clúster |
| `CreateDBInstance` | Agregar una instancia a un clúster |
| `DescribeDBInstances` | Listar instancias |
| `DeleteDBInstance` | Eliminar una instancia de un clúster |
| `ModifyDBInstance` | Actualizar configuración de instancia |
<!-- floci:actions:end -->

## Configuración

| Variables | Predeterminado | Descripción |
|----------|---------|-------------|
| `FLOCI_SERVICES_NEPTUNE_ENABLED` | `true` | Activar o desactivar Neptune |
| `FLOCI_SERVICES_NEPTUNE_PROXY_BASE_PORT` | `8182` | Primer puerto de host en el rango de proxy Gremlin |
| `FLOCI_SERVICES_NEPTUNE_PROXY_MAX_PORT` | `8282` | Último puerto de host en el rango de proxy |
| `FLOCI_SERVICES_NEPTUNE_DB_TYPE` | `gremlin` | Motor backend: `gremlin` (Gremlin/WebSocket) o `neo4j` (openCypher/Bolt) |
| `FLOCI_SERVICES_NEPTUNE_DEFAULT_IMAGE` | `tinkerpop/gremlin-server:3.7.3` | Imagen utilizada cuando `db-type=gremlin` |
| `FLOCI_SERVICES_NEPTUNE_DEFAULT_NEO4J_IMAGE` | `neo4j:5-community` | Imagen utilizada cuando `db-type=neo4j` |
| `FLOCI_SERVICES_NEPTUNE_DOCKER_NETWORK` | _(valor predeterminado del host)_ | Red Docker para conectividad de contenedores |

### Docker Redactar

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

### Plano de datos gráficos: openCypher (Python + controlador neo4j)

Inicie Floci con `FLOCI_SERVICES_NEPTUNE_DB_TYPE=neo4j`, luego conéctese con cualquier Bolt
controlador y ejecute openCypher:

```python
from neo4j import GraphDatabase

# Use the port returned by DescribeDBClusters; no auth (NEO4J_AUTH=none)
driver = GraphDatabase.driver("bolt://localhost:8182", auth=None)

with driver.session() as session:
    session.run("CREATE (:Person {name: 'Alice'})")
    count = session.run("MATCH (p:Person) RETURN count(p) AS c").single()["c"]
    print(count)

driver.close()
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
