import { Injectable, computed, signal } from '@angular/core';

export interface IndexedTopic {
  title: string;
  fragment: string;
}

type TopicIndex = Record<string, Record<string, IndexedTopic[]>>;

@Injectable({ providedIn: 'root' })
export class TopicIndexService {
  private readonly index = signal<TopicIndex>({});
  readonly data = this.index.asReadonly();
  readonly totalTopics = computed(() =>
    Object.values(this.index()).reduce(
      (total, modules) => total + Object.values(modules).reduce((subtotal, topics) => subtotal + topics.length, 0),
      0,
    )
  );
  private loading: Promise<void> | null = null;

  constructor() {
    void this.load();
  }

  topics(trackId: string, moduleId: number): IndexedTopic[] {
    return this.index()[trackId]?.[String(moduleId)] ?? [];
  }

  allTopics(): Array<IndexedTopic & { trackId: string; moduleId: number }> {
    return Object.entries(this.index()).flatMap(([trackId, modules]) =>
      Object.entries(modules).flatMap(([moduleId, topics]) =>
        topics.map(topic => ({ ...topic, trackId, moduleId: Number(moduleId) })),
      ),
    );
  }

  private load(): Promise<void> {
    if (this.loading) return this.loading;
    this.loading = fetch(new URL('content/topic-index.json', document.baseURI))
      .then(response => response.ok ? response.json() as Promise<TopicIndex> : {})
      .then(index => this.index.set(index))
      .catch(() => this.index.set({}));
    return this.loading;
  }
}
