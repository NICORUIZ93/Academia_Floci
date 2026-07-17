# Ejemplos de referencia

Esta carpeta contiene implementaciones de comparación, no el punto de partida.

Regla del curso: intenta cada reto durante al menos 30 minutos, registra el error
y explica con tus palabras qué esperabas antes de consultar estos archivos.

- `python/demo.py`: cliente combinado de S3, SQS y DynamoDB.
- `node/demo.mjs`: cliente combinado de S3 y SQS.
- `java/FlociS3Example.java`: ejemplo S3 combinado con AWS SDK for Java v2.
- `go/floci_s3_example.go`: ejemplo S3 con AWS SDK for Go v2.
- `rust/floci_s3_example.rs`: ejemplo S3 con AWS SDK for Rust.
- `init/ready.d/10-seed.sh`: ejemplo de inicialización idempotente.

El `docker-compose.yml` principal no monta el hook de inicialización. Si llegas
al módulo de hooks, deberás descubrir y agregar tú mismo el montaje correcto.

## Ejemplos por operación (node/, python/, java/)

Además de los demos combinados de arriba, cada servicio de la ruta base
(Módulos 2-7) tiene un archivo independiente por operación, en los tres
lenguajes, para consultar una operación puntual sin leer un demo completo.
Cada archivo se ejecuta solo, acepta argumentos por línea de comandos, y
asume Floci corriendo en `http://localhost:4566` (ver Módulo 1).

| Servicio | Operación | Node.js | Python | Java |
|---|---|---|---|---|
| S3 | Listar buckets | `s3-list-buckets.js` | `s3_list_buckets.py` | `S3ListBuckets.java` |
| S3 | Crear bucket | `s3-create-bucket.js` | `s3_create_bucket.py` | `S3CreateBucket.java` |
| S3 | Subir archivo | `s3-upload.js` | `s3_upload.py` | `S3Upload.java` |
| S3 | Descargar archivo | `s3-download.js` | `s3_download.py` | `S3Download.java` |
| S3 | Eliminar objeto/bucket | `s3-delete.js` | `s3_delete.py` | `S3Delete.java` |
| SQS | Crear cola | `sqs-create-queue.js` | `sqs_create_queue.py` | `SqsCreateQueue.java` |
| SQS | Enviar mensaje | `sqs-send-message.js` | `sqs_send_message.py` | `SqsSendMessage.java` |
| SQS | Recibir mensaje | `sqs-receive-message.js` | `sqs_receive_message.py` | `SqsReceiveMessage.java` |
| SQS | Eliminar mensaje | `sqs-delete-message.js` | `sqs_delete_message.py` | `SqsDeleteMessage.java` |
| DynamoDB | Crear tabla | `dynamodb-create-table.js` | `dynamodb_create_table.py` | `DynamoDbCreateTable.java` |
| DynamoDB | Insertar item | `dynamodb-put-item.js` | `dynamodb_put_item.py` | `DynamoDbPutItem.java` |
| DynamoDB | Obtener item | `dynamodb-get-item.js` | `dynamodb_get_item.py` | `DynamoDbGetItem.java` |
| DynamoDB | Actualizar item | `dynamodb-update-item.js` | `dynamodb_update_item.py` | `DynamoDbUpdateItem.java` |
| DynamoDB | Eliminar item | `dynamodb-delete-item.js` | `dynamodb_delete_item.py` | `DynamoDbDeleteItem.java` |
| Lambda | Crear función | `lambda-create-function.js` | `lambda_create_function.py` | `LambdaCreateFunction.java` |
| Lambda | Invocar | `lambda-invoke.js` | `lambda_invoke.py` | `LambdaInvoke.java` |
| Lambda | Actualizar código | `lambda-update.js` | `lambda_update.py` | `LambdaUpdate.java` |
| API Gateway | Crear API | `apigateway-create-api.js` | `apigateway_create_api.py` | `ApiGatewayCreateApi.java` |
| API Gateway | Crear recurso | `apigateway-create-resource.js` | `apigateway_create_resource.py` | `ApiGatewayCreateResource.java` |
| API Gateway | Crear método | `apigateway-put-method.js` | `apigateway_put_method.py` | `ApiGatewayPutMethod.java` |
| IAM | Crear usuario | `iam-create-user.js` | `iam_create_user.py` | `IamCreateUser.java` |
| IAM | Crear política | `iam-create-policy.js` | `iam_create_policy.py` | `IamCreatePolicy.java` |
| IAM | Asignar política | `iam-attach-policy.js` | `iam_attach_policy.py` | `IamAttachPolicy.java` |

Ejecución:

```bash
# Node.js (requiere: npm install en examples/node/)
node examples/node/s3-create-bucket.js mi-bucket

# Python (requiere: pip install boto3)
python3 examples/python/s3_create_bucket.py mi-bucket

# Java (requiere el AWS SDK for Java v2 en el classpath, ver examples/java/FlociS3Example.java)
java -cp <classpath> examples/java/S3CreateBucket.java mi-bucket
```

## Proyecto final de referencia

`examples/project-final/` contiene una implementación de referencia completa
del Sistema de Gestión de Tareas del Módulo 9: funciones Lambda, Terraform
para desplegar la infraestructura, y un workflow de GitHub Actions. Sigue la
misma regla de arriba: constrúyelo tú mismo primero.
