# Módulo 1: Componentes, plantillas y data binding


## Aprende construyendo

### Tema 1: input()/output() basados en signals

#### Paso 1 · Objetivo y preparación
Al finalizar podrás construir este componente desde cero. Prerrequisitos: Node.js LTS, npm y Angular CLI. Verifica node --version y ng version.

#### Paso 2 · Contexto y caso real
En un caso real de entregas, un componente recibe un pedido, emite acciones y muestra estados sin mezclar datos de otras pantallas.

#### Paso 3 · Teoría, modelo mental y analogía
Signals representan estado reactivo; input y output hacen explícito el contrato; el control de flujo de plantilla decide qué se renderiza. La proyección inserta contenido sin duplicar componentes y el ciclo de vida define cuándo leer o limpiar recursos. La analogía es un mostrador: recibe una orden, actualiza su pantalla y emite un comprobante.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-angular-m1
cd ejemplo-angular-m1
npx -p @angular/cli ng new app --standalone --routing=false --style=css --skip-git
cd app
ng serve
```
Crea src/app/delivery-card.component.ts con signal, input y output; úsalo desde app.component y documenta el flujo.

#### Paso 5 · Práctica guiada
Pista: elimina deliberadamente un input requerido para provocar un fallo deliberado de plantilla; corrígelo y observa el resultado. Resultado esperado: tarjeta renderizada y evento recibido.

#### Paso 6 · Práctica independiente
Añade estados loading/empty/error, una lista con @for y contenido proyectado; valida navegación por teclado.

#### Paso 7 · Cierre y evidencia
Guarda código, captura y log; como siguiente paso estudia servicios. Errores comunes: mutar arrays sin signal, emitir datos ambiguos, usar índices como key y leer consultas antes del render. Fuentes oficiales: https://angular.dev/guide/signals y https://angular.dev/guide/components/inputs.
**¿Por qué es importante?** Porque los contratos explícitos hacen predecible una vista reactiva.
**Evidencia de aprendizaje:** entrega componente, evento, estados y prueba del fallo.
**Conceptos clave:** `input()`, `input.required()`, `output()`, comparación con los decoradores clásicos.

`input()` y `output()`, las funciones modernas para declarar propiedades de entrada y salida de un componente, reemplazan a los decoradores clásicos `@Input()` y `@Output()` con una integración nativa con el modelo de signals estudiado en profundidad en el Módulo 2. `titulo = input.required<string>();` declara un input obligatorio de tipo `string` (el componente padre debe proporcionarlo, o Angular lanza un error de compilación de plantilla si se omite), accesible dentro del componente como una función de lectura reactiva (`titulo()`, con paréntesis, exactamente como cualquier signal), en vez de una propiedad de clase simple que los decoradores clásicos exponían directamente sin necesidad de invocarla como función.

Esta integración con signals significa que un input declarado con `input()` participa directamente en el grafo de reactividad de signals: un `computed()` que depende de `titulo()` se recalcula automáticamente cuando el valor del input cambia, exactamente con la misma semántica que cualquier otro signal, sin necesidad de ningún mecanismo adicional de detección de cambios específico para inputs, a diferencia del modelo anterior donde `@Input` era una propiedad de clase ordinaria que dependía del ciclo de detección de cambios general de Angular (o del hook `ngOnChanges`, Tema 4) para reaccionar a sus cambios.

`output()` reemplaza a `@Output() evento = new EventEmitter<T>();` con una sintaxis más concisa: `seleccionar = output<void>();`, emitiendo valores con `seleccionar.emit()` exactamente igual que un `EventEmitter` clásico, y consumido desde el componente padre con la misma sintaxis de binding de eventos (`(seleccionar)="manejador()"`) que ya existía para `@Output`. La ventaja principal de `output()` sobre `@Output` no es tanto una diferencia funcional dramática como una consistencia de API y de estilo con `input()`, ambos como funciones en vez de decoradores, reflejando la dirección general de Angular moderno hacia APIs basadas en funciones en vez de decoradores donde sea razonable.

**Analogía:** `input()` es como una ranura de entrada claramente etiquetada y obligatoria (si se declara `required`) en un formulario, que el remitente (el componente padre) debe rellenar antes de que el formulario se procese; `output()` es como un buzón de salida desde el que el componente puede enviar notificaciones hacia quien esté escuchando, sin necesidad de saber de antemano quién las recibirá ni cuántos destinatarios habrá.

**¿Por qué es importante?** `input()`/`output()` integran nativamente los inputs y outputs de un componente con el grafo de reactividad de signals, simplificando el modelo mental general de reactividad de Angular al usar un único mecanismo consistente (signals) en vez de mezclar propiedades de clase ordinarias con el sistema de detección de cambios tradicional.

**Código del ejemplo:**

```ts
@Component({ selector: 'app-tarjeta', template: `
  <h2>{{ titulo() }}</h2>
  <button (click)="seleccionar.emit()">Ver más</button>
`})
export class Tarjeta {
  titulo = input.required<string>();
  seleccionar = output<void>();
}
```
```html
<app-tarjeta [titulo]="'Mi tarea'" (seleccionar)="abrirDetalle()" />
```

### Tema 2: Control de flujo nativo — @if, @for, @switch

#### Paso 1 · Objetivo y preparación
Al finalizar podrás construir este componente desde cero. Prerrequisitos: Node.js LTS, npm y Angular CLI. Verifica node --version y ng version.

#### Paso 2 · Contexto y caso real
En un caso real de entregas, un componente recibe un pedido, emite acciones y muestra estados sin mezclar datos de otras pantallas.

#### Paso 3 · Teoría, modelo mental y analogía
Signals representan estado reactivo; input y output hacen explícito el contrato; el control de flujo de plantilla decide qué se renderiza. La proyección inserta contenido sin duplicar componentes y el ciclo de vida define cuándo leer o limpiar recursos. La analogía es un mostrador: recibe una orden, actualiza su pantalla y emite un comprobante.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-angular-m1
cd ejemplo-angular-m1
npx -p @angular/cli ng new app --standalone --routing=false --style=css --skip-git
cd app
ng serve
```
Crea src/app/delivery-card.component.ts con signal, input y output; úsalo desde app.component y documenta el flujo.

#### Paso 5 · Práctica guiada
Pista: elimina deliberadamente un input requerido para provocar un fallo deliberado de plantilla; corrígelo y observa el resultado. Resultado esperado: tarjeta renderizada y evento recibido.

#### Paso 6 · Práctica independiente
Añade estados loading/empty/error, una lista con @for y contenido proyectado; valida navegación por teclado.

#### Paso 7 · Cierre y evidencia
Guarda código, captura y log; como siguiente paso estudia servicios. Errores comunes: mutar arrays sin signal, emitir datos ambiguos, usar índices como key y leer consultas antes del render. Fuentes oficiales: https://angular.dev/guide/signals y https://angular.dev/guide/components/inputs.
**¿Por qué es importante?** Porque los contratos explícitos hacen predecible una vista reactiva.
**Evidencia de aprendizaje:** entrega componente, evento, estados y prueba del fallo.
**Conceptos clave:** sintaxis de bloque integrada, `track`, rendimiento de listas.

Angular introdujo una sintaxis de control de flujo nativa e integrada directamente en el propio lenguaje de plantillas (`@if`, `@for`, `@switch`), reemplazando las directivas estructurales clásicas (`*ngIf`, `*ngFor`, `*ngSwitch`) que dependían de un mecanismo más indirecto basado en la sintaxis de asterisco y microsintaxis específica de Angular. La nueva sintaxis se lee de forma más natural y cercana a bloques de control de flujo de cualquier lenguaje de programación convencional (`@if (condicion) {...} @else {...}`), y el compilador de Angular puede optimizar mejor el código generado al tener una comprensión más directa y explícita de la estructura de control de flujo, en vez de tener que interpretar la microsintaxis de las directivas estructurales clásicas.

`@for (tarea of tareas(); track tarea.id) {...}` exige (o recomienda con fuerza suficiente como para considerarlo prácticamente obligatorio en la práctica) una expresión `track`, que le indica a Angular cómo identificar de forma única cada elemento de la lista entre actualizaciones sucesivas: cuando la lista cambia (se añade, elimina o reordena un elemento), Angular usa el valor de `track` para determinar qué elementos del DOM ya existentes corresponden a elementos que persisten en la nueva versión de la lista (y por tanto pueden reutilizarse sin volver a crearlos), en vez de destruir y recrear todos los elementos del DOM de la lista completa en cada actualización, una optimización de rendimiento con impacto directo y medible especialmente en listas largas que cambian con frecuencia.

Usar `track tarea.id` (un identificador único y estable de cada elemento) en vez del valor por defecto menos óptimo (`track $index`, la posición del elemento en el array, que cambia si el orden de la lista se reordena aunque el elemento en sí no haya cambiado realmente) es la práctica correcta casi siempre que los datos tengan un identificador único disponible: usar el índice como track hace que Angular malinterprete un simple reordenamiento de la lista como si cada elemento hubiera cambiado completamente, destruyendo y recreando innecesariamente elementos del DOM que en realidad seguían siendo los mismos, solo en una posición distinta.

**Analogía:** `track` es como una etiqueta de identificación única cosida permanentemente a cada prenda de un guardarropa: cuando reorganizas el guardarropa (reordenas la lista), el sistema reconoce cada prenda por su etiqueta única y simplemente la mueve de posición, en vez de asumir (por usar solo la posición del perchero como identificador) que cada prenda es "nueva" simplemente porque cambió de percha, y tener que fabricar una prenda completamente nueva desde cero en cada percha.

**¿Por qué es importante?** La sintaxis nativa de control de flujo es más legible y permite mejores optimizaciones del compilador; usar `track` con un identificador estable en `@for` es esencial para el rendimiento de listas que cambian con frecuencia, evitando recreaciones innecesarias de elementos del DOM.

**Código del ejemplo:**

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

### Tema 3: Content projection con ng-content

#### Paso 1 · Objetivo y preparación
Al finalizar podrás construir este componente desde cero. Prerrequisitos: Node.js LTS, npm y Angular CLI. Verifica node --version y ng version.

#### Paso 2 · Contexto y caso real
En un caso real de entregas, un componente recibe un pedido, emite acciones y muestra estados sin mezclar datos de otras pantallas.

#### Paso 3 · Teoría, modelo mental y analogía
Signals representan estado reactivo; input y output hacen explícito el contrato; el control de flujo de plantilla decide qué se renderiza. La proyección inserta contenido sin duplicar componentes y el ciclo de vida define cuándo leer o limpiar recursos. La analogía es un mostrador: recibe una orden, actualiza su pantalla y emite un comprobante.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-angular-m1
cd ejemplo-angular-m1
npx -p @angular/cli ng new app --standalone --routing=false --style=css --skip-git
cd app
ng serve
```
Crea src/app/delivery-card.component.ts con signal, input y output; úsalo desde app.component y documenta el flujo.

#### Paso 5 · Práctica guiada
Pista: elimina deliberadamente un input requerido para provocar un fallo deliberado de plantilla; corrígelo y observa el resultado. Resultado esperado: tarjeta renderizada y evento recibido.

#### Paso 6 · Práctica independiente
Añade estados loading/empty/error, una lista con @for y contenido proyectado; valida navegación por teclado.

#### Paso 7 · Cierre y evidencia
Guarda código, captura y log; como siguiente paso estudia servicios. Errores comunes: mutar arrays sin signal, emitir datos ambiguos, usar índices como key y leer consultas antes del render. Fuentes oficiales: https://angular.dev/guide/signals y https://angular.dev/guide/components/inputs.
**¿Por qué es importante?** Porque los contratos explícitos hacen predecible una vista reactiva.
**Evidencia de aprendizaje:** entrega componente, evento, estados y prueba del fallo.
**Conceptos clave:** proyección de contenido del padre, componentes de layout genéricos.

`<ng-content>`, colocado dentro de la plantilla de un componente, marca el punto donde se proyectará el contenido HTML que el componente padre coloque entre las etiquetas de apertura y cierre del componente hijo al usarlo, permitiendo construir componentes de layout genéricos (como un `Modal`, una `Tarjeta`, o un `Panel`) cuyo contenido interno específico es determinado completamente por quien lo consume, sin que el componente contenedor necesite conocer de antemano exactamente qué contenido concreto se proyectará dentro de él.

Este patrón es fundamentalmente distinto de pasar datos mediante un `input()`: un input transmite valores de datos que el componente hijo puede procesar o transformar internamente antes de mostrarlos; content projection transmite directamente marcado HTML (potencialmente arbitrariamente complejo, incluyendo otros componentes anidados) que el componente hijo simplemente posiciona en un lugar específico de su propia plantilla, sin ninguna capacidad de inspeccionar o transformar ese contenido proyectado, solo de decidir dónde ubicarlo visualmente dentro de su propio layout.

`<ng-content select="...">` con múltiples slots nombrados permite proyectar distintas porciones de contenido del padre en distintas posiciones específicas de la plantilla del componente hijo (por ejemplo, un slot para el encabezado del modal y otro para su cuerpo principal), seleccionando qué contenido va a cada slot mediante un selector CSS aplicado sobre los elementos hijos proyectados, una capacidad más avanzada que un único `<ng-content>` sin selector, que simplemente proyecta todo el contenido del padre en un único punto.

**Analogía:** content projection es como un marco de fotos genérico y reutilizable, diseñado para exhibir cualquier fotografía específica que alguien decida colocar dentro de él, sin que el fabricante del marco necesite saber de antemano qué fotografía exacta se exhibirá; múltiples slots nombrados serían como un marco con varias aberturas específicas y etiquetadas, cada una destinada a un tipo específico de contenido (una para el título, otra para la imagen principal).

**¿Por qué es importante?** Content projection permite construir componentes de layout verdaderamente genéricos y reutilizables cuyo contenido interno específico lo determina completamente quien los consume, un patrón de composición fundamental en cualquier biblioteca de componentes de UI madura.

**Código del ejemplo:**

```ts
@Component({ selector: 'app-modal', template: `<div class="modal"><ng-content /></div>` })
export class Modal {}
```
```html
<app-modal><p>Contenido arbitrario del padre</p></app-modal>
```

### Tema 4: Ciclo de vida completo de un componente

#### Paso 1 · Objetivo y preparación
Al finalizar podrás construir este componente desde cero. Prerrequisitos: Node.js LTS, npm y Angular CLI. Verifica node --version y ng version.

#### Paso 2 · Contexto y caso real
En un caso real de entregas, un componente recibe un pedido, emite acciones y muestra estados sin mezclar datos de otras pantallas.

#### Paso 3 · Teoría, modelo mental y analogía
Signals representan estado reactivo; input y output hacen explícito el contrato; el control de flujo de plantilla decide qué se renderiza. La proyección inserta contenido sin duplicar componentes y el ciclo de vida define cuándo leer o limpiar recursos. La analogía es un mostrador: recibe una orden, actualiza su pantalla y emite un comprobante.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-angular-m1
cd ejemplo-angular-m1
npx -p @angular/cli ng new app --standalone --routing=false --style=css --skip-git
cd app
ng serve
```
Crea src/app/delivery-card.component.ts con signal, input y output; úsalo desde app.component y documenta el flujo.

#### Paso 5 · Práctica guiada
Pista: elimina deliberadamente un input requerido para provocar un fallo deliberado de plantilla; corrígelo y observa el resultado. Resultado esperado: tarjeta renderizada y evento recibido.

#### Paso 6 · Práctica independiente
Añade estados loading/empty/error, una lista con @for y contenido proyectado; valida navegación por teclado.

#### Paso 7 · Cierre y evidencia
Guarda código, captura y log; como siguiente paso estudia servicios. Errores comunes: mutar arrays sin signal, emitir datos ambiguos, usar índices como key y leer consultas antes del render. Fuentes oficiales: https://angular.dev/guide/signals y https://angular.dev/guide/components/inputs.
**¿Por qué es importante?** Porque los contratos explícitos hacen predecible una vista reactiva.
**Evidencia de aprendizaje:** entrega componente, evento, estados y prueba del fallo.
**Conceptos clave:** hooks de ciclo de vida, orden de invocación, propósito de cada uno.

Angular invoca una secuencia bien definida de "hooks" de ciclo de vida en momentos específicos y predecibles de la existencia de un componente, cada uno con un propósito distinto. `ngOnChanges` se invoca cada vez que un input cambia de valor (antes de cualquier otro hook, en cada ciclo de detección de cambios donde eso ocurra), recibiendo un objeto que detalla el valor anterior y el nuevo de cada input modificado, útil para reaccionar específicamente a cambios de un input concreto con lógica que necesita conocer tanto el valor anterior como el nuevo. `ngOnInit` se invoca una única vez, después de que los inputs iniciales ya están establecidos, siendo el lugar recomendado para lógica de inicialización que depende de esos valores iniciales (en vez del constructor, que se ejecuta antes de que Angular haya establecido los inputs).

`ngDoCheck` se invoca en cada ciclo de detección de cambios, incluso cuando Angular no detectó ningún cambio relevante por sí mismo, permitiendo implementar lógica de detección de cambios completamente personalizada para casos donde el mecanismo estándar de Angular no sería suficiente (un hook usado con moderación, dado su coste de invocarse en cada ciclo sin excepción). `ngAfterContentInit` y `ngAfterContentChecked` se invocan después de que el contenido proyectado mediante `ng-content` (Tema 3) se ha inicializado y verificado respectivamente; `ngAfterViewInit` y `ngAfterViewChecked` cumplen el mismo rol pero para la propia vista del componente (incluyendo sus componentes hijos declarados directamente en su plantilla, no proyectados), siendo el lugar apropiado para lógica que necesita acceder a elementos del DOM ya renderizados o a componentes hijos ya inicializados mediante `ViewChild`.

`ngOnDestroy`, el hook final del ciclo de vida, se invoca justo antes de que Angular destruya el componente, siendo el lugar indispensable para cualquier limpieza necesaria: cancelar suscripciones manuales a Observables que no usan el `async` pipe (Módulo 6), limpiar temporizadores (`clearInterval`/`clearTimeout`), o desconectar cualquier observer del navegador (como los estudiados en el Módulo 8 del track de JavaScript) que el componente haya registrado durante su vida, previniendo fugas de memoria que de otro modo persistirían indefinidamente después de que el componente ya no exista visualmente en la aplicación.

**Analogía:** el ciclo de vida de un componente es como el ciclo completo de un empleado en una empresa: la contratación inicial con verificación de credenciales (`ngOnChanges`/`ngOnInit`), el desempeño continuo verificado periódicamente (`ngDoCheck`), la integración con su equipo de trabajo directo una vez asignado (`ngAfterViewInit`), y finalmente el proceso ordenado de salida donde se revocan accesos y se cierran cuentas pendientes (`ngOnDestroy`), cada etapa con un propósito claramente distinto en el ciclo de vida completo.

**¿Por qué es importante?** Conocer el propósito específico de cada hook, y especialmente la importancia crítica de `ngOnDestroy` para prevenir fugas de memoria, es esencial para escribir componentes Angular correctos y de larga vida en una aplicación real.

**Código del ejemplo:**

```ts
export class MiComponente implements OnChanges, OnInit, AfterViewInit, OnDestroy {
  ngOnChanges(cambios: SimpleChanges) { /* un input cambió */ }
  ngOnInit() { /* inputs iniciales ya establecidos, una sola vez */ }
  ngAfterViewInit() { /* vista y componentes hijos ya inicializados */ }
  ngOnDestroy() { /* limpieza: cancelar suscripciones, timers, observers */ }
}
```

### Tema 5: Consultas signal y trabajo posterior al render

#### Paso 1 · Objetivo y preparación
Al finalizar podrás construir este componente desde cero. Prerrequisitos: Node.js LTS, npm y Angular CLI. Verifica node --version y ng version.

#### Paso 2 · Contexto y caso real
En un caso real de entregas, un componente recibe un pedido, emite acciones y muestra estados sin mezclar datos de otras pantallas.

#### Paso 3 · Teoría, modelo mental y analogía
Signals representan estado reactivo; input y output hacen explícito el contrato; el control de flujo de plantilla decide qué se renderiza. La proyección inserta contenido sin duplicar componentes y el ciclo de vida define cuándo leer o limpiar recursos. La analogía es un mostrador: recibe una orden, actualiza su pantalla y emite un comprobante.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-angular-m1
cd ejemplo-angular-m1
npx -p @angular/cli ng new app --standalone --routing=false --style=css --skip-git
cd app
ng serve
```
Crea src/app/delivery-card.component.ts con signal, input y output; úsalo desde app.component y documenta el flujo.

#### Paso 5 · Práctica guiada
Pista: elimina deliberadamente un input requerido para provocar un fallo deliberado de plantilla; corrígelo y observa el resultado. Resultado esperado: tarjeta renderizada y evento recibido.

#### Paso 6 · Práctica independiente
Añade estados loading/empty/error, una lista con @for y contenido proyectado; valida navegación por teclado.

#### Paso 7 · Cierre y evidencia
Guarda código, captura y log; como siguiente paso estudia servicios. Errores comunes: mutar arrays sin signal, emitir datos ambiguos, usar índices como key y leer consultas antes del render. Fuentes oficiales: https://angular.dev/guide/signals y https://angular.dev/guide/components/inputs.
**¿Por qué es importante?** Porque los contratos explícitos hacen predecible una vista reactiva.
**Evidencia de aprendizaje:** entrega componente, evento, estados y prueba del fallo.
**Conceptos clave:** `viewChild.required`, `contentChild`, `ElementRef`, `afterNextRender`, fases `write/read`, SSR y separación entre datos y DOM.

Construiremos el panel de seguimiento de RutaFlow que ajusta la altura de un mapa según el espacio disponible. La mayoría de interfaces debe expresarse con plantilla, CSS y signals; una consulta del DOM se justifica cuando necesitas integrar una biblioteca visual o medir una dimensión que el modelo de datos no contiene.

**Requisitos previos:** Node.js compatible con la versión Angular del proyecto y temas 1–4. Crea:

```text
src/app/features/tracking/
├── tracking-panel.component.ts
├── tracking-panel.component.html
├── tracking-panel.component.css
└── tracking-panel.component.spec.ts
```

`viewChild()` devuelve una signal: antes de que exista el elemento puede ser `undefined`; `viewChild.required()` declara que la plantilla siempre debe contenerlo y falla si esa promesa se rompe. Usa una referencia de plantilla tipada en `tracking-panel.component.html`:

```html
<section class="tracking-panel" #panel>
  <header #header>
    <h2>Seguimiento de la entrega</h2>
  </header>
  <div class="map" [style.height.px]="mapHeight()" aria-label="Mapa de seguimiento"></div>
</section>
```

En `tracking-panel.component.ts`, escribe cambios en una fase y mide en otra. Separar escritura y lectura evita alternarlas repetidamente, patrón que puede forzar recalcular layout varias veces en un frame.

```ts
import { Component, ElementRef, afterNextRender, signal, viewChild } from '@angular/core';

@Component({
  selector: 'app-tracking-panel',
  standalone: true,
  templateUrl: './tracking-panel.component.html',
  styleUrl: './tracking-panel.component.css'
})
export class TrackingPanelComponent {
  private readonly panel = viewChild.required<ElementRef<HTMLElement>>('panel');
  private readonly header = viewChild.required<ElementRef<HTMLElement>>('header');
  readonly mapHeight = signal(320);

  constructor() {
    afterNextRender({
      write: () => {
        this.panel().nativeElement.style.setProperty('--panel-ready', '1');
      },
      read: () => {
        const panelHeight = this.panel().nativeElement.getBoundingClientRect().height;
        const headerHeight = this.header().nativeElement.getBoundingClientRect().height;
        this.mapHeight.set(Math.max(240, panelHeight - headerHeight - 24));
      }
    });
  }
}
```

`afterNextRender` se registra en un contexto de inyección —por ejemplo, el constructor— y se ejecuta después de que Angular renderiza la aplicación en el navegador. No equivale a `ngAfterViewChecked`, que puede ejecutarse muchas veces y no es un lugar seguro para escribir estado indiscriminadamente. Los callbacks de render no se ejecutan durante SSR; por eso no deben contener una regla de negocio necesaria para producir HTML correcto en el servidor.

`contentChild()` consulta contenido que el padre proyectó mediante `ng-content`; `viewChild()` consulta la propia plantilla del componente. No uses cualquiera de las dos para que un padre controle detalles internos de un hijo: inputs y outputs siguen siendo el contrato público adecuado.

```mermaid
sequenceDiagram
  participant A as Angular
  participant C as TrackingPanel
  participant D as DOM navegador
  A->>D: renderiza plantilla
  A->>C: afterNextRender.write
  C->>D: escribe estilo
  A->>C: afterNextRender.read
  C->>D: mide panel y encabezado
  C->>A: actualiza signal mapHeight
  A->>D: renderiza altura calculada
```

**Analogía:** `viewChild` es una ventana de inspección a una pieza ya instalada; las fases de render son el turno del equipo de montaje y después el del equipo de medición. Medir mientras todavía se mueve la estructura produce trabajo repetido y resultados inestables.

**¿Por qué es importante?** Las consultas signal se integran con el modelo reactivo moderno y las fases de render reducen lecturas/escrituras intercaladas. Reconocer el límite de SSR evita que el HTML inicial dependa de una medición exclusiva del navegador.

**Ejecución y resultado esperado:** ejecuta `npm test -- --watch=false` y `ng serve`. El mapa nunca mide menos de 240 px, cambia después del primer render sin `ExpressionChangedAfterItHasBeenCheckedError` y el render del servidor conserva una altura inicial válida de 320 px.

**Fallo deliberado:** mueve `mapHeight.set(...)` a `ngAfterViewChecked` sin guarda. Observa ciclos o el error de expresión cambiada; después lee y escribe layout dentro de un bucle de 100 elementos y registra el coste con Performance DevTools. Restablece las fases y compara.

**Modificación sin copiar:** reemplaza la medición única por `ResizeObserver`, registra su limpieza con `DestroyRef` y prueba que deja de emitir después de destruir el fixture.

---


## Laboratorio práctico

**Objetivo del laboratorio:** construir un componente Tarjeta reutilizable con inputs/outputs basados en signals, control de flujo nativo, content projection y manejo correcto del ciclo de vida.

**Requisitos previos:** Módulo 0 completado.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Crear el componente Tarjeta | `input.required<string>()` y `output<void>()` | Verifica que el padre puede escuchar el evento |
| 2 | Reemplazar `*ngFor`/`*ngIf` por `@for`/`@if` | Ver Tema 2 | Compara legibilidad con la sintaxis clásica |
| 3 | Usar `track` por id en `@for` | Ver Tema 2 | Explica qué problema de rendimiento evita frente a `track $index` |
| 4 | Crear un componente Modal con `ng-content` | Ver Tema 3 | Proyecta contenido arbitrario del padre |
| 5 | Implementar `ngOnInit` y `ngOnDestroy` | Registra en consola cuándo se invoca cada uno | Verifica el orden exacto de invocación |
| 6 | Consultar y medir el panel | Ver Tema 5 | Usa `viewChild.required` y fases `write/read` |
| 7 | Renderizar con SSR | Ver Tema 5 | Conserva un valor inicial sin depender del navegador |

**Verificación:** el laboratorio se considera exitoso si la Tarjeta emite correctamente su evento de salida al padre, si la lista renderizada con `@for` mantiene la identidad correcta de sus elementos al reordenarse (verificado con `track`), y si `ngOnDestroy` se invoca correctamente al eliminar el componente de la vista.

**Errores comunes y soluciones**

- **Usar `track $index` cuando los datos tienen un identificador único disponible.** Usa siempre el identificador único real de cada elemento para evitar recreaciones innecesarias del DOM.
- **Olvidar los paréntesis al leer un input declarado con `input()`.** Recuerda que `titulo` (la función) y `titulo()` (su valor actual) son cosas distintas; siempre invócalo como función para leer su valor.
- **No limpiar recursos en `ngOnDestroy`.** Cualquier suscripción manual, temporizador u observer registrado debe limpiarse explícitamente para evitar fugas de memoria.
- **Usar `ngAfterViewChecked` para medir y actualizar estado en cada ciclo.** Prefiere callbacks de render y separa lecturas de escrituras.
- **Depender de una medición del DOM para el HTML SSR.** Define un estado inicial correcto porque esos callbacks solo existen en el navegador.

---
