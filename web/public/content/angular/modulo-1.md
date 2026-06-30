## input() y output() basados en signals

```ts
import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-tarjeta',
  template: `
    <h2>{{ titulo() }}</h2>
    <button (click)="seleccionar.emit()">Ver más</button>
  `,
})
export class Tarjeta {
  titulo = input.required<string>();
  seleccionar = output<void>();
}
```

```html
<app-tarjeta [titulo]="'Mi tarea'" (seleccionar)="abrirDetalle()" />
```

## Control de flujo nativo

```html
@if (tareas().length > 0) {
  <ul>
    @for (tarea of tareas(); track tarea.id) {
      <li>{{ tarea.titulo }}</li>
    }
  </ul>
} @else {
  <p>No hay tareas todavía.</p>
}
```

`@for` exige (o recomienda fuertemente) una clave `track` para que Angular pueda identificar qué elementos cambiaron realmente, en vez de re-renderizar la lista completa en cada actualización.

## Content projection

```ts
@Component({ selector: 'app-modal', template: `<div class="modal"><ng-content /></div>` })
export class Modal {}
```

```html
<app-modal><p>Contenido arbitrario del padre</p></app-modal>
```

## Ciclo de vida

```ts
export class MiComponente implements OnInit, OnDestroy {
  ngOnInit() { /* el componente ya está inicializado */ }
  ngOnDestroy() { /* limpieza: cancelar suscripciones, timers */ }
}
```
