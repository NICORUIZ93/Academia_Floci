import { computed, Injectable, signal } from '@angular/core';

export interface RouteSummary {
  readonly routeId: string;
  readonly driverName: string;
  readonly pendingStops: number;
  readonly delayedStops: number;
}

type LoadState =
  | { readonly kind: 'loading' }
  | { readonly kind: 'ready'; readonly routes: readonly RouteSummary[] }
  | { readonly kind: 'error'; readonly message: string };

@Injectable({ providedIn: 'root' })
export class OperationsStore {
  readonly state = signal<LoadState>({ kind: 'loading' });
  readonly delayedRoutes = computed(() => {
    const current = this.state();
    return current.kind === 'ready'
      ? current.routes.filter(route => route.delayedStops > 0)
      : [];
  });

  replaceRoutes(routes: readonly RouteSummary[]): void {
    this.state.set({ kind: 'ready', routes: [...routes] });
  }

  reportFailure(message: string): void {
    this.state.set({ kind: 'error', message });
  }
}
