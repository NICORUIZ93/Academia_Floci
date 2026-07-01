# 45 pasos de Academia Floci

Ruta simple de estudio. Cada paso corresponde a la página `web/index.html`.

Cómo usar este archivo: lee el paso, predice la salida, ejecuta el comando si existe, compara con la salida esperada y responde la pregunta de control en tu cuaderno.

## Mapa de niveles

| Nivel de referencia | Pasos | Temas |
|---|---:|---|
| Fundamentos | 1-27 | Docker, Floci, AWS CLI, S3, SQS y DynamoDB |
| Aplicaciones | 28-40 | Lambda, API Gateway e IAM |
| Integración | 41-45 | Proyecto final de tareas |

## Paso 1: ¿Qué es Docker?

**Explicación:** Docker es una herramienta que ejecuta programas en contenedores. Es como tener una caja mágica donde metes cualquier programa y funciona en cualquier computadora.

**Comando:**

```bash
docker --version
```

**Desglose:**

- "docker" es el programa
- "--version" pregunta qué versión tienes

**Salida esperada:**

```text
Docker version 24.0.7
```

**Pregunta de control:**

¿Qué hace este comando y qué salida esperas ver?

## Paso 2: Instalar Docker

**Explicación:** Ve a docker.com, descarga Docker para tu sistema (Windows, Mac o Linux) e instálalo. Después de instalar, reinicia tu terminal.

**Comando:**

No hay comando.

**Desglose:**

- No aplica.

**Salida esperada:**

```text
No aplica.
```

**Pregunta de control:**

Explica este concepto con tus palabras.

## Paso 3: Verificar Docker

**Explicación:** Vamos a comprobar que Docker se instaló bien.

**Comando:**

```bash
docker --version
```

**Desglose:**

- "docker" ejecuta el programa
- "--version" muestra la versión

**Salida esperada:**

```text
Docker version 24.0.7, build afdd53b
```

**Pregunta de control:**

¿Qué hace este comando y qué salida esperas ver?

## Paso 4: Levantar Floci

**Explicación:** Floci es un emulador de AWS que corre en tu computadora. Es como tener un mini AWS en tu PC sin pagar ni crear cuentas.

**Comando:**

```bash
docker run -p 4566:4566 floci/floci:latest
```

**Desglose:**

- "docker run" ejecuta un contenedor
- "-p 4566:4566" conecta el puerto
- "floci/floci:latest" es la imagen

**Salida esperada:**

```text
Floci started on port 4566
```

**Pregunta de control:**

¿Qué hace este comando y qué salida esperas ver?

## Paso 5: Verificar Floci

**Explicación:** Vamos a comprobar que Floci está funcionando.

**Comando:**

```bash
curl http://localhost:4566/_localstack/health
```

**Desglose:**

- "curl" hace una petición web
- "http://localhost:4566" es la dirección de Floci

**Salida esperada:**

```text
{"status":"running","services":{"s3":"available"}}
```

**Pregunta de control:**

¿Qué hace este comando y qué salida esperas ver?

## Paso 6: Configurar AWS CLI

**Explicación:** AWS CLI es la herramienta para hablar con AWS. Vamos a configurarla para que hable con Floci.

**Comando:**

```bash
aws configure set region us-east-1
```

**Desglose:**

- "aws configure" configura AWS
- "set region us-east-1" establece la región

**Salida esperada:**

```text
No hay salida visible.
```

**Pregunta de control:**

¿Qué hace este comando y qué salida esperas ver?

## Paso 7: Probar AWS CLI

**Explicación:** Vamos a probar que AWS CLI funciona con Floci.

**Comando:**

```bash
aws s3 ls --endpoint-url=http://localhost:4566
```

**Desglose:**

- "aws s3 ls" lista buckets
- "--endpoint-url" usa Floci

**Salida esperada:**

```text
Lista vacía, sin errores.
```

**Pregunta de control:**

¿Qué hace este comando y qué salida esperas ver?

## Paso 8: ¿Qué es S3?

**Explicación:** S3 es el servicio de almacenamiento de AWS. Es como un disco duro en la nube donde guardas archivos.

**Comando:**

No hay comando.

**Desglose:**

- No aplica.

**Salida esperada:**

```text
No aplica.
```

**Pregunta de control:**

Explica este concepto con tus palabras.

## Paso 9: Crear un bucket S3

**Explicación:** Vamos a crear nuestro primer bucket.

**Comando:**

```bash
aws s3 mb s3://mi-bucket --endpoint-url http://localhost:4566
```

**Desglose:**

- "aws s3 mb" = make bucket
- "s3://mi-bucket" es el nombre

**Salida esperada:**

```text
make_bucket: mi-bucket
```

**Pregunta de control:**

¿Qué hace este comando y qué salida esperas ver?

## Paso 10: Subir un archivo a S3

**Explicación:** Vamos a crear un archivo de prueba y subirlo al bucket.

**Comando:**

```bash
echo 'Hola mundo' > hola.txt && aws s3 cp hola.txt s3://mi-bucket/ --endpoint-url http://localhost:4566
```

**Desglose:**

- "echo" crea el archivo
- "aws s3 cp" sube el archivo

**Salida esperada:**

```text
upload: ./hola.txt to s3://mi-bucket/hola.txt
```

**Pregunta de control:**

¿Qué hace este comando y qué salida esperas ver?

## Paso 11: Listar archivos en S3

**Explicación:** Vamos a ver qué archivos hay en nuestro bucket.

**Comando:**

```bash
aws s3 ls s3://mi-bucket/ --endpoint-url http://localhost:4566
```

**Desglose:**

- "aws s3 ls" lista archivos

**Salida esperada:**

```text
2024-01-01 12:00:00 12 hola.txt
```

**Pregunta de control:**

¿Qué hace este comando y qué salida esperas ver?

## Paso 12: Descargar un archivo de S3

**Explicación:** Vamos a descargar el archivo que subimos.

**Comando:**

```bash
aws s3 cp s3://mi-bucket/hola.txt ./hola-descargado.txt --endpoint-url http://localhost:4566
```

**Desglose:**

- "aws s3 cp" copia, origen y destino

**Salida esperada:**

```text
download: s3://mi-bucket/hola.txt to ./hola-descargado.txt
```

**Pregunta de control:**

¿Qué hace este comando y qué salida esperas ver?

## Paso 13: Eliminar un archivo de S3

**Explicación:** Vamos a eliminar el archivo del bucket.

**Comando:**

```bash
aws s3 rm s3://mi-bucket/hola.txt --endpoint-url http://localhost:4566
```

**Desglose:**

- "aws s3 rm" = remove (eliminar)

**Salida esperada:**

```text
delete: s3://mi-bucket/hola.txt
```

**Pregunta de control:**

¿Qué hace este comando y qué salida esperas ver?

## Paso 14: Eliminar el bucket S3

**Explicación:** Vamos a eliminar el bucket. Debe estar vacío.

**Comando:**

```bash
aws s3 rb s3://mi-bucket --endpoint-url http://localhost:4566
```

**Desglose:**

- "aws s3 rb" = remove bucket

**Salida esperada:**

```text
remove_bucket: mi-bucket
```

**Pregunta de control:**

¿Qué hace este comando y qué salida esperas ver?

## Paso 15: ¿Qué es SQS?

**Explicación:** SQS es un servicio de colas de mensajes. Es como una bandeja de correo donde dejas mensajes para que otros los recojan después.

**Comando:**

No hay comando.

**Desglose:**

- No aplica.

**Salida esperada:**

```text
No aplica.
```

**Pregunta de control:**

Explica este concepto con tus palabras.

## Paso 16: Crear una cola SQS

**Explicación:** Vamos a crear una cola llamada mi-cola.

**Comando:**

```bash
aws sqs create-queue --queue-name mi-cola --endpoint-url http://localhost:4566
```

**Desglose:**

- "aws sqs create-queue" crea una cola
- "--queue-name" es el nombre

**Salida esperada:**

```text
{"QueueUrl": "http://localhost:4566/000000000000/mi-cola"}
```

**Pregunta de control:**

¿Qué hace este comando y qué salida esperas ver?

## Paso 17: Enviar un mensaje a SQS

**Explicación:** Vamos a enviar un mensaje a la cola.

**Comando:**

```bash
aws sqs send-message --queue-url http://localhost:4566/000000000000/mi-cola --message-body "Hola mundo" --endpoint-url http://localhost:4566
```

**Desglose:**

- "send-message" envía
- "--queue-url" es la dirección
- "--message-body" es el contenido

**Salida esperada:**

```text
{"MD5OfMessageBody": "...", "MessageId": "..."}
```

**Pregunta de control:**

¿Qué hace este comando y qué salida esperas ver?

## Paso 18: Recibir mensajes de SQS

**Explicación:** Vamos a recibir los mensajes de la cola.

**Comando:**

```bash
aws sqs receive-message --queue-url http://localhost:4566/000000000000/mi-cola --endpoint-url http://localhost:4566
```

**Desglose:**

- "receive-message" recibe mensaje

**Salida esperada:**

```text
{"Messages": [{"MessageId": "...", "Body": "Hola mundo"}]}
```

**Pregunta de control:**

¿Qué hace este comando y qué salida esperas ver?

## Paso 19: Eliminar un mensaje de SQS

**Explicación:** Después de recibir un mensaje, hay que eliminarlo de la cola.

**Comando:**

```bash
aws sqs delete-message --queue-url http://localhost:4566/000000000000/mi-cola --receipt-handle "..." --endpoint-url http://localhost:4566
```

**Desglose:**

- "delete-message" elimina
- "--receipt-handle" es el identificador

**Salida esperada:**

```text
No hay salida visible.
```

**Pregunta de control:**

¿Qué hace este comando y qué salida esperas ver?

## Paso 20: Eliminar la cola SQS

**Explicación:** Vamos a eliminar la cola.

**Comando:**

```bash
aws sqs delete-queue --queue-url http://localhost:4566/000000000000/mi-cola --endpoint-url http://localhost:4566
```

**Desglose:**

- "delete-queue" elimina la cola

**Salida esperada:**

```text
No hay salida visible.
```

**Pregunta de control:**

¿Qué hace este comando y qué salida esperas ver?

## Paso 21: ¿Qué es DynamoDB?

**Explicación:** DynamoDB es una base de datos NoSQL. Es como una hoja de cálculo gigante donde guardas información.

**Comando:**

No hay comando.

**Desglose:**

- No aplica.

**Salida esperada:**

```text
No aplica.
```

**Pregunta de control:**

Explica este concepto con tus palabras.

## Paso 22: Crear una tabla DynamoDB

**Explicación:** Vamos a crear una tabla para guardar tareas.

**Comando:**

```bash
aws dynamodb create-table --table-name tareas --attribute-definitions AttributeName=id,AttributeType=S --key-schema AttributeName=id,KeyType=HASH --billing-mode PAY_PER_REQUEST --endpoint-url http://localhost:4566
```

**Desglose:**

- "create-table" crea
- "--table-name" es el nombre
- "--attribute-definitions" define campos

**Salida esperada:**

```text
{"TableDescription": {"TableName": "tareas", "TableStatus": "ACTIVE"}}
```

**Pregunta de control:**

¿Qué hace este comando y qué salida esperas ver?

## Paso 23: Insertar un item en DynamoDB

**Explicación:** Vamos a guardar una tarea en la tabla.

**Comando:**

```bash
aws dynamodb put-item --table-name tareas --item '{"id":{"S":"1"},"nombre":{"S":"Aprender S3"}}' --endpoint-url http://localhost:4566
```

**Desglose:**

- "put-item" inserta
- "--item" son los datos

**Salida esperada:**

```text
No hay salida visible.
```

**Pregunta de control:**

¿Qué hace este comando y qué salida esperas ver?

## Paso 24: Obtener un item de DynamoDB

**Explicación:** Vamos a recuperar la tarea que guardamos.

**Comando:**

```bash
aws dynamodb get-item --table-name tareas --key '{"id":{"S":"1"}}' --endpoint-url http://localhost:4566
```

**Desglose:**

- "get-item" obtiene
- "--key" es la clave

**Salida esperada:**

```text
{"Item": {"id": {"S": "1"}, "nombre": {"S": "Aprender S3"}}}
```

**Pregunta de control:**

¿Qué hace este comando y qué salida esperas ver?

## Paso 25: Consultar todos los items de DynamoDB

**Explicación:** Vamos a ver todas las tareas de la tabla.

**Comando:**

```bash
aws dynamodb scan --table-name tareas --endpoint-url http://localhost:4566
```

**Desglose:**

- "scan" escanea toda la tabla

**Salida esperada:**

```text
{"Count": 1, "Items": [{"id": {"S": "1"}, "nombre": {"S": "Aprender S3"}}]}
```

**Pregunta de control:**

¿Qué hace este comando y qué salida esperas ver?

## Paso 26: Eliminar un item de DynamoDB

**Explicación:** Vamos a eliminar la tarea.

**Comando:**

```bash
aws dynamodb delete-item --table-name tareas --key '{"id":{"S":"1"}}' --endpoint-url http://localhost:4566
```

**Desglose:**

- "delete-item" elimina

**Salida esperada:**

```text
No hay salida visible.
```

**Pregunta de control:**

¿Qué hace este comando y qué salida esperas ver?

## Paso 27: Eliminar la tabla DynamoDB

**Explicación:** Vamos a eliminar la tabla.

**Comando:**

```bash
aws dynamodb delete-table --table-name tareas --endpoint-url http://localhost:4566
```

**Desglose:**

- "delete-table" elimina la tabla

**Salida esperada:**

```text
{"TableDescription": {"TableName": "tareas", "TableStatus": "DELETING"}}
```

**Pregunta de control:**

¿Qué hace este comando y qué salida esperas ver?

## Paso 28: ¿Qué es Lambda?

**Explicación:** Lambda ejecuta código sin servidores. Escribes una función, la subes, y Lambda la ejecuta cuando la llamas.

**Comando:**

No hay comando.

**Desglose:**

- No aplica.

**Salida esperada:**

```text
No aplica.
```

**Pregunta de control:**

Explica este concepto con tus palabras.

## Paso 29: Crear una función Lambda

**Explicación:** Vamos a crear una función simple que devuelve un mensaje.

**Comando:**

```bash
# Crea index.js, comprime y sube
cat > index.js <<'JS'
exports.handler = async (event) => {
  return { statusCode: 200, body: JSON.stringify({ mensaje: 'Hola desde Lambda' }) };
};
JS
zip function.zip index.js
aws lambda create-function --function-name mi-funcion --runtime nodejs20.x --handler index.handler --zip-file fileb://function.zip --role arn:aws:iam::000000000000:role/lambda-role --endpoint-url http://localhost:4566
```

**Desglose:**

- "zip" comprime
- "create-function" crea la función

**Salida esperada:**

```text
{"FunctionName": "mi-funcion", "Runtime": "nodejs20.x"}
```

**Pregunta de control:**

¿Qué hace este comando y qué salida esperas ver?

## Paso 30: Invocar la función Lambda

**Explicación:** Vamos a ejecutar la función Lambda.

**Comando:**

```bash
aws lambda invoke --function-name mi-funcion --payload '{"nombre":"Mundo"}' output.json --endpoint-url http://localhost:4566
```

**Desglose:**

- "invoke" ejecuta
- "--payload" son los datos

**Salida esperada:**

```text
El archivo output.json contiene la respuesta.
```

**Pregunta de control:**

¿Qué hace este comando y qué salida esperas ver?

## Paso 31: Actualizar la función Lambda

**Explicación:** Vamos a cambiar el código de la función.

**Comando:**

```bash
aws lambda update-function-code --function-name mi-funcion --zip-file fileb://function.zip --endpoint-url http://localhost:4566
```

**Desglose:**

- "update-function-code" actualiza el código

**Salida esperada:**

```text
{"FunctionName": "mi-funcion", "LastModified": "..."}
```

**Pregunta de control:**

¿Qué hace este comando y qué salida esperas ver?

## Paso 32: Eliminar la función Lambda

**Explicación:** Vamos a eliminar la función Lambda.

**Comando:**

```bash
aws lambda delete-function --function-name mi-funcion --endpoint-url http://localhost:4566
```

**Desglose:**

- "delete-function" elimina

**Salida esperada:**

```text
No hay salida visible.
```

**Pregunta de control:**

¿Qué hace este comando y qué salida esperas ver?

## Paso 33: ¿Qué es API Gateway?

**Explicación:** API Gateway es una puerta de entrada para tus APIs.

**Comando:**

No hay comando.

**Desglose:**

- No aplica.

**Salida esperada:**

```text
No aplica.
```

**Pregunta de control:**

Explica este concepto con tus palabras.

## Paso 34: Crear una API REST

**Explicación:** Vamos a crear una API REST.

**Comando:**

```bash
aws apigateway create-rest-api --name mi-api --endpoint-url http://localhost:4566
```

**Desglose:**

- "create-rest-api" crea una API

**Salida esperada:**

```text
{"id": "api123", "name": "mi-api"}
```

**Pregunta de control:**

¿Qué hace este comando y qué salida esperas ver?

## Paso 35: Crear un recurso y método en API Gateway

**Explicación:** Vamos a crear un endpoint /hola con método GET.

**Comando:**

```bash
# Obtén el ID de la API y ejecuta
aws apigateway get-resources --rest-api-id <api-id> --endpoint-url http://localhost:4566
aws apigateway create-resource --rest-api-id <api-id> --parent-id <root-id> --path-part hola --endpoint-url http://localhost:4566
aws apigateway put-method --rest-api-id <api-id> --resource-id <resource-id> --http-method GET --authorization-type NONE --endpoint-url http://localhost:4566
```

**Desglose:**

- "get-resources" lista
- "create-resource" crea
- "put-method" crea el método

**Salida esperada:**

```text
{"id": "resource123", "pathPart": "hola"}
```

**Pregunta de control:**

¿Qué hace este comando y qué salida esperas ver?

## Paso 36: Desplegar la API

**Explicación:** Vamos a desplegar la API para que esté disponible.

**Comando:**

```bash
aws apigateway create-deployment --rest-api-id <api-id> --stage-name prod --endpoint-url http://localhost:4566
```

**Desglose:**

- "create-deployment" despliega

**Salida esperada:**

```text
{"id": "deployment123"}
```

**Pregunta de control:**

¿Qué hace este comando y qué salida esperas ver?

## Paso 37: ¿Qué es IAM?

**Explicación:** IAM controla quién puede hacer qué en AWS.

**Comando:**

No hay comando.

**Desglose:**

- No aplica.

**Salida esperada:**

```text
No aplica.
```

**Pregunta de control:**

Explica este concepto con tus palabras.

## Paso 38: Crear un usuario en IAM

**Explicación:** Vamos a crear un usuario llamado mi-usuario.

**Comando:**

```bash
aws iam create-user --user-name mi-usuario --endpoint-url http://localhost:4566
```

**Desglose:**

- "create-user" crea un usuario

**Salida esperada:**

```text
{"User": {"UserName": "mi-usuario"}}
```

**Pregunta de control:**

¿Qué hace este comando y qué salida esperas ver?

## Paso 39: Crear una política en IAM

**Explicación:** Una política define qué permisos tiene un usuario.

**Comando:**

```bash
aws iam create-policy --policy-name mi-policy --policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Action":"s3:*","Resource":"*"}]}' --endpoint-url http://localhost:4566
```

**Desglose:**

- "create-policy" crea la política

**Salida esperada:**

```text
{"Policy": {"PolicyName": "mi-policy"}}
```

**Pregunta de control:**

¿Qué hace este comando y qué salida esperas ver?

## Paso 40: Asignar la política al usuario

**Explicación:** Vamos a darle los permisos al usuario.

**Comando:**

```bash
aws iam attach-user-policy --user-name mi-usuario --policy-arn arn:aws:iam::000000000000:policy/mi-policy --endpoint-url http://localhost:4566
```

**Desglose:**

- "attach-user-policy" asigna la política

**Salida esperada:**

```text
No hay salida visible.
```

**Pregunta de control:**

¿Qué hace este comando y qué salida esperas ver?

## Paso 41: Proyecto Final - Crear tabla DynamoDB

**Explicación:** Vamos a crear una tabla para nuestro proyecto final.

**Comando:**

```bash
aws dynamodb create-table --table-name proyecto-tareas --attribute-definitions AttributeName=id,AttributeType=S --key-schema AttributeName=id,KeyType=HASH --billing-mode PAY_PER_REQUEST --endpoint-url http://localhost:4566
```

**Desglose:**

- Igual al Paso 22.

**Salida esperada:**

```text
{"TableDescription": {"TableName": "proyecto-tareas"}}
```

**Pregunta de control:**

¿Qué hace este comando y qué salida esperas ver?

## Paso 42: Proyecto Final - Crear Lambda para tareas

**Explicación:** Vamos a crear una Lambda que gestione tareas CRUD.

**Comando:**

```bash
Crear index.js con funciones CRUD y subirlo.
```

**Desglose:**

- Igual al Paso 29.

**Salida esperada:**

```text
{"FunctionName": "tareas-lambda"}
```

**Pregunta de control:**

¿Qué hace este comando y qué salida esperas ver?

## Paso 43: Proyecto Final - Crear API Gateway

**Explicación:** Vamos a exponer la Lambda con API Gateway.

**Comando:**

```bash
Usar comandos de API Gateway para crear endpoints.
```

**Desglose:**

- Igual a Pasos 34-36.

**Salida esperada:**

```text
URL de la API desplegada.
```

**Pregunta de control:**

¿Qué hace este comando y qué salida esperas ver?

## Paso 44: Probar el sistema completo

**Explicación:** Vamos a probar todo el sistema: crear, listar, actualizar y eliminar tareas.

**Comando:**

```bash
Usar curl para probar cada endpoint.
```

**Desglose:**

- Cada comando prueba una función.

**Salida esperada:**

```text
Respuestas de la API.
```

**Pregunta de control:**

¿Qué hace este comando y qué salida esperas ver?

## Paso 45: ¡Felicidades! Has completado el curso

**Explicación:** Has completado el curso. Ahora sabes usar Floci para emular AWS localmente.

**Comando:**

No hay comando.

**Desglose:**

- No aplica.

**Salida esperada:**

```text
No aplica.
```

**Pregunta de control:**

Explica este concepto con tus palabras.
