import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

type Level = 'Básico' | 'Medio' | 'Avanzado' | 'Master';
type Tab = 'teoria' | 'ejemplo' | 'ejercicio';

interface Topic {
  id: string;
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
  hints: string[];
  commonErrors: string[];
  summary: string[];
  resources: { label: string; url: string }[];
}

interface StudyModule {
  id: string;
  title: string;
  description: string;
  topics: Topic[];
}

const STORAGE_KEY = 'floci-clean-study-progress';
const THEME_KEY = 'floci-clean-study-theme';

const jsResources = [
  { label: 'MDN Web Docs', url: 'https://developer.mozilla.org/es/' },
  { label: 'JavaScript.info', url: 'https://javascript.info/' },
  { label: 'ECMAScript', url: 'https://tc39.es/ecma262/' },
];

const topic = (id: string, title: string, level: Level, minutes: number, focus: string, code: string): Topic => ({
  id,
  title,
  level,
  minutes,
  intro: [
    `${title} es una pieza fundamental para escribir JavaScript con criterio. Piensa en este tema como una herramienta de taller: antes de construir algo grande, necesitas saber qué hace, cuándo usarla y qué errores puede provocar.`,
    `En un proyecto real, ${focus.toLowerCase()} afecta la forma en que lees datos, organizas lógica, evitas bugs y explicas tus decisiones. No se aprende memorizando: se aprende escribiendo, rompiendo y corrigiendo.`,
  ],
  objectives: [
    `Explicar qué es ${title} con tus propias palabras.`,
    `Escribir un ejemplo funcional sin copiarlo automáticamente.`,
    `Identificar errores comunes relacionados con ${focus.toLowerCase()}.`,
    'Modificar el ejemplo para resolver un caso distinto.',
  ],
  theory: [
    {
      title: 'Idea principal',
      body: `${title} resuelve un problema concreto dentro del lenguaje. Primero identifica el dato o flujo que quieres controlar, luego decide si necesitas una estructura simple, una función, una abstracción o una API del entorno.`,
      bullets: ['Lee el problema antes de escribir código.', 'Nombra las variables según su intención.', 'Prefiere ejemplos pequeños que puedas ejecutar rápido.'],
    },
    {
      title: 'Cuándo usarlo',
      body: `Úsalo cuando ${focus.toLowerCase()} sea parte visible del problema. Si no puedes explicar por qué lo estás usando, vuelve al caso mínimo y elimina complejidad.`,
      bullets: ['Empieza con el caso más simple.', 'Agrega complejidad solo cuando el ejemplo funcione.', 'Verifica el resultado en consola.'],
    },
  ],
  comparison: {
    left: 'Aprender de memoria',
    right: 'Aprender con criterio',
    leftDetail: 'Repites sintaxis sin saber cuándo falla.',
    rightDetail: 'Entiendes el problema, ejecutas, cambias datos y explicas el resultado.',
  },
  diagram: `Entrada -> Proceso (${title}) -> Salida verificable`,
  code,
  lineByLine: code.split('\n').slice(0, 5).map((line, index) => `Línea ${index + 1}: ${line.trim() || 'separa visualmente el ejemplo para que sea legible.'}`),
  exercise: `Crea un ejemplo propio sobre ${title}. Debe recibir un dato, transformarlo y mostrar un resultado por consola. No copies el ejemplo de arriba.`,
  hints: ['Empieza con un dato pequeño.', 'Imprime cada paso con console.log.', 'Cambia un valor y observa si el resultado cambia como esperabas.'],
  commonErrors: ['Copiar código sin ejecutarlo.', 'No leer el mensaje de error completo.', 'Usar nombres genéricos como x o data para todo.', 'Resolver demasiadas cosas en una sola línea.'],
  summary: [`${title} debe resolver un problema concreto.`, 'La consola confirma si entiendes el flujo.', 'Si puedes explicarlo simple, vas por buen camino.'],
  resources: jsResources,
});

const javascriptTopics: Topic[] = [
  topic('variables', 'Variables', 'Básico', 25, 'guardar valores para reutilizarlos', `const nombre = 'Ana';\nlet puntos = 0;\npuntos = puntos + 10;\nconsole.log(nombre, puntos);`),
  topic('tipos', 'Tipos de datos', 'Básico', 30, 'distinguir texto, números, booleanos, null, undefined, objetos y arrays', `const producto = 'Curso';\nconst precio = 49;\nconst activo = true;\nconsole.log(typeof producto, typeof precio, typeof activo);`),
  topic('operadores', 'Operadores', 'Básico', 25, 'comparar, calcular y combinar condiciones', `const total = 120;\nconst tieneCupon = true;\nconst envioGratis = total >= 100 && tieneCupon;\nconsole.log(envioGratis);`),
  topic('control', 'Estructuras de control', 'Básico', 35, 'decidir qué camino toma el programa', `const edad = 18;\nif (edad >= 18) {\n  console.log('Puede entrar');\n} else {\n  console.log('No puede entrar');\n}`),
  topic('funciones', 'Funciones', 'Básico', 40, 'encapsular comportamiento reutilizable', `function calcularTotal(precio, cantidad) {\n  return precio * cantidad;\n}\nconsole.log(calcularTotal(20, 3));`),
  topic('closures', 'Ámbito y closures', 'Básico', 45, 'controlar dónde vive una variable y quién puede usarla', `function crearContador() {\n  let valor = 0;\n  return () => ++valor;\n}\nconst contar = crearContador();\nconsole.log(contar(), contar());`),
  topic('motor', 'Motor JavaScript: V8, JIT y AST', 'Medio', 45, 'entender cómo el motor lee, interpreta y optimiza código', `const suma = (a, b) => a + b;\nfor (let i = 0; i < 3; i++) {\n  console.log(suma(i, i + 1));\n}`),
  topic('ejecucion', 'Call Stack y Event Loop', 'Medio', 50, 'entender el orden real de ejecución', `console.log('A');\nsetTimeout(() => console.log('B'), 0);\nPromise.resolve().then(() => console.log('C'));\nconsole.log('D');`),
  topic('memoria', 'Memoria: Stack, Heap y Garbage Collection', 'Medio', 45, 'evitar fugas de memoria y referencias innecesarias', `let usuario = { nombre: 'Ana' };\nconst lista = [usuario];\nusuario = null;\nconsole.log(lista[0].nombre);`),
  topic('promises', 'Promises', 'Avanzado', 45, 'manejar operaciones asincrónicas con estados claros', `const cargar = new Promise(resolve => {\n  setTimeout(() => resolve('Datos listos'), 300);\n});\ncargar.then(resultado => console.log(resultado));`),
  topic('async-await', 'Async/Await', 'Avanzado', 45, 'escribir asincronía de forma legible', `async function iniciar() {\n  const respuesta = await Promise.resolve('OK');\n  console.log(respuesta);\n}\niniciar();`),
  topic('es2025', 'ES2024/2025', 'Avanzado', 50, 'reconocer features modernas como decorators, using e iterator helpers', `const grupos = Object.groupBy(['Ana', 'Luis', 'Alba'], nombre => nombre[0]);\nconsole.log(grupos);`),
  topic('modulos', 'Módulos: ESM vs CommonJS', 'Avanzado', 40, 'organizar código en archivos mantenibles', `// math.js\nexport const sumar = (a, b) => a + b;\n\n// app.js\nimport { sumar } from './math.js';\nconsole.log(sumar(2, 3));`),
  topic('dom', 'DOM avanzado', 'Master', 55, 'manipular la página con eventos, nodos y render eficiente', `const boton = document.querySelector('button');\nboton?.addEventListener('click', () => {\n  document.body.classList.toggle('activo');\n});`),
  topic('apis', 'APIs modernas del navegador', 'Master', 60, 'usar Workers, Service Workers, WebRTC y observadores cuando aportan valor', `const observer = new IntersectionObserver(entries => {\n  entries.forEach(entry => console.log(entry.isIntersecting));\n});\nobserver.observe(document.querySelector('#contenido'));`),
  topic('rendimiento', 'Rendimiento web', 'Master', 60, 'mejorar respuesta con debouncing, throttling y Core Web Vitals', `function debounce(fn, ms) {\n  let timer;\n  return (...args) => {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn(...args), ms);\n  };\n}`),
  topic('seguridad', 'Seguridad: XSS, CSRF y CSP', 'Master', 60, 'evitar vulnerabilidades comunes en aplicaciones web', `const textoSeguro = document.createTextNode(usuarioInput);\ndocument.querySelector('#salida').appendChild(textoSeguro);`),
];

const placeholderTopics = (prefix: string): Topic[] => [
  topic(`${prefix}-fundamentos`, 'Fundamentos', 'Básico', 30, 'entender conceptos base antes de construir', `console.log('Primer laboratorio de ${prefix}');`),
  topic(`${prefix}-proyecto`, 'Proyecto guiado', 'Medio', 45, 'aplicar conceptos en un entregable pequeño', `console.log('Construye, prueba y documenta');`),
  topic(`${prefix}-master`, 'Desafío master', 'Master', 60, 'defender decisiones técnicas', `console.log('Explica tu arquitectura');`),
];

@Component({
  selector: 'app-study-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './study-page.html',
  styleUrl: './study-page.scss',
})
export class StudyPageComponent implements OnInit {
  readonly modules: StudyModule[] = [
    { id: 'javascript', title: 'JavaScript de cero a master', description: 'Lenguaje base de la web, desde sintaxis hasta seguridad.', topics: javascriptTopics },
    { id: 'node', title: 'Node.js', description: 'Backend, APIs, procesos y producción.', topics: placeholderTopics('node') },
    { id: 'angular', title: 'Angular', description: 'Componentes, rutas, signals y arquitectura.', topics: placeholderTopics('angular') },
    { id: 'react', title: 'React', description: 'UI moderna con componentes, hooks y estado.', topics: placeholderTopics('react') },
    { id: 'java', title: 'Java', description: 'POO, JVM, colecciones, concurrencia y testing.', topics: placeholderTopics('java') },
    { id: 'spring', title: 'Spring Boot', description: 'APIs, persistencia, seguridad y microservicios.', topics: placeholderTopics('spring') },
    { id: 'flutter', title: 'Flutter', description: 'Apps móviles con Dart, widgets y estado.', topics: placeholderTopics('flutter') },
    { id: 'devops', title: 'DevOps', description: 'Linux, Docker, CI/CD, Kubernetes e IaC.', topics: placeholderTopics('devops') },
    { id: 'floci', title: 'Cloud con Floci', description: 'AWS, Azure y GCP en local.', topics: placeholderTopics('floci') },
    { id: 'kotlin', title: 'Kotlin Multiplatform', description: 'Lógica compartida móvil.', topics: placeholderTopics('kotlin') },
    { id: 'android', title: 'Android', description: 'Jetpack Compose y arquitectura móvil.', topics: placeholderTopics('android') },
    { id: 'ios', title: 'iOS', description: 'SwiftUI, concurrencia y publicación.', topics: placeholderTopics('ios') },
  ];

  selectedModuleId = 'javascript';
  selectedTopicId = 'variables';
  tab: Tab = 'teoria';
  query = '';
  dark = false;
  mobileSidebar = false;
  completed = new Set<string>();
  answer = '';
  output = '';

  ngOnInit(): void {
    this.completed = new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));
    this.dark = localStorage.getItem(THEME_KEY) === 'dark';
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
          `${module.title} ${topic.title} ${topic.level}`.toLowerCase().includes(query)
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
    this.selectedModuleId = module.id;
    this.selectedTopicId = topicItem.id;
    this.tab = 'teoria';
    this.answer = '';
    this.output = '';
    this.mobileSidebar = false;
  }

  isCompleted(topicId: string): boolean {
    return this.completed.has(topicId);
  }

  moduleProgress(module: StudyModule): number {
    if (!module.topics.length) return 0;
    return Math.round((module.topics.filter(topicItem => this.completed.has(topicItem.id)).length / module.topics.length) * 100);
  }

  globalProgress(): number {
    const total = this.modules.reduce((sum, module) => sum + module.topics.length, 0);
    return Math.round((this.completed.size / total) * 100);
  }

  currentModuleProgress(): number {
    return this.moduleProgress(this.selectedModule);
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

  verifyAnswer(): void {
    const words = this.answer.trim().split(/\s+/).filter(Boolean).length;
    this.output = words >= 20
      ? 'Respuesta aceptada: explicaste con suficiente detalle. Ahora compárala con los objetivos.'
      : 'Aún falta detalle: escribe al menos 20 palabras explicando tu razonamiento.';
  }

  runCode(): void {
    if (this.selectedTopic.level === 'Master') {
      this.output = 'Este ejemplo usa APIs del navegador. Léelo y ejecútalo en un HTML real cuando el DOM exista.';
      return;
    }
    const logs: string[] = [];
    const originalLog = console.log;
    try {
      console.log = (...args: unknown[]) => logs.push(args.map(String).join(' '));
      // Laboratorio local del alumno: solo ejecuta ejemplos JavaScript de este curso.
      Function(this.selectedTopic.code)();
      this.output = logs.join('\n') || 'Código ejecutado sin salida.';
    } catch (error) {
      this.output = error instanceof Error ? error.message : 'Error desconocido.';
    } finally {
      console.log = originalLog;
    }
  }
}
