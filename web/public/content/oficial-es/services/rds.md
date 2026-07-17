# RDS

**Protocolo:** Consulta (XML) para gestión protocolo cableado API + PostgreSQL / MySQL para plano de datos
**Punto final de gestión:** `POST http://localhost:4566/`
**Punto final de datos:** `localhost:<proxy-port>` (TCP)

Floci administra contenedores reales PostgreSQL, MySQL y MariaDB Docker y conexiones proxy TCP a ellos, incluido el soporte de autenticación IAM.

RDS Los datos API (`rds-data`) se documentan por separado porque utiliza rutas REST JSON en lugar del protocolo de consulta RDS. Consulte [RDS Datos API](rds-data.md).

## Acciones de gestión admitidas

<!-- floci:actions:start -->
| Acción | Descripción |
| --- | --- |
| `CreateDBInstance` | Iniciar una nueva instancia de base de datos |
| `DescribeDBInstances` | Listar instancias y su información de conexión |
| `DeleteDBInstance` | Detener y eliminar una instancia |
| `ModifyDBInstance` | Actualizar configuración de instancia |
| `RebootDBInstance` | Reiniciar una instancia de base de datos |
| `DescribeOrderableDBInstanceOptions` | Listar opciones deterministas de clases de instancias |
| `CreateDBSubnetGroup` | Crear un grupo de subred de base de datos |
| `DescribeDBSubnetGroups` | Listar grupos de subredes de bases de datos |
| `ModifyDBSubnetGroup` | Actualizar la descripción del grupo de subred de la base de datos y la lista de subredes |
| `DeleteDBSubnetGroup` | Eliminar un grupo de subred de base de datos |
| `CreateDBCluster` | Cree un clúster compatible con Aurora |
| `DescribeDBClusters` | Listar grupos |
| `DeleteDBCluster` | Eliminar un clúster |
| `ModifyDBCluster` | Actualizar la configuración del clúster |
| `CreateDBParameterGroup` | Crear un grupo de parámetros |
| `DescribeDBParameterGroups` | Listar grupos de parámetros |
| `DeleteDBParameterGroup` | Eliminar un grupo de parámetros |
| `ModifyDBParameterGroup` | Actualizar la configuración del grupo de parámetros |
| `DescribeDBParameters` | Listar parámetros en un grupo |
| `CreateDBClusterParameterGroup` | - |
| `DescribeDBClusterParameterGroups` | - |
| `DeleteDBClusterParameterGroup` | - |
| `ModifyDBClusterParameterGroup` | - |
| `DescribeDBClusterParameters` | - |
| `DescribeDBSnapshots` | - |
| `DescribeDBProxies` | - |
| `DescribeDBClusterSnapshots` | - |
| `AddTagsToResource` | Agregar etiquetas a un recurso de base de datos |
| `ListTagsForResource` | Listar etiquetas para un recurso de base de datos |
| `RemoveTagsFromResource` | Eliminar etiquetas de un recurso de base de datos |
<!-- floci:actions:end -->

## Configuración

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_RDS_ENABLED` | `true` | Activar o desactivar el servicio |
| `FLOCI_SERVICES_RDS_MOCK` | `false` | `true` = solo metadatos (sin contenedor Docker ni proxy de autenticación) |
| `FLOCI_SERVICES_RDS_PROXY_BASE_PORT` | `7000` | Primer puerto de host en el rango de proxy RDS |
| `FLOCI_SERVICES_RDS_PROXY_MAX_PORT` | `7099` | Último puerto de host en el rango de proxy RDS |
| `FLOCI_SERVICES_RDS_DEFAULT_POSTGRES_IMAGE` | `postgres:16-alpine` | Imagen Docker para instancias PostgreSQL |
| `FLOCI_SERVICES_RDS_DEFAULT_MYSQL_IMAGE` | `mysql:8.0` | Imagen Docker para instancias MySQL |
| `FLOCI_SERVICES_RDS_DEFAULT_MARIADB_IMAGE` | `mariadb:11` | Imagen Docker para instancias MariaDB |

### Docker Redactar

RDS requiere la exposición del rango de puerto y zócalo Docker. Para la autenticación de registro privado y otras configuraciones de Docker, consulte [Configuración de Docker](../configuration/docker.md).

```yaml
services:
  floci:
    image: floci/floci:latest
    ports:
      - "4566:4566"
      - "7001-7099:7001-7099"   # RDS proxy ports
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      FLOCI_SERVICES_DOCKER_NETWORK: my-project_default
      FLOCI_SERVICES_RDS_PROXY_BASE_PORT: "7001"
```

### Modo simulado (CI/pruebas)

Configure `FLOCI_SERVICES_RDS_MOCK=true` cuando solo necesite la forma de gestión API: clústeres y
las instancias se registran como `available` inmediatamente, sin ningún contenedor Docker o proxy de autenticación detrás
ellos. Cada recurso sigue teniendo un puerto de punto final único, pero nada escucha en él.

```yaml
# docker-compose.yml — CI / test environment
services:
  floci:
    image: floci/floci:latest
    environment:
      FLOCI_SERVICES_RDS_MOCK: "true"
```

!!! nota "Cambio de modo sobre estado persistente"
    Con un modo de almacenamiento persistente, cambiar `FLOCI_SERVICES_RDS_MOCK` entre reinicios es
    mejor esfuerzo, al igual que con los otros servicios con capacidad simulada: recursos creados en modo real y
    eliminados en simulacro dejan atrás sus contenedores y volúmenes, y los recursos creados en simulacro
    El modo se restaura con contenedores nuevos y vacíos cuando se cargan en modo real.

## Ejemplos

```bash
export AWS_ENDPOINT_URL=http://localhost:4566

# Create a PostgreSQL instance
aws rds create-db-instance \
  --db-instance-identifier mypostgres \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username admin \
  --master-user-password secret123 \
  --allocated-storage 20 \
  --endpoint-url $AWS_ENDPOINT_URL

# Get connection details
aws rds describe-db-instances \
  --db-instance-identifier mypostgres \
  --query 'DBInstances[0].Endpoint' \
  --endpoint-url $AWS_ENDPOINT_URL

# Connect with psql (use the port returned above)
psql -h localhost -p 7001 -U admin

# Create a MySQL instance
aws rds create-db-instance \
  --db-instance-identifier mymysql \
  --db-instance-class db.t3.micro \
  --engine mysql \
  --master-username root \
  --master-user-password secret123 \
  --allocated-storage 20 \
  --endpoint-url $AWS_ENDPOINT_URL

# Connect with mysql client
mysql -h 127.0.0.1 -P 7002 -u root -psecret123
```

## Motores compatibles con

| Motor | Imagen predeterminada |
|---|---|
| `postgres` | `postgres:16-alpine` |
| `mysql` | `mysql:8.0` |
| `mariadb` | `mariadb:11` |

Anule la imagen por instancia con el indicador `--engine-version` o globalmente mediante variables de entorno.

## Persistencia

Cada instancia de base de datos y clúster obtiene su propio volumen Docker (`floci-rds-{volumeId}`) creado
automáticamente. No se requiere configuración.

| Escenario | Comportamiento del volumen |
|---|---|
| Modo `memory` (predeterminado) | El volumen se elimina automáticamente cuando se elimina la instancia |
| `persistent` / `hybrid` / `wal` | El volumen se conserva después de la eliminación: los datos sobreviven para la recuperación manual |

```bash
# CI — ephemeral, volumes cleaned up on each delete
FLOCI_STORAGE_MODE=memory

# Local dev — retain DB data across Floci restarts
FLOCI_STORAGE_MODE=hybrid

# Local dev — also remove volumes immediately on delete
FLOCI_STORAGE_MODE=hybrid
FLOCI_STORAGE_PRUNE_VOLUMES_ON_DELETE=true
```

Para utilizar un montaje de enlace de host en lugar de un volumen con nombre (avanzado), establezca una ruta absoluta:

```bash
FLOCI_STORAGE_HOST_PERSISTENT_PATH=/absolute/host/path/data
```

!!! nota "Escritorio Docker en macOS"
    Los volúmenes con nombre funcionan correctamente en Docker Desktop para macOS. No se admiten los montajes vinculados a rutas dentro del contenedor Floci; use volúmenes con nombre (el valor predeterminado).

## Autenticación

El proxy de autenticación RDS valida el nombre de usuario y la contraseña maestros en la capa de proxy. Todos los demás usuarios de la base de datos pasan directamente al motor backend: créelos con SQL (`CREATE USER`) estándar y conéctese normalmente.

También se admite la autenticación de la base de datos IAM. Configure `--enable-iam-database-authentication` en el momento de la creación de la instancia y use `aws rds generate-db-auth-token` para obtener un token.
