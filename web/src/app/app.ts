import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation, computed, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { marked } from 'marked';
import {
  Award, BookOpen, Boxes, Check, ChevronLeft, ChevronRight, CircleHelp, CloudCog,
  Code2, Copy, Database, Download, FileCheck2, FileText, FlaskConical, Focus, Gauge, GraduationCap,
  LayoutDashboard, Library, ListChecks, LockKeyhole, Menu, MessageSquareText,
  Network, PartyPopper, Play, Search, ServerCog, Settings2, Sparkles, Target, Terminal,
  Trophy, X, LucideAngularModule
} from 'lucide-angular';
import { COURSE_MODULES, CourseModule, QUIZ, SERVICE_GROUPS, CLOUD_COMPARISON, AZURE_GROUPS, GCP_GROUPS, AltCloudGroup } from './course-data';

type View = 'dashboard' | 'path' | 'services' | 'project' | 'library';
type CloudTab = 'aws' | 'azure' | 'gcp' | 'comparacion';
type StudentOs = 'mac' | 'windows' | 'linux';
type LabLanguage = 'javascript' | 'typescript' | 'python' | 'java' | 'go' | 'csharp';
interface LibraryDocument {
  id: string;
  title: string;
  category: string;
  path: string;
  language: string;
  type: 'guide' | 'official' | 'code';
}
interface ServiceStudy { name: string; summary: string; practice: string; referenceQuery: string; }
interface StoredProgress {
  completedModules: number[];
  completedChallenges: Record<string, boolean>;
  notes: Record<number, string>;
  evidence: Record<number, string>;
}
interface StudentSetup {
  os: StudentOs;
  language: LabLanguage;
}
interface SetupCommand {
  title: string;
  command: string;
  detail: string;
}
interface LinearSetupStep extends SetupCommand {
  phase: string;
}
interface ChallengeGuide {
  action: string;
  command: string;
  verify: string;
  advice: string;
}
interface ExplainLikeNewcomer {
  essence: string;
  analogy: string;
  parts: { title: string; detail: string }[];
  mistakes: string[];
  questions: string[];
  action: string;
  misconception: string;
}
interface LearningRule {
  title: string;
  detail: string;
  example: string;
}
interface InstallationOption {
  title: string;
  scope: string;
  command: string;
  detail: string;
  recommendation: string;
}
interface ServiceModuleCard {
  title: string;
  detail: string;
  action: string;
}
interface TerminalGuide {
  title: string;
  openSteps: string[];
  shortcuts: { key: string; action: string }[];
  firstCommands: SetupCommand[];
}
interface IdeGuide {
  title: string;
  install: string;
  openProject: string[];
  shortcuts: { key: string; action: string }[];
  prerequisites: SetupCommand[];
}
interface TopicProject {
  module: number;
  title: string;
  services: string[];
  detail: string;
  resource: string;
  verify: string[];
}

const EMPTY_PROGRESS: StoredProgress = { completedModules: [], completedChallenges: {}, notes: {}, evidence: {} };
const DEFAULT_SETUP: StudentSetup = { os: 'mac', language: 'javascript' };

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  encapsulation: ViewEncapsulation.None
})
export class App implements OnInit {
  readonly icons = { Award, BookOpen, Boxes, Check, ChevronLeft, ChevronRight, CircleHelp, CloudCog, Code2, Copy, Database, Download, FileCheck2, FileText, FlaskConical, Focus, Gauge, GraduationCap, LayoutDashboard, Library, ListChecks, LockKeyhole, Menu, MessageSquareText, Network, PartyPopper, Play, Search, ServerCog, Settings2, Sparkles, Target, Terminal, Trophy, X };
  readonly modules = COURSE_MODULES;
  readonly serviceGroups = SERVICE_GROUPS;
  readonly quiz = QUIZ;
  readonly azureGroups: AltCloudGroup[] = AZURE_GROUPS;
  readonly gcpGroups: AltCloudGroup[] = GCP_GROUPS;
  readonly cloudComparison = CLOUD_COMPARISON;
  readonly educationFlow = [
    { title: 'Diagnóstico', label: 'Ubícate', detail: 'Entiende qué sabes, qué falta y cómo usarás el laboratorio local.' },
    { title: 'Fundamentos', label: 'Construye base', detail: 'Aprende servicios esenciales con comandos pequeños y verificables.' },
    { title: 'Aplicación', label: 'Une piezas', detail: 'Conecta servicios para formar una API útil con datos, eventos y seguridad.' },
    { title: 'Integración', label: 'Opera el sistema', detail: 'Automatiza infraestructura, contenedores, flujos y bases reales.' },
    { title: 'Experto', label: 'Demuestra dominio', detail: 'Entrega proyecto multi-nube, explica decisiones y compara proveedores.' },
  ];
  readonly studyCycle = [
    { title: 'Objetivo', detail: 'Lee qué debes poder explicar al final.' },
    { title: 'Concepto', detail: 'Estudia solo lo necesario para actuar.' },
    { title: 'Laboratorio', detail: 'Ejecuta comandos y observa resultados.' },
    { title: 'Evidencia', detail: 'Guarda comandos, errores y conclusiones.' },
    { title: 'Evaluación', detail: 'Responde sin mirar y decide si avanzas.' },
  ];
  readonly operatingSystems: { id: StudentOs; title: string; label: string; terminal: string }[] = [
    { id: 'mac', title: 'macOS', label: 'Terminal o iTerm', terminal: 'zsh' },
    { id: 'windows', title: 'Windows', label: 'PowerShell recomendado', terminal: 'PowerShell' },
    { id: 'linux', title: 'Linux', label: 'Bash/Zsh', terminal: 'bash' },
  ];
  readonly labLanguages: { id: LabLanguage; title: string; label: string; file: string }[] = [
    { id: 'javascript', title: 'JavaScript', label: 'Node.js moderno', file: 'app.mjs' },
    { id: 'typescript', title: 'TypeScript', label: 'Node.js tipado', file: 'app.ts' },
    { id: 'python', title: 'Python', label: 'Boto3 y FastAPI', file: 'app.py' },
    { id: 'java', title: 'Java', label: 'Spring Boot / SDK', file: 'App.java' },
    { id: 'go', title: 'Go', label: 'CLI y microservicios', file: 'main.go' },
    { id: 'csharp', title: 'C#', label: '.NET y Azure SDK', file: 'Program.cs' },
  ];
  readonly projectMilestones = [
    { module: 1, title: 'Archivos de tareas', detail: 'Sube adjuntos con almacenamiento de objetos y registra metadata.' },
    { module: 2, title: 'Trabajo asíncrono', detail: 'Manda tareas pesadas a una cola y procesa sin bloquear la API.' },
    { module: 3, title: 'Datos de usuario', detail: 'Guarda tareas por usuario y consulta sin usar Scan como atajo.' },
    { module: 5, title: 'Lógica serverless', detail: 'Convierte reglas del negocio en funciones invocables.' },
    { module: 6, title: 'API pública', detail: 'Expón GET y POST con contratos HTTP claros.' },
    { module: 8, title: 'Observabilidad', detail: 'Agrega logs, métricas y evidencia para depurar con método.' },
    { module: 11, title: 'Infraestructura', detail: 'Declara recursos como código y repite el ambiente desde cero.' },
    { module: 17, title: 'Entrega multi-nube', detail: 'Compara AWS, Azure y GCP con decisiones explicadas.' },
  ];
  readonly flociOpsStages = [
    { module: 1, title: 'Núcleo de tareas', services: ['S3', 'DynamoDB', 'SQS'], detail: 'Crea tareas, adjunta archivos y manda trabajos a una cola local.' },
    { module: 5, title: 'API y funciones', services: ['Lambda', 'API Gateway', 'CloudWatch'], detail: 'Expón endpoints, ejecuta lógica serverless y lee logs de cada intento.' },
    { module: 7, title: 'Eventos de dominio', services: ['SNS', 'EventBridge', 'Scheduler'], detail: 'Publica eventos como TaskCreated y ejecuta recordatorios programados.' },
    { module: 12, title: 'Workflow completo', services: ['Step Functions', 'Pipes', 'DLQ'], detail: 'Valida, procesa, reintenta y deriva errores sin bloquear la API.' },
    { module: 11, title: 'Operación reproducible', services: ['Secrets', 'KMS', 'CloudFormation'], detail: 'Declara recursos, maneja configuración y reconstruye el ambiente desde cero.' },
    { module: 15, title: 'Analítica y reportes', services: ['Athena', 'Glue', 'S3'], detail: 'Genera reportes sobre tareas y compara cómo cambiaría en nube real.' },
  ];
  readonly flociOpsLanguages = [
    { id: 'python', title: 'Python', stack: 'FastAPI + boto3', role: 'Versión didáctica principal para aprender rápido.' },
    { id: 'typescript', title: 'TypeScript', stack: 'Express + AWS SDK v3', role: 'Versión moderna para backend web y contratos tipados.' },
    { id: 'java', title: 'Java', stack: 'Spring Boot + AWS SDK', role: 'Versión empresarial para entender capas y servicios.' },
    { id: 'go', title: 'Go', stack: 'net/http + AWS SDK v2', role: 'Versión mínima, explícita y fácil de desplegar.' },
    { id: 'csharp', title: 'C#', stack: 'ASP.NET Minimal API', role: 'Versión .NET para conectar con ecosistema Microsoft.' },
  ];
  readonly flociOpsCoverage = [
    'Almacenamiento', 'Colas', 'Base de datos', 'Serverless', 'HTTP API',
    'Eventos', 'Workflows', 'Observabilidad', 'Seguridad', 'IaC', 'Contenedores', 'Búsqueda'
  ];
  readonly topicProjects: TopicProject[] = [
    { module: 1, title: 'Buzón de archivos', services: ['S3'], resource: 'flociops-files', detail: 'Sube, lista y descarga evidencias desde un bucket local.', verify: ['aws s3 ls s3://flociops-files', 'aws s3 cp s3://flociops-files/demo.txt -'] },
    { module: 2, title: 'Cola de trabajos', services: ['SQS', 'DLQ'], resource: 'flociops-jobs', detail: 'Envía tareas lentas a una cola y procesa reintentos controlados.', verify: ['aws sqs get-queue-url --queue-name flociops-jobs', 'aws sqs receive-message --queue-url <queue-url>'] },
    { module: 3, title: 'API de tareas', services: ['DynamoDB'], resource: 'FlociOpsTasks', detail: 'Guarda tareas por usuario y consulta por clave sin usar atajos malos.', verify: ['aws dynamodb describe-table --table-name FlociOpsTasks', 'aws dynamodb scan --table-name FlociOpsTasks --max-items 5'] },
    { module: 4, title: 'Caja de secretos', services: ['Secrets', 'KMS', 'SSM'], resource: '/flociops/api-key', detail: 'Lee configuración sensible sin hardcodear contraseñas en el código.', verify: ['aws secretsmanager get-secret-value --secret-id /flociops/api-key', 'aws ssm get-parameter --name /flociops/stage'] },
    { module: 5, title: 'Procesador serverless', services: ['Lambda'], resource: 'flociops-processor', detail: 'Ejecuta una función que transforma datos y deja evidencia verificable.', verify: ['aws lambda invoke --function-name flociops-processor output.json', 'cat output.json'] },
    { module: 6, title: 'Gateway HTTP', services: ['API Gateway'], resource: 'flociops-api', detail: 'Expón endpoints reales para crear, leer y procesar tareas.', verify: ['aws apigateway get-rest-apis', 'curl http://localhost:4566/restapis/<api-id>/dev/_user_request_/tasks'] },
    { module: 7, title: 'Bus de eventos', services: ['SNS', 'EventBridge'], resource: 'flociops-events', detail: 'Publica eventos de negocio y conecta consumidores desacoplados.', verify: ['aws events list-event-buses', 'aws sns list-topics'] },
    { module: 8, title: 'Panel de diagnóstico', services: ['CloudWatch'], resource: '/flociops/app', detail: 'Centraliza logs, filtra errores y crea una métrica verificable.', verify: ['aws logs describe-log-groups --log-group-name-prefix /flociops', 'aws logs filter-log-events --log-group-name /flociops/app'] },
    { module: 9, title: 'Base relacional', services: ['RDS'], resource: 'flociops-postgres', detail: 'Conecta una API a PostgreSQL local con migraciones simples.', verify: ['aws rds describe-db-instances --db-instance-identifier flociops-postgres', 'psql -h localhost -U admin -d postgres -c "select 1"'] },
    { module: 10, title: 'Worker en contenedor', services: ['ECR', 'ECS'], resource: 'flociops-worker', detail: 'Empaqueta un worker Docker y ejecútalo como tarea local.', verify: ['aws ecr describe-repositories --repository-names flociops-worker', 'aws ecs list-tasks --cluster flociops'] },
    { module: 11, title: 'Ambiente reconstruible', services: ['CloudFormation'], resource: 'flociops-stack', detail: 'Declara recursos como código y levanta todo desde cero.', verify: ['aws cloudformation describe-stacks --stack-name flociops-stack', 'aws cloudformation describe-stack-resources --stack-name flociops-stack'] },
    { module: 12, title: 'Workflow de aprobación', services: ['Step Functions'], resource: 'flociops-approval', detail: 'Orquesta validación, procesamiento, notificación y errores.', verify: ['aws stepfunctions list-state-machines', 'aws stepfunctions list-executions --state-machine-arn <arn>'] },
    { module: 13, title: 'Stream de actividad', services: ['Kinesis', 'MSK'], resource: 'flociops-activity', detail: 'Procesa eventos continuos y compara streams contra colas.', verify: ['aws kinesis describe-stream --stream-name flociops-activity', 'aws kinesis list-shards --stream-name flociops-activity'] },
    { module: 14, title: 'Login de usuarios', services: ['Cognito'], resource: 'flociops-users', detail: 'Protege la API con usuarios, tokens y grupos.', verify: ['aws cognito-idp list-user-pools --max-results 10', 'aws cognito-idp list-users --user-pool-id <pool-id>'] },
    { module: 15, title: 'Reporte de operaciones', services: ['Athena', 'Glue'], resource: 'flociops_reports', detail: 'Consulta eventos guardados en S3 con SQL y genera métricas.', verify: ['aws glue get-database --name flociops_reports', 'aws athena list-query-executions'] },
    { module: 16, title: 'Clasificador inteligente', services: ['Bedrock', 'Textract'], resource: 'flociops-classifier', detail: 'Extrae texto de documentos y genera un resumen con stubs locales.', verify: ['aws bedrock-runtime invoke-model --model-id demo --body "{}" output.json', 'aws textract analyze-document --document "{\"S3Object\":{\"Bucket\":\"flociops-files\",\"Name\":\"demo.png\"}}" --feature-types FORMS'] },
  ];
  readonly beginnerRules: LearningRule[] = [
    {
      title: 'No adivines dónde escribir',
      detail: 'Si el paso dice comando, va en la terminal. Si dice código, va dentro del archivo indicado.',
      example: 'Comando: floci start. Archivo: app.py, app.mjs, main.go o Program.cs.',
    },
    {
      title: 'Crea una carpeta por laboratorio',
      detail: 'Trabajar en carpetas separadas evita mezclar errores de un módulo con otro.',
      example: 'Carpeta sugerida: floci-labs/modulo-0-primeros-pasos.',
    },
    {
      title: 'Verifica antes de avanzar',
      detail: 'Un paso no termina cuando lo copias. Termina cuando ves una salida esperada o entiendes el error.',
      example: 'aws sts get-caller-identity debe mostrar Account 000000000000.',
    },
    {
      title: 'Anota el error completo',
      detail: 'Si algo falla, copia el comando, el error y qué intentaste. Eso entrena diagnóstico real.',
      example: 'Error: Docker no responde. Acción: abrir Docker Desktop y repetir docker info.',
    },
  ];
  readonly flociInstallOptions: InstallationOption[] = [
    {
      title: 'Opcion 1: Homebrew',
      scope: 'macOS / Linux',
      command: 'brew install floci-io/floci/floci',
      detail: 'Instala la CLI de Floci como herramienta del sistema. Es la ruta mas comoda si ya usas Homebrew.',
      recommendation: 'Recomendada para macOS y para Linux cuando ya tienes brew instalado.',
    },
    {
      title: 'Opcion 2: Script de instalacion',
      scope: 'macOS / Linux',
      command: 'curl -fsSL https://floci.io/install.sh | sh',
      detail: 'Descarga e instala Floci desde la terminal sin depender de Homebrew.',
      recommendation: 'Usala en Linux o cuando Homebrew no este disponible.',
    },
    {
      title: 'Opcion 3: Docker',
      scope: 'Solo emulador AWS',
      command: 'docker run -d --name floci -p 4566:4566 -v /var/run/docker.sock:/var/run/docker.sock floci/floci:latest',
      detail: 'Ejecuta Floci como contenedor. Sirve para levantar el emulador AWS sin instalar la CLI completa.',
      recommendation: 'Usala si quieres probar AWS local rapido o si trabajas con entornos basados en contenedores.',
    },
  ];
  readonly windowsAngularCommands: SetupCommand[] = [
    {
      title: 'Instala Angular CLI en WSL',
      command: 'npm install -g @angular/cli',
      detail: 'Agrega el comando ng en tu distribución Kali para poder usar ng serve.',
    },
    {
      title: 'Instala dependencias del proyecto',
      command: 'cd /mnt/c/Users/<TU_USUARIO>/Downloads/floci/floci/web && npm install',
      detail: 'Reemplaza <TU_USUARIO> por tu nombre de usuario de Windows y ejecuta esto en la carpeta web antes de levantar la aplicación.',
    },
    {
      title: 'Arranca la UI Angular',
      command: 'cd /mnt/c/Users/<TU_USUARIO>/Downloads/floci/floci/web && npx ng serve --host 0.0.0.0 --port 4200',
      detail: 'Inicia Angular desde WSL y expone la app al navegador de Windows. Reemplaza <TU_USUARIO> por tu usuario de Windows.',
    },
    {
      title: 'Abre la app en el navegador',
      command: 'http://localhost:4200',
      detail: 'Usa esta URL desde Windows para ver la UI una vez levantada.',
    },
  ];
  readonly stackportCommand: SetupCommand = {
    title: 'UI visual recomendada',
    command: 'docker run -d --name stackport -p 8080:8080 -e AWS_ENDPOINT_URL=http://host.docker.internal:4566 -e AWS_ACCESS_KEY_ID=test -e AWS_SECRET_ACCESS_KEY=test -e AWS_REGION=us-east-1 davireis/stackport',
    detail: 'Ejecuta StackPort como contenedor y apunta su UI al emulador Floci local.',
  };
  readonly stackportGuide: SetupCommand[] = [
    {
      title: 'Levanta StackPort',
      command: 'docker run -d --name stackport -p 8080:8080 -e AWS_ENDPOINT_URL=http://host.docker.internal:4566 -e AWS_ACCESS_KEY_ID=test -e AWS_SECRET_ACCESS_KEY=test -e AWS_REGION=us-east-1 davireis/stackport',
      detail: 'Arranca la interfaz web de StackPort y conéctala a Floci en el puerto 4566.',
    },
    {
      title: 'Abre el navegador',
      command: 'http://localhost:8080',
      detail: 'Accede desde Windows o WSL al panel de StackPort.',
    },
    {
      title: 'Conecta con Floci',
      command: 'Endpoint: http://host.docker.internal:4566',
      detail: 'Usa esta URL como endpoint AWS cuando StackPort te pida la conexión.',
    },
    {
      title: 'Credenciales de Floci',
      command: 'Access Key: test  Secret Key: test',
      detail: 'StackPort usa credenciales ficticias para hablar con el emulador local.',
    },
  ];
  readonly serviceModulePurpose: ServiceModuleCard[] = [
    {
      title: 'Entender para que sirve cada servicio',
      detail: 'No memorices nombres. Identifica si el servicio guarda archivos, procesa eventos, expone una API, protege secretos o automatiza infraestructura.',
      action: 'Antes de abrir un laboratorio, resume el problema que resuelve en una frase.',
    },
    {
      title: 'Comparar AWS, Azure y GCP sin confundirte',
      detail: 'La nube cambia nombres y detalles, pero los patrones se repiten. S3, Blob Storage y Cloud Storage resuelven la misma familia de problema.',
      action: 'Usa la pestaña Comparacion cuando no sepas como se llama un servicio en otra nube.',
    },
    {
      title: 'Elegir el siguiente laboratorio correcto',
      detail: 'Cada tarjeta apunta a un modulo practico. Si un servicio aparece abstracto, abre su laboratorio y verifica con Floci.',
      action: 'Haz clic en un servicio, lee su explicacion y abre el laboratorio asociado.',
    },
  ];
  readonly serviceCleanPractices: ServiceModuleCard[] = [
    {
      title: 'Un servicio, una responsabilidad',
      detail: 'Usa S3 para objetos, SQS para colas, DynamoDB para clave-valor y CloudWatch para observabilidad. Evita forzar un servicio a resolver todo.',
      action: 'Pregunta: que responsabilidad tecnica cumple este servicio?',
    },
    {
      title: 'Nombres consistentes',
      detail: 'Mantén prefijos como flociops-files, flociops-jobs o FlociOpsTasks. Los nombres claros reducen errores al verificar recursos.',
      action: 'Anota el nombre exacto del recurso antes de ejecutar comandos.',
    },
    {
      title: 'Verificacion antes de avanzar',
      detail: 'Un servicio no esta aprendido cuando lees la tarjeta. Esta aprendido cuando puedes crear, consultar y explicar la evidencia.',
      action: 'Busca una salida verificable: lista, JSON, log, URL, estado o tabla.',
    },
    {
      title: 'Comparacion con criterio',
      detail: 'No compares por marketing. Compara por problema, contrato de API, costo operativo, seguridad, observabilidad y facilidad de automatizacion.',
      action: 'Usa la tabla multi-nube para decidir equivalentes, no para memorizar marcas.',
    },
  ];
  readonly serviceDeviceTips: ServiceModuleCard[] = [
    {
      title: 'Desktop',
      detail: 'Trabaja con la tabla de comparacion y el detalle del servicio abierto. Es ideal para estudiar equivalencias lado a lado.',
      action: 'Usa buscador + pestañas + laboratorio.',
    },
    {
      title: 'Tablet',
      detail: 'Avanza por grupos: almacenamiento, eventos, datos, seguridad y observabilidad. Menos columnas, mas lectura guiada.',
      action: 'Escanea tarjetas y abre solo lo que vas a practicar.',
    },
    {
      title: 'Movil',
      detail: 'Usa una pregunta concreta: que servicio necesito y para que? La vista se compacta para leer una tarjeta a la vez.',
      action: 'Busca, abre detalle y guarda el modulo para practicar luego.',
    },
  ];
  readonly commandReading = [
    { title: 'Programa', detail: 'La primera palabra indica qué herramienta usas.', example: 'aws, docker, floci, python, node' },
    { title: 'Acción', detail: 'La segunda parte dice qué quieres hacer.', example: 's3 cp, lambda invoke, logs tail' },
    { title: 'Opciones', detail: 'Los valores con -- cambian cómo se ejecuta.', example: '--bucket tareas-locales, --region us-east-1' },
    { title: 'Resultado', detail: 'La salida confirma si el paso funcionó.', example: 'JSON, texto, archivo creado o mensaje de error' },
  ];
  readonly fileBasics = [
    { title: 'Carpeta', detail: 'Lugar donde guardas todos los archivos de un laboratorio.', example: 'floci-labs/modulo-0-primeros-pasos' },
    { title: 'Archivo', detail: 'Documento concreto donde escribes código o configuración.', example: 'app.py, app.mjs, docker-compose.yml' },
    { title: 'Guardar', detail: 'Después de pegar código debes guardar antes de ejecutar.', example: 'Ctrl+S o Cmd+S' },
    { title: 'Ruta actual', detail: 'La terminal ejecuta comandos dentro de una carpeta. Esa carpeta importa.', example: 'pwd en macOS/Linux, Get-Location en Windows' },
  ];

  view = signal<View>('dashboard');
  selectedModuleId = signal(this.findNextModule());
  sidebarOpen = signal(false);
  focusMode = signal(false);
  serviceQuery = signal('');
  libraryQuery = signal('');
  libraryCategory = signal('todos');
  libraryDocuments = signal<LibraryDocument[]>([]);
  selectedDocument = signal<LibraryDocument | null>(null);
  documentHtml = signal('');
  documentRaw = signal('');
  documentLoading = signal(false);
  copiedDocument = signal(false);
  lessonTab = signal<'learn' | 'practice' | 'notes'>('learn');
  lessonHtml = signal('');
  lessonLoading = signal(false);
  serviceStudies = signal<ServiceStudy[]>([]);
  selectedService = signal<ServiceStudy | null>(null);
  copiedText = signal('');
  selectedQuiz = signal<Record<number, number>>({});
  quizChecked = signal(false);
  progress = signal<StoredProgress>(this.loadProgress());
  cloudTab = signal<CloudTab>('aws');
  comparisonQuery = signal('');
  selectedOs = signal<StudentOs>(this.loadSetup().os);
  selectedLanguage = signal<LabLanguage>(this.loadSetup().language);
  selectedTopicProjectIndex = signal(0);

  selectedModule = computed(() => this.moduleById(this.selectedModuleId()) ?? this.modules[0]);
  completedCount = computed(() => this.progress().completedModules.length);
  completion = computed(() => Math.round((this.completedCount() / this.modules.length) * 100));
  courseCompleted = computed(() => this.completion() === 100);
  completedChallenges = computed(() => Object.values(this.progress().completedChallenges).filter(Boolean).length);
  totalChallenges = computed(() => this.modules.reduce((sum, item) => sum + item.challenges.length, 0));
  earnedBadges = computed(() =>
    (['Fundamentos', 'Aplicación', 'Integración', 'Experto'] as CourseModule['level'][])
      .filter(level => this.levelTotal(level) > 0 && this.levelCount(level) === this.levelTotal(level))
  );
  serviceCount = computed(() => this.serviceStudies().length || 52);
  quizScore = computed(() => this.quiz.reduce((score, item, index) => score + (this.selectedQuiz()[index] === item.answer ? 1 : 0), 0));
  filteredComparison = computed(() => {
    const query = this.comparisonQuery().trim().toLowerCase();
    if (!query) return CLOUD_COMPARISON;
    return CLOUD_COMPARISON.filter(item =>
      item.categoria.toLowerCase().includes(query) ||
      item.aws.toLowerCase().includes(query) ||
      item.azure.toLowerCase().includes(query) ||
      item.gcp.toLowerCase().includes(query)
    );
  });
  filteredGroups = computed(() => {
    const query = this.serviceQuery().trim().toLowerCase();
    if (!query) return this.serviceGroups;
    return this.serviceGroups
      .map(group => ({ ...group, services: group.services.filter(service => service.toLowerCase().includes(query)) }))
      .filter(group => group.services.length || group.name.toLowerCase().includes(query));
  });
  libraryCategories = computed(() => ['todos', ...new Set(this.libraryDocuments().map(item => item.category))]);
  filteredDocuments = computed(() => {
    const query = this.libraryQuery().trim().toLowerCase();
    const category = this.libraryCategory();
    return this.libraryDocuments().filter(item =>
      (category === 'todos' || item.category === category) &&
      (!query || `${item.title} ${item.category} ${item.language}`.toLowerCase().includes(query))
    );
  });
  selectedOsInfo = computed(() => this.operatingSystems.find(item => item.id === this.selectedOs()) ?? this.operatingSystems[0]);
  selectedLanguageInfo = computed(() => this.labLanguages.find(item => item.id === this.selectedLanguage()) ?? this.labLanguages[0]);
  newcomerGuide = computed(() => this.explainLikeNewcomer(this.selectedModule()));
  selectedTopicProject = computed(() => this.topicProjects[this.selectedTopicProjectIndex()] ?? this.topicProjects[0]);
  selectedTopicProjectGuide = computed(() => this.explainTopicProjectLikeNewcomer(this.selectedTopicProject()));
  setupCommands = computed(() => this.commandsForOs(this.selectedOs()));
  languageSnippet = computed(() => this.snippetForLanguage(this.selectedLanguage()));
  languageInstallCommands = computed(() => this.commandsForLanguageAction('install', this.selectedLanguage(), this.languageSnippet()));
  languageRunCommands = computed(() => this.commandsForLanguageAction('run', this.selectedLanguage(), this.languageSnippet()));
  workspaceSteps = computed(() => this.stepsToCreateLab(this.selectedOs(), this.languageSnippet()));
  profileSetupLine = computed(() => this.linearSetupLine(this.workspaceSteps()));
  projectSetupLine = computed(() => this.linearSetupLine(this.topicProjectCreateCommands(), this.topicProjectVerification().slice(0, 1)));
  highlightedLanguageCode = computed(() => this.highlightCode(this.languageSnippet().code, this.selectedLanguage()));
  highlightedTopicProjectCode = computed(() => this.highlightCode(this.topicProjectCode(), this.selectedLanguage()));
  terminalGuide = computed(() => this.guideForTerminal(this.selectedOs()));
  ideGuide = computed(() => this.guideForIde(this.selectedOs(), this.selectedLanguage()));

  ngOnInit(): void {
    void this.loadLibrary();
    void this.loadServiceStudies();
    void this.loadLesson(this.selectedModuleId());
  }

  setView(view: View): void { this.view.set(view); this.sidebarOpen.set(false); }
  setStudentOs(os: StudentOs): void {
    this.selectedOs.set(os);
    this.saveSetup();
  }
  setLabLanguage(language: LabLanguage): void {
    this.selectedLanguage.set(language);
    this.saveSetup();
  }
  openModule(id: number): void {
    this.selectedModuleId.set(id); this.view.set('path'); this.sidebarOpen.set(false);
    this.lessonTab.set('learn'); void this.loadLesson(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  moveModule(delta: number): void { this.openModule(Math.min(this.modules.length - 1, Math.max(0, this.selectedModuleId() + delta))); }
  isModuleDone(id: number): boolean { return this.progress().completedModules.includes(id); }
  toggleModule(id: number): void {
    const current = this.progress();
    const completedModules = this.isModuleDone(id) ? current.completedModules.filter(item => item !== id) : [...current.completedModules, id].sort((a, b) => a - b);
    this.save({ ...current, completedModules });
  }
  challengeKey(moduleId: number, challengeIndex: number): string { return `${moduleId}-${challengeIndex}`; }
  toggleChallenge(moduleId: number, challengeIndex: number): void {
    const current = this.progress(); const key = this.challengeKey(moduleId, challengeIndex);
    this.save({ ...current, completedChallenges: { ...current.completedChallenges, [key]: !current.completedChallenges[key] } });
  }
  updateNote(moduleId: number, value: string): void { const current = this.progress(); this.save({ ...current, notes: { ...current.notes, [moduleId]: value } }); }
  updateEvidence(moduleId: number, value: string): void { const current = this.progress(); this.save({ ...current, evidence: { ...current.evidence, [moduleId]: value } }); }
  selectQuiz(question: number, option: number): void { if (!this.quizChecked()) this.selectedQuiz.update(value => ({ ...value, [question]: option })); }
  resetQuiz(): void { this.selectedQuiz.set({}); this.quizChecked.set(false); }
  levelCount(level: CourseModule['level']): number { return this.modules.filter(item => item.level === level && this.isModuleDone(item.id)).length; }
  levelTotal(level: CourseModule['level']): number { return this.modules.filter(item => item.level === level).length; }
  educationStepState(index: number): 'done' | 'active' | 'pending' {
    const completed = this.completedCount();
    const active = completed === 0 ? 0 : completed < 5 ? 1 : completed < 9 ? 2 : completed < 13 ? 3 : 4;
    if (index < active) return 'done';
    return index === active ? 'active' : 'pending';
  }
  completedModuleChallenges(moduleId: number): number {
    const module = this.moduleById(moduleId);
    if (!module) return 0;
    return module.challenges.filter((_, index) => this.progress().completedChallenges[this.challengeKey(moduleId, index)]).length;
  }
  moduleProgressRatio(moduleId: number): number {
    const module = this.moduleById(moduleId);
    if (!module?.challenges.length) return 0;
    return this.completedModuleChallenges(moduleId) / module.challenges.length;
  }
  explainLikeNewcomer(module: CourseModule): ExplainLikeNewcomer {
    const mainService = module.services[0] ?? module.shortTitle;
    const firstConcept = module.concepts[0] ?? module.shortTitle;
    const secondConcept = module.concepts[1] ?? 'flujo de trabajo';
    const thirdConcept = module.concepts[2] ?? 'verificacion';
    const firstChallenge = module.challenges[0] ? this.challengeGuide(module.challenges[0], 0) : null;
    return {
      essence: `${module.shortTitle} sirve para resolver un problema real: ${module.description}`,
      analogy: `${firstConcept} es como una estacion de trabajo: primero recibes algo, luego lo organizas y al final verificas que quedo donde esperabas.`,
      parts: [
        { title: '1. Problema', detail: `Identifica que necesidad cubre ${mainService}: guardar, procesar, proteger, consultar o automatizar algo.` },
        { title: '2. Pieza central', detail: `Entiende ${firstConcept} antes de mezclarlo con otros servicios. Una idea clara vale mas que diez comandos copiados.` },
        { title: '3. Flujo', detail: `Conecta ${secondConcept} con una entrada, una accion y una salida observable.` },
        { title: '4. Evidencia', detail: `Comprueba ${thirdConcept} con CLI, logs, archivo generado, respuesta HTTP o recurso listado.` },
      ],
      mistakes: [
        'Copiar comandos sin mirar en que carpeta o terminal se ejecutan.',
        `Confundir el nombre del servicio con el problema que resuelve ${mainService}.`,
        'Marcar el reto como terminado sin una salida verificable.',
      ],
      questions: [
        `Que problema real resuelve ${mainService}?`,
        `Que entrada necesita este modulo para funcionar?`,
        'Que salida demuestra que no solo lo lei, sino que lo ejecute?',
        'Que error comun podria aparecer y como lo diagnosticaria?',
        'Como explicaria este tema en una frase a alguien que empieza desde cero?',
      ],
      action: firstChallenge?.command
        ? `Hoy haz esto: ${firstChallenge.action}. Ejecuta: ${firstChallenge.command}`
        : `Hoy haz esto: abre el modulo ${module.id}, ejecuta el primer reto y guarda la evidencia en tus notas.`,
      misconception: `No aprendas ${module.shortTitle} como una lista de comandos. Aprende el circuito: problema -> servicio -> recurso -> operacion -> verificacion.`,
    };
  }
  explainTopicProjectLikeNewcomer(project: TopicProject): ExplainLikeNewcomer {
    const mainService = project.services[0] ?? 'Floci';
    const secondaryService = project.services[1] ?? 'CLI';
    const firstVerify = project.verify[0] ?? 'ejecuta la verificacion del laboratorio';
    const language = this.selectedLanguageInfo().title;
    return {
      essence: `${project.title} sirve para practicar ${mainService} en un caso pequeño y real: ${project.detail}`,
      analogy: `${mainService} es como una estacion de trabajo del proyecto: recibe una solicitud, la guarda o procesa, y luego te deja comprobar que el resultado existe.`,
      parts: [
        { title: '1. Caso real', detail: `Primero entiende que problema resuelve: ${project.detail}` },
        { title: '2. Recurso central', detail: `El recurso que vas a crear o consultar se llama ${project.resource}. Si ese nombre no aparece en la salida, algo falta.` },
        { title: '3. Codigo minimo', detail: `Usa ${language} para ejecutar una accion pequeña contra Floci local antes de intentar arquitectura grande.` },
        { title: '4. Verificacion', detail: `Termina el mini proyecto solo cuando puedas ejecutar: ${firstVerify}` },
      ],
      mistakes: [
        `Crear codigo sin saber para que sirve ${mainService}.`,
        `Cambiar el nombre ${project.resource} y luego verificar otro recurso diferente.`,
        'Ejecutar el codigo sin confirmar que Floci, Docker y la CLI esten activos.',
      ],
      questions: [
        `Que problema pequeño resuelve ${project.title}?`,
        `Que recurso exacto debo ver creado o consultado: ${project.resource}?`,
        `Que papel cumple ${mainService} y que papel cumple ${secondaryService}?`,
        `Que comando demuestra que el proyecto funciono?`,
        'Que error anotaria si tuviera que explicarle este laboratorio a otra persona?',
      ],
      action: `Hoy completa ${project.title}: crea la carpeta, pega el codigo, ejecutalo y guarda una captura o nota de esta verificacion: ${firstVerify}`,
      misconception: `No trates ${project.title} como un ejemplo aislado. Es una pieza de FlociOps: problema -> recurso -> codigo -> ejecucion -> evidencia.`,
    };
  }
  topicProjectFolder(project: TopicProject = this.selectedTopicProject()): string {
    return `flociops-${project.module}-${project.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
  }
  topicProjectCreateCommands(project: TopicProject = this.selectedTopicProject()): SetupCommand[] {
    const folder = this.topicProjectFolder(project);
    const makeFolder = this.selectedOs() === 'windows' ? `mkdir ${folder}; cd ${folder}` : `mkdir -p ${folder} && cd ${folder}`;
    return [
      { title: 'Crear carpeta', command: makeFolder, detail: 'Aisla este mini proyecto para que puedas borrarlo y repetirlo desde cero.' },
      ...this.languageInstallCommands(),
      { title: 'Crear archivo', command: this.selectedOs() === 'windows' ? `New-Item ${this.languageSnippet().file} -ItemType File` : `touch ${this.languageSnippet().file}`, detail: 'Pega el codigo base en este archivo y guardalo.' },
      ...this.languageRunCommands(),
    ];
  }
  topicProjectVerification(project: TopicProject = this.selectedTopicProject()): SetupCommand[] {
    return project.verify.map((command, index) => ({
      title: index === 0 ? 'Verificar recurso' : 'Verificar resultado',
      command,
      detail: 'La salida debe mostrar el recurso creado, el mensaje procesado o el resultado del servicio local.',
    }));
  }
  challengeGuide(challenge: string, index: number): ChallengeGuide {
    const normalized = challenge.replaceAll('â€”', '—').replaceAll('–', '—');
    const [rawAction, ...rawCommandParts] = normalized.split('—');
    const action = rawAction.trim().replace(/\s+/g, ' ');
    const command = rawCommandParts.join('—').trim();
    const lower = `${action} ${command}`.toLowerCase();
    const verify = command
      ? this.verificationHintForCommand(command)
      : 'Registra la evidencia: recurso creado, archivo generado, JSON recibido o error diagnosticado.';
    const advice = lower.includes('...') || lower.includes('<')
      ? 'Reemplaza <valores> y puntos suspensivos con IDs reales obtenidos en pasos anteriores.'
      : index === 0
        ? 'Empieza con este paso en una carpeta limpia para evitar mezclar recursos de otros laboratorios.'
        : 'Si falla, copia el error completo y confirma que Floci siga corriendo antes de repetir.';
    return { action, command, verify, advice };
  }
  topicProjectCode(project: TopicProject = this.selectedTopicProject()): string {
    const service = project.services[0];
    const resource = project.resource;
    if (this.selectedLanguage() === 'python') return this.pythonTopicCode(service, resource);
    if (this.selectedLanguage() === 'typescript') return this.javascriptTopicCode(service, resource).replace("import {", "import {").replace('.mjs', '.ts');
    if (this.selectedLanguage() === 'javascript') return this.javascriptTopicCode(service, resource);
    if (this.selectedLanguage() === 'go') return `package main

import "fmt"

func main() {
  fmt.Println("Mini proyecto FlociOps: ${project.title}")
  fmt.Println("Servicio: ${project.services.join(', ')}")
  fmt.Println("Recurso local: ${resource}")
  fmt.Println("Implementa el cliente SDK siguiendo el módulo ${project.module} y verifica con la CLI.")
}`;
    if (this.selectedLanguage() === 'java') return this.javaTopicCode(project);
    return `Console.WriteLine("Mini proyecto FlociOps: ${project.title}");
Console.WriteLine("Servicio: ${project.services.join(', ')}");
Console.WriteLine("Recurso local: ${resource}");
Console.WriteLine("Implementa el cliente SDK siguiendo el módulo ${project.module} y verifica con la CLI.");`;
  }
  codeLanguageClass(language: LabLanguage = this.selectedLanguage()): string {
    return `language-${language}`;
  }
  highlightCode(source: string, language: LabLanguage): string {
    return source.split('\n').map((line, index) =>
      `<span class="code-line"><span class="line-no">${index + 1}</span><span class="line-src">${this.highlightLine(line, language)}</span></span>`
    ).join('');
  }
  private highlightLine(line: string, language: LabLanguage): string {
    const tokens: string[] = [];
    let html = this.escapeHtml(line);
    const stash = (value: string, className: string): string => {
      const token = `%%${'x'.repeat(tokens.length + 1)}%%`;
      tokens.push(`<span class="${className}">${value}</span>`);
      return token;
    };
    html = html.replace(/(".*?"|'.*?'|`.*?`)/g, value => stash(value, 'tok-string'));
    html = html.replace(/(\/\/.*|#.*)$/g, value => stash(value, 'tok-comment'));
    const keywordSets: Record<LabLanguage, string[]> = {
      javascript: ['import', 'from', 'const', 'let', 'var', 'await', 'new', 'return', 'async', 'function'],
      typescript: ['import', 'from', 'const', 'let', 'type', 'await', 'new', 'return', 'async', 'function'],
      python: ['import', 'from', 'def', 'return', 'print', 'class', 'with', 'as', 'None', 'True', 'False'],
      java: ['import', 'public', 'class', 'static', 'void', 'new', 'var', 'return'],
      go: ['package', 'import', 'func', 'return', 'var', 'const'],
      csharp: ['using', 'var', 'await', 'new', 'return', 'class', 'public'],
    };
    const keywords = keywordSets[language].join('|');
    html = html.replace(new RegExp(`\\b(${keywords})\\b`, 'g'), '<span class="tok-keyword">$1</span>');
    html = html.replace(/\b([A-Z][A-Za-z0-9_]*|[a-zA-Z0-9_]*Client|[a-zA-Z0-9_]*Command)\b/g, '<span class="tok-type">$1</span>');
    html = html.replace(/\b(\d+)\b/g, '<span class="tok-number">$1</span>');
    html = html.replace(/%%(x+)%%/g, (_, key) => tokens[String(key).length - 1] ?? '');
    return html || ' ';
  }
  commandForSelectedOs(command: SetupCommand): string { return command.command; }
  moduleById(moduleId: number): CourseModule | undefined { return this.modules.find(item => item.id === moduleId); }
  moduleForService(service: string): number { return this.modules.find(item => item.services.includes(service))?.id ?? 0; }
  isFirstOfPhase(id: number): boolean {
    if (id === 0) return true;
    return this.modules[id].level !== this.modules[id - 1].level;
  }
  openCloudService(view: View): void { this.setView(view); this.cloudTab.set('aws'); }
  async openServiceDocument(service: string): Promise<void> {
    const study = this.findServiceStudy(service);
    if (study) {
      this.selectedService.set(study);
      setTimeout(() => window.document.querySelector('.service-detail')?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
      return;
    }
    await this.openOfficialService(service);
  }
  async openOfficialService(service: string): Promise<void> {
    const aliases: Record<string, string> = {
      'DynamoDB Streams': 'DynamoDB', 'API Gateway v1': 'API Gateway', 'API Gateway v2': 'API Gateway',
      'EventBridge Pipes': 'EventBridge Pipes', 'AppConfigData': 'AppConfig', 'SES v2': 'SES',
      'Tagging API': 'Resource Groups Tagging API', 'ELB v2': 'Elastic Load Balancing v2', 'AWS Backup': 'AWS Backup'
    };
    const target = (aliases[service] || service).toLowerCase();
    const document = this.libraryDocuments().find(item => item.type === 'official' && item.title.toLowerCase().includes(target));
    if (document) { this.setView('library'); await this.openDocument(document); }
    else { this.openModule(this.moduleForService(service)); }
  }
  async copyTextValue(value: string): Promise<void> {
    await navigator.clipboard.writeText(value); this.copiedText.set(value);
    setTimeout(() => this.copiedText.set(''), 1600);
  }
  async openDocument(document: LibraryDocument): Promise<void> {
    this.selectedDocument.set(document); this.documentLoading.set(true); this.copiedDocument.set(false);
    try {
      const response = await fetch(document.path);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const raw = await response.text();
      this.documentRaw.set(raw);
      if (document.type === 'code') {
        this.documentHtml.set(`<pre class="code-document"><code>${this.escapeHtml(raw)}</code></pre>`);
      } else {
        const normalized = raw
          .replaceAll('../assets/', '/content/oficial-es/assets/')
          .replaceAll('](assets/', '](/content/oficial-es/assets/');
        this.documentHtml.set(marked.parse(normalized, { async: false }) as string);
      }
    } catch (error) {
      this.documentHtml.set(`<p>No se pudo cargar este recurso: ${this.escapeHtml(String(error))}</p>`);
    } finally { this.documentLoading.set(false); }
  }
  async copyDocument(): Promise<void> {
    await navigator.clipboard.writeText(this.documentRaw());
    this.copiedDocument.set(true); setTimeout(() => this.copiedDocument.set(false), 1800);
  }
  downloadDocument(): void {
    const document = this.selectedDocument(); if (!document) return;
    const blob = new Blob([this.documentRaw()], { type: 'text/plain;charset=utf-8' });
    const link = window.document.createElement('a'); link.href = URL.createObjectURL(blob);
    link.download = document.path.split('/').pop() || 'documento.txt'; link.click(); URL.revokeObjectURL(link.href);
  }

  private save(progress: StoredProgress): void { this.progress.set(progress); localStorage.setItem('floci-academy-progress', JSON.stringify(progress)); }
  private saveSetup(): void {
    localStorage.setItem('floci-academy-setup', JSON.stringify({ os: this.selectedOs(), language: this.selectedLanguage() }));
  }
  private loadSetup(): StudentSetup {
    try {
      const stored = JSON.parse(localStorage.getItem('floci-academy-setup') || '{}') as Partial<StudentSetup>;
      return {
        os: this.isStudentOs(stored.os) ? stored.os : DEFAULT_SETUP.os,
        language: this.isLabLanguage(stored.language) ? stored.language : DEFAULT_SETUP.language,
      };
    }
    catch { return DEFAULT_SETUP; }
  }
  private isStudentOs(value: unknown): value is StudentOs {
    return value === 'mac' || value === 'windows' || value === 'linux';
  }
  private isLabLanguage(value: unknown): value is LabLanguage {
    return value === 'javascript' || value === 'typescript' || value === 'python' || value === 'java' || value === 'go' || value === 'csharp';
  }
  private commandsForOs(os: StudentOs): SetupCommand[] {
    const shared = {
      docker: { title: 'Verifica Docker', detail: 'Debe responder con información del motor local.' },
      start: { title: 'Inicia Floci AWS', detail: 'Levanta el emulador local que usarás en los primeros laboratorios.' },
      verify: { title: 'Comprueba identidad AWS', detail: 'Debes ver la cuenta local 000000000000, no tu cuenta real.' },
    };
    if (os === 'windows') {
      return [
        { ...shared.docker, command: 'docker info' },
        { ...shared.start, command: 'floci start' },
        { title: 'Carga variables AWS', command: 'floci env --powershell | Invoke-Expression', detail: 'Configura endpoint y credenciales dentro de PowerShell.' },
        { ...shared.verify, command: 'aws sts get-caller-identity' },
        { title: 'Configura Azure local', command: '$env:AZURE_STORAGE_CONNECTION_STRING="UseDevelopmentStorage=true"', detail: 'Usa variables de entorno de PowerShell para Blob Storage local.' },
      ];
    }
    if (os === 'linux') {
      return [
        { ...shared.docker, command: 'docker info' },
        { title: 'Instala Floci', command: 'curl -fsSL https://floci.io/install.sh | sh', detail: 'Instala la CLI desde la terminal Linux.' },
        { ...shared.start, command: 'floci start' },
        { title: 'Carga variables AWS', command: 'eval $(floci env)', detail: 'Configura endpoint y credenciales en tu shell actual.' },
        { ...shared.verify, command: 'aws sts get-caller-identity' },
      ];
    }
    return [
      { title: 'Instala Floci', command: 'brew install floci-io/floci/floci', detail: 'Homebrew es la ruta más simple en macOS.' },
      { ...shared.docker, command: 'docker info' },
      { ...shared.start, command: 'floci start' },
      { title: 'Carga variables AWS', command: 'eval $(floci env)', detail: 'Configura endpoint y credenciales en zsh.' },
      { ...shared.verify, command: 'aws sts get-caller-identity' },
    ];
  }
  private commandsForLanguageAction(action: 'install' | 'run', language: LabLanguage, snippet: { install: string; run: string }): SetupCommand[] {
    if (language !== 'java') {
      return [{
        title: action === 'install' ? 'Preparar SDK' : 'Ejecutar',
        command: action === 'install' ? snippet.install : snippet.run,
        detail: action === 'install'
          ? `Instala dependencias para ${this.selectedLanguageInfo().title}.`
          : 'Ejecuta el laboratorio contra Floci local.',
      }];
    }

    if (action === 'install') {
      return [
        {
          title: 'Ruta Maven',
          command: 'mvn -q archetype:generate -DgroupId=academy.floci -DartifactId=tareas-locales -DarchetypeArtifactId=maven-archetype-quickstart -DinteractiveMode=false',
          detail: 'Crea un proyecto Maven. Despues agrega la dependencia software.amazon.awssdk:s3 en pom.xml.',
        },
        {
          title: 'Ruta Gradle',
          command: 'gradle init --type java-application --dsl groovy',
          detail: 'Crea un proyecto Gradle. Despues agrega implementation "software.amazon.awssdk:s3" en build.gradle.',
        },
      ];
    }

    return [
      {
        title: 'Ejecutar con Maven',
        command: 'mvn exec:java -Dexec.mainClass=App',
        detail: 'Usa esta ruta si creaste el proyecto con Maven.',
      },
      {
        title: 'Ejecutar con Gradle',
        command: 'gradle run',
        detail: 'Usa esta ruta si creaste el proyecto con Gradle.',
      },
    ];
  }
  private stepsToCreateLab(os: StudentOs, snippet: { title: string; file: string; install: string; code: string; run: string }): SetupCommand[] {
    const createFolder = os === 'windows'
      ? 'mkdir floci-labs\\modulo-0-primeros-pasos; cd floci-labs\\modulo-0-primeros-pasos'
      : 'mkdir -p floci-labs/modulo-0-primeros-pasos && cd floci-labs/modulo-0-primeros-pasos';
    const createFile = os === 'windows'
      ? `New-Item ${snippet.file} -ItemType File`
      : `touch ${snippet.file}`;
    const openFile = os === 'windows'
      ? `notepad ${snippet.file}`
      : `code ${snippet.file}`;
    const steps: SetupCommand[] = [
      { title: 'Crea la carpeta del laboratorio', command: createFolder, detail: 'Haz esto una sola vez por modulo. Despues todos los archivos quedan ordenados ahi.' },
      { title: 'Crea el archivo de codigo', command: createFile, detail: `El archivo debe llamarse exactamente ${snippet.file}. Si el nombre cambia, el comando de ejecucion puede fallar.` },
      ...this.languageInstallCommands(),
      { title: 'Abre el archivo y pega el codigo', command: openFile, detail: 'Pega el ejemplo, guarda el archivo y luego vuelve a la terminal.' },
      ...this.languageRunCommands(),
    ];
    return steps.map((step, index) => ({ ...step, title: `${index + 1}. ${step.title}` }));
  }
  private linearSetupLine(workSteps: SetupCommand[], verificationSteps: SetupCommand[] = []): LinearSetupStep[] {
    const osSteps = this.setupCommands().slice(0, 4).map(command => ({
      ...command,
      phase: `Sistema: ${this.selectedOsInfo().title}`,
    }));
    const labSteps = workSteps.map(command => ({
      ...command,
      phase: `Lenguaje: ${this.selectedLanguageInfo().title}`,
    }));
    const verification = verificationSteps.map(command => ({
      ...command,
      phase: 'Verificacion',
    }));
    return [...osSteps, ...labSteps, ...verification];
  }
  private guideForTerminal(os: StudentOs): TerminalGuide {
    if (os === 'windows') {
      return {
        title: 'Abrir consola en Windows',
        openSteps: [
          'Presiona la tecla Windows.',
          'Escribe PowerShell.',
          'Haz clic en Windows PowerShell. Si el curso pide permisos, usa Ejecutar como administrador.',
          'Para pegar comandos usa Ctrl+V. Si no pega, clic derecho dentro de la ventana.',
          'Cuando veas una línea con PS C:\\...>, ya puedes escribir comandos.',
        ],
        shortcuts: [
          { key: 'Win', action: 'Abrir búsqueda de Windows' },
          { key: 'Ctrl + V', action: 'Pegar comando en PowerShell' },
          { key: 'Flecha arriba', action: 'Repetir el comando anterior' },
          { key: 'Ctrl + C', action: 'Detener un proceso que quedó corriendo' },
          { key: 'cls', action: 'Limpiar pantalla' },
        ],
        firstCommands: [
          { title: 'Dónde estoy', command: 'Get-Location', detail: 'Muestra la carpeta actual donde PowerShell ejecutará comandos.' },
          { title: 'Ver archivos', command: 'dir', detail: 'Lista carpetas y archivos del lugar actual.' },
          { title: 'Entrar a carpeta', command: 'cd floci-labs', detail: 'Cambia a una carpeta existente.' },
          { title: 'Subir un nivel', command: 'cd ..', detail: 'Vuelve a la carpeta anterior.' },
        ],
      };
    }
    if (os === 'linux') {
      return {
        title: 'Abrir consola en Linux',
        openSteps: [
          'Presiona Ctrl+Alt+T. En la mayoría de distribuciones abre Terminal.',
          'Si no abre, busca Terminal en el menú de aplicaciones.',
          'Cuando veas una línea terminada en $ o %, ya puedes escribir comandos.',
          'Pega comandos con Ctrl+Shift+V.',
          'Si un proceso no responde, detenlo con Ctrl+C.',
        ],
        shortcuts: [
          { key: 'Ctrl + Alt + T', action: 'Abrir Terminal' },
          { key: 'Ctrl + Shift + V', action: 'Pegar en Terminal' },
          { key: 'Flecha arriba', action: 'Repetir el comando anterior' },
          { key: 'Ctrl + C', action: 'Detener proceso activo' },
          { key: 'clear', action: 'Limpiar pantalla' },
        ],
        firstCommands: [
          { title: 'Dónde estoy', command: 'pwd', detail: 'Muestra la carpeta actual.' },
          { title: 'Ver archivos', command: 'ls', detail: 'Lista carpetas y archivos.' },
          { title: 'Entrar a carpeta', command: 'cd floci-labs', detail: 'Cambia a una carpeta existente.' },
          { title: 'Subir un nivel', command: 'cd ..', detail: 'Vuelve a la carpeta anterior.' },
        ],
      };
    }
    return {
      title: 'Abrir consola en macOS',
      openSteps: [
        'Presiona Cmd+Espacio para abrir Spotlight.',
        'Escribe Terminal.',
        'Presiona Enter.',
        'Cuando veas una línea terminada en % o $, ya puedes escribir comandos.',
        'Pega comandos con Cmd+V. Si un proceso no responde, usa Ctrl+C.',
      ],
      shortcuts: [
        { key: 'Cmd + Espacio', action: 'Abrir Spotlight' },
        { key: 'Cmd + V', action: 'Pegar comando en Terminal' },
        { key: 'Flecha arriba', action: 'Repetir el comando anterior' },
        { key: 'Ctrl + C', action: 'Detener proceso activo' },
        { key: 'clear', action: 'Limpiar pantalla' },
      ],
      firstCommands: [
        { title: 'Dónde estoy', command: 'pwd', detail: 'Muestra la carpeta actual.' },
        { title: 'Ver archivos', command: 'ls', detail: 'Lista carpetas y archivos.' },
        { title: 'Entrar a carpeta', command: 'cd floci-labs', detail: 'Cambia a una carpeta existente.' },
        { title: 'Subir un nivel', command: 'cd ..', detail: 'Vuelve a la carpeta anterior.' },
      ],
    };
  }
  private guideForIde(os: StudentOs, language: LabLanguage): IdeGuide {
    const editorCommand = os === 'windows' ? 'code .' : 'code .';
    const modifier = os === 'mac' ? 'Cmd' : 'Ctrl';
    const prereq: Record<LabLanguage, SetupCommand[]> = {
      javascript: [
        { title: 'Verifica Node.js', command: 'node --version', detail: 'Debe mostrar una versión. Si no aparece, instala Node.js LTS.' },
        { title: 'Verifica npm', command: 'npm --version', detail: 'npm se instala junto con Node.js.' },
      ],
      typescript: [
        { title: 'Verifica Node.js', command: 'node --version', detail: 'TypeScript corre sobre Node.js.' },
        { title: 'Instala TypeScript runner', command: 'npm install -g tsx', detail: 'Permite ejecutar archivos .ts desde la terminal.' },
      ],
      python: [
        { title: 'Verifica Python', command: os === 'windows' ? 'py --version' : 'python3 --version', detail: 'Debe mostrar Python 3.10 o superior.' },
        { title: 'Verifica pip', command: os === 'windows' ? 'py -m pip --version' : 'python3 -m pip --version', detail: 'pip instala librerías de Python.' },
      ],
      java: [
        { title: 'Verifica Java', command: 'java --version', detail: 'Debe mostrar JDK 17 o superior.' },
        { title: 'Verifica Maven', command: 'mvn --version', detail: 'Ruta A: Maven instala dependencias y ejecuta proyectos Java.' },
        { title: 'Verifica Gradle', command: 'gradle --version', detail: 'Ruta B: Gradle sirve si prefieres build.gradle o ya vienes de Android/Spring.' },
      ],
      go: [
        { title: 'Verifica Go', command: 'go version', detail: 'Debe mostrar una versión de Go instalada.' },
        { title: 'Inicializa módulo', command: 'go mod init tareas-locales', detail: 'Crea el archivo go.mod del proyecto.' },
      ],
      csharp: [
        { title: 'Verifica .NET', command: 'dotnet --version', detail: 'Debe mostrar SDK .NET instalado.' },
        { title: 'Crea proyecto consola', command: 'dotnet new console', detail: 'Genera un proyecto básico para Program.cs.' },
      ],
    };
    return {
      title: 'IDE recomendado: Visual Studio Code',
      install: 'Descarga VS Code desde code.visualstudio.com. Instálalo normal y activa la opción “Add to PATH” si aparece.',
      openProject: [
        'Crea o entra a la carpeta del laboratorio desde la terminal.',
        `Escribe ${editorCommand} para abrir esa carpeta en VS Code.`,
        'En VS Code abre el explorador de archivos con el primer icono de la izquierda.',
        'Crea el archivo exacto que pide el laboratorio.',
        `Guarda con ${modifier}+S antes de volver a la terminal.`,
      ],
      shortcuts: [
        { key: `${modifier} + S`, action: 'Guardar archivo' },
        { key: `${modifier} + P`, action: 'Buscar y abrir archivo rápido' },
        { key: `${modifier} + Ñ`, action: 'Abrir terminal integrada en teclado español' },
        { key: `${modifier} + J`, action: 'Mostrar u ocultar panel inferior' },
        { key: `${modifier} + Shift + P`, action: 'Abrir comandos de VS Code' },
      ],
      prerequisites: prereq[language],
    };
  }
  private snippetForLanguage(language: LabLanguage): { title: string; file: string; install: string; code: string; run: string } {
    const snippets: Record<LabLanguage, { title: string; file: string; install: string; code: string; run: string }> = {
      javascript: {
        title: 'Subir una tarea a S3 con Node.js',
        file: 'app.mjs',
        install: 'npm install @aws-sdk/client-s3',
        code: `import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: "us-east-1",
  endpoint: "http://localhost:4566",
  forcePathStyle: true,
  credentials: { accessKeyId: "test", secretAccessKey: "test" }
});
await s3.send(new PutObjectCommand({
  Bucket: "tareas-locales",
  Key: "tarea-001.json",
  Body: JSON.stringify({ titulo: "Aprender Floci", estado: "pendiente" })
}));
console.log("Tarea subida");`,
        run: 'node app.mjs',
      },
      typescript: {
        title: 'Subir una tarea a S3 con TypeScript',
        file: 'app.ts',
        install: 'npm install @aws-sdk/client-s3 tsx',
        code: `import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

type Tarea = { titulo: string; estado: "pendiente" | "hecha" };
const tarea: Tarea = { titulo: "Aprender Floci", estado: "pendiente" };
const s3 = new S3Client({
  region: "us-east-1",
  endpoint: "http://localhost:4566",
  forcePathStyle: true,
  credentials: { accessKeyId: "test", secretAccessKey: "test" }
});

await s3.send(new PutObjectCommand({
  Bucket: "tareas-locales",
  Key: "tarea-001.json",
  Body: JSON.stringify(tarea)
}));
console.log("Tarea subida");`,
        run: 'npx tsx app.ts',
      },
      python: {
        title: 'Subir una tarea a S3 con Python',
        file: 'app.py',
        install: 'pip install boto3',
        code: `import json
import boto3

s3 = boto3.client(
    "s3",
    endpoint_url="http://localhost:4566",
    aws_access_key_id="test",
    aws_secret_access_key="test",
    region_name="us-east-1",
)
s3.put_object(
    Bucket="tareas-locales",
    Key="tarea-001.json",
    Body=json.dumps({"titulo": "Aprender Floci", "estado": "pendiente"})
)
print("Tarea subida")`,
        run: 'python app.py',
      },
      java: {
        title: 'Subir una tarea a S3 con Java (Maven o Gradle)',
        file: 'App.java',
        install: 'mvn -q archetype:generate -DgroupId=academy.floci -DartifactId=tareas-locales -DarchetypeArtifactId=maven-archetype-quickstart -DinteractiveMode=false',
        code: `import java.net.URI;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.model.CreateBucketRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

public class App {
  public static void main(String[] args) {
    var s3 = S3Client.builder()
        .endpointOverride(URI.create("http://localhost:4566"))
        .region(Region.US_EAST_1)
        .credentialsProvider(StaticCredentialsProvider.create(AwsBasicCredentials.create("test", "test")))
        .serviceConfiguration(S3Configuration.builder().pathStyleAccessEnabled(true).build())
        .build();

    s3.createBucket(CreateBucketRequest.builder().bucket("tareas-locales").build());
    s3.putObject(
      PutObjectRequest.builder().bucket("tareas-locales").key("tarea-001.json").build(),
      RequestBody.fromString("{\\"titulo\\":\\"Aprender Floci\\",\\"estado\\":\\"pendiente\\"}")
    );
    System.out.println("Tarea subida");
  }
}`,
        run: 'mvn exec:java -Dexec.mainClass=App',
      },
      go: {
        title: 'Subir una tarea a S3 con Go',
        file: 'main.go',
        install: 'go get github.com/aws/aws-sdk-go-v2/service/s3 github.com/aws/aws-sdk-go-v2/config',
        code: `package main

import (
  "context"
  "strings"
  "github.com/aws/aws-sdk-go-v2/config"
  "github.com/aws/aws-sdk-go-v2/service/s3"
)

func main() {
  cfg, _ := config.LoadDefaultConfig(context.TODO(), config.WithRegion("us-east-1"))
  client := s3.NewFromConfig(cfg)
  client.PutObject(context.TODO(), &s3.PutObjectInput{
    Bucket: awsString("tareas-locales"),
    Key: awsString("tarea-001.json"),
    Body: strings.NewReader("{\\"titulo\\":\\"Aprender Floci\\",\\"estado\\":\\"pendiente\\"}"),
  })
}
func awsString(v string) *string { return &v }`,
        run: 'go run main.go',
      },
      csharp: {
        title: 'Subir una tarea a S3 con C#',
        file: 'Program.cs',
        install: 'dotnet add package AWSSDK.S3',
        code: `using Amazon.S3;
using Amazon.S3.Model;

var s3 = new AmazonS3Client();
await s3.PutObjectAsync(new PutObjectRequest {
  BucketName = "tareas-locales",
  Key = "tarea-001.json",
  ContentBody = "{\\"titulo\\":\\"Aprender Floci\\",\\"estado\\":\\"pendiente\\"}"
});
Console.WriteLine("Tarea subida");`,
        run: 'dotnet run',
      },
    };
    return snippets[language];
  }
  private pythonTopicCode(service: string, resource: string): string {
    const snippets: Record<string, string> = {
      S3: `import boto3

s3 = boto3.client("s3", endpoint_url="http://localhost:4566", aws_access_key_id="test", aws_secret_access_key="test", region_name="us-east-1")
s3.create_bucket(Bucket="${resource}")
s3.put_object(Bucket="${resource}", Key="demo.txt", Body=b"hola desde FlociOps")
print("Archivo subido a s3://${resource}/demo.txt")`,
      SQS: `import boto3

sqs = boto3.client("sqs", endpoint_url="http://localhost:4566", aws_access_key_id="test", aws_secret_access_key="test", region_name="us-east-1")
queue = sqs.create_queue(QueueName="${resource}")
sqs.send_message(QueueUrl=queue["QueueUrl"], MessageBody="procesar tarea 001")
print("Mensaje enviado:", queue["QueueUrl"])`,
      DynamoDB: `import boto3

ddb = boto3.client("dynamodb", endpoint_url="http://localhost:4566", aws_access_key_id="test", aws_secret_access_key="test", region_name="us-east-1")
ddb.create_table(
    TableName="${resource}",
    AttributeDefinitions=[{"AttributeName": "PK", "AttributeType": "S"}],
    KeySchema=[{"AttributeName": "PK", "KeyType": "HASH"}],
    BillingMode="PAY_PER_REQUEST",
)
ddb.put_item(TableName="${resource}", Item={"PK": {"S": "TASK#001"}, "title": {"S": "Aprender Floci"}})
print("Tarea guardada")`,
      Secrets: `import boto3

secrets = boto3.client("secretsmanager", endpoint_url="http://localhost:4566", aws_access_key_id="test", aws_secret_access_key="test", region_name="us-east-1")
ssm = boto3.client("ssm", endpoint_url="http://localhost:4566", aws_access_key_id="test", aws_secret_access_key="test", region_name="us-east-1")
secrets.create_secret(Name="${resource}", SecretString="dev-secret")
ssm.put_parameter(Name="/flociops/stage", Value="local", Type="String", Overwrite=True)
print("Secreto y parametro creados")`,
      Lambda: `def handler(event, context):
    print("procesando evento", event)
    return {"statusCode": 200, "body": "procesado por ${resource}"}`,
      'API Gateway': `from http.server import BaseHTTPRequestHandler, HTTPServer

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.end_headers()
        self.wfile.write(b'{"status":"ok","service":"${resource}"}')

HTTPServer(("localhost", 8080), Handler).serve_forever()`,
      SNS: `import json, boto3

events = boto3.client("events", endpoint_url="http://localhost:4566", aws_access_key_id="test", aws_secret_access_key="test", region_name="us-east-1")
events.create_event_bus(Name="${resource}")
events.put_events(Entries=[{
    "Source": "flociops.tasks",
    "DetailType": "TaskCreated",
    "Detail": json.dumps({"id": "TASK#001"}),
    "EventBusName": "${resource}",
}])
print("Evento publicado")`,
      CloudWatch: `import time, boto3

logs = boto3.client("logs", endpoint_url="http://localhost:4566", aws_access_key_id="test", aws_secret_access_key="test", region_name="us-east-1")
logs.create_log_group(logGroupName="${resource}")
logs.create_log_stream(logGroupName="${resource}", logStreamName="local")
logs.put_log_events(logGroupName="${resource}", logStreamName="local", logEvents=[{"timestamp": int(time.time() * 1000), "message": "INFO flociops listo"}])
print("Log enviado")`,
    };
    return snippets[service] ?? `print("Mini proyecto ${service}: crea el recurso ${resource}, ejecuta una operacion y verifica con la CLI del modulo correspondiente.")`;
  }
  private javascriptTopicCode(service: string, resource: string): string {
    const snippets: Record<string, string> = {
      S3: `import { S3Client, CreateBucketCommand, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: "us-east-1",
  endpoint: "http://localhost:4566",
  forcePathStyle: true,
  credentials: { accessKeyId: "test", secretAccessKey: "test" }
});
await s3.send(new CreateBucketCommand({ Bucket: "${resource}" }));
await s3.send(new PutObjectCommand({ Bucket: "${resource}", Key: "demo.txt", Body: "hola desde FlociOps" }));
console.log("Archivo subido a s3://${resource}/demo.txt");`,
      SQS: `import { SQSClient, CreateQueueCommand, SendMessageCommand } from "@aws-sdk/client-sqs";

const sqs = new SQSClient({
  region: "us-east-1",
  endpoint: "http://localhost:4566",
  credentials: { accessKeyId: "test", secretAccessKey: "test" }
});
const queue = await sqs.send(new CreateQueueCommand({ QueueName: "${resource}" }));
await sqs.send(new SendMessageCommand({ QueueUrl: queue.QueueUrl, MessageBody: "procesar tarea 001" }));
console.log("Mensaje enviado:", queue.QueueUrl);`,
      DynamoDB: `import { DynamoDBClient, CreateTableCommand, PutItemCommand } from "@aws-sdk/client-dynamodb";

const ddb = new DynamoDBClient({
  region: "us-east-1",
  endpoint: "http://localhost:4566",
  credentials: { accessKeyId: "test", secretAccessKey: "test" }
});
await ddb.send(new CreateTableCommand({
  TableName: "${resource}",
  AttributeDefinitions: [{ AttributeName: "PK", AttributeType: "S" }],
  KeySchema: [{ AttributeName: "PK", KeyType: "HASH" }],
  BillingMode: "PAY_PER_REQUEST"
}));
await ddb.send(new PutItemCommand({ TableName: "${resource}", Item: { PK: { S: "TASK#001" }, title: { S: "Aprender Floci" } } }));
console.log("Tarea guardada");`,
      Secrets: `import { SecretsManagerClient, CreateSecretCommand } from "@aws-sdk/client-secrets-manager";
import { SSMClient, PutParameterCommand } from "@aws-sdk/client-ssm";

const credentials = { accessKeyId: "test", secretAccessKey: "test" };
await new SecretsManagerClient({ region: "us-east-1", endpoint: "http://localhost:4566", credentials }).send(new CreateSecretCommand({ Name: "${resource}", SecretString: "dev-secret" }));
await new SSMClient({ region: "us-east-1", endpoint: "http://localhost:4566", credentials }).send(new PutParameterCommand({ Name: "/flociops/stage", Value: "local", Type: "String", Overwrite: true }));
console.log("Secreto y parametro creados");`,
      Lambda: `export const handler = async (event) => {
  console.log("procesando evento", event);
  return { statusCode: 200, body: "procesado por ${resource}" };
};`,
      'API Gateway': `import http from "node:http";

http.createServer((_, res) => {
  res.writeHead(200, { "content-type": "application/json" });
  res.end(JSON.stringify({ status: "ok", service: "${resource}" }));
}).listen(8080, () => console.log("API local en http://localhost:8080"));`,
      SNS: `import { EventBridgeClient, CreateEventBusCommand, PutEventsCommand } from "@aws-sdk/client-eventbridge";

const events = new EventBridgeClient({
  region: "us-east-1",
  endpoint: "http://localhost:4566",
  credentials: { accessKeyId: "test", secretAccessKey: "test" }
});
await events.send(new CreateEventBusCommand({ Name: "${resource}" }));
await events.send(new PutEventsCommand({ Entries: [{ Source: "flociops.tasks", DetailType: "TaskCreated", Detail: JSON.stringify({ id: "TASK#001" }), EventBusName: "${resource}" }] }));
console.log("Evento publicado");`,
      CloudWatch: `import { CloudWatchLogsClient, CreateLogGroupCommand, CreateLogStreamCommand, PutLogEventsCommand } from "@aws-sdk/client-cloudwatch-logs";

const logs = new CloudWatchLogsClient({
  region: "us-east-1",
  endpoint: "http://localhost:4566",
  credentials: { accessKeyId: "test", secretAccessKey: "test" }
});
await logs.send(new CreateLogGroupCommand({ logGroupName: "${resource}" }));
await logs.send(new CreateLogStreamCommand({ logGroupName: "${resource}", logStreamName: "local" }));
await logs.send(new PutLogEventsCommand({ logGroupName: "${resource}", logStreamName: "local", logEvents: [{ timestamp: Date.now(), message: "INFO flociops listo" }] }));
console.log("Log enviado");`,
    };
    return snippets[service] ?? `console.log("Mini proyecto ${service}: crea el recurso ${resource}, ejecuta una operacion y verifica con la CLI del modulo correspondiente.");`;
  }
  private javaTopicCode(project: TopicProject): string {
    const service = project.services[0];
    const resource = project.resource;
    const snippets: Record<string, string> = {
      S3: `import java.net.URI;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.model.CreateBucketRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

public class App {
  public static void main(String[] args) {
    var s3 = S3Client.builder()
        .endpointOverride(URI.create("http://localhost:4566"))
        .region(Region.US_EAST_1)
        .credentialsProvider(StaticCredentialsProvider.create(AwsBasicCredentials.create("test", "test")))
        .serviceConfiguration(S3Configuration.builder().pathStyleAccessEnabled(true).build())
        .build();

    s3.createBucket(CreateBucketRequest.builder().bucket("${resource}").build());
    s3.putObject(
        PutObjectRequest.builder().bucket("${resource}").key("demo.txt").build(),
        RequestBody.fromString("hola desde FlociOps"));
    System.out.println("Archivo subido a s3://${resource}/demo.txt");
  }
}`,
      SQS: `import java.net.URI;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.sqs.SqsClient;
import software.amazon.awssdk.services.sqs.model.CreateQueueRequest;
import software.amazon.awssdk.services.sqs.model.SendMessageRequest;

public class App {
  public static void main(String[] args) {
    var sqs = SqsClient.builder()
        .endpointOverride(URI.create("http://localhost:4566"))
        .region(Region.US_EAST_1)
        .credentialsProvider(StaticCredentialsProvider.create(AwsBasicCredentials.create("test", "test")))
        .build();

    var queue = sqs.createQueue(CreateQueueRequest.builder().queueName("${resource}").build());
    sqs.sendMessage(SendMessageRequest.builder().queueUrl(queue.queueUrl()).messageBody("procesar tarea 001").build());
    System.out.println("Mensaje enviado: " + queue.queueUrl());
  }
}`,
      DynamoDB: `import java.net.URI;
import java.util.Map;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.AttributeDefinition;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;
import software.amazon.awssdk.services.dynamodb.model.BillingMode;
import software.amazon.awssdk.services.dynamodb.model.CreateTableRequest;
import software.amazon.awssdk.services.dynamodb.model.KeySchemaElement;
import software.amazon.awssdk.services.dynamodb.model.KeyType;
import software.amazon.awssdk.services.dynamodb.model.PutItemRequest;
import software.amazon.awssdk.services.dynamodb.model.ScalarAttributeType;

public class App {
  public static void main(String[] args) {
    var ddb = DynamoDbClient.builder()
        .endpointOverride(URI.create("http://localhost:4566"))
        .region(Region.US_EAST_1)
        .credentialsProvider(StaticCredentialsProvider.create(AwsBasicCredentials.create("test", "test")))
        .build();

    ddb.createTable(CreateTableRequest.builder()
        .tableName("${resource}")
        .attributeDefinitions(AttributeDefinition.builder().attributeName("PK").attributeType(ScalarAttributeType.S).build())
        .keySchema(KeySchemaElement.builder().attributeName("PK").keyType(KeyType.HASH).build())
        .billingMode(BillingMode.PAY_PER_REQUEST)
        .build());

    ddb.putItem(PutItemRequest.builder()
        .tableName("${resource}")
        .item(Map.of("PK", AttributeValue.fromS("TASK#001"), "title", AttributeValue.fromS("Aprender Floci")))
        .build());
    System.out.println("Tarea guardada");
  }
}`,
    };
    return snippets[service] ?? `public class App {
  public static void main(String[] args) {
    System.out.println("Mini proyecto FlociOps: ${project.title}");
    System.out.println("Servicio: ${project.services.join(', ')}");
    System.out.println("Recurso local: ${resource}");
    System.out.println("Configura el cliente AWS SDK v2 con endpoint http://localhost:4566 y credenciales test/test.");
    System.out.println("Ejecuta con Maven o Gradle y verifica con los comandos CLI de este tema.");
  }
}`;
  }
  private verificationHintForCommand(command: string): string {
    const value = command.toLowerCase();
    if (value.includes('create') || value.includes('mb ')) return 'Verifica con un comando list/describe que el recurso exista y copia el nombre creado.';
    if (value.includes('cp ') || value.includes('upload') || value.includes('put')) return 'Verifica leyendo o listando el objeto/dato que acabas de escribir.';
    if (value.includes('receive') || value.includes('pull')) return 'Debes ver el mensaje recibido; si no aparece, revisa cola, topic o subscription.';
    if (value.includes('curl')) return 'Debes obtener HTTP 2xx y un cuerpo JSON o texto coherente con el endpoint.';
    if (value.includes('logs') || value.includes('tail')) return 'Debes encontrar una linea de log que explique que paso y con que id.';
    if (value.includes('status') || value.includes('version')) return 'La salida debe confirmar que la herramienta esta instalada o que el emulador esta activo.';
    return 'Confirma que la salida coincida con el objetivo del paso antes de marcarlo como completado.';
  }
  private loadProgress(): StoredProgress {
    try { return { ...EMPTY_PROGRESS, ...JSON.parse(localStorage.getItem('floci-academy-progress') || '{}') }; }
    catch { return EMPTY_PROGRESS; }
  }
  private findNextModule(): number {
    try {
      const completed: number[] = JSON.parse(localStorage.getItem('floci-academy-progress') || '{}').completedModules || [];
      return COURSE_MODULES.find(item => !completed.includes(item.id))?.id ?? 0;
    } catch { return 0; }
  }
  private async loadLibrary(): Promise<void> {
    try {
      const response = await fetch('content/manifest.json');
      const documents = await response.json() as LibraryDocument[];
      this.libraryDocuments.set(documents);
      const guide = documents.find(item => item.id === 'guia') || documents[0];
      if (guide) await this.openDocument(guide);
    } catch {
      this.libraryDocuments.set([]);
    }
  }
  private async loadLesson(id: number): Promise<void> {
    this.lessonLoading.set(true);
    try {
      const response = await fetch(`content/lecciones/modulo-${id}.md`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const raw = await response.text();
      const withoutRepeatedTitle = raw.replace(/^#{1,2}\s+Módulo[^\n]*\n+/, '');
      this.lessonHtml.set(marked.parse(withoutRepeatedTitle, { async: false }) as string);
    } catch {
      this.lessonHtml.set('<p>La lección completa no está disponible en este entorno.</p>');
    } finally { this.lessonLoading.set(false); }
  }
  private async loadServiceStudies(): Promise<void> {
    try {
      const studies = await fetch('content/service-study.json').then(response => response.json()) as ServiceStudy[];
      this.serviceStudies.set(studies);
    } catch { this.serviceStudies.set([]); }
  }
  private findServiceStudy(service: string): ServiceStudy | undefined {
    const aliases: Record<string, string> = {
      'DynamoDB Streams': 'DynamoDB y Streams', 'API Gateway v1': 'API Gateway v1',
      'API Gateway v2': 'API Gateway v2', 'EventBridge Pipes': 'EventBridge Pipes',
      'AppConfigData': 'AppConfig y AppConfigData', 'SES v2': 'SES y SES v2',
      'Tagging API': 'Resource Groups Tagging API', 'ELB v2': 'ELB v2',
      'AWS Backup': 'AWS Backup', 'Firehose': 'Data Firehose'
    };
    const target = (aliases[service] || service).toLowerCase();
    return this.serviceStudies().find(item => item.name.toLowerCase() === target || item.name.toLowerCase().includes(target));
  }
  private escapeHtml(value: string): string {
    return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  }
}
