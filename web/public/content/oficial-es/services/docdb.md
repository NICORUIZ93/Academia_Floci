# DocumentDB

**Protocolo:** Consulta (XML) para la gestión API
**Punto final de gestión:** `POST http://localhost:4566/` con parámetro `Action=`
**Punto final de datos:** `Endpoint` y `Port` devueltos por `DescribeDBClusters` (protocolo de conexión MongoDB)

Floci emula Amazon DocumentDB al administrar contenedores reales [MongoDB](https://www.mongodb.com/) Docker detrás de un plano de control con forma de RDS. DocumentDB es compatible con MongoDB, por lo que el punto final del clúster devuelto por `DescribeDBClusters` habla el protocolo de conexión MongoDB y funciona con cualquier controlador MongoDB estándar.

> **Lea siempre el host y el puerto desde `DescribeDBClusters`** en lugar de asumir un puerto fijo. MongoDB escucha en `27017` *dentro* del contenedor, pero el puerto al que se conecta depende de cómo se ejecuta Floci:
>
> - **Modo real, Floci en el host** (predeterminado): el `27017` del contenedor se publica en un **puerto de host asignado dinámicamente**. `DescribeDBClusters.Port` devuelve ese puerto asignado.
> - **Modo real, el propio Floci en un contenedor** (red Docker compartida): el punto final es el host del contenedor en `27017`.
> - **Modo simulado** (`FLOCI_SERVICES_DOCDB_MOCK=true`): no se inicia ningún contenedor; el clúster informa `localhost:27017`.

La administración API comparte el punto final de consulta RDS (`POST /` con un parámetro `Action=`). Las solicitudes se enrutan a DocumentDB cuando se proporciona `Engine=docdb` o cuando el clúster/instancia al que se hace referencia es un recurso DocumentDB conocido.

## Acciones admitidas

<!-- floci:actions:start -->
| Acción | Descripción |
| --- | --- |
| `CreateDBCluster` | Cree un clúster DocumentDB e inicie un contenedor MongoDB |
| `DescribeDBClusters` | Listar clústeres y sus detalles de conexión |
| `DescribeDBClusterSnapshots` | - |
| `DeleteDBCluster` | Detener y eliminar un clúster (no debe tener instancias) |
| `ModifyDBCluster` | Actualizar la versión del motor o la configuración de autenticación IAM |
| `CreateDBInstance` | Agregar una instancia a un clúster |
| `DescribeDBInstances` | Listar instancias |
| `DeleteDBInstance` | Eliminar una instancia de un clúster |
| `ModifyDBInstance` | Actualizar clase de instancia o configuración de autenticación IAM |
<!-- floci:actions:end -->

## Configuración

| Variables | Predeterminado | Descripción |
|----------|---------|-------------|
| `FLOCI_SERVICES_DOCDB_ENABLED` | `true` | Activar o desactivar DocumentDB |
| `FLOCI_SERVICES_DOCDB_MOCK` | `false` | Modo simulado: omita el contenedor y devuelva un punto final de marcador de posición |
| `FLOCI_SERVICES_DOCDB_DEFAULT_IMAGE` | `mongo:7.0` | Imagen MongoDB Docker |
| `FLOCI_SERVICES_DOCDB_DOCKER_NETWORK` | _(valor predeterminado del host)_ | Red Docker para conectividad de contenedores |

El modo simulado es útil para pruebas del plano de control que no necesitan una base de datos activa; el clúster informa `localhost:27017` y no se inicia ningún contenedor.

### Docker Redactar

DocumentDB necesita el socket Docker para poder iniciar contenedores MongoDB. El contenedor de cada clúster se publica en un puerto de host asignado dinámicamente, devuelto por `DescribeDBClusters`.

```yaml
services:
  floci:
    image: floci/floci:latest
    ports:
      - "4566:4566"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      FLOCI_SERVICES_DOCDB_DOCKER_NETWORK: my-project_default
```

Para la autenticación de registro privado y otras configuraciones de Docker, consulte [Configuración de Docker](../configuration/docker.md).

## Ejemplos

### Gestión API (AWS CLI)

```bash
export AWS_ENDPOINT_URL=http://localhost:4566
export AWS_DEFAULT_REGION=us-east-1
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test

# Create a DocumentDB cluster (starts a MongoDB container)
aws docdb create-db-cluster \
  --db-cluster-identifier my-docdb \
  --engine docdb \
  --master-username admin \
  --master-user-password secret99

# Get the cluster endpoint and port
aws docdb describe-db-clusters \
  --db-cluster-identifier my-docdb \
  --query 'DBClusters[0].{Endpoint:Endpoint,Port:Port}'

# Add an instance to the cluster
aws docdb create-db-instance \
  --db-instance-identifier my-docdb-instance \
  --db-cluster-identifier my-docdb \
  --db-instance-class db.r5.large \
  --engine docdb

# Delete instance and cluster
aws docdb delete-db-instance \
  --db-instance-identifier my-docdb-instance
aws docdb delete-db-cluster \
  --db-cluster-identifier my-docdb \
  --skip-final-snapshot
```

### Plano de datos (Python + pymongo)

```python
from pymongo import MongoClient

# Read the host and port from DescribeDBClusters — the port is dynamic
# in real mode and is NOT guaranteed to be 27017.
host, port = "localhost", 32768  # e.g. DBClusters[0].Endpoint / .Port
client = MongoClient(f"mongodb://admin:secret99@{host}:{port}/")

db = client["app"]
db["people"].insert_one({"name": "Alice"})

for doc in db["people"].find():
    print(doc)

client.close()
```

### Gestión API (Python / boto3)

```python
import boto3

docdb = boto3.client(
    "docdb",
    endpoint_url="http://localhost:4566",
    region_name="us-east-1",
)

cluster = docdb.create_db_cluster(
    DBClusterIdentifier="my-docdb",
    Engine="docdb",
    MasterUsername="admin",
    MasterUserPassword="secret99",
)
print(cluster["DBCluster"]["Endpoint"])
```

## Fuera de alcance

- Autenticación de base de datos IAM para conexiones MongoDB (la bandera se almacena y se repite, pero las conexiones no tienen proxy SigV4).
- Conexiones forzadas TLS / `--tls`.
- Creación y restauración de instantáneas (`DescribeDBClusterSnapshots` devuelve un resultado de código auxiliar vacío; las instantáneas no están modeladas).
- Clústeres globales, réplicas y escalado de lectura más allá de un único contenedor MongoDB por clúster.
- Grupos de parámetros, grupos de subredes y ventanas de mantenimiento.
