import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CircleCheck, CircleX, LucideAngularModule, RotateCcw } from 'lucide-angular';
import { map } from 'rxjs';
import { findTrack } from '../course-data';
import { ProgressService } from '../progress.service';

/**
 * Cuestionario final de 10 preguntas, genérico para cualquier track (ver
 * Track.quiz en course-data.ts). Corrige en el cliente, sin backend: cada
 * track define sus propias preguntas pero el componente y su lógica de
 * puntuación se reutilizan sin cambios.
 */
@Component({
  selector: 'app-final-quiz',
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './final-quiz.html',
  styleUrl: './final-quiz.scss',
})
export class FinalQuizComponent {
  readonly icons = { CircleCheck, CircleX, RotateCcw };

  private readonly route = inject(ActivatedRoute);
  private readonly progressService = inject(ProgressService);

  private readonly trackId = toSignal(
    this.route.parent!.paramMap.pipe(map(params => params.get('trackId') ?? '')),
    { initialValue: this.route.parent?.snapshot.paramMap.get('trackId') ?? '' },
  );

  readonly track = computed(() => findTrack(this.trackId()));
  readonly questions = computed(() => this.track()?.quiz ?? []);

  readonly answers = signal<(number | null)[]>([]);
  readonly submitted = signal(false);

  constructor() {
    effect(() => {
      const total = this.questions().length;
      this.answers.set(new Array(total).fill(null));
      this.submitted.set(false);
    });
  }

  select(questionIndex: number, optionIndex: number): void {
    if (this.submitted()) return;
    this.answers.update(current => {
      const next = [...current];
      next[questionIndex] = optionIndex;
      return next;
    });
  }

  readonly allAnswered = computed(() => this.answers().every(a => a !== null));

  readonly score = computed(() => {
    const questions = this.questions();
    const answers = this.answers();
    return questions.reduce((total, q, i) => (answers[i] === q.answer ? total + 1 : total), 0);
  });

  isCorrect(questionIndex: number): boolean {
    const question = this.questions()[questionIndex];
    return question ? this.answers()[questionIndex] === question.answer : false;
  }

  submit(): void {
    if (!this.allAnswered()) return;
    this.submitted.set(true);
    this.progressService.recordQuizScore(this.trackId(), this.score());
  }

  retry(): void {
    this.answers.set(new Array(this.questions().length).fill(null));
    this.submitted.set(false);
  }
}
