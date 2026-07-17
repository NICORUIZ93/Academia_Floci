// Data fetching moderno (Módulo 6): patrón manual con useEffect + AbortController,
// y la alternativa recomendada con TanStack Query (React Query).
import { useEffect, useState } from 'react';

// --- Patrón manual: útil para entender qué resuelve una librería de data fetching ---
export function ListaUsuariosManual() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // AbortController cancela la petición si el componente se desmonta antes de
    // que la respuesta llegue (navegación rápida, cambio de pestaña) — sin esto,
    // setUsuarios podría llamarse sobre un componente ya desmontado.
    const controlador = new AbortController();

    fetch('https://api.ejemplo.com/usuarios', { signal: controlador.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(setUsuarios)
      .catch((err) => {
        if (err.name !== 'AbortError') setError(err.message);
      })
      .finally(() => setCargando(false));

    return () => controlador.abort();
  }, []);

  if (cargando) return <p>Cargando...</p>;
  if (error) return <p>Error: {error}</p>;
  return <ul>{usuarios.map((u) => <li key={u.id}>{u.nombre}</li>)}</ul>;
}

// --- Con TanStack Query: reemplaza cargando/error/cache manual por un solo hook.
// import { useQuery } from '@tanstack/react-query';
//
// function ListaUsuariosQuery() {
//   const { data: usuarios, isPending, error } = useQuery({
//     queryKey: ['usuarios'],
//     queryFn: () => fetch('https://api.ejemplo.com/usuarios').then((r) => r.json()),
//   });
//
//   if (isPending) return <p>Cargando...</p>;
//   if (error) return <p>Error: {error.message}</p>;
//   return <ul>{usuarios.map((u) => <li key={u.id}>{u.nombre}</li>)}</ul>;
// }
