// Contador con Signals — el nuevo modelo de reactividad de Angular (Módulo 2).
// Uso de referencia: pega esto como componente standalone en un proyecto Angular 17+.
import { Component, computed, signal } from '@angular/core';

@Component({
  selector: 'app-signals-counter',
  standalone: true,
  template: `
    <p>Contador: {{ count() }}</p>
    <p>Doble: {{ doubled() }}</p>
    <button (click)="increment()">+1</button>
    <button (click)="reset()">Reiniciar</button>
  `,
})
export class SignalsCounterComponent {
  // signal() crea un valor reactivo: leerlo (count()) registra dependencia
  // automáticamente en cualquier contexto reactivo (computed, effect, plantilla).
  readonly count = signal(0);

  // computed() deriva un valor de otros signals: se recalcula solo cuando
  // count() cambia, y solo si algo está leyendo doubled() activamente.
  readonly doubled = computed(() => this.count() * 2);

  increment(): void {
    // update() recibe el valor actual y devuelve el nuevo — evita leer y
    // escribir en pasos separados, más seguro con actualizaciones concurrentes.
    this.count.update((value) => value + 1);
  }

  reset(): void {
    this.count.set(0);
  }
}
