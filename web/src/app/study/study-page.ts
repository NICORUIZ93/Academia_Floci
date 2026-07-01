import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { COURSE_MODULES, CourseModule } from '../course-data';

type Level = 'Básico' | 'Medio' | 'Avanzado' | 'Master';
type Tab = 'teoria' | 'ejemplo' | 'laboratorio' | 'ejercicio' | 'examen';

interface LabStep {
  title: string;
  command: string;
  verify: string;
}

interface Topic {
  id: string;
  moduleId: number;
  title: string;
  level: Level;
  minutes: number;
  intro: string[];
  objectives: string[];
  theory: { title: string; body: string; bullets?: string[] }[];
  comparison?: { left: string; right: string; leftDetail: string; rightDetail: string };
  diagram: string;
  code: string;
  labSteps: LabStep[];
  lineByLine: string[];
  exercise: string;
  expected: string[];
  hints: string[];
  commonErrors: string[];
  summary: string[];
  resources: { label: string; url: string }[];
  quiz: { question: string; answer: string }[];
}

interface StudyModule {
  id: string;
  title: string;
  description: string;
  source?: CourseModule;
  topics: Topic[];
}

interface TopicBlueprint {
  title: string;
  level: Level;
  minutes: number;
  focus: string;
  lab: string;
  objectives: string[];
  concepts: string[];
  cloud?: string;
}

interface Badge {
  name: string;
  description: string;
  unlocked: boolean;
}

const STORAGE_KEY = 'floci-study-progress-v2';
const THEME_KEY = 'floci-study-theme-v2';
const ANSWERS_KEY = 'floci-study-answers-v2';
const EDITOR_KEY = 'floci-study-editor-v1';
const LAB_KEY = 'floci-study-labs-v1';

const resources = [
  { label: 'Documentación Floci', url: 'https://floci.io/' },
  { label: 'AWS CLI', url: 'https://docs.aws.amazon.com/cli/' },
  { label: 'AWS SDKs', url: 'https://aws.amazon.com/developer/tools/' },
];

const studyStandards = [
  'Ruta visible de 0 a 18 módulos con subtemas en el panel lateral.',
  'Cada tema tiene introducción, objetivos, teoría, ejemplo, ejercicio, errores, resumen y examen.',
  'Progreso global, progreso por módulo, respuestas guardadas en localStorage e insignias.',
  'Búsqueda por servicio, nube, nivel o concepto.',
  'Modo claro/oscuro, diseño responsive y textos largos con saltos seguros.',
  'Laboratorios con AWS, Azure y GCP; no solo AWS.',
  'Proyecto final obligatorio que integra almacenamiento, colas, NoSQL, secretos, funciones, API, eventos, observabilidad, RDS, contenedores, IaC, workflows, streams, auth, analytics e IA.',
  'Exportación del cuaderno de progreso para estudiar sin depender de la IA.',
];

const topicBlueprints: Record<number, TopicBlueprint[]> = {
  0: [
    {
      title: 'Preparar tu computador desde cero',
      level: 'Básico',
      minutes: 45,
      focus: 'Aprender a abrir una terminal, instalar herramientas y distinguir Docker, CLI, SDK, endpoint y variable de entorno.',
      lab: 'Instala Docker Desktop, abre Terminal en Mac/Linux o PowerShell en Windows, ejecuta docker version y luego floci status.',
      objectives: ['Abrir una consola sin depender de un IDE.', 'Instalar Docker y verificar que esté encendido.', 'Entender qué comando solo valida y cuál modifica recursos.'],
      concepts: ['Terminal', 'Docker Desktop', 'PowerShell', 'Terminal macOS', 'Shell Linux', 'PATH', 'variable de entorno'],
    },
    {
      title: 'Floci AWS, Azure y GCP en local',
      level: 'Básico',
      minutes: 50,
      focus: 'Levantar los tres emuladores y entender que el mismo patrón se repite: servicio local, endpoint local y credenciales falsas.',
      lab: 'Ejecuta floci start, floci az start y docker run -p 4588:4588 floci/floci-gcp:latest; verifica cada estado.',
      objectives: ['Diferenciar AWS real de Floci local.', 'Configurar endpoint y credenciales sin cuenta real.', 'Reconocer cuándo un laboratorio habla con localhost.'],
      concepts: ['floci start', 'floci az start', 'floci-gcp', 'localhost', 'endpoint local', 'credenciales dummy'],
      cloud: 'AWS + Azure + GCP',
    },
  ],
  1: [
    {
      title: 'Objetos: bucket, container y blob',
      level: 'Básico',
      minutes: 40,
      focus: 'Comprender por qué S3 bucket, Azure container y GCP bucket resuelven el mismo problema: guardar archivos como objetos.',
      lab: 'Crea hola.txt, súbelo a S3, Azure Blob y GCP Cloud Storage, descárgalo y compara el contenido.',
      objectives: ['Explicar objeto, key, metadata y contenedor.', 'Subir y descargar archivos en tres proveedores.', 'Verificar integridad con el archivo descargado.'],
      concepts: ['S3 bucket', 'Azure Blob container', 'GCP Cloud Storage', 'object key', 'metadata'],
      cloud: 'S3 / Blob Storage / Cloud Storage',
    },
    {
      title: 'Versionado, lifecycle y evidencia',
      level: 'Medio',
      minutes: 45,
      focus: 'Aprender qué ocurre cuando subes dos veces el mismo archivo y cómo versionado evita pérdidas accidentales.',
      lab: 'Activa versionado en S3, sube dos versiones de hola.txt y lista versiones con aws s3api list-object-versions.',
      objectives: ['Detectar sobrescritura de objetos.', 'Leer versiones anteriores.', 'Crear evidencia clara para el cuaderno.'],
      concepts: ['versionado', 'lifecycle', 'sobrescritura', 'retención', 'evidencia'],
    },
  ],
  2: [
    {
      title: 'Colas, mensajes y consumidores',
      level: 'Básico',
      minutes: 45,
      focus: 'Separar productor y consumidor para que una app no dependa de que todo responda al mismo tiempo.',
      lab: 'Crea una cola SQS, envía un mensaje, recíbelo, observa el ReceiptHandle y elimínalo.',
      objectives: ['Diferenciar enviar, recibir y borrar.', 'Entender visibility timeout.', 'Explicar por qué una cola ayuda cuando un servicio falla.'],
      concepts: ['SQS', 'Service Bus', 'Pub/Sub subscription', 'producer', 'consumer', 'ReceiptHandle'],
      cloud: 'SQS / Service Bus / Pub/Sub',
    },
    {
      title: 'Idempotencia, FIFO y DLQ',
      level: 'Avanzado',
      minutes: 55,
      focus: 'Diseñar consumidores que no dañen datos aunque un mensaje llegue dos veces.',
      lab: 'Crea una cola FIFO y una DLQ; procesa el mismo mensaje dos veces sin duplicar el resultado.',
      objectives: ['Explicar at-least-once delivery.', 'Usar una DLQ para errores repetidos.', 'Crear una clave idempotente.'],
      concepts: ['FIFO', 'DLQ', 'idempotencia', 'MessageGroupId', 'MaxReceiveCount'],
    },
  ],
  3: [
    {
      title: 'Modelado NoSQL por patrones de acceso',
      level: 'Medio',
      minutes: 55,
      focus: 'Diseñar DynamoDB, Cosmos DB o Firestore pensando primero en las consultas que la app necesita responder.',
      lab: 'Crea tabla Tareas con PK/SK, inserta una tarea por usuario y consulta con Query, no con Scan.',
      objectives: ['Elegir partition key y sort key.', 'Evitar Scan como solución principal.', 'Crear datos con estructura consultable.'],
      concepts: ['DynamoDB', 'Cosmos DB', 'Firestore', 'partition key', 'sort key', 'Query vs Scan'],
      cloud: 'DynamoDB / Cosmos DB / Firestore',
    },
    {
      title: 'GSI, TTL y escrituras condicionales',
      level: 'Avanzado',
      minutes: 60,
      focus: 'Agregar índices y reglas para consultar por estado, evitar duplicados y expirar datos temporales.',
      lab: 'Agrega GSI por estado, escribe con condition-expression y configura TTL para tareas temporales.',
      objectives: ['Crear un GSI útil.', 'Evitar duplicados con condición.', 'Distinguir dato permanente de dato temporal.'],
      concepts: ['GSI', 'TTL', 'conditional expression', 'DynamoDB Streams'],
    },
  ],
  4: [
    {
      title: 'Secretos fuera del código',
      level: 'Básico',
      minutes: 45,
      focus: 'Mover passwords y tokens fuera del repositorio para que la app lea configuración segura en tiempo de ejecución.',
      lab: 'Crea un secreto en Secrets Manager, léelo por CLI y luego desde Python o Node.js.',
      objectives: ['Identificar qué es un secreto.', 'Leer secretos sin hardcodear valores.', 'Diferenciar secreto de configuración pública.'],
      concepts: ['Secrets Manager', 'Key Vault', 'Secret Manager', 'SSM Parameter Store', 'least privilege'],
      cloud: 'AWS Secrets / Azure Key Vault / GCP Secret Manager',
    },
    {
      title: 'KMS, rotación y permisos mínimos',
      level: 'Avanzado',
      minutes: 50,
      focus: 'Entender cifrado de sobre, rotación y permisos necesarios para leer solo el secreto correcto.',
      lab: 'Cifra un archivo pequeño con KMS, descífralo y documenta qué permiso sería necesario en producción.',
      objectives: ['Explicar envelope encryption.', 'Reconocer permisos excesivos.', 'Definir una política mínima de lectura.'],
      concepts: ['KMS', 'rotación', 'IAM policy', 'envelope encryption'],
    },
  ],
  5: [
    {
      title: 'Primera función serverless',
      level: 'Medio',
      minutes: 55,
      focus: 'Crear una función pequeña, empaquetarla, desplegarla e invocarla sin administrar servidores.',
      lab: 'Crea handler.py, genera function.zip, despliega Lambda e invócala guardando output.json.',
      objectives: ['Entender handler, event y context.', 'Empaquetar código mínimo.', 'Leer logs de ejecución.'],
      concepts: ['Lambda', 'Azure Functions', 'handler', 'event payload', 'context', 'CloudWatch Logs'],
      cloud: 'Lambda / Azure Functions',
    },
    {
      title: 'Variables, cold start y errores',
      level: 'Avanzado',
      minutes: 50,
      focus: 'Configurar ambiente, medir latencia inicial y diagnosticar errores con logs.',
      lab: 'Agrega una variable TABLA a Lambda, fuerza un error controlado y búscalo en logs.',
      objectives: ['Usar variables de entorno.', 'Explicar cold start.', 'Encontrar errores por log group.'],
      concepts: ['environment variables', 'cold start', 'reserved concurrency', 'log group'],
    },
  ],
  6: [
    {
      title: 'API REST conectada a Lambda',
      level: 'Medio',
      minutes: 60,
      focus: 'Exponer funciones como endpoints HTTP y entender recursos, métodos, stages y deployments.',
      lab: 'Crea API Gateway, recurso /tareas, método POST, integración proxy y prueba con curl.',
      objectives: ['Diferenciar recurso, método y stage.', 'Conectar API Gateway a Lambda.', 'Probar con curl desde terminal.'],
      concepts: ['API Gateway', 'REST API', 'HTTP API', 'stage', 'deployment', 'proxy integration'],
    },
    {
      title: 'CORS, authorizer y errores HTTP',
      level: 'Avanzado',
      minutes: 50,
      focus: 'Preparar la API para clientes reales con CORS, autorización y respuestas de error claras.',
      lab: 'Agrega CORS, valida un token simulado y devuelve errores 400/401/500 según el caso.',
      objectives: ['Explicar CORS sin memorizarlo.', 'Distinguir autenticación de autorización.', 'Responder errores con JSON útil.'],
      concepts: ['CORS', 'authorizer', 'status code', 'curl', 'JSON error'],
    },
  ],
  7: [
    {
      title: 'Fan-out con SNS y colas',
      level: 'Medio',
      minutes: 55,
      focus: 'Publicar un evento una vez y entregarlo a varios consumidores sin acoplarlos.',
      lab: 'Crea topic SNS, suscribe dos colas SQS, publica un mensaje y verifica que ambas reciben copia.',
      objectives: ['Diferenciar topic de cola.', 'Explicar fan-out.', 'Validar entrega múltiple.'],
      concepts: ['SNS', 'SQS subscription', 'fan-out', 'topic', 'subscriber'],
      cloud: 'SNS / EventBridge / Azure Event Hubs',
    },
    {
      title: 'EventBridge y ruteo por reglas',
      level: 'Avanzado',
      minutes: 60,
      focus: 'Enviar eventos con source/detailType y enrutar solo los que cumplen un patrón.',
      lab: 'Crea event bus, regla por source mi.app y publica TareaCreada con put-events.',
      objectives: ['Diseñar eventos con contrato.', 'Filtrar por patrón.', 'Comparar SNS y EventBridge.'],
      concepts: ['EventBridge', 'event bus', 'event pattern', 'scheduler', 'DetailType'],
    },
  ],
  8: [
    {
      title: 'Logs útiles y correlation ID',
      level: 'Medio',
      minutes: 45,
      focus: 'Registrar eventos que permitan encontrar una falla sin adivinar.',
      lab: 'Crea log group, envía logs con request_id y filtra solo ERROR.',
      objectives: ['Crear log group y stream.', 'Usar correlation ID.', 'Filtrar errores por patrón.'],
      concepts: ['CloudWatch Logs', 'log group', 'log stream', 'correlation ID', 'filter pattern'],
    },
    {
      title: 'Métricas, alarmas y dashboard',
      level: 'Avanzado',
      minutes: 55,
      focus: 'Convertir logs en señales accionables antes de que el usuario reporte el fallo.',
      lab: 'Crea metric filter de errores, alarma y dashboard simple.',
      objectives: ['Crear métrica desde logs.', 'Configurar alarma por umbral.', 'Definir qué mirar primero en un incidente.'],
      concepts: ['metric filter', 'alarm', 'dashboard', 'threshold', 'incident response'],
    },
  ],
  9: [
    {
      title: 'PostgreSQL real con RDS local',
      level: 'Medio',
      minutes: 60,
      focus: 'Crear una instancia relacional, conectarte con psql y ejecutar SQL básico.',
      lab: 'Crea RDS PostgreSQL, espera disponibilidad, toma endpoint y crea tabla tareas.',
      objectives: ['Conectarse con psql.', 'Crear tabla e insertar filas.', 'Diferenciar RDS de una base embebida.'],
      concepts: ['RDS', 'PostgreSQL', 'endpoint', 'psql', 'connection string', 'migration'],
    },
    {
      title: 'Snapshots, restore y elección SQL vs NoSQL',
      level: 'Avanzado',
      minutes: 55,
      focus: 'Practicar respaldo y recuperación mientras comparas relaciones SQL contra acceso NoSQL.',
      lab: 'Crea snapshot, restaura otra instancia y compara consulta SQL con consulta DynamoDB.',
      objectives: ['Crear y restaurar snapshot.', 'Explicar cuándo elegir SQL.', 'Documentar plan de respaldo.'],
      concepts: ['snapshot', 'restore', 'relaciones', 'transacciones', 'backup'],
    },
  ],
  10: [
    {
      title: 'Imagen Docker, ECR y task definition',
      level: 'Avanzado',
      minutes: 65,
      focus: 'Empaquetar una API, publicarla en registro local y describir cómo ECS la ejecuta.',
      lab: 'docker build, aws ecr create-repository, docker tag, docker push y task definition ECS.',
      objectives: ['Construir imagen OCI.', 'Subir imagen a ECR.', 'Definir CPU, memoria, puerto y variables.'],
      concepts: ['Dockerfile', 'OCI image', 'ECR', 'ECS task definition', 'container port'],
      cloud: 'ECR / ECS / Cloud Run',
    },
    {
      title: 'Servicio ECS y comparación con Cloud Run',
      level: 'Master',
      minutes: 55,
      focus: 'Ejecutar la app como servicio y comparar el modelo con Cloud Run de GCP.',
      lab: 'Crea cluster ECS, servicio deseado=1 y documenta qué cambiaría en Cloud Run.',
      objectives: ['Diferenciar task y service.', 'Entender desired count.', 'Comparar ECS, Fargate y Cloud Run.'],
      concepts: ['ECS cluster', 'service', 'desired count', 'Fargate', 'Cloud Run'],
    },
  ],
  11: [
    {
      title: 'Infraestructura como código sin magia',
      level: 'Avanzado',
      minutes: 60,
      focus: 'Definir recursos en archivo, aplicarlos y revisar diferencias antes de cambiar infraestructura.',
      lab: 'Crea template CloudFormation para S3 + SQS y aplícalo contra Floci.',
      objectives: ['Leer YAML de infraestructura.', 'Crear stack reproducible.', 'Entender create/update/delete.'],
      concepts: ['CloudFormation', 'Terraform', 'IaC', 'stack', 'drift', 'plan'],
    },
    {
      title: 'Parámetros, outputs y environments',
      level: 'Master',
      minutes: 55,
      focus: 'Separar dev/stage/prod con parámetros y exportar outputs consumibles por la app.',
      lab: 'Agrega parámetros BucketName y QueueName, outputs con ARN y endpoint.',
      objectives: ['Usar parámetros.', 'Leer outputs.', 'Evitar valores hardcodeados.'],
      concepts: ['parameters', 'outputs', 'environment', 'ARN', 'drift detection'],
    },
  ],
  12: [
    {
      title: 'Workflow con Step Functions',
      level: 'Avanzado',
      minutes: 60,
      focus: 'Orquestar varios pasos con estado visible en lugar de encadenar funciones a ciegas.',
      lab: 'Crea una state machine con Task, Choice y Fail; ejecuta un flujo exitoso y uno fallido.',
      objectives: ['Diferenciar orquestación de coreografía.', 'Leer historial de ejecución.', 'Modelar errores esperados.'],
      concepts: ['Step Functions', 'state machine', 'Task', 'Choice', 'Retry', 'Catch'],
    },
    {
      title: 'Retry, compensación y trazabilidad',
      level: 'Master',
      minutes: 55,
      focus: 'Diseñar reintentos controlados y pasos de compensación cuando una parte del proceso falla.',
      lab: 'Agrega Retry con backoff y una rama de compensación que escriba evento de fallo.',
      objectives: ['Configurar retry seguro.', 'Explicar compensación.', 'Documentar trazabilidad del flujo.'],
      concepts: ['backoff', 'compensation', 'execution history', 'timeout'],
    },
  ],
  13: [
    {
      title: 'Streams: eventos ordenados y retención',
      level: 'Avanzado',
      minutes: 60,
      focus: 'Procesar eventos como flujo continuo, no como cola simple.',
      lab: 'Crea stream Kinesis, publica registros con partition key y consume lotes.',
      objectives: ['Diferenciar cola y stream.', 'Usar partition key.', 'Entender retención y orden por shard.'],
      concepts: ['Kinesis', 'MSK', 'Kafka', 'shard', 'partition key', 'retention'],
      cloud: 'Kinesis / MSK / Kafka',
    },
    {
      title: 'Kafka/MSK y consumidores resilientes',
      level: 'Master',
      minutes: 60,
      focus: 'Comparar Kinesis con Kafka y diseñar consumidores que reanuden desde offsets.',
      lab: 'Documenta topic, partition, consumer group y offset; simula reprocesamiento de eventos.',
      objectives: ['Explicar consumer group.', 'Controlar reprocesamiento.', 'Comparar offset y sequence number.'],
      concepts: ['Kafka topic', 'partition', 'consumer group', 'offset', 'checkpoint'],
    },
  ],
  14: [
    {
      title: 'Autenticación con Cognito',
      level: 'Avanzado',
      minutes: 55,
      focus: 'Crear usuarios, iniciar sesión y proteger una API con token.',
      lab: 'Crea user pool, registra usuario, obtiene JWT y llama API Gateway con Authorization Bearer.',
      objectives: ['Diferenciar login y permisos.', 'Leer claims básicos de JWT.', 'Proteger endpoint.'],
      concepts: ['Cognito', 'user pool', 'JWT', 'claims', 'authorizer'],
    },
    {
      title: 'Roles, scopes y errores de seguridad',
      level: 'Master',
      minutes: 50,
      focus: 'Evitar endpoints abiertos por accidente y responder 401/403 correctamente.',
      lab: 'Crea rutas admin/user, valida scope simulado y prueba token ausente, inválido y válido.',
      objectives: ['Diferenciar 401 y 403.', 'Validar scopes.', 'Documentar amenaza básica.'],
      concepts: ['roles', 'scopes', 'least privilege', '401', '403'],
    },
  ],
  15: [
    {
      title: 'Analytics con Athena y BigQuery',
      level: 'Avanzado',
      minutes: 60,
      focus: 'Consultar archivos como tablas para responder preguntas de negocio sin montar una base transaccional.',
      lab: 'Sube CSV a S3/GCS, define tabla externa y ejecuta una consulta de conteo por estado.',
      objectives: ['Diferenciar dato transaccional y analítico.', 'Crear tabla externa.', 'Guardar consulta reproducible.'],
      concepts: ['Athena', 'BigQuery', 'DuckDB', 'external table', 'CSV', 'Parquet'],
      cloud: 'Athena / BigQuery',
    },
    {
      title: 'Particiones, formatos y costo mental',
      level: 'Master',
      minutes: 55,
      focus: 'Entender cómo particiones y formatos columnares reducen lectura y aceleran consultas.',
      lab: 'Divide datos por fecha, consulta una partición y compara CSV contra Parquet.',
      objectives: ['Crear partición por fecha.', 'Explicar Parquet.', 'Evitar consultas que lean todo.'],
      concepts: ['partition', 'Parquet', 'scan', 'query planning', 'dataset'],
    },
  ],
  16: [
    {
      title: 'IA generativa con Bedrock local',
      level: 'Master',
      minutes: 60,
      focus: 'Invocar un modelo, controlar prompt, entrada y salida, y registrar la decisión tomada.',
      lab: 'Crea una función que reciba una tarea y pida a Bedrock resumirla en formato JSON.',
      objectives: ['Separar prompt de código.', 'Validar salida JSON.', 'Registrar entrada/salida sin secretos.'],
      concepts: ['Bedrock', 'prompt', 'model invocation', 'JSON schema', 'guardrails'],
      cloud: 'Bedrock / Vertex AI / Azure AI',
    },
    {
      title: 'RAG pequeño y evaluación',
      level: 'Master',
      minutes: 60,
      focus: 'Usar documentos del proyecto como contexto y evaluar si la respuesta fue útil.',
      lab: 'Carga 3 fragmentos de documentación, pregunta por un error común y compara respuesta con fuente.',
      objectives: ['Explicar contexto.', 'Detectar alucinación.', 'Crear una prueba manual de calidad.'],
      concepts: ['RAG', 'embedding', 'context window', 'evaluation', 'hallucination'],
    },
  ],
  17: [
    {
      title: 'Proyecto final: gestor de tareas cloud local',
      level: 'Master',
      minutes: 90,
      focus: 'Construir una app pequeña pero completa que obligue a usar los servicios aprendidos.',
      lab: 'Implementa API de tareas con auth, Lambda/API Gateway, DynamoDB/RDS, S3, SQS/SNS, logs, IaC y contenedor.',
      objectives: ['Integrar servicios sin copiar ejemplos aislados.', 'Documentar arquitectura y evidencias.', 'Crear una demo reproducible desde cero.'],
      concepts: ['arquitectura', 'integración', 'evidencia', 'README', 'demo reproducible'],
    },
    {
      title: 'Rúbrica de experto y entrega',
      level: 'Master',
      minutes: 75,
      focus: 'Validar el proyecto con criterios claros: funciona, se entiende, se observa, se despliega y se puede reconstruir.',
      lab: 'Entrega README, comandos, capturas, exportación de progreso y lista de fallos corregidos.',
      objectives: ['Evaluar con rúbrica.', 'Explicar decisiones técnicas.', 'Preparar siguiente iteración profesional.'],
      concepts: ['rúbrica', 'arquitectura', 'observabilidad', 'seguridad', 'portabilidad'],
    },
  ],
  18: [
    {
      title: 'Mapa comparativo AWS, Azure y GCP',
      level: 'Básico',
      minutes: 55,
      focus: 'Ubicar equivalencias para no pensar que cada nube es un mundo separado.',
      lab: 'Crea una tabla: S3=Blob=Cloud Storage, SQS=Service Bus/PubSub, DynamoDB=Cosmos/Firestore, Lambda=Functions/Cloud Functions.',
      objectives: ['Nombrar equivalencias principales.', 'Evitar aprender solo AWS.', 'Elegir servicio por problema, no por marca.'],
      concepts: ['equivalencias cloud', 'Blob Storage', 'Cloud Storage', 'Service Bus', 'Pub/Sub', 'Cloud Functions'],
      cloud: 'AWS / Azure / GCP',
    },
    {
      title: 'Laboratorio multi-cloud obligatorio',
      level: 'Master',
      minutes: 75,
      focus: 'Repetir el mismo flujo en tres nubes locales: archivo, evento, función y evidencia.',
      lab: 'Sube archivo, publica evento y ejecuta una función equivalente en AWS Floci, Floci Azure y Floci GCP.',
      objectives: ['Comparar comandos reales.', 'Registrar diferencias de endpoint.', 'Construir criterio multi-cloud.'],
      concepts: ['multi-cloud', 'floci-az', 'floci-gcp', 'endpoint', 'SDK'],
      cloud: 'AWS + Azure + GCP',
    },
  ],
};

const levelFromCourse = (level: CourseModule['level']): Level => {
  if (level === 'Fundamentos') return 'Básico';
  if (level === 'Aplicación') return 'Medio';
  if (level === 'Integración') return 'Avanzado';
  return 'Master';
};

const commandFrom = (module: CourseModule): string =>
  module.challenges.find(challenge => challenge.includes('—'))?.split('—').pop()?.trim()
  ?? module.challenges[0]
  ?? 'floci status';

const commandOnly = (text: string): string => text.includes('—')
  ? text.split('—').pop()?.trim() || text
  : text;

const labStepsFor = (module: CourseModule, blueprint: TopicBlueprint): LabStep[] => {
  const primary = commandOnly(blueprint.lab);
  const fallbackCommand = commandFrom(module);
  const checks = module.challenges.map(commandOnly).filter(Boolean);

  return [
    {
      title: 'Preparar entorno',
      command: 'docker version && floci status',
      verify: 'Debe mostrar una versión de Docker y el estado del emulador Floci. Si falla, abre Docker Desktop y vuelve a ejecutar.',
    },
    {
      title: 'Ejecutar paso principal',
      command: primary || fallbackCommand,
      verify: 'Debe crear, consultar, invocar o modificar el recurso del tema. Copia la salida importante en tu respuesta.',
    },
    {
      title: 'Comprobar evidencia',
      command: checks[1] ?? checks[0] ?? fallbackCommand,
      verify: `La evidencia mínima es: ${module.deliverable}`,
    },
  ];
};

const fallbackBlueprints = (module: CourseModule): TopicBlueprint[] => [
  {
    title: `Fundamentos de ${module.shortTitle}`,
    level: levelFromCourse(module.level),
    minutes: 35,
    focus: module.description,
    lab: module.challenges[0] ?? commandFrom(module),
    objectives: [
      `Explicar qué problema resuelve ${module.shortTitle}.`,
      `Ejecutar un paso verificable con ${module.services.join(', ') || 'Floci'}.`,
      'Registrar evidencia en tu cuaderno.',
    ],
    concepts: module.concepts.slice(0, 6),
  },
  {
    title: `Laboratorio guiado de ${module.shortTitle}`,
    level: module.level === 'Experto' ? 'Master' : 'Avanzado',
    minutes: 50,
    focus: `Aplicar ${module.shortTitle} dentro de un flujo real y comprobar que el resultado existe.`,
    lab: module.challenges[1] ?? module.challenges[0] ?? commandFrom(module),
    objectives: [
      'Ejecutar comandos en orden.',
      'Leer la salida antes de avanzar.',
      'Corregir al menos un error común.',
    ],
    concepts: module.concepts.slice(0, 6),
  },
];

const buildTopic = (module: CourseModule, blueprint: TopicBlueprint, index: number): Topic => {
  const id = `m${module.id}-tema-${index + 1}`;
  const command = blueprint.lab || commandFrom(module);
  const serviceList = blueprint.cloud ?? (module.services.join(' / ') || module.shortTitle);
  const code = [
    '# Antes de ejecutar',
    '# 1. Abre la terminal.',
    '# 2. Verifica que Docker y Floci estén encendidos.',
    '# 3. Copia un comando a la vez y lee la salida.',
    '',
    '# Laboratorio',
    command,
    '',
    '# Evidencia mínima esperada',
    module.deliverable,
  ].join('\n');

  return {
    id,
    moduleId: module.id,
    title: blueprint.title,
    level: blueprint.level,
    minutes: blueprint.minutes,
    intro: [
      blueprint.focus,
      'La regla de estudio es simple: lees lo esencial, ejecutas un paso pequeño, verificas con evidencia y escribes tu explicación con tus propias palabras.',
    ],
    objectives: blueprint.objectives,
    theory: [
      {
        title: 'Qué debes entender',
        body: `${module.shortTitle} pertenece al nivel ${module.level}. El punto no es memorizar nombres, sino reconocer el problema que resuelve y cómo se comprueba en local.`,
        bullets: blueprint.concepts,
      },
      {
        title: 'Cómo se aplica',
        body: `Este tema se practica con ${serviceList}. Primero haces que funcione en Floci; después comparas el mismo patrón con nube real sin gastar dinero ni tocar producción.`,
        bullets: [
          `Laboratorio: ${blueprint.lab}`,
          `Entrega: ${module.deliverable}`,
          ...module.questions.slice(0, 2).map(question => `Pregunta guía: ${question}`),
        ],
      },
    ],
    comparison: {
      left: blueprint.cloud ?? 'Nube real',
      right: 'Floci local',
      leftDetail: 'Requiere cuenta, permisos, costo potencial y limpieza cuidadosa de recursos.',
      rightDetail: 'Permite practicar rápido en localhost, repetir errores y validar comandos sin costo mientras aprendes el patrón.',
    },
    diagram: `Alumno -> Terminal -> Floci localhost -> ${serviceList} -> Evidencia -> Explicación propia`,
    code,
    labSteps: labStepsFor(module, blueprint),
    lineByLine: code.split('\n').slice(0, 6).map((line, index) => `Línea ${index + 1}: ${line || 'separador visual del ejemplo.'}`),
    exercise: `Haz el laboratorio: ${blueprint.lab}. Luego escribe qué comando ejecutaste, qué salida demuestra que funcionó y qué error corregirías si fallara.`,
    expected: [blueprint.lab, ...module.challenges.slice(0, 3)],
    hints: [
      'Si nunca abriste una consola: en Mac usa Spotlight y escribe Terminal; en Windows abre PowerShell; en Linux usa Ctrl+Alt+T.',
      'Ejecuta primero el comando más pequeño posible.',
      'Copia la salida importante, no toda la terminal.',
      'Si falla, lee el error completo antes de cambiar varios comandos a la vez.',
    ],
    commonErrors: [
      'No tener Docker corriendo antes de levantar Floci.',
      'Olvidar el endpoint local o las variables de entorno.',
      'Crear recursos y no verificar que existen.',
      'Copiar comandos sin entender qué parte es nombre, región o identificador.',
    ],
    summary: [
      `${blueprint.title} se aprende ejecutando y verificando.`,
      'La evidencia vale más que decir "me funcionó".',
      'El objetivo final es explicar la decisión técnica, no solo pasar el comando.',
    ],
    resources,
    quiz: (module.questions.length ? module.questions : ['¿Qué problema resuelve este módulo?', '¿Cómo validarías que funcionó?', '¿Qué error esperas encontrar?'])
      .slice(0, 5)
      .map(question => ({ question, answer: 'Debe responderse con evidencia del laboratorio y explicación propia.' })),
  };
};

const diagnosticTopic = (module: CourseModule): Topic => ({
  ...buildTopic(module, fallbackBlueprints(module)[0], 0),
  id: 'm0-diagnostico',
  title: 'Diagnóstico inicial',
  minutes: 35,
  objectives: [
    'Diferenciar endpoint local y endpoint real.',
    'Explicar imagen Docker vs contenedor corriendo.',
    'Reconocer access key, secret key y ARN.',
    'Diferenciar cola, topic, stream y event bus.',
    'Distinguir persistencia en disco de memoria temporal.',
  ],
  exercise: 'Responde las 5 preguntas de diagnóstico antes de iniciar el laboratorio. No busques la respuesta: escribe tu hipótesis.',
  quiz: [
    { question: '¿Qué diferencia hay entre un endpoint local y AWS real?', answer: 'El endpoint local apunta a Floci en localhost; AWS real apunta a servicios administrados con cuenta, permisos y costo.' },
    { question: '¿Qué diferencia hay entre imagen Docker y contenedor?', answer: 'La imagen es la plantilla; el contenedor es una ejecución viva de esa plantilla.' },
    { question: '¿Para qué sirven access key, secret key y ARN?', answer: 'Las keys autentican llamadas; el ARN identifica recursos en formato estándar.' },
    { question: '¿Cuándo usar cola, topic, stream o event bus?', answer: 'Cola para trabajo pendiente, topic para fan-out, stream para eventos ordenados/retención, event bus para ruteo por reglas.' },
    { question: '¿Qué diferencia hay entre persistencia y memoria?', answer: 'Persistencia sobrevive reinicios; memoria desaparece al detener el proceso/contenedor.' },
  ],
});

const moduleToStudy = (module: CourseModule): StudyModule => ({
  id: `modulo-${module.id}`,
  title: `${module.id}. ${module.shortTitle}`,
  description: module.description,
  source: module,
  topics: module.id === 0
    ? [diagnosticTopic(module), ...(topicBlueprints[module.id] ?? fallbackBlueprints(module)).map((blueprint, index) => buildTopic(module, blueprint, index + 1))]
    : (topicBlueprints[module.id] ?? fallbackBlueprints(module)).map((blueprint, index) => buildTopic(module, blueprint, index)),
});

const azureGcpSource: CourseModule = {
  id: 18,
  title: 'Azure y GCP con Floci',
  shortTitle: 'Azure y GCP',
  level: 'Integración',
  duration: '2 h',
  color: '#2563eb',
  description: 'Módulo dedicado a cerrar la brecha multi-cloud: equivalencias, comandos y laboratorios comparables entre AWS, Azure y GCP usando Floci local.',
  concepts: ['equivalencias cloud', 'floci-az', 'floci-gcp', 'Blob Storage', 'Cloud Storage', 'Service Bus', 'Pub/Sub', 'Cosmos DB', 'Firestore'],
  challenges: [
    'Compara servicios — crea una tabla local de equivalencias AWS/Azure/GCP',
    'Ejecuta flujo multi-cloud — sube archivo, publica evento y registra evidencia',
  ],
  questions: [
    '¿Qué servicio de Azure equivale a S3?',
    '¿Qué servicio de GCP usarías para pub/sub?',
    '¿Por qué aprender el patrón antes que la marca?',
  ],
  services: ['Azure Blob Storage', 'Azure Service Bus', 'GCP Cloud Storage', 'GCP Pub/Sub', 'Firestore'],
  deliverable: 'Tabla comparativa AWS/Azure/GCP y laboratorio multi-cloud con evidencia.',
  clouds: ['aws', 'azure', 'gcp'],
};

@Component({
  selector: 'app-study-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './study-page.html',
  styleUrl: './study-page.scss',
})
export class StudyPageComponent implements OnInit {
  readonly standards = studyStandards;
  readonly modules: StudyModule[] = [...COURSE_MODULES, azureGcpSource].map(moduleToStudy);

  selectedModuleId = this.modules[0].id;
  selectedTopicId = this.modules[0].topics[0].id;
  tab: Tab = 'teoria';
  query = '';
  dark = false;
  examMode = false;
  examStartedAt: number | null = null;
  mobileSidebar = false;
  completed = new Set<string>();
  verifiedLabSteps = new Set<string>();
  answers: Record<string, string> = {};
  editorDrafts: Record<string, string> = {};
  answer = '';
  editorCode = '';
  output = '';

  constructor(private readonly cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.completed = new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));
    this.verifiedLabSteps = new Set(JSON.parse(localStorage.getItem(LAB_KEY) || '[]'));
    this.answers = JSON.parse(localStorage.getItem(ANSWERS_KEY) || '{}');
    this.editorDrafts = JSON.parse(localStorage.getItem(EDITOR_KEY) || '{}');
    this.dark = localStorage.getItem(THEME_KEY) === 'dark';
    this.answer = this.answers[this.selectedTopicId] ?? '';
    this.editorCode = this.editorDrafts[this.selectedTopicId] ?? this.selectedTopic.code;
  }

  get selectedModule(): StudyModule {
    return this.modules.find(module => module.id === this.selectedModuleId) ?? this.modules[0];
  }

  get selectedTopic(): Topic {
    return this.selectedModule.topics.find(topic => topic.id === this.selectedTopicId) ?? this.selectedModule.topics[0];
  }

  get filteredModules(): StudyModule[] {
    const query = this.query.trim().toLowerCase();
    if (!query) return this.modules;
    const tokens = query.split(/\s+/).filter(Boolean);
    return this.modules
      .map(module => ({
        ...module,
        topics: module.topics.filter(topic => {
          const haystack = [
            module.title,
            module.description,
            module.source?.concepts.join(' '),
            module.source?.services.join(' '),
            module.source?.clouds?.join(' '),
            topic.title,
            topic.level,
            topic.intro.join(' '),
            topic.objectives.join(' '),
            topic.theory.map(section => `${section.title} ${section.body} ${section.bullets?.join(' ') ?? ''}`).join(' '),
            topic.exercise,
            topic.expected.join(' '),
          ].join(' ').toLowerCase();
          return tokens.every(token => haystack.includes(token));
        }),
      }))
      .filter(module => module.topics.length);
  }

  levelsFor(module: StudyModule): Level[] {
    return ['Básico', 'Medio', 'Avanzado', 'Master'].filter(level => module.topics.some(topic => topic.level === level)) as Level[];
  }

  topicsByLevel(module: StudyModule, level: Level): Topic[] {
    return module.topics.filter(topic => topic.level === level);
  }

  selectTopic(module: StudyModule, topicItem: Topic): void {
    this.saveCurrentAnswer();
    this.saveEditorDraft();
    this.selectedModuleId = module.id;
    this.selectedTopicId = topicItem.id;
    this.tab = 'teoria';
    this.answer = this.answers[topicItem.id] ?? '';
    this.editorCode = this.editorDrafts[topicItem.id] ?? topicItem.code;
    this.output = '';
    this.mobileSidebar = false;
  }

  selectTab(nextTab: Tab): void {
    this.tab = nextTab;
    this.output = '';
    if (nextTab === 'ejemplo') {
      this.editorCode = this.editorDrafts[this.selectedTopicId] ?? this.selectedTopic.code;
    }
  }

  isCompleted(topicId: string): boolean {
    return this.completed.has(topicId);
  }

  moduleProgress(module: StudyModule): number {
    return Math.round((module.topics.filter(topic => this.completed.has(topic.id)).length / module.topics.length) * 100);
  }

  globalProgress(): number {
    const total = this.modules.reduce((sum, module) => sum + module.topics.length, 0);
    return Math.round((this.completed.size / total) * 100);
  }

  currentModuleProgress(): number {
    return this.moduleProgress(this.selectedModule);
  }

  completedModulesCount(): number {
    return this.modules.filter(module => this.moduleProgress(module) === 100).length;
  }

  badgeCatalog(): Badge[] {
    const doneModules = this.completedModulesCount();
    const allModules = this.modules.length;
    return [
      { name: 'Explorador', description: 'Completa 1 módulo completo.', unlocked: doneModules >= 1 },
      { name: 'Constructor', description: 'Completa 5 módulos completos.', unlocked: doneModules >= 5 },
      { name: 'Arquitecto', description: 'Completa 10 módulos completos.', unlocked: doneModules >= 10 },
      { name: 'Maestro', description: `Completa los ${allModules} módulos.`, unlocked: doneModules >= allModules },
    ];
  }

  earnedBadges(): string[] {
    return this.badgeCatalog().filter(badge => badge.unlocked).map(badge => badge.name);
  }

  toggleComplete(): void {
    if (this.completed.has(this.selectedTopic.id)) {
      this.completed.delete(this.selectedTopic.id);
    } else {
      this.completed.add(this.selectedTopic.id);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...this.completed]));
  }

  toggleTheme(): void {
    this.dark = !this.dark;
    localStorage.setItem(THEME_KEY, this.dark ? 'dark' : 'light');
  }

  toggleExam(): void {
    this.examMode = !this.examMode;
    this.examStartedAt = this.examMode ? Date.now() : null;
    this.tab = 'examen';
  }

  examElapsed(): string {
    if (!this.examStartedAt) return '00:00';
    const seconds = Math.floor((Date.now() - this.examStartedAt) / 1000);
    return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  }

  saveEditorDraft(): void {
    this.editorDrafts[this.selectedTopicId] = this.editorCode;
    localStorage.setItem(EDITOR_KEY, JSON.stringify(this.editorDrafts));
  }

  resetEditor(): void {
    this.editorCode = this.selectedTopic.code;
    this.saveEditorDraft();
    this.output = 'Editor restaurado al ejemplo base del tema.';
  }

  editorLanguage(): string {
    const code = this.editorCode.toLowerCase();
    if (/console\.log|const |let |function |=>/.test(code)) return 'JavaScript';
    if (/def |print\(|import boto3|python/.test(code)) return 'Python';
    if (/aws |az |gcloud |docker |floci |curl |terraform |kubectl/.test(code)) return 'Terminal';
    return 'Texto';
  }

  isLabStepVerified(index: number): boolean {
    return this.verifiedLabSteps.has(this.labStepKey(index));
  }

  verifyLabStep(index: number): void {
    const step = this.selectedTopic.labSteps[index];
    if (!step) return;
    const command = step.command.toLowerCase();
    const hasTool = /aws|az |gcloud|docker|floci|curl|terraform|kubectl|psql|zip/.test(command);
    if (!hasTool && command.split(/\s+/).length < 3) {
      this.output = 'Este paso necesita un comando más concreto antes de marcarlo como verificado.';
      return;
    }
    this.verifiedLabSteps.add(this.labStepKey(index));
    localStorage.setItem(LAB_KEY, JSON.stringify([...this.verifiedLabSteps]));
    this.output = `Paso verificado: ${step.title}\n${step.verify}`;
  }

  verifyAnswer(): void {
    this.saveCurrentAnswer();
    const analysis = this.answerQuality(this.answer, this.selectedTopic.expected);
    if (analysis.ok) {
      this.output = `Correcto: tu respuesta incluye evidencia compatible.\nCoincidencias: ${analysis.matches.join(', ') || 'razonamiento suficiente'}.`;
      return;
    }
    this.output = [
      'Incorrecto o incompleto: falta evidencia verificable.',
      `Pista: agrega alguno de estos elementos: ${analysis.missing.slice(0, 5).join(', ') || 'comando ejecutado, salida esperada y explicación propia'}.`,
      'Formato sugerido: comando -> salida importante -> explicación en tus palabras.',
    ].join('\n');
  }

  validateCommand(): void {
    const analysis = this.answerQuality(this.answer, this.selectedTopic.expected);
    this.output = analysis.ok
      ? `Comando/evidencia compatible. Tokens detectados: ${analysis.matches.join(', ')}.`
      : `No coincide todavía. Busca en tu respuesta alguno de estos tokens del laboratorio: ${analysis.missing.slice(0, 6).join(', ')}.`;
  }

  async runCode(): Promise<void> {
    this.saveEditorDraft();
    const language = this.editorLanguage();
    if (language === 'JavaScript') {
      this.output = await this.runJavaScriptInSandbox(this.editorCode);
      this.cdr.detectChanges();
      return;
    }
    if (language === 'Terminal') {
      const commandLines = this.editorCode
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#'));
      const tools = commandLines
        .flatMap(line => line.match(/\b(aws|az|gcloud|docker|floci|curl|terraform|kubectl|psql|zip)\b/g) ?? []);
      this.output = [
        'Simulación de terminal completada.',
        `Comandos detectados: ${commandLines.length}.`,
        `Herramientas detectadas: ${[...new Set(tools)].join(', ') || 'ninguna'}.`,
        'Para ejecutar de verdad, copia un comando a tu consola local y pega la salida en el ejercicio.',
      ].join('\n');
      return;
    }
    this.output = 'Editor listo. Para Python o CLI, esta página valida estructura y evidencia; la ejecución real se hace en tu terminal local.';
  }

  exportMarkdown(): void {
    this.saveCurrentAnswer();
    this.saveEditorDraft();
    const lines = [
      '# Cuaderno de progreso Academia Floci',
      '',
      `Progreso global: ${this.globalProgress()}%`,
      `Insignias: ${this.earnedBadges().join(', ') || 'Sin insignias todavía'}`,
      '',
      ...this.modules.flatMap(module => [
        `## ${module.title} (${this.moduleProgress(module)}%)`,
        ...module.topics.map(topic => `- [${this.completed.has(topic.id) ? 'x' : ' '}] ${topic.title}: ${this.answers[topic.id] || 'Sin evidencia escrita.'}`),
        '',
      ]),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cuaderno-progreso-floci.md';
    link.click();
    URL.revokeObjectURL(url);
  }

  private answerQuality(answer: string, expected: string[]): { ok: boolean; matches: string[]; missing: string[] } {
    const normalizedAnswer = this.normalize(answer);
    const expectedTokens = [...new Set(
      expected
        .join(' ')
        .split(/[^a-zA-Z0-9#:/_.-]+/)
        .map(token => token.toLowerCase())
        .filter(token => token.length > 3)
        .filter(token => !['para', 'este', 'esta', 'debe', 'crear', 'ejecuta', 'verifica', 'laboratorio'].includes(token))
    )];
    const matches = expectedTokens.filter(token => normalizedAnswer.includes(token)).slice(0, 10);
    const missing = expectedTokens.filter(token => !normalizedAnswer.includes(token));
    const hasCommandSignal = /\b(aws|floci|docker|gcloud|az|curl|terraform|kubectl|psql|zip)\b/.test(normalizedAnswer);
    const hasEvidenceSignal = /\b(output|json|arn|http|localhost|status|created|ok|error|id|bucket|queue|tabla|log)\b/.test(normalizedAnswer);
    const enoughExplanation = normalizedAnswer.split(/\s+/).filter(Boolean).length >= 24;
    return {
      ok: (matches.length >= Math.min(3, expectedTokens.length) && (hasCommandSignal || hasEvidenceSignal)) || (hasCommandSignal && enoughExplanation),
      matches,
      missing,
    };
  }

  private normalize(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  private labStepKey(index: number): string {
    return `${this.selectedTopicId}:paso-${index + 1}`;
  }

  private runJavaScriptInSandbox(code: string): Promise<string> {
    if (code.length > 4000) {
      return Promise.resolve('El bloque es demasiado largo para el sandbox del navegador. Reduce el ejemplo a menos de 4000 caracteres.');
    }
    if (/\b(while\s*\(\s*true\s*\)|for\s*\(\s*;\s*;\s*\)|document\.cookie|localStorage|sessionStorage|fetch|XMLHttpRequest)\b/.test(code)) {
      return Promise.resolve('El sandbox bloqueó APIs o bucles peligrosos. Usa ejemplos pequeños con console.log y lógica pura.');
    }

    const id = `floci-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const iframe = document.createElement('iframe');
    iframe.sandbox.add('allow-scripts');
    iframe.style.display = 'none';

    return new Promise(resolve => {
      const finish = (message: string): void => {
        window.removeEventListener('message', onMessage);
        iframe.remove();
        resolve(message);
      };
      const timeout = window.setTimeout(() => finish('El sandbox tardó demasiado. Revisa si tu código tiene un ciclo infinito.'), 1200);
      const onMessage = (event: MessageEvent): void => {
        if (!event.data || event.data.source !== 'floci-sandbox' || event.data.id !== id) return;
        window.clearTimeout(timeout);
        const lines = event.data.error
          ? [`Error: ${event.data.error}`]
          : ['Salida del sandbox:', ...(event.data.logs.length ? event.data.logs : ['Sin salida. Usa console.log para ver resultados.'])];
        finish(lines.join('\n'));
      };
      window.addEventListener('message', onMessage);
      iframe.srcdoc = `
        <script>
          const logs = [];
          const safeConsole = {
            log: (...args) => logs.push(args.map(value => typeof value === 'object' ? JSON.stringify(value) : String(value)).join(' ')),
            error: (...args) => logs.push('ERROR ' + args.map(String).join(' '))
          };
          try {
            const result = Function('console', ${JSON.stringify(`"use strict";\n${code}`)})(safeConsole);
            if (result !== undefined) logs.push(String(result));
            parent.postMessage({ source: 'floci-sandbox', id: ${JSON.stringify(id)}, logs }, '*');
          } catch (error) {
            parent.postMessage({ source: 'floci-sandbox', id: ${JSON.stringify(id)}, error: error.message }, '*');
          }
        <\/script>
      `;
      document.body.appendChild(iframe);
    });
  }

  private saveCurrentAnswer(): void {
    this.answers[this.selectedTopicId] = this.answer;
    localStorage.setItem(ANSWERS_KEY, JSON.stringify(this.answers));
  }
}
