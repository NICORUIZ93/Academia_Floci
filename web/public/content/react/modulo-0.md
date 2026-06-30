## JSX es azúcar sintáctica

```jsx
function Boton({ texto, onClick }) {
  return <button onClick={onClick}>{texto}</button>;
}
```

Por debajo, JSX se transforma a `React.createElement('button', { onClick }, texto)`. Las llaves `{}` embeben cualquier expresión JavaScript dentro del markup.

## Listas con key

```jsx
{tareas.map(tarea => <li key={tarea.id}>{tarea.titulo}</li>)}
```

`key` ayuda a React a identificar qué elementos cambiaron entre renders. Usar el índice del array como key es riesgoso si la lista se reordena o se filtran elementos — React puede reutilizar el DOM equivocado.

## Composición sobre herencia

```jsx
function Tarjeta({ children }) {
  return <div className="tarjeta">{children}</div>;
}

<Tarjeta><Avatar /><Nombre texto="Ana" /></Tarjeta>
```

React favorece **componer** componentes pequeños (pasando `children` o props) en vez de crear jerarquías de herencia de clases.

## Renderizado condicional

```jsx
{cargando && <Spinner />}
{usuario ? <Perfil usuario={usuario} /> : <BotonLogin />}
```
