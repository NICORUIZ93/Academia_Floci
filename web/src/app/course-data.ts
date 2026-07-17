import { CourseModule, QuizQuestion, Track, createModule } from './course-module.model';
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

export type { CourseModule, QuizQuestion, Track };
export { createModule };

export interface ServiceGroup {
  name: string;
  description: string;
  color: string;
  services: string[];
}

const m = createModule;

// ── Track Cloud Local ────────────────────────────────────────────────────────
// Módulos 0-9: ruta base "Academia Floci" (Docker, AWS local con Floci, S3, SQS,
// DynamoDB, Lambda, API Gateway, IAM, Azure/GCP y proyecto final). Módulos 10-20:
// contenido avanzado (Secrets, SNS/EventBridge, CloudWatch, RDS, ECR/ECS,
// CloudFormation, Step Functions, Kinesis/MSK, Cognito, Athena/Glue, Bedrock).
// Módulos 21-30: servicios adicionales sin cobertura previa, para alcanzar
// paridad completa con los servicios documentados de Floci — EC2/Auto Scaling,
// ELB/CloudFront/Route53/ACM, ElastiCache, CodeBuild/CodeDeploy,
// Config/AppConfig/Backup, Firehose/Pipes, AppSync/SES, Neptune/OpenSearch,
// FinOps (Cost Explorer/Pricing/BCM/Tagging/STS) y Transfer Family. Módulo 31:
// proyecto integrador multi-nube (antes módulo 21, renumerado al final del
// track para conservar su rol de capstone).
export const COURSE_MODULES: CourseModule[] = [
  m(0,
    'Introducción y preparación',
    'Introducción',
    'Fundamentos', '1 h', '#137c8b',
    'Presentación del curso, qué es Floci y cómo se compara con LocalStack, e instalación de todo lo que necesitas antes del primer laboratorio.',
    [
      '¿Qué vas a aprender y cómo está estructurado el curso?',
      'Qué es Floci: definición, propósito y comparativa con LocalStack',
      'Servicios que emula Floci: AWS, Azure y GCP',
      'Ventajas y limitaciones de practicar con un emulador local',
      'Metodología de estudio: teoría, laboratorio y evaluación en cada módulo',
    ],
    [
      'Instala Docker (Desktop en Windows/Mac, Docker Engine en Linux) y verifica con docker --version',
      'Instala AWS CLI y verifica con aws --version',
      'Instala Python 3 y Node.js — los usarás en los ejemplos de este curso',
      'Configura las variables de entorno AWS_ACCESS_KEY_ID=test, AWS_SECRET_ACCESS_KEY=test y AWS_DEFAULT_REGION=us-east-1',
      'Escribe en una nota qué diferencia esperas encontrar entre Floci y una cuenta real de AWS',
    ],
    ['¿Qué problema resuelve un emulador de nube local como Floci frente a usar una cuenta cloud real?', '¿Qué limitaciones tiene practicar solo con un emulador local antes de pasar a producción?'],
    ['AWS CLI'],
    'Docker, AWS CLI, Python y Node.js instalados y verificados; variables de entorno configuradas.',
    ['aws']
  ),

  m(1,
    'Fundamentos de Docker y contenedores',
    'Docker y contenedores',
    'Fundamentos', '2 h', '#475569',
    'Virtualización vs contenedores, imágenes y capas, y los comandos esenciales de Docker y Docker Compose antes de levantar Floci.',
    [
      'Virtualización vs contenedores',
      'Imágenes y capas',
      'Registros de contenedores (Docker Hub)',
      'Comandos esenciales: docker pull/run/ps/stop/rm/images/exec/logs',
      'Docker Compose: servicios, redes y volúmenes',
      'Levantar Floci con Docker (AWS, Azure y GCP)',
    ],
    [
      'Ejecuta docker pull hello-world y luego docker run hello-world, y explica con tus palabras qué hizo cada comando',
      'Lista los contenedores activos con docker ps y los detenidos con docker ps -a',
      'Escribe un docker-compose.yml mínimo con un servicio y levántalo con docker compose up',
      'Laboratorio 1.1 — Levantar Floci AWS: docker run -p 4566:4566 floci/floci:latest y verifica con curl http://localhost:4566/_localstack/health',
      'Laboratorio 1.2 — Configurar AWS CLI: aws configure y pruébalo con aws s3 ls --endpoint-url=http://localhost:4566',
    ],
    ['¿Qué diferencia hay entre una imagen Docker y un contenedor en ejecución?', '¿Por qué Floci se distribuye como imagen Docker en vez de un instalador tradicional?'],
    ['Docker', 'Docker Compose'],
    'Floci AWS corriendo en el puerto 4566, con AWS CLI configurado y verificado contra ese endpoint.',
    ['aws']
  ),

  m(2,
    'Almacenamiento en la nube con S3',
    'S3',
    'Aplicación', '2 h 30 min', '#2f6f9f',
    'Guarda y recupera archivos en S3: el concepto de objeto, el versionado y las políticas de acceso básicas.',
    [
      'Objetos, buckets y su nomenclatura',
      'Claves y metadatos',
      'Versionado y ciclo de vida',
      'Transición entre capas de almacenamiento',
      'Políticas de bucket, ACL y URLs pre-firmadas',
    ],
    [
      'Crea un bucket — aws s3 mb s3://mi-bucket --endpoint-url http://localhost:4566',
      'Sube un archivo — aws s3 cp hola.txt s3://mi-bucket/ --endpoint-url http://localhost:4566',
      'Lista los objetos del bucket — aws s3 ls s3://mi-bucket/ --endpoint-url http://localhost:4566',
      'Descarga el archivo — aws s3 cp s3://mi-bucket/hola.txt hola-descargado.txt --endpoint-url http://localhost:4566',
      'Elimina el objeto y luego el bucket — aws s3 rm y aws s3 rb',
      'Laboratorio 2.2 — Versionado: activa versionado con aws s3api put-bucket-versioning, sube dos versiones del mismo archivo y lístalas con aws s3api list-object-versions',
    ],
    ['¿Qué identifica de forma única a un objeto dentro de un bucket?', '¿Qué ventaja da el versionado de S3 frente a sobrescribir archivos sin control?'],
    ['S3'],
    'Bucket con versionado activo y al menos dos versiones de un mismo archivo subidas y verificadas.',
    ['aws']
  ),

  m(3,
    'Mensajería asíncrona con SQS',
    'SQS',
    'Aplicación', '2 h 30 min', '#8167a9',
    'Desacopla servicios con colas de mensajes, entiende el ciclo de vida de un mensaje y cuándo usar una Dead Letter Queue.',
    [
      'Colas, productores y consumidores',
      'Ciclo de vida de un mensaje',
      'Dead Letter Queues (DLQ)',
      'Colas FIFO vs Standard',
    ],
    [
      'Crea una cola — aws sqs create-queue --queue-name mi-cola --endpoint-url http://localhost:4566',
      'Envía un mensaje — aws sqs send-message --queue-url ... --message-body "Hola mundo"',
      'Recibe el mensaje y observa el ReceiptHandle — aws sqs receive-message',
      'Elimina el mensaje con delete-message usando el ReceiptHandle recibido',
      'Configura una DLQ: crea una segunda cola y enlázala a la principal con RedrivePolicy y maxReceiveCount=2',
      'Crea una cola FIFO (nombre.fifo) y envía un mensaje con MessageGroupId',
    ],
    ['¿Por qué un mensaje SQS puede llegar más de una vez a su consumidor?', '¿Cuándo usarías una cola FIFO en vez de una Standard?'],
    ['SQS'],
    'Cola principal con una DLQ configurada que recibe mensajes tras 2 intentos fallidos.',
    ['aws']
  ),

  m(4,
    'Bases de datos NoSQL con DynamoDB',
    'DynamoDB',
    'Aplicación', '3 h', '#e85d4a',
    'Modela y consulta una base de datos NoSQL: tablas, claves, tipos de datos e índices, y por qué Query es mejor que Scan.',
    [
      'Qué es NoSQL y cuándo usarlo',
      'Tablas, items y atributos',
      'Tipos de datos: S, N, B, BOOL, NULL, L, M',
      'Clave primaria simple (HASH) vs compuesta (HASH + RANGE)',
      'Índices secundarios globales (GSI) y locales (LSI)',
      'Query vs Scan',
    ],
    [
      'Crea una tabla de tareas con clave primaria simple — aws dynamodb create-table',
      'Inserta un item — aws dynamodb put-item',
      'Obtén el item por su clave — aws dynamodb get-item',
      'Actualiza un atributo del item — aws dynamodb update-item',
      'Elimina el item — aws dynamodb delete-item',
      'Ejecuta un scan de toda la tabla y luego una query por clave, y compara ambos resultados',
    ],
    ['¿Por qué Scan puede volverse muy costoso en una tabla grande?', '¿Cuándo necesitas una clave compuesta (HASH+RANGE) en vez de una simple?'],
    ['DynamoDB'],
    'Tabla de tareas con operaciones CRUD completas probadas por CLI.',
    ['aws']
  ),

  m(5,
    'Serverless con Lambda',
    'Lambda',
    'Integración', '3 h', '#e9a23b',
    'Escribe, despliega e invoca funciones que se ejecutan sin gestionar servidores, y actualiza su código como en el día a día real.',
    [
      'Qué es serverless: ventajas y desventajas',
      'Estructura de una función Lambda',
      'Runtimes: Node.js, Python, Java, Go',
      'Payload de entrada y respuesta',
      'Versionado y alias',
      'Integración con S3, DynamoDB Streams y API Gateway',
    ],
    [
      'Laboratorio 5.1: escribe una función Node.js (index.js), comprímela y despliégala con aws lambda create-function',
      'Invoca la función con aws lambda invoke y revisa el archivo de salida',
      'Laboratorio 5.2: modifica el código, actualízalo con aws lambda update-function-code y vuelve a invocar',
      'Actualiza la configuración (memoria, variables de entorno) con aws lambda update-function-configuration',
      'Documenta cómo conectarías esta función a un trigger de S3 o de DynamoDB Streams',
    ],
    ['¿Qué recibe exactamente el parámetro event de una función Lambda?', '¿Por qué Lambda no debe guardar estado entre invocaciones?'],
    ['Lambda'],
    'Función Lambda desplegada, invocada y actualizada al menos una vez con un cambio de código real.',
    ['aws']
  ),

  m(6,
    'APIs con API Gateway',
    'API Gateway',
    'Integración', '3 h', '#137c8b',
    'Expón tu función Lambda como un endpoint HTTP real: recursos, métodos, integración proxy y despliegue por stages.',
    [
      'Qué es API Gateway y tipos de API: REST, HTTP, WebSocket',
      'Recursos, métodos y stages',
      'Integración con Lambda (proxy)',
      'Mapeo de entrada/salida y validación con modelos',
      'Despliegue y variables de stage',
    ],
    [
      'Laboratorio 6.1: crea una API REST — aws apigateway create-rest-api',
      'Crea un recurso /tareas y un método GET sobre él — create-resource y put-method',
      'Conéctalo a tu función Lambda del módulo anterior con integración proxy — put-integration',
      'Despliega la API a un stage llamado dev — create-deployment',
      'Invoca el endpoint desplegado con curl y compara la respuesta con invocar la Lambda directamente',
    ],
    ['¿Qué aporta una integración proxy que no aporta una integración manual?', '¿Por qué los cambios en la API no son visibles hasta que hay un nuevo deployment?'],
    ['API Gateway v1', 'Lambda'],
    'Endpoint HTTP público (local) que invoca la Lambda del módulo anterior y responde con datos reales.',
    ['aws']
  ),

  m(7,
    'Identidad y acceso con IAM',
    'IAM',
    'Integración', '2 h 30 min', '#bd4b72',
    'Gestiona quién puede hacer qué en tu cuenta: usuarios, grupos, roles y políticas con el principio de mínimo privilegio.',
    [
      'Principio de mínimo privilegio',
      'Modelo de responsabilidad compartida',
      'Usuarios, grupos y roles',
      'Estructura de una política: acciones, recursos y condiciones',
      'Buenas prácticas: roles sobre usuarios, políticas restrictivas, rotación de credenciales',
    ],
    [
      'Laboratorio 7.1: crea un usuario — aws iam create-user',
      'Crea un grupo y añade el usuario al grupo — create-group y add-user-to-group',
      'Escribe una política que permita solo s3:GetObject sobre un bucket específico — create-policy',
      'Asigna la política al usuario y verifica los permisos con simulate-principal-policy',
      'Documenta por qué usarías un rol en vez de credenciales de usuario para una Lambda',
    ],
    ['¿Qué diferencia hay entre asignar una política a un usuario y a un rol?', '¿Por qué una política demasiado permisiva es un riesgo aunque "funcione"?'],
    ['IAM'],
    'Usuario con permisos mínimos (solo lectura sobre un bucket) verificados con simulate-principal-policy.',
    ['aws']
  ),

  m(8,
    'Azure y GCP con Floci',
    'Azure y GCP',
    'Experto', '3 h 30 min', '#4f7a5d',
    'Repite los mismos patrones de almacenamiento y mensajería en floci-az y floci-gcp, y compara los tres proveedores lado a lado.',
    [
      'floci-az: Blob Storage, Queue Storage, Table Storage, Cosmos DB, Functions',
      'floci-gcp: Cloud Storage, Pub/Sub, Firestore, Cloud Functions',
      'Comparativa AWS vs Azure vs GCP por categoría de servicio',
    ],
    [
      'Laboratorio 8.1: levanta floci-az y crea un contenedor Blob Storage con az storage container create',
      'Sube y descarga un blob, y crea una cola con az storage queue create',
      'Laboratorio 8.2: levanta floci-gcp y crea un bucket con gcloud storage buckets create',
      'Crea un topic y una suscripción Pub/Sub, publica un mensaje y confírmalo con pull --auto-ack',
      'Escribe una tabla que compare el mismo caso de uso (guardar un archivo) en AWS, Azure y GCP',
    ],
    ['¿Qué fue igual entre AWS, Azure y GCP en este módulo, y qué fue realmente diferente?', '¿Cuándo elegirías Firestore sobre Cosmos DB o DynamoDB?'],
    ['Blob Storage', 'Queue Storage', 'Cosmos DB', 'Cloud Storage', 'Pub/Sub', 'Firestore'],
    'El mismo archivo subido y recuperado en Blob Storage (Azure) y Cloud Storage (GCP), documentado en una tabla comparativa.',
    ['aws', 'azure', 'gcp']
  ),

  m(9,
    'Proyecto final: Sistema de Gestión de Tareas',
    'Proyecto: tareas',
    'Experto', '6 h', '#bd4b72',
    'Integra todo lo aprendido en un solo sistema: DynamoDB, S3, SQS, Lambda, API Gateway e IAM trabajando juntos.',
    [
      'Arquitectura de la aplicación: frontend, backend y base de datos',
      'Integración de S3, SQS, DynamoDB, Lambda, API Gateway e IAM',
      'Despliegue y pruebas de integración',
      'Documentación de la API y guía de despliegue',
    ],
    [
      'Diseña el diagrama de arquitectura del Sistema de Gestión de Tareas antes de escribir código',
      'Implementa el CRUD de tareas en DynamoDB expuesto por una Lambda',
      'Agrega subida de archivos adjuntos a S3 desde el mismo API',
      'Agrega una cola SQS para procesar tareas en segundo plano',
      'Expón todo con API Gateway y protege las rutas con una política IAM de mínimo privilegio',
      'Documenta la API y escribe una guía de despliegue paso a paso',
    ],
    ['¿Qué parte del sistema fue más difícil de integrar y por qué?', '¿Qué le faltaría a este proyecto para acercarse a un entorno de producción real?'],
    ['S3', 'SQS', 'DynamoDB', 'Lambda', 'API Gateway v1', 'IAM'],
    'Sistema de Gestión de Tareas funcional: CRUD de tareas, adjuntos en S3, cola de procesamiento y API documentada.',
    ['aws']
  ),

  // ── Contenido avanzado (continúa después de la ruta base 0-9) ──────────────

  m(10,
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

  m(11,
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

  m(12,
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

  m(13,
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

  m(14,
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

  m(15,
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

  m(16,
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

  m(17,
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

  m(18,
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

  m(19,
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

  m(20,
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

  m(21,
    'Cómputo elástico con EC2 y Auto Scaling',
    'EC2 y Auto Scaling',
    'Integración', '3 h', '#137c8b',
    'Lanza instancias EC2 respaldadas por contenedores Docker reales, inyecta claves SSH y UserData, y usa Auto Scaling para mantener automáticamente una capacidad deseada de instancias.',
    ['Modelo de ejecución EC2 sobre Docker real', 'AMIs y su mapeo a imágenes Docker', 'IMDS v1/v2 y credenciales por instancia', 'Launch configurations y Auto Scaling Groups', 'Reconciliador de capacidad cada 10 s'],
    [
      'Laboratorio 21.1: importa una clave SSH real y lanza una instancia con aws ec2 run-instances --image-id ami-amazonlinux2023',
      'Consulta IMDSv2 desde dentro del contenedor: pide un token y luego el instance-id',
      'Laboratorio 21.2: crea una configuración de lanzamiento y un Auto Scaling Group con capacidad deseada 2',
      'Sube la capacidad deseada a 4 con set-desired-capacity y observa al reconciliador lanzar instancias nuevas',
      'Adjunta el grupo a un grupo objetivo ELB v2 y verifica el registro automático de instancias',
    ],
    ['¿Qué diferencia hay entre RunInstances y un docker run directo?', '¿Por qué los grupos de seguridad no filtran tráfico realmente en Floci?', '¿Cómo protegerías una instancia específica de terminación en un scale-in?'],
    ['EC2', 'Auto Scaling'],
    'Una instancia EC2 real con acceso SSH funcional verificado vía IMDS, y un Auto Scaling Group que mantiene su capacidad deseada automáticamente.',
    ['aws']
  ),

  m(22,
    'Balanceo de carga, CDN y DNS — ELB, CloudFront, Route53 y ACM',
    'ELB, CDN y DNS',
    'Integración', '3 h 30 min', '#2f6f9f',
    'Crea un Application Load Balancer con grupos objetivo y reglas de enrutamiento, solicita certificados TLS reales con ACM, distribuye contenido con CloudFront y gestiona DNS con Route53.',
    ['ALB, grupos objetivo y listeners', 'ACM: emisión automática con criptografía real', 'Distribuciones CloudFront y políticas de caché', 'Zonas alojadas y registros de recursos en Route53', 'La cadena ACM → ALB/CloudFront → Route53'],
    [
      'Laboratorio 22.1: crea un ALB, un grupo objetivo y una regla de enrutamiento por ruta /api/*',
      'Laboratorio 22.2: solicita un certificado ACM y verifica que se emite con criptografía real',
      'Crea una distribución CloudFront con origen S3 y una política de caché',
      'Crea una zona alojada en Route53 y un registro apuntando a tu distribución',
      'Exporta un certificado ACM de tipo PRIVATE junto a su clave privada',
    ],
    ['¿Qué parte de ELB v2 es plano de gestión y cuál es plano de datos todavía pendiente en Floci?', '¿Por qué un certificado AMAZON_ISSUED no se puede exportar pero uno PRIVATE sí?', '¿En qué punto de la cadena ACM/CloudFront/Route53 se verifica el certificado TLS?'],
    ['ELB v2', 'CloudFront', 'Route53', 'ACM'],
    'Un ALB con grupo objetivo y regla por ruta, más un certificado ACM, una distribución CloudFront y una zona Route53 apuntando a ella.',
    ['aws']
  ),

  m(23,
    'Caché en memoria con ElastiCache',
    'ElastiCache',
    'Integración', '2 h 30 min', '#8167a9',
    'Crea un clúster ElastiCache respaldado por un contenedor Valkey/Redis real, aplica el patrón cache-aside, y practica autenticación IAM en vez de contraseñas fijas.',
    ['Cache-aside, cache hit/miss y TTL', 'Contenedores Valkey/Redis reales en Floci', 'Conexión con clientes Redis estándar', 'Autenticación IAM para el plano de datos'],
    [
      'Crea un grupo de réplicas y obtén su puerto real con describe-replication-groups',
      'Conéctate con redis-cli y confirma el servidor con PING',
      'Guarda un valor con SET ... EX 60 y recupéralo con GET antes de que expire',
      'Crea un usuario ElastiCache con autenticación IAM y una cadena de acceso',
      'Implementa cache-aside en Python: lee de Redis, si falla consulta una "base de datos" simulada y guarda el resultado',
    ],
    ['¿Cuándo NO conviene usar un caché en memoria?', '¿Por qué el motor Redis/Valkey es real y no una reimplementación del protocolo?', '¿Qué ventaja de seguridad da la autenticación IAM sobre una contraseña fija?'],
    ['ElastiCache'],
    'Un clúster ElastiCache con datos leídos y escritos vía redis-cli, y un usuario con autenticación IAM configurado.',
    ['aws']
  ),

  m(24,
    'CI/CD nativo de AWS con CodeBuild y CodeDeploy',
    'CodeBuild y CodeDeploy',
    'Experto', '3 h 30 min', '#e85d4a',
    'Ejecuta compilaciones reales dentro de contenedores Docker con CodeBuild, y despliega Lambda con una estrategia canary usando CodeDeploy, con reversión automática ante fallos.',
    ['Fases de buildspec.yml: install/pre_build/build/post_build', 'Artefactos recolectados y subidos a S3', 'Aplicaciones y grupos de implementación', 'Despliegue Blue/Green de Lambda por alias', 'Lifecycle hooks y reversión automática'],
    [
      'Laboratorio 24.1: crea un proyecto CodeBuild y ejecuta una compilación con buildspec inline',
      'Verifica que el artefacto generado se subió automáticamente a S3',
      'Laboratorio 24.2: crea una aplicación y grupo CodeDeploy para Lambda con estrategia LambdaCanary10Percent5Minutes',
      'Inicia el despliegue y confirma que el alias live cambia de tráfico gradualmente',
      'Simula un lifecycle hook que reporta Failed y confirma la reversión automática del alias',
    ],
    ['¿En qué fase exacta falla una compilación cuando un comando devuelve un código de salida distinto de cero?', '¿Cuándo elegirías AllAtOnce sobre una estrategia canary?', '¿Por qué la reversión automática ante un hook fallido es preferible a una reversión manual?'],
    ['CodeBuild', 'CodeDeploy'],
    'Una compilación real con artefacto en S3, y un despliegue canary de Lambda completado exitosamente con CodeDeploy.',
    ['aws']
  ),

  m(25,
    'Gobierno, configuración y continuidad — AWS Config, AppConfig y Backup',
    'Config, AppConfig y Backup',
    'Experto', '3 h', '#4f7a5d',
    'Gestiona reglas de cumplimiento con AWS Config, despliega configuración dinámica sin redeployar código con AppConfig, y centraliza tu política de respaldo con AWS Backup.',
    ['Reglas, grabadores y paquetes de conformidad de Config', 'Aplicaciones, entornos y perfiles de AppConfig', 'Sesiones de configuración en AppConfigData', 'Bóvedas, planes y selecciones de Backup', 'El ciclo de vida CREATED → RUNNING → COMPLETED de un trabajo de respaldo'],
    [
      'Laboratorio 25.1: despliega un cambio de configuración con AppConfig y recupéralo desde AppConfigData',
      'Crea una regla de Config y consulta su estado de cumplimiento con describe-compliance-by-config-rule',
      'Laboratorio 25.2: crea una bóveda y un plan de respaldo diario para una tabla DynamoDB',
      'Inicia un respaldo bajo demanda y sondea hasta que el trabajo llegue a COMPLETED',
      'Intenta eliminar la bóveda antes de vaciarla y documenta el error de protección',
    ],
    ['¿Por qué el estado de cumplimiento en Config siempre devuelve INSUFFICIENT_DATA en Floci?', '¿Cuánto tiempo pasa entre un StartDeployment de AppConfig y que el cambio sea visible para la aplicación?', '¿Por qué AWS Backup no te deja eliminar una bóveda con puntos de recuperación?'],
    ['AWS Config', 'AppConfig', 'AppConfigData', 'AWS Backup'],
    'Una configuración desplegada y leída dinámicamente con AppConfig, y un plan de respaldo funcionando con un punto de recuperación real para una tabla DynamoDB.',
    ['aws']
  ),

  m(26,
    'Streaming e integración avanzada — Firehose y EventBridge Pipes',
    'Firehose y Pipes',
    'Experto', '2 h 30 min', '#e9a23b',
    'Entrega streams de datos automáticamente a S3 con Data Firehose, y conecta un origen con un destino sin código de pegamento usando EventBridge Pipes.',
    ['Firehose: buffer, vaciado automático y NDJSON', 'Firehose vs Kinesis Data Streams: quién consume los datos', 'Pipes: origen, destino y enriquecimiento opcional', 'Cuándo usar Pipes frente a reglas EventBridge o Step Functions'],
    [
      'Laboratorio 26.1: crea un stream Firehose y envía registros hasta ver el vaciado automático en S3',
      'Inspecciona el archivo NDJSON generado en el bucket floci-firehose-results',
      'Laboratorio 26.2: crea un pipe que conecte una cola SQS con una función Lambda sin código de polling',
      'Envía un mensaje a la cola de origen y confirma la invocación de la Lambda en los logs',
      'Diseña un filtro de pipe que solo deje pasar mensajes con prioridad alta',
    ],
    ['¿Cuándo usarías Firehose en vez de construir un consumidor Kinesis Data Streams propio?', '¿Qué complejidad de código elimina un Pipe frente a una Lambda de polling manual?', '¿Cuándo elegirías una regla EventBridge en vez de un Pipe?'],
    ['Firehose', 'EventBridge Pipes'],
    'Un stream Firehose entregando registros automáticamente a S3, y un pipe conectando una cola SQS con una Lambda sin código intermedio.',
    ['aws']
  ),

  m(27,
    'APIs GraphQL con AppSync y correo transaccional con SES',
    'AppSync y SES',
    'Experto', '3 h', '#137c8b',
    'Crea una API GraphQL gestionada con AppSync y resolvers locales, y usa SES junto al simulador de buzones de correo para probar de forma determinista flujos de entrega, rebote y queja.',
    ['Esquemas GraphQL y resolvers', 'Fuentes de datos tipo NONE para prototipar', 'Eliminación en cascada de una API GraphQL', 'Identidades, envío y plantillas en SES', 'El simulador de buzones de correo (success/bounce/complaint)'],
    [
      'Laboratorio 27.1: crea una API GraphQL, define un esquema y un resolver con fuente de datos NONE',
      'Genera una clave API y documenta cómo la usarías desde un cliente',
      'Laboratorio 27.2: verifica una identidad SES y envía correos a las tres direcciones del simulador',
      'Inspecciona el buzón local en /_aws/ses y confirma los tres mensajes capturados',
      'Diseña un esquema GraphQL para el Sistema de Gestión de Tareas del Módulo 9',
    ],
    ['¿Qué ventaja tiene GraphQL sobre REST cuando los clientes necesitan formas de datos muy variables?', '¿Por qué las direcciones del simulador de SES generan eventos deterministas?', '¿Qué implica para una migración gradual que SES v1 y v2 compartan el mismo estado?'],
    ['AppSync', 'SES'],
    'Una API GraphQL con un resolver local funcionando, y tres correos de prueba capturados en el buzón local de SES vía las direcciones del simulador.',
    ['aws']
  ),

  m(28,
    'Bases de datos de grafos y búsqueda — Neptune y OpenSearch',
    'Neptune y OpenSearch',
    'Experto', '3 h', '#bd4b72',
    'Modela relaciones con un servidor Gremlin real en Neptune, y crea un dominio OpenSearch en modo real para búsqueda de texto completo, afinando tu criterio de selección de bases de datos.',
    ['Vértices, aristas y consultas multi-salto', 'Neptune sobre un contenedor Gremlin Server real', 'OpenSearch: modo simulado vs modo real', 'Cuándo elegir Neptune, OpenSearch o DynamoDB'],
    [
      'Laboratorio 28.1: crea un clúster Neptune y modela un pequeño grafo de personas con gremlin-python',
      'Ejecuta una consulta de recorrido: g.V().has(...).out(...).values(...)',
      'Laboratorio 28.2: crea un dominio OpenSearch en modo real y espera a que /_cluster/health esté saludable',
      'Indexa un documento y búscalo por texto completo',
      'Diseña una consulta de grafo para "quienes compraron esto también compraron"',
    ],
    ['¿Qué tipo de consulta hace que una base de datos de grafos supere a una relacional?', '¿Cuándo usarías el modo mock de OpenSearch en vez del modo real?', '¿Cómo mantendrías sincronizadas DynamoDB, OpenSearch y Neptune sin duplicar lógica de escritura?'],
    ['Neptune', 'OpenSearch'],
    'Un grafo de relaciones consultado con Gremlin, y un dominio OpenSearch en modo real con un documento indexado y buscado por texto completo.',
    ['aws']
  ),

  m(29,
    'FinOps y gobierno de cuenta — Cost Explorer, Pricing, BCM Data Exports, Resource Groups Tagging y STS',
    'FinOps y gobierno',
    'Experto', '3 h', '#2f6f9f',
    'Consulta el costo sintetizado de tus propios recursos con Cost Explorer, exporta reportes en formato FOCUS con BCM Data Exports, descubre recursos por etiqueta entre servicios, y profundiza en credenciales temporales con STS.',
    ['Síntesis de costos a partir del estado real de recursos', 'El catálogo de precios estático de Pricing', 'Exportaciones CUR/FOCUS en Parquet', 'Descubrimiento centralizado por etiqueta', 'AssumeRole y resolución de cuenta multi-tenant'],
    [
      'Laboratorio 29.1: consulta get-cost-and-usage agrupado por SERVICE con tus recursos reales del curso',
      'Crea una exportación BCM Data Exports y confirma el archivo Parquet generado en S3',
      'Laboratorio 29.2: etiqueta un bucket S3 y una tabla DynamoDB con la misma etiqueta y descúbrelos juntos con get-resources',
      'Verifica tu identidad con get-caller-identity antes y después de un assume-role',
      'Diseña un flujo assume-role entre dos cuentas simuladas (AKID de 12 dígitos distintos)',
    ],
    ['¿Por qué algunos servicios aparecen con costo cero en Cost Explorer aunque los estés usando?', '¿Qué ganas al centralizar el descubrimiento de recursos por etiqueta en vez de consultar cada servicio por separado?', '¿Qué verificarías con GetCallerIdentity antes y después de un AssumeRole entre cuentas?'],
    ['Cost Explorer', 'Pricing', 'BCM Data Exports', 'Resource Groups Tagging API', 'STS'],
    'Un desglose de costo real de tus recursos, una exportación FOCUS en Parquet, y recursos de dos servicios distintos descubiertos con una sola consulta por etiqueta.',
    ['aws']
  ),

  m(30,
    'Transferencia de archivos gestionada con Transfer Family',
    'Transfer Family',
    'Experto', '2 h', '#8167a9',
    'Crea un servidor SFTP gestionado con Transfer Family, gestiona usuarios con claves públicas SSH, y reconoce los límites de la Fase 1 actual: plano de gestión completo, plano de datos todavía pendiente.',
    ['SFTP/FTP gestionado sin servidores propios', 'Ciclo de vida ONLINE/OFFLINE del servidor', 'Usuarios, directorios de inicio y claves SSH', 'Plano de gestión completo vs plano de datos pendiente'],
    [
      'Laboratorio 30.1: crea un servidor SFTP y confirma su estado inicial',
      'Crea un usuario con un directorio de inicio específico',
      'Importa una clave pública SSH para ese usuario',
      'Detén y reinicia el servidor, confirmando la transición de estados',
      'Diseña el aislamiento de directorios de inicio para tres proveedores externos distintos',
    ],
    ['¿Qué trabajo operativo elimina Transfer Family frente a un servidor SFTP autogestionado?', '¿Por qué un servidor debe estar OFFLINE antes de poder eliminarse?', '¿Qué validarías contra un Transfer Family real antes de producción?'],
    ['Transfer Family'],
    'Un servidor Transfer Family con un usuario, una clave SSH importada, y el ciclo de vida ONLINE/OFFLINE verificado.',
    ['aws']
  ),

  m(31,
    'Proyecto integrador: API multi-nube con AWS, Azure y GCP',
    'Proyecto multi-nube',
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

// ── Cuestionarios finales (10 preguntas por track) ──────────────────────────
// Motor genérico y reusable en cualquier track: ver FinalQuizComponent
// (course/final-quiz.ts), montado en la ruta /curso/:trackId/quiz.

export const CLOUD_QUIZ: QuizQuestion[] = [
  { question: '¿Qué variable de entorno evita repetir --endpoint-url en cada comando de la AWS CLI?', options: ['AWS_ENDPOINT_URL', 'FLOCI_HOSTNAME', 'AWS_ACCOUNT_ID', 'AWS_PROFILE_ENDPOINT'], answer: 0 },
  { question: '¿Qué permite procesar un mensaje SQS dos veces sin duplicar efectos en tu sistema?', options: ['Una espera fija con sleep', 'Idempotencia en el consumidor', 'Usar siempre una cola FIFO', 'Aumentar el VisibilityTimeout'], answer: 1 },
  { question: '¿Qué operación de DynamoDB evita recorrer TODOS los elementos de la tabla?', options: ['Scan con FilterExpression', 'Query con clave de partición', 'ListTables', 'BatchGetItem sobre toda la tabla'], answer: 1 },
  { question: '¿En qué puerto escucha el emulador de Azure local (floci-az)?', options: ['4566', '4577', '4588', '8081'], answer: 1 },
  { question: '¿Qué prueba sigue siendo necesaria después de validar todo con Floci?', options: ['Ninguna, Floci es idéntico a AWS', 'Una prueba final contra la nube real', 'Solo linting del código', 'Ninguna, basta con tests unitarios'], answer: 1 },
  { question: '¿Qué diferencia hay entre una imagen Docker y un contenedor?', options: ['Son lo mismo', 'La imagen es la plantilla inmutable y el contenedor es una instancia en ejecución', 'El contenedor es la plantilla y la imagen la instancia', 'Una imagen solo puede generar un contenedor'], answer: 1 },
  { question: '¿Qué aporta la integración proxy (AWS_PROXY) entre API Gateway y Lambda?', options: ['Reenvía la petición HTTP completa sin transformarla, dejando la lógica en el código Lambda', 'Transforma automáticamente el payload con plantillas VTL', 'Elimina la necesidad de permisos IAM', 'Convierte la API en un WebSocket'], answer: 0 },
  { question: '¿Cuándo conviene usar EventBridge en vez de SNS?', options: ['Cuando necesitas enrutar eventos con filtros de contenido y múltiples fuentes/reglas declarativas', 'Cuando solo tienes un consumidor fijo', 'Cuando no necesitas persistencia', 'Nunca, SNS siempre es mejor'], answer: 0 },
  { question: '¿Qué usa Athena en Floci como motor real para ejecutar SQL sobre datos en S3?', options: ['PostgreSQL', 'DuckDB', 'MySQL', 'SQLite'], answer: 1 },
  { question: '¿Qué principio de IAM reduce el riesgo de una política demasiado permisiva?', options: ['Compartir un único usuario root para todo el equipo', 'Principio de mínimo privilegio', 'Desactivar el versionado de políticas', 'Usar siempre credenciales de larga duración'], answer: 1 },
];

export const DEVOPS_QUIZ: QuizQuestion[] = [
  { question: '¿Qué comando de Git reescribe el historial combinando commits en una rama antes de fusionarla?', options: ['git merge --no-ff', 'git rebase -i', 'git cherry-pick --continue', 'git reflog expire'], answer: 1 },
  { question: '¿Qué conviene copiar primero en un Dockerfile para aprovechar la caché de capas?', options: ['Instalar dependencias (COPY package.json + RUN install) antes que el resto del código', 'Copiar todo el proyecto de una vez', 'Ejecutar el build final', 'Exponer el puerto'], answer: 0 },
  { question: 'En Kubernetes, ¿qué objeto garantiza que siempre haya N réplicas de un Pod corriendo?', options: ['Service', 'Deployment/ReplicaSet', 'ConfigMap', 'Ingress'], answer: 1 },
  { question: '¿Qué diferencia a un Service tipo ClusterIP de uno tipo LoadBalancer en Kubernetes?', options: ['Son idénticos', 'ClusterIP solo es accesible dentro del clúster; LoadBalancer expone el servicio externamente', 'LoadBalancer es más rápido pero inseguro', 'ClusterIP requiere un Ingress obligatoriamente'], answer: 1 },
  { question: '¿Qué resuelve principalmente Terraform en infraestructura como código?', options: ['Solo el despliegue de contenedores', 'Definir y versionar el estado deseado de la infraestructura de forma declarativa', 'Reemplazar Git', 'Monitoreo de métricas'], answer: 1 },
  { question: '¿Qué es "GitOps" en el contexto de CD?', options: ['Desplegar manualmente desde tu laptop', 'Usar un repositorio Git como fuente de verdad que un controlador sincroniza automáticamente con el clúster', 'Un plugin de Git para hacer merge', 'Nombre alternativo de CI'], answer: 1 },
  { question: 'En un pipeline de CI, ¿qué práctica reduce más el riesgo de romper main?', options: ['Hacer push directo a main sin revisión', 'Ejecutar pruebas automatizadas en cada pull request antes de fusionar', 'Desactivar los tests en CI para ir más rápido', 'Desplegar directo a producción sin pipeline'], answer: 1 },
  { question: '¿Qué aporta Prometheus en una arquitectura de observabilidad?', options: ['Almacenamiento de logs estructurados', 'Recolección y consulta de métricas mediante scraping y PromQL', 'Trazas distribuidas end-to-end', 'Gestión de secretos'], answer: 1 },
  { question: 'En DevSecOps, ¿en qué etapa del pipeline conviene escanear dependencias en busca de vulnerabilidades?', options: ['Solo en producción', 'Lo antes posible en el pipeline (shift-left)', 'Nunca, es responsabilidad de un equipo externo', 'Solo antes de una auditoría anual'], answer: 1 },
  { question: '¿Qué estrategia de despliegue reduce el riesgo al enviar tráfico gradualmente a la nueva versión?', options: ['Big bang deployment', 'Canary release', 'Eliminar la versión anterior antes de desplegar', 'Despliegue manual por FTP'], answer: 1 },
];

export const JAVASCRIPT_QUIZ: QuizQuestion[] = [
  { question: '¿Qué diferencia hay entre let y var respecto al scope?', options: ['Son idénticos', 'let tiene scope de bloque y var tiene scope de función', 'var tiene scope de bloque y let de función', 'let no se puede reasignar'], answer: 1 },
  { question: '¿Qué es un closure?', options: ['Un error de sintaxis', 'Una función que recuerda el entorno léxico en el que fue creada, aunque se ejecute fuera de él', 'Un método de arrays', 'Un tipo de bucle'], answer: 1 },
  { question: '¿Qué imprime typeof null en JavaScript?', options: ['"null"', '"undefined"', '"object"', '"boolean"'], answer: 2 },
  { question: '¿Qué diferencia hay entre == y ===?', options: ['Ninguna', '=== compara valor y tipo sin coerción, == aplica coerción de tipos', '== es más estricto', '=== solo funciona con números'], answer: 1 },
  { question: 'En el Event Loop, ¿qué se procesa primero: microtasks (promesas) o macrotasks (setTimeout)?', options: ['Macrotasks siempre primero', 'Las microtasks se vacían completamente antes de la siguiente macrotask', 'Es aleatorio', 'Depende del navegador siempre'], answer: 1 },
  { question: '¿Qué hace Array.prototype.reduce?', options: ['Filtra elementos', 'Acumula los elementos de un array en un único valor aplicando una función', 'Ordena el array', 'Elimina duplicados automáticamente'], answer: 1 },
  { question: '¿Qué problema resuelven los módulos ES (import/export) frente a scripts globales?', options: ['Ninguno', 'Encapsulan el scope de cada archivo evitando colisiones de nombres globales', 'Hacen el código más lento', 'Eliminan la necesidad de un bundler siempre'], answer: 1 },
  { question: '¿Qué es "hoisting"?', options: ['Un patrón de diseño', 'El comportamiento por el que declaraciones de var y function se procesan antes de ejecutar el código', 'Una API del DOM', 'Un tipo de closure'], answer: 1 },
  { question: '¿Qué ventaja da TypeScript sobre JavaScript puro?', options: ['Ejecuta más rápido en runtime', 'Añade tipado estático verificado en tiempo de compilación', 'Elimina la necesidad de testing', 'Sustituye al Event Loop'], answer: 1 },
  { question: '¿Qué tipo de prueba verifica el comportamiento de una función aislada de sus dependencias?', options: ['Prueba end-to-end', 'Prueba unitaria', 'Prueba de carga', 'Prueba manual exploratoria'], answer: 1 },
];

export const NODE_QUIZ: QuizQuestion[] = [
  { question: '¿Qué componente de Node.js gestiona las operaciones de I/O asíncronas no bloqueantes?', options: ['V8', 'libuv', 'npm', 'Express'], answer: 1 },
  { question: '¿Qué diferencia hay entre require (CommonJS) e import (ES Modules) en Node?', options: ['Son idénticos en todo', 'CommonJS es síncrono; ESM soporta análisis estático y top-level await', 'ESM no funciona en Node', 'require es más moderno'], answer: 1 },
  { question: '¿Por qué se usan streams para procesar archivos grandes en vez de leerlos completos en memoria?', options: ['Los streams son más lentos siempre', 'Procesan los datos por partes sin cargar todo el archivo en memoria', 'No hay diferencia real', 'Los streams solo sirven para red'], answer: 1 },
  { question: '¿Qué rol cumple el middleware en Express?', options: ['Define el motor de plantillas', 'Intercepta la petición/respuesta para ejecutar lógica (auth, logging, validación) antes del handler', 'Sustituye a la base de datos', 'Solo sirve para archivos estáticos'], answer: 1 },
  { question: '¿Qué ventaja aporta un ORM sobre escribir SQL a mano en cada consulta?', options: ['Siempre es más rápido en runtime', 'Abstrae el mapeo objeto-relacional y reduce código repetitivo', 'Elimina la necesidad de migraciones', 'Reemplaza la base de datos'], answer: 1 },
  { question: 'Con JWT, ¿dónde vive típicamente el estado de la sesión?', options: ['En una tabla de sesiones obligatoria en el servidor', 'El propio token firmado contiene los claims, sin estado en el servidor', 'En una cookie sin firmar', 'En variables globales del proceso'], answer: 1 },
  { question: '¿Qué mide un test de integración que un test unitario no cubre?', options: ['Nada distinto', 'La interacción real entre varios componentes (ej. API + base de datos)', 'Solo la sintaxis del código', 'El tiempo de compilación'], answer: 1 },
  { question: '¿Por qué no conviene bloquear el Event Loop con operaciones síncronas pesadas?', options: ['No importa, Node es multihilo por defecto', 'Bloquear el Event Loop detiene el procesamiento de todas las peticiones concurrentes', 'Solo afecta al arranque del proceso', 'Node lo compensa automáticamente'], answer: 1 },
  { question: '¿Qué práctica evita inyección SQL en Node?', options: ['Concatenar strings directamente en la query', 'Usar consultas parametrizadas o un ORM que las genere', 'Desactivar la validación de entrada', 'Confiar solo en la validación del frontend'], answer: 1 },
  { question: '¿Qué aporta la observabilidad (logs estructurados + métricas) en producción?', options: ['Nada, solo aumenta el costo', 'Permite diagnosticar errores y cuellos de botella sin reproducir el problema localmente', 'Sustituye a los tests', 'Es obligatoria solo en desarrollo'], answer: 1 },
];

export const ANGULAR_QUIZ: QuizQuestion[] = [
  { question: '¿Qué son los Signals en Angular moderno?', options: ['Un decorador para rutas', 'Un primitivo reactivo que notifica automáticamente a quien lo lee cuando su valor cambia', 'Un reemplazo de TypeScript', 'Un servicio HTTP'], answer: 1 },
  { question: '¿Qué diferencia hay entre un componente standalone y uno declarado en un NgModule?', options: ['Ninguna', 'El standalone declara sus propias dependencias (imports) sin un NgModule contenedor', 'Los standalone no pueden tener plantillas', 'Los NgModules ya no existen en Angular'], answer: 1 },
  { question: '¿Para qué sirve la inyección de dependencias en Angular?', options: ['Para estilos CSS', 'Para proveer instancias compartidas (servicios) sin que los componentes las instancien directamente', 'Para definir rutas', 'Para compilar plantillas'], answer: 1 },
  { question: '¿Qué diferencia hay entre un formulario reactivo y uno template-driven?', options: ['Son idénticos', 'El reactivo define estructura y validaciones en TypeScript con FormGroup/FormControl; el template-driven usa ngModel en el HTML', 'El template-driven es siempre más testeable', 'Los reactivos no admiten validaciones'], answer: 1 },
  { question: '¿Qué problema resuelven los interceptores de HttpClient?', options: ['Enrutar componentes', 'Interceptar peticiones/respuestas HTTP para añadir headers, manejar errores o loguear de forma centralizada', 'Compilar plantillas', 'Aplicar estilos globales'], answer: 1 },
  { question: '¿Qué operador de RxJS cancela una petición anterior si llega una nueva antes de completarse?', options: ['mergeMap', 'switchMap', 'concatMap', 'tap'], answer: 1 },
  { question: '¿Qué ventaja da Server-Side Rendering (SSR) en Angular?', options: ['Elimina la necesidad de tests', 'Mejora la primera pintura y el SEO al renderizar HTML en el servidor antes de hidratar', 'Hace innecesario el bundler', 'Solo sirve para apps offline'], answer: 1 },
  { question: '¿Qué es "zoneless" en la detección de cambios de Angular?', options: ['Un error de configuración', 'Un modo que no depende de Zone.js y se basa en signals para saber qué actualizar', 'Una forma de desactivar el routing', 'Un tipo de módulo'], answer: 1 },
  { question: '¿Qué usa TestBed en un test de Angular?', options: ['Pruebas end-to-end con Playwright/Cypress', 'Instanciar y testear un componente de forma aislada', 'Pruebas de carga', 'Solo linting'], answer: 1 },
  { question: '¿Qué resuelve un router guard como CanActivate?', options: ['Estiliza rutas', 'Controla si se permite la navegación a una ruta según una condición (ej. autenticación)', 'Define el layout de la página', 'Cachea peticiones HTTP'], answer: 1 },
];

export const REACT_QUIZ: QuizQuestion[] = [
  { question: '¿Qué es JSX?', options: ['Un lenguaje de programación nuevo', 'Una extensión de sintaxis HTML-like dentro de JavaScript, compilada a llamadas de función', 'Un framework de testing', 'Un motor de bases de datos'], answer: 1 },
  { question: '¿Qué hook se usa para ejecutar efectos secundarios (fetch, subscripciones) tras el render?', options: ['useState', 'useEffect', 'useMemo', 'useRef'], answer: 1 },
  { question: '¿Qué problema resuelve la Context API?', options: ['Enrutamiento', 'Compartir datos entre componentes sin pasar props manualmente por cada nivel (prop drilling)', 'Estilizar componentes', 'Optimizar el bundle'], answer: 1 },
  { question: '¿Qué diferencia hay entre estado local (useState) y estado global (Redux/Zustand)?', options: ['Son lo mismo', 'El local vive y muere con el componente; el global se comparte entre componentes no relacionados', 'El global es siempre más rápido', 'useState no permite objetos'], answer: 1 },
  { question: '¿Qué evita useMemo?', options: ['Los efectos secundarios', 'Recalcular un valor costoso en cada render si sus dependencias no cambiaron', 'Los re-renders del componente padre', 'Los errores de sintaxis'], answer: 1 },
  { question: '¿Qué son los Server Components en React/Next.js moderno?', options: ['Componentes que solo renderizan en el cliente', 'Componentes que se renderizan en el servidor y no envían su JS al cliente', 'Un tipo de base de datos', 'Middleware de autenticación'], answer: 1 },
  { question: '¿Qué mide React Testing Library al testear un componente?', options: ['El código fuente interno', 'El comportamiento desde la perspectiva del usuario', 'Solo el rendimiento', 'La cobertura de CSS'], answer: 1 },
  { question: '¿Qué causa re-renders innecesarios en una lista de componentes hijos?', options: ['Usar TypeScript', 'No memoizar props/funciones que cambian de referencia en cada render del padre', 'Usar JSX', 'Definir el componente como función'], answer: 1 },
  { question: '¿Qué resuelve React Router en una SPA?', options: ['El manejo de estado global', 'La navegación entre vistas sincronizando la URL sin recargar el documento', 'El fetching de datos', 'El bundling'], answer: 1 },
  { question: '¿Qué ventaja tiene tipar los props de un componente con TypeScript?', options: ['Ninguna práctica', 'Detecta en compilación errores de props faltantes o de tipo incorrecto', 'Hace el componente más lento', 'Reemplaza a PropTypes en runtime'], answer: 1 },
];

export const JAVA_QUIZ: QuizQuestion[] = [
  { question: '¿Qué papel cumple la JVM respecto al bytecode compilado por javac?', options: ['Lo convierte de vuelta a texto fuente', 'Lo interpreta y compila JIT a código nativo en tiempo de ejecución', 'Solo lo almacena', 'Lo ejecuta como binario nativo sin intérprete'], answer: 1 },
  { question: '¿Qué diferencia hay entre una interfaz y una clase abstracta en Java moderno?', options: ['Son idénticas', 'Una clase puede implementar varias interfaces pero extender solo una clase, y las interfaces admiten default methods', 'Las interfaces no pueden tener métodos con cuerpo', 'Las clases abstractas no pueden tener constructores'], answer: 1 },
  { question: '¿Qué garantiza try-with-resources con un recurso AutoCloseable?', options: ['Nada especial', 'Que el recurso se cierre automáticamente al salir del bloque, incluso con excepción', 'Que el código sea más rápido', 'Que no se lancen excepciones'], answer: 1 },
  { question: '¿Qué ventaja aportan los Streams sobre iterar manualmente con bucles for?', options: ['Siempre son más rápidos', 'Permiten expresar transformaciones (map/filter/reduce) de forma declarativa', 'Eliminan la necesidad de colecciones', 'Solo funcionan con arrays primitivos'], answer: 1 },
  { question: '¿Qué resuelven los virtual threads frente a los hilos de plataforma tradicionales?', options: ['Nada nuevo', 'Miles de hilos ligeros sin el costo de los hilos del SO, ideales para I/O bloqueante', 'Reemplazan a los streams', 'Solo sirven para UI'], answer: 1 },
  { question: '¿Qué aportan los records en Java moderno?', options: ['Un nuevo tipo de colección', 'Una forma concisa de declarar clases inmutables de datos con equals/hashCode/toString generados', 'Reemplazan las interfaces', 'Sirven solo para testing'], answer: 1 },
  { question: '¿Qué diferencia hay entre Maven y Gradle?', options: ['Son idénticos en sintaxis', 'Maven usa XML declarativo; Gradle usa un DSL más flexible con builds incrementales', 'Gradle no soporta dependencias transitivas', 'Maven es más nuevo que Gradle'], answer: 1 },
  { question: '¿Qué diferencia hay entre un mock y un stub en un test con Mockito?', options: ['Son lo mismo', 'El mock permite verificar interacciones además de proveer respuestas predefinidas', 'Los stubs no se pueden usar en JUnit 5', 'Los mocks solo sirven para bases de datos'], answer: 1 },
  { question: '¿Qué hace el Garbage Collector de la JVM?', options: ['Compila el código a bytecode', 'Libera automáticamente la memoria de objetos ya no alcanzables', 'Gestiona los hilos de ejecución', 'Optimiza las consultas SQL'], answer: 1 },
  { question: '¿Qué ventaja da el pattern matching con switch sobre instanceof + cast manual?', options: ['Ninguna', 'Combina comprobación de tipo, cast y extracción en una expresión exhaustiva más segura', 'Solo funciona con enums', 'Elimina la necesidad de clases selladas'], answer: 1 },
];

export const SPRING_BOOT_QUIZ: QuizQuestion[] = [
  { question: '¿Qué resuelve la Inversión de Control (IoC) en Spring?', options: ['Nada relevante', 'El framework gestiona el ciclo de vida de los beans en vez de instanciarlos manualmente el código', 'Reemplaza a Java', 'Solo aplica a controladores REST'], answer: 1 },
  { question: '¿Qué anotación expone un método como endpoint HTTP GET en Spring Web?', options: ['@Service', '@GetMapping', '@Entity', '@Configuration'], answer: 1 },
  { question: '¿Qué papel cumple Spring Data JPA sobre Hibernate?', options: ['Lo reemplaza completamente', 'Añade repositorios que generan consultas CRUD/JPQL automáticamente sobre un proveedor JPA', 'Es un motor de base de datos', 'Sustituye a SQL'], answer: 1 },
  { question: '¿Qué hace un SecurityFilterChain en Spring Security?', options: ['Compila el proyecto', 'Define las reglas de autorización y los filtros que procesan cada petición HTTP', 'Genera el JSON de respuesta', 'Configura la base de datos'], answer: 1 },
  { question: '¿Para qué sirven los perfiles (@Profile, application-{profile}.yml)?', options: ['Para versionar el código', 'Para tener configuración distinta según el entorno sin cambiar el código', 'Para definir roles de usuario', 'Solo para logging'], answer: 1 },
  { question: '¿Qué expone Spring Boot Actuator?', options: ['Endpoints de negocio', 'Endpoints operacionales de salud, métricas e información del proceso', 'El código fuente compilado', 'Los tests unitarios'], answer: 1 },
  { question: '¿Qué diferencia hay entre WebFlux (reactivo) y Spring MVC (imperativo)?', options: ['Son idénticos en el modelo de ejecución', 'WebFlux usa un modelo no bloqueante (Mono/Flux) sobre pocos hilos; MVC usa un hilo por petición', 'MVC es siempre más rápido', 'WebFlux no soporta bases de datos'], answer: 1 },
  { question: '¿Qué resuelve Spring Cloud en microservicios?', options: ['Nada específico', 'La coordinación entre servicios: dónde están, cómo se configuran y cómo se enrutan', 'Reemplaza a Docker', 'Solo aplica a monolitos'], answer: 1 },
  { question: '¿Qué aporta usar Kafka/RabbitMQ frente a llamadas REST síncronas entre servicios?', options: ['Nada, siempre es peor', 'Desacopla productores y consumidores en el tiempo, dando resiliencia', 'Elimina la necesidad de serializar datos', 'Sustituye a la base de datos'], answer: 1 },
  { question: '¿Qué formato permite ejecutar una app Spring Boot con java -jar sin servidor externo?', options: ['WAR en un Tomcat externo obligatorio', 'Fat/executable JAR con servidor embebido incluido', 'Un script bash', 'Un archivo .properties'], answer: 1 },
];

export const KOTLIN_MULTIPLATFORM_QUIZ: QuizQuestion[] = [
  { question: '¿Qué resuelve Kotlin Multiplatform (KMP)?', options: ['Compilar Kotlin a Python', 'Compartir lógica de negocio entre Android, iOS y otras plataformas desde un único código Kotlin', 'Reemplazar Swift en iOS obligatoriamente', 'Solo sirve para apps web'], answer: 1 },
  { question: '¿Qué son las coroutines en Kotlin?', options: ['Hilos del sistema operativo', 'Un framework para código asíncrono ligero que se suspende sin bloquear el hilo', 'Un tipo de colección', 'Un patrón de diseño estructural'], answer: 1 },
  { question: '¿Qué representa un Flow en Kotlin?', options: ['Un único valor calculado una vez', 'Un flujo asíncrono de múltiples valores emitidos en el tiempo', 'Una excepción controlada', 'Un tipo de test'], answer: 1 },
  { question: 'En arquitectura KMP típica, ¿qué vive en commonMain frente a androidMain/iosMain?', options: ['Todo vive en commonMain sin excepción', 'La lógica compartida vive en commonMain; el código específico de plataforma vive en cada source set', 'La UI siempre vive en commonMain', 'No existe separación por plataforma'], answer: 1 },
  { question: '¿Qué papel cumple expect/actual en KMP?', options: ['Declarar tests', 'Declarar en código común una API que cada plataforma implementa con su versión nativa', 'Definir rutas de navegación', 'Configurar CI/CD'], answer: 1 },
  { question: '¿Qué ventaja da Ktor Client sobre escribir networking nativo por separado en cada plataforma?', options: ['Ninguna, hay que reescribirlo igual', 'Permite compartir la misma lógica HTTP entre plataformas desde commonMain', 'Solo funciona en el servidor', 'Reemplaza a JSON'], answer: 1 },
  { question: '¿Qué resuelve SQLDelight en un proyecto KMP?', options: ['Genera UI automáticamente', 'Genera APIs de acceso a base de datos type-safe a partir de SQL compartido', 'Sustituye a las coroutines', 'Es un framework de testing'], answer: 1 },
  { question: '¿Qué permite Compose Multiplatform que Jetpack Compose por sí solo no permite?', options: ['Nada distinto', 'Compartir el mismo código de UI entre Android, iOS, desktop y web', 'Solo funciona en Android', 'Elimina la necesidad de ViewModels'], answer: 1 },
  { question: '¿Qué mecanismo permite consumir código Kotlin compartido desde Swift en iOS?', options: ['No es posible', 'Kotlin/Native genera un framework con binding Objective-C/Swift', 'Hay que reescribir todo en Swift', 'Solo mediante una API REST intermedia'], answer: 1 },
  { question: '¿Qué debe verificar un test en commonTest?', options: ['Solo el comportamiento en Android', 'Que la lógica compartida se comporte igual sin depender de APIs de una sola plataforma', 'Solo el renderizado visual en iOS', 'Nada, los tests van siempre por plataforma'], answer: 1 },
];

export const ANDROID_QUIZ: QuizQuestion[] = [
  { question: '¿Qué evita que un ViewModel pierda su estado al rotar la pantalla?', options: ['Nada, siempre se pierde', 'Su ciclo de vida está ligado al scope, no a la Activity recreada', 'Guardar el estado en SharedPreferences manualmente siempre', 'Usar solo variables estáticas'], answer: 1 },
  { question: '¿Qué diferencia hay entre lo que sobrevive un ViewModel y SavedStateHandle?', options: ['Son idénticos', 'El ViewModel sobrevive rotación pero no la muerte del proceso; SavedStateHandle sí persiste ante la muerte del proceso', 'SavedStateHandle no persiste nada', 'No hay diferencia práctica'], answer: 1 },
  { question: '¿Qué es Jetpack Compose?', options: ['Un motor de bases de datos', 'Un toolkit declarativo para construir UI describiendo el estado en vez de manipular vistas', 'Un reemplazo de Kotlin', 'Un framework de testing exclusivamente'], answer: 1 },
  { question: '¿Qué resuelve StateFlow combinado con Compose?', options: ['Nada relacionado con UI', 'Expone un estado observable que Compose recolecta para recomponer la UI automáticamente', 'Sustituye a Room', 'Gestiona la navegación'], answer: 1 },
  { question: '¿Qué ventaja da Room sobre usar SQLite directamente con queries en texto plano?', options: ['Ninguna', 'Verifica las queries en tiempo de compilación y genera código type-safe', 'Es más lento siempre', 'Elimina la necesidad de una base de datos'], answer: 1 },
  { question: '¿Qué problema resuelve Hilt en una app Android grande?', options: ['El renderizado de UI', 'Evita instanciar y conectar manualmente las dependencias de cada clase', 'El manejo de permisos', 'La navegación entre pantallas'], answer: 1 },
  { question: '¿Cuándo conviene usar WorkManager para trabajo en segundo plano?', options: ['Para actualizar la UI en tiempo real', 'Para tareas diferibles garantizadas incluso si la app se cierra o el dispositivo se reinicia', 'Para animaciones', 'Nunca, siempre es mejor un hilo manual'], answer: 1 },
  { question: '¿Qué mide un test instrumentado (androidTest) que uno local no puede?', options: ['Nada distinto', 'El comportamiento real sobre un dispositivo/emulador, incluyendo componentes del framework', 'Solo la sintaxis de Kotlin', 'El tiempo de compilación'], answer: 1 },
  { question: '¿Qué aporta Material 3 respecto a versiones anteriores?', options: ['Nada nuevo', 'Theming dinámico (Material You) y mejor soporte de accesibilidad', 'Reemplaza a Compose', 'Solo cambia los íconos'], answer: 1 },
  { question: '¿Qué exige Google Play antes de publicar una app en producción?', options: ['Ninguno en particular', 'Cumplir políticas de la tienda, firmar el App Bundle y completar la ficha en Play Console', 'Solo tener más de 1000 descargas', 'Publicar el código fuente públicamente'], answer: 1 },
];

export const IOS_QUIZ: QuizQuestion[] = [
  { question: '¿Qué modelo de concurrencia introduce async/await en Swift moderno?', options: ['Callbacks anidados manuales', 'Funciones que se suspenden sin bloquear el hilo, con manejo de errores integrado', 'Hilos POSIX manuales', 'Solo temporizadores'], answer: 1 },
  { question: '¿Qué caracteriza a SwiftUI frente a UIKit?', options: ['Es imperativo igual que UIKit', 'Es declarativo: la UI se describe como función del estado y se actualiza automáticamente', 'No soporta animaciones', 'Reemplaza a Swift como lenguaje'], answer: 1 },
  { question: '¿Qué hace el property wrapper @State en SwiftUI?', options: ['Define una constante', 'Declara una fuente de verdad de estado local que, al cambiar, recompone la UI', 'Conecta con una base de datos remota', 'Define el punto de entrada de la app'], answer: 1 },
  { question: '¿Qué resuelve SwiftData sobre persistir datos manualmente?', options: ['Nada distinto', 'Ofrece un modelo de persistencia declarativo integrado con SwiftUI mediante macros', 'Es solo para imágenes', 'Sustituye a URLSession'], answer: 1 },
  { question: '¿Qué papel cumple Combine en una app iOS?', options: ['Compilar el proyecto', 'Proveer programación reactiva para componer flujos asíncronos (publishers/subscribers)', 'Gestionar la navegación', 'Firmar la app para distribución'], answer: 1 },
  { question: '¿Qué separa el patrón MVVM en una app SwiftUI?', options: ['Nada, todo va en un solo archivo', 'Separa lógica de presentación/estado (ViewModel) de la vista y el modelo, facilitando testing', 'MVVM elimina la necesidad de modelos', 'Solo aplica a UIKit'], answer: 1 },
  { question: '¿Qué verifica un test de UI (XCUITest) que un test unitario no cubre?', options: ['Nada distinto', 'La interacción real del usuario con la interfaz gráfica en ejecución', 'Solo la sintaxis de Swift', 'El tamaño del binario'], answer: 1 },
  { question: '¿Por qué es importante seguir las Human Interface Guidelines (HIG) de Apple?', options: ['No es relevante para la App Store', 'Asegura consistencia y accesibilidad, e influye en la revisión de Apple', 'Solo afecta el rendimiento', 'Es opcional y sin impacto real'], answer: 1 },
  { question: '¿Qué requiere Apple antes de publicar una app en el App Store?', options: ['Nada en particular', 'Pasar la revisión de App Store Connect, firmar con certificado válido y completar la ficha de la app', 'Publicar el código fuente', 'Una suscripción de pago obligatoria en la app'], answer: 1 },
  { question: '¿Qué ventaja da async let frente a múltiples await secuenciales?', options: ['Ninguna, ejecuta igual', 'Permite lanzar varias tareas en paralelo y esperarlas juntas', 'Solo funciona con closures', 'Bloquea el hilo principal'], answer: 1 },
];

export const FLUTTER_QUIZ: QuizQuestion[] = [
  { question: '¿Qué diferencia hay entre StatelessWidget y StatefulWidget?', options: ['Son idénticos', 'StatelessWidget no mantiene estado mutable propio; StatefulWidget mantiene un State que puede disparar su propio rebuild', 'StatefulWidget no puede tener hijos', 'StatelessWidget es siempre más lento'], answer: 1 },
  { question: '¿Qué modelo de layout usa Flutter?', options: ['CSS Flexbox directamente', 'Un árbol de widgets con constraints hacia abajo y tamaños reportados hacia arriba', 'XML de Android', 'Auto Layout de iOS'], answer: 1 },
  { question: '¿Qué resuelve Navigator en Flutter?', options: ['El manejo de estado global', 'La navegación mediante una pila de rutas que se apilan y desapilan', 'El acceso a red', 'La persistencia local'], answer: 1 },
  { question: '¿Qué papel cumple setState en la gestión de estado más básica de Flutter?', options: ['Define rutas', 'Notifica al framework que el estado interno cambió y debe reconstruirse ese subárbol', 'Realiza peticiones HTTP', 'Compila el proyecto'], answer: 1 },
  { question: '¿Qué ventaja da Provider/Riverpod/Bloc sobre setState para apps grandes?', options: ['Ninguna, setState siempre es mejor', 'Permite compartir estado entre widgets no relacionados sin pasar callbacks por cada nivel', 'Elimina la necesidad de widgets', 'Solo sirve para animaciones'], answer: 1 },
  { question: '¿Qué permiten los "platform channels" en Flutter?', options: ['Nada relevante', 'Comunicar código Dart con APIs nativas de Android/iOS no disponibles en Flutter', 'Sustituyen a los widgets', 'Son solo para testing'], answer: 1 },
  { question: '¿Qué causa comúnmente jank (caídas de frames) en una app Flutter?', options: ['Usar widgets const', 'Reconstruir subárboles grandes o hacer trabajo costoso de forma síncrona en build', 'Usar Dart null-safety', 'Declarar StatelessWidgets'], answer: 1 },
  { question: '¿Qué verifica un widget test frente a un test unitario puro de Dart?', options: ['Nada distinto', 'Que un widget se construye y responde a interacciones simuladas dentro de un árbol real', 'Solo la lógica de negocio sin UI', 'El rendimiento en un dispositivo físico'], answer: 1 },
  { question: '¿Qué resuelve usar ThemeData y widgets Material/Cupertino adaptativos?', options: ['Nada, hay que estilizar cada widget individualmente', 'Centraliza estilos y adapta la apariencia a las convenciones de Android/iOS', 'Sustituye la necesidad de accesibilidad', 'Solo afecta a los íconos'], answer: 1 },
  { question: '¿Qué requiere publicar la misma app Flutter en Google Play y App Store?', options: ['Un único paso combinado sin diferencias', 'Cumplir los requisitos de cada tienda por separado aunque el código compartido sea el mismo', 'Reescribir la app en Kotlin y Swift', 'Nada, se publica automáticamente al hacer build'], answer: 1 },
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
  { categoria: 'Almacenamiento de objetos', descripcion: 'Guarda archivos, imágenes y backups sin gestionar servidores.', aws: 'S3 (puerto 4566)', azure: 'Blob Storage (puerto 4577)', gcp: 'Cloud Storage (puerto 4588)', modulo: 2 },
  { categoria: 'Colas de mensajes', descripcion: 'Desacopla productores y consumidores con entrega garantizada.', aws: 'SQS', azure: 'Service Bus Queues (AMQP 5673)', gcp: 'Pub/Sub + Cloud Tasks', modulo: 3 },
  { categoria: 'Base de datos NoSQL', descripcion: 'Clave-valor y documentos con escala automática.', aws: 'DynamoDB', azure: 'Cosmos DB', gcp: 'Firestore / Datastore', modulo: 4 },
  { categoria: 'Secretos y credenciales', descripcion: 'Almacena y rota contraseñas, API keys y certificados.', aws: 'Secrets Manager + KMS', azure: 'Key Vault (puerto 4577)', gcp: 'Secret Manager (puerto 4588)', modulo: 10 },
  { categoria: 'Cómputo serverless', descripcion: 'Ejecuta código sin aprovisionar servidores.', aws: 'Lambda (Docker real en cloud local)', azure: 'Azure Functions (HTTP + Timer)', gcp: 'Cloud Functions / Cloud Run', modulo: 5 },
  { categoria: 'API HTTP / REST', descripcion: 'Expone funciones como endpoints HTTP seguros.', aws: 'API Gateway v1 y v2', azure: 'API Management', gcp: 'Cloud Endpoints', modulo: 6 },
  { categoria: 'Notificaciones push (fan-out)', descripcion: 'Distribuye mensajes a múltiples suscriptores a la vez.', aws: 'SNS', azure: 'Event Grid', gcp: 'Pub/Sub Topics', modulo: 11 },
  { categoria: 'Bus de eventos de dominio', descripcion: 'Enruta eventos con filtros y transformaciones declarativas.', aws: 'EventBridge', azure: 'Event Hubs (AMQP 5672)', gcp: 'Eventarc', modulo: 11 },
  { categoria: 'Streaming en tiempo real', descripcion: 'Procesa flujos de datos con múltiples consumidores paralelos.', aws: 'Kinesis + MSK (Kafka real)', azure: 'Event Hubs + Kafka', gcp: 'Pub/Sub + Managed Kafka', modulo: 17 },
  { categoria: 'Observabilidad y logs', descripcion: 'Logs, métricas y alarmas de toda la arquitectura.', aws: 'CloudWatch', azure: 'Azure Monitor', gcp: 'Cloud Monitoring + Logging', modulo: 12 },
  { categoria: 'Base de datos relacional', descripcion: 'PostgreSQL/MySQL gestionado con backups automáticos.', aws: 'RDS (PostgreSQL real en cloud local)', azure: 'Azure SQL / PostgreSQL Flexible', gcp: 'Cloud SQL / AlloyDB', modulo: 13 },
  { categoria: 'Contenedores gestionados', descripcion: 'Corre contenedores con orquestación sin gestionar nodos.', aws: 'ECS / EKS (Docker real en cloud local)', azure: 'AKS / Container Apps', gcp: 'GKE Autopilot / Cloud Run', modulo: 14 },
  { categoria: 'Infraestructura como código', descripcion: 'Describe y versiona tu infraestructura en archivos de texto.', aws: 'CloudFormation', azure: 'Bicep / ARM Templates', gcp: 'Deployment Manager / Terraform', modulo: 15 },
  { categoria: 'Orquestación de flujos', descripcion: 'Coordina pasos con lógica condicional y reintentos.', aws: 'Step Functions', azure: 'Logic Apps / Durable Functions', gcp: 'Workflows', modulo: 16 },
  { categoria: 'Autenticación de usuarios', descripcion: 'Registro, login y sesiones para usuarios finales.', aws: 'Cognito (OAuth 2.0 real)', azure: 'Entra ID B2C', gcp: 'Identity Platform', modulo: 18 },
  { categoria: 'Consultas SQL analíticas', descripcion: 'SQL sobre datos en object storage sin moverlos.', aws: 'Athena (DuckDB en cloud local)', azure: 'Synapse Serverless', gcp: 'BigQuery', modulo: 19 },
  { categoria: 'ETL y catálogo de datos', descripcion: 'Descubre, transforma y prepara datos para analítica.', aws: 'Glue Catalog + Crawler', azure: 'Data Factory', gcp: 'Dataflow / Data Catalog', modulo: 19 },
  { categoria: 'IA generativa (LLMs)', descripcion: 'Accede a modelos de lenguaje grande con API REST.', aws: 'Bedrock Runtime (stub en cloud local)', azure: 'Azure OpenAI Service', gcp: 'Vertex AI / Gemini API', modulo: 20 },
  { categoria: 'OCR / Extracción de documentos', descripcion: 'Extrae texto y datos de imágenes y PDFs.', aws: 'Textract (cloud local)', azure: 'Document Intelligence', gcp: 'Document AI', modulo: 20 },
  { categoria: 'Registro de imágenes Docker', descripcion: 'Almacena y versiona imágenes de contenedor privadas.', aws: 'ECR (cloud local)', azure: 'Container Registry', gcp: 'Artifact Registry', modulo: 14 },
  { categoria: 'Caché en memoria', descripcion: 'Acelera lecturas con Redis real gestionado.', aws: 'ElastiCache (Redis real en cloud local)', azure: 'Azure Cache for Redis', gcp: 'Memorystore', modulo: 13 },
  { categoria: 'Configuración externalizada', descripcion: 'Parámetros de app sin reiniciar ni tocar código.', aws: 'SSM Parameter Store', azure: 'App Configuration local', gcp: 'Runtime Configurator', modulo: 10 },
  { categoria: 'Correo electrónico transaccional', descripcion: 'Envía y recibe correos desde tu aplicación.', aws: 'SES (cloud local)', azure: 'Communication Services', gcp: 'Gmail API (Workspace)', modulo: 11 },
  { categoria: 'DNS gestionado', descripcion: 'Gestiona registros DNS con alta disponibilidad.', aws: 'Route 53 (cloud local)', azure: 'Azure DNS', gcp: 'Cloud DNS', modulo: 14 },
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
  { id: 'cloud', name: 'Cloud Local — AWS, Azure y GCP', shortName: 'Cloud', tagline: 'Servicios cloud reales en local, sin pagar ni crear cuentas.', color: '#137c8b', icon: 'cloud-cog', modules: COURSE_MODULES, quiz: CLOUD_QUIZ },
  { id: 'devops', name: 'DevOps', shortName: 'DevOps', tagline: 'Linux, Docker, CI/CD, Kubernetes e infraestructura como código.', color: '#475569', icon: 'git-branch', modules: DEVOPS_MODULES, quiz: DEVOPS_QUIZ },
  { id: 'javascript', name: 'JavaScript de cero a master', shortName: 'JavaScript', tagline: 'El lenguaje base de la web: del primer script al rendimiento avanzado.', color: '#e9b400', icon: 'braces', modules: JAVASCRIPT_MODULES, quiz: JAVASCRIPT_QUIZ },
  { id: 'node', name: 'Node.js de cero a master', shortName: 'Node.js', tagline: 'Backend en JavaScript: APIs, bases de datos y producción.', color: '#3c873a', icon: 'server', modules: NODE_MODULES, quiz: NODE_QUIZ },
  { id: 'angular', name: 'Angular — última versión y migraciones', shortName: 'Angular', tagline: 'Componentes, signals y arquitectura moderna sin NgModules.', color: '#dd0031', icon: 'shield', modules: ANGULAR_MODULES, quiz: ANGULAR_QUIZ },
  { id: 'react', name: 'React de cero a master', shortName: 'React', tagline: 'Hooks, estado, datos y frameworks full-stack con React.', color: '#149eca', icon: 'atom', modules: REACT_MODULES, quiz: REACT_QUIZ },
  { id: 'java', name: 'Java de cero a avanzado', shortName: 'Java', tagline: 'POO, concurrencia y JVM moderna, de Java 8 a Java 21.', color: '#5382a1', icon: 'coffee', modules: JAVA_MODULES, quiz: JAVA_QUIZ },
  { id: 'spring-boot', name: 'Spring Boot', shortName: 'Spring Boot', tagline: 'APIs, persistencia, seguridad y microservicios con Spring.', color: '#6db33f', icon: 'leaf', modules: SPRING_BOOT_MODULES, quiz: SPRING_BOOT_QUIZ },
  { id: 'kotlin-multiplatform', name: 'Kotlin Multiplatform', shortName: 'Kotlin MP', tagline: 'Lógica compartida entre Android e iOS con Kotlin.', color: '#7f52ff', icon: 'layers', modules: KOTLIN_MULTIPLATFORM_MODULES, quiz: KOTLIN_MULTIPLATFORM_QUIZ },
  { id: 'android', name: 'Android con Jetpack Compose', shortName: 'Android', tagline: 'Apps Android nativas modernas con Compose y Kotlin.', color: '#3ddc84', icon: 'smartphone', modules: ANDROID_MODULES, quiz: ANDROID_QUIZ },
  { id: 'ios', name: 'iOS con SwiftUI', shortName: 'iOS', tagline: 'Apps iOS nativas con Swift, SwiftUI y concurrencia moderna.', color: '#0a84ff', icon: 'apple', modules: IOS_MODULES, quiz: IOS_QUIZ },
  { id: 'flutter', name: 'Flutter', shortName: 'Flutter', tagline: 'Una base de código para Android, iOS y web con Dart.', color: '#02569b', icon: 'wind', modules: FLUTTER_MODULES, quiz: FLUTTER_QUIZ },
];

export const findTrack = (trackId: string): Track | undefined => TRACKS.find(t => t.id === trackId);
