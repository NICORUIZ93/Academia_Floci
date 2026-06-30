## signal, computed y effect

```ts
import { signal, computed, effect } from '@angular/core';

const contador = signal(0);
const doble = computed(() => contador() * 2); // se recalcula solo si contador cambia

contador.set(5);
contador.update(v => v + 1);

effect(() => console.log('contador cambió a', contador())); // efecto secundario reactivo
```

## Mutación vs actualización inmutable

```ts
const tareas = signal<Tarea[]>([]);

// MAL: mutar in-place no notifica a Angular del cambio
tareas().push(nuevaTarea);

// BIEN: nueva referencia, Angular detecta el cambio
tareas.update(lista => [...lista, nuevaTarea]);
```

## Signals vs Observables

Los signals son ideales para **estado síncrono** (un valor que cambia en el tiempo, leído directamente). RxJS sigue siendo la herramienta correcta para **flujos asíncronos complejos**: combinar múltiples fuentes, cancelar peticiones en curso, debounce de eventos. `toSignal()`/`toObservable()` permiten cruzar entre ambos mundos sin reescribir todo.

## Hacia zoneless

Angular tradicionalmente usaba Zone.js para detectar automáticamente cuándo algo pudo haber cambiado (cualquier evento, timer o petición HTTP disparaba una revisión completa). Con signals, Angular sabe **exactamente** qué cambió y qué partes de la UI dependen de eso — eliminando la necesidad de Zone.js y revisiones innecesarias de toda la aplicación.
