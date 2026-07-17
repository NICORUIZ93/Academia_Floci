# Athena

**Protocolo:** JSON 1.1
**Punto final:** `http://localhost:4566/`

Floci emula Amazon Athena con **ejecución real de SQL** impulsada por un contenedor sidecar [floci-duck](https://hub.docker.com/r/floci/floci-duck) que ejecuta DuckDB. Cuando se envía una consulta, Floci activa el sidecar en el primer uso, inyecta declaraciones `CREATE OR REPLACE VIEW` para cada tabla registrada en Glue que apunta a datos de S3, luego ejecuta SQL y almacena los resultados como CSV en S3.

## Acciones admitidas

<!-- floci:actions:start -->
| Acción | Descripción |
| --- | --- |
| `StartQueryExecution` | Envía una consulta SQL; ejecutado de forma asincrónica a través de DuckDB |
| `GetQueryExecution` | Devuelve el estado de la consulta (`QUEUED`, `RUNNING`, `SUCCEEDED`, `FAILED`) |
| `GetQueryResults` | Devuelve el conjunto de resultados de una consulta completada |
| `ListQueryExecutions` | Devuelve una lista de ejecuciones de consultas pasadas |
| `StopQueryExecution` | Cancela una consulta en ejecución |
| `GetWorkGroup` | Devuelve información sobre un grupo de trabajo |
| `ListWorkGroups` | Lista todos los grupos de trabajo |
| `CreateWorkGroup` | Crea un nuevo grupo de trabajo |
| `ListDataCatalogs` | - |
| `GetDataCatalog` | - |
| `ListDatabases` | - |
| `ListTableMetadata` | - |
| `GetTableMetadata` | - |
| `DeleteWorkGroup` | Elimina un grupo de trabajo |
<!-- floci:actions:end -->

## Cómo funciona

1. **Inicio diferido del sidecar**: en la primera llamada a `StartQueryExecution`, Floci busca una imagen local de `floci/floci-duck:latest` e inicia el contenedor. Las consultas posteriores reutilizan el contenedor en ejecución.
2. **Inyección DDL Glue**: Floci lee todas las tablas Glue para la base de datos de destino y genera declaraciones `CREATE OR REPLACE VIEW` que asignan cada nombre de tabla a su ubicación S3 a través de `read_parquet`, `read_json_auto` o `read_parquet` de DuckDB. Funciones `read_csv_auto`: elegidas según la biblioteca de serialización `InputFormat` o SerDe de la tabla.
3. **Ejecución de consulta**: el SQL del usuario se empaqueta en `COPY (...) TO 's3://...' (FORMAT CSV, HEADER)` y se ejecuta. Los resultados se escriben directamente en la ruta de salida S3.
4. **Recuperación de resultados**: `GetQueryResults` lee el CSV de S3 y lo devuelve en la forma estándar Athena `ResultSet`.

## Inferencia de formato

La función de lectura DuckDB se elige del `StorageDescriptor` de la tabla Glue:

| Condición | Función de lectura |
|---|---|
| `InputFormat` o `SerializationLibrary` contiene `parquet` | `read_parquet` |
| `InputFormat` o `SerializationLibrary` contiene `json` | `read_json_auto` |
| `InputFormat` contiene `hive` | `read_json_auto` |
| Cualquier otra cosa | `read_csv_auto` |

## Configuración

| Propiedad | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_ATHENA_MOCK` | `false` | Establezca en `true` para deshabilitar la ejecución de DuckDB: las consultas se realizan inmediatamente con resultados vacíos |
| `FLOCI_SERVICES_DUCK_DEFAULT_IMAGE` | `floci/floci-duck:latest` | Imagen del sidecar DuckDB eliminada en el primer uso |
| `FLOCI_SERVICES_DUCK_URL` | *(desarmado)* | Apunte a una instancia floci-duck existente y omita la administración de contenedores |

Ejemplo ##: consulta sencilla

```bash
export AWS_ENDPOINT_URL=http://localhost:4566

# Start a query
QUERY_ID=$(aws athena start-query-execution \
  --query-string "SELECT 42 AS answer" \
  --query 'QueryExecutionId' \
  --output text)

# Wait for completion
aws athena get-query-execution --query-execution-id $QUERY_ID

# Get results
aws athena get-query-results --query-execution-id $QUERY_ID
```

Ejemplo de ##: consulta del lago de datos (S3 + Glue + Athena)

```bash
export AWS_ENDPOINT_URL=http://localhost:4566

# 1. Create S3 bucket and upload data
aws s3 mb s3://my-data-lake
echo '{"id":1,"amount":10.0}
{"id":2,"amount":20.0}
{"id":3,"amount":30.0}' | aws s3 cp - s3://my-data-lake/orders/data.json

# 2. Register table in Glue
aws glue create-database --database-input '{"Name":"analytics"}'

aws glue create-table \
  --database-name analytics \
  --table-input '{
    "Name": "orders",
    "StorageDescriptor": {
      "Location": "s3://my-data-lake/orders/",
      "InputFormat": "org.apache.hadoop.mapred.TextInputFormat",
      "OutputFormat": "org.apache.hadoop.hive.ql.io.HiveIgnoreKeyTextOutputFormat",
      "SerdeInfo": {
        "SerializationLibrary": "org.openx.data.jsonserde.JsonSerDe"
      },
      "Columns": [
        {"Name": "id",     "Type": "int"},
        {"Name": "amount", "Type": "double"}
      ]
    }
  }'

# 3. Run Athena query
QUERY_ID=$(aws athena start-query-execution \
  --query-string "SELECT sum(amount) AS total FROM orders" \
  --query-execution-context Database=analytics \
  --query 'QueryExecutionId' \
  --output text)

# 4. Poll until done
while true; do
  STATE=$(aws athena get-query-execution \
    --query-execution-id $QUERY_ID \
    --query 'QueryExecution.Status.State' \
    --output text)
  [ "$STATE" = "SUCCEEDED" ] && break
  [ "$STATE" = "FAILED" ] && echo "Query failed" && exit 1
  sleep 1
done

# 5. Fetch results
aws athena get-query-results --query-execution-id $QUERY_ID
```

## Sidecar compartido con S3 Select

El sidecar floci-duck se comparte entre Athena y S3 Select. Una vez iniciado por la primera consulta Athena, `SelectObjectContent` también lo utiliza para las entradas CSV (con `FileHeaderInfo=USE`), JSON y Parquet. Si Athena aún no ha ejecutado una consulta, S3 Select recurre al evaluador Java integrado para CSV y JSON; Parquet siempre requiere el sidecar.

Consulte [S3 Select](s3.md#s3-select) para obtener detalles sobre los modos de ejecución y los operadores SQL admitidos.

## Modo simulado

Configure `FLOCI_SERVICES_ATHENA_MOCK=true` para omitir DuckDB por completo para Athena. En este modo, las consultas pasan a `SUCCEEDED` inmediatamente con un conjunto de resultados vacío, lo que resulta útil para pruebas unitarias que solo ejercitan la máquina de estado Athena, no los resultados de la consulta.

Cuando el modo simulado está habilitado, el sidecar **no** se inicia. S3 Select utilizará el evaluador Java para CSV y JSON. Las consultas de Parquet fallarán a menos que `FLOCI_SERVICES_DUCK_URL` apunte a una instancia de floci-duck que ya se esté ejecutando.
