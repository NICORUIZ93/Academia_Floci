# CloudTrail

**Protocolo:** JSON 1.1
**Punto final:** `http://localhost:4566/`
**Prefijo de destino:** `X-Amz-Target: com.amazonaws.cloudtrail.v20131101.CloudTrail_20131101.*`

Floci emula el AWS CloudTrail de gestión API. Los senderos, sus selectores de eventos y el estado de registro se conservan en el backend de almacenamiento de Floci para que pueda crear y administrar senderos y validar IaC localmente. Floci no registra la actividad en vivo de API en los senderos.

## Acciones admitidas

<!-- floci:actions:start -->
| Acción | Descripción |
| --- | --- |
| `CreateTrail` | Crea un rastro y devuelve su ARN |
| `UpdateTrail` | Actualiza la configuración de un recorrido existente |
| `DescribeTrails` | Devuelve la configuración de uno o más senderos |
| `StartLogging` | Comienza a registrar un sendero |
| `StopLogging` | Deja de registrar un sendero |
| `DeleteTrail` | Elimina un rastro |
| `GetTrailStatus` | Devuelve el estado de registro de una ruta |
| `PutEventSelectors` | Configura los selectores de eventos para un recorrido |
| `LookupEvents` | - |
<!-- floci:actions:end -->

## Ejemplo de

```bash
export AWS_ENDPOINT_URL=http://localhost:4566

# A trail needs a destination S3 bucket
aws s3 mb s3://my-trail-bucket

aws cloudtrail create-trail \
  --name demo-trail \
  --s3-bucket-name my-trail-bucket

aws cloudtrail start-logging --name demo-trail
aws cloudtrail get-trail-status --name demo-trail
aws cloudtrail describe-trails
```
