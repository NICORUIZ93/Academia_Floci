# Escalado automático

Floci implementa EC2 Auto Scaling API: administración de estado almacenado para configuraciones de lanzamiento, grupos de auto scaling, enlaces de ciclo de vida y políticas de escalado, además de un reconciliador de capacidad real que lanza y finaliza instancias de EC2 para mantener la capacidad deseada.

**Protocolo:** Consulta: `POST /` con parámetro de formulario `Action=`, alcance de credencial `autoscaling`

**Formatos ARN:**

- `arn:aws:autoscaling:<region>:<account>:autoScalingGroup:<uuid>:autoScalingGroupName/<name>`
- `arn:aws:autoscaling:<region>:<account>:launchConfiguration:<uuid>:launchConfigurationName/<name>`
- `arn:aws:autoscaling:<region>:<account>:scalingPolicy:<uuid>:autoScalingGroupName/<group>/policyName/<name>`

## Operaciones admitidas (33 en total)

### Configuraciones de lanzamiento de

| Operación | Notas |
|---|---|
| `CreateLaunchConfiguration` | Plantilla de tiendas: `ImageId`, `InstanceType`, `KeyName`, `SecurityGroups`, `UserData`, `IamInstanceProfile` |
| `DescribeLaunchConfigurations` | Filtrado por lista de nombres; devuelve todo si no hay filtro |
| `DeleteLaunchConfiguration` | Elimina la configuración de inicio nombrada |

### Grupos de escalado automático

| Operación | Notas |
|---|---|
| `CreateAutoScalingGroup` | Crea un grupo con capacidad mínima/máxima/deseada, zonas de disponibilidad, etiquetas, configuración de lanzamiento, plantilla de lanzamiento o política de instancias mixtas; inicia ciclo de reconciliación de capacidad |
| `DescribeAutoScalingGroups` | Filtrado por lista de nombres; devuelve todo si no hay filtro; incluye una lista de instancias actual con el estado del ciclo de vida y la forma de la política de instancias mixtas cuando se configura |
| `UpdateAutoScalingGroup` | Actualiza los límites de capacidad, el tiempo de reutilización, la fuente de lanzamiento y las AZ |
| `DeleteAutoScalingGroup` | `ForceDelete=true` finaliza todas las instancias antes de eliminarlas |

### Gestión de instancias

| Operación | Notas |
|---|---|
| `DescribeAutoScalingInstances` | Devuelve todas las instancias rastreadas por ASG con estado de ciclo de vida y estado de salud |
| `SetDesiredCapacity` | Actualiza el recuento deseado; reconciliador maneja la ampliación y ampliación en 10 s |
| `AttachInstances` | Adjunta instancias EC2 existentes a un grupo; establece el estado del ciclo de vida en `InService` |
| `DetachInstances` | Separa instancias de un grupo; opcionalmente disminuye la capacidad deseada |
| `TerminateInstanceInAutoScalingGroup` | Termina una instancia específica; opcionalmente disminuye la capacidad deseada |

### Accesorio de equilibrador de carga

| Operación | Notas |
|---|---|
| `AttachLoadBalancerTargetGroups` | Adjunta ARN del grupo objetivo ELB v2; nuevas instancias registradas automáticamente en InService |
| `DetachLoadBalancerTargetGroups` | Separa grupos objetivo; instancias dadas de baja |
| `DescribeLoadBalancerTargetGroups` | Enumera los grupos objetivo adjuntos a un grupo |
| `AttachLoadBalancers` | Accesorio ELB clásico (almacenado; sin enrutamiento ELB v1) |
| `DetachLoadBalancers` | Destacamento ELB clásico |
| `DescribeLoadBalancers` | Enumera los ELB clásicos adjuntos a un grupo |

### Ganchos de ciclo de vida

| Operación | Notas |
|---|---|
| `PutLifecycleHook` | Crea o actualiza un gancho: `LifecycleTransition`, `DefaultResult`, `HeartbeatTimeout` |
| `DescribeLifecycleHooks` | Listas de ganchos para un grupo |
| `DeleteLifecycleHook` | Quita un gancho |
| `CompleteLifecycleAction` | Señales `CONTINUE` o `ABANDON` para una acción pendiente del ciclo de vida |
| `RecordLifecycleActionHeartbeat` | Extiende el tiempo de espera de los latidos para una acción del ciclo de vida en curso |

### Políticas de escalamiento

| Operación | Notas |
|---|---|
| `PutScalingPolicy` | Crea o actualiza una política: campos `SimpleScaling` o `TargetTrackingScaling` con métrica predefinida, valor objetivo y calentamiento estimado |
| `DescribePolicies` | Enumera las políticas filtradas por grupo o nombre de política, incluida la configuración de seguimiento de objetivos almacenados |
| `DeletePolicy` | Elimina una política de escala |

### Actividades de

| Operación | Notas |
|---|---|
| `DescribeScalingActivities` | Devuelve el registro de actividad de un grupo; actividades registradas en eventos de ampliación y ampliación |

### Metadatos

| Operación | Notas |
|---|---|
| `DescribeTerminationPolicyTypes` | Devuelve los nombres de las políticas de terminación estándar |
| `DescribeAccountLimits` | Devuelve límites máximos de grupo/configuración/instancia |
| `DescribeLifecycleHookTypes` | Devuelve `autoscaling:EC2_INSTANCE_LAUNCHING` y `autoscaling:EC2_INSTANCE_TERMINATING` |
| `DescribeAdjustmentTypes` | Devuelve los cuatro tipos de ajuste estándar |
| `DescribeMetricCollectionTypes` | Devuelve nombres de granularidad y métricas estándar |
| `DescribeAutoScalingNotificationTypes` | Devuelve todos los nombres de tipos de notificación |

## Conciliador de capacidad (Fase 2)

Floci ejecuta un reconciliador en segundo plano (velocidad fija de 10 s) que mantiene el recuento de instancias de InService de cada grupo alineado con `DesiredCapacity`:

- **Scale-out**: llama a `RunInstances` con la configuración de lanzamiento del grupo; las nuevas instancias se rastrean como `Pending` hasta que el estado de EC2 pasa a `running`, momento en el que pasan a `InService` y se registran con todos los grupos objetivo ELB v2 adjuntos.
- **Ampliación horizontal**: selecciona instancias de InService que no están protegidas de la ampliación horizontal, las cancela del registro de los grupos objetivo y luego llama a `TerminateInstances`.
- Los registros de actividad se escriben en cada evento de ampliación y ampliación.

## Compatibilidad de fuente de lanzamiento

Los grupos de Auto Scaling conservan una configuración de lanzamiento, una plantilla de lanzamiento de nivel superior o un `MixedInstancesPolicy`. Estas fuentes de lanzamiento son mutuamente excluyentes en las solicitudes de creación/actualización. Cuando se proporciona una política de instancias mixtas, Floci almacena y devuelve:

- `LaunchTemplate.LaunchTemplateSpecification.LaunchTemplateId`
- `LaunchTemplate.LaunchTemplateSpecification.LaunchTemplateName`
- `LaunchTemplate.LaunchTemplateSpecification.Version`
- `LaunchTemplate.Overrides.member.N.InstanceType`
- `InstancesDistribution.OnDemandBaseCapacity`
- `InstancesDistribution.OnDemandPercentageAboveBaseCapacity`
- `InstancesDistribution.SpotAllocationStrategy`

## Compatibilidad de políticas de escalamiento

Las políticas de seguimiento de objetivos preservan `TargetTrackingConfiguration` para métricas predefinidas. `DescribePolicies` devuelve `PredefinedMetricSpecification.PredefinedMetricType`, `TargetValue` y `EstimatedInstanceWarmup` cuando están presentes.

## Configuración

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_AUTOSCALING_ENABLED` | `true` | Activar o desactivar el servicio |

## Ejemplo de uso de

```bash
# Create a launch configuration
aws autoscaling create-launch-configuration \
  --launch-configuration-name my-lc \
  --image-id ami-12345678 \
  --instance-type t3.micro

# Create a group targeting desired=2
aws autoscaling create-auto-scaling-group \
  --auto-scaling-group-name my-asg \
  --launch-configuration-name my-lc \
  --min-size 1 \
  --max-size 5 \
  --desired-capacity 2 \
  --availability-zones us-east-1a

# Attach an ELB v2 target group
aws autoscaling attach-load-balancer-target-groups \
  --auto-scaling-group-name my-asg \
  --target-group-arns arn:aws:elasticloadbalancing:us-east-1:000000000000:targetgroup/my-tg/abc123

# Watch instances appear
aws autoscaling describe-auto-scaling-groups \
  --auto-scaling-group-names my-asg

# Scale out
aws autoscaling set-desired-capacity \
  --auto-scaling-group-name my-asg \
  --desired-capacity 3
```
