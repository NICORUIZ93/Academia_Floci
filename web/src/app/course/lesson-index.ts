import { CommonModule } from '@angular/common';
import { Component, Input, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CircleCheck, LucideAngularModule } from 'lucide-angular';
import { CourseModule, findTrack } from '../course-data';
import { ProgressService } from '../progress.service';

interface LevelGroup {
  level: CourseModule['level'];
  modules: CourseModule[];
}

const LEVEL_ORDER: CourseModule['level'][] = ['Fundamentos', 'Aplicación', 'Integración', 'Experto'];

@Component({
  selector: 'app-lesson-index',
  imports: [CommonModule, RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './lesson-index.html',
  styleUrl: './lesson-index.scss',
})
export class LessonIndexComponent {
  readonly icons = { CircleCheck };

  @Input({ required: true }) trackId!: string;

  readonly track = computed(() => findTrack(this.trackId));

  readonly groups = computed<LevelGroup[]>(() => {
    const modules = this.track()?.modules ?? [];
    return LEVEL_ORDER
      .map(level => ({ level, modules: modules.filter(m => m.level === level) }))
      .filter(group => group.modules.length > 0);
  });

  constructor(readonly progressService: ProgressService) {}

  isDone(moduleId: number): boolean {
    return this.progressService.isModuleComplete(this.trackId, moduleId);
  }
}
