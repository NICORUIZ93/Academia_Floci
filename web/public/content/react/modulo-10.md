## Server Components por defecto

```jsx
// app/tareas/page.tsx — Server Component (sin "use client")
async function PaginaTareas() {
  const tareas = await db.tarea.findMany(); // acceso directo a datos, corre solo en el servidor
  return <ListaTareas tareas={tareas} />;
}
```

Un Server Component nunca envía su JavaScript al navegador — solo el HTML resultante. Reduce el bundle del cliente y permite acceder a recursos del servidor (base de datos, archivos) directamente.

## "use client" cuando hace falta interactividad

```jsx
"use client";
function BotonLike() {
  const [likes, setLikes] = useState(0); // hooks de estado solo funcionan en Client Components
  return <button onClick={() => setLikes(l => l + 1)}>{likes} likes</button>;
}
```

## Streaming con Suspense

```jsx
<Suspense fallback={<Spinner />}>
  <SeccionLenta /> {/* el resto de la página se muestra mientras esto carga */}
</Suspense>
```

## Server Actions

```jsx
async function crearTarea(formData) {
  "use server";
  await db.tarea.create({ data: { titulo: formData.get('titulo') } });
}

<form action={crearTarea}><input name="titulo" /><button>Crear</button></form>
```

Procesa el formulario en el servidor sin necesidad de crear un endpoint API separado manualmente.
