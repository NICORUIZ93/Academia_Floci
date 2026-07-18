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
import { findOfficialLearningPath } from '../official-learning-paths';
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
  failure: string;
  projectConnection: string;
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
  readonly completedTopicCount = signal(0);
  readonly labCount = signal(0);
  readonly verifiedLabCount = signal(0);
  readonly completionMessage = signal('');
  private tocObserver: IntersectionObserver | null = null;
  private copyTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly updateReadingProgress = (): void => {
    const article = this.lessonContent()?.nativeElement;
    if (!article) return;
    const rect = article.getBoundingClientRect();
    const total = Math.max(1, article.offsetHeight - window.innerHeight * .55);
    this.readingProgress.set(Math.max(0, Math.min(100, (-rect.top + 160) / total * 100)));
  };

  readonly isComplete = computed(() => this.progressService.isModuleComplete(this.trackId(), this.moduleId()));
  constructor() {
    effect(() => {
      const trackId = this.trackId();
      const module = this.module();
      if (!module) return;
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

  private enhanceRenderedLesson(): void {
    const container = this.lessonContent()?.nativeElement;
    if (!container) return;

    const diagrams = container.querySelectorAll<HTMLElement>('pre.mermaid');
    if (diagrams.length) {
      this.prepareMermaidDiagrams(container);
      if (!mermaidInitialized) {
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          fontFamily: 'Inter, system-ui, sans-serif',
          flowchart: { htmlLabels: true, curve: 'basis', padding: 18 },
          sequence: { diagramMarginX: 24, diagramMarginY: 18, actorMargin: 48 },
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

  private prepareMermaidDiagrams(container: HTMLElement): void {
    container.querySelectorAll<HTMLElement>('pre.mermaid').forEach((diagram, index) => {
      if (diagram.parentElement?.classList.contains('visual-diagram')) return;
      let previous: Element | null = diagram.previousElementSibling;
      while (previous && previous.tagName !== 'H3' && previous.tagName !== 'H2') previous = previous.previousElementSibling;
      const context = diagram.closest('.topic-card')?.querySelector('.topic-heading')?.textContent?.trim()
        ?? previous?.textContent?.trim()
        ?? `Diagrama ${index + 1}`;
      const figure = document.createElement('figure');
      figure.className = 'visual-diagram';
      figure.setAttribute('aria-label', `Diagrama técnico: ${context}`);
      const caption = document.createElement('figcaption');
      caption.innerHTML = `<span aria-hidden="true">◇</span><div><small>Modelo visual</small><strong>${escapeHtml(context)}</strong><p>Sigue las conexiones en el orden de las flechas; cada bloque representa una responsabilidad o estado.</p></div>`;
      diagram.parentNode?.insertBefore(figure, diagram);
      figure.append(caption, diagram);
      diagram.setAttribute('role', 'img');
      diagram.setAttribute('aria-label', `Relaciones y flujo de ${context}`);
      diagram.tabIndex = 0;
    });
  }

  private enhanceEducationalContent(container: HTMLElement): void {
    this.groupLessonSections(container);
    this.collapseSecondarySections(container);
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
      const languageLabels: Record<string, string> = {
        bash: 'Terminal', sh: 'Terminal', shell: 'Terminal', console: 'Terminal', powershell: 'PowerShell', zsh: 'Terminal',
        js: 'JavaScript', javascript: 'JavaScript', ts: 'TypeScript', typescript: 'TypeScript', jsx: 'React JSX', tsx: 'React TSX',
        java: 'Java', kotlin: 'Kotlin', swift: 'Swift', dart: 'Dart', python: 'Python', py: 'Python', json: 'JSON', yaml: 'YAML', yml: 'YAML',
        html: 'HTML', css: 'CSS', scss: 'SCSS', sql: 'SQL', hcl: 'Terraform HCL', go: 'Go', rust: 'Rust', xml: 'XML',
      };
      const languageLabel = languageLabels[language.toLowerCase()] ?? language;
      const lineCount = code?.textContent?.replace(/\n$/, '').split('\n').length ?? 0;
      const wrapper = document.createElement('div');
      wrapper.className = 'code-example';
      wrapper.dataset['language'] = language.toLowerCase();
      wrapper.innerHTML = `<div class="code-example-bar"><span class="window-controls" aria-hidden="true"><i></i><i></i><i></i></span><span class="code-example-label">${escapeHtml(label)}</span><span class="code-example-meta"><span class="code-example-language">${escapeHtml(languageLabel)}</span><span>${lineCount} ${lineCount === 1 ? 'línea' : 'líneas'}</span></span><button type="button" data-wrap-code aria-pressed="false" aria-label="Ajustar líneas de ${escapeHtml(label)}">Ajustar</button><button type="button" data-copy-code="${index}" aria-label="Copiar ${escapeHtml(label)}">Copiar</button></div>`;
      pre.parentNode?.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);
      pre.setAttribute('tabindex', '0');
      pre.setAttribute('aria-label', `${isTerminal ? 'Comandos' : 'Código'} en ${languageLabel}: ${label}`);
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

  private collapseSecondarySections(container: HTMLElement): void {
    const secondarySelectors = [
      '.section-silabo',
      '.section-criterio-transversal-de-calidad-del-codigo',
      '.section-rubrica-del-proyecto',
      '.section-bibliografia-y-fundamento-academico',
      '.section-resumen-del-modulo',
    ].join(',');

    container.querySelectorAll<HTMLElement>(secondarySelectors).forEach((section, index) => {
      if (section.querySelector(':scope > .secondary-section-body')) return;
      const heading = section.querySelector<HTMLHeadingElement>(':scope > h2');
      if (!heading) return;
      const body = document.createElement('div');
      body.className = 'secondary-section-body';
      let node = heading.nextSibling;
      while (node) {
        const next = node.nextSibling;
        body.appendChild(node);
        node = next;
      }
      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'secondary-section-toggle';
      toggle.dataset['secondaryToggle'] = String(index);
      toggle.setAttribute('aria-expanded', 'false');
      toggle.innerHTML = '<span>Mostrar</span><span aria-hidden="true">⌄</span>';
      heading.appendChild(toggle);
      section.appendChild(body);
    });
  }

  private addSectionGuides(container: HTMLElement): void {
    const lab = container.querySelector<HTMLElement>('.section-laboratorio-practico');
    if (lab && !lab.querySelector('.target-demo')) {
      const target = document.createElement('aside');
      target.className = 'target-demo';
      target.innerHTML = `<small>Resultado que debes poder demostrar</small><strong>${escapeHtml(this.module()?.deliverable ?? 'Un incremento funcional, probado y reproducible.')}</strong>`;
      lab.querySelector(':scope > h2')?.insertAdjacentElement('afterend', target);
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
      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'topic-toggle';
      toggle.dataset['topicToggle'] = String(index);
      toggle.setAttribute('aria-expanded', String(index === 0));
      toggle.innerHTML = `<span>${index === 0 ? 'Ocultar tema' : 'Abrir tema'}</span><span aria-hidden="true">⌄</span>`;
      heading.appendChild(toggle);
      this.addImplementationGuide(card, heading, index, hasCode);
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
      card.classList.toggle('expanded', index === 0);
      card.appendChild(body);
    });
  }

  private addImplementationGuide(card: HTMLElement, heading: HTMLHeadingElement, index: number, hasCode: boolean): void {
    const topic = heading.textContent?.replace(/^Tema(?:\s+(?:complementario|suplementario))?(?:\s+\d+)?\s*:\s*/i, '').trim() || `tema-${index + 1}`;
    const profile = this.implementationProfile(index, hasCode);
    const deliverable = this.module()?.deliverable ?? 'Un incremento funcional, comprobable y documentado.';
    const official = findOfficialLearningPath(this.trackId());
    const guide = document.createElement('details');
    guide.className = 'implementation-guide';
    guide.innerHTML = `<summary><span>Guía completa desde cero</span><strong>Archivos, ejecución, fallos y fuente oficial</strong></summary><div class="implementation-guide-body"><div class="implementation-guide-heading"><small>Úsala cuando necesites acompañamiento paso a paso</small><strong>Dónde trabajar, cómo probar y qué hacer si falla</strong></div>
      <ol>
        <li><span>1</span><div><strong>Antes de escribir</strong><p>Explica con tus palabras qué problema resuelve <em>${escapeHtml(topic)}</em>, qué dato recibe y qué cambio observable debe producir. Si no puedes hacerlo, vuelve a la explicación anterior.</p></div></li>
        <li><span>2</span><div><strong>${hasCode ? 'Crea el archivo de práctica' : 'Crea el registro de decisión'}</strong><code>${escapeHtml(profile.path)}</code><p>${hasCode ? `Ubícalo dentro del proyecto del track; no escribas el ejemplo en una carpeta temporal ni dentro de la academia.` : `Documenta contexto, alternativas, decisión, consecuencias y una forma de comprobarla. Un tema conceptual también debe dejar evidencia.`}</p></div></li>
        <li><span>3</span><div><strong>${hasCode ? 'Construye un incremento pequeño' : 'Aplica la decisión a un caso concreto'}</strong><p>${hasCode ? `Reproduce primero el ejemplo editorial, explica cada entrada y salida, y después modifica una condición para aplicar ${escapeHtml(topic)} a un caso propio.` : `Compara al menos dos alternativas para ${escapeHtml(topic)} y elige una usando restricciones medibles del sistema.`}</p></div></li>
        <li><span>4</span><div><strong>Ejecuta desde la raíz del proyecto</strong><code>${escapeHtml(profile.command)}</code><p>No continúes si el comando no reconoce el proyecto o ejecuta archivos de otra carpeta.</p></div></li>
        <li><span>5</span><div><strong>Resultado que debes observar</strong><p>${escapeHtml(deliverable)} La evidencia debe mostrar entrada, resultado y criterio de aceptación; “no dio error” no es suficiente.</p></div></li>
        <li><span>6</span><div><strong>Provoca y diagnostica un fallo</strong><p>${escapeHtml(profile.failure)} Lee el primer mensaje útil, formula una causa, compruébala y registra la corrección.</p></div></li>
        <li><span>7</span><div><strong>Conecta con el proyecto integrador</strong><p>${escapeHtml(profile.projectConnection)} Explica qué contrato protege y qué otro componente consumirá el resultado.</p></div></li>
        <li><span>8</span><div><strong>Demuestra que aprendiste</strong><p>Entrega el archivo, el comando exacto, la salida observada, el fallo corregido y una decisión que tomarías diferente en producción.</p></div></li>
        ${official ? `<li><span>9</span><div><strong>Contrasta con la documentación oficial</strong><p>Confirma nombres, límites y versión en <a href="${escapeHtml(official.sourceUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(official.source)}</a>. La academia explica y practica; la fuente primaria confirma el contrato vigente.</p></div></li>` : ''}
      </ol></div>`;
    const firstPractice = card.querySelector('.topic-practice');
    card.insertBefore(guide, firstPractice);
  }

  private implementationProfile(topicIndex: number, hasCode: boolean): ImplementationProfile {
    const moduleId = this.moduleId();
    const topic = topicIndex + 1;
    const profiles: Record<string, ImplementationProfile> = {
      foundations: { path: `academia-labs/foundations/src/module_${moduleId}/topic_${topic}.py`, command: `python3 -m unittest discover -s tests -v`, language: 'python', failure: 'Usa una entrada inválida o elimina una precondición y observa cómo se manifiesta el error.', projectConnection: 'Convierte el concepto en una regla o prueba básica que RutaFlow pueda reutilizar.' },
      cloud: { path: `academia-labs/cloud/infra/module-${moduleId}/topic-${topic}/main.tf`, command: `terraform -chdir=infra/module-${moduleId}/topic-${topic} validate`, language: 'hcl', failure: 'Cambia un nombre, permiso o endpoint por un valor inválido y confirma que la validación o la llamada falle de forma visible.', projectConnection: 'Modela esta capacidad como infraestructura reproducible del entorno RutaFlow.' },
      devops: { path: `academia-labs/devops/infra/module-${moduleId}/topic-${topic}.yaml`, command: `docker compose config && ./scripts/validate.sh`, language: 'yaml', failure: 'Rompe una referencia, variable o healthcheck y usa la salida de configuración o los logs para localizarla.', projectConnection: 'Automatiza con esta técnica el despliegue o la operación segura de RutaFlow.' },
      javascript: { path: `academia-labs/javascript/src/module-${moduleId}/topic-${topic}.ts`, command: `npm test && npm run dev`, language: 'typescript', failure: 'Prueba un valor de frontera, un tipo inesperado o una operación fuera de orden y observa la diferencia.', projectConnection: 'Aplica el comportamiento a una interacción web del panel operativo de RutaFlow.' },
      node: { path: `academia-labs/node-api/src/module-${moduleId}/topic-${topic}.ts`, command: `npm test && npm run dev`, language: 'typescript', failure: 'Envía una entrada inválida o desconecta una dependencia y comprueba el código HTTP y el log con contexto.', projectConnection: 'Incorpora la regla a un endpoint o proceso backend de entregas de RutaFlow.' },
      angular: { path: `academia-labs/angular-app/src/app/features/module-${moduleId}/topic-${topic}.ts`, command: `npm test -- --watch=false && npm start`, language: 'typescript', failure: 'Elimina una dependencia, usa un estado inválido o simula un error HTTP y verifica el estado visual correspondiente.', projectConnection: 'Construye con esta técnica una parte del panel web de operaciones de RutaFlow.' },
      react: { path: `academia-labs/react-app/src/features/module-${moduleId}/Topic${topic}.tsx`, command: `npm test -- --run && npm run dev`, language: 'tsx', failure: 'Cambia una prop o respuesta a un caso vacío o erróneo y comprueba que la interfaz no quede ambigua.', projectConnection: 'Úsalo en una pantalla de seguimiento o gestión de entregas de RutaFlow.' },
      java: { path: `academia-labs/java/src/main/java/academy/module${moduleId}/Topic${topic}.java`, command: `./gradlew test`, language: 'java', failure: 'Viola una precondición o usa un valor límite y verifica que la excepción o resultado exprese la regla incumplida.', projectConnection: 'Representa con este concepto una regla de dominio independiente del framework de RutaFlow.' },
      'spring-boot': { path: `academia-labs/spring-api/src/main/java/io/academia/rutaflow/module${moduleId}/Topic${topic}Service.java`, command: `./mvnw test`, language: 'java', failure: 'Envía una petición inválida o sustituye una dependencia por un fallo controlado y verifica estado HTTP, cuerpo y causa.', projectConnection: 'Añade el incremento al servicio de entregas de RutaFlow sin mezclar dominio e infraestructura.' },
      'kotlin-multiplatform': { path: `academia-labs/kmp-app/shared/src/commonMain/kotlin/module${moduleId}/Topic${topic}.kt`, command: `./gradlew :shared:allTests`, language: 'kotlin', failure: 'Introduce un caso de plataforma o dato nulo no contemplado y comprueba que commonTest lo haga visible.', projectConnection: 'Comparte esta regla entre las aplicaciones Android e iOS del conductor de RutaFlow.' },
      android: { path: `academia-labs/android-app/app/src/main/java/academy/module${moduleId}/Topic${topic}.kt`, command: `./gradlew testDebugUnitTest`, language: 'kotlin', failure: 'Simula permiso denegado, proceso recreado o dato ausente y verifica que la pantalla conserve un estado comprensible.', projectConnection: 'Aplícalo al flujo Android del conductor, considerando GPS, red y batería.' },
      ios: { path: `academia-labs/ios-app/Features/Module${moduleId}/Topic${topic}.swift`, command: `xcodebuild test -scheme RutaFlowLab -destination "platform=iOS Simulator,name=iPhone 16"`, language: 'swift', failure: 'Simula permiso denegado, respuesta vacía o tarea cancelada y verifica el estado y el mensaje mostrados.', projectConnection: 'Aplícalo al flujo iOS del conductor respetando ciclo de vida, permisos y accesibilidad.' },
      flutter: { path: `academia-labs/flutter_app/lib/features/module_${moduleId}/topic_${topic}.dart`, command: `flutter analyze && flutter test`, language: 'dart', failure: 'Simula pérdida de red, permiso denegado o widget desmontado y comprueba que el estado se recupere sin errores ocultos.', projectConnection: 'Integra el concepto en la app multiplataforma del conductor de RutaFlow.' },
      rutaflow: { path: `academia-labs/rutaflow/docs/iterations/module-${moduleId}-topic-${topic}.md`, command: `docker compose config && ./scripts/validate.sh`, language: 'text', failure: 'Rompe de forma controlada un contrato entre componentes y localiza la causa usando logs, métricas o pruebas.', projectConnection: 'Implementa esta capacidad como un incremento vertical del propio proyecto RutaFlow.' },
    };
    const profile = profiles[this.trackId()] ?? profiles['foundations'];
    if (hasCode) return profile;
    return {
      ...profile,
      path: `${profile.path.substring(0, profile.path.lastIndexOf('/'))}/decision-topic-${topic}.md`,
      command: 'git diff --check && git status --short',
      language: 'markdown',
    };
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
    const secondaryToggle = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-secondary-toggle]');
    if (secondaryToggle) {
      const section = secondaryToggle.closest<HTMLElement>('.lesson-section');
      const expanded = section?.classList.toggle('secondary-expanded') ?? false;
      secondaryToggle.setAttribute('aria-expanded', String(expanded));
      const label = secondaryToggle.querySelector('span');
      if (label) label.textContent = expanded ? 'Ocultar' : 'Mostrar';
      return;
    }
    const topicToggle = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-topic-toggle]');
    if (topicToggle) {
      const card = topicToggle.closest<HTMLElement>('.topic-card');
      const expanded = card?.classList.toggle('expanded') ?? false;
      topicToggle.setAttribute('aria-expanded', String(expanded));
      const label = topicToggle.querySelector('span');
      if (label) label.textContent = expanded ? 'Ocultar tema' : 'Abrir tema';
      return;
    }
    const wrapButton = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-wrap-code]');
    if (wrapButton) {
      const wrapper = wrapButton.closest<HTMLElement>('.code-example');
      const wrapped = wrapper?.classList.toggle('wrap-lines') ?? false;
      wrapButton.setAttribute('aria-pressed', String(wrapped));
      wrapButton.textContent = wrapped ? 'Sin ajuste' : 'Ajustar';
      return;
    }
    const topicButton = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-topic-check]');
    if (topicButton) {
      const index = Number(topicButton.dataset['topicCheck'] ?? 0);
      const card = topicButton.closest<HTMLElement>('.topic-card');
      const note = card?.querySelector<HTMLTextAreaElement>('[data-practice-note]')?.value.trim() ?? '';
      topicButton.classList.toggle('done');
      topicButton.textContent = topicButton.classList.contains('done') ? 'Tema demostrado ✓' : 'Demostrar aprendizaje';
      localStorage.setItem(
        this.topicStorageKey(index, 'done'),
        String(topicButton.classList.contains('done')),
      );
      if (topicButton.classList.contains('done')) {
        this.progressService.recordLearningStep(this.trackId(), 'topic', this.learningStepKey(index));
        if (note.length >= 40) this.progressService.recordLearningStep(this.trackId(), 'practice', this.learningStepKey(index));
        this.completionMessage.set(note.length >= 40 ? '¡Tema y práctica registrados!' : '¡Tema registrado! La nota de práctica es opcional.');
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
      const label = toggle?.querySelector('span');
      if (label) label.textContent = 'Ocultar tema';
    }
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.replaceState(null, '', `#${id}`);
    this.activeTocId.set(id);
  }

  toggleComplete(): void {
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
