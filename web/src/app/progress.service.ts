import { Injectable, signal } from '@angular/core';

export interface TrackProgress {
  completedModules: number[];
  completedChallenges: Record<string, boolean>;
}

type ProgressState = Record<string, TrackProgress>;

const EMPTY_TRACK_PROGRESS: TrackProgress = { completedModules: [], completedChallenges: {} };
const STORAGE_KEY = 'academia-progress-v2';
const LEGACY_CLOUD_KEY = 'floci-academy-progress';

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
        cloud: {
          completedModules: legacy.completedModules ?? [],
          completedChallenges: legacy.completedChallenges ?? {},
        },
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
    return this.state()[trackId] ?? EMPTY_TRACK_PROGRESS;
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

  challengeKey(moduleId: number, challengeIndex: number): string {
    return `${moduleId}-${challengeIndex}`;
  }

  isChallengeComplete(trackId: string, moduleId: number, challengeIndex: number): boolean {
    return !!this.trackProgress(trackId).completedChallenges[this.challengeKey(moduleId, challengeIndex)];
  }

  toggleChallenge(trackId: string, moduleId: number, challengeIndex: number): void {
    const current = this.trackProgress(trackId);
    const key = this.challengeKey(moduleId, challengeIndex);
    this.state.update(s => ({
      ...s,
      [trackId]: { ...current, completedChallenges: { ...current.completedChallenges, [key]: !current.completedChallenges[key] } },
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
