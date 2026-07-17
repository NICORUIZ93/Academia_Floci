# Glue

**Protocolo:** JSON 1.1
**Punto final:** `http://localhost:4566/`

Floci emula el catálogo de datos AWS Glue y el registro de esquemas Glue, lo que le permite administrar metadatos del lago de datos local y flujos de trabajo de versión de esquema.

## Acciones admitidas

### Catálogo de datos

#### Bases de datos

| Acción | Descripción |
|--------|-------------|
| CreateDatabase | Crea una base de datos en el catálogo de datos local Glue. |
| GetDatabase | Devuelve una base de datos del catálogo de datos almacenada. |
| GetDatabases | Enumera las bases de datos en el catálogo de datos local Glue. |
| DeleteDatabase | Elimina una base de datos del catálogo de datos local Glue. |

#### Mesas

| Acción | Descripción |
|--------|-------------|
| CreateTable | Crea una definición de tabla en el catálogo de datos Glue local. |
| GetTable | Devuelve una definición de tabla almacenada y resuelve referencias de esquema cuando es posible. |
| GetTables | Enumera las definiciones de tablas para una base de datos. |
| DeleteTable | Elimina una definición de tabla de una base de datos. |

#### Particiones

| Acción | Descripción |
|--------|-------------|
| CreatePartition | Crea una partición para una tabla del catálogo de datos. |
| GetPartitions | Enumera las particiones almacenadas para una tabla del catálogo de datos. |

#### Funciones definidas por el usuario

| Acción | Descripción |
|--------|-------------|
| CreateUserDefinedFunction | Crea una función definida por el usuario en el catálogo de datos. |
| GetUserDefinedFunction | Devuelve una función almacenada definida por el usuario. |
| GetUserDefinedFunctions | Enumera funciones definidas por el usuario para una base de datos. |
| UpdateUserDefinedFunction | Actualiza una función almacenada definida por el usuario. |
| DeleteUserDefinedFunction | Elimina una función definida por el usuario de una base de datos. |

### Registro de esquema

#### Registros

| Acción | Descripción |
|--------|-------------|
| CreateRegistry | Crea un registro de esquema. |
| GetRegistry | Devuelve un registro de esquema almacenado. |
| ListRegistries | Muestra registros de esquemas. |
| UpdateRegistry | Actualiza los metadatos almacenados de un registro de esquema. |
| DeleteRegistry | Elimina un registro de esquema. |

#### Esquemas

| Acción | Descripción |
|--------|-------------|
| CreateSchema | Crea un esquema en un registro con el formato de datos y el modo de compatibilidad proporcionados. |
| GetSchema | Devuelve un esquema almacenado. |
| ListSchemas | Enumera esquemas en un registro. |
| UpdateSchema | Actualiza los metadatos del esquema o la configuración de compatibilidad. |
| DeleteSchema | Elimina un esquema de un registro. |

#### Versiones

| Acción | Descripción |
|--------|-------------|
| RegisterSchemaVersion | Registra una nueva definición de versión de esquema. |
| GetSchemaByDefinition | Encuentra una versión de esquema que coincide con una definición proporcionada. |
| GetSchemaVersion | Devuelve una versión del esquema almacenado. |
| ListSchemaVersions | Enumera las versiones de un esquema. |
| DeleteSchemaVersions | Elimina versiones de esquema de un esquema. |
| GetSchemaVersionsDiff | Devuelve la diferencia entre dos números de versión de esquema. |
| CheckSchemaVersionValidity | Valida una definición de esquema para el formato de datos proporcionado. |

#### Metadatos y etiquetas

| Acción | Descripción |
|--------|-------------|
| PutSchemaVersionMetadata | Agrega metadatos a una versión de esquema. |
| RemoveSchemaVersionMetadata | Elimina metadatos de una versión de esquema. |
| QuerySchemaVersionMetadata | Devuelve metadatos almacenados para versiones de esquema coincidentes. |
| TagResource | Agrega etiquetas a un recurso de registro de esquema Glue. |
| UntagResource | Elimina etiquetas de un recurso de registro de esquema Glue. |
| GetTags | Devuelve etiquetas almacenadas para un recurso de registro de esquema Glue. |

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
