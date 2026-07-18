import { CommonModule } from '@angular/common';
import { Component, ElementRef, Injector, OnDestroy, afterNextRender, computed, effect, inject, signal, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BookOpen, Boxes, Check, CircleCheck, ChevronLeft, ChevronRight, Clock3, Code2, Copy, Database, Gauge, ListTree, LockKeyhole, LucideAngularModule, ShieldCheck, Zap } from 'lucide-angular';
import mermaid from 'mermaid';
import { map } from 'rxjs';
import { findTrack } from '../course-data';
import { ContentService } from '../content.service';
import { ProgressService } from '../progress.service';
import { ThemeService } from '../theme.service';
import { findProjectBootstrap } from '../project-bootstrap';
import { applyLabVerification } from './lab-verification';

let mermaidInitialized = false;

export interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

type LessonMode = 'learn' | 'practice' | 'review';

interface LessonStats {
  topics: number;
  examples: number;
  activities: number;
}

interface ImplementationProfile {
  path: string;
  command: string;
  language: string;
}

interface ModuleQuizItem {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

function slugify(text: string, seen: Set<string>): string {
  const base = text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'seccion';
  let slug = base;
  let i = 2;
  while (seen.has(slug)) {
    slug = `${base}-${i}`;
    i += 1;
  }
  seen.add(slug);
  return slug;
}

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);
}

/**
 * Vista de lectura tipo libro: título, teoría y navegación simple al
 * capítulo/módulo anterior y siguiente. Sin retos, preguntas ni paneles
 * de gamificación.
 */
@Component({
  selector: 'app-lesson-viewer',
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './lesson-viewer.html',
  styleUrl: './lesson-viewer.scss',
})
export class LessonViewerComponent implements OnDestroy {
  readonly icons = { BookOpen, Boxes, Check, ChevronLeft, ChevronRight, CircleCheck, Clock3, Code2, Copy, Database, Gauge, ListTree, LockKeyhole, ShieldCheck, Zap };

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly contentService = inject(ContentService);
  readonly progressService = inject(ProgressService);

  private readonly trackId = toSignal(
    this.route.parent!.paramMap.pipe(map(params => params.get('trackId') ?? '')),
    { initialValue: this.route.parent?.snapshot.paramMap.get('trackId') ?? '' },
  );
  private readonly moduleId = toSignal(
    this.route.paramMap.pipe(map(params => Number(params.get('moduleId') ?? 0))),
    { initialValue: Number(this.route.snapshot.paramMap.get('moduleId') ?? 0) },
  );
  private readonly requestedFragment = toSignal(this.route.fragment, {
    initialValue: this.route.snapshot.fragment,
  });

  readonly track = computed(() => findTrack(this.trackId()));
  readonly module = computed(() => this.track()?.modules.find(m => m.id === this.moduleId()));
  readonly projectBootstrap = computed(() => findProjectBootstrap(this.trackId()));
  readonly moduleIndex = computed(() => this.track()?.modules.findIndex(m => m.id === this.moduleId()) ?? -1);
  readonly isCloudIntroduction = computed(() => this.trackId() === 'cloud' && this.moduleId() === 0);
  readonly flociMetrics = [
    { value: '24 ms', label: 'Arranque de referencia', detail: 'Binario nativo' },
    { value: '13 MiB', label: 'Memoria en reposo', detail: 'Huella local reducida' },
    { value: '68', label: 'Servicios AWS', detail: 'Sin niveles de pago' },
    { value: '1.925/1.925', label: 'Pruebas SDK', detail: 'Suite publicada por Floci' },
  ];
  readonly flociCapabilities = [
    { icon: Zap, title: 'Ciclo de trabajo inmediato', text: 'Levanta, prueba y destruye recursos dentro del mismo ciclo de edición, sin esperar una cuenta remota.' },
    { icon: LockKeyhole, title: 'Sin secretos cloud reales', text: 'Los clientes usan credenciales locales desechables. El estudiante aprende endpoints e IAM sin exponer una cuenta productiva.' },
    { icon: Boxes, title: 'Herramientas conocidas', text: 'AWS CLI, SDK, Terraform, OpenTofu y tests cambian el endpoint; no necesitas una API educativa diferente.' },
    { icon: ShieldCheck, title: 'Radio de impacto local', text: 'Un error afecta el contenedor de práctica. La validación final de seguridad y operación todavía debe ocurrir en nube real.' },
  ];
  readonly flociEngines = [
    { icon: Boxes, name: 'Lambda y ECS', detail: 'Ejecución en contenedores Docker reales' },
    { icon: Database, name: 'RDS', detail: 'PostgreSQL, MySQL y MariaDB reales' },
    { icon: Zap, name: 'MSK', detail: 'Kafka compatible mediante Redpanda' },
    { icon: Gauge, name: 'Athena', detail: 'Consultas SQL locales mediante DuckDB' },
  ];
  readonly previousModule = computed(() => {
    const track = this.track();
    const index = this.moduleIndex();
    return track && index > 0 ? track.modules[index - 1] : null;
  });
  readonly nextModule = computed(() => {
    const track = this.track();
    const index = this.moduleIndex();
    return track && index >= 0 && index < track.modules.length - 1 ? track.modules[index + 1] : null;
  });

  readonly lessonHtml = signal<string | null>(null);
  readonly lessonLoading = signal(true);
  private readonly lessonContent = viewChild<ElementRef<HTMLElement>>('lessonContent');
  private readonly injector = inject(Injector);
  private readonly themeService = inject(ThemeService);

  readonly tocItems = signal<TocItem[]>([]);
  readonly activeTocId = signal<string | null>(null);
  readonly readingProgress = signal(0);
  readonly copiedCode = signal<string | null>(null);
  readonly lessonMode = signal<LessonMode>('learn');
  readonly lessonStats = signal<LessonStats>({ topics: 0, examples: 0, activities: 0 });
  readonly moduleQuizAnswers = signal<(number | null)[]>([]);
  readonly moduleQuizChecked = signal(false);
  readonly examMode = signal(false);
  readonly examSeconds = signal(0);
  readonly completedTopicCount = signal(0);
  readonly labCount = signal(0);
  readonly verifiedLabCount = signal(0);
  readonly completionMessage = signal('');
  private tocObserver: IntersectionObserver | null = null;
  private copyTimer: ReturnType<typeof setTimeout> | null = null;
  private examTimer: ReturnType<typeof setInterval> | null = null;
  private readonly updateReadingProgress = (): void => {
    const article = this.lessonContent()?.nativeElement;
    if (!article) return;
    const rect = article.getBoundingClientRect();
    const total = Math.max(1, article.offsetHeight - window.innerHeight * .55);
    this.readingProgress.set(Math.max(0, Math.min(100, (-rect.top + 160) / total * 100)));
  };

  readonly isComplete = computed(() => this.progressService.isModuleComplete(this.trackId(), this.moduleId()));
  readonly moduleQuiz = computed<ModuleQuizItem[]>(() => {
    // No se fabrica una evaluación a partir de títulos del sílabo. El checkpoint
    // solo volverá a mostrarse cuando el capítulo tenga preguntas editoriales
    // que midan comprensión, aplicación y diagnóstico.
    return [];
  });
  readonly moduleQuizScore = computed(() => this.moduleQuiz().reduce((score, item, index) => score + (this.moduleQuizAnswers()[index] === item.answer ? 1 : 0), 0));
  readonly moduleQuizReady = computed(() => this.moduleQuizAnswers().length === this.moduleQuiz().length && this.moduleQuizAnswers().every(answer => answer !== null));
  readonly examTime = computed(() => `${String(Math.floor(this.examSeconds() / 60)).padStart(2, '0')}:${String(this.examSeconds() % 60).padStart(2, '0')}`);

  constructor() {
    effect(() => {
      const trackId = this.trackId();
      const module = this.module();
      if (!module) return;
      this.resetModuleQuiz();
      this.lessonLoading.set(true);
      this.contentService.loadLessonHtml(trackId, module.id).then(html => {
        this.lessonHtml.set(html);
        this.lessonLoading.set(false);
      });
    });

    // Diagramas Mermaid y verificación de laboratorios se aplican sobre el DOM ya
    // renderizado (no se puede enlazar Angular sobre HTML inyectado con [innerHTML]),
    // así que se espera al siguiente render tras cada cambio de lección.
    effect(() => {
      if (!this.lessonHtml()) return;
      afterNextRender(() => this.enhanceRenderedLesson(), { injector: this.injector });
    });

    effect(() => {
      const fragment = this.requestedFragment();
      if (!fragment || !this.lessonHtml()) return;
      afterNextRender(() => {
        const container = this.lessonContent()?.nativeElement;
        if (container) this.scrollToRequestedFragment(container, fragment);
      }, { injector: this.injector });
    });
  }

  selectModuleQuizAnswer(question: number, option: number): void {
    if (this.moduleQuizChecked()) return;
    this.moduleQuizAnswers.update(answers => answers.map((answer, index) => index === question ? option : answer));
  }

  checkModuleQuiz(): void {
    if (!this.moduleQuizReady()) return;
    this.moduleQuizChecked.set(true);
    this.stopExamTimer();
  }

  toggleExamMode(): void {
    this.examMode.update(value => !value);
    this.resetModuleQuiz(false);
    if (this.examMode()) this.examTimer = setInterval(() => this.examSeconds.update(value => value + 1), 1000);
  }

  resetModuleQuiz(resetMode = true): void {
    this.stopExamTimer();
    if (resetMode) this.examMode.set(false);
    this.examSeconds.set(0);
    this.moduleQuizChecked.set(false);
    this.moduleQuizAnswers.set(new Array(this.moduleQuiz().length).fill(null));
  }

  private stopExamTimer(): void {
    if (this.examTimer) clearInterval(this.examTimer);
    this.examTimer = null;
  }

  private enhanceRenderedLesson(): void {
    const container = this.lessonContent()?.nativeElement;
    if (!container) return;

    const diagrams = container.querySelectorAll<HTMLElement>('pre.mermaid');
    if (diagrams.length) {
      if (!mermaidInitialized) {
        mermaid.initialize({
          startOnLoad: false,
          theme: 'base',
          themeVariables: {
            primaryColor: this.themeService.isDark() ? '#1e3a5f' : '#e4f2ef',
            primaryTextColor: this.themeService.isDark() ? '#e2e8f0' : '#202124',
            primaryBorderColor: '#2563eb',
            lineColor: '#2563eb',
            secondaryColor: this.themeService.isDark() ? '#312e1f' : '#f8efd7',
            tertiaryColor: this.themeService.isDark() ? '#1f2937' : '#ffffff',
          },
        });
        mermaidInitialized = true;
      }
      mermaid.run({ nodes: Array.from(diagrams) });
    }

    const labs = applyLabVerification(container, index => {
      this.progressService.recordLearningStep(this.trackId(), 'lab', this.learningStepKey(index));
      this.refreshEvidenceState(container);
    });
    this.labCount.set(labs);
    this.enhanceEducationalContent(container);
    this.buildTableOfContents(container);
    const fragment = this.requestedFragment();
    if (fragment) this.scrollToRequestedFragment(container, fragment);
    window.removeEventListener('scroll', this.updateReadingProgress);
    window.addEventListener('scroll', this.updateReadingProgress, { passive: true });
    this.updateReadingProgress();
  }

  private enhanceEducationalContent(container: HTMLElement): void {
    this.groupLessonSections(container);
    this.addSectionGuides(container);

    container.querySelectorAll('h3').forEach(heading => {
      if (heading.textContent?.trim().startsWith('Tema ')) heading.classList.add('topic-heading');
    });

    container.querySelectorAll('p').forEach(paragraph => {
      const strong = paragraph.querySelector(':scope > strong:first-child');
      const label = strong?.textContent?.trim() ?? '';
      if (label.startsWith('Analogía:')) paragraph.classList.add('learning-callout', 'analogy-callout');
      if (label.startsWith('¿Por qué es importante?')) paragraph.classList.add('learning-callout', 'importance-callout');
      if (label.startsWith('Casos de uso reales:')) paragraph.classList.add('learning-callout', 'cases-callout');
      if (label.startsWith('Conceptos clave:')) paragraph.classList.add('concept-keyline');
    });

    container.querySelectorAll('pre:not(.mermaid)').forEach((pre, index) => {
      if (pre.parentElement?.classList.contains('code-example')) return;
      const code = pre.querySelector('code');
      const languageClass = Array.from(code?.classList ?? []).find(name => name.startsWith('language-'));
      const language = languageClass?.replace('language-', '') || 'código';
      const isTerminal = /^(bash|sh|shell|console|powershell|zsh)$/i.test(language);
      const previousText = pre.previousElementSibling?.textContent?.trim() ?? '';
      const path = previousText.match(/(?:[\w.-]+\/)+(?:[\w.-]+\.[a-z0-9]+|[\w.-]+)/i)?.[0];
      const label = path ?? (isTerminal ? 'Terminal' : language);
      const wrapper = document.createElement('div');
      wrapper.className = 'code-example';
      wrapper.dataset['language'] = language.toLowerCase();
      wrapper.innerHTML = `<div class="code-example-bar"><span class="window-controls" aria-hidden="true"><i></i><i></i><i></i></span><span class="code-example-label">${escapeHtml(label)}</span><span class="code-example-language">${escapeHtml(isTerminal ? language : `.${language}`)}</span><button type="button" data-copy-code="${index}" aria-label="Copiar ${escapeHtml(label)}">Copiar</button></div>`;
      pre.parentNode?.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);
    });

    this.groupTopics(container);
    this.collapseExerciseSolutions(container);
    this.lessonStats.set({
      topics: container.querySelectorAll('.topic-card').length,
      examples: container.querySelectorAll('.code-example').length,
      activities: container.querySelectorAll('.topic-practice, .exercise-card').length,
    });
    this.refreshEvidenceState(container);
  }

  private addSectionGuides(container: HTMLElement): void {
    const guides: Record<string, { label: string; text: string }> = {
      'section-silabo': {
        label: 'Temas de esta sección',
        text: 'Revisa el mapa antes de comenzar. Al terminar deberías poder explicar cada punto sin repetirlo de memoria.',
      },
      'section-contenido-teorico': {
        label: 'Explicación y demostración',
        text: 'Avanza una idea a la vez: comprende el motivo, predice el ejemplo y después comprueba el resultado.',
      },
      'section-laboratorio-practico': {
        label: 'Construcción paso a paso',
        text: 'Primero observa el resultado esperado; luego construye el incremento en tu propia rama y verifica cada paso.',
      },
      'section-criterio-transversal-de-calidad-del-codigo': {
        label: 'Buenas prácticas aplicadas',
        text: 'Revisa nombres, responsabilidades, dependencias, errores y pruebas. Usa SOLID solo cuando reduzca el coste real de cambiar.',
      },
      'section-ejercicios-de-evaluacion': {
        label: 'Tareas de la sección',
        text: 'Resuelve antes de abrir la solución. Si te bloqueas, vuelve únicamente al concepto necesario y prueba otra vez.',
      },
      'section-rubrica-del-proyecto': {
        label: 'Punto de control',
        text: 'Compara tu evidencia con los criterios. Corrige lo débil antes de marcar el capítulo como completado.',
      },
      'section-bibliografia-y-fundamento-academico': {
        label: 'Recursos para profundizar',
        text: 'Usa las fuentes primarias para confirmar versiones, ampliar conceptos y continuar aprendiendo por tu cuenta.',
      },
      'section-resumen-del-modulo': {
        label: 'Repaso de cierre',
        text: 'Explica lo aprendido con tus palabras, registra el código alcanzado y anota la siguiente mejora del proyecto.',
      },
    };

    container.querySelectorAll<HTMLElement>('.lesson-section').forEach(section => {
      if (section.querySelector(':scope > .section-guide')) return;
      const guide = section.className.includes('section-proyecto-transversal-rutaflow')
        ? {
            label: 'Proyecto profesional conectado',
            text: 'Implementa esta capacidad dentro de RutaFlow y verifica su contrato con las demás rutas, sin acoplar frameworks ni compartir estado interno.',
          }
        : Object.entries(guides).find(([className]) => section.classList.contains(className))?.[1];
      if (!guide) return;
      const heading = section.querySelector(':scope > h2');
      if (!heading) return;
      const element = document.createElement('aside');
      element.className = 'section-guide';
      element.innerHTML = `<strong>${escapeHtml(guide.label)}</strong><span>${escapeHtml(guide.text)}</span>`;
      heading.insertAdjacentElement('afterend', element);
    });

    const lab = container.querySelector<HTMLElement>('.section-laboratorio-practico');
    if (lab && !lab.querySelector('.target-demo')) {
      const target = document.createElement('aside');
      target.className = 'target-demo';
      target.innerHTML = `<small>Resultado que debes poder demostrar</small><strong>${escapeHtml(this.module()?.deliverable ?? 'Un incremento funcional, probado y reproducible.')}</strong>`;
      lab.querySelector(':scope > .section-guide')?.insertAdjacentElement('afterend', target);
    }
  }

  private groupLessonSections(container: HTMLElement): void {
    const headings = Array.from(container.querySelectorAll<HTMLHeadingElement>(':scope > h2'));
    headings.forEach(heading => {
      if (heading.parentElement?.classList.contains('lesson-section')) return;
      const section = document.createElement('section');
      const title = heading.textContent?.trim() ?? '';
      section.className = `lesson-section section-${slugify(title, new Set())}`;
      heading.parentNode?.insertBefore(section, heading);
      let node: Node | null = heading;
      while (node && (node === heading || !(node instanceof HTMLHeadingElement && node.tagName === 'H2'))) {
        const next: Node | null = node.nextSibling;
        section.appendChild(node);
        node = next;
      }
    });
  }

  private groupTopics(container: HTMLElement): void {
    const headings = Array.from(container.querySelectorAll<HTMLHeadingElement>('h3.topic-heading'));
    headings.forEach((heading, index) => {
      if (heading.parentElement?.classList.contains('topic-card')) return;
      const card = document.createElement('section');
      card.className = 'topic-card';
      card.dataset['topicIndex'] = String(index);
      heading.parentNode?.insertBefore(card, heading);
      let node: Node | null = heading;
      while (node && (node === heading || !(node instanceof HTMLHeadingElement && ['H2', 'H3'].includes(node.tagName)))) {
        const next: Node | null = node.nextSibling;
        card.appendChild(node);
        node = next;
      }
      const action = document.createElement('button');
      action.type = 'button';
      action.className = 'topic-check';
      action.dataset['topicCheck'] = String(index);
      const savedDone = localStorage.getItem(this.topicStorageKey(index, 'done')) === 'true';
      action.classList.toggle('done', savedDone);
      action.textContent = savedDone ? 'Tema demostrado ✓' : 'Demostrar aprendizaje';
      const practice = document.createElement('details');
      practice.className = 'topic-practice';
      const title = escapeHtml(heading.textContent?.replace(/^Tema\s+\d+:\s*/, '').trim() || 'este concepto');
      const hasCode = card.querySelector('.code-example') !== null;
      practice.innerHTML = hasCode
        ? `<summary>Practica ahora · 5–10 min</summary><div><ol><li>Sin ejecutar el ejemplo, predice su resultado y explica por qué.</li><li>Cambia un dato, condición o parámetro relacionado con <strong>${title}</strong>; vuelve a predecir y ejecuta.</li><li>Provoca un error deliberado, lee el mensaje completo y corrígelo sin copiar la solución.</li></ol><textarea aria-label="Notas de práctica" placeholder="Escribe aquí tu predicción, cambio y explicación…"></textarea></div>`
        : `<summary>Practica ahora · 5–10 min</summary><div><ol><li>Explica <strong>${title}</strong> con tus palabras, sin releer el texto.</li><li>Contrástalo con una alternativa: ¿cuándo no lo usarías?</li><li>Describe un caso real donde aplicarlo y una señal que te permita verificar que funcionó.</li></ol><textarea aria-label="Notas de práctica" placeholder="Escribe aquí tu explicación y caso real…"></textarea></div>`;
      const note = practice.querySelector<HTMLTextAreaElement>('textarea');
      if (note) {
        note.dataset['practiceNote'] = String(index);
        note.value = localStorage.getItem(this.topicStorageKey(index, 'note')) ?? '';
        if (note.value) practice.open = true;
        // Solo se migra el avance antiguo si también existe evidencia escrita.
        // Un clic histórico sin explicación no se convierte automáticamente en XP.
        if (savedDone && note.value.trim().length >= 40) {
          this.progressService.recordLearningStep(this.trackId(), 'topic', this.learningStepKey(index));
          this.progressService.recordLearningStep(this.trackId(), 'practice', this.learningStepKey(index));
        }
      }
      const previous = this.previousModule();
      const contract = document.createElement('aside');
      contract.className = 'learning-contract';
      contract.innerHTML = `<div><small>Antes de empezar</small><strong>${escapeHtml(previous ? `Haber completado: ${previous.shortTitle}` : 'No necesitas experiencia previa')}</strong></div><div><small>Meta de este tema</small><strong>Explicar y aplicar ${title} sin copiar el ejemplo</strong></div><div><small>No avances hasta</small><strong>Poder ejecutarlo, modificarlo y diagnosticar un fallo</strong></div>`;
      heading.insertAdjacentElement('afterend', contract);
      this.addImplementationGuide(card, heading, index);
      card.appendChild(practice);
      card.appendChild(action);
      const body = document.createElement('div');
      body.className = 'topic-body';
      let bodyNode = heading.nextSibling;
      while (bodyNode) {
        const next = bodyNode.nextSibling;
        body.appendChild(bodyNode);
        bodyNode = next;
      }
      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'topic-toggle';
      toggle.dataset['topicToggle'] = String(index);
      toggle.setAttribute('aria-expanded', String(index === 0));
      toggle.innerHTML = `<span>Tema ${index + 1} de ${headings.length}</span><strong>${index === 0 ? 'Ocultar contenido' : 'Estudiar este tema'}</strong>`;
      card.classList.toggle('expanded', index === 0);
      card.appendChild(toggle);
      card.appendChild(body);
    });
  }

  private addImplementationGuide(card: HTMLElement, heading: HTMLHeadingElement, index: number): void {
    // Una ruta o un comando inventados por el lector pueden parecer una guía
    // completa aunque el ejemplo editorial no exista. Solo enriquecemos temas
    // que ya contienen código específico escrito y revisado para el capítulo.
    if (!card.querySelector('.code-example')) return;
    const topic = heading.textContent?.replace(/^Tema(?:\s+(?:complementario|suplementario))?(?:\s+\d+)?\s*:\s*/i, '').trim() || `tema-${index + 1}`;
    const profile = this.implementationProfile(index);
    const guide = document.createElement('section');
    guide.className = 'implementation-guide';
    guide.innerHTML = `<div class="implementation-guide-heading"><small>Implementación guiada</small><strong>Dónde escribir y cómo comprobarlo</strong></div>
      <ol>
        <li><span>1</span><div><strong>Crea el archivo</strong><code>${escapeHtml(profile.path)}</code></div></li>
        <li><span>2</span><div><strong>Implementa el incremento</strong><p>Escribe y explica el ejemplo editorial de este tema; después modifícalo para aplicar <em>${escapeHtml(topic)}</em> a un caso propio.</p></div></li>
        <li><span>3</span><div><strong>Ejecuta desde la raíz del repositorio</strong><code>${escapeHtml(profile.command)}</code></div></li>
        <li><span>4</span><div><strong>Resultado esperado</strong><p>La ejecución termina sin errores, produce una evidencia observable y la prueba de fallo explica qué condición se incumplió.</p></div></li>
      </ol>`;
    const firstPractice = card.querySelector('.topic-practice');
    card.insertBefore(guide, firstPractice);
  }

  private implementationProfile(topicIndex: number): ImplementationProfile {
    const moduleId = this.moduleId();
    const topic = topicIndex + 1;
    const profiles: Record<string, ImplementationProfile> = {
      foundations: { path: `examples/tracks/foundations/module-${moduleId}/topic-${topic}.py`, command: `python3 examples/tracks/foundations/module-${moduleId}/topic-${topic}.py`, language: 'python' },
      cloud: { path: `examples/tracks/cloud/module-${moduleId}/topic-${topic}/main.tf`, command: `terraform -chdir=examples/tracks/cloud/module-${moduleId}/topic-${topic} init && terraform -chdir=examples/tracks/cloud/module-${moduleId}/topic-${topic} validate`, language: 'hcl' },
      devops: { path: `examples/tracks/devops/module-${moduleId}/topic-${topic}.yaml`, command: `docker compose config && ./scripts/validate.sh`, language: 'yaml' },
      javascript: { path: `examples/tracks/javascript/module-${moduleId}/topic-${topic}.ts`, command: `npx tsx examples/tracks/javascript/module-${moduleId}/topic-${topic}.ts`, language: 'typescript' },
      node: { path: `examples/tracks/node/src/module-${moduleId}/topic-${topic}.ts`, command: `npx tsx examples/tracks/node/src/module-${moduleId}/topic-${topic}.ts`, language: 'typescript' },
      angular: { path: `examples/tracks/angular/src/app/module-${moduleId}/topic-${topic}.ts`, command: `npm --prefix examples/tracks/angular test`, language: 'typescript' },
      react: { path: `examples/tracks/react/src/module-${moduleId}/Topic${topic}.tsx`, command: `npm --prefix examples/tracks/react test`, language: 'tsx' },
      java: { path: `examples/tracks/java/src/main/java/academy/module${moduleId}/Topic${topic}.java`, command: `./gradlew test`, language: 'java' },
      'spring-boot': { path: `examples/tracks/spring-boot/src/main/java/academy/module${moduleId}/Topic${topic}Service.java`, command: `./mvnw test`, language: 'java' },
      'kotlin-multiplatform': { path: `examples/tracks/kotlin-multiplatform/shared/src/commonMain/kotlin/module${moduleId}/Topic${topic}.kt`, command: `./gradlew :shared:allTests`, language: 'kotlin' },
      android: { path: `examples/tracks/android/app/src/main/java/academy/module${moduleId}/Topic${topic}.kt`, command: `./gradlew testDebugUnitTest`, language: 'kotlin' },
      ios: { path: `examples/tracks/ios/Sources/RutaFlow/Module${moduleId}/Topic${topic}.swift`, command: `swift test --package-path examples/tracks/ios`, language: 'swift' },
      flutter: { path: `examples/tracks/flutter/lib/features/module_${moduleId}/topic_${topic}.dart`, command: `flutter test examples/tracks/flutter`, language: 'dart' },
      rutaflow: { path: `examples/project-final/module-${moduleId}/topic-${topic}.md`, command: `./scripts/validate.sh`, language: 'text' },
    };
    return profiles[this.trackId()] ?? profiles['foundations'];
  }

  private collapseExerciseSolutions(container: HTMLElement): void {
    container.querySelectorAll<HTMLElement>('.section-ejercicios-de-evaluacion h3').forEach((heading, index) => {
      if (!heading.textContent?.trim().startsWith('Ejercicio ')) return;
      const card = document.createElement('article');
      card.className = 'exercise-card';
      heading.parentNode?.insertBefore(card, heading);
      card.appendChild(heading);
      let node = card.nextSibling;
      while (node && !(node instanceof HTMLHeadingElement && ['H2', 'H3'].includes(node.tagName))) {
        const next = node.nextSibling;
        card.appendChild(node);
        node = next;
      }
      const solution = Array.from(card.querySelectorAll('p')).find(p => p.textContent?.trim().startsWith('Solución esperada:'));
      if (!solution) return;
      const details = document.createElement('details');
      details.className = 'exercise-solution';
      const summary = document.createElement('summary');
      summary.textContent = 'Ver solución razonada';
      details.appendChild(summary);
      let solutionNode: Node | null = solution;
      while (solutionNode) {
        const next: Node | null = solutionNode.nextSibling;
        details.appendChild(solutionNode);
        solutionNode = next;
      }
      card.appendChild(details);
      card.dataset['exerciseIndex'] = String(index);
    });
  }

  async copyCode(event: Event): Promise<void> {
    const topicToggle = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-topic-toggle]');
    if (topicToggle) {
      const card = topicToggle.closest<HTMLElement>('.topic-card');
      if (!card) return;
      const expanded = card.classList.toggle('expanded');
      topicToggle.setAttribute('aria-expanded', String(expanded));
      const label = topicToggle.querySelector('strong');
      if (label) label.textContent = expanded ? 'Ocultar contenido' : 'Estudiar este tema';
      if (expanded) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    const topicButton = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-topic-check]');
    if (topicButton) {
      const index = Number(topicButton.dataset['topicCheck'] ?? 0);
      const card = topicButton.closest<HTMLElement>('.topic-card');
      const note = card?.querySelector<HTMLTextAreaElement>('[data-practice-note]')?.value.trim() ?? '';
      if (!topicButton.classList.contains('done') && note.length < 40) {
        this.completionMessage.set('Antes de completar el tema, escribe una predicción o explicación de al menos 40 caracteres.');
        card?.querySelector<HTMLTextAreaElement>('[data-practice-note]')?.focus();
        return;
      }
      topicButton.classList.toggle('done');
      topicButton.textContent = topicButton.classList.contains('done') ? 'Tema demostrado ✓' : 'Demostrar aprendizaje';
      localStorage.setItem(
        this.topicStorageKey(index, 'done'),
        String(topicButton.classList.contains('done')),
      );
      if (topicButton.classList.contains('done')) {
        this.progressService.recordLearningStep(this.trackId(), 'topic', this.learningStepKey(index));
        this.progressService.recordLearningStep(this.trackId(), 'practice', this.learningStepKey(index));
        this.completionMessage.set('¡Evidencia registrada! Sumaste XP por comprender y practicar.');
      }
      if (card) this.refreshEvidenceState(card.closest('.lesson-markdown') as HTMLElement);
      return;
    }
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-copy-code]');
    if (!button) return;
    const code = button.closest('.code-example')?.querySelector('code')?.textContent ?? '';
    await navigator.clipboard.writeText(code);
    const id = button.dataset['copyCode'] ?? '';
    this.copiedCode.set(id);
    button.textContent = 'Copiado';
    if (this.copyTimer) clearTimeout(this.copyTimer);
    this.stopExamTimer();
    this.copyTimer = setTimeout(() => {
      button.textContent = 'Copiar';
      this.copiedCode.set(null);
    }, 1800);
  }

  savePracticeNote(event: Event): void {
    const note = (event.target as HTMLElement).closest<HTMLTextAreaElement>('[data-practice-note]');
    if (!note) return;
    localStorage.setItem(this.topicStorageKey(Number(note.dataset['practiceNote'] ?? 0), 'note'), note.value);
  }

  private topicStorageKey(index: number, field: 'done' | 'note'): string {
    return `academia-topic:${this.trackId()}:${this.moduleId()}:${index}:${field}`;
  }

  private learningStepKey(index: number): string {
    return `${this.moduleId()}:${index}`;
  }

  private refreshEvidenceState(container: HTMLElement | null): void {
    if (!container) return;
    this.completedTopicCount.set(container.querySelectorAll('.topic-check.done').length);
    let verified = 0;
    for (let index = 0; index < this.labCount(); index += 1) {
      if (this.progressService.hasLearningStep(this.trackId(), 'lab', this.learningStepKey(index))) verified += 1;
    }
    this.verifiedLabCount.set(verified);
  }

  readonly canComplete = computed(() => {
    const topicsReady = this.lessonStats().topics > 0 && this.completedTopicCount() === this.lessonStats().topics;
    const labsReady = this.labCount() === 0 || this.verifiedLabCount() === this.labCount();
    return topicsReady && labsReady;
  });

  setLessonMode(mode: LessonMode): void {
    this.lessonMode.set(mode);
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  private buildTableOfContents(container: HTMLElement): void {
    this.tocObserver?.disconnect();

    const headings = Array.from(container.querySelectorAll<HTMLElement>('h2, h3'));
    const seen = new Set<string>();
    const items: TocItem[] = headings.map(el => {
      const level = el.tagName === 'H2' ? 2 : 3;
      const text = el.textContent?.trim() ?? '';
      const id = el.id || slugify(text, seen);
      el.id = id;
      return { id, text, level };
    });
    this.tocItems.set(items);
    this.activeTocId.set(items[0]?.id ?? null);

    if (!headings.length || typeof IntersectionObserver === 'undefined') return;
    this.tocObserver = new IntersectionObserver(
      entries => {
        const visible = entries.filter(e => e.isIntersecting).map(e => e.target as HTMLElement);
        if (!visible.length) return;
        const topmost = visible.reduce((a, b) => (a.getBoundingClientRect().top <= b.getBoundingClientRect().top ? a : b));
        this.activeTocId.set(topmost.id);
      },
      { rootMargin: '-72px 0px -70% 0px', threshold: 0 },
    );
    headings.forEach(h => this.tocObserver!.observe(h));
  }

  private scrollToRequestedFragment(container: HTMLElement, fragment: string): void {
    requestAnimationFrame(() => {
      const target = container.querySelector<HTMLElement>(`#${CSS.escape(fragment)}`);
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (target) this.activeTocId.set(fragment);
    });
  }

  scrollToHeading(event: Event, id: string): void {
    event.preventDefault();
    const target = this.lessonContent()?.nativeElement.querySelector(`#${CSS.escape(id)}`);
    if (!target) return;
    const topicCard = target.closest<HTMLElement>('.topic-card');
    if (topicCard && !topicCard.classList.contains('expanded')) {
      topicCard.classList.add('expanded');
      const toggle = topicCard.querySelector<HTMLButtonElement>('[data-topic-toggle]');
      toggle?.setAttribute('aria-expanded', 'true');
      const label = toggle?.querySelector('strong');
      if (label) label.textContent = 'Ocultar contenido';
    }
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.replaceState(null, '', `#${id}`);
    this.activeTocId.set(id);
  }

  toggleComplete(): void {
    if (!this.isComplete() && !this.canComplete()) {
      this.completionMessage.set('Aún falta evidencia: completa todos los temas y verifica los laboratorios disponibles.');
      return;
    }
    this.progressService.toggleModuleComplete(this.trackId(), this.moduleId());
    this.completionMessage.set(this.isComplete() ? 'Capítulo completado: 50 XP adicionales.' : 'El capítulo volvió a estado pendiente.');
  }

  goToModule(moduleId: number): void {
    this.router.navigate(['/curso', this.trackId(), moduleId]);
  }

  ngOnDestroy(): void {
    this.tocObserver?.disconnect();
    window.removeEventListener('scroll', this.updateReadingProgress);
    if (this.copyTimer) clearTimeout(this.copyTimer);
  }
}
