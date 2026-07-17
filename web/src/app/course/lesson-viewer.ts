import { CommonModule } from '@angular/common';
import { Component, ElementRef, Injector, OnDestroy, afterNextRender, computed, effect, inject, signal, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BookOpen, Check, CircleCheck, ChevronLeft, ChevronRight, Clock3, Code2, Copy, ListTree, LucideAngularModule } from 'lucide-angular';
import mermaid from 'mermaid';
import { map } from 'rxjs';
import { findTrack } from '../course-data';
import { ContentService } from '../content.service';
import { ProgressService } from '../progress.service';
import { ThemeService } from '../theme.service';
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
  readonly icons = { BookOpen, Check, ChevronLeft, ChevronRight, CircleCheck, Clock3, Code2, Copy, ListTree };

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

  readonly track = computed(() => findTrack(this.trackId()));
  readonly module = computed(() => this.track()?.modules.find(m => m.id === this.moduleId()));
  readonly moduleIndex = computed(() => this.track()?.modules.findIndex(m => m.id === this.moduleId()) ?? -1);
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

    applyLabVerification(container);
    this.enhanceEducationalContent(container);
    this.buildTableOfContents(container);
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
    });

    container.querySelectorAll('pre:not(.mermaid)').forEach((pre, index) => {
      if (pre.parentElement?.classList.contains('code-example')) return;
      const code = pre.querySelector('code');
      const languageClass = Array.from(code?.classList ?? []).find(name => name.startsWith('language-'));
      const language = languageClass?.replace('language-', '') || 'código';
      const wrapper = document.createElement('div');
      wrapper.className = 'code-example';
      wrapper.innerHTML = `<div class="code-example-bar"><span>${language}</span><button type="button" data-copy-code="${index}" aria-label="Copiar bloque de código">Copiar</button></div>`;
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
    container.querySelectorAll<HTMLHeadingElement>('h3.topic-heading').forEach((heading, index) => {
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
      action.textContent = savedDone ? 'Tema entendido ✓' : 'Marcar tema entendido';
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
      }
      if (!card.textContent?.includes('Diagrama:') && !card.querySelector('pre.mermaid')) {
        const visual = document.createElement('figure');
        visual.className = 'concept-flow';
        visual.innerHTML = `<figcaption>Mapa mental del tema</figcaption><div><span><small>Concepto</small>${title}</span><b>→</b><span><small>Aplicación</small>Resolver una necesidad concreta</span><b>→</b><span><small>Evidencia</small>Comprobar el resultado</span></div>`;
        card.appendChild(visual);
      }
      card.appendChild(practice);
      card.appendChild(action);
    });
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
    const topicButton = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-topic-check]');
    if (topicButton) {
      topicButton.classList.toggle('done');
      topicButton.textContent = topicButton.classList.contains('done') ? 'Tema entendido ✓' : 'Marcar tema entendido';
      localStorage.setItem(
        this.topicStorageKey(Number(topicButton.dataset['topicCheck'] ?? 0), 'done'),
        String(topicButton.classList.contains('done')),
      );
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

  scrollToHeading(event: Event, id: string): void {
    event.preventDefault();
    const target = this.lessonContent()?.nativeElement.querySelector(`#${CSS.escape(id)}`);
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.replaceState(null, '', `#${id}`);
    this.activeTocId.set(id);
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
