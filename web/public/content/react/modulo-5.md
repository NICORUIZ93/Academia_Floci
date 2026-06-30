## Rutas anidadas con layout compartido

```jsx
const router = createBrowserRouter([
  {
    path: '/tareas',
    element: <LayoutTareas />, // navbar compartida
    children: [
      { index: true, element: <ListaTareas /> },
      { path: ':id', element: <DetalleTarea /> },
    ],
  },
]);
```

## Loaders: datos antes de renderizar

```jsx
{
  path: '/tareas/:id',
  loader: ({ params }) => fetch(`/api/tareas/${params.id}`),
  element: <DetalleTarea />,
}

// dentro del componente
const tarea = useLoaderData();
```

El loader carga los datos ANTES de mostrar la vista, evitando el parpadeo de "cargando..." dentro del componente.

## Rutas protegidas

```jsx
function RutaProtegida({ children }) {
  const { autenticado } = useAuth();
  return autenticado ? children : <Navigate to="/login" />;
}
```

## Code-splitting por ruta

```jsx
const Configuracion = lazy(() => import('./Configuracion'));

<Route path="/config" element={
  <Suspense fallback={<Spinner />}><Configuracion /></Suspense>
} />
```
