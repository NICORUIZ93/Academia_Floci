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

// ── Track Cloud Local ────────────────────────────────────────────────────────
// Módulos 0-9: ruta base "Academia Floci" (Docker, AWS local con Floci, S3, SQS,
// DynamoDB, Lambda, API Gateway, IAM, Azure/GCP y proyecto final). Módulos 10-21:
// contenido avanzado ya existente (Secrets, SNS/EventBridge, CloudWatch, RDS,
// ECR/ECS, CloudFormation, Step Functions, Kinesis/MSK, Cognito, Athena/Glue,
// Bedrock y el proyecto integrador multi-nube), conservado y renumerado para
// continuar después de la ruta base sin perder contenido.
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
