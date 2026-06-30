## Medir antes de optimizar

React DevTools Profiler graba una interacción y muestra exactamente qué componentes se renderizaron y por qué (props cambiadas, estado cambiado, o el padre simplemente se re-renderizó). Optimizar sin esta información casi siempre es esfuerzo desperdiciado en el lugar equivocado.

## React.memo con criterio

```jsx
const Fila = React.memo(function Fila({ item }) {
  return <li>{item.nombre}</li>;
}); // solo se re-renderiza si `item` cambia (comparación superficial)
```

`React.memo` solo ayuda si el componente realmente recibe las mismas props en renders sucesivos — envolver TODO con memo agrega overhead de comparación sin beneficio.

## Virtualización

```jsx
import { FixedSizeList } from 'react-window';

<FixedSizeList height={600} itemCount={10000} itemSize={40}>
  {({ index, style }) => <div style={style}>{datos[index].nombre}</div>}
</FixedSizeList>
```

Solo renderiza los elementos visibles en pantalla (más un margen) en vez de los 10,000 elementos completos — esencial para listas largas.

## Code-splitting

```jsx
const Reportes = lazy(() => import('./Reportes'));
<Suspense fallback={<Spinner />}><Reportes /></Suspense>
```
