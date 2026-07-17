# MemoryDB

**Protocolo:** JSON 1.1 (`X-Amz-Target: AmazonMemoryDB.*`) para gestión API + Redis protocolo RESP para plano de datos
**Punto final de gestión:** `POST http://localhost:4566/`
**Punto final de datos:** `localhost:<proxy-port>` (TCP)

Floci administra contenedores Valkey/Redis Docker reales y conexiones proxy TCP a ellos, de modo que cualquier cliente Redis funcione, incluida la autenticación de estilo IAM. MemoryDB es compatible con cables Redis, por lo que reutiliza el proxy RESP ElastiCache de Floci y el validador SigV4.

## Modo simulado

Configure `FLOCI_SERVICES_MEMORYDB_MOCK=true` para administrar clústeres como recursos solo del plano de control; no se inicia ningún contenedor Redis. La administración API (`CreateCluster`, `DescribeClusters`, etiquetado, etc.) se comporta normalmente y devuelve un `ClusterEndpoint` de `<hostname>:6379` (el valor predeterminado es `localhost:6379`, controlado por `FLOCI_HOSTNAME`), pero no hay ningún plano de datos en vivo al que conectarse. Esto está destinado a herramientas de infraestructura como código como Terraform y OpenTofu que se ejecutan en entornos sin un socket Docker, donde solo necesita que los recursos AWS existan y devuelvan atributos consistentes.

## Acciones de gestión compatibles con

<!-- floci:actions:start -->
| Acción | Descripción |
| --- | --- |
| `CreateCluster` | Inicie un nuevo clúster MemoryDB (Redis/Valkey) |
| `DescribeClusters` | Lista de clústeres y su información de conexión |
| `UpdateCluster` | Actualizar atributos de clúster mutables (por ejemplo, descripción) |
| `DeleteCluster` | Detener y eliminar un clúster |
| `CreateUser` | - |
| `DescribeUsers` | - |
| `DeleteUser` | - |
| `CreateACL` | - |
| `DescribeACLs` | - |
| `DeleteACL` | - |
| `ListTags` | Listar etiquetas para un clúster |
| `TagResource` | Agregar etiquetas a un clúster |
| `UntagResource` | Eliminar etiquetas de un clúster |
<!-- floci:actions:end -->

## Configuración

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_MEMORYDB_ENABLED` | `true` | Activar o desactivar el servicio |
| `FLOCI_SERVICES_MEMORYDB_MOCK` | `false` | Realice un seguimiento de los clústeres sin iniciar un contenedor Redis real. Útil para herramientas IaC (Terraform/OpenTofu) cuando no hay ningún casquillo Docker disponible |
| `FLOCI_SERVICES_MEMORYDB_PROXY_BASE_PORT` | `6400` | Primer puerto de host en el rango de proxy MemoryDB |
| `FLOCI_SERVICES_MEMORYDB_PROXY_MAX_PORT` | `6419` | Último puerto de host en el rango de proxy MemoryDB |
| `FLOCI_SERVICES_MEMORYDB_DEFAULT_IMAGE` | `valkey/valkey:8` | Imagen Docker para contenedores Redis/Valkey |

### Docker Redactar

MemoryDB requiere la exposición del rango de puerto y zócalo Docker. Para la autenticación de registro privado y otras configuraciones de Docker, consulte [Configuración de Docker](../configuration/docker.md).

```yaml
services:
  floci:
    image: floci/floci:latest
    ports:
      - "4566:4566"
      - "6400-6419:6400-6419"   # MemoryDB proxy ports
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      FLOCI_SERVICES_DOCKER_NETWORK: my-project_default
```

## Ejemplos

```bash
export AWS_ENDPOINT_URL=http://localhost:4566

# Create a cluster (starts a Valkey container)
aws memorydb create-cluster \
  --cluster-name my-memdb \
  --node-type db.t4g.small \
  --acl-name open-access \
  --endpoint-url $AWS_ENDPOINT_URL

# Get the connection address and port
aws memorydb describe-clusters \
  --cluster-name my-memdb \
  --query 'Clusters[0].ClusterEndpoint' \
  --endpoint-url $AWS_ENDPOINT_URL

# Connect with redis-cli (use the Port from ClusterEndpoint)
redis-cli -h localhost -p 6400 ping

# Delete the cluster
aws memorydb delete-cluster \
  --cluster-name my-memdb \
  --endpoint-url $AWS_ENDPOINT_URL
```
