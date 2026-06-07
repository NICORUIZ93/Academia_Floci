# Exportaciones de datos BCM (`bcm-data-exports:*`)

**Protocolo:** JSON 1.1
**Encabezado:** `X-Amz-Target: AWSBillingAndCostManagementDataExports.<Action>`
**Prefijo de punto final:** `bcm-data-exports`

Floci emula el plano de gestión de exportaciones de datos BCM que se envía con
CUR 2.0 / FOCO 1.2. Las exportaciones comparten el mismo motor de emisiones Parquet que
el servicio heredado [`cur:*`](cur.md): los dos son alternativos
la gestión emerge sobre un oleoducto de exportación subyacente.

## Operaciones compatibles

| Operación | Notas |
|-----------|---------------|
| `CreateExport` | Crea una exportación; rechaza duplicado `Name` con `ValidationException` |
| `GetExport` | Devuelve una exportación de ARN; falta ARN devuelve `ResourceNotFoundException` |
| `ListExports` | Devuelve todas las exportaciones propiedad de la cuenta de llamada |
| `UpdateExport` | Reemplaza campos mutables en una exportación existente |
| `DeleteExport` | Idempotente; elimina también las ejecuciones huérfanas |
| `ListExecutions` | Devuelve todos los registros de ejecución de una exportación |
| `GetExecution` | Devuelve un registro de ejecución |

## Reglas de validación

- `Export.Name`: alfanuméricos + `-_`, máximo 128 caracteres
- `Export.DataQuery.QueryStatement`: requerido (SQL de forma libre — Floci no
  no analizarlo; la forma de exportación está determinada por el FOCUS incluido
  esquema)
- `Export.DestinationConfigurations.S3Destination`: requerido;
  `S3Bucket` + `S3Region` obligatorio
- `S3OutputConfigurations.Format`: `PARQUET` (emisión CSV aún no implementada; `TEXT_OR_CSV` devuelve `ValidationException`)
- `S3OutputConfigurations.Compression`: `PARQUET` (`GZIP` aún no implementado)
- `S3OutputConfigurations.Overwrite`: `CREATE_NEW_REPORT` / `OVERWRITE_REPORT`
-`S3OutputConfigurations.OutputType`: `CUSTOM`
- `RefreshCadence.Frequency`: `SYNCHRONOUS` (el único compatible con AWS
  valor en el momento de escribir este artículo)

## Claves de almacenamiento

Alcance de la cuenta en todo:

- Exportar: `<accountId>::<exportArn>`
- Ejecución: `<accountId>::<exportArn>::<executionId>`

Al eliminar una exportación se eliminan todas sus ejecuciones en la misma llamada a
Evite registros huérfanos.

## Ciclo de vida de ejecución

Un `CreateExport` exitoso en modo `synchronous` produce exactamente uno
registro de ejecución:

```
INITIATION_IN_PROCESS  (recorded at create-time)
        |
        v
DELIVERY_SUCCESS  or  DELIVERY_FAILURE
```

Transiciones de estado en `UpdateExport` también. Tanto `success` como `failure`
Los estados finales son visibles a través de `GetExecution.Execution.ExecutionStatus`.

## Emisión

La canalización Parquet es la misma que para [`cur:*`](cur.md): filas de
el SPI `ResourceUsageEnumerator` pasa por `FocusRowProjector`, son
organizado como NDJSON en `floci-cur-staging`, y escrito como Parquet por el
Sidecar `floci-duck` vía `COPY ... TO ... (FORMAT PARQUET)`. cada uno
la ejecución produce un artefacto en
`s3://<S3Bucket>/<S3Prefix>/<Name>/<runId>.parquet`.

### `FLOCI_SERVICES_BCM_DATA_EXPORTS_EMIT_MODE`

| Valor | Comportamiento |
|-------|----------|
| `synchronous` (predeterminado) | Emitir en cada `CreateExport` / `UpdateExport` |
| `daily` | Emitir cada 24 horas a través del ejecutor programado CUR compartido |
| `off` | Sólo plano de gestión: sin emisiones |

## Configuración

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_BCM_DATA_EXPORTS_ENABLED` | `true` | Activar o desactivar el servicio |
| `FLOCI_SERVICES_BCM_DATA_EXPORTS_EMIT_MODE` | `synchronous` | Modo de ejecución (ver arriba) |

## Ejemplos

```bash
export AWS_ENDPOINT_URL=http://localhost:4566
export AWS_DEFAULT_REGION=us-east-1
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test

aws bcm-data-exports create-export --export '{
  "Name": "focus-monthly",
  "DataQuery": {"QueryStatement": "SELECT * FROM COST_AND_USAGE_REPORT"},
  "DestinationConfigurations": {
    "S3Destination": {
      "S3Bucket": "my-billing",
      "S3Prefix": "focus",
      "S3Region": "us-east-1",
      "S3OutputConfigurations": {
        "Format": "PARQUET",
        "Compression": "PARQUET",
        "OutputType": "CUSTOM",
        "Overwrite": "OVERWRITE_REPORT"
      }
    }
  },
  "RefreshCadence": {"Frequency": "SYNCHRONOUS"}
}'

aws bcm-data-exports list-exports

aws bcm-data-exports list-executions \
  --export-arn arn:aws:bcm-data-exports:us-east-1:000000000000:export/focus-monthly
```

```python
import boto3

client = boto3.client(
    "bcm-data-exports",
    endpoint_url="http://localhost:4566",
    region_name="us-east-1",
)
resp = client.create_export(Export={
    "Name": "focus-monthly",
    "DataQuery": {"QueryStatement": "SELECT * FROM COST_AND_USAGE_REPORT"},
    "DestinationConfigurations": {"S3Destination": {
        "S3Bucket": "my-billing",
        "S3Prefix": "focus",
        "S3Region": "us-east-1",
        "S3OutputConfigurations": {
            "Format": "PARQUET", "Compression": "PARQUET",
            "OutputType": "CUSTOM", "Overwrite": "OVERWRITE_REPORT",
        },
    }},
    "RefreshCadence": {"Frequency": "SYNCHRONOUS"},
})
print(resp["ExportArn"])
```

## Fuera de alcance

- Evaluación personalizada de SQL en `DataQuery.QueryStatement` — Floci ignora
  el SQL y emite la forma FOCUS directamente. La cadena de consulta es
  persistió fielmente para que los viajes de ida y vuelta de SDK funcionen, pero no tiene ningún efecto en
  la salida Parquet.
- Categorías de costos, vistas de facturación y anulaciones de modelos de precios
- Programación real de `RefreshCadence` más allá de `SYNCHRONOUS` y el
  `daily` Floci-modo interno
