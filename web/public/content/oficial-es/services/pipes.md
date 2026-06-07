# EventBridge Tuberías

**Protocolo:** REST-JSON
**Punto final:** `POST http://localhost:4566/`

## Acciones compatibles con

| Acción | Descripción |
|---|---|
| `CreatePipe` | Crear una nueva canalización con origen, destino y enriquecimiento opcional |
| `DescribePipe` | Obtenga detalles de la tubería, incluido el estado y la configuración |
| `UpdatePipe` | Actualizar configuración de canalización (origen, destino, rol, enriquecimiento, estado deseado) |
| `DeletePipe` | Eliminar una tubería |
| `ListPipes` | Enumere todas las tuberías con filtrado opcional por estado y prefijo |
| `StartPipe` | Iniciar una tubería parada |
| `StopPipe` | Detener una tubería corriendo |

## Configuración

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_PIPES_ENABLED` | `true` | Activar o desactivar el servicio |

## Ejemplos

```bash
export AWS_ENDPOINT_URL=http://localhost:4566

# Create a pipe (SQS to Lambda)
aws pipes create-pipe \
  --name my-pipe \
  --source "arn:aws:sqs:us-east-1:000000000000:source-queue" \
  --target "arn:aws:lambda:us-east-1:000000000000:function:my-function" \
  --role-arn "arn:aws:iam::000000000000:role/pipe-role" \
  --endpoint-url $AWS_ENDPOINT_URL

# Describe a pipe
aws pipes describe-pipe \
  --name my-pipe \
  --endpoint-url $AWS_ENDPOINT_URL

# List all pipes
aws pipes list-pipes \
  --endpoint-url $AWS_ENDPOINT_URL

# Start a pipe
aws pipes start-pipe \
  --name my-pipe \
  --endpoint-url $AWS_ENDPOINT_URL

# Stop a pipe
aws pipes stop-pipe \
  --name my-pipe \
  --endpoint-url $AWS_ENDPOINT_URL

# Update a pipe
aws pipes update-pipe \
  --name my-pipe \
  --target "arn:aws:lambda:us-east-1:000000000000:function:new-function" \
  --endpoint-url $AWS_ENDPOINT_URL

# Delete a pipe
aws pipes delete-pipe \
  --name my-pipe \
  --endpoint-url $AWS_ENDPOINT_URL
```

## Estados de tuberías

- `STARTING` - Se está iniciando la tubería
- `RUNNING` - Pipe está procesando eventos activamente
- `STOPPING` - La tubería se está deteniendo
- `STOPPED` - La tubería está detenida y no procesa eventos
- `DELETED` - Se ha eliminado la tubería.

## Fuentes y destinos compatibles con

Floci emula tuberías EventBridge con los siguientes tipos de origen y destino admitidos:

**Fuentes:**
- Colas de Amazon SQS
- Transmisiones de Amazon Kinesis
- Transmisiones de Amazon DynamoDB
- Temas Kafka (MSK)

**Objetivos:**
- Funciones Lambda
- Colas SQS
- Temas SNS
- transmisiones Kinesis
- Máquinas de estado de funciones de paso