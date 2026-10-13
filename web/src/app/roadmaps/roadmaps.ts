import { CommonModule } from '@angular/common';
import { Component, Injector, afterNextRender, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ThemeService } from '../theme.service';

interface RoadmapTopic {
  number: number;
  title: string;
}

interface RoadmapBlock {
  number: number;
  slug: string;
  title: string;
  topics: RoadmapTopic[];
}

interface RoadmapIndex {
  totalTopics: number;
  totalSteps: number;
  blocks: RoadmapBlock[];
}

const PROGRESS_KEY = 'academia-floci-roadmap-progress-v1';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseRoadmapIndex(value: unknown): RoadmapIndex {
  if (!isRecord(value) || !Array.isArray(value['blocks'])) {
    throw new Error('El índice de roadmaps tiene un formato inválido.');
  }

  const blocks = value['blocks'].map((block, index): RoadmapBlock => {
    if (!isRecord(block) || !Array.isArray(block['topics'])
      || typeof block['number'] !== 'number'
      || typeof block['slug'] !== 'string'
      || !/^[a-z0-9-]+$/.test(block['slug'])
      || typeof block['title'] !== 'string') {
      throw new Error(`El bloque ${index + 1} del índice de roadmaps tiene un formato inválido.`);
    }
    const topics = block['topics'].map((topic, topicIndex): RoadmapTopic => {
      if (!isRecord(topic) || typeof topic['number'] !== 'number' || typeof topic['title'] !== 'string') {
        throw new Error(`El tema ${topicIndex + 1} del bloque ${index + 1} tiene un formato inválido.`);
      }
      return { number: topic['number'], title: topic['title'] };
    });
    return {
      number: block['number'],
      slug: block['slug'],
      title: block['title'],
      topics,
    };
  });

  if (typeof value['totalTopics'] !== 'number' || typeof value['totalSteps'] !== 'number'
    || value['totalTopics'] !== 53 || value['totalSteps'] !== 1590
    || blocks.length !== 20 || blocks.reduce((sum, block) => sum + block.topics.length, 0) !== value['totalTopics']) {
    throw new Error('El índice de roadmaps no coincide con el currículo publicado.');
  }

  return { totalTopics: value['totalTopics'], totalSteps: value['totalSteps'], blocks };
}

@Component({
  selector: 'app-roadmaps',
  imports: [CommonModule, RouterLink],
  templateUrl: './roadmaps.html',
  styleUrl: './roadmaps.scss',
})
export class RoadmapsComponent {
  readonly themeService = inject(ThemeService);
  private readonly injector = inject(Injector);
  readonly index = signal<RoadmapIndex | null>(null);
  readonly selectedBlockNumber = signal(1);
  readonly renderedMarkdown = signal('');
  readonly loadedBlockSlug = signal<string | null>(null);
  readonly loading = signal(true);
  readonly blockLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly progressMessage = signal('');
  readonly completedSteps = signal<Record<string, boolean>>({});
  private blockRequest = 0;

  readonly selectedBlock = computed(() =>
    this.index()?.blocks.find(block => block.number === this.selectedBlockNumber()) ?? null
  );
  readonly completedCount = computed(() =>
    Object.values(this.completedSteps()).filter(Boolean).length
  );

  constructor() {
    effect(() => {
      const block = this.selectedBlock();
      const loadedSlug = this.loadedBlockSlug();
      const html = this.renderedMarkdown();
      if (!block || loadedSlug !== block.slug || !html) return;
      afterNextRender(() => this.activateChecklist(block), { injector: this.injector });
    });
    void this.loadIndex();
  }

  async selectBlock(number: number): Promise<void> {
    this.selectedBlockNumber.set(number);
    const block = this.index()?.blocks.find(item => item.number === number);
    if (block && this.loadedBlockSlug() !== block.slug) await this.loadBlock(block);
  }

  retry(): void {
    this.loading.set(true);
    this.error.set(null);
    void this.loadIndex();
  }

  private async loadIndex(): Promise<void> {
    try {
      const response = await fetch(new URL('roadmap-data/index.json', document.baseURI));
      if (!response.ok) throw new Error(`El índice respondió ${response.status}.`);
      const index = parseRoadmapIndex(await response.json() as unknown);
      this.index.set(index);
      this.restoreProgress();
      const firstBlock = index.blocks[0];
      if (!firstBlock) throw new Error('El índice de roadmaps no contiene bloques.');
      await this.loadBlock(firstBlock);
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'No se pudo cargar el índice de roadmaps.');
    } finally {
      this.loading.set(false);
    }
  }

  private async loadBlock(block: RoadmapBlock): Promise<void> {
    const request = ++this.blockRequest;
    this.blockLoading.set(true);
    this.error.set(null);
    this.loadedBlockSlug.set(null);
    try {
      const response = await fetch(new URL(`roadmap-data/${block.slug}.md`, document.baseURI));
      if (!response.ok) throw new Error(`El roadmap del bloque ${block.number} respondió ${response.status}.`);
      const markdown = await response.text();
      const { marked } = await import('marked');
      if (request !== this.blockRequest) return;
      const html = marked.parse(markdown, { async: false }) as string;
      this.renderedMarkdown.set(html.replace(/<input\b[^>]*type="checkbox"[^>]*>/g, '<span class="roadmap-step-control"></span>'));
      this.loadedBlockSlug.set(block.slug);
    } catch (error) {
      if (request === this.blockRequest) {
        this.error.set(error instanceof Error ? error.message : `No se pudo cargar el bloque ${block.number}.`);
      }
    } finally {
      if (request === this.blockRequest) this.blockLoading.set(false);
    }
  }

  private restoreProgress(): void {
    try {
      const saved = localStorage.getItem(PROGRESS_KEY);
      if (!saved) return;
      const parsed: unknown = JSON.parse(saved);
      if (!isRecord(parsed)) {
        throw new Error('El progreso guardado tiene un formato inválido.');
      }
      const progress: Record<string, boolean> = {};
      for (const [key, value] of Object.entries(parsed)) {
        if (typeof value !== 'boolean' || !/^\d+:\d+$/.test(key)) {
          throw new Error('El progreso guardado tiene un formato inválido.');
        }
        progress[key] = value;
      }
      this.completedSteps.set(progress);
    } catch (error) {
      this.progressMessage.set(error instanceof Error
        ? `No se pudo restaurar el progreso de roadmaps: ${error.message}`
        : 'No se pudo restaurar el progreso de roadmaps.');
    }
  }

  private activateChecklist(block: RoadmapBlock): void {
    const container = document.querySelector<HTMLElement>('.roadmap-content');
    if (!container || this.loadedBlockSlug() !== block.slug) return;

    for (const topic of block.topics) {
      const target = [...container.querySelectorAll<HTMLElement>('h2')]
        .find(item => item.textContent?.startsWith(`Tema ${topic.number}:`));
      if (!target) {
        this.error.set(`No se encontró el encabezado del tema ${topic.number} en el bloque ${block.number}.`);
        return;
      }
      target.id = `roadmap-topic-${topic.number}`;

      let sibling = target.nextElementSibling;
      let stepNumber = 0;
      while (sibling && sibling.tagName !== 'H2') {
        sibling.querySelectorAll<HTMLElement>('.roadmap-step-control').forEach(placeholder => {
          stepNumber += 1;
          const currentStep = stepNumber;
          const key = `${topic.number}:${stepNumber}`;
          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.checked = this.completedSteps()[key] ?? false;
          checkbox.setAttribute('aria-label', `Completar paso ${currentStep}: ${topic.title}`);
          checkbox.addEventListener('change', () => this.saveStep(checkbox, key, topic, currentStep));
          placeholder.replaceWith(checkbox);
        });
        sibling = sibling.nextElementSibling;
      }
      if (stepNumber !== 30) {
        this.error.set(`El tema «${topic.title}» tiene ${stepNumber} pasos; se esperaban 30.`);
        return;
      }
    }
  }

  private saveStep(checkbox: HTMLInputElement, key: string, topic: RoadmapTopic, stepNumber: number): void {
    const next = { ...this.completedSteps(), [key]: checkbox.checked };
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(next));
      this.completedSteps.set(next);
      const checked = Object.entries(next).filter(([itemKey, value]) =>
        value && itemKey.startsWith(`${topic.number}:`)
      ).length;
      this.progressMessage.set(`${checked} de 30 pasos completados en «${topic.title}».`);
    } catch (error) {
      checkbox.checked = !checkbox.checked;
      this.progressMessage.set(error instanceof Error
        ? `No se pudo guardar el progreso: ${error.message}`
        : `No se pudo guardar el paso ${stepNumber}.`);
    }
  }
}
