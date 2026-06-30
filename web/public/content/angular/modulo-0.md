## El CLI ya no genera NgModules

Desde Angular 17, `ng new` genera un proyecto **standalone por defecto**: no hay `AppModule`, cada componente declara directamente sus propias dependencias.

```bash
ng new mi-app
ng generate component tarjeta
ng serve
```

```ts
// tarjeta.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-tarjeta',
  template: `<h2>{{ titulo }}</h2>`,
})
export class Tarjeta {
  titulo = 'Hola Angular';
}
```

## Interpolación y property binding

```html
<h2>{{ titulo }}</h2>            <!-- interpolación: texto -->
<img [src]="urlImagen" />         <!-- property binding: una propiedad del DOM -->
<button [disabled]="cargando">Enviar</button>
```

`{{ }}` siempre produce texto; `[propiedad]` enlaza directamente con una propiedad del elemento (no un atributo HTML), lo que importa para casos como `disabled` o `value` en formularios.

## ng build

```bash
ng build
```

Genera `dist/` con el bundle optimizado (minificado, con tree-shaking) listo para servir desde cualquier servidor estático.
