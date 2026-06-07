import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
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
interface LearningRule {
  title: string;
  detail: string;
  example: string;
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
  private readonly sanitizer = inject(DomSanitizer);
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
  readonly topicProjects = [
    { module: 1, title: 'Buzón de archivos', services: ['S3'], detail: 'Sube, lista y descarga evidencias desde un bucket local.' },
    { module: 2, title: 'Cola de trabajos', services: ['SQS', 'DLQ'], detail: 'Envía tareas lentas a una cola y procesa reintentos controlados.' },
    { module: 3, title: 'API de tareas', services: ['DynamoDB'], detail: 'Guarda tareas por usuario y consulta por clave sin usar atajos malos.' },
    { module: 4, title: 'Caja de secretos', services: ['Secrets', 'KMS', 'SSM'], detail: 'Lee configuración sensible sin hardcodear contraseñas en el código.' },
    { module: 5, title: 'Procesador serverless', services: ['Lambda'], detail: 'Ejecuta una función que transforma datos y deja evidencia verificable.' },
    { module: 6, title: 'Gateway HTTP', services: ['API Gateway'], detail: 'Expón endpoints reales para crear, leer y procesar tareas.' },
    { module: 7, title: 'Bus de eventos', services: ['SNS', 'EventBridge'], detail: 'Publica eventos de negocio y conecta consumidores desacoplados.' },
    { module: 8, title: 'Panel de diagnóstico', services: ['CloudWatch'], detail: 'Centraliza logs, filtra errores y crea una métrica verificable.' },
    { module: 9, title: 'Base relacional', services: ['RDS'], detail: 'Conecta una API a PostgreSQL local con migraciones simples.' },
    { module: 10, title: 'Worker en contenedor', services: ['ECR', 'ECS'], detail: 'Empaqueta un worker Docker y ejecútalo como tarea local.' },
    { module: 11, title: 'Ambiente reconstruible', services: ['CloudFormation'], detail: 'Declara recursos como código y levanta todo desde cero.' },
    { module: 12, title: 'Workflow de aprobación', services: ['Step Functions'], detail: 'Orquesta validación, procesamiento, notificación y errores.' },
    { module: 13, title: 'Stream de actividad', services: ['Kinesis', 'MSK'], detail: 'Procesa eventos continuos y compara streams contra colas.' },
    { module: 14, title: 'Login de usuarios', services: ['Cognito'], detail: 'Protege la API con usuarios, tokens y grupos.' },
    { module: 15, title: 'Reporte de operaciones', services: ['Athena', 'Glue'], detail: 'Consulta eventos guardados en S3 con SQL y genera métricas.' },
    { module: 16, title: 'Clasificador inteligente', services: ['Bedrock', 'Textract'], detail: 'Extrae texto de documentos y genera un resumen con stubs locales.' },
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
  documentHtml = signal<SafeHtml>('');
  documentRaw = signal('');
  documentLoading = signal(false);
  copiedDocument = signal(false);
  lessonTab = signal<'learn' | 'practice' | 'notes'>('learn');
  lessonHtml = signal<SafeHtml>('');
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

  selectedModule = computed(() => this.modules[this.selectedModuleId()]);
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
  setupCommands = computed(() => this.commandsForOs(this.selectedOs()));
  languageSnippet = computed(() => this.snippetForLanguage(this.selectedLanguage()));
  workspaceSteps = computed(() => this.stepsToCreateLab(this.selectedOs(), this.languageSnippet()));
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
    const module = this.modules[moduleId];
    return module.challenges.filter((_, index) => this.progress().completedChallenges[this.challengeKey(moduleId, index)]).length;
  }
  moduleProgressRatio(moduleId: number): number {
    const module = this.modules[moduleId];
    if (!module?.challenges.length) return 0;
    return this.completedModuleChallenges(moduleId) / module.challenges.length;
  }
  commandForSelectedOs(command: SetupCommand): string { return command.command; }
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
        this.documentHtml.set(this.sanitizer.bypassSecurityTrustHtml(`<pre class="code-document"><code>${this.escapeHtml(raw)}</code></pre>`));
      } else {
        const normalized = raw
          .replaceAll('../assets/', '/content/oficial-es/assets/')
          .replaceAll('](assets/', '](/content/oficial-es/assets/');
        this.documentHtml.set(this.sanitizer.bypassSecurityTrustHtml(marked.parse(normalized, { async: false }) as string));
      }
    } catch (error) {
      this.documentHtml.set(this.sanitizer.bypassSecurityTrustHtml(`<p>No se pudo cargar este recurso: ${this.escapeHtml(String(error))}</p>`));
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
    try { return { ...DEFAULT_SETUP, ...JSON.parse(localStorage.getItem('floci-academy-setup') || '{}') }; }
    catch { return DEFAULT_SETUP; }
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
    return [
      { title: '1. Crea la carpeta del laboratorio', command: createFolder, detail: 'Haz esto una sola vez por módulo. Después todos los archivos quedan ordenados ahí.' },
      { title: '2. Crea el archivo de código', command: createFile, detail: `El archivo debe llamarse exactamente ${snippet.file}. Si el nombre cambia, el comando de ejecución puede fallar.` },
      { title: '3. Instala el SDK necesario', command: snippet.install, detail: 'El SDK es la librería que permite que tu lenguaje hable con servicios cloud.' },
      { title: '4. Abre el archivo y pega el código', command: openFile, detail: 'Pega el ejemplo, guarda el archivo y luego vuelve a la terminal.' },
      { title: '5. Ejecuta y verifica', command: snippet.run, detail: 'Si ves una salida o un recurso creado, registra la evidencia. Si falla, copia el error completo.' },
    ];
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
        { title: 'Verifica Maven', command: 'mvn --version', detail: 'Maven instala dependencias y ejecuta proyectos Java.' },
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

const s3 = new S3Client({ region: "us-east-1" });
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
const s3 = new S3Client({ region: "us-east-1" });

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

s3 = boto3.client("s3")
s3.put_object(
    Bucket="tareas-locales",
    Key="tarea-001.json",
    Body=json.dumps({"titulo": "Aprender Floci", "estado": "pendiente"})
)
print("Tarea subida")`,
        run: 'python app.py',
      },
      java: {
        title: 'Subir una tarea a S3 con Java',
        file: 'App.java',
        install: 'mvn dependency:get -Dartifact=software.amazon.awssdk:s3:2.25.60',
        code: `import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.core.sync.RequestBody;

public class App {
  public static void main(String[] args) {
    var s3 = S3Client.create();
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
      this.lessonHtml.set(this.sanitizer.bypassSecurityTrustHtml(marked.parse(withoutRepeatedTitle, { async: false }) as string));
    } catch {
      this.lessonHtml.set(this.sanitizer.bypassSecurityTrustHtml('<p>La lección completa no está disponible en este entorno.</p>'));
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
