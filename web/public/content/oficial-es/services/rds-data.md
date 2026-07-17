# RDS Datos API

**Protocolo:** REST JSON
**Punto final:** `POST http://localhost:4566/{operation}`
**Plano de datos de respaldo:** Contenedores locales RDS MySQL / MariaDB / PostgreSQL

Floci implementa las rutas AWS RDS de datos API utilizadas por los clientes AWS SDK y ejecuta SQL sin procesar contra recursos locales RDS creados a través del emulador RDS. Admite recursos MySQL, MariaDB y PostgreSQL para flujos de trabajo de desarrollo local que ya utilizan `ExecuteStatement` y transacciones.

Para la forma API ascendente, consulte la documentación de AWS RDS Datos API:

- [Uso de datos API para clústeres de base de datos Aurora](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/data-api.html)
- [Datos operaciones API](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/data-api-operations.html)
- [`ExecuteStatement`](https://docs.aws.amazon.com/rdsdataservice/latest/APIReference/API_ExecuteStatement.html)
- [`BeginTransaction`](https://docs.aws.amazon.com/rdsdataservice/latest/APIReference/API_BeginTransaction.html)
- [`CommitTransaction`](https://docs.aws.amazon.com/rdsdataservice/latest/APIReference/API_CommitTransaction.html)
- [`RollbackTransaction`](https://docs.aws.amazon.com/rdsdataservice/latest/APIReference/API_RollbackTransaction.html)
- [`BatchExecuteStatement`](https://docs.aws.amazon.com/rdsdataservice/latest/APIReference/API_BatchExecuteStatement.html)

## Acciones admitidas

| Acción | Ruta | Campos de solicitud obligatorios | Descripción |
|---|---|---|---|
| `ExecuteStatement` | `POST /Execute` | `resourceArn`, `secretArn`, `sql` | Ejecute SQL sin formato contra una instancia o clúster RDS local |
| `BeginTransaction` | `POST /BeginTransaction` | `resourceArn`, `secretArn` | Abra una transacción JDBC y devuelva un ID de transacción |
| `CommitTransaction` | `POST /CommitTransaction` | `resourceArn`, `secretArn`, `transactionId` | Confirmar una transacción abierta |
| `RollbackTransaction` | `POST /RollbackTransaction` | `resourceArn`, `secretArn`, `transactionId` | Revertir una transacción abierta |

`BatchExecuteStatement` se reconoce en `POST /BatchExecute` y devuelve un `BadRequestException` de estilo AWS porque la ejecución por lotes aún no está implementada. La operación obsoleta `ExecuteSql` también se reconoce en `POST /ExecuteSql` y devuelve un `BadRequestException` de estilo AWS.

## Notas de compatibilidad

- Se requieren `resourceArn` y `secretArn` en las solicitudes de datos API. `resourceArn` debe identificar un clúster o instancia local existente de RDS.
- `database` es opcional cuando el recurso RDS resuelto tiene un nombre de base de datos; en caso contrario deberá ser proporcionado. Las solicitudes transaccionales `ExecuteStatement` deben utilizar la misma base de datos que la transacción activa cuando `database` está presente.
- Las solicitudes de transacción validan `resourceArn` con el recurso de transacción activo. Floci resuelve los alias aceptados de ARN en el recurso local antes de comparar la identidad de la transacción.
- Se admiten los recursos MySQL, MariaDB y PostgreSQL. Los recursos de Aurora PostgreSQL se resuelven en la misma ruta de ejecución de PostgreSQL.
- SQL se envía directamente al motor de base de datos local a través de JDBC. El enlace `SqlParameter` aún no está implementado; enviar cadenas SQL sin procesar. Las solicitudes `parameters` no vacías o con formato incorrecto devuelven `BadRequestException`.
- Los registros de resultados incluyen variantes del campo Datos API, como `stringValue`, `longValue`, `blobValue`, `booleanValue`, `doubleValue` y `isNull`.
- Los errores SQL se devuelven como `DatabaseErrorException`, por lo que los llamadores de AWS SDK pueden manejar fallas de la base de datos con la decodificación normal de errores AWS.
- Si `secretArn` apunta a un secreto local de Secrets Manager con credenciales de JSON (`username` o `user`, más `password`), se utilizan esas credenciales. Si falta el secreto o no se puede analizar, Floci recurre a las credenciales maestras del recurso RDS resuelto para comodidad del desarrollo local.
- `formatRecordsAs=JSON`, `formattedRecords`, `generatedFields` y `resultSetOptions` aún no están implementados. Las solicitudes que requieren esos modos de resultados no admitidos devuelven `BadRequestException`.
- La activación del plano de control RDS `HttpEndpointEnabled` no está modelada localmente; La disponibilidad está controlada por `FLOCI_SERVICES_RDS_DATA_ENABLED` y si el recurso RDS local de destino se está ejecutando.

## Configuración

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_RDS_DATA_ENABLED` | `true` | Habilitar o deshabilitar el servicio RDS Datos API |
| `FLOCI_SERVICES_RDS_DATA_TRANSACTION_TTL_SECONDS` | `180` | Tiempo de inactividad, en segundos, antes de que caduquen las transacciones de datos API filtradas |

El RDS Datos API también requiere que el servicio RDS esté habilitado porque resuelve los valores de `resourceArn` en contenedores RDS locales.

## Ejemplo de

```bash
export AWS_ENDPOINT_URL=http://localhost:4566

aws rds create-db-cluster \
  --db-cluster-identifier appdb \
  --engine aurora-mysql \
  --master-username admin \
  --master-user-password secret123 \
  --database-name app \
  --endpoint-url "$AWS_ENDPOINT_URL"

RESOURCE_ARN=$(aws rds describe-db-clusters \
  --db-cluster-identifier appdb \
  --query 'DBClusters[0].DBClusterArn' \
  --output text \
  --endpoint-url "$AWS_ENDPOINT_URL")

SECRET_ARN=$(aws secretsmanager create-secret \
  --name appdb/data-api \
  --secret-string '{"username":"admin","password":"secret123"}' \
  --query ARN \
  --output text \
  --endpoint-url "$AWS_ENDPOINT_URL")

aws rds-data execute-statement \
  --resource-arn "$RESOURCE_ARN" \
  --secret-arn "$SECRET_ARN" \
  --database app \
  --sql "select 1 as count" \
  --include-result-metadata \
  --endpoint-url "$AWS_ENDPOINT_URL"
```
