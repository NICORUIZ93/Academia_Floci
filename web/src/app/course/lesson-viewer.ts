import { CommonModule } from '@angular/common';
import { Component, ElementRef, Injector, OnDestroy, afterNextRender, computed, effect, inject, signal, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BookOpen, Boxes, Check, CircleCheck, ChevronLeft, ChevronRight, Clock3, Code2, Copy, Database, Gauge, ListTree, LockKeyhole, LucideAngularModule, ShieldCheck, Trophy, Zap } from 'lucide-angular';
import mermaid from 'mermaid';
import { map } from 'rxjs';
import { Title } from '@angular/platform-browser';
import { findTrack } from '../course-data';
import { ContentService } from '../content.service';
import { ProgressService } from '../progress.service';
import { ThemeService } from '../theme.service';
import { findProjectBootstrap } from '../project-bootstrap';
import { projectFor } from '../learning-activities';
import { glossaryFor } from '../technical-glossary';

let mermaidInitialized = false;

export interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

const TRACK_OFFICIAL_SOURCES: Record<string, { label: string; url: string }> = {
  foundations: { label: 'Currículo oficial de MDN', url: 'https://developer.mozilla.org/en-US/curriculum/' },
  rutaflow: { label: 'Fundamentos web de MDN', url: 'https://developer.mozilla.org/en-US/docs/Learn_web_development' },
  javascript: { label: 'JavaScript en MDN', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide' },
  node: { label: 'Documentación de Node.js', url: 'https://nodejs.org/en/learn' },
  angular: { label: 'Tutoriales de Angular', url: 'https://angular.dev/tutorials' },
  react: { label: 'Aprende React', url: 'https://react.dev/learn' },
  java: { label: 'Aprende Java', url: 'https://dev.java/learn/' },
  'spring-boot': { label: 'Guías de Spring', url: 'https://spring.io/guides' },
  'kotlin-multiplatform': { label: 'Kotlin Multiplatform', url: 'https://kotlinlang.org/docs/multiplatform/get-started.html' },
  android: { label: 'Android con Compose', url: 'https://developer.android.com/courses/android-basics-compose/course' },
  ios: { label: 'Tutoriales de Apple', url: 'https://developer.apple.com/tutorials/app-dev-training' },
  flutter: { label: 'Aprende Flutter', url: 'https://docs.flutter.dev/learn' },
  devops: { label: 'Tutoriales de Kubernetes', url: 'https://kubernetes.io/docs/tutorials/' },
  cloud: { label: 'Floci AWS oficial', url: 'https://floci.io/aws/' },
};

const CLOUD_MODULE_SOURCES: Record<number, { label: string; url: string }> = {
  2: { label: 'Amazon S3', url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html' },
  3: { label: 'Amazon SQS', url: 'https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/welcome.html' },
  4: { label: 'Amazon DynamoDB', url: 'https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html' },
  5: { label: 'AWS Lambda', url: 'https://docs.aws.amazon.com/lambda/latest/dg/welcome.html' },
  6: { label: 'Amazon API Gateway', url: 'https://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html' },
  7: { label: 'AWS IAM', url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html' },
  10: { label: 'AWS Secrets Manager', url: 'https://docs.aws.amazon.com/secretsmanager/latest/userguide/intro.html' },
  11: { label: 'Amazon EventBridge', url: 'https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-what-is.html' },
  12: { label: 'Amazon CloudWatch', url: 'https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/WhatIsCloudWatch.html' },
  13: { label: 'Amazon RDS', url: 'https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Welcome.html' },
  14: { label: 'Amazon ECS', url: 'https://docs.aws.amazon.com/AmazonECS/latest/developerguide/Welcome.html' },
  15: { label: 'AWS CloudFormation', url: 'https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/Welcome.html' },
  16: { label: 'AWS Step Functions', url: 'https://docs.aws.amazon.com/step-functions/latest/dg/welcome.html' },
  17: { label: 'Amazon Kinesis', url: 'https://docs.aws.amazon.com/streams/latest/dev/introduction.html' },
  18: { label: 'Amazon Cognito', url: 'https://docs.aws.amazon.com/cognito/latest/developerguide/what-is-amazon-cognito.html' },
  19: { label: 'Amazon Athena', url: 'https://docs.aws.amazon.com/athena/latest/ug/what-is.html' },
  20: { label: 'Amazon Bedrock', url: 'https://docs.aws.amazon.com/bedrock/latest/userguide/what-is-bedrock.html' },
  21: { label: 'Amazon EC2', url: 'https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/concepts.html' },
  22: { label: 'Elastic Load Balancing', url: 'https://docs.aws.amazon.com/elasticloadbalancing/latest/userguide/what-is-load-balancing.html' },
  23: { label: 'Amazon ElastiCache', url: 'https://docs.aws.amazon.com/AmazonElastiCache/latest/dg/WhatIs.html' },
  24: { label: 'AWS CodeBuild', url: 'https://docs.aws.amazon.com/codebuild/latest/userguide/welcome.html' },
  25: { label: 'AWS Config', url: 'https://docs.aws.amazon.com/config/latest/developerguide/WhatIsConfig.html' },
  26: { label: 'Amazon Data Firehose', url: 'https://docs.aws.amazon.com/firehose/latest/dev/what-is-this-service.html' },
  27: { label: 'AWS AppSync', url: 'https://docs.aws.amazon.com/appsync/latest/devguide/what-is-appsync.html' },
  28: { label: 'Amazon Neptune', url: 'https://docs.aws.amazon.com/neptune/latest/userguide/intro.html' },
  29: { label: 'AWS Cost Explorer', url: 'https://docs.aws.amazon.com/cost-management/latest/userguide/ce-what-is.html' },
  30: { label: 'AWS Transfer Family', url: 'https://docs.aws.amazon.com/transfer/latest/userguide/what-is-aws-transfer-family.html' },
  34: { label: 'Floci AWS oficial', url: 'https://floci.io/aws/' },
};

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
 * capítulo/módulo anterior y siguiente. Las prácticas verificables ofrecen
 * feedback local, sin quizzes ni paneles de gamificación.
 */
@Component({
  selector: 'app-lesson-viewer',
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './lesson-viewer.html',
  styleUrl: './lesson-viewer.scss',
})
export class LessonViewerComponent implements OnDestroy {
  readonly icons = { BookOpen, Boxes, Check, ChevronLeft, ChevronRight, CircleCheck, Clock3, Code2, Copy, Database, Gauge, ListTree, LockKeyhole, ShieldCheck, Trophy, Zap };

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly contentService = inject(ContentService);
  readonly progressService = inject(ProgressService);

  readonly trackId = toSignal(
    this.route.parent!.paramMap.pipe(map(params => params.get('trackId') ?? '')),
    { initialValue: this.route.parent?.snapshot.paramMap.get('trackId') ?? '' },
  );
  readonly moduleId = toSignal(
    this.route.paramMap.pipe(map(params => Number(params.get('moduleId') ?? 0))),
    { initialValue: Number(this.route.snapshot.paramMap.get('moduleId') ?? 0) },
  );
  private readonly requestedFragment = toSignal(this.route.fragment, {
    initialValue: this.route.snapshot.fragment,
  });

  readonly track = computed(() => findTrack(this.trackId()));
  readonly module = computed(() => this.track()?.modules.find(m => m.id === this.moduleId()));
  readonly officialSource = computed(() => this.trackId() === 'cloud'
    ? (CLOUD_MODULE_SOURCES[this.moduleId()] ?? TRACK_OFFICIAL_SOURCES['cloud'])
    : TRACK_OFFICIAL_SOURCES[this.trackId()]);
  readonly projectBootstrap = computed(() => findProjectBootstrap(this.trackId()));
  readonly trackProject = computed(() => projectFor(this.trackId()));
  readonly showProjectBootstrap = computed(() => this.moduleId() === 0 && Boolean(this.projectBootstrap()));
  readonly showTrackProject = computed(() => {
    const track = this.track();
    return Boolean(this.trackProject()) && this.moduleIndex() === (track?.modules.length ?? 0) - 1;
  });
  readonly moduleIndex = computed(() => this.track()?.modules.findIndex(m => m.id === this.moduleId()) ?? -1);
  readonly chapterPrerequisite = computed(() => {
    const track = this.track();
    const index = this.moduleIndex();
    return track && index > 0 ? track.modules[index - 1] : null;
  });
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
  readonly chapterAnnouncement = computed(() => {
    const track = this.track();
    const module = this.module();
    return track && module ? `Capítulo ${this.moduleIndex() + 1} de ${track.modules.length}: ${module.title}` : '';
  });

  readonly lessonHtml = signal<string | null>(null);
  readonly lessonLoading = signal(true);
  readonly lessonError = signal<string | null>(null);
  private readonly lessonContent = viewChild<ElementRef<HTMLElement>>('lessonContent');
  private readonly injector = inject(Injector);
  private readonly themeService = inject(ThemeService);
  private readonly titleService = inject(Title);

  readonly tocItems = signal<TocItem[]>([]);
  readonly activeTocId = signal<string | null>(null);
  readonly readingProgress = signal(0);
  readonly copiedCode = signal<string | null>(null);
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
      const announcement = this.chapterAnnouncement();
      if (announcement) this.titleService.setTitle(`${announcement} · Academia Floci`);
    });
    effect(() => {
      const trackId = this.trackId();
      const module = this.module();
      if (!module) return;
      this.lessonLoading.set(true);
      this.lessonError.set(null);
      this.lessonHtml.set(null);
      this.contentService.loadLessonHtml(trackId, module.id).then(html => {
        this.lessonHtml.set(html);
        this.lessonLoading.set(false);
      }).catch(error => {
        this.lessonError.set(error instanceof Error ? error.message : 'No pudimos cargar la lección.');
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

  retryLesson(): void {
    const trackId = this.trackId();
    const module = this.module();
    if (!module) return;
    this.lessonLoading.set(true);
    this.lessonError.set(null);
    this.contentService.loadLessonHtml(trackId, module.id)
      .then(html => this.lessonHtml.set(html))
      .catch(error => this.lessonError.set(error instanceof Error ? error.message : 'No pudimos cargar la lección.'))
      .finally(() => this.lessonLoading.set(false));
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

    this.enhanceEducationalContent(container);
    this.enhanceVerifiableExercises(container);
    this.buildTableOfContents(container);
    this.addTopicNavigation(Array.from(container.querySelectorAll<HTMLHeadingElement>('h3.topic-heading')));
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
      const previous = pre.previousElementSibling;
      const previousText = previous?.matches('p, li') ? previous.textContent?.trim() ?? '' : '';
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
    this.annotateTechnicalTerms(container);
  }

  private enhanceVerifiableExercises(container: HTMLElement): void {
    const headings = Array.from(container.querySelectorAll<HTMLHeadingElement>('h4'))
      .filter(heading => /^Ejercicio verificable\s+\d+/i.test(heading.textContent?.trim() ?? ''));
    headings.forEach((heading, index) => {
      if (heading.closest('.verifiable-exercise')) return;
      const answerParagraph = this.findExerciseAnswer(heading);
      const answerText = answerParagraph?.textContent?.replace(/^Respuesta esperada:\s*/i, '').trim();
      if (!answerParagraph || !answerText) return;

      const exerciseId = heading.id || `ejercicio-${index + 1}`;
      heading.id = exerciseId;
      const card = document.createElement('section');
      card.className = 'verifiable-exercise';
      card.dataset['exerciseId'] = exerciseId;
      card.dataset['answers'] = answerText;
      heading.parentNode?.insertBefore(card, heading);
      let node: Node | null = heading;
      while (node && (node === heading || !(node instanceof HTMLHeadingElement && ['H2', 'H3', 'H4'].includes(node.tagName)))) {
        const next: Node | null = node.nextSibling;
        card.appendChild(node);
        node = next;
      }
      answerParagraph.hidden = true;
      const completed = this.progressService.isExerciseComplete(this.trackId(), this.moduleId(), exerciseId);
      const controls = document.createElement('div');
      controls.className = 'exercise-controls';
      controls.innerHTML = `
        <label for="answer-${escapeHtml(exerciseId)}">Tu respuesta</label>
        <div><input id="answer-${escapeHtml(exerciseId)}" type="text" autocomplete="off" spellcheck="false" ${completed ? 'disabled' : ''}><button type="button" data-verify-exercise ${completed ? 'disabled' : ''}>${completed ? 'Completado' : 'Verificar'}</button></div>
        <p class="exercise-feedback ${completed ? 'correct' : ''}" role="status" aria-live="polite">${completed ? 'Correcto. Esta práctica ya quedó guardada.' : 'Escribe la salida o concepto solicitado y compruébalo.'}</p>`;
      card.appendChild(controls);
    });
  }

  private findExerciseAnswer(heading: HTMLHeadingElement): HTMLParagraphElement | null {
    let node = heading.nextElementSibling;
    while (node && !/^H[234]$/.test(node.tagName)) {
      if (node instanceof HTMLParagraphElement && /^Respuesta esperada:/i.test(node.textContent?.trim() ?? '')) return node;
      node = node.nextElementSibling;
    }
    return null;
  }

  private normalizeExerciseAnswer(value: string): string {
    return value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase().replace(/["'`]/g, '').replace(/\s+/g, ' ').trim();
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
      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'topic-toggle';
      toggle.dataset['topicToggle'] = String(index);
      toggle.setAttribute('aria-expanded', String(index === 0));
      toggle.innerHTML = `<span>${index === 0 ? 'Ocultar tema' : 'Abrir tema'}</span><span aria-hidden="true">⌄</span>`;
      heading.appendChild(toggle);
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
      this.addTopicLearningSupport(body, heading);
    });
  }

  private addTopicNavigation(headings: HTMLHeadingElement[]): void {
    headings.forEach((heading, index) => {
      const card = heading.closest<HTMLElement>('.topic-card');
      const body = card?.querySelector<HTMLElement>(':scope > .topic-body');
      if (!body || body.querySelector('.topic-step-navigation')) return;
      const navigation = document.createElement('nav');
      navigation.className = 'topic-step-navigation';
      navigation.setAttribute('aria-label', `Navegación del tema ${index + 1}`);
      const previous = index > 0 ? headings[index - 1] : null;
      const next = index < headings.length - 1 ? headings[index + 1] : null;
      navigation.innerHTML = `
        ${previous ? `<a href="#${escapeHtml(previous.id)}" data-topic-destination="${escapeHtml(previous.id)}"><span>← Anterior</span><small>${escapeHtml(this.topicTitle(previous))}</small></a>` : '<span></span>'}
        <strong>Tema ${index + 1} de ${headings.length}</strong>
        ${next ? `<a href="#${escapeHtml(next.id)}" data-topic-destination="${escapeHtml(next.id)}"><span>Siguiente →</span><small>${escapeHtml(this.topicTitle(next))}</small></a>` : '<span></span>'}`;
      body.appendChild(navigation);
    });
  }

  private topicTitle(heading: HTMLElement): string {
    const copy = heading.cloneNode(true) as HTMLElement;
    copy.querySelectorAll('button').forEach(button => button.remove());
    return copy.textContent?.replace(/^Tema(?:\s+\d+)?\s*:\s*/i, '').trim() || 'Tema';
  }

  private annotateTechnicalTerms(container: HTMLElement): void {
    const terms = glossaryFor(this.trackId()).sort((a, b) => b.term.length - a.term.length);
    const inlineCode = Array.from(container.querySelectorAll<HTMLElement>('.topic-body code:not(pre code)'));
    inlineCode.forEach(code => {
      const value = code.textContent?.trim();
      if (!value || code.closest('.technical-term')) return;
      const match = terms.find(item => item.term.toLocaleLowerCase() === value.toLocaleLowerCase());
      if (!match) return;
      const definition = document.createElement('span');
      definition.className = 'technical-term';
      definition.tabIndex = 0;
      definition.setAttribute('role', 'definition');
      definition.setAttribute('aria-label', `${match.term}: ${match.definition}`);
      definition.dataset['definition'] = match.definition;
      code.parentNode?.insertBefore(definition, code);
      definition.appendChild(code);
    });
  }

  private addTopicLearningSupport(body: HTMLElement, heading: HTMLElement): void {
    const topic = heading.cloneNode(true) as HTMLElement;
    topic.querySelectorAll('button').forEach(button => button.remove());
    const topicName = topic.textContent?.replace(/^Tema(?:\s+\d+)?\s*:\s*/i, '').trim() || 'este concepto';

    if (!/¿Por qué es importante\?/i.test(body.textContent ?? '')) {
      const importance = document.createElement('p');
      importance.className = 'learning-callout importance-callout generated-learning-support';
      importance.innerHTML = `<strong>¿Por qué es importante?</strong> Comprender ${escapeHtml(topicName)} permite construir y verificar el entregable del capítulo: ${escapeHtml(this.module()?.deliverable ?? 'un resultado reproducible')}.`;
      body.insertBefore(importance, body.firstChild);
    }

    const editorialErrors = Array.from(body.querySelectorAll<HTMLParagraphElement>('p')).find(paragraph => /^(?:Errores comunes|Errores frecuentes|Fallos comunes|Fallos frecuentes):/i.test(paragraph.textContent?.trim() ?? ''));
    if (editorialErrors) {
      const parent = editorialErrors.parentNode;
      const details = document.createElement('details');
      details.className = 'topic-troubleshooting editorial-troubleshooting generated-learning-support';
      const summary = document.createElement('summary');
      summary.textContent = 'Errores comunes y cómo diagnosticarlos';
      parent?.insertBefore(details, editorialErrors);
      details.append(summary, editorialErrors);
      return;
    }
    const language = body.querySelector<HTMLElement>('.code-example')?.dataset['language'] ?? 'concept';
    const profiles: Record<string, string[]> = {
      terminal: ['Ejecutar el comando desde una carpeta diferente a la indicada.', 'Continuar después del primer error y perder su causa original.', 'Usar credenciales, puertos o variables de otro entorno sin comprobarlos.'],
      web: ['Crear el archivo en una ruta que no coincide con la importación.', 'Confiar en datos externos sin validar estados de carga, vacío y error.', 'Cambiar estado o efectos sin comprobar cuándo vuelve a renderizar la interfaz.'],
      jvm: ['Compilar con una versión de JDK distinta a la declarada por el proyecto.', 'Usar una anotación o dependencia sin comprender qué registra en el contenedor.', 'Bloquear un flujo concurrente o reactivo con una llamada síncrona.'],
      mobile: ['Probar solo el caso con permiso concedido y conexión disponible.', 'Ignorar ciclo de vida, restauración de estado o cancelación de tareas.', 'Validar en un único dispositivo sin revisar batería, accesibilidad y tamaños.'],
      concept: [`Memorizar ${topicName} sin relacionarlo con una entrada y una salida.`, 'Aceptar una ejecución exitosa como evidencia suficiente sin provocar un fallo.', 'Aplicar una abstracción antes de identificar qué responsabilidad o cambio resuelve.'],
    };
    const profile = /bash|sh|shell|console|powershell|zsh/.test(language) ? 'terminal'
      : /js|javascript|ts|typescript|jsx|tsx|html|css|scss/.test(language) ? 'web'
      : /java|kotlin|xml/.test(language) ? 'jvm'
      : /swift|dart/.test(language) ? 'mobile'
      : 'concept';
    const details = document.createElement('details');
    details.className = 'topic-troubleshooting generated-learning-support';
    details.innerHTML = `<summary>Errores comunes y cómo diagnosticarlos</summary><ol>${profiles[profile].map(error => `<li>${escapeHtml(error)}</li>`).join('')}</ol><p>Corrige un elemento a la vez, repite el comando y conserva la salida antes y después.</p>`;
    body.appendChild(details);
  }

  async copyCode(event: Event): Promise<void> {
    const verifyButton = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-verify-exercise]');
    if (verifyButton) {
      const card = verifyButton.closest<HTMLElement>('.verifiable-exercise');
      const input = card?.querySelector<HTMLInputElement>('input');
      const feedback = card?.querySelector<HTMLElement>('.exercise-feedback');
      const accepted = (card?.dataset['answers'] ?? '').split('|').map(answer => this.normalizeExerciseAnswer(answer));
      const response = this.normalizeExerciseAnswer(input?.value ?? '');
      const correct = Boolean(response) && accepted.includes(response);
      if (feedback) {
        feedback.classList.toggle('correct', correct);
        feedback.classList.toggle('incorrect', !correct);
        feedback.textContent = correct
          ? 'Correcto. Compara tu respuesta con la ejecución y continúa.'
          : 'Todavía no coincide. Ejecuta el ejemplo, observa la salida y vuelve a intentarlo.';
      }
      if (correct && card && input) {
        this.progressService.completeExercise(this.trackId(), this.moduleId(), card.dataset['exerciseId'] ?? 'ejercicio');
        input.disabled = true;
        verifyButton.disabled = true;
        verifyButton.textContent = 'Completado';
      }
      return;
    }
    const topicDestination = (event.target as HTMLElement).closest<HTMLAnchorElement>('[data-topic-destination]');
    if (topicDestination) {
      event.preventDefault();
      const id = topicDestination.dataset['topicDestination'];
      const destination = id ? document.getElementById(id) : null;
      const card = destination?.closest<HTMLElement>('.topic-card');
      if (destination && card) {
        card.classList.add('expanded');
        const toggle = card.querySelector<HTMLButtonElement>('[data-topic-toggle]');
        toggle?.setAttribute('aria-expanded', 'true');
        const label = toggle?.querySelector('span');
        if (label) label.textContent = 'Ocultar tema';
        const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
        destination.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        history.replaceState(null, '', `#${id}`);
      }
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

  private buildTableOfContents(container: HTMLElement): void {
    this.tocObserver?.disconnect();
    // El índice muestra la estructura pedagógica principal. Los subtítulos
    // internos (Windows, macOS, pasos, etc.) permanecen en la lectura, pero no
    // compiten con capítulos y temas en una navegación ya extensa.
    const headings = Array.from(container.querySelectorAll<HTMLElement>('h2, h3.topic-heading'));
    const seen = new Set<string>();
    const items: TocItem[] = headings.map(el => {
      const level = el.tagName === 'H2' ? 2 : 3;
      const label = el.cloneNode(true) as HTMLElement;
      label.querySelectorAll('button').forEach(button => button.remove());
      const text = label.textContent?.trim() ?? '';
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
      target?.scrollIntoView({ behavior: this.scrollBehavior(), block: 'start' });
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
    target.scrollIntoView({ behavior: this.scrollBehavior(), block: 'start' });
    history.replaceState(null, '', `#${id}`);
    this.activeTocId.set(id);
  }

  private scrollBehavior(): ScrollBehavior {
    return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
  }


  toggleComplete(): void {
    this.progressService.toggleModuleComplete(this.trackId(), this.moduleId());
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
