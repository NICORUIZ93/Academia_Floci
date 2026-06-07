# Informes de uso y costo (`cur:*`)

**Protocolo:** JSON 1.1
**Encabezado:** `X-Amz-Target: AWSOrigamiServiceGatewayService.<Action>`
**Prefijo de punto final:** `cur`

Floci emula el informe de costo y uso (CUR) AWS heredado API. Informe
las definiciones se conservan en el backend de almacenamiento de Floci; la emisión produce
artefactos Parquet reales en el servicio S3 de Floci a través del sidecar `floci-duck`.

## Operaciones compatibles

| Operación | Notas |
|-----------|---------------|
| `PutReportDefinition` | Crea un nuevo informe; rechaza duplicados con `DuplicateReportNameException`; impone un límite de 5 informes por cuenta |
| `ModifyReportDefinition` | Reemplaza los campos mutables de un informe existente |
| `DescribeReportDefinitions` | Devuelve todos los informes propiedad de la cuenta de llamada |
| `DeleteReportDefinition` | Idempotente; eliminar un informe faltante devuelve 200 |
| `TagResource` / `UntagResource` / `ListTagsForResource` | Respuestas auxiliares (cuerpos vacíos) para que los clientes SDK que las busquen tengan éxito |

## Reglas de validación

- `ReportName`: alfanuméricos + `-_`, máximo 256 caracteres
- `TimeUnit`: `HOURLY` / `DAILY` / `MONTHLY`
- `Format`: `Parquet` (emisión CSV aún no implementada; `textORcsv` devuelve `ValidationException`)
- `Compression`: `Parquet` (`ZIP` / `GZIP` aún no implementado)
- `ReportVersioning`: `CREATE_NEW_REPORT` / `OVERWRITE_REPORT`
- `AdditionalArtifacts`: subconjunto de `REDSHIFT` / `QUICKSIGHT` / `ATHENA`
- `AdditionalSchemaElements`: subconjunto de `RESOURCES` / `SPLIT_COST_ALLOCATION_DATA` / `MANUAL_DISCOUNT_COMPATIBILITY`
- Requerido: `ReportName`, `TimeUnit`, `Format`, `Compression`, `S3Bucket`, `S3Region`

## Claves de almacenamiento

Las definiciones de informes se conservan como
`<accountId>::<region>::<reportName>` por lo que se permite el mismo nombre en
diferentes regiones o diferentes cuentas.

## Emisión

La emisión produce un artefacto Parquet en
`s3://<S3Bucket>/<S3Prefix>/<reportName>/<runId>.parquet`. Cada carrera recibe un
UUID nuevo, por lo que las emisiones simultáneas nunca se golpean entre sí.

El oleoducto:

1. El `EmissionEngine` compartido recopila filas de `UsageLine` de cada
   Se presenta el servicio que implementa el SPI `ResourceUsageEnumerator`.
   en [Explorador de costos](ce.md).
2. `FocusRowProjector` convierte esas filas en la columna FOCUS 1.2 / CUR 2.0
   forma utilizando la [Instantánea de precios] incluida (pricing.md).
3. Las filas se organizan como JSON delimitado por nueva línea en
   `s3://floci-cur-staging/cur-staging/<reportName>/<runId>.ndjson`.
4. El sidecar `floci-duck` funciona
   `COPY (SELECT * FROM read_json_auto(...)) TO 's3://...' (FORMAT PARQUET)`
   para producir el objeto Parquet final nuevamente en Floci S3.
5. El objeto provisional se elimina en un bloque `finally` de mejor esfuerzo.

### `FLOCI_SERVICES_CUR_EMIT_MODE`

| Valor | Comportamiento |
|-------|----------|
| `synchronous` (predeterminado) | Emitir en cada `PutReportDefinition` / `ModifyReportDefinition` |
| `daily` | Emitir cada 24 horas a través de un ejecutor programado propiedad de CUR (separado del Programador EventBridge) |
| `off` | Sólo plano de gestión: sin emisiones |

El modo `synchronous` se traga los errores de emisión, por lo que la mutación de gestión
siempre tiene éxito; El fracaso se refleja en
`ReportStatus.LastStatus = ERROR` en la definición persistente.

## Configuración

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_CUR_ENABLED` | `true` | Activar o desactivar el servicio |
| `FLOCI_SERVICES_CUR_EMIT_MODE` | `synchronous` | Modo de ejecución (ver arriba) |
| `FLOCI_SERVICES_CUR_STAGING_BUCKET` | `floci-cur-staging` | El depósito S3 se utiliza para preparar NDJSON antes de que DuckDB escriba Parquet |

El sidecar `floci-duck` arranca perezosamente en la primera emisión, la
de la misma manera que lo inicia Athena.

## Ejemplos

```bash
export AWS_ENDPOINT_URL=http://localhost:4566
export AWS_DEFAULT_REGION=us-east-1
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test

aws cur put-report-definition --report-definition '{
  "ReportName": "monthly-report",
  "TimeUnit": "MONTHLY",
  "Format": "Parquet",
  "Compression": "Parquet",
  "AdditionalSchemaElements": ["RESOURCES"],
  "S3Bucket": "my-billing",
  "S3Prefix": "reports",
  "S3Region": "us-east-1",
  "AdditionalArtifacts": ["ATHENA"],
  "ReportVersioning": "OVERWRITE_REPORT"
}'

aws cur describe-report-definitions

aws s3 ls s3://my-billing/reports/monthly-report/
```

```python
import boto3, json

cur = boto3.client(
    "cur",
    endpoint_url="http://localhost:4566",
    region_name="us-east-1",
)
cur.put_report_definition(ReportDefinition={
    "ReportName": "monthly-report",
    "TimeUnit": "MONTHLY",
    "Format": "Parquet",
    "Compression": "Parquet",
    "AdditionalSchemaElements": ["RESOURCES"],
    "S3Bucket": "my-billing",
    "S3Prefix": "reports",
    "S3Region": "us-east-1",
})

# Read the resulting Parquet via DuckDB or pyarrow.
import pyarrow.dataset as ds
table = ds.dataset("s3://my-billing/reports/monthly-report/", format="parquet").to_table()
print(table.column_names)
```

## Fuera de alcance

- Selección de informes con clave de etiqueta de recursos más allá de lo que incluye el paquete
  los enumeradores emiten
- Semántica `RefreshClosedReports` (aceptada pero no retroactivamente
  reemitido)
- Validación del lado del servidor de las políticas del depósito S3 en el destino
  depósito (el servicio S3 de Floci todavía aplica su propia política de depósito
  cheques durante la escritura)
