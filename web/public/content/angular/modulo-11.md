## Server-Side Rendering

```bash
ng add @angular/ssr
```

Con SSR, el servidor genera el HTML completo de la primera vista antes de enviarlo al navegador — el usuario ve contenido inmediatamente, en vez de una pantalla en blanco hasta que el JavaScript cargue.

## Hydration

Una vez que el HTML estático llega al navegador, Angular "hidrata" la página: adjunta los listeners de eventos y activa la reactividad **sin volver a renderizar todo desde cero**, reutilizando el DOM ya existente del servidor.

## @defer: carga diferida de vistas

```html
@defer (on viewport) {
  <app-grafico-pesado [datos]="datos()" />
} @placeholder {
  <div class="skeleton"></div>
} @loading (minimum 200ms) {
  <app-spinner />
}
```

El bloque dentro de `@defer` se carga como un chunk separado y solo se descarga cuando se cumple el trigger (`on viewport`, `on interaction`, `on idle`, etc.) — reduce el bundle inicial sin sacrificar la experiencia.

## Zoneless

Angular puede correr sin Zone.js cuando el estado se modela completamente con signals: como Angular sabe exactamente qué signal cambió y qué vistas dependen de él, no necesita interceptar cada evento/timer del navegador para "adivinar" si algo cambió.
