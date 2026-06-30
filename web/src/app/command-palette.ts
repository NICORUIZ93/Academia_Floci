import { CommonModule } from '@angular/common';
import { Component, HostListener, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule, Search, X } from 'lucide-angular';
import { TRACKS } from './course-data';
import { CommandPaletteService } from './command-palette.service';

interface SearchEntry {
  label: string;
  sublabel: string;
  keywords: string;
  route: string[];
}

const isMac = typeof navigator !== 'undefined' && /mac/i.test(navigator.platform ?? navigator.userAgent ?? '');

@Component({
  selector: 'app-command-palette',
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './command-palette.html',
  styleUrl: './command-palette.scss',
})
export class CommandPaletteComponent {
  readonly icons = { Search, X };
  readonly shortcutLabel = isMac ? '⌘K' : 'Ctrl+K';
  readonly query = signal('');

  private readonly index: SearchEntry[] = TRACKS.flatMap(track => {
    if (track.id === 'cloud') {
      return [{ label: track.name, sublabel: `Curso completo · ${track.modules.length} módulos`, keywords: track.tagline, route: ['/curso', 'cloud'] }];
    }
    return [
      { label: track.name, sublabel: `Curso completo · ${track.modules.length} módulos`, keywords: track.tagline, route: ['/curso', track.id] },
      ...track.modules.map(module => ({
        label: module.title,
        sublabel: `${track.name} · ${module.level}`,
        keywords: module.concepts.join(' '),
        route: ['/curso', track.id, String(module.id)],
      })),
    ];
  });

  readonly results = computed<SearchEntry[]>(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) return this.index.slice(0, 8);
    return this.index
      .filter(entry => `${entry.label} ${entry.sublabel} ${entry.keywords}`.toLowerCase().includes(q))
      .slice(0, 20);
  });

  constructor(
    readonly paletteService: CommandPaletteService,
    private readonly router: Router,
  ) {}

  @HostListener('window:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.paletteService.toggle();
      this.query.set('');
    } else if (event.key === 'Escape' && this.paletteService.isOpen()) {
      this.paletteService.close();
    }
  }

  select(entry: SearchEntry): void {
    this.router.navigate(entry.route);
    this.paletteService.close();
    this.query.set('');
  }

  close(): void {
    this.paletteService.close();
  }
}
