## useQuery

```jsx
const { data, isLoading, error } = useQuery({
  queryKey: ['tareas'],
  queryFn: () => fetch('/api/tareas').then(r => r.json()),
});
```

TanStack Query maneja automáticamente: estado de carga, errores, cache por `queryKey`, refetch en background cuando la ventana recupera foco, y deduplicación de peticiones idénticas simultáneas — todo lo que normalmente se escribe a mano con `useState` + `useEffect`.

## Mutations e invalidación

```jsx
const queryClient = useQueryClient();
const crear = useMutation({
  mutationFn: (tarea) => fetch('/api/tareas', { method: 'POST', body: JSON.stringify(tarea) }),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tareas'] }), // refetch automático
});
```

## Optimistic updates

```jsx
useMutation({
  mutationFn: actualizarTarea,
  onMutate: async (nuevaTarea) => {
    await queryClient.cancelQueries({ queryKey: ['tareas'] });
    const anterior = queryClient.getQueryData(['tareas']);
    queryClient.setQueryData(['tareas'], (old) => actualizarEnLista(old, nuevaTarea)); // UI optimista
    return { anterior };
  },
  onError: (err, vars, contexto) => queryClient.setQueryData(['tareas'], contexto.anterior), // revierte si falla
});
```
