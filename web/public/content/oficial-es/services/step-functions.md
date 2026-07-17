# Funciones de paso

**Protocolo:** JSON 1.1 (`X-Amz-Target: AmazonStatesService.*`)
**Punto final:** `POST http://localhost:4566/`

## Acciones admitidas por

<!-- floci:actions:start -->
| Acción | Descripción |
| --- | --- |
| `CreateStateMachine` | Crear una máquina de estados (Estándar o Express) |
| `DescribeStateMachine` | Obtener definición y metadatos de máquina de estado |
| `ListStateMachines` | Listar todas las máquinas de estados |
| `DeleteStateMachine` | Eliminar una máquina de estados |
| `PublishStateMachineVersion` | - |
| `ListStateMachineVersions` | - |
| `DeleteStateMachineVersion` | - |
| `ValidateStateMachineDefinition` | Validar una definición ASL sin crear una máquina de estados |
| `StartExecution` | Iniciar una nueva ejecución |
| `StartSyncExecution` | - |
| `DescribeExecution` | Obtener el estado de ejecución y el resultado |
| `ListExecutions` | Listar ejecuciones para una máquina de estados |
| `StopExecution` | Detener una ejecución en ejecución |
| `GetExecutionHistory` | Obtenga el historial completo de eventos de una ejecución |
| `SendTaskSuccess` | Informar el éxito de la tarea (para tareas `.waitForTaskToken`) |
| `SendTaskFailure` | Informar error de tarea |
| `SendTaskHeartbeat` | Enviar un latido para tareas de larga duración |
| `CreateActivity` | - |
| `DeleteActivity` | - |
| `DescribeActivity` | - |
| `ListActivities` | - |
| `GetActivityTask` | - |
| `ListTagsForResource` | - |
| `TagResource` | - |
| `UntagResource` | - |
<!-- floci:actions:end -->

## Configuración

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_STEPFUNCTIONS_ENABLED` | `true` | Activar o desactivar el servicio |

## Ejemplos

```bash
export AWS_ENDPOINT_URL=http://localhost:4566

# Create a state machine
SM_ARN=$(aws stepfunctions create-state-machine \
  --name my-workflow \
  --definition '{
    "Comment": "Simple workflow",
    "StartAt": "HelloWorld",
    "States": {
      "HelloWorld": {
        "Type": "Pass",
        "Result": {"message": "Hello, World!"},
        "End": true
      }
    }
  }' \
  --role-arn arn:aws:iam::000000000000:role/step-functions-role \
  --query stateMachineArn --output text \
  --endpoint-url $AWS_ENDPOINT_URL)

# Start an execution
EXEC_ARN=$(aws stepfunctions start-execution \
  --state-machine-arn $SM_ARN \
  --input '{"key":"value"}' \
  --query executionArn --output text \
  --endpoint-url $AWS_ENDPOINT_URL)

# Check status
aws stepfunctions describe-execution \
  --execution-arn $EXEC_ARN \
  --endpoint-url $AWS_ENDPOINT_URL

# Get event history
aws stepfunctions get-execution-history \
  --execution-arn $EXEC_ARN \
  --endpoint-url $AWS_ENDPOINT_URL
```
