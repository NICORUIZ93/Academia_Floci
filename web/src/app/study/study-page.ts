import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { COURSE_MODULES, CourseModule } from '../course-data';

type Level = 'Básico' | 'Medio' | 'Avanzado' | 'Master';
type Tab = 'teoria' | 'ejemplo' | 'ejercicio' | 'examen';

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
  source: CourseModule;
  topics: Topic[];
}

const STORAGE_KEY = 'floci-study-progress-v2';
const THEME_KEY = 'floci-study-theme-v2';
const ANSWERS_KEY = 'floci-study-answers-v2';

const resources = [
  { label: 'Documentación Floci', url: 'https://floci.io/' },
  { label: 'AWS CLI', url: 'https://docs.aws.amazon.com/cli/' },
  { label: 'AWS SDKs', url: 'https://aws.amazon.com/developer/tools/' },
];

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

const buildTopic = (module: CourseModule, kind: 'concepto' | 'laboratorio' | 'validacion'): Topic => {
  const baseLevel = levelFromCourse(module.level);
  const titlePrefix = kind === 'concepto' ? 'Entender' : kind === 'laboratorio' ? 'Practicar' : 'Validar';
  const id = `m${module.id}-${kind}`;
  const command = commandFrom(module);
  const code = kind === 'laboratorio'
    ? command
    : `# Objetivo\n${module.deliverable}\n\n# Comando base\n${command}`;

  return {
    id,
    moduleId: module.id,
    title: `${titlePrefix}: ${module.shortTitle}`,
    level: kind === 'validacion' ? 'Master' : baseLevel,
    minutes: kind === 'concepto' ? 25 : kind === 'laboratorio' ? 45 : 35,
    intro: [
      module.description,
      `Piensa este módulo como una práctica de laboratorio: primero entiendes el servicio, luego ejecutas un comando pequeño, después observas el resultado y finalmente explicas qué problema resuelve en una arquitectura real.`,
    ],
    objectives: [
      `Explicar qué significa ${module.shortTitle} sin memorizar comandos.`,
      `Ejecutar un paso verificable relacionado con ${module.services.join(', ') || 'Floci'}.`,
      'Reconocer al menos un error común y cómo corregirlo.',
      'Guardar evidencia de lo que funcionó para tu cuaderno de progreso.',
    ],
    theory: [
      {
        title: 'Qué es',
        body: `${module.shortTitle} pertenece al nivel ${module.level}. En Floci se practica localmente para aprender el comportamiento del servicio antes de tocar nube real.`,
        bullets: module.concepts.slice(0, 5),
      },
      {
        title: 'Por qué importa',
        body: `Este módulo aporta una pieza del proyecto completo. Si lo entiendes, puedes decidir cuándo usarlo, cuándo evitarlo y cómo conectarlo con otros servicios.`,
        bullets: module.services.length ? module.services.map(service => `Servicio relacionado: ${service}`) : ['Servicio base de laboratorio local'],
      },
    ],
    comparison: {
      left: 'Nube real',
      right: 'Floci local',
      leftDetail: 'Requiere cuenta, permisos, costo potencial y limpieza cuidadosa de recursos.',
      rightDetail: 'Permite practicar rápido en localhost, repetir errores y validar comandos sin costo.',
    },
    diagram: `Alumno -> Terminal -> Floci localhost -> ${module.services[0] || module.shortTitle} -> Evidencia`,
    code,
    lineByLine: code.split('\n').slice(0, 6).map((line, index) => `Línea ${index + 1}: ${line || 'separador visual del ejemplo.'}`),
    exercise: kind === 'validacion'
      ? `Responde con tus palabras: ${module.questions[0] ?? '¿Qué aprendiste y cómo lo comprobarías?'}`
      : module.challenges[0] ?? `Ejecuta un comando relacionado con ${module.shortTitle} y pega la evidencia.`,
    expected: module.challenges.slice(0, 3),
    hints: [
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
      `${module.shortTitle} se aprende ejecutando y verificando.`,
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
  ...buildTopic(module, 'concepto'),
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
    ? [diagnosticTopic(module), buildTopic(module, 'laboratorio'), buildTopic(module, 'validacion')]
    : [buildTopic(module, 'concepto'), buildTopic(module, 'laboratorio'), buildTopic(module, 'validacion')],
});

@Component({
  selector: 'app-study-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './study-page.html',
  styleUrl: './study-page.scss',
})
export class StudyPageComponent implements OnInit {
  readonly modules: StudyModule[] = COURSE_MODULES.map(moduleToStudy);

  selectedModuleId = this.modules[0].id;
  selectedTopicId = this.modules[0].topics[0].id;
  tab: Tab = 'teoria';
  query = '';
  dark = false;
  examMode = false;
  examStartedAt: number | null = null;
  mobileSidebar = false;
  completed = new Set<string>();
  answers: Record<string, string> = {};
  answer = '';
  output = '';

  ngOnInit(): void {
    this.completed = new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));
    this.answers = JSON.parse(localStorage.getItem(ANSWERS_KEY) || '{}');
    this.dark = localStorage.getItem(THEME_KEY) === 'dark';
    this.answer = this.answers[this.selectedTopicId] ?? '';
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
    return this.modules
      .map(module => ({
        ...module,
        topics: module.topics.filter(topic =>
          `${module.title} ${module.description} ${topic.title} ${topic.level} ${topic.objectives.join(' ')}`.toLowerCase().includes(query)
        ),
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
    this.selectedModuleId = module.id;
    this.selectedTopicId = topicItem.id;
    this.tab = 'teoria';
    this.answer = this.answers[topicItem.id] ?? '';
    this.output = '';
    this.mobileSidebar = false;
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

  earnedBadges(): string[] {
    const doneModules = this.modules.filter(module => this.moduleProgress(module) === 100).length;
    const badges = [];
    if (this.completed.size > 0) badges.push('Explorador');
    if (doneModules >= 3) badges.push('Constructor');
    if (doneModules >= 9) badges.push('Arquitecto');
    if (doneModules >= 18) badges.push('Maestro');
    return badges;
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

  verifyAnswer(): void {
    this.saveCurrentAnswer();
    const words = this.answer.trim().split(/\s+/).filter(Boolean).length;
    const hasCommandSignal = /aws|floci|docker|gcloud|az|curl|terraform|kubectl/i.test(this.answer);
    this.output = words >= 18 || hasCommandSignal
      ? 'Respuesta aceptada: hay suficiente razonamiento o evidencia técnica para revisar.'
      : 'Aún falta detalle: agrega el comando, la salida esperada o una explicación de al menos 18 palabras.';
  }

  validateCommand(): void {
    const expected = this.selectedTopic.expected.join(' ').toLowerCase();
    const answer = this.answer.toLowerCase();
    this.output = expected && expected.split(/\s+/).some(token => token.length > 4 && answer.includes(token))
      ? 'Comando/evidencia compatible con el laboratorio. Marca el tema cuando lo hayas ejecutado realmente.'
      : 'No parece contener evidencia del comando esperado. Agrega el comando ejecutado y una salida verificable.';
  }

  runCode(): void {
    this.output = this.selectedTopic.code.startsWith('#')
      ? 'Este bloque es una guía de terminal. Cópialo en tu consola, no se ejecuta dentro del navegador.'
      : 'Ejemplo listo para copiar en el laboratorio correspondiente.';
  }

  exportMarkdown(): void {
    this.saveCurrentAnswer();
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

  private saveCurrentAnswer(): void {
    this.answers[this.selectedTopicId] = this.answer;
    localStorage.setItem(ANSWERS_KEY, JSON.stringify(this.answers));
  }
}
