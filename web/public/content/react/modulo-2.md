## useEffect: dependencias y limpieza

```jsx
useEffect(() => {
  const handler = () => console.log(window.innerWidth);
  window.addEventListener('resize', handler);
  return () => window.removeEventListener('resize', handler); // limpieza al desmontar
}, []); // array vacío: solo se ejecuta al montar
```

Sin array de dependencias, el efecto corre en CADA render. Con `[]`, corre solo al montar. Con `[valor]`, corre cuando `valor` cambia.

## useRef

```jsx
const renderCount = useRef(0);
renderCount.current++; // no causa re-render, a diferencia de useState
```

`useRef` guarda un valor mutable que persiste entre renders sin disparar una nueva renderización al cambiar.

## useMemo y useCallback

```jsx
const resultado = useMemo(() => calculoCostoso(datos), [datos]); // memoiza un VALOR
const manejarClick = useCallback(() => hacer(id), [id]);          // memoiza una FUNCIÓN
```

Solo valen la pena cuando el cálculo es realmente costoso o cuando previenen el re-render de un hijo envuelto en `React.memo` — usarlos en todos lados agrega complejidad sin beneficio real.

## Reglas de los hooks

Los hooks se llaman siempre en el mismo orden, en el nivel superior del componente — nunca dentro de un `if`, un loop o una función anidada. React depende de ese orden consistente para asociar cada hook con su estado interno.
