## Zustand: estado mínimo sin boilerplate

```jsx
const useCarrito = create((set, get) => ({
  items: [],
  agregar: (item) => set(state => ({ items: [...state.items, item] })),
  total: () => get().items.reduce((s, i) => s + i.precio, 0),
}));

function Carrito() {
  const items = useCarrito(state => state.items); // solo re-renderiza si `items` cambia
  return <ul>{items.map(i => <li key={i.id}>{i.nombre}</li>)}</ul>;
}
```

## Redux Toolkit

```jsx
const carritoSlice = createSlice({
  name: 'carrito',
  initialState: { items: [] },
  reducers: {
    agregar: (state, action) => { state.items.push(action.payload); }, // Immer permite "mutar" de forma segura
  },
});
```

Redux Toolkit reduce drásticamente el boilerplate del Redux clásico, pero sigue trayendo más ceremonia (actions, reducers, store, Provider) que Zustand.

## Estado de servidor vs estado de cliente

El estado de servidor (datos que vienen de una API) pertenece a TanStack Query: tiene cache, expiración y necesita revalidación. El estado de cliente puro (un modal abierto, un tema seleccionado) pertenece a Zustand/Context — mezclarlos en el mismo store suele complicar innecesariamente ambos casos.
