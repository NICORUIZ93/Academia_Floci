// Servicios e inyección de dependencias (Módulo 3).
// Uso de referencia: registra TareasService y consúmelo con inject() en un componente.
import { Injectable, inject, signal } from '@angular/core';

export interface Tarea {
  id: string;
  titulo: string;
  completada: boolean;
}

// providedIn: 'root' registra el servicio como singleton a nivel de aplicación,
// sin necesidad de declararlo en el array `providers` de ningún módulo o componente.
@Injectable({ providedIn: 'root' })
export class TareasService {
  private readonly tareas = signal<Tarea[]>([]);

  readonly listaTareas = this.tareas.asReadonly();

  agregar(titulo: string): void {
    const nueva: Tarea = { id: crypto.randomUUID(), titulo, completada: false };
    this.tareas.update((actuales) => [...actuales, nueva]);
  }

  completar(id: string): void {
    this.tareas.update((actuales) =>
      actuales.map((t) => (t.id === id ? { ...t, completada: true } : t))
    );
  }
}

// En un componente standalone, se consume así (sin constructor, con inject()):
//
// @Component({ selector: 'app-tareas', standalone: true, template: '...' })
// export class TareasComponent {
//   private readonly tareasService = inject(TareasService);
//   readonly tareas = this.tareasService.listaTareas;
// }
