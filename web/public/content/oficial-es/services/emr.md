# EMR

**Protocolo:** JSON 1.1
**Punto final:** `http://localhost:4566/`
**Prefijo de destino:** `X-Amz-Target: ElasticMapReduce.*`

Floci emula la gestión de Amazon EMR (Elastic MapReduce) API. Los clústeres (flujos de trabajo), grupos de instancias y flotas, pasos, configuraciones de seguridad y etiquetas se rastrean en el backend de almacenamiento de Floci para que los clientes AWS CLI y SDK puedan impulsar el ciclo de vida completo del clúster localmente. EMR no lanza clústeres Hadoop/Spark reales: los clústeres pasan por sus estados de ciclo de vida como una máquina de estados.

## Acciones admitidas

<!-- floci:actions:start -->
| Acción | Descripción |
| --- | --- |
| `RunJobFlow` | Crea un nuevo clúster (flujo de trabajo) y devuelve su `JobFlowId` |
| `DescribeCluster` | Devuelve la configuración y el estado de un clúster |
| `ListClusters` | Enumera los clústeres, filtrables por estado y hora de creación |
| `TerminateJobFlows` | Termina uno o más clústeres |
| `SetTerminationProtection` | Activa o desactiva la protección de terminación |
| `SetVisibleToAllUsers` | Establece la visibilidad del clúster para la cuenta |
| `SetKeepJobFlowAliveWhenNoSteps` | Controla la terminación automática cuando se completan los pasos |
| `SetUnhealthyNodeReplacement` | Alterna el reemplazo de nodos en mal estado |
| `ModifyCluster` | Actualiza la configuración a nivel de clúster, como la simultaneidad de pasos |
| `AddJobFlowSteps` | Agrega uno o más pasos a un clúster |
| `DescribeStep` | Devuelve el detalle y estado de un solo paso |
| `ListSteps` | Enumera los pasos de un clúster, filtrables por estado |
| `CancelSteps` | Cancela pasos pendientes |
| `AddInstanceGroups` | Agrega grupos de instancias a un clúster en ejecución |
| `ListInstanceGroups` | Enumera los grupos de instancias de un clúster |
| `AddInstanceFleet` | Agrega una flota de instancias a un clúster |
| `ListInstanceFleets` | Enumera las flotas de instancias de un clúster |
| `ListInstances` | Enumera las instancias EC2 de un clúster |
| `CreateSecurityConfiguration` | Crea una configuración de seguridad con nombre |
| `DescribeSecurityConfiguration` | Devuelve una configuración de seguridad |
| `DeleteSecurityConfiguration` | Elimina una configuración de seguridad |
| `ListSecurityConfigurations` | Enumera todas las configuraciones de seguridad |
| `AddTags` | Agrega etiquetas a un clúster |
| `RemoveTags` | Elimina etiquetas de un clúster |
<!-- floci:actions:end -->

## Ejemplo de

```bash
export AWS_ENDPOINT_URL=http://localhost:4566

# Create a cluster
CLUSTER_ID=$(aws emr run-job-flow \
  --name "demo-cluster" \
  --release-label emr-7.0.0 \
  --instances InstanceGroups='[{InstanceCount=1,InstanceGroupType=MASTER,InstanceType=m5.xlarge}]' \
  --query 'JobFlowId' --output text)

# Inspect it
aws emr describe-cluster --cluster-id "$CLUSTER_ID"
aws emr list-clusters

# Add a step
aws emr add-steps --cluster-id "$CLUSTER_ID" \
  --steps Type=CUSTOM_JAR,Name=demo,Jar=command-runner.jar,Args=[echo,hello]

# Terminate
aws emr terminate-clusters --cluster-ids "$CLUSTER_ID"
```
