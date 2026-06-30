## Estructura del proyecto integrador

```
src/
  features/
    tareas/
      ListaTareas.tsx
      useTareas.ts        ← hook con TanStack Query
    auth/
      RutaProtegida.tsx
      useAuth.ts
  store/
    uiStore.ts             ← Zustand, solo estado de cliente
  router.tsx
```

## Uniendo los módulos anteriores

Este proyecto integra: rutas anidadas con layout y una ruta protegida (módulo 5), TanStack Query para todo el estado de servidor con cache y mutaciones (módulo 6), Zustand reservado exclusivamente para estado de UI puro (módulo 7), tipado estricto en toda la capa de datos y componentes (módulo 11), y tests del flujo crítico con Testing Library + MSW (módulo 8).

```tsx
function useTareas() {
  return useQuery<Tarea[]>({
    queryKey: ['tareas'],
    queryFn: () => fetch('/api/tareas').then(r => r.json()),
  });
}
```

## Cierre del track

La separación clara entre estado de servidor (TanStack Query) y estado de cliente (Zustand) suele ser la decisión arquitectónica que más simplifica una SPA React de tamaño real — evita la tentación de meter todo en un único store global gigante.
