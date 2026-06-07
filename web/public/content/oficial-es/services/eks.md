# EKS (Servicio elástico de Kubernetes)

**Protocolo:** REST-JSON  
**Punto final:** `http://localhost:4566/` (ruta enrutada a través de JAX-RS)

EKS utiliza un REST API estándar con cuerpos JSON, no el JSON 1.1 (`X-Amz-Target`) ni el protocolo Query.

## Operaciones compatibles

| Operación | Descripción |
|---|---|
| `CreateCluster` | Cree un nuevo clúster EKS |
| `DescribeCluster` | Describir un grupo por su nombre |
| `ListClusters` | Listar todos los nombres de los clústeres |
| `DeleteCluster` | Eliminar un clúster |
| `TagResource` | Agregar etiquetas a un clúster |
| `UntagResource` | Eliminar etiquetas de un clúster |
| `ListTagsForResource` | Listar etiquetas en un clúster |

## Modos

### Modo simulado (`mock: true`)

Los metadatos del clúster se almacenan durante el proceso. No se inicia ningún contenedor Docker. El clúster pasa directamente a `ACTIVE` en el momento de su creación. Úselo en CI o cuando solo necesite la forma EKS API, no un servidor Kubernetes API real.

### Modo real (`mock: false`, predeterminado)

Floci inicia un contenedor **k3s** (`rancher/k3s`) para cada clúster. El servidor k3s API está expuesto en un puerto de host del rango configurado (`6500–6599`). Una vez que `/readyz` responde, el clúster pasa a `ACTIVE` y el certificado de CA se extrae de kubeconfig.

De forma predeterminada, `describe-cluster` devuelve un punto final **accesible al host** (`https://localhost:<hostPort>`); El certificado del servidor k3s incluye una SAN `localhost`, por lo que se verifica con la CA en `cluster.certificateAuthority.data`. Configure `endpoint-mode: network` para que devuelva el nombre DNS del contenedor (`https://floci-eks-<name>:6443`), accesible desde otros contenedores en la red Docker (el comportamiento anterior al #1118). En el modo `network`, el punto final vuelve al formato accesible al host cuando Floci se ejecuta de forma nativa, ya que no hay ningún nombre DNS de contenedor que un cliente host pueda usar.

#### Conexión con `kubectl` (flujo de trabajo nativo AWS)

El flujo estándar AWS funciona de extremo a extremo:

```bash
aws eks update-kubeconfig --name my-cluster
kubectl get nodes
```

`aws eks update-kubeconfig` conecta `aws eks get-token` a kubeconfig como una credencial ejecutiva. El token de portador que produce se valida mediante un **webhook de autenticación de token** que Floci conecta a k3s: el servidor API de k3s envía un `TokenReview` de Kubernetes al punto final `/_floci/eks/token-webhook` de Floci, y Floci asigna el token al Grupo `system:masters` (vinculado a `cluster-admin`). No se requiere `aws-iam-authenticator`.

Este webhook está habilitado de forma predeterminada (`iam-auth-webhook: true`). Configúrelo en `false` para iniciar k3s sin él (en cuyo caso los tokens `aws eks get-token` se rechazan con `401`).

!!! nota "Alcancebilidad del webhook y creación de redes"
    El servidor k3s API debe poder acceder a la URL del webhook de Floci. Cuando Floci se ejecuta de forma nativa, los contenedores k3s llegan a través de `host.docker.internal`; cuando Floci se ejecuta en un contenedor (`floci start`), Floci y los contenedores k3s comparten una red Docker. La red k3s se toma de `FLOCI_SERVICES_EKS_DOCKER_NETWORK` si está configurada; de lo contrario, la `FLOCI_SERVICES_DOCKER_NETWORK` global; de lo contrario, la red Floci está conectada (detectada automáticamente), por lo que no se requiere ninguna configuración de red específica de EKS en la configuración de composición estándar.

    El webhook kubeconfig se copia en el contenedor k3s a través de Docker API (no montado en enlace), por lo que el token-webhook funciona igual en los modos nativo y Docker-in-Docker con **sin ruta de host/configuración `host-persistent-path`**.

!!! nota "Se requiere enchufe Docker"
    El modo real inicia contenedores Docker privilegiados. Monte el zócalo Docker y configure la red Docker para que los contenedores puedan comunicarse entre sí.

```yaml
services:
  floci:
    image: floci/floci:latest
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    ports:
      - "4566:4566"
    environment:
      FLOCI_SERVICES_EKS_DOCKER_NETWORK: my_project_default
```

!!! nota "No se necesita mapeo de puertos para los puertos k3s"
    Los contenedores k3s vinculan su puerto de servidor API (6500–6599) directamente en el host a través de Docker; no se requiere ninguna entrada `ports:` en `docker-compose.yml`. Consulte [Referencia de puertos](../configuration/ports.md#ports-65006599-eks-real-mode) para obtener una explicación completa.

## Configuración

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_EKS_ENABLED` | `true` | Habilitar el servicio EKS |
| `FLOCI_SERVICES_EKS_MOCK` | `false` | Modo solo de metadatos (sin Docker) |
| `FLOCI_SERVICES_EKS_DEFAULT_IMAGE` | `rancher/k3s:latest` | Imagen k3s Docker |
| `FLOCI_SERVICES_EKS_API_SERVER_BASE_PORT` | `6500` | Primer puerto de la gama de servidores k3s API |
| `FLOCI_SERVICES_EKS_API_SERVER_MAX_PORT` | `6599` | Último puerto en la gama de servidores k3s API |
| `FLOCI_SERVICES_EKS_DATA_PATH` | `./data/eks` | Raíz de montaje de enlace de host para datos de clúster |
| `FLOCI_SERVICES_EKS_DOCKER_NETWORK` | *(desarmado)* | Red Docker para contenedores k3s (recurre a la `FLOCI_SERVICES_DOCKER_NETWORK` global, luego a la red propia de Floci) |
| `FLOCI_SERVICES_EKS_KEEP_RUNNING_ON_SHUTDOWN` | `false` | Deje los contenedores k3s en ejecución después de que se detenga Floci |
| `FLOCI_SERVICES_EKS_ENDPOINT_MODE` | `host` | Punto final `describe-cluster`: `host` (`localhost:<hostPort>`) o `network` (DNS de contenedor) |
| `FLOCI_SERVICES_EKS_IAM_AUTH_WEBHOOK` | `true` | Conecte un webhook de autenticación de token a k3s para que `aws eks get-token` funcione |

### Modo simulado (CI/pruebas)

Utilice `FLOCI_SERVICES_EKS_MOCK=true` cuando solo necesite la forma API:

```yaml
# docker-compose.yml — CI / test environment
services:
  floci:
    image: floci/floci:latest
    environment:
      FLOCI_SERVICES_EKS_MOCK: "true"
```

## Formato ARN

```
arn:aws:eks:<region>:<accountId>:cluster/<clusterName>
```

## Ejemplos

```bash
export AWS_ENDPOINT_URL=http://localhost:4566
export AWS_DEFAULT_REGION=us-east-1
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test

# Create a cluster
aws eks create-cluster \
  --name my-cluster \
  --role-arn arn:aws:iam::000000000000:role/eks-role \
  --resources-vpc-config subnetIds=[],securityGroupIds=[] \
  --kubernetes-version 1.29

# Describe the cluster
aws eks describe-cluster --name my-cluster

# List clusters
aws eks list-clusters

# Tag a cluster
aws eks tag-resource \
  --resource-arn arn:aws:eks:us-east-1:000000000000:cluster/my-cluster \
  --tags env=dev,team=platform

# Delete a cluster
aws eks delete-cluster --name my-cluster
```

## Java SDK Ejemplo

```java
EksClient eks = EksClient.builder()
    .endpointOverride(URI.create("http://localhost:4566"))
    .region(Region.US_EAST_1)
    .credentialsProvider(StaticCredentialsProvider.create(
        AwsBasicCredentials.create("test", "test")))
    .build();

// Create cluster
CreateClusterResponse created = eks.createCluster(r -> r
    .name("my-cluster")
    .roleArn("arn:aws:iam::000000000000:role/eks-role")
    .resourcesVpcConfig(v -> v
        .subnetIds(List.of())
        .securityGroupIds(List.of()))
    .version("1.29")
    .tags(Map.of("env", "dev")));

// Describe cluster
DescribeClusterResponse described = eks.describeCluster(r -> r
    .name("my-cluster"));

System.out.println(described.cluster().status()); // ACTIVE

// List clusters
List<String> names = eks.listClusters(r -> {}).clusters();

// Tag resource
eks.tagResource(r -> r
    .resourceArn(created.cluster().arn())
    .tags(Map.of("team", "platform")));

// Delete cluster
eks.deleteCluster(r -> r.name("my-cluster"));
```

## No implementado (Fase 1)

Las siguientes funciones de EKS aún no son compatibles:

- Grupos de nodos (`CreateNodegroup`, `DescribeNodegroup`, `ListNodegroups`, `DeleteNodegroup`)
- Perfiles de Fargate
- `UpdateClusterConfig` / `UpdateClusterVersion`
- Complementos (`CreateAddon`, `DescribeAddon`, `ListAddons`)
- Configuraciones del proveedor de identidad
- Acceder a entradas y políticas.
- Configuración de cifrado
