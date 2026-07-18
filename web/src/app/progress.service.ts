import { Injectable, signal } from '@angular/core';

export interface TrackProgress {
  completedModules: number[];
  studyDates?: string[];
  bestQuizScore?: number;
}

export interface LearningStats {
  completedModules: number;
  xp: number;
  streak: number;
  level: 'Básico' | 'Intermedio' | 'Avanzado' | 'Master';
  badge: 'Inicio' | 'Explorador' | 'Constructor' | 'Arquitecto' | 'Maestro';
  bestQuizScore: number;
}

type ProgressState = Record<string, TrackProgress>;

const EMPTY_TRACK_PROGRESS: TrackProgress = { completedModules: [] };
const STORAGE_KEY = 'academia-progress-v2';
const LEGACY_CLOUD_KEY = 'cloud-local-academy-progress';

@Injectable({ providedIn: 'root' })
export class ProgressService {
  private state = signal<ProgressState>(this.loadInitialState());

  private loadInitialState(): ProgressState {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as ProgressState;
    } catch {
      // localStorage corrupto: se ignora y se continúa con estado vacío
    }
    return this.migrateLegacyCloudProgress();
  }

  /** Migra una sola vez el progreso pre-existente (solo Cloud) al nuevo esquema multi-track. */
  private migrateLegacyCloudProgress(): ProgressState {
    try {
      const legacyRaw = localStorage.getItem(LEGACY_CLOUD_KEY);
      if (!legacyRaw) return {};
      const legacy = JSON.parse(legacyRaw) as Partial<TrackProgress>;
      const migrated: ProgressState = {
        cloud: { completedModules: legacy.completedModules ?? [] },
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      return migrated;
    } catch {
      return {};
    }
  }

  private persist(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state()));
  }

  trackProgress(trackId: string): TrackProgress {
    return { ...EMPTY_TRACK_PROGRESS, ...(this.state()[trackId] ?? {}) };
  }

  isModuleComplete(trackId: string, moduleId: number): boolean {
    return this.trackProgress(trackId).completedModules.includes(moduleId);
  }

  percentComplete(trackId: string, totalModules: number): number {
    if (!totalModules) return 0;
    return Math.round((this.trackProgress(trackId).completedModules.length / totalModules) * 100);
  }

  toggleModuleComplete(trackId: string, moduleId: number): void {
    const current = this.trackProgress(trackId);
    const completedModules = current.completedModules.includes(moduleId)
      ? current.completedModules.filter(id => id !== moduleId)
      : [...current.completedModules, moduleId];
    this.state.update(s => ({ ...s, [trackId]: { ...current, completedModules } }));
    this.persist();
  }

  recordStudyDay(trackId: string): void {
    const current = this.trackProgress(trackId);
    const today = new Date().toISOString().slice(0, 10);
    const studyDates = current.studyDates ?? [];
    if (studyDates.includes(today)) return;
    this.state.update(state => ({ ...state, [trackId]: { ...current, studyDates: [...studyDates, today] } }));
    this.persist();
  }

  recordQuizScore(trackId: string, score: number): void {
    const current = this.trackProgress(trackId);
    if ((current.bestQuizScore ?? 0) >= score) return;
    this.state.update(state => ({ ...state, [trackId]: { ...current, bestQuizScore: score } }));
    this.persist();
  }

  learningStats(trackId: string, totalModules: number): LearningStats {
    const progress = this.trackProgress(trackId);
    const completed = progress.completedModules.length;
    const bestQuizScore = progress.bestQuizScore ?? 0;
    const xp = completed * 50 + bestQuizScore * 10;
    const ratio = totalModules ? completed / totalModules : 0;
    const level = ratio >= 1 ? 'Master' : ratio >= .66 ? 'Avanzado' : ratio >= .33 ? 'Intermedio' : 'Básico';
    const badge = completed >= totalModules && totalModules > 0 ? 'Maestro' : completed >= 6 ? 'Arquitecto' : completed >= 3 ? 'Constructor' : completed >= 1 ? 'Explorador' : 'Inicio';
    return { completedModules: completed, xp, streak: this.calculateStreak(progress.studyDates ?? []), level, badge, bestQuizScore };
  }

  private calculateStreak(dates: string[]): number {
    const studied = new Set(dates);
    const cursor = new Date();
    let streak = 0;
    while (studied.has(cursor.toISOString().slice(0, 10))) {
      streak += 1;
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    }
    return streak;
  }

  nextPendingModuleId(trackId: string, totalModules: number): number {
    const completed = this.trackProgress(trackId).completedModules;
    for (let id = 0; id < totalModules; id++) {
      if (!completed.includes(id)) return id;
    }
    return Math.max(0, totalModules - 1);
  }
}
