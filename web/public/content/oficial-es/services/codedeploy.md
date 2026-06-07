# CodeDeploy

Floci implementa CodeDeploy API: administración de estado almacenado para aplicaciones, grupos de implementación y configuraciones, además de ejecución de implementación real de Lambda y ECS con cambio de tráfico y enlaces de ciclo de vida.

**Protocolo:** JSON 1.1 — `POST /` con `X-Amz-Target: CodeDeploy_20141006.<Action>`

**Formatos ARN:**

- `arn:aws:codedeploy:<region>:<account>:application:<name>`
- `arn:aws:codedeploy:<region>:<account>:deploymentgroup:<app>/<group>`
- `arn:aws:codedeploy:<region>:<account>:deploymentconfig:<name>`
- `arn:aws:codedeploy:<region>:<account>:deployment:<id>`

## Operaciones admitidas (30 en total)

### Aplicaciones

| Operación | Notas |
|---|---|
| `CreateApplication` | Soporta `computePlatform`: `Server`, `Lambda`, `ECS` |
| `GetApplication` | Devuelve metadatos de la aplicación |
| `UpdateApplication` | Cambia el nombre de una aplicación |
| `DeleteApplication` | Elimina la aplicación y todos sus grupos de implementación |
| `ListApplications` | Devuelve todos los nombres de las aplicaciones |
| `BatchGetApplications` | Devuelve información para múltiples aplicaciones |

### Grupos de implementación

| Operación | Notas |
|---|---|
| `CreateDeploymentGroup` | Almacena la configuración del grupo; admite `ecsServices` y `loadBalancerInfo` para ECS azul/verde; la configuración de implementación está predeterminada en `CodeDeployDefault.OneAtATime` |
| `GetDeploymentGroup` | Devuelve metadatos del grupo |
| `UpdateDeploymentGroup` | Actualización parcial; admite cambio de nombre a través de `newDeploymentGroupName` |
| `DeleteDeploymentGroup` | Devuelve `hooksNotCleanedUp: []` |
| `ListDeploymentGroups` | Devuelve todos los nombres de grupos de una aplicación |
| `BatchGetDeploymentGroups` | Devuelve información para múltiples grupos |

### Configuraciones de implementación de

| Operación | Notas |
|---|---|
| `CreateDeploymentConfig` | Crea una configuración personalizada; se rechazan los nombres que comienzan con `CodeDeployDefault.` |
| `GetDeploymentConfig` | Devuelve la configuración, incluidas las funciones integradas |
| `DeleteDeploymentConfig` | Solo configuraciones personalizadas; las funciones integradas no se pueden eliminar |
| `ListDeploymentConfigs` | Devuelve todas las configuraciones, incluidas las 17 funciones integradas predefinidas |

### Ejecución de implementación de

| Operación | Notas |
|---|---|
| `CreateDeployment` | Inicia una implementación azul/verde real de Lambda o ECS; cambia el tráfico mediante pesos de alias (Lambda) o reglas de escucha ELB (ECS); invoca ganchos de ciclo de vida |
| `GetDeployment` | Devuelve el estado de implementación actual; sondear `status` hasta `Succeeded`, `Failed` o `Stopped` |
| `StopDeployment` | Indica que se debe detener un despliegue en curso; transiciones a `Stopped` |
| `ContinueDeployment` | Aceptado (no operativo para implementaciones totalmente automatizadas) |
| `ListDeployments` | Devuelve ID de implementación filtrados por aplicación, grupo o estado |
| `BatchGetDeployments` | Devuelve información para múltiples implementaciones |
| `ListDeploymentTargets` | Devuelve los ID de destino para una implementación |
| `BatchGetDeploymentTargets` | Devuelve detalles del objetivo, incluido el estado del evento del ciclo de vida |
| `PutLifecycleEventHookExecutionStatus` | Llamado por el enlace del ciclo de vida Lambda para informar sobre `Succeeded` o `Failed`; falla desencadena la reversión automática |

### Etiquetado

| Operación | Notas |
|---|---|
| `TagResource` | Etiqueta cualquier recurso por ARN |
| `UntagResource` | Elimina claves de etiquetas específicas |
| `ListTagsForResource` | Devuelve etiquetas para un recurso ARN |

### Local (no operativo)

| Operación | Notas |
|---|---|
| `AddTagsToOnPremisesInstances` | Aceptado, no operativo |
| `RemoveTagsFromOnPremisesInstances` | Aceptado, no operativo |

## Configuraciones de implementación integradas predefinidas de

Las siguientes 17 configuraciones siempre están disponibles (que coinciden con el AWS real):

**Servidor:**
- `CodeDeployDefault.OneAtATime`
- `CodeDeployDefault.HalfAtATime`
- `CodeDeployDefault.AllAtOnce`

**Lambda:**
- `CodeDeployDefault.LambdaAllAtOnce`
- `CodeDeployDefault.LambdaCanary10Percent5Minutes`
- `CodeDeployDefault.LambdaCanary10Percent10Minutes`
- `CodeDeployDefault.LambdaCanary10Percent15Minutes`
- `CodeDeployDefault.LambdaCanary10Percent30Minutes`
- `CodeDeployDefault.LambdaLinear10PercentEvery1Minute`
- `CodeDeployDefault.LambdaLinear10PercentEvery2Minutes`
- `CodeDeployDefault.LambdaLinear10PercentEvery3Minutes`
- `CodeDeployDefault.LambdaLinear10PercentEvery10Minutes`

**ECS:**
- `CodeDeployDefault.ECSAllAtOnce`
- `CodeDeployDefault.ECSCanary10Percent5Minutes`
- `CodeDeployDefault.ECSCanary10Percent15Minutes`
- `CodeDeployDefault.ECSLinear10PercentEvery1Minutes`
- `CodeDeployDefault.ECSLinear10PercentEvery3Minutes`

## Modelo de implementación ECS (azul/verde)

Para `computePlatform: ECS`, `CreateDeployment` realiza un cambio de tráfico azul/verde completo contra un servicio ECS real y un oyente ELB v2:

1. Analiza AppSpec (JSON, `revisionType: AppSpecContent`) para extraer la definición de la tarea de destino, el nombre del contenedor y el puerto.
2. Crea un **conjunto de tareas verdes** en el servicio ECS (a través de `CreateTaskSet`) que apunta a la nueva definición de tarea.
3. Ejecuta Lambdas del gancho del ciclo de vida en orden: `BeforeInstall` → (instalar) → `AfterInstall` → `BeforeAllowTraffic` → (cambio de tráfico) → `AfterAllowTraffic`
4. **Cambio de tráfico**: actualiza atómicamente la regla de avance predeterminada del oyente ELB v2:
   - `ECSAllAtOnce`: transfiere inmediatamente el 100% del tráfico al grupo objetivo ecológico
   - `ECSCanary*`: primero cambia el porcentaje canario, espera un breve intervalo (con un límite de 5 s en el emulador) y luego cambia al 100%.
   - `ECSLinear*`: cambia el tráfico en incrementos iguales (con un límite de 2 s por paso en el emulador)
5. Promueve la tarea verde configurada como **PRIMARIA** en el servicio ECS y elimina el conjunto de tareas azul original.
6. Marca el despliegue `Succeeded`; Si algún enlace del ciclo de vida informa `Failed`, la implementación está marcada como `Failed`.

**Resolución de la plataforma informática**: `computePlatform` está configurado en la Aplicación en el momento de la creación. El grupo de implementación lo hereda: no pasa `computePlatform` a `CreateDeploymentGroup`.

### Formato ECS AppSpec

```json
{
  "version": 0.0,
  "Resources": [{
    "TargetService": {
      "Type": "AWS::ECS::Service",
      "Properties": {
        "TaskDefinition": "my-task:2",
        "LoadBalancerInfo": {
          "ContainerName": "app",
          "ContainerPort": 80
        }
      }
    }
  }],
  "Hooks": [
    { "BeforeInstall": "my-before-install-hook" },
    { "AfterInstall": "my-after-install-hook" },
    { "BeforeAllowTraffic": "my-before-traffic-hook" },
    { "AfterAllowTraffic": "my-after-traffic-hook" }
  ]
}
```

Todos los campos de enlace son opcionales.

### Configuración del grupo de implementación ECS

```json
{
  "applicationName": "my-ecs-app",
  "deploymentGroupName": "my-ecs-group",
  "deploymentConfigName": "CodeDeployDefault.ECSAllAtOnce",
  "serviceRoleArn": "arn:aws:iam::000000000000:role/codedeploy-role",
  "deploymentStyle": {
    "deploymentType": "BLUE_GREEN",
    "deploymentOption": "WITH_TRAFFIC_CONTROL"
  },
  "ecsServices": [{
    "clusterName": "my-cluster",
    "serviceName": "my-service"
  }],
  "loadBalancerInfo": {
    "targetGroupPairInfoList": [{
      "targetGroups": [
        { "name": "my-blue-tg" },
        { "name": "my-green-tg" }
      ],
      "prodTrafficRoute": {
        "listenerArns": ["arn:aws:elasticloadbalancing:..."]
      }
    }]
  }
}
```

El servicio ECS se debe crear con `deploymentController.type: EXTERNAL`.

## Modelo de implementación Lambda

Para `computePlatform: Lambda`, `CreateDeployment` realiza un cambio de tráfico real:

1. Lee `deploymentStyle` y `deploymentConfigName` del grupo de implementación para determinar la estrategia de cambio de tráfico.
2. Para estrategias **canarias** y **lineal**: actualiza el alias Lambda `RoutingConfig` para enrutar un porcentaje a la nueva versión de la función, espera el intervalo configurado y luego cambia al 100%.
3. Para **todo a la vez**: cambia directamente al 100% de la nueva versión
4. Invoca el gancho de ciclo de vida `BeforeAllowTraffic` Lambda (si está configurado) y espera la devolución de llamada de `PutLifecycleEventHookExecutionStatus`.
5. Invoca el gancho de ciclo de vida `AfterAllowTraffic` Lambda (si está configurado) y espera la devolución de llamada.
6. Si algún enlace del ciclo de vida informa `Failed`, revierte automáticamente el alias a la versión anterior y marca la implementación `Failed`.

## Configuración

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_CODEDEPLOY_ENABLED` | `true` | Activar o desactivar el servicio |

## Ejemplos de CLI

### Lambda

```bash
# Create a Lambda application
aws --endpoint-url http://localhost:4566 deploy create-application \
  --application-name my-app \
  --compute-platform Lambda

# Create a deployment group for Lambda
aws --endpoint-url http://localhost:4566 deploy create-deployment-group \
  --application-name my-app \
  --deployment-group-name my-group \
  --deployment-config-name CodeDeployDefault.LambdaCanary10Percent5Minutes \
  --service-role-arn arn:aws:iam::000000000000:role/codedeploy-role \
  --deployment-style deploymentType=BLUE_GREEN,deploymentOption=WITH_TRAFFIC_CONTROL

# Start a Lambda deployment
aws --endpoint-url http://localhost:4566 deploy create-deployment \
  --application-name my-app \
  --deployment-group-name my-group \
  --revision 'revisionType=AppSpecContent,appSpecContent={content="{\"version\":0.0,\"Resources\":[{\"myFunction\":{\"Type\":\"AWS::Lambda::Function\",\"Properties\":{\"Name\":\"my-function\",\"Alias\":\"live\",\"CurrentVersion\":\"1\",\"TargetVersion\":\"2\"}}}]}"}'
```

### ECS Azul/Verde

```bash
# Create an ECS application
aws --endpoint-url http://localhost:4566 deploy create-application \
  --application-name my-ecs-app \
  --compute-platform ECS

# Create a deployment group (listener ARN from ELB v2)
aws --endpoint-url http://localhost:4566 deploy create-deployment-group \
  --application-name my-ecs-app \
  --deployment-group-name my-ecs-group \
  --deployment-config-name CodeDeployDefault.ECSAllAtOnce \
  --service-role-arn arn:aws:iam::000000000000:role/codedeploy-role \
  --ecs-services clusterName=my-cluster,serviceName=my-service \
  --load-balancer-info 'targetGroupPairInfoList=[{targetGroups=[{name=blue-tg},{name=green-tg}],prodTrafficRoute={listenerArns=[<listener-arn>]}}]'

# Start an ECS blue/green deployment
aws --endpoint-url http://localhost:4566 deploy create-deployment \
  --application-name my-ecs-app \
  --deployment-group-name my-ecs-group \
  --revision 'revisionType=AppSpecContent,appSpecContent={content="{\"version\":0.0,\"Resources\":[{\"TargetService\":{\"Type\":\"AWS::ECS::Service\",\"Properties\":{\"TaskDefinition\":\"my-task:2\",\"LoadBalancerInfo\":{\"ContainerName\":\"app\",\"ContainerPort\":80}}}}]}"}'

# Poll deployment status
aws --endpoint-url http://localhost:4566 deploy get-deployment --deployment-id <id>

# List deployment targets
aws --endpoint-url http://localhost:4566 deploy list-deployment-targets --deployment-id <id>

# Get target details
aws --endpoint-url http://localhost:4566 deploy batch-get-deployment-targets \
  --deployment-id <id> \
  --target-ids <target-id>

# List built-in deployment configs
aws --endpoint-url http://localhost:4566 deploy list-deployment-configs
```
