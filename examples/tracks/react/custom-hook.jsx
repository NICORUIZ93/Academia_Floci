// Hooks avanzados y custom hooks (Módulo 2/7): extraer lógica con estado reutilizable.
import { useEffect, useState } from 'react';

// Un custom hook es simplemente una función que empieza con "use" y puede llamar
// a otros hooks dentro — React usa esa convención de nombre para aplicar las
// reglas de hooks (no condicionales, no dentro de loops) durante el linting.
export function useLocalStorage(clave, valorInicial) {
  const [valor, setValor] = useState(() => {
    // El inicializador de useState solo corre una vez (en el primer render),
    // así que leer localStorage aquí no repite la lectura en cada re-render.
    const guardado = window.localStorage.getItem(clave);
    return guardado !== null ? JSON.parse(guardado) : valorInicial;
  });

  useEffect(() => {
    window.localStorage.setItem(clave, JSON.stringify(valor));
  }, [clave, valor]);

  return [valor, setValor];
}

// Uso: se comporta exactamente como useState, pero persiste entre recargas.
//
// function Preferencias() {
//   const [nombre, setNombre] = useLocalStorage('nombre-usuario', '');
//   return <input value={nombre} onChange={(e) => setNombre(e.target.value)} />;
// }
