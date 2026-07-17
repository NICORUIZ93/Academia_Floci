# AWS Lote

**Protocolo:** REST JSON
**Punto final:** `http://localhost:4566/v1/...`

Floci Batch implementa el plano de control de lotes AWS para pruebas de integración local. Admite metadatos de definición de trabajos y colas, finalización inmediata de trabajos para pruebas de contratos rápidas, ejecución respaldada por Docker cuando está habilitada, aprovisionamiento de recursos CloudFormation y objetivos de reglas EventBridge con `BatchParameters`.

## Operaciones compatibles

| Operación | Punto final | Descripción |
|---|---|---|
| `CreateComputeEnvironment` | `POST /v1/createcomputeenvironment` | Almacene un entorno informático local y devuelva su ARN |
| `DescribeComputeEnvironments` | `POST /v1/describecomputeenvironments` | Describir todos los entornos informáticos o algunos seleccionados |
| `CreateJobQueue` | `POST /v1/createjobqueue` | Almacenar una cola de trabajos local adjunta a entornos informáticos |
| `DescribeJobQueues` | `POST /v1/describejobqueues` | Describir todas las colas de trabajos o las seleccionadas |
| `RegisterJobDefinition` | `POST /v1/registerjobdefinition` | Registrar una definición de trabajo de contenedor revisada |
| `DeregisterJobDefinition` | `POST /v1/deregisterjobdefinition` | Marcar una revisión de definición de trabajo como inactiva |
| `DescribeJobDefinitions` | `POST /v1/describejobdefinitions` | Enumere las definiciones de trabajos por nombre, ARN, revisión y estado |
| `SubmitJob` | `POST /v1/submitjob` | Enviar un trabajo por lotes local |
| `DescribeJobs` | `POST /v1/describejobs` | Describir trabajos por ID de trabajo |
| `ListJobs` | `POST /v1/listjobs` | Listar trabajos por cola, estado, AWS `filters` y paginación |

## Modos de corredor

El lote utiliza `floci.services.batch.runner-mode`.

| Valor | Comportamiento |
|---|---|
| `immediate` | Por defecto. `SubmitJob` conserva el trabajo, registra las marcas de tiempo del ciclo de vida, crea un intento exitoso y regresa después de que el trabajo sea `SUCCEEDED`. |
| `docker` | Inicia un contenedor Docker por intento desde la imagen de definición de trabajo, pasa los valores de entorno y comando resueltos, aplica los requisitos de recursos de `MEMORY` como límites de memoria de Docker, captura un nombre de secuencia de registros de CloudWatch y establece `SUCCEEDED` o `FAILED` desde el código de salida del contenedor. Los trabajos agotados fallan sin volver a intentarlo, lo que coincide con el comportamiento de tiempo de espera del lote AWS. |

El modo `process` no está implementado.

## Comportamiento de envío de

Campos `SubmitJob` compatibles:

- `jobName`
- `jobDefinition`
- `jobQueue`
- `parameters`
- `containerOverrides.command`
- `containerOverrides.environment`
- `timeout.attemptDurationSeconds`
- `retryStrategy.attempts`
- `tags`

`containerOverrides.command` reemplaza el comando de definición de trabajo. Las entradas de comandos como `Ref::inputKey` se resuelven a partir del mapa de parámetros combinados antes de la ejecución. El entorno de tiempo de envío anula la fusión sobre las variables de entorno de definición de trabajo.

Los trabajos se mueven a través de estos estados locales:

```text
SUBMITTED -> PENDING -> RUNNABLE -> STARTING -> RUNNING -> SUCCEEDED|FAILED
```

Gestionar cada trabajo en modo inmediato a través de `PENDING` es una simplificación local para las pruebas. AWS puede omitir ese estado cuando no hay esperas de dependencia o capacidad.

## EventBridge

Los objetivos EventBridge cuyo ARN apunta a una cola de trabajos por lotes pueden incluir:

```json
{
  "BatchParameters": {
    "JobDefinition": "my-job:1",
    "JobName": "nightly-job",
    "ArrayProperties": {"Size": 2},
    "RetryStrategy": {"Attempts": 2}
  }
}
```

Cuando se activa la regla, Floci envía un trabajo por lotes equivalente a la cola de destino. Si la carga útil de destino contiene un objeto raíz `Parameters`, esos pares clave/valor se codifican y se pasan como parámetros de envío por lotes. Los campos de carga plana no se convierten en parámetros de lote.

`ArrayProperties` se acepta y se devuelve como metadatos de destino para compatibilidad con la implementación local, pero Batch aún envía un trabajo local y no distribuye los elementos secundarios de la matriz.

## CloudFormation

Floci aprovisiona estos tipos de recursos:

- `AWS::Batch::ComputeEnvironment`
- `AWS::Batch::JobQueue`
- `AWS::Batch::JobDefinition`

Los roles IAM, los campos de VPC, las declaraciones de Fargate, la configuración de registros, el almacenamiento y los requisitos de recursos se aceptan como metadatos. El modo Docker aplica los requisitos de `MEMORY` como límites de memoria del contenedor; la programación local no simula la capacidad de AWS, la asignación de VCPU o la conexión en red de VPC.

## Configuración

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_BATCH_ENABLED` | `true` | Activar o desactivar Lote |
| `FLOCI_SERVICES_BATCH_RUNNER_MODE` | `immediate` | `immediate` o `docker` |
| `FLOCI_SERVICES_BATCH_DOCKER_NETWORK` | *(desarmado)* | Red Docker para contenedores Batch |
| `FLOCI_STORAGE_SERVICES_BATCH_MODE` | *(hereda global)* | Anulación del modo de almacenamiento opcional |
| `FLOCI_STORAGE_SERVICES_BATCH_FLUSH_INTERVAL_MS` | `5000` | Intervalo de descarga de almacenamiento persistente |

## Limitaciones de

- No se aplica IAM.
- Sin simulación de VPC/subred/grupo de seguridad.
- No hay programación de capacidad fiel de AWS.
- Sin trabajos de distribución en abanico ni trabajos de múltiples nodos.
- `CancelJob` y `TerminateJob` no están implementados.
- Los transformadores de entrada EventBridge funcionan a través de la ruta de entrada de destino EventBridge existente; No se implementa la paridad completa del transformador de entrada específica del lote.
