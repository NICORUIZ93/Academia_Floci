# Programador EventBridge

**Protocolo:** REST JSON
**Punto final:** `http://localhost:4566/`

## Acciones compatibles con

| Acción | Método | Camino | Descripción |
|---|---|---|---|
| `CreateScheduleGroup` | `POST` | `/schedule-groups/{Name}` | Crear un grupo de horarios |
| `GetScheduleGroup` | `GET` | `/schedule-groups/{Name}` | Obtener detalles del grupo de horarios |
| `DeleteScheduleGroup` | `DELETE` | `/schedule-groups/{Name}` | Eliminar un grupo de horarios y sus horarios |
| `ListScheduleGroups` | `GET` | `/schedule-groups` | Listar grupos de horarios |
| `CreateSchedule` | `POST` | `/schedules/{Name}` | Crear un horario |
| `GetSchedule` | `GET` | `/schedules/{Name}` | Obtener detalles del horario |
| `UpdateSchedule` | `PUT` | `/schedules/{Name}` | Actualizar un horario |
| `DeleteSchedule` | `DELETE` | `/schedules/{Name}` | Eliminar un horario |
| `ListSchedules` | `GET` | `/schedules` | Lista de horarios |
| `TagResource` | `POST` | `/tags/{ResourceArn}` | Agregar etiquetas a un grupo de programación |
| `UntagResource` | `DELETE` | `/tags/{ResourceArn}?TagKeys=...` | Eliminar etiquetas de un grupo de programación |
| `ListTagsForResource` | `GET` | `/tags/{ResourceArn}` | Listar etiquetas en un grupo de programación |

## Invocación de programación

Cuando `floci.services.scheduler.invocation-enabled` es `true` (el valor predeterminado),
El despachador en segundo plano activa los objetivos programados a tiempo. Expresiones admitidas:

- `at(YYYY-MM-DDTHH:mm:ss)` — incendio único; honra a `ScheduleExpressionTimezone`
  (UTC predeterminado) y `ActionAfterCompletion=DELETE`.
- `rate(N unit)` — fuego repetido (`minutes`, `hours`, `days`, `weeks`).
- `cron(minute hour day-of-month month day-of-week year)` — AWS cron de 6 campos;
  honra a `ScheduleExpressionTimezone`.

Horarios `State=DISABLED` y horarios fuera de su `StartDate`/`EndDate`
ventana se omiten. El despachador marca cada
`floci.services.scheduler.tick-interval-seconds` (predeterminado `10`).

Tipos de objetivos admitidos: SQS, Lambda, SNS, EventBridge `PutEvents`.

## Configuración

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_SCHEDULER_ENABLED` | `true` | Activar o desactivar el servicio |
| `FLOCI_SERVICES_SCHEDULER_INVOCATION_ENABLED` | `true` | Ejecute el despachador en segundo plano que activa objetivos programados (`false` = solo CRUD) |
| `FLOCI_SERVICES_SCHEDULER_TICK_INTERVAL_SECONDS` | `10` | Con qué frecuencia el despachador busca horarios de vencimiento (segundos) |

## aún no es compatible

- `RetryPolicy` y `DeadLetterConfig` en invocaciones fallidas (almacenadas pero no respetadas)
- Jitter `FlexibleTimeWindow` (se dispara de forma determinista a la hora programada)
- Paginación basada en `NextToken` para operaciones de Lista

## Ejemplos

```bash
export AWS_ENDPOINT_URL=http://localhost:4566

# Create a schedule group
aws scheduler create-schedule-group \
  --name my-group \
  --endpoint-url $AWS_ENDPOINT_URL

# List schedule groups
aws scheduler list-schedule-groups \
  --endpoint-url $AWS_ENDPOINT_URL

# Create a schedule in the default group
aws scheduler create-schedule \
  --name my-schedule \
  --schedule-expression "rate(1 hour)" \
  --flexible-time-window '{"Mode":"OFF"}' \
  --target '{
    "Arn": "arn:aws:lambda:us-east-1:000000000000:function:my-func",
    "RoleArn": "arn:aws:iam::000000000000:role/scheduler-role"
  }' \
  --endpoint-url $AWS_ENDPOINT_URL

# Create a schedule with retry policy and dead-letter queue
aws scheduler create-schedule \
  --name my-resilient-schedule \
  --schedule-expression "rate(5 minutes)" \
  --flexible-time-window '{"Mode":"FLEXIBLE","MaximumWindowInMinutes":10}' \
  --target '{
    "Arn": "arn:aws:sqs:us-east-1:000000000000:my-queue",
    "RoleArn": "arn:aws:iam::000000000000:role/scheduler-role",
    "RetryPolicy": {"MaximumEventAgeInSeconds":3600,"MaximumRetryAttempts":5},
    "DeadLetterConfig": {"Arn":"arn:aws:sqs:us-east-1:000000000000:my-dlq"}
  }' \
  --endpoint-url $AWS_ENDPOINT_URL

# Get a schedule
aws scheduler get-schedule \
  --name my-schedule \
  --endpoint-url $AWS_ENDPOINT_URL

# Update a schedule
aws scheduler update-schedule \
  --name my-schedule \
  --schedule-expression "rate(30 minutes)" \
  --flexible-time-window '{"Mode":"OFF"}' \
  --target '{
    "Arn": "arn:aws:lambda:us-east-1:000000000000:function:my-func",
    "RoleArn": "arn:aws:iam::000000000000:role/scheduler-role"
  }' \
  --state DISABLED \
  --endpoint-url $AWS_ENDPOINT_URL

# Delete a schedule
aws scheduler delete-schedule \
  --name my-schedule \
  --endpoint-url $AWS_ENDPOINT_URL

# Delete a schedule group (cascades to all schedules in the group)
aws scheduler delete-schedule-group \
  --name my-group \
  --endpoint-url $AWS_ENDPOINT_URL

# Add tags to a schedule group (tags apply to schedule groups only)
aws scheduler tag-resource \
  --resource-arn arn:aws:scheduler:us-east-1:000000000000:schedule-group/my-group \
  --tags Key=env,Value=prod Key=owner,Value=Alice \
  --endpoint-url $AWS_ENDPOINT_URL

# List tags on a schedule group
aws scheduler list-tags-for-resource \
  --resource-arn arn:aws:scheduler:us-east-1:000000000000:schedule-group/my-group \
  --endpoint-url $AWS_ENDPOINT_URL

# Remove tags from a schedule group
aws scheduler untag-resource \
  --resource-arn arn:aws:scheduler:us-east-1:000000000000:schedule-group/my-group \
  --tag-keys env owner \
  --endpoint-url $AWS_ENDPOINT_URL
```

## Grupo de programación predeterminado

Se crea automáticamente un grupo de programación `default` en el primer acceso. Los horarios creados sin especificar un grupo se colocan en el grupo predeterminado. El grupo predeterminado no se puede eliminar.
