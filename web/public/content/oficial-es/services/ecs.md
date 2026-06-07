# ECS (Servicio de contenedor elástico)

**Protocolo:** JSON 1.1
**Punto final:** `POST /` + `X-Amz-Target: AmazonEC2ContainerServiceV20141113.<Action>`

ECS emula clústeres, definiciones de tareas, tareas y servicios. En la configuración predeterminada, las tareas se ejecutan como contenedores Docker reales. Configure `mock: true` (habilitado automáticamente en las pruebas) para ejecutar tareas como apéndices en proceso sin Docker.

## Operaciones compatibles

### Clústeres

| Operación | Descripción |
|---|---|
| `CreateCluster` | Crear un clúster (idempotente) |
| `DescribeClusters` | Describir uno o más grupos |
| `ListClusters` | Listar ARN de clúster |
| `UpdateCluster` | Actualizar la configuración del clúster |
| `UpdateClusterSettings` | Actualización `containerInsights` y otras configuraciones |
| `PutClusterCapacityProviders` | Asociar proveedores de capacidad a un clúster |
| `DeleteCluster` | Eliminar un clúster vacío |

### Definiciones de tareas

| Operación | Descripción |
|---|---|
| `RegisterTaskDefinition` | Registrar una nueva revisión de una definición de tarea |
| `DescribeTaskDefinition` | Describir una definición de tarea por familia: revisión o ARN |
| `ListTaskDefinitions` | Listar ARN de definición de tarea |
| `ListTaskDefinitionFamilies` | Lista de tareas definición apellidos |
| `DeregisterTaskDefinition` | Marcar una revisión INACTIVA |
| `DeleteTaskDefinitions` | Eliminar una o más definiciones de tareas |

### Tareas de

| Operación | Descripción |
|---|---|
| `RunTask` | Lanzar una o más instancias de tareas |
| `StartTask` | Iniciar una tarea en instancias de contenedor específicas |
| `StopTask` | Detener una tarea en ejecución |
| `DescribeTasks` | Describe una o más tareas |
| `ListTasks` | Listar ARN de tareas (filtrables por clúster, familia, servicio, estado) |
| `UpdateTaskProtection` | Establecer protección escalada para tareas |
| `GetTaskProtection` | Obtener el estado actual de protección de tareas |

### Servicios

| Operación | Descripción |
|---|---|
| `CreateService` | Crear un servicio de larga duración |
| `UpdateService` | Actualice el recuento deseado, la definición de tarea o la configuración de implementación |
| `DeleteService` | Eliminar un servicio (compatible con `force`) |
| `DescribeServices` | Describir uno o más servicios |
| `ListServices` | Listar ARN de servicios en un clúster |
| `ListServicesByNamespace` | Listar servicios filtrados por espacio de nombres de Cloud Map |

### Conjuntos de tareas

| Operación | Descripción |
|---|---|
| `CreateTaskSet` | Crear un conjunto de tareas dentro de un servicio |
| `UpdateTaskSet` | Actualizar la escala de un conjunto de tareas |
| `DeleteTaskSet` | Eliminar un conjunto de tareas |
| `DescribeTaskSets` | Describir conjuntos de tareas para un servicio |
| `UpdateServicePrimaryTaskSet` | Promocionar una tarea configurada como principal |

### Instancias de contenedor

| Operación | Descripción |
|---|---|
| `RegisterContainerInstance` | Registrar una instancia de contenedor con un clúster |
| `DeregisterContainerInstance` | Dar de baja una instancia de contenedor |
| `DescribeContainerInstances` | Describir instancias de contenedores |
| `ListContainerInstances` | Listar ARN de instancia de contenedor |
| `UpdateContainerAgent` | Actualización del agente desencadenante (stub) |
| `UpdateContainerInstancesState` | Drenar o activar instancias de contenedores |

### Proveedores de capacidad

| Operación | Descripción |
|---|---|
| `CreateCapacityProvider` | Crear un proveedor de capacidad personalizado |
| `UpdateCapacityProvider` | Actualizar un proveedor de capacidad |
| `DeleteCapacityProvider` | Eliminar un proveedor de capacidad |
| `DescribeCapacityProviders` | Describir los proveedores de capacidad (incluye elementos integrados de FARGATE) |

### Implementaciones y revisiones del servicio

| Operación | Descripción |
|---|---|
| `DescribeServiceDeployments` | Describir las implementaciones de servicios |
| `ListServiceDeployments` | Listar ARN de implementación de servicios |
| `DescribeServiceRevisions` | Describir las revisiones del servicio |

### Etiquetas

| Operación | Descripción |
|---|---|
| `TagResource` | Agregar etiquetas a un clúster, servicio, tarea o definición de tarea |
| `UntagResource` | Eliminar etiquetas de un recurso |
| `ListTagsForResource` | Listar etiquetas en un recurso |

### Configuración y atributos de la cuenta

| Operación | Descripción |
|---|---|
| `PutAccountSetting` | Establecer una configuración a nivel de cuenta para el usuario que llama |
| `PutAccountSettingDefault` | Establecer la configuración predeterminada a nivel de cuenta |
| `DeleteAccountSetting` | Eliminar una configuración de cuenta |
| `ListAccountSettings` | Listar la configuración de la cuenta |
| `PutAttributes` | Establecer atributos de valor-clave personalizados en los recursos |
| `DeleteAttributes` | Eliminar atributos de los recursos |
| `ListAttributes` | Listar recursos con un atributo determinado |

### Agente / Talones de cambio de estado

| Operación | Descripción |
|---|---|
| `SubmitTaskStateChange` | Talón de devolución de llamada del agente |
| `SubmitContainerStateChange` | Talón de devolución de llamada del agente |
| `SubmitAttachmentStateChanges` | Talón de devolución de llamada del agente |
| `DiscoverPollEndpoint` | Devuelve el punto final de sondeo del agente |

## Configuración

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_ECS_ENABLED` | `true` | Activar o desactivar el servicio ECS |
| `FLOCI_SERVICES_ECS_MOCK` | `false` | Omitir Docker; tareas van directamente a `RUNNING` (útil para CI) |
| `FLOCI_SERVICES_ECS_DOCKER_NETWORK` | *(desarmado)* | Red Docker para contenedores de tareas |
| `FLOCI_SERVICES_ECS_DEFAULT_MEMORY_MB` | `512` | Memoria predeterminada (MB) cuando la definición de tarea la omite |
| `FLOCI_SERVICES_ECS_DEFAULT_CPU_UNITS` | `256` | Unidades de CPU predeterminadas cuando la definición de tarea las omite |

### Modo simulado

Configure `FLOCI_SERVICES_ECS_MOCK=true` para que se ejecute sin Docker. En este modo, las tareas omiten el inicio del contenedor y pasan inmediatamente a `RUNNING` y luego a `STOPPED` cuando se detiene. Este es el modo recomendado para pruebas unitarias/de integración y canalizaciones de CI donde Docker-in-Docker no está disponible.

```yaml
# docker-compose.yml — CI / test environment
services:
  floci:
    image: floci/floci:latest
    environment:
      FLOCI_SERVICES_ECS_MOCK: "true"
```

```yaml
# docker-compose.yml — local development (real containers)
services:
  floci:
    image: floci/floci:latest
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      FLOCI_SERVICES_ECS_MOCK: "false"
      FLOCI_SERVICES_ECS_DOCKER_NETWORK: my_network
```

### Requisitos del zócalo Docker

Cuando `mock: false` (el valor predeterminado), ECS lanza contenedores Docker reales y requiere el socket Docker. Móntelo y configure la red para que los contenedores puedan comunicarse entre sí. Para la autenticación de registro privado y otras configuraciones de Docker, consulte [Configuración de Docker](../configuration/docker.md).

```yaml
services:
  floci:
    image: floci/floci:latest
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      FLOCI_SERVICES_ECS_DOCKER_NETWORK: aws-local_default
```

## Ejemplos

```bash
export AWS_ENDPOINT_URL=http://localhost:4566
export AWS_DEFAULT_REGION=us-east-1
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test

# Create a cluster
aws ecs create-cluster --cluster-name my-cluster \
  --endpoint-url $AWS_ENDPOINT_URL

# Register a task definition
aws ecs register-task-definition \
  --family my-task \
  --container-definitions '[
    {
      "name": "app",
      "image": "nginx:latest",
      "cpu": 256,
      "memory": 512,
      "essential": true,
      "portMappings": [{"containerPort": 80, "protocol": "tcp"}]
    }
  ]' \
  --requires-compatibilities FARGATE \
  --cpu 256 --memory 512 \
  --network-mode awsvpc \
  --endpoint-url $AWS_ENDPOINT_URL

# Run a task
aws ecs run-task \
  --cluster my-cluster \
  --task-definition my-task \
  --launch-type FARGATE \
  --endpoint-url $AWS_ENDPOINT_URL

# Create a service
aws ecs create-service \
  --cluster my-cluster \
  --service-name my-service \
  --task-definition my-task \
  --desired-count 1 \
  --launch-type FARGATE \
  --endpoint-url $AWS_ENDPOINT_URL

# List running tasks
aws ecs list-tasks --cluster my-cluster \
  --endpoint-url $AWS_ENDPOINT_URL

# Stop a task
aws ecs stop-task \
  --cluster my-cluster \
  --task <task-arn> \
  --endpoint-url $AWS_ENDPOINT_URL

# Delete a service
aws ecs delete-service \
  --cluster my-cluster \
  --service my-service \
  --force \
  --endpoint-url $AWS_ENDPOINT_URL
```

## Java SDK Ejemplo

```java
EcsClient ecs = EcsClient.builder()
    .endpointOverride(URI.create("http://localhost:4566"))
    .region(Region.US_EAST_1)
    .credentialsProvider(StaticCredentialsProvider.create(
        AwsBasicCredentials.create("test", "test")))
    .build();

// Create cluster
ecs.createCluster(r -> r.clusterName("my-cluster"));

// Register task definition
ecs.registerTaskDefinition(r -> r
    .family("my-task")
    .containerDefinitions(c -> c
        .name("app")
        .image("nginx:latest")
        .cpu(256)
        .memory(512)
        .essential(true))
    .requiresCompatibilities(Compatibility.FARGATE)
    .cpu("256")
    .memory("512")
    .networkMode(NetworkMode.AWSVPC));

// Run a task
RunTaskResponse response = ecs.runTask(r -> r
    .cluster("my-cluster")
    .taskDefinition("my-task")
    .launchType(LaunchType.FARGATE)
    .count(1));

String taskArn = response.tasks().get(0).taskArn();
```
