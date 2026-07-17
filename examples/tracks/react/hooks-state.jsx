// Estado local y hooks esenciales (Módulos 1-2): useState + useEffect.
import { useEffect, useState } from 'react';

export function ContadorConTitulo() {
  const [contador, setContador] = useState(0);

  useEffect(() => {
    // El título del documento es un efecto secundario (toca algo fuera de React),
    // por eso vive en useEffect, no directamente en el cuerpo del componente.
    document.title = `Contador: ${contador}`;

    // La función de retorno es el cleanup: se ejecuta antes del próximo efecto
    // y al desmontar el componente. Aquí no hay nada que limpiar, pero el patrón
    // es esencial para listeners, timers o suscripciones.
    return () => {
      document.title = 'React';
    };
  }, [contador]); // se re-ejecuta solo cuando `contador` cambia

  return (
    <div>
      <p>Contador: {contador}</p>
      <button onClick={() => setContador((valorActual) => valorActual + 1)}>+1</button>
    </div>
  );
}
