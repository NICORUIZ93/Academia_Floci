import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CircleCheck, ChevronLeft, ChevronRight, LucideAngularModule } from 'lucide-angular';
import { map } from 'rxjs';
import { findTrack } from '../course-data';
import { ContentService } from '../content.service';
import { ProgressService } from '../progress.service';

type LessonTab = 'teoria' | 'retos' | 'preguntas';
type StudyLayer = { title: string; label: string; detail: string; items: string[] };

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

  readonly tab = signal<LessonTab>('teoria');
  readonly lessonHtml = signal<string | null>(null);
  readonly lessonLoading = signal(true);

  readonly isComplete = computed(() => this.progressService.isModuleComplete(this.trackId(), this.moduleId()));
  readonly studyLayers = computed<StudyLayer[]>(() => {
    const module = this.module();
    if (!module) return [];
    return [
      {
        title: '1. El qué',
        label: 'Conceptos que debes entender',
        detail: module.description,
        items: module.concepts.slice(0, 5),
      },
      {
        title: '2. El cómo',
        label: 'Primeras acciones prácticas',
        detail: 'Escribe los comandos o el código con tus manos. No copies sin leer.',
        items: module.challenges.slice(0, 4),
      },
      {
        title: '3. El por qué',
        label: 'Preguntas para razonar',
        detail: 'Estas preguntas evitan que aprendas de memoria sin entender decisiones técnicas.',
        items: module.questions.slice(0, 3),
      },
      {
        title: '4. El problema',
        label: 'Reto verificable',
        detail: 'Construye algo pequeño, rómpelo a propósito y documenta cómo lo arreglaste.',
        items: [module.deliverable],
      },
      {
        title: '5. El maestro',
        label: 'Explicación profesional',
        detail: 'Antes de marcar el módulo como completo, explica el tema como si estuvieras en una entrevista técnica.',
        items: ['Qué problema resuelve', 'Qué errores aparecen normalmente', 'Cuándo usarlo y cuándo no', 'Cómo lo probarías en un proyecto real'],
      },
    ];
  });

  constructor() {
    effect(() => {
      const trackId = this.trackId();
      const module = this.module();
      this.tab.set('teoria');
      if (!module) return;
      this.lessonLoading.set(true);
      this.contentService.loadLessonHtml(trackId, module.id).then(html => {
        this.lessonHtml.set(html);
        this.lessonLoading.set(false);
      });
    });
  }

  setTab(tab: LessonTab): void {
    this.tab.set(tab);
  }

  toggleComplete(): void {
    this.progressService.toggleModuleComplete(this.trackId(), this.moduleId());
  }

  toggleChallenge(challengeIndex: number): void {
    this.progressService.toggleChallenge(this.trackId(), this.moduleId(), challengeIndex);
  }

  isChallengeComplete(challengeIndex: number): boolean {
    return this.progressService.isChallengeComplete(this.trackId(), this.moduleId(), challengeIndex);
  }

  goToModule(moduleId: number): void {
    this.router.navigate(['/curso', this.trackId(), moduleId]);
  }
}
