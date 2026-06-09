# Módulo 15 · Analítica de datos con Athena y Glue

## Amazon Athena — SQL sobre archivos en S3

Athena usa **DuckDB** en Floci. Puedes hacer SQL directamente sobre archivos CSV, JSON o Parquet en S3.

```bash
# 1. Sube datos en CSV a S3
cat > ventas.csv << 'EOF'
fecha,usuario,producto,cantidad,total
2024-01-15,alice,laptop,1,899.00
2024-01-15,bob,mouse,2,29.99
2024-01-16,alice,teclado,1,149.99
2024-01-16,charlie,laptop,1,899.00
2024-01-17,bob,laptop,1,899.00
EOF

aws s3 mb s3://datos-athena
aws s3 cp ventas.csv s3://datos-athena/ventas/ventas.csv

# 2. Crea la base de datos y tabla en Glue Data Catalog
aws glue create-database --database-input '{"Name":"mi_base"}'

aws glue create-table \
  --database-name mi_base \
  --table-input '{
    "Name": "ventas",
    "StorageDescriptor": {
      "Columns": [
        {"Name":"fecha","Type":"string"},
        {"Name":"usuario","Type":"string"},
        {"Name":"producto","Type":"string"},
        {"Name":"cantidad","Type":"int"},
        {"Name":"total","Type":"double"}
      ],
      "Location": "s3://datos-athena/ventas/",
      "InputFormat": "org.apache.hadoop.mapred.TextInputFormat",
      "OutputFormat": "org.apache.hadoop.hive.ql.io.HiveIgnoreKeyTextOutputFormat",
      "SerdeInfo": {
        "SerializationLibrary": "org.apache.hadoop.hive.serde2.lazy.LazySimpleSerDe",
        "Parameters": {"field.delim": ",", "skip.header.line.count": "1"}
      }
    }
  }'

# 3. Crea el output bucket para los resultados
aws s3 mb s3://athena-resultados

# 4. Ejecuta una consulta SQL
QUERY_ID=$(aws athena start-query-execution \
  --query-string "SELECT usuario, SUM(total) as total_ventas FROM mi_base.ventas GROUP BY usuario ORDER BY total_ventas DESC" \
  --query-execution-context Database=mi_base \
  --result-configuration OutputLocation=s3://athena-resultados/ \
  --query QueryExecutionId --output text)

# 5. Espera el resultado
aws athena get-query-execution --query-execution-id $QUERY_ID

# 6. Lee el resultado
aws athena get-query-results --query-execution-id $QUERY_ID
```

---

## Comparación de streaming

| | Kinesis | MSK (Kafka) | GCP Pub/Sub |
|-|---------|-------------|-------------|
| Retencion | 7 días (extendible 365) | Configurable | 7 días |
| Orden | Por shard | Por partición | No garantizado |
| Casos de uso | AWS-native, simple | Multi-nube, alta escala | GCP-native |
| Replay | Sí | Sí | Con seek |

---

## Reto del módulo

1. Crea un stream Kinesis y escribe 20 eventos de click de usuarios
2. Escribe un consumidor Python que cuente clics por usuario
3. Sube un CSV de ventas a S3 y crea una tabla Athena
4. Ejecuta 3 consultas SQL: total por usuario, top 3 productos, ventas por día
5. (Bonus) Usa MSK/Kafka para el mismo flujo de eventos

## Preguntas de salida

1. ¿Cuándo elegirías Kinesis sobre SQS?
2. ¿Qué es una partition key en Kinesis y por qué afecta el orden?
3. ¿Qué ventaja tiene Athena sobre cargar el CSV en RDS?
4. ¿Qué diferencia hay entre Kafka y Kinesis?

---

## AWS Glue — catálogo y ETL

Glue tiene dos funciones principales:
1. **Glue Data Catalog**: directorio de metadatos de tablas. Athena lo consulta para saber la estructura de los datos.
2. **Glue Crawler**: escanea archivos en S3 y detecta el esquema automáticamente.

```bash
# Crea una base de datos en el catálogo
aws glue create-database --database-input '{"Name":"tienda"}'

# Crea un crawler que descubre el esquema automáticamente
aws glue create-crawler \
  --name crawler-ventas \
  --role arn:aws:iam::000000000000:role/glue-role \
  --targets '{"S3Targets":[{"Path":"s3://datos-athena/ventas/"}]}' \
  --database-name tienda

# Ejecuta el crawler
aws glue start-crawler --name crawler-ventas

# Espera y ve el resultado
aws glue get-crawler --name crawler-ventas --query "Crawler.State"

# Ve las tablas que descubrió
aws glue get-tables --database-name tienda \
  --query "TableList[*].Name" --output table
```

## Formato de datos: JSON vs Parquet

```bash
# Sube datos en CSV (ineficiente para analítica)
aws s3 cp ventas.csv s3://datos-athena/ventas-csv/

# En producción, convierte a Parquet (10x más rápido, 10x menos bytes escaneados)
# Athena cobra por bytes escaneados — Parquet reduce el costo drásticamente
```

```python
import pandas as pd

# Convierte CSV a Parquet
df = pd.read_csv("ventas.csv")
df.to_parquet("ventas.parquet", engine="pyarrow", compression="snappy")

# Sube el Parquet a S3
import boto3
s3 = boto3.client("s3", endpoint_url="http://localhost:4566",
    region_name="us-east-1", aws_access_key_id="test", aws_secret_access_key="test")
s3.upload_file("ventas.parquet", "datos-athena", "ventas-parquet/ventas.parquet")
```

## Comparación de analítica en los tres proveedores

| | AWS | Azure | GCP |
|-|-----|-------|-----|
| SQL sobre S3/Blob | Athena (DuckDB en Floci) | Synapse Serverless | BigQuery |
| ETL visual | Glue Studio | Data Factory | Dataflow |
| Catálogo de datos | Glue Data Catalog | Purview | Data Catalog |
| Costo modelo | Por bytes escaneados | Por TiB procesado | Por TiB procesado |

## Reto del módulo

1. Crea un CSV de 100 ventas ficticias con columnas: fecha, usuario, producto, cantidad, total
2. Súbelo a S3: `aws s3 cp ventas.csv s3://datos-athena/ventas/`
3. Crea la tabla en Glue Data Catalog con el esquema correcto
4. Ejecuta estas consultas SQL con Athena:
   - Total de ventas por usuario (GROUP BY)
   - Top 3 productos más vendidos
   - Ventas por día de la semana
5. (Bonus) Convierte el CSV a Parquet y compara cuántos bytes escanea Athena con cada formato

## Preguntas de salida

1. ¿Qué diferencia hay entre un data lake y una base de datos tradicional?
2. ¿Por qué Parquet es 10x más eficiente que CSV para analítica?
3. ¿Qué hace un Glue Crawler que no hace Athena sola?
4. ¿Cuándo elegirías Athena sobre cargar los datos en RDS PostgreSQL?
## Verificación del aprendizaje

Antes de marcar este módulo como completado, confirma esto con evidencia propia:

1. **Lo puedo explicar en una frase.** Escribe qué problema resuelve este módulo y para qué lo usarías en una aplicación real.
2. **Lo ejecuté, no solo lo leí.** Guarda el comando principal que corriste y una salida real de tu terminal.
3. **Lo puedo verificar.** Consulta el recurso con AWS CLI, Azure CLI, GCP CLI o StackPort cuando aplique. La evidencia debe mostrar nombre, estado o contenido del recurso.
4. **Entiendo un fallo común.** Provoca o identifica un error sencillo, copia el mensaje completo y explica cómo lo diagnosticaste.
5. **Sé cuándo avanzar.** Avanza solo si puedes repetir el laboratorio desde una carpeta limpia sin depender de copiar a ciegas.

Evidencia mínima sugerida:

```text
Comando ejecutado:
Salida obtenida:
Qué significa la salida:
Error o duda encontrada:
Cómo la resolví:
```

