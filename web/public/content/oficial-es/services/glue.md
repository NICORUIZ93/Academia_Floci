# Glue

**Protocolo:** JSON 1.1
**Punto final:** `http://localhost:4566/`

Floci emula el catálogo de datos AWS Glue y el registro de esquemas Glue, lo que le permite administrar metadatos del lago de datos local y flujos de trabajo de versión de esquema.

## Acciones admitidas

### Catálogo de datos

| Área | Acciones |
|---|---|
| Bases de datos | `CreateDatabase` · `GetDatabase` · `GetDatabases` |
| Mesas | `CreateTable` · `GetTable` · `GetTables` · `DeleteTable` |
| Particiones | `CreatePartition` · `GetPartitions` |

### Registro de esquema

| Área | Acciones |
|---|---|
| Registros | `CreateRegistry` · `GetRegistry` · `ListRegistries` · `UpdateRegistry` · `DeleteRegistry` |
| Esquemas | `CreateSchema` · `GetSchema` · `ListSchemas` · `UpdateSchema` · `DeleteSchema` |
| Versiones | `RegisterSchemaVersion` · `GetSchemaByDefinition` · `GetSchemaVersion` · `ListSchemaVersions` · `DeleteSchemaVersions` · `GetSchemaVersionsDiff` · `CheckSchemaVersionValidity` |
| Metadatos y etiquetas | `PutSchemaVersionMetadata` · `RemoveSchemaVersionMetadata` · `QuerySchemaVersionMetadata` · `TagResource` · `UntagResource` · `GetTags` |

Los formatos de esquema admitidos son `AVRO`, `JSON` y `PROTOBUF`. Los modos de compatibilidad son `NONE`, `DISABLED`, `BACKWARD`, `BACKWARD_ALL`, `FORWARD`, `FORWARD_ALL`, `FULL` y `FULL_ALL`.

## Configuración

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_GLUE_ENABLED` | `true` | Activar o desactivar el servicio |

## Integración de con Athena

**Athena** utiliza automáticamente el catálogo de datos Glue para resolver nombres de tablas en ubicaciones y formatos de S3. Cuando envía una consulta Athena, Floci lee todas las tablas Glue para la base de datos de destino y genera vistas DuckDB sobre los objetos S3 subyacentes antes de ejecutar SQL.

Las tablas pueden hacer referencia a una versión del esquema del Registro de esquemas a través de `StorageDescriptor.SchemaReference`. En `GetTable` y `GetTables`, Floci resuelve la definición del esquema en columnas Glue cuando es posible.

La función de lectura DuckDB se selecciona en función de `StorageDescriptor.InputFormat` y `StorageDescriptor.SerdeInfo.SerializationLibrary` de la tabla:

| Condición | Función DuckDB |
|---|---|
| `InputFormat` o `SerializationLibrary` contiene `parquet` | `read_parquet` |
| `InputFormat` o `SerializationLibrary` contiene `json` | `read_json_auto` |
| `InputFormat` contiene `hive` | `read_json_auto` |
| Cualquier otra cosa | `read_csv_auto` |

## Ejemplo de catálogo de datos

```bash
export AWS_ENDPOINT_URL=http://localhost:4566

# Create a database
aws glue create-database \
  --database-input '{"Name": "analytics"}' \
  --endpoint-url $AWS_ENDPOINT_URL

# Create a JSON table (standard AWS format for NDJSON data)
aws glue create-table \
  --database-name analytics \
  --table-input '{
    "Name": "orders",
    "StorageDescriptor": {
      "Location": "s3://my-bucket/orders/",
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
  }' \
  --endpoint-url $AWS_ENDPOINT_URL

# Create a Parquet table
aws glue create-table \
  --database-name analytics \
  --table-input '{
    "Name": "events",
    "StorageDescriptor": {
      "Location": "s3://my-bucket/events/",
      "InputFormat": "org.apache.hadoop.hive.ql.io.parquet.MapredParquetInputFormat",
      "SerdeInfo": {
        "SerializationLibrary": "org.apache.hadoop.hive.ql.io.parquet.serde.ParquetHiveSerDe"
      },
      "Columns": [
        {"Name": "event_id", "Type": "string"},
        {"Name": "ts",       "Type": "bigint"}
      ]
    }
  }' \
  --endpoint-url $AWS_ENDPOINT_URL
```

## Ejemplo de registro de esquema

```bash
export AWS_ENDPOINT_URL=http://localhost:4566

cat > /tmp/order.avsc <<'JSON'
{"type":"record","name":"Order","namespace":"example","fields":[{"name":"id","type":"long"}]}
JSON

cat > /tmp/order-v2.avsc <<'JSON'
{"type":"record","name":"Order","namespace":"example","fields":[{"name":"id","type":"long"},{"name":"amount","type":["null","double"],"default":null}]}
JSON

aws glue create-registry \
  --registry-name local-registry \
  --endpoint-url $AWS_ENDPOINT_URL

aws glue create-schema \
  --registry-id RegistryName=local-registry \
  --schema-name orders \
  --data-format AVRO \
  --compatibility BACKWARD \
  --schema-definition file:///tmp/order.avsc \
  --endpoint-url $AWS_ENDPOINT_URL

aws glue register-schema-version \
  --schema-id RegistryName=local-registry,SchemaName=orders \
  --schema-definition file:///tmp/order-v2.avsc \
  --endpoint-url $AWS_ENDPOINT_URL

aws glue list-schema-versions \
  --schema-id RegistryName=local-registry,SchemaName=orders \
  --endpoint-url $AWS_ENDPOINT_URL
```
