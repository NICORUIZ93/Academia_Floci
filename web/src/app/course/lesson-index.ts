import { CommonModule } from '@angular/common';
import { Component, Input, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CircleQuestionMark, LucideAngularModule } from 'lucide-angular';
import { filter, map, startWith } from 'rxjs';
import { CourseModule, findTrack } from '../course-data';
import { ProgressService } from '../progress.service';

interface LevelGroup {
  level: CourseModule['level'];
  modules: CourseModule[];
}

export type ModuleStatus = 'done' | 'current' | 'pending';

const LEVEL_ORDER: CourseModule['level'][] = ['Fundamentos', 'Aplicación', 'Integración', 'Experto'];

@Component({
  selector: 'app-lesson-index',
  imports: [CommonModule, RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './lesson-index.html',
  styleUrl: './lesson-index.scss',
})
export class LessonIndexComponent {
  @Input({ required: true }) trackId!: string;
  readonly icons = { CircleQuestionMark };

  private readonly router = inject(Router);

  readonly track = computed(() => findTrack(this.trackId));

  readonly groups = computed<LevelGroup[]>(() => {
    const modules = this.track()?.modules ?? [];
    return LEVEL_ORDER
      .map(level => ({ level, modules: modules.filter(m => m.level === level) }))
      .filter(group => group.modules.length > 0);
  });

  /** Módulo actualmente abierto, derivado de la URL (/curso/:trackId/:moduleId). */
  private readonly currentModuleId = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(() => this.extractModuleId(this.router.url)),
      startWith(this.extractModuleId(this.router.url)),
    ),
    { initialValue: this.extractModuleId(this.router.url) },
  );

  constructor(readonly progressService: ProgressService) {}

  private extractModuleId(url: string): number | null {
    const match = url.match(/\/curso\/[^/]+\/(\d+)/);
    return match ? Number(match[1]) : null;
  }

  isDone(moduleId: number): boolean {
    return this.progressService.isModuleComplete(this.trackId, moduleId);
  }

  status(moduleId: number): ModuleStatus {
    if (this.isDone(moduleId)) return 'done';
    if (this.currentModuleId() === moduleId) return 'current';
    return 'pending';
  }
}
