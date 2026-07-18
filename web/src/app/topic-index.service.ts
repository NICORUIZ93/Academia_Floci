import { Injectable, signal } from '@angular/core';

export interface IndexedTopic {
  title: string;
  fragment: string;
}

type TopicIndex = Record<string, Record<string, IndexedTopic[]>>;

@Injectable({ providedIn: 'root' })
export class TopicIndexService {
  private readonly index = signal<TopicIndex>({});
  private loading: Promise<void> | null = null;

  constructor() {
    void this.load();
  }

  topics(trackId: string, moduleId: number): IndexedTopic[] {
    return this.index()[trackId]?.[String(moduleId)] ?? [];
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
