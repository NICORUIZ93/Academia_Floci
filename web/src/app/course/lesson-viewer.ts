import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CircleCheck, ChevronLeft, ChevronRight, LucideAngularModule } from 'lucide-angular';
import { map } from 'rxjs';
import { findTrack } from '../course-data';
import { ContentService } from '../content.service';
import { ProgressService } from '../progress.service';

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
  private readonly sanitizer = inject(DomSanitizer);
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
  }

  sanitizedLesson(html: string) {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  toggleComplete(): void {
    this.progressService.toggleModuleComplete(this.trackId(), this.moduleId());
  }

  goToModule(moduleId: number): void {
    this.router.navigate(['/curso', this.trackId(), moduleId]);
  }
}
