# ElastiCache

**Protocolo:** Consulta (XML) para gestión API + Redis protocolo RESP para plano de datos
**Punto final de gestión:** `POST http://localhost:4566/`
**Punto final de datos:** `localhost:<proxy-port>` (TCP)

Floci gestiona contenedores Valkey/Redis Docker reales y conexiones proxy TCP a ellos. Esto significa que cualquier cliente Redis funciona, incluida la autenticación IAM.

## Acciones de gestión admitidas

| Acción | Descripción |
|---|---|
| `CreateReplicationGroup` | Inicie un nuevo clúster Redis/Valkey |
| `DescribeReplicationGroups` | Lista de clústeres y su información de conexión |
| `DeleteReplicationGroup` | Detener y eliminar un clúster |
| `CreateUser` | Crear un usuario ElastiCache IAM |
| `DescribeUsers` | Listar usuarios de ElastiCache |
| `ModifyUser` | Actualizar cadenas de acceso de usuarios |
| `DeleteUser` | Eliminar un usuario ElastiCache |
| `ValidateIamAuthToken` | Validar un token de autenticación IAM (autenticación del plano de datos) |

## Configuración

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_ELASTICACHE_ENABLED` | `true` | Activar o desactivar el servicio |
| `FLOCI_SERVICES_ELASTICACHE_PROXY_BASE_PORT` | `6379` | Primer puerto de host en el rango de proxy ElastiCache |
| `FLOCI_SERVICES_ELASTICACHE_PROXY_MAX_PORT` | `6399` | Último puerto de host en el rango de proxy ElastiCache |
| `FLOCI_SERVICES_ELASTICACHE_DEFAULT_IMAGE` | `valkey/valkey:8` | Imagen Docker para contenedores Redis/Valkey |

### Docker Componer

ElastiCache requiere la exposición del rango de puerto y zócalo Docker. Para la autenticación de registro privado y otras configuraciones de Docker, consulte [Configuración de Docker](../configuration/docker.md).

```yaml
services:
  floci:
    image: floci/floci:latest
    ports:
      - "4566:4566"
      - "6379-6399:6379-6399"   # ElastiCache proxy ports
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      FLOCI_SERVICES_DOCKER_NETWORK: my-project_default
```

## Ejemplos

```bash
export AWS_ENDPOINT_URL=http://localhost:4566

# Create a replication group (starts a Valkey container)
aws elasticache create-replication-group \
  --replication-group-id my-cache \
  --replication-group-description "Dev cache" \
  --endpoint-url $AWS_ENDPOINT_URL

# Get the connection port
PORT=$(aws elasticache describe-replication-groups \
  --replication-group-id my-cache \
  --query 'ReplicationGroups[0].NodeGroups[0].PrimaryEndpoint.Port' \
  --output text \
  --endpoint-url $AWS_ENDPOINT_URL)

# Connect with redis-cli
redis-cli -h localhost -p $PORT ping

# Use from your application
redis-cli -h localhost -p $PORT set mykey "hello"
redis-cli -h localhost -p $PORT get mykey

# Delete the cluster
aws elasticache delete-replication-group \
  --replication-group-id my-cache \
  --endpoint-url $AWS_ENDPOINT_URL
```

## IAM Autenticación

Floci admite la validación del token de autenticación ElastiCache IAM. Cree un usuario con cadenas de acceso y valide tokens de la misma manera que funciona el RBAC ElastiCache real.

```bash
# Create an ElastiCache user
aws elasticache create-user \
  --user-id alice \
  --user-name alice \
  --engine redis \
  --access-string "on ~* +@all" \
  --no-no-password-required \
  --endpoint-url $AWS_ENDPOINT_URL
```
