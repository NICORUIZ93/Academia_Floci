## useState y actualizaciones funcionales

```jsx
const [count, setCount] = useState(0);

// PELIGROSO si se llama varias veces seguidas: todas leen el mismo `count` capturado
setCount(count + 1);
setCount(count + 1); // count sigue siendo el valor original aquí

// SEGURO: la forma funcional siempre recibe el valor más reciente
setCount(c => c + 1);
setCount(c => c + 1); // ahora sí suma 2
```

## Render vs commit

React tiene dos fases: **render** (calcula qué debería verse, ejecutando tu función componente) y **commit** (aplica esos cambios al DOM real). Una función componente puede ejecutarse sin que nada cambie visualmente en pantalla todavía.

## Batching

```jsx
function manejarClick() {
  setA(1);
  setB(2);
  setC(3);
  // React agrupa (batchea) estas tres actualizaciones en un único re-render, no en tres
}
```

## Componentes controlados

```jsx
const [valor, setValor] = useState('');
<input value={valor} onChange={e => setValor(e.target.value)} />
```

El estado de React es la única fuente de verdad del input — el DOM nunca "decide" su propio valor de forma independiente.
