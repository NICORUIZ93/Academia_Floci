# Módulo 9: Gestión de estado


## Aprende construyendo

### Tema 1: Store propio con signals

**Conceptos clave:** `@Injectable({ providedIn: 'root' })`, encapsulación de estado mutable, exposición de solo lectura.

Un store de signals es, en esencia, un servicio inyectable (Módulo 3) que encapsula uno o varios signals de estado privados, exponiendo hacia el exterior únicamente versiones de solo lectura de ese estado (mediante `asReadonly()`, estudiado en el Módulo 2) junto con métodos públicos explícitos que son la única forma permitida de modificar ese estado internamente, un patrón que aplica el mismo principio de encapsulación estudiado para clases en general (Módulo 4 del track de JavaScript) al caso específico del estado reactivo compartido de una aplicación.

En el ejemplo de `CarritoStore`, el signal privado `items` mantiene el arreglo de productos en el carrito, expuesto hacia afuera como `lista` mediante `asReadonly()` (impidiendo que código externo llame `.set()` o `.update()` directamente sobre él, forzándolo a pasar por los métodos `agregar()`/`quitar()` explícitamente definidos por el store); `total`, un `computed()` derivado de `items`, se recalcula automáticamente cada vez que el arreglo de items cambia, sin que ningún código tenga que recordar mantenerlo sincronizado manualmente.

Al estar registrado con `providedIn: 'root'` (Módulo 3), cualquier componente en cualquier parte del árbol de la aplicación que inyecte `CarritoStore` recibe la misma instancia única compartida, viendo automáticamente el mismo estado actualizado sin necesidad de pasar ese estado manualmente como input a través de una cadena potencialmente larga de componentes intermedios que no necesitan conocer ese estado en absoluto (el problema de "prop drilling" que este patrón evita estructuralmente).

**Analogía:** un store de signals es como una caja fuerte con un único guardián autorizado (el propio servicio) que controla exactamente qué operaciones están permitidas sobre su contenido (los métodos públicos), mientras que cualquiera puede consultar el contenido actual a través de una ventana de solo observación (la versión de solo lectura expuesta), sin poder alterarlo directamente por su cuenta.

**¿Por qué es importante?** Un store de signals encapsulado evita que cualquier parte de la aplicación modifique el estado compartido de forma descontrolada, y evita el "prop drilling" de pasar estado manualmente a través de componentes intermedios que no lo necesitan.

**Código del ejemplo:**

```ts
@Injectable({ providedIn: 'root' })
export class CarritoStore {
  private items = signal<Item[]>([]);
  readonly lista = this.items.asReadonly();
  readonly total = computed(() => this.items().reduce((s, i) => s + i.precio, 0));

  agregar(item: Item) { this.items.update(l => [...l, item]); }
  quitar(id: string) { this.items.update(l => l.filter(i => i.id !== id)); }
}
```

### Tema 2: NgRx — actions, reducers y selectors

**Conceptos clave:** flujo unidireccional de datos, funciones puras, historial inspeccionable.

NgRx implementa el patrón Redux para Angular: en vez de modificar el estado directamente mediante métodos de un servicio (como en el Tema 1), el estado se modifica exclusivamente despachando "actions" (objetos planos que describen qué ocurrió, como `agregarItem = createAction('[Carrito] Agregar', props<{ item: Item }>())`), que son procesadas por "reducers" — funciones puras (Módulo 3 del track de JavaScript) que reciben el estado actual y una action, y devuelven un nuevo estado sin mutar el original (`carritoReducer`, usando `on(agregarItem, (estado, { item }) => ({ ...estado, items: [...estado.items, item] }))`).

Los "selectors" (`createSelector`) son funciones derivadas que calculan valores a partir del estado global del store de NgRx, de forma conceptualmente equivalente a un `computed()` de signals (Módulo 2) pero operando sobre el árbol de estado inmutable de NgRx en vez de sobre un signal individual, memoizando automáticamente su resultado para evitar recálculos innecesarios cuando las partes del estado de las que depende no han cambiado.

Este flujo estrictamente unidireccional (acción despachada → reducer puro → nuevo estado → selectors recalculados → vista actualizada) hace que cada cambio de estado en la aplicación quede registrado como una action explícita con nombre descriptivo, habilitando herramientas como Redux DevTools para inspeccionar el historial completo de cambios de estado a lo largo del tiempo, incluyendo la capacidad de viajar en el tiempo (time-travel debugging) para reproducir exactamente la secuencia de acciones que llevó a un estado particular, algo que un store de signals simple no ofrece de forma nativa.

**Analogía:** un reducer de NgRx es como un contable que nunca modifica un libro de cuentas existente directamente, sino que siempre registra una nueva entrada firmada (la action) y produce un balance completamente nuevo a partir de esa entrada, dejando un rastro auditable completo de cada cambio ocurrido a lo largo del tiempo.

**¿Por qué es importante?** El flujo unidireccional estricto de NgRx, con reducers puros y actions explícitas, produce un historial de cambios completamente inspeccionable y reproducible, a costa de más ceremonia de código que un store de signals directo.

**Código del ejemplo:**

```ts
const agregarItem = createAction('[Carrito] Agregar', props<{ item: Item }>());

const carritoReducer = createReducer(estadoInicial,
  on(agregarItem, (estado, { item }) => ({ ...estado, items: [...estado.items, item] }))
);

const selectTotal = createSelector(selectCarrito, (estado) =>
  estado.items.reduce((s, i) => s + i.precio, 0)
);
```

### Tema 3: Cuándo NgRx justifica su complejidad

**Conceptos clave:** ceremonia frente a beneficio, escala del equipo, complejidad de side-effects asíncronos.

NgRx agrega una cantidad considerable de ceremonia respecto a un store de signals directo: cada cambio de estado requiere definir una action, un caso en un reducer, y potencialmente un selector para leerlo de vuelta, además de (para lógica asíncrona) un "effect" que escucha ciertas actions y despacha nuevas actions como resultado de operaciones asíncronas (como una petición HTTP), una capa adicional de indirección que no existe en un store de signals, donde la lógica asíncrona simplemente vive directamente dentro de un método del store.

Esta ceremonia adicional está genuinamente justificada cuando el historial de cambios inspeccionable es un requisito real (depuración de bugs de estado complejos en producción, reproducir exactamente una secuencia de eventos reportada por un usuario), cuando un equipo grande necesita un patrón único y predecible para modificar estado en toda la base de código (evitando que cada desarrollador invente su propia convención ad-hoc para gestionar estado), o cuando la lógica de side-effects asíncronos es genuinamente compleja (múltiples acciones encadenadas condicionalmente, cancelación de flujos en curso, coordinación entre múltiples fuentes de eventos).

Para la mayoría de features de tamaño moderado, sin embargo, un store de signals bien diseñado (Tema 1) ofrece prácticamente el mismo beneficio de estado compartido y encapsulado con una fracción de la ceremonia, siendo la recomendación por defecto salvo que exista una razón concreta y específica (no solo "podría ser útil algún día") para asumir el costo adicional de NgRx.

**Analogía:** NgRx es como un sistema de contabilidad corporativo completo con auditoría externa, apropiado para una empresa grande con múltiples departamentos y necesidad de trazabilidad legal; un store de signals es como llevar las cuentas personales en una libreta simple, perfectamente adecuado y mucho menos costoso de mantener cuando la escala y las necesidades de auditoría no lo justifican.

**¿Por qué es importante?** Elegir NgRx por defecto sin una necesidad concreta impone ceremonia innecesaria; elegir un store de signals cuando el historial inspeccionable o la coordinación de equipo grande son genuinamente necesarios deja a la aplicación sin herramientas que resultarán valiosas más adelante.

**Diagrama:**

```
Store de signals: menos ceremonia, ideal para la mayoría de features
NgRx: más ceremonia, justificado cuando se necesita historial inspeccionable,
      patrón único en equipos grandes, o side-effects asíncronos complejos
```

---


## Laboratorio práctico

**Objetivo del laboratorio:** construir un store de carrito de compras con signals, y una versión equivalente simplificada en NgRx para comparar.

**Requisitos previos:** Módulos 0-8 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Crear `CarritoStore` con signals | Ver Tema 1 | Encapsula el estado, expone solo lectura |
| 2 | Inyectarlo en dos componentes distintos | `inject(CarritoStore)` | Verifica que ambos ven el mismo estado |
| 3 | Definir la action, reducer y selector equivalentes | Ver Tema 2 | Compara la ceremonia frente al store de signals |
| 4 | Comparar ambas implementaciones | — | Discute cuándo cada una sería apropiada |

**Verificación:** el laboratorio se considera exitoso si ambos componentes reflejan el mismo estado del carrito en tiempo real al modificarlo desde cualquiera de los dos, y si puedes articular claramente en qué escenario elegirías NgRx en vez del store de signals.

**Errores comunes y soluciones**

- **Exponer el signal mutable directamente sin `asReadonly()`.** Cualquier componente externo podría modificar el estado sin pasar por los métodos del store, rompiendo la encapsulación.
- **Mutar el arreglo dentro de `update()` en vez de crear uno nuevo.** Usa siempre spread (`[...l, item]`) para mantener inmutabilidad (Módulo 2).
- **Adoptar NgRx sin una razón concreta.** Evalúa primero si un store de signals cubre la necesidad real.

---
