import { CourseModule, Track, createModule } from './course-module.model';
import { DEVOPS_MODULES } from './tracks/devops.track';
import { JAVASCRIPT_MODULES } from './tracks/javascript.track';
import { NODE_MODULES } from './tracks/node.track';
import { ANGULAR_MODULES } from './tracks/angular.track';
import { REACT_MODULES } from './tracks/react.track';
import { JAVA_MODULES } from './tracks/java.track';
import { SPRING_BOOT_MODULES } from './tracks/spring-boot.track';
import { KOTLIN_MULTIPLATFORM_MODULES } from './tracks/kotlin-multiplatform.track';
import { ANDROID_MODULES } from './tracks/android.track';
import { IOS_MODULES } from './tracks/ios.track';
import { FLUTTER_MODULES } from './tracks/flutter.track';

export type { CourseModule, Track };
export { createModule };

export interface ServiceGroup {
  name: string;
  description: string;
  color: string;
  services: string[];
}

const m = createModule;

export const COURSE_MODULES: CourseModule[] = [
  m(0,
    'Instalación y primeros pasos con cloud local',
    'Primeros pasos',
    'Fundamentos', '1 h', '#137c8b',
    'Instala los tres emuladores de cloud local (AWS, Azure y GCP), levántalos en tu máquina y ejecuta tu primer comando en cada nube sin pagar ni crear cuentas.',
    ['IaaS / PaaS / SaaS', 'Emulador vs nube real', 'Endpoint local', 'Variables de entorno', 'AWS local en 4566 / Azure local en 4577 / GCP local en 4588', 'Virtualización, elasticidad y escalabilidad (vertical vs horizontal)', 'Regiones, Zonas de Disponibilidad y Edge Locations', 'Qué es cloud local: practicar sin cuenta cloud, sin token, sin costo y con bajo riesgo', 'Ecosistema: CLI, dashboard visual, Docker, SDKs oficiales y pruebas de integración locales'],
    [
      'Instala Docker y la CLI del emulador local que usarás en el laboratorio',
      'Inicia AWS local en el puerto 4566 y verifica que el endpoint responda',
      'Configura credenciales ficticias test/test y confirma que AWS CLI apunta a localhost',
      'Inicia Azure local en el puerto 4577 y verifica Blob, Queue o Table Storage',
      'Inicia GCP local en el puerto 4588 y verifica Cloud Storage, Pub/Sub o Firestore',
      'Detén y reinicia cada emulador y comprueba que el estado no persiste por defecto',
    ],
    ['¿Qué diferencia hay entre hablar con AWS real y con cloud local?', '¿Qué cambia cuando una CLI apunta a localhost en vez de la nube real?', '¿Qué ocurre con tus datos cuando detienes el emulador?'],
    ['STS'],
    'Los tres emuladores corriendo simultáneamente. Captura de pantalla de aws sts get-caller-identity.',
    ['aws', 'azure', 'gcp']
  ),

  m(1,
    'Almacenamiento de objetos: S3, Blob Storage y Cloud Storage',
    'Almacenamiento de objetos',
    'Fundamentos', '2 h', '#2f6f9f',
    'Guarda y recupera archivos en AWS S3, Azure Blob Storage y GCP Cloud Storage. Aprende el concepto de "objeto" y por qué los tres proveedores lo llaman diferente pero funcionan igual.',
    ['Bucket / Container', 'Object Key / Blob Name', 'Versionado', 'Metadata', 'Políticas de ciclo de vida'],
    [
      'AWS S3: crea un bucket — aws s3 mb s3://mi-bucket',
      'AWS S3: sube un archivo — aws s3 cp hola.txt s3://mi-bucket/',
      'AWS S3: descarga y verifica — aws s3 cp s3://mi-bucket/hola.txt hola-descargado.txt',
      'AWS S3: lista objetos — aws s3 ls s3://mi-bucket',
      'Azure Blob: carga la cadena de conexión del emulador Azure local y crea un contenedor con az storage container create --name mi-contenedor --connection-string $AZURE_STORAGE_CONNECTION_STRING',
      'Azure Blob: sube un archivo — az storage blob upload --container-name mi-contenedor --name hola.txt --file hola.txt --connection-string $AZURE_STORAGE_CONNECTION_STRING',
      'GCP Cloud Storage: export STORAGE_EMULATOR_HOST=http://localhost:4588 — crea bucket: gcloud storage buckets create gs://mi-bucket',
      'GCP Cloud Storage: sube — gcloud storage cp hola.txt gs://mi-bucket/hola.txt y descarga con gcloud storage cp gs://mi-bucket/hola.txt -',
      'Activa versionado en S3 y sube dos versiones del mismo archivo — verifica con aws s3api list-object-versions --bucket mi-bucket',
    ],
    ['¿Por qué se llama "bucket" en S3 y "container" en Azure si hacen lo mismo?', '¿Qué pasa si subes dos archivos con la misma key en S3 sin versionado?'],
    ['S3'],
    'Script bash o Python que sube el mismo archivo a S3, Azure Blob y GCP Cloud Storage.',
    ['aws', 'azure', 'gcp']
  ),

  m(2,
    'Colas de mensajes: SQS, Service Bus y Pub/Sub',
    'Colas de mensajes',
    'Fundamentos', '2 h 30 min', '#8167a9',
    'Desacopla servicios con colas asíncronas. Entiende por qué un mensaje puede llegar dos veces y cómo construir un consumidor que no tiene efectos duplicados.',
    ['Cola estándar vs FIFO', 'Visibility timeout', 'Dead Letter Queue (DLQ)', 'Long polling', 'At-least-once delivery', 'Idempotencia'],
    [
      'AWS SQS: crea una cola estándar — aws sqs create-queue --queue-name mi-cola',
      'AWS SQS: envía un mensaje — aws sqs send-message --queue-url $(aws sqs get-queue-url --queue-name mi-cola --query QueueUrl --output text) --message-body "Hola cloud local"',
      'AWS SQS: recibe el mensaje — aws sqs receive-message --queue-url ... (observa el ReceiptHandle)',
      'AWS SQS: elimina el mensaje con el ReceiptHandle',
      'AWS SQS: crea una cola FIFO (nombre.fifo) y envía mensajes con MessageGroupId',
      'AWS SQS: configura una DLQ — crea la cola de errores y enlázala a la principal con MaxReceiveCount=2',
      'Azure Service Bus: carga las variables del emulador Azure local y crea una cola: az servicebus queue create --name mi-cola --namespace-name laboratorio-local',
      'GCP Pub/Sub: export PUBSUB_EMULATOR_HOST=localhost:4588 — crea topic y suscripción con gcloud pubsub topics create mi-topic y gcloud pubsub subscriptions create mi-sub --topic mi-topic',
      'GCP Pub/Sub: publica un mensaje — gcloud pubsub topics publish mi-topic --message "Hola GCP" — y lee con gcloud pubsub subscriptions pull mi-sub --auto-ack',
    ],
    ['¿Por qué un mensaje SQS puede llegar dos veces?', '¿Qué diferencia hay entre una cola SQS y un topic SNS?', '¿Cuándo usar FIFO vs estándar?'],
    ['SQS'],
    'Consumidor idempotente en Python o Node.js que procesa mensajes de SQS sin duplicar efectos.',
    ['aws', 'azure', 'gcp']
  ),

  m(3,
    'Bases de datos NoSQL: DynamoDB, Cosmos DB y Firestore',
    'NoSQL',
    'Fundamentos', '3 h', '#e85d4a',
    'Diseña y consulta bases de datos NoSQL. Aprende a modelar desde los patrones de acceso, no desde las entidades, y entiende por qué Scan es el peor enemigo del rendimiento.',
    ['Partition key', 'Sort key', 'Query vs Scan', 'GSI', 'Conditional expression', 'TTL', 'DynamoDB Streams'],
    [
      'Crea una tabla DynamoDB: aws dynamodb create-table --table-name Tareas --attribute-definitions AttributeName=PK,AttributeType=S AttributeName=SK,AttributeType=S --key-schema AttributeName=PK,KeyType=HASH AttributeName=SK,KeyType=RANGE --billing-mode PAY_PER_REQUEST',
      'Inserta un ítem: aws dynamodb put-item --table-name Tareas --item \'{"PK":{"S":"USER#alice"},"SK":{"S":"TAREA#001"},"titulo":{"S":"Aprender DynamoDB"},"estado":{"S":"pendiente"}}\'',
      'Consulta con Query (no Scan): aws dynamodb query --table-name Tareas --key-condition-expression "PK = :pk" --expression-attribute-values \'{"k":{"S":"USER#alice"}}\'',
      'Añade un GSI por estado: aws dynamodb update-table ... y úsalo para listar todas las tareas pendientes',
      'Escribe con condición para evitar duplicados: aws dynamodb put-item --condition-expression "attribute_not_exists(PK)"',
      'Configura TTL: aws dynamodb update-time-to-live --table-name Tareas --time-to-live-specification Enabled=true,AttributeName=expira',
      'GCP Firestore: export FIRESTORE_EMULATOR_HOST=localhost:4588 — crea un documento desde Python con from google.cloud import firestore',
      'Azure Cosmos DB: conéctate con el SDK de Python o Node.js apuntando al emulador Azure local en el puerto 4577',
    ],
    ['¿Por qué Scan es peligroso en DynamoDB?', '¿Cómo decides qué usar como Partition Key?', '¿Cuándo elegir DynamoDB sobre RDS?'],
    ['DynamoDB', 'DynamoDB Streams'],
    'Tabla de tareas con PK por usuario, GSI por estado y consultas sin Scan.',
    ['aws', 'azure', 'gcp']
  ),

  m(4,
    'Secretos y configuración: Secrets Manager, Key Vault y Secret Manager',
    'Secretos',
    'Fundamentos', '2 h', '#bd4b72',
    'Aprende a gestionar secretos, contraseñas y configuración externalizada. Ningún secreto debe estar en tu código fuente ni en variables de entorno hardcodeadas.',
    ['Least privilege', 'KMS / envelope encryption', 'Rotación de secretos', 'SSM Parameter Store vs Secrets Manager', 'AWS Config'],
    [
      'AWS Secrets Manager: crea un secreto — aws secretsmanager create-secret --name /app/db-password --secret-string "mi-password-segura"',
      'Lee el secreto desde la CLI — aws secretsmanager get-secret-value --secret-id /app/db-password --query SecretString --output text',
      'Lee el secreto desde Python: import boto3; client=boto3.client("secretsmanager"); client.get_secret_value(SecretId="/app/db-password")',
      'AWS KMS: crea una clave CMK — aws kms create-key --description "Clave de la app"',
      'Cifra un string con KMS — aws kms encrypt --key-id alias/mi-clave --plaintext fileb://secreto.txt --query CiphertextBlob --output text | base64 -d > secreto.enc',
      'Descifra el string — aws kms decrypt --ciphertext-blob fileb://secreto.enc --query Plaintext --output text | base64 -d',
      'SSM Parameter Store: guarda configuración — aws ssm put-parameter --name /app/api-url --value "http://localhost:4566" --type String',
      'GCP Secret Manager: export SECRETMANAGER_EMULATOR_HOST=localhost:4588 — crea secreto con gcloud secrets create db-password y lee con gcloud secrets versions access latest --secret db-password',
      'Azure Key Vault: carga las variables del emulador Azure local, crea un secreto y léelo con az keyvault secret set/show',
    ],
    ['¿Por qué no debes guardar secretos en variables de entorno?', '¿Qué diferencia hay entre SSM Parameter Store y Secrets Manager?', '¿Qué es envelope encryption?'],
    ['Secrets Manager', 'KMS', 'SSM'],
    'Aplicación que lee todos sus secretos y configuración desde la nube, sin nada hardcodeado.',
    ['aws', 'azure', 'gcp']
  ),

  m(5,
    'Funciones sin servidor: Lambda y Azure Functions',
    'Lambda / Functions',
    'Aplicación', '3 h', '#137c8b',
    'Escribe y despliega funciones que se ejecutan sin gestionar servidores. Lambda en AWS local ejecuta código en contenedores Docker. Azure Functions local practica HTTP y Timer triggers.',
    ['Handler function', 'Event payload', 'Context', 'Cold start', 'Concurrencia reservada', 'Lambda Layers'],
    [
      'Escribe una función Python: crea handler.py con def handler(event, context): return {"statusCode": 200, "body": "Hola cloud local"}',
      'Empaqueta la función: zip function.zip handler.py',
      'Despliega en cloud local: aws lambda create-function --function-name mi-funcion --runtime python3.12 --handler handler.handler --role arn:aws:iam::000000000000:role/lambda-role --zip-file fileb://function.zip',
      'Invoca la función: aws lambda invoke --function-name mi-funcion output.json && cat output.json',
      'Ve los logs: aws logs filter-log-events --log-group-name /aws/lambda/mi-funcion',
      'Actualiza el código: zip function.zip handler.py && aws lambda update-function-code --function-name mi-funcion --zip-file fileb://function.zip',
      'Azure Functions local: crea un archivo function.json con type "httpTrigger" y despliega apuntando a http://localhost:4577',
      'Configura una variable de entorno en Lambda: aws lambda update-function-configuration --function-name mi-funcion --environment Variables={TABLA=Tareas}',
      'Fuerza un cold start y observa la latencia — configura concurrencia reservada: aws lambda put-function-concurrency --function-name mi-funcion --reserved-concurrent-executions 5',
    ],
    ['¿Qué recibe el parámetro event en una Lambda?', '¿Qué es un cold start y cómo afecta a la latencia?', '¿Por qué Lambda no tiene estado entre invocaciones?'],
    ['Lambda', 'CloudWatch'],
    'Función Lambda en Python que lee de SQS, escribe en DynamoDB y loguea con correlation ID.',
    ['aws', 'azure']
  ),

  m(6,
    'API REST con API Gateway',
    'API Gateway',
    'Aplicación', '3 h', '#e9a23b',
    'Expón tus funciones Lambda como endpoints HTTP seguros. Aprende la diferencia entre REST API (v1) y HTTP API (v2) y cuándo usar cada uno.',
    ['REST API vs HTTP API', 'Stage', 'Deployment', 'Proxy integration', 'Path parameters', 'CORS', 'Authorizer'],
    [
      'Crea un REST API: aws apigateway create-rest-api --name "API Tareas"',
      'Obtén el root resource: aws apigateway get-resources --rest-api-id <id> --query "items[0].id" --output text',
      'Crea un recurso /tareas: aws apigateway create-resource --rest-api-id <id> --parent-id <root-id> --path-part tareas',
      'Crea el método POST: aws apigateway put-method --rest-api-id <id> --resource-id <resource-id> --http-method POST --authorization-type NONE',
      'Conecta a Lambda con integración proxy: aws apigateway put-integration --rest-api-id <id> --resource-id <resource-id> --http-method POST --type AWS_PROXY --integration-http-method POST --uri arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/arn:aws:lambda:us-east-1:000000000000:function:mi-funcion/invocations',
      'Despliega el API: aws apigateway create-deployment --rest-api-id <id> --stage-name dev',
      'Invoca con curl: curl -X POST http://localhost:4566/restapis/<id>/dev/_user_request_/tareas -d \'{"titulo":"Mi primera tarea"}\'',
      'Crea un HTTP API (v2): aws apigatewayv2 create-api --name "HTTP API" --protocol-type HTTP -- el endpoint es más simple y la latencia menor',
      'Compara tiempos de respuesta entre REST API y HTTP API invocando ambos endpoints',
    ],
    ['¿Cuál es la diferencia principal entre REST API (v1) y HTTP API (v2)?', '¿Qué hace una "proxy integration" que no hace una integración normal?', '¿Por qué necesitas un "deployment" para que los cambios sean visibles?'],
    ['API Gateway v1', 'API Gateway v2', 'Lambda'],
    'API HTTP funcional con GET /tareas y POST /tareas conectados a Lambda y DynamoDB.',
    ['aws']
  ),

  m(7,
    'Mensajería Pub/Sub: SNS, EventBridge y Azure Event Hubs',
    'SNS / EventBridge',
    'Aplicación', '3 h 30 min', '#8167a9',
    'Distribuye eventos a múltiples consumidores simultáneamente. Aprende el patrón fan-out y cuándo usar SNS vs EventBridge vs SQS.',
    ['Fan-out pattern', 'Topic SNS', 'Event Bus', 'Event Rule', 'Filtros de contenido', 'AMQP', 'Scheduler'],
    [
      'Crea un topic SNS: aws sns create-topic --name mis-alertas',
      'Suscribe una cola SQS al topic: aws sns subscribe --topic-arn arn:aws:sns:us-east-1:000000000000:mis-alertas --protocol sqs --notification-endpoint arn:aws:sqs:us-east-1:000000000000:mi-cola',
      'Publica un mensaje en el topic y verifica que llega a la cola SQS: aws sns publish --topic-arn ... --message "Alerta importante"',
      'Crea un Event Bus personalizado en EventBridge: aws events create-event-bus --name mi-bus',
      'Crea una regla EventBridge que dispara una Lambda: aws events put-rule --name ReglaEjemplo --event-bus-name mi-bus --event-pattern \'{"source":["mi.app"]}\'',
      'Envía un evento al bus: aws events put-events --entries \'[{"Source":"mi.app","DetailType":"TareaCreada","Detail":"{\"id\":\"001\"}","EventBusName":"mi-bus"}]\'',
      'Configura EventBridge Scheduler para ejecutar cada minuto: aws scheduler create-schedule --name cada-minuto --schedule-expression "rate(1 minute)" --target ...',
      'Azure Event Hubs local: carga variables del emulador Azure, crea un Event Hub namespace y envía eventos por AMQP en puerto 5672',
    ],
    ['¿Cuándo usar SNS y cuándo usar EventBridge?', '¿Qué es el patrón fan-out y cuándo lo necesitas?', '¿Por qué SQS + SNS juntos son más robustos que SNS solo?'],
    ['SNS', 'EventBridge', 'Scheduler'],
    'Sistema de notificaciones que distribuye alertas por SNS a múltiples destinos.',
    ['aws', 'azure']
  ),

  m(8,
    'Observabilidad con CloudWatch: logs, métricas y alarmas',
    'CloudWatch',
    'Aplicación', '2 h 30 min', '#2f6f9f',
    'Sin observabilidad no puedes diagnosticar problemas en producción. Aprende a centralizar logs, crear métricas desde ellos y configurar alarmas antes de que los usuarios noten el fallo.',
    ['Log group', 'Log stream', 'Metric filter', 'Alarm', 'Correlation ID', 'Dashboard', 'X-Ray trace'],
    [
      'Crea un log group: aws logs create-log-group --log-group-name /mi-app/backend',
      'Crea un log stream y envía logs: aws logs create-log-stream --log-group-name /mi-app/backend --log-stream-name app-001 && aws logs put-log-events --log-group-name /mi-app/backend --log-stream-name app-001 --log-events \'[{"timestamp":\'$(date +%s%3N)\',message:"ERROR request_id=abc tarea_id=001 msg=fallo"}]\'',
      'Filtra logs para extraer errores: aws logs filter-log-events --log-group-name /mi-app/backend --filter-pattern "ERROR"',
      'Crea un metric filter que cuenta errores: aws logs put-metric-filter --log-group-name /mi-app/backend --filter-name ContarErrores --filter-pattern "ERROR" --metric-transformations metricName=Errores,metricNamespace=MiApp,metricValue=1',
      'Crea una alarma que se activa con más de 5 errores: aws cloudwatch put-metric-alarm --alarm-name MuchosErrores --metric-name Errores --namespace MiApp --statistic Sum --period 60 --threshold 5 --comparison-operator GreaterThanThreshold --evaluation-periods 1',
      'Añade un correlation ID a tu Lambda: import uuid; correlation_id = str(uuid.uuid4()); logging.info(f"correlation_id={correlation_id} accion=procesar_tarea")',
      'Ve los logs de Lambda en tiempo real: aws logs tail /aws/lambda/mi-funcion --follow',
      'Crea un Dashboard con las métricas clave de tu API',
    ],
    ['¿Qué es un metric filter y por qué es más barato que métricas custom?', '¿Por qué el correlation ID es esencial para diagnosticar problemas?', '¿Cómo encuentras la causa de un error sin adivinar?'],
    ['CloudWatch'],
    'Dashboard de CloudWatch con logs, métricas de errores y alarma configurada.',
    ['aws']
  ),

  m(9,
    'Bases de datos relacionales con RDS (PostgreSQL real)',
    'RDS',
    'Integración', '3 h', '#e85d4a',
    'cloud local corre PostgreSQL real cuando creas una instancia RDS. La única diferencia con AWS real es el endpoint. Aprende cuándo elegir SQL sobre NoSQL.',
    ['RDS Instance', 'Parameter group', 'Snapshot y restore', 'IAM Authentication', 'Connection string', 'Migrations'],
    [
      'Crea una instancia RDS PostgreSQL: aws rds create-db-instance --db-instance-identifier mi-postgres --db-instance-class db.t3.micro --engine postgres --master-username admin --master-user-password admin123 --allocated-storage 20',
      'Espera a que esté disponible: aws rds wait db-instance-available --db-instance-identifier mi-postgres',
      'Obtén el endpoint: aws rds describe-db-instances --db-instance-identifier mi-postgres --query "DBInstances[0].Endpoint"',
      'Conéctate con psql: psql -h localhost -p <puerto> -U admin -d postgres',
      'Crea tabla e inserta datos: CREATE TABLE tareas (id SERIAL PRIMARY KEY, titulo TEXT, estado TEXT); INSERT INTO tareas (titulo, estado) VALUES (\'Mi tarea\', \'pendiente\');',
      'Toma un snapshot: aws rds create-db-snapshot --db-instance-identifier mi-postgres --db-snapshot-identifier snap-001',
      'Restaura desde snapshot: aws rds restore-db-instance-from-db-snapshot --db-instance-identifier mi-postgres-2 --db-snapshot-identifier snap-001',
      'Conéctate desde Python: import psycopg2; conn = psycopg2.connect(host="localhost", port=<puerto>, user="admin", password="admin123", dbname="postgres")',
    ],
    ['¿Cuándo elegir DynamoDB sobre RDS y viceversa?', '¿Qué diferencia hay entre una instancia RDS en cloud local y un PostgreSQL en Docker simple?', '¿Qué es una migration y por qué es importante?'],
    ['RDS'],
    'API que usa RDS PostgreSQL como backend, con migraciones de esquema ejecutadas automáticamente.',
    ['aws']
  ),

  m(10,
    'Contenedores: ECR, ECS y comparación con Cloud Run',
    'ECR / ECS',
    'Integración', '4 h', '#137c8b',
    'Empaqueta tu aplicación en una imagen Docker, publícala en ECR y ejecútala en ECS. cloud local corre contenedores Docker reales.',
    ['OCI image', 'ECR Repository', 'Task Definition', 'ECS Cluster', 'Fargate vs EC2 mode', 'Service Discovery'],
    [
      'Construye tu imagen Docker: docker build -t mi-api:latest .',
      'Crea un repositorio ECR en cloud local: aws ecr create-repository --repository-name mi-api',
      'Autentica Docker con ECR: aws ecr get-login-password | docker login --username AWS --password-stdin localhost:4566',
      'Etiqueta y empuja la imagen: docker tag mi-api:latest localhost:4566/mi-api:latest && docker push localhost:4566/mi-api:latest',
      'Registra un Task Definition: aws ecs register-task-definition --family mi-api-task --container-definitions \'[{"name":"mi-api","image":"localhost:4566/mi-api:latest","portMappings":[{"containerPort":3000}]}]\'',
      'Crea un cluster ECS: aws ecs create-cluster --cluster-name mi-cluster',
      'Ejecuta un task: aws ecs run-task --cluster mi-cluster --task-definition mi-api-task',
      'Verifica los contenedores corriendo: docker ps | grep mi-api',
      'EKS real (cloud local): aws eks create-cluster --name dev-cluster --role-arn arn:aws:iam::000000000000:role/eks-role && aws eks update-kubeconfig --name dev-cluster && kubectl run nginx --image=nginx:alpine',
    ],
    ['¿Por qué necesitas ECR si tienes Docker Hub?', '¿Qué diferencia hay entre ECS y EKS?', '¿Cuándo usar contenedores sobre Lambda?'],
    ['ECR', 'ECS', 'EKS'],
    'Imagen Docker publicada en ECR y ejecutándose como task en ECS.',
    ['aws']
  ),

  m(11,
    'Infraestructura como código con CloudFormation',
    'CloudFormation / IaC',
    'Integración', '3 h', '#bd4b72',
    'Define toda tu infraestructura en archivos YAML versionables. Crea, actualiza y destruye recursos con un solo comando sin tocar la consola.',
    ['Stack', 'Template', 'Resource', 'Parameter', 'Output', 'Change set', 'Drift detection', 'Terraform y OpenTofu como alternativa multi-nube (HCL, plan/apply, state)', 'AWS CDK: infraestructura como código real (TypeScript/Python)', 'Compatibilidad de cloud local con AWS CLI v2, SDK v2/v3, boto3, Go, Rust y Terraform'],
    [
      'Escribe un template stack-basico.yaml que define un bucket S3 + una cola SQS + una tabla DynamoDB con Resources y Outputs',
      'Despliega el stack: aws cloudformation deploy --template-file stack-basico.yaml --stack-name mi-stack',
      'Verifica los recursos creados: aws cloudformation describe-stack-resources --stack-name mi-stack',
      'Modifica el template (añade un parámetro) y crea un change set: aws cloudformation create-change-set --stack-name mi-stack --template-body file://stack-basico.yaml --change-set-name cambio-001',
      'Revisa el change set antes de aplicar: aws cloudformation describe-change-set --stack-name mi-stack --change-set-name cambio-001',
      'Aplica el change set: aws cloudformation execute-change-set --stack-name mi-stack --change-set-name cambio-001',
      'Destruye el stack completo: aws cloudformation delete-stack --stack-name mi-stack — verifica que los recursos desaparecieron',
      'Compara con Terraform: la sintaxis es diferente pero el concepto de estado deseado es igual',
    ],
    ['¿Qué ventaja tiene CloudFormation frente a crear recursos con la CLI a mano?', '¿Por qué revisar un change set antes de aplicarlo?', '¿Qué es drift detection?'],
    ['CloudFormation'],
    'Stack YAML que despliega S3 + SQS + DynamoDB + Lambda con un solo aws cloudformation deploy.',
    ['aws']
  ),

  m(12,
    'Orquestación de flujos con Step Functions',
    'Step Functions',
    'Integración', '3 h', '#e9a23b',
    'Coordina múltiples servicios en flujos complejos con lógica condicional, reintentos automáticos y manejo de errores declarativo.',
    ['State machine', 'Task state', 'Choice state', 'Retry / Catch', 'Express vs Standard', 'Parallel state'],
    [
      'Escribe una state machine en JSON/YAML con estados: ValidarTarea → GuardarEnDynamoDB → EnviarNotificacion (SNS)',
      'Crea la state machine en cloud local: aws stepfunctions create-state-machine --name FlujoTareas --definition file://maquina.json --role-arn arn:aws:iam::000000000000:role/sfn-role',
      'Inicia una ejecución: aws stepfunctions start-execution --state-machine-arn arn:aws:states:us-east-1:000000000000:stateMachine:FlujoTareas --input \'{"tarea":"001"}\'',
      'Observa la ejecución: aws stepfunctions describe-execution --execution-arn <arn>',
      'Añade un Choice state que enruta según el tipo de tarea (urgente vs normal)',
      'Configura Retry: "Retry":[{"ErrorEquals":["States.TaskFailed"],"IntervalSeconds":2,"MaxAttempts":3,"BackoffRate":2}]',
      'Configura Catch: "Catch":[{"ErrorEquals":["States.ALL"],"Next":"EstadoDeError"}]',
      'Compara con AWS EventBridge Pipes que conecta directamente SQS → Lambda sin Step Functions',
    ],
    ['¿Cuándo usar Step Functions y cuándo es suficiente con EventBridge Pipes?', '¿Qué diferencia hay entre orquestación y coreografía de servicios?', '¿Cuándo usar Express vs Standard workflows?'],
    ['Step Functions', 'Lambda', 'SNS'],
    'Flujo de procesamiento de tareas con validación, guardado, notificación y manejo de errores.',
    ['aws']
  ),

  m(13,
    'Streaming: Kinesis, MSK (Kafka) y Pub/Sub avanzado',
    'Kinesis / MSK / Kafka',
    'Experto', '4 h', '#8167a9',
    'Procesa flujos de millones de eventos por segundo. Aprende la diferencia entre colas (SQS) y streams (Kinesis/Kafka) y cuándo cada uno es la herramienta correcta.',
    ['Shard', 'Partition key', 'Consumer group', 'Offset', 'Retention period', 'Compaction', 'Backpressure'],
    [
      'AWS Kinesis: crea un data stream con 2 shards: aws kinesis create-stream --stream-name mi-stream --shard-count 2',
      'Produce registros: aws kinesis put-record --stream-name mi-stream --partition-key user-001 --data $(echo -n "evento-1" | base64)',
      'Obtén los registros: aws kinesis get-shard-iterator --stream-name mi-stream --shard-id shardId-000000000000 --shard-iterator-type TRIM_HORIZON y luego aws kinesis get-records --shard-iterator <iterator>',
      'AWS MSK: crea un cluster Kafka: aws kafka create-cluster --cluster-name mi-kafka --broker-node-group-info \'{"InstanceType":"kafka.m5.large","BrokerAZDistribution":"DEFAULT","ClientSubnets":["subnet-00000000"]}\' --number-of-broker-nodes 1 --kafka-version "3.5.1"',
      'Produce y consume mensajes con kafka-console-producer y kafka-console-consumer apuntando al endpoint del broker MSK en cloud local',
      'GCP Managed Kafka local: levanta el emulador y conéctate al broker en localhost:4588 con kafka-console-producer.sh',
      'Compara: Kinesis retiene hasta 7 días, SQS hasta 14 días. Kinesis mantiene orden por shard, SQS por FIFO queue.',
      'Crea un consumidor que mantiene su posición (offset) en Kafka para poder leer desde donde se quedó',
    ],
    ['¿Cuándo usar Kinesis sobre SQS?', '¿Qué es un consumer group en Kafka y por qué existe?', '¿Qué diferencia hay entre Kinesis Data Streams y Kinesis Data Firehose?'],
    ['Kinesis', 'MSK'],
    'Pipeline de streaming que ingiere eventos de Kinesis, los procesa con Lambda y los almacena en S3.',
    ['aws', 'gcp']
  ),

  m(14,
    'Autenticación de usuarios con Cognito',
    'Cognito / Auth',
    'Experto', '3 h', '#2f6f9f',
    'Implementa registro, login y autorización de usuarios sin construir tu propio sistema de autenticación. Cognito en cloud local soporta flujos OAuth 2.0 completos.',
    ['User Pool', 'App Client', 'JWT (Access / ID / Refresh token)', 'OAuth 2.0', 'PKCE', 'Grupos y atributos'],
    [
      'Crea un User Pool: aws cognito-idp create-user-pool --pool-name MiApp --auto-verified-attributes email',
      'Crea un App Client: aws cognito-idp create-user-pool-client --user-pool-id <pool-id> --client-name web-client --no-generate-secret',
      'Registra un usuario: aws cognito-idp sign-up --client-id <client-id> --username alice@ejemplo.com --password "Segura123!" --user-attributes Name=email,Value=alice@ejemplo.com',
      'Confirma el usuario (cloud local lo confirma automáticamente o usa admin-confirm): aws cognito-idp admin-confirm-sign-up --user-pool-id <pool-id> --username alice@ejemplo.com',
      'Inicia sesión y obtén tokens JWT: aws cognito-idp initiate-auth --client-id <client-id> --auth-flow USER_PASSWORD_AUTH --auth-parameters USERNAME=alice@ejemplo.com,PASSWORD="Segura123!"',
      'Decodifica el JWT (base64 del payload) y observa los claims: sub, email, cognito:groups',
      'Crea un grupo y añade al usuario: aws cognito-idp create-group --group-name admins --user-pool-id <pool-id> && aws cognito-idp admin-add-user-to-group --user-pool-id <pool-id> --username alice@ejemplo.com --group-name admins',
      'Protege tu API Gateway con un Cognito Authorizer: aws apigateway create-authorizer --rest-api-id <id> --name CognitoAuth --type COGNITO_USER_POOLS --provider-arns <pool-arn>',
    ],
    ['¿Qué diferencia hay entre Access Token, ID Token y Refresh Token?', '¿Por qué NO debes construir tu propio sistema de autenticación?', '¿Qué es el flujo PKCE y para qué sirve?'],
    ['Cognito', 'API Gateway v2', 'Lambda'],
    'API REST protegida con Cognito Authorizer donde solo usuarios autenticados pueden crear tareas.',
    ['aws']
  ),

  m(15,
    'Analítica de datos con Athena y Glue',
    'Athena / BigQuery',
    'Experto', '3 h', '#e85d4a',
    'Consulta terabytes de datos en S3 con SQL sin moverlos ni cargarlos en una base de datos. Athena en cloud local usa DuckDB como motor real.',
    ['Data lake', 'Parquet vs CSV', 'Glue Catalog', 'Glue Crawler', 'Athena Workgroup', 'Partition pruning', 'Compresión'],
    [
      'Prepara datos: crea un archivo orders.json con 100 registros y súbelo a S3: aws s3 cp orders.json s3://analytics-bucket/pedidos/2024/01/',
      'Crea una base de datos en Glue Catalog: aws glue create-database --database-input \'{"Name":"tienda"}\'',
      'Crea una tabla Glue apuntando a S3: aws glue create-table --database-name tienda --table-input \'{"Name":"pedidos","StorageDescriptor":{...},"PartitionKeys":[{"Name":"año","Type":"string"}]}\'',
      'Ejecuta un Glue Crawler para descubrir el esquema automáticamente: aws glue create-crawler --name crawler-pedidos --role arn:aws:iam::000000000000:role/glue-role --targets \'{"S3Targets":[{"Path":"s3://analytics-bucket/pedidos"}]}\' --database-name tienda && aws glue start-crawler --name crawler-pedidos',
      'Ejecuta SQL con Athena: QUERY_ID=$(aws athena start-query-execution --query-string "SELECT cliente, SUM(monto) as total FROM tienda.pedidos GROUP BY cliente ORDER BY total DESC" --result-configuration OutputLocation=s3://analytics-bucket/resultados/ --query QueryExecutionId --output text)',
      'Espera y lee resultados: aws athena get-query-results --query-execution-id $QUERY_ID',
      'Compara rendimiento JSON vs Parquet — convierte a Parquet y observa la diferencia en bytes escaneados',
      'Añade particiones por fecha y compara costo de query con y sin partition pruning',
    ],
    ['¿Qué diferencia hay entre un data lake y un data warehouse?', '¿Por qué Parquet es 10x más eficiente que CSV para analítica?', '¿Cómo reduces el costo de Athena con particiones?'],
    ['Athena', 'Glue', 'S3'],
    'Query SQL que analiza 100k registros en S3 y devuelve el top 10 de clientes en menos de 1 segundo.',
    ['aws']
  ),

  m(16,
    'IA y servicios especializados: Bedrock, Textract y Transcribe',
    'Bedrock / IA',
    'Experto', '2 h 30 min', '#137c8b',
    'Integra modelos de IA generativa y procesamiento de documentos. cloud local emula Bedrock con stubs deterministas — aprende a probar contratos de IA sin depender de un modelo real.',
    ['Bedrock Runtime', 'InvokeModel API', 'Textract (OCR)', 'Transcribe (STT)', 'Stub vs Mock', 'Prompt engineering', 'Token limits'],
    [
      'AWS Bedrock Runtime: invoca un modelo — aws bedrock-runtime invoke-model --model-id anthropic.claude-3-sonnet-20240229-v1:0 --body \'{"prompt":"Hola","max_tokens":100}\' --cli-binary-format raw-in-base64-out output.json && cat output.json',
      'Observa que cloud local devuelve una respuesta stub determinista (misma respuesta para mismo input)',
      'AWS Textract: sube una imagen con texto a S3, luego extrae el texto: aws textract analyze-document --document \'{"S3Object":{"Bucket":"mi-bucket","Name":"documento.jpg"}}\' --feature-types TABLES FORMS',
      'AWS Transcribe: sube un audio MP3 a S3, inicia transcripción: aws transcribe start-transcription-job --transcription-job-name mi-transcripcion --media \'{"MediaFileUri":"s3://mi-bucket/audio.mp3"}\' --output-bucket-name mi-bucket',
      'Espera el resultado: aws transcribe get-transcription-job --transcription-job-name mi-transcripcion',
      'Escribe una prueba de contrato para el stub de Bedrock: verifica la estructura del response sin verificar el contenido exacto',
      'Compara: Bedrock Runtime (AWS) = Azure OpenAI Service (Azure) = Vertex AI / Gemini API (GCP)',
      'Documenta qué partes de tu arquitectura de IA debes probar contra AWS real y cuáles el stub cubre suficientemente',
    ],
    ['¿Qué diferencia hay entre un stub y un mock?', '¿Qué contratos puedes probar localmente y cuáles necesitan el modelo real?', '¿Por qué cloud local usa stubs deterministas para IA en vez de modelos reales?'],
    ['Bedrock Runtime', 'Textract', 'Transcribe'],
    'API que procesa documentos con Textract, guarda el texto en DynamoDB y genera un resumen con Bedrock.',
    ['aws']
  ),

  m(17,
    'Proyecto integrador: API multi-nube con AWS, Azure y GCP',
    'Proyecto final',
    'Experto', '8 h', '#bd4b72',
    'Construye la misma API "Gestor de Tareas" tres veces: una en AWS local, una en Azure local y una en GCP local. Compara las diferencias y demuestra portabilidad de conocimiento.',
    ['Arquitectura multi-nube', 'Portabilidad', 'Feature parity', 'Interoperabilidad', 'CI local', 'Documentación de diferencias', 'Arquitectura interna de cloud local: GraalVM, arranque en ~24ms, "real engines, not mocks"', 'cloud local en CI/CD: pruebas de integración sin coste, integración con Testcontainers', 'Migración desde LocalStack, Azurite o gcloud emulators a un único endpoint cloud local', 'Persistencia de estado entre reinicios (ECS, CodeBuild, Config) y límites: emulador para desarrollo, no para producción'],
    [
      'AWS: implementa GET /tareas y POST /tareas usando Lambda + API Gateway + DynamoDB + SQS + S3 + CloudWatch',
      'AWS: añade autenticación con Cognito y despliega toda la infraestructura con CloudFormation',
      'Azure: implementa la misma API en Azure Functions + Service Bus + Cosmos DB + Blob Storage local',
      'Azure: carga variables del emulador Azure local y usa az CLI para crear todos los recursos',
      'GCP: implementa los endpoints de solo lectura usando Firestore + Cloud Storage + Pub/Sub local',
      'GCP: usa FIRESTORE_EMULATOR_HOST y PUBSUB_EMULATOR_HOST con el SDK de Python',
      'Escribe pruebas de integración que corren contra los tres emuladores y verifican el comportamiento',
      'Documenta en una tabla: para cada componente, qué fue igual en los 3 proveedores y qué fue diferente',
      'Demuestra que puedes levantar toda la arquitectura AWS + Azure + GCP con un solo docker compose up',
    ],
    ['¿Qué aprendiste en AWS que aplica directamente en Azure y GCP?', '¿Qué fue fundamentalmente diferente entre los 3 proveedores?', '¿Qué quedaría pendiente para pasar a producción en nube real?'],
    ['Lambda', 'API Gateway v2', 'DynamoDB', 'SQS', 'S3', 'CloudWatch', 'CloudFormation', 'Cognito'],
    'API completa con los mismos endpoints funcionando en AWS local, Azure local y GCP local.',
    ['aws', 'azure', 'gcp']
  ),
];

export const SERVICE_GROUPS: ServiceGroup[] = [
  { name: 'Identidad y seguridad', color: '#bd4b72', description: 'Gestiona acceso, secretos, cifrado y autenticación.', services: ['IAM', 'STS', 'KMS', 'Cognito', 'Secrets Manager', 'SSM', 'ACM', 'AWS Config'] },
  { name: 'Almacenamiento y bases de datos', color: '#2f6f9f', description: 'Persiste objetos, documentos, relaciones e índices.', services: ['S3', 'DynamoDB', 'DynamoDB Streams', 'RDS', 'ElastiCache', 'Neptune', 'OpenSearch', 'AWS Backup'] },
  { name: 'Mensajería y eventos', color: '#8167a9', description: 'Desacopla, enruta, programa y transmite.', services: ['SQS', 'SNS', 'EventBridge', 'Scheduler', 'EventBridge Pipes', 'Kinesis', 'Firehose', 'MSK'] },
  { name: 'Cómputo y contenedores', color: '#e85d4a', description: 'Ejecuta código, contenedores y máquinas virtuales.', services: ['Lambda', 'ECS', 'EKS', 'EC2', 'ECR', 'Auto Scaling', 'CodeBuild', 'CodeDeploy'] },
  { name: 'API y orquestación', color: '#137c8b', description: 'Expón, enruta y coordina servicios.', services: ['API Gateway v1', 'API Gateway v2', 'Step Functions', 'AppSync', 'AppConfig', 'AppConfigData', 'EventBridge Pipes'] },
  { name: 'Red y distribución', color: '#4f7a5d', description: 'Gestiona tráfico, DNS y distribución de contenido.', services: ['CloudFront', 'Route53', 'ELB v2', 'Transfer Family'] },
  { name: 'Analítica, IA y observabilidad', color: '#e9a23b', description: 'Cataloga, consulta, procesa y observa a escala.', services: ['CloudWatch', 'CloudFormation', 'Athena', 'Glue', 'Bedrock Runtime', 'Textract', 'Transcribe', 'SES', 'Pricing', 'Cost Explorer', 'CUR'] },
];

export const QUIZ = [
  { question: '¿Qué variable de entorno evita repetir --endpoint-url en cada comando aws CLI?', options: ['AWS_ENDPOINT_URL', 'FLOCI_HOSTNAME', 'AWS_ACCOUNT_ID'], answer: 0 },
  { question: '¿Qué permite procesar un mensaje dos veces sin duplicar efectos en tu sistema?', options: ['Una espera fija con sleep', 'Idempotencia en el consumidor', 'Usar siempre una cola FIFO'], answer: 1 },
  { question: '¿Qué operación de DynamoDB evita recorrer TODOS los elementos de la tabla?', options: ['Scan con FilterExpression', 'Query con clave de partición', 'ListTables'], answer: 1 },
  { question: '¿En qué puerto escucha el emulador de Azure local?', options: ['4566', '4577', '4588'], answer: 1 },
  { question: '¿Qué prueba sigue siendo necesaria después de validar todo con cloud local?', options: ['Ninguna, cloud local es idéntico a AWS', 'Prueba final contra la nube real', 'Solo linting del código'], answer: 1 }
];

// ── Multi-cloud comparison ───────────────────────────────────────────────────

export interface CloudComparison {
  categoria: string;
  descripcion: string;
  aws: string;
  azure: string;
  gcp: string;
  modulo: number;
}

export interface AltCloudGroup {
  nombre: string;
  descripcion: string;
  color: string;
  servicios: string[];
}

export const CLOUD_COMPARISON: CloudComparison[] = [
  { categoria: 'Almacenamiento de objetos', descripcion: 'Guarda archivos, imágenes y backups sin gestionar servidores.', aws: 'S3 (puerto 4566)', azure: 'Blob Storage (puerto 4577)', gcp: 'Cloud Storage (puerto 4588)', modulo: 1 },
  { categoria: 'Colas de mensajes', descripcion: 'Desacopla productores y consumidores con entrega garantizada.', aws: 'SQS', azure: 'Service Bus Queues (AMQP 5673)', gcp: 'Pub/Sub + Cloud Tasks', modulo: 2 },
  { categoria: 'Base de datos NoSQL', descripcion: 'Clave-valor y documentos con escala automática.', aws: 'DynamoDB', azure: 'Cosmos DB', gcp: 'Firestore / Datastore', modulo: 3 },
  { categoria: 'Secretos y credenciales', descripcion: 'Almacena y rota contraseñas, API keys y certificados.', aws: 'Secrets Manager + KMS', azure: 'Key Vault (puerto 4577)', gcp: 'Secret Manager (puerto 4588)', modulo: 4 },
  { categoria: 'Cómputo serverless', descripcion: 'Ejecuta código sin aprovisionar servidores.', aws: 'Lambda (Docker real en cloud local)', azure: 'Azure Functions (HTTP + Timer)', gcp: 'Cloud Functions / Cloud Run', modulo: 5 },
  { categoria: 'API HTTP / REST', descripcion: 'Expone funciones como endpoints HTTP seguros.', aws: 'API Gateway v1 y v2', azure: 'API Management', gcp: 'Cloud Endpoints', modulo: 6 },
  { categoria: 'Notificaciones push (fan-out)', descripcion: 'Distribuye mensajes a múltiples suscriptores a la vez.', aws: 'SNS', azure: 'Event Grid', gcp: 'Pub/Sub Topics', modulo: 7 },
  { categoria: 'Bus de eventos de dominio', descripcion: 'Enruta eventos con filtros y transformaciones declarativas.', aws: 'EventBridge', azure: 'Event Hubs (AMQP 5672)', gcp: 'Eventarc', modulo: 7 },
  { categoria: 'Streaming en tiempo real', descripcion: 'Procesa flujos de datos con múltiples consumidores paralelos.', aws: 'Kinesis + MSK (Kafka real)', azure: 'Event Hubs + Kafka', gcp: 'Pub/Sub + Managed Kafka', modulo: 13 },
  { categoria: 'Observabilidad y logs', descripcion: 'Logs, métricas y alarmas de toda la arquitectura.', aws: 'CloudWatch', azure: 'Azure Monitor', gcp: 'Cloud Monitoring + Logging', modulo: 8 },
  { categoria: 'Base de datos relacional', descripcion: 'PostgreSQL/MySQL gestionado con backups automáticos.', aws: 'RDS (PostgreSQL real en cloud local)', azure: 'Azure SQL / PostgreSQL Flexible', gcp: 'Cloud SQL / AlloyDB', modulo: 9 },
  { categoria: 'Contenedores gestionados', descripcion: 'Corre contenedores con orquestación sin gestionar nodos.', aws: 'ECS / EKS (Docker real en cloud local)', azure: 'AKS / Container Apps', gcp: 'GKE Autopilot / Cloud Run', modulo: 10 },
  { categoria: 'Infraestructura como código', descripcion: 'Describe y versiona tu infraestructura en archivos de texto.', aws: 'CloudFormation', azure: 'Bicep / ARM Templates', gcp: 'Deployment Manager / Terraform', modulo: 11 },
  { categoria: 'Orquestación de flujos', descripcion: 'Coordina pasos con lógica condicional y reintentos.', aws: 'Step Functions', azure: 'Logic Apps / Durable Functions', gcp: 'Workflows', modulo: 12 },
  { categoria: 'Autenticación de usuarios', descripcion: 'Registro, login y sesiones para usuarios finales.', aws: 'Cognito (OAuth 2.0 real)', azure: 'Entra ID B2C', gcp: 'Identity Platform', modulo: 14 },
  { categoria: 'Consultas SQL analíticas', descripcion: 'SQL sobre datos en object storage sin moverlos.', aws: 'Athena (DuckDB en cloud local)', azure: 'Synapse Serverless', gcp: 'BigQuery', modulo: 15 },
  { categoria: 'ETL y catálogo de datos', descripcion: 'Descubre, transforma y prepara datos para analítica.', aws: 'Glue Catalog + Crawler', azure: 'Data Factory', gcp: 'Dataflow / Data Catalog', modulo: 15 },
  { categoria: 'IA generativa (LLMs)', descripcion: 'Accede a modelos de lenguaje grande con API REST.', aws: 'Bedrock Runtime (stub en cloud local)', azure: 'Azure OpenAI Service', gcp: 'Vertex AI / Gemini API', modulo: 16 },
  { categoria: 'OCR / Extracción de documentos', descripcion: 'Extrae texto y datos de imágenes y PDFs.', aws: 'Textract (cloud local)', azure: 'Document Intelligence', gcp: 'Document AI', modulo: 16 },
  { categoria: 'Registro de imágenes Docker', descripcion: 'Almacena y versiona imágenes de contenedor privadas.', aws: 'ECR (cloud local)', azure: 'Container Registry', gcp: 'Artifact Registry', modulo: 10 },
  { categoria: 'Caché en memoria', descripcion: 'Acelera lecturas con Redis real gestionado.', aws: 'ElastiCache (Redis real en cloud local)', azure: 'Azure Cache for Redis', gcp: 'Memorystore', modulo: 9 },
  { categoria: 'Configuración externalizada', descripcion: 'Parámetros de app sin reiniciar ni tocar código.', aws: 'SSM Parameter Store', azure: 'App Configuration local', gcp: 'Runtime Configurator', modulo: 4 },
  { categoria: 'Correo electrónico transaccional', descripcion: 'Envía y recibe correos desde tu aplicación.', aws: 'SES (cloud local)', azure: 'Communication Services', gcp: 'Gmail API (Workspace)', modulo: 7 },
  { categoria: 'DNS gestionado', descripcion: 'Gestiona registros DNS con alta disponibilidad.', aws: 'Route 53 (cloud local)', azure: 'Azure DNS', gcp: 'Cloud DNS', modulo: 10 },
];

export const AZURE_GROUPS: AltCloudGroup[] = [
  { nombre: 'Identidad y seguridad', color: '#0078d4', descripcion: 'Gestiona acceso, secretos y cumplimiento — disponible en Azure local (puerto 4577).', servicios: ['Key Vault (Secrets/Keys/Certs)', 'Entra ID / Azure AD', 'Azure RBAC', 'Azure Policy'] },
  { nombre: 'Almacenamiento y datos', color: '#00b4d8', descripcion: 'Persiste objetos, tablas, documentos y colas — disponible en Azure local.', servicios: ['Blob Storage', 'Queue Storage', 'Table Storage', 'Cosmos DB (SQL/Mongo/Cassandra/Gremlin)'] },
  { nombre: 'Mensajería y eventos', color: '#7209b7', descripcion: 'Desacopla, enruta y transmite — disponible en Azure local (AMQP: 5672/5673).', servicios: ['Service Bus (Queues + Topics)', 'Event Hubs (AMQP + Kafka + REST)'] },
  { nombre: 'Cómputo', color: '#e63946', descripcion: 'Ejecuta código sin gestionar servidores — disponible en Azure local.', servicios: ['Azure Functions (HTTP Trigger)', 'Azure Functions (Timer Trigger)', 'AKS (k3s/mocked)'] },
  { nombre: 'Configuración', color: '#2ec4b6', descripcion: 'Externaliza configuración de la app — disponible en Azure local.', servicios: ['App Configuration (con Labels)', 'Azure SQL (en progreso)'] },
];

export const GCP_GROUPS: AltCloudGroup[] = [
  { nombre: 'Almacenamiento', color: '#34a853', descripcion: 'Persiste objetos y documentos — disponible en GCP local (puerto 4588).', servicios: ['Cloud Storage (REST JSON/XML)', 'Firestore (gRPC)', 'Datastore (REST JSON)'] },
  { nombre: 'Mensajería', color: '#a142f4', descripcion: 'Desacopla y procesa eventos — disponible en GCP local.', servicios: ['Pub/Sub (gRPC)', 'Cloud Tasks (en progreso)', 'Managed Kafka (Redpanda)'] },
  { nombre: 'Identidad y secretos', color: '#4285f4', descripcion: 'Gestiona acceso y secretos — disponible en GCP local.', servicios: ['Secret Manager (gRPC)', 'IAM (REST JSON)'] },
];

// ── Multi-track registry ─────────────────────────────────────────────────────
// Cada track es un "libro": reutiliza el mismo CourseModule que ya valida
// Cloud. El contenido detallado (challenges/questions) de los tracks nuevos
// se redacta por etapas; mientras tanto el módulo ya es navegable con su
// descripción, conceptos clave y entregable previstos.

export const TRACKS: Track[] = [
  { id: 'cloud', name: 'Cloud Local — AWS, Azure y GCP', shortName: 'Cloud', tagline: 'Servicios cloud reales en local, sin pagar ni crear cuentas.', color: '#137c8b', icon: 'cloud-cog', modules: COURSE_MODULES },
  { id: 'devops', name: 'DevOps', shortName: 'DevOps', tagline: 'Linux, Docker, CI/CD, Kubernetes e infraestructura como código.', color: '#475569', icon: 'git-branch', modules: DEVOPS_MODULES },
  { id: 'javascript', name: 'JavaScript de cero a master', shortName: 'JavaScript', tagline: 'El lenguaje base de la web: del primer script al rendimiento avanzado.', color: '#e9b400', icon: 'braces', modules: JAVASCRIPT_MODULES },
  { id: 'node', name: 'Node.js de cero a master', shortName: 'Node.js', tagline: 'Backend en JavaScript: APIs, bases de datos y producción.', color: '#3c873a', icon: 'server', modules: NODE_MODULES },
  { id: 'angular', name: 'Angular — última versión y migraciones', shortName: 'Angular', tagline: 'Componentes, signals y arquitectura moderna sin NgModules.', color: '#dd0031', icon: 'shield', modules: ANGULAR_MODULES },
  { id: 'react', name: 'React de cero a master', shortName: 'React', tagline: 'Hooks, estado, datos y frameworks full-stack con React.', color: '#149eca', icon: 'atom', modules: REACT_MODULES },
  { id: 'java', name: 'Java de cero a avanzado', shortName: 'Java', tagline: 'POO, concurrencia y JVM moderna, de Java 8 a Java 21.', color: '#5382a1', icon: 'coffee', modules: JAVA_MODULES },
  { id: 'spring-boot', name: 'Spring Boot', shortName: 'Spring Boot', tagline: 'APIs, persistencia, seguridad y microservicios con Spring.', color: '#6db33f', icon: 'leaf', modules: SPRING_BOOT_MODULES },
  { id: 'kotlin-multiplatform', name: 'Kotlin Multiplatform', shortName: 'Kotlin MP', tagline: 'Lógica compartida entre Android e iOS con Kotlin.', color: '#7f52ff', icon: 'layers', modules: KOTLIN_MULTIPLATFORM_MODULES },
  { id: 'android', name: 'Android con Jetpack Compose', shortName: 'Android', tagline: 'Apps Android nativas modernas con Compose y Kotlin.', color: '#3ddc84', icon: 'smartphone', modules: ANDROID_MODULES },
  { id: 'ios', name: 'iOS con SwiftUI', shortName: 'iOS', tagline: 'Apps iOS nativas con Swift, SwiftUI y concurrencia moderna.', color: '#0a84ff', icon: 'apple', modules: IOS_MODULES },
  { id: 'flutter', name: 'Flutter', shortName: 'Flutter', tagline: 'Una base de código para Android, iOS y web con Dart.', color: '#02569b', icon: 'wind', modules: FLUTTER_MODULES },
];

export const findTrack = (trackId: string): Track | undefined => TRACKS.find(t => t.id === trackId);
