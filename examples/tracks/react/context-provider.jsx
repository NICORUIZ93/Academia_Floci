// Context API y composición (Módulo 4): evitar prop drilling para el tema visual.
import { createContext, useContext, useState } from 'react';

const TemaContext = createContext(null);

export function TemaProvider({ children }) {
  const [tema, setTema] = useState('claro');

  const alternarTema = () => {
    setTema((actual) => (actual === 'claro' ? 'oscuro' : 'claro'));
  };

  // El value del Provider se recrea en cada render de TemaProvider; para evitar
  // que todos los consumidores se re-rendericen sin necesidad, en una app real
  // se envolvería en useMemo. Aquí se omite por simplicidad del ejemplo.
  return <TemaContext.Provider value={{ tema, alternarTema }}>{children}</TemaContext.Provider>;
}

// Hook personalizado que encapsula useContext + valida que se use dentro del Provider,
// en vez de exportar TemaContext directamente y forzar a cada consumidor a importar
// useContext y manejar el caso `null`.
export function useTema() {
  const contexto = useContext(TemaContext);
  if (contexto === null) {
    throw new Error('useTema debe usarse dentro de un <TemaProvider>');
  }
  return contexto;
}

// Consumo en cualquier componente descendiente, sin pasar props manualmente:
//
// function BotonTema() {
//   const { tema, alternarTema } = useTema();
//   return <button onClick={alternarTema}>Tema actual: {tema}</button>;
// }
