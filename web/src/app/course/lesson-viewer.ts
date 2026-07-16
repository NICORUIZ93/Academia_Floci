import { CommonModule } from '@angular/common';
import { Component, ElementRef, Injector, afterNextRender, computed, effect, inject, signal, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CircleCheck, ChevronLeft, ChevronRight, LucideAngularModule } from 'lucide-angular';
import mermaid from 'mermaid';
import { map } from 'rxjs';
import { findTrack } from '../course-data';
import { ContentService } from '../content.service';
import { ProgressService } from '../progress.service';
import { ThemeService } from '../theme.service';
import { applyLabVerification } from './lab-verification';

let mermaidInitialized = false;

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
export class LessonViewerComponent {
  readonly icons = { ChevronLeft, ChevronRight, CircleCheck };

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
  }

  toggleComplete(): void {
    this.progressService.toggleModuleComplete(this.trackId(), this.moduleId());
  }

  goToModule(moduleId: number): void {
    this.router.navigate(['/curso', this.trackId(), moduleId]);
  }
}
