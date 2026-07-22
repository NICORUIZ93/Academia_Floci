import { Injectable, signal } from '@angular/core';

export interface TrackProgress {
  completedModules: number[];
  completedExercises: string[];
}

type ProgressState = Record<string, TrackProgress>;

const EMPTY_TRACK_PROGRESS: TrackProgress = { completedModules: [], completedExercises: [] };
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
        cloud: { completedModules: legacy.completedModules ?? [], completedExercises: [] },
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

  isExerciseComplete(trackId: string, moduleId: number, exerciseId: string): boolean {
    return this.trackProgress(trackId).completedExercises.includes(`${moduleId}:${exerciseId}`);
  }

  completeExercise(trackId: string, moduleId: number, exerciseId: string): void {
    const current = this.trackProgress(trackId);
    const key = `${moduleId}:${exerciseId}`;
    if (current.completedExercises.includes(key)) return;
    this.state.update(state => ({
      ...state,
      [trackId]: { ...current, completedExercises: [...current.completedExercises, key] },
    }));
    this.persist();
  }

  nextPendingModuleId(trackId: string, totalModules: number): number {
    const completed = this.trackProgress(trackId).completedModules;
    for (let id = 0; id < totalModules; id++) {
      if (!completed.includes(id)) return id;
    }
    return Math.max(0, totalModules - 1);
  }
}
