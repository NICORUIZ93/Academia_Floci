import { Injectable, computed, signal } from '@angular/core';

export interface IndexedTopic {
  title: string;
  fragment: string;
}

type TopicIndex = Record<string, Record<string, IndexedTopic[]>>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isIndexedTopic(value: unknown): value is IndexedTopic {
  return isRecord(value) && typeof value['title'] === 'string' && typeof value['fragment'] === 'string';
}

function parseTopicIndex(value: unknown): TopicIndex {
  if (!isRecord(value)) throw new Error('El índice de temas tiene un formato inválido.');

  const index: TopicIndex = {};
  for (const [trackId, modules] of Object.entries(value)) {
    if (!isRecord(modules)) throw new Error('El índice de temas tiene un formato inválido.');
    const parsedModules: Record<string, IndexedTopic[]> = {};
    for (const [moduleId, topics] of Object.entries(modules)) {
      if (!Array.isArray(topics) || !topics.every(isIndexedTopic)) {
        throw new Error('El índice de temas tiene un formato inválido.');
      }
      parsedModules[moduleId] = topics.map(topic => ({
        title: topic.title,
        fragment: topic.fragment,
      }));
    }
    index[trackId] = parsedModules;
  }

  return index;
}

@Injectable({ providedIn: 'root' })
export class TopicIndexService {
  private readonly index = signal<TopicIndex>({});
  readonly data = this.index.asReadonly();
  readonly loadError = signal<string | null>(null);
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

  retry(): void {
    this.loading = null;
    this.index.set({});
    this.loadError.set(null);
    void this.load();
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
      .then(response => {
        if (!response.ok) throw new Error(`El índice de temas respondió ${response.status}.`);
        return response.json() as Promise<unknown>;
      })
      .then(parseTopicIndex)
      .then(index => this.index.set(index))
      .catch(error => {
        this.index.set({});
        this.loadError.set(error instanceof Error ? error.message : 'No se pudo cargar el índice de temas.');
      });
    return this.loading;
  }
}
