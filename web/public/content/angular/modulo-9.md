## Store propio con signals

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

Cualquier componente que inyecte `CarritoStore` ve el mismo estado, sin pasar props manualmente entre componentes intermedios.

## NgRx: actions, reducers, selectors

```ts
const agregarItem = createAction('[Carrito] Agregar', props<{ item: Item }>());

const carritoReducer = createReducer(estadoInicial,
  on(agregarItem, (estado, { item }) => ({ ...estado, items: [...estado.items, item] }))
);

const selectTotal = createSelector(selectCarrito, (estado) =>
  estado.items.reduce((s, i) => s + i.precio, 0)
);
```

## Cuándo justifica su complejidad

NgRx agrega ceremonia (actions, reducers, effects, selectors) a cambio de: historial de cambios inspeccionable (Redux DevTools), un patrón único y predecible en equipos grandes, y manejo estructurado de side-effects asíncronos complejos. Para la mayoría de features, un store de signals bien diseñado es más simple y suficiente.
